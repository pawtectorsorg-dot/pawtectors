import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import dashboardMockup from '@/assets/login_dashboard_mockup.jpg';
import { authApi } from '@/lib/api';

const SystemAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const authResponse = await authApi.login({ email, password });
      
      if (!authResponse || !authResponse.user) {
        setErrors({ submit: 'Invalid admin credentials' });
        setLoading(false);
        return;
      }

      const profileData = await authApi.getProfileByEmail(email);
      
      if (!profileData) {
        setErrors({ submit: 'Admin profile record not found' });
        setLoading(false);
        return;
      }

      if (profileData.role !== 'admin') {
        setErrors({ submit: 'Access Denied: Requires Platform Admin Privilege Level' });
        setLoading(false);
        return;
      }

      const adminSessionData = {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
        isAdmin: true,
        type: 'system',
        full_name: profileData.full_name
      };
      
      sessionStorage.setItem('adminType', 'system');
      sessionStorage.setItem('adminEmail', email);
      sessionStorage.setItem('pawtectors_admin_session', JSON.stringify(adminSessionData));
      
      sessionStorage.setItem('pawtectors_auth', JSON.stringify({
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
        isAdmin: true
      }));
      
      sessionStorage.setItem('pawtectors_admin_login', JSON.stringify({
        ...adminSessionData,
        savedAt: new Date().toISOString()
      }));
      
      navigate('/dashboard/system');
    } catch (error) {
      console.error('[SystemAdminLogin] Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Access Denied.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 md:p-8 font-sans text-stone-850">
      {/* Outer Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Main split-screen container card */}
      <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-slate-200/50 bg-[#faf9f6]/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] md:h-[680px]">
        
        {/* LEFT COLUMN: Login Form Area (radial amber highlight gradient background) */}
        <div className="w-full md:w-[48%] p-6 md:p-10 flex flex-col justify-between bg-gradient-to-tr from-amber-500/10 via-[#faf9f6] to-transparent">
          
          {/* Header Area with Brand logo */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200/80 bg-white/60 shadow-sm backdrop-blur-sm">
              <img
                src={pawtectorsLogo}
                alt="Pawtectors"
                className="w-5 h-5 object-contain"
              />
              <span className="font-semibold text-xs tracking-wide text-stone-800">Pawtectors</span>
            </div>
            
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200/60 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors text-[10px] font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Form Content */}
          <div className="my-auto py-6 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-[9px] uppercase tracking-widest font-extrabold mb-1">
                <Shield className="w-3 h-3" /> System Operator
              </div>
              <h2 className="text-3xl font-display font-extrabold text-stone-900 tracking-tight">Super Admin</h2>
              <p className="text-stone-500 text-xs font-medium">Access platform parameters, clinic registrations & metrics</p>
            </div>

            {errors.submit && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 rounded-2xl">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-xs font-semibold">{errors.submit}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label htmlFor="email" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@pawtectors.com"
                    value={email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive pl-1 mt-0.5">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="password" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    Privilege Password
                  </label>
                  <Link to="/forgot-password" className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`pl-11 pr-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive pl-1 mt-0.5">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 mt-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-bold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all active:scale-[0.98] border-0" 
                disabled={loading}
              >
                {loading ? 'Validating Security Clearances...' : 'Enter System Control Board ➔'}
              </Button>
            </form>
          </div>

          {/* Footer Terms */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-100 pt-4 mt-2">
            <span>Privileged Access Only</span>
            <Link to="/legal-terms" className="hover:underline text-stone-500 font-medium">Platform Terms</Link>
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
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Platform Core Node</span>
              </div>
              <h5 className="text-xs font-bold text-stone-850">System Logs & Metrics</h5>
              <p className="text-[10px] text-stone-500 leading-normal mt-0.5">Access dashboard analytical modules, confirm new clinic signups, configure parameters, and review system logs live.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAdminLogin;