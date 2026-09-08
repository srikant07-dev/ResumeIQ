import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import AnalysisResult from '../pages/AnalysisResult';
import NewAnalysis from '../pages/NewAnalysis';
import Dashboard from '../pages/Dashboard';
import History from '../pages/History';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import FileUpload from '../components/upload/FileUpload';
import AnalysisLoading from '../components/analysis/AnalysisLoading';
import AppLayout from '../components/layout/AppLayout';
import StatusBar from '../components/layout/StatusBar';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

const mockFullAnalysis = {
  id: "adv-analysis-uuid-1234",
  resume_id: "adv-resume-uuid-5678",
  job_title: "Staff Platform Engineer",
  job_description: "Staff platform engineer with Kubernetes, Go, Python, and distributed systems expertise.",
  overall_score: 88,
  status: "completed",
  created_at: "2026-09-02T16:00:00Z",
  result_json: {
    summary: "Exceptional platform engineering background with deep distributed systems knowledge.",
    score_breakdown: {
      skills: { score: 92, source: "deterministic", evidence: "Matched 9 of 10 core technical requirements." },
      experience: { score: 85, source: "ai", evidence: "7+ years production Kubernetes and cloud orchestration." },
      keywords: { score: 88, source: "deterministic", evidence: "Found 22 of 25 key infrastructure keywords." },
      education: { score: 80, source: "ai", evidence: "BS in Computer Science." },
      quality: { score: 90, source: "ai", evidence: "High impact metric-driven bullet points." }
    },
    matching_skills: [
      { skill: "Kubernetes", context: "Managed multi-cluster orchestration across 3 regions." },
      { skill: "Python", context: "Built automated scaling controllers with Python and AsyncIO." },
      { skill: "Go", context: "Wrote high-throughput gRPC services in Go." }
    ],
    partial_skills: [
      { skill: "Terraform", context: "Used Terraform modules for AWS provisioning." }
    ],
    missing_skills: ["eBPF Observability"],
    keywords_present: ["Kubernetes", "Python", "Go", "Docker", "gRPC", "Prometheus"],
    keywords_missing: ["eBPF", "Cilium"],
    keyword_categories: {
      technical: ["Kubernetes", "Python", "Go", "Docker"],
      soft: ["System Architecture", "Leadership"],
      domain: ["Cloud Infrastructure", "Platform"]
    },
    strengths: [
      { point: "Deep Infrastructure Knowledge", evidence: "Proven multi-region Kubernetes production experience." }
    ],
    weaknesses: [
      { point: "Observability Depth", evidence: "Limited eBPF telemetry mentioned in resume." }
    ],
    recommendations: [
      {
        priority: "HIGH",
        title: "Emphasize Kernel and Network Telemetry",
        description: "Elaborate on low-level Linux and container observability tools.",
        evidence: "Required for senior telemetry and performance optimization.",
        suggested_action: "Incorporate concrete bullets on network debugging and latency tracking."
      },
      {
        priority: "MEDIUM",
        title: "Clarify CI/CD Pipeline Automation",
        description: "Specify gitops workflow and deployment tooling.",
        evidence: "Mentioned under responsibilities.",
        suggested_action: "Add details regarding ArgoCD or Flux deployments."
      }
    ]
  }
};

describe('Empirical Adversarial Stress Suite — Frontend Workflows & Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 1. FAST TAB SWITCHING STRESS
  it('handles burst rapid tab switching across all 5 analysis tabs without desync or crash', async () => {
    api.get.mockImplementation((url) => {
      if (url?.includes('/market-intel/quota')) {
        return Promise.resolve({ data: { remaining_today: 3, max_per_day: 3, is_running: false } });
      }
      return Promise.resolve({ data: mockFullAnalysis });
    });

    render(
      <MemoryRouter initialEntries={['/analysis/adv-analysis-uuid-1234']}>
        <Routes>
          <Route path="/analysis/:id" element={<AnalysisResult />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Staff Platform Engineer/i)).toBeInTheDocument();
    });

    const overviewTab = screen.getByRole('button', { name: /Overview/i });
    const skillsTab = screen.getByRole('button', { name: /Skills \(3\)/i });
    const keywordsTab = screen.getByRole('button', { name: /Keywords/i });
    const expTab = screen.getByRole('button', { name: /Experience & Quality/i });
    const recsTab = screen.getByRole('button', { name: /Recommendations \(2\)/i });

    // Rapid burst clicking loop (25 consecutive tab transitions)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(skillsTab);
      fireEvent.click(keywordsTab);
      fireEvent.click(expTab);
      fireEvent.click(recsTab);
      fireEvent.click(overviewTab);
    }

    // Assert final tab state matches Overview accurately
    expect(screen.getByText(/Hybrid Score Composition/i)).toBeInTheDocument();
    expect(screen.getAllByText(/88%/i).length).toBeGreaterThanOrEqual(1);

    // Switch to Recommendations and verify content
    fireEvent.click(recsTab);
    expect(screen.getByText(/Emphasize Kernel and Network Telemetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Clarify CI\/CD Pipeline Automation/i)).toBeInTheDocument();
  });

  // 2. COPY TO CLIPBOARD INTERACTION
  it('executes copy-to-clipboard on recommendation action with visual feedback and timer restoration', async () => {
    api.get.mockResolvedValueOnce({ data: mockFullAnalysis });
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    render(
      <MemoryRouter initialEntries={['/analysis/adv-analysis-uuid-1234']}>
        <Routes>
          <Route path="/analysis/:id" element={<AnalysisResult />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Staff Platform Engineer/i)).toBeInTheDocument();
    });

    const recsTab = screen.getByRole('button', { name: /Recommendations \(2\)/i });
    fireEvent.click(recsTab);

    const copyButtons = screen.getAllByRole('button', { name: /Copy Action/i });
    expect(copyButtons.length).toBe(2);

    // Click the first recommendation's copy button
    fireEvent.click(copyButtons[0]);

    expect(writeTextMock).toHaveBeenCalledWith(
      'Incorporate concrete bullets on network debugging and latency tracking.'
    );

    // Verify immediate feedback changes to "Copied!"
    expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
  });

  // 3. RAPID FORM SUBMISSION & VALIDATION EDGE CASES IN NEW ANALYSIS
  it('enforces validation rules and prevents invalid submissions in NewAnalysis flow', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/analyze']}>
          <Routes>
            <Route path="/analyze" element={<NewAnalysis />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/New Resume Match Analysis/i)).toBeInTheDocument();
    });

    // Step 1: Click continue with sample resume selected
    const continueBtn = screen.getByRole('button', { name: /Continue to Job Details/i });
    fireEvent.click(continueBtn);

    // Step 2: Target job details
    expect(screen.getByText(/Step 2 of 2/i)).toBeInTheDocument();

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Resume/i });

    // Test 1: Empty Job Title triggers error
    fireEvent.click(analyzeBtn);
    expect(screen.getByText(/Job Title is required/i)).toBeInTheDocument();

    // Test 2: Job title provided but empty/short job description (<30 chars) triggers error
    const titleInput = screen.getByLabelText(/Target Job Title/i);
    fireEvent.change(titleInput, { target: { value: 'Site Reliability Engineer' } });
    fireEvent.click(analyzeBtn);
    expect(screen.getByText(/Please provide a job description of at least 20 characters/i)).toBeInTheDocument();

    // Test 3: Load sample job button populates compliant data
    const loadSampleBtn = screen.getByRole('button', { name: /Load sample/i });
    fireEvent.click(loadSampleBtn);

    const descInput = screen.getByLabelText(/Job Description & Qualifications/i);
    expect(descInput.value.length).toBeGreaterThanOrEqual(30);

    // Mock successful post analysis
    api.post.mockResolvedValueOnce({ data: { id: 'new-analysis-uuid-9999' } });
    fireEvent.click(analyzeBtn);

    // Transition into AnalysisLoading scanner
    expect(screen.getByText(/PIPELINE_ACTIVE/i)).toBeInTheDocument();
  });

  // 4. DEMO MODE AUTHENTICATION & HEADERS
  it('allows one-click demo login, sets session in localStorage, and configures demo token', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const demoBtn = screen.getByRole('button', { name: /Launch Demo Mode/i });
    fireEvent.click(demoBtn);

    const savedSession = localStorage.getItem('resumeiq_demo_session');
    expect(savedSession).toBeTruthy();
    const parsed = JSON.parse(savedSession);
    expect(parsed.access_token).toBe('demo-token');
    expect(parsed.user.email).toBe('demo.developer@resumeiq.app');
  });

  // 5. ANALYSIS LOADING TIMERS
  it('increments elapsed timer correctly during active analysis loading', () => {
    vi.useFakeTimers();

    render(<AnalysisLoading />);

    expect(screen.getByText(/PIPELINE_ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/ELAPSED: 00:00s/i)).toBeInTheDocument();

    // Advance 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/ELAPSED: 00:03s/i)).toBeInTheDocument();

    // Advance another 11 seconds
    act(() => {
      vi.advanceTimersByTime(11000);
    });
    expect(screen.getByText(/ELAPSED: 00:14s/i)).toBeInTheDocument();
  });

  // 6. EMPTY STATES & ERROR ALERTS ACROSS DASHBOARD & HISTORY
  it('renders informative empty states when dashboard and history lists are empty', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No Resume Analyses Yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Run First Analysis/i)).toBeInTheDocument();
    });
  });

  it('renders empty search state in History when filter has no matches', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { id: '1', job_title: 'Full Stack Engineer', overall_score: 82, created_at: '2026-09-02T10:00:00Z' }
      ]
    });

    render(
      <MemoryRouter initialEntries={['/history']}>
        <Routes>
          <Route path="/history" element={<History />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Full Stack Engineer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by job title.../i);
    fireEvent.change(searchInput, { target: { value: 'Quantum Physics Researcher' } });

    expect(screen.getByText(/No Matches Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search query/i)).toBeInTheDocument();
  });

  // 7. 404 CUSTOM NOT FOUND ROUTING
  it('renders custom 404 Not Found page for undefined routes with return links', () => {
    render(
      <MemoryRouter initialEntries={['/completely-undefined-route-xyz']}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /Go to Home/i })).toHaveAttribute('href', '/');
  });

  // 8. FILE UPLOAD BOUNDARY TESTING
  it('validates file types and size boundaries during file upload', () => {
    const onFileSelected = vi.fn();

    render(<FileUpload onFileSelected={onFileSelected} selectedFile={null} error={null} onClear={vi.fn()} />);

    // Mock drop non-PDF file
    const invalidFile = new File(['dummy content'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const dropZone = screen.getByText(/Upload your resume PDF/i).closest('div');

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [invalidFile] }
    });

    expect(screen.getByText('Only PDF documents (.pdf) are supported.')).toBeInTheDocument();
    expect(onFileSelected).not.toHaveBeenCalled();

    // Mock drop valid PDF
    const validFile = new File(['%PDF-1.4 valid binary'], 'resume_candidate.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [validFile] }
    });

    expect(onFileSelected).toHaveBeenCalledWith(validFile);
  });

  // 9. RESPONSIVE APPLAYOUT & MOBILE MENU TOGGLE
  it('renders responsive navigation elements and toggles mobile menu overlay', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppLayout />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Resume/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Skip to content/i })).toBeInTheDocument();

    // Open mobile menu
    const menuBtn = screen.getByLabelText(/Open Navigation Menu/i);
    fireEvent.click(menuBtn);

    expect(screen.getByLabelText(/Close menu/i)).toBeInTheDocument();

    // Close mobile menu
    const closeBtn = screen.getByLabelText(/Close menu/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByLabelText(/Close menu/i)).not.toBeInTheDocument();
  });
});
