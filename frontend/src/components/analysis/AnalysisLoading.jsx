import React, { useState, useEffect } from 'react';
import { Cpu, Sparkle } from '@phosphor-icons/react';

export default function AnalysisLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    'Parsing resume structure and extracting technical skills...',
    'Performing semantic match against job requirements...',
    'Evaluating experience relevance and academic alignment...',
    'Calculating deterministic keyword and skill coverages...',
    'Synthesizing actionable, evidence-backed recommendations...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-10 sm:p-14 text-center max-w-xl mx-auto my-8 shadow-2xl animate-in fade-in duration-300">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mx-auto mb-6 border border-[#10b981]/20">
        <Cpu size={32} weight="bold" className="animate-pulse" />
      </div>

      <h3 className="font-['Outfit',sans-serif] text-2xl font-semibold text-[#fafafa] tracking-tight mb-2">
        Analyzing your application...
      </h3>

      <p className="text-xs font-mono text-[#10b981] h-6 flex items-center justify-center gap-2 mb-6">
        <Sparkle size={14} weight="fill" />
        <span>{messages[messageIndex]}</span>
      </p>

      {/* Honest Indeterminate Animated Bar */}
      <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden mb-6 relative">
        <div className="absolute top-0 bottom-0 left-0 bg-[#10b981] w-1/3 rounded-full animate-[indeterminate_1.8s_ease-in-out_infinite]"></div>
      </div>

      <div className="inline-flex items-center gap-2 text-xs font-mono text-[#71717a] bg-[#27272a]/50 px-3 py-1.5 rounded border border-white/[0.04]">
        <span>ESTIMATED DURATION: ~15-25 SECONDS</span>
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
