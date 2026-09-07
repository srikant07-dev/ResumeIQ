import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

describe('Always-On Mono Status Bar & Layout Testing', () => {
  it('renders always-on mono status bar with live system indicators', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppLayout />
        </MemoryRouter>
      </AuthProvider>
    );

    // Status bar signature elements
    expect(screen.getByText(/STATUS: ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/PIPELINE: HYBRID_EVAL_V2/i)).toBeInTheDocument();
    expect(screen.getByText(/REGION: ap-south-1/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTH_VERIFIED/i)).toBeInTheDocument();
  });

  it('renders navigation links across sidebar', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppLayout />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    const newAnalysisLinks = screen.getAllByRole('link', { name: /New Analysis/i });
    expect(newAnalysisLinks.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /History/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });
});
