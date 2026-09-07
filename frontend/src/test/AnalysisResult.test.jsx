import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import AnalysisResult from '../pages/AnalysisResult';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

const mockAnalysisData = {
  id: "22222222-2222-2222-2222-222222222221",
  resume_id: "11111111-1111-1111-1111-111111111111",
  job_title: "Senior Full Stack Engineer",
  job_description: "We are looking for a Senior Full Stack Engineer with Python, FastAPI, and React.",
  overall_score: 77,
  skills_score: 73,
  experience_score: 75,
  keyword_score: 76,
  education_score: 90,
  quality_score: 85,
  status: "completed",
  created_at: "2026-09-02T12:00:00Z",
  result_json: {
    score_breakdown: {
      skills: { score: 73, source: "deterministic", evidence: "Matched 7 skills out of 10 required." },
      experience: { score: 75, source: "ai", evidence: "4+ years hands-on production experience." },
      keywords: { score: 76, source: "deterministic", evidence: "Found 13 of 17 key technical terms." },
      education: { score: 90, source: "ai", evidence: "B.Tech in Computer Science & Engineering." },
      quality: { score: 85, source: "ai", evidence: "Action-oriented bullet points and clean structure." }
    },
    matching_skills: [
      { skill: "FastAPI", context: "Architected REST microservices with FastAPI." },
      { skill: "React", context: "Built client dashboards in React and Tailwind CSS." }
    ],
    partial_skills: [
      { skill: "Docker", context: "Used Docker for local development." }
    ],
    missing_skills: ["AWS Cloud Architecture"],
    keywords_present: ["Python", "FastAPI", "React", "PostgreSQL", "REST", "Git"],
    keywords_missing: ["Kubernetes", "GraphQL"],
    keyword_categories: {
      technical: ["Python", "FastAPI", "React", "PostgreSQL"],
      soft: ["Problem Solving", "Communication"],
      domain: ["Web Applications", "SaaS"]
    },
    strengths: [
      { point: "Full Stack Mastery", evidence: "Demonstrated across multiple production projects." }
    ],
    weaknesses: [
      { point: "Cloud Infrastructure Gap", evidence: "Needs more explicit cloud architecture experience." }
    ],
    recommendations: [
      {
        priority: "HIGH",
        title: "Highlight Cloud & Container Deployments",
        description: "Elaborate on Docker containers and AWS hosting.",
        evidence: "Essential requirement in target job description.",
        suggested_action: "Add explicit project bullet points detailing cloud setup without fabricating metrics."
      }
    ],
    summary: "Strong candidate with comprehensive software development expertise and high alignment."
  }
};

describe('AnalysisResult View Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders analysis report title, score breakdown, and tabs', async () => {
    api.get.mockResolvedValueOnce({ data: mockAnalysisData });

    render(
      <MemoryRouter initialEntries={['/analysis/22222222-2222-2222-2222-222222222221']}>
        <Routes>
          <Route path="/analysis/:id" element={<AnalysisResult />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument();
    });

    // Overview Tab Content
    expect(screen.getByText(/77%/i)).toBeInTheDocument();
    expect(screen.getByText(/Hybrid Score Composition/i)).toBeInTheDocument();
    expect(screen.getByText(/Skills Match/i)).toBeInTheDocument();
    expect(screen.getByText(/Experience Relevance/i)).toBeInTheDocument();
    expect(screen.getByText(/Keyword Coverage/i)).toBeInTheDocument();
    expect(screen.getByText(/Education Alignment/i)).toBeInTheDocument();
    expect(screen.getByText(/Resume Quality/i)).toBeInTheDocument();
  });

  it('switches between tabs and displays matching skills and recommendations', async () => {
    api.get.mockResolvedValueOnce({ data: mockAnalysisData });

    render(
      <MemoryRouter initialEntries={['/analysis/22222222-2222-2222-2222-222222222221']}>
        <Routes>
          <Route path="/analysis/:id" element={<AnalysisResult />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument();
    });

    // Switch to Skills Tab
    const skillsTab = screen.getByRole('button', { name: /Skills \(2\)/i });
    fireEvent.click(skillsTab);
    expect(screen.getByText(/Strong Technical Matches/i)).toBeInTheDocument();
    expect(screen.getAllByText(/FastAPI/i).length).toBeGreaterThanOrEqual(1);

    // Switch to Recommendations Tab
    const recsTab = screen.getByRole('button', { name: /Recommendations \(1\)/i });
    fireEvent.click(recsTab);
    expect(screen.getByText(/Highlight Cloud & Container Deployments/i)).toBeInTheDocument();
    expect(screen.getByText(/HIGH priority/i)).toBeInTheDocument();
  });

  it('renders 404 state gracefully if analysis record is not found', async () => {
    api.get.mockRejectedValueOnce(new Error('Record not found'));

    render(
      <MemoryRouter initialEntries={['/analysis/nonexistent-id']}>
        <Routes>
          <Route path="/analysis/:id" element={<AnalysisResult />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Analysis Not Found/i)).toBeInTheDocument();
      expect(screen.getByText(/Return to Dashboard/i)).toBeInTheDocument();
    });
  });

  it('opens re-evaluation modal, submits updated resume, and displays ScoreDeltaModal', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/resumes')) {
        return Promise.resolve({
          data: [{ id: 'revised-resume-uuid', file_name: 'Revised_Resume_v2.pdf' }]
        });
      }
      return Promise.resolve({ data: mockAnalysisData });
    });

    api.post.mockResolvedValueOnce({
      data: {
        new_analysis: {
          ...mockAnalysisData,
          id: 'new-child-analysis-id',
          overall_score: 88,
          skills_score: 85
        },
        parent_analysis_id: '22222222-2222-2222-2222-222222222221',
        score_delta: {
          overall_delta: 11,
          skills_delta: 12,
          keywords_delta: 5,
          experience_delta: 5,
          education_delta: 0,
          quality_delta: 0,
          newly_matched_skills: ['AWS Cloud Architecture'],
          resolved_missing_skills: ['AWS Cloud Architecture']
        }
      }
    });

    render(
      <MemoryRouter initialEntries={['/analysis/22222222-2222-2222-2222-222222222221']}>
        <Routes>
          <Route path="/analysis/:id" element={<AnalysisResult />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument();
    });

    // Verify Re-evaluate button is present
    const reEvalBtn = screen.getByRole('button', { name: /Re-evaluate Resume/i });
    expect(reEvalBtn).toBeInTheDocument();
    fireEvent.click(reEvalBtn);

    // Dialog appears
    await waitFor(() => {
      expect(screen.getByText(/Re-evaluate Resume Revision/i)).toBeInTheDocument();
    });

    // Select resume and click Compute Score Delta
    const submitBtn = screen.getByRole('button', { name: /Compute Score Delta/i });
    fireEvent.click(submitBtn);

    // Expect ScoreDeltaModal to appear
    await waitFor(() => {
      expect(screen.getByText(/Revision Comparison/i)).toBeInTheDocument();
      expect(screen.getByText(/\+11% Match Improvement/i)).toBeInTheDocument();
      expect(screen.getByText(/Gaps Resolved/i)).toBeInTheDocument();
    });
  });
});
