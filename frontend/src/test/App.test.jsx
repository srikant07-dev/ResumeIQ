import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Frontend App Routing & Landing Test', () => {
  it('renders landing page headline and call-to-action', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Know exactly how well your resume matches the job/i);
    expect(screen.getByRole('link', { name: /Analyze My Resume/i })).toBeInTheDocument();
    expect(screen.getByText(/RESUME_EVALUATION_ENGINE: ONLINE/i)).toBeInTheDocument();
  });
});
