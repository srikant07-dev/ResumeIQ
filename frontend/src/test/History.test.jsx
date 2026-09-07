import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import History from '../pages/History';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn()
  }
}));

const mockHistoryData = [
  {
    id: "22222222-2222-2222-2222-222222222221",
    resume_id: "11111111-1111-1111-1111-111111111111",
    job_title: "Senior Full Stack Engineer",
    overall_score: 77,
    status: "completed",
    created_at: "2026-09-02T12:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    resume_id: "11111111-1111-1111-1111-111111111111",
    job_title: "Backend Cloud Specialist",
    overall_score: 84,
    status: "completed",
    created_at: "2026-09-01T10:00:00Z"
  }
];

describe('History Page Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders history list with past analyses', async () => {
    api.get.mockResolvedValueOnce({ data: mockHistoryData });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Analysis History/i)).toBeInTheDocument();
      expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/Backend Cloud Specialist/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/77%/i)).toBeInTheDocument();
    expect(screen.getByText(/84%/i)).toBeInTheDocument();
  });

  it('filters history list when searching by job title (DEF-09 safe)', async () => {
    api.get.mockResolvedValueOnce({ data: mockHistoryData });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by job title.../i);
    fireEvent.change(searchInput, { target: { value: 'Backend' } });

    expect(screen.getByText(/Backend Cloud Specialist/i)).toBeInTheDocument();
    expect(screen.queryByText(/Senior Full Stack Engineer/i)).not.toBeInTheDocument();
  });

  it('renders empty state when no matching analyses are found', async () => {
    api.get.mockResolvedValueOnce({ data: mockHistoryData });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by job title.../i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentRoleXYZ' } });

    expect(screen.getByText(/No Matches Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search query/i)).toBeInTheDocument();
  });
});
