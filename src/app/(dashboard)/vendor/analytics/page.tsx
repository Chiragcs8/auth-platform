'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const monthlyData = [
  { month: 'Jan', revenue: 1200, orders: 15, views: 450 },
  { month: 'Feb', revenue: 1800, orders: 22, views: 620 },
  { month: 'Mar', revenue: 2400, orders: 30, views: 810 },
  { month: 'Apr', revenue: 2100, orders: 28, views: 750 },
  { month: 'May', revenue: 3200, orders: 42, views: 980 },
  { month: 'Jun', revenue: 2800, orders: 35, views: 870 },
];

const topProducts = [
  { name: 'Premium Package', sales: 42, revenue: 4200, trend: 'up' },
  { name: 'Standard Plan', sales: 28, revenue: 2800, trend: 'up' },
  { name: 'Basic Tier', sales: 15, revenue: 1500, trend: 'down' },
  { name: 'Enterprise Suite', sales: 8, revenue: 8000, trend: 'up' },
];

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your business performance and trends</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Revenue Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.map((data, index) => (
                <motion.div
                  key={data.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">{data.month}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold">${data.revenue}</p>
                      <p className="text-xs text-muted-foreground">{data.orders} orders</p>
                    </div>
                    <div className="text-right sm:hidden">
                      <p className="text-sm font-bold">${data.revenue}</p>
                    </div>
                    <div className="w-20 sm:w-24">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(data.revenue / 3200) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:inline">{data.views} views</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Products */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Products
            </CardTitle>
            <CardDescription>Best performing products by sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold">${product.revenue}</span>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {product.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      {product.trend === 'up' ? 'Up' : 'Down'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avg. Order Value</span>
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">$76.50</p>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Conversion Rate</span>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">3.2%</p>
              <p className="text-xs text-muted-foreground mt-1">Views to purchases</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Repeat Customers</span>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">28%</p>
              <p className="text-xs text-muted-foreground mt-1">Customer retention rate</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}