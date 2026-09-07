import React from 'react';

export default function ScoreCard({ score, label, source = 'deterministic', evidence }) {
  const getRating = (s) => {
    if (s >= 75) return { color: 'text-score-strong', bg: 'bg-score-strong/10', border: 'border-score-strong/25', badge: 'STRONG' };
    if (s >= 50) return { color: 'text-score-partial', bg: 'bg-score-partial/10', border: 'border-score-partial/25', badge: 'PARTIAL' };
    return { color: 'text-score-weak', bg: 'bg-score-weak/10', border: 'border-score-weak/25', badge: 'WEAK' };
  };

  const rating = getRating(score);

  return (
    <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">{label}</span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${rating.color} ${rating.bg} ${rating.border} font-semibold`}>
          {rating.badge}
        </span>
      </div>

      <div className={`text-2xl font-mono font-semibold tabular-nums ${rating.color}`}>
        {score}%
      </div>

      <div className="text-xs font-mono text-ink-subtle">
        SOURCE: {source.toUpperCase()}
      </div>

      {evidence && (
        <p className="text-xs text-ink-muted mt-2 border-t border-border-subtle pt-2 leading-relaxed">
          {evidence}
        </p>
      )}
    </div>
  );
}
