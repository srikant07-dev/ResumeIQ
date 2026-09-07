import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreCard from '../components/analysis/ScoreCard';

describe('ScoreCard & Metric Presentation Testing', () => {
  it('renders strong score >= 75 with correct badge and tabular-nums class', () => {
    render(
      <ScoreCard
        score={85}
        label="Skills Match"
        source="deterministic"
        evidence="Matched 6 of 7 required skills."
      />
    );

    expect(screen.getByText(/Skills Match/i)).toBeInTheDocument();
    expect(screen.getByText(/85%/i)).toHaveClass('tabular-nums');
    expect(screen.getByText(/STRONG/i)).toBeInTheDocument();
    expect(screen.getByText(/SOURCE: DETERMINISTIC/i)).toBeInTheDocument();
    expect(screen.getByText(/Matched 6 of 7 required skills/i)).toBeInTheDocument();
  });

  it('renders partial score (50-74) with PARTIAL badge', () => {
    render(
      <ScoreCard
        score={65}
        label="Experience Match"
        source="ai"
        evidence="3 years of relevant experience."
      />
    );

    expect(screen.getByText(/65%/i)).toHaveClass('tabular-nums');
    expect(screen.getByText(/PARTIAL/i)).toBeInTheDocument();
    expect(screen.getByText(/SOURCE: AI/i)).toBeInTheDocument();
  });

  it('renders weak score < 50 with WEAK badge', () => {
    render(
      <ScoreCard
        score={40}
        label="Keywords Coverage"
        source="deterministic"
        evidence="Missing key domain terminology."
      />
    );

    expect(screen.getByText(/40%/i)).toHaveClass('tabular-nums');
    expect(screen.getByText(/WEAK/i)).toBeInTheDocument();
  });
});
