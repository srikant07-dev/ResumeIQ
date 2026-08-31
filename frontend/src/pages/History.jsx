import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import api from '../services/api';
import {
  ClockCounterClockwise,
  Trash,
  MagnifyingGlass,
  FileText,
  CaretRight,
  Sparkle,
  WarningCircle,
  X
} from '@phosphor-icons/react';

export default function History() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [loading, setLoading] = useState(true);
  const [deleteModalId, setDeleteModalId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analyses');
      setAnalyses(res.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    try {
      await api.delete(`/analyses/${deleteModalId}`);
      setAnalyses(prev => prev.filter(a => a.id !== deleteModalId));
      setDeleteModalId(null);
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/25';
    if (score >= 50) return 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25';
    return 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/25';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h2 className="font-['Outfit',sans-serif] text-2xl font-semibold tracking-tight text-[#fafafa]">
            Analysis History
          </h2>
          <p className="text-sm text-[#a1a1aa] mt-0.5">
            Review past evaluation records, track match progress, or delete old sessions.
          </p>
        </div>

        <NavLink
          to="/analyze"
          className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-medium px-4 py-2 rounded-md text-xs transition-colors shrink-0"
        >
          <Sparkle size={15} weight="bold" />
          <span>New Analysis</span>
        </NavLink>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search by job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md bg-[#18181b] border border-white/[0.08] text-xs sm:text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 rounded-md bg-[#18181b] border border-white/[0.08] text-xs font-mono text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
        >
          <option value="date_desc">SORT: NEWEST FIRST</option>
          <option value="score_desc">SORT: HIGHEST MATCH</option>
          <option value="score_asc">SORT: LOWEST MATCH</option>
        </select>
      </div>

      {/* History List */}
      {loading ? (
        <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-10 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-[#a1a1aa]">FETCHING_RECORDS...</span>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-10 text-center max-w-md mx-auto">
          <ClockCounterClockwise size={32} weight="bold" className="text-[#a1a1aa] mx-auto mb-3" />
          <h4 className="font-['Outfit',sans-serif] text-base font-semibold text-[#fafafa] mb-1">
            {searchQuery ? 'No Matches Found' : 'No History Recorded'}
          </h4>
          <p className="text-xs text-[#a1a1aa] mb-4">
            {searchQuery ? 'Try adjusting your search query.' : 'Run your first resume analysis to begin recording history.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-white/[0.08] rounded-xl overflow-hidden divide-y divide-white/[0.08]">
          {filteredAnalyses.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#27272a]/50 transition-colors"
            >
              <div
                onClick={() => navigate(`/analysis/${item.id}`)}
                className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#27272a] text-[#a1a1aa] group-hover:text-[#10b981] flex items-center justify-center shrink-0 transition-colors">
                  <FileText size={20} weight="bold" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-['Outfit',sans-serif] text-base font-semibold text-[#fafafa] truncate group-hover:text-[#10b981] transition-colors">
                    {item.job_title}
                  </h4>
                  <span className="text-xs font-mono text-[#a1a1aa] block mt-0.5">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {typeof item.overall_score === 'number' && (
                  <div className={`px-3 py-1 rounded-md text-xs font-mono font-semibold border ${getScoreColor(item.overall_score)}`}>
                    {item.overall_score}% MATCH
                  </div>
                )}

                <button
                  onClick={() => setDeleteModalId(item.id)}
                  className="p-2 text-[#71717a] hover:text-[#ef4444] rounded-md hover:bg-[#27272a] transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-mono text-[#ef4444] font-semibold flex items-center gap-1.5">
                <WarningCircle size={16} weight="fill" />
                CONFIRM_DELETION
              </span>
              <button onClick={() => setDeleteModalId(null)} className="text-[#a1a1aa] hover:text-[#fafafa]">
                <X size={16} weight="bold" />
              </button>
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Are you sure you want to permanently delete this resume analysis record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-3 py-1.5 rounded text-xs font-mono text-[#a1a1aa] hover:bg-[#27272a]"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 rounded bg-[#ef4444] hover:bg-[#dc2626] text-[#fafafa] text-xs font-mono font-medium cursor-pointer"
              >
                DELETE_RECORD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
