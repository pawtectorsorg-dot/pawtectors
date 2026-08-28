import { createContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Product, CartItem } from '@/types/products';
import { useAuth } from '@/hooks/useAuth';
import { cartApi } from '@/lib/api';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export { CartContext };

/** sessionStorage key scoped to the user — used as fallback when backend is unreachable. */
const getCartKey = (userId: string | undefined) =>
  userId ? `pawtectors_cart_${userId}` : null;

/** Map a DB products row → frontend Product type. */
interface DbProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  stock: number;
  brand: string | null;
  rating: number | null;
  review_count: number | null;
}

const mapDbProduct = (p: DbProductRow): Product => ({
  id: p.id,
  name: p.name,
  description: p.description ?? '',
  price: Number(p.price),
  category: p.category as Product['category'],
  image: p.image ?? '',
  stock: p.stock ?? 0,
  brand: p.brand ?? '',
  rating: p.rating ?? 0,
  reviewCount: p.review_count ?? 0,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  /** Whether backend is the active storage — flipped to false on first API error. */
  const useDb = useRef(true);

  // ── helpers: sessionStorage fallback ──────────────────────────────────────

  const saveToLocal = useCallback(
    (items: CartItem[]) => {
      const key = getCartKey(user?.id);
      if (key) sessionStorage.setItem(key, JSON.stringify(items));
    },
    [user?.id],
  );

  const loadFromLocal = useCallback((): CartItem[] => {
    const key = getCartKey(user?.id);
    if (!key) return [];
    try {
      return JSON.parse(sessionStorage.getItem(key) || '[]') as CartItem[];
    } catch {
      return [];
    }
  }, [user?.id]);

  // ── load cart when user changes ─────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) {
      setCart([]);
      return;
    }

    const load = async () => {
      try {
        const data = await cartApi.getAll();

        const items: CartItem[] = (data ?? [])
          .filter((row: Record<string, unknown>) => row.products !== null)
          .map((row: Record<string, unknown>) => ({
            product: mapDbProduct(row.products as unknown as DbProductRow),
            quantity: row.quantity as number,
          }));

        setCart(items);
        saveToLocal(items);
        useDb.current = true;
      } catch (err) {
        console.warn('Cart: backend unavailable, using sessionStorage', err);
        useDb.current = false;
        setCart(loadFromLocal());
      }
    };

    load();
  }, [user?.id, saveToLocal, loadFromLocal]);

  // ── backend helpers ─────────────────────────────────────────────────────

  const upsertCartRow = async (productId: string, quantity: number) => {
    if (!user?.id || !useDb.current) return;
    try {
      await cartApi.upsert(productId, quantity);
    } catch {
      useDb.current = false;
    }
  };

  const deleteCartRow = async (productId: string) => {
    if (!user?.id || !useDb.current) return;
    try {
      await cartApi.remove(productId);
    } catch {
      useDb.current = false;
    }
  };

  const deleteAllCartRows = async () => {
    if (!user?.id || !useDb.current) return;
    try {
      await cartApi.clear();
    } catch {
      useDb.current = false;
    }
  };

  // ── public API ──────────────────────────────────────────────────────────

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    const newQty = existing ? existing.quantity + 1 : 1;
    const newCart = existing
      ? cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item,
        )
      : [...cart, { product, quantity: 1 }];

    setCart(newCart);
    saveToLocal(newCart);
    upsertCartRow(product.id, newQty);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.product.id !== productId);
    setCart(newCart);
    saveToLocal(newCart);
    deleteCartRow(productId);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item,
    );
    setCart(newCart);
    saveToLocal(newCart);
    upsertCartRow(productId, quantity);
  };

  const clearCart = () => {
    setCart([]);
    const key = getCartKey(user?.id);
    if (key) sessionStorage.removeItem(key);
    deleteAllCartRows();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};
