import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  X,
  TrendUp,
  Minus
} from '@phosphor-icons/react';

/**
 * ScoreDeltaModal — Visual comparison dialog displayed after re-evaluating
 * an updated resume against the same job description.
 *
 * Shows before/after score bars, improvement badges, and skill migration tracking.
 */
export default function ScoreDeltaModal({ isOpen, onClose, deltaData, parentAnalysis, newAnalysis }) {
  if (!isOpen || !deltaData) return null;

  const { score_delta } = deltaData;
  if (!score_delta) return null;

  const scoreSections = [
    { label: 'Overall Match', delta: score_delta.overall_delta, oldScore: parentAnalysis?.overall_score, newScore: newAnalysis?.overall_score },
    { label: 'Skills Match', delta: score_delta.skills_delta, oldScore: parentAnalysis?.skills_score, newScore: newAnalysis?.skills_score },
    { label: 'Keywords', delta: score_delta.keywords_delta, oldScore: parentAnalysis?.keyword_score, newScore: newAnalysis?.keyword_score },
    { label: 'Experience', delta: score_delta.experience_delta, oldScore: parentAnalysis?.experience_score, newScore: newAnalysis?.experience_score },
    { label: 'Education', delta: score_delta.education_delta, oldScore: parentAnalysis?.education_score, newScore: newAnalysis?.education_score },
    { label: 'Quality', delta: score_delta.quality_delta, oldScore: parentAnalysis?.quality_score, newScore: newAnalysis?.quality_score },
  ];

  const DeltaBadge = ({ delta }) => {
    if (delta === 0) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono text-ink-muted bg-surface-raised border border-border-subtle">
        <Minus size={10} weight="bold" />
        0%
      </span>
    );
    const isPositive = delta > 0;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold ${
        isPositive
          ? 'text-score-strong bg-score-strong/10 border border-score-strong/20'
          : 'text-score-weak bg-score-weak/10 border border-score-weak/20'
      }`}>
        {isPositive ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
        {isPositive ? '+' : ''}{delta}%
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Score comparison results"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <TrendUp size={18} weight="fill" className="text-accent" />
            <h2 className="font-display text-lg font-semibold text-ink-primary">
              Revision Comparison
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-raised text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
            aria-label="Close comparison"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Hero Delta Badge */}
        <div className="p-6 text-center border-b border-border-subtle bg-surface-raised/30">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-mono font-semibold ${
            score_delta.overall_delta > 0
              ? 'text-score-strong bg-score-strong/10 border border-score-strong/20'
              : score_delta.overall_delta < 0
              ? 'text-score-weak bg-score-weak/10 border border-score-weak/20'
              : 'text-ink-muted bg-surface-raised border border-border'
          }`}>
            {score_delta.overall_delta > 0 && <ArrowUp size={20} weight="bold" />}
            {score_delta.overall_delta < 0 && <ArrowDown size={20} weight="bold" />}
            <span className="tabular-nums">
              {score_delta.overall_delta > 0 ? '+' : ''}{score_delta.overall_delta}% Match {score_delta.overall_delta >= 0 ? 'Improvement' : 'Change'}
            </span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="p-5 space-y-3 max-h-[40vh] overflow-y-auto">
          {scoreSections.map((section) => (
            <div key={section.label} className="flex items-center justify-between py-2">
              <span className="text-sm font-display font-medium text-ink-primary">{section.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-ink-muted tabular-nums">
                  {section.oldScore ?? 0}%
                </span>
                <span className="text-ink-muted">→</span>
                <span className="text-xs font-mono text-ink-primary font-semibold tabular-nums">
                  {section.newScore ?? 0}%
                </span>
                <DeltaBadge delta={section.delta} />
              </div>
            </div>
          ))}
        </div>

        {/* Skill Migration Tags */}
        {(score_delta.resolved_missing_skills?.length > 0 || score_delta.newly_matched_skills?.length > 0) && (
          <div className="p-5 border-t border-border-subtle space-y-3">
            {score_delta.resolved_missing_skills?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-score-strong uppercase tracking-wider block mb-2">
                  Gaps Resolved
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {score_delta.resolved_missing_skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-score-strong/10 text-score-strong text-xs font-mono border border-score-strong/20">
                      <CheckCircle size={12} weight="fill" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {score_delta.newly_matched_skills?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-accent uppercase tracking-wider block mb-2">
                  Newly Matched
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {score_delta.newly_matched_skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-mono border border-accent/20">
                      <CheckCircle size={12} weight="fill" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-canvas text-xs font-display font-medium transition-colors cursor-pointer"
          >
            View Full Report
          </button>
        </div>
      </div>
    </div>
  );
}
