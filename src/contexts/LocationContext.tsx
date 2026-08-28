import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AUTH_STORAGE_KEY = 'pawtectors_auth';

interface LocationContextType {
  location: string;
  pincode: string;
  city: string;
  state: string;
  setLocation: (location: string) => Promise<void>;
  getCurrentLocation: () => Promise<void>;
  getCityFromPincode: (pincode: string) => Promise<string>;
  isLocationSet: boolean;
  isGettingLocation: boolean;
  locationError: string | null;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export { LocationContext };

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocationState] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [isLocationSet, setIsLocationSet] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load location on mount
  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    // First, check sessionStorage for location, PIN code, city, and state
    const savedLocation = sessionStorage.getItem('userLocation');
    const savedPincode = sessionStorage.getItem('userPincode');
    const savedCity = sessionStorage.getItem('userCity');
    const savedState = sessionStorage.getItem('userState');
    const locationManuallySet = sessionStorage.getItem('locationManuallySet');
    
    if (savedLocation) {
      setLocationState(savedLocation);
      setIsLocationSet(true);
    }
    
    if (savedPincode) {
      setPincode(savedPincode);
    }
    
    if (savedCity) {
      setCity(savedCity);
    }
    
    if (savedState) {
      setState(savedState);
    }
    
    // If location is manually set or any location data exists, don't auto-prompt
    if (savedLocation || locationManuallySet === 'true') {
      return;
    }

    // Then check if user is logged in and has saved location in profile
    // Temporarily disabled profile sync to avoid type issues
    // try {
    //   const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    //   if (saved) {
    //     const parsed: unknown = JSON.parse(saved);
    //     const email = (parsed as { email?: string }).email;
    //     if (email) {
    //       // Profile sync disabled for now
    //     }
    //   }
    // } catch (error: unknown) {
    //   console.error('Error loading location:', error);
    // }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser.';
      setLocationError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsGettingLocation(true);
    setLocationError(null);
    
    try {
      // Request permission and get coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (error) => {
            let errorMessage = 'Unable to get your location.';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user. Please enable location services.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again.';
                break;
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // 15 seconds timeout
            maximumAge: 300000, // 5 minutes cache
          }
        );
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Use reverse geocoding to get PIN code and location details
      try {
        // Try multiple geocoding services for better reliability
        let locationData = null;
        
        // First try OpenCage API
        const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
        
        if (apiKey && apiKey !== 'YOUR_OPENCAGE_API_KEY') {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${coords.latitude}+${coords.longitude}&key=${apiKey}&limit=1&no_annotations=1&language=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              locationData = data.results[0].components;
            }
          }
        }
        
        // Fallback: Try a free service (limited requests)
        if (!locationData) {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.address) {
              locationData = data.address;
            }
          }
        }
        
        if (locationData) {
          // Extract Indian PIN code (6 digits starting with 1-9)
          const extractedPincode = locationData.postcode || locationData.postal_code || '';
          const cityName = locationData.city || locationData.town || locationData.village || 
                          locationData.suburb || locationData.neighbourhood || 'Unknown';
          const stateName = locationData.state || locationData.province || '';
          
          // Validate Indian PIN code format
          const pincodeRegex = /^[1-9][0-9]{5}$/;
          if (extractedPincode && pincodeRegex.test(extractedPincode)) {
            setPincode(extractedPincode);
            setCity(cityName);
            setState(stateName);
            
            sessionStorage.setItem('userPincode', extractedPincode);
            sessionStorage.setItem('userCity', cityName);
            sessionStorage.setItem('userState', stateName);
            
            const locationStr = `${cityName}${stateName ? ', ' + stateName : ''}`;
            setLocationState(locationStr);
            sessionStorage.setItem('userLocation', locationStr);
            setIsLocationSet(true);
            
            // Mark as automatically detected
            sessionStorage.setItem('locationAutoDetected', 'true');
          } else {
            throw new Error('Unable to determine PIN code from your location. You may be outside India or the location data is incomplete.');
          }
        } else {
          throw new Error('Unable to get address details from your coordinates. Please check your internet connection.');
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
        // Set a fallback message
        const errorMsg = geocodeError instanceof Error ? geocodeError.message : 'Unable to determine your PIN code automatically.';
        setLocationError(errorMsg);
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unable to get your current location';
      setLocationError(errorMsg);
      console.error('Error getting location:', error);
      throw error;
    } finally {
      setIsGettingLocation(false);
    }
  };

  const getCityFromPincode = async (inputPincode: string): Promise<string> => {
    if (!inputPincode || inputPincode.length !== 6) {
      throw new Error('Please enter a valid 6-digit PIN code');
    }

    // Validate Indian PIN code format
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(inputPincode)) {
      throw new Error('Invalid PIN code format. Indian PIN codes are 6 digits starting with 1-9.');
    }

    try {
      // Use India POST API or other Indian postal services
      // For now, we'll use a simple mapping or external API
      const response = await fetch(`https://api.postalpincode.in/pincode/${inputPincode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const cityName = postOffice.District || postOffice.Name || 'Unknown';
          const stateName = postOffice.State || '';
          
          setCity(cityName);
          setState(stateName);
          sessionStorage.setItem('userCity', cityName);
          sessionStorage.setItem('userState', stateName);
          
          const locationStr = `${cityName}${stateName ? ', ' + stateName : ''}`;
          setLocationState(locationStr);
          sessionStorage.setItem('userLocation', locationStr);
          setIsLocationSet(true);
          
          return cityName;
        } else {
          throw new Error('PIN code not found in database');
        }
      } else {
        throw new Error('Unable to validate PIN code');
      }
    } catch (error) {
      console.error('Error looking up PIN code:', error);
      throw new Error('Unable to find city for this PIN code');
    }
  };

  const setLocation = async (newLocation: string) => {
    setLocationState(newLocation);
    setIsLocationSet(true);
    sessionStorage.setItem('userLocation', newLocation);
    
    // Mark location as manually set to prevent auto-prompting
    sessionStorage.setItem('locationManuallySet', 'true');

    // Save to database if user is logged in
    // Temporarily disabled profile sync to avoid type issues
    // try {
    //   const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    //   if (saved) {
    //     const parsed: unknown = JSON.parse(saved);
    //     const email = (parsed as { email?: string }).email;
    //     if (email) {
    //       // Profile sync disabled for now
    //     }
    //   }
    // } catch (error: unknown) {
    //   console.error('Error updating location:', error);
    // }
  };

  const clearLocation = () => {
    setLocationState('');
    setPincode('');
    setCity('');
    setState('');
    setLocationError(null);
    setIsLocationSet(false);
    sessionStorage.removeItem('userLocation');
    sessionStorage.removeItem('userPincode');
    sessionStorage.removeItem('userCity');
    sessionStorage.removeItem('userState');
    sessionStorage.removeItem('locationManuallySet');
    sessionStorage.removeItem('locationAutoDetected');
  };

  return (
    <LocationContext.Provider value={{ 
      location, 
      pincode,
      city,
      state,
      setLocation, 
      getCurrentLocation, 
      getCityFromPincode,
      isLocationSet, 
      isGettingLocation, 
      locationError,
      clearLocation 
    }}>
      {children}
    </LocationContext.Provider>
  );
};