import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { productService } from '../utils/services.js';

interface ProductQuery {
  category?: string;
}

interface ProductParams {
  id: string;
}

interface CreateProductBody {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  image_url?: string;
  stock?: number;
  brand?: string;
}

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query as ProductQuery;
    const { data, error } = await productService.getAll(category);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as ProductParams;
    const { data, error } = await productService.getById(id);

    if (error || !data) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, image, image_url, stock, brand } = req.body as CreateProductBody;

    if (!name || !price || !category) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const { data, error } = await productService.create({
      name,
      description,
      price,
      category,
      image,
      stock: stock || 0,
      brand,
      is_active: true,
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as ProductParams;
    const { data, error } = await productService.update(id, req.body as Partial<CreateProductBody>);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as ProductParams;
    const { data, error } = await productService.delete(id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
