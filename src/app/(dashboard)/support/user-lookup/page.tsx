'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCircle, Mail, Shield, CheckCircle2, XCircle, Clock, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface UserLookupResult {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  phone: string | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function SupportUserLookupPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserLookupResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/support/user-lookup?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.users || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Lookup</h1>
        <p className="text-muted-foreground mt-1">Search for users to assist with account issues</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="shrink-0 h-9">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : searched && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                          <UserCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-semibold truncate">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 min-w-0">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3 shrink-0" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {user.roleName}
                        </Badge>
                        {user.isVerified ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                        {user.isActive ? (
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Active</Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      {user.lastLogin && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      )}
                      <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      <span>ID: {user.id.slice(0, 8)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : searched ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users found matching "{searchQuery}"</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <UserCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Enter a search query to find users</p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}