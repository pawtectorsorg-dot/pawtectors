import { supabaseAdmin as supabase, supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  image?: string;
  stock: number;
  brand?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Order {
  id: string;
  profile_id?: string;
  total_amount: number;
  shipping_address?: string | object;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

interface Booking {
  id: string;
  profile_id?: string;
  provider_id: string;
  service_type?: string;
  pet_name?: string;
  pet_type?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  booking_date: string;
  booking_time?: string;
  notes?: string;
  special_requirements?: string;
  additional_information?: string;
  amount?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface Review {
  id: string;
  product_id?: string;
  service_provider_id?: string;
  order_id?: string;
  booking_id?: string;
  user_id?: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  booking_id?: string;
  order_id?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  created_at?: string;
}

interface Notification {
  id: string;
  profile_id: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}

// Products
export const productService = {
  async getAll(category?: string) {
    let query = supabase.from('products').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    return query.eq('is_active', true).order('created_at', { ascending: false });
  },

  async getById(id: string) {
    return supabase.from('products').select('*').eq('id', id).single();
  },

  async create(data: Omit<Product, 'id'>) {
    return supabaseAdmin.from('products').insert([{ id: uuidv4(), ...data }]);
  },

  async update(id: string, data: Partial<Product>) {
    return supabaseAdmin.from('products').update(data).eq('id', id);
  },

  async delete(id: string) {
    return supabaseAdmin.from('products').update({ is_active: false }).eq('id', id);
  },

  async updateStock(id: string, quantity: number) {
    return supabaseAdmin.rpc('update_product_stock', { product_id: id, quantity_change: quantity });
  },
};

// Orders
export const orderService = {
  async getAll(profileId?: string) {
    let query = supabase.from('orders').select(`
      *,
      order_items!left (
        id,
        product_id,
        quantity,
        price,
        products!left (
          name
        )
      ),
      profiles!left (
        full_name,
        email,
        mobile_number
      )
    `);
    if (profileId) {
      query = query.eq('profile_id', profileId);
    }
    return query.order('created_at', { ascending: false });
  },

  async getById(id: string) {
    return supabase.from('orders').select('*').eq('id', id).single();
  },

  async create(data: Omit<Order, 'id'>) {
    return supabaseAdmin.from('orders').insert([{ id: uuidv4(), ...data }]);
  },

  async update(id: string, data: Partial<Order>) {
    return supabaseAdmin.from('orders').update(data).eq('id', id);
  },

  async getOrderItems(orderId: string) {
    return supabase.from('order_items').select('*').eq('order_id', orderId);
  },

  async addOrderItem(data: Omit<OrderItem, 'id'>) {
    return supabaseAdmin.from('order_items').insert([{ id: uuidv4(), ...data }]);
  },
};

// Bookings
export const bookingService = {
  async getAll(providerId?: string, profileId?: string) {
    let query = supabase.from('bookings').select(`
      *,
      service_providers!left (
        name,
        category
      )
    `);
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }
    if (profileId) {
      query = query.eq('profile_id', profileId);
    }
    return query.order('booking_date', { ascending: false });
  },

  async getById(id: string) {
    return supabase.from('bookings').select('*').eq('id', id).single();
  },

  async create(data: Omit<Booking, 'id'>) {
    return supabaseAdmin.from('bookings').insert([{ id: uuidv4(), ...data }]);
  },

  async update(id: string, data: Partial<Booking>) {
    return supabaseAdmin.from('bookings').update(data).eq('id', id);
  },
};

// Reviews
export const reviewService = {
  async getAll(productId?: string, serviceProviderId?: string) {
    let query = supabase.from('reviews').select('*');
    if (productId) {
      query = query.eq('product_id', productId);
    }
    if (serviceProviderId) {
      query = query.eq('service_provider_id', serviceProviderId);
    }
    return query.order('created_at', { ascending: false });
  },

  async getById(id: string) {
    return supabase.from('reviews').select('*').eq('id', id).single();
  },

  async create(data: Omit<Review, 'id'>) {
    return supabaseAdmin.from('reviews').insert([{ id: uuidv4(), ...data }]);
  },

  async update(id: string, data: Partial<Review>) {
    return supabaseAdmin.from('reviews').update(data).eq('id', id);
  },

  async delete(id: string) {
    return supabaseAdmin.from('reviews').delete().eq('id', id);
  },
};

// Payments
export const paymentService = {
  async getAll(bookingId?: string, orderId?: string) {
    let query = supabase.from('payments').select('*');
    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    return query.order('created_at', { ascending: false });
  },

  async getById(id: string) {
    return supabase.from('payments').select('*').eq('id', id).single();
  },

  async create(data: Omit<Payment, 'id'>) {
    return supabaseAdmin.from('payments').insert([{ id: uuidv4(), ...data }]);
  },

  async update(id: string, data: Partial<Payment>) {
    return supabaseAdmin.from('payments').update(data).eq('id', id);
  },
};

// Notifications
export const notificationService = {
  async getAll(userId: string) {
    return supabase.from('notifications').select('*').eq('profile_id', userId).order('created_at', { ascending: false });
  },

  async create(data: Omit<Notification, 'id'>) {
    return supabaseAdmin.from('notifications').insert([{ id: uuidv4(), ...data }]);
  },

  async markAsRead(id: string) {
    return supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', id);
  },
};
