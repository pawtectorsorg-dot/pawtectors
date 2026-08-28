import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { bookingService } from '../utils/services.js';

interface BookingQuery {
  providerId?: string;
  customerId?: string;
}

interface BookingParams {
  id: string;
}

interface CreateBookingBody {
  providerId: string;
  petName: string;
  petType: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
  specialRequirements?: string;
  additionalInformation?: string;
  amount: number;
}

interface UpdateBookingBody {
  status?: string;
}

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { providerId, customerId } = req.query as BookingQuery;
    const { data, error } = await bookingService.getAll(
      providerId as string,
      customerId as string
    );

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Format the response to include joined data from service_providers and profiles
    type BookingWithRelations = {
      service_providers?: { name?: string | null; category?: string | null } | null;
      profiles?: { full_name?: string | null; email?: string | null; phone?: string | null } | null;
      owner_name?: string;
      owner_email?: string;
      owner_phone?: string;
    };

    const formattedData = data?.map((booking: BookingWithRelations) => ({
      ...booking,
      provider_name: booking.service_providers?.name,
      provider_category: booking.service_providers?.category,
      customer_name: booking.profiles?.full_name || booking.owner_name,
      customer_email: booking.profiles?.email || booking.owner_email,
      customer_phone: booking.profiles?.phone || booking.owner_phone,
    }));

    res.json(formattedData || data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as BookingParams;
    const { data, error } = await bookingService.getById(id);

    if (error || !data) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      providerId,
      petName,
      petType,
      ownerName,
      ownerEmail,
      ownerPhone,
      bookingDate,
      bookingTime,
      notes,
      specialRequirements,
      additionalInformation,
      amount,
    } = req.body as CreateBookingBody;

    if (!providerId || !bookingDate || !bookingTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const extraNotes = notes || specialRequirements || additionalInformation || '';

    const { data, error } = await bookingService.create({
      provider_id: providerId,
      profile_id: req.user?.id,
      pet_name: petName,
      pet_type: petType,
      owner_name: ownerName,
      owner_email: ownerEmail,
      owner_phone: ownerPhone,
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes: extraNotes,
      special_requirements: extraNotes,
      additional_information: extraNotes,
      amount,
      status: 'pending',
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

export const updateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as BookingParams;
    const { data, error } = await bookingService.update(id, req.body as UpdateBookingBody);

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
