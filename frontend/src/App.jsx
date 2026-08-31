import React from 'react';
import { Sparkle, FileText, ArrowRight, ShieldCheck, CheckCircle } from '@phosphor-icons/react';

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#09090b] text-[#fafafa] font-['Geist',sans-serif]">
      {/* Top Status Bar (Signature Element) */}
      <div className="border-b border-white/[0.06] bg-[#18181b]/50 px-4 py-1.5 text-xs font-mono text-[#a1a1aa] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>SYSTEM: READY</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>PIPELINE: HYBRID_V2</span>
          <span>REGION: AP-SOUTH-1</span>
        </div>
      </div>

      {/* Main Content Preview */}
      <header className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-[#09090b] font-bold">
            <FileText size={18} weight="bold" />
          </div>
          <span className="font-['Outfit',sans-serif] text-xl font-semibold tracking-tight">Resume<span className="text-[#10b981]">IQ</span></span>
        </div>
        <div className="text-xs font-mono px-2.5 py-1 rounded bg-[#27272a] text-[#a1a1aa] border border-white/[0.06]">
          PHASE_0_BOOT_OK
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-mono uppercase tracking-wider mb-6">
          <Sparkle size={14} weight="fill" />
          Precision AI Resume Matcher
        </div>

        <h1 className="font-['Outfit',sans-serif] text-4xl sm:text-5xl font-semibold tracking-tight text-balance mb-4 bg-gradient-to-r from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
          Know exactly how well your resume matches the job.
        </h1>

        <p className="text-base text-[#a1a1aa] max-w-xl mb-8 font-normal leading-relaxed text-pretty">
          High-precision hybrid analysis combining deterministic skill metrics with evidence-backed semantic evaluation.
        </p>

        <div className="p-4 rounded-lg bg-[#18181b] border border-white/[0.08] max-w-md w-full text-left space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] pb-1 border-b border-white/[0.06]">
            <span>SYSTEM HEALTH CHECK</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#a1a1aa]">Vite 6 + React 19:</span>
            <span className="text-[#10b981] flex items-center gap-1"><CheckCircle size={14} weight="fill" /> Active</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#a1a1aa]">Tailwind CSS v4:</span>
            <span className="text-[#10b981] flex items-center gap-1"><CheckCircle size={14} weight="fill" /> Compiled</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#a1a1aa]">Outfit / Geist / Geist Mono:</span>
            <span className="text-[#10b981] flex items-center gap-1"><CheckCircle size={14} weight="fill" /> Loaded</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-4 text-center text-xs font-mono text-[#71717a]">
        ResumeIQ · Engineered for precision
      </footer>
    </div>
  );
}
