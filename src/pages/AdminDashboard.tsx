import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, FileText, BarChart3, MessageSquare, Megaphone, Settings } from 'lucide-react';
import { AnalyticsOverview } from '@/components/admin/AnalyticsOverview';
import { PageManager } from '@/components/admin/PageManager';
import { TicketSystem } from '@/components/admin/TicketSystem';
import { AdEngine } from '@/components/admin/AdEngine';
import { AccountManagement } from '@/components/admin/AccountManagement';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { profile, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const hasPermission = (featureId: string) => {
    if (isSuperAdmin) return true;
    return profile?.permissions?.includes('all') || profile?.permissions?.includes(featureId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">{t('admin_panel')}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-transparent h-auto">
          {hasPermission('overview') && (
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              {t('dashboard')}
            </TabsTrigger>
          )}
          {hasPermission('pages') && (
            <TabsTrigger value="pages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              إدارة المحتوى
            </TabsTrigger>
          )}
          {hasPermission('analytics') && (
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('analytics')}
            </TabsTrigger>
          )}
          {hasPermission('tickets') && (
            <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('tickets')}
            </TabsTrigger>
          )}
          {hasPermission('ads') && (
            <TabsTrigger value="ads" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Megaphone className="h-4 w-4 mr-2" />
              {t('ads')}
            </TabsTrigger>
          )}
          {hasPermission('settings') && (
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4 mr-2" />
              {t('settings')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          {hasPermission('overview') ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('active_users')}</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,284</div>
                    <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('total_views')}</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">45,231</div>
                    <p className="text-xs text-muted-foreground">+5% من الأسبوع الماضي</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <AnalyticsOverview />
              </div>
            </>
          ) : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="pages">
          {hasPermission('pages') ? <PageManager /> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="analytics">
          {hasPermission('analytics') ? <AnalyticsOverview full /> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="tickets">
          {hasPermission('tickets') ? <TicketSystem /> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="ads">
          {hasPermission('ads') ? <AdEngine /> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="settings">
          {hasPermission('settings') ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">إدارة الحساب والصلاحيات</h3>
                  <p className="text-muted-foreground text-sm">تحكم في بياناتك الشخصية وصلاحيات الوصول للمديرين الآخرين.</p>
                  <AccountManagement />
                </div>
                
                <div className="pt-6 border-t">
                  <p className="text-muted-foreground">إعدادات المنصة العامة والاشتراكات</p>
                </div>
              </CardContent>
            </Card>
          ) : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
