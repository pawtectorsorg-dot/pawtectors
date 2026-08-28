// ============================================================================
// VALIDATION SCHEMAS FOR API REQUESTS
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// USER VALIDATION
// ============================================================================

export const userValidation = {
  createProfile: {
    full_name: { required: true, type: 'string', minLength: 2, maxLength: 255 },
    phone_number: { required: false, type: 'string', pattern: '^[0-9]{10,15}$' },
    profile_picture_url: { required: false, type: 'string' },
    address: { required: false, type: 'string', maxLength: 500 },
    city: { required: false, type: 'string', maxLength: 100 },
    state: { required: false, type: 'string', maxLength: 100 },
    zipcode: { required: false, type: 'string', pattern: '^[0-9]{5,6}$' },
  },
  updateProfile: {
    full_name: { required: false, type: 'string', minLength: 2, maxLength: 255 },
    phone_number: { required: false, type: 'string', pattern: '^[0-9]{10,15}$' },
    profile_picture_url: { required: false, type: 'string' },
    address: { required: false, type: 'string', maxLength: 500 },
    city: { required: false, type: 'string', maxLength: 100 },
    state: { required: false, type: 'string', maxLength: 100 },
    zipcode: { required: false, type: 'string', pattern: '^[0-9]{5,6}$' },
  },
};

// ============================================================================
// PROVIDER VALIDATION
// ============================================================================

export const providerValidation = {
  create: {
    service_category: {
      required: true,
      type: 'string',
      enum: ['clinic', 'grooming', 'boarding', 'training'],
    },
    business_name: { required: true, type: 'string', minLength: 3, maxLength: 255 },
    description: { required: false, type: 'string', maxLength: 1000 },
    phone_number: { required: true, type: 'string', pattern: '^[0-9]{10,15}$' },
    email: { required: false, type: 'string', format: 'email' },
    address: { required: true, type: 'string', maxLength: 500 },
    city: { required: true, type: 'string', maxLength: 100 },
    state: { required: true, type: 'string', maxLength: 100 },
    zipcode: { required: true, type: 'string', pattern: '^[0-9]{5,6}$' },
    latitude: { required: false, type: 'number', min: -90, max: 90 },
    longitude: { required: false, type: 'number', min: -180, max: 180 },
    license_number: { required: false, type: 'string', maxLength: 100 },
    price_range: { required: false, type: 'string', enum: ['', '₹', '₹₹', '₹₹₹', '₹₹₹₹'] },
    is_active: { required: false, type: 'boolean' },
  },
};

// ============================================================================
// BOOKING VALIDATION
// ============================================================================

export const bookingValidation = {
  create: {
    service_provider_id: { required: true, type: 'string', format: 'uuid' },
    profile_id: { required: false, type: 'string', format: 'uuid' },
    pet_name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    pet_type: { required: true, type: 'string', enum: ['dog', 'cat', 'bird', 'rabbit', 'other'] },
    booking_date: { required: true, type: 'string', format: 'date-time' },
    end_date: { required: false, type: 'string', format: 'date-time' },
    description: { required: false, type: 'string', maxLength: 1000 },
    amount: { required: true, type: 'number', min: 0 },
    status: { required: false, type: 'string', default: 'pending' },
  },
};

// ============================================================================
// PRODUCT VALIDATION
// ============================================================================

export const productValidation = {
  create: {
    name: { required: true, type: 'string', minLength: 3, maxLength: 255 },
    description: { required: true, type: 'string', maxLength: 1000 },
    category: {
      required: true,
      type: 'string',
      enum: ['food', 'toys', 'accessories', 'medicine', 'grooming', 'other'],
    },
    price: { required: true, type: 'number', min: 0 },
    stock_quantity: { required: true, type: 'number', min: 0 },
    seller_id: { required: true, type: 'string', format: 'uuid' },
    image_url: { required: false, type: 'string' },
    is_active: { required: false, type: 'boolean', default: true },
  },
};

// ============================================================================
// ORDER VALIDATION
// ============================================================================

export const orderValidation = {
  create: {
    profile_id: { required: false, type: 'string', format: 'uuid' },
    total_amount: { required: true, type: 'number', min: 0 },
    shipping_address: { required: true, type: 'string', maxLength: 500 },
    shipping_city: { required: true, type: 'string', maxLength: 100 },
    shipping_state: { required: true, type: 'string', maxLength: 100 },
    shipping_zipcode: { required: true, type: 'string', pattern: '^[0-9]{5,6}$' },
    status: { required: false, type: 'string', default: 'pending' },
  },
  addItem: {
    product_id: { required: true, type: 'string', format: 'uuid' },
    quantity: { required: true, type: 'number', min: 1 },
    unit_price: { required: true, type: 'number', min: 0 },
  },
};

// ============================================================================
// REVIEW VALIDATION
// ============================================================================

export const reviewValidation = {
  create: {
    user_id: { required: true, type: 'string', format: 'uuid' },
    product_id: { required: false, type: 'string', format: 'uuid' },
    service_provider_id: { required: false, type: 'string', format: 'uuid' },
    rating: { required: true, type: 'number', min: 1, max: 5 },
    title: { required: true, type: 'string', minLength: 5, maxLength: 100 },
    description: { required: true, type: 'string', minLength: 10, maxLength: 1000 },
    verified_purchase: { required: false, type: 'boolean', default: false },
  },
};

// ============================================================================
// PAYMENT VALIDATION
// ============================================================================

export const paymentValidation = {
  create: {
    booking_id: { required: false, type: 'string', format: 'uuid' },
    order_id: { required: false, type: 'string', format: 'uuid' },
    amount: { required: true, type: 'number', min: 0 },
    payment_method: {
      required: true,
      type: 'string',
      enum: ['credit_card', 'debit_card', 'wallet', 'bank_transfer'],
    },
    razorpay_order_id: { required: false, type: 'string' },
    razorpay_payment_id: { required: false, type: 'string' },
    status: { required: false, type: 'string', default: 'pending' },
  },
  verify: {
    razorpay_payment_id: { required: true, type: 'string' },
    razorpay_order_id: { required: true, type: 'string' },
    razorpay_signature: { required: true, type: 'string' },
  },
};

// ============================================================================
// NGO VALIDATION
// ============================================================================

export const ngoValidation = {
  create: {
    name: { required: true, type: 'string', minLength: 3, maxLength: 255 },
    description: { required: false, type: 'string', maxLength: 1000 },
    email: { required: true, type: 'string', format: 'email' },
    phone_number: { required: true, type: 'string', pattern: '^[0-9]{10,15}$' },
    address: { required: true, type: 'string', maxLength: 500 },
    city: { required: true, type: 'string', maxLength: 100 },
    state: { required: true, type: 'string', maxLength: 100 },
    zipcode: { required: true, type: 'string', pattern: '^[0-9]{5,6}$' },
    registration_number: { required: false, type: 'string', maxLength: 100 },
    is_active: { required: false, type: 'boolean', default: true },
  },
  addAnimal: {
    name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    species: { required: true, type: 'string', enum: ['dog', 'cat', 'bird', 'rabbit', 'other'] },
    breed: { required: false, type: 'string', maxLength: 100 },
    age_years: { required: false, type: 'number', min: 0 },
    age_months: { required: false, type: 'number', min: 0, max: 11 },
    description: { required: false, type: 'string', maxLength: 1000 },
    health_status: { required: false, type: 'string', maxLength: 500 },
    image_url: { required: false, type: 'string' },
    is_available: { required: false, type: 'boolean', default: true },
  },
  adoptionRequest: {
    user_id: { required: true, type: 'string', format: 'uuid' },
    shelter_animal_id: { required: true, type: 'string', format: 'uuid' },
    motivation: { required: false, type: 'string', maxLength: 1000 },
    living_situation: { required: false, type: 'string', maxLength: 500 },
    status: { required: false, type: 'string', default: 'pending' },
  },
  donation: {
    donor_id: { required: false, type: 'string', format: 'uuid' },
    donor_name: { required: false, type: 'string', maxLength: 255 },
    donor_email: { required: false, type: 'string', format: 'email' },
    amount: { required: true, type: 'number', min: 0 },
    payment_id: { required: false, type: 'string', format: 'uuid' },
    message: { required: false, type: 'string', maxLength: 500 },
  },
};

// ============================================================================
// VALIDATION ERROR MESSAGES
// ============================================================================

export const validationMessages = {
  required: (field: string) => `${field} is required`,
  invalidType: (field: string, type: string) => `${field} must be of type ${type}`,
  invalidEnum: (field: string, values: string[]) =>
    `${field} must be one of: ${values.join(', ')}`,
  invalidEmail: (field: string) => `${field} must be a valid email`,
  minLength: (field: string, min: number) => `${field} must have at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must not exceed ${max} characters`,
  invalidPattern: (field: string) => `${field} has invalid format`,
  invalidUUID: (field: string) => `${field} must be a valid UUID`,
};

// ============================================================================
// VALIDATOR FUNCTION
// ============================================================================

export const validateRequest = (
  data: Record<string, unknown>,
  schema: Record<string, unknown>
): { valid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const fieldRules = rules as any;
    const value = data[field];

    // Check required
    if (fieldRules.required && (value === undefined || value === null || value === '')) {
      errors[field] = [validationMessages.required(field)];
      continue;
    }

    if (value === undefined || value === null) continue;

    // Check type
    if (fieldRules.type && typeof value !== fieldRules.type) {
      if (!(errors[field])) errors[field] = [];
      errors[field].push(validationMessages.invalidType(field, fieldRules.type));
    }

    // Check enum
    if (fieldRules.enum && !fieldRules.enum.includes(value)) {
      if (!(errors[field])) errors[field] = [];
      errors[field].push(validationMessages.invalidEnum(field, fieldRules.enum));
    }

    // Check minLength
    if (fieldRules.minLength && typeof value === 'string' && value.length < fieldRules.minLength) {
      if (!(errors[field])) errors[field] = [];
      errors[field].push(validationMessages.minLength(field, fieldRules.minLength));
    }

    // Check maxLength
    if (fieldRules.maxLength && typeof value === 'string' && value.length > fieldRules.maxLength) {
      if (!(errors[field])) errors[field] = [];
      errors[field].push(validationMessages.maxLength(field, fieldRules.maxLength));
    }

    // Check pattern
    if (fieldRules.pattern && typeof value === 'string' && !new RegExp(fieldRules.pattern).test(value)) {
      if (!(errors[field])) errors[field] = [];
      errors[field].push(validationMessages.invalidPattern(field));
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
