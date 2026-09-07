import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle, CircleNotch, Sparkle } from '@phosphor-icons/react';

export default function AnalysisLoading() {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const steps = [
    {
      id: '01',
      title: 'PDF Structure & Text Extraction',
      detail: 'Isolating resume sections, employment history, and academic credentials...',
    },
    {
      id: '02',
      title: 'Deterministic Skill & Keyword Matching',
      detail: 'Comparing candidate technical stack against exact job requirements...',
    },
    {
      id: '03',
      title: 'Experience Relevance & Academic Alignment',
      detail: 'Evaluating project depth, seniority fit, and domain alignment via Gemini AI...',
    },
    {
      id: '04',
      title: 'Hybrid Score Matrix Calculation',
      detail: 'Applying 35/25/20/10/10 weighted formula with required evidence citations...',
    },
    {
      id: '05',
      title: 'Actionable Insights & Rewrite Synthesis',
      detail: 'Generating prioritized recommendations grounded in target job description...',
    },
  ];

  useEffect(() => {
    // Honest step progression (cycles every 3.5s through phases)
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3500);

    // Elapsed timer in seconds
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timerInterval);
    };
  }, [steps.length]);

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
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          <span className="text-ink-primary font-medium tracking-tight">PIPELINE_ACTIVE</span>
        </div>
        <div className="flex items-center gap-3 text-ink-muted">
          <span className="tabular-nums">PHASE 0{activeStep + 1} / 0{steps.length}</span>
          <span className="text-ink-faint">|</span>
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
          Running hybrid deterministic and semantic AI evaluation pipeline.
        </p>
      </div>

      {/* Stepped Phases Scanner */}
      <div className="space-y-2.5 mb-6">
        {steps.map((step, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                isCurrent
                  ? 'bg-accent/5 border-accent/30 text-ink-primary'
                  : isDone
                  ? 'bg-surface-raised/40 border-border-subtle text-ink-muted'
                  : 'bg-surface-raised/20 border-transparent text-ink-faint'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {isDone ? (
                    <CheckCircle size={15} weight="fill" className="text-accent shrink-0" />
                  ) : isCurrent ? (
                    <CircleNotch size={15} weight="bold" className="text-accent animate-spin shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-ink-faint shrink-0 flex items-center justify-center text-[9px] font-mono">
                      {step.id}
                    </span>
                  )}
                  <span className={`text-xs font-mono font-medium truncate ${isCurrent ? 'text-ink-primary font-semibold' : ''}`}>
                    {step.title}
                  </span>
                </div>

                <span className="text-[10px] font-mono tracking-wider uppercase shrink-0">
                  {isDone ? (
                    <span className="text-accent">DONE</span>
                  ) : isCurrent ? (
                    <span className="text-accent animate-pulse">RUNNING</span>
                  ) : (
                    <span className="text-ink-faint">QUEUED</span>
                  )}
                </span>
              </div>

              {isCurrent && (
                <p className="text-[11px] text-ink-secondary mt-1.5 pl-6 font-body leading-relaxed animate-in fade-in duration-150">
                  {step.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Indeterminate Scanning Bar */}
      <div className="w-full bg-surface-raised h-1 rounded-full overflow-hidden mb-4 relative">
        <div className="absolute top-0 bottom-0 left-0 bg-accent w-1/3 rounded-full animate-[indeterminate_1.8s_ease-in-out_infinite]"></div>
      </div>

      {/* Technical Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-ink-subtle">
        <span>Engine: Gemini 2.0 Flash Async</span>
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
