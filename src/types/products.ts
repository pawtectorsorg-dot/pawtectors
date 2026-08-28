export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  stock: number;
  brand: string;
  rating?: number;
  reviewCount?: number;
}

export type ProductCategory = 'food' | 'toys' | 'accessories' | 'grooming' | 'health' | 'clothing' | 'medicine';

export const productCategories = [
  { id: 'all', label: 'All Products' },
  { id: 'food', label: 'Pet Food' },
  { id: 'medicine', label: 'Medicine' },
  { id: 'toys', label: 'Toys' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'grooming', label: 'Grooming' },
  { id: 'health', label: 'Health' },
  { id: 'clothing', label: 'Clothing' },
] as const;

export interface CartItem {
  product: Product;
  quantity: number;
}
