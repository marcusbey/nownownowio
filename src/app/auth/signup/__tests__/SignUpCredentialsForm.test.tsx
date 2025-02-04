import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignUpCredentialsForm } from '../SignUpCredentialsForm';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock the useMutation hook
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutateAsync: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('SignUpCredentialsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be accessible', async () => {
    const { container } = render(<SignUpCredentialsForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  const setup = () => {
    render(<SignUpCredentialsForm />);
    return {
      nameInput: screen.getByLabelText(/name/i),
      emailInput: screen.getByLabelText(/email/i),
      passwordInput: screen.getByLabelText(/^password$/i),
      verifyPasswordInput: screen.getByLabelText(/verify password/i),
      submitButton: screen.getByRole('button', { name: /sign up/i }),
    };
  };

  it('renders all form fields', () => {
    const { nameInput, emailInput, passwordInput, verifyPasswordInput } = setup();
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(verifyPasswordInput).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const { submitButton } = setup();
    await userEvent.click(submitButton);

    expect(await screen.findByText(/name.*required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email.*required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password.*required/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const { emailInput, submitButton } = setup();
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    const { passwordInput, submitButton } = setup();
    await userEvent.type(passwordInput, 'weak');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('validates password match', async () => {
    const { passwordInput, verifyPasswordInput, submitButton } = setup();
    await userEvent.type(passwordInput, 'StrongPass123!');
    await userEvent.type(verifyPasswordInput, 'DifferentPass123!');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('handles successful form submission', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ success: true });
    vi.mock('@tanstack/react-query', () => ({
      useMutation: () => ({
        mutateAsync: mockMutateAsync,
        isLoading: false,
        error: null,
      }),
    }));

    const { nameInput, emailInput, passwordInput, verifyPasswordInput, submitButton } = setup();
    
    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'StrongPass123!');
    await userEvent.type(verifyPasswordInput, 'StrongPass123!');
    
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongPass123!',
        verifyPassword: 'StrongPass123!',
      });
    });
  });

  it('handles server errors', async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Server error'));
    vi.mock('@tanstack/react-query', () => ({
      useMutation: () => ({
        mutateAsync: mockMutateAsync,
        isLoading: false,
        error: new Error('Server error'),
      }),
    }));

    const { nameInput, emailInput, passwordInput, verifyPasswordInput, submitButton } = setup();
    
    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'StrongPass123!');
    await userEvent.type(verifyPasswordInput, 'StrongPass123!');
    
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create account/i)).toBeInTheDocument();
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('shows field-level validation errors', async () => {
    const { nameInput, emailInput, passwordInput, submitButton } = setup();
    
    // Test empty fields
    await userEvent.click(submitButton);
    expect(await screen.findByText(/name.*required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email.*required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password.*required/i)).toBeInTheDocument();

    // Test invalid email
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();

    // Test short name
    await userEvent.type(nameInput, 'a');
    await userEvent.click(submitButton);
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();

    // Test weak password
    await userEvent.type(passwordInput, 'weak');
    await userEvent.click(submitButton);
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('maintains form state during validation errors', async () => {
    const { nameInput, emailInput, passwordInput, submitButton } = setup();
    
    const testName = 'Test User';
    const testEmail = 'invalid-email';
    
    await userEvent.type(nameInput, testName);
    await userEvent.type(emailInput, testEmail);
    await userEvent.click(submitButton);

    // Verify form maintains values after validation error
    expect(nameInput).toHaveValue(testName);
    expect(emailInput).toHaveValue(testEmail);
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    vi.mock('@tanstack/react-query', () => ({
      useMutation: () => ({
        mutateAsync: vi.fn(),
        isLoading: true,
        error: null,
      }),
    }));

    const { submitButton } = setup();
    expect(submitButton).toBeDisabled();
  });
});
