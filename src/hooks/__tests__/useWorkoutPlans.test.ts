import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useWorkoutPlans,
  usePendingWorkouts,
  useCreateWorkoutPlan,
  useUpdateWorkoutStatus,
  useDeleteWorkoutPlan,
} from '../useWorkoutPlans';
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

const mockWorkoutPlans = [
  {
    id: 'wp-1',
    trainee_id: 'trainee-1',
    exercise_id: '1',
    assigned_sets: 3,
    assigned_reps: 10,
    assigned_weight: 60,
    status: 'pending',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    exercises: { id: '1', name: 'Bench Press', category: 'Chest' },
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

describe('useWorkoutPlans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock channel subscription
    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    } as any);
    vi.mocked(supabase.removeChannel).mockReturnValue(Promise.resolve('ok'));
  });

  it('should fetch workout plans successfully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockWorkoutPlans, error: null }),
      }),
    } as any);

    const { result } = renderHook(() => useWorkoutPlans(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockWorkoutPlans);
  });

  it('should filter by trainee_id when provided', async () => {
    const eqMock = vi.fn().mockResolvedValue({ data: mockWorkoutPlans, error: null });
    const orderMock = vi.fn().mockReturnValue({ eq: eqMock });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: orderMock,
      }),
    } as any);

    const { result } = renderHook(() => useWorkoutPlans('trainee-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch workout plans');
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }),
    } as any);

    const { result } = renderHook(() => useWorkoutPlans(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('usePendingWorkouts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    } as any);
    vi.mocked(supabase.removeChannel).mockReturnValue(Promise.resolve('ok'));
  });

  it('should fetch only pending workouts', async () => {
    const pendingWorkouts = mockWorkoutPlans.filter(w => w.status === 'pending');
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: pendingWorkouts, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => usePendingWorkouts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(pendingWorkouts);
  });
});

describe('useCreateWorkoutPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create workout plan successfully', async () => {
    const newPlan = {
      trainee_id: 'trainee-1',
      exercise_id: '1',
      assigned_sets: 3,
      assigned_reps: 10,
      assigned_weight: 60,
    };

    const createdPlan = {
      id: 'new-wp-id',
      ...newPlan,
      status: 'pending',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: createdPlan, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useCreateWorkoutPlan(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newPlan);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(createdPlan);
  });
});

describe('useUpdateWorkoutStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update workout status successfully', async () => {
    const updatedPlan = {
      ...mockWorkoutPlans[0],
      status: 'done',
      updated_at: '2024-01-02T00:00:00Z',
    };

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedPlan, error: null }),
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useUpdateWorkoutStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'wp-1', status: 'done' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.status).toBe('done');
  });
});

describe('useDeleteWorkoutPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete workout plan successfully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any);

    const { result } = renderHook(() => useDeleteWorkoutPlan(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('wp-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle delete error', async () => {
    const mockError = new Error('Failed to delete');

    vi.mocked(supabase.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      }),
    } as any);

    const { result } = renderHook(() => useDeleteWorkoutPlan(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('wp-1');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
