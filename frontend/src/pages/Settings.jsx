import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Gear,
  ShieldCheck,
  CheckCircle,
  Cpu,
  Database,
  ArrowClockwise,
  Sparkle
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
      <div className="pb-6 border-b border-white/[0.08]">
        <h2 className="font-['Outfit',sans-serif] text-2xl font-semibold tracking-tight text-[#fafafa]">
          System Settings & Profile
        </h2>
        <p className="text-sm text-[#a1a1aa] mt-0.5">
          Account details and backend runtime configuration.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold font-['Outfit',sans-serif] text-[#fafafa] pb-3 border-b border-white/[0.06]">
          <ShieldCheck size={18} weight="bold" className="text-[#10b981]" />
          <span>Authenticated Account</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#71717a] font-mono block mb-1">USER_ID</span>
            <span className="font-mono text-[#d4d4d8] select-all">{user?.id || '—'}</span>
          </div>
          <div>
            <span className="text-[#71717a] font-mono block mb-1">EMAIL_ADDRESS</span>
            <span className="font-mono text-[#d4d4d8]">{user?.email || '—'}</span>
          </div>
          <div>
            <span className="text-[#71717a] font-mono block mb-1">DISPLAY_NAME</span>
            <span className="text-[#fafafa] font-medium font-['Outfit',sans-serif]">
              {user?.user_metadata?.full_name || 'Candidate'}
            </span>
          </div>
          <div>
            <span className="text-[#71717a] font-mono block mb-1">AUTH_PROVIDER</span>
            <span className="font-mono text-[#10b981]">SUPABASE_JWT</span>
          </div>
        </div>
      </div>

      {/* System Runtime Configuration */}
      <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-sm font-semibold font-['Outfit',sans-serif] text-[#fafafa]">
            <Cpu size={18} weight="bold" className="text-[#10b981]" />
            <span>Backend Runtime Services</span>
          </div>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] transition-colors cursor-pointer"
          >
            <ArrowClockwise size={13} className={checking ? 'animate-spin' : ''} />
            <span>PING_API</span>
          </button>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between p-3 rounded bg-[#27272a]/50 border border-white/[0.04]">
            <span className="text-[#a1a1aa]">FastAPI Service Status:</span>
            <span className="text-[#10b981] flex items-center gap-1">
              <CheckCircle size={14} weight="fill" />
              {healthStatus?.status === 'ok' ? 'HEALTHY (v' + healthStatus.version + ')' : 'CHECKING...'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#27272a]/50 border border-white/[0.04]">
            <span className="text-[#a1a1aa]">PostgreSQL Database:</span>
            <span className="text-[#fafafa]">Supabase (ap-south-1)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#27272a]/50 border border-white/[0.04]">
            <span className="text-[#a1a1aa]">AI Evaluation Engine:</span>
            <span className="text-[#fafafa]">Google Gemini 2.0 Flash</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#27272a]/50 border border-white/[0.04]">
            <span className="text-[#a1a1aa]">Scoring Methodology:</span>
            <span className="text-[#10b981]">HYBRID (Deterministic + Semantic)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
