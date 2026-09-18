import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import {
  Stethoscope,
  Calendar,
  IndianRupee,
  FileText,
  Bell,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Activity,
  Building2,
  Lock,
} from 'lucide-react';

const Index = () => {

  const hospitalModules = [
    {
      title: "Medical Records & Prescriptions",
      desc: "Maintain complete patient health records, clinical symptoms, diagnosis logs, digital prescriptions, and official health certificates.",
      icon: FileText,
      badge: "2+ Records",
    },
    {
      title: "Patient Reminders & Alerts",
      desc: "Automated WhatsApp and SMS notifications for upcoming consultation slots, annual vaccination due dates, and post-op follow-ups.",
      icon: Bell,
      badge: "Automated",
    },
    {
      title: "OPD Slot Booking",
      desc: "Real-time doctor calendar scheduler, walk-in management, time-slot allocation, and automated booking confirmations.",
      icon: Calendar,
      badge: "Scheduler",
    },
    {
      title: "Hospital Overview & Queue",
      desc: "Live OPD waiting queue, monthly revenue telemetry, daily patient volume tracking, and real-time clinical indicators.",
      icon: TrendingUp,
      badge: "Analytics",
    },
    {
      title: "Billing & Invoices Ledger",
      desc: "Centralized register of patient invoices, settlement tracking (UPI, Card, Cash), and professional printable receipts.",
      icon: Receipt,
      badge: "Ledger",
    },
    {
      title: "GST Tax Invoicing Engine",
      desc: "Generate tax-compliant GST bills instantly with dynamic line items and automated 18% GST (CGST 9% + SGST 9%) calculations.",
      icon: IndianRupee,
      badge: "18% GST",
    }
  ];

  return (
    <>
      <Helmet>
        <title>Pawtectors - Veterinary Hospital Management System & Pet Care</title>
        <meta 
          name="description" 
          content="Find veterinary clinics and manage your veterinary hospital with Pawtectors Hospital OS: Medical Records, Slot Booking, Patient Reminders, GST Billing, and Super Admin Management." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0b1329] flex flex-col font-sans">
        {/* Classic Header */}
        <Header />

        {/* Hero Section */}
        <HeroSection />

        {/* UPDATED HOSPITAL & SUPER ADMIN GATEWAYS SECTION */}
        <section className="py-20 bg-gradient-to-b from-[#0b1329] via-[#0f1b3b] to-[#0b1329] text-white relative overflow-hidden border-t border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            
            {/* Header / Intro */}
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 px-4 py-2 rounded-full border border-sky-500/20 font-semibold text-xs uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-sky-400" /> Hospital Operating System
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Veterinary Hospital Management & <br className="hidden md:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
                  Clinical Workspace Portals
                </span>
              </h2>
              <p className="text-stone-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                Select your designated access portal to manage hospital clinical records, slot bookings, patient reminders, and GST billing invoices.
              </p>
            </div>

            {/* TWO PRIMARY PORTAL LOGIN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
              
              {/* CARD 1: HOSPITAL LOGIN */}
              <div 
                onClick={() => navigate('/clinic/dashboard')}
                className="group relative rounded-3xl border border-sky-500/30 bg-gradient-to-b from-[#111f42]/90 to-[#0d1733]/90 p-7 text-left transition-all duration-300 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-1.5 cursor-pointer backdrop-blur-xl flex flex-col justify-between"
              >
                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-sky-500/20 border border-sky-500/30 p-3 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Hospital Workspace
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-2">
                      Hospital Login <ArrowRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Veterinary doctors, nurses & hospital admin portal. Access medical records, OPD slot bookings, patient reminder triggers, and GST billing.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>2+ Digital Medical Health Records & Certificates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Automated WhatsApp Reminders & Due Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>OPD Slot Booking & GST Invoicing Engine</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 relative z-10">
                  <button className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2">
                    <span>Enter Hospital Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD 2: SUPER ADMIN LOGIN */}
              <div 
                onClick={() => navigate('/admin/super')}
                className="group relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#211a14]/90 to-[#14100c]/90 p-7 text-left transition-all duration-300 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1.5 cursor-pointer backdrop-blur-xl flex flex-col justify-between"
              >
                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-500/30 p-3 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Root Super Admin
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                      Super Admin Login <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Root system owners & platform superintendents control center. Approve hospital licenses, govern master databases, and platform security.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Hospital Licensure Verifications & Approvals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Master Pet Parent & Doctor Registries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>System Settings & Platform Telemetry Logs</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 relative z-10">
                  <button className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                    <span>Access Super Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* 6 CORE HOSPITAL MODULES GRID */}
            <div className="border-t border-white/10 pt-16">
              <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  6 Core Hospital Management Modules
                </h3>
                <p className="text-stone-400 text-xs sm:text-sm">
                  Engineered specifically for clinical veterinary workflows and hospital administration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitalModules.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={i} 
                      className="bg-white/[0.04] border border-white/10 hover:border-sky-500/40 p-6 rounded-2xl transition-all hover:-translate-y-1 hover:bg-white/[0.07] group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-stone-400 border border-white/10">
                            {feature.badge}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-stone-400 text-xs leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Call To Action Block */}
            <div className="bg-gradient-to-r from-sky-950/60 to-blue-950/60 border border-white/10 text-white rounded-3xl p-8 md:p-10 mt-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="space-y-2 relative z-10 text-center md:text-left">
                <h4 className="text-2xl font-extrabold text-white">Upgrade Your Veterinary Practice Today</h4>
                <p className="text-sky-100/70 text-xs max-w-xl">
                  Take control of electronic medical records, patient vaccination reminders, OPD slot booking, and tax-compliant GST invoicing in minutes.
                </p>
              </div>
              <div className="relative z-10 shrink-0 w-full md:w-auto">
                <Link 
                  to="/clinic/dashboard" 
                  className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 group text-xs uppercase tracking-wider"
                >
                  <span>Launch Hospital Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Classic Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Index;
