import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart2, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Career Matcher', icon: LayoutDashboard },
  { to: '/skill-gap', label: 'Skill Gap', icon: BarChart2 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch {}
    navigate('/login', { replace: true });
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <aside style={s.aside}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.brandDot} />
        <span style={s.brandName}>CareerAI</span>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        <p style={s.navLabel}>Navigation</p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...s.link,
              ...(isActive ? s.linkActive : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={s.footer}>
        {user && (
          <div style={s.userRow}>
            <div style={s.avatar}>{initials}</div>
            <div style={s.userMeta}>
              <p style={s.userName}>{user.full_name || 'User'}</p>
              <p style={s.userEmail}>{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={s.logoutBtn}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

const s = {
  aside: {
    width: 220,
    minWidth: 220,
    height: '100vh',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    background: '#0d1424',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '2.5rem',
    paddingLeft: '0.25rem',
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#6366f1',
    boxShadow: '0 0 10px rgba(99,102,241,0.8)',
  },
  brandName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#f9fafb',
    letterSpacing: '-0.01em',
  },

  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  navLabel: {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: '#374151',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
    paddingLeft: '0.5rem',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.6rem 0.75rem',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: 500,
    color: '#6b7280',
    transition: 'all 0.15s',
  },
  linkActive: {
    color: '#f9fafb',
    background: 'rgba(99,102,241,0.15)',
  },

  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.3rem 0.25rem',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.35)',
    color: '#a5b4fc',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userMeta: { overflow: 'hidden', flex: 1 },
  userName: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#e5e7eb',
    margin: 0,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: '0.7rem',
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
    color: '#6b7280',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    width: '100%',
  },
};
