import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowRight, WarningCircle, CheckCircle } from '@phosphor-icons/react';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccessMsg('Account created successfully! You can now sign in.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-[#09090b] text-[#fafafa] font-['Geist',sans-serif]">
      {/* Top Brand Link */}
      <NavLink to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-9 h-9 rounded-lg bg-[#10b981] flex items-center justify-center text-[#09090b] font-bold group-hover:scale-105 transition-transform duration-200">
          <FileText size={20} weight="bold" />
        </div>
        <span className="font-['Outfit',sans-serif] text-2xl font-semibold tracking-tight">
          Resume<span className="text-[#10b981]">IQ</span>
        </span>
      </NavLink>

      {/* Register Card */}
      <div className="w-full max-w-md bg-[#18181b] border border-white/[0.08] rounded-xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="font-['Outfit',sans-serif] text-2xl font-semibold tracking-tight text-[#fafafa]">
            Create an Account
          </h2>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Start analyzing your resumes against job descriptions with hybrid precision.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-start gap-2.5 text-xs text-[#ef4444]" aria-live="polite">
            <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-md bg-[#10b981]/10 border border-[#10b981]/20 flex items-start gap-2.5 text-xs text-[#10b981]" aria-live="polite">
            <CheckCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#27272a] border border-white/[0.08] text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#27272a] border border-white/[0.08] text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5" htmlFor="password">
              Password (min. 6 characters)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#27272a] border border-white/[0.08] text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-medium py-2.5 px-4 rounded-md text-sm transition-colors duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#a1a1aa]">
          Already have an account?{' '}
          <NavLink to="/login" className="text-[#10b981] hover:underline font-medium">
            Sign In
          </NavLink>
        </div>
      </div>
    </div>
  );
}
