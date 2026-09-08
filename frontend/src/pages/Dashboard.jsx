import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Sparkle,
  FileText,
  CaretRight,
  ArrowUpRight,
  Plus
} from '@phosphor-icons/react';

import EmptyState from '../components/common/EmptyState';

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
    } catch {
      setAnalyses([]);
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
    if (score >= 75) return 'text-score-strong bg-score-strong/10 border-score-strong/25';
    if (score >= 50) return 'text-score-partial bg-score-partial/10 border-score-partial/25';
    return 'text-score-weak bg-score-weak/10 border-score-weak/25';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-primary text-balance">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Candidate'}
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Review your candidate compatibility metrics and explore new job targets.
          </p>
        </div>

        <NavLink
          to="/analyze"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium px-4 py-2.5 rounded-md text-sm transition-colors duration-150 shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={16} weight="bold" />
          <span>New Analysis</span>
        </NavLink>
      </div>

      {/* 2. Key Metrics Strip (divide-x layout instead of generic 3 equal cards) */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-6">
          <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block mb-2">
            Total Analyses
          </span>
          <div className="font-mono text-3xl font-semibold text-ink-primary tabular-nums">
            {totalAnalyses}
          </div>
          <span className="text-xs text-ink-subtle mt-1 block">Cumulative job evaluations</span>
        </div>

        <div className="p-6">
          <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block mb-2">
            Average Match
          </span>
          <div className="font-mono text-3xl font-semibold text-ink-primary tabular-nums">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </div>
          <span className="text-xs text-ink-subtle mt-1 block">Across evaluated positions</span>
        </div>

        <div className="p-6">
          <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block mb-2">
            Peak Match Score
          </span>
          <div className="font-mono text-3xl font-semibold text-accent tabular-nums">
            {bestScore !== null ? `${bestScore}%` : '—'}
          </div>
          <span className="text-xs text-ink-subtle mt-1 block">Best compatibility target</span>
        </div>
      </div>

      {/* 3. Recent Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink-primary">
            Recent Evaluations
          </h3>
          {analyses.length > 0 && (
            <NavLink
              to="/history"
              className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight size={13} weight="bold" />
            </NavLink>
          )}
        </div>

        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-xs text-ink-muted">Loading records...</span>
          </div>
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Resume Analyses Yet"
            description="Upload your first resume and paste a target job description to generate hybrid compatibility metrics."
            actionLabel="Run First Analysis"
            actionTo="/analyze"
            actionIcon={Sparkle}
          />
        ) : (
          /* Recent Analyses divide-y list */
          <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
            {analyses.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/analysis/${item.id}`)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised/60 transition-colors duration-150 cursor-pointer group btn-press"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-raised flex items-center justify-center text-ink-muted group-hover:text-accent transition-colors shrink-0">
                    <FileText size={20} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display text-base font-semibold text-ink-primary truncate group-hover:text-accent transition-colors">
                      {item.job_title}
                    </h4>
                    <p className="text-xs font-mono text-ink-muted mt-0.5">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently Analyzed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {typeof item.overall_score === 'number' && (
                    <div className={`px-3 py-1 rounded-md text-xs font-mono font-semibold border tabular-nums ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score}% match
                    </div>
                  )}
                  <CaretRight size={16} weight="bold" className="text-ink-subtle group-hover:text-ink-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
