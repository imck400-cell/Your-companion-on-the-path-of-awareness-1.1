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
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden group/icon ${colorClass} shadow-sm border border-white/20 transition-all duration-300 group-data-[state=active]:scale-110 shrink-0`}>
      <div className="absolute top-0 right-0 w-6 h-6 bg-white/20 rotate-45 translate-x-3 -translate-y-3 group-hover/icon:translate-x-1 group-hover/icon:-translate-y-1 transition-transform" />
      <div className="relative z-10">{children}</div>
    </div>
  );

  const tabTriggerClass = "h-auto flex-none snap-start shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl p-3 shadow-sm border bg-white/50 backdrop-blur-sm transition-all hover:bg-white flex flex-col items-center justify-center gap-2 w-24 aspect-square";

  const TabContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative mt-4 rounded-3xl bg-gradient-to-br from-slate-50/95 to-slate-100/80 dark:from-slate-900/95 dark:to-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-xl p-6 md:p-8 overflow-hidden">
      {/* Decorative Triangles using CSS clip-path */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 dark:bg-primary/10 rotate-12" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-blue-500/5 dark:bg-blue-500/10 -rotate-12" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        <div className="absolute top-1/4 left-1/4 w-full h-full bg-purple-500/5 dark:bg-purple-500/5 rotate-45" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>
      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-primary">{t('admin_panel')}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 flex flex-col">
        <TabsList className="flex overflow-x-auto no-scrollbar gap-3 bg-transparent h-auto p-2 justify-start w-full snap-x">
          {hasPermission('overview') && (
            <TabsTrigger value="overview" className={tabTriggerClass}>
              <IconWrapper colorClass="bg-blue-500/10 text-blue-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                <LayoutDashboard className="h-5 w-5" />
              </IconWrapper>
              <span className="font-bold text-xs text-center leading-tight">{t('dashboard')}</span>
            </TabsTrigger>
          )}
          {hasPermission('pages') && (
            <TabsTrigger value="pages" className={tabTriggerClass}>
              <IconWrapper colorClass="bg-emerald-500/10 text-emerald-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                <FileText className="h-5 w-5" />
              </IconWrapper>
              <span className="font-bold text-xs text-center leading-tight">إدارة المحتوى</span>
            </TabsTrigger>
          )}
          {hasPermission('analytics') && (
            <TabsTrigger value="analytics" className={tabTriggerClass}>
              <IconWrapper colorClass="bg-purple-500/10 text-purple-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                <BarChart3 className="h-5 w-5" />
              </IconWrapper>
              <span className="font-bold text-xs text-center leading-tight">{t('analytics')}</span>
            </TabsTrigger>
          )}
          {hasPermission('tickets') && (
            <TabsTrigger value="tickets" className={tabTriggerClass}>
              <IconWrapper colorClass="bg-orange-500/10 text-orange-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                <MessageSquare className="h-5 w-5" />
              </IconWrapper>
              <span className="font-bold text-xs text-center leading-tight">{t('tickets')}</span>
            </TabsTrigger>
          )}
          {hasPermission('ads') && (
            <TabsTrigger value="ads" className={tabTriggerClass}>
              <IconWrapper colorClass="bg-pink-500/10 text-pink-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                <Megaphone className="h-5 w-5" />
              </IconWrapper>
              <span className="font-bold text-xs text-center leading-tight">{t('ads')}</span>
            </TabsTrigger>
          )}
          {hasPermission('home_settings') && (
            <TabsTrigger value="home_settings" className={tabTriggerClass}>
              <IconWrapper colorClass="bg-primary/20 text-primary group-data-[state=active]:bg-white/30 group-data-[state=active]:text-white">
                <Settings className="h-5 w-5" />
              </IconWrapper>
              <span className="font-bold text-xs text-center leading-tight">إعدادات الواجهة</span>
            </TabsTrigger>
          )}
          {hasPermission('settings') && (
            <TabsTrigger value="settings" className={tabTriggerClass}>
              <IconWrapper colorClass="bg-slate-500/10 text-slate-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                <Settings className="h-5 w-5" />
              </IconWrapper>
              <span className="font-bold text-xs text-center leading-tight">{t('settings')}</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="w-full">
          {hasPermission('overview') ? (
            <TabContentWrapper>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('active_users')}</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,284</div>
                    <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 shadow-sm">
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
            </TabContentWrapper>
          ) : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="pages" className="w-full">
          {hasPermission('pages') ? <TabContentWrapper><PageManager /></TabContentWrapper> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="analytics" className="w-full">
          {hasPermission('analytics') ? <TabContentWrapper><AnalyticsOverview full /></TabContentWrapper> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="tickets" className="w-full">
          {hasPermission('tickets') ? <TabContentWrapper><TicketSystem /></TabContentWrapper> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="ads" className="w-full">
          {hasPermission('ads') ? <TabContentWrapper><AdEngine /></TabContentWrapper> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="home_settings" className="w-full">
          {hasPermission('home_settings') ? <TabContentWrapper><HomeSettings /></TabContentWrapper> : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>

        <TabsContent value="settings" className="w-full">
          {hasPermission('settings') ? (
            <TabContentWrapper>
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 shadow-sm">
                <CardHeader>
                  <CardTitle>{t('settings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">إدارة الحساب والصلاحيات</h3>
                    <p className="text-muted-foreground text-sm">تحكم في بياناتك الشخصية وصلاحيات الوصول للمديرين الآخرين.</p>
                    <AccountManagement />
                  </div>
                  
                  <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                    <p className="text-muted-foreground">إعدادات المنصة العامة والاشتراكات</p>
                  </div>
                </CardContent>
              </Card>
            </TabContentWrapper>
          ) : <div className="p-12 text-center text-muted-foreground">لا تملك صلاحية الوصول لهذه اللوحة</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
