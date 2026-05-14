'use client';

import { motion } from 'framer-motion';
import { Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCachedFetch } from '@/hooks/use-cached-fetch';
import { CLIENT_TTL, rolesKey } from '@/store/data-store';

interface RoleItem {
  id: string;
  roleName: string;
  userCount: number;
  description: string;
}

interface RolesData {
  roles: RoleItem[];
}

const roleDescriptions: Record<string, string> = {
  Admin: 'Full system control with user management, analytics, and configuration oversight',
  Vendor: 'Manage products, orders, and business operations with comprehensive dashboards',
  Client: 'Browse services, manage orders, and track deliveries with an intuitive interface',
  'Support Staff': 'Handle tickets, resolve issues, and maintain customer satisfaction metrics',
  Broker: 'Facilitate transactions, manage commissions, and analyze market opportunities',
};

const roleColors: Record<string, string> = {
  Admin: 'bg-red-500/10 text-red-500',
  Vendor: 'bg-indigo-500/10 text-indigo-500',
  Client: 'bg-blue-500/10 text-blue-500',
  'Support Staff': 'bg-amber-500/10 text-amber-500',
  Broker: 'bg-emerald-500/10 text-emerald-500',
};

export default function AdminRolesPage() {
  const { data, loading } = useCachedFetch<RolesData>(
    rolesKey(),
    '/api/admin/roles',
    { ttl: CLIENT_TTL.ROLE_LIST }
  );

  const roles = data?.roles ?? [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground mt-1">View and manage system roles and their permissions</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {(loading && !data) ? (
            [...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${roleColors[role.roleName] || 'bg-primary/10 text-primary'}`}>
                          <Shield className="h-4 w-4" />
                        </div>
                        {role.roleName}
                      </CardTitle>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {role.userCount} users
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {roleDescriptions[role.roleName] || 'System role with specific permissions'}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}