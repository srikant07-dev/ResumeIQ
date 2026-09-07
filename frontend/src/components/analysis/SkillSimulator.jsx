import React, { useState, useMemo, useCallback } from 'react';
import {
  Lightning,
  TrendUp,
  ArrowUp,
  Star,
  Info,
  Sparkle
} from '@phosphor-icons/react';

/**
 * Deterministic scoring functions mirrored from backend scoring_service.py.
 * These enable 0ms, zero-API-cost "What-If" simulation entirely on the client.
 */
const SCORE_WEIGHTS = {
  skills: 0.35,
  experience: 0.25,
  keywords: 0.20,
  education: 0.10,
  quality: 0.10,
};

function calculateSkillsScore(matchedCount, partialCount, totalRequired) {
  if (totalRequired <= 0) return matchedCount > 0 ? 100 : 70;
  const score = ((matchedCount + 0.5 * partialCount) / totalRequired) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateOverallScore(skills, experience, keywords, education, quality) {
  const weighted =
    skills * SCORE_WEIGHTS.skills +
    experience * SCORE_WEIGHTS.experience +
    keywords * SCORE_WEIGHTS.keywords +
    education * SCORE_WEIGHTS.education +
    quality * SCORE_WEIGHTS.quality;
  return Math.max(0, Math.min(100, Math.round(weighted)));
}

/**
 * SkillSimulator — Interactive "What-If" Skill Impact Simulator & ROI Predictor.
 *
 * Computes real-time marginal score ROI for each missing/partial skill using the same
 * deterministic formula as the backend. Zero API calls, zero latency.
 */
export default function SkillSimulator({ analysis }) {
  const result = analysis?.result_json;

  // State: toggled skills (set of skill names the user has "added")
  const [toggledSkills, setToggledSkills] = useState(new Set());

  // Baseline metrics from the actual analysis
  const baseline = useMemo(() => {
    if (!result) return null;

    const matchedCount = result.matching_skills?.length || 0;
    const partialCount = result.partial_skills?.length || 0;
    const missingSkills = result.missing_skills || [];
    const partialSkills = (result.partial_skills || []).map(s => s.skill);
    const totalRequired = matchedCount + partialCount + missingSkills.length;

    // Fast O(1) Sets for zero-latency lookups
    const missingSet = new Set(missingSkills);
    const partialSet = new Set(partialSkills);

    return {
      matchedCount,
      partialCount,
      missingSkills,
      partialSkills,
      missingSet,
      partialSet,
      totalRequired,
      currentSkillsScore: analysis.skills_score ?? result.score_breakdown?.skills?.score ?? 0,
      currentOverall: analysis.overall_score ?? 0,
      experienceScore: analysis.experience_score ?? result.score_breakdown?.experience?.score ?? 0,
      keywordScore: analysis.keyword_score ?? result.score_breakdown?.keywords?.score ?? 0,
      educationScore: analysis.education_score ?? result.score_breakdown?.education?.score ?? 0,
      qualityScore: analysis.quality_score ?? result.score_breakdown?.quality?.score ?? 0,
    };
  }, [result, analysis]);

  // Compute per-skill marginal ROI
  const skillROI = useMemo(() => {
    if (!baseline) return [];

    const allSimulatable = [
      ...baseline.missingSkills.map(s => ({ skill: s, type: 'missing' })),
      ...baseline.partialSkills.map(s => ({ skill: s, type: 'partial' })),
    ];

    return allSimulatable.map(({ skill, type }) => {
      // Simulate adding this single skill as a full match
      const removedPartial = type === 'partial' ? 1 : 0;

      const simMatchedCount = baseline.matchedCount + 1;
      const simPartialCount = baseline.partialCount - removedPartial;
      const simSkillsScore = calculateSkillsScore(simMatchedCount, simPartialCount, baseline.totalRequired);
      const simOverall = calculateOverallScore(
        simSkillsScore,
        baseline.experienceScore,
        baseline.keywordScore,
        baseline.educationScore,
        baseline.qualityScore
      );

      return {
        skill,
        type,
        skillsDelta: simSkillsScore - baseline.currentSkillsScore,
        overallDelta: simOverall - baseline.currentOverall,
        simSkillsScore,
        simOverall,
      };
    }).sort((a, b) => b.overallDelta - a.overallDelta); // Ranked by highest ROI
  }, [baseline]);

  // Compute live simulation based on all toggled skills
  const liveSimulation = useMemo(() => {
    if (!baseline) return null;

    let addedFullMatches = 0;
    let removedPartials = 0;

    for (const skill of toggledSkills) {
      if (baseline.missingSet.has(skill)) {
        addedFullMatches += 1;
      } else if (baseline.partialSet.has(skill)) {
        addedFullMatches += 1;
        removedPartials += 1;
      }
    }

    const simMatchedCount = baseline.matchedCount + addedFullMatches;
    const simPartialCount = baseline.partialCount - removedPartials;
    const simSkillsScore = calculateSkillsScore(simMatchedCount, simPartialCount, baseline.totalRequired);
    const simOverall = calculateOverallScore(
      simSkillsScore,
      baseline.experienceScore,
      baseline.keywordScore,
      baseline.educationScore,
      baseline.qualityScore
    );

    return {
      skillsScore: simSkillsScore,
      overallScore: simOverall,
      skillsDelta: simSkillsScore - baseline.currentSkillsScore,
      overallDelta: simOverall - baseline.currentOverall,
    };
  }, [baseline, toggledSkills]);

  const handleToggle = useCallback((skill) => {
    setToggledSkills(prev => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  }, []);

  const handleAutoSolve = () => {
    if (!baseline || skillROI.length === 0) return;
    const targetScore = 80;
    const selected = new Set();
    let projectedScore = baseline.currentOverall;

    for (const item of skillROI) {
      if (projectedScore >= targetScore && selected.size > 0) break;
      selected.add(item.skill);
      let addedFullMatches = 0;
      let removedPartials = 0;
      for (const skill of selected) {
        if (baseline.missingSet.has(skill)) addedFullMatches += 1;
        if (baseline.partialSet.has(skill)) {
          addedFullMatches += 1;
          removedPartials += 1;
        }
      }
      const simMatched = baseline.matchedCount + addedFullMatches;
      const simPartial = baseline.partialCount - removedPartials;
      const simSkills = calculateSkillsScore(simMatched, simPartial, baseline.totalRequired);
      projectedScore = calculateOverallScore(
        simSkills,
        baseline.experienceScore,
        baseline.keywordScore,
        baseline.educationScore,
        baseline.qualityScore
      );
    }
    setToggledSkills(selected);
  };

  if (!result || !baseline || skillROI.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <Info size={28} weight="bold" className="text-ink-muted mx-auto mb-3" />
        <h3 className="font-display text-base font-semibold text-ink-primary mb-1">
          No Simulatable Skills
        </h3>
        <p className="text-xs text-ink-muted">
          This analysis has no missing or partial skills to simulate. Your resume already matches all identified requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Simulation Gauge */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Lightning size={18} weight="fill" className="text-accent" />
            <h3 className="font-display text-base font-semibold text-ink-primary">
              Live Score Projection
            </h3>
            <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono uppercase tracking-widest hidden sm:inline">
              0ms Latency
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoSolve}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-mono text-accent transition-all cursor-pointer btn-press"
              title="Automatically calculate the minimum highest-ROI skills to cross 80% match"
            >
              <Sparkle size={13} weight="fill" />
              <span>Auto-Solve for 80%</span>
            </button>
            {toggledSkills.size > 0 && (
              <button
                type="button"
                onClick={() => setToggledSkills(new Set())}
                className="px-2.5 py-1.5 rounded text-xs font-mono text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Skills Score Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">Skills Match</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold text-ink-primary tabular-nums">
                  {liveSimulation?.skillsScore ?? baseline.currentSkillsScore}%
                </span>
                {liveSimulation && liveSimulation.skillsDelta !== 0 && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold ${
                    liveSimulation.skillsDelta > 0 ? 'text-score-strong' : 'text-score-weak'
                  }`}>
                    <ArrowUp size={10} weight="bold" className={liveSimulation.skillsDelta < 0 ? 'rotate-180' : ''} />
                    {liveSimulation.skillsDelta > 0 ? '+' : ''}{liveSimulation.skillsDelta}%
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-surface-raised h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${liveSimulation?.skillsScore ?? baseline.currentSkillsScore}%` }}
              />
            </div>
          </div>

          {/* Overall Score Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">Overall Match</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold text-ink-primary tabular-nums">
                  {liveSimulation?.overallScore ?? baseline.currentOverall}%
                </span>
                {liveSimulation && liveSimulation.overallDelta !== 0 && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold ${
                    liveSimulation.overallDelta > 0 ? 'text-score-strong' : 'text-score-weak'
                  }`}>
                    <ArrowUp size={10} weight="bold" className={liveSimulation.overallDelta < 0 ? 'rotate-180' : ''} />
                    {liveSimulation.overallDelta > 0 ? '+' : ''}{liveSimulation.overallDelta}%
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-surface-raised h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${liveSimulation?.overallScore ?? baseline.currentOverall}%` }}
              />
            </div>
          </div>
        </div>

        {toggledSkills.size > 0 && (
          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs text-ink-muted font-mono">
              {toggledSkills.size} skill{toggledSkills.size !== 1 ? 's' : ''} simulated
            </span>
            <button
              type="button"
              onClick={() => setToggledSkills(new Set())}
              className="text-xs font-mono text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* ROI Ranking Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendUp size={16} weight="bold" className="text-accent" />
            <h3 className="font-display text-base font-semibold text-ink-primary">
              Skill ROI Ranking
            </h3>
          </div>
          <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">
            Highest impact first
          </span>
        </div>

        <div className="divide-y divide-border-subtle">
          {skillROI.map((item, idx) => {
            const isToggled = toggledSkills.has(item.skill);
            return (
              <div
                key={item.skill}
                onClick={() => handleToggle(item.skill)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(item.skill);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`flex items-center gap-4 p-4 sm:px-5 transition-colors cursor-pointer select-none focus:outline-none focus-visible:bg-surface-raised/60 ${
                  isToggled ? 'bg-accent/10' : 'hover:bg-surface-raised/40'
                }`}
              >
                {/* Rank */}
                <span className="font-mono text-xs text-ink-muted w-5 text-right tabular-nums shrink-0">
                  {idx + 1}.
                </span>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(item.skill);
                  }}
                  className="shrink-0 cursor-pointer p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`Toggle ${item.skill}`}
                  aria-checked={isToggled}
                  role="switch"
                >
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 toggle-track ${
                      isToggled ? 'bg-accent border border-accent' : 'bg-surface-raised border border-border'
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-sm toggle-thumb ${
                        isToggled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>

                {/* Skill Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold font-display ${
                      isToggled ? 'text-accent' : 'text-ink-primary'
                    }`}>
                      {item.skill}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                      item.type === 'missing'
                        ? 'bg-error/10 text-error border-error/20'
                        : 'bg-warning/10 text-warning border-warning/20'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                </div>

                {/* ROI Delta */}
                <div className="text-right shrink-0">
                  <span className="font-mono text-sm font-semibold text-score-strong tabular-nums">
                    +{item.overallDelta}%
                  </span>
                  <span className="block text-[10px] font-mono text-ink-muted">overall</span>
                </div>

                {/* Star for top-3 */}
                {idx < 3 && (
                  <Star size={14} weight="fill" className="text-score-partial shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
