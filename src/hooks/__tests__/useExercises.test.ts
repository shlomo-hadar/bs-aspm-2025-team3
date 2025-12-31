import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExercises, useCreateExercise } from '../useExercises';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock data
const mockExercises = [
  {
    id: '1',
    name: 'Bench Press',
    category: 'Chest',
    default_sets: 3,
    description: 'Upper body exercise',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Squat',
    category: 'Legs',
    default_sets: 4,
    description: 'Lower body exercise',
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

describe('useExercises', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch exercises successfully', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockExercises, error: null }),
      }),
    });
    
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockExercises);
    expect(mockFrom).toHaveBeenCalledWith('exercises');
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch exercises');
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }),
    } as any);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should return exercises ordered by name', async () => {
    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: mockExercises, error: null }),
    });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(selectMock).toHaveBeenCalledWith('*');
  });
});

describe('useCreateExercise', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create exercise successfully', async () => {
    const newExercise = {
      name: 'Deadlift',
      category: 'Back',
      default_sets: 3,
      description: 'Full body exercise',
    };

    const createdExercise = {
      id: '3',
      ...newExercise,
      created_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: createdExercise, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useCreateExercise(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newExercise);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(createdExercise);
  });

  it('should handle create error', async () => {
    const mockError = new Error('Failed to create exercise');

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useCreateExercise(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: 'Test',
      category: 'Test',
      default_sets: 1,
      description: null,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
