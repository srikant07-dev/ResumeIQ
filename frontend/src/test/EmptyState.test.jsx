import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import EmptyState from '../components/common/EmptyState';
import { FileText, Sparkle } from '@phosphor-icons/react';

describe('EmptyState Component Testing', () => {
  it('renders title, description, and action button with link', () => {
    render(
      <MemoryRouter>
        <EmptyState
          icon={FileText}
          title="No Resumes Found"
          description="Upload your resume to begin evaluation."
          actionLabel="Upload Resume"
          actionTo="/analyze"
          actionIcon={Sparkle}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/No Resumes Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload your resume to begin evaluation/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Upload Resume/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/analyze');
  });

  it('triggers onAction callback when button is clicked without actionTo', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="Custom Action State"
        actionLabel="Retry Now"
        onAction={handleAction}
      />
    );

    const btn = screen.getByRole('button', { name: /Retry Now/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
