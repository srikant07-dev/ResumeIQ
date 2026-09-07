import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  MagnifyingGlass,
  SquaresFour,
  Sparkle,
  ClockCounterClockwise,
  Gear,
  FileText,
  ArrowsClockwise,
  FilePdf,
  X,
  ArrowRight
} from '@phosphor-icons/react';

export default function CommandMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const isAnalysisPage = location.pathname.startsWith('/analysis/');

  const allActions = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      category: 'Navigation',
      icon: SquaresFour,
      shortcut: 'G D',
      perform: () => navigate('/dashboard'),
    },
    {
      id: 'new-analysis',
      label: 'Start New Analysis',
      category: 'Actions',
      icon: Sparkle,
      shortcut: 'N',
      perform: () => navigate('/analyze'),
    },
    {
      id: 'history',
      label: 'View Analysis History',
      category: 'Navigation',
      icon: ClockCounterClockwise,
      shortcut: 'G H',
      perform: () => navigate('/history'),
    },
    {
      id: 'settings',
      label: 'System Settings & Profile',
      category: 'Navigation',
      icon: Gear,
      shortcut: 'G S',
      perform: () => navigate('/settings'),
    },
    ...(isAnalysisPage
      ? [
          {
            id: 'export-pdf',
            label: 'Export Current Report as PDF',
            category: 'Report Actions',
            icon: FilePdf,
            shortcut: '⌘P',
            perform: () => window.print(),
          },
        ]
      : []),
  ];

  const filteredActions = allActions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredActions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredActions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].perform();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-subtle gap-3">
          <MagnifyingGlass size={18} className="text-ink-subtle shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search actions..."
            className="flex-1 bg-transparent text-sm text-ink-primary placeholder-ink-subtle focus:outline-none font-body"
          />
          <kbd className="hidden sm:inline">ESC</kbd>
        </div>

        {/* Action List */}
        <div ref={listRef} className="max-h-72 overflow-y-auto p-2 divide-y divide-transparent">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-ink-muted">
              No matching commands found.
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    action.perform();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs font-body ${
                    isSelected
                      ? 'bg-surface-raised text-ink-primary'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${isSelected ? 'text-accent bg-accent/10' : 'text-ink-muted bg-surface'}`}>
                      <Icon size={16} weight={isSelected ? 'bold' : 'regular'} />
                    </div>
                    <div>
                      <span className="font-medium text-sm block font-display">
                        {action.label}
                      </span>
                      <span className="text-[10px] font-mono text-ink-subtle">
                        {action.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {action.shortcut && <kbd>{action.shortcut}</kbd>}
                    {isSelected && <ArrowRight size={13} className="text-accent" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Status Bar Footer */}
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-raised/40 flex items-center justify-between text-[11px] font-mono text-ink-subtle">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>ResumeIQ Command Engine</span>
        </div>
      </div>
    </div>
  );
}
