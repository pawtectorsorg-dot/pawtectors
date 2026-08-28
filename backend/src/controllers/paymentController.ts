import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { paymentService } from '../utils/services.js';
import { getRazorpayInstance } from '../config/razorpay.js';

interface PaymentQuery {
  bookingId?: string;
  orderId?: string;
}

interface CreatePaymentBody {
  amount: number;
  bookingId?: string;
  orderId?: string;
}

interface VerifyPaymentBody {
  paymentId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, orderId } = req.query as PaymentQuery;
    const { data, error } = await paymentService.getAll(
      bookingId as string,
      orderId as string
    );

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

export const createPaymentOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, bookingId, orderId } = req.body as CreatePaymentBody;

    if (!amount) {
      res.status(400).json({ error: 'Amount is required' });
      return;
    }

    const razorpay = getRazorpayInstance();
    const paymentOrder = await razorpay.orders.create({
      amount: amount * 100, // Paise conversion
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    const { data, error } = await paymentService.create({
      booking_id: bookingId,
      order_id: orderId,
      razorpay_order_id: paymentOrder.id,
      amount,
      currency: 'INR',
      status: 'pending',
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: ((data as any) || [])[0]?.id || '',
      razorpayOrderId: paymentOrder.id,
      amount,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId, razorpayPaymentId, razorpaySignature } = req.body as VerifyPaymentBody;

    const { data: payment, error } = await paymentService.getById(paymentId);

    if (error || !payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const { data: updated, error: updateError } = await paymentService.update(paymentId, {
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      status: 'paid',
    });

    if (updateError) {
      res.status(400).json({ error: updateError.message });
      return;
    }

    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
