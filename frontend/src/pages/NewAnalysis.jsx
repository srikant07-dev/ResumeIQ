import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import FileUpload from '../components/upload/FileUpload';
import AnalysisLoading from '../components/analysis/AnalysisLoading';
import {
  FileText,
  Sparkle,
  ArrowRight,
  ArrowLeft,
  WarningCircle,
  User,
  Globe,
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
  const [companyName, setCompanyName] = useState('');
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
    if (jobTitle.trim().length < 2 || jobTitle.trim().length > 200) {
      setSubmitError('Job Title must be between 2 and 200 characters.');
      return;
    }
    if (jobDescription.trim().length < 20) {
      setSubmitError('Please provide a job description of at least 20 characters.');
      return;
    }
    if (jobDescription.trim().length > 10000) {
      setSubmitError('Job description cannot exceed 10,000 characters.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      let activeResumeId = selectedResumeId || '11111111-1111-1111-1111-111111111111';

      // 1. If a new file was uploaded, upload it
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        const uploadRes = await api.post('/resumes', formData);
        activeResumeId = uploadRes.data.id;
      }

      // 2. Trigger hybrid analysis
      const analysisRes = await api.post('/analyses', {
        resume_id: activeResumeId,
        job_title: jobTitle.trim(),
        job_description: jobDescription.trim(),
        company_name: companyName.trim() || null,
      });

      // 3. Navigate to results view
      navigate(`/analysis/${analysisRes.data.id}`);
    } catch (err) {
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
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-primary tracking-tight text-balance">
            New Resume Match Analysis
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Step {currentStep} of 2 — {currentStep === 1 ? 'Select or Upload Resume' : 'Target Job Description'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className={`px-2.5 py-1 rounded border ${currentStep === 1 ? 'bg-accent/10 text-accent border-accent/30 font-semibold' : 'bg-surface text-ink-subtle border-border-subtle'}`}>
            01 Resume
          </span>
          <span className="text-ink-faint">→</span>
          <span className={`px-2.5 py-1 rounded border ${currentStep === 2 ? 'bg-accent/10 text-accent border-accent/30 font-semibold' : 'bg-surface text-ink-subtle border-border-subtle'}`}>
            02 Target
          </span>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3 text-xs text-error" aria-live="polite">
          <WarningCircle size={18} weight="fill" className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Step 1: Resume Selection & Upload */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Sample Resume Quick Selection */}
          <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
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
                className="accent-accent"
              />
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <User size={18} weight="bold" />
              </div>
              <div>
                <span className="text-sm font-semibold text-ink-primary font-display block">
                  Sample Full-Stack Candidate Resume
                </span>
                <span className="text-xs text-ink-muted">Pre-loaded with React, Python, FastAPI, & SQL credentials</span>
              </div>
            </label>
            <span className="text-[11px] font-mono text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              Sample
            </span>
          </div>

          {existingResumes.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase text-ink-muted tracking-wider">
                Or Select from Previously Uploaded Resumes
              </label>
              <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border-subtle">
                {existingResumes.map((res) => (
                  <label
                    key={res.id}
                    className={`flex items-center gap-3.5 p-3.5 cursor-pointer hover:bg-surface-raised/50 transition-colors ${
                      selectedResumeId === res.id && !uploadedFile && !useSampleResume ? 'bg-accent/5' : ''
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
                      className="accent-accent"
                    />
                    <FileText size={18} weight="bold" className={selectedResumeId === res.id && !uploadedFile && !useSampleResume ? 'text-accent' : 'text-ink-muted'} />
                    <span className="text-sm font-medium text-ink-primary flex-1 truncate font-display">
                      {res.file_name}
                    </span>
                    <span className="text-xs font-mono text-ink-subtle">
                      {res.created_at ? new Date(res.created_at).toLocaleDateString() : 'Active'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase text-ink-muted tracking-wider">
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
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium px-5 py-2.5 rounded-md text-sm transition-colors cursor-pointer"
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
            <label className="block text-xs font-medium text-ink-secondary" htmlFor="jobTitle">
              Target Job Title <span className="text-error">*</span>
            </label>
            <button
              type="button"
              onClick={handleLoadSampleJob}
              className="text-xs font-mono text-accent hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkle size={13} weight="fill" />
              <span>Load sample</span>
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
              className="w-full px-3.5 py-2.5 rounded-md bg-surface border border-border text-sm text-ink-primary placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-display"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-ink-secondary" htmlFor="companyName">
                Company Name <span className="text-ink-subtle">(optional)</span>
              </label>
              <span className="text-[10px] font-mono text-ink-faint flex items-center gap-1">
                <Globe size={11} />
                Enables Market Intelligence
              </span>
            </div>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe, Google, Razorpay"
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-md bg-surface border border-border text-sm text-ink-primary placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-display"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-ink-secondary" htmlFor="jobDescription">
                Job Description & Qualifications <span className="text-error">*</span>
              </label>
              <span className={`text-[11px] font-mono tabular-nums ${jobDescription.length > 9500 ? 'text-error' : 'text-ink-subtle'}`}>
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
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleStartAnalysis();
                }
              }}
              placeholder="Paste the target job description here including required technical skills, qualifications, responsibilities, and experience levels..."
              className="w-full px-3.5 py-3 rounded-md bg-surface border border-border text-sm text-ink-primary placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 text-xs font-mono text-ink-muted hover:text-ink-primary px-3 py-2 rounded border border-border-subtle hover:bg-surface transition-colors cursor-pointer btn-press"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleStartAnalysis}
              className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent-hover text-canvas font-medium px-6 py-2.5 rounded-md text-sm transition-colors duration-150 cursor-pointer shadow-lg shadow-accent/10 btn-press"
            >
              <Sparkle size={16} weight="bold" />
              <span>Analyze Resume</span>
              <kbd className="hidden sm:inline bg-canvas/30 text-canvas border-canvas/40 ml-1 text-[10px]">⌘↵</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
