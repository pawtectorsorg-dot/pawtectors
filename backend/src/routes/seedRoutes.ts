import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// Type definitions for seed data
interface ProductSeedData {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  stock?: number;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  review_count?: number;
}

interface ServiceSeedData {
  name: string;
  category: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  image?: string;
  openTime?: string;
  open_time?: string;
  closeTime?: string;
  close_time?: string;
  priceRange?: string;
  price_range?: string;
  rating?: number;
  reviewCount?: number;
  review_count?: number;
  services?: string[];
  pricing?: Array<{ name: string; price: number; description?: string }>;
}

interface NGOSeedData {
  name: string;
  description?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  contact?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  image_url?: string;
}

// ============================================================================
// SEED PRODUCTS
// ============================================================================

router.post('/products', async (req: Request, res: Response) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      res.status(400).json({ error: 'Request body must be a non-empty array of products' });
      return;
    }

    // Check if products table already has data
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (checkError) {
      res.status(500).json({ error: `DB check failed: ${checkError.message}` });
      return;
    }

    // Map frontend product format to DB format
    const dbProducts = products.map((p: ProductSeedData) => ({
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category,
      image: p.image || '',
      stock: p.stock || 0,
      brand: p.brand || '',
      rating: p.rating || 0,
      review_count: p.reviewCount || p.review_count || 0,
      is_active: true,
    }));

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(dbProducts)
      .select();

    if (error) {
      res.status(400).json({ error: `Seed failed: ${error.message}` });
      return;
    }

    console.log(`✅ Seeded ${data.length} products`);
    res.status(201).json({ message: `Seeded ${data.length} products`, count: data.length, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

// ============================================================================
// SEED SERVICE PROVIDERS
// ============================================================================

router.post('/providers', async (req: Request, res: Response) => {
  try {
    const providers = req.body;

    if (!Array.isArray(providers) || providers.length === 0) {
      res.status(400).json({ error: 'Request body must be a non-empty array of providers' });
      return;
    }

    // Map frontend service format to DB format (without services and pricing JSONB)
    const dbProviders = providers.map((s: ServiceSeedData) => ({
      name: s.name,
      category: s.category, // matches DB CHECK constraint
      address: s.address || '',
      phone: s.phone || '',
      email: s.email || '',
      description: s.description || '',
      image: s.image || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
      open_time: s.openTime || s.open_time || '9:00 AM',
      close_time: s.closeTime || s.close_time || '6:00 PM',
      price_range: s.priceRange || s.price_range || '',
      rating: s.rating || 4.5,
      review_count: s.reviewCount || s.review_count || 0,
      is_active: true,
    }));

    const { data, error } = await supabaseAdmin
      .from('service_providers')
      .insert(dbProviders)
      .select();

    if (error) {
      res.status(400).json({ error: `Seed failed: ${error.message}` });
      return;
    }

    // Insert services into separate table
    const providerServicesData: Array<{ provider_id: string; service_name: string }> = [];
    providers.forEach((s: ServiceSeedData, index: number) => {
      if (Array.isArray(s.services) && s.services.length > 0 && data[index]) {
        s.services.forEach((serviceName: string) => {
          providerServicesData.push({
            provider_id: data[index].id,
            service_name: serviceName,
          });
        });
      }
    });

    if (providerServicesData.length > 0) {
      const { error: servicesError } = await supabaseAdmin
        .from('provider_services')
        .insert(providerServicesData);
      
      if (servicesError) {
        console.warn(`⚠️ Failed to insert some provider services: ${servicesError.message}`);
      } else {
        console.log(`✅ Inserted ${providerServicesData.length} provider services`);
      }
    }

    // Insert pricing into separate table
    const pricingData: Array<{ provider_id: string; name: string; price: number; description?: string }> = [];
    providers.forEach((s: ServiceSeedData, index: number) => {
      if (Array.isArray(s.pricing) && s.pricing.length > 0 && data[index]) {
        s.pricing.forEach((priceItem) => {
          if (priceItem.name && priceItem.price) {
            pricingData.push({
              provider_id: data[index].id,
              name: priceItem.name,
              price: priceItem.price,
              description: priceItem.description || '',
            });
          }
        });
      }
    });

    if (pricingData.length > 0) {
      const { error: pricingError } = await supabaseAdmin
        .from('service_pricing')
        .insert(pricingData);
      
      if (pricingError) {
        console.warn(`⚠️ Failed to insert some pricing data: ${pricingError.message}`);
      } else {
        console.log(`✅ Inserted ${pricingData.length} pricing entries`);
      }
    }

    console.log(`✅ Seeded ${data.length} service providers`);
    res.status(201).json({ message: `Seeded ${data.length} providers`, count: data.length, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

// ============================================================================
// SEED NGOs
// ============================================================================

router.post('/ngos', async (req: Request, res: Response) => {
  try {
    const ngos = req.body;

    if (!Array.isArray(ngos) || ngos.length === 0) {
      res.status(400).json({ error: 'Request body must be a non-empty array of NGOs' });
      return;
    }

    const dbNgos = ngos.map((n: NGOSeedData) => ({
      name: n.name,
      description: n.description || '',
      address: n.location || n.address || '',
      city: n.location || n.city || '',
      state: n.state || '',
      phone: n.contact || n.phone || '',
      email: n.email || '',
      website: n.website || '',
      image_url: n.image || n.image_url || '',
      is_active: true,
      is_verified: true,
    }));

    const { data, error } = await supabaseAdmin
      .from('ngo')
      .insert(dbNgos)
      .select();

    if (error) {
      res.status(400).json({ error: `Seed failed: ${error.message}` });
      return;
    }

    console.log(`✅ Seeded ${data.length} NGOs`);
    res.status(201).json({ message: `Seeded ${data.length} NGOs`, count: data.length, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

// ============================================================================
// CHECK SEED STATUS - Returns counts for each table
// ============================================================================

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const [products, providers, ngos] = await Promise.all([
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('service_providers').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('ngo').select('id', { count: 'exact', head: true }),
    ]);

    res.json({
      products: products.count || 0,
      providers: providers.count || 0,
      ngos: ngos.count || 0,
      seeded: (products.count || 0) > 0 && (providers.count || 0) > 0,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

export default router;
