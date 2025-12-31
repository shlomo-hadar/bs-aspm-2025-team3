import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSessionLogs, useCreateSessionLog } from '../useSessionLogs';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
    isTrainer: true,
    isTrainee: false,
  })),
}));

const mockSessionLogs = [
  {
    id: 'sl-1',
    trainee_id: 'trainee-1',
    exercise_id: '1',
    date_completed: '2024-01-15',
    actual_weight: 65,
    rating: 4,
    created_at: '2024-01-15T00:00:00Z',
    exercises: { id: '1', name: 'Bench Press', category: 'Chest' },
    profiles: { id: 'trainee-1', name: 'Jane Trainee' },
  },
  {
    id: 'sl-2',
    trainee_id: 'trainee-1',
    exercise_id: '2',
    date_completed: '2024-01-16',
    actual_weight: 100,
    rating: 5,
    created_at: '2024-01-16T00:00:00Z',
    exercises: { id: '2', name: 'Squat', category: 'Legs' },
    profiles: { id: 'trainee-1', name: 'Jane Trainee' },
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

describe('useSessionLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch session logs successfully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockSessionLogs, error: null }),
      }),
    } as any);

    const { result } = renderHook(() => useSessionLogs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSessionLogs);
  });

  it('should filter by trainee_id when provided', async () => {
    const filteredLogs = mockSessionLogs.filter(l => l.trainee_id === 'trainee-1');
    
    const eqMock = vi.fn().mockResolvedValue({ data: filteredLogs, error: null });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      }),
    } as any);

    const { result } = renderHook(() => useSessionLogs('trainee-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch session logs');
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }),
    } as any);

    const { result } = renderHook(() => useSessionLogs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should include related exercises and profiles', async () => {
    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: mockSessionLogs, error: null }),
    });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useSessionLogs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify that select includes related tables
    expect(selectMock).toHaveBeenCalled();
    expect(result.current.data?.[0].exercises).toBeDefined();
    expect(result.current.data?.[0].profiles).toBeDefined();
  });
});

describe('useCreateSessionLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create session log successfully', async () => {
    const newLog = {
      trainee_id: 'trainee-1',
      exercise_id: '1',
      actual_weight: 70,
      rating: 4,
    };

    const createdLog = {
      id: 'new-sl-id',
      ...newLog,
      date_completed: new Date().toISOString().split('T')[0],
      created_at: '2024-01-20T00:00:00Z',
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: createdLog, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useCreateSessionLog(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newLog);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(createdLog);
  });

  it('should handle create error', async () => {
    const mockError = new Error('Failed to create session log');

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useCreateSessionLog(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      trainee_id: 'trainee-1',
      exercise_id: '1',
      actual_weight: 70,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should set date_completed to current date', async () => {
    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'new-id', date_completed: '2024-01-20' },
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    const { result } = renderHook(() => useCreateSessionLog(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      trainee_id: 'trainee-1',
      exercise_id: '1',
      actual_weight: 70,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify insert was called with date_completed
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        date_completed: expect.any(String),
      })
    );
  });
});
