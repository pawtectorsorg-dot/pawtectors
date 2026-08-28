import { randomUUID } from 'crypto';
import { Response } from 'express';
import nodemailer from 'nodemailer';
import { AuthRequest as AuthenticatedRequest } from '../middleware/auth.js';
import * as services from '../services/databaseService.js';
import { SUPER_ADMIN_EMAIL, ensureSuperAdminProfile } from '../utils/superAdmin.js';

const sendOrderEmail = async (to: string, subject: string, text: string, html?: string) => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[order email] SMTP is not configured; skipping email send for', to);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to,
      subject,
      text,
      html: html || text,
    });
  } catch (error) {
    console.error('[order email] Failed to send email:', error);
  }
};

// Demo-phase helper: returns user id or a placeholder for anonymous access
const getUserId = (req: AuthenticatedRequest): string | null => req.user?.id || null;

// Supabase/PostgREST throws plain objects (not `instanceof Error`), so
// `error instanceof Error ? error.message : fallback` silently swallows the
// real reason and always returns the fallback. This checks for a `.message`
// property on anything error-shaped before falling back.
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return fallback;
};

// ============================================================================
// USER CONTROLLER
// ============================================================================

export const userController = {
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(200).json({ message: 'No user context — demo mode' });

      const profile = await services.userService.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async getProfileByEmail(req: AuthenticatedRequest, res: Response) {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
      }

      if (email.trim().toLowerCase() === SUPER_ADMIN_EMAIL) {
        const profile = await ensureSuperAdminProfile();
        const roles = await services.userService.getUserRole(profile.id);
        const role = roles && roles.length > 0 ? roles[0].role : 'admin';

        return res.json({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role,
        });
      }

      const profile = await services.userService.getProfileByEmail(email);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user role
      const roles = await services.userService.getUserRole(profile.id);
      const role = roles && roles.length > 0 ? roles[0].role : 'customer';

      res.json({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: role,
      });
    } catch (error) {
      console.error('[userController.getProfileByEmail] Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(200).json({ message: 'No user context — demo mode' });

      const profile = await services.userService.updateProfile(req.user.id, req.body);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async getRoles(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.json([]);

      const roles = await services.userService.getUserRole(req.user.id);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await services.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('[userController.getAll] Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      await services.userService.deleteProfile(req.params.id);
      res.json({ message: 'User account deleted successfully' });
    } catch (error) {
      console.error('[userController.delete] Error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete user account' });
    }
  },

  async updateUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const profileId = req.params.id;
      const updates = req.body;
      const updated = await services.userService.updateProfile(profileId, updates);
      res.json(updated);
    } catch (error) {
      console.error('[userController.updateUserById] Error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update user' });
    }
  },

  async assignRole(req: AuthenticatedRequest, res: Response) {
    try {
      const profileId = req.params.id;
      const { role } = req.body;
      if (!role) return res.status(400).json({ error: 'Role is required' });
      const assigned = await services.userService.assignRole(profileId, role);
      res.json(assigned);
    } catch (error) {
      console.error('[userController.assignRole] Error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to assign role' });
    }
  },
};

// ============================================================================
// PROVIDER CONTROLLER
// ============================================================================

export const providerController = {
  async createWithAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password, full_name, role, ...providerData } = req.body as Record<string, unknown>;

      if (typeof email !== 'string' || typeof password !== 'string' || typeof full_name !== 'string') {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      const trimmedEmail = email.trim().toLowerCase();
      const existingProfile = await services.userService.getProfileByEmail(trimmedEmail);
      if (existingProfile) {
        return res.status(409).json({ error: 'This email is already registered' });
      }

      const profile = await services.userService.createProfile(randomUUID(), {
        full_name,
        email: trimmedEmail,
        password,
      });

      await services.userService.assignRole(profile.id, role === 'admin' ? 'admin' : 'provider');

      const provider = await services.providerService.createProvider({
        ...providerData,
        user_id: profile.id,
        email: trimmedEmail,
        name: providerData.name || full_name,
        category: providerData.category || 'clinic',
      });

      res.status(201).json({ user: profile, provider });
    } catch (error) {
      console.error('[providerController.createWithAccount] Error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create provider account' });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const provider = await services.providerService.createProvider(req.body);
      res.status(201).json(provider);
    } catch (error) {
      console.error('Provider create error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create provider' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = req.query as Record<string, unknown>;
      console.log(`[GET /api/providers] query params:`, JSON.stringify(filters));
      const providers = await services.providerService.getProviders(filters);
      res.json(providers || []);
    } catch (error) {
      console.error('[providerController.getAll] Error:', error instanceof Error ? error.message : error);
      res.json([]);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const provider = await services.providerService.getProviderById(req.params.id);
      res.json(provider);
    } catch (error) {
      res.status(404).json({ error: 'Provider not found' });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const provider = await services.providerService.updateProvider(req.params.id, req.body);
      res.json(provider);
    } catch (error) {
      console.error('Provider update error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update provider' });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      await services.providerService.deleteProvider(req.params.id);
      res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
      console.error('Provider delete error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete provider' });
    }
  },
};

// ============================================================================
// BOOKING CONTROLLER
// ============================================================================

export const bookingController = {
  
 async create(req: AuthenticatedRequest, res: Response) {
    try {
      type BookingWithRelations = {
        booking_date?: string;
        booking_time?: string;
        status?: string;
        profile_id?: string | null;
        owner_email?: string | null;
      };

      type ProviderWithCapacity = {
        slot_capacity?: number | null;
      };

      const bookingData = req.body as Record<string, unknown> & {
        id?: string;
        provider_id?: string | null;
        booking_date?: string;
        booking_time?: string;
        owner_email?: string | null;
        profile_id?: string | null;
      };

      // Strip client-generated id; let DB auto-generate UUID
      delete bookingData.id;
      // Make provider_id null if empty or not a valid reference
      if (!bookingData.provider_id) bookingData.provider_id = null;
      // Attach profile_id from authenticated user (required NOT NULL column)
      const userId = getUserId(req);
      if (userId) bookingData.profile_id = userId;

      if (!userId) {
        res.status(401).json({ error: 'Please sign in before booking a service.' });
        return;
      }

      if (bookingData.provider_id && bookingData.booking_date && bookingData.booking_time) {
        const existing = await services.bookingService.getBookings({ provider_id: bookingData.provider_id });
        const activeInSameSlot = existing.filter((b: BookingWithRelations) =>
          b.booking_date === bookingData.booking_date &&
          b.booking_time === bookingData.booking_time &&
          b.status !== 'cancelled'
        );

        // Prevent the same customer from double-booking this slot. Matched
        // by profile_id when logged in, otherwise by the email they typed.
        const isSameCustomer = (b: BookingWithRelations) =>
          (userId && b.profile_id && b.profile_id === userId) ||
          (!!bookingData.owner_email && !!b.owner_email &&
            String(b.owner_email).toLowerCase() === String(bookingData.owner_email).toLowerCase());

        if (activeInSameSlot.some(isSameCustomer)) {
          res.status(409).json({ error: 'You already have a booking for this date and time slot.' });
          return;
        }

        // Respect the provider's configured slot capacity — how many
        // different customers are allowed to book the same date + time.
        const provider = await services.providerService.getProviderById(bookingData.provider_id);
        const capacity = Number((provider as ProviderWithCapacity | null)?.slot_capacity) || 1;

        if (activeInSameSlot.length >= capacity) {
          res.status(409).json({ error: 'This slot is fully booked. Please choose a different time.' });
          return;
        }
      }

      const booking = await services.bookingService.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error('Booking create error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create booking' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;
      const providerId = req.query.provider_id as string | undefined;

      console.log(`[bookingController.getAll] User role: ${userRole}, User ID: ${userId}, provider_id: ${providerId}`);

      // Filtering by a specific provider (used by the provider dashboard to
      // see their own bookings, and by the booking form to check for
      // existing slots) is allowed regardless of who's asking — it doesn't
      // expose anything beyond what that provider's own listing already
      // shows publicly.
      if (providerId) {
        const bookings = await services.bookingService.getBookings({ provider_id: providerId });
        res.json(bookings);
        return;
      }

      // Admin: fetch ALL bookings (no filter)
      // Customer: fetch only their own bookings (filter by profile_id)
      if (userRole === 'admin') {
        const bookings = await services.bookingService.getBookings();
        console.log(`[bookingController.getAll] Admin fetched ${bookings?.length || 0} bookings`);
        res.json(bookings);
      } else {
        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        const bookings = await services.bookingService.getBookings({ profile_id: userId });
        console.log(`[bookingController.getAll] Customer ${userId} fetched ${bookings?.length || 0} bookings`);
        res.json(bookings);
      }
    } catch (error) {
      console.error('[bookingController.getAll] Error:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch bookings' });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const booking = await services.bookingService.getBookingById(req.params.id);
      res.json(booking);
    } catch (error) {
      res.status(404).json({ error: 'Booking not found' });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const booking = await services.bookingService.updateBooking(req.params.id, req.body);
      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update booking' });
    }
  },

  async cancel(req: AuthenticatedRequest, res: Response) {
    try {
      const booking = await services.bookingService.cancelBooking(req.params.id);
      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to cancel booking' });
    }
  },
};

// ============================================================================
// PRODUCT CONTROLLER
// ============================================================================

export const productController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const product = await services.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create product' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = { category: req.query.category };
      const products = await services.productService.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const product = await services.productService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: 'Product not found' });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const product = await services.productService.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update product' });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      await services.productService.deleteProduct(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete product' });
    }
  },
};

// ============================================================================
// ORDER CONTROLLER
// ============================================================================

export const orderController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(400).json({ error: 'profile_id is required (send X-User-Id header)' });
      }
      const order = await services.orderService.createOrder(userId, req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error('[orderController.create] Error:', error instanceof Error ? error.message : error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create order' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;
      
      console.log(`[orderController.getAll] User role: ${userRole}, User ID: ${userId}`);
      
      // Admin: fetch ALL orders (no filter)
      // Customer: fetch only their own orders (filter by profile_id)
      if (userRole === 'admin') {
        const orders = await services.orderService.getOrders();
        console.log(`[orderController.getAll] Admin fetched ${orders?.length || 0} orders`);
        res.json(orders || []);
      } else {
        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        const orders = await services.orderService.getOrders(userId);
        console.log(`[orderController.getAll] Customer ${userId} fetched ${orders?.length || 0} orders`);
        res.json(orders || []);
      }
    } catch (error) {
      console.error('[orderController.getAll] Error:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch orders' });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const order = await services.orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('[orderController.getById] Error:', error instanceof Error ? error.message : error);
      res.status(404).json({ error: 'Order not found' });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const order = await services.orderService.updateOrder(req.params.id, req.body);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update order' });
    }
  },

  async addItem(req: AuthenticatedRequest, res: Response) {
    try {
      const item = await services.orderService.addOrderItem(req.params.orderId, req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to add item' });
    }
  },

  async sendOrderEmail(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId, customerName, customerEmail, customerPhone, items, shippingAddress, paymentMethod, paymentStatus, totalAmount } = req.body as Record<string, unknown>;

      if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Customer email and order items are required' });
      }

      const safeShippingAddress = typeof shippingAddress === 'object' && shippingAddress ? shippingAddress as Record<string, unknown> : {};
      const addressText = [
        safeShippingAddress.address,
        safeShippingAddress.city,
        safeShippingAddress.state,
        safeShippingAddress.pincode,
      ].filter(Boolean).join(', ') || 'Not provided';

      const itemLines = items.map((item: Record<string, unknown>) => {
        const quantity = Number(item.quantity ?? 1);
        const price = Number(item.price ?? 0);
        const name = String(item.name ?? item.product_name ?? 'Product');
        return `• ${name} x ${quantity} — ₹${(price * quantity).toLocaleString('en-IN')}`;
      }).join('\n');

      const formattedTotal = Number(totalAmount ?? 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      });

      const subject = `Pawtectors Order Confirmation - ${String(orderId ?? 'N/A')}`;
      const text = `Hello ${String(customerName || 'Customer')},\n\nThank you for shopping with Pawtectors. Your order has been placed successfully.\n\nOrder ID: ${String(orderId ?? 'N/A')}\nCustomer: ${String(customerName || 'Customer')}\nEmail: ${String(customerEmail)}\nPhone: ${String(customerPhone || 'Not provided')}\nShipping Address: ${addressText}\n\nProducts:\n${itemLines}\n\nTotal Amount: ${formattedTotal}\nPayment Method: ${String(paymentMethod || 'Not provided')}\nPayment Status: ${String(paymentStatus || 'Not provided')}\n\nWe will keep you updated on your order progress.\n\nThanks,\nThe Pawtectors Team`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 12px; color: #111827;">Pawtectors Order Confirmation</h2>
          <p>Hello <strong>${String(customerName || 'Customer')}</strong>,</p>
          <p>Thank you for shopping with Pawtectors. Your order has been placed successfully.</p>
          <p><strong>Order ID:</strong> ${String(orderId ?? 'N/A')}<br>
             <strong>Email:</strong> ${String(customerEmail)}<br>
             <strong>Phone:</strong> ${String(customerPhone || 'Not provided')}<br>
             <strong>Shipping Address:</strong> ${addressText}</p>

          <p><strong>Products:</strong></p>
          <ul>
            ${items.map((item: Record<string, unknown>) => {
              const quantity = Number(item.quantity ?? 1);
              const price = Number(item.price ?? 0);
              const name = String(item.name ?? item.product_name ?? 'Product');
              return `<li>${name} × ${quantity} — ₹${(price * quantity).toLocaleString('en-IN')}</li>`;
            }).join('')}
          </ul>

          <p><strong>Total Amount:</strong> ${formattedTotal}<br>
             <strong>Payment Method:</strong> ${String(paymentMethod || 'Not provided')}<br>
             <strong>Payment Status:</strong> ${String(paymentStatus || 'Not provided')}</p>
          <p>We will keep you updated on your order progress.</p>
          <p>Thanks,<br/>The Pawtectors Team</p>
        </div>
      `;

      await sendOrderEmail(String(customerEmail), subject, text, html);
      res.status(200).json({ message: 'Order confirmation email sent successfully' });
    } catch (error) {
      console.error('[orderController.sendOrderEmail] Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send order email' });
    }
  },
};

// ============================================================================
// REVIEW CONTROLLER
// ============================================================================

export const reviewController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      const review = await services.reviewService.createReview(userId || 'demo-user', req.body);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create review' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        product_id: req.query.product_id,
        service_provider_id: req.query.service_provider_id,
      };
      const reviews = await services.reviewService.getReviews(filters);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const review = await services.reviewService.updateReview(req.params.id, req.body);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update review' });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      await services.reviewService.deleteReview(req.params.id);
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete review' });
    }
  },
};

// ============================================================================
// PAYMENT CONTROLLER
// ============================================================================

export const paymentController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const payment = await services.paymentService.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create payment' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        booking_id: req.query.booking_id,
        order_id: req.query.order_id,
        status: req.query.status,
      };
      const payments = await services.paymentService.getPayments(filters);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async verify(req: AuthenticatedRequest, res: Response) {
    try {
      const { razorpay_payment_id } = req.body;
      const payment = await services.paymentService.verifyPayment(razorpay_payment_id);
      res.json(payment);
    } catch (error) {
      res.status(404).json({ error: 'Payment not found' });
    }
  },
};

// ============================================================================
// NGO CONTROLLER
// ============================================================================

export const ngoController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const ngo = await services.ngoService.createNGO(req.body);
      res.status(201).json(ngo);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create NGO' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = { city: req.query.city };
      const ngos = await services.ngoService.getNGOs(filters);
      res.json(ngos);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const ngo = await services.ngoService.getNGOById(req.params.id);
      res.json(ngo);
    } catch (error) {
      res.status(404).json({ error: 'NGO not found' });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const ngo = await services.ngoService.updateNGO(req.params.id, req.body);
      res.json(ngo);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update NGO' });
    }
  },

  async addAnimal(req: AuthenticatedRequest, res: Response) {
    try {
      const animal = await services.ngoService.addShelterAnimal(req.params.id, req.body);
      res.status(201).json(animal);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to add animal' });
    }
  },

  async getAnimals(req: AuthenticatedRequest, res: Response) {
    try {
      const animals = await services.ngoService.getShelterAnimals(req.params.id);
      res.json(animals);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async requestAdoption(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      const request = await services.ngoService.createAdoptionRequest(userId || 'demo-user', req.body);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create adoption request' });
    }
  },

  async donate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      const donation = await services.ngoService.makeDonation(req.params.id, { ...req.body, donor_id: userId });
      res.status(201).json(donation);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to process donation' });
    }
  },
};

// ============================================================================
// NOTIFICATION CONTROLLER
// ============================================================================

export const notificationController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { provider_id, profile_id, title, message, type, data } = req.body;

      let recipientProfileId = profile_id;
      if (!recipientProfileId && provider_id) {
        const provider = await services.providerService.getProviderById(provider_id);
        recipientProfileId = provider?.user_id;
      }

      if (!recipientProfileId) {
        return res.status(400).json({ error: 'Could not determine notification recipient' });
      }

      const notification = await services.notificationService.sendNotification({
        profile_id: recipientProfileId,
        title: title || 'New notification',
        message: message || '',
        type: type || 'booking',
        data: data || null,
      });
      res.status(201).json(notification);
    } catch (error) {
      console.error('Notification create error:', error);
      res.status(400).json({ error: getErrorMessage(error, 'Failed to create notification') });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) return res.json([]);
      const notifications = await services.notificationService.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const notification = await services.notificationService.markAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to mark as read' });
    }
  },
};

export const petTypeController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const petTypes = await services.petTypeService.getPetTypes();
      res.json(petTypes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch pet types' });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const name = String(req.body?.name || '').trim();
      if (!name) {
        res.status(400).json({ error: 'Pet type name is required' });
        return;
      }
      const petType = await services.petTypeService.createPetType(name);
      res.status(201).json(petType);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
        res.status(409).json({ error: 'This pet type already exists' });
        return;
      }
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create pet type' });
    }
  },
};

// ============================================================================
// CLINIC CONTROLLER - Clinic-specific operations
// ============================================================================

export const clinicController = {
  /**
   * Create a new clinic with detailed information
   * Provider must be already created and user must have provider role
   */
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      // DEPRECATED: Clinic-specific table no longer exists
      // Use /api/providers endpoint instead
      res.status(410).json({
        error: 'Clinic endpoint deprecated',
        message: 'Use POST /api/providers to create clinics',
        note: 'Clinic data is now integrated into service_providers table with JSONB fields'
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create clinic' });
    }
  },

  /**
   * Get all clinics - redirects to providers
   * @deprecated Use getProviders endpoint instead
   */
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const providers = await services.providerService.getProviders();
      const clinics = providers.filter((p: Record<string, unknown>) => p.category === 'clinic');
      res.json(clinics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  /**
   * Get clinic by ID - redirects to provider
   * @deprecated Use getProvider endpoint instead
   */
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const provider = await services.providerService.getProviderById(req.params.id);
      if (provider.category !== 'clinic') {
        return res.status(404).json({ error: 'Clinic not found' });
      }
      res.json(provider);
    } catch (error) {
      res.status(404).json({ error: 'Clinic not found' });
    }
  },

  /**
   * Update clinic - redirects to provider update
   * @deprecated Use updateProvider endpoint instead
   */
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const provider = await services.providerService.updateProvider(req.params.id, req.body);
      res.json(provider);
    } catch (error) {
      console.error('Provider update error:', error);
      res.status(400).json({ error: getErrorMessage(error, 'Failed to update provider') });
    }
  },

  /**
   * Delete clinic - redirects to provider delete
   * @deprecated Use deleteProvider endpoint instead
   */
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      await services.providerService.deleteProvider(req.params.id);
      res.json({ message: 'Clinic deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete clinic' });
    }
  },

  /**
   * Add staff member - DEPRECATED
   * Staff tracking no longer available in simplified schema
   */
  async addStaff(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Staff member tracking has been removed',
      note: 'Use service provider description field for staff information'
    });
  },

  /**
   * Get clinic staff - DEPRECATED
   */
  async getStaff(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Staff member tracking has been removed'
    });
  },

  /**
   * Update staff member - DEPRECATED
   */
  async updateStaff(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Staff member tracking has been removed'
    });
  },

  /**
   * Delete staff member - DEPRECATED
   */
  async deleteStaff(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Staff member tracking has been removed'
    });
  },

  /**
   * Add equipment - DEPRECATED
   * Equipment tracking no longer available in simplified schema
   */
  async addEquipment(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Equipment tracking has been removed',
      note: 'Use service provider description field for equipment information'
    });
  },

  /**
   * Get clinic equipment - DEPRECATED
   */
  async getEquipment(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Equipment tracking has been removed'
    });
  },

  /**
   * Update equipment - DEPRECATED
   */
  async updateEquipment(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Equipment tracking has been removed'
    });
  },

  /**
   * Add service to clinic - use updateServices instead
   */
  async addService(req: AuthenticatedRequest, res: Response) {
    try {
      const { services: newServices } = req.body;
      const provider = await services.clinicService.updateServices(req.params.id, newServices);
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to add service' });
    }
  },

  /**
   * Get clinic services - get from provider
   */
  async getServices(req: AuthenticatedRequest, res: Response) {
    try {
      const provider = await services.clinicService.getClinicById(req.params.id);
      res.json({ services: provider?.services || [] });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  /**
   * Update service - use updateServices instead
   */
  async updateService(req: AuthenticatedRequest, res: Response) {
    try {
      const { services: updatedServices } = req.body;
      const provider = await services.clinicService.updateServices(req.params.clinicId, updatedServices);
      res.json(provider);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update service' });
    }
  },

  /**
   * Delete service - update services array to remove item
   */
  async deleteService(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Use updateServices instead',
      message: 'Use PUT endpoint with updated services array'
    });
  },

  /**
   * Search clinics by location
   */
  async searchByLocation(req: AuthenticatedRequest, res: Response) {
    try {
      const { latitude, longitude, distance } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      // Get all clinic providers
      const providers = await services.providerService.getProviders();
      const clinics = providers.filter((p: Record<string, unknown>) => p.category === 'clinic');

      // Frontend will handle distance calculation if coordinates available
      res.json(clinics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  /**
   * Search clinics by specialization - DEPRECATED
   * Specializations stored in description field instead
   */
  async searchBySpecialization(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Specialization search removed',
      alternative: 'Use text search in description field'
    });
  },

  /**
   * Verify clinic - DEPRECATED
   */
  async verify(req: AuthenticatedRequest, res: Response) {
    res.status(410).json({
      error: 'Feature deprecated',
      message: 'Clinic verification no longer available',
      note: 'All providers are now managed uniformly'
    });
  },
};

export const legalPageController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const pages = await services.legalPageService.getAll();
      res.json(pages);
    } catch (error) {
      console.error('[legalPageController.getAll] Failed to fetch legal pages:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch legal pages' });
    }
  },

  async getBySlug(req: AuthenticatedRequest, res: Response) {
    try {
      const page = await services.legalPageService.getBySlug(req.params.slug);
      res.json(page);
    } catch (error) {
      console.error('[legalPageController.getBySlug] Error loading slug:', req.params.slug, error);
      res.status(404).json({ error: 'Page not found' });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, content } = req.body;
      if (!content || !content.trim()) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }
      const page = await services.legalPageService.updateBySlug(req.params.slug, { title, content });
      res.json(page);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update page' });
    }
  },
};

// ============================================================================
// CART CONTROLLER
// ============================================================================

export const cartController = {
  async getCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(400).json({ error: 'User ID required' });
      const items = await services.cartService.getCart(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async upsertItem(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(400).json({ error: 'User ID required' });
      const { product_id, quantity } = req.body;
      if (!product_id || quantity == null) return res.status(400).json({ error: 'product_id and quantity required' });
      const item = await services.cartService.upsertItem(userId, product_id, quantity);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update cart' });
    }
  },

  async removeItem(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(400).json({ error: 'User ID required' });
      await services.cartService.removeItem(userId, req.params.productId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },

  async clearCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(400).json({ error: 'User ID required' });
      await services.cartService.clearCart(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  },
};

// ============================================================================
// PET CONTROLLER
// ============================================================================

export const petController = {
  async getMyPets(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(200).json([]);
      const pets = await services.petService.getPetsByProfile(userId);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Server error') });
    }
  },

  async createPet(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const pet = await services.petService.createPet(userId, req.body);
      res.status(201).json(pet);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to create pet') });
    }
  },

  async updatePet(req: AuthenticatedRequest, res: Response) {
    try {
      const pet = await services.petService.updatePet(req.params.id, req.body);
      res.json(pet);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to update pet') });
    }
  },

  async deletePet(req: AuthenticatedRequest, res: Response) {
    try {
      await services.petService.deletePet(req.params.id);
      res.json({ message: 'Pet profile deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to delete pet') });
    }
  }
};

// ============================================================================
// MEDICAL RECORD CONTROLLER
// ============================================================================

export const medicalRecordController = {
  async getMedicalRecords(req: AuthenticatedRequest, res: Response) {
    try {
      const petId = req.query.pet_id as string;
      const providerId = req.query.provider_id as string;
      const records = await services.medicalRecordService.getMedicalRecords(petId, providerId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Server error') });
    }
  },

  async getMedicalRecord(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await services.medicalRecordService.getMedicalRecordById(req.params.id);
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Server error') });
    }
  },

  async createMedicalRecord(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await services.medicalRecordService.createMedicalRecord(req.body);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to create medical record') });
    }
  },

  async updateMedicalRecord(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await services.medicalRecordService.updateMedicalRecord(req.params.id, req.body);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to update medical record') });
    }
  },
};

// ============================================================================
// VACCINATION CONTROLLER
// ============================================================================

export const vaccinationController = {
  async getVaccinations(req: AuthenticatedRequest, res: Response) {
    try {
      const petId = req.query.pet_id as string;
      const providerId = req.query.provider_id as string;
      const vaccinations = await services.vaccinationService.getVaccinations(petId, providerId);
      res.json(vaccinations);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Server error') });
    }
  },

  async createVaccination(req: AuthenticatedRequest, res: Response) {
    try {
      const vaccination = await services.vaccinationService.createVaccination(req.body);
      res.status(201).json(vaccination);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to record vaccination') });
    }
  },
};

// ============================================================================
// TIME SLOT CONTROLLER
// ============================================================================

export const timeSlotController = {
  async getTimeSlots(req: AuthenticatedRequest, res: Response) {
    try {
      const providerId = req.query.provider_id as string;
      const date = req.query.date as string;
      if (!providerId) {
        return res.status(400).json({ error: 'provider_id parameter is required' });
      }
      const slots = await services.timeSlotService.getTimeSlots(providerId, date);
      res.json(slots);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Server error') });
    }
  },

  async bulkCreateTimeSlots(req: AuthenticatedRequest, res: Response) {
    try {
      const { provider_id, date, times } = req.body;
      if (!provider_id || !date || !Array.isArray(times)) {
        return res.status(400).json({ error: 'provider_id, date, and times (array) are required' });
      }
      const slots = await services.timeSlotService.bulkCreateTimeSlots(provider_id, date, times);
      res.status(201).json(slots);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to create time slots') });
    }
  },

  async toggleTimeSlot(req: AuthenticatedRequest, res: Response) {
    try {
      const { provider_id, date, time, status, booking_id } = req.body;
      if (!provider_id || !date || !time || !status) {
        return res.status(400).json({ error: 'provider_id, date, time, and status are required' });
      }
      const slot = await services.timeSlotService.toggleTimeSlot(provider_id, date, time, status, booking_id);
      res.json(slot);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to toggle time slot') });
    }
  },
};

// ============================================================================
// BILL CONTROLLER
// ============================================================================

export const billController = {
  async getBills(req: AuthenticatedRequest, res: Response) {
    try {
      const profileId = req.query.profile_id as string;
      const providerId = req.query.provider_id as string;
      const bills = await services.billService.getBills(profileId, providerId);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Server error') });
    }
  },

  async getBill(req: AuthenticatedRequest, res: Response) {
    try {
      const bill = await services.billService.getBillById(req.params.id);
      res.json(bill);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Server error') });
    }
  },

  async createBill(req: AuthenticatedRequest, res: Response) {
    try {
      const bill = await services.billService.createBill(req.body);
      res.status(201).json(bill);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to create bill') });
    }
  },

  async updateBill(req: AuthenticatedRequest, res: Response) {
    try {
      const bill = await services.billService.updateBill(req.params.id, req.body);
      res.json(bill);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to update bill') });
    }
  },
};

// ============================================================================
// CLINIC SETTINGS CONTROLLER
// ============================================================================

export const clinicSettingsController = {
  async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const providerId = req.params.id || req.user?.clinicId;
      if (!providerId) return res.status(400).json({ error: 'Clinic ID required' });

      const settings = await services.clinicSettingsService.getSettings(providerId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Failed to fetch clinic settings') });
    }
  },

  async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const providerId = req.params.id || req.user?.clinicId;
      if (!providerId) return res.status(400).json({ error: 'Clinic ID required' });

      const settings = await services.clinicSettingsService.upsertSettings(providerId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to update clinic settings') });
    }
  },
};

// ============================================================================
// CLINIC PET PARENTS CONTROLLER
// ============================================================================

export const clinicPetParentsController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const providerId = req.params.id || req.user?.clinicId;
      if (!providerId) return res.status(400).json({ error: 'Clinic ID required' });

      const petParents = await services.clinicPetParentsService.getClinicPetParents(providerId);
      res.json(petParents);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Failed to fetch pet parents') });
    }
  },

  async link(req: AuthenticatedRequest, res: Response) {
    try {
      const providerId = req.params.id || req.user?.clinicId;
      const { profile_id, notes } = req.body;
      if (!providerId) return res.status(400).json({ error: 'Clinic ID required' });
      if (!profile_id) return res.status(400).json({ error: 'Profile ID required' });

      const result = await services.clinicPetParentsService.linkPetParent(providerId, profile_id, notes);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to link pet parent') });
    }
  },
};

// ============================================================================
// ADMIN STATS & CLINIC MANAGEMENT CONTROLLER
// ============================================================================

export const adminStatsController = {
  async getPlatformStats(_req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await services.adminStatsService.getPlatformStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Failed to fetch platform stats') });
    }
  },

  async getAllClinics(_req: AuthenticatedRequest, res: Response) {
    try {
      const clinics = await services.adminStatsService.getClinicsForAdmin();
      res.json(clinics);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Failed to fetch clinics') });
    }
  },

  async activateClinic(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const clinic = await services.adminStatsService.updateClinicStatus(id, {
        is_active: true,
        approval_status: 'approved',
        approved_by: req.user?.id,
      });
      res.json({ message: 'Clinic activated successfully', clinic });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to activate clinic') });
    }
  },

  async deactivateClinic(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const clinic = await services.adminStatsService.updateClinicStatus(id, {
        is_active: false,
        approval_status: 'suspended',
      });
      res.json({ message: 'Clinic deactivated successfully', clinic });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to deactivate clinic') });
    }
  },

  async approveClinic(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const clinic = await services.adminStatsService.updateClinicStatus(id, {
        is_active: true,
        approval_status: 'approved',
        approved_by: req.user?.id,
      });
      res.json({ message: 'Clinic approved successfully', clinic });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to approve clinic') });
    }
  },

  async rejectClinic(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const clinic = await services.adminStatsService.updateClinicStatus(id, {
        is_active: false,
        approval_status: 'rejected',
        rejection_reason: reason || 'Not specified',
      });
      res.json({ message: 'Clinic rejected', clinic });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, 'Failed to reject clinic') });
    }
  },
};

// ============================================================================
// CLINIC SCOPED CONTROLLER (Appointments, Medical Records, Stats)
// ============================================================================

export const clinicScopedController = {
  async getAppointments(req: AuthenticatedRequest, res: Response) {
    try {
      // For admin: use URL param; for provider: use their clinicId
      const providerId = req.user?.isAdmin ? req.params.id : req.user?.clinicId;
      if (!providerId) return res.status(403).json({ error: 'Clinic ID not available' });

      const { date, status, pet_id } = req.query;
      const appointments = await services.clinicScopedService.getClinicAppointments(providerId, {
        date: date as string,
        status: status as string,
        petId: pet_id as string,
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Failed to fetch appointments') });
    }
  },

  async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const providerId = req.user?.isAdmin ? req.params.id : req.user?.clinicId;
      if (!providerId) return res.status(403).json({ error: 'Clinic ID not available' });

      const stats = await services.clinicScopedService.getClinicDashboardStats(providerId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Failed to fetch dashboard stats') });
    }
  },

  async getMedicalRecords(req: AuthenticatedRequest, res: Response) {
    try {
      const providerId = req.user?.isAdmin ? req.params.id : req.user?.clinicId;
      if (!providerId) return res.status(403).json({ error: 'Clinic ID not available' });

      const { pet_id } = req.query;
      const records = await services.clinicScopedService.getClinicMedicalRecords(
        providerId,
        pet_id as string | undefined
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error, 'Failed to fetch medical records') });
    }
  },
};
