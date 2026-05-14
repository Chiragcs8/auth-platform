'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MailCheck, MailX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your email for the correct link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await res.json();

        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(result.message || 'Email verification failed. Please try again.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {status === 'loading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <h2 className="text-xl font-bold">Verifying Email...</h2>
                  <p className="text-muted-foreground">Please wait while we verify your email address.</p>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <MailCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold">Email Verified!</h2>
                  <p className="text-muted-foreground">{message}</p>
                  <Link href="/login">
                    <Button className="mt-4">Sign In Now</Button>
                  </Link>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <MailX className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold">Verification Failed</h2>
                  <p className="text-muted-foreground">{message}</p>
                  <div className="flex gap-3 mt-4">
                    <Link href="/login">
                      <Button variant="outline">Back to Login</Button>
                    </Link>
                    <Link href="/register">
                      <Button>Register Again</Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}