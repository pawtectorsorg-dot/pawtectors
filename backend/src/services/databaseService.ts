/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin as supabase, isUsingMock } from '../config/supabase.js';
import mockDatabase from './mockDatabase.js';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const normaliseProviderPayload = (payload: Record<string, unknown>) => {
  const normalized = { ...payload } as Record<string, unknown>;

  if ('openTime' in normalized) {
    normalized.open_time = normalized.openTime;
    delete normalized.openTime;
  }

  if ('closeTime' in normalized) {
    normalized.close_time = normalized.closeTime;
    delete normalized.closeTime;
  }


 if ('priceRange' in normalized) {
    normalized.price_range = normalized.priceRange;
    delete normalized.priceRange;
  }

   if ('reviewCount' in normalized) {
    normalized.review_count = normalized.reviewCount;
    delete normalized.reviewCount;
  }

  if ('slotCapacity' in normalized) {
    normalized.slot_capacity = normalized.slotCapacity;
    delete normalized.slotCapacity;
  }

  return normalized;
};

// ============================================================================
// USER SERVICE
// ============================================================================

export const userService = {
  async createProfile(userId: string, profileData: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProfileByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  },

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserRole(profileId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('profile_id', profileId);
    
    if (error) throw error;
    return data;
  },

  async assignRole(profileId: string, role: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert([{ profile_id: profileId, role }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    const [profilesResult, rolesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, mobile_number, created_at, updated_at, is_active')
        .order('created_at', { ascending: false }),
      supabase
        .from('user_roles')
        .select('profile_id, role'),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (rolesResult.error) throw rolesResult.error;

    const rolesByProfile = new Map<string, string>();
    (rolesResult.data || []).forEach((row: { profile_id: string; role: string }) => {
      if (!rolesByProfile.has(row.profile_id)) {
        rolesByProfile.set(row.profile_id, row.role);
      }
    });

    return (profilesResult.data || []).map((profile: Record<string, unknown>) => ({
      ...profile,
      role: rolesByProfile.get(profile.id as string) || 'customer',
    }));
  },

  async deleteProfile(profileId: string) {
    const { error: rolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('profile_id', profileId);

    if (rolesError) throw rolesError;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    return true;
  },
};

// ============================================================================
// SERVICE PROVIDER SERVICE
// ============================================================================

export const providerService = {
  async createProvider(providerData: Record<string, unknown>) {
    const { services, pricing, ...mainData } = providerData;
    const insertData = normaliseProviderPayload({ ...mainData });

    // Ensure NOT NULL columns have fallback values
    if (!insertData.city) insertData.city = 'Unknown';
    if (!insertData.state) insertData.state = 'Unknown';
    if (!insertData.pincode) insertData.pincode = '000000';
    
    // Keep price_range as is (empty string is allowed by constraint)
    // No conversion needed
    
    const { data, error } = await supabase
      .from('service_providers')
      .insert([insertData])
      .select()
      .single();
    
    if (error) throw error;

    // Insert services into provider_services table
    if (Array.isArray(services) && services.length > 0) {
      const servicesData = services.map((serviceName: string) => ({
        provider_id: data.id,
        service_name: serviceName,
      }));
      await supabase.from('provider_services').insert(servicesData);
    }

    // Insert pricing into service_pricing table
    if (Array.isArray(pricing) && pricing.length > 0) {
      const pricingData = pricing.map((item: Record<string, unknown>) => ({
        provider_id: data.id,
        name: item.name,
        price: item.price,
        description: item.description || '',
        duration_minutes: item.duration_minutes || null,
      }));
      await supabase.from('service_pricing').insert(pricingData);
    }
    
    return data;
  },

  async getProviders(filters?: Record<string, unknown>) {
    let query = supabase
      .from('service_providers')
      .select(`
        *,
        provider_services(service_name),
        service_pricing(id, name, price, duration_minutes, description)
      `);
    
    // Only apply filters when values are present and non-empty
    const category = typeof filters?.category === 'string' ? filters.category.trim() : '';
    const city = typeof filters?.city === 'string' ? filters.city.trim() : '';
    const state = typeof filters?.state === 'string' ? filters.state.trim() : '';

    if (category) query = query.eq('category', category);
    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.ilike('state', `%${state}%`);
    if (filters?.is_active) query = query.eq('is_active', true);

    console.log(`[providers] filters → category=${category || '(none)'} city=${city || '(none)'} state=${state || '(none)'}`);

    const { data, error } = await query;
    if (error) {
      console.error('[providerService.getProviders] Error:', error.message);
      return [];
    }
    if (!data || data.length === 0) {
      return [];
    }
    
    // Transform to match frontend expectations
    return data.map((provider: Record<string, unknown>) => ({
      ...provider,
      services: Array.isArray(provider.provider_services) 
        ? (provider.provider_services as Array<{ service_name: string }>).map(s => s.service_name)
        : [],
      pricing: provider.service_pricing || [],
    }));
  },

  async getProviderById(id: string) {
    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        provider_services(service_name),
        service_pricing(id, name, price, duration_minutes, description)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform to match frontend expectations
    return {
      ...data,
      services: Array.isArray(data.provider_services) 
        ? (data.provider_services as Array<{ service_name: string }>).map(s => s.service_name)
        : [],
      pricing: data.service_pricing || [],
    };
  },

  async updateProvider(id: string, updates: Record<string, unknown>) {
    const { services, pricing, ...mainUpdates } = updates;
    const updateData = normaliseProviderPayload(mainUpdates);
    
    const { data, error } = await supabase
      .from('service_providers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Update services if provided
    if (Array.isArray(services)) {
      // Delete existing services
      await supabase.from('provider_services').delete().eq('provider_id', id);
      
      // Insert new services
      if (services.length > 0) {
        const servicesData = services.map((serviceName: string) => ({
          provider_id: id,
          service_name: serviceName,
        }));
        await supabase.from('provider_services').insert(servicesData);
      }
    }

    // Update pricing if provided
    if (Array.isArray(pricing)) {
      // Delete existing pricing
      await supabase.from('service_pricing').delete().eq('provider_id', id);
      
      // Insert new pricing
      if (pricing.length > 0) {
        const pricingData = pricing.map((item: Record<string, unknown>) => ({
          provider_id: id,
          name: item.name,
          price: item.price,
          description: item.description || '',
          duration_minutes: item.duration_minutes || null,
        }));
        await supabase.from('service_pricing').insert(pricingData);
      }
    }
    
    return data;
  },

  async deleteProvider(id: string) {
    const { error } = await supabase
      .from('service_providers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};


// ============================================================================
// LEGAL PAGE SERVICE
// ============================================================================

const legalPageDefaults: Record<string, { title: string; content: string }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    content: `Pawtectors collects the information needed to create accounts, manage bookings and orders, and keep the platform running smoothly. We use cookies and local storage to keep you signed in, remember preferences, and improve the experience.

We only share the minimum information required with the service provider you choose so they can complete your request. You can review and update your profile at any time and contact us if you want to request account deletion.`,
  },
  'terms-of-service': {
    title: 'Terms of Service',
    content: `By using Pawtectors, you agree to provide accurate account information, follow our booking and payment rules, and use the platform only for lawful purposes. Service availability, pricing, and timings are managed by the individual providers listed on the site.

We may update these terms when the platform or our services change. Continued use of Pawtectors after an update means you accept the revised terms.`,
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    content: `Pawtectors uses cookies and similar storage technologies to keep sessions active, remember preferences, and help us understand how visitors use the site. Some features may not work correctly if cookies are disabled.

You can manage cookies through your browser settings. If you clear your browser storage, you may need to sign in again and reset some preferences.`,
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    content: `Cancellation requests should be made as early as possible. Booking and order cancellations may depend on the provider, the service type, and how far the request has progressed.

If a cancellation is approved, any applicable refund will follow the provider rules shared at the time of booking or purchase. For urgent cases, contact support as soon as possible.`,
  },
};

export const legalPageService = {
  async getAll() {
    const { data, error } = await supabase.from('legal_pages').select('*').order('slug', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('legal_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return data;
    }

    const fallback = legalPageDefaults[slug];
    if (fallback) {
      return {
        slug,
        title: fallback.title,
        content: fallback.content,
        updated_at: null,
      };
    }

    throw new Error('Page not found');
  },

  async updateBySlug(slug: string, updates: { title?: string; content?: string }) {
    const { data, error } = await supabase
      .from('legal_pages')
      .upsert([
        {
          slug,
          ...updates,
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: 'slug' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
// ============================================================================
// BOOKING SERVICE
// ============================================================================

export const bookingService = {
  async createBooking(bookingData: any) {
    // Remove provider_id if it's not a valid UUID to avoid FK violation
    const cleanData = { ...bookingData };
    if (cleanData.provider_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(cleanData.provider_id)) {
        delete cleanData.provider_id;
      }
    }
    const { data, error } = await supabase
      .from('bookings')
      .insert([cleanData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase booking insert error:', error);
      throw error;
    }
    return data;
  },

  async getBookings(filters?: any) {
    let query = supabase.from('bookings').select(`
      *,
      service_providers!left (
        name,
        category
      )
    `);
    
    if (filters?.provider_id) query = query.eq('provider_id', filters.provider_id);
    if (filters?.profile_id) query = query.eq('profile_id', filters.profile_id);
    if (filters?.status) query = query.eq('status', filters.status);
    
    const { data, error } = await query.order('booking_date', { ascending: false });
    if (error) {
      console.error('[bookingService.getBookings] Error:', error.message);
      throw error;
    }
    
    // Format the response to include joined data
    const formattedData = data?.map((booking: any) => ({
      ...booking,
      provider_name: booking.service_providers?.name,
      provider_category: booking.service_providers?.category,
      customer_name: booking.owner_name,
      customer_email: booking.owner_email,
      customer_phone: booking.owner_phone,
    }));
    
    return formattedData || [];
  },

  async getBookingById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBooking(id: string, updates: any) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async cancelBooking(id: string) {
    return bookingService.updateBooking(id, { status: 'cancelled' });
  },
};

// ============================================================================
// PRODUCT SERVICE
// ============================================================================

export const productService = {
  async createProduct(productData: any) {
    // Auto-generate slug from name if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36);
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProducts(filters?: any) {
    let query = supabase.from('products').select('*');
    
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.is_active !== false) query = query.eq('is_active', true);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: any) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  async updateStock(id: string, quantityChange: number) {
    const product = await productService.getProductById(id);
    const newStock = Math.max(0, (product.stock || 0) + quantityChange);
    return productService.updateProduct(id, { stock: newStock });
  },
};

// ============================================================================
// ORDER SERVICE
// ============================================================================

export const orderService = {
  async createOrder(profileId: string, orderData: any) {
    // Only include valid columns for the orders table
    const validData: Record<string, unknown> = {
      profile_id: profileId,
      total_amount: orderData.total_amount,
    };
    if (orderData.status) validData.status = orderData.status;
    if (orderData.payment_status) validData.payment_status = orderData.payment_status;
    if (orderData.notes) validData.notes = orderData.notes;

    const { data, error } = await supabase
      .from('orders')
      .insert([validData])
      .select()
      .single();
    
    if (error) {
      console.error('[orderService.createOrder] Error:', error.message);
      throw error;
    }
    return data;
  },

  async getOrders(profileId?: string) {
    let query = supabase.from('orders').select(`
      *,
      order_items!left (
        id,
        product_id,
        quantity,
        price,
        product_name,
        products!left (
          name
        )
      ),
      profiles!left (
        full_name,
        email,
        mobile_number
      ),
      shipping_addresses!left (
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        landmark,
        address_type
      ),
      payments!left (
        payment_method,
        amount,
        status,
        razorpay_payment_id,
        razorpay_order_id
      )
    `);
    
    if (profileId) query = query.eq('profile_id', profileId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('[orderService.getOrders] Error:', error.message);
      throw error;
    }
    
    // Format the response to include order items with product names and full address
    const formattedData = data?.map((order: any) => ({
      ...order,
      order_items: order.order_items?.map((item: any) => ({
        ...item,
        product_name: item.product_name || item.products?.name || 'Unknown Product'
      })),
      // Format shipping address for easier frontend consumption
      shipping_address: order.shipping_addresses ? {
        name: order.shipping_addresses.full_name,
        phone: order.shipping_addresses.phone,
        address: `${order.shipping_addresses.address_line1}${order.shipping_addresses.address_line2 ? ', ' + order.shipping_addresses.address_line2 : ''}${order.shipping_addresses.landmark ? ', ' + order.shipping_addresses.landmark : ''}`,
        city: order.shipping_addresses.city,
        state: order.shipping_addresses.state,
        pincode: order.shipping_addresses.pincode,
      } : null,
      // Add payment details - payments is an array, we take the first one
      payment_method: order.payments?.[0]?.payment_method || null,
      payment_details: order.payments?.[0] || null
    }));
    
    return formattedData || [];
  },

  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOrder(id: string, updates: any) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addOrderItem(orderId: string, itemData: any) {
    // Only include valid columns for the order_items table
    const validData: Record<string, unknown> = {
      order_id: orderId,
      product_id: itemData.product_id,
      quantity: itemData.quantity,
      price: itemData.price,
    };
    if (itemData.product_name) validData.product_name = itemData.product_name;

    const { data, error } = await supabase
      .from('order_items')
      .insert([validData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// REVIEW SERVICE
// ============================================================================

export const reviewService = {
  async createReview(userId: string, reviewData: any) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ user_id: userId, ...reviewData }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update rating if it's for a product or provider
    if (reviewData.product_id) {
      await supabase.rpc('calculate_product_rating', { product_id: reviewData.product_id });
    } else if (reviewData.service_provider_id) {
      await supabase.rpc('calculate_provider_rating', { provider_id: reviewData.service_provider_id });
    }
    
    return data;
  },

  async getReviews(filters?: any) {
    let query = supabase.from('reviews').select('*');
    
    if (filters?.product_id) query = query.eq('product_id', filters.product_id);
    if (filters?.service_provider_id) query = query.eq('service_provider_id', filters.service_provider_id);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateReview(id: string, updates: any) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteReview(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};

// ============================================================================
// PAYMENT SERVICE
// ============================================================================

export const paymentService = {
  async createPayment(paymentData: any) {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPayments(filters?: any) {
    let query = supabase.from('payments').select('*');
    
    if (filters?.booking_id) query = query.eq('booking_id', filters.booking_id);
    if (filters?.order_id) query = query.eq('order_id', filters.order_id);
    if (filters?.status) query = query.eq('status', filters.status);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updatePayment(id: string, updates: any) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async verifyPayment(razorpayPaymentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_payment_id', razorpayPaymentId)
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// PET TYPE SERVICE
// ============================================================================

export const petTypeService = {
  async getPetTypes() {
    const { data, error } = await supabase
      .from('pet_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createPetType(name: string) {
    const { data, error } = await supabase
      .from('pet_types')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// NGO SERVICE
// ============================================================================

export const ngoService = {
  async createNGO(ngoData: any) {
    const { data, error } = await supabase
      .from('ngo')
      .insert([ngoData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getNGOs(filters?: any) {
    let query = supabase.from('ngo').select('*, shelter_animals(*), adoption_requests(*)');
    
    if (filters?.is_active) query = query.eq('is_active', true);
    if (filters?.city) query = query.eq('city', filters.city);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getNGOById(id: string) {
    const { data, error } = await supabase
      .from('ngo')
      .select('*, shelter_animals(*), adoption_requests(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateNGO(id: string, updates: any) {
    const { data, error } = await supabase
      .from('ngo')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addShelterAnimal(ngoId: string, animalData: any) {
    const { data, error } = await supabase
      .from('shelter_animals')
      .insert([{ ngo_id: ngoId, ...animalData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getShelterAnimals(ngoId?: string) {
    let query = supabase.from('shelter_animals').select('*');
    
    if (ngoId) query = query.eq('ngo_id', ngoId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createAdoptionRequest(userId: string, adoptionData: any) {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert([{ user_id: userId, ...adoptionData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async makeDonation(ngoId: string, donationData: any) {
    const { data, error } = await supabase
      .from('donations')
      .insert([{ ngo_id: ngoId, ...donationData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export const notificationService = {
  async sendNotification(notificationData: any) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getNotifications(recipientId?: string) {
    let query = supabase.from('notifications').select('*');
    
    if (recipientId) query = query.eq('profile_id', recipientId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// CLINIC SERVICE - DEPRECATED, functionality moved to providerService
// ============================================================================
// NOTE: Clinic-specific tables have been removed in favor of JSONB
// columns in service_providers table. Clinic data is now:
// - services: JSONB array of service names
// - pricing: JSONB array of {name, price} objects
//
// For clinic operations, use providerService instead.
// ============================================================================

// ============================================================================
// CART SERVICE
// ============================================================================

export const cartService = {
  async getCart(userId: string) {
    const { data, error } = await supabase
      .from('cart')
      .select('quantity, products(id, name, description, price, category, image, stock, brand, rating, review_count)')
      .eq('profile_id', userId);
    if (error) throw error;
    return data ?? [];
  },

  async upsertItem(userId: string, productId: string, quantity: number) {
    const { data, error } = await supabase
      .from('cart')
      .upsert(
        { profile_id: userId, product_id: productId, quantity, updated_at: new Date().toISOString() },
        { onConflict: 'profile_id,product_id' },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeItem(userId: string, productId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('profile_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('profile_id', userId);
    if (error) throw error;
  },
};

export const clinicService = {
  /**
   * @deprecated Use providerService.updateProvider instead
   * Services and pricing are now stored as JSONB in service_providers
   */
  async updateServices(providerId: string, services: string[]) {
    const { data, error } = await supabase
      .from('service_providers')
      .update({ services: JSON.stringify(services) })
      .eq('id', providerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * @deprecated Use providerService.updateProvider instead
   * Pricing is now stored as JSONB in service_providers
   */
  async updatePricing(providerId: string, pricing: Array<{ name: string; price: number }>) {
    const { data, error } = await supabase
      .from('service_providers')
      .update({ pricing: JSON.stringify(pricing) })
      .eq('id', providerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get clinic (provider) data with services and pricing
   * @deprecated Use providerService.getProviderById instead
   */
  async getClinicById(providerId: string) {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('id', providerId)
      .eq('category', 'clinic')
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// PETS SERVICE
// ============================================================================

export const petService = {
  async getPetsByProfile(profileId: string) {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getPetById(id: string) {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createPet(profileId: string, petData: Record<string, any>) {
    // Strip client-generated ID
    delete petData.id;
    const { data, error } = await supabase
      .from('pets')
      .insert([{ profile_id: profileId, ...petData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePet(id: string, updates: Record<string, any>) {
    // Strip profile_id and id to prevent tampering
    delete updates.id;
    delete updates.profile_id;
    delete updates.created_at;
    const { data, error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deletePet(id: string) {
    // Soft delete pet profile
    const { data, error } = await supabase
      .from('pets')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================================================
// MEDICAL RECORD SERVICE
// ============================================================================

export const medicalRecordService = {
  async getMedicalRecords(petId?: string, providerId?: string) {
    if (isUsingMock) {
      const res = await mockDatabase.getMedicalRecords(petId, providerId);
      return res.data || [];
    }
    let query = supabase
      .from('medical_records')
      .select(`
        *,
        prescriptions (*)
      `);

    if (petId) query = query.eq('pet_id', petId);
    if (providerId) query = query.eq('provider_id', providerId);

    const { data, error } = await query.order('consultation_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMedicalRecordById(id: string) {
    if (isUsingMock) {
      const res = await mockDatabase.getMedicalRecord(id);
      return res.data;
    }
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        prescriptions (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createMedicalRecord(recordData: Record<string, any>) {
    if (isUsingMock) {
      const res = await mockDatabase.createMedicalRecord(recordData);
      return res.data;
    }
    const { prescriptions, ...mainData } = recordData;
    const { data, error } = await supabase
      .from('medical_records')
      .insert([mainData])
      .select()
      .single();

    if (error) throw error;

    // Handle nested prescriptions
    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      const rxData = prescriptions.map((rx: any) => ({
        medical_record_id: data.id,
        medicine_name: rx.medicine_name,
        dosage: rx.dosage,
        frequency: rx.frequency,
        duration: rx.duration,
        instructions: rx.instructions || '',
      }));
      await supabase.from('prescriptions').insert(rxData);
    }

    // Fetch the complete record with prescriptions
    return medicalRecordService.getMedicalRecordById(data.id);
  },

  async updateMedicalRecord(id: string, updates: Record<string, any>) {
    if (isUsingMock) {
      const res = await mockDatabase.updateMedicalRecord(id, updates);
      return res.data;
    }
    const { data, error } = await supabase
      .from('medical_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// VACCINATION SERVICE
// ============================================================================

export const vaccinationService = {
  async getVaccinations(petId?: string, providerId?: string) {
    if (isUsingMock) {
      const res = await mockDatabase.getVaccinations(petId, providerId);
      return res.data || [];
    }
    let query = supabase.from('vaccinations').select('*');

    if (petId) query = query.eq('pet_id', petId);
    if (providerId) query = query.eq('provider_id', providerId);

    const { data, error } = await query.order('date_given', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createVaccination(vaccinationData: Record<string, any>) {
    if (isUsingMock) {
      const res = await mockDatabase.createVaccination(vaccinationData);
      return res.data;
    }
    const { data, error } = await supabase
      .from('vaccinations')
      .insert([vaccinationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// TIME SLOT SERVICE
// ============================================================================

export const timeSlotService = {
  async getTimeSlots(providerId: string, date?: string) {
    if (isUsingMock) {
      const res = await mockDatabase.getTimeSlots(providerId, date);
      return res.data || [];
    }
    let query = supabase
      .from('time_slots')
      .select('*')
      .eq('provider_id', providerId);

    if (date) query = query.eq('slot_date', date);

    const { data, error } = await query.order('slot_time', { ascending: true });
    if (error) throw error;
    return data;
  },

  async bulkCreateTimeSlots(providerId: string, date: string, times: string[]) {
    if (isUsingMock) {
      const res = await mockDatabase.bulkCreateTimeSlots(providerId, date, times);
      return res.data || [];
    }
    // Generate upsert-friendly payloads
    const slotPayloads = times.map(time => ({
      provider_id: providerId,
      slot_date: date,
      slot_time: time,
      status: 'available',
      booking_id: null
    }));

    const { data, error } = await supabase
      .from('time_slots')
      .upsert(slotPayloads, { onConflict: 'provider_id,slot_date,slot_time' })
      .select();

    if (error) throw error;
    return data;
  },

  async toggleTimeSlot(providerId: string, date: string, time: string, status: string, bookingId?: string) {
    if (isUsingMock) {
      const res = await mockDatabase.toggleTimeSlot(providerId, date, time, status, bookingId);
      return res.data;
    }
    const { data, error } = await supabase
      .from('time_slots')
      .upsert(
        {
          provider_id: providerId,
          slot_date: date,
          slot_time: time,
          status,
          booking_id: bookingId || null
        },
        { onConflict: 'provider_id,slot_date,slot_time' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// BILL SERVICE
// ============================================================================

export const billService = {
  async getBills(profileId?: string, providerId?: string) {
    if (isUsingMock) {
      const res = await mockDatabase.getBills(profileId, providerId);
      return res.data || [];
    }
    let query = supabase.from('bills').select('*');

    if (profileId) query = query.eq('profile_id', profileId);
    if (providerId) query = query.eq('provider_id', providerId);

    const { data, error } = await query.order('bill_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getBillById(id: string) {
    if (isUsingMock) {
      const res = await mockDatabase.getBill(id);
      return res.data;
    }
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createBill(billData: Record<string, any>) {
    if (isUsingMock) {
      const res = await mockDatabase.createBill(billData);
      return res.data;
    }
    const { data, error } = await supabase
      .from('bills')
      .insert([billData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBill(id: string, updates: Record<string, any>) {
    if (isUsingMock) {
      const res = await mockDatabase.updateBill(id, updates);
      return res.data;
    }
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// CLINIC SETTINGS SERVICE
// ============================================================================

export const clinicSettingsService = {
  async getSettings(providerId: string) {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .eq('provider_id', providerId)
      .single();

    // Return defaults if not found
    if (error && error.code === 'PGRST116') {
      return {
        provider_id: providerId,
        slot_duration_minutes: 30,
        advance_booking_days: 30,
        cancellation_hours: 24,
        working_days: [1, 2, 3, 4, 5],
        break_start: null,
        break_end: null,
        auto_confirm_bookings: false,
        max_slots_per_day: 20,
      };
    }
    if (error) throw error;
    return data;
  },

  async upsertSettings(providerId: string, settings: Record<string, any>) {
    const { data, error } = await supabase
      .from('clinic_settings')
      .upsert({ ...settings, provider_id: providerId }, { onConflict: 'provider_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// CLINIC PET PARENTS SERVICE
// ============================================================================

export const clinicPetParentsService = {
  /**
   * Returns all pet parents linked to a clinic, with their pets and latest booking.
   */
  async getClinicPetParents(providerId: string) {
    // Get all profile IDs linked to this clinic from clinic_pet_parents
    // Also include any profiles that have made a booking with this provider
    const { data: linked, error: linkedError } = await supabase
      .from('clinic_pet_parents')
      .select('profile_id, registered_at, notes')
      .eq('provider_id', providerId);

    if (linkedError) throw linkedError;

    // Also get profiles from bookings (implicit relationship)
    const { data: bookingProfiles } = await supabase
      .from('bookings')
      .select('profile_id')
      .eq('provider_id', providerId)
      .not('profile_id', 'is', null);

    // Merge unique profile IDs
    const explicitIds = new Set((linked || []).map((r: any) => r.profile_id));
    const bookingIds = new Set((bookingProfiles || []).map((r: any) => r.profile_id).filter(Boolean));
    const allProfileIds = [...new Set([...explicitIds, ...bookingIds])];

    if (allProfileIds.length === 0) return [];

    // Fetch profiles with their pets
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, mobile_number, city, state, created_at, avatar_url')
      .in('id', allProfileIds);

    if (profilesError) throw profilesError;

    // Fetch pets for these profiles
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('id, profile_id, name, type, breed, age_months, image_url')
      .in('profile_id', allProfileIds)
      .eq('is_active', true);

    if (petsError) throw petsError;

    // Fetch last booking for each profile at this clinic
    const { data: lastBookings } = await supabase
      .from('bookings')
      .select('profile_id, booking_date, status')
      .eq('provider_id', providerId)
      .in('profile_id', allProfileIds)
      .order('booking_date', { ascending: false });

    const petsByProfile = new Map<string, any[]>();
    (pets || []).forEach((pet: any) => {
      if (!petsByProfile.has(pet.profile_id)) petsByProfile.set(pet.profile_id, []);
      petsByProfile.get(pet.profile_id)!.push(pet);
    });

    const lastBookingByProfile = new Map<string, any>();
    (lastBookings || []).forEach((b: any) => {
      if (!lastBookingByProfile.has(b.profile_id)) lastBookingByProfile.set(b.profile_id, b);
    });

    return (profiles || []).map((profile: any) => ({
      ...profile,
      pets: petsByProfile.get(profile.id) || [],
      last_visit: lastBookingByProfile.get(profile.id) || null,
    }));
  },

  async linkPetParent(providerId: string, profileId: string, notes?: string) {
    const { data, error } = await supabase
      .from('clinic_pet_parents')
      .upsert({ provider_id: providerId, profile_id: profileId, notes }, { onConflict: 'provider_id,profile_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// ADMIN PLATFORM STATS SERVICE
// ============================================================================

export const adminStatsService = {
  async getPlatformStats() {
    const [
      clinicsResult,
      petParentsResult,
      petsResult,
      bookingsResult,
      paymentsResult,
    ] = await Promise.all([
      supabase.from('service_providers').select('id, is_active, approval_status, created_at', { count: 'exact' }),
      supabase.from('user_roles').select('profile_id', { count: 'exact' }).eq('role', 'customer'),
      supabase.from('pets').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('bookings').select('id, status, created_at', { count: 'exact' }),
      supabase.from('payments').select('amount, status, created_at').eq('status', 'success'),
    ]);

    const clinics = clinicsResult.data || [];
    const bookings = bookingsResult.data || [];
    const payments = paymentsResult.data || [];

    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

    // Recent activity — last 5 clinics registered
    const recentClinics = clinics
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      clinics: {
        total: clinics.length,
        active: clinics.filter((c: any) => c.is_active).length,
        inactive: clinics.filter((c: any) => !c.is_active).length,
        pending: clinics.filter((c: any) => c.approval_status === 'pending').length,
        approved: clinics.filter((c: any) => c.approval_status === 'approved').length,
      },
      petParents: {
        total: petParentsResult.count || 0,
      },
      pets: {
        total: petsResult.count || 0,
      },
      appointments: {
        total: bookings.length,
        completed: bookings.filter((b: any) => b.status === 'completed').length,
        cancelled: bookings.filter((b: any) => b.status === 'cancelled').length,
        pending: bookings.filter((b: any) => b.status === 'pending').length,
        confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
      },
      revenue: {
        total: totalRevenue,
        transactions: payments.length,
      },
      recentClinics,
    };
  },

  async updateClinicStatus(clinicId: string, updates: {
    is_active?: boolean;
    approval_status?: string;
    approved_by?: string;
    rejection_reason?: string;
  }) {
    const updateData: Record<string, any> = { ...updates };
    if (updates.approval_status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('service_providers')
      .update(updateData)
      .eq('id', clinicId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getClinicsForAdmin() {
    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        id, name, category, city, state, phone, email,
        is_active, is_verified, approval_status, approved_at, rejection_reason,
        created_at, updated_at, user_id
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get booking counts per clinic
    const { data: bookingCounts } = await supabase
      .from('bookings')
      .select('provider_id');

    const countsByClinic = new Map<string, number>();
    (bookingCounts || []).forEach((b: any) => {
      countsByClinic.set(b.provider_id, (countsByClinic.get(b.provider_id) || 0) + 1);
    });

    return (data || []).map((clinic: any) => ({
      ...clinic,
      total_bookings: countsByClinic.get(clinic.id) || 0,
    }));
  },
};

// ============================================================================
// CLINIC SCOPED BOOKING/MEDICAL/PET QUERIES
// ============================================================================

export const clinicScopedService = {
  /**
   * Get all appointments for a specific clinic, with pet and owner info.
   */
  async getClinicAppointments(providerId: string, filters?: {
    date?: string;
    status?: string;
    petId?: string;
  }) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        pets(id, name, type, breed, image_url),
        profiles!bookings_profile_id_fkey(id, full_name, email, mobile_number)
      `)
      .eq('provider_id', providerId)
      .order('booking_date', { ascending: false });

    if (filters?.date) query = query.eq('booking_date', filters.date);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.petId) query = query.eq('pet_id', filters.petId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get today's appointments for a clinic dashboard.
   */
  async getTodayAppointments(providerId: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.getClinicAppointments(providerId, { date: today });
  },

  /**
   * Get clinic-level medical records with pet & owner context.
   */
  async getClinicMedicalRecords(providerId: string, petId?: string) {
    let query = supabase
      .from('medical_records')
      .select(`
        *,
        pets(id, name, type, breed, profile_id,
          profiles!pets_profile_id_fkey(id, full_name, email, mobile_number)
        ),
        prescriptions(*)
      `)
      .eq('provider_id', providerId)
      .order('consultation_date', { ascending: false });

    if (petId) query = query.eq('pet_id', petId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get clinic dashboard summary stats.
   */
  async getClinicDashboardStats(providerId: string) {
    const today = new Date().toISOString().split('T')[0];

    const [todayBookings, allBookings, bills] = await Promise.all([
      supabase
        .from('bookings')
        .select('id, status')
        .eq('provider_id', providerId)
        .eq('booking_date', today),
      supabase
        .from('bookings')
        .select('id, status, created_at, amount')
        .eq('provider_id', providerId),
      supabase
        .from('bills')
        .select('total_amount, status, bill_date')
        .eq('provider_id', providerId)
        .eq('status', 'paid'),
    ]);

    const todayList = todayBookings.data || [];
    const allList = allBookings.data || [];
    const paidBills = bills.data || [];

    const thisMonth = new Date().toISOString().slice(0, 7); // "2026-08"
    const monthlyRevenue = paidBills
      .filter((b: any) => b.bill_date?.startsWith(thisMonth))
      .reduce((sum: number, b: any) => sum + parseFloat(b.total_amount || 0), 0);

    return {
      today: {
        total: todayList.length,
        confirmed: todayList.filter((b: any) => b.status === 'confirmed').length,
        completed: todayList.filter((b: any) => b.status === 'completed').length,
        pending: todayList.filter((b: any) => b.status === 'pending').length,
        cancelled: todayList.filter((b: any) => b.status === 'cancelled').length,
        walk_in: todayList.filter((b: any) => b.status === 'walk_in').length,
      },
      allTime: {
        total: allList.length,
        completed: allList.filter((b: any) => b.status === 'completed').length,
        cancelled: allList.filter((b: any) => b.status === 'cancelled').length,
      },
      revenue: {
        monthly: monthlyRevenue,
        totalTransactions: paidBills.length,
      },
    };
  },
};
