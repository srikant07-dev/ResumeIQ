import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router';
import api from '../services/api';
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
  Info,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';

export default function AnalysisResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedScores, setExpandedScores] = useState({});

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analyses/${id}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error('Failed to load analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleScoreEvidence = (key) => {
    setExpandedScores(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getScoreRating = (score) => {
    if (score >= 85) return { label: 'High Match', color: 'text-[#10b981]', border: 'border-[#10b981]' };
    if (score >= 70) return { label: 'Good Match', color: 'text-[#10b981]', border: 'border-[#10b981]' };
    if (score >= 50) return { label: 'Partial Match', color: 'text-[#f59e0b]', border: 'border-[#f59e0b]' };
    return { label: 'Needs Revision', color: 'text-[#ef4444]', border: 'border-[#ef4444]' };
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-[#a1a1aa] uppercase tracking-wider">Loading Analysis Data...</span>
      </div>
    );
  }

  if (!analysis || !analysis.result_json) {
    return (
      <div className="p-8 bg-[#18181b] border border-white/[0.08] rounded-xl text-center max-w-md mx-auto">
        <WarningCircle size={32} weight="bold" className="text-[#ef4444] mx-auto mb-3" />
        <h3 className="font-['Outfit',sans-serif] text-lg font-semibold text-[#fafafa] mb-2">Analysis Not Found</h3>
        <p className="text-xs text-[#a1a1aa] mb-4">This record may have been deleted or access is restricted.</p>
        <NavLink to="/dashboard" className="text-xs font-mono text-[#10b981] hover:underline">
          Return to Dashboard
        </NavLink>
      </div>
    );
  }

  const result = analysis.result_json;
  const rating = getScoreRating(analysis.overall_score || 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'skills', label: `Skills (${result.matching_skills?.length || 0})`, icon: CheckCircle },
    { id: 'keywords', label: 'Keywords', icon: ListBullets },
    { id: 'experience', label: 'Experience & Quality', icon: FileText },
    { id: 'recommendations', label: `Recommendations (${result.recommendations?.length || 0})`, icon: Lightbulb },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <NavLink
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#a1a1aa] hover:text-[#10b981] mb-2 transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>BACK_TO_DASHBOARD</span>
          </NavLink>
          <h2 className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-semibold tracking-tight text-[#fafafa]">
            {analysis.job_title}
          </h2>
          <p className="text-xs font-mono text-[#71717a] mt-1">
            Evaluated on {analysis.created_at ? new Date(analysis.created_at).toLocaleString() : 'Recently'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-md bg-[#18181b] border border-white/[0.08] hover:bg-[#27272a] text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] transition-colors cursor-pointer"
          >
            PRINT_REPORT
          </button>
          <NavLink
            to="/analyze"
            className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-medium px-4 py-2 rounded-md text-xs transition-colors"
          >
            <Sparkle size={14} weight="bold" />
            <span>New Analysis</span>
          </NavLink>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-white/[0.08] gap-2 pb-px no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#10b981] text-[#10b981] font-semibold'
                  : 'border-transparent text-[#a1a1aa] hover:text-[#fafafa]'
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
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Main Score Hero Card */}
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
            {/* Score Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#27272a" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={analysis.overall_score >= 75 ? '#10b981' : analysis.overall_score >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${(analysis.overall_score || 0) * 3.14} 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-['Geist_Mono',monospace] text-4xl font-bold text-[#fafafa] tabular-nums">
                  {analysis.overall_score}%
                </span>
                <span className="text-[11px] font-mono text-[#a1a1aa] uppercase">
                  {rating.label}
                </span>
              </div>
            </div>

            {/* Strategic Summary */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-mono mb-2">
                <Sparkle size={12} weight="fill" />
                STRATEGIC_ASSESSMENT
              </div>
              <p className="text-sm sm:text-base text-[#d4d4d8] leading-relaxed font-normal text-pretty">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Detailed Score Breakdown with "Why this score?" Evidence */}
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="font-['Outfit',sans-serif] text-base font-semibold text-[#fafafa]">
                Hybrid Score Composition
              </h3>
              <span className="text-xs font-mono text-[#71717a]">CLICK TO VIEW EVIDENCE</span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {Object.entries(result.score_breakdown || {}).map(([key, item]) => {
                const isExpanded = !!expandedScores[key];
                const labelMap = {
                  skills: 'Skills Match (40%)',
                  experience: 'Experience Relevance (25%)',
                  keywords: 'Keyword Coverage (15%)',
                  education: 'Education Alignment (10%)',
                  quality: 'Resume Quality (10%)',
                };
                return (
                  <div key={key} className="p-4 sm:p-5 hover:bg-[#27272a]/30 transition-colors">
                    <div
                      onClick={() => toggleScoreEvidence(key)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-['Outfit',sans-serif] text-sm font-medium text-[#fafafa]">
                          {labelMap[key] || key}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                          item.source === 'deterministic'
                            ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/25'
                            : 'bg-[#6366f1]/10 text-[#a5b4fc] border-[#6366f1]/25'
                        }`}>
                          {item.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-['Geist_Mono',monospace] text-sm font-semibold text-[#fafafa] tabular-nums">
                          {item.score}%
                        </span>
                        {isExpanded ? <CaretUp size={14} className="text-[#a1a1aa]" /> : <CaretDown size={14} className="text-[#a1a1aa]" />}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden mt-3 mb-2">
                      <div
                        className={`h-full rounded-full ${item.score >= 75 ? 'bg-[#10b981]' : item.score >= 50 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>

                    {/* Expandable Evidence Citation */}
                    {isExpanded && (
                      <div className="mt-3 p-3 rounded bg-[#09090b] border border-white/[0.06] text-xs text-[#a1a1aa] font-mono leading-relaxed animate-in fade-in duration-150">
                        <span className="text-[#10b981] font-semibold">CITATION EVIDENCE: </span>
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
            <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#10b981] font-['Outfit',sans-serif]">
                <CheckCircle size={18} weight="fill" />
                <span>Identified Strengths</span>
              </div>
              <div className="space-y-3">
                {result.strengths?.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#27272a]/50 border border-white/[0.04]">
                    <h5 className="text-xs font-semibold text-[#fafafa] mb-1 font-['Outfit',sans-serif]">{s.point}</h5>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{s.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses / Gaps */}
            <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f59e0b] font-['Outfit',sans-serif]">
                <WarningCircle size={18} weight="fill" />
                <span>Critical Gaps to Address</span>
              </div>
              <div className="space-y-3">
                {result.weaknesses?.map((w, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#27272a]/50 border border-white/[0.04]">
                    <h5 className="text-xs font-semibold text-[#fafafa] mb-1 font-['Outfit',sans-serif]">{w.point}</h5>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{w.evidence}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS MATCHING */}
      {activeTab === 'skills' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Strong Matches */}
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#10b981] font-['Outfit',sans-serif]">
                <CheckCircle size={18} weight="fill" />
                <span>Strong Technical Matches ({result.matching_skills?.length || 0})</span>
              </div>
              <span className="text-xs font-mono text-[#10b981]">1.0 PT WEIGHT</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.matching_skills?.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-[#27272a]/50 border border-[#10b981]/20">
                  <span className="font-semibold text-sm text-[#fafafa] block mb-1 font-['Outfit',sans-serif]">
                    ✓ {item.skill}
                  </span>
                  <p className="text-xs text-[#a1a1aa]">{item.context}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Partial Matches */}
          {result.partial_skills && result.partial_skills.length > 0 && (
            <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#f59e0b] font-['Outfit',sans-serif]">
                  <WarningCircle size={18} weight="fill" />
                  <span>Partial Matches ({result.partial_skills.length})</span>
                </div>
                <span className="text-xs font-mono text-[#f59e0b]">0.5 PT WEIGHT</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.partial_skills.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#27272a]/50 border border-[#f59e0b]/20">
                    <span className="font-semibold text-sm text-[#fafafa] block mb-1 font-['Outfit',sans-serif]">
                      ~ {item.skill}
                    </span>
                    <p className="text-xs text-[#a1a1aa]">{item.context}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {result.missing_skills && result.missing_skills.length > 0 && (
            <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#ef4444] font-['Outfit',sans-serif]">
                  <XCircle size={18} weight="fill" />
                  <span>Missing Requirements ({result.missing_skills.length})</span>
                </div>
                <span className="text-xs font-mono text-[#ef4444]">0.0 PT WEIGHT</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 text-xs font-mono text-[#ef4444]"
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
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Keyword Categorization 3-Column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-5 space-y-3">
              <h4 className="font-['Outfit',sans-serif] text-sm font-semibold text-[#fafafa] pb-2 border-b border-white/[0.06]">
                Technical Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keyword_categories?.technical?.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#27272a] text-xs font-mono text-[#d4d4d8]">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-5 space-y-3">
              <h4 className="font-['Outfit',sans-serif] text-sm font-semibold text-[#fafafa] pb-2 border-b border-white/[0.06]">
                Soft Skills Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keyword_categories?.soft?.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#27272a] text-xs font-mono text-[#d4d4d8]">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-5 space-y-3">
              <h4 className="font-['Outfit',sans-serif] text-sm font-semibold text-[#fafafa] pb-2 border-b border-white/[0.06]">
                Domain Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keyword_categories?.domain?.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#27272a] text-xs font-mono text-[#d4d4d8]">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords Present vs Missing */}
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 space-y-6">
            <div>
              <span className="text-xs font-mono text-[#10b981] uppercase block mb-2 font-semibold">
                DETECTED IN RESUME ({result.keywords_present?.length || 0})
              </span>
              <div className="flex flex-wrap gap-2">
                {result.keywords_present?.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-[#10b981]/10 text-[#10b981] text-xs font-mono border border-[#10b981]/20">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {result.keywords_missing && result.keywords_missing.length > 0 && (
              <div className="pt-4 border-t border-white/[0.06]">
                <span className="text-xs font-mono text-[#ef4444] uppercase block mb-2 font-semibold">
                  NOT FOUND IN RESUME ({result.keywords_missing.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.keywords_missing.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-[#ef4444]/10 text-[#ef4444] text-xs font-mono border border-[#ef4444]/20">
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
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 space-y-4">
            <h3 className="font-['Outfit',sans-serif] text-base font-semibold text-[#fafafa] pb-3 border-b border-white/[0.06]">
              Qualitative Alignment Evaluation
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#27272a]/40 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-['Outfit',sans-serif] text-[#fafafa]">Experience Relevance</span>
                  <span className="font-mono text-xs font-bold text-[#10b981]">{result.score_breakdown?.experience?.score}%</span>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {result.score_breakdown?.experience?.evidence}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#27272a]/40 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-['Outfit',sans-serif] text-[#fafafa]">Education & Academic Alignment</span>
                  <span className="font-mono text-xs font-bold text-[#10b981]">{result.score_breakdown?.education?.score}%</span>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {result.score_breakdown?.education?.evidence}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#27272a]/40 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-['Outfit',sans-serif] text-[#fafafa]">Formatting & Bullet Impact Quality</span>
                  <span className="font-mono text-xs font-bold text-[#10b981]">{result.score_breakdown?.quality?.score}%</span>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {result.score_breakdown?.quality?.evidence}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {result.recommendations?.map((rec, idx) => {
            const badgeClass =
              rec.priority === 'HIGH'
                ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'
                : rec.priority === 'MEDIUM'
                ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30'
                : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30';

            return (
              <div key={idx} className="bg-[#18181b] border border-white/[0.08] rounded-xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase border ${badgeClass}`}>
                    {rec.priority} PRIORITY
                  </span>
                </div>

                <h4 className="font-['Outfit',sans-serif] text-base sm:text-lg font-semibold text-[#fafafa]">
                  {rec.title}
                </h4>

                <p className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed">
                  {rec.description}
                </p>

                {/* Evidence Citation */}
                <div className="p-3 rounded bg-[#09090b] border border-white/[0.06] text-xs text-[#a1a1aa] font-mono">
                  <span className="text-[#10b981] font-semibold">JOB CITATION: </span>
                  {rec.evidence}
                </div>

                {/* Suggested Action Item */}
                <div className="p-3.5 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20">
                  <span className="text-xs font-semibold text-[#10b981] font-['Outfit',sans-serif] block mb-1">
                    SUGGESTED ACTION
                  </span>
                  <p className="text-xs text-[#d4d4d8] leading-relaxed font-normal">
                    {rec.suggested_action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
