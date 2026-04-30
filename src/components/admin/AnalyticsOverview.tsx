import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Eye, MousePointer2, Clock, RefreshCw } from 'lucide-react';
import { getCache, setCache } from '@/lib/cache';
import { Button } from '@/components/ui/button';

export const AnalyticsOverview: React.FC<{ full?: boolean }> = ({ full }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    views: 0,
    uniqueUsers: 0,
    clicks: 0,
    avgTime: '0:00'
  });

  const fetchAnalytics = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        const cachedData = getCache('analytics_data');
        const cachedStats = getCache('analytics_stats');
        if (cachedData && cachedStats) {
          setData(cachedData);
          setStats(cachedStats);
          setLoading(false);
          return;
        }
        setLoading(true);
      }
      
      const q = query(collection(db, 'analytics'), orderBy('timestamp', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => doc.data());
      
      // Group by day for chart
      const grouped = events.reduce((acc: any, event: any) => {
        const date = event.timestamp ? new Date(event.timestamp.toDate()).toLocaleDateString('ar-EG') : 'N/A';
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value })).reverse();
      
      // Simple stats
      const newStats = {
        views: events.filter(e => e.type === 'page_view').length,
        uniqueUsers: new Set(events.map(e => e.userId)).size,
        clicks: events.filter(e => e.type === 'click').length,
        avgTime: '2:45' // Mocked for now
      };

      setData(chartData);
      setStats(newStats);
      
      setCache('analytics_data', chartData);
      setCache('analytics_stats', newStats);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">التقارير والإحصائيات</h2>
        <Button variant="outline" size="sm" onClick={() => fetchAnalytics(true)} disabled={isRefreshing || loading}>
          <RefreshCw className={`w-4 h-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">زوار فريدون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي النقرات</CardTitle>
            <MousePointer2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">متوسط الوقت</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTime}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-4">نشاط الزوار (يومياً)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">معدل النمو</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--secondary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {full && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الأجهزة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Mobile</span>
                  <span className="font-bold">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Desktop</span>
                  <span className="font-bold">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tablet</span>
                  <span className="font-bold">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>أهم الدول</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>السعودية</span>
                  <span className="font-bold">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>مصر</span>
                  <span className="font-bold">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>الإمارات</span>
                  <span className="font-bold">15%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
