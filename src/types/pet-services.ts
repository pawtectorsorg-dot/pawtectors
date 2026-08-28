export type ServiceCategory = 'pet-shop' | 'clinic' | 'grooming' | 'boarding' | 'training';

export interface ServicePricing {
  name: string;
  price: number;
}

export interface PetService {
  id: string;
  name: string;
  category: ServiceCategory;
  address: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  rating: number;
  reviewCount: number;
  image: string;
  phone: string;
  email?: string;
  openTime: string;
  closeTime: string;
  description: string;
  services: string[];
  priceRange: string;
  pricing?: ServicePricing[];
  slotCapacity?: number;
  slotIntervalMinutes?: number;
}

export interface BookingFormData {
  serviceId: string;
  petName: string;
  petType: string;
  ownerName: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  notes?: string;
}
