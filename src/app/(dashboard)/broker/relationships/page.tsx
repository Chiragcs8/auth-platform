'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Search, Plus, Users, Building2, Phone, Mail, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface RelationshipItem {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  companyName: string | null;
  status: string;
  dealCount: number;
  totalValue: number;
  rating: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  vip: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export default function BrokerRelationshipsPage() {
  const [relationships, setRelationships] = useState<RelationshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const res = await fetch('/api/broker/relationships');
        if (res.ok) {
          const data = await res.json();
          setRelationships(data.relationships || []);
        }
      } catch {
        setRelationships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, []);

  const filteredRelationships = relationships.filter((r) =>
    r.clientName.toLowerCase().includes(search.toLowerCase()) ||
    r.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
    (r.companyName && r.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Relationships</h1>
            <p className="text-muted-foreground">Manage your client partnerships and connections</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Relationships List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              Client Relationships
            </CardTitle>
            <CardDescription>{filteredRelationships.length} clients</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : filteredRelationships.length > 0 ? (
              <div className="space-y-3">
                {filteredRelationships.map((rel, index) => (
                  <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-4 px-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{rel.clientName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{rel.clientEmail}</span>
                        </div>
                        {rel.companyName && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>{rel.companyName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{rel.dealCount} deals</p>
                        <p className="text-xs text-muted-foreground">${rel.totalValue} total</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="text-xs">{rel.rating}</span>
                      </div>
                      <Badge variant="outline" className={statusColors[rel.status] || ''}>
                        {rel.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Handshake className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No client relationships found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}