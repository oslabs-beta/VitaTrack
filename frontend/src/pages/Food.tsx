import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function Food() {
return (
  <div className="animate-in fade-in-50 duration-300">
    <Button onClick={() => toast.success('Animated!')}>Test</Button>
  </div>
);
}
