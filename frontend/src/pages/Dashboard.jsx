import { useState } from 'react';
import {
  Loader2, AlertCircle, ChevronDown, ChevronUp,
  CheckCircle2, TrendingUp, ChevronRight, ChevronLeft,
  GraduationCap, BookOpen, Layers, Wrench, Heart, Sparkles
} from 'lucide-react';
import axios from 'axios';
import SkillInput from '../components/SkillInput';
import { useAuth } from '../context/AuthContext';

// ── Static data ───────────────────────────────────────────────────────────────

const EDUCATION_OPTIONS = ["Bachelor's", "Master's", "PhD", "Diploma", "High School"];

const COURSE_OPTIONS = [
  'B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'BBA', 'BA',
  'M.Tech', 'M.E.', 'M.Sc', 'MBA', 'MCA', 'MA',
  'PhD', 'Diploma', 'Other',
];

const SPECIALIZATION_OPTIONS = [
  'Computer Science', 'Information Technology', 'Data Science',
  'Artificial Intelligence', 'Machine Learning', 'Electronics',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Business Administration', 'Finance', 'Marketing', 'Design',
  'Statistics', 'Mathematics', 'Physics', 'Biology', 'Biotechnology',
  'Chemistry', 'Psychology', 'Economics', 'Communications', 'Journalism',
  'Law', 'Medicine', 'Other',
];

const INTEREST_OPTIONS = [
  'AI', 'Academia', 'Analytics', 'Arts', 'Automation', 'Biotech',
  'Business', 'Coding', 'Communications', 'Content', 'Cybersecurity',
  'Data Analysis', 'Data Science', 'Design', 'Digital Media', 'Electronics',
  'Engineering', 'Finance', 'Gaming', 'Healthcare', 'Innovation',
  'Language', 'Linguistics', 'Management', 'Marketing', 'Media',
  'Mobile Apps', 'Research', 'Security', 'Social Media',
  'Software Development', 'Statistics', 'Technology', 'User Experience',
  'Web Development',
];

// ── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Education',      icon: GraduationCap },
  { id: 2, label: 'Course',         icon: BookOpen      },
  { id: 3, label: 'Specialization', icon: Layers        },
  { id: 4, label: 'Skills',         icon: Wrench        },
  { id: 5, label: 'Interests',      icon: Heart         },
];

// ── Reusable select dropdown ──────────────────────────────────────────────────

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div style={s.field}>
      <label style={s.fieldLabel}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...s.select, color: value ? '#f9fafb' : '#6b7280' }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// ── Interest multi-select grid ────────────────────────────────────────────────

function InterestGrid({ selected, onChange }) {
  const toggle = (item) => {
    onChange(selected.includes(item)
      ? selected.filter(i => i !== item)
      : [...selected, item]);
  };
  return (
    <div>
      <label style={s.fieldLabel}>
        Select your hobbies & interests
        <span style={s.optionalBadge}>Optional</span>
      </label>
      <p style={s.fieldHint}>Choose as many as you like — they help personalise your results.</p>
      <div style={s.interestGrid}>
        {INTEREST_OPTIONS.map(item => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              style={{ ...s.interestChip, ...(active ? s.interestChipActive : {}) }}
            >
              {active && <CheckCircle2 size={12} style={{ flexShrink: 0 }} />}
              {item}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p style={s.selectedCount}>{selected.length} interest{selected.length !== 1 ? 's' : ''} selected</p>
      )}
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepBar({ current }) {
  return (
    <div style={s.stepBar}>
      {STEPS.map((step, i) => {
        const done    = current > step.id;
        const active  = current === step.id;
        const Icon    = step.icon;
        return (
          <div key={step.id} style={s.stepItem}>
            <div style={{
              ...s.stepCircle,
              ...(done   ? s.stepDone   : {}),
              ...(active ? s.stepActive : {}),
            }}>
              {done
                ? <CheckCircle2 size={14} />
                : <Icon size={14} />}
            </div>
            <span style={{
              ...s.stepLabel,
              color: active ? '#f9fafb' : done ? '#6366f1' : '#4b5563',
            }}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div style={{ ...s.stepLine, background: done ? '#6366f1' : 'rgba(255,255,255,0.07)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();

  // Form state
  const [step, setStep]               = useState(1);
  const [education, setEducation]     = useState('');
  const [course, setCourse]           = useState('');
  const [specialization, setSpec]     = useState('');
  const [skills, setSkills]           = useState([]);
  const [interests, setInterests]     = useState([]);

  // Result state
  const [loading, setLoading]         = useState(false);
  const [results, setResults]         = useState(null);
  const [error, setError]             = useState('');
  const [expanded, setExpanded]       = useState({});

  const toggleCard = i => setExpanded(p => ({ ...p, [i]: !p[i] }));

  // Validation per step
  const canProceed = () => {
    if (step === 1) return education !== '';
    if (step === 2) return course !== '';
    if (step === 3) return specialization !== '';
    if (step === 4) return skills.length > 0;
    return true; // step 5 interests are optional
  };

  const handleNext = () => { if (canProceed()) setStep(s => s + 1); };
  const handleBack = () => { setStep(s => s - 1); setResults(null); setError(''); };

  const handleSubmit = async () => {
    setError('');
    try {
      setLoading(true); setResults(null); setExpanded({});
      const { data } = await axios.post('http://127.0.0.1:8000/recommend', {
        education,
        course,
        specialization,
        skills,
        interests,
      }, { withCredentials: true });
      setResults(data.recommendations);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleStartOver = () => {
    setStep(1); setEducation(''); setCourse(''); setSpec('');
    setSkills([]); setInterests([]); setResults(null); setError('');
  };

  const scoreColor = (sc) => {
    if (sc >= 0.6)  return { text: '#10b981', bar: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)'  };
    if (sc >= 0.35) return { text: '#6366f1', bar: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)'  };
    if (sc >= 0.15) return { text: '#f59e0b', bar: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  };
    return                 { text: '#ef4444', bar: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   };
  };

  const greeting = user?.full_name
    ? `Hi, ${user.full_name.split(' ')[0]} 👋`
    : 'Career Matcher';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.h1}>{greeting}</h1>
        <p style={s.sub}>Tell us about yourself and we'll find the best-fit careers for you.</p>
      </div>

      {/* ── Form (shown until results) ── */}
      {!results && (
        <div style={s.formCard}>

          {/* Step bar */}
          <StepBar current={step} />

          <div style={s.formBody}>

            {/* Step 1 — Education */}
            {step === 1 && (
              <div style={s.stepContent} className="animate-fade-in">
                <div style={s.stepHeading}>
                  <GraduationCap size={22} color="#6366f1" />
                  <div>
                    <h2 style={s.stepTitle}>Education Qualification</h2>
                    <p style={s.stepDesc}>What is your highest level of education?</p>
                  </div>
                </div>
                <SelectField
                  label="Education Level"
                  value={education}
                  onChange={setEducation}
                  options={EDUCATION_OPTIONS}
                  placeholder="Select your education level…"
                />
              </div>
            )}

            {/* Step 2 — Course */}
            {step === 2 && (
              <div style={s.stepContent} className="animate-fade-in">
                <div style={s.stepHeading}>
                  <BookOpen size={22} color="#6366f1" />
                  <div>
                    <h2 style={s.stepTitle}>Course / Degree</h2>
                    <p style={s.stepDesc}>What course or degree did you pursue?</p>
                  </div>
                </div>
                <SelectField
                  label="Course"
                  value={course}
                  onChange={setCourse}
                  options={COURSE_OPTIONS}
                  placeholder="Select your course…"
                />
              </div>
            )}

            {/* Step 3 — Specialization */}
            {step === 3 && (
              <div style={s.stepContent} className="animate-fade-in">
                <div style={s.stepHeading}>
                  <Layers size={22} color="#6366f1" />
                  <div>
                    <h2 style={s.stepTitle}>Specialization Field</h2>
                    <p style={s.stepDesc}>What was your area of specialization or major?</p>
                  </div>
                </div>
                <SelectField
                  label="Specialization"
                  value={specialization}
                  onChange={setSpec}
                  options={SPECIALIZATION_OPTIONS}
                  placeholder="Select your specialization…"
                />
              </div>
            )}

            {/* Step 4 — Skills */}
            {step === 4 && (
              <div style={s.stepContent} className="animate-fade-in">
                <div style={s.stepHeading}>
                  <Wrench size={22} color="#6366f1" />
                  <div>
                    <h2 style={s.stepTitle}>Your Skillset</h2>
                    <p style={s.stepDesc}>Add all the technical and soft skills you have. The more you add, the better your recommendations.</p>
                  </div>
                </div>
                <SkillInput skills={skills} onChange={setSkills} />
              </div>
            )}

            {/* Step 5 — Interests */}
            {step === 5 && (
              <div style={s.stepContent} className="animate-fade-in">
                <div style={s.stepHeading}>
                  <Heart size={22} color="#6366f1" />
                  <div>
                    <h2 style={s.stepTitle}>Hobbies & Interests</h2>
                    <p style={s.stepDesc}>What topics excite you? This helps us personalise your career matches.</p>
                  </div>
                </div>
                <InterestGrid selected={interests} onChange={setInterests} />
              </div>
            )}

          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={s.navRow}>
            {step > 1 && (
              <button onClick={handleBack} style={s.backBtn}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />

            {/* Profile summary pill */}
            {step > 1 && (
              <div style={s.summaryPill}>
                {education && <span style={s.summaryItem}>{education}</span>}
                {course     && <span style={s.summaryItem}>{course}</span>}
                {specialization && <span style={s.summaryItem}>{specialization}</span>}
                {skills.length > 0 && <span style={s.summaryItem}>{skills.length} skills</span>}
              </div>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                style={{ ...s.nextBtn, ...(!canProceed() ? s.nextBtnDisabled : {}) }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || skills.length === 0}
                style={{ ...s.submitBtn, ...(loading || skills.length === 0 ? s.nextBtnDisabled : {}) }}
              >
                {loading
                  ? <><Loader2 size={16} className="spinner" />Analyzing…</>
                  : <><Sparkles size={16} />Get Recommendations</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {results && (
        <div className="animate-fade-in">

          {/* Profile summary banner */}
          <div style={s.profileBanner}>
            <div style={s.profileBannerLeft}>
              <p style={s.profileBannerTitle}>Your Profile</p>
              <div style={s.profileItems}>
                <span style={s.profileItem}><GraduationCap size={12} /> {education}</span>
                <span style={s.profileItem}><BookOpen size={12} /> {course}</span>
                <span style={s.profileItem}><Layers size={12} /> {specialization}</span>
                <span style={s.profileItem}><Wrench size={12} /> {skills.length} skills</span>
                {interests.length > 0 && (
                  <span style={s.profileItem}><Heart size={12} /> {interests.length} interests</span>
                )}
              </div>
            </div>
            <button onClick={handleStartOver} style={s.startOverBtn}>
              Start Over
            </button>
          </div>

          {/* Results header */}
          <div style={s.resultsHeader}>
            <h2 style={s.resultsTitle}>
              {results.length === 0
                ? 'No strong matches found'
                : `${results.length} career match${results.length !== 1 ? 'es' : ''} found`}
            </h2>
            {results.length === 0
              ? <p style={s.noResultsSub}>Try adding more skills or going back to adjust your profile.</p>
              : <p style={s.noResultsSub}>Based on your education, specialization, skills, and interests.</p>}
          </div>

          {/* Career cards */}
          <div style={s.cards}>
            {results.map((rec, i) => {
              const c      = scoreColor(rec.final_score);
              const pct    = (rec.final_score * 100).toFixed(1);
              const isOpen = expanded[i];
              return (
                <div key={i} style={s.resultCard}>
                  <button onClick={() => toggleCard(i)} style={s.resultHeader}>
                    <span style={{ ...s.rank, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                      #{i + 1}
                    </span>
                    <div style={s.careerMeta}>
                      <span style={s.careerName}>{rec.career}</span>
                      <div style={s.bar}>
                        <div style={{ ...s.barFill, width: `${Math.min(pct, 100)}%`, background: c.bar }} />
                      </div>
                    </div>
                    <span style={{ ...s.badge, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                      {pct}%
                    </span>
                    {isOpen ? <ChevronUp size={16} color="#4b5563" /> : <ChevronDown size={16} color="#4b5563" />}
                  </button>

                  {isOpen && (
                    <div style={s.details} className="animate-fade-in">
                      <div style={s.skillGrid}>
                        <div>
                          <p style={{ ...s.skillSectionTitle, color: '#10b981' }}>
                            <CheckCircle2 size={13} /> Matching Skills ({rec.matching_skills.length})
                          </p>
                          <div style={s.tags}>
                            {rec.matching_skills.length > 0
                              ? rec.matching_skills.map((sk, j) => <span key={j} style={s.tagGreen}>{sk}</span>)
                              : <span style={s.emptyNote}>None matched</span>}
                          </div>
                        </div>
                        <div>
                          <p style={{ ...s.skillSectionTitle, color: '#f59e0b' }}>
                            <TrendingUp size={13} /> Skills to Learn ({rec.missing_skills.length})
                          </p>
                          <div style={s.tags}>
                            {rec.missing_skills.length > 0
                              ? rec.missing_skills.map((sk, j) => <span key={j} style={s.tagYellow}>{sk}</span>)
                              : <span style={s.emptyNote}>You're fully covered 🎉</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: { paddingBottom: '3rem' },
  header: { marginBottom: '2rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.4rem' },
  sub: { fontSize: '0.9rem', color: '#6b7280' },

  // Form card
  formCard: {
    background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, overflow: 'hidden', marginBottom: '2rem',
  },
  formBody: { padding: '2rem' },

  // Step bar
  stepBar: {
    display: 'flex', alignItems: 'center',
    padding: '1.25rem 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(255,255,255,0.02)',
    overflowX: 'auto', gap: 0,
  },
  stepItem: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  stepCircle: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#4b5563', flexShrink: 0, transition: 'all 0.2s',
  },
  stepActive: {
    background: 'rgba(99,102,241,0.2)', border: '1px solid #6366f1', color: '#a5b4fc',
  },
  stepDone: {
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#6366f1',
  },
  stepLabel: {
    fontSize: '0.72rem', fontWeight: 600, marginLeft: '0.4rem',
    whiteSpace: 'nowrap', transition: 'color 0.2s',
  },
  stepLine: {
    width: 32, height: 2, margin: '0 0.5rem',
    borderRadius: 99, flexShrink: 0, transition: 'background 0.2s',
  },

  // Step content
  stepContent: { maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  stepHeading: { display: 'flex', alignItems: 'flex-start', gap: '0.85rem' },
  stepTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.25rem' },
  stepDesc: { fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 },

  // Field
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  fieldLabel: {
    fontSize: '0.82rem', fontWeight: 600, color: '#d1d5db',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  fieldHint: { fontSize: '0.78rem', color: '#4b5563', marginBottom: '0.75rem' },
  select: {
    width: '100%', padding: '0.7rem 1rem',
    background: '#0d1424', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none', cursor: 'pointer', transition: 'border-color 0.15s',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    paddingRight: '2.5rem',
  },
  optionalBadge: {
    fontSize: '0.68rem', fontWeight: 600, color: '#4b5563',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    padding: '0.1rem 0.5rem', borderRadius: 99,
  },

  // Interest grid
  interestGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' },
  interestChip: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.4rem 0.85rem', borderRadius: 99,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#6b7280', fontSize: '0.82rem', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  },
  interestChipActive: {
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc',
  },
  selectedCount: { fontSize: '0.78rem', color: '#6366f1', marginTop: '0.75rem', fontWeight: 600 },

  // Nav
  navRow: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '1.25rem 2rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(255,255,255,0.02)',
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.6rem 1.1rem', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    color: '#6b7280', fontSize: '0.875rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  },
  summaryPill: {
    display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
    maxWidth: 320,
  },
  summaryItem: {
    padding: '0.2rem 0.6rem', borderRadius: 99,
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
    color: '#818cf8', fontSize: '0.72rem', fontWeight: 500,
  },
  nextBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.6rem 1.25rem', background: '#6366f1', border: 'none',
    borderRadius: 8, color: '#fff', fontSize: '0.875rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
  },
  nextBtnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  submitBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.65rem 1.4rem', background: '#6366f1', border: 'none',
    borderRadius: 8, color: '#fff', fontSize: '0.9rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
  },

  // Error
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.65rem 1rem', margin: '0 2rem 1rem',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8, color: '#f87171', fontSize: '0.83rem',
  },

  // Profile banner
  profileBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem', marginBottom: '1.5rem',
    background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, flexWrap: 'wrap', gap: '0.75rem',
  },
  profileBannerLeft: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  profileBannerTitle: { fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em' },
  profileItems: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  profileItem: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.2rem 0.6rem', borderRadius: 99,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#9ca3af', fontSize: '0.75rem',
  },
  startOverBtn: {
    padding: '0.5rem 1rem', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    color: '#6b7280', fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  },

  // Results
  resultsHeader: { marginBottom: '1.25rem' },
  resultsTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.3rem' },
  noResultsSub: { fontSize: '0.875rem', color: '#6b7280' },

  cards: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  resultCard: {
    background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, overflow: 'hidden',
  },
  resultHeader: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    width: '100%', padding: '1rem 1.25rem',
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', textAlign: 'left',
  },
  rank: {
    width: 36, height: 36, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
  },
  careerMeta: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  careerName: { fontSize: '0.95rem', fontWeight: 600, color: '#f9fafb' },
  bar: { height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.6s ease' },
  badge: {
    padding: '0.25rem 0.65rem', borderRadius: 99,
    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
  },
  details: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    padding: '1rem 1.25rem 1.25rem',
  },
  skillGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' },
  skillSectionTitle: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem',
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
  tagGreen: {
    padding: '0.2rem 0.6rem', borderRadius: 99,
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
    color: '#10b981', fontSize: '0.76rem', fontWeight: 500,
  },
  tagYellow: {
    padding: '0.2rem 0.6rem', borderRadius: 99,
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
    color: '#f59e0b', fontSize: '0.76rem', fontWeight: 500,
  },
  emptyNote: { fontSize: '0.8rem', color: '#374151' },
};
