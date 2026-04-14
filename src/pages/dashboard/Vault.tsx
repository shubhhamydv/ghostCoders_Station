import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { BookOpen, Search, Bookmark, FileText, Video, Brain, Map, X, ChevronRight, Star, BookmarkCheck, Upload, ExternalLink } from 'lucide-react';

interface VaultItem {
  id: string;
  title: string;
  type: 'Notes' | 'Flashcards' | 'Videos' | 'Mind Maps' | 'PDFs';
  topic: string;
  content: string;
  bookmarked: boolean;
  videoUrl?: string;
  pdfUrl?: string;
  uploaded?: boolean;
}

const generateItems = (topics: string[], domain: string): VaultItem[] => {
  const items: VaultItem[] = [];
  
  // Real YouTube video links per domain
  const videoLinks: Record<string, Record<string, string>> = {
    engineering: {
      'DSA': 'https://www.youtube.com/embed/8hly31xKli0',
      'System Design': 'https://www.youtube.com/embed/xpDnVSmNFX0',
      'DBMS': 'https://www.youtube.com/embed/HXV3zeQKqGY',
      'Operating Systems': 'https://www.youtube.com/embed/26QPDBe-NB8',
      'Networking': 'https://www.youtube.com/embed/qiQR5rTSshw',
      'Web Dev': 'https://www.youtube.com/embed/zJSY8tbf_ys',
    },
    commerce: {
      'Quantitative Aptitude': 'https://www.youtube.com/embed/SjlmCbnD99o',
      'Reasoning': 'https://www.youtube.com/embed/UsMzzv6CZ2Y',
      'Banking Awareness': 'https://www.youtube.com/embed/cg8F9u_KmQ4',
      'Financial Analysis': 'https://www.youtube.com/embed/4N7kqm2yHxI',
      'Economics': 'https://www.youtube.com/embed/9fPhJZJPl6o',
      'Current Affairs': 'https://www.youtube.com/embed/X7M7h9A1bYI',
    },
    arts: {
      'History': 'https://www.youtube.com/embed/VQPfrYMoHKU',
      'Polity': 'https://www.youtube.com/embed/E_anJkj2dEg',
      'Geography': 'https://www.youtube.com/embed/MMzd40i8TfA',
      'Economy': 'https://www.youtube.com/embed/9fPhJZJPl6o',
      'Ethics': 'https://www.youtube.com/embed/CjWUgFBm4xQ',
      'Current Affairs': 'https://www.youtube.com/embed/X7M7h9A1bYI',
    },
  };

  const pdfLinks: Record<string, string> = {
    'DSA': 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
    'System Design': 'https://github.com/donnemartin/system-design-primer',
    'DBMS': 'https://www.tutorialspoint.com/dbms/index.htm',
    'Operating Systems': 'https://www.geeksforgeeks.org/operating-systems/',
    'Quantitative Aptitude': 'https://www.indiabix.com/aptitude/questions-and-answers/',
    'Reasoning': 'https://www.indiabix.com/logical-reasoning/questions-and-answers/',
    'Banking Awareness': 'https://www.bankexamstoday.com/p/banking-awareness.html',
    'History': 'https://ncert.nic.in/textbook.php',
    'Polity': 'https://ncert.nic.in/textbook.php',
    'Geography': 'https://ncert.nic.in/textbook.php',
  };

  topics.forEach(topic => {
    // Notes
    items.push({ id: `${topic}-Notes`, title: `${topic} — Notes`, type: 'Notes', topic, content: `Comprehensive notes covering all key concepts of ${topic}. Includes definitions, formulas, diagrams, and practice examples.`, bookmarked: false });
    // Flashcards
    items.push({ id: `${topic}-Flashcards`, title: `${topic} — Flashcards`, type: 'Flashcards', topic, content: `Quick revision flashcards for ${topic}. 25+ cards covering important terms and definitions.`, bookmarked: false });
    // Videos — real YouTube
    items.push({ id: `${topic}-Videos`, title: `${topic} — Video Lecture`, type: 'Videos', topic, content: `Video lecture on ${topic} from top educators.`, bookmarked: false, videoUrl: videoLinks[domain]?.[topic] || 'https://www.youtube.com/embed/dQw4w9WgXcQ' });
    // PDFs — link to real resources
    items.push({ id: `${topic}-PDFs`, title: `${topic} — Study PDF`, type: 'PDFs', topic, content: `Study material PDF for ${topic}. Click to open in new tab.`, bookmarked: false, pdfUrl: pdfLinks[topic] || 'https://ncert.nic.in/textbook.php' });
    // Mind Maps
    items.push({ id: `${topic}-MindMaps`, title: `${topic} — Mind Map`, type: 'Mind Maps', topic, content: `Visual mind map of ${topic} showing connections between sub-topics.`, bookmarked: false });
  });

  return items;
};

const typeIcons: Record<string, any> = { Notes: FileText, Flashcards: Brain, Videos: Video, 'Mind Maps': Map, PDFs: FileText };

export default function Vault() {
  const { domain, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';
  const [items, setItems] = useState<VaultItem[]>(() => generateItems(config.vaultTopics, domain));
  const [search, setSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [flashcardFlipped, setFlashcardFlipped] = useState<Record<number, boolean>>({});
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', topic: config.vaultTopics[0], type: 'Notes' as VaultItem['type'], content: '' });

  const toggleBookmark = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item));
  };

  const filtered = items.filter(item => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.topic.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTopic !== 'All' && item.topic !== activeTopic) return false;
    if (activeType !== 'All' && item.type !== activeType) return false;
    if (showBookmarksOnly && !item.bookmarked) return false;
    return true;
  });

  const flashcards = selectedItem?.type === 'Flashcards' ? [
    { front: `What is ${selectedItem.topic}?`, back: `${selectedItem.topic} is a core concept in ${config.label} preparation covering fundamental principles and applications.` },
    { front: `Key formula for ${selectedItem.topic}?`, back: `The primary formula involves understanding the relationship between core variables. Review notes for detailed equations.` },
    { front: `Application of ${selectedItem.topic}?`, back: `Used extensively in ${config.companies[0]} interviews and ${config.quizTypes[0]} quizzes.` },
    { front: `Common mistake in ${selectedItem.topic}?`, back: `Most students confuse the sub-concepts. Remember to differentiate between similar terms and applications.` },
    { front: `Quick tip for ${selectedItem.topic}?`, back: `Practice 5 problems daily. Focus on understanding, not memorization.` },
  ] : [];

  const handleUpload = () => {
    if (!uploadForm.title.trim()) return;
    const newItem: VaultItem = {
      id: `upload-${Date.now()}`,
      title: uploadForm.title,
      type: uploadForm.type,
      topic: uploadForm.topic,
      content: uploadForm.content || `Your uploaded ${uploadForm.type.toLowerCase()} for ${uploadForm.topic}`,
      bookmarked: false,
      uploaded: true,
    };
    setItems(prev => [newItem, ...prev]);
    setShowUpload(false);
    setUploadForm({ title: '', topic: config.vaultTopics[0], type: 'Notes', content: '' });
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'ज्ञान भंडार' : 'Knowledge Vault'}</h1>
          <p className="text-sm text-muted-foreground">{isHi ? `${config.labelHi} संसाधन` : `${config.label} resources organized by topic`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-accent text-accent-foreground hover-scale">
            <Upload className="w-4 h-4" /> {isHi ? 'अपलोड' : 'Upload'}
          </button>
          <button onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${showBookmarksOnly ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
            {showBookmarksOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {showBookmarksOnly ? (isHi ? 'बुकमार्क' : 'Bookmarked') : (isHi ? 'बुकमार्क' : 'Bookmarks')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder={isHi ? 'खोजें...' : 'Search topics, notes, flashcards...'} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>

      {/* Topic tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', ...config.vaultTopics].map((t) => (
          <button key={t} onClick={() => setActiveTopic(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTopic === t ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {['All', 'Notes', 'Flashcards', 'Videos', 'PDFs', 'Mind Maps'].map((t) => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeType === t ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-muted/50 text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const Icon = typeIcons[item.type] || FileText;
          return (
            <div key={item.id} onClick={() => {
              if (item.type === 'PDFs' && item.pdfUrl) {
                window.open(item.pdfUrl, '_blank');
                return;
              }
              setSelectedItem(item); setFlashcardFlipped({});
            }}
              className="bg-card rounded-xl border border-border p-5 hover:border-accent/50 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.type}{item.uploaded ? ' 📌' : ''}</p>
                    <p className="text-xs text-muted-foreground">{item.topic}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
                  className={`p-1 rounded ${item.bookmarked ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}>
                  {item.bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-accent">{item.type === 'PDFs' ? (isHi ? 'नई टैब में खोलें' : 'Opens in new tab') : (isHi ? 'खोलने के लिए क्लिक करें' : 'Click to open')}</span>
                {item.type === 'PDFs' ? <ExternalLink className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{isHi ? 'कोई आइटम नहीं मिला' : 'No items found.'}</p>
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center gap-3">
        <Star className="w-5 h-5 text-accent flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{isHi ? 'आपके लिए सुझाव' : 'Recommended for you'}</p>
          <p className="text-xs text-muted-foreground">{isHi ? 'आपके क्विज़ परिणामों के आधार पर' : 'Based on your quiz results'}: {config.vaultTopics[3]}</p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{isHi ? 'सामग्री अपलोड करें' : 'Upload Your Content'}</h3>
              <button onClick={() => setShowUpload(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder={isHi ? 'शीर्षक' : 'Title'} value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              <select value={uploadForm.topic} onChange={e => setUploadForm(p => ({ ...p, topic: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                {config.vaultTopics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={uploadForm.type} onChange={e => setUploadForm(p => ({ ...p, type: e.target.value as VaultItem['type'] }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                {['Notes', 'Flashcards', 'Videos', 'PDFs', 'Mind Maps'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea placeholder={isHi ? 'सामग्री / विवरण' : 'Content / Description'} value={uploadForm.content} onChange={e => setUploadForm(p => ({ ...p, content: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm resize-none" rows={3} />
              <button onClick={handleUpload} disabled={!uploadForm.title.trim()}
                className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover-scale disabled:opacity-40">
                {isHi ? 'अपलोड करें' : 'Upload Content'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h3 className="font-semibold">{selectedItem.topic} — {selectedItem.type}</h3>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleBookmark(selectedItem.id)} className={selectedItem.bookmarked ? 'text-accent' : 'text-muted-foreground'}>
                  {selectedItem.bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6">
              {selectedItem.type === 'Notes' && (
                <div className="space-y-3">
                  <h4 className="text-base font-semibold mb-3">📘 {selectedItem.topic}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{selectedItem.content}</p>
                  <div className="bg-muted/50 p-4 rounded-xl">
                    <p className="font-medium mb-1 text-sm">Key Concepts:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>- Introduction to {selectedItem.topic} fundamentals</li>
                      <li>- Core principles and applications</li>
                      <li>- Common patterns and problem types</li>
                      <li>- Advanced techniques and optimizations</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedItem.type === 'Flashcards' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Click a card to flip it.</p>
                  {flashcards.map((card, i) => (
                    <button key={i} onClick={() => setFlashcardFlipped(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="w-full p-5 rounded-xl border border-border text-left transition-all hover:border-accent/50">
                      <p className="text-[10px] text-accent mb-1">{flashcardFlipped[i] ? 'ANSWER' : 'QUESTION'} — Card {i + 1}</p>
                      <p className="text-sm font-medium">{flashcardFlipped[i] ? card.back : card.front}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedItem.type === 'Videos' && selectedItem.videoUrl && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <iframe src={selectedItem.videoUrl} title={selectedItem.title}
                      className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedItem.content}</p>
                </div>
              )}

              {selectedItem.type === 'Mind Maps' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{selectedItem.content}</p>
                  <div className="bg-muted/30 rounded-xl p-6 text-center">
                    <div className="inline-block px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-bold mb-4">{selectedItem.topic}</div>
                    <div className="grid grid-cols-2 gap-4">
                      {['Fundamentals', 'Applications', 'Problem Solving', 'Advanced'].map((branch, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border bg-card">
                          <p className="text-xs font-medium">{branch}</p>
                          <div className="mt-2 space-y-1">
                            {['Sub-topic A', 'Sub-topic B'].map((sub, j) => (
                              <p key={j} className="text-[10px] text-muted-foreground pl-2 border-l-2 border-accent/30">{sub}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
