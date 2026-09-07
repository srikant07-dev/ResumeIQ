import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import HeroPreviewCard from '../components/landing/HeroPreviewCard';

describe('HeroPreviewCard Component', () => {
  it('renders initial role and score metrics', () => {
    render(
      <MemoryRouter>
        <HeroPreviewCard />
      </MemoryRouter>
    );

    expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument();
    expect(screen.getByText('84%')).toBeInTheDocument();
    expect(screen.getByText('Strong Match')).toBeInTheDocument();
    expect(screen.getByText('INTERACTIVE DEMO')).toBeInTheDocument();
  });

  it('switches roles when clicking role tabs', () => {
    render(
      <MemoryRouter>
        <HeroPreviewCard />
      </MemoryRouter>
    );

    const aiRoleTab = screen.getByRole('button', { name: /AI Platform Engineer/i });
    fireEvent.click(aiRoleTab);

    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText(/LLM Infrastructure Lab/)).toBeInTheDocument();
  });

  it('toggles simulation boost on click', () => {
    render(
      <MemoryRouter>
        <HeroPreviewCard />
      </MemoryRouter>
    );

    const simulateBtn = screen.getByRole('button', { name: /\+ Simulate/i });
    fireEvent.click(simulateBtn);

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('SIMULATED')).toBeInTheDocument();
  });
});
