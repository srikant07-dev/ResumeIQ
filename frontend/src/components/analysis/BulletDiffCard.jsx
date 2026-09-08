import React, { useState } from 'react';
import {
  Copy,
  Check,
  CaretDown,
  CaretUp,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  Quotes
} from '@phosphor-icons/react';

export default function BulletDiffCard({ rec, index, onCopy, isCopied }) {
  const [showEvidence, setShowEvidence] = useState(false);

  const afterText = rec.suggested_action || rec.description;

  const priorityClasses = {
    HIGH: 'bg-error/10 text-error border-error/30',
    MEDIUM: 'bg-warning/10 text-warning border-warning/30',
    LOW: 'bg-accent/10 text-accent border-accent/30',
  };

  const badgeClass = priorityClasses[rec.priority] || priorityClasses.LOW;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 space-y-4 hover:border-border-hover transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase border ${badgeClass}`}>
            {rec.priority || 'RECOMMENDED'} priority
          </span>
          <span className="font-mono text-xs text-ink-subtle">
            REC-{String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onCopy(afterText, index)}
          aria-label="Copy Action"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-raised hover:bg-surface-hover text-xs font-mono text-ink-muted hover:text-ink-primary transition-all border border-border-subtle cursor-pointer btn-press"
          title="Copy recommendation action"
        >
          {isCopied ? (
            <>
              <Check size={14} weight="bold" className="text-accent" />
              <span className="text-accent font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} weight="bold" />
              <span>Copy Action</span>
            </>
          )}
        </button>
      </div>

      {/* Recommendation Title & Rationale */}
      <div>
        <h4 className="font-display text-base font-semibold text-ink-primary">
          {rec.title}
        </h4>
        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mt-1">
          {rec.description}
        </p>
      </div>

      {/* Before vs After Diff Container OR Single Action Card */}
      {rec.before_bullet ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Before: Weak / Vague */}
          <div className="p-3.5 rounded-lg bg-canvas/80 border border-error/20 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-error font-medium">
              <span>BEFORE (IDENTIFIED IN RESUME)</span>
              <span className="line-through text-ink-faint">REVISE</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed line-through decoration-error/40 font-body">
              {rec.before_bullet}
            </p>
          </div>

          {/* After: Optimized & Metric-Driven */}
          <div className="p-3.5 rounded-lg bg-accent/5 border border-accent/30 space-y-2 relative">
            <div className="flex items-center justify-between text-[11px] font-mono text-accent font-medium">
              <span className="flex items-center gap-1">
                <Sparkle size={13} weight="fill" />
                OPTIMIZED REVISION
              </span>
              <span className="text-[10px] uppercase font-semibold text-accent">READY</span>
            </div>
            <p className="text-xs text-ink-primary leading-relaxed font-body font-medium">
              {afterText}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-lg bg-accent/5 border border-accent/30 space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-accent font-medium">
            <span className="flex items-center gap-1">
              <Sparkle size={13} weight="fill" />
              RECOMMENDED ACTION
            </span>
            <span className="text-[10px] uppercase font-semibold text-accent">READY</span>
          </div>
          <p className="text-xs text-ink-primary leading-relaxed font-body font-medium">
            {afterText}
          </p>
        </div>
      )}

      {/* Toggleable Evidence Citation */}
      {rec.evidence && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowEvidence(!showEvidence)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-subtle hover:text-accent transition-colors cursor-pointer"
          >
            <span>Target Job Citation & Grounding</span>
            {showEvidence ? <CaretUp size={12} /> : <CaretDown size={12} />}
          </button>

          {showEvidence && (
            <div className="mt-2.5 p-3 rounded-lg bg-canvas border border-border-subtle text-xs font-mono text-ink-muted leading-relaxed flex items-start gap-2">
              <Quotes size={16} weight="bold" className="text-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-accent font-semibold">Evidence from job description: </span>
                {rec.evidence}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
