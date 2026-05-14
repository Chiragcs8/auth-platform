'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingCart, Heart, Clock, Package, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientStats {
  totalOrders: number;
  activeOrders: number;
  wishlistItems: number;
  recentViews: number;
}

interface RecentActivity {
  id: string;
  action: string;
  module: string;
  createdAt: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function ClientDashboardPage() {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/client/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
        }
      } catch {
        setStats({
          totalOrders: 0,
          activeOrders: 0,
          wishlistItems: 0,
          recentViews: 0,
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
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <p className="text-muted-foreground">Your orders, activity, and account overview</p>
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
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.wishlistItems || 0}</div>
              <p className="text-xs text-muted-foreground">Saved items</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentViews || 0}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest account events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.module}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Browse Products</p>
                <p className="text-xs text-muted-foreground">Explore available offerings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <Star className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium">Leave a Review</p>
                <p className="text-xs text-muted-foreground">Share your experience</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">View Wishlist</p>
                <p className="text-xs text-muted-foreground">Your saved items</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}