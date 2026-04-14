import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { ArrowRight, ArrowLeft, CheckCircle, Globe } from 'lucide-react';

const personalityQuestions = [
  { q: 'You receive conflicting instructions from two seniors. You:', qHi: 'आपको दो सीनियर्स से विरोधाभासी निर्देश मिलते हैं। आप:', options: ['Follow the more senior one', 'Ask both to align', 'Use your own judgment', 'Escalate to someone higher'], optionsHi: ['ज़्यादा सीनियर को फॉलो करें', 'दोनों से बात करवाएं', 'खुद का फैसला लें', 'और ऊपर बात पहुंचाएं'] },
  { q: 'You have 2 hours to learn something completely new. You:', qHi: 'आपके पास कुछ नया सीखने के लिए 2 घंटे हैं। आप:', options: ['Watch a video tutorial', 'Read documentation', 'Try building immediately', 'Find a mentor'], optionsHi: ['वीडियो ट्यूटोरियल देखें', 'डॉक्यूमेंटेशन पढ़ें', 'तुरंत बनाना शुरू करें', 'मेंटर खोजें'] },
  { q: 'A teammate is struggling with their part. You:', qHi: 'एक टीममेट अपने हिस्से में परेशान है। आप:', options: ['Offer help proactively', 'Wait for them to ask', 'Take over their part', 'Suggest they ask the lead'], optionsHi: ['खुद मदद ऑफर करें', 'उनके पूछने का इंतजार करें', 'उनका काम ले लें', 'लीड से पूछने को कहें'] },
  { q: 'Under extreme deadline pressure, you:', qHi: 'बहुत टाइट डेडलाइन में, आप:', options: ['Stay calm and prioritize', 'Work overtime to finish all', 'Cut scope strategically', 'Ask for deadline extension'], optionsHi: ['शांत रहें और प्राथमिकता दें', 'ओवरटाइम करें', 'स्कोप कम करें', 'डेडलाइन बढ़ाने को कहें'] },
  { q: 'Your biggest strength is:', qHi: 'आपकी सबसे बड़ी ताकत है:', options: ['Analytical thinking', 'Communication', 'Creativity', 'Persistence'], optionsHi: ['विश्लेषणात्मक सोच', 'संचार कौशल', 'रचनात्मकता', 'दृढ़ता'] },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = (location.state as any)?.name || 'Student';
  const { domain, language, login, setLanguage } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';

  const [step, setStep] = useState(0);
  const [personalityStep, setPersonalityStep] = useState(0);
  const [form, setForm] = useState({
    state: '', city: '', college: '', specialization: '', year: '', dreamCompany: '', dreamJob: '', targetSalary: '', timeline: '6',
    answers: Array(5).fill(-1),
  });

  // Steps: 0=personal, 1=academic, 2=target (with dream job), 3=personality (one at a time)
  const totalSteps = 4;

  const handleFinish = () => {
    login({
      name: userName, state: form.state, city: form.city, college: form.college,
      domain, specialization: form.specialization, year: form.year,
      dreamCompany: form.dreamCompany, dreamJob: form.dreamJob,
      targetSalary: form.targetSalary, timeline: form.timeline,
      personalityScore: { iq: 65, eq: 72, rq: 58 },
      weakPoints: [],
    });
    navigate('/dashboard');
  };

  const handlePersonalityAnswer = (optIdx: number) => {
    const a = [...form.answers];
    a[personalityStep] = optIdx;
    setForm({ ...form, answers: a });
    if (personalityStep < personalityQuestions.length - 1) {
      setTimeout(() => setPersonalityStep(personalityStep + 1), 300);
    }
  };

  const allPersonalityAnswered = form.answers.every(a => a >= 0);
  const inputClass = "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button onClick={() => setLanguage(isHi ? 'en' : 'hi')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Globe className="w-3.5 h-3.5" />
            {isHi ? 'English' : 'हिंदी'}
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-accent' : 'bg-border'}`} />
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{isHi ? 'व्यक्तिगत जानकारी' : 'Personal Details'}</h2>
              <p className="text-sm text-muted-foreground">{isHi ? `नमस्ते ${userName}, आइए आपकी प्रोफाइल सेट करें` : `Hi ${userName}, let's set up your profile`}</p>
              <input placeholder={isHi ? 'राज्य' : 'State'} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} />
              <input placeholder={isHi ? 'शहर / इलाका' : 'City / Locality'} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
              <input placeholder={isHi ? 'कॉलेज का नाम' : 'College name'} value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className={inputClass} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{isHi ? 'शैक्षिक जानकारी' : 'Academic Info'}</h2>
              <p className="text-sm text-muted-foreground">{isHi ? 'डोमेन' : 'Domain'}: <span className="text-accent font-medium">{isHi ? config.labelHi : config.label}</span></p>
              <input placeholder={isHi ? 'विशेषज्ञता (जैसे, Computer Science)' : 'Specialization (e.g., Computer Science)'} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={inputClass} />
              <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputClass}>
                <option value="">{isHi ? 'वर्तमान वर्ष / स्थिति' : 'Current year / status'}</option>
                <option value="1st Year">{isHi ? 'प्रथम वर्ष' : '1st Year'}</option>
                <option value="2nd Year">{isHi ? 'द्वितीय वर्ष' : '2nd Year'}</option>
                <option value="3rd Year">{isHi ? 'तृतीय वर्ष' : '3rd Year'}</option>
                <option value="Final Year">{isHi ? 'अंतिम वर्ष' : 'Final Year'}</option>
                <option value="Graduate">{isHi ? 'स्नातक' : 'Graduate'}</option>
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{isHi ? 'आपका लक्ष्य' : 'Your Target'}</h2>
              <input placeholder={isHi ? `सपनों की नौकरी (जैसे, Software Developer)` : `Dream job role (e.g., Software Developer, Bank PO, IAS Officer)`}
                value={form.dreamJob} onChange={(e) => setForm({ ...form, dreamJob: e.target.value })} className={inputClass} />
              <input placeholder={isHi ? `सपनों की ${domain === 'arts' ? 'सेवा' : 'कंपनी'}` : `Dream ${domain === 'arts' ? 'service' : 'company'} (e.g., ${config.companies[0]})`}
                value={form.dreamCompany} onChange={(e) => setForm({ ...form, dreamCompany: e.target.value })} className={inputClass} />
              <input placeholder={isHi ? 'लक्ष्य पैकेज / वेतन' : 'Target package / salary'} value={form.targetSalary} onChange={(e) => setForm({ ...form, targetSalary: e.target.value })} className={inputClass} />
              <div className="space-y-2">
                <label className="text-sm font-medium">{isHi ? 'समयरेखा' : 'Timeline'}</label>
                <div className="flex gap-2">
                  {['3', '6', '12'].map((t) => (
                    <button key={t} onClick={() => setForm({ ...form, timeline: t })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.timeline === t ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground'}`}>
                      {t} {isHi ? 'महीने' : 'months'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">{isHi ? 'व्यक्तित्व जांच' : 'Quick Personality Check'}</h2>
              <p className="text-sm text-muted-foreground">{isHi ? `प्रश्न ${personalityStep + 1} / ${personalityQuestions.length}` : `Question ${personalityStep + 1} of ${personalityQuestions.length}`}</p>
              
              {/* Progress dots */}
              <div className="flex gap-2 justify-center">
                {personalityQuestions.map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < personalityStep ? 'bg-accent' : i === personalityStep ? 'bg-accent scale-125' : 'bg-border'}`} />
                ))}
              </div>

              {/* Current question */}
              <div className="space-y-3 animate-fade-in" key={personalityStep}>
                <p className="text-sm font-medium">{isHi ? personalityQuestions[personalityStep].qHi : personalityQuestions[personalityStep].q}</p>
                <div className="grid grid-cols-1 gap-2">
                  {(isHi ? personalityQuestions[personalityStep].optionsHi : personalityQuestions[personalityStep].options).map((opt, oi) => (
                    <button key={oi} onClick={() => handlePersonalityAnswer(oi)}
                      className={`text-sm py-3 px-4 rounded-xl border transition-all text-left ${form.answers[personalityStep] === oi ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                {/* Navigation within personality */}
                {personalityStep > 0 && (
                  <button onClick={() => setPersonalityStep(personalityStep - 1)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> {isHi ? 'पिछला' : 'Previous'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> {isHi ? 'पीछे' : 'Back'}
              </button>
            ) : <div />}
            {step < totalSteps - 1 ? (
              <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover-scale">
                {isHi ? 'अगला' : 'Next'} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={!allPersonalityAnswered}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover-scale disabled:opacity-40">
                <CheckCircle className="w-4 h-4" /> {isHi ? 'मेरी प्रोफाइल बनाएं' : 'Generate My Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
