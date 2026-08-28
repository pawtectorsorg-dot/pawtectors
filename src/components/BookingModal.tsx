import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, User, Mail, Phone, PawPrint, IndianRupee, CheckCircle2, Loader2, Smartphone, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { PetService } from '@/types/pet-services';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { bookingsApi, notificationsApi, petTypesApi, petsApi, type PetRow } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface BookingModalProps {
  service: PetService | null;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'services' | 'availability' | 'details';

const allTimeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
];

const fallbackPetTypes = ['Dog', 'Cat'];

function isValidIndianPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(digitsOnly);
}

// Service options for different categories
const groomingServiceOptions = [
  { id: 'bath', name: 'Bath & Brush', description: 'Complete bath with shampoo and brushing', price: 400 },
  { id: 'full_grooming', name: 'Full Grooming Package', description: 'Bath, haircut, nail trim, ear cleaning', price: 800 },
  { id: 'haircut', name: 'Haircut & Styling', description: 'Professional haircut and styling', price: 400 },
  { id: 'nail_trim', name: 'Nail Trimming', description: 'Safe and gentle nail trimming', price: 150 },
  { id: 'ear_cleaning', name: 'Ear Cleaning', description: 'Thorough ear cleaning service', price: 200 },
  { id: 'teeth_brushing', name: 'Teeth Brushing', description: 'Dental hygiene care', price: 250 },
  { id: 'deshedding', name: 'De-shedding Treatment', description: 'Reduce shedding with specialized treatment', price: 800 },
  { id: 'flea_treatment', name: 'Flea & Tick Treatment', description: 'Protection against parasites', price: 500 },
];

const boardingServiceOptions = [
  { id: 'daycare', name: 'Day Care', description: 'Supervised daytime care with playtime', price: 400 },
  { id: 'overnight', name: 'Overnight Boarding', description: 'Comfortable overnight stay', price: 800 },
  { id: 'weekly', name: 'Weekly Boarding', description: '7 days of care and accommodation', price: 5000 },
  { id: 'monthly', name: 'Monthly Boarding', description: 'Extended stay package (30 days)', price: 18000 },
  { id: 'playtime', name: 'Playtime Session', description: 'Extra 30-min play session', price: 200 },
  { id: 'grooming_addon', name: 'Grooming Add-on', description: 'Include grooming during stay', price: 600 },
];



const BookingModal = ({ service, isOpen, onClose }: BookingModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<BookingStep>('services');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [petTypes, setPetTypes] = useState<string[]>(fallbackPetTypes);
  const [userPets, setUserPets] = useState<PetRow[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('manual');

  useEffect(() => {
    petTypesApi.getAll()
      .then((types) => {
        const allowed = ['Dog', 'Cat', 'dog', 'cat'];
        const filtered = (types.length > 0 ? types : fallbackPetTypes).map((t) => t.name || t).filter((t) => allowed.includes(t) || allowed.includes(t.toLowerCase()) || allowed.includes(t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()));
        const next = filtered.length > 0 ? filtered : fallbackPetTypes;
        setPetTypes(next);
      })
      .catch((err) => {
        console.error('Failed to load pet types, using fallback:', err);
        setPetTypes(fallbackPetTypes);
      });
  }, []);

  useEffect(() => {
    if (user && isOpen) {
      petsApi.getMyPets()
        .then((data) => setUserPets(data))
        .catch((err) => console.error('Failed to load user pets:', err));
    }
  }, [user, isOpen]);

  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    petBreed: '',
    petAge: '',
    ownerName: '',
    email: '',
    phone: '',
    notes: '',
    paymentMethod: '',
  });

  // Auto-fill owner details when user details are available and step is 'details'
  useEffect(() => {
    if (user && step === 'details') {
      setFormData(prev => ({
        ...prev,
        ownerName: prev.ownerName || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.mobile_number || '',
      }));
    }
  }, [user, step]);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const resetModal = () => {
    setStep('services');
    setSelectedServices([]);
    setSelectedDate(undefined);
    setSelectedTime('');
    setTermsAccepted(false);
    setAvailableSlots([]);
    setSelectedPetId('manual');
    setFormData({
      petName: '',
      petType: '',
      petBreed: '',
      petAge: '',
      ownerName: '',
      email: '',
      phone: '',
      notes: '',
      paymentMethod: '',
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!service) return null;

  const isClinic = service.category === 'clinic';
  const isGrooming = service.category === 'grooming';
  const isBoarding = service.category === 'boarding';
  const isTraining = service.category === 'training';
  
  const getTitle = () => {
    if (step === 'services') return isGrooming ? 'Select Grooming Services' : isBoarding ? 'Select Boarding Type' : 'Check Availability';
    if (step === 'availability') return 'Check Availability';
    return isClinic ? 'Book Clinic Appointment' : isGrooming ? 'Book Grooming Session' : isTraining ? 'Book Training Session' : 'Book Boarding';
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleProceedToAvailability = () => {
    if (selectedServices.length > 0 || isClinic || isTraining) {
      setStep('availability');
    }
  };

  const getServiceOptions = () => {
    if (isGrooming) return groomingServiceOptions;
    if (isBoarding) return boardingServiceOptions;
    return [];
  };

  const getSelectedServiceNames = () => {
    const options = getServiceOptions();
    return selectedServices.map(id => options.find(opt => opt.id === id)?.name || id);
  };


// after
const handleDateSelect = async (date: Date | undefined) => {
  setSelectedDate(date);
  setSelectedTime('');

  if (!date) {
    setAvailableSlots([]);
    return;
  }

  setIsCheckingAvailability(true);
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingBookings = await bookingsApi.getAll({ provider_id: service.id });
    const bookingsOnDate = (existingBookings as unknown as Array<Record<string, unknown>>).filter(
      (b) => b.booking_date === dateStr && b.status !== 'cancelled'
    );

    // How many different customers are allowed to book the same slot,
    // as configured by the provider (defaults to 1 — one booking per slot).
    const capacity = service.slotCapacity || 1;

    const countByTime: Record<string, number> = {};
    bookingsOnDate.forEach((b) => {
      const time = b.booking_time as string;
      if (time) countByTime[time] = (countByTime[time] || 0) + 1;
    });

    const slots = allTimeSlots.filter((time) => (countByTime[time] || 0) < capacity);
    setAvailableSlots(slots);
  } catch (error) {
    console.error('Failed to check slot availability:', error);
    // Don't block booking entirely on a network hiccup — fall back to
    // showing every slot; the backend still enforces capacity on submit.
    setAvailableSlots(allTimeSlots);
  } finally {
    setIsCheckingAvailability(false);
  }
};

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleProceedToDetails = () => {
    if (selectedDate && selectedTime) {
      setStep('details');
    }
  };

  const handleBackToAvailability = () => {
    setStep('availability');
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidIndianPhone(formData.phone)) {
      toast({
        variant: 'destructive',
        title: 'Invalid phone number',
        description: 'Please enter a valid 10-digit Indian mobile number (e.g., 98765 43210).',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Guard against the same customer double-booking the same slot, and
      // against booking a slot that's already at the provider's capacity.
      // The backend enforces both too, but checking here first avoids a
      // round-trip and gives immediate feedback.
      try {
        const existingBookings = await bookingsApi.getAll({ provider_id: service.id });
        const bookingDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
        const myEmail = formData.email.trim().toLowerCase();

        const bookingsOnDate = (existingBookings as unknown as Array<Record<string, unknown>>).filter(
          (b) =>
            b.booking_date === bookingDateStr &&
            b.status !== 'cancelled' &&
            typeof b.owner_email === 'string' &&
            b.owner_email.toLowerCase() === myEmail
        );

        // Same customer, same provider, already has a booking that day —
        // regardless of time. They can book a different service today, or
        // come back tomorrow for this one.
        if (bookingsOnDate.length > 0) {
          toast({
            variant: 'destructive',
            title: 'Already booked with this provider today',
            description: `You already have a booking here at ${bookingsOnDate[0].booking_time}. Try a different service, or come back tomorrow for this one.`,
          });
          setIsSubmitting(false);
          return;
        }

        const bookingsInSlot = (existingBookings as unknown as Array<Record<string, unknown>>).filter(
          (b) => b.booking_date === bookingDateStr && b.booking_time === selectedTime && b.status !== 'cancelled'
        );

        const capacity = service.slotCapacity || 1;
        if (bookingsInSlot.length >= capacity) {
          toast({
            variant: 'destructive',
            title: 'Slot full',
            description: 'This time slot just filled up. Please choose a different time.',
          });
          setIsSubmitting(false);
          return;
        }
      } catch (checkErr) {
        console.error('Failed to check existing bookings:', checkErr);
      }

      // Calculate total amount from selected services
      const options = getServiceOptions();
      const totalAmount = selectedServices.reduce((sum, id) => {
        const option = options.find(opt => opt.id === id);
        return sum + (option?.price || 0);
      }, 0) || (service.pricing?.[0]?.price || 500);

      // Create booking object
      const combinedNotes = [
        formData.petBreed ? `Breed: ${formData.petBreed}` : '',
        formData.petAge ? `Age: ${formData.petAge}` : '',
        formData.notes ? `Additional information: ${formData.notes}` : '',
      ].filter(Boolean).join(' | ');

      const localBooking = {
        id: crypto.randomUUID(),
        serviceName: service.name,
        serviceCategory: service.category,
        selectedServices: getSelectedServiceNames(),
        petName: formData.petName,
        petType: formData.petType,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        time: selectedTime,
        notes: combinedNotes,
        paymentMethod: formData.paymentMethod,
        amount: totalAmount,
        createdAt: new Date().toISOString(),
      };

      // Save to backend API
      try {
        await bookingsApi.create({
          provider_id: service.id,
          service_category: service.category,
          service_name: service.name,
          pet_name: formData.petName,
          pet_type: formData.petType,
          pet_breed: formData.petBreed,
          pet_age: formData.petAge,
          owner_name: formData.ownerName,
          owner_email: formData.email,
          owner_phone: formData.phone,
          booking_date: localBooking.date,
          booking_time: selectedTime,
          notes: combinedNotes,
          special_requirements: combinedNotes,
          additional_information: combinedNotes,
          amount: totalAmount,
          status: 'pending',
          terms_accepted_at: new Date().toISOString(),
        });
        console.log('✅ Booking saved via backend API');
      } catch (dbErr) {
        console.error('Failed to save booking via backend API:', dbErr);
        toast({
          variant: 'destructive',
          title: 'Booking Failed',
          description: dbErr instanceof Error ? dbErr.message : 'Something went wrong. Please try again.',
        });
        setIsSubmitting(false);
        return;
      }

      // Also save to localStorage as backup
      const existingBookingsLocal = JSON.parse(localStorage.getItem('pawtectors_bookings') || '[]');
      existingBookingsLocal.push(localBooking);
      localStorage.setItem('pawtectors_bookings', JSON.stringify(existingBookingsLocal));

      // Send notification (best-effort, don't block on failure)
      try {
        await notificationsApi.create({
          provider_id: service.id,
          title: 'New booking received',
          message: `${formData.ownerName} booked ${formData.petName} for ${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} at ${selectedTime}.`,
          type: 'booking',
          data: {
            booking_id: localBooking.id,
            pet_name: formData.petName,
            owner_name: formData.ownerName,
            booking_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
            booking_time: selectedTime,
            amount: totalAmount,
            payment_method: formData.paymentMethod,
          },
        });
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't fail the booking if notification fails
      }

      toast({
        title: "Booking Confirmed! 🎉",
        description: `Your ${isClinic ? 'appointment' : isGrooming ? 'grooming session' : isTraining ? 'training session' : 'boarding'} at ${service.name} has been booked for ${selectedDate ? format(selectedDate, 'PPP') : ''} at ${selectedTime}.`,
      });

      handleClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pb-2">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{getTitle()}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {service.name} • {service.address}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Service Selection (for Grooming & Boarding) */}
        {step === 'services' && (isGrooming || isBoarding) && (
          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                {isGrooming ? 'What services would you like?' : 'What type of boarding do you need?'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isGrooming ? 'Select one or more grooming services' : 'Select your preferred boarding option'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getServiceOptions().map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleService(option.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                    selectedServices.includes(option.id)
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{option.name}</h4>
                        <span className="text-sm font-bold text-primary flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3" />
                          {option.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </div>
                    {selectedServices.includes(option.id) && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Services Summary */}
            {selectedServices.length > 0 && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Selected Services</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getSelectedServiceNames().map((name, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Reference */}
            {service.pricing && service.pricing.length > 0 && (
              <div className="p-4 bg-muted rounded-xl">
                <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  Pricing Reference
                </h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2 pr-4">
                    {service.pricing.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-semibold text-primary flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 pb-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="hero" 
                className="flex-1" 
                disabled={selectedServices.length === 0}
                onClick={handleProceedToAvailability}
              >
                Check Availability
              </Button>
            </div>
          </div>
        )}

        {/* Step 1 for Clinic/Training: Direct to Availability */}
        {step === 'services' && (isClinic || isTraining) && (
          <div className="space-y-6 mt-4">
            {isClinic && (
              <div className="p-4 bg-muted rounded-xl">
                <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  Consultation Fee
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">General Consultation</span>
                  <span className="text-lg font-bold text-primary flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {service.pricing?.find(p => p.name.toLowerCase().includes('consult'))?.price?.toLocaleString('en-IN') || '500'}
                  </span>
                </div>
              </div>
            )}

            {isTraining && service.pricing && service.pricing.length > 0 && (
              <div className="p-4 bg-muted rounded-xl">
                <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  Training Programs & Rates
                </h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2 pr-4">
                    {service.pricing.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-semibold text-primary flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="flex gap-3 pt-4 pb-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="hero" 
                className="flex-1" 
                onClick={handleProceedToAvailability}
              >
                Check Availability
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Availability Check */}
        {step === 'availability' && (
          <div className="space-y-6 mt-4">
            {/* Selected Services Summary for Grooming/Boarding */}
            {(isGrooming || isBoarding) && selectedServices.length > 0 && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-semibold text-sm">Selected Services</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedServiceNames().map((name, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStep('services')}
                    className="text-primary hover:text-primary"
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Select Date
              </h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className={cn("rounded-xl border bg-card p-3 pointer-events-auto")}
                />
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Available Time Slots for {format(selectedDate, 'MMM d, yyyy')}
                </h3>
                
                {isCheckingAvailability ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Checking availability...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "rounded-lg transition-all",
                          selectedTime === time && "ring-2 ring-primary ring-offset-2"
                        )}
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No available slots for this date. Please select another date.</p>
                  </div>
                )}
              </div>
            )}

            {/* Selected Summary */}
            {selectedDate && selectedTime && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Selected Slot</span>
                </div>
                <p className="text-sm text-foreground">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')} at <strong>{selectedTime}</strong>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 pb-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={(isGrooming || isBoarding) ? () => setStep('services') : handleClose}
              >
                {(isGrooming || isBoarding) ? 'Back' : 'Cancel'}
              </Button>
              <Button 
                type="button" 
                variant="hero" 
                className="flex-1" 
                disabled={!selectedDate || !selectedTime}
                onClick={handleProceedToDetails}
              >
                Continue to Booking
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Booking Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Booking Summary */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 space-y-3">
              {/* Selected Services for Grooming/Boarding */}
              {(isGrooming || isBoarding) && selectedServices.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold text-sm">Selected Services</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getSelectedServiceNames().map((name, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Slot */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-semibold text-sm">Appointment Slot</span>
                  </div>
                  <p className="text-sm text-foreground">
                    {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')} at <strong>{selectedTime}</strong>
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToAvailability}
                  className="text-primary hover:text-primary"
                >
                  Change
                </Button>
              </div>
            </div>

            {/* Pet Information */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Pet Information
              </h3>

              {userPets.length > 0 && (
                <div className="space-y-2 mb-4 bg-muted/20 p-4 rounded-xl border border-border/60">
                  <Label htmlFor="petSelect" className="text-foreground font-semibold flex items-center gap-1.5">
                    <PawPrint className="w-4.5 h-4.5 text-primary" />
                    Select from Your Saved Pets
                  </Label>
                  <Select
                    value={selectedPetId}
                    onValueChange={(value) => {
                      setSelectedPetId(value);
                      if (value === 'manual') {
                        setFormData(prev => ({
                          ...prev,
                          petName: '',
                          petType: '',
                          petBreed: '',
                          petAge: '',
                        }));
                      } else {
                        const pet = userPets.find(p => p.id === value);
                        if (pet) {
                          setFormData(prev => ({
                            ...prev,
                            petName: pet.name || '',
                            petType: pet.type || '',
                            petBreed: pet.breed || '',
                            petAge: pet.age_months ? `${Math.floor(pet.age_months / 12)} years, ${pet.age_months % 12} months` : '',
                          }));
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="petSelect" className="rounded-xl bg-card">
                      <SelectValue placeholder="Choose a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Enter details manually</SelectItem>
                      {userPets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.type.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petName" className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-primary" />
                    Pet Name
                  </Label>
                  <Input
                    id="petName"
                    placeholder="e.g., Max"
                    value={formData.petName}
                    onChange={(e) => handleChange('petName', e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petType">Pet Type</Label>
                  <Select
                    value={formData.petType}
                    onValueChange={(value) => handleChange('petType', value)}
                    required
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {petTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petBreed">Breed (Optional)</Label>
                  <Input
                    id="petBreed"
                    placeholder="e.g., Labrador"
                    value={formData.petBreed}
                    onChange={(e) => handleChange('petBreed', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petAge">Age (Optional)</Label>
                  <Input
                    id="petAge"
                    placeholder="e.g., 2 years"
                    value={formData.petAge}
                    onChange={(e) => handleChange('petAge', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Owner Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="ownerName"
                    placeholder="Your full name"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765-43210"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements or concerns..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('paymentMethod', 'upi')}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
                    formData.paymentMethod === 'upi'
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <Smartphone className={cn(
                    "w-6 h-6 mx-auto mb-2",
                    formData.paymentMethod === 'upi' ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    formData.paymentMethod === 'upi' ? "text-primary" : "text-foreground"
                  )}>UPI</span>
                  <p className="text-xs text-muted-foreground mt-1">GPay, PhonePe, Paytm</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('paymentMethod', 'netbanking')}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
                    formData.paymentMethod === 'netbanking'
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <Globe className={cn(
                    "w-6 h-6 mx-auto mb-2",
                    formData.paymentMethod === 'netbanking' ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    formData.paymentMethod === 'netbanking' ? "text-primary" : "text-foreground"
                  )}>Net Banking</span>
                  <p className="text-xs text-muted-foreground mt-1">All major banks</p>
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Payment details will be shared after booking confirmation
              </p>
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
              <Checkbox
                id="termsAccepted"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="termsAccepted" className="text-sm font-normal leading-snug cursor-pointer">
                I agree to the{' '}
                <Link to="/terms-of-service" target="_blank" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                and consent to Pawtectors sharing my details with the provider to complete this booking.
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 pb-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleBackToAvailability}>
                Back
              </Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={isSubmitting || !formData.paymentMethod || !termsAccepted}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
