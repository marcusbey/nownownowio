import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuthButtons } from '../OAuthButtons';
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

interface OAuthCallbackProps {
  provider: string;
  token: string;
  email?: string;
}

function OAuthCallback({ provider, token, email }: OAuthCallbackProps) {
  // Mock component for testing OAuth callback
  return null;
}

describe('OAuth Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    render(<OAuthButtons />);
    return {
      googleButton: screen.getByRole('button', { name: /continue with google/i }),
      twitterButton: screen.getByRole('button', { name: /continue with twitter/i }),
    };
  };

  describe('Provider Button Interactions', () => {
    it('initiates Google OAuth flow', async () => {
    const mockSignIn = signIn as jest.Mock;
    const { googleButton } = setup();

    await userEvent.click(googleButton);

    expect(mockSignIn).toHaveBeenCalledWith('google', {
      redirect: true,
      callbackUrl: '/for-you',
    });
  });

    it('initiates Twitter OAuth flow', async () => {
    const mockSignIn = signIn as jest.Mock;
    const { twitterButton } = setup();

    await userEvent.click(twitterButton);

    expect(mockSignIn).toHaveBeenCalledWith('twitter', {
      redirect: true,
      callbackUrl: '/for-you',
    });
  });

  });

  describe('OAuth Provider Window', () => {
    it('handles successful provider authorization', async () => {
      const mockWindow = {
        close: vi.fn(),
        opener: {
          postMessage: vi.fn()
        }
      };
      
      // Mock window.open
      global.window.open = vi.fn().mockReturnValue(mockWindow);
      
      const { googleButton } = setup();
      await userEvent.click(googleButton);
      
      // Simulate successful OAuth callback
      render(<OAuthCallback provider="google" token="valid-token" email="new@example.com" />);
      
      await waitFor(() => {
        expect(mockWindow.close).toHaveBeenCalled();
        const router = useRouter();
        expect(router.push).toHaveBeenCalledWith('/for-you');
      });
    });

    it('handles provider window closed by user', async () => {
      const mockWindow = {
        close: vi.fn(),
      };
      
      global.window.open = vi.fn().mockReturnValue(mockWindow);
      
      const { googleButton } = setup();
      await userEvent.click(googleButton);
      
      // Simulate window close event
      window.dispatchEvent(new Event('message', { data: { type: 'oauth-cancel' } }));
      
      await waitFor(() => {
        expect(screen.getByText(/authentication cancelled/i)).toBeInTheDocument();
      });
    });
  });

  describe('OAuth Callback Handling', () => {
    it('creates new account with provider data', async () => {
      render(
        <OAuthCallback 
          provider="google" 
          token="valid-token" 
          email="new@example.com" 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
        const router = useRouter();
        expect(router.push).toHaveBeenCalledWith('/for-you');
      });
    });

    it('links provider to existing account', async () => {
      render(
        <OAuthCallback 
          provider="google" 
          token="valid-token" 
          email="existing@example.com" 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/account linked successfully/i)).toBeInTheDocument();
        const router = useRouter();
        expect(router.push).toHaveBeenCalledWith('/for-you');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles OAuth errors', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ 
      error: 'OAuthSignin',
      message: 'Error signing in with OAuth provider'
    });

    const { googleButton } = setup();
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/error signing in/i)).toBeInTheDocument();
      expect(screen.getByText(/please try again/i)).toBeInTheDocument();
    });
  });

    it('handles account linking for existing email', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ 
      error: 'exists',
      email: 'existing@example.com',
      provider: 'credentials'
    });

    const { googleButton } = setup();
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/account already exists/i)).toBeInTheDocument();
      expect(screen.getByText(/link your accounts/i)).toBeInTheDocument();
    });
  });

    it('handles provider permission denied', async () => {
      render(
        <OAuthCallback 
          provider="google" 
          token="error-token" 
          email="test@example.com" 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });
    });

    it('handles provider token revocation', async () => {
      render(
        <OAuthCallback 
          provider="google" 
          token="revoked-token" 
          email="test@example.com" 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/access revoked/i)).toBeInTheDocument();
        expect(screen.getByText(/please sign in again/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI States', () => {
    it('shows loading state during OAuth flow', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    const { googleButton } = setup();
    await userEvent.click(googleButton);

    expect(googleButton).toBeDisabled();
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  it('handles rate limiting for OAuth providers', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ 
      error: 'rate-limit',
      message: 'Too many sign-in attempts'
    });

    const { googleButton } = setup();
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/too many sign-in attempts/i)).toBeInTheDocument();
      expect(screen.getByText(/please try again later/i)).toBeInTheDocument();
    });
  });

  it('handles OAuth callback validation', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ 
      error: 'callback',
      message: 'Invalid callback URL'
    });

    const { googleButton } = setup();
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid callback/i)).toBeInTheDocument();
      expect(screen.getByText(/please try again/i)).toBeInTheDocument();
    });
  });
});
