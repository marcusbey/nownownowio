import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MagicLinkForm } from '../MagicLinkForm';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

interface MagicLinkValidationProps {
  token: string;
  email: string;
}

function MagicLinkValidation({ token, email }: MagicLinkValidationProps) {
  // Mock component for testing token validation
  return null;
}

describe('Magic Link Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    render(<MagicLinkForm />);
    return {
      emailInput: screen.getByLabelText(/email/i),
      submitButton: screen.getByRole('button', { name: /continue with email/i }),
    };
  };

  describe('New Email Registration', () => {
    it('handles new email registration flow', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ error: null });

    const { emailInput, submitButton } = setup();
    const newEmail = 'new.user@example.com';

    await userEvent.type(emailInput, newEmail);
    await userEvent.click(submitButton);

    expect(mockSignIn).toHaveBeenCalledWith('email', {
      email: newEmail,
      redirect: false,
    });

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  });

  describe('Existing Email Handling', () => {
    it('shows sign-in modal for existing email', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ 
      error: 'exists',
      email: 'existing@example.com'
    });

    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'existing@example.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with password/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
    });
  });

    it('handles password sign-in option', async () => {
      const mockSignIn = signIn as jest.Mock;
      mockSignIn.mockResolvedValueOnce({ 
        error: 'exists',
        email: 'existing@example.com',
        hasPassword: true
      });

      const { emailInput, submitButton } = setup();
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/continue with password/i)).toBeInTheDocument();
        expect(screen.getByText(/or use another method/i)).toBeInTheDocument();
      });
    });

    it('handles OAuth provider options', async () => {
      const mockSignIn = signIn as jest.Mock;
      mockSignIn.mockResolvedValueOnce({ 
        error: 'exists',
        email: 'existing@example.com',
        providers: ['google', 'twitter']
      });

      const { emailInput, submitButton } = setup();
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
        expect(screen.getByText(/continue with twitter/i)).toBeInTheDocument();
      });
    });
  });

  describe('Magic Link Validation States', () => {
    it('handles valid magic link for new account', async () => {
      render(<MagicLinkValidation token="valid-token" email="new@example.com" />);
      
      await waitFor(() => {
        expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
      });
      
      const router = useRouter();
      expect(router.push).toHaveBeenCalledWith('/for-you');
    });

    it('handles valid magic link for existing account', async () => {
      render(<MagicLinkValidation token="valid-token" email="existing@example.com" />);
      
      await waitFor(() => {
        expect(screen.getByText(/signed in successfully/i)).toBeInTheDocument();
      });
      
      const router = useRouter();
      expect(router.push).toHaveBeenCalledWith('/for-you');
    });

    it('handles expired magic link', async () => {
      render(<MagicLinkValidation token="expired-token" email="test@example.com" />);
      
      await waitFor(() => {
        expect(screen.getByText(/link has expired/i)).toBeInTheDocument();
        expect(screen.getByText(/request new link/i)).toBeInTheDocument();
      });
    });

    it('handles already used magic link', async () => {
      render(<MagicLinkValidation token="used-token" email="test@example.com" />);
      
      await waitFor(() => {
        expect(screen.getByText(/link already used/i)).toBeInTheDocument();
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });

    it('handles tampered magic link', async () => {
      render(<MagicLinkValidation token="invalid-token" email="test@example.com" />);
      
      await waitFor(() => {
        expect(screen.getByText(/security warning/i)).toBeInTheDocument();
        expect(screen.getByText(/link appears to be invalid/i)).toBeInTheDocument();
      });
    });

    it('handles deleted account magic link', async () => {
      render(<MagicLinkValidation token="valid-token" email="deleted@example.com" />);
      
      await waitFor(() => {
        expect(screen.getByText(/account not found/i)).toBeInTheDocument();
        expect(screen.getByText(/recover your account/i)).toBeInTheDocument();
      });
    });
  });

  describe('Input Validation', () => {
    it('handles invalid email format', async () => {
    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
  });

  it('handles magic link errors', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ 
      error: 'send-error',
      message: 'Failed to send magic link'
    });

    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send magic link/i)).toBeInTheDocument();
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });
  });

  it('handles rate limiting', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ 
      error: 'rate-limit',
      message: 'Too many requests'
    });

    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      expect(screen.getByText(/please try again later/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });

  it('maintains form state after failed submission', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ error: 'send-error' });

    const { emailInput, submitButton } = setup();
    const testEmail = 'test@example.com';
    
    await userEvent.type(emailInput, testEmail);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toHaveValue(testEmail);
      expect(submitButton).not.toBeDisabled();
    });
  });
});

});
