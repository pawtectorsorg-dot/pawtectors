import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { orderService } from '../utils/services.js';

interface OrderQuery {
  customerId?: string;
}

interface OrderParams {
  id: string;
}

interface CreateOrderBody {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name?: string;
    phone?: string;
    address?: string;
    pincode?: string;
  };
  totalAmount: number;
  status?: string;
}

interface UpdateOrderBody {
  status?: string;
  paymentStatus?: string;
}

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId } = req.query as OrderQuery;
    const { data, error } = await orderService.getAll(customerId as string);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Format the response to include order items with product names
    type OrderWithRelations = {
      order_items?: Array<{
        products?: { name?: string | null } | null;
      }>;
    };

    const formattedData = data?.map((order: OrderWithRelations) => ({
      ...order,
      order_items: order.order_items?.map((item) => ({
        ...item,
        product_name: item.products?.name || 'Unknown Product'
      }))
    }));

    res.json(formattedData || data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as OrderParams;
    const { data, error } = await orderService.getById(id);

    if (error || !data) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const { data: items } = await orderService.getOrderItems(id);

    res.json({ ...data, items });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, totalAmount, status = 'pending' } = req.body as CreateOrderBody;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order items required' });
      return;
    }

    const { data, error } = await orderService.create({
      profile_id: req.user?.id,
      shipping_address: shippingAddress,
      total_amount: totalAmount,
      status,
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

export const updateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as OrderParams;
    const { data, error } = await orderService.update(id, req.body as UpdateOrderBody);

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
