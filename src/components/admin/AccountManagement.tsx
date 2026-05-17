import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { localDb } from '@/lib/localDb';
import { toast } from 'sonner';
import { UserCog, Plus, Trash2, Shield, Calendar, RefreshCw } from 'lucide-react';
import { getCache, setCache } from '@/lib/cache';

const FEATURES = [
  { id: 'overview', label: 'لوحة القيادة' },
  { id: 'pages', label: 'إدارة الصفحات' },
  { id: 'analytics', label: 'الإحصائيات' },
  { id: 'tickets', label: 'التذاكر والاستفسارات' },
  { id: 'ads', label: 'محرك الإعلانات' },
  { id: 'home_settings', label: 'إعدادات الواجهة' },
  { id: 'settings', label: 'الإعدادات' },
];

export const AccountManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    displayName: '',
    permissions: [] as string[],
    expiryDate: '',
  });

  const fetchAdmins = async (forceRefresh = false) => {
    if (!isSuperAdmin) return;
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        const cachedAdmins = getCache('admins_data');
        if (cachedAdmins) {
          setAdmins(cachedAdmins);
          setLoadingAdmins(false);
          return;
        }
        setLoadingAdmins(true);
      }

      const allUsers = localDb.getCollection('users');
      const fetchedAdmins = allUsers.filter((u: any) => u.role === 'admin' || u.role === 'super_admin');
      setAdmins(fetchedAdmins);
      setCache('admins_data', fetchedAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoadingAdmins(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && isSuperAdmin && admins.length === 0) {
      fetchAdmins();
    }
  }, [isOpen, isSuperAdmin]);

  const handleTogglePermission = (featureId: string) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: prev.permissions.includes(featureId)
        ? prev.permissions.filter(id => id !== featureId)
        : [...prev.permissions, featureId]
    }));
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.displayName) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    try {
      // In a real app, we might check if user exists or send an invite
      // For this demo, we'll just create a placeholder in 'users' collection
      // The user will get these permissions when they log in with this email
      localDb.addDoc('users_invites', {
        ...newAdmin,
        role: 'admin',
        invitedBy: user?.uid,
      });
      
      toast.success('تم إرسال الدعوة/إضافة المدير بنجاح');
      setIsAddModalOpen(false);
      setNewAdmin({ email: '', displayName: '', permissions: [], expiryDate: '' });
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة');
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger render={
          <Button variant="outline" className="w-full gap-2">
            <UserCog className="h-4 w-4" />
            إدارة الحساب والصلاحيات
          </Button>
        } />
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              إدارة الحساب والصلاحيات
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current User Info */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">بياناتك الحالية</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الاسم</Label>
                  <p className="font-medium">{profile?.displayName}</p>
                </div>
                <div>
                  <Label>كود الدخول (UID)</Label>
                  <p className="font-mono text-xs break-all">{user?.uid}</p>
                </div>
                <div>
                  <Label>الدور</Label>
                  <p className="font-medium">{profile?.role === 'super_admin' ? 'مدير عام' : 'مدير'}</p>
                </div>
                {profile?.expiryDate && (
                  <div>
                    <Label>تاريخ انتهاء الصلاحية</Label>
                    <p className="font-medium text-destructive">{new Date(profile.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Permissions List */}
            <div className="space-y-3">
              <h3 className="font-bold">صلاحياتك النشطة</h3>
              <div className="grid grid-cols-2 gap-2">
                {FEATURES.map(feature => (
                  <div key={feature.id} className="flex items-center gap-2 p-2 border rounded-md bg-background">
                    <Checkbox 
                      id={`perm-${feature.id}`} 
                      checked={profile?.permissions?.includes('all') || profile?.permissions?.includes(feature.id)} 
                      disabled 
                    />
                    <Label htmlFor={`perm-${feature.id}`} className="cursor-default">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Super Admin Section: Manage Other Admins */}
            {isSuperAdmin && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">إدارة المديرين</h3>
                    <Button variant="ghost" size="icon" onClick={() => fetchAdmins(true)} disabled={isRefreshing || loadingAdmins} className="h-6 w-6">
                      <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1">
                    <Plus className="h-4 w-4" />
                    إضافة مدير جديد
                  </Button>
                </div>

                <div className="space-y-2">
                  {loadingAdmins ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {admins.filter(a => a.id !== user?.uid).map(admin => (
                        <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div>
                            <p className="font-bold">{admin.displayName}</p>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{admin.role}</Badge>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {admins.length <= 1 && (
                        <p className="text-center text-sm text-muted-foreground py-4">لا يوجد مديرون آخرون حالياً</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Admin Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مدير جديد وتحديد الصلاحيات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input 
                type="email" 
                placeholder="example@gmail.com" 
                value={newAdmin.email}
                onChange={e => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم الكامل</Label>
              <Input 
                placeholder="اسم المدير" 
                value={newAdmin.displayName}
                onChange={e => setNewAdmin(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ انتهاء الصلاحية (اختياري)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  className="pl-10"
                  value={newAdmin.expiryDate}
                  onChange={e => setNewAdmin(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>تحديد الصلاحيات</Label>
              <div className="grid grid-cols-2 gap-2">
                {FEATURES.map(feature => (
                  <div key={feature.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <Checkbox 
                      id={`new-perm-${feature.id}`} 
                      checked={newAdmin.permissions.includes(feature.id)}
                      onCheckedChange={() => handleTogglePermission(feature.id)}
                    />
                    <Label htmlFor={`new-perm-${feature.id}`} className="cursor-pointer">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleAddAdmin} className="w-full mt-4">إضافة ومنح الصلاحيات</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'outline' }> = ({ children, variant = 'default' }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
    variant === 'default' ? 'bg-primary text-primary-foreground' : 'border border-primary text-primary'
  }`}>
    {children}
  </span>
);
