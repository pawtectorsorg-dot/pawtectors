import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ServiceFilterProps {
  availableServices: string[];
  selectedServices: string[];
  onServiceToggle: (service: string) => void;
  onClearAll: () => void;
}

const ServiceFilter = ({ 
  availableServices, 
  selectedServices, 
  onServiceToggle, 
  onClearAll 
}: ServiceFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-start">
          Filter by Services
          {selectedServices.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
              {selectedServices.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Select Services</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableServices.map((service) => (
          <DropdownMenuItem
            key={service}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onServiceToggle(service)}
          >
            <div className="flex items-center justify-center w-4 h-4 border border-input rounded">
              {selectedServices.includes(service) && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </div>
            <span className="flex-1">{service}</span>
          </DropdownMenuItem>
        ))}
        
        {selectedServices.length > 0 && (
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

export default ServiceFilter;