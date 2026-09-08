import React, { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router';
import api from '../services/api';
import SkillSimulator from '../components/analysis/SkillSimulator';
import MarketIntelligenceTab from '../components/analysis/MarketIntelligenceTab';
import ScoreDeltaModal from '../components/analysis/ScoreDeltaModal';
import BulletDiffCard from '../components/analysis/BulletDiffCard';
import FileUpload from '../components/upload/FileUpload';
import {
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  XCircle,
  Sparkle,
  Target,
  ListBullets,
  FileText,
  Lightbulb,
  CaretDown,
  CaretUp,
  Copy,
  Check,
  Lightning,
  Spinner,
  ArrowsClockwise,
  TrendUp,
  X,
  Globe,
  ShareNetwork,
  Trash,
  Info,
  Briefcase
} from '@phosphor-icons/react';

export default function AnalysisResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedScores, setExpandedScores] = useState({});
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);


  // Re-evaluation revision workflow state
  const [isReEvalModalOpen, setIsReEvalModalOpen] = useState(false);
  const [existingResumes, setExistingResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [reEvalFile, setReEvalFile] = useState(null);
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [reEvalError, setReEvalError] = useState(null);
  const [deltaData, setDeltaData] = useState(null);
  const [isDeltaModalOpen, setIsDeltaModalOpen] = useState(false);

  const fetchAnalysis = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/analyses/${id}`);
      setAnalysis(res.data);
    } catch {
      // Error state handled by !analysis check in render
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const toggleScoreEvidence = (key) => {
    setExpandedScores(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyRecommendation = (recOrText, idx) => {
    const textToCopy = typeof recOrText === 'string'
      ? recOrText
      : (recOrText?.suggested_action || (recOrText?.title ? `${recOrText.title}: ${recOrText.description}` : (recOrText?.description || '')));
    try {
      if (navigator?.clipboard?.writeText) {
        const promise = navigator.clipboard.writeText(textToCopy);
        if (promise && typeof promise.catch === 'function') {
          promise.catch((err) => console.warn('Failed to copy to clipboard:', err));
        }
      }
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
    setCopiedIdx(idx);
    setTimeout(() => {
      setCopiedIdx(null);
    }, 2000);
  };

  const getScoreRating = (score) => {
    if (score >= 85) return { label: 'High Match', color: 'text-score-strong', border: 'border-score-strong' };
    if (score >= 70) return { label: 'Good Match', color: 'text-score-strong', border: 'border-score-strong' };
    if (score >= 50) return { label: 'Partial Match', color: 'text-score-partial', border: 'border-score-partial' };
    return { label: 'Needs Revision', color: 'text-score-weak', border: 'border-score-weak' };
  };



  const handleCopyMarkdown = () => {
    if (!analysis || !result) return;
    const summaryMarkdown = `# ResumeIQ Analysis Report: ${analysis.job_title}
**Overall Match Score:** ${analysis.overall_score}% (${rating.label})
**Date Evaluated:** ${new Date(analysis.created_at || Date.now()).toLocaleDateString()}

## Executive Summary
${result.summary}

## Score Breakdown
- Skills Match: ${result.score_breakdown?.skills?.score || 0}%
- Experience Relevance: ${result.score_breakdown?.experience?.score || 0}%
- Keyword Coverage: ${result.score_breakdown?.keywords?.score || 0}%
- Education Alignment: ${result.score_breakdown?.education?.score || 0}%
- Resume Quality: ${result.score_breakdown?.quality?.score || 0}%

## Key Recommendations
${result.recommendations?.map((r, i) => `${i + 1}. **[${r.priority}] ${r.title}**: ${r.suggested_action || r.description}`).join('\n') || 'None'}
`;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(summaryMarkdown).catch(() => {});
      }
    } catch {}
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleOpenReEvalModal = async () => {
    setIsReEvalModalOpen(true);
    setReEvalError(null);
    setReEvalFile(null);
    setSelectedResumeId('');
    try {
      const res = await api.get('/resumes');
      const list = res.data || [];
      setExistingResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0].id);
      }
    } catch {
      setExistingResumes([]);
    }
  };

  const handleRunReEvaluation = async () => {
    if (!selectedResumeId && !reEvalFile) {
      setReEvalError('Please select an existing resume or upload a revised PDF file.');
      return;
    }
    setIsReEvaluating(true);
    setReEvalError(null);
    try {
      let targetResumeId = selectedResumeId;
      if (reEvalFile) {
        const formData = new FormData();
        formData.append('file', reEvalFile);
        const uploadRes = await api.post('/resumes', formData);
        targetResumeId = uploadRes.data.id;
      }
      const res = await api.post(`/analyses/${id}/re-evaluate`, {
        resume_id: targetResumeId,
        parent_analysis_id: id
      });
      setDeltaData(res.data);
      setIsReEvalModalOpen(false);
      setIsDeltaModalOpen(true);
    } catch (err) {
      setReEvalError(err.message || err.detail || 'Re-evaluation failed. Please try again.');
    } finally {
      setIsReEvaluating(false);
    }
  };

  const handleCloseDeltaModal = () => {
    setIsDeltaModalOpen(false);
    if (deltaData?.new_analysis?.id) {
      navigate(`/analysis/${deltaData.new_analysis.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">Loading Analysis Data...</span>
      </div>
    );
  }

  if (analysis && (analysis.status === 'failed' || (!analysis.result_json && analysis.error_message))) {
    return (
      <div className="p-8 bg-surface border border-border rounded-xl text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center mx-auto border border-error/20">
          <WarningCircle size={28} weight="bold" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-primary mb-1">Analysis Failed</h3>
          <p className="text-xs text-ink-muted">
            {analysis.error_message || 'The evaluation engine encountered an issue processing this document.'}
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <NavLink
            to="/analyze"
            className="px-4 py-2 rounded-md bg-accent text-zinc-950 font-display font-medium text-xs hover:bg-accent-hover transition-colors"
          >
            Try Another Analysis
          </NavLink>
          <NavLink
            to="/dashboard"
            className="px-4 py-2 rounded-md bg-surface-raised border border-border text-ink-primary font-display font-medium text-xs hover:bg-surface transition-colors"
          >
            Dashboard
          </NavLink>
        </div>
      </div>
    );
  }

  if (!analysis || !analysis.result_json) {
    return (
      <div className="p-8 bg-surface border border-border rounded-xl text-center max-w-md mx-auto">
        <WarningCircle size={32} weight="bold" className="text-error mx-auto mb-3" />
        <h3 className="font-display text-lg font-semibold text-ink-primary mb-2">Analysis Not Found</h3>
        <p className="text-xs text-ink-muted mb-4">This record may have been deleted or access is restricted.</p>
        <NavLink to="/dashboard" className="text-xs font-mono text-accent hover:underline">
          Return to Dashboard
        </NavLink>
      </div>
    );
  }

  const result = analysis.result_json;
  const rating = getScoreRating(analysis.overall_score || 0);

  const isDemo = typeof window !== 'undefined' && (
    Boolean(localStorage.getItem('resumeiq_demo_session')) ||
    Boolean(analysis?.user_id?.startsWith('demo-'))
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'skills', label: `Skills (${result.matching_skills?.length || 0})`, icon: CheckCircle },
    { id: 'keywords', label: 'Keywords', icon: ListBullets },
    { id: 'experience', label: 'Experience & Quality', icon: FileText },
    { id: 'recommendations', label: `Recommendations (${result.recommendations?.length || 0})`, icon: Lightbulb },
    { id: 'simulator', label: 'What-If Simulator', icon: Lightning },
    { id: 'market-intel', label: 'Market Intel', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <NavLink
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-accent mb-2 transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Back to Dashboard</span>
          </NavLink>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-primary text-balance">
            {analysis.job_title}
          </h2>
          <p className="text-xs font-mono text-ink-subtle mt-1">
            Evaluated on {analysis.created_at ? new Date(analysis.created_at).toLocaleString() : 'Recently'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenReEvalModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-accent/10 border border-accent/30 hover:bg-accent/20 text-xs font-mono text-accent transition-colors cursor-pointer btn-press"
            title="Re-evaluate an updated resume against this job"
          >
            <ArrowsClockwise size={14} weight="bold" />
            <span>Re-evaluate Resume</span>
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface border border-border hover:bg-surface-raised text-xs font-mono text-ink-muted hover:text-ink-primary transition-colors cursor-pointer btn-press"
            title="Copy summary as markdown for notes or cover letter"
          >
            {copiedMarkdown ? (
              <>
                <Check size={14} weight="bold" className="text-accent" />
                <span className="text-accent">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} weight="bold" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-md bg-surface border border-border hover:bg-surface-raised text-xs font-mono text-ink-muted hover:text-ink-primary transition-colors cursor-pointer btn-press"
          >
            Print
          </button>
          <NavLink
            to="/analyze"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium px-4 py-2 rounded-md text-xs transition-colors btn-press"
          >
            <Sparkle size={14} weight="bold" />
            <span>New Analysis</span>
          </NavLink>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-border gap-2 pb-px no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-accent text-accent'
                  : 'border-transparent text-ink-muted hover:text-ink-primary'
              }`}
            >
              <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
            {/* Score Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-surface-raised)" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={analysis.overall_score >= 75 ? 'var(--color-score-strong)' : analysis.overall_score >= 50 ? 'var(--color-score-partial)' : 'var(--color-score-weak)'}
                  strokeWidth="8"
                  strokeDasharray={`${(analysis.overall_score || 0) * 3.14} 314`}
                  strokeLinecap="round"
                  className="animate-gauge-sweep"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-mono text-4xl font-semibold text-ink-primary tabular-nums">
                  {analysis.overall_score}%
                </span>
                <span className="text-[11px] font-mono text-ink-muted uppercase">
                  {rating.label}
                </span>
              </div>
            </div>

            {/* Strategic Summary */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-2">
                <Sparkle size={12} weight="fill" />
                Summary
              </div>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-normal text-pretty">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Detailed Score Breakdown with "Why this score?" Evidence */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink-primary">
                Hybrid Score Composition
              </h3>
              <span className="text-xs font-mono text-ink-subtle">Click rows to expand</span>
            </div>

            <div className="divide-y divide-border-subtle">
              {Object.entries(result.score_breakdown || {}).map(([key, item]) => {
                const isExpanded = !!expandedScores[key];
                const labelMap = {
                  skills: 'Skills Match (35%)',
                  experience: 'Experience Relevance (25%)',
                  keywords: 'Keyword Coverage (20%)',
                  education: 'Education Alignment (10%)',
                  quality: 'Resume Quality (10%)',
                };
                return (
                  <div key={key} className="p-4 sm:p-5 hover:bg-surface-raised/30 transition-colors">
                    <div
                      onClick={() => toggleScoreEvidence(key)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-display text-sm font-medium text-ink-primary">
                          {labelMap[key] || key}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                          item.source === 'deterministic'
                            ? 'bg-accent/10 text-accent border-accent/25'
                            : 'bg-info/10 text-info-light border-info/25'
                        }`}>
                          {item.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-ink-primary tabular-nums">
                          {item.score}%
                        </span>
                        {isExpanded ? <CaretUp size={14} className="text-ink-muted" /> : <CaretDown size={14} className="text-ink-muted" />}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden mt-3 mb-2">
                      <div
                        className={`h-full rounded-full ${item.score >= 75 ? 'bg-score-strong' : item.score >= 50 ? 'bg-score-partial' : 'bg-score-weak'}`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>

                    {/* Expandable Evidence Citation */}
                    {isExpanded && (
                      <div className="mt-3 p-3 rounded bg-canvas border border-border-subtle text-xs text-ink-muted font-mono leading-relaxed">
                        <span className="text-accent font-semibold">Evidence: </span>
                        {item.evidence}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent font-display">
                <CheckCircle size={18} weight="fill" />
                <span>Identified Strengths</span>
              </div>
              <div className="space-y-3">
                {result.strengths?.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-raised/50 border border-border-subtle">
                    <h5 className="text-xs font-semibold text-ink-primary mb-1 font-display">{s.point}</h5>
                    <p className="text-xs text-ink-muted leading-relaxed">{s.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses / Gaps */}
            <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-warning font-display">
                <WarningCircle size={18} weight="fill" />
                <span>Critical Gaps to Address</span>
              </div>
              <div className="space-y-3">
                {result.weaknesses?.map((w, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-raised/50 border border-border-subtle">
                    <h5 className="text-xs font-semibold text-ink-primary mb-1 font-display">{w.point}</h5>
                    <p className="text-xs text-ink-muted leading-relaxed">{w.evidence}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS MATCHING */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Strong Matches */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent font-display">
                <CheckCircle size={18} weight="fill" />
                <span>Strong Technical Matches ({result.matching_skills?.length || 0})</span>
              </div>
              <span className="text-xs font-mono text-accent">1.0 pt weight</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.matching_skills?.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-surface-raised/50 border border-accent/20">
                  <span className="font-semibold text-sm text-ink-primary block mb-1 font-display">
                    ✓ {item.skill}
                  </span>
                  <p className="text-xs text-ink-muted">{item.context}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Partial Matches */}
          {result.partial_skills && result.partial_skills.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-warning font-display">
                  <WarningCircle size={18} weight="fill" />
                  <span>Partial Matches ({result.partial_skills.length})</span>
                </div>
                <span className="text-xs font-mono text-warning">0.5 pt weight</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.partial_skills.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-surface-raised/50 border border-warning/20">
                    <span className="font-semibold text-sm text-ink-primary block mb-1 font-display">
                      ~ {item.skill}
                    </span>
                    <p className="text-xs text-ink-muted">{item.context}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {result.missing_skills && result.missing_skills.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-error font-display">
                  <XCircle size={18} weight="fill" />
                  <span>Missing Requirements ({result.missing_skills.length})</span>
                </div>
                <span className="text-xs font-mono text-error">0.0 pt weight</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md bg-error/10 border border-error/20 text-xs font-mono text-error"
                  >
                    ✗ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KEYWORDS */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          {/* Keyword Categorization 3-Column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <h4 className="font-display text-sm font-semibold text-ink-primary pb-2 border-b border-border-subtle">
                Technical Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keyword_categories?.technical?.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-surface-raised text-xs font-mono text-ink-secondary">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <h4 className="font-display text-sm font-semibold text-ink-primary pb-2 border-b border-border-subtle">
                Soft Skills Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keyword_categories?.soft?.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-surface-raised text-xs font-mono text-ink-secondary">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <h4 className="font-display text-sm font-semibold text-ink-primary pb-2 border-b border-border-subtle">
                Domain Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keyword_categories?.domain?.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-surface-raised text-xs font-mono text-ink-secondary">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords Present vs Missing */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <div>
              <span className="text-xs font-mono text-accent uppercase block mb-2 font-semibold">
                Detected in resume ({result.keywords_present?.length || 0})
              </span>
              <div className="flex flex-wrap gap-2">
                {result.keywords_present?.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-accent/10 text-accent text-xs font-mono border border-accent/20">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {result.keywords_missing && result.keywords_missing.length > 0 && (
              <div className="pt-4 border-t border-border-subtle">
                <span className="text-xs font-mono text-error uppercase block mb-2 font-semibold">
                  Not found in resume ({result.keywords_missing.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.keywords_missing.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-error/10 text-error text-xs font-mono border border-error/20">
                      ✗ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EXPERIENCE & QUALITY */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-display text-base font-semibold text-ink-primary pb-3 border-b border-border-subtle">
              Qualitative Alignment Evaluation
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-raised/40 border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-display text-ink-primary">Experience Relevance</span>
                  <span className="font-mono text-xs font-semibold text-accent tabular-nums">{result.score_breakdown?.experience?.score}%</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {result.score_breakdown?.experience?.evidence}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised/40 border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-display text-ink-primary">Education & Academic Alignment</span>
                  <span className="font-mono text-xs font-semibold text-accent tabular-nums">{result.score_breakdown?.education?.score}%</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {result.score_breakdown?.education?.evidence}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised/40 border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-display text-ink-primary">Formatting & Bullet Impact Quality</span>
                  <span className="font-mono text-xs font-semibold text-accent tabular-nums">{result.score_breakdown?.quality?.score}%</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {result.score_breakdown?.quality?.evidence}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-display text-sm font-semibold text-ink-primary">
              Prioritized Action Items & Bullet Diff ({result.recommendations?.length || 0})
            </h3>
            <span className="text-xs font-mono text-ink-subtle">Grounded in target job evidence</span>
          </div>

          {result.recommendations?.map((rec, idx) => (
            <BulletDiffCard
              key={idx}
              rec={rec}
              index={idx}
              onCopy={handleCopyRecommendation}
              isCopied={copiedIdx === idx}
            />
          ))}
        </div>
      )}

      {/* TAB 6: WHAT-IF SIMULATOR */}
      {activeTab === 'simulator' && (
        <SkillSimulator analysis={analysis} />
      )}

      {/* TAB 7: MARKET INTELLIGENCE */}
      {activeTab === 'market-intel' && (
        <MarketIntelligenceTab
          analysis={analysis}
          onRefresh={fetchAnalysis}
        />
      )}

      {/* RE-EVALUATION REVISION UPLOAD DIALOG */}
      {isReEvalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Re-evaluate resume revision"
        >
          <div
            className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
            onClick={() => !isReEvaluating && setIsReEvalModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <ArrowsClockwise size={18} weight="bold" className="text-accent" />
                <h3 className="font-display text-lg font-semibold text-ink-primary">
                  Re-evaluate Resume Revision
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReEvalModalOpen(false)}
                disabled={isReEvaluating}
                className="p-1.5 text-ink-muted hover:text-ink-primary rounded-md cursor-pointer hover:bg-surface-raised transition-colors"
                aria-label="Close revision dialog"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Upload or select an updated version of your resume to evaluate against <strong className="text-ink-primary">{analysis.job_title}</strong>. ResumeIQ will compute your score delta and track newly resolved skill gaps.
            </p>

            {reEvalError && (
              <div className="p-3 rounded bg-error/10 border border-error/20 text-xs text-error flex items-center gap-2" aria-live="polite">
                <WarningCircle size={16} weight="fill" className="shrink-0" />
                <span>{reEvalError}</span>
              </div>
            )}

            <div className="space-y-4">
              {existingResumes.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase text-ink-muted tracking-wider">
                    Select From Uploaded Resumes
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => { setSelectedResumeId(e.target.value); setReEvalFile(null); }}
                    disabled={isReEvaluating}
                    className="w-full px-3 py-2 rounded-md bg-surface-raised border border-border text-xs text-ink-primary font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">-- Or upload a new file below --</option>
                    {existingResumes.map(r => (
                      <option key={r.id} value={r.id}>{r.file_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase text-ink-muted tracking-wider">
                  Upload Revised Resume PDF
                </label>
                <FileUpload
                  onFileSelected={(file) => { setReEvalFile(file); setSelectedResumeId(''); }}
                  selectedFile={reEvalFile}
                  onClear={() => setReEvalFile(null)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsReEvalModalOpen(false)}
                disabled={isReEvaluating}
                className="px-4 py-2 rounded-md text-xs font-mono text-ink-muted hover:text-ink-primary hover:bg-surface-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunReEvaluation}
                disabled={isReEvaluating || (!reEvalFile && !selectedResumeId)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-canvas font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isReEvaluating ? (
                  <>
                    <Spinner size={14} weight="bold" className="animate-spin" />
                    <span>Analyzing Revision...</span>
                  </>
                ) : (
                  <>
                    <TrendUp size={14} weight="bold" />
                    <span>Compute Score Delta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCORE DELTA COMPARISON MODAL */}
      <ScoreDeltaModal
        isOpen={isDeltaModalOpen}
        onClose={handleCloseDeltaModal}
        deltaData={deltaData}
        parentAnalysis={analysis}
        newAnalysis={deltaData?.new_analysis}
      />
    </div>
  );
}
