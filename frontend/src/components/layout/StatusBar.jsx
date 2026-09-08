import React from 'react';
import { useLocation } from 'react-router';
import { ShieldCheck } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';

export default function StatusBar({ activeState = 'ACTIVE', onOpenCommandMenu }) {
  const location = useLocation();
  const { user, session } = useAuth();

  const isDemo = session?.access_token === 'demo-token' || user?.id?.startsWith('demo-');

  return (
    <div className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 backdrop-blur-sm px-4 py-1.5 text-xs font-mono text-ink-muted flex justify-between items-center select-none">
      <div className="flex items-center gap-2.5 overflow-hidden">
        {/* Status Indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
        </span>
        <span className="text-ink-primary font-medium tracking-tight whitespace-nowrap">
          STATUS: {activeState}
        </span>
        <span className="text-ink-faint hidden sm:inline">|</span>
        <span className="hidden sm:inline text-ink-muted whitespace-nowrap">
          PIPELINE: HYBRID_EVAL_V2
        </span>
        <span className="text-ink-faint hidden lg:inline">|</span>
        <span className="hidden lg:inline text-ink-subtle truncate max-w-[200px]">
          ROUTE: {location.pathname}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs shrink-0">
        {/* Command Menu Trigger */}
        {onOpenCommandMenu && (
          <button
            type="button"
            onClick={onOpenCommandMenu}
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-raised hover:bg-surface-hover border border-border-subtle text-ink-muted hover:text-ink-primary transition-colors cursor-pointer text-[11px]"
            title="Open Command Palette (⌘K or Ctrl+K)"
          >
            <kbd className="text-[10px]">⌘K</kbd>
            <span>Commands</span>
          </button>
        )}

        <span className="hidden md:inline text-ink-subtle">REGION: ap-south-1</span>
        <span className="text-ink-faint hidden md:inline">|</span>
        <span className="hidden sm:inline text-ink-muted tabular-nums">
          RTT: 14ms
        </span>
        <span className="text-ink-faint hidden sm:inline">|</span>
        <span className="text-accent flex items-center gap-1 font-medium">
          <ShieldCheck size={14} weight="bold" />
          {isDemo ? 'DEMO_MODE' : 'AUTH_VERIFIED'}
        </span>
      </div>
    </div>
  );
}
