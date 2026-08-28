import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Lock, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ProviderLoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onOTPRequest?: (phone: string) => Promise<{ success: boolean; error?: string }>;
  onOTPVerify?: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  categoryTitle?: string;
}

const ProviderLogin = ({ onLogin, onOTPRequest, onOTPVerify, categoryTitle }: ProviderLoginProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await onLogin(email, password);
    
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: result.error || "Invalid credentials",
      });
    }
    
    setIsLoading(false);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onOTPRequest || !onOTPVerify) return;
    setIsLoading(true);

    if (!showOTPInput) {
      const result = await onOTPRequest(phone);
      
      if (result.success) {
        setShowOTPInput(true);
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send OTP",
          description: result.error,
        });
      }
    } else {
      const result = await onOTPVerify(phone, otp);
      
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: result.error || "Invalid OTP",
        });
      }
    }
    
    setIsLoading(false);
  };

  const hasOTPHandlers = !!(onOTPRequest && onOTPVerify);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Dynamic Glow Orbs */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Colorful top border strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500" />

        <CardHeader className="text-center space-y-4 pt-10 pb-2">
          <div className="flex justify-center">
            {/* Soft pulsing ring wrapper for logo */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-md group-hover:bg-cyan-500/30 transition-all duration-300 scale-95 group-hover:scale-105" />
              <div className="relative w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                <img
                  src={pawtectorsLogo}
                  alt="Pawtectors"
                  className="w-11 h-11 object-contain filter drop-shadow-[0_0_6px_rgba(14,165,233,0.4)]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              <Sparkles className="w-3 h-3" /> Secure Access
            </div>
            <CardTitle className="font-display text-2xl text-white">
              {categoryTitle || 'Clinic'} <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Provider Login</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Sign in to manage your workspace and appointments
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-8 px-6">
          <Tabs defaultValue="email" className="space-y-6">
            {hasOTPHandlers && (
              <TabsList className="grid w-full grid-cols-2 rounded-full h-11 p-1 bg-slate-950 border border-slate-850">
                <TabsTrigger value="email" className="rounded-full text-xs text-slate-400 data-[state=active]:bg-slate-900 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm transition-all duration-300">
                  <Mail className="w-3.5 h-3.5 mr-2" />
                  Email Address
                </TabsTrigger>
                <TabsTrigger value="phone" className="rounded-full text-xs text-slate-400 data-[state=active]:bg-slate-900 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm transition-all duration-300">
                  <Phone className="w-3.5 h-3.5 mr-2" />
                  Phone OTP
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="email" className="outline-none focus:outline-none">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Sign In to Workspace'
                  )}
                </Button>
              </form>
            </TabsContent>

            {hasOTPHandlers && (
              <TabsContent value="phone" className="outline-none focus:outline-none">
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold text-slate-300">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                        disabled={showOTPInput}
                        required
                      />
                    </div>
                  </div>
                  
                  {showOTPInput && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="otp" className="text-xs font-semibold text-slate-300">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="rounded-xl text-center text-lg tracking-widest bg-slate-950/80 border-slate-800 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20"
                        maxLength={6}
                        required
                      />
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {showOTPInput ? 'Verifying...' : 'Sending OTP...'}
                      </>
                    ) : showOTPInput ? (
                      'Verify OTP Code'
                    ) : (
                      'Send OTP Code'
                    )}
                  </Button>
                  
                  {showOTPInput && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full rounded-xl text-slate-400 hover:text-white hover:bg-slate-850" 
                      onClick={() => {
                        setShowOTPInput(false);
                        setOtp('');
                      }}
                    >
                      Change phone number
                    </Button>
                  )}
                </form>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderLogin;
