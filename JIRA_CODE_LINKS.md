# FitSplit - Code Linking Documentation
> תיעוד קישורי קוד לסיפורי משתמש (User Stories)

## 🔗 GitHub Repository
**Repository URL:** `https://github.com/kobiloai735/fit-split-dash`

---

## 📋 Summary Table

| User Story | תיאור | קובץ ראשי | שורות | GitHub Link |
|------------|-------|-----------|-------|-------------|
| US-101 | הוספת תרגיל לתוכנית | `PlanWorkoutPage.tsx` | 89-107 | [View Code](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx#L89-L107) |
| US-102 | ניהול מאגר תרגילים | `PlanWorkoutPage.tsx` | 108-123 | [View Code](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx#L108-L123) |
| US-103 | מחיקת תרגיל מתוכנית | `PlanWorkoutPage.tsx` | 124-130 | [View Code](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx#L124-L130) |
| US-201 | צפייה באימונים ממתינים | `TraineeWorkoutsPage.tsx` | 37-80 | [View Code](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TraineeWorkoutsPage.tsx#L37-L80) |
| US-202 | סימון אימון כהושלם | `TraineeWorkoutsPage.tsx` | 24-35 | [View Code](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TraineeWorkoutsPage.tsx#L24-L35) |
| US-203 | צפייה בהיסטוריית אימונים | `TraineeWorkoutsPage.tsx` | 81-120 | [View Code](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TraineeWorkoutsPage.tsx#L81-L120) |
| US-301 | דוח התקדמות | `ReportsPage.tsx` | 29-85 | [View Code](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/ReportsPage.tsx#L29-L85) |
| US-302 | דוח פופולריות תרגילים | `ReportsPage.tsx` | 86-150 | [View Code](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/ReportsPage.tsx#L86-L150) |

---

## 🏋️ Stage 1: Trainer Workflow

### US-101: הוספת תרגיל לתוכנית אימון

**תיאור:** כמאמן, אני רוצה להוסיף תרגיל לתוכנית האימון של מתאמן

#### Primary File
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/pages/PlanWorkoutPage.tsx` | 89-107 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx#L89-L107) |

#### Supporting Files
| קובץ | תפקיד | שורות | GitHub Link |
|------|-------|-------|-------------|
| `src/hooks/useWorkoutPlans.ts` | Mutation hook | 129-157 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts#L129-L157) |
| `src/integrations/supabase/types.ts` | Type definitions | 113-163 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/integrations/supabase/types.ts#L113-L163) |

#### Key Functions
```typescript
// src/pages/PlanWorkoutPage.tsx
handleAddWorkout() // lines 89-107 - validates and submits workout

// src/hooks/useWorkoutPlans.ts  
useCreateWorkoutPlan() // lines 129-157 - mutation for creating workout plans
```

#### Database Tables
- `workout_plans` - INSERT operation
- `exercises` - SELECT for exercise list

#### RLS Policies
- `Trainers can insert workout plans` - WITH CHECK: `is_trainer(auth.uid())`

---

### US-102: ניהול מאגר תרגילים (Quick Add)

**תיאור:** כמאמן, אני רוצה להוסיף תרגילים חדשים למאגר

#### Primary File
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/pages/PlanWorkoutPage.tsx` | 108-123 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx#L108-L123) |

#### Supporting Files
| קובץ | תפקיד | GitHub Link |
|------|-------|-------------|
| `src/hooks/useExercises.ts` | CRUD operations | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useExercises.ts) |
| `src/integrations/supabase/types.ts` | Type definitions | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/integrations/supabase/types.ts#L17-L43) |

#### Key Functions
```typescript
// src/pages/PlanWorkoutPage.tsx
handleQuickAdd() // lines 108-123 - adds new exercise to catalog

// src/hooks/useExercises.ts
useCreateExercise() // mutation for creating exercises
```

#### Database Tables
- `exercises` - INSERT operation

#### RLS Policies
- `Trainers can insert exercises` - WITH CHECK: `is_trainer(auth.uid())`

---

### US-103: מחיקת תרגיל מתוכנית

**תיאור:** כמאמן, אני רוצה למחוק תרגיל מתוכנית האימון

#### Primary File
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/pages/PlanWorkoutPage.tsx` | 124-130 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx#L124-L130) |

#### Supporting Files
| קובץ | תפקיד | שורות | GitHub Link |
|------|-------|-------|-------------|
| `src/hooks/useWorkoutPlans.ts` | Delete mutation | 181-198 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts#L181-L198) |

#### Key Functions
```typescript
// src/pages/PlanWorkoutPage.tsx
handleDeletePlan(id: string) // lines 124-130 - deletes workout plan

// src/hooks/useWorkoutPlans.ts
useDeleteWorkoutPlan() // lines 181-198 - mutation for deleting plans
```

#### Database Tables
- `workout_plans` - DELETE operation

#### RLS Policies
- `Trainers can delete workout plans` - USING: `is_trainer(auth.uid())`

---

## 🏃 Stage 2: Trainee Workflow

### US-201: צפייה באימונים ממתינים

**תיאור:** כמתאמן, אני רוצה לראות את האימונים שמחכים לי

#### Primary File
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/pages/TraineeWorkoutsPage.tsx` | 37-80 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TraineeWorkoutsPage.tsx#L37-L80) |

#### Supporting Files
| קובץ | תפקיד | שורות | GitHub Link |
|------|-------|-------|-------------|
| `src/hooks/useWorkoutPlans.ts` | Data fetching | 27-79 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts#L27-L79) |
| `src/contexts/AuthContext.tsx` | User context | entire file | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/contexts/AuthContext.tsx) |

#### Key Functions
```typescript
// src/hooks/useWorkoutPlans.ts
useWorkoutPlans(traineeId?) // lines 27-79 - fetches workout plans with filters
usePendingWorkouts() // lines 81-127 - fetches only pending workouts
```

#### Database Tables
- `workout_plans` - SELECT with status='pending'
- `exercises` - JOIN for exercise details
- `profiles` - JOIN for trainee details

#### RLS Policies
- `Trainees can view their own workout plans` - USING: `auth.uid() = trainee_id`

---

### US-202: סימון אימון כהושלם

**תיאור:** כמתאמן, אני רוצה לסמן אימון כהושלם

#### Primary File
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/pages/TraineeWorkoutsPage.tsx` | 24-35 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TraineeWorkoutsPage.tsx#L24-L35) |

#### Supporting Files
| קובץ | תפקיד | שורות | GitHub Link |
|------|-------|-------|-------------|
| `src/hooks/useWorkoutPlans.ts` | Status mutation | 159-179 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts#L159-L179) |
| `src/hooks/useSessionLogs.ts` | Log creation | entire file | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useSessionLogs.ts) |

#### Key Functions
```typescript
// src/pages/TraineeWorkoutsPage.tsx
handleComplete(workout) // lines 24-35 - marks done + creates session log

// src/hooks/useWorkoutPlans.ts
useUpdateWorkoutStatus() // lines 159-179 - updates workout status

// src/hooks/useSessionLogs.ts
useCreateSessionLog() // creates session log entry
```

#### Database Tables
- `workout_plans` - UPDATE status to 'done'
- `session_logs` - INSERT new log entry

#### RLS Policies
- `Trainees can update their own workout plans` - USING: `auth.uid() = trainee_id`
- `Trainees can insert their own session logs` - WITH CHECK: `auth.uid() = trainee_id`

---

### US-203: צפייה בהיסטוריית אימונים

**תיאור:** כמתאמן, אני רוצה לראות את היסטוריית האימונים שלי

#### Primary File
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/pages/TraineeWorkoutsPage.tsx` | 81-120 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TraineeWorkoutsPage.tsx#L81-L120) |

#### Supporting Files
| קובץ | תפקיד | שורות | GitHub Link |
|------|-------|-------|-------------|
| `src/hooks/useWorkoutPlans.ts` | Data fetching | 27-79 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts#L27-L79) |

#### Key Functions
```typescript
// src/pages/TraineeWorkoutsPage.tsx
// Filter logic for completed workouts
const completedWorkouts = workouts?.filter(w => w.status === 'done')
```

#### Database Tables
- `workout_plans` - SELECT with status='done'
- `exercises` - JOIN for exercise details

#### RLS Policies
- `Trainees can view their own workout plans` - USING: `auth.uid() = trainee_id`

---

## 📊 Stage 3: Reports & Queries

### US-301: דוח התקדמות משתמש

**תיאור:** כמאמן, אני רוצה לראות דוח התקדמות של מתאמן

#### Primary File
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/pages/ReportsPage.tsx` | 29-85 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/ReportsPage.tsx#L29-L85) |

#### Supporting Files
| קובץ | תפקיד | GitHub Link |
|------|-------|-------------|
| `src/hooks/useSessionLogs.ts` | Data fetching | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useSessionLogs.ts) |
| `src/hooks/useProfiles.ts` | Trainee selection | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useProfiles.ts) |

#### Key Functions
```typescript
// src/pages/ReportsPage.tsx
// Progress data processing (lines 40-55)
const progressData = sessionLogs
  ?.filter(log => log.trainee_id === selectedTrainee)
  .slice(-10)
  .map(log => ({
    date: format(new Date(log.date_completed), 'dd/MM'),
    weight: log.actual_weight,
  }));
```

#### Database Tables
- `session_logs` - SELECT for weight history
- `profiles` - SELECT for trainee list

#### RLS Policies
- `Trainers can view all session logs` - USING: `is_trainer(auth.uid())`

#### Chart Library
- **Recharts**: `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`

---

### US-302: דוח פופולריות תרגילים

**תיאור:** כמאמן, אני רוצה לראות אילו תרגילים הכי פופולריים

#### Primary File
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/pages/ReportsPage.tsx` | 86-150 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/ReportsPage.tsx#L86-L150) |

#### Supporting Files
| קובץ | תפקיד | שורות | GitHub Link |
|------|-------|-------|-------------|
| `src/hooks/useWorkoutPlans.ts` | Data fetching | 27-79 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts#L27-L79) |
| `src/hooks/useExercises.ts` | Exercise names | entire file | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useExercises.ts) |

#### Key Functions
```typescript
// src/pages/ReportsPage.tsx
// Popularity data processing (lines 57-75)
const popularityData = Object.entries(exerciseCounts)
  .map(([exerciseId, count]) => ({
    name: exercises?.find(e => e.id === exerciseId)?.name || 'Unknown',
    count,
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);
```

#### Database Tables
- `workout_plans` - SELECT for assignment counts
- `exercises` - SELECT for exercise names

#### RLS Policies
- `Trainers can view all workout plans` - USING: `is_trainer(auth.uid())`

#### Chart Library
- **Recharts**: `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`

---

## 🔐 Authentication & Authorization

### Auth Flow
| File | Purpose | GitHub Link |
|------|---------|-------------|
| `src/pages/AuthPage.tsx` | Login/Signup forms | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/AuthPage.tsx) |
| `src/contexts/AuthContext.tsx` | Auth state management | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/contexts/AuthContext.tsx) |
| `src/components/auth/ProtectedRoute.tsx` | Route protection | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/components/auth/ProtectedRoute.tsx) |

### Database Functions
```sql
-- Check if user is trainer
is_trainer(_user_id uuid) RETURNS boolean

-- Auto-create profile on signup
handle_new_user() RETURNS trigger
```

---

## 📁 Project Structure

| Directory | File | Purpose | GitHub Link |
|-----------|------|---------|-------------|
| `src/pages/` | `AuthPage.tsx` | Authentication | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/AuthPage.tsx) |
| `src/pages/` | `TrainerDashboard.tsx` | Trainer home | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TrainerDashboard.tsx) |
| `src/pages/` | `TraineesPage.tsx` | Trainee list | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TraineesPage.tsx) |
| `src/pages/` | `PlanWorkoutPage.tsx` | US-101, US-102, US-103 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx) |
| `src/pages/` | `TraineeWorkoutsPage.tsx` | US-201, US-202, US-203 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/TraineeWorkoutsPage.tsx) |
| `src/pages/` | `ReportsPage.tsx` | US-301, US-302 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/ReportsPage.tsx) |
| `src/pages/` | `LiveViewPage.tsx` | Real-time view | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/LiveViewPage.tsx) |
| `src/hooks/` | `useWorkoutPlans.ts` | Workout CRUD | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts) |
| `src/hooks/` | `useExercises.ts` | Exercise CRUD | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useExercises.ts) |
| `src/hooks/` | `useSessionLogs.ts` | Session logging | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useSessionLogs.ts) |
| `src/hooks/` | `useProfiles.ts` | User profiles | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useProfiles.ts) |
| `src/contexts/` | `AuthContext.tsx` | Auth state | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/contexts/AuthContext.tsx) |
| `src/components/` | `Layout.tsx` | Page layout | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/components/layout/Layout.tsx) |
| `src/components/` | `HeartRateMonitor.tsx` | IoT simulation | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/components/HeartRateMonitor.tsx) |

---

## 📝 Jira Integration Instructions

### שלב 1: העתקה ל-Jira
1. פתח את הכרטיסייה של ה-User Story ב-Jira
2. בשדה **Description** או **Development**, הדבק את הטבלה הרלוונטית

### דוגמה להעתקה:
```markdown
## Code Links - US-101
| File | Lines | Link |
|------|-------|------|
| PlanWorkoutPage.tsx | 89-107 | [View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx#L89-L107) |
| useWorkoutPlans.ts | 129-157 | [View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts#L129-L157) |

**Key Function:** `handleAddWorkout()`
**DB Tables:** workout_plans, exercises
```

---

## 🔄 Realtime Features

### Subscribed Tables
- `workout_plans` - Real-time updates for workout status changes

### Implementation
| File | Lines | GitHub Link |
|------|-------|-------------|
| `src/hooks/useWorkoutPlans.ts` | 56-76 | [🔗 View](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/useWorkoutPlans.ts#L56-L76) |

```typescript
const channel = supabase
  .channel("workout_plans_changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "workout_plans" }, 
    () => queryClient.invalidateQueries({ queryKey: ["workout_plans"] })
  )
  .subscribe();
```

---

## 🔧 Quick Copy Templates

### Template 1: Full User Story
```markdown
## US-XXX: [Title]

### Primary File
[File](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/FILE.tsx#LSTART-LEND)

### Supporting Files
- [Hook](https://github.com/kobiloai735/fit-split-dash/blob/main/src/hooks/HOOK.ts)

### Key Functions
- `functionName()` - description

### Database
- Tables: table1, table2
- RLS: policy description
```

### Template 2: Minimal Link
```
[src/pages/PlanWorkoutPage.tsx#L89-L107](https://github.com/kobiloai735/fit-split-dash/blob/main/src/pages/PlanWorkoutPage.tsx#L89-L107)
```

---

*Generated: December 2024*
*Project: FitSplit - Fitness Training Management System*
*Repository: https://github.com/kobiloai735/fit-split-dash*
