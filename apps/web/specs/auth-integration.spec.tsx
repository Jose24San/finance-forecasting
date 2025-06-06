import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../src/app/(auth)/_components/login-form';
import { SessionProvider } from '../src/components/providers/session-provider';
import { useAuthStore } from '../src/store/auth';
import { supabase } from '../src/lib/supabase';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

jest.mock('../src/components/client-only', () => ({
  ClientOnly: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockPush = jest.fn();

// Test component that wraps LoginForm with SessionProvider
const TestApp = () => (
  <SessionProvider>
    <LoginForm />
  </SessionProvider>
);

describe('Auth Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset auth store
    useAuthStore.setState({
      user: null,
      isLoading: true,
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });
  });

  it('should complete full login flow successfully', async () => {
    const user = userEvent.setup();

    // Mock no initial session
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    // Mock successful login
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: {
        access_token: 'token',
        user: { id: '123', email: 'test@example.com' },
      },
    };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: mockAuthData,
      error: null,
    });

    render(<TestApp />);

    // Wait for SessionProvider to initialize
    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    // Verify form is rendered
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill and submit form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Verify login was called
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Verify redirect to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    // Verify auth store was updated
    const { user: storeUser } = useAuthStore.getState();
    expect(storeUser).toEqual(mockAuthData.user);
  });

  it('should handle login failure gracefully', async () => {
    const user = userEvent.setup();

    // Mock no initial session
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    // Mock login failure
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Invalid login credentials'),
    });

    render(<TestApp />);

    // Wait for SessionProvider to initialize
    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    // Fill and submit form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Verify error is shown
    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });

    // Verify no redirect occurred
    expect(mockPush).not.toHaveBeenCalled();

    // Verify auth store was not updated with user
    const { user: storeUser } = useAuthStore.getState();
    expect(storeUser).toBeNull();
  });

  it('should initialize with existing session', async () => {
    // Mock existing session
    const mockSession = {
      user: { id: '123', email: 'test@example.com' },
      access_token: 'existing-token',
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    });

    render(<TestApp />);

    // Wait for SessionProvider to initialize
    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    // Verify auth store was updated with existing user
    await waitFor(() => {
      const { user: storeUser, isLoading } = useAuthStore.getState();
      expect(storeUser).toEqual(mockSession.user);
      expect(isLoading).toBe(false);
    });
  });

  it('should handle auth state changes', async () => {
    let authStateCallback: (event: string, session: any) => void;

    // Mock auth state change listener
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
      (callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      }
    );

    // Mock no initial session
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    render(<TestApp />);

    // Wait for initialization
    await waitFor(() => {
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    // Simulate sign in event
    const mockSession = {
      user: { id: '456', email: 'newuser@example.com' },
      access_token: 'new-token',
    };

    authStateCallback!('SIGNED_IN', mockSession);

    // Verify auth store was updated
    await waitFor(() => {
      const { user: storeUser } = useAuthStore.getState();
      expect(storeUser).toEqual(mockSession.user);
    });

    // Simulate sign out event
    authStateCallback!('SIGNED_OUT', null);

    // Verify auth store was cleared
    await waitFor(() => {
      const { user: storeUser } = useAuthStore.getState();
      expect(storeUser).toBeNull();
    });
  });
});
