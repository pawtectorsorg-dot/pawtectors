import { PetService } from '@/types/pet-services';
import ServiceCard from './ServiceCard';

interface ServiceGridProps {
  services: PetService[];
  onViewDetails: (service: PetService) => void;
  onBook: (service: PetService) => void;
}

const ServiceGrid = ({ services, onViewDetails, onBook }: ServiceGridProps) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🐾</div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          No services found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search in a different location.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service, index) => (
        <ServiceCard
          key={service.id}
          service={service}
          onViewDetails={onViewDetails}
          onBook={onBook}
          index={index}
        />
      ))}
    </div>
  );
};

export default ServiceGrid;
