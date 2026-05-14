'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      currentPassword: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.message || 'Password verification failed. Please try again.');
        return;
      }

      // Redirect to reset-password page with the generated token
      if (result.token) {
        router.push(`/reset-password?token=${result.token}`);
      } else {
        setError('Reset token not received. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <ShieldCheck className="h-6 w-6" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Verify your identity by entering your email and current password to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...register('currentPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Verify & Continue
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              <ArrowLeft className="mr-1 h-3 w-3 inline" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}