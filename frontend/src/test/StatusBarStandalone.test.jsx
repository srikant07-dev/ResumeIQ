import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import StatusBar from '../components/layout/StatusBar';

describe('StatusBar Standalone Component Testing', () => {
  it('renders live status indicators, route context, and auth badge', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/analyze']}>
          <StatusBar activeState="ACTIVE" />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/STATUS: ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/PIPELINE: HYBRID_EVAL_V2/i)).toBeInTheDocument();
    expect(screen.getByText(/ROUTE: \/analyze/i)).toBeInTheDocument();
    expect(screen.getByText(/REGION: ap-south-1/i)).toBeInTheDocument();
    expect(screen.getByText(/RTT:/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTH_VERIFIED/i)).toBeInTheDocument();
  });
});
