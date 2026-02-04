'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from '@/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '../providers/AuthProvider';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface SigninFormData {
  email?: string;
  password?: string;
}

export default function SigninPage() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm<SigninFormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      if (token && userParam) {
          try {
              const user = JSON.parse(decodeURIComponent(userParam));
              login(token, user);
          } catch (e) {
              console.error('Failed to parse user from URL', e);
          }
      }
  }, [searchParams, login]);

  const onSubmit = async (data: SigninFormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to sign in');
      }

      const json = await res.json();
      login(json.access_token, json.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <Card className="w-full max-w-md shadow-lg border-opacity-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <p className="text-sm text-center text-muted-foreground">Enter your email and password to access your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
              <Input
                placeholder="m@example.com"
                type="email"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <span className="text-sm text-destructive">{errors.email.message as string}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
              <Input
                placeholder="********"
                type="password"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <span className="text-sm text-destructive">{errors.password.message as string}</span>}
            </div>
            {error && <div className="text-sm text-destructive text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              className="w-full"
              disabled={loading}
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
              }}
            >
              Sign in with Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
                Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
