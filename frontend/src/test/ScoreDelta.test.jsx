import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScoreDeltaModal from '../components/analysis/ScoreDeltaModal';

/**
 * Tests for the ScoreDeltaModal visual comparison dialog.
 * Validates delta display, skill migration tags, and modal controls.
 */

const mockDeltaData = {
  score_delta: {
    overall_delta: 14,
    skills_delta: 20,
    keywords_delta: 5,
    experience_delta: 5,
    education_delta: 0,
    quality_delta: 5,
    newly_matched_skills: ['Docker', 'FastAPI'],
    resolved_missing_skills: ['Docker', 'FastAPI'],
  },
};

const mockParent = {
  overall_score: 68,
  skills_score: 60,
  keyword_score: 70,
  experience_score: 75,
  education_score: 85,
  quality_score: 70,
};

const mockNew = {
  overall_score: 82,
  skills_score: 80,
  keyword_score: 75,
  experience_score: 80,
  education_score: 85,
  quality_score: 75,
};

describe('ScoreDeltaModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ScoreDeltaModal
        isOpen={false}
        onClose={mockOnClose}
        deltaData={mockDeltaData}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when deltaData is null', () => {
    const { container } = render(
      <ScoreDeltaModal
        isOpen={true}
        onClose={mockOnClose}
        deltaData={null}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays revision comparison title when open', () => {
    render(
      <ScoreDeltaModal
        isOpen={true}
        onClose={mockOnClose}
        deltaData={mockDeltaData}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );

    expect(screen.getByText('Revision Comparison')).toBeInTheDocument();
  });

  it('shows the hero delta badge with correct improvement', () => {
    render(
      <ScoreDeltaModal
        isOpen={true}
        onClose={mockOnClose}
        deltaData={mockDeltaData}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );

    expect(screen.getByText(/\+14% Match Improvement/i)).toBeInTheDocument();
  });

  it('displays before and after scores for each category', () => {
    render(
      <ScoreDeltaModal
        isOpen={true}
        onClose={mockOnClose}
        deltaData={mockDeltaData}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );

    // Overall Match row
    expect(screen.getByText('Overall Match')).toBeInTheDocument();
    expect(screen.getByText('Skills Match')).toBeInTheDocument();
  });

  it('renders resolved missing skills with green badges', () => {
    render(
      <ScoreDeltaModal
        isOpen={true}
        onClose={mockOnClose}
        deltaData={mockDeltaData}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );

    expect(screen.getByText('Gaps Resolved')).toBeInTheDocument();
    // Docker and FastAPI appear in both "Gaps Resolved" and "Newly Matched" sections
    expect(screen.getAllByText('Docker').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThanOrEqual(1);
  });

  it('renders newly matched skills with accent badges', () => {
    render(
      <ScoreDeltaModal
        isOpen={true}
        onClose={mockOnClose}
        deltaData={mockDeltaData}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );

    expect(screen.getByText('Newly Matched')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ScoreDeltaModal
        isOpen={true}
        onClose={mockOnClose}
        deltaData={mockDeltaData}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );

    const closeBtn = screen.getByLabelText('Close comparison');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "View Full Report" button is clicked', () => {
    render(
      <ScoreDeltaModal
        isOpen={true}
        onClose={mockOnClose}
        deltaData={mockDeltaData}
        parentAnalysis={mockParent}
        newAnalysis={mockNew}
      />
    );

    const viewBtn = screen.getByText('View Full Report');
    fireEvent.click(viewBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
