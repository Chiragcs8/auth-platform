'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, UserX, Mail, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'active' && user.isActive) ||
                          (filter === 'inactive' && !user.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all system users</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
                  All
                </Button>
                <Button variant={filter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('active')}>
                  <UserCheck className="mr-1 h-3 w-3" /> Active
                </Button>
                <Button variant={filter === 'inactive' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('inactive')}>
                  <UserX className="mr-1 h-3 w-3" /> Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>Total registered users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar alt={user.fullName} size="sm" />
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {user.roleName}
                      </Badge>
                      {user.isVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                      {user.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}