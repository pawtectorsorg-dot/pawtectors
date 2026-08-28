import { useState, useEffect } from 'react';
import { Product } from '@/types/products';
import { initialProducts } from '@/data/products';
import { productsApi, seedApi, type ProductRow } from '@/lib/api';

function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    category: row.category as Product['category'],
    image: row.image ?? '',
    stock: row.stock ?? 0,
    brand: row.brand ?? '',
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
  };
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromDB, setIsFromDB] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch from Express backend
      const data = await productsApi.getAll();

      // Backend is reachable — always use it for CRUD
      setIsFromDB(true);

      if (data && data.length > 0) {
        const dbProducts: Product[] = data.map(mapRowToProduct);
        setProducts(dbProducts);
        console.log(`✅ Loaded ${dbProducts.length} products from backend API`);
      } else {
        // DB is empty — auto-seed with initial data
        console.log('🌱 Database empty, seeding products via backend...');
        try {
          await seedApi.seedProducts(initialProducts);
          // Re-fetch after seeding
          const seededData = await productsApi.getAll();
          const seededProducts: Product[] = (seededData ?? []).map(mapRowToProduct);
          setProducts(seededProducts);
          console.log(`✅ Seeded and loaded ${seededProducts.length} products`);
        } catch (seedErr) {
          console.error('Seed failed, showing empty state:', seedErr);
          setProducts([]);
        }
      }
    } catch (err) {
      console.error('Backend API unreachable, using static data:', err);
      setProducts(initialProducts);
      setIsFromDB(false);
    }
    setIsLoading(false);
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (isFromDB) {
      try {
        const data = await productsApi.create({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          image: product.image,
          stock: product.stock,
          brand: product.brand,
          rating: product.rating || 0,
          review_count: product.reviewCount || 0,
        });
        console.log('✅ Product added via backend API');
        await fetchProducts();
        return data ? mapRowToProduct(data) : undefined;
      } catch (err) {
        console.error('Backend API insert failed:', err);
      }
    }
    // Fallback only when backend is down
    const newProduct: Product = { ...product, id: Date.now().toString() };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (isFromDB) {
      try {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.image) dbUpdates.image = updates.image;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.brand) dbUpdates.brand = updates.brand;
        if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
        if (updates.reviewCount !== undefined) dbUpdates.review_count = updates.reviewCount;

        await productsApi.update(id, dbUpdates);
        console.log('✅ Product updated via backend API');
        await fetchProducts();
        return;
      } catch (err) {
        console.error('Backend API update failed:', err);
      }
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = async (id: string) => {
    if (isFromDB) {
      try {
        await productsApi.delete(id);
        console.log('✅ Product deleted via backend API');
        await fetchProducts();
        return;
      } catch (err) {
        console.error('Backend API delete failed:', err);
      }
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return { products, isLoading, isFromDB, addProduct, updateProduct, deleteProduct };
};
