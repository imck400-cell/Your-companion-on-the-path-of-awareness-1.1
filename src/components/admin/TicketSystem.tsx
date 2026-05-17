import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { localDb } from '@/lib/localDb';
import { MessageSquare, Clock, AlertCircle, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getCache, setCache } from '@/lib/cache';

export const TicketSystem: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const fetchTickets = async (loadMore = false, forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else if (!loadMore) {
        const cachedTickets = getCache('tickets_data');
        if (cachedTickets) {
          setTickets(cachedTickets);
          const cachedHasMore = getCache('tickets_hasMore');
          if (cachedHasMore !== null) setHasMore(cachedHasMore);
          setLoading(false);
          return;
        }
        setLoading(true);
      } else {
        setLoading(true);
      }
      
      const fetchedTickets = localDb.getCollection('tickets').sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ).slice((loadMore && lastVisible ? lastVisible : 0), (loadMore && lastVisible ? lastVisible : 0) + PAGE_SIZE);
      
      if (loadMore) {
        const newData = [...tickets, ...fetchedTickets];
        setTickets(newData);
        setCache('tickets_data', newData);
      } else {
        setTickets(fetchedTickets);
        setCache('tickets_data', fetchedTickets);
      }

      setLastVisible((loadMore && lastVisible ? lastVisible : 0) + PAGE_SIZE);
      const moreAvailable = fetchedTickets.length === PAGE_SIZE;
      setHasMore(moreAvailable);
      setCache('tickets_hasMore', moreAvailable);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      localDb.updateDoc('tickets', id, { status });
      const updatedTickets = tickets.map(t => t.id === id ? { ...t, status } : t);
      setTickets(updatedTickets);
      setCache('tickets_data', updatedTickets);
      toast.success('تم تحديث حالة التذكرة');
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه التذكرة؟')) {
      try {
        localDb.deleteDoc('tickets', id);
        const updatedTickets = tickets.filter(t => t.id !== id);
        setTickets(updatedTickets);
        setCache('tickets_data', updatedTickets);
        toast.success('تم حذف التذكرة');
      } catch (error) {
        toast.error('حدث خطأ أثناء الحذف');
      }
    }
  };

  const stats = {
    total: tickets.length,
    unanswered: tickets.filter(t => t.status === 'unanswered' || t.status === 'pending').length,
    urgent: tickets.filter(t => t.status === 'urgent').length,
    answered: tickets.filter(t => t.status === 'answered' || t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الدعم والتذاكر</h2>
        <Button variant="outline" size="sm" onClick={() => fetchTickets(false, true)} disabled={isRefreshing || loading}>
          <RefreshCw className={`w-4 h-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">الإجمالي</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">غير مجابة</p>
              <p className="text-2xl font-bold">{stats.unanswered}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">عاجلة</p>
              <p className="text-2xl font-bold">{stats.urgent}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">تمت الإجابة</p>
              <p className="text-2xl font-bold">{stats.answered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{ticket.question || ticket.subject}</h3>
                  <Badge variant={ticket.status === 'urgent' ? 'destructive' : 'secondary'}>
                    {ticket.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">بواسطة: {ticket.userName || ticket.userId} ({ticket.userEmail})</p>
                {ticket.message && <p className="text-sm mt-2">{ticket.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdateStatus(ticket.id, ticket.status === 'answered' ? 'unanswered' : 'answered')}
                >
                  {ticket.status === 'answered' ? 'إعادة فتح' : 'تمت الإجابة'}
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTicket(ticket.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && !loading && (
          <Card className="p-12 text-center text-muted-foreground">
            لا توجد تذاكر حالياً.
          </Card>
        )}
        {loading && (
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {hasMore && tickets.length > 0 && !loading && (
          <Button variant="outline" className="w-full" onClick={() => fetchTickets(true)}>
            تحميل المزيد
          </Button>
        )}
      </div>
    </div>
  );
};
