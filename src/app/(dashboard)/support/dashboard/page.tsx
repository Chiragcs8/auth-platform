'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, TicketCheck, Users, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCachedFetch } from '@/hooks/use-cached-fetch';
import { CLIENT_TTL, dashboardKey } from '@/store/data-store';

interface SupportStats {
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: string;
  totalUsersHelped: number;
  escalatedTickets: number;
  satisfactionRate: number;
}

interface RecentTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface SupportDashboardData {
  stats: SupportStats;
  recentTickets: RecentTicket[];
}

export default function SupportDashboardPage() {
  const { data, loading } = useCachedFetch<SupportDashboardData>(
    dashboardKey('support'),
    '/api/support/dashboard',
    { ttl: CLIENT_TTL.DASHBOARD_STATS }
  );

  const stats = data?.stats ?? null;
  const recentTickets = data?.recentTickets ?? [];

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Support Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage tickets, assist users, and track performance</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
      >
        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TicketCheck className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resolvedToday || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Tickets closed today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgResponseTime || '0 min'}</div>
              <p className="text-xs text-muted-foreground mt-1">First response time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users Helped</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsersHelped || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total assisted</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3 sm:gap-6"
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated Tickets</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.escalatedTickets || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Require senior attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.satisfactionRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Customer satisfaction score</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketCheck className="h-5 w-5 text-primary" />
              Recent Tickets
            </CardTitle>
            <CardDescription>Latest support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTickets.length > 0 ? (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">Ticket #{ticket.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={
                          ticket.priority === 'high'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : ticket.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-green-500/10 text-green-500 border-green-500/20'
                        }
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge variant="secondary">{ticket.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TicketCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tickets assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}