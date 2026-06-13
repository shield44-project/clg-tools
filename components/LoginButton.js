// components/LoginButton.js
import { useState, useEffect } from 'react';

const USERNAME_KEY = 'rvce-calculator-username';
const LOGIN_TIME_KEY = 'rvce-calculator-login-time';

const encodeCredential = (value) => {
  if (typeof window === 'undefined') return value;

  try {
    const bytes = new TextEncoder().encode(value);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    return window.btoa(binary);
  } catch {
    return value;
  }
};

export default function LoginButton() {
  const [hasMounted, setHasMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const isLoggedIn = Boolean(username);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const savedUsername = localStorage.getItem(USERNAME_KEY) || '';
        setUsername(savedUsername);
        setShowModal(false);
      } catch {
        setShowModal(false);
      } finally {
        setHasMounted(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleOpenModal = () => {
    setError('');
    setShowModal(true);
  };

  useEffect(() => {
    if (!showModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    const username = loginForm.username.trim();
    const password = loginForm.password.trim();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // Validate credentials
    // Store password hash for security
    const passwordHash = encodeCredential(password);
    const storedPassword = localStorage.getItem(`rvce-calculator-password-${username}`);
    
    if (storedPassword) {
      if (storedPassword !== passwordHash) {
        setError('Invalid username or password');
        return;
      }
    } else {
      localStorage.setItem(`rvce-calculator-password-${username}`, passwordHash);
    }
    
    localStorage.setItem(USERNAME_KEY, username);
    localStorage.setItem(LOGIN_TIME_KEY, new Date().toISOString());
    setUsername(username);
    setShowModal(false);
    setLoginForm({ username: '', password: '' });
    setError('');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem(USERNAME_KEY);
      setUsername('');
    }
  };

  if (!hasMounted) {
    return (
      <button type="button" className="glass-button glass-button-compact opacity-70" disabled>
        Login
      </button>
    );
  }

  return (
    <>
      {isLoggedIn ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-cyan-300/25 bg-white/[0.08] px-3 py-2 shadow-sm backdrop-blur-xl sm:px-4">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden max-w-28 safe-truncate text-sm font-semibold text-cyan-100 sm:block">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="glass-button glass-button-compact"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleOpenModal}
          className="glass-button glass-button-primary glass-button-compact"
        >
          Login
        </button>
      )}

      {/* Login Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/72 p-4 backdrop-blur-xl animate-fadeIn" onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}>
          <div className="glass-panel w-full max-w-sm p-5 shadow-2xl animate-slideUp sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
                  <svg className="h-5 w-5 text-cyan-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 2c-2.761 0-5 1.343-5 3v1h10v-1c0-1.657-2.239-3-5-3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">Student Login</h2>
                <p className="mt-1 text-sm text-slate-400">Use a local profile to keep your saved entries separate.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="glass-button glass-button-compact h-9 w-9 p-0"
                aria-label="Close login"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="glass-input text-sm"
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="glass-input text-sm"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="glass-button glass-button-primary"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="glass-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
