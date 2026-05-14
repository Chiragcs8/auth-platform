'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, TicketCheck, Users, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function SupportDashboardPage() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/support/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentTickets(data.recentTickets || []);
        }
      } catch {
        setStats({
          openTickets: 0,
          resolvedToday: 0,
          avgResponseTime: '0 min',
          totalUsersHelped: 0,
          escalatedTickets: 0,
          satisfactionRate: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <h1 className="text-2xl font-bold">Support Dashboard</h1>
        <p className="text-muted-foreground">Manage tickets, assist users, and track performance</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <TicketCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resolvedToday || 0}</div>
              <p className="text-xs text-muted-foreground">Tickets closed today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgResponseTime || '0 min'}</div>
              <p className="text-xs text-muted-foreground">First response time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Users Helped</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsersHelped || 0}</div>
              <p className="text-xs text-muted-foreground">Total assisted</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Escalated Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.escalatedTickets || 0}</div>
            <p className="text-xs text-muted-foreground">Require senior attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.satisfactionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Customer satisfaction score</p>
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
              <TicketCheck className="h-5 w-5" />
              Recent Tickets
            </CardTitle>
            <CardDescription>Latest support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTickets.length > 0 ? (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <TicketCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">Ticket #{ticket.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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