import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import FileUpload from '../components/upload/FileUpload';
import AnalysisLoading from '../components/analysis/AnalysisLoading';
import {
  FileText,
  Briefcase,
  Sparkle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  ClockCounterClockwise,
  User
} from '@phosphor-icons/react';

export default function NewAnalysis() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Resume State
  const [existingResumes, setExistingResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [useSampleResume, setUseSampleResume] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Job Description State
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Execution State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchUserResumes();
  }, []);

  const fetchUserResumes = async () => {
    try {
      const res = await api.get('/resumes');
      const list = res.data || [];
      setExistingResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0].id);
      } else {
        setUseSampleResume(true);
      }
    } catch (err) {
      setUseSampleResume(true);
    }
  };

  const handleFileSelected = (file) => {
    setUploadedFile(file);
    setSelectedResumeId('');
    setUseSampleResume(false);
    setUploadError(null);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedResumeId && !uploadedFile && !useSampleResume) {
        setUploadError('Please select a resume or choose the sample candidate resume.');
        return;
      }
      setUploadError(null);
      setCurrentStep(2);
    }
  };

  const handleLoadSampleJob = () => {
    setJobTitle('Full Stack Software Engineer');
    setJobDescription(
      'We are looking for a Full Stack Software Engineer with strong experience in Python, FastAPI, React, and PostgreSQL. ' +
      'Responsibilities include building high-performance REST APIs, responsive dashboard interfaces with Tailwind CSS, and writing clean asynchronous services. ' +
      'Requirements: 2+ years experience with Python & React, solid understanding of relational databases and SQL optimization, familiarity with Docker containerization, ' +
      'and proven ability to write comprehensive unit tests. Strong problem-solving and communication skills are essential.'
    );
  };

  const handleStartAnalysis = async () => {
    if (!jobTitle.trim()) {
      setSubmitError('Job Title is required.');
      return;
    }
    if (jobDescription.trim().length < 30) {
      setSubmitError('Please provide a job description of at least 30 characters.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      let activeResumeId = selectedResumeId || 'demo-sample-resume-id';

      // 1. If a new file was uploaded, upload it
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        const uploadRes = await api.post('/resumes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        activeResumeId = uploadRes.data.id;
      }

      // 2. Trigger hybrid analysis
      const analysisRes = await api.post('/analyses', {
        resume_id: activeResumeId,
        job_title: jobTitle.trim(),
        job_description: jobDescription.trim(),
      });

      // 3. Navigate to results view
      navigate(`/analysis/${analysisRes.data.id}`);
    } catch (err) {
      console.error('Analysis creation error:', err);
      setSubmitError(err.message || 'Analysis could not be completed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <AnalysisLoading />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Stepper Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
        <div>
          <h2 className="font-['Outfit',sans-serif] text-2xl font-semibold text-[#fafafa] tracking-tight">
            New Resume Match Analysis
          </h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-0.5">
            Step {currentStep} of 2 — {currentStep === 1 ? 'Select or Upload Resume' : 'Target Job Description'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className={`px-2.5 py-1 rounded border ${currentStep === 1 ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 font-semibold' : 'bg-[#18181b] text-[#71717a] border-white/[0.06]'}`}>
            01 RESUME
          </span>
          <span className="text-[#52525b]">→</span>
          <span className={`px-2.5 py-1 rounded border ${currentStep === 2 ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 font-semibold' : 'bg-[#18181b] text-[#71717a] border-white/[0.06]'}`}>
            02 TARGET_JOB
          </span>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center gap-3 text-xs text-[#ef4444]" aria-live="polite">
          <WarningCircle size={18} weight="fill" className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Step 1: Resume Selection & Upload */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Sample Resume Quick Selection */}
          <div className="p-4 rounded-xl bg-[#18181b] border border-white/[0.08] flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="radio"
                name="resumeSelect"
                checked={useSampleResume && !uploadedFile}
                onChange={() => {
                  setUseSampleResume(true);
                  setSelectedResumeId('');
                  setUploadedFile(null);
                }}
                className="accent-[#10b981]"
              />
              <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
                <User size={18} weight="bold" />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#fafafa] font-['Outfit',sans-serif] block">
                  Sample Full-Stack Candidate Resume
                </span>
                <span className="text-xs text-[#a1a1aa]">Pre-loaded with React, Python, FastAPI, & SQL credentials</span>
              </div>
            </label>
            <span className="text-[11px] font-mono text-[#10b981] px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20">
              BUILT-IN
            </span>
          </div>

          {existingResumes.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase text-[#a1a1aa] tracking-wider">
                Or Select from Previously Uploaded Resumes
              </label>
              <div className="bg-[#18181b] border border-white/[0.08] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
                {existingResumes.map((res) => (
                  <label
                    key={res.id}
                    className={`flex items-center gap-3.5 p-3.5 cursor-pointer hover:bg-[#27272a]/50 transition-colors ${
                      selectedResumeId === res.id && !uploadedFile && !useSampleResume ? 'bg-[#10b981]/5' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="resumeSelect"
                      checked={selectedResumeId === res.id && !uploadedFile && !useSampleResume}
                      onChange={() => {
                        setSelectedResumeId(res.id);
                        setUseSampleResume(false);
                        setUploadedFile(null);
                      }}
                      className="accent-[#10b981]"
                    />
                    <FileText size={18} weight="bold" className={selectedResumeId === res.id && !uploadedFile && !useSampleResume ? 'text-[#10b981]' : 'text-[#a1a1aa]'} />
                    <span className="text-sm font-medium text-[#fafafa] flex-1 truncate font-['Outfit',sans-serif]">
                      {res.file_name}
                    </span>
                    <span className="text-xs font-mono text-[#71717a]">
                      {res.created_at ? new Date(res.created_at).toLocaleDateString() : 'Active'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase text-[#a1a1aa] tracking-wider">
              Upload a New Resume PDF
            </label>
            <FileUpload
              onFileSelected={handleFileSelected}
              selectedFile={uploadedFile}
              error={uploadError}
              onClear={handleClearFile}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-medium px-5 py-2.5 rounded-md text-sm transition-colors cursor-pointer"
            >
              <span>Continue to Job Details</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Target Job Description */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-[#d4d4d8]" htmlFor="jobTitle">
              Target Job Title <span className="text-[#ef4444]">*</span>
            </label>
            <button
              type="button"
              onClick={handleLoadSampleJob}
              className="text-xs font-mono text-[#10b981] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkle size={13} weight="fill" />
              <span>LOAD_SAMPLE_JOB_DATA</span>
            </button>
          </div>

          <div>
            <input
              id="jobTitle"
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer, Frontend Engineer, Python Backend Dev"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#18181b] border border-white/[0.08] text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent font-['Outfit',sans-serif]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#d4d4d8]" htmlFor="jobDescription">
                Job Description & Qualifications <span className="text-[#ef4444]">*</span>
              </label>
              <span className={`text-[11px] font-mono ${jobDescription.length > 9500 ? 'text-[#ef4444]' : 'text-[#71717a]'}`}>
                {jobDescription.length.toLocaleString()} / 10,000 characters
              </span>
            </div>
            <textarea
              id="jobDescription"
              rows={10}
              required
              maxLength={10000}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here including required technical skills, qualifications, responsibilities, and experience levels..."
              className="w-full px-3.5 py-3 rounded-md bg-[#18181b] border border-white/[0.08] text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent font-['Geist',sans-serif] leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] px-3 py-2 rounded border border-white/[0.06] hover:bg-[#18181b] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>BACK TO RESUME</span>
            </button>

            <button
              type="button"
              onClick={handleStartAnalysis}
              className="inline-flex items-center gap-2.5 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-medium px-6 py-2.5 rounded-md text-sm transition-colors duration-150 cursor-pointer shadow-lg shadow-[#10b981]/10"
            >
              <Sparkle size={16} weight="bold" />
              <span>Analyze Resume</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
