import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import CommandMenu from '../components/common/CommandMenu';

describe('CommandMenu Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <MemoryRouter>
        <CommandMenu isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders command palette when isOpen is true', () => {
    render(
      <MemoryRouter>
        <CommandMenu isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type a command or search actions/i)).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Start New Analysis')).toBeInTheDocument();
  });

  it('filters commands as user types in search box', () => {
    render(
      <MemoryRouter>
        <CommandMenu isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Type a command or search actions/i);
    fireEvent.change(input, { target: { value: 'Settings' } });

    expect(screen.getByText('System Settings & Profile')).toBeInTheDocument();
    expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <CommandMenu isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalled();
  });
});
