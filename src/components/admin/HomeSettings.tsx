import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Camera, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage, getBase64Size } from '@/lib/imageUtils';

export const HomeSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    announcements: { items: [], speed: 20, active: true },
    hero_slides: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'home_page');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'site_settings', 'home_page');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const addAnnouncement = () => {
    setSettings({
      ...settings,
      announcements: {
        ...settings.announcements,
        items: [...settings.announcements.items, 'إعلان جديد']
      }
    });
  };

  const updateAnnouncement = (index: number, value: string) => {
    const newItems = [...settings.announcements.items];
    newItems[index] = value;
    setSettings({
      ...settings,
      announcements: { ...settings.announcements, items: newItems }
    });
  };

  const removeAnnouncement = (index: number) => {
    const newItems = settings.announcements.items.filter((_: any, i: number) => i !== index);
    setSettings({
      ...settings,
      announcements: { ...settings.announcements, items: newItems }
    });
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      image: 'https://picsum.photos/seed/hero/1920/1080',
      title: { ar: 'عنوان الإعلان', en: 'Hero Title' },
      description: { ar: 'وصف الإعلان يظهر هنا', en: 'Hero description goes here' },
      interval: 5
    };
    setSettings({
      ...settings,
      hero_slides: [...settings.hero_slides, newSlide]
    });
  };

  const updateSlide = (id: string, field: string, value: any) => {
    const newSlides = settings.hero_slides.map((slide: any) => 
      slide.id === id ? { ...slide, [field]: value } : slide
    );
    setSettings({ ...settings, hero_slides: newSlides });
  };

  const handleSlideImageUpload = async (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const base64String = await compressImage(file, 1200, 800, 0.6);
        const size = getBase64Size(base64String);
        if (size > 400 * 1024) {
          toast.error('الصورة كبيرة جداً، يرجى اختيار صورة أصغر');
          return;
        }
        updateSlide(id, 'image', base64String);
      } catch (error) {
        toast.error('فشل تحميل الصورة');
      }
    };
    input.click();
  };

  const removeSlide = (id: string) => {
    setSettings({
      ...settings,
      hero_slides: settings.hero_slides.filter((s: any) => s.id !== id)
    });
  };

  if (loading) return <div className="p-8 text-center"><RefreshCw className="animate-spin inline-block mr-2" /> جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إعدادات الصفحة الرئيسية</h2>
        <Button onClick={handleSave} disabled={saving} className="rounded-full px-8">
          {saving ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* Announcements Section */}
      <Card className="rounded-3xl border-none shadow-sm glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">شريط الإعلانات المتحرك</CardTitle>
          <div className="flex items-center gap-4">
            <Label htmlFor="ticker-active">تفعيل</Label>
            <Switch 
              id="ticker-active" 
              checked={settings.announcements.active} 
              onCheckedChange={(val) => setSettings({
                ...settings,
                announcements: { ...settings.announcements, active: val }
              })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>سرعة الشريط (ثواني)</Label>
            <div className="flex items-center gap-4">
              <Slider 
                value={[settings.announcements.speed || 20]} 
                min={5} 
                max={60} 
                step={1}
                onValueChange={(val: any) => setSettings({
                  ...settings,
                  announcements: { ...settings.announcements, speed: Array.isArray(val) ? val[0] : val }
                })}
                className="flex-1"
              />
              <span className="font-bold w-12">{settings.announcements.speed}s</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>نصوص الإعلانات</Label>
              <Button size="sm" variant="outline" onClick={addAnnouncement} className="rounded-full">
                <Plus className="h-4 w-4 mr-1" /> إضافة إعلان
              </Button>
            </div>
            {settings.announcements.items.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input 
                  value={item} 
                  onChange={(e) => updateAnnouncement(index, e.target.value)}
                  placeholder="نص الإعلان..."
                  className="rounded-xl"
                />
                <Button size="icon" variant="ghost" onClick={() => removeAnnouncement(index)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hero Slides Section */}
      <Card className="rounded-3xl border-none shadow-sm glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">معرض الصور العلوي (Hero Carousel)</CardTitle>
          <Button size="sm" variant="outline" onClick={addSlide} className="rounded-full">
            <Plus className="h-4 w-4 mr-1" /> إضافة صورة
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {settings.hero_slides.map((slide: any) => (
            <div key={slide.id} className="p-6 rounded-2xl border bg-white/50 space-y-6 relative group">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => removeSlide(slide.id)} 
                className="absolute top-2 left-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <Label>الصورة</Label>
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted relative border-2 border-dashed border-primary/20">
                    <img src={slide.image} alt="" className="w-full h-full object-cover" />
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute inset-0 m-auto w-fit h-fit rounded-full shadow-lg"
                      onClick={() => handleSlideImageUpload(slide.id)}
                    >
                      <Camera className="h-4 w-4 mr-2" /> تغيير الصورة
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>العنوان (عربي)</Label>
                      <Input 
                        value={slide.title.ar} 
                        onChange={(e) => updateSlide(slide.id, 'title', { ...slide.title, ar: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>العنوان (English)</Label>
                      <Input 
                        value={slide.title.en} 
                        onChange={(e) => updateSlide(slide.id, 'title', { ...slide.title, en: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الوصف (عربي)</Label>
                      <Input 
                        value={slide.description.ar} 
                        onChange={(e) => updateSlide(slide.id, 'description', { ...slide.description, ar: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف (English)</Label>
                      <Input 
                        value={slide.description.en} 
                        onChange={(e) => updateSlide(slide.id, 'description', { ...slide.description, en: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>فترة العرض (ثواني)</Label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={[slide.interval || 5]} 
                        min={2} 
                        max={15} 
                        step={1}
                        onValueChange={(val: any) => updateSlide(slide.id, 'interval', Array.isArray(val) ? val[0] : val)}
                        className="flex-1"
                      />
                      <span className="font-bold w-12">{slide.interval}s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {settings.hero_slides.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl">
              لا توجد صور في المعرض حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
