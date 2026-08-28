import { Heart, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-stone-200 py-16 mt-20 border-t border-[#0ea5e9]/20 font-sans" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/5">
          
          {/* Column 1: Brand details (col-span-5) */}
          <div className="md:col-span-5 space-y-5 text-left">
            <div className="flex items-center gap-3">
              <img 
                src={pawtectorsLogo} 
                alt="Pawtectors Logo" 
                className="w-10 h-10 object-contain filter brightness-110"
              />
              <span className="font-bold text-2xl text-white tracking-tight">
                Paw<span className="text-[#0ea5e9]">tectors</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              An all-in-one digital pet healthcare system. Providing clinics with state-of-the-art SaaS workspaces while empowering pet parents to secure their pet's health histories.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#0ea5e9]" />
              <span>Verified Veterinary Clinic Network &bull; Cloud Secured</span>
            </div>
          </div>
          
          {/* Column 2: Quick Links (col-span-3) */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Home Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/clinics" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Verified Clinics</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Clinic OS (SaaS)</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Contact & Support (col-span-4) */}
          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Get in Touch</h4>
            <p className="text-stone-400 text-sm leading-normal">
              Have questions about Clinic OS setup, smart QR tag syncing, or medical logs? Contact our support team.
            </p>
            <div className="space-y-2.5 pt-1">
              <a 
                href="mailto:support@pawtectors.com" 
                className="inline-flex items-center gap-2.5 text-sm bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white hover:bg-[#0ea5e9]/25 hover:border-[#0ea5e9]/35 transition-all font-semibold"
              >
                <Mail className="w-4 h-4 text-[#0ea5e9]" />
                <span>support@pawtectors.com</span>
              </a>
            </div>
          </div>

        </div>
        
        {/* Bottom Section */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>
            © 2025 Pawtectors. All rights reserved. &bull; Designed with <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> for pets.
          </p>
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <a 
              href="https://www.netcraftstudios.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#0ea5e9] hover:text-[#0284c7] transition-colors font-bold"
            >
              NetCraftStudio
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
