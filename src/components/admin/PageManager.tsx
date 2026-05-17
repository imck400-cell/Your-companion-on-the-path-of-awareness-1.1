import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Move, FileText, RefreshCw } from 'lucide-react';
import { localDb } from '@/lib/localDb';
import { PageBuilder } from './PageBuilder';
import { toast } from 'sonner';
import { getCache, setCache } from '@/lib/cache';

export const PageManager: React.FC = () => {
  const { t } = useTranslation();
  const [pages, setPages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPages = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        const cachedPages = getCache('pages_data');
        if (cachedPages) {
          setPages(cachedPages);
          setLoading(false);
          return;
        }
        setLoading(true);
      }
      
      const fetchedPages = localDb.getCollection('pages').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setPages(fetchedPages);
      setCache('pages_data', fetchedPages);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSavePage = async (data: any) => {
    // Basic check for document size (Firestore limit is 1MB)
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 800000) { // ~800KB threshold to be safe
      toast.error('حجم البيانات كبير جداً. يرجى تقليل حجم الصور المرفوعة.');
      return;
    }

    try {
      if (editingPage) {
        localDb.updateDoc('pages', editingPage.id, data);
        const newPages = pages.map(p => p.id === editingPage.id ? { ...p, ...data } : p);
        setPages(newPages);
        setCache('pages_data', newPages);
        toast.success('تم تحديث الصفحة بنجاح');
      } else {
        const newDoc = localDb.addDoc('pages', {
          ...data,
          order: pages.length,
        });
        const newPages = [...pages, newDoc];
        setPages(newPages);
        setCache('pages_data', newPages);
        toast.success('تم إنشاء الصفحة بنجاح');
      }
      setIsEditing(false);
      setEditingPage(null);
    } catch (error: any) {
      console.error('Error saving page:', error);
      if (error.code === 'resource-exhausted' || error.message?.includes('too large')) {
        toast.error('حجم البيانات يتجاوز الحد المسموح به في قاعدة البيانات. يرجى ضغط الصور.');
      } else {
        toast.error('حدث خطأ أثناء حفظ الصفحة');
      }
    }
  };

  const handleDeletePage = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
      try {
        localDb.deleteDoc('pages', id);
        const newPages = pages.filter(p => p.id !== id);
        setPages(newPages);
        setCache('pages_data', newPages);
        toast.success('تم حذف الصفحة بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الصفحة');
      }
    }
  };

  const filteredPages = pages.filter(page => 
    page.title?.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing) {
    return (
      <PageBuilder 
        page={editingPage} 
        onSave={handleSavePage} 
        onCancel={() => {
          setIsEditing(false);
          setEditingPage(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">إدارة المحتوى</h2>
        <Button variant="outline" size="sm" onClick={() => fetchPages(true)} disabled={isRefreshing || loading}>
          <RefreshCw className={`w-4 h-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder={t('search')} 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => setIsEditing(true)}>
          <Plus className="h-4 w-4" />
          إضافة قسم جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredPages.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            لا توجد أقسام حالياً. ابدأ بإضافة قسم جديد.
          </Card>
        ) : (
          filteredPages.map((page) => (
            <Card key={page.id} className="group">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Move className="h-4 w-4 text-muted-foreground cursor-move" />
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                    {page.image ? (
                      <img src={page.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold">{page.title?.ar || 'بدون عنوان'}</h3>
                    <p className="text-sm text-muted-foreground">/{page.slug} ({page.items?.length || 0} فرع)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingPage(page);
                    setIsEditing(true);
                  }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePage(page.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
