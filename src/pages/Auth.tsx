import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
    }
    setLoading(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isLogin ? 'Sign in to continue your preparation' : 'Join Station and start your journey'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover-scale disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-accent font-medium hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
