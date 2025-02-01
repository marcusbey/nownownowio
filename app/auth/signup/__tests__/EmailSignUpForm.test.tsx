import { render, screen, waitFor } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailSignUpForm } from '../EmailSignUpForm';
import { signIn } from 'next-auth/react';

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('EmailSignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (): RenderResult & {
    emailInput: HTMLElement;
    submitButton: HTMLElement;
  } => {
    render(<EmailSignUpForm />);
    return {
      emailInput: screen.getByLabelText(/email address/i),
      submitButton: screen.getByRole('button', { name: /continue with email/i }),
    };
  };

  describe('Form Validation', () => {
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
  });

  describe('Magic Link Flow', () => {
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
  });

  describe('UI States', () => {
    it('shows loading state while sending', async () => {
      const mockSignIn = signIn as jest.Mock;
      mockSignIn.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      const { emailInput, submitButton } = setup();
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });

    it('disables form during submission', async () => {
      const mockSignIn = signIn as jest.Mock;
      mockSignIn.mockImplementationOnce(() => new Promise(() => {}));

      const { emailInput, submitButton } = setup();
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('shows error message on network failure', async () => {
      const mockSignIn = signIn as jest.Mock;
      mockSignIn.mockRejectedValueOnce(new Error('Network error'));

      const { emailInput, submitButton } = setup();
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      expect(await screen.findByText(/unexpected error occurred/i)).toBeInTheDocument();
    });

    it('clears previous error when submitting again', async () => {
      const mockSignIn = signIn as jest.Mock;
      mockSignIn.mockRejectedValueOnce(new Error('Network error'));
      mockSignIn.mockResolvedValueOnce({ error: null });

      const { emailInput, submitButton } = setup();
      
      // First attempt - should fail
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);
      expect(await screen.findByText(/unexpected error occurred/i)).toBeInTheDocument();

      // Second attempt - should succeed and clear error
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.queryByText(/unexpected error occurred/i)).not.toBeInTheDocument();
      });
    });
  });
});
