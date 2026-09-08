import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, FileText, X } from '@phosphor-icons/react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Legal and privacy information"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div className="flex items-center gap-2 text-ink-primary font-display font-semibold text-lg">
            <ShieldCheck size={20} weight="bold" className="text-accent" />
            <span>ResumeIQ Security & Policies</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-raised text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border-subtle px-5 pt-3 gap-4 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-ink-muted hover:text-ink-primary'
            }`}
          >
            Data Privacy & Security
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-ink-muted hover:text-ink-primary'
            }`}
          >
            Terms & Zero-Fabrication
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs text-ink-secondary leading-relaxed font-body">
          {activeTab === 'privacy' ? (
            <>
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 flex items-start gap-2.5">
                <Lock size={16} weight="fill" className="text-accent shrink-0 mt-0.5" />
                <p className="text-ink-primary">
                  Your resume documents and analysis history are strictly isolated to your authenticated account ID using Row-Level Security in PostgreSQL.
                </p>
              </div>

              <h4 className="font-display font-semibold text-ink-primary text-sm pt-2">
                1. Storage Isolation
              </h4>
              <p>
                Uploaded PDF resumes are stored in private Supabase Storage buckets accessible only through short-lived signed URLs. Raw PDF binaries are never exposed publicly.
              </p>

              <h4 className="font-display font-semibold text-ink-primary text-sm pt-2">
                2. AI Processing Pipeline
              </h4>
              <p>
                Resume text is processed through Google Gemini API endpoints strictly for candidate match evaluation and actionable recommendations. Your data is never used to train public foundational AI models.
              </p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-surface-raised border border-border-subtle flex items-start gap-2.5">
                <FileText size={16} weight="bold" className="text-accent shrink-0 mt-0.5" />
                <p className="text-ink-primary">
                  ResumeIQ operates under an absolute <strong>Zero-Fabrication Guarantee</strong>.
                </p>
              </div>

              <h4 className="font-display font-semibold text-ink-primary text-sm pt-2">
                1. Evidence-Grounded Recommendations
              </h4>
              <p>
                Every bullet point suggestion and keyword insight must cite direct quotes and requirements from the target job description. We never invent fake employment history, fraudulent certifications, or unverifiable accomplishments.
              </p>

              <h4 className="font-display font-semibold text-ink-primary text-sm pt-2">
                2. Honest Candidate Empowerment
              </h4>
              <p>
                ResumeIQ is designed to help genuine candidates present their authentic skills and experience with maximum clarity, precision, and impact.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-raised/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-surface border border-border hover:bg-surface-raised text-xs font-mono text-ink-primary transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
