'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TicketCheck, Search, Filter, Plus, Clock, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface TicketItem {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
  closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  escalated: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (search) params.set('search', search);

        const res = await fetch(`/api/support/tickets?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets || []);
        }
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [statusFilter, search]);

  const filteredTickets = tickets.filter((ticket) =>
    ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
    ticket.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tickets</h1>
            <p className="text-muted-foreground">Manage and respond to support requests</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tickets List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketCheck className="h-5 w-5" />
              Support Tickets
            </CardTitle>
            <CardDescription>{filteredTickets.length} tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredTickets.length > 0 ? (
              <div className="space-y-3">
                {filteredTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between py-3 px-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          #{ticket.id.slice(0, 8)} • {ticket.assignee || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={priorityColors[ticket.priority] || ''}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className={statusColors[ticket.status] || ''}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TicketCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tickets found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}