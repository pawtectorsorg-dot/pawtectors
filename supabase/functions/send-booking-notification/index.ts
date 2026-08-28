import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BookingNotificationRequest {
  booking_id: string;
  provider_id: string;
  notification_type: 'new_booking' | 'payment_received' | 'booking_cancelled' | 'booking_confirmed';
  booking_details: {
    pet_name: string;
    owner_name: string;
    booking_date: string;
    booking_time: string;
    amount: number;
    payment_method?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { booking_id, provider_id, notification_type, booking_details }: BookingNotificationRequest = await req.json();

    // Validate required fields
    if (!booking_id || !provider_id || !notification_type || !booking_details) {
      throw new Error('Missing required fields');
    }

    const notifications = [];

    // Create notification title and message based on type
    let title = '';
    let message = '';

    switch (notification_type) {
      case 'new_booking':
        title = '🎉 New Booking Received!';
        message = `${booking_details.owner_name} has booked an appointment for ${booking_details.pet_name} on ${booking_details.booking_date} at ${booking_details.booking_time}. Amount: ₹${booking_details.amount.toLocaleString('en-IN')}. Payment method: ${booking_details.payment_method || 'Not specified'}`;
        break;
      case 'payment_received':
        title = '💰 Payment Received!';
        message = `Payment of ₹${booking_details.amount.toLocaleString('en-IN')} received for ${booking_details.pet_name}'s booking on ${booking_details.booking_date}.`;
        break;
      case 'booking_confirmed':
        title = '✅ Booking Confirmed';
        message = `Booking for ${booking_details.pet_name} on ${booking_details.booking_date} at ${booking_details.booking_time} has been confirmed.`;
        break;
      case 'booking_cancelled':
        title = '❌ Booking Cancelled';
        message = `Booking for ${booking_details.pet_name} on ${booking_details.booking_date} at ${booking_details.booking_time} has been cancelled.`;
        break;
    }

    // Create notification for admin
    notifications.push({
      recipient_type: 'admin',
      recipient_id: null,
      notification_type,
      title,
      message,
      booking_id,
    });

    // Create notification for provider
    notifications.push({
      recipient_type: 'provider',
      recipient_id: provider_id,
      notification_type,
      title,
      message,
      booking_id,
    });

    // Insert notifications
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Error inserting notifications:', error);
      throw error;
    }

    console.log(`Notifications sent for booking ${booking_id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in send-booking-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
