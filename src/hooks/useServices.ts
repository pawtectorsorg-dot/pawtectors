import { useState, useEffect, useCallback } from 'react';
import { PetService, ServiceCategory } from '@/types/pet-services';
import { petServices as initialServices } from '@/data/pet-services';
import { providersApi, seedApi } from '@/lib/api';

/** Optional location filters the hook consumer can pass. */
interface ServiceFilters {
  city?: string;
  state?: string;
}

/** Shape of a row returned by the providers API. */
interface ProviderRow {
  id: string;
  name: string;
  category: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
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
}

const VALID_CATEGORIES: readonly ServiceCategory[] = ['pet-shop', 'clinic', 'grooming', 'boarding', 'training'] as const;

function toServiceCategory(value: string): ServiceCategory {
  return (VALID_CATEGORIES as readonly string[]).includes(value) ? (value as ServiceCategory) : 'pet-shop';
}

function mapRowToService(row: ProviderRow): PetService {
  return {
    id: row.id,
    name: row.name,
    category: toServiceCategory(row.category),
    address: row.address ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    pincode: row.pincode ?? '',
    rating: row.rating ?? 4.5,
    reviewCount: row.review_count ?? 0,
    image: row.image ?? 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
    phone: row.phone ?? '',
    email: row.email ?? '',
    openTime: row.open_time ?? '9:00 AM',
    closeTime: row.close_time ?? '6:00 PM',
    description: row.description ?? '',
    services: Array.isArray(row.services) ? row.services : [],
    priceRange: row.price_range ?? '',
    pricing: Array.isArray(row.pricing) ? row.pricing : [],
  };
}

export const useServices = (filters?: ServiceFilters) => {
  const [services, setServices] = useState<PetService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromDB, setIsFromDB] = useState(false);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query — only include non-empty trimmed values
      const apiFilters: { city?: string; state?: string } = {};
      const city = filters?.city?.trim();
      const state = filters?.state?.trim();
      if (city) apiFilters.city = city;
      if (state) apiFilters.state = state;

      // Fetch from Express backend
      const data = await providersApi.getAll(
        Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
      );

      // Backend is reachable — always use it for CRUD
      setIsFromDB(true);

      if (data && data.length > 0) {
        const dbServices: PetService[] = (data as ProviderRow[]).map(mapRowToService);
        setServices(dbServices);
        console.log(`✅ Loaded ${dbServices.length} services from backend API`, apiFilters);
      } else if (!city && !state) {
        // DB is empty AND no location filter — auto-seed with initial data
        console.log('🌱 Database empty, seeding services via backend...');
        try {
          await seedApi.seedProviders(initialServices as unknown as Record<string, unknown>[]);
          const seededData = await providersApi.getAll();
          const seededServices: PetService[] = ((seededData ?? []) as ProviderRow[]).map(mapRowToService);
          setServices(seededServices);
          console.log(`✅ Seeded and loaded ${seededServices.length} services`);
        } catch (seedErr) {
          console.error('Seed failed, showing empty state:', seedErr);
          setServices([]);
        }
      } else {
        // No results for the given location — that's fine, show empty
        setServices([]);
        console.log(`ℹ️ No services found for city=${city || '(any)'} state=${state || '(any)'}`);
      }
    } catch (err) {
      console.error('Backend API unreachable, using static data:', err);
      setServices(initialServices);
      setIsFromDB(false);
    }
    setIsLoading(false);
  }, [filters?.city, filters?.state]);

  // Fetch services on mount and whenever filters change
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = async (service: Omit<PetService, 'id'>) => {
    if (isFromDB) {
      try {
        await providersApi.create({
          name: service.name,
          category: service.category,
          address: service.address,
          city: service.city || 'Unknown',
          state: service.state || 'Unknown',
          pincode: service.pincode || '000000',
          phone: service.phone,
          email: service.email || null,
          description: service.description,
          image: service.image,
          open_time: service.openTime,
          close_time: service.closeTime,
          price_range: service.priceRange,
          rating: service.rating,
          review_count: service.reviewCount,
          services: service.services,
          pricing: service.pricing,
        });
        console.log('✅ Service added via backend API');
        await fetchServices();
        return;
      } catch (err) {
        console.error('Backend API insert failed:', err);
      }
    }
    // Fallback only when backend is down
    const newService = { ...service, id: Date.now().toString() };
    setServices(prev => [...prev, newService]);
  };

  const updateService = async (id: string, updates: Partial<PetService>) => {
    if (isFromDB) {
      try {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.address) dbUpdates.address = updates.address;
        if (updates.city) dbUpdates.city = updates.city;
        if (updates.state) dbUpdates.state = updates.state;
        if (updates.pincode) dbUpdates.pincode = updates.pincode;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.image) dbUpdates.image = updates.image;
        if (updates.openTime) dbUpdates.open_time = updates.openTime;
        if (updates.closeTime) dbUpdates.close_time = updates.closeTime;
        if (updates.priceRange) dbUpdates.price_range = updates.priceRange;
        if (updates.services) dbUpdates.services = updates.services;
        if (updates.pricing) dbUpdates.pricing = updates.pricing;
        if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
        if (updates.reviewCount !== undefined) dbUpdates.review_count = updates.reviewCount;

        await providersApi.update(id, dbUpdates);
        console.log('✅ Service updated via backend API');
        await fetchServices();
        return;
      } catch (err) {
        console.error('Backend API update failed:', err);
      }
    }
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = async (id: string) => {
    if (isFromDB) {
      try {
        await providersApi.delete(id);
        console.log('✅ Service deleted via backend API');
        await fetchServices();
        return;
      } catch (err) {
        console.error('Backend API delete failed:', err);
      }
    }
    setServices(prev => prev.filter(s => s.id !== id));
  };

  return { services, isLoading, isFromDB, addService, updateService, deleteService };
};
