import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero_jasper_bg.jpg';

// HeroSection no longer needs location/GPS props — clean interface
interface HeroSectionProps {
  location?: string;
  pincode?: string;
  city?: string;
  isLocationSet?: boolean;
  onLocationClick?: () => void;
  onGetCurrentLocation?: () => void;
  isGettingLocation?: boolean;
  locationError?: string | null;
}

const HeroSection = (_props: HeroSectionProps) => {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 'calc(100vh - 80px)' }}>

      {/* ── Full-bleed 3D Background Image ─────────────────── */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        {/* Strong warm overlay — image barely visible beneath */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f4ff]/80 via-[#fdf8f0]/75 to-[#fdf8f0]/85" />
        {/* Bottom bridge — fades hero into the dark navy section below */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0b1329] via-[#0b1329]/60 to-transparent" />
      </div>

      {/* ── Content Layer ──────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-32 sm:pt-20 sm:pb-40 min-h-[inherit]">

        {/* Announcement Banner — Jasper-style pill */}
        <Link
          to="/clinic"
          className="group inline-flex items-center gap-2.5 mb-10 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 text-sm font-medium text-slate-700 shadow-md hover:shadow-lg hover:border-sky-400/60 transition-all"
        >
          <span className="flex items-center gap-1.5 text-sky-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            New
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="text-slate-600">Introducing Hospital OS — Full OPD &amp; GST Billing Suite</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Main Headline */}
        <h1
          className="max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6"
          style={{ fontFamily: 'Urbanist, Inter, sans-serif' }}
        >
          The pet healthcare{' '}
          <span
            className="bg-gradient-to-r from-sky-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent"
          >
            your clinic deserves
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-xl text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 font-normal">
          Manage OPD appointments, digital health records, automated patient reminders,
          and GST invoicing — all in one intelligent platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-7 rounded-full text-base font-semibold border-slate-300 bg-white/80 backdrop-blur-sm text-slate-800 hover:border-sky-400 hover:text-sky-600 shadow hover:shadow-md transition-all"
            >
              Pet Parent Login
            </Button>
          </Link>

          <Link to="/clinic">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full text-base font-bold bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white shadow-xl shadow-sky-400/30 hover:shadow-sky-400/50 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              Open Hospital OS
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Subtle social proof line */}
        <p className="mt-8 text-xs text-slate-500 font-medium">
          Trusted by <span className="font-bold text-slate-700">250+ verified veterinary clinics</span> across India
        </p>

      </div>
    </section>
  );
};

export default HeroSection;
