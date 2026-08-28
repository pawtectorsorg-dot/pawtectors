import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceGrid from '@/components/ServiceGrid';
import ServiceDetailModal from '@/components/ServiceDetailModal';
import BookingModal from '@/components/BookingModal';
import ServiceFilter from '@/components/ServiceFilter';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PetService } from '@/types/pet-services';
import { useLocation } from '@/hooks/useLocation';

const Clinics = () => {
  const { location: userCity } = useLocation();
  const { services, isLoading } = useServices({
    city: userCity,
  });
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<PetService | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingService, setBookingService] = useState<PetService | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // First filter to get all clinic services
  const allClinicServices = useMemo(() => {
    return services.filter((service) => {
      return service.category === 'clinic';
    });
  }, [services]);

  // Extract all unique services offered by clinics
  const availableServices = useMemo(() => {
    const serviceSet = new Set<string>();
    allClinicServices.forEach(clinic => {
      clinic.services.forEach(service => serviceSet.add(service));
    });
    return Array.from(serviceSet).sort();
  }, [allClinicServices]);

  // Filter clinics based on selected services only
  const clinicServices = useMemo(() => {
    let filtered = allClinicServices;
    
    // Filter by services if any selected
    if (selectedServices.length > 0) {
      filtered = filtered.filter(clinic => {
        const hasSelectedServices = selectedServices.some(selectedService => 
          clinic.services.includes(selectedService)
        );
        return hasSelectedServices;
      });
    }
    
    return filtered;
  }, [allClinicServices, selectedServices]);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleClearAllServices = () => {
    setSelectedServices([]);
  };

  const handleViewDetails = (service: PetService) => {
    setSelectedService(service);
    setIsDetailModalOpen(true);
  };

  const handleBook = (service: PetService) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book a service.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    setBookingService(service);
    setIsBookingModalOpen(true);
    setIsDetailModalOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Veterinary Clinics - Pawtectors | Find Vets Near You</title>
        <meta name="description" content="Find trusted veterinary clinics in your area. Book appointments for checkups, vaccinations, surgeries, and emergency care." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Veterinary Clinics
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Find trusted veterinary clinics for your pet's health needs - from regular checkups to emergency care.
            </p>
          </div>
        </div>
        
        <main className="container mx-auto px-4 py-12">
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Veterinary Clinics
                </h2>
                <p className="text-muted-foreground mt-1">
                  {isLoading ? 'Loading...' : `${clinicServices.length} ${clinicServices.length === 1 ? 'result' : 'results'}`}
                  {selectedServices.length > 0 && (
                    <span className="ml-2 text-sm">
                      • Filtered by {selectedServices.length} service{selectedServices.length === 1 ? '' : 's'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Service Filter */}
            <div className="flex flex-wrap gap-4">
              <ServiceFilter
                availableServices={availableServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
                onClearAll={handleClearAllServices}
              />
              
              {/* Selected Services Display */}
              {selectedServices.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map(service => (
                    <span
                      key={`service-${service}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {service}
                      <button
                        onClick={() => handleServiceToggle(service)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                        aria-label={`Remove ${service} filter`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading clinic services...</p>
            </div>
          ) : clinicServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No clinic services found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Total services loaded: {services.length}
              </p>
            </div>
          ) : (
            <ServiceGrid 
              services={clinicServices}
              onViewDetails={handleViewDetails}
              onBook={handleBook}
            />
          )}
        </main>

        <Footer />

        <ServiceDetailModal
          service={selectedService}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onBook={() => selectedService && handleBook(selectedService)}
        />
        
        <BookingModal
          service={bookingService}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
        />
      </div>
    </>
  );
};

export default Clinics;
