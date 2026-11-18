import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

// All skills sourced from career_training.csv (195 unique skills)
const POPULAR_SKILLS = [
  'A/B Testing', 'AWS', 'Accounting', 'Adobe Creative Suite', 'Adobe Illustrator',
  'Adobe Photoshop', 'Adobe XD', 'Agile', 'Airflow', 'Algorithms', 'Android',
  'Angular', 'Ansible', 'Azure', 'BERT', 'Big Data', 'Biostatistics', 'Bloomberg',
  'Brand Management', 'Brand Voice', 'Branding', 'Budget Management', 'Budgeting',
  'Business Analysis', 'Business Intelligence', 'C#', 'C++', 'CI/CD', 'CRM', 'CSS',
  'CUDA', 'Change Management', 'Clinical Trials', 'Cloud Computing', 'Cloud Security',
  'Color Theory', 'Communication', 'Computer Vision', 'Content Strategy',
  'Content Writing', 'Copywriting', 'Cryptography', 'Data Analysis', 'Data Pipelines',
  'Data Structures', 'Data Visualization', 'Data Warehousing', 'Debugging',
  'Deep Learning', 'Design Thinking', 'Digital Marketing', 'Docker', 'ETL', 'Editing',
  'Electronics', 'Email Marketing', 'Embedded Systems', 'Epidemiology',
  'Ethical Hacking', 'Excel', 'Experimental Design', 'FPGA', 'Feature Engineering',
  'Figma', 'Financial Modeling', 'Financial Reporting', 'Firebase', 'Firewalls',
  'Firmware', 'Flutter', 'Forecasting', 'GCP', 'GPU Computing', 'Git',
  'Google Analytics', 'Grant Writing', 'Graphic Design', 'HTML', 'Hadoop',
  'Hardware Design', 'Hive', 'Hugging Face', 'IDS/IPS', 'Incident Response',
  'Interaction Design', 'Interview Techniques', 'IoT', 'JIRA', 'Java', 'JavaScript',
  'Jenkins', 'Kafka', 'Kotlin', 'Kubernetes', 'Laboratory Skills', 'Leadership',
  'Linux', 'Literature Review', 'MATLAB', 'MLOps', 'MS Project', 'Machine Learning',
  'Marketing Automation', 'Marketing Strategy', 'Mathematics', 'Microcontrollers',
  'Microservices', 'MongoDB', 'Monitoring', 'Motion Graphics', 'Named Entity Recognition',
  'Natural Language Processing', 'Negotiation', 'Network Security', 'Networking',
  'Neural Networks', 'Node.js', 'Object-Oriented Programming', 'PMP Certification',
  'PPC', 'Penetration Testing', 'Performance Testing', 'PostgreSQL', 'Power BI',
  'Presentation Skills', 'Print Design', 'Process Improvement', 'Project Management',
  'Prototyping', 'Psychology', 'Publication Writing', 'PyTorch', 'Python',
  'Qualitative Research', 'R', 'REST APIs', 'RTOS', 'React', 'React Native', 'Redis',
  'Reinforcement Learning', 'Report Writing', 'Reporting', 'Requirements Gathering',
  'Research', 'Responsive Design', 'Risk Analysis', 'Risk Assessment', 'Risk Management',
  'Robot Framework', 'SAS', 'SEO', 'SIEM', 'SPSS', 'SQL', 'Scala', 'Scikit-learn',
  'Scrum', 'Security', 'Selenium', 'Serverless', 'Shell Scripting', 'Signal Processing',
  'Social Media Design', 'Social Media Marketing', 'Spark', 'Spring',
  'Stakeholder Management', 'Statistics', 'Survey Design', 'Swift', 'Tableau',
  'TensorFlow', 'Terraform', 'Testing', 'Text Classification', 'Transformers',
  'TypeScript', 'Typography', 'UART/SPI/I2C', 'UI Design', 'UI/UX Design',
  'Usability Testing', 'User Research', 'Video Editing', 'Video Marketing',
  'Video Scripting', 'Visual Design', 'Vue.js', 'Webpack', 'Wireframing',
  'WordPress', 'dbt', 'iOS', 'spaCy',
];

const TAG_COLORS = [
  { bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.5)', text: '#fca5a5' },
  { bg: 'rgba(249,115,22,0.18)', border: 'rgba(249,115,22,0.5)', text: '#fdba74' },
  { bg: 'rgba(234,179,8,0.18)', border: 'rgba(234,179,8,0.5)', text: '#fde68a' },
  { bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.5)', text: '#86efac' },
  { bg: 'rgba(6,182,212,0.18)', border: 'rgba(6,182,212,0.5)', text: '#67e8f9' },
  { bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.5)', text: '#a5b4fc' },
  { bg: 'rgba(168,85,247,0.18)', border: 'rgba(168,85,247,0.5)', text: '#d8b4fe' },
  { bg: 'rgba(236,72,153,0.18)', border: 'rgba(236,72,153,0.5)', text: '#f9a8d4' },
];

const getTagColor = (skill) => {
  let hash = 0;
  for (let i = 0; i < skill.length; i++) {
    hash = skill.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

const SkillInput = ({ skills, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterSuggestions = (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    const filtered = POPULAR_SKILLS.filter(
      (s) =>
        s.toLowerCase().includes(value.toLowerCase()) &&
        !skills.includes(s)
    ).slice(0, 8);
    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setActiveSuggestion(-1);
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeSkill = (skill) => {
    onChange(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        addSkill(suggestions[activeSuggestion]);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) addSkill(inputValue);
    }
  };

  const popularToShow = showAll
    ? POPULAR_SKILLS.filter((s) => !skills.includes(s))
    : POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 12);

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>What skills do you have?</label>

      {/* Tag input box */}
      <div ref={containerRef} style={styles.inputBox}>
        <div style={styles.tagsRow}>
          {skills.map((skill) => {
            const color = getTagColor(skill);
            return (
              <span
                key={skill}
                style={{
                  ...styles.tag,
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                }}
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  style={{ ...styles.removeBtn, color: color.text }}
                  aria-label={`Remove ${skill}`}
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            );
          })}

          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              filterSuggestions(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && filterSuggestions(inputValue)}
            placeholder={skills.length === 0 ? 'Type a skill and press Enter or comma...' : ''}
            style={styles.innerInput}
            aria-label="Add a skill"
            id="skill-input"
          />
        </div>

        <div style={styles.inputActions}>
          {skills.length > 0 && (
            <button
              onClick={() => onChange([])}
              style={styles.clearBtn}
              aria-label="Clear all skills"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => {
              setShowAll(!showAll);
              inputRef.current?.focus();
            }}
            style={styles.chevronBtn}
            aria-label="Toggle suggestions"
          >
            {showAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div ref={dropdownRef} style={styles.dropdown}>
            {suggestions.map((s, i) => (
              <button
                key={s}
                onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}
                style={{
                  ...styles.dropdownItem,
                  ...(i === activeSuggestion ? styles.dropdownItemActive : {}),
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Skill count hint */}
      {skills.length > 0 && (
        <p style={styles.hint}>
          {skills.length} skill{skills.length !== 1 ? 's' : ''} added — press Backspace to remove the last one
        </p>
      )}

      {/* Popular skills suggestions */}
      <div style={styles.popularSection}>
        <p style={styles.popularLabel}>Popular skills — click to add:</p>
        <div style={styles.popularGrid}>
          {popularToShow.map((skill) => (
            <button
              key={skill}
              onClick={() => addSkill(skill)}
              style={styles.popularChip}
            >
              + {skill}
            </button>
          ))}
        </div>
        {POPULAR_SKILLS.filter((s) => !skills.includes(s)).length > 12 && (
          <button onClick={() => setShowAll(!showAll)} style={styles.showMoreBtn}>
            {showAll ? '▲ Show less' : `▼ Show ${POPULAR_SKILLS.filter((s) => !skills.includes(s)).length - 12} more skills`}
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#f1f5f9',
    letterSpacing: '0.02em',
  },
  inputBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '52px',
    padding: '0.5rem 0.75rem',
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1.5px solid rgba(99, 102, 241, 0.4)',
    borderRadius: '10px',
    cursor: 'text',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: '0 0 0 0px rgba(99,102,241,0.2)',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    flex: 1,
    alignItems: 'center',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
    animation: 'tagPop 0.18s cubic-bezier(0.34,1.56,0.64,1)',
    userSelect: 'none',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    opacity: 0.75,
    transition: 'opacity 0.15s',
    lineHeight: 1,
  },
  innerInput: {
    flex: 1,
    minWidth: '160px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    padding: '0.25rem 0',
  },
  inputActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
  chevronBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: '#1e293b',
    border: '1px solid rgba(99,102,241,0.35)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: 100,
    overflow: 'hidden',
    animation: 'dropIn 0.15s ease',
  },
  dropdownItem: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '0.65rem 1rem',
    textAlign: 'left',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.12s, color 0.12s',
  },
  dropdownItemActive: {
    background: 'rgba(99,102,241,0.2)',
    color: '#a5b4fc',
  },
  hint: {
    fontSize: '0.78rem',
    color: '#475569',
    margin: 0,
  },
  popularSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  popularLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
    fontWeight: 500,
  },
  popularGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  popularChip: {
    background: 'rgba(30,41,59,0.6)',
    border: '1px solid rgba(71,85,105,0.5)',
    color: '#94a3b8',
    padding: '0.3rem 0.7rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  showMoreBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '0.25rem 0',
    alignSelf: 'flex-start',
    transition: 'color 0.15s',
  },
};

export default SkillInput;
