import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../src/store/auth';
import type { User } from '@supabase/supabase-js';

// Mock user data for testing
const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
  role: 'authenticated',
} as User;

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isLoading: true,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should set user correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should clear user when set to null', () => {
    const { result } = renderHook(() => useAuthStore());

    // First set a user
    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);

    // Then clear the user
    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.user).toBeNull();
  });

  it('should set loading state correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    // Initially loading should be true
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle multiple state updates correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(false);
      result.current.setUser(mockUser);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });
});
