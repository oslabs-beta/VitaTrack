# Frontend Integration Fixes

## Overview
This document details all changes made to integrate Peter's frontend with the VitaTrack backend API.

---

## Configuration Changes

### 1. config.ts
**Changed:** Disabled mocks and enabled authentication

```typescript
export const AUTH_ENABLED = true;   // Changed from false
export const USE_MOCKS = false;     // Changed from true
```

**Why:** The frontend was running in mock mode and bypassing authentication, preventing real backend integration.

---

### 2. vite.config.ts
**Changed:** Fixed proxy configuration to point to correct backend port

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { 
    proxy: { 
      '/api': { 
        target: 'http://localhost:5001',  // Changed from 3000
        changeOrigin: true 
      },
      '/auth': {  // Added this
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    } 
  },
});
```

**Why:** 
- Backend runs on port 5001, not 3000
- Auth endpoints are at `/auth/*`, not `/api/auth/*`

---

### 3. axios.ts
**Changed:** Updated base URL to root

```typescript
const api = axios.create({
  baseURL: '/',              // Changed from '/api'
  withCredentials: true,
});
```

**Why:** With the proxy setup, we need axios to use root path so `/auth` and `/api` routes proxy correctly.

---

## API Integration Fixes

### 4. food.ts
**Changes:**
1. Added `/api` prefix to all endpoints
2. Updated `aiLookup()` to call actual backend and parse response
3. Added `aiSummary` field to `Meal` type and `createMeal()` function

```typescript
// Type updates
export type Meal = {
  id: number;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: string;
  aiSummary?: string;  // Added
};

type MealServer = {
  // ... existing fields
  aiSummary?: string;  // Added
};

const toClient = (m: MealServer): Meal => ({
  id: m.id,
  name: m.foodName,
  calories: m.calories,
  protein: m.protein ?? 0,
  carbs: m.carbs ?? 0,
  fat: m.fat ?? 0,
  createdAt: m.createdAt,
  aiSummary: m.aiSummary,  // Added
});

// AI Lookup now calls real backend
export async function aiLookup(query: string): Promise<NutritionEstimate> {
  if (!query.trim()) throw new Error('empty query');

  if (USE_MOCKS) {
    // ... mock code
  }

  // Call actual backend
  const { data } = await api.post<{ summary: string }>('/api/ai/nutrition/summary', { text: query });
  
  // Parse AI text response to extract numbers
  const summary = data.summary;
  const caloriesMatch = summary.match(/(\d+)\s*(?:-\s*\d+\s*)?(?:kcal|cal|calories)/i);
  const proteinMatch = summary.match(/(\d+)\s*g?\s*protein/i);
  const carbsMatch = summary.match(/(\d+)\s*g?\s*carb(?:s|ohydrate)?/i);
  const fatMatch = summary.match(/(\d+)\s*g?\s*fat/i);

  return {
    name: query,
    calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
    protein: proteinMatch ? parseInt(proteinMatch[1]) : 0,
    carbs: carbsMatch ? parseInt(carbsMatch[1]) : 0,
    fat: fatMatch ? parseInt(fatMatch[1]) : 0,
    source: summary,  // Store full AI summary
  };
}

// Updated createMeal to accept and save aiSummary
export async function createMeal(input: {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  aiSummary?: string;  // Added
}): Promise<Meal> {
  // ... mock code
  
  const body = {
    loggedDate: todayYMD(),
    mealType: 'snack',
    foodName: input.name,
    calories: input.calories,
    protein: input.protein ?? 0,
    carbs: input.carbs ?? 0,
    fat: input.fat ?? 0,
    servingSize: 1,
    servingUnit: 'unit',
    aiSummary: input.aiSummary,  // Added
  };
  const { data } = await api.post<MealServer>('/api/food-logs', body);
  return toClient(data);
}
```

**All endpoints updated:**
- `listToday()`: `/food-logs/daily/...` → `/api/food-logs/daily/...`
- `createMeal()`: `/food-logs` → `/api/food-logs`
- `updateFoodLog()`: `/food-logs/:id` → `/api/food-logs/:id`
- `deleteFoodLog()`: `/food-logs/:id` → `/api/food-logs/:id`

---

### 5. workouts.ts
**Changes:**
1. Added `/api` prefix to all endpoints
2. Changed date range from 7 days to 30 days

```typescript
export async function listRecent(): Promise<Workout[]> {
  if (USE_MOCKS) {
    await sleep();
    return mockWorkouts;
  }
  const endDate = todayYMD();
  const startDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);  // Changed from 6 to 29
  const { data } = await api.get<WorkoutServer[]>('/api/workouts', { params: { startDate, endDate } });
  return data.map(toClient);
}
```

**All endpoints updated:**
- `listRecent()`: `/workouts` → `/api/workouts`
- `createWorkout()`: `/workouts` → `/api/workouts`
- `removeWorkout()`: `/workouts/:id` → `/api/workouts/:id`

**Why 30 days:** Backend stores workouts with dates, and 7-day window was too narrow for testing/demo purposes.

---

### 6. goals.ts
**Changes:**
1. Added `/api` prefix to all endpoints
2. Implemented delete-and-recreate logic for updating goals
3. Added delays to handle database race conditions

```typescript
export async function upsertGoals(input: Goals): Promise<Goals> {
  if (USE_MOCKS) return input;

  const current = await api.get<GoalServer[]>('/api/goals').then(r => r.data);
  
  // Find existing goals
  const dailyGoal = current.find(isDailyCalories);
  const weeklyGoal = current.find(isWeeklyWorkouts);

  // Delete if values changed
  const deleteOps: Promise<any>[] = [];
  
  if (dailyGoal && input.dailyCalories != null && dailyGoal.targetValue !== input.dailyCalories) {
    deleteOps.push(api.delete(`/api/goals/${dailyGoal.id}`));
  }
  if (weeklyGoal && input.weeklyWorkouts != null && weeklyGoal.targetValue !== input.weeklyWorkouts) {
    deleteOps.push(api.delete(`/api/goals/${weeklyGoal.id}`));
  }

  if (deleteOps.length > 0) {
    await Promise.all(deleteOps);
    await new Promise(resolve => setTimeout(resolve, 100));  // Delay for DB processing
  }

  // Create new goals
  const createOps: Promise<any>[] = [];

  if (input.dailyCalories != null && (!dailyGoal || dailyGoal.targetValue !== input.dailyCalories)) {
    createOps.push(api.post('/api/goals', {
      goalName: 'Daily Calorie Target',
      goalType: 'calories',
      targetValue: input.dailyCalories,
      targetUnit: 'calories',
      period: 'daily',
      startDate: todayYMD(),
      currentValue: 0,
      isActive: true,
    }));
  }

  if (input.weeklyWorkouts != null && (!weeklyGoal || weeklyGoal.targetValue !== input.weeklyWorkouts)) {
    createOps.push(api.post('/api/goals', {
      goalName: 'Weekly Workout Target',
      goalType: 'workout_frequency',
      targetValue: input.weeklyWorkouts,
      targetUnit: 'workouts',
      period: 'weekly',
      startDate: todayYMD(),
      currentValue: 0,
      isActive: true,
    }));
  }

  await Promise.all(createOps);
  await new Promise(resolve => setTimeout(resolve, 100));  // Delay for DB processing
  
  return getGoals();
}
```

**Why:** Backend doesn't have an endpoint to update goal target values, only progress. The delete-and-recreate pattern works around this limitation. Delays prevent race conditions where deleted goals still appear when refetching.

**All endpoints updated:**
- `getGoals()`: `/goals` → `/api/goals`
- `upsertGoals()`: `/goals` → `/api/goals` (POST and DELETE)

---

## Route Protection

### 7. routes.tsx
**Changed:** Added `Protected` component wrapper to enforce authentication

```typescript
import Protected from './Protected';  // Added import

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <Protected />,  // Added wrapper
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Food /> },
          { path: 'food', element: <Food /> },
          { path: 'workout', element: <Workout /> },
          { path: 'goals', element: <Goals /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
```

**Why:** Without this wrapper, users could access protected routes without logging in.

---

## Component Fixes

### 8. Workout.tsx
**Changed:** Removed broken workout suggestions feature

```typescript
// REMOVED:
// import { suggestions } from '@/api/workouts';
// const [ideas, setIdeas] = useState<string[]>([]);
// suggestions().then(setIdeas).catch(() => setIdeas([]));
// ... entire Suggestions section in JSX
```

**Why:** The `suggestions()` function was commented out in `workouts.ts` and had no backend endpoint. Removed to prevent errors.

---

### 9. Food.tsx
**Changes:**
1. Added state to track AI summary separately
2. Updated `runLookup()` to store full AI text
3. Modified `submit()` to include AI summary when creating meal
4. Added AI summary display in preview section
5. Added AI summary display in meal list

```typescript
const [lastAiSummary, setLastAiSummary] = useState<string>('');  // Added

const runLookup = async () => {
  if (!draft.name) return toast.error('Enter a food name first');
  try {
    setLookupLoading(true);
    const est = await aiLookup(draft.name);
    setDraft((p) => ({
      ...p,
      name: est.name || p.name,
      calories: est.calories ?? p.calories,
      protein: est.protein ?? p.protein,
      carbs: est.carbs ?? p.carbs,
      fat: est.fat ?? p.fat,
    }));
    setLastEstimate(`${est.calories} cal • P:${est.protein ?? 0} C:${est.carbs ?? 0} F:${est.fat ?? 0}`);
    setLastAiSummary(est.source || '');  // Added - store full AI summary
    toast.success('AI estimate applied');
  } catch (e: any) {
    toast.error(e?.message || 'AI lookup failed');
  } finally {
    setLookupLoading(false);
  }
};

const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!draft.name || !draft.calories) return toast.error('Name and calories are required');
  setSubmitting(true);
  try {
    await createMeal({
      name: draft.name,
      calories: Number(draft.calories) || 0,
      protein: Number(draft.protein) || 0,
      carbs: Number(draft.carbs) || 0,
      fat: Number(draft.fat) || 0,
      aiSummary: lastAiSummary || undefined,  // Added
    });
    toast.success('Meal added');
    setDraft({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setLastEstimate('');
    setLastAiSummary('');  // Added
    await refresh();
  } catch {
    toast.error('Failed to add meal');
  } finally {
    setSubmitting(false);
  }
};

// JSX changes - Preview section
{lastEstimate && (
  <div className="space-y-2">
    <div className="text-xs text-muted-foreground">Estimate: {lastEstimate}</div>
    {lastAiSummary && (
      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
        <strong>AI Summary:</strong> {lastAiSummary}
      </div>
    )}
  </div>
)}

// JSX changes - Meal list
<ul className="space-y-2">
  {meals.map((m) => (
    <li key={m.id} className="rounded border px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium">{m.name}</div>
          <div className="text-xs text-muted-foreground">
            {m.calories} cal • P:{m.protein||0} C:{m.carbs||0} F:{m.fat||0}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => removeMeal(m.id).then(refresh)}>
          Delete
        </Button>
      </div>
      {m.aiSummary && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          <strong>AI:</strong> {m.aiSummary}
        </div>
      )}
    </li>
  ))}
</ul>
```

**Why:** 
- Backend stores AI summaries in the database, frontend needed to display them
- Users want to see AI estimates before and after adding meals
- Provides context and transparency for nutrition data

---

## Testing After Changes

### Required Backend State
- Backend running on port 5001
- All API endpoints working (`/auth/*`, `/api/food-logs`, `/api/workouts`, `/api/goals`)
- OpenAI API key configured for AI nutrition summaries

### Test User
- Email: `john@example.com`
- Password: `password123`

### Verification Steps
1. **Authentication:** Login redirects work, protected routes require auth
2. **Food Logs:** Can add meals, AI lookup auto-fills form, summaries save and display
3. **Workouts:** Can add/delete workouts, recent list shows last 30 days
4. **Goals:** Can set/update calorie and workout targets, progress bars update

---

## Known Limitations

### AI Summary Parsing
The regex-based parsing of AI summaries may not work for all response formats. If OpenAI changes its response structure, the parsing logic in `aiLookup()` may need adjustment.

**Example responses it handles:**
- "300 kcal", "300 cal", "300 calories"
- "25g protein", "25 g protein"
- "30g carbs", "30g carbohydrate"
- "15g fat"

### Goals Update Pattern
The delete-and-recreate pattern for updating goals is a workaround. A proper implementation would have a backend endpoint to update goal target values directly (e.g., `PATCH /api/goals/:id/target`).

### Workout Date Range
The 30-day range is hardcoded. A better implementation would allow users to filter by custom date ranges or implement pagination.

---

## Summary of Changes

| File | Changes | Reason |
|------|---------|--------|
| `config.ts` | Disabled mocks, enabled auth | Enable real backend integration |
| `vite.config.ts` | Fixed proxy port and added `/auth` | Backend on 5001, auth not under `/api` |
| `axios.ts` | Changed baseURL to `/` | Proper proxy routing |
| `routes.tsx` | Added Protected wrapper | Enforce authentication |
| `food.ts` | API prefixes, AI integration, aiSummary field | Backend integration and AI feature |
| `workouts.ts` | API prefixes, 30-day range | Backend integration, better UX |
| `goals.ts` | API prefixes, delete-recreate logic | Backend integration and workaround |
| `Food.tsx` | AI summary display, state management | Show AI data to users |
| `Workout.tsx` | Removed suggestions | Feature not implemented |

All changes successfully integrate the frontend with the VitaTrack backend API while maintaining Peter's UI/UX design.