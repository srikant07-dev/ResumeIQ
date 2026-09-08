import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MarketIntelligenceTab from '../components/analysis/MarketIntelligenceTab';
import api from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockBaseAnalysis = {
  id: 'test-analysis-123',
  job_title: 'Backend Engineer',
  company_name: 'Stripe',
  market_intel_status: null,
  market_intel_json: null,
};

const mockCompletedIntelData = {
  mode: 'fast',
  company_intelligence: {
    company_name: 'Stripe',
    domain: 'Fintech',
    peer_companies: ['Adyen', 'Square', 'PayPal'],
    tech_stack: ['Ruby', 'Go', 'AWS', 'Kafka'],
    engineering_culture: ['Documentation-first', 'High autonomy', 'Rigorous testing'],
    hiring_bar_summary: 'Consistently evaluates system design depth and API craft.',
    sources: [
      { title: 'Stripe Engineering Culture', uri: 'https://stripe.com/blog/culture' },
    ],
  },
  market_benchmark: {
    consensus_skills: ['Python', 'PostgreSQL', 'REST APIs'],
    edge_skills: ['Distributed Systems', 'gRPC'],
    skill_frequency_map: [
      { skill: 'Python', frequency: '11/12 JDs', present_in_resume: true },
      { skill: 'Kubernetes', frequency: '8/12 JDs', present_in_resume: false },
    ],
    common_experience_range: '4-6 years',
    jds_analyzed_count: 12,
    sources: [
      { title: 'Fintech JDs Index', uri: 'https://example.com/fintech-jds' },
    ],
  },
  competitive_strategy: {
    market_position: 'Top 20%',
    company_fit_score: 84,
    company_fit_signals: ['Strong API design experience', 'High backend quality match'],
    competitive_advantages: [
      { title: 'API Performance', detail: 'Demonstrated optimization under load.' },
    ],
    critical_gaps: [
      { title: 'Distributed Tracing', detail: 'Expected for high-throughput payment pipelines.' },
    ],
    strategic_gaps: [
      { title: 'Event-driven Architecture', detail: 'Bonus signal for senior roles.' },
    ],
    pointwise_strategy: [
      {
        action: 'Quantify distributed database throughput on resume',
        why: 'Stripe strongly values verifiable scalability metrics',
        impact: 'Elevates profile to top 15% tier',
        priority: 'CRITICAL',
        effort: 'QUICK_WIN',
      },
      {
        action: 'Build a small Kafka/gRPC payment simulator project',
        why: 'Fills the event streaming gap noticed across 8 peer JDs',
        impact: 'Provides talking point for tech screen',
        priority: 'HIGH',
        effort: 'SHORT_TERM',
      },
    ],
  },
};

describe('MarketIntelligenceTab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default quota response
    api.get.mockResolvedValue({
      data: { used: 1, limit: 3, remaining: 2 },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ============================================================================
  // State 1: Not Started / Mode Selection
  // ============================================================================

  it('renders mode selection cards and quota badge when not started', async () => {
    render(
      <MarketIntelligenceTab
        analysis={mockBaseAnalysis}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText(/Market Intelligence & Deep Research Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend Engineer/)).toBeInTheDocument();
    expect(screen.getAllByText(/Stripe/).length).toBeGreaterThanOrEqual(1);

    // Mode cards
    expect(screen.getByText('Fast Analysis')).toBeInTheDocument();
    expect(screen.getByText('Deep Dive Research')).toBeInTheDocument();

    // Quota badge
    await waitFor(() => {
      expect(screen.getByText(/2 of 3 daily analyses remaining/i)).toBeInTheDocument();
    });
  });

  it('triggers fast analysis when clicking Fast Analysis card', async () => {
    const mockRefresh = vi.fn();
    api.post.mockResolvedValueOnce({ data: { status: 'running' } });

    render(
      <MarketIntelligenceTab
        analysis={mockBaseAnalysis}
        onRefresh={mockRefresh}
      />
    );

    const fastBtn = screen.getByRole('button', { name: /Fast Analysis/i });
    fireEvent.click(fastBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/analyses/test-analysis-123/market-intel/trigger',
        { mode: 'fast', company_name: 'Stripe' }
      );
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('triggers deep analysis when clicking Deep Dive Research card', async () => {
    const mockRefresh = vi.fn();
    api.post.mockResolvedValueOnce({ data: { status: 'running' } });

    render(
      <MarketIntelligenceTab
        analysis={mockBaseAnalysis}
        onRefresh={mockRefresh}
      />
    );

    const deepBtn = screen.getByRole('button', { name: /Deep Dive Research/i });
    fireEvent.click(deepBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/analyses/test-analysis-123/market-intel/trigger',
        { mode: 'deep', company_name: 'Stripe' }
      );
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // State 2: Running & Polling
  // ============================================================================

  it('renders loading indicators and auto-polls when status is running', () => {
    vi.useFakeTimers();
    const mockRefresh = vi.fn();

    const runningAnalysis = {
      ...mockBaseAnalysis,
      market_intel_status: 'running',
    };

    render(
      <MarketIntelligenceTab
        analysis={runningAnalysis}
        onRefresh={mockRefresh}
      />
    );

    expect(screen.getByText('Analyzing Market Position...')).toBeInTheDocument();
    expect(screen.getByText('Searching company domain and competitors')).toBeInTheDocument();
    expect(screen.getByText('Finding similar job descriptions across the web')).toBeInTheDocument();

    // Fast-forward 3 seconds for interval polling
    vi.advanceTimersByTime(3000);
    expect(mockRefresh).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(3000);
    expect(mockRefresh).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  // ============================================================================
  // State 3: Completed Results View
  // ============================================================================

  it('renders full market intelligence results across all sections', () => {
    const completedAnalysis = {
      ...mockBaseAnalysis,
      market_intel_status: 'completed',
      market_intel_json: mockCompletedIntelData,
    };

    render(
      <MarketIntelligenceTab
        analysis={completedAnalysis}
        onRefresh={vi.fn()}
      />
    );

    // Header metrics
    expect(screen.getByText('Fast Analysis Mode')).toBeInTheDocument();
    expect(screen.getByText(/12 JDs analyzed/)).toBeInTheDocument();

    // Section 1: Company Profile
    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('Fintech')).toBeInTheDocument();
    expect(screen.getByText('Adyen')).toBeInTheDocument();
    expect(screen.getByText('Documentation-first')).toBeInTheDocument();

    // Section 2: Market Skill Matrix
    expect(screen.getByText('Market Skill Benchmark')).toBeInTheDocument();
    expect(screen.getAllByText('Python').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('11/12 JDs')).toBeInTheDocument();
    expect(screen.getByText('Distributed Systems')).toBeInTheDocument();

    // Section 3: Competitive Position
    expect(screen.getByText('Competitive Position')).toBeInTheDocument();
    expect(screen.getByText('Top 20%')).toBeInTheDocument();
    expect(screen.getByText('84%')).toBeInTheDocument();
    expect(screen.getByText('API Performance')).toBeInTheDocument();
    expect(screen.getByText('Distributed Tracing')).toBeInTheDocument();

    // Section 4: Improvement Roadmap
    expect(screen.getByText('Improvement Roadmap')).toBeInTheDocument();
    expect(screen.getByText(/Quantify distributed database throughput/)).toBeInTheDocument();
    expect(screen.getByText(/Build a small Kafka\/gRPC payment simulator/)).toBeInTheDocument();
  });

  it('renders deep research report section when mode is deep', () => {
    const deepAnalysis = {
      ...mockBaseAnalysis,
      market_intel_status: 'completed',
      market_intel_json: {
        ...mockCompletedIntelData,
        mode: 'deep',
        deep_research_report: '# Comprehensive Market Report\n\nDetailed findings on Stripe hiring bar.',
      },
    };

    render(
      <MarketIntelligenceTab
        analysis={deepAnalysis}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText('Deep Dive Research Mode')).toBeInTheDocument();
    expect(screen.getByText('Full Research Report')).toBeInTheDocument();

    // Expand the report
    const toggleReportBtn = screen.getByRole('button', { name: /Full Research Report/i });
    fireEvent.click(toggleReportBtn);

    expect(screen.getByText(/Detailed findings on Stripe hiring bar/)).toBeInTheDocument();
  });

  // ============================================================================
  // Demo Mode & Edge Cases
  // ============================================================================

  it('renders mode cards and allows triggering even when demo session exists in localStorage', () => {
    localStorage.setItem(
      'resumeiq_demo_session',
      JSON.stringify({ access_token: 'demo-token', user: { id: 'demo-user-123' } })
    );

    render(
      <MarketIntelligenceTab
        analysis={mockBaseAnalysis}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText('Fast Analysis')).toBeInTheDocument();
    expect(screen.getByText('Deep Dive Research')).toBeInTheDocument();

    // Buttons should be enabled and interactive
    const fastBtn = screen.getByRole('button', { name: /Fast Analysis/i });
    const deepBtn = screen.getByRole('button', { name: /Deep Dive Research/i });

    expect(fastBtn).not.toBeDisabled();
    expect(deepBtn).not.toBeDisabled();
  });

  it('renders failed message banner with error details when status is failed', () => {
    const failedAnalysis = {
      ...mockBaseAnalysis,
      market_intel_status: 'failed',
      market_intel_json: { error: 'Gemini rate limit exceeded' },
    };

    render(
      <MarketIntelligenceTab
        analysis={failedAnalysis}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText(/Previous attempt failed: Gemini rate limit exceeded/i)).toBeInTheDocument();
  });
});
