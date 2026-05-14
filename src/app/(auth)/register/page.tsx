'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Loader2, Check, AlertCircle } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { ROLE_NAMES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleName: 'Client',
    },
  });

  const password = watch('password');

  const passwordChecks = {
    length: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    lowercase: /[a-z]/.test(password || ''),
    number: /\d/.test(password || ''),
  };

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.message || 'Registration failed. Please try again.');
        return;
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border shadow-xl backdrop-blur-sm bg-card/95 overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Link href="/" className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity">
              <span className="font-bold text-lg">AP</span>
            </Link>
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground/80">Sign up to get started with AuthPlatform</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                disabled={isLoading}
                className="h-11 transition-colors"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isLoading}
                className="h-11 transition-colors"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleName" className="text-sm font-medium">Role</Label>
              <Select
                id="roleName"
                disabled={isLoading}
                className="h-11 transition-colors"
                {...register('roleName')}
              >
                {ROLE_NAMES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Select>
              {errors.roleName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.roleName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-11 pr-10 transition-colors"
                  {...register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 px-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {password && (
                <div className="space-y-1.5 mt-2 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 text-xs">
                    <Check className={`h-3.5 w-3.5 ${passwordChecks.length ? 'text-green-500' : 'text-muted-foreground/60'}`} />
                    <span className={passwordChecks.length ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground/60'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check className={`h-3.5 w-3.5 ${passwordChecks.uppercase ? 'text-green-500' : 'text-muted-foreground/60'}`} />
                    <span className={passwordChecks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground/60'}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check className={`h-3.5 w-3.5 ${passwordChecks.lowercase ? 'text-green-500' : 'text-muted-foreground/60'}`} />
                    <span className={passwordChecks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground/60'}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check className={`h-3.5 w-3.5 ${passwordChecks.number ? 'text-green-500' : 'text-muted-foreground/60'}`} />
                    <span className={passwordChecks.number ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground/60'}>One number</span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-11 pr-10 transition-colors"
                  {...register('confirmPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 px-0 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline underline-offset-4 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}