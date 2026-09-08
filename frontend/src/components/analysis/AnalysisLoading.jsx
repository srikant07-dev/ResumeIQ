import React, { useState, useEffect } from 'react';
import { Cpu, CircleNotch } from '@phosphor-icons/react';

export default function AnalysisLoading() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pipelineStages = [
    { id: '01', title: 'PDF Structure & Section Isolation' },
    { id: '02', title: 'Deterministic Skill & Keyword Comparison' },
    { id: '03', title: 'Experience Relevance & Academic Alignment' },
    { id: '04', title: 'Hybrid Weighted Score Matrix Calculation' },
    { id: '05', title: 'Actionable Insights & Rewrite Synthesis' },
  ];

  useEffect(() => {
    // Genuine elapsed timer
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 max-w-xl mx-auto my-8 shadow-2xl animate-in fade-in duration-300">
      {/* Top Technical Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
          <span className="text-ink-primary font-medium tracking-tight">PIPELINE_ACTIVE</span>
        </div>
        <div className="flex items-center gap-3 text-ink-muted">
          <span className="text-accent tabular-nums">ELAPSED: {formatTimer(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Main Title & Scanner Icon */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3 border border-accent/20">
          <Cpu size={24} weight="bold" />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
          Evaluating Resume Alignment
        </h3>
        <p className="text-xs text-ink-muted mt-1">
          Processing candidate profile through deterministic and semantic evaluation pipeline.
        </p>
      </div>

      {/* Indeterminate Scanning Bar */}
      <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden mb-6 relative">
        <div className="absolute top-0 bottom-0 left-0 bg-accent w-1/3 rounded-full animate-[indeterminate_1.8s_ease-in-out_infinite]"></div>
      </div>

      {/* Pipeline Stage Overview (honest static architectural list, no fake timer ticks) */}
      <div className="space-y-2 mb-6">
        <div className="text-[11px] font-mono text-ink-muted uppercase tracking-wider mb-2">
          Evaluation Scope
        </div>
        {pipelineStages.map((stage) => (
          <div
            key={stage.id}
            className="px-3 py-2 rounded-lg bg-surface-raised/30 border border-border-subtle flex items-center justify-between text-xs font-mono"
          >
            <div className="flex items-center gap-2.5">
              <CircleNotch size={13} weight="bold" className="text-accent animate-spin shrink-0" />
              <span className="text-ink-muted">{stage.title}</span>
            </div>
            <span className="text-[10px] text-ink-subtle">{stage.id}</span>
          </div>
        ))}
      </div>

      {/* Technical Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-ink-subtle pt-3 border-t border-border-subtle">
        <span>Engine: Google Gemini 3.6 Flash</span>
        <span>Storage: PostgreSQL Private</span>
      </div>

      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
