import React, { useState } from 'react';
import { NavLink } from 'react-router';
import {
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkle
} from '@phosphor-icons/react';

import HeroPreviewCard from '../components/landing/HeroPreviewCard';
import LegalModal from '../components/common/LegalModal';

export default function Landing() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');

  const openLegal = (tab) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-ink-primary font-body bg-grid-pattern">
      {/* 1. Status Bar */}
      <div className="border-b border-border-subtle bg-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-mono text-ink-muted flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span>RESUME_EVALUATION_ENGINE: ONLINE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-accent font-medium">HYBRID_SCORING_V2</span>
        </div>
      </div>

      {/* 2. Top Navigation */}
      <header className="border-b border-border bg-canvas/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-canvas font-semibold shadow-sm">
            <FileText size={18} weight="bold" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            Resume<span className="text-accent">IQ</span>
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <NavLink
            to="/login"
            className="text-xs sm:text-sm text-ink-muted hover:text-ink-primary font-medium transition-colors"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/register"
            className="bg-accent hover:bg-accent-hover text-canvas px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 shadow-sm btn-press"
          >
            Get Started
          </NavLink>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="pt-16 sm:pt-20 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-mono tracking-wider uppercase mb-6">
          <Sparkle size={12} weight="fill" />
          <span>Deterministic + AI Evaluator</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-balance mb-6 bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Know exactly how well your resume matches the job.
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed font-normal text-pretty">
          Upload your resume PDF and target job description to get concrete match metrics, identifiable skill gaps, and evidence-backed rewrite advice.
        </p>

        {/* CTA Pair */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-6">
          <NavLink
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-hover text-canvas font-medium px-6 py-3 rounded-md text-sm transition-all duration-150 shadow-lg shadow-accent/10 btn-press"
          >
            <span>Analyze My Resume</span>
            <ArrowRight size={16} weight="bold" />
          </NavLink>
          <NavLink
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-raised text-ink-primary border border-border font-medium px-6 py-3 rounded-md text-sm transition-all duration-150 btn-press"
          >
            <span>Explore Demo Mode</span>
          </NavLink>
        </div>

        {/* Real Trust Signals near CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-ink-subtle mb-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" className="text-accent" />
            Free for students & job seekers
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" className="text-accent" />
            Zero resume fabrication policy
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} weight="fill" className="text-accent" />
            Isolated PostgreSQL storage
          </span>
        </div>

        {/* 2026 Interactive Hero Showcase Card */}
        <HeroPreviewCard />
      </section>

      {/* 4. How It Works — Asymmetric Stagger Layout */}
      <section className="py-20 border-t border-border bg-canvas/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-14 text-center sm:text-left">
            <span className="text-xs font-mono text-accent uppercase tracking-widest block mb-2">
              Architecture & Workflow
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Three steps to interview-ready resumes
            </h2>
          </div>

          {/* Asymmetric stagger: numbered list with high-clarity numerals */}
          <div className="space-y-0 divide-y divide-border">
            {/* Step 1 */}
            <div className="group relative py-8 sm:py-10 grid grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start">
              <span className="font-mono text-5xl sm:text-6xl font-semibold text-ink-muted/40 group-hover:text-accent/80 tabular-nums select-none leading-none pt-1 transition-colors duration-200">
                01
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-primary group-hover:text-accent transition-colors duration-150 mb-2">
                  Upload & Extract
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed max-w-lg">
                  Upload your PDF resume. Our PyPDF2 extraction service isolates qualifications, project descriptions, and academic credentials into structured data.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative py-8 sm:py-10 grid grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start">
              <span className="font-mono text-5xl sm:text-6xl font-semibold text-ink-muted/40 group-hover:text-accent/80 tabular-nums select-none leading-none pt-1 transition-colors duration-200">
                02
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-primary group-hover:text-accent transition-colors duration-150 mb-2">
                  Hybrid Evaluation
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed max-w-lg">
                  Skills and keywords are scored deterministically. Experience, education, and quality are evaluated by Gemini AI with required citation evidence for every judgment.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative py-8 sm:py-10 grid grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start">
              <span className="font-mono text-5xl sm:text-6xl font-semibold text-ink-muted/40 group-hover:text-accent/80 tabular-nums select-none leading-none pt-1 transition-colors duration-200">
                03
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-primary group-hover:text-accent transition-colors duration-150 mb-2">
                  Actionable Insights & Revision Loop
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed max-w-lg">
                  Get specific missing keywords, partial matches with reasoning, and prioritized bullet point revisions — all grounded in evidence from the job description.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-border bg-canvas py-8 px-6 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-ink-subtle">
          <div>
            © {new Date().getFullYear()} ResumeIQ — Engineer-Grade Resume Matcher
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => openLegal('privacy')}
              className="hover:text-ink-primary cursor-pointer transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => openLegal('terms')}
              className="hover:text-ink-primary cursor-pointer transition-colors"
            >
              Terms of Use
            </button>
            <span className="text-ink-muted hidden md:inline">
              FastAPI · React · Supabase · Gemini
            </span>
          </div>
        </div>
      </footer>

      {/* Legal & Security Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
}
