'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Monitor, Smartphone, Trash2, Globe, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SessionItem {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  createdAt: string;
  isCurrent: boolean;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function getDeviceIcon(userAgent: string | null) {
  if (!userAgent) return <Monitor className="h-5 w-5 text-muted-foreground" />;
  if (/mobile|android|iphone|ipad/i.test(userAgent)) {
    return <Smartphone className="h-5 w-5 text-blue-500" />;
  }
  return <Monitor className="h-5 w-5 text-green-500" />;
}

function getBrowserName(userAgent: string | null): string {
  if (!userAgent) return 'Unknown Browser';
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  return 'Unknown Browser';
}

function getOSName(userAgent: string | null): string {
  if (!userAgent) return 'Unknown OS';
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad/i.test(userAgent)) return 'iOS';
  return 'Unknown OS';
}

export function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    setMessage(null);

    try {
      const res = await fetch(`/api/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
        setMessage({ type: 'success', text: 'Session revoked successfully' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to revoke session' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">Manage your active sessions and revoke unauthorized access</p>
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

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              {sessions.length} active session{sessions.length !== 1 ? 's' : ''} across your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active sessions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-3 px-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getDeviceIcon(session.userAgent)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {getBrowserName(session.userAgent)} on {getOSName(session.userAgent)}
                          </p>
                          {session.isCurrent && (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {session.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {session.ipAddress}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!session.isCurrent ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeSession(session.id)}
                          disabled={revoking === session.id}
                        >
                          {revoking === session.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Revoke
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Expires {new Date(session.expiresAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Warning */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-500">Security Notice</p>
                <p className="text-sm text-muted-foreground">
                  If you notice any unfamiliar sessions, revoke them immediately and change your password.
                  Always log out from shared or public devices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}