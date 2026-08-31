import React, { useState, useRef } from 'react';
import { UploadSimple, FileText, CheckCircle, WarningCircle, Trash } from '@phosphor-icons/react';

export default function FileUpload({ onFileSelected, selectedFile, error, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
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
      alert('Only PDF documents (.pdf) are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds the 5 MB maximum size limit.');
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="space-y-3">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center ${
            isDragging
              ? 'border-[#10b981] bg-[#10b981]/5'
              : 'border-white/[0.12] hover:border-[#10b981]/60 bg-[#18181b]/50 hover:bg-[#18181b]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-[#27272a] text-[#10b981] flex items-center justify-center mb-4 border border-white/[0.06]">
            <UploadSimple size={24} weight="bold" />
          </div>
          <h4 className="font-['Outfit',sans-serif] text-base font-semibold text-[#fafafa] mb-1">
            Upload your resume PDF
          </h4>
          <p className="text-xs text-[#a1a1aa] mb-4">
            Drag and drop your file here, or <span className="text-[#10b981] underline">browse files</span>
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#71717a] px-2.5 py-1 rounded bg-[#27272a] border border-white/[0.04]">
            <span>FORMAT: PDF ONLY</span>
            <span>·</span>
            <span>MAX SIZE: 5 MB</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#18181b] border border-[#10b981]/30 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 text-[#10b981] flex items-center justify-center shrink-0">
              <FileText size={22} weight="bold" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-[#fafafa] truncate font-['Outfit',sans-serif]">
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] mt-0.5">
                <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span>·</span>
                <span className="text-[#10b981] flex items-center gap-1">
                  <CheckCircle size={13} weight="fill" /> READY
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="p-2 text-[#a1a1aa] hover:text-[#ef4444] rounded-md hover:bg-[#27272a] transition-colors cursor-pointer"
            title="Remove File"
          >
            <Trash size={18} weight="bold" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center gap-2 text-xs text-[#ef4444]">
          <WarningCircle size={16} weight="fill" className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
