import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

import { getGoals, upsertGoals, type Goals } from '@/api/goals';
import { listToday as listMeals } from '@/api/food';
import { listRecent as listWorkouts } from '@/api/workouts';

export default function Goals() {
  const [goals, setGoals] = useState<Goals>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Current metrics (derived from your existing pages/APIs; works with mocks or real)
  const [todayCalories, setTodayCalories] = useState(0);
  const [weeklyWorkoutCount, setWeeklyWorkoutCount] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const [g, meals, workouts] = await Promise.all([
        getGoals(),
        listMeals(),
        listWorkouts(),
      ]);
      setGoals(g);
      setTodayCalories(meals.reduce((sum, m) => sum + (m.calories || 0), 0));
      setWeeklyWorkoutCount(workouts.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const calPct = useMemo(() => {
    if (!goals.dailyCalories || goals.dailyCalories <= 0) return 0;
    return Math.min(100, Math.round((todayCalories / goals.dailyCalories) * 100));
  }, [todayCalories, goals.dailyCalories]);

  const wkPct = useMemo(() => {
    if (!goals.weeklyWorkouts || goals.weeklyWorkouts <= 0) return 0;
    return Math.min(100, Math.round((weeklyWorkoutCount / goals.weeklyWorkouts) * 100));
  }, [weeklyWorkoutCount, goals.weeklyWorkouts]);

  const save = async () => {
    setSaving(true);
    try {
      const g = await upsertGoals(goals);
      setGoals(g);
      toast.success('Goals saved');
      // Optionally recompute progress after save (no need if inputs only change targets)
    } catch {
      toast.error('Failed to save goals');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Set your goals</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm">Daily calories</label>
            <Input
              type="number"
              placeholder="e.g., 2000"
              value={goals.dailyCalories ?? ''}
              onChange={(e) => setGoals((p) => ({ ...p, dailyCalories: e.target.valueAsNumber || 0 }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Weekly workouts</label>
            <Input
              type="number"
              placeholder="e.g., 3"
              value={goals.weeklyWorkouts ?? ''}
              onChange={(e) => setGoals((p) => ({ ...p, weeklyWorkouts: e.target.valueAsNumber || 0 }))}
            />
          </div>

          <div className="pt-2">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              <div>
                <div className="mb-1 text-sm">
                  Calories — {todayCalories} / {goals.dailyCalories ?? '—'}
                </div>
                <Progress value={calPct} />
                <div className="mt-1 text-xs text-muted-foreground">{calPct}%</div>
              </div>

              <div>
                <div className="mb-1 text-sm">
                  Workouts (7d) — {weeklyWorkoutCount} / {goals.weeklyWorkouts ?? '—'}
                </div>
                <Progress value={wkPct} />
                <div className="mt-1 text-xs text-muted-foreground">{wkPct}%</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

