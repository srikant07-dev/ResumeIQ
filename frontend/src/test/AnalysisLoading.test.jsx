import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalysisLoading from '../components/analysis/AnalysisLoading';

describe('AnalysisLoading Stepped Scanner Component Testing', () => {
  it('renders technical stepped scanner with phase indicators and elapsed timer', () => {
    render(<AnalysisLoading />);

    expect(screen.getByText(/PIPELINE_ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/Evaluating Resume Alignment/i)).toBeInTheDocument();
    expect(screen.getByText(/Evaluation Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/ELAPSED:/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF Structure & Section Isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/Deterministic Skill & Keyword Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/Experience Relevance & Academic Alignment/i)).toBeInTheDocument();
    expect(screen.getByText(/Hybrid Weighted Score Matrix Calculation/i)).toBeInTheDocument();
    expect(screen.getByText(/Actionable Insights & Rewrite Synthesis/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Gemini 3.6 Flash/i)).toBeInTheDocument();
  });
});
