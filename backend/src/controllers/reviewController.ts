import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { reviewService } from '../utils/services.js';

interface ReviewQuery {
  productId?: string;
  serviceProviderId?: string;
}

interface ReviewParams {
  id: string;
}

interface CreateReviewBody {
  productId?: string;
  serviceProviderId?: string;
  rating: number;
  comment?: string;
  orderId?: string;
  bookingId?: string;
}

interface UpdateReviewBody {
  rating?: number;
  comment?: string;
}

export const getReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, serviceProviderId } = req.query as ReviewQuery;
    const { data, error } = await reviewService.getAll(
      productId as string,
      serviceProviderId as string
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

export const getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as ReviewParams;
    const { data, error } = await reviewService.getById(id);

    if (error || !data) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, serviceProviderId, rating, comment, orderId, bookingId } = req.body as CreateReviewBody;

    if (!rating || (rating < 1 || rating > 5)) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const { data, error } = await reviewService.create({
      product_id: productId,
      service_provider_id: serviceProviderId,
      user_id: req.user?.id,
      rating,
      comment,
      order_id: orderId,
      booking_id: bookingId,
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

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as ReviewParams;
    const { data, error } = await reviewService.update(id, req.body as UpdateReviewBody);

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

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as ReviewParams;
    const { error } = await reviewService.delete(id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
