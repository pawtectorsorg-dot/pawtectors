import { useState } from 'react';
import { Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LocationFilterProps {
  availableLocations: string[];
  selectedLocations: string[];
  onLocationToggle: (location: string) => void;
  onClearAll: () => void;
}

const LocationFilter = ({ 
  availableLocations, 
  selectedLocations, 
  onLocationToggle, 
  onClearAll 
}: LocationFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-start">
          <MapPin className="h-4 w-4 mr-2" />
          Filter by Location
          {selectedLocations.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
              {selectedLocations.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Select Locations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableLocations.map((location) => (
          <DropdownMenuItem
            key={location}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onLocationToggle(location)}
          >
            <div className="flex items-center justify-center w-4 h-4 border border-input rounded">
              {selectedLocations.includes(location) && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </div>
            <span className="flex-1">{location}</span>
          </DropdownMenuItem>
        ))}
        
        {selectedLocations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-muted-foreground cursor-pointer"
              onClick={onClearAll}
            >
              Clear All
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationFilter;