import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Move, FileText } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PageBuilder } from './PageBuilder';
import { toast } from 'sonner';

export const PageManager: React.FC = () => {
  const { t } = useTranslation();
  const [pages, setPages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'pages'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      // Ignored
    });
    return () => unsubscribe();
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
        await updateDoc(doc(db, 'pages', editingPage.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
        toast.success('تم تحديث الصفحة بنجاح');
      } else {
        await addDoc(collection(db, 'pages'), {
          ...data,
          order: pages.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
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
        await deleteDoc(doc(db, 'pages', id));
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
        {filteredPages.length === 0 ? (
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
