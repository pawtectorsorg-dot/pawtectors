import { MapPin, Clock, Phone, BadgeCheck, Shield } from 'lucide-react';
import { PetService } from '@/types/pet-services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, handleImgError } from '@/lib/utils';
import StarRating from './StarRating';

interface ServiceCardProps {
  service: PetService;
  onViewDetails: (service: PetService) => void;
  onBook?: (service: PetService) => void;
  index: number;
}

const categoryColors = {
  'pet-shop': 'bg-accent text-accent-foreground',
  'clinic': 'bg-secondary text-secondary-foreground',
  'grooming': 'bg-primary/20 text-primary',
  'boarding': 'bg-primary text-primary-foreground',
};

const categoryLabels = {
  'pet-shop': 'Pet Shop',
  'clinic': 'Clinic',
  'grooming': 'Grooming',
  'boarding': 'Boarding',
};

// Verified badge for boarding (green with glow), Trusted badge for others (gradient gold/amber)
const getBadgeInfo = (category: PetService['category']) => {
  if (category === 'boarding') {
    return { 
      label: 'Verified', 
      icon: BadgeCheck, 
      className: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/40 animate-pulse ring-2 ring-sky-300/50' 
    };
  }
  return { 
    label: 'Trusted', 
    icon: Shield, 
    className: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-amber-500/40 ring-2 ring-amber-300/50' 
  };
};

const ServiceCard = ({ service, onViewDetails, onBook, index }: ServiceCardProps) => {
  const canBook = service.category === 'clinic' || service.category === 'boarding' || service.category === 'grooming';
  const badgeInfo = getBadgeInfo(service.category);
  const BadgeIcon = badgeInfo.icon;

  return (
    <div 
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-[0_12px_40px_-12px_hsl(20_25%_15%/0.15)] transition-all duration-500 animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={handleImgError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Category Badge */}
        <Badge 
          className={cn(
            "absolute top-4 left-4 font-display font-semibold",
            categoryColors[service.category]
          )}
        >
          {categoryLabels[service.category]}
        </Badge>

        {/* Verified/Trusted Badge */}
        <Badge 
          className={cn(
            "absolute top-4 right-4 font-display font-semibold flex items-center gap-1",
            badgeInfo.className
          )}
        >
          <BadgeIcon className="w-3 h-3" />
          {badgeInfo.label}
        </Badge>
        
        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <StarRating rating={service.rating} size="sm" />
          <span className="font-semibold text-sm text-foreground">{service.rating}</span>
          <span className="text-xs text-muted-foreground">({service.reviewCount})</span>
        </div>
        
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {service.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{service.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{service.openTime} - {service.closeTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{service.phone}</span>
          </div>
        </div>
        
        {/* Services Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(service.services || []).slice(0, 3).map((s) => (
            <span 
              key={s} 
              className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md"
            >
              {s}
            </span>
          ))}
          {(service.services?.length || 0) > 3 && (
            <span className="text-xs text-primary font-medium">
              +{(service.services?.length || 0) - 3} more
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(service)}
          >
            View Details
          </Button>
          {canBook && onBook && (
            <Button 
              variant="default"
              className="flex-1"
              onClick={() => onBook(service)}
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
