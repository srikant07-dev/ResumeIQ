import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowRight, WarningCircle, Sparkle } from '@phosphor-icons/react';

export default function Login() {
  const { signIn, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-canvas text-ink-primary font-body">
      {/* Top Brand Link */}
      <NavLink to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-canvas font-semibold group-hover:scale-105 transition-transform duration-200">
          <FileText size={20} weight="bold" />
        </div>
        <span className="font-display text-2xl font-semibold tracking-tight">
          Resume<span className="text-accent">IQ</span>
        </span>
      </NavLink>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-primary">
            Sign in to ResumeIQ
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Enter your credentials to access your resume analyses.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-md bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-error" aria-live="polite">
            <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="w-full px-3.5 py-2.5 rounded-md bg-surface-raised border border-border text-sm text-ink-primary placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-md bg-surface-raised border border-border text-sm text-ink-primary placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium py-2.5 px-4 rounded-md text-sm transition-colors duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-canvas border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-surface text-ink-subtle font-mono">or try offline</span>
          </div>
        </div>

        {/* Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-2 bg-surface-raised hover:bg-surface-hover text-ink-primary border border-border py-2.5 px-4 rounded-md text-xs font-mono transition-colors duration-150 cursor-pointer"
        >
          <Sparkle size={15} weight="fill" className="text-accent" />
          <span>Launch Demo Mode</span>
        </button>

        <div className="mt-6 text-center text-xs text-ink-muted">
          Don't have an account?{' '}
          <NavLink to="/register" className="text-accent hover:underline font-medium">
            Create Account
          </NavLink>
        </div>
      </div>
    </div>
  );
}
