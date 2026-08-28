import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Locate } from 'lucide-react';
import { indianLocations } from '@/data/indian-locations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from '@/hooks/useLocation';

interface LocationModalProps {
  isOpen: boolean;
  onClose: (location: string) => void;
}

const LocationModal = ({ isOpen, onClose }: LocationModalProps) => {
  const { location: savedLocation, setLocation: saveLocation } = useLocation();
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  // Pre-populate with saved location
  useEffect(() => {
    if (savedLocation && !selectedLocation) {
      setSelectedLocation(savedLocation);
      setSearch(savedLocation);
    }
  }, [savedLocation]);

  // Combine all locations for search
  const allLocations = useMemo(() => {
    const locations: string[] = [];
    
    // Add all states
    locations.push(...indianLocations.states);
    
    // Add all union territories
    locations.push(...indianLocations.unionTerritories);
    
    // Add all major cities
    locations.push(...indianLocations.majorCities);
    
    // Add all districts from all states
    Object.values(indianLocations.districts).forEach(districts => {
      locations.push(...districts);
    });
    
    // Remove duplicates
    return [...new Set(locations)].sort();
  }, []);

  const filteredLocations = useMemo(() => {
    if (!search) return indianLocations.popularLocations;
    const query = search.toLowerCase();
    return allLocations.filter(loc => loc.toLowerCase().includes(query));
  }, [search, allLocations]);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
            setSelectedLocation(city);
            setSearch(city);
          } catch (error) {
            console.error('Error detecting location:', error);
          } finally {
            setIsDetecting(false);
          }
        },
        () => {
          setIsDetecting(false);
        }
      );
    } else {
      setIsDetecting(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedLocation) {
      await saveLocation(selectedLocation);
      onClose(selectedLocation);
    }
  };

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setSearch(location);
  };

  const handleClose = () => {
    // If user closes without selecting, use saved location or call onClose with empty
    if (savedLocation) {
      onClose(savedLocation);
    } else {
      // Allow closing even without selection
      onClose('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Select Your Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search city, state, or district..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedLocation('');
              }}
              className="pl-10"
            />
          </div>

          {/* Detect Location Button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleDetectLocation}
            disabled={isDetecting}
          >
            <Locate className="w-4 h-4" />
            {isDetecting ? 'Detecting...' : 'Use My Current Location'}
          </Button>

          {/* Location List */}
          <ScrollArea className="h-48 rounded-lg border border-border">
            <div className="p-2 space-y-1">
              {filteredLocations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No locations found</p>
              ) : (
                filteredLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleSelectLocation(location)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedLocation === location
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {location}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">{selectedLocation}</span>
            </div>
          )}


          {/* Confirm Button */}
          <Button
            className="w-full gradient-hero text-white"
            onClick={handleConfirm}
            disabled={!selectedLocation}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
