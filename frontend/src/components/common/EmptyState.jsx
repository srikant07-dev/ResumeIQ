import React from 'react';
import { NavLink } from 'react-router';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  actionIcon: ActionIcon
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto animate-in fade-in duration-200">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-raised text-accent flex items-center justify-center mb-4 border border-border-subtle">
          <Icon size={24} weight="bold" />
        </div>
      )}

      <h4 className="font-display text-lg font-semibold text-ink-primary mb-1">
        {title}
      </h4>

      {description && (
        <p className="text-xs sm:text-sm text-ink-muted mb-6 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && actionTo && (
        <NavLink
          to={actionTo}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium px-4 py-2 rounded-md text-xs transition-colors duration-150 cursor-pointer shadow-sm"
        >
          {ActionIcon && <ActionIcon size={15} weight="bold" />}
          <span>{actionLabel}</span>
        </NavLink>
      )}

      {actionLabel && onAction && !actionTo && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium px-4 py-2 rounded-md text-xs transition-colors duration-150 cursor-pointer shadow-sm"
        >
          {ActionIcon && <ActionIcon size={15} weight="bold" />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
