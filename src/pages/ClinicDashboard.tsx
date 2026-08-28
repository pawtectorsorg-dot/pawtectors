import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '@/components/Footer';
import ProviderLogin from '@/components/ProviderLogin';
import ProviderDashboard from '@/components/ProviderDashboard';
import { useProviderAuth } from '@/hooks/useProviderAuth';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import dashboardMockup from '@/assets/login_dashboard_mockup.jpg';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ClinicDashboard = () => {
  const { user, provider, isLoading, signInWithEmail, signInWithOTP, verifyOTP, signOut } = useProviderAuth();
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);

  const handleDashboardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginErrors({});
    const res = await signInWithEmail(loginEmail, loginPassword);
    if (!res.success) {
      setLoginErrors({ submit: res.error || 'Login failed' });
    }
    setLoginLoading(false);
  };

  const isAuthorized = user && provider && provider.category === 'clinic';
  const isWrongCategory = user && provider && provider.category !== 'clinic';

  useEffect(() => {
    if (isWrongCategory) {
      signOut();
    }
  }, [isWrongCategory, signOut]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Clinic Dashboard - Pawtectors</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 md:p-8 font-sans text-stone-850 relative overflow-hidden">
        {/* Outer Ambient Glows */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-[130px] pointer-events-none" />

        {/* Main split-screen container card */}
        <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-slate-200/50 bg-[#faf9f6]/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] md:h-[680px]">
          
          {/* LEFT COLUMN: Login Form Area */}
          <div className="w-full md:w-[48%] p-6 md:p-10 flex flex-col justify-between bg-gradient-to-tr from-amber-500/10 via-[#faf9f6] to-transparent h-full md:max-h-[680px]">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200/80 bg-white/60 shadow-sm backdrop-blur-sm">
                <img src={pawtectorsLogo} alt="Pawtectors" className="w-5 h-5 object-contain" />
                <span className="font-semibold text-xs tracking-wide text-stone-800">Pawtectors</span>
              </div>
              <button onClick={() => navigate('/admin')} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200/60 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors text-[10px] font-bold">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            <div className="my-auto py-6 space-y-6 flex-grow flex flex-col justify-center min-h-0">
              {isAuthorized ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-stone-900">Signed In Successfully</h2>
                  <p className="text-xs text-stone-500">Welcome back to the provider management panel.</p>
                  <Button onClick={signOut} className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white font-bold h-11 border-0">Sign Out</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-extrabold text-stone-900 tracking-tight">Clinic Workspace</h2>
                    <p className="text-stone-500 text-xs font-medium">Sign in to manage appointments & patient parent registers</p>
                  </div>

                  {loginErrors.submit && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 rounded-2xl shrink-0">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-xs font-semibold">{loginErrors.submit}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleDashboardLogin} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label htmlFor="login-email-c" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">Doctor / Admin Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input id="login-email-c" type="email" placeholder="doctor@vetclinic.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner" required />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between px-1">
                        <label htmlFor="login-password-c" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Password</label>
                        <Link to="/forgot-password" className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 hover:underline">Forgot password?</Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input id="login-password-c" type={showLoginPassword ? 'text' : 'password'} placeholder="Enter password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="pl-11 pr-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner" required />
                        <button type="button" onClick={() => setShowLoginPassword(prev => !prev)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600" tabIndex={-1}>
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 mt-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-bold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all active:scale-[0.98] border-0" disabled={loginLoading}>
                      {loginLoading ? 'Authenticating Clinic...' : 'Access Clinic OS Dashboard ➔'}
                    </Button>
                  </form>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-100 pt-4 mt-2 shrink-0">
              <span>Veterinary SaaS Platform</span>
              <Link to="/legal-terms" className="hover:underline text-stone-500 font-medium">Terms</Link>
            </div>
          </div>

          <div className="hidden md:block w-[52%] p-3 h-full">
            <div className="relative w-full h-full rounded-[2rem] bg-cover bg-center overflow-hidden flex items-end shadow-inner" style={{ backgroundImage: `url(${dashboardMockup})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />
              <div className="relative z-10 m-6 p-4 bg-white/75 backdrop-blur-md border border-white/25 rounded-2xl shadow-xl w-[90%] max-w-sm transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Active Workspace Sync</span>
                </div>
                <h5 className="text-xs font-bold text-stone-850">Realtime Clinic Admin Workspace</h5>
                <p className="text-[10px] text-stone-500 leading-normal mt-0.5 font-sans">Manage consultations, vaccination schedules, medicines, invoices, and keep patient files fully updated live.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClinicDashboard;
