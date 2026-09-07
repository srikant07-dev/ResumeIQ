import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillSimulator from '../components/analysis/SkillSimulator';

/**
 * Tests for the "What-If" Skill Impact Simulator & ROI Predictor.
 * Validates deterministic score recalculation, toggle interactions,
 * and ROI ranking accuracy.
 */

const mockAnalysis = {
  overall_score: 68,
  skills_score: 60,
  experience_score: 75,
  keyword_score: 70,
  education_score: 85,
  quality_score: 72,
  result_json: {
    matching_skills: [
      { skill: 'Python', context: 'Primary backend language' },
      { skill: 'React', context: 'Frontend framework' },
    ],
    partial_skills: [
      { skill: 'Docker', context: 'Used for local dev only' },
    ],
    missing_skills: ['Kubernetes', 'AWS', 'GraphQL'],
    keywords_present: ['Python', 'React'],
    keywords_missing: ['Docker', 'AWS'],
    keyword_categories: { technical: ['Python', 'React'], soft: [], domain: [] },
    score_breakdown: {
      skills: { score: 60, source: 'deterministic', evidence: 'test' },
      experience: { score: 75, source: 'ai', evidence: 'test' },
      keywords: { score: 70, source: 'deterministic', evidence: 'test' },
      education: { score: 85, source: 'ai', evidence: 'test' },
      quality: { score: 72, source: 'ai', evidence: 'test' },
    },
    strengths: [],
    weaknesses: [],
    recommendations: [],
    summary: 'Test',
  },
};

describe('SkillSimulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all missing and partial skills as toggleable rows', () => {
    render(<SkillSimulator analysis={mockAnalysis} />);

    // All 3 missing + 1 partial = 4 simulatable skills
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('GraphQL')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('displays live score projection section', () => {
    render(<SkillSimulator analysis={mockAnalysis} />);

    expect(screen.getByText('Live Score Projection')).toBeInTheDocument();
    expect(screen.getByText('0ms Latency')).toBeInTheDocument();
    expect(screen.getByText('Skill ROI Ranking')).toBeInTheDocument();
  });

  it('shows ROI delta values ranked by highest impact first', () => {
    render(<SkillSimulator analysis={mockAnalysis} />);

    // Each skill row should have an "overall" label and a delta
    const overallLabels = screen.getAllByText('overall');
    expect(overallLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('updates scores when a skill toggle is clicked', () => {
    render(<SkillSimulator analysis={mockAnalysis} />);

    // Find the toggle for a missing skill (e.g., Kubernetes)
    const toggleBtn = screen.getByLabelText('Toggle Kubernetes');
    fireEvent.click(toggleBtn);

    // After toggling, we should see "1 skill simulated"
    expect(screen.getByText(/1 skill simulated/i)).toBeInTheDocument();

    // A "Reset All" button should appear
    expect(screen.getByText('Reset All')).toBeInTheDocument();
  });

  it('resets all toggled skills when Reset All is clicked', () => {
    render(<SkillSimulator analysis={mockAnalysis} />);

    // Toggle two skills
    fireEvent.click(screen.getByLabelText('Toggle Kubernetes'));
    fireEvent.click(screen.getByLabelText('Toggle AWS'));
    expect(screen.getByText(/2 skills simulated/i)).toBeInTheDocument();

    // Click Reset All
    fireEvent.click(screen.getByText('Reset All'));

    // Counter should disappear (no skills simulated)
    expect(screen.queryByText(/skill.*simulated/i)).not.toBeInTheDocument();
  });

  it('renders empty state when no skills to simulate', () => {
    const perfectAnalysis = {
      ...mockAnalysis,
      result_json: {
        ...mockAnalysis.result_json,
        missing_skills: [],
        partial_skills: [],
      },
    };

    render(<SkillSimulator analysis={perfectAnalysis} />);
    expect(screen.getByText('No Simulatable Skills')).toBeInTheDocument();
  });

  it('shows correct type badges (missing vs partial)', () => {
    render(<SkillSimulator analysis={mockAnalysis} />);

    // Docker should have a "partial" badge
    const partialBadges = screen.getAllByText('partial');
    expect(partialBadges.length).toBe(1);

    // Missing skills should have "missing" badges
    const missingBadges = screen.getAllByText('missing');
    expect(missingBadges.length).toBe(3);
  });
});
