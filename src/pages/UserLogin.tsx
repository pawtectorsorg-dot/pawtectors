import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RateLimitWarning from '@/components/RateLimitWarning';
import AuthTroubleshooting from '@/components/AuthTroubleshooting';
import { User, Mail, Phone, MapPin, Lock, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import dashboardMockup from '@/assets/login_dashboard_mockup.jpg';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const UserLogin = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    petType: '',
    petName: '',
    petBreed: '',
    petAge: '',
    vaccinationDate: '',
    medicalRecords: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRateLimit, setShowRateLimit] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Login validation
  const validateLogin = () => {
    const newErrors: Record<string, string> = {};

    if (!loginForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!loginForm.password.trim()) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  // Signup validation
  const validateSignup = () => {
    const newErrors: Record<string, string> = {};

    if (!signupForm.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!signupForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!signupForm.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(signupForm.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    if (!signupForm.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!signupForm.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!signupForm.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!signupForm.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^[1-9][0-9]{5}$/.test(signupForm.pincode)) {
      newErrors.pincode = 'PIN code must be 6 digits starting with 1-9';
    }

    if (!signupForm.petType.trim()) {
      newErrors.petType = 'Pet type is required';
    } else if (!['dog', 'cat', 'Dog', 'Cat'].includes(signupForm.petType)) {
      newErrors.petType = 'Only Dog and Cat are allowed';
    }

    if (!signupForm.petName.trim()) {
      newErrors.petName = 'Pet name is required';
    }

    if (!signupForm.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (signupForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateLogin();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      console.log('Login attempt:', { email: loginForm.email.trim(), passwordLength: loginForm.password.length });
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        const errorMessage = error.message || 'Sign in failed';
        console.error('Login error:', errorMessage);
        setErrors({ submit: errorMessage });
        
        // Track failures and show troubleshooting after 2 failed attempts
        setFailureCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 2) {
            setShowTroubleshooting(true);
          }
          return newCount;
        });
        
        // Show rate limit warning if it's a rate limiting error
        if (errorMessage.toLowerCase().includes('too many')) {
          setShowRateLimit(true);
        }
      } else {
        console.log('Login successful');
        setSuccessMessage('Login successful! Redirecting to your dashboard...');
        // Reset failure count on success
        setFailureCount(0);
        setShowTroubleshooting(false);
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateSignup();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      console.log('Signup attempt:', { 
        email: signupForm.email.trim(), 
        name: signupForm.name.trim(),
        mobileNumber: signupForm.mobileNumber.trim(),
        passwordLength: signupForm.password.length 
      });
      
      const composedAddress = [signupForm.address, signupForm.landmark, signupForm.city, signupForm.state, signupForm.pincode]
        .filter(Boolean)
        .join(', ');

      const { error } = await signUp(signupForm.email, signupForm.password, {
        full_name: signupForm.name,
        mobile_number: signupForm.mobileNumber,
        address: composedAddress,
        city: signupForm.city,
        state: signupForm.state,
        pincode: signupForm.pincode,
        preferred_location: signupForm.city,
        pet_name: signupForm.petName,
        pet_type: signupForm.petType,
        pet_breed: signupForm.petBreed,
        pet_age: signupForm.petAge,
        vaccination_date: signupForm.vaccinationDate,
        medical_records: signupForm.medicalRecords,
      });
      
      if (error) {
        const errorMessage = error.message || 'Registration failed';
        console.error('Signup error:', errorMessage);
        setErrors({ submit: errorMessage });
        
        // Track failures and show troubleshooting after 2 failed attempts
        setFailureCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 2) {
            setShowTroubleshooting(true);
          }
          return newCount;
        });
        
        // Show rate limit warning if it's a rate limiting error
        if (errorMessage.toLowerCase().includes('too many')) {
          setShowRateLimit(true);
        }
      } else {
        console.log('Signup successful');
        setSuccessMessage('Registration successful! Taking you to your dashboard...');
        // Reset failure count on success
        setFailureCount(0);
        setShowTroubleshooting(false);
        // Auto-login done by AuthContext, redirect to pet parent dashboard
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSignupChange = (field: string, value: string) => {
    if (field === 'mobileNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    if (field === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    setSignupForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePincodeLookup = async (pincode: string) => {
    const clean = pincode.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) return;

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
      if (!response.ok) return;
      const data = await response.json();
      const office = Array.isArray(data) && data[0]?.PostOffice?.[0];
      if (!office) return;

      const cityValue = office.District || office.Name || signupForm.city || '';
      const stateValue = office.State || signupForm.state || '';

      setSignupForm(prev => ({
        ...prev,
        pincode: clean,
        city: cityValue,
        state: stateValue,
      }));
    } catch (error) {
      console.error('Pincode lookup failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 md:p-8 font-sans text-stone-850">
      {/* Outer Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Main split-screen container card */}
      <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-slate-200/50 bg-[#faf9f6]/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] md:h-[680px]">
        
        {/* LEFT COLUMN: Login/Signup Form Area */}
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

          {/* Form Content Wrapper */}
          <div className="flex-grow flex flex-col justify-center min-h-0">
            <div className="mb-4 shrink-0">
              <h2 className="text-3xl font-display font-extrabold text-stone-900 tracking-tight">Pet Parent Portal</h2>
              <p className="text-stone-500 text-xs font-medium">Access medical histories, immunization feeds & book OPD visits</p>
            </div>

            <RateLimitWarning 
              show={showRateLimit} 
              onDismiss={() => setShowRateLimit(false)} 
            />
            
            <AuthTroubleshooting
              show={showTroubleshooting}
              errorMessage={errors.submit || ''}
              onRetry={() => {
                setErrors({});
                setShowTroubleshooting(false);
                setFailureCount(0);
              }}
              onDismiss={() => setShowTroubleshooting(false)}
            />
            
            {errors.submit && (
              <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-700 rounded-2xl shrink-0">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-xs font-semibold">
                  {errors.submit}
                  {errors.submit.toLowerCase().includes('too many') && (
                    <div className="mt-1 text-[10px] text-red-650 leading-normal">
                      💡 Wait 2-3 minutes before attempting to retry credentials.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-4 bg-emerald-50 border-emerald-200 text-emerald-700 rounded-2xl shrink-0">
                <AlertCircle className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-xs font-semibold">{successMessage}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 rounded-full h-11 p-1 bg-stone-105 border border-stone-250 mb-4 shrink-0">
                <TabsTrigger value="login" className="rounded-full text-xs font-bold text-stone-500 data-[state=active]:bg-white data-[state=active]:text-stone-900 transition-all shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full text-xs font-bold text-stone-500 data-[state=active]:bg-white data-[state=active]:text-stone-900 transition-all shadow-sm">Sign Up</TabsTrigger>
              </TabsList>

              {/* Scrollable Form Body Container to keep height fixed */}
              <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin max-h-[300px] md:max-h-[350px]">
                
                {/* LOGIN TAB */}
                <TabsContent value="login" className="outline-none focus:outline-none py-1 space-y-4">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label htmlFor="login-email" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="parent@email.com"
                          value={loginForm.email}
                          onChange={(e) => handleLoginChange('email', e.target.value)}
                          className={`pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.email ? 'border-destructive' : ''}`}
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive pl-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between px-1">
                        <label htmlFor="login-password" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                          Password
                        </label>
                        <Link to="/forgot-password" className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => handleLoginChange('password', e.target.value)}
                          className={`pl-11 pr-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.password ? 'border-destructive' : ''}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                          tabIndex={-1}
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive pl-1">{errors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 mt-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-bold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all active:scale-[0.98] border-0" 
                      disabled={loading}
                    >
                      {loading ? 'Authenticating...' : 'Sign In to Portal ➔'}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGNUP TAB */}
                <TabsContent value="signup" className="outline-none focus:outline-none py-1 space-y-4">
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label htmlFor="name" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={signupForm.name}
                          onChange={(e) => handleSignupChange('name', e.target.value)}
                          className={`pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.name ? 'border-destructive' : ''}`}
                          required
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-destructive pl-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="signup-email" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={signupForm.email}
                          onChange={(e) => handleSignupChange('email', e.target.value)}
                          className={`pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.email ? 'border-destructive' : ''}`}
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive pl-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="mobile" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={signupForm.mobileNumber}
                          onChange={(e) => handleSignupChange('mobileNumber', e.target.value)}
                          className={`pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.mobileNumber ? 'border-destructive' : ''}`}
                          maxLength={10}
                          required
                        />
                      </div>
                      {errors.mobileNumber && (
                        <p className="text-xs text-destructive pl-1">{errors.mobileNumber}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="address" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Address
                      </label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="House number, street, area"
                        value={signupForm.address}
                        onChange={(e) => handleSignupChange('address', e.target.value)}
                        className={`h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.address ? 'border-destructive' : ''}`}
                        required
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive pl-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label htmlFor="city" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                          City
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                          <Input
                            id="city"
                            type="text"
                            placeholder="Your city"
                            value={signupForm.city}
                            onChange={(e) => handleSignupChange('city', e.target.value)}
                            className={`pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.city ? 'border-destructive' : ''}`}
                            required
                          />
                        </div>
                        {errors.city && (
                          <p className="text-xs text-destructive pl-1">{errors.city}</p>
                        )}
                      </div>
                      <div className="space-y-1 text-left">
                        <label htmlFor="state" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                          State
                        </label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="Your state"
                          value={signupForm.state}
                          onChange={(e) => handleSignupChange('state', e.target.value)}
                          className={`h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.state ? 'border-destructive' : ''}`}
                          required
                        />
                        {errors.state && (
                          <p className="text-xs text-destructive pl-1">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="landmark" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Landmark (Optional)
                      </label>
                      <Input
                        id="landmark"
                        type="text"
                        placeholder="e.g., Near City Mall"
                        value={signupForm.landmark}
                        onChange={(e) => handleSignupChange('landmark', e.target.value)}
                        className="h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="pincode" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        PIN Code
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="pincode"
                          type="text"
                          placeholder="6-digit PIN code"
                          value={signupForm.pincode}
                          onChange={(e) => handleSignupChange('pincode', e.target.value)}
                          onBlur={(e) => handlePincodeLookup(e.target.value)}
                          className={`pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.pincode ? 'border-destructive' : ''}`}
                          maxLength={6}
                          required
                        />
                      </div>
                      {errors.pincode && (
                        <p className="text-xs text-destructive pl-1">{errors.pincode}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="petType" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Pet Type
                      </label>
                      <select
                        id="petType"
                        value={signupForm.petType}
                        onChange={(e) => handleSignupChange('petType', e.target.value)}
                        className={`flex h-12 w-full rounded-full border border-stone-200 bg-white/60 text-stone-900 px-4 py-2 text-xs focus:border-amber-400 focus:ring-amber-400/20 focus-visible:outline-none ${errors.petType ? 'border-destructive' : ''}`}
                        required
                      >
                        <option value="">Select pet type</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                      </select>
                      {errors.petType && (
                        <p className="text-xs text-destructive pl-1">{errors.petType}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label htmlFor="petName" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                          Pet Name
                        </label>
                        <Input
                          id="petName"
                          type="text"
                          placeholder="Pet name"
                          value={signupForm.petName}
                          onChange={(e) => handleSignupChange('petName', e.target.value)}
                          className={`h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.petName ? 'border-destructive' : ''}`}
                          required
                        />
                        {errors.petName && (
                          <p className="text-xs text-destructive pl-1">{errors.petName}</p>
                        )}
                      </div>
                      <div className="space-y-1 text-left">
                        <label htmlFor="petAge" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                          Pet Age
                        </label>
                        <Input
                          id="petAge"
                          type="text"
                          placeholder="e.g. 2 years"
                          value={signupForm.petAge}
                          onChange={(e) => handleSignupChange('petAge', e.target.value)}
                          className="h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label htmlFor="petBreed" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                          Breed
                        </label>
                        <Input
                          id="petBreed"
                          type="text"
                          placeholder="Breed"
                          value={signupForm.petBreed}
                          onChange={(e) => handleSignupChange('petBreed', e.target.value)}
                          className="h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label htmlFor="vaccinationDate" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                          Vaccination Date
                        </label>
                        <Input
                          id="vaccinationDate"
                          type="date"
                          value={signupForm.vaccinationDate}
                          onChange={(e) => handleSignupChange('vaccinationDate', e.target.value)}
                          className="h-12 bg-white/60 border-stone-200 text-stone-900 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="medicalRecords" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Medical Records
                      </label>
                      <textarea
                        id="medicalRecords"
                        value={signupForm.medicalRecords}
                        onChange={(e) => handleSignupChange('medicalRecords', e.target.value)}
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-2xl border border-stone-200 bg-white/60 text-stone-900 px-3 py-2 text-xs focus:border-amber-400 focus:ring-amber-400/20 focus-visible:outline-none placeholder:text-stone-450 shadow-inner"
                        placeholder="Allergies, conditions, past treatments, etc."
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="signup-password" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={signupForm.password}
                          onChange={(e) => handleSignupChange('password', e.target.value)}
                          className={`pl-11 pr-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.password ? 'border-destructive' : ''}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((prev) => !prev)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                          tabIndex={-1}
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive pl-1">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <label htmlFor="confirm-password" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => handleSignupChange('confirmPassword', e.target.value)}
                          className={`pl-11 pr-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner ${errors.confirmPassword ? 'border-destructive' : ''}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-destructive pl-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 mt-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-bold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all active:scale-[0.98] border-0" 
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Sign Up As Pet Parent ➔'}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer Terms */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-100 pt-4 mt-2 shrink-0">
            <span>Pawtectors Pet Network</span>
            <Link to="/legal-terms" className="hover:underline text-stone-500 font-medium">Terms & Conditions</Link>
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
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Global Pet Locator</span>
              </div>
              <h5 className="text-xs font-bold text-stone-850">Your Pet's Complete Care Ecosystem</h5>
              <p className="text-[10px] text-stone-500 leading-normal mt-0.5">Secure QR collar tags, live medical history updates, and unified booking with the city's top veterinary clinics and partner animal centers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
