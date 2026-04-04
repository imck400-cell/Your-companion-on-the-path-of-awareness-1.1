import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { trackEvent } from '@/lib/analytics';
import { collection, onSnapshot, query, orderBy, getDocs, serverTimestamp, doc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { DEFAULT_HUBS } from '@/data/defaultPages';
import { useAuth } from '@/context/AuthContext';
import { compressImage, getBase64Size } from '@/lib/imageUtils';
import * as Icons from 'lucide-react';
import { AnnouncementTicker } from '@/components/AnnouncementTicker';
import { HeroCarousel } from '@/components/HeroCarousel';

import { handleFirestoreError, OperationType } from '@/lib/firestoreErrorHandler';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isSuperAdmin, profile } = useAuth();
  const [hubs, setHubs] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('page_view', { page: 'home' });
    
    const seedDefaultPages = async () => {
      const pagesRef = collection(db, 'pages');
      try {
        const snapshot = await getDocs(pagesRef);
        
        // Only seed if the collection is empty
        if (snapshot.empty) {
          for (const hub of DEFAULT_HUBS) {
            const docRef = doc(db, 'pages', hub.slug);
            await setDoc(docRef, {
              ...hub,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        }

        // Seed default site settings
        const settingsRef = doc(db, 'site_settings', 'home_page');
        const settingsSnap = await getDoc(settingsRef);
        if (!settingsSnap.exists()) {
          await setDoc(settingsRef, {
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
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'pages');
      }
    };
    seedDefaultPages();

    const q = query(collection(db, 'pages'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setHubs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pages');
    });

    const settingsUnsubscribe = onSnapshot(doc(db, 'site_settings', 'home_page'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error('Site settings error:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      settingsUnsubscribe();
    };
  }, []);

  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';

  const handleSyncWithDefaults = async () => {
    if (!isSuperAdmin) return;
    
    toast.warning(lang === 'ar' ? 'هل أنت متأكد من رغبتك في إعادة ضبط جميع الصفحات إلى الإعدادات الافتراضية؟ سيؤدي هذا إلى مسح جميع التعديلات الحالية.' : 'Are you sure you want to reset all pages to defaults? This will erase all current modifications.', {
      action: {
        label: lang === 'ar' ? 'نعم، مزامنة' : 'Yes, sync',
        onClick: async () => {
          setLoading(true);
          try {
            for (const hub of DEFAULT_HUBS) {
              const docRef = doc(db, 'pages', hub.slug);
              await setDoc(docRef, {
                ...hub,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            }
            toast.success(lang === 'ar' ? 'تمت المزامنة مع الإعدادات الافتراضية بنجاح' : 'Synced with defaults successfully');
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'pages');
            toast.error(lang === 'ar' ? 'فشل المزامنة' : 'Sync failed');
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };
  const hasFullPermissions = isSuperAdmin || profile?.permissions?.includes('all');

  const handleImageUpload = async (hubId: string, itemId?: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      // Initial check to prevent extremely large files (e.g., 10MB+) from crashing the browser
      if (file.size > 5 * 1024 * 1024) {
        toast.error(lang === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)' : 'File size too large (Max 5MB)');
        return;
      }

      try {
        const base64String = await compressImage(file, 1000, 750, 0.6);
        const size = getBase64Size(base64String);
        
        // Final check for compressed size (aim for < 200KB per image)
        if (size > 300 * 1024) {
          toast.error(lang === 'ar' ? 'الصورة لا تزال كبيرة جداً، يرجى اختيار صورة أصغر' : 'Image is still too large, please choose a smaller one');
          return;
        }

        const docRef = doc(db, 'pages', hubId);
        if (itemId) {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const updatedItems = data.items.map((item: any) => 
              item.id === itemId ? { ...item, image: base64String } : item
            );
            await updateDoc(docRef, { items: updatedItems, updatedAt: serverTimestamp() });
          }
        } else {
          await updateDoc(docRef, { image: base64String, updatedAt: serverTimestamp() });
        }
        toast.success(lang === 'ar' ? 'تم تحديث الصورة بنجاح' : 'Image updated successfully');
      } catch (error: any) {
        if (error.message?.includes('exceeds the maximum allowed size')) {
          toast.error(lang === 'ar' ? 'فشل التحديث: حجم الصفحة تجاوز الحد المسموح به في قاعدة البيانات' : 'Update failed: Page size exceeded database limit');
        } else {
          handleFirestoreError(error, OperationType.WRITE, `pages/${hubId}`);
          toast.error(lang === 'ar' ? 'فشل تحديث الصورة' : 'Failed to update image');
        }
      }
    };
    input.click();
  };

  const renderIcon = (iconName: string, className: string = "h-6 w-6") => {
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComponent className={className} />;
  };

  const TOOLS_SERVICES = [
    {
      title: "الاستشارات وحلول الأزمات",
      description: "توفير عيادة SOS للاستشارات العاجلة وجلسات الكوتشينج الفردي للقادة الجدد.",
      icon: "Stethoscope"
    },
    {
      title: "الموارد والتمكين الرقمي",
      description: "مكتبة شاملة من النماذج الإدارية الجاهزة، الحقائب التدريبية، وأدوات الذكاء الاصطناعي.",
      icon: "Library"
    },
    {
      title: "مؤشرات القياس والوعي",
      description: "أدوات رقمية لقياس الوعي المؤسسي، الرضا الوظيفي، وأنماط التعلم الطلابية.",
      icon: "BarChart3"
    }
  ];

  const BENEFICIARIES = [
    {
      title: "القادة والمدراء (رفيق القادة)",
      description: "دمج الذكاء العاطفي في اتخاذ القرارات الإدارية وبناء الهوية المؤسسية القائمة على القيم.",
      icon: "Crown",
      slug: "administrators"
    },
    {
      title: "الكوادر التعليمية والإدارية",
      description: "تحويل المعلم إلى 'ميسر للوعي' ورفع الكفاءة التشغيلية للطواقم الإدارية والمساندة.",
      icon: "BookOpen",
      slug: "teachers"
    },
    {
      title: "الطلاب والشركات",
      description: "بناء الشخصية القيادية للطالب، وتحقيق أعلى عائد استثمار للشركات عبر الموظف الواعي.",
      icon: "Users",
      slug: "students"
    }
  ];

  const PATHS = [
    {
      title: "المسار الطلابي",
      color: "bg-[#4FB0A5]",
      services: "مهارات التفوق الدراسي",
      goal: "بناء الوعي بالذات والقدرات",
      icon: "GraduationCap",
      slug: "students"
    },
    {
      title: "المسار التعليمي",
      color: "bg-[#2D7A74]",
      services: "ركن المشرف التربوي",
      goal: "ابتكار أساليب تدريس حديثة",
      icon: "Presentation",
      slug: "teachers"
    },
    {
      title: "المسار القيادي",
      color: "bg-[#1E3A8A]",
      services: "برنامج القيادة بالوعي",
      goal: "اتخاذ قرارات إدارية ذكية",
      icon: "Briefcase",
      slug: "administrators"
    }
  ];

  const selectedHub = hubs.find(h => h.id === selectedHubId || h.slug === selectedHubId);

  if (selectedHubId && selectedHub) {
    return (
      <div className="space-y-8 pb-20 pt-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {selectedHub.image ? (
                  <img src={selectedHub.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  renderIcon(selectedHub.icon, "h-10 w-10")
                )}
              </div>
              <div>
                <h2 className="text-4xl font-heading font-bold text-primary">
                  {selectedHub.title?.[lang] || selectedHub.title?.ar}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {selectedHub.description?.[lang] || selectedHub.description?.ar}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setSelectedHubId(null)}
              className="rounded-full px-8 hover:bg-primary hover:text-white transition-all"
            >
              {lang === 'ar' ? <Icons.ChevronRight className="ml-2 h-5 w-5" /> : <Icons.ChevronLeft className="mr-2 h-5 w-5" />}
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
          </div>

          {!selectedHub.items || selectedHub.items.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-[3rem] border-4 border-dashed border-primary/10">
              <p className="text-muted-foreground text-xl font-medium">
                {lang === 'ar' ? 'سيتم إضافة الفروع قريباً...' : 'Branches coming soon...'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {selectedHub.items.map((item: any, itemIndex: number) => {
                const itemColors = [
                  { border: 'border-blue-500/50', bg: 'bg-blue-500/5', text: 'text-blue-700', shadow: 'shadow-blue-500/10' },
                  { border: 'border-emerald-500/50', bg: 'bg-emerald-500/5', text: 'text-emerald-700', shadow: 'shadow-emerald-500/10' },
                  { border: 'border-purple-500/50', bg: 'bg-purple-500/5', text: 'text-purple-700', shadow: 'shadow-purple-500/10' },
                  { border: 'border-orange-500/50', bg: 'bg-orange-500/5', text: 'text-orange-700', shadow: 'shadow-orange-500/10' },
                  { border: 'border-pink-500/50', bg: 'bg-pink-500/5', text: 'text-pink-700', shadow: 'shadow-pink-500/10' },
                  { border: 'border-cyan-500/50', bg: 'bg-cyan-500/5', text: 'text-cyan-700', shadow: 'shadow-cyan-500/10' }
                ];
                const color = itemColors[itemIndex % itemColors.length];

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.03 }}
                    onClick={() => navigate(`/p/${selectedHub.slug}/${item.id}`)}
                  >
                    <Card className={`hover:shadow-xl transition-all cursor-pointer group h-full border-2 ${color.border} ${color.bg} ${color.shadow} glass-card rounded-2xl overflow-hidden relative p-0 py-0 ring-0 shadow-none flex flex-col`}>
                      {hasFullPermissions && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2 z-20 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageUpload(selectedHub.id, item.id);
                          }}
                        >
                          <Icons.Camera className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="aspect-video relative overflow-hidden w-full">
                        <img 
                          src={item.image || `https://picsum.photos/seed/${item.id}/400/300`} 
                          alt={item.title?.[lang] || item.title?.ar}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white text-xs font-bold">{lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                        </div>
                      </div>
                      <CardContent className="p-4 pt-4 flex-1 flex flex-col justify-center">
                        <h3 className={`font-heading font-bold text-lg group-hover:scale-105 transition-transform text-center leading-tight ${color.text}`}>
                          {item.title?.[lang] || item.title?.ar}
                        </h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-0">
      {siteSettings?.announcements?.active && (
        <AnnouncementTicker 
          items={siteSettings.announcements.items} 
          speed={siteSettings.announcements.speed} 
        />
      )}

      {/* Header */}
      <header className="text-center w-full mx-auto space-y-0">
        {siteSettings?.hero_slides?.length > 0 && (
          <div className="mb-0 w-full">
            <HeroCarousel slides={siteSettings.hero_slides} lang={lang} />
          </div>
        )}
        
        <div className="glass-card p-6 md:p-12 rounded-2xl md:rounded-[3rem] relative max-w-5xl mx-auto mt-8 px-4">
          {isSuperAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm border-primary/30 hover:bg-primary hover:text-white transition-all shadow-sm z-50"
            onClick={handleSyncWithDefaults}
          >
            <Icons.RefreshCw className="h-4 w-4 mr-2" />
            {lang === 'ar' ? 'مزامنة مع الافتراضي' : 'Sync with Defaults'}
          </Button>
        )}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-6xl font-heading font-bold text-[#1E3A8A] leading-tight px-2">
            رفيقك في طريق الوعي
          </h1>
          <h2 className="text-xl md:text-4xl font-heading font-bold text-[#2D7A74] leading-tight px-2">
            المنظومة الشاملة للتطوير التربوي والإداري
          </h2>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-xl text-muted-foreground leading-relaxed px-4"
        >
          منصة "رفيقك" كشريك استراتيجي يقدم حلولاً متكاملة تجمع بين الوعي الإنساني والكفاءة المهنية لمختلف فئات المجتمع المؤسسي والتعليمي.
        </motion.p>
        </div>
      </header>

      {/* Main Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-center relative py-8 md:py-12 glass-card px-4 md:px-8 rounded-2xl md:rounded-[3rem]">
        {/* Right Column: Tools & Services */}
        <div className="space-y-8 md:space-y-10 order-2 lg:order-1">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icons.Wrench className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-[#1E3A8A]">الأدوات والخدمات النوعية</h2>
          </div>
          <div className="space-y-6 md:space-y-8">
            {TOOLS_SERVICES.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 group"
              >
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-sm border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {renderIcon(item.icon, "h-5 w-5 md:h-6 md:w-6")}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base md:text-lg text-[#1E3A8A]">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Middle Column: Visual Hub */}
        <div className="flex justify-center order-1 lg:order-2 py-8 lg:py-0">
          <div className="relative w-48 h-48 md:w-80 md:h-80 flex items-center justify-center">
            {/* Background Graphic (Simplified Network) */}
            <div className="absolute inset-0 opacity-20 animate-pulse">
              <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                <path d="M100 20 L100 180 M20 100 L180 100" stroke="currentColor" strokeWidth="0.2" />
              </svg>
            </div>
            {/* Central Circle */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 w-36 h-36 md:w-60 md:h-60 rounded-full bg-linear-to-br from-[#1E3A8A] to-[#2D7A74] p-1 shadow-2xl"
            >
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center text-center p-4 md:p-6 border-4 border-white/20">
                <span className="text-2xl md:text-4xl font-heading font-bold text-[#1E3A8A] mb-1">رفيقك</span>
                <span className="text-xs md:text-base font-medium text-[#2D7A74]">في طريق الوعي</span>
              </div>
            </motion.div>
            {/* Outer Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 scale-110" />
            <div className="absolute inset-0 rounded-full border border-primary/10 scale-125" />
          </div>
        </div>

        {/* Left Column: Beneficiaries */}
        <div className="space-y-8 md:space-y-10 order-3">
          <div className="flex items-center gap-3 mb-4 md:mb-6 lg:justify-end">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-[#1E3A8A]">فئات المستفيدين</h2>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icons.Users className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
          <div className="space-y-6 md:space-y-8">
            {BENEFICIARIES.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedHubId(item.slug)}
                className="flex gap-4 group lg:flex-row-reverse cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-sm border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {renderIcon(item.icon, "h-5 w-5 md:h-6 md:w-6")}
                </div>
                <div className="space-y-1 lg:text-left">
                  <h3 className="font-bold text-base md:text-lg text-[#1E3A8A] group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Section: Cards Grid */}
      <section className="rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 glass-card">
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          {/* Label */}
          <div className="lg:w-48 flex items-center justify-center lg:justify-start lg:border-l-2 border-primary/10 lg:pl-6 mb-4 md:mb-6 lg:mb-0">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-[#1E3A8A] text-center lg:text-right">هيكلية المحتوى المعرفي المتاح</h2>
          </div>

          {/* Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PATHS.map((path, i) => {
              const hubForPath = hubs.find(h => h.slug === path.slug);
              const displayImage = hubForPath?.image;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedHubId(path.slug)}
                  className={`${path.color} rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all h-full flex flex-col`}
                >
                  {hasFullPermissions && hubForPath && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-4 right-4 z-20 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageUpload(hubForPath.id);
                      }}
                    >
                      <Icons.Camera className="h-4 w-4" />
                    </Button>
                  )}
                  {/* Top Icon */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="mb-6 flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-[#E5D5B5] flex items-center justify-center text-[#1E3A8A] shadow-lg overflow-hidden">
                      {displayImage ? (
                        <img src={displayImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        renderIcon(path.icon, "h-6 w-6")
                      )}
                    </div>
                    <h3 className="text-2xl font-heading font-bold">{path.title}</h3>
                  </div>

                  <div className="space-y-4 mt-auto">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider">أبرز الخدمات</span>
                      </div>
                      <p className="text-lg font-medium">{path.services}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider">الهدف الرئيسي</span>
                      </div>
                      <p className="text-sm opacity-90">{path.goal}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer-like Hubs (Optional, keeping them accessible) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-12">
        {hubs.map((hub, index) => {
          const colors = [
            'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200',
            'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200',
            'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200',
            'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-200',
            'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-pink-200',
            'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-cyan-200'
          ];
          const colorClass = colors[index % colors.length];
          
          return (
            <Button 
              key={hub.id} 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedHubId(hub.id)}
              className={`rounded-2xl h-auto py-4 flex flex-col gap-2 border transition-all ${colorClass}`}
            >
              {renderIcon(hub.icon, "h-6 w-6")}
              <span className="text-xs font-bold truncate w-full">{hub.title?.[lang] || hub.title?.ar}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
