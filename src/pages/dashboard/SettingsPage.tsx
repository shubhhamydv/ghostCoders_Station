import { useState } from 'react';
import { useStationStore } from '@/store/useStationStore';
import { Bell, Shield, User, Globe, ChevronDown, ChevronUp, Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, logout } = useStationStore();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({ daily: true, weekly: true, rank: false, social: true });
  const [language, setLanguage] = useState('English');
  const [privacy, setPrivacy] = useState({ profilePublic: true, showRank: true, showActivity: false });
  const [accountForm, setAccountForm] = useState({ name: user?.name || '', email: '', password: '' });
  const [saved, setSaved] = useState('');

  const handleSave = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  const sections = [
    {
      key: 'account', icon: User, title: 'Account', desc: 'Update your name, email, and password',
      content: (
        <div className="space-y-3">
          <input placeholder="Full Name" value={accountForm.name} onChange={(e) => setAccountForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
          <input placeholder="Email" type="email" value={accountForm.email} onChange={(e) => setAccountForm(p => ({ ...p, email: e.target.value }))} className={inputClass} />
          <input placeholder="New Password" type="password" value={accountForm.password} onChange={(e) => setAccountForm(p => ({ ...p, password: e.target.value }))} className={inputClass} />
          <button onClick={() => handleSave('account')} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale">
            {saved === 'account' ? <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span> : 'Save Changes'}
          </button>
        </div>
      ),
    },
    {
      key: 'notifications', icon: Bell, title: 'Notifications', desc: 'Daily reminders, weekly reports, rank updates',
      content: (
        <div className="space-y-3">
          {([
            { key: 'daily' as const, label: 'Daily study reminders' },
            { key: 'weekly' as const, label: 'Weekly progress reports' },
            { key: 'rank' as const, label: 'Rank change alerts' },
            { key: 'social' as const, label: 'Social feed updates' },
          ]).map(n => (
            <div key={n.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-sm">{n.label}</span>
              <button onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                className={`w-12 h-6 rounded-full transition-all relative ${notifications[n.key] ? 'bg-accent' : 'bg-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-card shadow absolute top-0.5 transition-all ${notifications[n.key] ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
          <button onClick={() => handleSave('notifications')} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale">
            {saved === 'notifications' ? <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span> : 'Save Preferences'}
          </button>
        </div>
      ),
    },
    {
      key: 'language', icon: Globe, title: 'Language & Region', desc: 'Preferred language and locality settings',
      content: (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <div className="flex gap-2">
              {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'].map(l => (
                <button key={l} onClick={() => setLanguage(l)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${language === l ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 text-sm">
            <p>Region: {user?.city || 'Not set'}, {user?.state || 'Not set'}</p>
            <p className="text-xs text-muted-foreground mt-1">Update in Profile to change locality-based features</p>
          </div>
          <button onClick={() => handleSave('language')} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale">
            {saved === 'language' ? <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span> : 'Save Settings'}
          </button>
        </div>
      ),
    },
    {
      key: 'privacy', icon: Shield, title: 'Privacy', desc: 'Manage data visibility and profile sharing',
      content: (
        <div className="space-y-3">
          {([
            { key: 'profilePublic' as const, label: 'Make profile visible to others' },
            { key: 'showRank' as const, label: 'Show rank on leaderboard' },
            { key: 'showActivity' as const, label: 'Show study activity to followers' },
          ]).map(p => (
            <div key={p.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-sm">{p.label}</span>
              <button onClick={() => setPrivacy(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                className={`w-12 h-6 rounded-full transition-all relative ${privacy[p.key] ? 'bg-accent' : 'bg-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-card shadow absolute top-0.5 transition-all ${privacy[p.key] ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
          <button onClick={() => handleSave('privacy')} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale">
            {saved === 'privacy' ? <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span> : 'Save Settings'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Settings</h1>
      {sections.map((s) => (
        <div key={s.key} className="bg-card rounded-xl border border-border overflow-hidden">
          <button onClick={() => toggle(s.key)} className="w-full p-5 flex items-center gap-4 text-left hover:bg-muted/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <s.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            {expanded === s.key ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {expanded === s.key && (
            <div className="px-5 pb-5 border-t border-border pt-4 animate-fade-in">
              {s.content}
            </div>
          )}
        </div>
      ))}

      {/* Logout */}
      <button onClick={handleLogout} className="w-full py-3 rounded-xl border border-destructive text-destructive font-medium flex items-center justify-center gap-2 hover:bg-destructive/5 transition-all">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
}
