import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Heart, Sparkles } from 'lucide-react';

// Sourced from career_interest_mapping.json
export const POPULAR_INTERESTS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'Software Development',
  'Mobile Apps',
  'UI/UX Design',
  'Data Analytics',
  'Automation',
  'Gaming',
  'Digital Marketing',
  'Finance',
  'Research',
  'Biotech',
  'Electronics',
  'Business',
  'Innovation',
  'Content Strategy',
];

export const ALL_INTERESTS = [
  'AI', 'Academia', 'Analytics', 'Arts', 'Automation', 'Biotech', 'Business',
  'Coding', 'Communications', 'Content', 'Cybersecurity', 'Data Analysis',
  'Data Analytics', 'Data Science', 'Design', 'Digital Media', 'Electronics',
  'Engineering', 'Finance', 'Gaming', 'Healthcare', 'Innovation', 'Language',
  'Linguistics', 'Management', 'Marketing', 'Media', 'Mobile Apps', 'Research',
  'Security', 'Social Media', 'Software Development', 'Software Engineering',
  'Statistics', 'Technology', 'User Experience', 'Web Design', 'Web Development',
];

const INTEREST_TAG_COLORS = [
  { bg: 'rgba(168, 85, 247, 0.16)', border: 'rgba(168, 85, 247, 0.45)', text: '#d8b4fe' },
  { bg: 'rgba(236, 72, 153, 0.16)', border: 'rgba(236, 72, 153, 0.45)', text: '#f9a8d4' },
  { bg: 'rgba(99, 102, 241, 0.16)', border: 'rgba(99, 102, 241, 0.45)', text: '#a5b4fc' },
  { bg: 'rgba(14, 165, 233, 0.16)', border: 'rgba(14, 165, 233, 0.45)', text: '#7dd3fc' },
  { bg: 'rgba(20, 184, 166, 0.16)', border: 'rgba(20, 184, 166, 0.45)', text: '#5eead4' },
  { bg: 'rgba(245, 158, 11, 0.16)', border: 'rgba(245, 158, 11, 0.45)', text: '#fde68a' },
];

const getInterestColor = (interest) => {
  let hash = 0;
  for (let i = 0; i < interest.length; i++) {
    hash = interest.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INTEREST_TAG_COLORS[Math.abs(hash) % INTEREST_TAG_COLORS.length];
};

export default function InterestInput({ interests = [], onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

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

  const filterSuggestions = (val) => {
    if (!val.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    const filtered = ALL_INTERESTS.filter(
      (item) =>
        item.toLowerCase().includes(val.toLowerCase()) &&
        !interests.includes(item)
    ).slice(0, 8);
    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setActiveSuggestion(-1);
  };

  const addInterest = (interest) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      onChange([...interests, trimmed]);
    }
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeInterest = (interest) => {
    onChange(interests.filter((i) => i !== interest));
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
        addInterest(suggestions[activeSuggestion]);
      } else if (inputValue.trim()) {
        addInterest(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && interests.length > 0) {
      removeInterest(interests[interests.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) addInterest(inputValue);
    }
  };

  const popularToShow = showAll
    ? POPULAR_INTERESTS.filter((item) => !interests.includes(item))
    : POPULAR_INTERESTS.filter((item) => !interests.includes(item)).slice(0, 10);

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>
        <Heart size={15} color="#ec4899" />
        <span>What areas or domains are you personally interested in?</span>
      </label>

      {/* Input container */}
      <div ref={containerRef} style={styles.inputBox}>
        <div style={styles.tagsRow}>
          {interests.map((interest) => {
            const color = getInterestColor(interest);
            return (
              <span
                key={interest}
                style={{
                  ...styles.tag,
                  background: color.bg,
                  borderColor: color.border,
                  color: color.text,
                }}
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  style={styles.removeBtn}
                  aria-label={`Remove ${interest}`}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder={interests.length === 0 ? "Type an interest (e.g. AI, Web Development, Cloud) & press Enter..." : "Add another interest..."}
            onChange={(e) => {
              setInputValue(e.target.value);
              filterSuggestions(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => filterSuggestions(inputValue)}
            style={styles.input}
          />
        </div>

        <div style={styles.actions}>
          {interests.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              style={styles.clearBtn}
              title="Clear all interests"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowAll(!showAll);
              inputRef.current?.focus();
            }}
            style={styles.chevronBtn}
            aria-label="Toggle interest suggestions"
          >
            {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div style={styles.dropdown}>
            {suggestions.map((item, idx) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addInterest(item);
                }}
                style={{
                  ...styles.dropdownItem,
                  ...(idx === activeSuggestion ? styles.dropdownItemActive : {}),
                }}
              >
                <Sparkles size={13} color="#a855f7" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular interest suggestions */}
      <div style={styles.popularSection}>
        <p style={styles.popularLabel}>Popular interests — click to select:</p>
        <div style={styles.popularGrid}>
          {popularToShow.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addInterest(item)}
              style={styles.popularChip}
            >
              + {item}
            </button>
          ))}
        </div>
        {POPULAR_INTERESTS.filter((item) => !interests.includes(item)).length > 10 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            style={styles.showMoreBtn}
          >
            {showAll ? '▲ Show less' : `▼ Show ${POPULAR_INTERESTS.filter((item) => !interests.includes(item)).length - 10} more`}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.88rem',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  inputBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '48px',
    padding: '0.45rem 0.75rem',
    background: 'rgba(15, 23, 42, 0.75)',
    border: '1.5px solid rgba(168, 85, 247, 0.35)',
    borderRadius: '10px',
    cursor: 'text',
    transition: 'all 0.2s',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    flex: 1,
    alignItems: 'center',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    opacity: 0.75,
  },
  input: {
    flex: 1,
    minWidth: '180px',
    background: 'transparent',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '0.2rem 0.4rem',
  },
  chevronBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: '#0f172a',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    zIndex: 50,
    maxHeight: '220px',
    overflowY: 'auto',
    padding: '0.3rem',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'none',
    border: 'none',
    color: '#e2e8f0',
    fontSize: '0.82rem',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '6px',
    fontFamily: 'inherit',
  },
  dropdownItemActive: {
    background: 'rgba(168, 85, 247, 0.18)',
    color: '#f1f5f9',
  },
  popularSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginTop: '0.2rem',
  },
  popularLabel: {
    fontSize: '0.78rem',
    color: '#94a3b8',
  },
  popularGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
  },
  popularChip: {
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    fontSize: '0.76rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },
  showMoreBtn: {
    background: 'none',
    border: 'none',
    color: '#a855f7',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0.2rem 0',
    width: 'fit-content',
  },
};
