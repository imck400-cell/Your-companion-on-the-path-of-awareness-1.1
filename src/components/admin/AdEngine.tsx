import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, orderBy, limit, startAfter, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Megaphone, Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const AdEngine: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [newAd, setNewAd] = useState({ title: '', link: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchAds = async (loadMore = false) => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'ads'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      if (loadMore && lastVisible) {
        q = query(
          collection(db, 'ads'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);
      const newAds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (loadMore) {
        setAds(prev => [...prev, ...newAds]);
      } else {
        setAds(newAds);
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleAddAd = async () => {
    if (!newAd.title || !newAd.link) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'ads'), {
        ...newAd,
        createdAt: serverTimestamp()
      });
      setAds(prev => [{ id: docRef.id, ...newAd, createdAt: new Date() }, ...prev]);
      setNewAd({ title: '', link: '', imageUrl: '' });
      toast.success('تم إضافة الإعلان بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة الإعلان');
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ads', id));
      setAds(prev => prev.filter(ad => ad.id !== id));
      toast.success('تم حذف الإعلان');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            إضافة إعلان جديد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              placeholder="عنوان الإعلان" 
              value={newAd.title}
              onChange={(e) => setNewAd({...newAd, title: e.target.value})}
            />
            <Input 
              placeholder="رابط الإعلان" 
              value={newAd.link}
              onChange={(e) => setNewAd({...newAd, link: e.target.value})}
            />
            <Input 
              placeholder="رابط الصورة (اختياري)" 
              value={newAd.imageUrl}
              onChange={(e) => setNewAd({...newAd, imageUrl: e.target.value})}
            />
          </div>
          <Button onClick={handleAddAd} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            إضافة الإعلان
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.length === 0 && !loading ? (
          <Card className="col-span-full p-12 text-center text-muted-foreground">
            لا توجد إعلانات نشطة حالياً.
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden group">
              {ad.imageUrl && (
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{ad.title}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" render={
                      <a href={ad.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    } />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteAd(ad.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {hasMore && ads.length > 0 && !loading && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => fetchAds(true)}>
            تحميل المزيد
          </Button>
        </div>
      )}
    </div>
  );
};
