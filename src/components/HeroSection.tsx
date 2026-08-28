import { MapPin, Locate, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import vetHeroImg from '@/assets/vet_hero_illustration.jpg';

interface HeroSectionProps {
  location: string;
  pincode?: string;
  city?: string;
  isLocationSet?: boolean;
  onLocationClick: () => void;
  onGetCurrentLocation: () => void;
  isGettingLocation?: boolean;
  locationError?: string | null;
}

const HeroSection = ({ 
  location, 
  isLocationSet = false, 
  onLocationClick, 
  onGetCurrentLocation, 
  isGettingLocation = false 
}: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-[#fcfbfa] py-16 lg:py-24" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[45%] h-[60%] bg-[#0ea5e9]/5 rounded-br-[200px] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[35%] h-[50%] bg-[#e0f2fe]/60 rounded-tl-[180px] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SIDE: Text and Search Card */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-[#0ea5e9]/10 text-[#0284c7] px-4 py-2 rounded-full border border-[#0ea5e9]/20">
              <Sparkles className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
              <span className="font-semibold text-xs tracking-wider uppercase">Trusted Veterinary Network</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0f172a] leading-[1.1] tracking-tight">
              Your Pet's <span className="text-[#0ea5e9]">Health Care</span>, Simplified & Secured
            </h1>

            {/* Subtitle */}
            <p className="text-stone-600 text-lg leading-relaxed max-w-xl">
              Book verified clinic appointments, maintain digital medical health cards, and set smart QR locator collar alerts for your beloved companions.
            </p>

            {/* Location Selector Card */}
            <div className="bg-white border border-[#e5e5e0] p-6 rounded-3xl shadow-xl max-w-lg transition-all hover:shadow-2xl">
              {!isLocationSet || !location ? (
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">Select Clinic Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <Input
                      type="text"
                      placeholder="Click to search area or pincode..."
                      value={location}
                      readOnly
                      onClick={onLocationClick}
                      className="pl-12 h-14 rounded-2xl border border-stone-200 bg-stone-50/50 text-stone-800 placeholder:text-stone-400 focus:border-[#0ea5e9] cursor-pointer text-sm"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={onGetCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white h-12 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg"
                  >
                    <Locate className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                    {isGettingLocation ? 'Determining GPS...' : 'Use Current GPS Location'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#0ea5e9]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">Showing Clinics Near</p>
                      <p className="text-base font-bold text-[#0f172a]">{location}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onLocationClick}
                    className="text-sm text-[#0ea5e9] hover:text-[#0284c7] hover:underline font-bold"
                  >
                    Change Area
                  </button>
                </div>
              )}

              {/* Popular tags */}
              {(!isLocationSet || !location) && (
                <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-stone-400 font-medium">Quick Pick:</span>
                  {['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => onLocationClick()}
                      className="text-[#0284c7] hover:text-[#0369a1] font-semibold bg-[#0ea5e9]/10 px-2.5 py-1 rounded-lg transition"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE: Generated Professional Illustration */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[3/2] lg:max-w-none lg:h-[400px] lg:w-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-transform duration-500 hover:scale-[1.02]">
              <img 
                src={vetHeroImg} 
                alt="Veterinarian with dog illustration" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
