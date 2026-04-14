import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStationStore, domainConfig, type Domain } from '@/store/useStationStore';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Cpu, Landmark, BookOpen, ArrowRight, Globe, Mail, Lock, User, Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const domainIcons = { engineering: Cpu, commerce: Landmark, arts: BookOpen };

export default function Login() {
  const navigate = useNavigate();
  const { domain, setDomain, language, setLanguage, login } = useStationStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const isHi = language === 'hi';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadProfileAndNavigate(session.user.id);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadProfileAndNavigate(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfileAndNavigate = async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      login({
        name: profile.name || 'Student',
        state: '', city: profile.city || '', college: profile.college || '',
        domain: (profile.domain as Domain) || 'engineering',
        specialization: profile.specialization || '', year: '',
        dreamCompany: profile.dream_company || '', dreamJob: '', targetSalary: '', timeline: '',
        personalityScore: { iq: 50, eq: 50, rq: 50 }, weakPoints: [],
      });
      navigate('/dashboard');
    } else {
      navigate('/onboarding', { state: { name: 'Student' } });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, domain } },
      });
      if (err) { setError(err.message); setLoading(false); return; }
      toast.success(isHi ? 'ईमेल पर पुष्टि लिंक भेजा गया!' : 'Confirmation link sent to your email!');
      setIsLogin(true);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message || 'Google sign-in failed');
      setGoogleLoading(false);
      return;
    }
    if (result.redirected) return;
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-primary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-sidebar-primary blur-3xl" />
        </div>
        <div className="relative z-10 text-primary-foreground text-center px-12 max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-accent/20 backdrop-blur flex items-center justify-center border border-accent/30">
            {(() => { const Icon = domainIcons[domain]; return <Icon className="w-10 h-10 text-accent" />; })()}
          </div>
          <h2 className="text-4xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            STATION
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-6">
            {isHi ? domainConfig[domain].affirmationHi : domainConfig[domain].affirmation}
          </p>
          <div className="flex gap-3 justify-center">
            {(['engineering', 'commerce', 'arts'] as Domain[]).map((d) => {
              const Icon = domainIcons[d];
              return (
                <button key={d} onClick={() => setDomain(d)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-medium transition-all border ${
                    domain === d
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-primary-foreground/20 text-primary-foreground/60 hover:border-primary-foreground/40'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {isHi ? domainConfig[d].labelHi : domainConfig[d].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Language toggle */}
          <div className="flex justify-end mb-6">
            <button onClick={() => setLanguage(isHi ? 'en' : 'hi')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-3.5 h-3.5" /> {isHi ? 'English' : 'हिंदी'}
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {isLogin ? (isHi ? 'वापसी पर स्वागत है' : 'Welcome back') : (isHi ? 'अकाउंट बनाएं' : 'Create your account')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? (isHi ? 'अपनी तैयारी जारी रखें' : 'Sign in to continue your preparation journey')
                : (isHi ? 'अपनी प्लेसमेंट यात्रा शुरू करें' : 'Start your placement preparation journey')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button onClick={handleGoogleSignIn} disabled={googleLoading}
            className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-medium flex items-center justify-center gap-3 hover:bg-muted transition-colors disabled:opacity-50 mb-6">
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {isLogin
              ? (isHi ? 'Google से साइन इन करें' : 'Continue with Google')
              : (isHi ? 'Google से साइन अप करें' : 'Sign up with Google')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {isHi ? 'या' : 'or'}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Domain selector (signup only, mobile) */}
          {!isLogin && (
            <div className="flex gap-2 mb-5 lg:hidden">
              {(['engineering', 'commerce', 'arts'] as Domain[]).map((d) => {
                const Icon = domainIcons[d];
                return (
                  <button key={d} onClick={() => setDomain(d)}
                    className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 text-xs font-medium border transition-all ${
                      domain === d ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50'
                    }`}>
                    <Icon className="w-4 h-4" />
                    {isHi ? domainConfig[d].labelHi : domainConfig[d].label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input type="text" placeholder={isHi ? 'आपका पूरा नाम' : 'Full name'} value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" required />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input type="email" placeholder={isHi ? 'ईमेल' : 'Email address'} value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" required />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input type={showPassword ? 'text' : 'password'} placeholder={isHi ? 'पासवर्ड' : 'Password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? <LogIn className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              {isLogin ? (isHi ? 'साइन इन करें' : 'Sign in') : (isHi ? 'अकाउंट बनाएं' : 'Create account')}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-sm text-center text-muted-foreground mt-6">
            {isLogin ? (isHi ? 'खाता नहीं है?' : "Don't have an account?") : (isHi ? 'पहले से खाता है?' : 'Already have an account?')}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-accent font-semibold hover:underline underline-offset-2">
              {isLogin ? (isHi ? 'साइन अप करें' : 'Sign up') : (isHi ? 'साइन इन करें' : 'Sign in')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
