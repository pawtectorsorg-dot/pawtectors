import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import LocationModal from '@/components/LocationModal';
import { useLocation } from '@/hooks/useLocation';
import { useProviderAuth } from '@/hooks/useProviderAuth';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Calendar, IndianRupee, QrCode, ClipboardList, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';


const Index = () => {
  const { location: savedLocation, pincode, city, isLocationSet, getCurrentLocation, isGettingLocation, locationError, setLocation } = useLocation();
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { user: providerUser, signOut: providerSignOut } = useProviderAuth();

  useEffect(() => {
    if (providerUser) {
      providerSignOut();
    }
  }, [providerUser, providerSignOut]);
  

  // Auto-populate location from context
  useEffect(() => {
    if (isLocationSet && savedLocation) {
      setSearchLocation(savedLocation);
    }
  }, [isLocationSet, savedLocation]);

const handleLocationClick = () => {
  setShowLocationModal(true);
};

  const handleLocationConfirm = async (location: string) => {
    setShowLocationModal(false);
    
    // Only save location if one was selected
    if (location) {
      setSearchLocation(location);
      // Save the location to context which will persist it
      try {
        await setLocation(location);
      } catch (error) {
        console.error('Error saving location:', error);
      }
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      await getCurrentLocation();
      toast({
        title: "Location retrieved",
        description: "Your current location has been set successfully!",
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Failed to get your current location. Please try again or set location manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Pawtectors - Find Veterinary Clinics & Hospitals Near You</title>
        <meta name="description" content="Discover and book verified veterinary clinics and hospitals near you. Schedule online appointments instantly for your beloved pets." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <HeroSection 
          location={searchLocation} 
          pincode={pincode}
          city={city}
          isLocationSet={isLocationSet}
          onLocationClick={handleLocationClick}
          onGetCurrentLocation={handleGetCurrentLocation}
          isGettingLocation={isGettingLocation}
          locationError={locationError}
        />

        {/* Veterinary Software SaaS Section */}
        <section className="py-24 bg-[#fcfbfa] border-y border-stone-200 relative overflow-hidden" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0ea5e9]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e0f2fe]/50 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 max-w-6xl relative">
            
            {/* Title & Header */}
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#0ea5e9]/10 text-[#0284c7] px-4 py-2 rounded-full border border-[#0ea5e9]/20 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-[#0ea5e9]" /> Introducing Clinic OS
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight">
                Veterinary Clinic Management <br className="hidden md:inline" /> Software Built for Vets
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed">
                Connect your clinic directly to pet parents. Streamline scheduling, GST billing, electronic health records, lost-pet QR collars, and automated WhatsApp updates.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Appointments Scheduler",
                  desc: "Book, reschedule, and track consultations easily. Auto-sends appointment slots and confirmations to pet parents via WhatsApp.",
                  icon: Calendar,
                },
                {
                  title: "Digital E-Records & RX",
                  desc: "Maintain complete patient medical history, symptoms, diagnoses, and digital prescriptions. Access consult records in seconds.",
                  icon: Stethoscope,
                },
                {
                  title: "GST Invoicing & Bills",
                  desc: "Generate tax-compliant GST bills instantly. Select payment modes (UPI, card, cash) and share professional invoices directly to WhatsApp.",
                  icon: IndianRupee,
                },
                {
                  title: "Smart Pet QR Collar Tags",
                  desc: "Assign metal QR tags. When scanned by anyone, pet parents get an instant WhatsApp alert with real-time GPS coordinates.",
                  icon: QrCode,
                },
                {
                  title: "Procurement & Stock Control",
                  desc: "Reconcile vendor payments. Log supplies and track drug/vaccine inventory with low-stock and expiry warnings.",
                  icon: ClipboardList,
                },
                {
                  title: "Finances & Cashbooks",
                  desc: "Keep records of clinic overhead expenses, staff salaries, rent, and miscellaneous operating costs with analytical indicators.",
                  icon: ShieldCheck,
                }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="bg-white border border-[#e5e5e0] hover:border-[#0ea5e9] p-8 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between h-full">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center mb-6 group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6 text-[#0ea5e9] group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-3">{feature.title}</h3>
                      <p className="text-stone-500 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Call To Action Block */}
            <div className="bg-[#0f172a] text-white rounded-3xl p-8 md:p-12 mt-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0ea5e9]/10 rounded-full blur-2xl" />
              <div className="space-y-3 relative z-10 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-extrabold">Ready to upgrade your practice?</h3>
                <p className="text-sky-100/70 text-sm max-w-xl">
                  Take control of missed vaccinations and billing spreadsheets. Setup your clinic on Pawtectors Clinic OS in just 2 minutes.
                </p>
              </div>
              <div className="relative z-10 shrink-0">
                <Link 
                  to="/admin" 
                  className="bg-white hover:bg-stone-100 text-[#07332a] font-bold px-7 py-4 rounded-full shadow-lg transition-all flex items-center gap-2 group text-sm font-pemilyy"
                >
                  Go to Vets Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        <Footer />

        <LocationModal
          isOpen={showLocationModal}
          onClose={handleLocationConfirm}
        />
      </div>
    </>
  );
};

export default Index;
