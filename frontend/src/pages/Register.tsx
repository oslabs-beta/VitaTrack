import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type FormData = { email: string; password: string; confirm: string };

export default function Register() {
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // TODO: wire to /auth/register then set auth + navigate('/')
    console.log('register payload:', data);
    toast.success('Pretend registration success (UI only)');
    nav('/');
  };

  const pw = watch('password');

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start tracking your health today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                aria-invalid={!!errors.confirm}
                {...register('confirm', {
                  required: 'Please confirm your password',
                  validate: (v) => v === pw || 'Passwords do not match',
                })}
              />
              {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button form="register-form" type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating…' : 'Register'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link className="underline" to="/login">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
