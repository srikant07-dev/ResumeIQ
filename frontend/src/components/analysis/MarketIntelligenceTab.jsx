import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import {
  Globe,
  Lightning,
  MagnifyingGlass,
  Buildings,
  ChartBar,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
  WarningCircle,
  Spinner,
  CaretDown,
  CaretUp,
  ArrowSquareOut,
  Clock,
} from '@phosphor-icons/react';


// ──────────────────────────────────────────────
// Priority / effort badge renderers
// ──────────────────────────────────────────────

const PRIORITY_STYLES = {
  CRITICAL: 'bg-error/10 text-error border-error/25',
  HIGH: 'bg-score-partial/10 text-score-partial border-score-partial/25',
  MEDIUM: 'bg-accent/10 text-accent border-accent/25',
  LOW: 'bg-surface-raised text-ink-muted border-border',
};

const EFFORT_LABELS = {
  QUICK_WIN: { label: 'Quick Win', icon: Lightning },
  SHORT_TERM: { label: 'Short-term', icon: Clock },
  LONG_TERM: { label: 'Long-term', icon: Target },
};


export default function MarketIntelligenceTab({ analysis, onRefresh }) {
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [quota, setQuota] = useState(null);
  const pollRef = useRef(null);

  const status = analysis?.market_intel_status;
  const data = analysis?.market_intel_json;
  const companyName = analysis?.company_name || '';
  const jobTitle = analysis?.job_title || '';

  const [companyInput, setCompanyInput] = useState(companyName || '');
  const [isEditingCompany, setIsEditingCompany] = useState(!companyName);

  // Sync if analysis updates
  useEffect(() => {
    if (analysis?.company_name) {
      setCompanyInput(analysis.company_name);
    }
  }, [analysis?.company_name]);

  // Fetch quota remaining for user
  useEffect(() => {
    if (!analysis?.id) return;
    let isMounted = true;
    api.get(`/analyses/${analysis.id}/market-intel/quota`)
      .then(res => {
        if (isMounted) setQuota(res.data);
      })
      .catch(err => console.warn('Could not fetch market intel quota:', err));
    return () => { isMounted = false; };
  }, [analysis?.id, status]);

  // Poll for completion when status is "running"
  useEffect(() => {
    if (status === 'running') {
      pollRef.current = setInterval(() => {
        onRefresh?.();
      }, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, onRefresh]);

  const toggleSection = useCallback((key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleTrigger = async (mode = 'fast') => {
    const targetCo = companyInput.trim() || companyName;
    if (!targetCo) {
      setTriggerError('Please enter a target company name to analyze.');
      return;
    }

    setIsTriggering(true);
    setTriggerError(null);
    try {
      await api.post(`/analyses/${analysis.id}/market-intel/trigger`, {
        mode,
        company_name: targetCo,
      });
      onRefresh?.();
    } catch (err) {
      setTriggerError(err.message || 'Failed to start market intelligence.');
    } finally {
      setIsTriggering(false);
    }
  };


  // ──────────────────────────────────────────────
  // STATE 1: Not started / failed
  // ──────────────────────────────────────────────

  if (!status || status === 'failed') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Globe size={22} weight="bold" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink-primary">
                Market Intelligence & Deep Research Engine
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Benchmark your resume against market standards for <span className="font-semibold text-ink-primary">{jobTitle}</span> roles
                {(companyInput.trim() || companyName) && (
                  <> at <span className="font-semibold text-accent">{companyInput.trim() || companyName}</span> and peer companies</>
                )}
              </p>
            </div>
          </div>

          {/* Target Company Selector */}
          <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase text-ink-muted tracking-wider">
                Target Company Name
              </label>
              {companyName && (
                <button
                  type="button"
                  onClick={() => setIsEditingCompany(!isEditingCompany)}
                  className="text-[11px] font-mono text-accent hover:underline cursor-pointer"
                >
                  {isEditingCompany ? 'Lock Target' : 'Change Company'}
                </button>
              )}
            </div>

            {(!companyName || isEditingCompany) ? (
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="e.g. Stripe, Google, OpenAI, Microsoft, Meta"
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface border border-border text-sm text-ink-primary font-display placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-ink-subtle">Quick select:</span>
                  {['Stripe', 'Google', 'OpenAI', 'Microsoft', 'Meta', 'Amazon'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCompanyInput(c)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                        companyInput === c
                          ? 'bg-accent/15 text-accent border-accent/30 font-medium'
                          : 'bg-surface text-ink-muted border-border hover:text-ink-primary hover:bg-surface-raised'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="font-display font-semibold text-ink-primary text-base">
                  {companyName}
                </span>
                <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">
                  Target Set
                </span>
              </div>
            )}
          </div>

          {status === 'failed' && data?.error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-xs text-error flex items-center gap-2">
              <WarningCircle size={16} weight="fill" className="shrink-0" />
              <span>Previous attempt failed: {data.error}. You can try again.</span>
            </div>
          )}

          {triggerError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-xs text-error flex items-center gap-2">
              <WarningCircle size={16} weight="fill" className="shrink-0" />
              <span>{triggerError}</span>
            </div>
          )}

          {/* Mode selection cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fast Analysis */}
            <button
              onClick={() => handleTrigger('fast')}
              disabled={isTriggering || (!companyInput.trim() && !companyName) || (quota && quota.remaining === 0)}
              className="group text-left p-5 rounded-xl bg-surface-raised/50 border border-border hover:border-accent/40 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightning size={18} weight="fill" className="text-accent" />
                  <span className="font-display text-sm font-semibold text-ink-primary">Fast Analysis</span>
                </div>
                <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
                  PRIMARY KEY
                </span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">
                Live Google Search-grounded intelligence. Discovers company domain, tech stack, peer JDs, and table-stakes vs edge skills.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-ink-subtle">~20-30 seconds</span>
                <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Deep Dive */}
            <button
              onClick={() => handleTrigger('deep')}
              disabled={isTriggering || (!companyInput.trim() && !companyName) || (quota && quota.remaining === 0)}
              className="group text-left p-5 rounded-xl bg-surface-raised/50 border border-accent/30 hover:border-accent/60 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden bg-gradient-to-br from-surface-raised/50 to-accent/5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MagnifyingGlass size={18} weight="bold" className="text-accent" />
                  <span className="font-display text-sm font-semibold text-ink-primary">Deep Dive Research</span>
                </div>
                <span className="text-[10px] font-mono text-accent bg-accent/15 border border-accent/30 px-1.5 py-0.5 rounded font-medium">
                  DEDICATED KEY
                </span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">
                Multi-stage autonomous research agent via Gemini Interactions API. Conducts in-depth market investigation and produces a full cited intelligence report.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-accent font-medium">~2-5 minutes</span>
                <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>

          {/* Daily Quota Counter */}
          {quota && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs tabular-nums border ${
                quota.remaining > 0
                  ? 'bg-accent/10 text-accent border-accent/20'
                  : 'bg-error/10 text-error border-error/20'
              }`}>
                <Clock size={12} weight="bold" />
                <span>Uses [{quota.remaining}/{quota.limit}] remaining analyses today</span>
              </span>
              {quota.remaining === 0 && (
                <span className="text-xs font-mono text-error">
                  Daily limit reached. Resets at midnight UTC.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }


  // ──────────────────────────────────────────────
  // STATE 2: Running
  // ──────────────────────────────────────────────

  if (status === 'running') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-surface border border-border rounded-xl p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Spinner size={22} weight="bold" className="animate-spin" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink-primary">
                Analyzing Market Position...
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">This may take a moment</p>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="space-y-3">
            {[
              'Searching company domain and competitors',
              'Finding similar job descriptions across the web',
              'Benchmarking your skills against market demand',
              'Generating competitive improvement strategy',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-raised/30">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-ink-muted">{step}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] font-mono text-ink-subtle text-center pt-2">
            This tab refreshes automatically every 3 seconds
          </p>
        </div>
      </div>
    );
  }


  // ──────────────────────────────────────────────
  // STATE 3: Completed — render results
  // ──────────────────────────────────────────────

  if (status !== 'completed' || !data || data.error) {
    return (
      <div className="p-8 bg-surface border border-border rounded-xl text-center">
        <WarningCircle size={28} weight="bold" className="text-error mx-auto mb-3" />
        <p className="text-sm text-ink-muted">Unable to display market intelligence data.</p>
      </div>
    );
  }

  const { company_intelligence: ci, market_benchmark: mb, competitive_strategy: cs } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Mode indicator & Deep Dive Upgrade */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border ${
            data.mode === 'deep'
              ? 'bg-accent/15 text-accent border-accent/30'
              : 'bg-surface-raised text-ink-primary border-border'
          }`}>
            {data.mode === 'deep' ? <MagnifyingGlass size={13} weight="bold" /> : <Lightning size={13} weight="fill" />}
            <span>{data.mode === 'deep' ? 'Deep Dive Research Mode' : 'Fast Analysis Mode'}</span>
          </span>
          <span className="text-[11px] font-mono text-ink-subtle">
            {mb?.jds_analyzed_count || 0} JDs analyzed
          </span>
        </div>

        {data.mode === 'fast' && (
          <button
            onClick={() => handleTrigger('deep')}
            disabled={isTriggering}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/10 border border-accent/30 hover:bg-accent/20 text-xs font-mono text-accent transition-colors cursor-pointer"
            title="Run comprehensive autonomous deep research with dedicated Gemini key"
          >
            <MagnifyingGlass size={13} weight="bold" />
            <span>Run Deep Dive Mode (~2-5 min)</span>
          </button>
        )}
      </div>


      {/* ── Section 1: Company Profile ── */}
      {ci && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('company')}
            className="w-full p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-surface-raised/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Buildings size={18} weight="bold" className="text-accent" />
              <h3 className="font-display text-sm font-semibold text-ink-primary">
                {ci.company_name || companyName}
              </h3>
              {ci.domain && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-accent bg-accent/10 border border-accent/20">
                  {ci.domain}
                </span>
              )}
            </div>
            {expandedSections.company === false
              ? <CaretDown size={14} className="text-ink-muted" />
              : <CaretUp size={14} className="text-ink-muted" />
            }
          </button>

          {expandedSections.company !== false && (
            <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-border-subtle">
              {/* Peer Companies */}
              {ci.peer_companies?.length > 0 && (
                <div className="pt-4">
                  <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block mb-2">
                    Peer Companies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ci.peer_companies.map((peer, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-surface-raised text-xs font-mono text-ink-secondary border border-border-subtle">
                        {peer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {ci.tech_stack?.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block mb-2">
                    Technology Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ci.tech_stack.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-accent/10 text-xs font-mono text-accent border border-accent/15">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Engineering Culture */}
              {ci.engineering_culture?.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block mb-2">
                    Engineering Culture
                  </span>
                  <ul className="space-y-1.5">
                    {ci.engineering_culture.map((point, i) => (
                      <li key={i} className="text-xs text-ink-muted flex items-start gap-2">
                        <span className="text-accent mt-0.5 shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hiring Bar */}
              {ci.hiring_bar_summary && (
                <div>
                  <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block mb-2">
                    Hiring Bar
                  </span>
                  <p className="text-xs text-ink-muted leading-relaxed">{ci.hiring_bar_summary}</p>
                </div>
              )}

              {/* Sources */}
              {ci.sources?.length > 0 && (
                <div className="pt-2 border-t border-border-subtle">
                  <span className="text-[10px] font-mono text-ink-faint uppercase tracking-wider block mb-1.5">
                    Sources
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ci.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-accent hover:underline"
                      >
                        <ArrowSquareOut size={10} />
                        <span className="truncate max-w-[180px]">{src.title || src.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* ── Section 2: Market Skill Matrix ── */}
      {mb && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ChartBar size={18} weight="bold" className="text-accent" />
              <h3 className="font-display text-sm font-semibold text-ink-primary">
                Market Skill Benchmark
              </h3>
            </div>
            <span className="text-[10px] font-mono text-ink-subtle">
              {mb.common_experience_range && `${mb.common_experience_range} exp`}
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-5">
            {/* Skill Frequency Map */}
            {mb.skill_frequency_map?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block mb-3">
                  Skill Demand Frequency
                </span>
                <div className="space-y-2">
                  {mb.skill_frequency_map.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-3.5 shrink-0">
                        {item.present_in_resume
                          ? <CheckCircle size={14} weight="fill" className="text-score-strong" />
                          : <XCircle size={14} weight="fill" className="text-score-weak" />
                        }
                      </span>
                      <span className={`text-xs font-medium flex-1 ${
                        item.present_in_resume ? 'text-ink-primary' : 'text-ink-muted'
                      }`}>
                        {item.skill}
                      </span>
                      <span className="text-[10px] font-mono text-ink-subtle tabular-nums w-16 text-right">
                        {item.frequency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consensus vs Edge Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {mb.consensus_skills?.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block mb-2">
                    Table-stakes Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mb.consensus_skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-surface-raised text-xs font-mono text-ink-secondary border border-border-subtle">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mb.edge_skills?.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-wider block mb-2">
                    Differentiator Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mb.edge_skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-accent/10 text-xs font-mono text-accent border border-accent/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sources */}
            {mb.sources?.length > 0 && (
              <div className="pt-3 border-t border-border-subtle">
                <span className="text-[10px] font-mono text-ink-faint uppercase tracking-wider block mb-1.5">
                  Sources
                </span>
                <div className="flex flex-wrap gap-2">
                  {mb.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-accent hover:underline"
                    >
                      <ArrowSquareOut size={10} />
                      <span className="truncate max-w-[180px]">{src.title || src.uri}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── Section 3: Competitive Position ── */}
      {cs && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Target size={18} weight="bold" className="text-accent" />
              <h3 className="font-display text-sm font-semibold text-ink-primary">
                Competitive Position
              </h3>
            </div>
            {cs.market_position && (
              <span className="font-mono text-sm font-semibold text-accent tabular-nums">
                {cs.market_position}
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5 space-y-5">
            {/* Company Fit Score */}
            {cs.company_fit_score > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-ink-primary font-display">Company Fit</span>
                  <span className={`font-mono text-sm font-semibold tabular-nums ${
                    cs.company_fit_score >= 75 ? 'text-score-strong' :
                    cs.company_fit_score >= 50 ? 'text-score-partial' : 'text-score-weak'
                  }`}>
                    {cs.company_fit_score}%
                  </span>
                </div>
                <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cs.company_fit_score >= 75 ? 'bg-score-strong' :
                      cs.company_fit_score >= 50 ? 'bg-score-partial' : 'bg-score-weak'
                    }`}
                    style={{ width: `${cs.company_fit_score}%` }}
                  />
                </div>
                {cs.company_fit_signals?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cs.company_fit_signals.map((signal, i) => (
                      <span key={i} className="text-[10px] text-ink-muted font-mono">
                        • {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Advantages & Gaps grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Competitive Advantages */}
              {cs.competitive_advantages?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-score-strong uppercase tracking-wider block">
                    Advantages
                  </span>
                  {cs.competitive_advantages.map((a, i) => (
                    <div key={i} className="p-3 rounded-lg bg-surface-raised/50 border border-score-strong/15">
                      <span className="text-xs font-semibold text-ink-primary font-display block mb-0.5">
                        {a.title}
                      </span>
                      <p className="text-[11px] text-ink-muted leading-relaxed">{a.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Critical Gaps */}
              {cs.critical_gaps?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-error uppercase tracking-wider block">
                    Critical Gaps
                  </span>
                  {cs.critical_gaps.map((g, i) => (
                    <div key={i} className="p-3 rounded-lg bg-surface-raised/50 border border-error/15">
                      <span className="text-xs font-semibold text-ink-primary font-display block mb-0.5">
                        {g.title}
                      </span>
                      <p className="text-[11px] text-ink-muted leading-relaxed">{g.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strategic Gaps */}
            {cs.strategic_gaps?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-score-partial uppercase tracking-wider block mb-2">
                  Strategic Gaps (Nice-to-have)
                </span>
                <div className="space-y-2">
                  {cs.strategic_gaps.map((g, i) => (
                    <div key={i} className="p-3 rounded-lg bg-surface-raised/30 border border-border-subtle">
                      <span className="text-xs font-semibold text-ink-primary font-display block mb-0.5">
                        {g.title}
                      </span>
                      <p className="text-[11px] text-ink-muted leading-relaxed">{g.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── Section 4: Improvement Roadmap ── */}
      {cs?.pointwise_strategy?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <Target size={18} weight="bold" className="text-accent" />
              <h3 className="font-display text-sm font-semibold text-ink-primary">
                Improvement Roadmap
              </h3>
            </div>
            <p className="text-[11px] text-ink-muted mt-1 ml-7">
              Prioritized actions based on market analysis
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {cs.pointwise_strategy.map((item, i) => {
              const EffortInfo = EFFORT_LABELS[item.effort] || EFFORT_LABELS.SHORT_TERM;
              const EffortIcon = EffortInfo.icon;

              return (
                <div key={i} className="p-4 sm:p-5 hover:bg-surface-raised/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-ink-subtle tabular-nums mt-0.5 w-5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                          PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.MEDIUM
                        }`}>
                          {item.priority}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono text-ink-subtle bg-surface-raised border border-border-subtle">
                          <EffortIcon size={10} weight="bold" />
                          {EffortInfo.label}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-ink-primary font-display mb-1">
                        {item.action}
                      </p>

                      {item.why && (
                        <p className="text-[11px] text-ink-muted leading-relaxed mb-1">
                          <span className="font-semibold text-ink-subtle">Why: </span>{item.why}
                        </p>
                      )}

                      {item.impact && (
                        <p className="text-[11px] text-accent">
                          <span className="font-semibold">Impact: </span>{item.impact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ── Section 5: Deep Research Full Report (deep mode only) ── */}
      {data.mode === 'deep' && data.deep_research_report && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('deepReport')}
            className="w-full p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-surface-raised/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <MagnifyingGlass size={18} weight="bold" className="text-accent" />
              <h3 className="font-display text-sm font-semibold text-ink-primary">
                Full Research Report
              </h3>
            </div>
            {expandedSections.deepReport
              ? <CaretUp size={14} className="text-ink-muted" />
              : <CaretDown size={14} className="text-ink-muted" />
            }
          </button>

          {expandedSections.deepReport && (
            <div className="px-4 sm:px-5 pb-5 border-t border-border-subtle">
              <div className="mt-4 p-4 rounded-lg bg-canvas border border-border-subtle text-xs text-ink-muted font-mono leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {data.deep_research_report}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
