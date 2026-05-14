'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, Shield, Loader2, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function SecurityPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = form.watch('newPassword');
  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
  };

  const onSubmit = async (data: ChangePasswordInput) => {
    setChanging(true);
    setMessage(null);

    try {
      const res = await fetch('/api/security/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        form.reset();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to change password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground mt-1">Manage your password and security settings</p>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-500 border-green-500/20'
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password with a strong, unique password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...form.register('currentPassword')}
                      className="pl-9 pr-9"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.currentPassword && (
                    <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      {...form.register('newPassword')}
                      className="pl-9 pr-9"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>
                  )}

                  {/* Password Strength Indicators */}
                  {newPassword && (
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.length ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                        <span className={passwordChecks.length ? 'text-green-500' : 'text-amber-500'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.uppercase ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                        <span className={passwordChecks.uppercase ? 'text-green-500' : 'text-amber-500'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.lowercase ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                        <span className={passwordChecks.lowercase ? 'text-green-500' : 'text-amber-500'}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.number ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                        <span className={passwordChecks.number ? 'text-green-500' : 'text-amber-500'}>
                          One number
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...form.register('confirmNewPassword')}
                      className="pl-9 pr-9"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmNewPassword && (
                    <p className="text-xs text-destructive">{form.formState.errors.confirmNewPassword.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={changing} className="w-full h-11">
                  {changing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
              <CardDescription>Your account security status and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Password Strength</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 shrink-0">Strong</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Lock className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Encryption</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 shrink-0">bcrypt (12 rounds)</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <KeyRound className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-sm">Session Auth</span>
                </div>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 shrink-0">JWT + HttpOnly</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-sm">Two-Factor Auth</span>
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 shrink-0">Not Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Use a unique password you don't use on other sites</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Enable two-factor authentication when available</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Review your active sessions regularly</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Never share your password or session tokens</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}