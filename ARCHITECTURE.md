# 🏗️ Fitness Trainer App - Architecture Documentation

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Database Schema (ERD)](#database-schema-erd)
- [User Flows](#user-flows)
- [Component Structure](#component-structure)
- [Technology Stack](#technology-stack)

---

## System Overview

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend - React + Vite"]
        subgraph Pages["📄 Pages"]
            Index["/"]
            Auth["/auth"]
            Dashboard["/dashboard"]
            Trainees["/trainees"]
            PlanWorkout["/trainees/:id/plan"]
            TraineeHistory["/trainees/:id/history"]
            Reports["/reports"]
            MyWorkouts["/my-workouts"]
            SelectTrainer["/select-trainer"]
            LiveView["/live"]
        end
        
        subgraph Components["🧩 Components"]
            Layout["Layout"]
            ProtectedRoute["ProtectedRoute"]
            WorkoutTimer["WorkoutTimer"]
            HeartRateMonitor["HeartRateMonitor"]
            TransferDialog["TransferTraineeDialog"]
            HistoryStats["TraineeHistoryStats"]
        end
        
        subgraph Hooks["🪝 Custom Hooks"]
            useAuth["useAuth"]
            useProfiles["useProfiles"]
            useExercises["useExercises"]
            useWorkoutPlans["useWorkoutPlans"]
            useSessionLogs["useSessionLogs"]
            useWorkoutTimer["useWorkoutTimer"]
            useTrainerAssignments["useTrainerAssignments"]
        end
    end
    
    subgraph Backend["☁️ Lovable Cloud Backend"]
        subgraph Auth["🔐 Authentication"]
            AuthService["Auth Service"]
            AuthTrigger["handle_new_user()"]
        end
        
        subgraph Database["🗄️ Database Tables"]
            profiles[("profiles")]
            exercises[("exercises")]
            workout_plans[("workout_plans")]
            session_logs[("session_logs")]
            trainer_trainee[("trainer_trainee_assignments")]
            workout_timers[("workout_timers")]
        end
        
        subgraph Functions["⚡ DB Functions"]
            isTrainer["is_trainer()"]
            isTrainee["is_trainee()"]
            getTrainers["get_trainers_with_availability()"]
            checkCapacity["check_trainer_capacity()"]
        end
        
        subgraph RLS["🛡️ Row Level Security"]
            RLSPolicies["RLS Policies per Table"]
        end
    end
    
    Pages --> Components
    Components --> Hooks
    Hooks --> Backend
    AuthService --> AuthTrigger --> profiles
    Database --> RLS
    Functions --> Database
```

---

## Database Schema (ERD)

```mermaid
erDiagram
    profiles ||--o{ trainer_trainee_assignments : "trainer_id"
    profiles ||--o{ trainer_trainee_assignments : "trainee_id"
    profiles ||--o{ workout_plans : "trainee_id"
    profiles ||--o{ session_logs : "trainee_id"
    profiles ||--o{ workout_timers : "trainee_id"
    exercises ||--o{ workout_plans : "exercise_id"
    exercises ||--o{ session_logs : "exercise_id"
    
    profiles {
        uuid id PK
        text name
        text email
        user_role role
        timestamp created_at
    }
    
    exercises {
        uuid id PK
        text name
        text category
        text description
        int default_sets
    }
    
    workout_plans {
        uuid id PK
        uuid trainee_id FK
        uuid exercise_id FK
        int assigned_sets
        int assigned_reps
        int assigned_weight
        workout_status status
    }
    
    session_logs {
        uuid id PK
        uuid trainee_id FK
        uuid exercise_id FK
        int actual_weight
        int rating
        date date_completed
    }
    
    trainer_trainee_assignments {
        uuid id PK
        uuid trainer_id FK
        uuid trainee_id FK
        timestamp assigned_at
    }
    
    workout_timers {
        uuid id PK
        uuid trainee_id FK
        text status
        timestamp started_at
        timestamp paused_at
        int total_paused_seconds
    }
```

### Table Details

| Table | Description | Key Fields |
|-------|-------------|------------|
| `profiles` | User accounts (trainers & trainees) | id, name, email, role |
| `exercises` | Exercise library | name, category, default_sets |
| `workout_plans` | Assigned workouts per trainee | trainee_id, exercise_id, sets/reps/weight |
| `session_logs` | Completed workout records | trainee_id, exercise_id, actual_weight, rating |
| `trainer_trainee_assignments` | Trainer-trainee relationships | trainer_id, trainee_id |
| `workout_timers` | Active workout session tracking | trainee_id, status, started_at |

---

## User Flows

### Trainer Flow

```mermaid
flowchart TD
    T1[🔐 Login] --> T2[📊 Dashboard]
    T2 --> T3[👥 Manage Trainees]
    T3 --> T4[📝 Plan Workout]
    T3 --> T5[📈 View History]
    T3 --> T6[🔄 Transfer Trainee]
    T2 --> T7[📊 Reports]
    T4 --> T8[Add Exercises]
    T8 --> T9[Set Reps/Sets/Weight]
```

### Trainee Flow

```mermaid
flowchart TD
    E1[🔐 Login] --> E2{Has Trainer?}
    E2 -->|No| E3[👨‍🏫 Select Trainer]
    E2 -->|Yes| E4[🏋️ My Workouts]
    E3 --> E4
    E4 --> E5[⏱️ Start Timer]
    E5 --> E6[💪 Complete Exercise]
    E6 --> E7[📝 Log Session]
    E7 --> E8[⭐ Rate Workout]
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth Page
    participant S as Supabase Auth
    participant DB as Database
    participant P as Profile Trigger
    
    U->>A: Enter email/password
    A->>S: signUp() / signIn()
    S->>S: Validate credentials
    
    alt New User (Sign Up)
        S->>DB: Create auth.users record
        DB->>P: Trigger handle_new_user()
        P->>DB: Insert into profiles
    end
    
    S->>A: Return session
    A->>U: Redirect based on role
    
    alt Trainer
        A->>U: Redirect to /dashboard
    else Trainee
        A->>U: Redirect to /my-workouts
    end
```

---

## Component Structure

```mermaid
graph TD
    subgraph App["App.tsx"]
        Router["BrowserRouter"]
        AuthProvider["AuthProvider"]
        QueryProvider["QueryClientProvider"]
    end
    
    subgraph Layouts["Layout Components"]
        MainLayout["Layout.tsx"]
        Sidebar["Sidebar Navigation"]
        Header["Header with Back Button"]
    end
    
    subgraph TrainerPages["Trainer Pages"]
        TD["TrainerDashboard"]
        TP["TraineesPage"]
        PP["PlanWorkoutPage"]
        TH["TraineeHistoryPage"]
        RP["ReportsPage"]
    end
    
    subgraph TraineePages["Trainee Pages"]
        TW["TraineeWorkoutsPage"]
        ST["SelectTrainerPage"]
        LV["LiveViewPage"]
    end
    
    subgraph SharedComponents["Shared Components"]
        WT["WorkoutTimer"]
        HR["HeartRateMonitor"]
        TTD["TransferTraineeDialog"]
        THS["TraineeHistoryStats"]
    end
    
    App --> Layouts
    Layouts --> TrainerPages
    Layouts --> TraineePages
    TrainerPages --> SharedComponents
    TraineePages --> SharedComponents
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 | UI Framework |
| **Build Tool** | Vite | Fast development & bundling |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **UI Components** | shadcn/ui | Pre-built accessible components |
| **State Management** | TanStack Query | Server state & caching |
| **Routing** | React Router v6 | Client-side routing |
| **Forms** | React Hook Form + Zod | Form handling & validation |
| **Backend** | Lovable Cloud (Supabase) | Database, Auth, Real-time |
| **Database** | PostgreSQL | Relational database |
| **Authentication** | Supabase Auth | User management |

---

## Security Model

### Row Level Security (RLS) Policies

```mermaid
graph LR
    subgraph Trainer["👨‍🏫 Trainer Access"]
        T1[View all profiles]
        T2[View all workout plans]
        T3[Insert/Update/Delete workout plans]
        T4[View assigned trainee timers]
    end
    
    subgraph Trainee["🏃 Trainee Access"]
        E1[View own profile]
        E2[View trainer profiles]
        E3[View/Update own workout plans]
        E4[Insert own session logs]
        E5[Manage own timer]
    end
    
    subgraph Functions["🔧 Helper Functions"]
        F1["is_trainer(user_id)"]
        F2["is_trainee(user_id)"]
        F3["check_trainer_capacity()"]
    end
    
    Trainer --> Functions
    Trainee --> Functions
```

---

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── layout/
│   │   └── Layout.tsx
│   ├── ui/                    # shadcn components
│   ├── HeartRateMonitor.tsx
│   ├── WorkoutTimer.tsx
│   ├── TransferTraineeDialog.tsx
│   └── TraineeHistoryStats.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useExercises.ts
│   ├── useProfiles.ts
│   ├── useSessionLogs.ts
│   ├── useWorkoutPlans.ts
│   ├── useWorkoutTimer.ts
│   └── useTrainerAssignments.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── pages/
│   ├── AuthPage.tsx
│   ├── Index.tsx
│   ├── TrainerDashboard.tsx
│   ├── TraineesPage.tsx
│   ├── PlanWorkoutPage.tsx
│   ├── TraineeHistoryPage.tsx
│   ├── ReportsPage.tsx
│   ├── TraineeWorkoutsPage.tsx
│   ├── SelectTrainerPage.tsx
│   └── LiveViewPage.tsx
└── App.tsx
```

---

## Jira Integration

For linking commits to Jira issues, see [JIRA_CODE_LINKS.md](./JIRA_CODE_LINKS.md)

### Smart Commit Format
```
FIT-XXX #<action> <message>
```

### Actions
- `#comment` - Add comment to issue
- `#time` - Log time (e.g., `#time 2h`)
- `#close` / `#done` - Close the issue

---

*Last Updated: December 2024*
