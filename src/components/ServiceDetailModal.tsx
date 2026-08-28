import { Star, MapPin, Clock, Phone, IndianRupee } from 'lucide-react';
import { PetService } from '@/types/pet-services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn, handleImgError } from '@/lib/utils';

interface ServiceDetailModalProps {
  service: PetService | null;
  isOpen: boolean;
  onClose: () => void;
  onBook?: () => void;
}

const categoryColors = {
  'pet-shop': 'bg-accent text-accent-foreground',
  'clinic': 'bg-secondary text-secondary-foreground',
  'grooming': 'bg-primary/20 text-primary',
  'boarding': 'bg-primary text-primary-foreground',
  'training': 'bg-orange-500 text-white',
};

const categoryLabels = {
  'pet-shop': 'Pet Shop',
  'clinic': 'Clinic',
  'grooming': 'Grooming',
  'boarding': 'Boarding',
  'training': 'Training',
};

const ServiceDetailModal = ({ service, isOpen, onClose, onBook }: ServiceDetailModalProps) => {
  if (!service) return null;

  const canBook = service.category === 'clinic' || service.category === 'boarding' || service.category === 'grooming' || service.category === 'training';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Image Header */}
        <div className="relative h-64">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
            onError={handleImgError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
          
          <Badge 
            className={cn(
              "absolute top-4 left-4 font-display font-semibold",
              categoryColors[service.category]
            )}
          >
            {categoryLabels[service.category]}
          </Badge>
          
          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-display font-bold text-primary-foreground mb-2">
              {service.name}
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-semibold text-sm">{service.rating}</span>
                <span className="text-xs text-muted-foreground">({service.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="sr-only">{service.name}</DialogTitle>
          </DialogHeader>
          
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{service.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hours</p>
                <p className="text-sm font-medium">{service.openTime} - {service.closeTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{service.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="font-display font-bold text-lg mb-2">About</h3>
            <p className="text-muted-foreground">{service.description}</p>
          </div>
          
          {/* Services */}
          <div className="mb-6">
            <h3 className="font-display font-bold text-lg mb-3">Services Offered</h3>
            <div className="flex flex-wrap gap-2">
              {service.services.map((s) => (
                <Badge key={s} variant="secondary" className="font-medium">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pricing - Different display for clinics vs other services */}
          {service.category === 'clinic' ? (
            // Clinics: Only show consultation fee
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg mb-3">Consultation Fee</h3>
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">General Consultation</span>
                  <span className="text-lg font-bold text-primary flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {service.pricing?.find(p => p.name.toLowerCase().includes('consult'))?.price?.toLocaleString('en-IN') || '500'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Additional charges may apply for treatments, diagnostics, and procedures
                </p>
              </div>
            </div>
          ) : (
            // Boarding, Grooming & Training: Show detailed pricing
            service.pricing && service.pricing.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg mb-3">
                  {service.category === 'grooming' ? 'Grooming Services & Pricing' : 
                   service.category === 'training' ? 'Training Programs & Rates' : 'Boarding Rates'}
                </h3>
                <div className="bg-muted rounded-xl p-4">
                  <div className="space-y-3">
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
                </div>
              </div>
            )
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            {canBook && onBook && (
              <Button variant="default" className="flex-1" onClick={onBook}>
                Book Appointment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailModal;
