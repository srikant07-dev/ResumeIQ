import React, { useState, useEffect } from 'react';
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
  User,
  MagnifyingGlass
} from '@phosphor-icons/react';

import StatusBar from './StatusBar';
import CommandMenu from '../common/CommandMenu';

export default function AppLayout() {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch {
      navigate('/login');
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
    <div className="min-h-dvh flex flex-col bg-canvas text-ink-primary font-body bg-grid-pattern">
      {/* Skip to content for keyboard a11y */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:bg-accent focus:text-canvas focus:px-4 focus:py-2 focus:text-sm focus:font-medium">
        Skip to content
      </a>

      {/* 1. Always-on Mono Status Bar (Signature Element) */}
      <StatusBar activeState="ACTIVE" onOpenCommandMenu={() => setCommandMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Desktop Sidebar */}
        <aside className="w-64 border-r border-border bg-canvas hidden md:flex flex-col justify-between shrink-0">
          <div>
            {/* Logo */}
            <div className="p-6 border-b border-border-subtle">
              <NavLink to="/dashboard" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-canvas font-semibold group-hover:scale-105 transition-transform duration-200">
                  <FileText size={18} weight="bold" />
                </div>
                <span className="font-display text-xl font-semibold tracking-tight">
                  Resume<span className="text-accent">IQ</span>
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
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'text-ink-muted hover:text-ink-primary hover:bg-surface border border-transparent'
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
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center gap-3 px-2 py-1.5 rounded bg-surface border border-border-subtle">
              <div className="w-7 h-7 rounded-full bg-surface-raised text-accent flex items-center justify-center font-mono text-xs font-semibold">
                <User size={14} weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink-primary truncate">
                  {user?.user_metadata?.full_name || 'Active Candidate'}
                </p>
                <p className="text-[11px] font-mono text-ink-muted truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-mono text-ink-muted hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-colors duration-150 cursor-pointer"
            >
              <SignOut size={15} weight="bold" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* 3. Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <header className="border-b border-border bg-canvas px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-ink-muted hover:text-ink-primary rounded-md hover:bg-surface border border-border-subtle"
                aria-label="Open Navigation Menu"
              >
                <List size={20} weight="bold" />
              </button>

              <h1 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-ink-primary">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Command Palette Header Trigger */}
              <button
                type="button"
                onClick={() => setCommandMenuOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-mono text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
                title="Open Command Palette (⌘K or Ctrl+K)"
              >
                <MagnifyingGlass size={14} className="text-ink-subtle" />
                <span className="text-xs">Search...</span>
                <kbd className="ml-1 text-[10px]">⌘K</kbd>
              </button>

              <NavLink
                to="/analyze"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-canvas px-3.5 py-1.5 rounded-md text-xs font-medium font-body transition-colors duration-150 shadow-sm cursor-pointer btn-press"
              >
                <Sparkle size={14} weight="bold" />
                <span className="hidden sm:inline">New Analysis</span>
                <span className="sm:hidden">Analyze</span>
              </NavLink>
            </div>
          </header>

          {/* Dynamic Content */}
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Command Palette Modal */}
      <CommandMenu isOpen={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />

      {/* 4. Mobile Full-Screen Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-canvas/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200 md:hidden">
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-canvas font-semibold">
                <FileText size={18} weight="bold" />
              </div>
              <span className="font-display text-xl font-semibold">Resume<span className="text-accent">IQ</span></span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-ink-muted hover:text-ink-primary rounded-md border border-border-subtle"
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
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-ink-muted hover:text-ink-primary hover:bg-surface'
                  }`}
                >
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-border space-y-4">
            <div className="text-xs font-mono text-ink-muted">
              Signed in as: <span className="text-ink-primary">{user?.email}</span>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-surface-raised text-sm text-error font-medium"
            >
              <SignOut size={18} weight="bold" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
