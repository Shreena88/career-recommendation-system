import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    try {
      setLoading(true);
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.logo}>
            <span style={s.logoDot} />
            CareerAI
          </div>
          <h1 style={s.hero}>Find your path.<br />Build your future.</h1>
          <p style={s.heroSub}>
            AI-powered career recommendations and skill gap analysis tailored to you.
          </p>
          <div style={s.stats}>
            {[['30+', 'Career paths'], ['195', 'Skills mapped'], ['ML', 'Powered engine']].map(([n, l]) => (
              <div key={l} style={s.stat}>
                <span style={s.statNum}>{n}</span>
                <span style={s.statLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.form}>
          <div style={s.formHeader}>
            <h2 style={s.title}>Welcome back</h2>
            <p style={s.subtitle}>Sign in to your account</p>
          </div>

          {error && (
            <div style={s.error}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.fields}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <div style={s.inputWrap}>
                <Mail size={15} style={s.icon} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={s.input}
                  autoComplete="email" required
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <Lock size={15} style={s.icon} />
                <input
                  type={show ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" style={s.input}
                  autoComplete="current-password" required
                />
                <button type="button" onClick={() => setShow(!show)} style={s.eyeBtn} aria-label="Toggle password">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...s.submit, ...(loading ? s.submitDisabled : {}) }}>
              {loading ? <><Loader2 size={16} className="spinner" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p style={s.footer}>
            Don't have an account? <Link to="/register" style={s.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex',
    background: '#080d1a',
  },
  left: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '3rem', background: 'linear-gradient(145deg, #0d1424 0%, #111827 100%)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
  },
  leftInner: { maxWidth: 400 },
  logo: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '1rem', fontWeight: 700, color: '#9ca3af',
    marginBottom: '2.5rem',
  },
  logoDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)',
    display: 'inline-block',
  },
  hero: {
    fontSize: '2.4rem', fontWeight: 800, color: '#f9fafb',
    lineHeight: 1.2, marginBottom: '1rem',
  },
  heroSub: { fontSize: '1rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '2.5rem' },
  stats: { display: 'flex', gap: '2rem' },
  stat: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  statNum: { fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' },
  statLabel: { fontSize: '0.75rem', color: '#4b5563' },

  right: {
    width: 480, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '3rem 2.5rem',
    background: '#0a0f1e',
  },
  form: { width: '100%', maxWidth: 360 },
  formHeader: { marginBottom: '2rem' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.3rem' },
  subtitle: { fontSize: '0.875rem', color: '#6b7280' },

  error: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1rem', marginBottom: '1.25rem',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8, color: '#f87171', fontSize: '0.85rem',
  },

  fields: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#d1d5db' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '0.85rem', color: '#4b5563', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '0.7rem 0.85rem 0.7rem 2.5rem',
    background: '#0d1424', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, color: '#f9fafb', fontSize: '0.88rem',
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s',
  },
  eyeBtn: {
    position: 'absolute', right: '0.75rem',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#4b5563', display: 'flex', alignItems: 'center', padding: 2,
  },
  submit: {
    marginTop: '0.5rem', width: '100%',
    padding: '0.75rem', background: '#6366f1', border: 'none',
    borderRadius: 8, color: '#fff', fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
  submitDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  footer: { marginTop: '1.5rem', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
};
