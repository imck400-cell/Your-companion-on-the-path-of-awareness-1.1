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
import { HomeSettings } from '@/components/admin/HomeSettings';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { profile, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const hasPermission = (featureId: string) => {
    if (isSuperAdmin) return true;
    return profile?.permissions?.includes('all') || profile?.permissions?.includes(featureId);
  };

  const IconWrapper = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => (
    <div className={`relative p-1.5 rounded-md overflow-hidden group/icon ${colorClass} mr-2`}>
      <div className="absolute top-0 right-0 w-3 h-3 bg-white/20 rotate-45 translate-x-1.5 -translate-y-1.5 group-hover/icon:scale-150 transition-transform" />
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-primary">{t('admin_panel')}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-3 bg-transparent h-auto p-0 justify-start">
          {hasPermission('overview') && (
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 shadow-sm border bg-white/50 backdrop-blur-sm transition-all hover:bg-white">
              <IconWrapper colorClass="bg-blue-500/10 text-blue-600 group-data-[state=active]/icon:bg-white/20 group-data-[state=active]/icon:text-white">
                <LayoutDashboard className="h-4 w-4" />
              </IconWrapper>
              {t('dashboard')}
            </TabsTrigger>
          )}
          {hasPermission('pages') && (
            <TabsTrigger value="pages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 shadow-sm border bg-white/50 backdrop-blur-sm transition-all hover:bg-white">
              <IconWrapper colorClass="bg-emerald-500/10 text-emerald-600 group-data-[state=active]/icon:bg-white/20 group-data-[state=active]/icon:text-white">
                <FileText className="h-4 w-4" />
              </IconWrapper>
              إدارة المحتوى
            </TabsTrigger>
          )}
          {hasPermission('analytics') && (
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 shadow-sm border bg-white/50 backdrop-blur-sm transition-all hover:bg-white">
              <IconWrapper colorClass="bg-purple-500/10 text-purple-600 group-data-[state=active]/icon:bg-white/20 group-data-[state=active]/icon:text-white">
                <BarChart3 className="h-4 w-4" />
              </IconWrapper>
              {t('analytics')}
            </TabsTrigger>
          )}
          {hasPermission('tickets') && (
            <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 shadow-sm border bg-white/50 backdrop-blur-sm transition-all hover:bg-white">
              <IconWrapper colorClass="bg-orange-500/10 text-orange-600 group-data-[state=active]/icon:bg-white/20 group-data-[state=active]/icon:text-white">
                <MessageSquare className="h-4 w-4" />
              </IconWrapper>
              {t('tickets')}
            </TabsTrigger>
          )}
          {hasPermission('ads') && (
            <TabsTrigger value="ads" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 shadow-sm border bg-white/50 backdrop-blur-sm transition-all hover:bg-white">
              <IconWrapper colorClass="bg-pink-500/10 text-pink-600 group-data-[state=active]/icon:bg-white/20 group-data-[state=active]/icon:text-white">
                <Megaphone className="h-4 w-4" />
              </IconWrapper>
              {t('ads')}
            </TabsTrigger>
          )}
          {hasPermission('home_settings') && (
            <TabsTrigger value="home_settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 shadow-sm border bg-white/50 backdrop-blur-sm transition-all hover:bg-white border-primary/30">
              <IconWrapper colorClass="bg-primary/10 text-primary group-data-[state=active]/icon:bg-white/20 group-data-[state=active]/icon:text-white">
                <Settings className="h-4 w-4" />
              </IconWrapper>
              إعدادات الواجهة
            </TabsTrigger>
          )}
          {hasPermission('settings') && (
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 shadow-sm border bg-white/50 backdrop-blur-sm transition-all hover:bg-white">
              <IconWrapper colorClass="bg-slate-500/10 text-slate-600 group-data-[state=active]/icon:bg-white/20 group-data-[state=active]/icon:text-white">
                <Settings className="h-4 w-4" />
              </IconWrapper>
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

        <TabsContent value="home_settings">
          {hasPermission('home_settings') ? <HomeSettings /> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
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
