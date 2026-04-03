import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSquare, Clock, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const TicketSystem: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tickets', id), { status });
      toast.success('تم تحديث حالة التذكرة');
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه التذكرة؟')) {
      try {
        await deleteDoc(doc(db, 'tickets', id));
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
        {tickets.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground">
            لا توجد تذاكر حالياً.
          </Card>
        )}
      </div>
    </div>
  );
};
