import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
  const [show, setShow] = useState({ pw: false, cpw: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const pw = form.password;

  const checks = [
    { label: 'At least 8 characters', ok: pw.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(pw) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(pw) },
    { label: 'Contains a digit', ok: /\d/.test(pw) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim()) { setError('Please enter your full name.'); return; }
    if (!checks.every(c => c.ok)) { setError('Password does not meet the requirements.'); return; }
    if (pw !== form.confirm_password) { setError('Passwords do not match.'); return; }
    try {
      setLoading(true);
      await register(form.full_name, form.email, form.password, form.confirm_password);
      setDone(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : Array.isArray(d) ? d.map(x => x.msg ?? x).join(', ') : 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div style={s.page}>
      <div style={s.successWrap}>
        <CheckCircle2 size={48} color="#10b981" />
        <h2 style={{ color: '#f9fafb', marginTop: '1rem' }}>Account created!</h2>
        <p style={{ color: '#6b7280' }}>Redirecting to your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.logo}><span style={s.logoDot} />CareerAI</div>
          <h1 style={s.hero}>Start your career<br />journey today.</h1>
          <p style={s.heroSub}>
            Get personalized career recommendations powered by machine learning
            and real job-market data.
          </p>
          <ul style={s.list}>
            {['Skill gap analysis & roadmap', 'Top 5 career matches with match scores', 'Evidence-based recommendations'].map(f => (
              <li key={f} style={s.listItem}>
                <CheckCircle2 size={15} color="#6366f1" style={{ flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.form}>
          <div style={s.formHeader}>
            <h2 style={s.title}>Create an account</h2>
            <p style={s.subtitle}>Fill in your details to get started</p>
          </div>

          {error && (
            <div style={s.error}><AlertCircle size={15} />{error}</div>
          )}

          <form onSubmit={handleSubmit} style={s.fields}>
            {/* Full name */}
            <div style={s.field}>
              <label style={s.label}>Full name</label>
              <div style={s.inputWrap}>
                <User size={15} style={s.icon} />
                <input type="text" value={form.full_name} onChange={set('full_name')}
                  placeholder="Jane Smith" style={s.input} autoComplete="name" required />
              </div>
            </div>

            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <div style={s.inputWrap}>
                <Mail size={15} style={s.icon} />
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" style={s.input} autoComplete="email" required />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <Lock size={15} style={s.icon} />
                <input type={show.pw ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="Create a strong password"
                  style={s.input} autoComplete="new-password" required />
                <button type="button" onClick={() => setShow(p => ({ ...p, pw: !p.pw }))} style={s.eyeBtn}>
                  {show.pw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {pw && (
                <div style={s.checks}>
                  {checks.map(c => (
                    <span key={c.label} style={{ ...s.check, color: c.ok ? '#10b981' : '#374151' }}>
                      <CheckCircle2 size={11} />
                      {c.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={s.field}>
              <label style={s.label}>Confirm password</label>
              <div style={s.inputWrap}>
                <Lock size={15} style={s.icon} />
                <input type={show.cpw ? 'text' : 'password'} value={form.confirm_password}
                  onChange={set('confirm_password')} placeholder="Re-enter your password"
                  style={{
                    ...s.input,
                    borderColor: form.confirm_password
                      ? form.confirm_password === pw ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'
                      : undefined,
                  }}
                  autoComplete="new-password" required />
                <button type="button" onClick={() => setShow(p => ({ ...p, cpw: !p.cpw }))} style={s.eyeBtn}>
                  {show.cpw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ ...s.submit, ...(loading ? s.submitDisabled : {}) }}>
              {loading
                ? <><Loader2 size={16} className="spinner" />Creating account…</>
                : 'Create account'}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', background: '#080d1a' },
  successWrap: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },

  left: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '3rem', background: 'linear-gradient(145deg, #0d1424 0%, #111827 100%)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
  },
  leftInner: { maxWidth: 400 },
  logo: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '1rem', fontWeight: 700, color: '#9ca3af', marginBottom: '2.5rem',
  },
  logoDot: {
    width: 8, height: 8, borderRadius: '50%', background: '#6366f1',
    boxShadow: '0 0 8px rgba(99,102,241,0.8)', display: 'inline-block',
  },
  hero: { fontSize: '2.2rem', fontWeight: 800, color: '#f9fafb', lineHeight: 1.25, marginBottom: '1rem' },
  heroSub: { fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '2rem' },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  listItem: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    fontSize: '0.875rem', color: '#9ca3af',
  },

  right: {
    width: 480, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '3rem 2.5rem',
    background: '#0a0f1e', overflowY: 'auto',
  },
  form: { width: '100%', maxWidth: 360 },
  formHeader: { marginBottom: '1.75rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.3rem' },
  subtitle: { fontSize: '0.875rem', color: '#6b7280' },

  error: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.7rem 1rem', marginBottom: '1.25rem',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8, color: '#f87171', fontSize: '0.83rem',
  },

  fields: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#d1d5db' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '0.85rem', color: '#4b5563', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '0.68rem 0.85rem 0.68rem 2.4rem',
    background: '#0d1424', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, color: '#f9fafb', fontSize: '0.875rem',
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s',
  },
  eyeBtn: {
    position: 'absolute', right: '0.75rem',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#4b5563', display: 'flex', alignItems: 'center', padding: 2,
  },
  checks: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginTop: '0.4rem',
  },
  check: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    fontSize: '0.72rem', fontWeight: 500, transition: 'color 0.2s',
  },
  submit: {
    marginTop: '0.5rem', width: '100%', padding: '0.75rem',
    background: '#6366f1', border: 'none', borderRadius: 8,
    color: '#fff', fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
  submitDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  footer: { marginTop: '1.5rem', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
};
