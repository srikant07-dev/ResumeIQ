import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';

describe('Auth Views Testing', () => {
  it('renders Login card with email and password inputs', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LAUNCH DEMO MODE/i })).toBeInTheDocument();
  });

  it('renders Register card with name, email and password', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });
});
