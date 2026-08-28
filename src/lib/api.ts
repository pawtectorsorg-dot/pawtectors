/**
 * Frontend API client — calls the Express backend instead of Supabase directly.
 * All paths are relative (e.g. /api/providers) and resolved through the Vite proxy.
 */

// ─── Shared response / payload interfaces ──────────────────────────────────────

/** Shape returned by the providers API. */
export interface ProviderRow {
  pincode: string;
  state: string;
  city: string;
  id: string;
  name: string;
  category: string;
  address?: string | null;
  landmark?: string | null;
  rating?: number | null;
  review_count?: number | null;
  image?: string | null;
  phone?: string | null;
  email?: string | null;
  open_time?: string | null;
  close_time?: string | null;
  description?: string | null;
  services?: string[] | null;
  price_range?: string | null;
  pricing?: { name: string; price: number }[] | null;
  is_active?: boolean | null;
  slot_capacity?: number | null;
  slot_interval_minutes?: number | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LegalPageRow {
  slug: string;
  title: string;
  content: string;
  updated_at?: string;
}

export const legalPagesApi = {
  getAll() {
    return get<LegalPageRow[]>('/api/legal-pages');
  },
  getBySlug(slug: string) {
    return get<LegalPageRow>(`/api/legal-pages/${slug}`);
  },
  update(slug: string, data: { title?: string; content: string }) {
    return put<LegalPageRow>(`/api/legal-pages/${slug}`, data);
  },
};

/** Shape returned by the bookings API. */
export interface BookingRow {
  id: string;
  pet_name: string;
  pet_type: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  booking_date: string;
  booking_time: string;
  service_name?: string | null;
  service_category?: string | null;
  status: string;
  amount?: number | null;
  notes?: string | null;
  special_requirements?: string | null;
  additional_information?: string | null;
  provider_id?: string | null;
  profile_id?: string | null;
  service_pricing_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Shape returned by the products API. */
export interface ProductRow {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  image?: string | null;
  stock: number;
  brand?: string | null;
  rating?: number | null;
  review_count?: number | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

/** Shape returned by the orders API. */
export interface OrderRow {
  id: string;
  profile_id?: string | null;
  total_amount: number;
  platform_fee?: number | null;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  display_id?: string | null;
  shipping_address?: Record<string, unknown> | null;
  billing_address?: Record<string, unknown> | null;
  notes?: string | null;
  estimated_delivery?: string | null;
  tracking_updates?: Record<string, unknown>[] | null;
  created_at?: string;
  updated_at?: string;
}

/** Shape returned by the reviews API. */
export interface ReviewRow {
  id: string;
  user_id?: string | null;
  product_id?: string | null;
  service_provider_id?: string | null;
  booking_id?: string | null;
  order_id?: string | null;
  rating: number;
  comment?: string | null;
  is_verified_purchase?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

/** Shape returned by the NGO API. */
export interface NgoRow {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  image_url?: string | null;
  mission_statement?: string | null;
  animals_count?: number | null;
  adoption_count?: number | null;
  rating?: number | null;
  review_count?: number | null;
  founded_year?: number | null;
  volunteer_count?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  is_verified?: boolean | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface ShelterAnimalRow {
  id: string;
  ngo_id: string;
  name: string;
  type: string;
  breed?: string | null;
  age_months?: number | null;
  gender?: string | null;
  description?: string | null;
  image_url?: string | null;
  health_status?: string | null;
  vaccination_status?: string | null;
  neutered_spayed?: boolean | null;
  adoption_status: string;
}

export interface PaymentRow {
  id: string;
  booking_id: string;
  amount: number;
  currency?: string | null;
  status: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationRow {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  recipient_type: string;
  recipient_id?: string | null;
  booking_id?: string | null;
  payment_id?: string | null;
  is_read?: boolean | null;
  created_at?: string;
}

export interface AdminUserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile_number: string | null;
  role: string;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthResponse {
  token?: string;
  user?: { id: string; email: string };
  userId?: string;
  message?: string;
}

// ─── helpers ───────────────────────────────────────────────────────────────────

const BASE = ''; // proxy handles /api → localhost:5000

/**
 * Build auth headers from the stored user details.
 * Sends X-User-Id / X-User-Email so the backend knows who the caller is.
 */
function authHeaders(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem('pawtectors_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const headers: Record<string, string> = {};
      if (parsed.id) headers['X-User-Id'] = parsed.id;
      if (parsed.email) headers['X-User-Email'] = parsed.email;
      return headers;
    }
  } catch {
    // Malformed storage — ignore
  }
  return {};
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }

  // DELETE endpoints may return 204
  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

function get<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}

function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

function put<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

function del<T>(path: string) {
  return request<T>(path, { method: 'DELETE' });
}

// ─── Providers (service_providers) ─────────────────────────────────────────────

export const providersApi = {
  getAll(filters?: { category?: string; city?: string; state?: string; is_active?: boolean }) {
    const params = new URLSearchParams();
    // Only send non-empty trimmed values
    const category = filters?.category?.trim();
    const city = filters?.city?.trim();
    const state = filters?.state?.trim();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    if (filters?.is_active !== undefined) params.set('is_active', String(filters.is_active));
    const qs = params.toString();
    return get<ProviderRow[]>(`/api/providers${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return get<ProviderRow>(`/api/providers/${id}`);
  },

  create(data: Record<string, unknown>) {
    return post<ProviderRow>('/api/providers', data);
  },

  update(id: string, data: Record<string, unknown>) {
    return put<ProviderRow>(`/api/providers/${id}`, data);
  },

  delete(id: string) {
    return del<void>(`/api/providers/${id}`);
  },
};

export interface PetTypeRow {
  id: string;
  name: string;
  created_at?: string;
}

export const petTypesApi = {
  getAll() {
    return get<PetTypeRow[]>('/api/pet-types');
  },
  create(name: string) {
    return post<PetTypeRow>('/api/pet-types', { name });
  },
};

export interface PetRow {
  id: string;
  profile_id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'other';
  breed?: string | null;
  age_months?: number | null;
  weight?: number | null;
  gender?: 'male' | 'female' | 'unknown' | null;
  color?: string | null;
  microchip_id?: string | null;
  vaccination_status?: string | null;
  medical_conditions?: string | null;
  allergies?: string | null;
  special_instructions?: string | null;
  avatar_url?: string | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export const petsApi = {
  getMyPets() {
    return get<PetRow[]>('/api/pets');
  },
  create(data: Omit<Partial<PetRow>, 'id' | 'profile_id'>) {
    return post<PetRow>('/api/pets', data);
  },
  update(id: string, data: Partial<PetRow>) {
    return put<PetRow>(`/api/pets/${id}`, data);
  },
  delete(id: string) {
    return del<void>(`/api/pets/${id}`);
  },
};


// ─── Bookings ──────────────────────────────────────────────────────────────────

export const bookingsApi = {
  getAll(filters?: { provider_id?: string; profile_id?: string; status?: string; service_category?: string }) {
    const params = new URLSearchParams();
    if (filters?.provider_id) params.set('provider_id', filters.provider_id);
    if (filters?.profile_id) params.set('profile_id', filters.profile_id);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.service_category) params.set('service_category', filters.service_category);
    const qs = params.toString();
    return get<BookingRow[]>(`/api/bookings${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return get<BookingRow>(`/api/bookings/${id}`);
  },

  create(data: Record<string, unknown>) {
    return post<BookingRow>('/api/bookings', data);
  },

  update(id: string, data: Record<string, unknown>) {
    return put<BookingRow>(`/api/bookings/${id}`, data);
  },

  cancel(id: string) {
    return put<BookingRow>(`/api/bookings/${id}/cancel`, {});
  },

  delete(id: string) {
    return del<void>(`/api/bookings/${id}`);
  },
};

// ─── Products ──────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll(filters?: { category?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    const qs = params.toString();
    return get<ProductRow[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return get<ProductRow>(`/api/products/${id}`);
  },

  create(data: Record<string, unknown>) {
    return post<ProductRow>('/api/products', data);
  },

  update(id: string, data: Record<string, unknown>) {
    return put<ProductRow>(`/api/products/${id}`, data);
  },

  delete(id: string) {
    return del<void>(`/api/products/${id}`);
  },
};

// ─── Cart ──────────────────────────────────────────────────────────────────────

export const cartApi = {
  getAll() {
    return get<Record<string, unknown>[]>('/api/cart');
  },

  upsert(productId: string, quantity: number) {
    return post<Record<string, unknown>>('/api/cart', { product_id: productId, quantity });
  },

  remove(productId: string) {
    return del<void>(`/api/cart/${productId}`);
  },

  clear() {
    return del<void>('/api/cart');
  },
};

// ─── Orders ────────────────────────────────────────────────────────────────────

export const ordersApi = {
  getAll(filters?: { profile_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.profile_id) params.set('profile_id', filters.profile_id);
    const qs = params.toString();
    return get<OrderRow[]>(`/api/orders${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return get<OrderRow>(`/api/orders/${id}`);
  },

  create(data: Record<string, unknown>) {
    return post<OrderRow>('/api/orders', data);
  },

  update(id: string, data: Record<string, unknown>) {
    return put<OrderRow>(`/api/orders/${id}`, data);
  },

  addItem(orderId: string, item: Record<string, unknown>) {
    return post<Record<string, unknown>>(`/api/orders/${orderId}/items`, item);
  },

  sendOrderEmail(orderId: string, data: Record<string, unknown>) {
    return post<Record<string, unknown>>(`/api/orders/${orderId}/send-email`, data);
  },
};

// ─── Reviews ───────────────────────────────────────────────────────────────────

export const reviewsApi = {
  getAll(filters?: { product_id?: string; service_provider_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.product_id) params.set('product_id', filters.product_id);
    if (filters?.service_provider_id) params.set('service_provider_id', filters.service_provider_id);
    const qs = params.toString();
    return get<ReviewRow[]>(`/api/reviews${qs ? `?${qs}` : ''}`);
  },

  create(data: Record<string, unknown>) {
    return post<ReviewRow>('/api/reviews', data);
  },

  update(id: string, data: Record<string, unknown>) {
    return put<ReviewRow>(`/api/reviews/${id}`, data);
  },

  delete(id: string) {
    return del<void>(`/api/reviews/${id}`);
  },
};

// ─── NGOs ──────────────────────────────────────────────────────────────────────

export const ngosApi = {
  getAll(filters?: { city?: string }) {
    const params = new URLSearchParams();
    if (filters?.city) params.set('city', filters.city);
    const qs = params.toString();
    return get<NgoRow[]>(`/api/ngos${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return get<NgoRow>(`/api/ngos/${id}`);
  },

  create(data: Record<string, unknown>) {
    return post<NgoRow>('/api/ngos', data);
  },

  update(id: string, data: Record<string, unknown>) {
    return put<NgoRow>(`/api/ngos/${id}`, data);
  },

  getAnimals(ngoId: string) {
    return get<ShelterAnimalRow[]>(`/api/ngos/${ngoId}/animals`);
  },

  addAnimal(ngoId: string, data: Record<string, unknown>) {
    return post<ShelterAnimalRow>(`/api/ngos/${ngoId}/animals`, data);
  },

  requestAdoption(ngoId: string, data: Record<string, unknown>) {
    return post<Record<string, unknown>>(`/api/ngos/${ngoId}/adoptions`, data);
  },

  donate(ngoId: string, data: Record<string, unknown>) {
    return post<Record<string, unknown>>(`/api/ngos/${ngoId}/donations`, data);
  },
};

// ─── Payments ──────────────────────────────────────────────────────────────────

export const paymentsApi = {
  getAll(filters?: { booking_id?: string; order_id?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.booking_id) params.set('booking_id', filters.booking_id);
    if (filters?.order_id) params.set('order_id', filters.order_id);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return get<PaymentRow[]>(`/api/payments${qs ? `?${qs}` : ''}`);
  },

  create(data: Record<string, unknown>) {
    return post<PaymentRow>('/api/payments', data);
  },

  verify(razorpay_payment_id: string) {
    return post<PaymentRow>('/api/payments/verify', { razorpay_payment_id });
  },
};

// ─── Notifications ─────────────────────────────────────────────────────────────


  export const notificationsApi = {
  getAll() {
    return get<NotificationRow[]>('/api/notifications');
  },

  create(data: { provider_id?: string; profile_id?: string; title?: string; message: string; type?: string; data?: Record<string, unknown> }) {
    return post<NotificationRow>('/api/notifications', data);
  },

  markAsRead(id: string) {
    return post<NotificationRow>(`/api/notifications/${id}/read`, {});
  },
};

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  signup(data: { email: string; password: string; full_name?: string; phone?: string; role?: string }) {
    return post<AuthResponse>('/auth/signup', data);
  },

  login(data: { email: string; password: string }) {
    return post<AuthResponse>('/auth/login', data);
  },

  changePassword(data: { current_password: string; new_password: string }) {
    return post<{ message: string }>('/auth/password-change', data);
  },

  forgotPassword(data: { email: string }) {
    return post<{ message: string }>('/auth/forgot-password', data);
  },

  verifyOtp(data: { email: string; otp: string }) {
    return post<{ message: string; resetToken: string }>('/auth/verify-otp', data);
  },

  resetPassword(data: { resetToken: string; new_password: string }) {
    return post<{ message: string }>('/auth/reset-password', data);
  },

  logout() {
    return post<{ message: string }>('/auth/logout', {});
  },

  // Get user profile and role by email (for admin login)
  async getProfileByEmail(email: string) {
    return get<{ id: string; email: string; full_name: string; role: string }>(`/api/user/profile-by-email?email=${encodeURIComponent(email)}`);
  },
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  getUsers() {
    return get<AdminUserRow[]>('/api/admin/users');
  },

  createProvider(data: Record<string, unknown>) {
    return post<Record<string, unknown>>('/api/admin/providers', data);
  },

  deleteUser(id: string) {
    return del<{ message: string }>(`/api/admin/users/${id}`);
  },
  
  updateUser(id: string, data: Record<string, unknown>) {
    return put<Record<string, unknown>>(`/api/admin/users/${id}`, data);
  },

  assignRole(id: string, role: string) {
    return post<Record<string, unknown>>(`/api/admin/users/${id}/assign-role`, { role });
  },
};

// ─── Image Upload ──────────────────────────────────────────────────────────────

export const uploadApi = {
  /** Upload an image file to Cloudinary via the backend. Returns the public URL. */
  async upload(file: File, folder = 'pawtectors'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || 'Image upload failed');
    }

    const data = await res.json();
    return data.url as string;
  },
};

// ─── Seed (auto-populate empty DB) ─────────────────────────────────────────────

export const seedApi = {
  status() {
    return get<{ products: number; providers: number; ngos: number; seeded: boolean }>('/api/seed/status');
  },

  seedProducts(products: unknown[]) {
    return post<{ message: string }>('/api/seed/products', products);
  },

  seedProviders(providers: unknown[]) {
    return post<{ message: string }>('/api/seed/providers', providers);
  },

  seedNgos(ngos: unknown[]) {
    return post<{ message: string }>('/api/seed/ngos', ngos);
  },
};

// ─── Medical Records ───────────────────────────────────────────────────────────

export interface MedicalRecordRow {
  id: string;
  pet_id: string;
  provider_id: string;
  consultation_date: string;
  diagnosis: string | null;
  treatment: string | null;
  follow_up_date: string | null;
  doctor_notes: string | null;
  doctor_name: string | null;
  created_at?: string;
  updated_at?: string;
  prescriptions?: PrescriptionRow[];
}

export interface PrescriptionRow {
  id: string;
  medical_record_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  created_at?: string;
}

export const medicalRecordsApi = {
  getAll(filters?: { pet_id?: string; provider_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.pet_id) params.set('pet_id', filters.pet_id);
    if (filters?.provider_id) params.set('provider_id', filters.provider_id);
    const qs = params.toString();
    return get<MedicalRecordRow[]>(`/api/medical-records${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return get<MedicalRecordRow>(`/api/medical-records/${id}`);
  },

  create(data: Partial<MedicalRecordRow> & { prescriptions?: Omit<PrescriptionRow, 'id' | 'medical_record_id'>[] }) {
    return post<MedicalRecordRow>('/api/medical-records', data);
  },

  update(id: string, data: Partial<MedicalRecordRow>) {
    return put<MedicalRecordRow>(`/api/medical-records/${id}`, data);
  },
};

// ─── Vaccinations ──────────────────────────────────────────────────────────────

export interface VaccinationRow {
  id: string;
  pet_id: string;
  provider_id: string;
  vaccine_name: string;
  date_given: string;
  next_due_date?: string | null;
  notes?: string | null;
  created_at?: string;
}

export const vaccinationsApi = {
  getAll(filters?: { pet_id?: string; provider_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.pet_id) params.set('pet_id', filters.pet_id);
    if (filters?.provider_id) params.set('provider_id', filters.provider_id);
    const qs = params.toString();
    return get<VaccinationRow[]>(`/api/vaccinations${qs ? `?${qs}` : ''}`);
  },

  create(data: Partial<VaccinationRow>) {
    return post<VaccinationRow>('/api/vaccinations', data);
  },
};

// ─── Time Slots ────────────────────────────────────────────────────────────────

export interface TimeSlotRow {
  id: string;
  provider_id: string;
  slot_date: string;
  slot_time: string;
  status: 'available' | 'booked' | 'blocked';
  booking_id?: string | null;
  created_at?: string;
}

export const timeSlotsApi = {
  getAll(provider_id: string, date?: string) {
    const params = new URLSearchParams();
    params.set('provider_id', provider_id);
    if (date) params.set('date', date);
    return get<TimeSlotRow[]>(`/api/time-slots?${params.toString()}`);
  },

  bulkCreate(provider_id: string, date: string, times: string[]) {
    return post<TimeSlotRow[]>('/api/time-slots/bulk', { provider_id, date, times });
  },

  toggle(provider_id: string, date: string, time: string, status: 'available' | 'booked' | 'blocked', booking_id?: string | null) {
    return post<TimeSlotRow>('/api/time-slots/toggle', { provider_id, date, time, status, booking_id });
  },
};

// ─── Bills ─────────────────────────────────────────────────────────────────────

export interface BillRow {
  id: string;
  booking_id?: string | null;
  provider_id: string;
  profile_id: string;
  pet_id?: string | null;
  bill_date: string;
  consultation_charges?: number;
  treatment_charges?: number;
  medicine_charges?: number;
  other_charges?: number;
  tax_amount?: number;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'cancelled';
  created_at?: string;
}

export const billsApi = {
  getAll(filters?: { profile_id?: string; provider_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.profile_id) params.set('profile_id', filters.profile_id);
    if (filters?.provider_id) params.set('provider_id', filters.provider_id);
    const qs = params.toString();
    return get<BillRow[]>(`/api/bills${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return get<BillRow>(`/api/bills/${id}`);
  },

  create(data: Partial<BillRow>) {
    return post<BillRow>('/api/bills', data);
  },

  update(id: string, data: Partial<BillRow>) {
    return put<BillRow>(`/api/bills/${id}`, data);
  },
};

// ─── Clinic Settings ─────────────────────────────────────────────────────────

export interface ClinicSettingsRow {
  provider_id: string;
  slot_duration_minutes: number;
  advance_booking_days: number;
  cancellation_hours: number;
  working_days: number[];
  break_start: string | null;
  break_end: string | null;
  auto_confirm_bookings: boolean;
  max_slots_per_day: number;
  notes?: string | null;
}

export const clinicSettingsApi = {
  get(clinicId: string) {
    return get<ClinicSettingsRow>(`/api/clinics/${clinicId}/settings`);
  },
  update(clinicId: string, data: Partial<ClinicSettingsRow>) {
    return put<ClinicSettingsRow>(`/api/clinics/${clinicId}/settings`, data);
  },
};

// ─── Clinic Pet Parents ───────────────────────────────────────────────────────

export interface ClinicPetParentRow {
  id: string;
  full_name: string;
  email: string | null;
  mobile_number: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  created_at: string;
  pets: Array<{
    id: string;
    name: string;
    type: string;
    breed: string | null;
    age_months: number | null;
    image_url: string | null;
  }>;
  last_visit: { booking_date: string; status: string } | null;
}

export const clinicPetParentsApi = {
  list(clinicId: string) {
    return get<ClinicPetParentRow[]>(`/api/clinics/${clinicId}/pet-parents`);
  },
  link(clinicId: string, profile_id: string, notes?: string) {
    return post(`/api/clinics/${clinicId}/pet-parents`, { profile_id, notes });
  },
};

// ─── Clinic-Scoped Appointments ───────────────────────────────────────────────

export const clinicAppointmentsApi = {
  getAll(clinicId: string, filters?: { date?: string; status?: string; pet_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.pet_id) params.set('pet_id', filters.pet_id);
    const qs = params.toString();
    return get<any[]>(`/api/clinics/${clinicId}/appointments${qs ? `?${qs}` : ''}`);
  },

  getDashboardStats(clinicId: string) {
    return get<{
      today: { total: number; confirmed: number; completed: number; pending: number; cancelled: number; walk_in: number };
      allTime: { total: number; completed: number; cancelled: number };
      revenue: { monthly: number; totalTransactions: number };
    }>(`/api/clinics/${clinicId}/dashboard-stats`);
  },
};

// ─── Clinic-Scoped Medical Records ────────────────────────────────────────────

export const clinicMedicalApi = {
  getAll(clinicId: string, pet_id?: string) {
    const qs = pet_id ? `?pet_id=${pet_id}` : '';
    return get<any[]>(`/api/clinics/${clinicId}/medical-records${qs}`);
  },
};

// ─── Platform Admin Stats ─────────────────────────────────────────────────────

export interface PlatformStats {
  clinics: { total: number; active: number; inactive: number; pending: number; approved: number };
  petParents: { total: number };
  pets: { total: number };
  appointments: { total: number; completed: number; cancelled: number; pending: number; confirmed: number };
  revenue: { total: number; transactions: number };
  recentClinics: any[];
}

export interface AdminClinicRow {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  is_verified: boolean;
  approval_status: string;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  total_bookings: number;
}

export const platformAdminApi = {
  getStats() {
    return get<PlatformStats>('/api/admin/platform-stats');
  },
  getAllClinics() {
    return get<AdminClinicRow[]>('/api/admin/all-clinics');
  },
  activateClinic(id: string) {
    return put(`/api/admin/clinics/${id}/activate`, {});
  },
  deactivateClinic(id: string) {
    return put(`/api/admin/clinics/${id}/deactivate`, {});
  },
  approveClinic(id: string) {
    return put(`/api/admin/clinics/${id}/approve`, {});
  },
  rejectClinic(id: string, reason: string) {
    return put(`/api/admin/clinics/${id}/reject`, { reason });
  },
};
