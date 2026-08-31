import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  SquaresFour,
  Sparkle,
  ClockCounterClockwise,
  Gear,
  SignOut,
  List,
  X,
  FileText,
  ShieldCheck,
  User
} from '@phosphor-icons/react';

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: SquaresFour },
    { label: 'New Analysis', path: '/analyze', icon: Sparkle },
    { label: 'History', path: '/history', icon: ClockCounterClockwise },
    { label: 'Settings', path: '/settings', icon: Gear },
  ];

  const getPageTitle = () => {
    if (location.pathname.startsWith('/analysis/')) return 'Analysis Report';
    switch (location.pathname) {
      case '/dashboard': return 'Application Dashboard';
      case '/analyze': return 'New Resume Analysis';
      case '/history': return 'Analysis History';
      case '/settings': return 'System Settings';
      default: return 'ResumeIQ Platform';
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#09090b] text-[#fafafa] font-['Geist',sans-serif]">
      {/* 1. Always-on Mono Status Bar (Signature Element) */}
      <div className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#18181b]/95 backdrop-blur px-4 py-1.5 text-xs font-mono text-[#a1a1aa] flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="text-[#fafafa] font-medium tracking-tight">STATUS: ACTIVE</span>
          <span className="text-[#52525b] hidden sm:inline">|</span>
          <span className="hidden sm:inline text-[#a1a1aa]">PIPELINE: HYBRID_EVAL_V2</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="hidden md:inline text-[#71717a]">REGION: ap-south-1</span>
          <span className="text-[#52525b] hidden md:inline">|</span>
          <span className="text-[#10b981] flex items-center gap-1 font-medium">
            <ShieldCheck size={14} weight="bold" />
            AUTH_VERIFIED
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Desktop Sidebar */}
        <aside className="w-64 border-r border-white/[0.08] bg-[#09090b] hidden md:flex flex-col justify-between shrink-0">
          <div>
            {/* Logo */}
            <div className="p-6 border-b border-white/[0.06]">
              <NavLink to="/dashboard" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-[#09090b] font-bold group-hover:scale-105 transition-transform duration-200">
                  <FileText size={18} weight="bold" />
                </div>
                <span className="font-['Outfit',sans-serif] text-xl font-semibold tracking-tight">
                  Resume<span className="text-[#10b981]">IQ</span>
                </span>
              </NavLink>
            </div>

            {/* Navigation links */}
            <nav className="p-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                        : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] border border-transparent'
                    }`}
                  >
                    <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User Profile / Logout Section */}
          <div className="p-4 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center gap-3 px-2 py-1.5 rounded bg-[#18181b] border border-white/[0.06]">
              <div className="w-7 h-7 rounded-full bg-[#27272a] text-[#10b981] flex items-center justify-center font-mono text-xs font-semibold">
                <User size={14} weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#fafafa] truncate">
                  {user?.user_metadata?.full_name || 'Active Candidate'}
                </p>
                <p className="text-[11px] font-mono text-[#a1a1aa] truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-mono text-[#a1a1aa] hover:text-[#ef4444] hover:bg-[#ef4444]/10 border border-transparent hover:border-[#ef4444]/20 transition-colors duration-150 cursor-pointer"
            >
              <SignOut size={15} weight="bold" />
              <span>TERMINATE_SESSION</span>
            </button>
          </div>
        </aside>

        {/* 3. Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <header className="border-b border-white/[0.08] bg-[#09090b] px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-[#a1a1aa] hover:text-[#fafafa] rounded-md hover:bg-[#18181b] border border-white/[0.06]"
                aria-label="Open Navigation Menu"
              >
                <List size={20} weight="bold" />
              </button>

              <h1 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-semibold tracking-tight text-[#fafafa]">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <NavLink
                to="/analyze"
                className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#09090b] px-3.5 py-1.5 rounded-md text-xs font-medium font-['Geist',sans-serif] transition-colors duration-150 shadow-sm cursor-pointer"
              >
                <Sparkle size={14} weight="bold" />
                <span className="hidden sm:inline">New Analysis</span>
                <span className="sm:hidden">Analyze</span>
              </NavLink>
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 4. Mobile Full-Screen Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200 md:hidden">
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-[#09090b] font-bold">
                <FileText size={18} weight="bold" />
              </div>
              <span className="font-['Outfit',sans-serif] text-xl font-semibold">Resume<span className="text-[#10b981]">IQ</span></span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#a1a1aa] hover:text-[#fafafa] rounded-md border border-white/[0.06]"
              aria-label="Close menu"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          <nav className="flex-1 py-8 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                      : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]'
                  }`}
                >
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/[0.08] space-y-4">
            <div className="text-xs font-mono text-[#a1a1aa]">
              Signed in as: <span className="text-[#fafafa]">{user?.email}</span>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-[#27272a] text-sm text-[#ef4444] font-medium"
            >
              <SignOut size={18} weight="bold" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
