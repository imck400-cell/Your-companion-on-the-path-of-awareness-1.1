import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import * as Icons from 'lucide-react';
import { Plus, Trash2, Camera, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage, getBase64Size } from '@/lib/imageUtils';
import { GoogleGenAI } from "@google/genai";

export const HomeSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    announcements: { items: [], speed: 20, active: true },
    hero_slides: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);

  const translateText = async (text: string) => {
    if (!text || text.trim().length < 2) return "";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following Arabic text to English. Return ONLY the translated text without any explanations or quotes: "${text}"`,
      });
      return response.text?.trim() || "";
    } catch (error) {
      console.error("Translation error:", error);
      return "";
    }
  };

  const handleAutoTranslate = async (id: string, field: 'title' | 'description', arabicText: string) => {
    if (!arabicText) return;
    const loadingKey = `${id}-${field}`;
    setTranslating(loadingKey);
    const translated = await translateText(arabicText);
    if (translated) {
      const slide = settings.hero_slides.find((s: any) => s.id === id);
      if (slide) {
        updateSlide(id, field, { ...slide[field], en: translated });
      }
    }
    setTranslating(null);
  };

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
        items: [...settings.announcements.items, { text: 'إعلان جديد', link: '' }]
      }
    });
  };

  const updateAnnouncement = (index: number, field: 'text' | 'link', value: string) => {
    const newItems = [...settings.announcements.items];
    const prevItem = newItems[index];
    if (typeof prevItem === 'string') {
      newItems[index] = { text: field === 'text' ? value : prevItem, link: field === 'link' ? value : '' };
    } else {
      newItems[index] = { ...prevItem, [field]: value };
    }
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

  const handleSyncWithDefaults = async () => {
    toast.warning('هل أنت متأكد من رغبتك في إعادة ضبط إعدادات الصفحة الرئيسية إلى الافتراضية؟ سيؤدي هذا إلى مسح جميع التعديلات الحالية.', {
      action: {
        label: 'نعم، مزامنة',
        onClick: async () => {
          setSaving(true);
          try {
            const defaultSettings = {
              announcements: {
                items: ['مرحباً بكم في منصة رفيقك في طريق الوعي', 'اكتشف برامجنا التدريبية الجديدة لعام 2024'],
                speed: 20,
                active: true
              },
              hero_slides: [
                {
                  id: '1',
                  image: 'https://picsum.photos/seed/awareness1/1920/1080',
                  title: { ar: 'الوعي هو مفتاح التغيير', en: 'Awareness is the Key' },
                  description: { ar: 'رحلة تبدأ من الداخل لتغيير واقعك الخارجي', en: 'A journey that starts from within' },
                  interval: 5
                },
                {
                  id: '2',
                  image: 'https://picsum.photos/seed/awareness2/1920/1080',
                  title: { ar: 'تمكين القادة بالذكاء العاطفي', en: 'Empowering Leaders' },
                  description: { ar: 'بناء مؤسسات قائمة على القيم والوعي الإنساني', en: 'Building value-based organizations' },
                  interval: 5
                }
              ]
            };
            const docRef = doc(db, 'site_settings', 'home_page');
            await setDoc(docRef, {
              ...defaultSettings,
              updatedAt: serverTimestamp()
            });
            setSettings(defaultSettings);
            toast.success('تمت المزامنة مع الإعدادات الافتراضية بنجاح');
          } catch (error) {
            console.error('Error syncing settings:', error);
            toast.error('فشلت المزامنة');
          } finally {
            setSaving(false);
          }
        }
      }
    });
  };

  const IconWrapper = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => (
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden group/icon ${colorClass} shadow-sm border border-white/20 shrink-0`}>
      <div className="absolute top-0 right-0 w-6 h-6 bg-white/30 rotate-45 translate-x-3 -translate-y-3 group-hover/icon:scale-150 transition-transform duration-300" />
      <div className="relative z-10">{children}</div>
    </div>
  );

  if (loading) return <div className="p-8 text-center"><RefreshCw className="animate-spin inline-block mr-2" /> جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconWrapper colorClass="bg-primary/10 text-primary">
            <Icons.Settings className="h-6 w-6" />
          </IconWrapper>
          <h2 className="text-2xl font-bold">إعدادات الصفحة الرئيسية</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncWithDefaults} 
            disabled={saving}
            className="rounded-full border-primary/30 hover:bg-primary/10 transition-all"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            مزامنة مع الافتراضي
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-full px-8 shadow-lg hover:scale-105 transition-all">
            {saving ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {/* Announcements Section */}
      <Card className="rounded-3xl border-none shadow-sm glass-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <IconWrapper colorClass="bg-blue-500/10 text-blue-600">
              <Icons.Megaphone className="h-5 w-5" />
            </IconWrapper>
            <CardTitle className="text-xl">شريط الإعلانات المتحرك</CardTitle>
          </div>
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
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-blue-700 font-bold">سرعة الشريط (مستوى السرعة)</Label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {settings.announcements.speed > 80 ? 'سرعة فائقة' : settings.announcements.speed > 50 ? 'سريع جداً' : settings.announcements.speed > 30 ? 'سريع' : 'متوسط'}
                </span>
                <span className="text-xs font-medium text-muted-foreground">كلما زاد الرقم كان الشريط أسرع</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Slider 
                value={[settings.announcements.speed || 20]} 
                min={5} 
                max={100} 
                step={1}
                onValueChange={(val: any) => setSettings({
                  ...settings,
                  announcements: { ...settings.announcements, speed: Array.isArray(val) ? val[0] : val }
                })}
                className="flex-1"
              />
              <span className="font-bold w-12 text-center bg-primary/10 rounded-lg py-1">{settings.announcements.speed}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconWrapper colorClass="bg-blue-500/10 text-blue-600">
                  <Icons.List className="h-4 w-4" />
                </IconWrapper>
                <Label className="font-bold">نصوص الإعلانات</Label>
              </div>
              <Button size="sm" variant="outline" onClick={addAnnouncement} className="rounded-full hover:bg-blue-50 border-blue-200 text-blue-700">
                <Plus className="h-4 w-4 mr-1" /> إضافة إعلان
              </Button>
            </div>
            {settings.announcements.items.map((item: any, index: number) => {
              const textStr = typeof item === 'string' ? item : item.text || '';
              const linkStr = typeof item === 'string' ? '' : item.link || '';
              return (
              <div key={index} className="flex gap-2 group/item items-start">
                <div className="relative flex-1 space-y-2">
                  <Input 
                    value={textStr} 
                    onChange={(e) => updateAnnouncement(index, 'text', e.target.value)}
                    placeholder="نص الإعلان..."
                    className="rounded-xl border-blue-100 bg-blue-50/30 focus:bg-white transition-all pr-10"
                  />
                  <div className="absolute left-3 top-3 w-4 h-4 bg-white/40 rotate-45 pointer-events-none" />
                  <Input 
                    value={linkStr} 
                    onChange={(e) => updateAnnouncement(index, 'link', e.target.value)}
                    placeholder="رابط التوجيه (مثال: /p/managers-leaders/item-id) أو رابط خارجي"
                    className="rounded-xl border-blue-100 bg-blue-50/30 focus:bg-white transition-all text-left font-mono text-xs"
                    dir="ltr"
                  />
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeAnnouncement(index)} className="text-destructive hover:bg-destructive/10 rounded-xl mt-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )})}
          </div>
        </CardContent>
      </Card>

      {/* Hero Slides Section */}
      <Card className="rounded-3xl border-none shadow-sm glass-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <IconWrapper colorClass="bg-emerald-500/10 text-emerald-600">
              <Icons.Image className="h-5 w-5" />
            </IconWrapper>
            <CardTitle className="text-xl">معرض الصور العلوي (Hero Carousel)</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={addSlide} className="rounded-full hover:bg-emerald-50 border-emerald-200 text-emerald-700">
            <Plus className="h-4 w-4 mr-1" /> إضافة صورة
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {settings.hero_slides.map((slide: any) => (
            <div key={slide.id} className="p-6 rounded-3xl border bg-white/40 backdrop-blur-sm space-y-6 relative group border-white/20 shadow-sm hover:shadow-md transition-all">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => removeSlide(slide.id)} 
                className="absolute top-4 left-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-destructive hover:text-white rounded-full shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <IconWrapper colorClass="bg-blue-500/10 text-blue-600">
                      <Camera className="h-4 w-4" />
                    </IconWrapper>
                    <Label className="font-bold">الصورة</Label>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-muted relative border-2 border-dashed border-primary/20 group/img">
                    <img src={slide.image} alt="" className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="rounded-full shadow-lg"
                        onClick={() => handleSlideImageUpload(slide.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" /> تغيير الصورة
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconWrapper colorClass="bg-primary/10 text-primary">
                            <Icons.Type className="h-4 w-4" />
                          </IconWrapper>
                          <Label className="font-bold">العنوان (عربي)</Label>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-[10px] rounded-full bg-primary/5 hover:bg-primary/10"
                          onClick={() => handleAutoTranslate(slide.id, 'title', slide.title.ar)}
                          disabled={translating === `${slide.id}-title`}
                        >
                          {translating === `${slide.id}-title` ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'ترجمة تلقائية'}
                        </Button>
                      </div>
                      <Input 
                        value={slide.title.ar} 
                        onChange={(e) => updateSlide(slide.id, 'title', { ...slide.title, ar: e.target.value })}
                        className="rounded-xl border-primary/20 bg-primary/5 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconWrapper colorClass="bg-slate-500/10 text-slate-600">
                          <Icons.Languages className="h-4 w-4" />
                        </IconWrapper>
                        <Label className="font-bold">العنوان (English)</Label>
                      </div>
                      <Input 
                        value={slide.title.en} 
                        onChange={(e) => updateSlide(slide.id, 'title', { ...slide.title, en: e.target.value })}
                        className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconWrapper colorClass="bg-primary/10 text-primary">
                            <Icons.AlignRight className="h-4 w-4" />
                          </IconWrapper>
                          <Label className="font-bold">الوصف (عربي)</Label>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-[10px] rounded-full bg-primary/5 hover:bg-primary/10"
                          onClick={() => handleAutoTranslate(slide.id, 'description', slide.description.ar)}
                          disabled={translating === `${slide.id}-description`}
                        >
                          {translating === `${slide.id}-description` ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'ترجمة تلقائية'}
                        </Button>
                      </div>
                      <Input 
                        value={slide.description.ar} 
                        onChange={(e) => updateSlide(slide.id, 'description', { ...slide.description, ar: e.target.value })}
                        className="rounded-xl border-primary/20 bg-primary/5 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconWrapper colorClass="bg-slate-500/10 text-slate-600">
                          <Icons.AlignLeft className="h-4 w-4" />
                        </IconWrapper>
                        <Label className="font-bold">الوصف (English)</Label>
                      </div>
                      <Input 
                        value={slide.description.en} 
                        onChange={(e) => updateSlide(slide.id, 'description', { ...slide.description, en: e.target.value })}
                        className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconWrapper colorClass="bg-orange-500/10 text-orange-600">
                        <Icons.Clock className="h-4 w-4" />
                      </IconWrapper>
                      <Label className="font-bold">فترة العرض (ثواني)</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={[slide.interval || 5]} 
                        min={2} 
                        max={15} 
                        step={1}
                        onValueChange={(val: any) => updateSlide(slide.id, 'interval', Array.isArray(val) ? val[0] : val)}
                        className="flex-1"
                      />
                      <span className="font-bold w-12 text-center bg-orange-500/10 rounded-lg py-1">{slide.interval}s</span>
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
