import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createMeal, listToday, removeMeal, aiLookup, type Meal } from '@/api/food';

export default function Food() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [draft, setDraft] = useState({
    name: '',
    calories: '' as number | '',
    protein: '' as number | '',
    carbs: '' as number | '',
    fat: '' as number | '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);   // ← AI lookup state
  const [lastEstimate, setLastEstimate] = useState<string>(''); // optional display

  const refresh = async () => {
    setLoading(true);
    try { setMeals(await listToday()); } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const totals = useMemo(() => {
    return meals.reduce(
      (a, m) => ({
        calories: a.calories + (m.calories || 0),
        protein: a.protein + (m.protein || 0),
        carbs: a.carbs + (m.carbs || 0),
        fat: a.fat + (m.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  const runLookup = async () => {
    if (!draft.name) return toast.error('Enter a food name first');
    try {
      setLookupLoading(true);
      const est = await aiLookup(draft.name);
      // prefill the form with the estimate (user can still edit)
      setDraft((p) => ({
        ...p,
        name: est.name || p.name,
        calories: est.calories ?? p.calories,
        protein: est.protein ?? p.protein,
        carbs: est.carbs ?? p.carbs,
        fat: est.fat ?? p.fat,
      }));
      setLastEstimate(`${est.calories} cal • P:${est.protein ?? 0} C:${est.carbs ?? 0} F:${est.fat ?? 0}`);
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
      });
      toast.success('Meal added');
      setDraft({ name: '', calories: '', protein: '', carbs: '', fat: '' });
      setLastEstimate('');
      await refresh();
    } catch {
      toast.error('Failed to add meal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Add meal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            {/* Name + AI Lookup row */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g., Chicken salad with avocado"
                value={draft.name}
                onChange={(e)=>setDraft(p=>({ ...p, name: e.target.value }))}
              />
              <Button type="button" variant="outline" onClick={runLookup} disabled={lookupLoading}>
                {lookupLoading ? 'AI…' : 'AI Lookup'}
              </Button>
            </div>
            {lastEstimate && (
              <div className="text-xs text-muted-foreground">Estimate: {lastEstimate}</div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <Input type="number" placeholder="Calories" value={draft.calories}
                     onChange={(e)=>setDraft(p=>({ ...p, calories: e.target.valueAsNumber || '' }))}/>
              <Input type="number" placeholder="Protein" value={draft.protein}
                     onChange={(e)=>setDraft(p=>({ ...p, protein: e.target.valueAsNumber || '' }))}/>
              <Input type="number" placeholder="Carbs" value={draft.carbs}
                     onChange={(e)=>setDraft(p=>({ ...p, carbs: e.target.valueAsNumber || '' }))}/>
              <Input type="number" placeholder="Fat" value={draft.fat}
                     onChange={(e)=>setDraft(p=>({ ...p, fat: e.target.valueAsNumber || '' }))}/>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Today</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">Calories: <b>{totals.calories}</b> • P:{totals.protein} C:{totals.carbs} F:{totals.fat}</div>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : meals.length === 0 ? (
            <div className="text-sm text-muted-foreground">No meals yet.</div>
          ) : (
            <ul className="space-y-2">
              {meals.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded border px-3 py-2">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.calories} cal • P:{m.protein||0} C:{m.carbs||0} F:{m.fat||0}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeMeal(m.id).then(refresh)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// import { useEffect, useMemo, useState } from 'react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { createMeal, listToday, removeMeal, type Meal } from '@/api/food';

// export default function Food() {
//   const [meals, setMeals] = useState<Meal[]>([]);
//   const [draft, setDraft] = useState({
//     name: '',
//     calories: '' as number | '' ,
//     protein: '' as number | '' ,
//     carbs: '' as number | '' ,
//     fat: '' as number | '' ,
//   });
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const refresh = async () => {
//     setLoading(true);
//     try { setMeals(await listToday()); } finally { setLoading(false); }
//   };

//   useEffect(() => { refresh(); }, []);

//   const totals = useMemo(() => {
//     return meals.reduce(
//       (a, m) => ({
//         calories: a.calories + (m.calories || 0),
//         protein: a.protein + (m.protein || 0),
//         carbs: a.carbs + (m.carbs || 0),
//         fat: a.fat + (m.fat || 0),
//       }),
//       { calories: 0, protein: 0, carbs: 0, fat: 0 }
//     );
//   }, [meals]);

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!draft.name || !draft.calories) return toast.error('Name and calories are required');
//     setSubmitting(true);
//     try {
//       await createMeal({
//         name: draft.name,
//         calories: Number(draft.calories) || 0,
//         protein: Number(draft.protein) || 0,
//         carbs: Number(draft.carbs) || 0,
//         fat: Number(draft.fat) || 0,
//       });
//       toast.success('Meal added');
//       setDraft({ name: '', calories: '', protein: '', carbs: '', fat: '' });
//       await refresh();
//     } catch {
//       toast.error('Failed to add meal');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="grid gap-6 md:grid-cols-2">
//       <Card>
//         <CardHeader><CardTitle>Add meal</CardTitle></CardHeader>
//         <CardContent>
//           <form onSubmit={submit} className="space-y-3">
//             <Input placeholder="Name" value={draft.name}
//                    onChange={(e)=>setDraft(p=>({ ...p, name: e.target.value }))}/>
//             <div className="grid grid-cols-4 gap-2">
//               <Input type="number" placeholder="Calories" value={draft.calories}
//                      onChange={(e)=>setDraft(p=>({ ...p, calories: e.target.valueAsNumber || '' }))}/>
//               <Input type="number" placeholder="Protein" value={draft.protein}
//                      onChange={(e)=>setDraft(p=>({ ...p, protein: e.target.valueAsNumber || '' }))}/>
//               <Input type="number" placeholder="Carbs" value={draft.carbs}
//                      onChange={(e)=>setDraft(p=>({ ...p, carbs: e.target.valueAsNumber || '' }))}/>
//               <Input type="number" placeholder="Fat" value={draft.fat}
//                      onChange={(e)=>setDraft(p=>({ ...p, fat: e.target.valueAsNumber || '' }))}/>
//             </div>
//             <Button type="submit" disabled={submitting}>
//               {submitting ? 'Adding…' : 'Add'}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader><CardTitle>Today</CardTitle></CardHeader>
//         <CardContent className="space-y-3">
//           <div className="text-sm">Calories: <b>{totals.calories}</b> • P:{totals.protein} C:{totals.carbs} F:{totals.fat}</div>
//           {loading ? (
//             <div className="text-sm text-muted-foreground">Loading…</div>
//           ) : meals.length === 0 ? (
//             <div className="text-sm text-muted-foreground">No meals yet.</div>
//           ) : (
//             <ul className="space-y-2">
//               {meals.map((m) => (
//                 <li key={m.id} className="flex items-center justify-between rounded border px-3 py-2">
//                   <div>
//                     <div className="font-medium">{m.name}</div>
//                     <div className="text-xs text-muted-foreground">
//                       {m.calories} cal • P:{m.protein||0} C:{m.carbs||0} F:{m.fat||0}
//                     </div>
//                   </div>
//                   <Button variant="outline" size="sm" onClick={() => removeMeal(m.id).then(refresh)}>
//                     Delete
//                   </Button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

