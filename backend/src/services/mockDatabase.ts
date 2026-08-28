/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Mock Database Service for Development
 * Provides in-memory data storage for all Pawtectors entities
 * Used when Supabase connection is unavailable
 */

// ============================================================================
// DATA STORE
// ============================================================================

interface MockStore {
  users: Record<string, any>;
  profiles: Record<string, any>;
  providers: Record<string, any>;
  clinics: Record<string, any>;
  products: Record<string, any>;
  orders: Record<string, any>;
  bookings: Record<string, any>;
  reviews: Record<string, any>;
  payments: Record<string, any>;
  ngos: Record<string, any>;
  notifications: Record<string, any>;
  medicalRecords: Record<string, any>;
  prescriptions: Record<string, any>;
  vaccinations: Record<string, any>;
  timeSlots: Record<string, any>;
  bills: Record<string, any>;
}

const mockStore: MockStore = {
  users: {},
  profiles: {},
  providers: {},
  clinics: {},
  products: {},
  orders: {},
  bookings: {},
  reviews: {},
  payments: {},
  ngos: {},
  notifications: {},
  medicalRecords: {},
  prescriptions: {},
  vaccinations: {},
  timeSlots: {},
  bills: {},
};

// ============================================================================
// MOCK DATABASE SERVICE
// ============================================================================

export const mockDatabase = {
  // Users
  async getUser(id: string) {
    return { data: mockStore.users[id] || null, error: null };
  },

  async createUser(user: Record<string, unknown>) {
    const id = `user_${Date.now()}`;
    mockStore.users[id] = { id, ...user, created_at: new Date() };
    return { data: mockStore.users[id], error: null };
  },

  async updateUser(id: string, updates: Record<string, unknown>) {
    if (!mockStore.users[id]) {
      return { data: null, error: { message: 'User not found' } };
    }
    mockStore.users[id] = { ...mockStore.users[id], ...updates, updated_at: new Date() };
    return { data: mockStore.users[id], error: null };
  },

  // Clinics
  async getClinics() {
    return { data: Object.values(mockStore.clinics), error: null };
  },

  async getClinic(id: string) {
    return { data: mockStore.clinics[id] || null, error: null };
  },

  async createClinic(clinic: Record<string, unknown>) {
    const id = `clinic_${Date.now()}`;
    const newClinic = {
      id,
      ...clinic,
      created_at: new Date(),
      rating: 0,
      review_count: 0,
    };
    mockStore.clinics[id] = newClinic;
    return { data: newClinic, error: null };
  },

  async updateClinic(id: string, updates: Record<string, unknown>) {
    if (!mockStore.clinics[id]) {
      return { data: null, error: { message: 'Clinic not found' } };
    }
    mockStore.clinics[id] = { ...mockStore.clinics[id], ...updates, updated_at: new Date() };
    return { data: mockStore.clinics[id], error: null };
  },

  // Products
  async getProducts() {
    return { data: Object.values(mockStore.products), error: null };
  },

  async getProduct(id: string) {
    return { data: mockStore.products[id] || null, error: null };
  },

  async createProduct(product: Record<string, unknown>) {
    const id = `prod_${Date.now()}`;
    const newProduct = { id, ...product, created_at: new Date() };
    mockStore.products[id] = newProduct;
    return { data: newProduct, error: null };
  },

  async updateProduct(id: string, updates: Record<string, unknown>) {
    if (!mockStore.products[id]) {
      return { data: null, error: { message: 'Product not found' } };
    }
    mockStore.products[id] = { ...mockStore.products[id], ...updates, updated_at: new Date() };
    return { data: mockStore.products[id], error: null };
  },

  // Orders
  async getOrders() {
    return { data: Object.values(mockStore.orders), error: null };
  },

  async getOrder(id: string) {
    return { data: mockStore.orders[id] || null, error: null };
  },

  async createOrder(order: Record<string, unknown>) {
    const id = `order_${Date.now()}`;
    const newOrder = { id, ...order, status: 'pending', created_at: new Date() };
    mockStore.orders[id] = newOrder;
    return { data: newOrder, error: null };
  },

  async updateOrder(id: string, updates: Record<string, unknown>) {
    if (!mockStore.orders[id]) {
      return { data: null, error: { message: 'Order not found' } };
    }
    mockStore.orders[id] = { ...mockStore.orders[id], ...updates, updated_at: new Date() };
    return { data: mockStore.orders[id], error: null };
  },

  // Bookings
  async getBookings() {
    return { data: Object.values(mockStore.bookings), error: null };
  },

  async getBooking(id: string) {
    return { data: mockStore.bookings[id] || null, error: null };
  },

  async createBooking(booking: Record<string, unknown>) {
    const id = `booking_${Date.now()}`;
    const newBooking = { id, ...booking, status: 'pending', created_at: new Date() };
    mockStore.bookings[id] = newBooking;
    return { data: newBooking, error: null };
  },

  async updateBooking(id: string, updates: Record<string, unknown>) {
    if (!mockStore.bookings[id]) {
      return { data: null, error: { message: 'Booking not found' } };
    }
    mockStore.bookings[id] = { ...mockStore.bookings[id], ...updates, updated_at: new Date() };
    return { data: mockStore.bookings[id], error: null };
  },

  // Reviews
  async getReviews() {
    return { data: Object.values(mockStore.reviews), error: null };
  },

  async createReview(review: Record<string, unknown>) {
    const id = `review_${Date.now()}`;
    const newReview = { id, ...review, created_at: new Date() };
    mockStore.reviews[id] = newReview;
    return { data: newReview, error: null };
  },

  // Payments
  async createPayment(payment: Record<string, unknown>) {
    const id = `payment_${Date.now()}`;
    const newPayment = { id, ...payment, status: 'pending', created_at: new Date() };
    mockStore.payments[id] = newPayment;
    return { data: newPayment, error: null };
  },

  // NGOs
  async getNGOs() {
    return { data: Object.values(mockStore.ngos), error: null };
  },

  async getNGO(id: string) {
    return { data: mockStore.ngos[id] || null, error: null };
  },

  async createNGO(ngo: Record<string, unknown>) {
    const id = `ngo_${Date.now()}`;
    const newNGO = { id, ...ngo, created_at: new Date() };
    mockStore.ngos[id] = newNGO;
    return { data: newNGO, error: null };
  },

  // Notifications
  async getNotifications(userId: string) {
    const userNotifications = Object.values(mockStore.notifications).filter(
      (n: any) => n.user_id === userId
    );
    return { data: userNotifications, error: null };
  },

  async createNotification(notification: Record<string, unknown>) {
    const id = `notif_${Date.now()}`;
    const newNotif = { id, ...notification, created_at: new Date(), read: false };
    mockStore.notifications[id] = newNotif;
    return { data: newNotif, error: null };
  },

  // Medical Records
  async getMedicalRecords(petId?: string, providerId?: string) {
    let records = Object.values(mockStore.medicalRecords);
    if (petId) {
      records = records.filter((r: any) => r.pet_id === petId);
    }
    if (providerId) {
      records = records.filter((r: any) => r.provider_id === providerId);
    }
    // Join prescriptions
    const recordsWithPrescriptions = records.map((record: any) => {
      const prescriptions = Object.values(mockStore.prescriptions).filter(
        (p: any) => p.medical_record_id === record.id
      );
      return { ...record, prescriptions };
    });
    return { data: recordsWithPrescriptions, error: null };
  },

  async getMedicalRecord(id: string) {
    const record = mockStore.medicalRecords[id];
    if (!record) return { data: null, error: null };
    const prescriptions = Object.values(mockStore.prescriptions).filter(
      (p: any) => p.medical_record_id === id
    );
    return { data: { ...record, prescriptions }, error: null };
  },

  async createMedicalRecord(record: Record<string, any>) {
    const id = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRecord = {
      id,
      ...record,
      consultation_date: record.consultation_date || new Date().toISOString().split('T')[0],
      created_at: new Date(),
      updated_at: new Date()
    };
    mockStore.medicalRecords[id] = newRecord;

    // Handle nested prescriptions if provided
    if (Array.isArray(record.prescriptions)) {
      for (const rx of record.prescriptions) {
        const rxId = `rx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        mockStore.prescriptions[rxId] = {
          id: rxId,
          medical_record_id: id,
          medicine_name: rx.medicine_name,
          dosage: rx.dosage,
          frequency: rx.frequency,
          duration: rx.duration,
          instructions: rx.instructions || '',
          created_at: new Date()
        };
      }
    }

    return { data: { ...newRecord, prescriptions: record.prescriptions || [] }, error: null };
  },

  async updateMedicalRecord(id: string, updates: Record<string, any>) {
    if (!mockStore.medicalRecords[id]) {
      return { data: null, error: { message: 'Medical record not found' } };
    }
    mockStore.medicalRecords[id] = {
      ...mockStore.medicalRecords[id],
      ...updates,
      updated_at: new Date()
    };
    return { data: mockStore.medicalRecords[id], error: null };
  },

  // Prescriptions
  async createPrescription(rx: Record<string, any>) {
    const id = `rx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRx = { id, ...rx, created_at: new Date() };
    mockStore.prescriptions[id] = newRx;
    return { data: newRx, error: null };
  },

  // Vaccinations
  async getVaccinations(petId?: string, providerId?: string) {
    let vacs = Object.values(mockStore.vaccinations);
    if (petId) {
      vacs = vacs.filter((v: any) => v.pet_id === petId);
    }
    if (providerId) {
      vacs = vacs.filter((v: any) => v.provider_id === providerId);
    }
    return { data: vacs, error: null };
  },

  async createVaccination(vac: Record<string, any>) {
    const id = `vac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newVac = { id, ...vac, created_at: new Date() };
    mockStore.vaccinations[id] = newVac;
    return { data: newVac, error: null };
  },

  // Time Slots
  async getTimeSlots(providerId: string, date?: string) {
    let slots = Object.values(mockStore.timeSlots).filter(
      (s: any) => s.provider_id === providerId
    );
    if (date) {
      slots = slots.filter((s: any) => s.slot_date === date);
    }
    return { data: slots, error: null };
  },

  async bulkCreateTimeSlots(providerId: string, date: string, times: string[]) {
    const created = [];
    for (const time of times) {
      const key = `${providerId}_${date}_${time}`;
      // Check if slot exists to prevent overwriting booked slots
      const existing = Object.values(mockStore.timeSlots).find(
        (s: any) => s.provider_id === providerId && s.slot_date === date && s.slot_time === time
      ) as any;
      if (existing) {
        created.push(existing);
        continue;
      }
      const id = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newSlot = {
        id,
        provider_id: providerId,
        slot_date: date,
        slot_time: time,
        status: 'available',
        booking_id: null,
        created_at: new Date()
      };
      mockStore.timeSlots[id] = newSlot;
      created.push(newSlot);
    }
    return { data: created, error: null };
  },

  async toggleTimeSlot(providerId: string, date: string, time: string, status: string, bookingId?: string) {
    const slot = Object.values(mockStore.timeSlots).find(
      (s: any) => s.provider_id === providerId && s.slot_date === date && s.slot_time === time
    ) as any;

    if (slot) {
      slot.status = status;
      slot.booking_id = bookingId || null;
      return { data: slot, error: null };
    }

    // If it doesn't exist, create it with target status
    const id = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSlot = {
      id,
      provider_id: providerId,
      slot_date: date,
      slot_time: time,
      status: status,
      booking_id: bookingId || null,
      created_at: new Date()
    };
    mockStore.timeSlots[id] = newSlot;
    return { data: newSlot, error: null };
  },

  // Bills
  async getBills(profileId?: string, providerId?: string) {
    let billsList = Object.values(mockStore.bills);
    if (profileId) {
      billsList = billsList.filter((b: any) => b.profile_id === profileId);
    }
    if (providerId) {
      billsList = billsList.filter((b: any) => b.provider_id === providerId);
    }
    return { data: billsList, error: null };
  },

  async getBill(id: string) {
    return { data: mockStore.bills[id] || null, error: null };
  },

  async createBill(billData: Record<string, any>) {
    const id = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBill = {
      id,
      ...billData,
      bill_date: billData.bill_date || new Date().toISOString().split('T')[0],
      consultation_charges: Number(billData.consultation_charges || 0),
      treatment_charges: Number(billData.treatment_charges || 0),
      medicine_charges: Number(billData.medicine_charges || 0),
      other_charges: Number(billData.other_charges || 0),
      tax_amount: Number(billData.tax_amount || 0),
      total_amount: Number(billData.total_amount),
      status: billData.status || 'unpaid',
      created_at: new Date()
    };
    mockStore.bills[id] = newBill;
    return { data: newBill, error: null };
  },

  async updateBill(id: string, updates: Record<string, any>) {
    if (!mockStore.bills[id]) {
      return { data: null, error: { message: 'Bill not found' } };
    }
    mockStore.bills[id] = { ...mockStore.bills[id], ...updates };
    return { data: mockStore.bills[id], error: null };
  },

  // Health check
  async healthCheck() {
    return { data: { status: 'ok', database: 'mock', timestamp: new Date() }, error: null };
  },
};

export default mockDatabase;
