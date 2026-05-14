'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Handshake, Users, DollarSign, TrendingUp, BarChart3, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCachedFetch } from '@/hooks/use-cached-fetch';
import { CLIENT_TTL, dashboardKey } from '@/store/data-store';

interface BrokerStats {
  totalClients: number;
  activeRelationships: number;
  totalCommission: number;
  pendingDeals: number;
  completedDeals: number;
  avgDealValue: number;
}

interface RecentDeal {
  id: string;
  clientName: string;
  amount: number;
  status: string;
  createdAt: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface BrokerDashboardData {
  stats: BrokerStats;
  recentDeals: RecentDeal[];
}

export default function BrokerDashboardPage() {
  const { data, loading } = useCachedFetch<BrokerDashboardData>(
    dashboardKey('broker'),
    '/api/broker/dashboard',
    { ttl: CLIENT_TTL.DASHBOARD_STATS }
  );

  const stats = data?.stats ?? null;
  const recentDeals = data?.recentDeals ?? [];

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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Broker Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage client relationships, deals, and commissions</p>
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
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Managed accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Relationships</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Handshake className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeRelationships || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Current partnerships</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalCommission || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total earned</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingDeals || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
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
            <CardTitle className="text-sm font-medium">Completed Deals</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedDeals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Deal Value</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avgDealValue || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Deals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              Recent Deals
            </CardTitle>
            <CardDescription>Latest client transactions and partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeals.length > 0 ? (
              <div className="space-y-3">
                {recentDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{deal.clientName}</p>
                        <p className="text-xs text-muted-foreground truncate">Deal #{deal.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">${deal.amount}</span>
                      <Badge variant="secondary">{deal.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Handshake className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No deals yet. Start building client relationships!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}