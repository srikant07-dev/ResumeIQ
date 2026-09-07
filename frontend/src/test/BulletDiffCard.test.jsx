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

  it('renders recommendation title, priority badge, and diff sections', () => {
    render(<BulletDiffCard rec={mockRec} index={0} onCopy={vi.fn()} isCopied={false} />);

    expect(screen.getByText('Add Concrete Database Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('HIGH priority')).toBeInTheDocument();
    expect(screen.getByText('BEFORE (GENERIC / UNQUANTIFIED)')).toBeInTheDocument();
    expect(screen.getByText(/AFTER \(METRIC & KEYWORD GROUNDED\)/)).toBeInTheDocument();
    expect(screen.getByText(/reducing p99 latency by 38%/)).toBeInTheDocument();
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
