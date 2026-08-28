import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, CheckCircle2, Truck, Gift, Banknote, MapPin, ArrowLeft, PartyPopper, Locate, Calendar, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getTodaysPetDay, getUpcomingPetDays, formatPetDayDate } from '@/data/pet-days';
import ReviewModal from './ReviewModal';
import { Order } from './OrderTracking';
import { ordersApi } from '@/lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'summary' | 'address';

const PaymentModal = ({ isOpen, onClose }: PaymentModalProps) => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('summary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'upi'>('card');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [petDayDiscount, setPetDayDiscount] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | undefined>();
  
  // Address form state
  const [pincode, setPincode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [addressInputType, setAddressInputType] = useState<'manual' | 'live'>('manual');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Get pet day offers
  const todaysPetDay = getTodaysPetDay();
  const upcomingPetDays = getUpcomingPetDays();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate delivery fee based on pincode (max ₹10)
  const calculateDeliveryFee = () => {
    if (totalPrice >= 999) return 0;
    if (!pincode) return 10;
    // Simple logic: first digit determines fee (1-10 rupees max)
    const firstDigit = parseInt(pincode.charAt(0)) || 5;
    return Math.min(firstDigit + 2, 10);
  };

  // COD fee (max ₹7)
  const calculateCodFee = () => {
    if (paymentMethod !== 'cod') return 0;
    if (totalPrice >= 1499) return 0; // Free COD for orders above ₹1499
    // Calculate based on pincode region (1-7 rupees)
    if (!pincode) return 7;
    const firstDigit = parseInt(pincode.charAt(0)) || 5;
    return Math.min(Math.ceil(firstDigit * 0.7) + 1, 7);
  };

  const deliveryFee = calculateDeliveryFee();
  const codFee = calculateCodFee();
  
  // Calculate discounts
  const couponDiscount = couponApplied ? totalPrice * 0.15 : 0;
  const petDayDiscountAmount = petDayDiscount && todaysPetDay ? totalPrice * (todaysPetDay.discount / 100) : 0;
  const totalDiscount = couponDiscount + petDayDiscountAmount;
  
  const gstPercentage = Number(localStorage.getItem('pawtectors_gst_fee') || 3);
  const gst = (totalPrice - totalDiscount) * (gstPercentage / 100);
  const platformFee = Number(localStorage.getItem('pawtectors_platform_fee') || 0);
  const finalTotal = totalPrice - totalDiscount + deliveryFee + codFee + gst + platformFee;

  const generateDeliveryDate = (pincodeValue: string) => {
    if (pincodeValue.length === 6) {
      // Calculate delivery date based on pincode
      const baseDays = 3;
      const firstDigit = parseInt(pincodeValue.charAt(0)) || 5;
      const additionalDays = Math.floor(firstDigit / 2);
      const totalDays = baseDays + additionalDays;
      
      const date = new Date();
      date.setDate(date.getDate() + totalDays);
      
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setDeliveryDate(date.toLocaleDateString('en-IN', options));
    } else {
      setDeliveryDate('');
    }
  };

  const handlePincodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPincode(numericValue);
    generateDeliveryDate(numericValue);
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setAddressInputType('live');
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            
            // Extract address components
            const houseNo = data.address?.house_number || '';
            const road = data.address?.road || '';
            const suburb = data.address?.suburb || data.address?.neighbourhood || '';
            const detectedCity = data.address?.city || data.address?.town || data.address?.village || '';
            const detectedState = data.address?.state || '';
            const postcode = data.address?.postcode || '';

            const detectedLandmark = [houseNo, road, suburb].filter(Boolean).join(', ');

            setCity(detectedCity);
            setStateName(detectedState);
            setLandmark(detectedLandmark);
            if (postcode) {
              setPincode(postcode.replace(/\D/g, '').slice(0, 6));
              generateDeliveryDate(postcode.replace(/\D/g, '').slice(0, 6));
            }
            
            toast({
              title: "Location Detected!",
              description: "Your address has been filled automatically.",
            });
          } catch (error) {
            console.error('Error detecting location:', error);
            toast({
              title: "Location Error",
              description: "Could not detect your location. Please enter manually.",
              variant: "destructive",
            });
          } finally {
            setIsDetectingLocation(false);
          }
        },
        () => {
          setIsDetectingLocation(false);
          toast({
            title: "Location Access Denied",
            description: "Please enable location access or enter address manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsDetectingLocation(false);
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'FIRST15' || couponCode.toUpperCase() === 'WELCOME15') {
      setCouponApplied(true);
      toast({
        title: "Coupon Applied!",
        description: "15% discount has been applied to your order.",
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a valid coupon code.",
        variant: "destructive",
      });
    }
  };

  const handleApplyPetDayDiscount = () => {
    if (todaysPetDay && !petDayDiscount) {
      setPetDayDiscount(true);
      toast({
        title: `${todaysPetDay.name} Offer Applied!`,
        description: `${todaysPetDay.discount}% discount has been applied.`,
      });
    }
  };

  const handleProceedToAddress = () => {
    setStep('address');
  };

  const handlePayment = async () => {
    if (!name || !phone || !pincode || !city || !stateName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all delivery details.",
        variant: "destructive",
      });
      return;
    }

    if (phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create order
    const displayId = `PAW${Date.now().toString().slice(-8)}`;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

    const trackingEntry = {
      status: 'Order Placed',
      timestamp: new Date().toISOString(),
      description: paymentMethod === 'cod' ? 'Order confirmed. Pay on delivery.' : paymentMethod === 'upi' ? 'UPI payment received. Order confirmed.' : 'Payment received. Order confirmed.',
    };

    let savedToDb = false;

    // Try saving via backend API first
    if (user?.id) {
      try {
        const orderData = await ordersApi.create({
          display_id: displayId,
          total_amount: finalTotal,
          platform_fee: platformFee,
          status: 'processing',
          payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
          shipping_address: {
            name,
            phone,
            city,
            state: stateName,
            pincode,
            landmark,
            address: [landmark, city, stateName, pincode].filter(Boolean).join(', '),
          },
          estimated_delivery: estimatedDeliveryDate.toISOString(),
          tracking_updates: [trackingEntry],
          payment_method: paymentMethod,
        });

        // Insert order items
        for (const item of cart) {
          await ordersApi.addItem(orderData.id, {
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          });
        }

        await ordersApi.sendOrderEmail(orderData.id, {
          orderId: orderData.id,
          customerName: name,
          customerEmail: user?.email || '',
          customerPhone: phone,
          items: cart.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress: {
            name,
            phone,
            city,
            state: stateName,
            pincode,
            landmark,
            address: [landmark, city, stateName, pincode].filter(Boolean).join(', '),
          },
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          totalAmount: finalTotal,
        });

        savedToDb = true;
      } catch (err) {
        console.warn('Order: API insert failed, falling back to localStorage', err);
      }
    }

    // Fallback: save to localStorage when Supabase unavailable
    if (!savedToDb) {
      const newOrder: Order = {
        id: displayId,
        displayId,
        items: cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: finalTotal,
        status: 'processing',
        orderDate: new Date(),
        estimatedDelivery: estimatedDeliveryDate,
        deliveryAddress: [landmark, city, stateName, pincode].filter(Boolean).join(', '),
        trackingUpdates: [
          { status: trackingEntry.status, timestamp: new Date(), description: trackingEntry.description },
        ],
      };

      const ordersKey = user ? `pawtectors_orders_${user.id}` : 'pawtectors_orders';
      const existingOrders: Order[] = JSON.parse(localStorage.getItem(ordersKey) || '[]');
      existingOrders.unshift(newOrder);
      localStorage.setItem(ordersKey, JSON.stringify(existingOrders));
    }

    setLastOrderId(displayId);
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      clearCart();
      setIsSuccess(false);
      setCouponApplied(false);
      setPetDayDiscount(false);
      setCouponCode('');
      setStep('summary');
      setPincode('');
      setName('');
      setPhone('');
      setCity('');
      setStateName('');
      setLandmark('');
      setDeliveryDate('');
      // Show review modal immediately after order (before closing payment modal)
      setShowReviewModal(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-card">
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-20 h-20 text-secondary mb-4 animate-bounce" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              {paymentMethod === 'cod' ? 'Order Confirmed!' : paymentMethod === 'upi' ? 'UPI Payment Successful!' : 'Payment Successful!'}
            </h2>
            <p className="text-muted-foreground mt-2">Thank you for shopping with Pawtectors</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Address Step
  if (step === 'address') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg bg-card max-h-[90vh] overflow-y-auto pb-2">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <button onClick={() => setStep('summary')} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <MapPin className="w-5 h-5 text-primary" />
              Delivery Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Address Input Type Selection */}
            <div className="space-y-2">
              <Label>Get Address</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={addressInputType === 'manual' ? 'default' : 'outline'}
                  onClick={() => setAddressInputType('manual')}
                  className={addressInputType === 'manual' ? 'gradient-hero text-white' : ''}
                >
                  Type Manually
                </Button>
                <Button
                  type="button"
                  variant={addressInputType === 'live' ? 'default' : 'outline'}
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className={addressInputType === 'live' ? 'gradient-hero text-white' : ''}
                >
                  <Locate className="w-4 h-4 mr-2" />
                  {isDetectingLocation ? 'Detecting...' : 'Live Location'}
                </Button>
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input 
                id="pincode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 6-digit pincode" 
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                maxLength={6}
              />
              {deliveryDate && (
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 flex items-center gap-2 mt-2">
                  <Truck className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-secondary font-medium">
                    Expected Delivery: {deliveryDate}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="deliveryName">Full Name *</Label>
              <Input 
                id="deliveryName" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                placeholder="Enter 10-digit phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div>

           {/* City / State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryCity">City *</Label>
                <Input
                  id="deliveryCity"
                  placeholder="Your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryState">State *</Label>
                <Input
                  id="deliveryState"
                  placeholder="Your state"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
            </div>

            {/* Landmark */}
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="e.g., Near City Mall, apartment/flat number"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            {/* Payment Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Coupon Discount (15%)</span>
                  <span className="text-secondary">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {petDayDiscount && todaysPetDay && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-600">{todaysPetDay.name} ({todaysPetDay.discount}%)</span>
                  <span className="text-amber-600">-{formatPrice(petDayDiscountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee (max ₹10)</span>
                {deliveryFee === 0 ? (
                  <span className="text-secondary font-medium">FREE</span>
                ) : (
                  <span>{formatPrice(deliveryFee)}</span>
                )}
              </div>
              {paymentMethod === 'cod' && codFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">COD Fee (max ₹7)</span>
                  <span>{formatPrice(codFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({gstPercentage}%)</span>
                <span>{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform fee</span>
                <span>{formatPrice(platformFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Card Details (only if card payment selected) */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Card Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="Enter name on card" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" type="password" placeholder="***" />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Payment (only if UPI selected) */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-violet-500" />
                  UPI Payment
                </h3>

                {/* UPI ID Display */}
                <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg p-4 space-y-1">
                  <p className="text-sm text-muted-foreground">Pay to UPI ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-lg text-violet-700 dark:text-violet-300">pawtectors@upi</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText('pawtectors@upi');
                        toast({ title: 'Copied!', description: 'UPI ID copied to clipboard.' });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-3 py-4">
                  <p className="text-sm text-muted-foreground">Scan QR code to pay</p>
                  <div className="bg-white p-4 rounded-xl shadow-md border">
                    <QRCodeSVG
                      value={`upi://pay?pa=pawtectors@upi&pn=Pawtectors&am=${finalTotal.toFixed(2)}&cu=INR&tn=Pawtectors%20Order`}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{formatPrice(finalTotal)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Open any UPI app (GPay, PhonePe, Paytm) and scan this QR
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full gradient-hero text-white"
              onClick={handlePayment}
              disabled={isProcessing || cart.length === 0}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : paymentMethod === 'cod' ? (
                <>Place Order - {formatPrice(finalTotal)}</>
              ) : paymentMethod === 'upi' ? (
                <>Confirm UPI Payment - {formatPrice(finalTotal)}</>
              ) : (
                <>Pay {formatPrice(finalTotal)}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Summary Step
  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card max-h-[90vh] overflow-y-auto pb-2">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Pet Day Offer Banner */}
          {todaysPetDay && (
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-3 flex items-center gap-3">
              <PartyPopper className="w-8 h-8 text-pink-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-pink-700 dark:text-pink-400 text-sm">🐾 {todaysPetDay.name}!</p>
                  <Badge variant="outline" className="text-xs bg-pink-100 dark:bg-pink-900/30 border-pink-300">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatPetDayDate(todaysPetDay.date)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{todaysPetDay.description} - Get {todaysPetDay.discount}% off!</p>
              </div>
              <Button 
                size="sm" 
                variant={petDayDiscount ? "secondary" : "default"}
                onClick={handleApplyPetDayDiscount}
                disabled={petDayDiscount}
                className="flex-shrink-0"
              >
                {petDayDiscount ? 'Applied ✓' : 'Claim'}
              </Button>
            </div>
          )}

          {/* Upcoming Pet Days */}
          {!todaysPetDay && upcomingPetDays.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">🗓️ Upcoming Pet Days with {upcomingPetDays[0].discount}% Off:</p>
              <div className="flex flex-wrap gap-2">
                {upcomingPetDays.map((day, index) => (
                  <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatPetDayDate(day.date)} - {day.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* First Order Offer Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-3 flex items-center gap-3">
            <Gift className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">🎉 First Order Offer!</p>
              <p className="text-xs text-muted-foreground">Use code <span className="font-bold text-primary">FIRST15</span> or <span className="font-bold text-primary">WELCOME15</span> for 15% off</p>
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="flex gap-2">
            <Input 
              placeholder="Enter coupon code" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1"
              disabled={couponApplied}
            />
            <Button 
              variant="outline" 
              onClick={handleApplyCoupon}
              disabled={couponApplied || !couponCode}
            >
              {couponApplied ? 'Applied ✓' : 'Apply'}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Order Summary</h3>
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            
            {couponApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-secondary flex items-center gap-1">
                  <Gift className="w-3 h-3" /> Coupon Discount (15%)
                </span>
                <span className="text-secondary">-{formatPrice(couponDiscount)}</span>
              </div>
            )}

            {petDayDiscount && todaysPetDay && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 flex items-center gap-1">
                  <PartyPopper className="w-3 h-3" /> {todaysPetDay.name} ({todaysPetDay.discount}%)
                </span>
                <span className="text-amber-600">-{formatPrice(petDayDiscountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Truck className="w-3 h-3" /> Delivery Fee (max ₹10)
              </span>
              {totalPrice >= 999 ? (
                <span className="text-secondary font-medium">FREE</span>
              ) : (
                <span>Up to ₹10</span>
              )}
            </div>
            {totalPrice < 999 && (
              <p className="text-xs text-muted-foreground">Free delivery on orders above ₹999</p>
            )}

            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Banknote className="w-3 h-3" /> COD Fee (max ₹7)
                </span>
                {totalPrice >= 1499 ? (
                  <span className="text-secondary font-medium">FREE</span>
                ) : (
                  <span>Up to ₹7</span>
                )}
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST ({gstPercentage}%)</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform fee</span>
              <span>{formatPrice(platformFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(finalTotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                You saved {formatPrice(totalDiscount)}!
              </Badge>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'card' | 'cod' | 'upi')}>
              <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Card Payment</p>
                    <p className="text-xs text-muted-foreground">Debit/Credit Card, Net Banking</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Smartphone className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="font-medium">UPI Payment</p>
                    <p className="text-xs text-muted-foreground">Pay via UPI QR code or UPI ID</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Banknote className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            className="w-full gradient-hero text-white"
            onClick={handleProceedToAddress}
            disabled={cart.length === 0}
          >
            Proceed to Delivery Details
          </Button>
        </div>

      </DialogContent>
    </Dialog>

    {/* Review Modal - outside payment dialog so it shows on top */}
    <ReviewModal 
      isOpen={showReviewModal} 
      onClose={() => {
        setShowReviewModal(false);
        onClose();
        toast({
          title: paymentMethod === 'cod' ? "Order Placed!" : "Payment Successful!",
          description: paymentMethod === 'cod' 
            ? "Your order has been placed. Pay when it arrives!"
            : paymentMethod === 'upi'
            ? "UPI payment received. Your order has been placed."
            : "Thank you for your purchase. Your order has been placed.",
        });
      }}
      orderId={lastOrderId}
    />
    </>
  );
};

export default PaymentModal;
