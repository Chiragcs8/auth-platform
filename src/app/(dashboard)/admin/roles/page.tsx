'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoleItem {
  id: string;
  roleName: string;
  userCount: number;
  description: string;
}

const roleDescriptions: Record<string, string> = {
  Admin: 'Full system control with user management, analytics, and configuration oversight',
  Vendor: 'Manage products, orders, and business operations with comprehensive dashboards',
  Client: 'Browse services, manage orders, and track deliveries with an intuitive interface',
  'Support Staff': 'Handle tickets, resolve issues, and maintain customer satisfaction metrics',
  Broker: 'Facilitate transactions, manage commissions, and analyze market opportunities',
};

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/admin/roles');
        if (res.ok) {
          const data = await res.json();
          setRoles(data.roles || []);
        }
      } catch {
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">View and manage system roles and their permissions</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
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
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        {role.roleName}
                      </CardTitle>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
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