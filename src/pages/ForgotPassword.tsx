import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email');

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // 1. Send Reset OTP / Link
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      // Simulate/Trigger reset OTP request
      await new Promise((r) => setTimeout(r, 800));
      setInfo(`We have sent a verification code to ${email}`);
      setStep('otp');
    } catch {
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter a valid verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setStep('reset');
    } catch {
      setError('Invalid code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setStep('done');
      setTimeout(() => navigate('/login'), 2500);
    } catch {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950 overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/85 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] animate-scale-in overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500" />
        
        <CardHeader className="text-center space-y-4 pt-8 pb-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <KeyRound className="w-8 h-8 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <span className="font-display font-bold text-2xl text-white tracking-tight">
                Paw<span className="text-sky-400">tectors</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 mt-1">Account Recovery Portal</p>
          </div>
          
          {/* Step Progress Bar */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {['email', 'otp', 'reset', 'done'].map((s, idx) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step === s ? 'w-8 bg-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.8)]' : 
                  ['email', 'otp', 'reset', 'done'].indexOf(step) > idx ? 'w-4 bg-sky-600' : 'w-4 bg-slate-800'
                }`}
              />
            ))}
          </div>

          <CardTitle className="text-xl font-display text-white">
            {step === 'email' && 'Forgot Password?'}
            {step === 'otp' && 'Enter Verification Code'}
            {step === 'reset' && 'Create New Password'}
            {step === 'done' && 'Password Updated!'}
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            {step === 'email' && 'Enter your registered email to receive a recovery code'}
            {step === 'otp' && 'Enter the code sent to your email inbox'}
            {step === 'reset' && 'Set a strong password for your Pawtectors account'}
            {step === 'done' && 'Your password has been successfully reset'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-800 text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {info && step === 'otp' && (
            <Alert className="bg-sky-950/50 border-sky-800 text-sky-300">
              <CheckCircle2 className="h-4 w-4 text-sky-400" />
              <AlertDescription className="text-xs">{info}</AlertDescription>
            </Alert>
          )}

          {/* STEP 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-sky-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:ring-sky-400/20 rounded-xl"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/25 border-0" disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Verification Code</label>
                <Input
                  type="text"
                  placeholder="Enter code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-12 text-center text-lg font-mono tracking-widest bg-slate-950/60 border-slate-800 text-slate-100 focus:border-sky-400 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/25 border-0" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code ➔'}
              </Button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-slate-400 hover:text-sky-400 text-center w-full"
              >
                Change Email
              </button>
            </form>
          )}

          {/* STEP 3: Reset */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-sky-400" />
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 rounded-xl"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3.5 top-3.5 text-slate-400">
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-sky-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 rounded-xl"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/25 border-0" disabled={loading}>
                {loading ? 'Updating Password...' : 'Save New Password'}
              </Button>
            </form>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-sky-400" />
              </div>
              <p className="text-sm text-slate-300">
                Your password has been successfully updated. Redirecting you to login...
              </p>
            </div>
          )}

          {step !== 'done' && (
            <Button
              variant="ghost"
              className="w-full mt-4 gap-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-800/50 text-xs"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;