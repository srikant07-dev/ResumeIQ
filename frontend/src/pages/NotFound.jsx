import React from 'react';
import { NavLink } from 'react-router';
import { ArrowLeft } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-canvas text-ink-primary font-body">
      <div className="text-center max-w-md">
        <span className="font-mono text-7xl font-semibold text-ink-faint select-none block mb-4">
          404
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary mb-2">
          Page not found
        </h1>
        <p className="text-sm text-ink-muted mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Check the URL or head back to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <NavLink
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium px-5 py-2.5 rounded-md text-sm transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Back to Dashboard</span>
          </NavLink>
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 bg-surface hover:bg-surface-raised text-ink-muted border border-border font-medium px-5 py-2.5 rounded-md text-sm transition-colors"
          >
            <span>Go to Home</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
