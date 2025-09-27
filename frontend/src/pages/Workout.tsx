import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createWorkout, listRecent, removeWorkout, suggestions, type Workout } from '@/api/workouts';

export default function Workout() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ type: 'Run', duration: '' as number | '', distance: '' as number | '' });
  const [ideas, setIdeas] = useState<string[]>([]);

  const refresh = async () => {
    setLoading(true);
    try { setWorkouts(await listRecent()); } finally { setLoading(false); }
  };

  useEffect(() => {
    refresh();
    suggestions().then(setIdeas).catch(() => setIdeas([]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.type || !draft.duration) return toast.error('Type and duration are required');
    try {
      await createWorkout({
        type: draft.type,
        duration: Number(draft.duration) || 0,
        distance: draft.distance === '' ? undefined : Number(draft.distance) || 0,
      });
      toast.success('Workout added');
      setDraft({ type: 'Run', duration: '', distance: '' });
      await refresh();
    } catch {
      toast.error('Failed to add workout');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Log workout</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={submit} className="space-y-3">
            {/* simple select to avoid extra shadcn deps */}
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={draft.type}
              onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))}
            >
              <option>Run</option>
              <option>Lift</option>
              <option>Swim</option>
              <option>Bike</option>
              <option>Walk</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Duration (min)" value={draft.duration}
                     onChange={(e)=>setDraft(p=>({ ...p, duration: e.target.valueAsNumber || '' }))}/>
              <Input type="number" placeholder="Distance (optional)" value={draft.distance}
                     onChange={(e)=>setDraft(p=>({ ...p, distance: e.target.valueAsNumber || '' }))}/>
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : workouts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No workouts yet.</div>
          ) : (
            <ul className="space-y-2">
              {workouts.map((w) => (
                <li key={w.id} className="flex items-center justify-between rounded border px-3 py-2">
                  <div>
                    <div className="font-medium">{w.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {w.duration} min{w.distance ? ` • ${w.distance}` : ''}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeWorkout(w.id).then(refresh)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2">
            <div className="text-sm font-medium mb-1">Suggestions</div>
            {ideas.length === 0 ? (
              <div className="text-sm text-muted-foreground">No suggestions available.</div>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {ideas.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// export default function Workout() {
//   return <h2 className="text-2xl font-semibold">Workout</h2>;
// }