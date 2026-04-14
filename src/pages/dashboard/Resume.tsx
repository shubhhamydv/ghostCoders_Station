import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { FileText, CheckCircle, AlertCircle, Download, X, Plus, Trash2, Eye, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { streamChat } from '@/lib/ai';

interface ResumeData {
  objective: string;
  education: { degree: string; college: string; year: string; gpa: string }[];
  skills: string[];
  experience: { title: string; company: string; duration: string; desc: string }[];
  projects: { name: string; desc: string; tech: string }[];
  achievements: string[];
}

export default function Resume() {
  const { domain, user } = useStationStore();
  const config = domainConfig[domain];
  const [selectedTemplate, setSelectedTemplate] = useState<'Classic' | 'Minimal' | 'Bold'>('Classic');
  const [showPreview, setShowPreview] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [resume, setResume] = useState<ResumeData>({
    objective: '',
    education: [{ degree: user?.specialization || '', college: user?.college || '', year: user?.year || '', gpa: '' }],
    skills: [],
    experience: [{ title: '', company: '', duration: '', desc: '' }],
    projects: [{ name: '', desc: '', tech: '' }],
    achievements: [''],
  });

  const atsChecks = [
    { ok: !!(user?.name), text: 'Contact information', tip: 'Add your full name in profile' },
    { ok: resume.skills.length >= 3, text: 'At least 3 skills listed', tip: 'Add relevant skills' },
    { ok: resume.objective.length > 20, text: 'Career objective written', tip: 'Write a clear objective' },
    { ok: resume.education[0].college.length > 0, text: 'Education details', tip: 'Add your college' },
    { ok: resume.projects[0].name.length > 0, text: 'At least one project', tip: 'Add a project' },
    { ok: resume.experience[0].title.length > 0, text: 'Experience or internship', tip: 'Add experience' },
    { ok: (resume.achievements[0]?.length || 0) > 0, text: 'Achievements listed', tip: 'Add achievements' },
  ];

  const atsScore = Math.round((atsChecks.filter(c => c.ok).length / atsChecks.length) * 100);

  const addSkill = () => {
    if (newSkill.trim() && !resume.skills.includes(newSkill.trim())) {
      setResume(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  // AI Analyzer
  const [analyzerText, setAnalyzerText] = useState('');
  const [analyzerResult, setAnalyzerResult] = useState('');
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const analyzeResume = async () => {
    if (!analyzerText.trim()) return;
    setAnalyzerLoading(true);
    setAnalyzerResult('');
    let full = '';
    await streamChat({
      messages: [{ role: 'user', content: `Analyze this resume for an Indian ${config.label} student targeting ${user?.dreamCompany || 'top companies'}. Give ATS score out of 100, strengths, weaknesses, missing keywords, and specific improvement suggestions. Be detailed and actionable.\n\nResume:\n${analyzerText}` }],
      mode: 'resume-analysis',
      onDelta: (chunk) => { full += chunk; setAnalyzerResult(full); },
      onDone: () => setAnalyzerLoading(false),
      onError: () => { setAnalyzerResult('Failed to analyze. Please try again.'); setAnalyzerLoading(false); },
    });
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume</h1>
          <p className="text-sm text-muted-foreground">Build, analyze, and optimize your resume</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowAnalyzer(false); setShowBuilder(!showBuilder); }} className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${!showAnalyzer ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            <FileText className="w-4 h-4" /> Builder
          </button>
          <button onClick={() => { setShowBuilder(false); setShowAnalyzer(!showAnalyzer); }} className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${showAnalyzer ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            <Sparkles className="w-4 h-4" /> AI Analyzer
          </button>
        </div>
      </div>

      {/* AI Resume Analyzer */}
      {showAnalyzer && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center">
            <h2 className="text-xl font-bold">AI Resume Analyzer</h2>
            <p className="text-sm text-muted-foreground">Upload your resume text to get instant AI-powered feedback and improvement suggestions.</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Paste Resume Text</p>
              <p className="text-xs text-muted-foreground">{analyzerText.length} characters</p>
            </div>
            <textarea value={analyzerText} onChange={e => setAnalyzerText(e.target.value)}
              placeholder="Paste your resume content here (Experience, Projects, Skills...)"
              className="w-full px-4 py-3 rounded-xl border border-input bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" rows={8} />
          </div>

          <button onClick={analyzeResume} disabled={!analyzerText.trim() || analyzerLoading}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-40">
            {analyzerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze with AI <ArrowRight className="w-4 h-4" />
          </button>

          {analyzerResult && (
            <div className="bg-card rounded-2xl border border-border p-5 animate-fade-in">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4 text-accent" /> AI Analysis</h3>
              <div className="prose prose-sm max-w-none text-sm [&_strong]:text-accent [&_h2]:text-base [&_h3]:text-sm [&_h2]:font-semibold">
                <ReactMarkdown>{analyzerResult}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATS Score */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">ATS Readiness</h3>
          <span className={`text-2xl font-bold ${atsScore >= 70 ? 'text-accent' : 'text-destructive'}`}>{atsScore}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all ${atsScore >= 70 ? 'bg-accent' : 'bg-destructive'}`} style={{ width: `${atsScore}%` }} />
        </div>
        <div className="space-y-2">
          {atsChecks.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.ok ? <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
              <span className={item.ok ? '' : 'text-muted-foreground'}>{item.text}</span>
              {!item.ok && <span className="text-[10px] text-destructive ml-auto">{item.tip}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Resume Builder */}
      {showBuilder && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-sm mb-2">Career Objective</h4>
            <textarea value={resume.objective} onChange={(e) => setResume(prev => ({ ...prev, objective: e.target.value }))}
              placeholder="Write a brief career objective in your own words..."
              className={`${inputClass} resize-none`} rows={3} />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-sm mb-2">Education</h4>
            {resume.education.map((edu, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Degree / Program" value={edu.degree} onChange={(e) => {
                  const n = [...resume.education]; n[i] = { ...n[i], degree: e.target.value }; setResume(prev => ({ ...prev, education: n }));
                }} className={inputClass} />
                <input placeholder="College / University" value={edu.college} onChange={(e) => {
                  const n = [...resume.education]; n[i] = { ...n[i], college: e.target.value }; setResume(prev => ({ ...prev, education: n }));
                }} className={inputClass} />
                <input placeholder="Year" value={edu.year} onChange={(e) => {
                  const n = [...resume.education]; n[i] = { ...n[i], year: e.target.value }; setResume(prev => ({ ...prev, education: n }));
                }} className={inputClass} />
                <input placeholder="GPA / Percentage" value={edu.gpa} onChange={(e) => {
                  const n = [...resume.education]; n[i] = { ...n[i], gpa: e.target.value }; setResume(prev => ({ ...prev, education: n }));
                }} className={inputClass} />
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-sm mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {resume.skills.map(s => (
                <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-accent/10 text-accent text-xs">
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Add a skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()} className={inputClass} />
              <button onClick={addSkill} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Projects</h4>
              <button onClick={() => setResume(prev => ({ ...prev, projects: [...prev.projects, { name: '', desc: '', tech: '' }] }))}
                className="text-xs text-accent flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {resume.projects.map((proj, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 mb-3 pb-3 border-b border-border last:border-0">
                <input placeholder="Project name" value={proj.name} onChange={(e) => {
                  const n = [...resume.projects]; n[i] = { ...n[i], name: e.target.value }; setResume(prev => ({ ...prev, projects: n }));
                }} className={inputClass} />
                <input placeholder="Description" value={proj.desc} onChange={(e) => {
                  const n = [...resume.projects]; n[i] = { ...n[i], desc: e.target.value }; setResume(prev => ({ ...prev, projects: n }));
                }} className={inputClass} />
                <input placeholder="Technologies used" value={proj.tech} onChange={(e) => {
                  const n = [...resume.projects]; n[i] = { ...n[i], tech: e.target.value }; setResume(prev => ({ ...prev, projects: n }));
                }} className={inputClass} />
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Experience / Internships</h4>
              <button onClick={() => setResume(prev => ({ ...prev, experience: [...prev.experience, { title: '', company: '', duration: '', desc: '' }] }))}
                className="text-xs text-accent flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {resume.experience.map((exp, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-border last:border-0">
                <input placeholder="Job title" value={exp.title} onChange={(e) => {
                  const n = [...resume.experience]; n[i] = { ...n[i], title: e.target.value }; setResume(prev => ({ ...prev, experience: n }));
                }} className={inputClass} />
                <input placeholder="Company" value={exp.company} onChange={(e) => {
                  const n = [...resume.experience]; n[i] = { ...n[i], company: e.target.value }; setResume(prev => ({ ...prev, experience: n }));
                }} className={inputClass} />
                <input placeholder="Duration" value={exp.duration} onChange={(e) => {
                  const n = [...resume.experience]; n[i] = { ...n[i], duration: e.target.value }; setResume(prev => ({ ...prev, experience: n }));
                }} className={inputClass} />
                <input placeholder="Description" value={exp.desc} onChange={(e) => {
                  const n = [...resume.experience]; n[i] = { ...n[i], desc: e.target.value }; setResume(prev => ({ ...prev, experience: n }));
                }} className={inputClass} />
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Achievements</h4>
              <button onClick={() => setResume(prev => ({ ...prev, achievements: [...prev.achievements, ''] }))}
                className="text-xs text-accent flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {resume.achievements.map((a, i) => (
              <input key={i} placeholder={`Achievement ${i + 1}`} value={a} onChange={(e) => {
                const n = [...resume.achievements]; n[i] = e.target.value; setResume(prev => ({ ...prev, achievements: n }));
              }} className={`${inputClass} mb-2`} />
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      <div>
        <h3 className="font-semibold mb-4">Choose Template</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { id: 'Classic' as const, desc: 'Clean layout with clear section dividers' },
            { id: 'Minimal' as const, desc: 'Simple, ATS-friendly, maximum readability' },
            { id: 'Bold' as const, desc: 'Structured with highlighted headers' },
          ].map((t) => (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
              className={`bg-card rounded-xl border p-5 text-left transition-all ${selectedTemplate === t.id ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-accent/50'}`}>
              {/* Mini resume preview */}
              <div className="mb-3 p-3 rounded-lg bg-muted/50 space-y-1.5">
                <div className={`h-2 rounded ${t.id === 'Classic' ? 'bg-accent/40 w-1/2' : t.id === 'Minimal' ? 'bg-foreground/20 w-2/3' : 'bg-accent/60 w-1/3'}`} />
                <div className="h-1.5 rounded bg-foreground/10 w-full" />
                <div className="h-1.5 rounded bg-foreground/10 w-4/5" />
                <div className={`h-1.5 rounded ${t.id === 'Bold' ? 'bg-accent/30 w-1/4' : 'bg-foreground/5 w-1/3'} mt-2`} />
                <div className="h-1.5 rounded bg-foreground/10 w-full" />
                <div className="h-1.5 rounded bg-foreground/10 w-3/4" />
              </div>
              <p className="text-sm font-medium">{t.id}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => setShowPreview(true)} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
        <Eye className="w-4 h-4" /> Preview & Download
      </button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
              <h3 className="font-semibold">Resume Preview — {selectedTemplate}</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" /> Print / Save PDF
                </button>
                <button onClick={() => setShowPreview(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-8 space-y-5 text-foreground">
              {/* Name */}
              <div className={selectedTemplate === 'Bold' ? 'border-b-2 border-accent pb-4' : selectedTemplate === 'Classic' ? 'border-b border-border pb-4' : 'pb-3'}>
                <h2 className={`font-bold ${selectedTemplate === 'Bold' ? 'text-2xl' : 'text-xl'}`}>{user?.name || 'Your Name'}</h2>
                <p className="text-sm text-muted-foreground">{user?.specialization || config.label} {user?.city ? `· ${user.city}` : ''} {user?.state ? `, ${user.state}` : ''}</p>
                {user?.college && <p className="text-xs text-muted-foreground">{user.college} · {user?.year || ''}</p>}
              </div>

              {/* Objective */}
              {resume.objective && (
                <div>
                  <h3 className={`font-semibold text-sm mb-1 ${selectedTemplate === 'Bold' ? 'text-accent' : ''}`}>Objective</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{resume.objective}</p>
                </div>
              )}

              {/* Education */}
              {resume.education.some(e => e.degree || e.college) && (
                <div>
                  <h3 className={`font-semibold text-sm mb-2 ${selectedTemplate === 'Bold' ? 'text-accent' : ''} ${selectedTemplate === 'Classic' ? 'border-b border-border pb-1' : ''}`}>Education</h3>
                  {resume.education.filter(e => e.degree || e.college).map((edu, i) => (
                    <div key={i} className="text-xs mb-1">
                      <span className="font-medium">{edu.degree}</span>
                      {edu.college && <span className="text-muted-foreground"> — {edu.college}</span>}
                      {(edu.year || edu.gpa) && <span className="text-muted-foreground"> · {[edu.year, edu.gpa].filter(Boolean).join(' · ')}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resume.skills.length > 0 && (
                <div>
                  <h3 className={`font-semibold text-sm mb-2 ${selectedTemplate === 'Bold' ? 'text-accent' : ''} ${selectedTemplate === 'Classic' ? 'border-b border-border pb-1' : ''}`}>Skills</h3>
                  <p className="text-xs text-muted-foreground">{resume.skills.join(' · ')}</p>
                </div>
              )}

              {/* Projects */}
              {resume.projects.some(p => p.name) && (
                <div>
                  <h3 className={`font-semibold text-sm mb-2 ${selectedTemplate === 'Bold' ? 'text-accent' : ''} ${selectedTemplate === 'Classic' ? 'border-b border-border pb-1' : ''}`}>Projects</h3>
                  {resume.projects.filter(p => p.name).map((proj, i) => (
                    <div key={i} className="text-xs mb-2">
                      <p className="font-medium">{proj.name}</p>
                      {proj.desc && <p className="text-muted-foreground">{proj.desc}</p>}
                      {proj.tech && <p className="text-muted-foreground italic">{proj.tech}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              {resume.experience.some(e => e.title) && (
                <div>
                  <h3 className={`font-semibold text-sm mb-2 ${selectedTemplate === 'Bold' ? 'text-accent' : ''} ${selectedTemplate === 'Classic' ? 'border-b border-border pb-1' : ''}`}>Experience</h3>
                  {resume.experience.filter(e => e.title).map((exp, i) => (
                    <div key={i} className="text-xs mb-2">
                      <p><span className="font-medium">{exp.title}</span>{exp.company && ` at ${exp.company}`}</p>
                      {exp.duration && <p className="text-muted-foreground">{exp.duration}</p>}
                      {exp.desc && <p className="text-muted-foreground">{exp.desc}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {resume.achievements.some(a => a) && (
                <div>
                  <h3 className={`font-semibold text-sm mb-2 ${selectedTemplate === 'Bold' ? 'text-accent' : ''} ${selectedTemplate === 'Classic' ? 'border-b border-border pb-1' : ''}`}>Achievements</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {resume.achievements.filter(a => a).map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty state */}
              {!resume.objective && resume.skills.length === 0 && !resume.projects[0].name && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Your resume is empty. Click "Edit Resume" to start filling in your details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
