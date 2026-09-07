import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NewAnalysis from '../pages/NewAnalysis';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('NewAnalysis Workflow Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: [
        { id: "11111111-1111-1111-1111-111111111111", file_name: "srikant_resume.pdf" }
      ]
    });
  });

  it('renders Step 1 with resume options and proceeds to Step 2', async () => {
    render(
      <MemoryRouter>
        <NewAnalysis />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/srikant_resume.pdf/i)).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole('button', { name: /Continue to Job Details/i });
    expect(nextBtn).toBeInTheDocument();
    fireEvent.click(nextBtn);

    // Should now be on Step 2
    expect(screen.getByLabelText(/Target Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Description & Qualifications/i)).toBeInTheDocument();
  });

  it('populates sample job description when sample button is clicked', async () => {
    render(
      <MemoryRouter>
        <NewAnalysis />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/srikant_resume.pdf/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue to Job Details/i }));

    const sampleBtn = screen.getByRole('button', { name: /Load sample/i });
    fireEvent.click(sampleBtn);

    const titleInput = screen.getByLabelText(/Target Job Title/i);
    const descInput = screen.getByLabelText(/Job Description & Qualifications/i);

    expect(titleInput.value).toContain('Full Stack Software Engineer');
    expect(descInput.value.length).toBeGreaterThan(50);
  });

  it('shows error if job description is shorter than 30 characters on submit', async () => {
    render(
      <MemoryRouter>
        <NewAnalysis />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/srikant_resume.pdf/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue to Job Details/i }));

    const titleInput = screen.getByLabelText(/Target Job Title/i);
    const descInput = screen.getByLabelText(/Job Description & Qualifications/i);

    fireEvent.change(titleInput, { target: { value: 'Frontend Developer' } });
    fireEvent.change(descInput, { target: { value: 'Short JD' } });

    const submitBtn = screen.getByRole('button', { name: /Analyze Resume/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
  });
});
