import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Stethoscope, Sparkles, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import dashboardMockup from '@/assets/login_dashboard_mockup.jpg';

const AdminRoleSelect = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Hospital Login',
      subtitle: 'Veterinary Hospital Workspace',
      desc: 'Access Medical Records, Patient Reminders, OPD Slot Booking, Hospital Overview, Billing & GST Invoicing.',
      icon: Stethoscope,
      path: '/clinic/dashboard',
      accent: 'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white',
      badge: 'Hospital Staff & Doctors',
      btnText: 'Enter Hospital Workspace'
    },
    {
      title: 'Super Admin',
      subtitle: 'Platform Control Center',
      desc: 'Platform analytics, approve hospital clinic registrations, manage system settings & master databases.',
      icon: ShieldCheck,
      path: '/admin/super',
      accent: 'from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900',
      badge: 'System Owner',
      btnText: 'Enter Super Admin'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b1329] flex items-center justify-center p-4 md:p-8 font-sans text-stone-100">
      {/* Outer Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main split-screen container card */}
      <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-white/15 bg-[#111a36]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] md:h-[680px]">
        
        {/* LEFT COLUMN: Role Selection Area */}
        <div className="w-full md:w-[50%] p-6 md:p-10 flex flex-col justify-between bg-gradient-to-tr from-sky-500/10 via-[#111a36] to-transparent h-full md:max-h-[680px]">
          
          {/* Header Area with Brand logo */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 shadow-sm backdrop-blur-sm">
              <img
                src={pawtectorsLogo}
                alt="Pawtectors"
                className="w-5 h-5 object-contain"
              />
              <span className="font-bold text-xs tracking-wide text-white">Pawtectors Hospital OS</span>
            </div>
            
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 text-stone-300 hover:text-white hover:bg-white/10 transition-colors text-[10px] font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>

          {/* Selector Content */}
          <div className="my-auto py-4 space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                <Sparkles className="w-3 h-3" /> Select Gateway
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Choose Portal</h2>
              <p className="text-stone-400 text-xs font-medium">Select your designated access level to proceed to your dashboard</p>
            </div>

            {/* Stacked role selectors */}
            <div className="space-y-3.5">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.title}
                    onClick={() => navigate(role.path)}
                    className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition-all duration-300 hover:border-sky-400/50 hover:bg-white/[0.08] hover:-translate-y-0.5 hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon Container */}
                      <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      {/* Text info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                            {role.title}
                          </h3>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-stone-300 border border-white/10">
                            {role.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-normal">
                          {role.desc}
                        </p>
                      </div>
                    </div>

                    <button className="w-full h-9 rounded-xl bg-white/10 group-hover:bg-sky-500 group-hover:text-white text-stone-300 font-bold text-xs transition-all flex items-center justify-center gap-1">
                      <span>{role.btnText}</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Terms */}
          <div className="flex items-center justify-between text-[10px] text-stone-500 border-t border-white/10 pt-4 mt-2 shrink-0">
            <span>Protected by Role-Based Access Control</span>
            <span>256-Bit SSL Security</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Showcase Mockup */}
        <div className="hidden md:block w-[50%] p-3 h-full">
          <div 
            className="relative w-full h-full rounded-[2rem] bg-cover bg-center overflow-hidden flex items-end shadow-inner"
            style={{ backgroundImage: `url(${dashboardMockup})` }}
          >
            {/* Visual overlay shield */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-[#0b1329]/40 to-transparent" />

            {/* Float glass card overlay */}
            <div className="relative z-10 m-6 p-5 bg-[#111a36]/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl w-[92%] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">Unified Hospital System</span>
              </div>
              <h5 className="text-sm font-bold text-white">Full Veterinary Workflow Suite</h5>
              <div className="mt-2 space-y-1 text-[11px] text-stone-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>Medical Records & Certificates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>Automated Patient Reminders</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>OPD Slot Booking & GST Billing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleSelect;