'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Handshake, Users, DollarSign, TrendingUp, BarChart3, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function BrokerDashboardPage() {
  const [stats, setStats] = useState<BrokerStats | null>(null);
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/broker/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentDeals(data.recentDeals || []);
        }
      } catch {
        setStats({
          totalClients: 0,
          activeRelationships: 0,
          totalCommission: 0,
          pendingDeals: 0,
          completedDeals: 0,
          avgDealValue: 0,
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
        <h1 className="text-2xl font-bold">Broker Dashboard</h1>
        <p className="text-muted-foreground">Manage client relationships, deals, and commissions</p>
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
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">Managed accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Relationships</CardTitle>
              <Handshake className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeRelationships || 0}</div>
              <p className="text-xs text-muted-foreground">Current partnerships</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalCommission || 0}</div>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingDeals || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting completion</p>
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
            <CardTitle className="text-sm font-medium">Completed Deals</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedDeals || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Deal Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avgDealValue || 0}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
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
              <Handshake className="h-5 w-5" />
              Recent Deals
            </CardTitle>
            <CardDescription>Latest client transactions and partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeals.length > 0 ? (
              <div className="space-y-3">
                {recentDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Handshake className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{deal.clientName}</p>
                        <p className="text-xs text-muted-foreground">Deal #{deal.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">${deal.amount}</span>
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