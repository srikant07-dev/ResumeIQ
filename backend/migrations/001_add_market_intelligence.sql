-- Migration: Add market intelligence columns to analyses table
-- Feature: Market Intelligence Engine (branch: market-research-engine)
-- Date: 2026-09-08
--
-- All new columns are nullable with no NOT NULL constraints,
-- so existing rows remain valid without backfill.

ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS market_intel_status TEXT DEFAULT NULL
    CHECK (market_intel_status IS NULL OR market_intel_status IN ('running', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS market_intel_json JSONB;

-- Index for rate-limit counting: how many market-intel runs has a user done today?
CREATE INDEX IF NOT EXISTS idx_analyses_market_intel_user_date
  ON public.analyses (user_id, created_at)
  WHERE market_intel_status IS NOT NULL;
