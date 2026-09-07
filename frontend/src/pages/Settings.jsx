import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShieldCheck,
  CheckCircle,
  Cpu,
  ArrowClockwise
} from '@phosphor-icons/react';

export default function Settings() {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setChecking(true);
      const res = await api.get('/health');
      setHealthStatus(res.data);
    } catch (err) {
      setHealthStatus({ status: 'unreachable', version: 'unknown', demo_mode: true });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="pb-6 border-b border-border">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-primary text-balance">
          System Settings & Profile
        </h2>
        <p className="text-sm text-ink-muted mt-0.5">
          Account details and backend runtime configuration.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold font-display text-ink-primary pb-3 border-b border-border-subtle">
          <ShieldCheck size={18} weight="bold" className="text-accent" />
          <span>Authenticated Account</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-ink-subtle font-mono block mb-1">User ID</span>
            <span className="font-mono text-ink-secondary select-all">{user?.id || '—'}</span>
          </div>
          <div>
            <span className="text-ink-subtle font-mono block mb-1">Email</span>
            <span className="font-mono text-ink-secondary">{user?.email || '—'}</span>
          </div>
          <div>
            <span className="text-ink-subtle font-mono block mb-1">Name</span>
            <span className="text-ink-primary font-medium font-display">
              {user?.user_metadata?.full_name || 'Candidate'}
            </span>
          </div>
          <div>
            <span className="text-ink-subtle font-mono block mb-1">Auth Provider</span>
            <span className="font-mono text-accent">Supabase JWT</span>
          </div>
        </div>
      </div>

      {/* System Runtime Configuration */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2 text-sm font-semibold font-display text-ink-primary">
            <Cpu size={18} weight="bold" className="text-accent" />
            <span>Backend Runtime Services</span>
          </div>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-raised hover:bg-surface-hover text-xs font-mono text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
          >
            <ArrowClockwise size={13} className={checking ? 'animate-spin' : ''} />
            <span>Check Status</span>
          </button>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between p-3 rounded bg-surface-raised/50 border border-border-subtle">
            <span className="text-ink-muted">FastAPI Service Status:</span>
            <span className="text-accent flex items-center gap-1">
              <CheckCircle size={14} weight="fill" />
              {healthStatus?.status === 'ok' ? 'Healthy (v' + healthStatus.version + ')' : 'Checking...'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-surface-raised/50 border border-border-subtle">
            <span className="text-ink-muted">PostgreSQL Database:</span>
            <span className="text-ink-primary">Supabase (PostgreSQL + Storage)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-surface-raised/50 border border-border-subtle">
            <span className="text-ink-muted">AI Evaluation Engine:</span>
            <span className="text-ink-primary">Google Gemini 3.6 Flash</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-surface-raised/50 border border-border-subtle">
            <span className="text-ink-muted">Scoring Methodology:</span>
            <span className="text-accent">Hybrid (Deterministic + Semantic)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
