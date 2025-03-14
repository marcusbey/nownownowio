import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailForm } from '../EmailForm';
import { signIn } from 'next-auth/react';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('Email Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    render(<EmailForm />);
    return {
      emailInput: screen.getByPlaceholderText(/enter your email/i),
      submitButton: screen.getByRole('button', { name: /continue with email/i }),
    };
  };

  it('validates email format', async () => {
    const { emailInput, submitButton } = setup();
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('requires email to be entered', async () => {
    const { submitButton } = setup();
    
    await userEvent.click(submitButton);

    expect(await screen.findByText(/please enter your email address/i)).toBeInTheDocument();
  });

  it('handles successful magic link sending', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ error: null });

    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(mockSignIn).toHaveBeenCalledWith('email', {
      email: 'test@example.com',
      redirect: false,
      callbackUrl: '/for-you',
    });

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/we've sent a magic link/i)).toBeInTheDocument();
    });
  });

  it('handles magic link sending failure', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ error: 'SendError' });

    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/failed to send magic link/i)).toBeInTheDocument();
  });

  it('shows loading state while sending', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockImplementationOnce(async () => new Promise(() => {})); // Never resolves

    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });
});
