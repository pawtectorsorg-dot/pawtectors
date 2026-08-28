-- ============================================================================
-- CART TABLE (per-user cart stored in database)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- FIX ORDERS: reference profiles(id) instead of auth.users(id)
-- ============================================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- EXTRA COLUMNS ON ORDERS for richer order tracking
-- ============================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS display_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_updates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';

-- ============================================================================
-- EXTRA COLUMN ON ORDER_ITEMS for display name
-- ============================================================================

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;

-- ADD ADMIN_ID TO PRODUCTS TABLE FOR OWNERSHIP
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ENSURE USER_ID EXISTS ON SERVICE_PROVIDERS
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- SIMPLE RLS FOR INVESTOR DEMO (No JWT, No complex auth)
-- ============================================================================

-- CART TABLE: Simple user-based access
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cart" ON public.cart
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ORDERS TABLE: Simple user-based access  
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own orders" ON public.orders
  FOR ALL TO anon, authenticated  
  USING (true)
  WITH CHECK (true);

-- ORDER_ITEMS TABLE: Simple access through orders
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage order items" ON public.order_items
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- PRODUCTS TABLE: Public read, controlled write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON public.products
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR INSERT, UPDATE, DELETE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- SERVICE_PROVIDERS TABLE: Public read, user write
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read service providers" ON public.service_providers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users can manage their services" ON public.service_providers
  FOR INSERT, UPDATE, DELETE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.cart TO anon, authenticated;
GRANT ALL ON public.orders TO anon, authenticated;  
GRANT ALL ON public.order_items TO anon, authenticated;
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.service_providers TO anon, authenticated;

-- ============================================================================
-- DEMO-FRIENDLY NOTES:
-- 
-- Frontend Query Pattern:
-- 1. For user-specific data (cart, orders), always include user_id in queries:
--    const { data } = await supabase.from('cart').select('*').eq('user_id', currentUserId);
--    const { data } = await supabase.from('cart').insert({user_id: currentUserId, product_id, quantity});
--
-- 2. For public data (products, services), no user_id needed:
--    const { data } = await supabase.from('products').select('*');
--
-- Upgrade Path to Secure Auth:
-- 1. Replace USING (true) with USING (user_id = auth.uid()) 
-- 2. Replace WITH CHECK (true) with WITH CHECK (user_id = auth.uid())
-- 3. Add Supabase Auth to frontend
-- 4. Remove explicit user_id from frontend queries (auth.uid() will handle it)
-- ============================================================================
