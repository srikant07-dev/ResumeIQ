import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

const mockDashboardAnalyses = [
  {
    id: "22222222-2222-2222-2222-222222222221",
    resume_id: "11111111-1111-1111-1111-111111111111",
    job_title: "Senior Full Stack Engineer",
    overall_score: 80,
    status: "completed",
    created_at: "2026-09-02T12:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    resume_id: "11111111-1111-1111-1111-111111111111",
    job_title: "Backend Specialist",
    overall_score: 90,
    status: "completed",
    created_at: "2026-09-01T10:00:00Z"
  }
];

describe('Dashboard Component Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard metrics strip with calculated average and peak scores', async () => {
    api.get.mockResolvedValueOnce({ data: mockDashboardAnalyses });

    render(
      <AuthProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total Analyses/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 analyses
      expect(screen.getByText('85%')).toBeInTheDocument(); // Avg of 80 & 90
      expect(screen.getByText('90%')).toBeInTheDocument(); // Peak
    });

    expect(screen.getByText(/Recent Evaluations/i)).toBeInTheDocument();
    expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend Specialist/i)).toBeInTheDocument();
  });

  it('renders empty state when user has zero analyses', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <AuthProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No Resume Analyses Yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Run First Analysis/i)).toBeInTheDocument();
    });
  });
});
