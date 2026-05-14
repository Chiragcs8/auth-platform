'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCachedFetch } from '@/hooks/use-cached-fetch';
import { CLIENT_TTL, activityKey } from '@/store/data-store';

interface ActivityLogItem {
  id: string;
  action: string;
  module: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string | null;
  createdAt: string;
}

interface ActivityLogsData {
  logs: ActivityLogItem[];
}

const actionColors: Record<string, string> = {
  LOGIN_SUCCESS: 'bg-green-500/10 text-green-500 border-green-500/20',
  LOGIN_FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
  REGISTER: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  LOGOUT: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  PASSWORD_RESET: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  EMAIL_VERIFIED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  PROFILE_UPDATE: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  USER_DEACTIVATED: 'bg-red-500/10 text-red-500 border-red-500/20',
  USER_ACTIVATED: 'bg-green-500/10 text-green-500 border-green-500/20',
};

export default function AdminActivityLogsPage() {
  const { data, loading } = useCachedFetch<ActivityLogsData>(
    activityKey(),
    '/api/admin/activity-logs',
    { ttl: CLIENT_TTL.ACTIVITY_LOGS }
  );

  const logs = data?.logs ?? [];
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const modules = ['auth', 'profile', 'admin', 'session', 'password'];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = !search ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(search));
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">Monitor system events and user actions</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action, or IP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All Modules</option>
                  {modules.map((m) => (
                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Events
            </CardTitle>
            <CardDescription>
              {filteredLogs.length} events recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(loading && !data) ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="space-y-2">
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge
                        variant="outline"
                        className={actionColors[log.action] || 'bg-muted text-muted-foreground border-muted'}
                      >
                        {log.action}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{log.userName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {log.userEmail} • {log.module}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      {log.ipAddress && (
                        <span className="hidden sm:inline">{log.ipAddress}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No activity logs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}