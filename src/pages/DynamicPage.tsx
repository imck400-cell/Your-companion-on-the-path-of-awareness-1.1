import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Users, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { compressImage, getBase64Size } from '@/lib/imageUtils';

import { handleFirestoreError, OperationType } from '@/lib/firestoreErrorHandler';

const DynamicPage: React.FC = () => {
  const { slug, itemId } = useParams<{ slug: string; itemId?: string }>();
  const { isSuperAdmin, profile } = useAuth();
  const [page, setPage] = useState<any>(null);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // Try matching by slug first
        let q = query(collection(db, 'pages'), where('slug', '==', slug));
        let querySnapshot = await getDocs(q);
        
        // If not found by slug, try matching by common titles for special pages
        if (querySnapshot.empty) {
          const specialTitles: Record<string, string> = {
            'training-courses': 'الدورات التدريبية الحالية',
            'about': 'من نحن'
          };
          
          if (specialTitles[slug]) {
            q = query(collection(db, 'pages'), where('title.ar', '==', specialTitles[slug]));
            querySnapshot = await getDocs(q);
          }
        }

        if (!querySnapshot.empty) {
          const pageData = querySnapshot.docs[0].data();
          setPage({ id: querySnapshot.docs[0].id, ...pageData });
          
          if (itemId && pageData.items) {
            const foundItem = pageData.items.find((i: any) => i.id === itemId);
            if (foundItem) {
              setItem(foundItem);
              trackEvent('item_view', { hub: slug, itemId });
            } else {
              setItem(null);
            }
          } else {
            setItem(null);
          }
          
          trackEvent('page_view', { page: slug, pageId: querySnapshot.docs[0].id });
        } else {
          // If still not found, wait a bit or redirect
          console.warn(`Page not found for slug: ${slug}`);
          navigate('/');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `pages/${slug}`);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, itemId, navigate]);

  if (loading) {
    return (
      <div className="space-y-8 py-12">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!page) return null;

  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const hasFullPermissions = isSuperAdmin || profile?.permissions?.includes('all');

  const handleImageUpload = async (itemId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      // Initial check to prevent extremely large files from crashing the browser
      if (file.size > 5 * 1024 * 1024) {
        toast.error(lang === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)' : 'File size too large (Max 5MB)');
        return;
      }

      try {
        const base64String = await compressImage(file, 1000, 750, 0.6);
        const size = getBase64Size(base64String);
        
        // Final check for compressed size
        if (size > 300 * 1024) {
          toast.error(lang === 'ar' ? 'الصورة لا تزال كبيرة جداً، يرجى اختيار صورة أصغر' : 'Image is still too large, please choose a smaller one');
          return;
        }

        const docRef = doc(db, 'pages', page.id);
        const updatedItems = page.items.map((item: any) => 
          item.id === itemId ? { ...item, image: base64String } : item
        );
        await updateDoc(docRef, { items: updatedItems, updatedAt: serverTimestamp() });
        setPage({ ...page, items: updatedItems });
        toast.success(lang === 'ar' ? 'تم تحديث الصورة بنجاح' : 'Image updated successfully');
      } catch (error: any) {
        console.error('Error updating image:', error);
        if (error.message?.includes('exceeds the maximum allowed size')) {
          toast.error(lang === 'ar' ? 'فشل التحديث: حجم الصفحة تجاوز الحد المسموح به في قاعدة البيانات' : 'Update failed: Page size exceeded database limit');
        } else {
          toast.error(lang === 'ar' ? 'فشل تحديث الصورة' : 'Failed to update image');
        }
      }
    };
    input.click();
  };

  if (item) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-12 px-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/p/${slug}`)}
          className="rounded-full px-6 border-primary/20 hover:bg-primary/5"
        >
          {lang === 'ar' ? <ChevronRight className="ml-2 h-5 w-5" /> : <ChevronLeft className="mr-2 h-5 w-5" />}
          {lang === 'ar' ? 'العودة للقسم' : 'Back to Section'}
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {item.image && (
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src={item.image} 
                alt="" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary leading-tight">
              {item.title?.[lang] || item.title?.ar}
            </h1>
            <div className="h-1.5 w-24 bg-primary rounded-full" />
          </div>

          <Card className="border-none shadow-sm glass-card p-6 md:p-10 rounded-3xl">
            <CardContent className="p-0 prose prose-lg dark:prose-invert max-w-none">
              <div className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap text-foreground/90 font-light">
                {item.content?.[lang] || item.content?.ar}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8 border-b border-primary/5 pb-8 md:pb-16">
        {/* Left: Back Button */}
        <div className="shrink-0 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="rounded-full w-full md:w-auto px-6 md:px-8 py-4 md:py-6 border-primary/10 hover:bg-primary/5 shadow-sm text-base md:text-lg font-medium"
          >
            {lang === 'ar' ? <ChevronRight className="ml-2 h-5 w-5" /> : <ChevronLeft className="mr-2 h-5 w-5" />}
            {lang === 'ar' ? 'الرئيسية' : 'Home'}
          </Button>
        </div>

        {/* Center/Right: Title and Description */}
        <div className="flex-1 flex flex-col md:flex-row items-center md:justify-end gap-6 md:gap-12 w-full">
          <div className="text-center md:text-right space-y-2 md:space-y-4 w-full">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-7xl font-heading font-bold text-primary tracking-tight leading-tight"
            >
              {page.title?.[lang] || page.title?.ar || 'بدون عنوان'}
            </motion.h1>
            <p className="text-base md:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-medium mx-auto md:ml-0">
              {page.description?.[lang] || page.description?.ar}
            </p>
          </div>

          {/* Far Right: Icon/Rafiq */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-2xl md:rounded-[3rem] bg-muted/40 flex items-center justify-center overflow-hidden border-4 md:border-8 border-white shadow-xl md:shadow-2xl relative group">
              {page.image ? (
                <img 
                  src={page.image} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <Users className="w-10 h-10 md:w-20 md:h-20 text-primary/20" />
              )}
            </div>
            <span className="font-bold text-sm md:text-xl text-primary whitespace-nowrap bg-white/50 px-4 py-1 rounded-full backdrop-blur-sm">
              {lang === 'ar' ? 'رفيقك في طريق الوعي' : 'Your companion on the path of awareness'}
            </span>
          </div>
        </div>
      </div>

      {!page.items || page.items.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-[3rem] border-4 border-dashed border-primary/10">
          <p className="text-muted-foreground text-xl font-medium">
            {lang === 'ar' ? 'سيتم إضافة المحتوى قريباً...' : 'Content coming soon...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {page.items.map((item: any, index: number) => {
            const itemColors = [
              { border: 'border-blue-500/50', bg: 'bg-blue-500/5', text: 'text-blue-700', shadow: 'shadow-blue-500/10' },
              { border: 'border-emerald-500/50', bg: 'bg-emerald-500/5', text: 'text-emerald-700', shadow: 'shadow-emerald-500/10' },
              { border: 'border-purple-500/50', bg: 'bg-purple-500/5', text: 'text-purple-700', shadow: 'shadow-purple-500/10' },
              { border: 'border-orange-500/50', bg: 'bg-orange-500/5', text: 'text-orange-700', shadow: 'shadow-orange-500/10' },
              { border: 'border-pink-500/50', bg: 'bg-pink-500/5', text: 'text-pink-700', shadow: 'shadow-pink-500/10' },
              { border: 'border-cyan-500/50', bg: 'bg-cyan-500/5', text: 'text-cyan-700', shadow: 'shadow-cyan-500/10' }
            ];
            const color = itemColors[index % itemColors.length];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/p/${slug}/${item.id}`)}
              >
                <Card className={`h-full hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] transition-all duration-500 cursor-pointer group border-4 md:border-[12px] border-white/90 glass-card overflow-hidden flex flex-col rounded-2xl md:rounded-[3.5rem] shadow-xl relative p-0 py-0 ring-0 ${color.bg} ${color.shadow}`}>
                  {hasFullPermissions && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-4 right-4 z-20 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageUpload(item.id);
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                  <div className={`absolute inset-0 border-2 ${color.border} rounded-2xl md:rounded-[3.5rem] pointer-events-none`} />
                  {item.image && (
                    <div className="w-full aspect-video overflow-hidden border-b-2 border-inherit">
                      <img 
                        src={item.image} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2 md:pb-4 pt-4 md:pt-8 px-4 md:px-8">
                    <CardTitle className={`font-heading text-xl md:text-3xl group-hover:scale-105 transition-transform line-clamp-2 leading-tight ${color.text}`}>
                      {item.title?.[lang] || item.title?.ar}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 px-4 md:px-8 pb-4 md:pb-8">
                    <p className="text-muted-foreground line-clamp-3 text-sm md:text-lg leading-relaxed font-light">
                      {item.content?.[lang] || item.content?.ar}
                    </p>
                  </CardContent>
                  <div className="px-4 md:px-8 pb-4 md:pb-8 mt-auto">
                    <div className={`flex items-center text-xs md:text-sm font-bold group-hover:gap-3 transition-all bg-white/50 w-fit px-3 md:px-4 py-1.5 md:py-2 rounded-full ${color.text}`}>
                      <span>{lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}</span>
                      {lang === 'ar' ? <ChevronLeft className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DynamicPage;
