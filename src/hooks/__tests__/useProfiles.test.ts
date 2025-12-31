import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTrainees, useProfile } from '../useProfiles';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'trainer-1' },
    isTrainer: true,
    isTrainee: false,
  })),
}));

const mockProfiles = [
  {
    id: 'trainer-1',
    name: 'John Trainer',
    role: 'trainer',
    email: 'trainer@test.com',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'trainee-1',
    name: 'Jane Trainee',
    role: 'trainee',
    email: 'trainee@test.com',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'trainee-2',
    name: 'Bob Trainee',
    role: 'trainee',
    email: 'bob@test.com',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useTrainees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch only assigned trainee profiles for the trainer', async () => {
    const mockAssignments = [
      { trainee: mockProfiles.find(p => p.id === 'trainee-1') },
      { trainee: mockProfiles.find(p => p.id === 'trainee-2') },
    ];
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockAssignments, error: null }),
      }),
    } as any);

    const { result } = renderHook(() => useTrainees(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.every(p => p.role === 'trainee')).toBe(true);
  });

  it('should return empty array when no trainees assigned', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as any);

    const { result } = renderHook(() => useTrainees(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(0);
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch trainees');
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }),
    } as any);

    const { result } = renderHook(() => useTrainees(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch profile by user id', async () => {
    const profile = mockProfiles[0];
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useProfile('trainer-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(profile);
  });

  it('should return null for non-existent user', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useProfile('non-existent-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it('should not fetch when userId is undefined', async () => {
    const fromMock = vi.fn();
    vi.mocked(supabase.from).mockImplementation(fromMock);

    const { result } = renderHook(() => useProfile(undefined), {
      wrapper: createWrapper(),
    });

    // Should not trigger a query
    expect(result.current.isLoading).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch profile');
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useProfile('trainer-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
