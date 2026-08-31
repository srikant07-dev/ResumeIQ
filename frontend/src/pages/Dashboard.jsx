import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Sparkle,
  FileText,
  CaretRight,
  ArrowUpRight,
  ClockCounterClockwise,
  CheckCircle,
  Plus
} from '@phosphor-icons/react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analyses');
      setAnalyses(res.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute Dashboard Metrics
  const totalAnalyses = analyses.length;
  const validScores = analyses.filter(a => typeof a.overall_score === 'number').map(a => a.overall_score);
  const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null;
  const bestScore = validScores.length > 0 ? Math.max(...validScores) : null;

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/25';
    if (score >= 50) return 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25';
    return 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/25';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h2 className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-semibold tracking-tight text-[#fafafa]">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Candidate'} 👋
          </h2>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Review your candidate compatibility metrics and explore new job targets.
          </p>
        </div>

        <NavLink
          to="/analyze"
          className="inline-flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-medium px-4 py-2.5 rounded-md text-sm transition-colors duration-150 shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={16} weight="bold" />
          <span>New Analysis</span>
        </NavLink>
      </div>

      {/* 2. Key Metrics Strip (divide-x layout instead of generic 3 equal cards) */}
      <div className="bg-[#18181b] border border-white/[0.08] rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
        <div className="p-6">
          <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider block mb-2">
            TOTAL ANALYSES
          </span>
          <div className="font-['Geist_Mono',monospace] text-3xl font-semibold text-[#fafafa] tabular-nums">
            {totalAnalyses}
          </div>
          <span className="text-xs text-[#71717a] mt-1 block">Cumulative job evaluations</span>
        </div>

        <div className="p-6">
          <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider block mb-2">
            AVERAGE MATCH
          </span>
          <div className="font-['Geist_Mono',monospace] text-3xl font-semibold text-[#fafafa] tabular-nums">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </div>
          <span className="text-xs text-[#71717a] mt-1 block">Across evaluated positions</span>
        </div>

        <div className="p-6">
          <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider block mb-2">
            PEAK MATCH SCORE
          </span>
          <div className="font-['Geist_Mono',monospace] text-3xl font-semibold text-[#10b981] tabular-nums">
            {bestScore !== null ? `${bestScore}%` : '—'}
          </div>
          <span className="text-xs text-[#71717a] mt-1 block">Best compatibility target</span>
        </div>
      </div>

      {/* 3. Recent Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-['Outfit',sans-serif] text-lg font-semibold text-[#fafafa]">
            Recent Evaluations
          </h3>
          {analyses.length > 0 && (
            <NavLink
              to="/history"
              className="text-xs font-mono text-[#10b981] hover:underline flex items-center gap-1"
            >
              <span>VIEW_ALL_HISTORY</span>
              <ArrowUpRight size={13} weight="bold" />
            </NavLink>
          )}
        </div>

        {loading ? (
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-8 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-xs text-[#a1a1aa]">LOADING_RECORDS...</span>
          </div>
        ) : analyses.length === 0 ? (
          /* Composed Empty State */
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-[#27272a] text-[#10b981] flex items-center justify-center mb-4 border border-white/[0.06]">
              <FileText size={24} weight="bold" />
            </div>
            <h4 className="font-['Outfit',sans-serif] text-lg font-semibold text-[#fafafa] mb-1">
              No Resume Analyses Yet
            </h4>
            <p className="text-xs sm:text-sm text-[#a1a1aa] mb-6 max-w-sm">
              Upload your first resume and paste a target job description to generate hybrid compatibility metrics.
            </p>
            <NavLink
              to="/analyze"
              className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-medium px-4 py-2 rounded-md text-xs transition-colors"
            >
              <Sparkle size={15} weight="bold" />
              <span>Run First Analysis</span>
            </NavLink>
          </div>
        ) : (
          /* Recent Analyses divide-y list */
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl overflow-hidden divide-y divide-white/[0.08]">
            {analyses.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/analysis/${item.id}`)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#27272a]/60 transition-colors duration-150 cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center text-[#a1a1aa] group-hover:text-[#10b981] transition-colors shrink-0">
                    <FileText size={20} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-['Outfit',sans-serif] text-base font-semibold text-[#fafafa] truncate group-hover:text-[#10b981] transition-colors">
                      {item.job_title}
                    </h4>
                    <p className="text-xs font-mono text-[#a1a1aa] mt-0.5">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently Analyzed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {typeof item.overall_score === 'number' && (
                    <div className={`px-3 py-1 rounded-md text-xs font-mono font-semibold border ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score}% MATCH
                    </div>
                  )}
                  <CaretRight size={16} weight="bold" className="text-[#71717a] group-hover:text-[#fafafa] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
