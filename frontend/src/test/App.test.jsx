import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Frontend App Boot Test', () => {
  it('renders ResumeIQ headline and brand elements', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Know exactly how well your resume matches the job/i);
    expect(screen.getByText(/SYSTEM: READY/i)).toBeInTheDocument();
    expect(screen.getByText(/PHASE_0_BOOT_OK/i)).toBeInTheDocument();
  });
});
