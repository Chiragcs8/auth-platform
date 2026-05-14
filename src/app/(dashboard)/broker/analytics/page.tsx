'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const monthlyData = [
  { month: 'Jan', commission: 800, deals: 4, clients: 2 },
  { month: 'Feb', commission: 1200, deals: 6, clients: 3 },
  { month: 'Mar', commission: 1800, deals: 8, clients: 4 },
  { month: 'Apr', commission: 1500, deals: 7, clients: 3 },
  { month: 'May', commission: 2400, deals: 10, clients: 5 },
  { month: 'Jun', commission: 2100, deals: 9, clients: 4 },
];

const clientSegments = [
  { segment: 'Enterprise', count: 5, revenue: 15000, trend: 'up' },
  { segment: 'Mid-Market', count: 12, revenue: 8500, trend: 'up' },
  { segment: 'Small Business', count: 8, revenue: 3200, trend: 'down' },
  { segment: 'Individual', count: 15, revenue: 1800, trend: 'up' },
];

export default function BrokerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your brokerage performance and client metrics</p>
          </div>
          <div className="flex items-center gap-2">
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

      {/* Commission Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Commission Overview
            </CardTitle>
            <CardDescription>Monthly commission and deal trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <motion.div
                  key={data.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{data.month}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold">${data.commission}</p>
                      <p className="text-xs text-muted-foreground">{data.deals} deals • {data.clients} new clients</p>
                    </div>
                    <div className="w-24">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(data.commission / 2400) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Client Segments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Segments
            </CardTitle>
            <CardDescription>Performance by client category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientSegments.map((segment, index) => (
                <motion.div
                  key={segment.segment}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center justify-between py-3 px-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{segment.segment}</p>
                    <p className="text-xs text-muted-foreground">{segment.count} clients</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">${segment.revenue}</span>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {segment.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      {segment.trend === 'up' ? 'Growing' : 'Declining'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Avg. Deal Size</span>
              </div>
              <p className="text-2xl font-bold">$2,450</p>
              <p className="text-xs text-muted-foreground">+8% from last quarter</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Client Retention</span>
              </div>
              <p className="text-2xl font-bold">92%</p>
              <p className="text-xs text-muted-foreground">Year-over-year retention</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">Commission Rate</span>
              </div>
              <p className="text-2xl font-bold">3.5%</p>
              <p className="text-xs text-muted-foreground">Average commission rate</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}