import React from 'react';
import { NavLink } from 'react-router';
import {
  FileText,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ChartLineUp,
  Cpu,
  Target,
  Sliders
} from '@phosphor-icons/react';

export default function Landing() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#09090b] text-[#fafafa] font-['Geist',sans-serif]">
      {/* 1. Status Bar */}
      <div className="border-b border-white/[0.06] bg-[#18181b]/60 px-4 py-1.5 text-xs font-mono text-[#a1a1aa] flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10b981]"></span>
          <span>RESUME_EVALUATION_ENGINE: ONLINE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#10b981] font-medium">HYBRID_SCORING_V2</span>
        </div>
      </div>

      {/* 2. Top Navigation */}
      <header className="border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-[#09090b] font-bold">
            <FileText size={18} weight="bold" />
          </div>
          <span className="font-['Outfit',sans-serif] text-xl font-semibold tracking-tight">
            Resume<span className="text-[#10b981]">IQ</span>
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <NavLink
            to="/login"
            className="text-xs sm:text-sm text-[#a1a1aa] hover:text-[#fafafa] font-medium transition-colors"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/register"
            className="bg-[#10b981] hover:bg-[#059669] text-[#09090b] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 shadow-sm"
          >
            Get Started
          </NavLink>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="pt-16 sm:pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] text-xs font-mono tracking-wider uppercase mb-6">
          <Cpu size={14} weight="bold" />
          Hybrid Deterministic + LLM Intelligence
        </div>

        <h1 className="font-['Outfit',sans-serif] text-4xl sm:text-6xl font-semibold tracking-tight text-balance mb-6 bg-gradient-to-r from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
          Know exactly how well your resume matches the job.
        </h1>

        <p className="text-base sm:text-lg text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed font-normal text-pretty">
          Upload your resume PDF and target job description to get concrete match metrics, identifiable skill gaps, and evidence-backed rewrite advice.
        </p>

        {/* CTA Pair */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-6">
          <NavLink
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-medium px-6 py-3 rounded-md text-sm transition-colors duration-150 shadow-lg shadow-[#10b981]/10"
          >
            <span>Analyze My Resume</span>
            <ArrowRight size={16} weight="bold" />
          </NavLink>
          <NavLink
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] border border-white/[0.08] font-medium px-6 py-3 rounded-md text-sm transition-colors duration-150"
          >
            <span>Explore Demo Mode</span>
          </NavLink>
        </div>

        {/* Real Trust Signals near CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#71717a]">
          <span className="flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" className="text-[#10b981]" />
            Free for students & job seekers
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" className="text-[#10b981]" />
            Zero resume fabrication policy
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} weight="fill" className="text-[#10b981]" />
            Isolated PostgreSQL storage
          </span>
        </div>
      </section>

      {/* 4. How It Works (Depth Toolkit: Ghost Numerals 01, 02, 03) */}
      <section className="py-16 border-t border-white/[0.08] bg-[#09090b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center sm:text-left">
            <span className="text-xs font-mono text-[#10b981] uppercase tracking-widest block mb-2">
              ENGINEERING PIPELINE
            </span>
            <h2 className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-semibold tracking-tight">
              Three steps to interview-ready resumes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-xl bg-[#18181b] border border-white/[0.08] overflow-hidden group">
              <span className="absolute -right-2 -bottom-4 font-['Geist_Mono',monospace] text-8xl font-bold text-white/[0.03] select-none pointer-events-none">
                01
              </span>
              <div className="w-10 h-10 rounded-lg bg-[#27272a] text-[#10b981] flex items-center justify-center mb-4 border border-white/[0.06]">
                <FileText size={20} weight="bold" />
              </div>
              <h3 className="font-['Outfit',sans-serif] text-lg font-semibold text-[#fafafa] mb-2">
                1. Upload & Extract
              </h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Upload your PDF resume. Our PyPDF2 extraction service isolates qualifications, project descriptions, and academic credentials.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-xl bg-[#18181b] border border-white/[0.08] overflow-hidden group">
              <span className="absolute -right-2 -bottom-4 font-['Geist_Mono',monospace] text-8xl font-bold text-white/[0.03] select-none pointer-events-none">
                02
              </span>
              <div className="w-10 h-10 rounded-lg bg-[#27272a] text-[#10b981] flex items-center justify-center mb-4 border border-white/[0.06]">
                <Sliders size={20} weight="bold" />
              </div>
              <h3 className="font-['Outfit',sans-serif] text-lg font-semibold text-[#fafafa] mb-2">
                2. Hybrid Evaluation
              </h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Skills and keywords are derived mathematically (40% + 15%). Experience, education, and quality are evaluated via Gemini with required citations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-xl bg-[#18181b] border border-white/[0.08] overflow-hidden group">
              <span className="absolute -right-2 -bottom-4 font-['Geist_Mono',monospace] text-8xl font-bold text-white/[0.03] select-none pointer-events-none">
                03
              </span>
              <div className="w-10 h-10 rounded-lg bg-[#27272a] text-[#10b981] flex items-center justify-center mb-4 border border-white/[0.06]">
                <Target size={20} weight="bold" />
              </div>
              <h3 className="font-['Outfit',sans-serif] text-lg font-semibold text-[#fafafa] mb-2">
                3. Actionable Insights
              </h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Examine specific missing keywords, partial matches with reasoning, and prioritized bullet point revisions before submitting applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-white/[0.08] bg-[#09090b] py-8 px-6 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#71717a]">
          <div>
            ResumeIQ · Production Architecture
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[#a1a1aa]">FastAPI · React · Supabase · Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
