import React, { useState, useRef } from 'react';
import { UploadSimple, FileText, CheckCircle, WarningCircle, Trash } from '@phosphor-icons/react';

export default function FileUpload({ onFileSelected, selectedFile, error, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  };

  const validateAndPassFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setLocalError('Only PDF documents (.pdf) are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('File exceeds the 5 MB maximum size limit.');
      return;
    }
    setLocalError(null);
    onFileSelected(file);
  };

  const handleClear = () => {
    setLocalError(null);
    if (onClear) onClear();
  };

  const activeError = error || localError;

  return (
    <div className="space-y-3">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragging
              ? 'border-accent bg-accent/10 scale-[1.01] shadow-lg shadow-accent/5'
              : 'border-border-hover hover:border-accent/60 bg-surface/50 hover:bg-surface'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-surface-raised text-accent flex items-center justify-center mb-4 border border-border-subtle">
            <UploadSimple size={24} weight="bold" />
          </div>
          <h4 className="font-display text-base font-semibold text-ink-primary mb-1">
            Upload your resume PDF
          </h4>
          <p className="text-xs text-ink-muted mb-4">
            Drag and drop your file here, or <span className="text-accent underline">browse files</span>
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-ink-subtle px-2.5 py-1 rounded bg-surface-raised border border-border-subtle">
            <span>PDF only</span>
            <span>·</span>
            <span>Max 5 MB</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-surface border border-accent/30 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <FileText size={22} weight="bold" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-ink-primary truncate font-display">
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-ink-muted mt-0.5 tabular-nums">
                <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span>·</span>
                <span className="text-accent flex items-center gap-1">
                  <CheckCircle size={13} weight="fill" /> Ready
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-ink-muted hover:text-error rounded-md hover:bg-surface-raised transition-colors duration-150 cursor-pointer btn-press"
            title="Remove File"
          >
            <Trash size={18} weight="bold" />
          </button>
        </div>
      )}

      {activeError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-lg bg-error/10 border border-error/25 flex items-center justify-between gap-2 text-xs text-error animate-shake"
        >
          <div className="flex items-center gap-2">
            <WarningCircle size={16} weight="fill" className="shrink-0" />
            <span className="font-medium">{activeError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="text-error/70 hover:text-error font-mono text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
