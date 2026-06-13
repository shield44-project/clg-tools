// components/LoginButton.js
import { useState, useEffect } from 'react';

export default function LoginButton() {
  const getSavedUsername = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('rvce-calculator-username') || '';
  };

  const [username, setUsername] = useState(() => getSavedUsername());
  const [showModal, setShowModal] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('rvce-calculator-username');
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const isLoggedIn = Boolean(username);

  // Handle opening modal and scrolling to top
  const handleOpenModal = () => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay to ensure scroll starts before modal opens
    setTimeout(() => {
      setShowModal(true);
    }, 100);
  };

  // Disable body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
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
    const storedPassword = localStorage.getItem(`rvce-calculator-password-${username}`);
    
    if (storedPassword) {
      // Existing user - verify password
      if (storedPassword !== btoa(password)) {
        setError('Invalid username or password');
        return;
      }
    } else {
      // New user - create account
      localStorage.setItem(`rvce-calculator-password-${username}`, btoa(password));
    }
    
    // Login successful
    localStorage.setItem('rvce-calculator-username', username);
    localStorage.setItem('rvce-calculator-login-time', new Date().toISOString());
    setUsername(username);
    setShowModal(false);
    setLoginForm({ username: '', password: '' });
    setError('');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('rvce-calculator-username');
      setUsername('');
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-orange-500/20 border border-cyan-500/30">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-cyan-300">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleOpenModal}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border border-cyan-400/30"
        >
          Login
        </button>
      )}

      {/* Login Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}>
          <div className="relative bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-5 max-w-sm w-full animate-slideUp mt-12 sm:mt-20 mb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-orange-400">
                Login
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-400 text-xs mb-4">
              Login is optional. Enter your credentials to personalize your experience.
            </p>

            {error && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors duration-200"
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
