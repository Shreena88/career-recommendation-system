/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * Shows a loading spinner while the session is being checked,
 * then redirects to /login if the user is not authenticated.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={32} color="#6366f1" style={{ animation: 'spin 0.8s linear infinite' }} />
        <p style={styles.loadingText}>Checking session…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: 0,
  },
};

export default ProtectedRoute;
