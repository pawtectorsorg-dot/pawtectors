import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Stethoscope, Sparkles, ArrowLeft, ChevronRight } from 'lucide-react';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import dashboardMockup from '@/assets/login_dashboard_mockup.jpg';

const AdminRoleSelect = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Super Admin',
      subtitle: 'Platform Control Center',
      desc: 'Platform analytics, approve veterinary clinic registrations, manage system settings & system-wide database records.',
      icon: ShieldCheck,
      path: '/admin/super',
      accent: 'from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900',
      badge: 'System Owner',
      btnText: 'Enter Super Admin ➔'
    },
    {
      title: 'Clinic OS (VMP)',
      subtitle: 'Veterinary SaaS Workspace',
      desc: 'OPD appointments scheduler, digital medical health records, GST billing invoices & clinic slot configurations.',
      icon: Stethoscope,
      path: '/admin/provider',
      accent: 'from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900',
      badge: 'Veterinary Clinic',
      btnText: 'Clinic Workspace Access ➔'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 md:p-8 font-sans text-stone-850">
      {/* Outer Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Main split-screen container card */}
      <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-slate-200/50 bg-[#faf9f6]/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] md:h-[680px]">
        
        {/* LEFT COLUMN: Role Selection Area (radial amber highlight gradient background) */}
        <div className="w-full md:w-[48%] p-6 md:p-10 flex flex-col justify-between bg-gradient-to-tr from-amber-500/10 via-[#faf9f6] to-transparent h-full md:max-h-[680px]">
          
          {/* Header Area with Brand logo */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200/80 bg-white/60 shadow-sm backdrop-blur-sm">
              <img
                src={pawtectorsLogo}
                alt="Pawtectors"
                className="w-5 h-5 object-contain"
              />
              <span className="font-semibold text-xs tracking-wide text-stone-800">Pawtectors</span>
            </div>
            
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200/60 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors text-[10px] font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>

          {/* Selector Content */}
          <div className="my-auto py-4 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                <Sparkles className="w-3 h-3" /> Gateway
              </div>
              <h2 className="text-3xl font-display font-extrabold text-stone-900 tracking-tight">Select Workspace</h2>
              <p className="text-stone-500 text-xs font-medium">Choose your authorization role to enter your dedicated management portal</p>
            </div>

            {/* Stacked role selectors */}
            <div className="space-y-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.title}
                    onClick={() => navigate(role.path)}
                    className="group relative rounded-3xl border border-stone-200/80 bg-white/60 p-5 text-left transition-all duration-300 hover:border-amber-400 hover:bg-white hover:-translate-y-0.5 hover:shadow-lg cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon Container */}
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      {/* Text info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                            {role.title}
                          </h3>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                            {role.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-normal">
                          {role.desc}
                        </p>
                      </div>
                    </div>

                    <button className="w-full h-10 rounded-full bg-stone-100 group-hover:bg-amber-400 group-hover:text-stone-900 text-stone-600 font-bold text-xs transition-colors flex items-center justify-center gap-1">
                      {role.btnText} <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Terms */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-100 pt-4 mt-2 shrink-0">
            <span>Protected by Role-Based Access Control</span>
            <Link to="/legal-terms" className="hover:underline text-stone-500 font-medium">Terms</Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Product Showcase Graphics Mock */}
        <div className="hidden md:block w-[52%] p-3 h-full">
          <div 
            className="relative w-full h-full rounded-[2rem] bg-cover bg-center overflow-hidden flex items-end shadow-inner"
            style={{ backgroundImage: `url(${dashboardMockup})` }}
          >
            {/* Visual overlay shield */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />

            {/* Float glass card overlay */}
            <div className="relative z-10 m-6 p-4 bg-white/75 backdrop-blur-md border border-white/25 rounded-2xl shadow-xl w-[90%] max-w-sm transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Global Pet Network</span>
              </div>
              <h5 className="text-xs font-bold text-stone-850">Crextio-Style Unified Management</h5>
              <p className="text-[10px] text-stone-500 leading-normal mt-0.5">Access platform parameters, verify clinic licenses, configure database properties, or enter your doctor portal securely from a unified login system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleSelect;