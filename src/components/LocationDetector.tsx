import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Locate, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';

const LocationDetector = () => {
  const { 
    pincode, 
    city, 
    state, 
    getCurrentLocation, 
    getCityFromPincode, 
    isGettingLocation, 
    locationError 
  } = useLocation();
  const { toast } = useToast();
  const [manualPincode, setManualPincode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleGetCurrentLocation = async () => {
    try {
      await getCurrentLocation();
      toast({
        title: "Location detected!",
        description: "Your PIN code has been automatically filled.",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Unable to get location",
        variant: "destructive",
      });
    }
  };

  const handleValidateManualPincode = async () => {
    if (!manualPincode || manualPincode.length !== 6) {
      toast({
        title: "Invalid PIN Code",
        description: "Please enter a valid 6-digit PIN code",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      await getCityFromPincode(manualPincode);
      toast({
        title: "PIN Code validated!",
        description: "Location details have been saved.",
      });
      setManualPincode('');
    } catch (error) {
      toast({
        title: "Invalid PIN Code",
        description: error instanceof Error ? error.message : "Unable to validate PIN code",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Delivery Location
        </CardTitle>
        <CardDescription>
          Set your location for accurate delivery estimates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Button */}
        <Button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          variant="outline"
          className="w-full"
        >
          <Locate className={`w-4 h-4 mr-2 ${isGettingLocation ? 'animate-spin' : ''}`} />
          {isGettingLocation ? 'Detecting your location...' : 'Use my current location'}
        </Button>

        {/* Error Display */}
        {locationError && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Current Location Display */}
        {pincode && city && !locationError && (
          <div className="flex items-start gap-2 p-3 bg-primary/10 text-primary rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{city}{state && `, ${state}`}</p>
              <p className="text-xs opacity-75">PIN: {pincode}</p>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
          </div>
        </div>

        {/* Manual PIN Code Entry */}
        <div className="flex gap-2">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 6-digit PIN code"
            value={manualPincode}
            onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="flex-1"
          />
          <Button
            onClick={handleValidateManualPincode}
            disabled={!manualPincode || manualPincode.length !== 6 || isValidating}
            variant="outline"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          We use your location to show nearby services and calculate delivery charges.
        </p>
      </CardContent>
    </Card>
  );
};

export default LocationDetector;