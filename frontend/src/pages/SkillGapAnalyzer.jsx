import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const CAREER_PROFILES = {
  'AI Researcher': ['Statistics', 'Python', 'Deep Learning', 'Research', 'Machine Learning', 'Mathematics', 'Natural Language Processing', 'PyTorch', 'TensorFlow', 'Computer Vision', 'R', 'Reinforcement Learning'],
  'AI Specialist': ['TensorFlow', 'Computer Vision', 'Python', 'Data Analysis', 'Natural Language Processing', 'Deep Learning', 'Machine Learning', 'MLOps', 'Scikit-learn', 'Statistics', 'PyTorch', 'Research'],
  'Automation Engineer': ['Git', 'Selenium', 'Shell Scripting', 'Python', 'CI/CD', 'Testing', 'Linux', 'Jenkins', 'Agile', 'REST APIs', 'Performance Testing', 'Robot Framework'],
  'Backend Developer': ['Node.js', 'Git', 'SQL', 'Docker', 'Java', 'REST APIs', 'Python', 'Spring', 'PostgreSQL', 'MongoDB', 'Linux', 'C#'],
  'Biostatistician': ['Biostatistics', 'Python', 'Clinical Trials', 'R', 'Data Analysis', 'Statistics', 'SPSS', 'Publication Writing', 'Excel', 'Machine Learning', 'MATLAB', 'SQL'],
  'Business Analyst': ['SQL', 'Data Analysis', 'Excel', 'Process Improvement', 'Requirements Gathering', 'Stakeholder Management', 'Business Analysis', 'Project Management', 'Python', 'Agile', 'Financial Modeling', 'Power BI'],
  'Cloud Engineer': ['Azure', 'Kubernetes', 'GCP', 'AWS', 'Linux', 'Docker', 'Terraform', 'Serverless', 'CI/CD', 'Python', 'Networking', 'Shell Scripting'],
  'Content Strategist': ['Content Strategy', 'Content Writing', 'Copywriting', 'SEO', 'Research', 'Editing', 'WordPress', 'Social Media Marketing', 'Google Analytics', 'Brand Voice', 'Email Marketing', 'Video Scripting'],
  'Cybersecurity Analyst': ['Linux', 'Cryptography', 'Python', 'SIEM', 'Network Security', 'Penetration Testing', 'Firewalls', 'SQL', 'IDS/IPS', 'Cloud Security', 'Ethical Hacking', 'Incident Response'],
  'Data Analyst': ['SQL', 'Statistics', 'Tableau', 'Data Analysis', 'Python', 'Data Visualization', 'Excel', 'Data Warehousing', 'ETL', 'Reporting', 'Business Intelligence', 'Power BI'],
  'Data Engineer': ['Python', 'ETL', 'Airflow', 'Spark', 'Big Data', 'Data Warehousing', 'SQL', 'Hadoop', 'dbt', 'Scala', 'Docker', 'AWS'],
  'Data Scientist': ['Machine Learning', 'Data Analysis', 'Statistics', 'Scikit-learn', 'Python', 'Data Visualization', 'SQL', 'Deep Learning', 'PyTorch', 'Feature Engineering', 'Excel', 'TensorFlow'],
  'Deep Learning Engineer': ['GPU Computing', 'PyTorch', 'Computer Vision', 'TensorFlow', 'Neural Networks', 'Python', 'Deep Learning', 'CUDA', 'Data Pipelines', 'Machine Learning', 'Docker', 'Research'],
  'DevOps Engineer': ['Git', 'CI/CD', 'Shell Scripting', 'Linux', 'Kubernetes', 'Docker', 'AWS', 'Monitoring', 'Jenkins', 'Python', 'Ansible', 'Azure'],
  'Digital Marketer': ['PPC', 'Social Media Marketing', 'Google Analytics', 'Content Writing', 'Email Marketing', 'SEO', 'Digital Marketing', 'Marketing Automation', 'CRM', 'Copywriting', 'Video Marketing', 'Excel'],
  'Embedded Systems Engineer': ['Embedded Systems', 'C++', 'RTOS', 'IoT', 'Python', 'Linux', 'Microcontrollers', 'Electronics', 'Firmware', 'Signal Processing', 'Hardware Design', 'FPGA'],
  'Financial Analyst': ['Financial Reporting', 'Accounting', 'Financial Modeling', 'Statistics', 'Data Analysis', 'SQL', 'Excel', 'Risk Analysis', 'Bloomberg', 'Tableau', 'Python', 'Forecasting'],
  'Frontend Developer': ['TypeScript', 'Git', 'React', 'CSS', 'JavaScript', 'REST APIs', 'HTML', 'Webpack', 'UI/UX Design', 'Node.js', 'Testing', 'Responsive Design'],
  'Full Stack Developer': ['Git', 'React', 'REST APIs', 'JavaScript', 'Node.js', 'SQL', 'Python', 'MongoDB', 'CSS', 'Linux', 'HTML', 'Agile'],
  'Graphic Designer': ['Typography', 'Visual Design', 'Color Theory', 'Branding', 'Adobe Illustrator', 'Adobe Creative Suite', 'Adobe Photoshop', 'Print Design', 'Video Editing', 'Motion Graphics', 'Adobe XD', 'Social Media Design'],
  'ML Engineer': ['TensorFlow', 'PyTorch', 'Deep Learning', 'Scikit-learn', 'Python', 'Machine Learning', 'Data Pipelines', 'Feature Engineering', 'Docker', 'MLOps', 'Kubernetes', 'Spark'],
  'Marketing Manager': ['Data Analysis', 'Content Writing', 'Digital Marketing', 'CRM', 'SEO', 'Project Management', 'Marketing Strategy', 'Leadership', 'Budget Management', 'Brand Management', 'Copywriting', 'Excel'],
  'Mobile Developer': ['Java', 'Kotlin', 'Swift', 'Flutter', 'React Native', 'Git', 'REST APIs', 'iOS', 'Android', 'Testing', 'Agile', 'UI/UX Design'],
  'NLP Engineer': ['Machine Learning', 'Transformers', 'Python', 'TensorFlow', 'Natural Language Processing', 'PyTorch', 'Deep Learning', 'Named Entity Recognition', 'spaCy', 'Text Classification', 'Hugging Face', 'SQL'],
  'Project Manager': ['Risk Management', 'Leadership', 'Budgeting', 'Agile', 'Communication', 'Stakeholder Management', 'Project Management', 'Excel', 'MS Project', 'Change Management', 'Negotiation', 'JIRA'],
  'Research Analyst': ['Report Writing', 'Excel', 'Statistics', 'Research', 'Literature Review', 'SQL', 'Data Analysis', 'R', 'Survey Design', 'Presentation Skills', 'Python', 'Qualitative Research'],
  'Research Scientist': ['R', 'Data Analysis', 'Statistics', 'Research', 'Machine Learning', 'Python', 'Publication Writing', 'Experimental Design', 'Literature Review', 'MATLAB', 'Deep Learning', 'Laboratory Skills'],
  'Software Engineer': ['Python', 'Data Structures', 'SQL', 'Object-Oriented Programming', 'Git', 'Java', 'Algorithms', 'Docker', 'Agile', 'TypeScript', 'C++', 'Linux'],
  'UX Designer': ['Wireframing', 'Adobe XD', 'Figma', 'Prototyping', 'Design Thinking', 'UI/UX Design', 'User Research', 'HTML', 'JavaScript', 'Usability Testing', 'Adobe Illustrator', 'Interaction Design'],
  'UX Researcher': ['Survey Design', 'Design Thinking', 'Figma', 'Usability Testing', 'Data Analysis', 'Prototyping', 'User Research', 'Report Writing', 'Statistics', 'A/B Testing', 'Wireframing', 'Interview Techniques'],
};

const ALL_SKILLS = [...new Set(Object.values(CAREER_PROFILES).flat())].sort();
const CAREERS = Object.keys(CAREER_PROFILES).sort();

// ── Skills multi-select ───────────────────────────────────────────────────────

function SkillsDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const filtered = ALL_SKILLS.filter(sk => sk.toLowerCase().includes(q.toLowerCase()) && !selected.includes(sk));

  const toggle = (sk) => {
    onChange(selected.includes(sk) ? selected.filter(s => s !== sk) : [...selected, sk]);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={s.dropTrigger}
        aria-expanded={open}
      >
        <span style={{ color: selected.length ? '#f9fafb' : '#6b7280', flex: 1, textAlign: 'left' }}>
          {selected.length === 0 ? 'Search and select your skills…' : `${selected.length} skill${selected.length !== 1 ? 's' : ''} selected`}
        </span>
        {open ? <ChevronUp size={16} color="#4b5563" /> : <ChevronDown size={16} color="#4b5563" />}
      </button>

      {open && (
        <div style={s.dropPanel}>
          {/* Search */}
          <div style={s.dropSearch}>
            <Search size={14} color="#4b5563" />
            <input
              ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
              placeholder="Filter skills…" style={s.dropInput}
            />
            {q && <button onClick={() => setQ('')} style={s.clearBtn}><X size={12} /></button>}
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div style={s.chips}>
              {selected.map(sk => (
                <span key={sk} style={s.chip}>
                  {sk}
                  <button onClick={(e) => { e.stopPropagation(); toggle(sk); }} style={s.chipX}>
                    <X size={10} strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Options */}
          <div style={s.options}>
            {filtered.length === 0
              ? <p style={s.noOpts}>No skills match "{q}"</p>
              : filtered.map(sk => (
                <button key={sk} onClick={(e) => { e.stopPropagation(); toggle(sk); }} style={s.option}>
                  {sk}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score ring SVG ────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 32, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#6366f1' : score >= 25 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : score >= 25 ? 'Developing' : 'Early stage';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <svg width={80} height={80} viewBox="0 0 80 80">
        <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x={40} y={36} textAnchor="middle" fill={color} fontSize={15} fontWeight={800} fontFamily="Inter,sans-serif">{score}%</text>
        <text x={40} y={50} textAnchor="middle" fill="#4b5563" fontSize={8} fontFamily="Inter,sans-serif">MATCH</text>
      </svg>
      <div>
        <p style={{ fontWeight: 700, color, fontSize: '0.95rem', margin: 0 }}>{label}</p>
        <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: '0.15rem 0 0' }}>skill match score</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SkillGapAnalyzer() {
  const [career, setCareer] = useState('');
  const [skills, setSkills] = useState([]);
  const [result, setResult] = useState(null);
  const [careerOpen, setCareerOpen] = useState(false);
  const careerRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (careerRef.current && !careerRef.current.contains(e.target)) setCareerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Clear stale result when inputs change
  useEffect(() => { setResult(null); }, [career, skills]);

  const analyze = () => {
    if (!career || skills.length === 0) return;
    const required = CAREER_PROFILES[career];
    const mySet = skills.map(s => s.toLowerCase());
    const matched = required.filter(s => mySet.includes(s.toLowerCase()));
    const missing = required.filter(s => !mySet.includes(s.toLowerCase()));
    const bonus  = skills.filter(s => !required.map(r => r.toLowerCase()).includes(s.toLowerCase()));
    const score  = Math.round((matched.length / required.length) * 100);
    setResult({ matched, missing, bonus, score, required });
  };

  const canAnalyze = career && skills.length > 0;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.h1}>Skill Gap Analyzer</h1>
        <p style={s.sub}>Select a target career and your current skills to see exactly what you need to learn.</p>
      </div>

      <div style={s.layout}>
        {/* Main column */}
        <div style={s.main}>
          {/* Target career */}
          <div style={s.card}>
            <label style={s.fieldLabel}>Target career</label>
            <div ref={careerRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setCareerOpen(!careerOpen)}
                style={s.dropTrigger}
                aria-expanded={careerOpen}
              >
                <span style={{ color: career ? '#f9fafb' : '#6b7280', flex: 1, textAlign: 'left' }}>
                  {career || 'Select a career…'}
                </span>
                {careerOpen ? <ChevronUp size={16} color="#4b5563" /> : <ChevronDown size={16} color="#4b5563" />}
              </button>

              {careerOpen && (
                <div style={s.dropPanel}>
                  <div style={s.options}>
                    {CAREERS.map(c => (
                      <button
                        key={c}
                        onMouseDown={(e) => { e.preventDefault(); setCareer(c); setCareerOpen(false); }}
                        style={{ ...s.option, ...(career === c ? s.optionActive : {}) }}
                      >
                        {career === c && <CheckCircle2 size={12} color="#6366f1" style={{ flexShrink: 0 }} />}
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div style={s.card}>
            <label style={s.fieldLabel}>Your current skills</label>
            <SkillsDropdown selected={skills} onChange={setSkills} />
          </div>

          {/* Analyze button */}
          <button
            onClick={analyze}
            disabled={!canAnalyze}
            style={{ ...s.analyzeBtn, ...(!canAnalyze ? s.analyzeBtnDisabled : {}) }}
          >
            Analyze Skill Gap
            {skills.length > 0 && (
              <span style={s.analyzeBadge}>{skills.length} skill{skills.length !== 1 ? 's' : ''}</span>
            )}
          </button>

          {/* Results */}
          {result && (
            <div style={s.resultWrap} className="animate-fade-in">
              {/* Score */}
              <div style={s.scoreCard}>
                <ScoreRing score={result.score} />
                <div style={s.scoreStats}>
                  {[
                    { icon: CheckCircle2, color: '#10b981', label: 'Matched', val: `${result.matched.length}/${result.required.length}` },
                    { icon: TrendingUp,   color: '#f59e0b', label: 'To learn', val: result.missing.length },
                    { icon: Zap,          color: '#6366f1', label: 'Bonus',    val: result.bonus.length },
                  ].map(({ icon: Icon, color, label, val }) => (
                    <div key={label} style={s.statBox}>
                      <span style={{ ...s.statVal, color }}>{val}</span>
                      <span style={s.statLabel}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill breakdown */}
              <div style={s.breakdown}>
                {/* Matched */}
                <div style={s.section}>
                  <p style={{ ...s.sectionTitle, color: '#10b981' }}>
                    <CheckCircle2 size={13} /> You already have ({result.matched.length})
                  </p>
                  <div style={s.tags}>
                    {result.matched.length > 0
                      ? result.matched.map((sk, i) => <span key={i} style={s.tagGreen}>{sk}</span>)
                      : <span style={s.emptyNote}>None matched yet — add more skills above</span>}
                  </div>
                </div>

                {/* Missing */}
                {result.missing.length > 0 && (
                  <div style={s.section}>
                    <p style={{ ...s.sectionTitle, color: '#f59e0b' }}>
                      <TrendingUp size={13} /> Skills to learn ({result.missing.length})
                    </p>
                    <div style={s.tags}>
                      {result.missing.map((sk, i) => <span key={i} style={s.tagYellow}>{sk}</span>)}
                    </div>
                  </div>
                )}

                {result.missing.length === 0 && (
                  <div style={s.fullCover}>
                    🎉 You have all required skills for <strong>{career}</strong>!
                  </div>
                )}

                {/* Bonus */}
                {result.bonus.length > 0 && (
                  <div style={s.section}>
                    <p style={{ ...s.sectionTitle, color: '#6366f1' }}>
                      <Zap size={13} /> Bonus skills ({result.bonus.length})
                    </p>
                    <div style={s.tags}>
                      {result.bonus.map((sk, i) => <span key={i} style={s.tagAccent}>{sk}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — career list */}
        <div style={s.sidebar}>
          <div style={s.sideCard}>
            <p style={s.sideTitle}>All careers ({CAREERS.length})</p>
            <div style={s.careerList}>
              {CAREERS.map(c => (
                <button
                  key={c}
                  onClick={() => setCareer(c)}
                  style={{ ...s.careerBtn, ...(career === c ? s.careerBtnActive : {}) }}
                >
                  {career === c && <span style={s.careerActiveDot} />}
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: { paddingBottom: '3rem' },
  header: { marginBottom: '2rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.4rem' },
  sub: { fontSize: '0.9rem', color: '#6b7280' },

  layout: { display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1.5rem', alignItems: 'start' },
  main: { display: 'flex', flexDirection: 'column', gap: '1rem' },

  card: {
    background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.6rem',
  },
  fieldLabel: { fontSize: '0.82rem', fontWeight: 600, color: '#d1d5db' },

  /* Dropdown shared */
  dropTrigger: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '0.65rem 1rem',
    background: '#0d1424', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem',
    color: '#6b7280', transition: 'border-color 0.15s', gap: '0.5rem',
  },
  dropPanel: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, zIndex: 100, overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  dropSearch: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  dropInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#f9fafb', fontFamily: 'inherit', fontSize: '0.85rem',
  },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', display: 'flex' },
  chips: {
    display: 'flex', flexWrap: 'wrap', gap: '0.3rem',
    padding: '0.6rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
    maxHeight: 80, overflowY: 'auto',
  },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.2rem 0.55rem', borderRadius: 99,
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
    color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 500,
  },
  chipX: { background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 },
  options: { maxHeight: 220, overflowY: 'auto', padding: '0.3rem 0' },
  option: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    width: '100%', padding: '0.5rem 0.85rem',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#d1d5db', fontFamily: 'inherit', fontSize: '0.85rem',
    textAlign: 'left', transition: 'background 0.1s',
  },
  optionActive: { color: '#f9fafb', background: 'rgba(99,102,241,0.12)' },
  noOpts: { padding: '0.75rem', color: '#4b5563', fontSize: '0.82rem', textAlign: 'center', margin: 0 },

  /* Analyze button */
  analyzeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
    padding: '0.72rem 1.5rem', background: '#6366f1', border: 'none',
    borderRadius: 8, color: '#fff', fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
  },
  analyzeBtnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  analyzeBadge: {
    background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.5rem',
    borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
  },

  /* Result */
  resultWrap: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  scoreCard: {
    background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '1.25rem',
    display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
  },
  scoreStats: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  statBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8, padding: '0.6rem 1rem', minWidth: 64,
  },
  statVal: { fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: '0.68rem', color: '#4b5563' },

  breakdown: {
    background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '1.1rem',
  },
  section: {},
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem',
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
  tagGreen: {
    padding: '0.22rem 0.6rem', borderRadius: 99,
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
    color: '#10b981', fontSize: '0.76rem', fontWeight: 500,
  },
  tagYellow: {
    padding: '0.22rem 0.6rem', borderRadius: 99,
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
    color: '#f59e0b', fontSize: '0.76rem', fontWeight: 500,
  },
  tagAccent: {
    padding: '0.22rem 0.6rem', borderRadius: 99,
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
    color: '#818cf8', fontSize: '0.76rem', fontWeight: 500,
  },
  emptyNote: { fontSize: '0.8rem', color: '#374151' },
  fullCover: {
    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 8, padding: '0.75rem 1rem',
    color: '#10b981', fontSize: '0.875rem',
  },

  /* Sidebar */
  sidebar: { position: 'sticky', top: '2rem' },
  sideCard: {
    background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '1rem',
  },
  sideTitle: { fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  careerList: { display: 'flex', flexDirection: 'column', maxHeight: 500, overflowY: 'auto', gap: '0.1rem' },
  careerBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    width: '100%', padding: '0.45rem 0.6rem', background: 'none', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem',
    color: '#4b5563', textAlign: 'left', transition: 'color 0.12s, background 0.12s',
  },
  careerBtnActive: { color: '#f9fafb', background: 'rgba(99,102,241,0.12)' },
  careerActiveDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#6366f1', flexShrink: 0,
    boxShadow: '0 0 6px rgba(99,102,241,0.8)',
  },
};
