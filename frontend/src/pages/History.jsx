import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import api from '../services/api';
import {
  ClockCounterClockwise,
  Trash,
  MagnifyingGlass,
  FileText,
  Sparkle,
  WarningCircle,
  X
} from '@phosphor-icons/react';

import EmptyState from '../components/common/EmptyState';

export default function History() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [loading, setLoading] = useState(true);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
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

  const handleDelete = async () => {
    if (!deleteModalId) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await api.delete(`/analyses/${deleteModalId}`);
      setAnalyses(prev => prev.filter(a => a.id !== deleteModalId));
      setDeleteModalId(null);
    } catch (err) {
      setDeleteError(err.response?.data?.detail || err.message || 'Failed to delete analysis record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-score-strong bg-score-strong/10 border-score-strong/25';
    if (score >= 50) return 'text-score-partial bg-score-partial/10 border-score-partial/25';
    return 'text-score-weak bg-score-weak/10 border-score-weak/25';
  };

  const filteredAnalyses = analyses
    .filter(a => a.job_title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score_desc') return (b.overall_score || 0) - (a.overall_score || 0);
      if (sortBy === 'score_asc') return (a.overall_score || 0) - (b.overall_score || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-primary text-balance">
            Analysis History
          </h2>
          <p className="text-sm text-ink-muted mt-0.5">
            Review past evaluation records, track match progress, or delete old sessions.
          </p>
        </div>

        <NavLink
          to="/analyze"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-canvas font-medium px-4 py-2 rounded-md text-xs transition-colors shrink-0"
        >
          <Sparkle size={15} weight="bold" />
          <span>New Analysis</span>
        </NavLink>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search by job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md bg-surface border border-border text-xs sm:text-sm text-ink-primary placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 rounded-md bg-surface border border-border text-xs font-mono text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="date_desc">Sort: Newest first</option>
          <option value="score_desc">Sort: Highest match</option>
          <option value="score_asc">Sort: Lowest match</option>
        </select>
      </div>

      {/* History List */}
      {loading ? (
        <div className="bg-surface border border-border rounded-xl p-10 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-ink-muted">Loading records...</span>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <EmptyState
          icon={ClockCounterClockwise}
          title={searchQuery ? 'No Matches Found' : 'No History Recorded'}
          description={searchQuery ? 'Try adjusting your search query.' : 'Run your first resume analysis to begin recording history.'}
          actionLabel={searchQuery ? null : 'Run First Analysis'}
          actionTo={searchQuery ? null : '/analyze'}
          actionIcon={searchQuery ? null : Sparkle}
        />
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
          {filteredAnalyses.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised/50 transition-colors"
            >
              <div
                onClick={() => navigate(`/analysis/${item.id}`)}
                className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-raised text-ink-muted group-hover:text-accent flex items-center justify-center shrink-0 transition-colors">
                  <FileText size={20} weight="bold" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-base font-semibold text-ink-primary truncate group-hover:text-accent transition-colors">
                    {item.job_title}
                  </h4>
                  <span className="text-xs font-mono text-ink-muted block mt-0.5">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {typeof item.overall_score === 'number' && (
                  <div className={`px-3 py-1 rounded-md text-xs font-mono font-semibold border tabular-nums ${getScoreColor(item.overall_score)}`}>
                    {item.overall_score}% match
                  </div>
                )}

                <button
                  onClick={() => setDeleteModalId(item.id)}
                  className="p-2 text-ink-subtle hover:text-error rounded-md hover:bg-surface-raised transition-colors cursor-pointer"
                  title="Delete Analysis"
                >
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="text-xs font-mono text-error font-semibold flex items-center gap-1.5">
                <WarningCircle size={16} weight="fill" />
                Confirm Delete
              </span>
              <button
                onClick={() => { setDeleteModalId(null); setDeleteError(null); }}
                className="text-ink-muted hover:text-ink-primary cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Are you sure you want to permanently delete this resume analysis record? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="p-2.5 rounded bg-error/10 border border-error/20 text-xs text-error">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setDeleteModalId(null); setDeleteError(null); }}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded text-xs font-mono text-ink-muted hover:bg-surface-raised cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded bg-error hover:bg-error-hover text-ink-primary text-xs font-mono font-medium cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
