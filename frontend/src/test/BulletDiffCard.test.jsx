import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BulletDiffCard from '../components/analysis/BulletDiffCard';

describe('BulletDiffCard Component', () => {
  const mockRec = {
    title: 'Add Concrete Database Performance Metrics',
    description: 'Quantify PostgreSQL indexing, query optimization, and latency achievements.',
    priority: 'HIGH',
    suggested_action: 'Engineered 12 PostgreSQL indexes and cached high-traffic queries, reducing p99 latency by 38%.',
    evidence: 'Strong SQL and database optimization background required for high-volume transactions.'
  };

  it('renders recommendation title, priority badge, and recommended action card when before_bullet is not present', () => {
    render(<BulletDiffCard rec={mockRec} index={0} onCopy={vi.fn()} isCopied={false} />);

    expect(screen.getByText('Add Concrete Database Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('HIGH priority')).toBeInTheDocument();
    expect(screen.getByText('RECOMMENDED ACTION')).toBeInTheDocument();
    expect(screen.getByText(/reducing p99 latency by 38%/)).toBeInTheDocument();
  });

  it('renders before and after diff when before_bullet is present', () => {
    const recWithBefore = {
      ...mockRec,
      before_bullet: 'Wrote database queries.'
    };
    render(<BulletDiffCard rec={recWithBefore} index={0} onCopy={vi.fn()} isCopied={false} />);

    expect(screen.getByText('BEFORE (IDENTIFIED IN RESUME)')).toBeInTheDocument();
    expect(screen.getByText('Wrote database queries.')).toBeInTheDocument();
    expect(screen.getByText('OPTIMIZED REVISION')).toBeInTheDocument();
  });

  it('triggers onCopy handler when clicking Copy Action button', () => {
    const handleCopy = vi.fn();
    render(<BulletDiffCard rec={mockRec} index={0} onCopy={handleCopy} isCopied={false} />);

    const copyBtn = screen.getByRole('button', { name: /Copy Action/i });
    fireEvent.click(copyBtn);

    expect(handleCopy).toHaveBeenCalledWith(mockRec.suggested_action, 0);
  });

  it('displays Copied state when isCopied is true', () => {
    render(<BulletDiffCard rec={mockRec} index={0} onCopy={vi.fn()} isCopied={true} />);

    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('toggles evidence accordion on click', () => {
    render(<BulletDiffCard rec={mockRec} index={0} onCopy={vi.fn()} isCopied={false} />);

    const toggleBtn = screen.getByRole('button', { name: /Target Job Citation & Grounding/i });
    expect(screen.queryByText(/Strong SQL and database optimization background/)).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Strong SQL and database optimization background/)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.queryByText(/Strong SQL and database optimization background/)).not.toBeInTheDocument();
  });
});
