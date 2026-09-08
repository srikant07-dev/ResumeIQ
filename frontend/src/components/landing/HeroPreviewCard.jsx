import React, { useState } from 'react';
import { NavLink } from 'react-router';
import {
  CheckCircle,
  XCircle,
  WarningCircle,
  Lightning,
  Sparkle,
  Quotes,
  CaretRight,
  ArrowRight
} from '@phosphor-icons/react';

const PREVIEW_ROLES = [
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    company: 'Stripe / Vercel Tier Tech',
    score: 84,
    rating: 'Strong Match',
    ratingClass: 'text-score-strong',
    strokeColor: 'var(--color-score-strong)',
    matchedSkills: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Tailwind CSS'],
    missingSkills: ['Docker', 'Kubernetes'],
    evidence: 'Candidate matches 5 of 6 core technical requirements with documented production REST API experience. Missing container orchestration credentials.',
    simulatedSkill: 'Docker Containerization',
    simulatedScore: 92,
  },
  {
    id: 'ai-platform',
    title: 'AI Platform Engineer',
    company: 'LLM Infrastructure Lab',
    score: 72,
    rating: 'Good Match',
    ratingClass: 'text-score-strong',
    strokeColor: 'var(--color-score-strong)',
    matchedSkills: ['Python', 'LLM Prompting', 'Vector Search', 'FastAPI'],
    missingSkills: ['LangChain', 'vLLM', 'Ray'],
    evidence: 'Strong Python and API foundation; lacks explicit distributed inference experience requested in section 3 of the job posting.',
    simulatedSkill: 'vLLM Inference Engine',
    simulatedScore: 83,
  },
  {
    id: 'devops',
    title: 'Cloud & Systems Specialist',
    company: 'Fintech Infrastructure',
    score: 58,
    rating: 'Partial Match',
    ratingClass: 'text-score-partial',
    strokeColor: 'var(--color-score-partial)',
    matchedSkills: ['Linux', 'Git', 'SQL', 'Python'],
    missingSkills: ['Terraform', 'AWS IAM', 'Ansible', 'Prometheus'],
    evidence: 'Fundamental systems and scripting present. Missing required Infrastructure-as-Code and metrics telemetry experience.',
    simulatedSkill: 'Terraform & AWS IAM',
    simulatedScore: 75,
  },
];

export default function HeroPreviewCard() {
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [simulated, setSimulated] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const role = PREVIEW_ROLES[activeRoleIndex];
  const currentScore = simulated ? role.simulatedScore : role.score;

  const handleRoleChange = (idx) => {
    setActiveRoleIndex(idx);
    setSimulated(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 text-left bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* 1. Terminal Window Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-border-subtle bg-surface-raised/40 flex items-center justify-between font-mono text-xs text-ink-muted select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-error/70 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-accent/70 inline-block"></span>
          <span className="ml-2 text-ink-primary font-medium hidden sm:inline">
            LIVE_EVALUATION_PREVIEW.JSX
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-accent flex items-center gap-1 font-semibold">
            <Sparkle size={12} weight="fill" />
            INTERACTIVE DEMO
          </span>
        </div>
      </div>

      {/* 2. Target Role Selector Tabs */}
      <div className="flex overflow-x-auto border-b border-border-subtle bg-surface px-4 sm:px-6 gap-2 pt-3 pb-2.5 no-scrollbar">
        {PREVIEW_ROLES.map((r, idx) => (
          <button
            key={r.id}
            type="button"
            onClick={() => handleRoleChange(idx)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer whitespace-nowrap btn-press ${
              activeRoleIndex === idx
                ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                : 'text-ink-muted hover:text-ink-primary hover:bg-surface-raised border border-transparent'
            }`}
          >
            {r.title} ({r.score}%)
          </button>
        ))}
      </div>

      {/* 3. Main Live Diagnostic Body */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Circular Score Gauge */}
          <div className="flex items-center justify-center p-4 bg-canvas rounded-xl border border-border-subtle">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--color-surface-raised)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={role.strokeColor}
                  strokeWidth="8"
                  strokeDasharray={`${currentScore * 3.14} 314`}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-mono text-3xl font-semibold text-ink-primary tabular-nums">
                  {currentScore}%
                </span>
                <span className={`text-[10px] font-mono uppercase font-semibold ${role.ratingClass}`}>
                  {simulated ? 'SIMULATED' : role.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Core Metrics & Breakdown */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">
                  Target Evaluation
                </span>
                <span className="text-xs font-mono text-accent">{role.company}</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-primary">
                {role.title}
              </h3>
            </div>

            {/* Formula Pill Row */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-surface-raised/50 border border-border-subtle">
                <span className="text-ink-subtle text-[10px] block">SKILLS (35%)</span>
                <span className="text-accent font-semibold tabular-nums">
                  {simulated ? '94%' : `${role.score - 4}%`}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-raised/50 border border-border-subtle">
                <span className="text-ink-subtle text-[10px] block">EXP (25%)</span>
                <span className="text-ink-primary font-semibold tabular-nums">85%</span>
              </div>
              <div className="p-2 rounded-lg bg-surface-raised/50 border border-border-subtle">
                <span className="text-ink-subtle text-[10px] block">KEYWORDS (20%)</span>
                <span className="text-ink-primary font-semibold tabular-nums">
                  {simulated ? '88%' : `${role.score - 2}%`}
                </span>
              </div>
            </div>

            {/* Simulated What-If Toggle */}
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightning size={16} weight="fill" className="text-accent" />
                <span className="text-xs font-mono text-ink-secondary">
                  Simulate adding <strong>{role.simulatedSkill}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSimulated(!simulated)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer btn-press ${
                  simulated
                    ? 'bg-accent text-canvas'
                    : 'bg-surface-raised text-accent border border-accent/30 hover:bg-accent/15'
                }`}
              >
                {simulated ? 'Active (+ ' + (role.simulatedScore - role.score) + '%)' : '+ Simulate'}
              </button>
            </div>
          </div>
        </div>

        {/* Matched vs Missing Skill Tags */}
        <div className="space-y-3 pt-2 border-t border-border-subtle">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-ink-subtle text-[11px] uppercase mr-1">Matched:</span>
            {role.matchedSkills.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                <CheckCircle size={12} weight="fill" /> {s}
              </span>
            ))}
            {simulated && (
              <span className="px-2.5 py-0.5 rounded bg-accent text-canvas border border-accent flex items-center gap-1 font-semibold animate-in zoom-in-95">
                <Sparkle size={12} weight="fill" /> {role.simulatedSkill}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-ink-subtle text-[11px] uppercase mr-1">Missing Gaps:</span>
            {role.missingSkills.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded bg-error/10 text-error border border-error/20 flex items-center gap-1">
                <XCircle size={12} weight="fill" /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Citation Accordion */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowEvidence(!showEvidence)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-subtle hover:text-accent transition-colors cursor-pointer"
          >
            <Quotes size={14} weight="bold" className="text-accent" />
            <span>View Deterministic Citation & Evidence</span>
          </button>

          {showEvidence && (
            <div className="mt-2.5 p-3 rounded-lg bg-canvas border border-border-subtle text-xs font-mono text-ink-muted leading-relaxed animate-in fade-in duration-150">
              <span className="text-accent font-semibold">Job Requirement Evidence: </span>
              {role.evidence}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Action Banner */}
      <div className="px-6 py-4 border-t border-border-subtle bg-surface-raised/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <span className="text-ink-muted">
          Want this deep level of precision for your own resume?
        </span>
        <NavLink
          to="/register"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium px-4 py-2 rounded-md transition-colors btn-press"
        >
          <span>Run Analysis on My Resume</span>
          <ArrowRight size={14} weight="bold" />
        </NavLink>
      </div>
    </div>
  );
}
