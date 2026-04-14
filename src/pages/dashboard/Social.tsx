import { useState, useEffect, useMemo } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Users, TrendingUp, MapPin, Trophy, Send, Heart, MessageCircle, Share2, UserPlus, X, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  showComments: boolean;
}

interface Comment {
  author: string;
  text: string;
  time: string;
}

const initialPosts = (feed: string[], userName: string): Post[] => [
  ...feed.map((msg, i) => ({
    id: i + 1,
    author: msg.split('(')[0]?.trim() || `Student ${i + 1}`,
    avatar: msg.charAt(0),
    content: msg,
    time: `${(i + 1) * 12}m ago`,
    likes: Math.floor(Math.random() * 50) + 5,
    liked: false,
    comments: [
      { author: 'Rahul', text: 'Congratulations! Keep it up! 🎉', time: '5m ago' },
    ],
    showComments: false,
  })),
];

export default function Social() {
  const { domain, user, rank, tasksDone, language } = useStationStore();
  const config = domainConfig[domain];
  const userName = user?.name || 'You';
  const isHi = language === 'hi';

  const [posts, setPosts] = useState<Post[]>(() => initialPosts(config.socialFeed, userName));
  const [newPost, setNewPost] = useState('');
  const [newComments, setNewComments] = useState<Record<number, string>>({});
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ author: string; text: string; self: boolean }[]>([
    { author: 'Study Bot', text: `Welcome to ${config.label} community chat! Ask questions, share tips, or find study partners.`, self: false },
    { author: 'Ankit', text: 'Anyone preparing for interviews next month?', self: false },
    { author: 'Sneha', text: `I just finished ${config.vaultTopics[0]} revision. Happy to help!`, self: false },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [following, setFollowing] = useState<Set<string>>(new Set());

  // Real-time leaderboard from DB — same as Home
  const [dbLeaderboard, setDbLeaderboard] = useState<{ name: string; score: number; city: string }[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, score, city')
        .order('score', { ascending: false })
        .limit(10);
      if (data && data.length > 0) {
        setDbLeaderboard(data.map(d => ({ name: d.name || 'Anonymous', score: d.score || 0, city: d.city || '' })));
      }
    };
    fetchLeaderboard();

    const channel = supabase
      .channel('social-leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const leaderboard = useMemo(() => {
    if (dbLeaderboard.length > 0) {
      const entries = dbLeaderboard.map(d => ({ name: d.name, score: d.score, locality: d.city || user?.city || 'Your Area' }));
      const userName = user?.name || 'You';
      if (!entries.find(e => e.name === userName)) {
        const userScore = 100 + tasksDone * 5;
        entries.push({ name: userName, score: userScore, locality: user?.city || 'Your Area' });
        entries.sort((a, b) => b.score - a.score);
      }
      return entries.slice(0, 8);
    }
    return [];
  }, [dbLeaderboard, user, tasksDone]);

  const handlePost = () => {
    if (!newPost.trim()) return;
    setPosts(prev => [{
      id: Date.now(),
      author: userName,
      avatar: userName.charAt(0),
      content: newPost,
      time: 'Just now',
      likes: 0,
      liked: false,
      comments: [],
      showComments: false,
    }, ...prev]);
    setNewPost('');
  };

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const toggleComments = (id: number) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, showComments: !p.showComments } : p
    ));
  };

  const addComment = (id: number) => {
    const text = newComments[id]?.trim();
    if (!text) return;
    setPosts(prev => prev.map(p =>
      p.id === id ? {
        ...p,
        comments: [...p.comments, { author: userName, text, time: 'Just now' }],
      } : p
    ));
    setNewComments(prev => ({ ...prev, [id]: '' }));
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { author: userName, text: chatInput, self: true }]);
    setChatInput('');
    setTimeout(() => {
      const responses = [
        `Great question! For ${config.label}, I'd recommend focusing on ${config.vaultTopics[0]} first.`,
        'Keep pushing! Consistency is key.',
        `Check out the ${config.weeklyTopics[0]} resources in the Knowledge Vault!`,
      ];
      setChatMessages(prev => [...prev, {
        author: ['Ankit', 'Sneha', 'Riya', 'Vikram', 'Study Bot'][Math.floor(Math.random() * 5)],
        text: responses[Math.floor(Math.random() * responses.length)],
        self: false,
      }]);
    }, 1500);
  };

  const toggleFollow = (name: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'सोशल हब' : 'Social Hub'}</h1>
          <p className="text-sm text-muted-foreground">{isHi ? 'समान लक्ष्य वाले छात्रों से जुड़ें' : 'Connect with students preparing for the same goals'}</p>
        </div>
        <button onClick={() => setShowChat(true)} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-2">
          <MessageCircle className="w-4 h-4" /> {isHi ? 'कम्युनिटी चैट' : 'Community Chat'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: isHi ? 'समान भूमिका' : 'Same Role', value: '847 students' },
          { icon: MapPin, label: isHi ? 'आपके क्षेत्र' : 'In Your Area', value: '124 students' },
          { icon: Trophy, label: isHi ? 'आपका रैंक' : 'Your Rank', value: `#${rank}` },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create Post */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex-1">
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
              placeholder={isHi ? 'अपनी प्रगति साझा करें...' : 'Share your progress, ask a question, or motivate others...'}
              className="w-full p-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" rows={3} />
            <div className="flex justify-end mt-2">
              <button onClick={handlePost} disabled={!newPost.trim()}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale disabled:opacity-40 flex items-center gap-2">
                <Send className="w-4 h-4" /> {isHi ? 'पोस्ट' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-card rounded-2xl border border-border p-5 animate-fade-in">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">{post.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{post.author}</span>
                    <span className="text-xs text-muted-foreground ml-2">{post.time}</span>
                  </div>
                  {post.author !== userName && (
                    <button onClick={() => toggleFollow(post.author)}
                      className={`flex items-center gap-1 text-xs px-3 py-1 rounded-lg transition-all ${following.has(post.author) ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground hover:bg-accent/10'}`}>
                      <UserPlus className="w-3 h-3" />
                      {following.has(post.author) ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
                <p className="text-sm mt-1">{post.content}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-t border-border pt-3">
              <button onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 text-xs transition-all ${post.liked ? 'text-accent font-medium' : 'text-muted-foreground hover:text-accent'}`}>
                <Heart className={`w-4 h-4 ${post.liked ? 'fill-accent' : ''}`} /> {post.likes}
              </button>
              <button onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-all">
                <MessageCircle className="w-4 h-4" /> {post.comments.length}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-all">
                <Share2 className="w-4 h-4" /> {isHi ? 'शेयर' : 'Share'}
              </button>
            </div>
            {post.showComments && (
              <div className="mt-3 pl-4 border-l-2 border-border space-y-3 animate-fade-in">
                {post.comments.map((c, ci) => (
                  <div key={ci} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold flex-shrink-0">{c.author.charAt(0)}</div>
                    <div>
                      <span className="text-xs font-medium">{c.author}</span>
                      <span className="text-xs text-muted-foreground ml-1">{c.time}</span>
                      <p className="text-xs mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={newComments[post.id] || ''} onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)} placeholder={isHi ? 'टिप्पणी लिखें...' : 'Write a comment...'}
                    className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-accent" />
                  <button onClick={() => addComment(post.id)} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs hover-scale">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Leaderboard — same as Home */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Trophy className="w-4 h-4 text-accent" /> {isHi ? 'लीडरबोर्ड' : 'Leaderboard'} — {user?.city || 'Your Area'}</h3>
        <div className="space-y-1.5">
          {leaderboard.map((entry, i) => {
            const isUser = entry.name === (user?.name || 'You');
            return (
              <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${isUser ? 'bg-accent/10 border border-accent/30' : 'bg-muted/30'}`}>
                <span className="w-5 text-center font-bold text-[10px]">
                  {i === 0 ? <Medal className="w-3.5 h-3.5 text-accent mx-auto" /> : `#${i + 1}`}
                </span>
                <span className="flex-1 font-medium">{entry.name} {isUser && <span className="text-accent text-[10px]">({isHi ? 'आप' : 'You'})</span>}</span>
                {entry.locality && <span className="text-[10px] text-muted-foreground">{entry.locality}</span>}
                <span className="text-[10px] text-muted-foreground">{entry.score} pts</span>
                {!isUser && (
                  <button onClick={() => toggleFollow(entry.name)}
                    className={`text-xs px-2 py-1 rounded-lg ${following.has(entry.name) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}>
                    <UserPlus className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
          {leaderboard.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">{isHi ? 'लॉग इन करें लीडरबोर्ड देखने के लिए' : 'Login to see the leaderboard'}</p>
          )}
        </div>
      </div>

      {/* Community Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowChat(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2"><MessageCircle className="w-4 h-4 text-accent" /> {config.label} {isHi ? 'कम्युनिटी चैट' : 'Community Chat'}</h3>
              <button onClick={() => setShowChat(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.self ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                    {!msg.self && <p className="text-[10px] font-bold mb-1">{msg.author}</p>}
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder={isHi ? 'संदेश लिखें...' : 'Type a message...'}
                className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              <button onClick={sendChat} disabled={!chatInput.trim()}
                className="px-4 py-2 rounded-xl bg-accent text-accent-foreground hover-scale disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
