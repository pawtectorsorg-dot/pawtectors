import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { indianLocations } from '@/data/indian-locations';
import { useToast } from '@/hooks/use-toast';

interface LocationSearchProps {
  onLocationChange: (location: string) => void;
}

const LocationSearch = ({ onLocationChange }: LocationSearchProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const { toast } = useToast();

  // Get all locations combined
  const allLocations = [
    ...indianLocations.majorCities,
    ...indianLocations.states,
    ...indianLocations.unionTerritories,
    ...Object.values(indianLocations.districts).flat(),
  ];

  // Remove duplicates and sort
  const uniqueLocations = [...new Set(allLocations)].sort();

  // Show all matching locations when searching, popular ones when empty
  const filteredLocations = searchValue
    ? uniqueLocations.filter(loc => 
        loc.toLowerCase().includes(searchValue.toLowerCase())
      )
    : uniqueLocations;

  const handleLocationSelect = (location: string) => {
    setSearchValue(location);
    onLocationChange(location);
    setShowSuggestions(false);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support location services.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Requesting location...',
      description: 'Please allow location access when prompted.',
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
          const state = data.address?.state;
          const locationString = city ? `${city}${state ? ', ' + state : ''}` : 'Your Location';
          
          setUserLocation(locationString);
          setSearchValue(locationString);
          onLocationChange(city || '');
          
          toast({
            title: 'Location found!',
            description: `Your location: ${locationString}`,
          });
        } catch {
          toast({
            title: 'Location found',
            description: 'Could not get address details, showing nearby services.',
          });
        }
      },
      (error) => {
        let message = 'Unable to get your location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location access denied. Please enable location in your browser settings.';
        }
        toast({
          title: 'Location Error',
          description: message,
          variant: 'destructive',
        });
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter your location..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 h-12 bg-background"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={requestLocation}
            className="h-12 px-4"
            title="Use my location"
          >
            <Navigation className="w-5 h-5" />
          </Button>
        </div>

        {showSuggestions && (
          <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {userLocation && (
                  <button
                    onClick={() => handleLocationSelect(userLocation)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent rounded-lg transition-colors text-primary"
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="font-medium">Current Location: {userLocation}</span>
                  </button>
                )}
                
                <p className="px-3 py-2 text-xs text-muted-foreground font-medium">
                  {searchValue ? 'Search Results' : 'Popular Locations'}
                </p>
                
                {filteredLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent rounded-lg transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{location}</span>
                  </button>
                ))}
                
                {filteredLocations.length === 0 && (
                  <p className="px-3 py-4 text-muted-foreground text-center">
                    No locations found
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;
