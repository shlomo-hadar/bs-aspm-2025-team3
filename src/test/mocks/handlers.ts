import { http, HttpResponse } from 'msw';

const SUPABASE_URL = 'https://egdkvzookgkrajysadtn.supabase.co';

// Mock data
export const mockExercises = [
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

export const mockProfiles = [
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
];

export const mockWorkoutPlans = [
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

export const mockSessionLogs = [
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
];

export const handlers = [
  // Exercises
  http.get(`${SUPABASE_URL}/rest/v1/exercises`, () => {
    return HttpResponse.json(mockExercises);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/exercises`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-exercise-id',
      ...body,
      created_at: new Date().toISOString(),
    });
  }),

  // Profiles
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    
    if (role === 'eq.trainee') {
      return HttpResponse.json(mockProfiles.filter(p => p.role === 'trainee'));
    }
    return HttpResponse.json(mockProfiles);
  }),

  // Workout Plans
  http.get(`${SUPABASE_URL}/rest/v1/workout_plans`, () => {
    return HttpResponse.json(mockWorkoutPlans);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/workout_plans`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-wp-id',
      ...body,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/workout_plans`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockWorkoutPlans[0],
      ...body,
      updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/workout_plans`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Session Logs
  http.get(`${SUPABASE_URL}/rest/v1/session_logs`, () => {
    return HttpResponse.json(mockSessionLogs);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/session_logs`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-sl-id',
      ...body,
      created_at: new Date().toISOString(),
    });
  }),
];
