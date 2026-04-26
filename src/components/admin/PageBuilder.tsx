import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Plus, Image as ImageIcon, FileText, Link as LinkIcon, Video, Music, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PageBuilderProps {
  page?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const MultiLinkInput = ({ value, onChange, label, placeholder, icon: Icon, extraAction }: any) => {
  const links = (value || '').split(',').filter((l: string) => l.trim().length > 0);
  const [newLink, setNewLink] = useState('');

  const handleAdd = () => {
    if (newLink.trim()) {
      onChange([...links, newLink.trim()].join(','));
      setNewLink('');
    }
  };

  const handleRemove = (idx: number) => {
    const arr = [...links];
    arr.splice(idx, 1);
    onChange(arr.join(','));
  };

  return (
    <div className="space-y-2 border p-3 rounded-lg bg-muted/10 shrink-0">
      <Label className="flex items-center gap-1 text-xs font-bold"><Icon className="w-4 h-4 text-primary" /> {label}</Label>
      <div className="space-y-2">
        {links.map((link: string, idx: number) => (
          <div key={idx} className="flex gap-2 items-center bg-background p-1.5 rounded-md border shadow-sm">
            {link.startsWith('data:image/') || link.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
              <div className="h-8 w-8 shrink-0 rounded overflow-hidden border">
                <img src={link} alt="" className="w-full h-full object-cover" />
              </div>
            ) : null}
            <Input readOnly value={link} className="h-7 text-xs flex-1 border-0 bg-transparent focus-visible:ring-0" />
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0 hover:bg-destructive/10" onClick={() => handleRemove(idx)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center pt-1">
        <Input 
          placeholder={placeholder} 
          value={newLink} 
          onChange={(e) => setNewLink(e.target.value)}
          className="h-8 text-xs flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" size="sm" variant="secondary" className="h-8 px-2" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
        {extraAction && extraAction(onChange, links)}
      </div>
    </div>
  );
};

const MultiLinkWithTitleInput = ({ value, onChange, label, icon: Icon }: any) => {
  const links = (value || '').split(',').filter((l: string) => l.trim().length > 0);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (newUrl.trim()) {
      const entry = newTitle.trim() ? `${newUrl.trim()}::${newTitle.trim()}` : newUrl.trim();
      onChange([...links, entry].join(','));
      setNewUrl('');
      setNewTitle('');
    }
  };

  const handleRemove = (idx: number) => {
    const arr = [...links];
    arr.splice(idx, 1);
    onChange(arr.join(','));
  };

  return (
    <div className="space-y-2 border p-3 rounded-lg bg-muted/10 shrink-0">
      <Label className="flex items-center gap-1 text-xs font-bold"><Icon className="w-4 h-4 text-primary" /> {label}</Label>
      <div className="space-y-2">
        {links.map((link: string, idx: number) => {
          const parts = link.split('::');
          const url = parts[0];
          const title = parts[1] || '';
          return (
            <div key={idx} className="flex gap-2 items-center bg-background p-1.5 rounded-md border shadow-sm">
              <div className="flex-1 flex flex-col gap-1">
                {title && <span className="text-[10px] font-bold text-muted-foreground px-1 truncate max-w-[200px]">{title}</span>}
                <Input readOnly value={url} className="h-7 text-xs border-0 bg-transparent focus-visible:ring-0" />
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0 hover:bg-destructive/10" onClick={() => handleRemove(idx)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 pt-2 border-t mt-2">
        <Input 
          placeholder="عنوان الرابط الداخلي (اختياري، مثلاً: موقع ويكيبيديا)" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)}
          className="h-8 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              document.getElementById('external-link-url-input')?.focus();
            }
          }}
        />
        <div className="flex gap-2 items-center">
          <Input 
            id="external-link-url-input"
            placeholder="رابط الموقع (https://...)" 
            value={newUrl} 
            onChange={(e) => setNewUrl(e.target.value)}
            className="h-8 text-xs flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button type="button" size="sm" variant="secondary" className="h-8 px-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PageBuilder: React.FC<PageBuilderProps> = ({ page, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(page || {
    title: { ar: '', en: '' },
    slug: '',
    theme: 'light',
    sections: [
      { id: 'whats_new', title: { ar: 'لكل جديد', en: "What's New" }, content: '' },
      { id: 'important', title: { ar: 'لكل مهم', en: 'Important' }, content: '' },
      { id: 'requests', title: { ar: 'لكل الطلبات', en: 'Requests' }, content: '' }
    ],
    items: [],
    media: []
  });

  const [isUploading, setIsUploading] = useState<string | null>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: { ar: '', en: '' },
      content: { ar: '', en: '' },
      image: '',
      pdfUrl: '',
      videoUrl: '',
      externalLinks: ''
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((item: any) => item.id !== id) }));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setFormData(prev => {
      const newItems = prev.items.map((item: any) => {
        if (item.id === id) {
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            return { ...item, [parent]: { ...item[parent], [child]: value } };
          }
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'page' | string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(target);
    try {
      const compressedBase64 = await compressImage(file);
      if (target === 'page') {
        setFormData(prev => ({ ...prev, image: compressedBase64 }));
      } else {
        updateItem(target, 'image', compressedBase64);
      }
      toast.success('تمت معالجة الصورة بنجاح');
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">
          {page ? 'تعديل قسم' : 'إنشاء قسم جديد'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {t('save')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية للقسم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم القسم (عربي)</Label>
                  <Input 
                    value={formData.title.ar || ''} 
                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم القسم (English)</Label>
                  <Input 
                    value={formData.title.en || ''} 
                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الرابط (Slug)</Label>
                  <Input 
                    value={formData.slug || ''} 
                    onChange={(e) => {
                      // Allow Arabic characters, letters, numbers, and hyphens
                      // We replace spaces with hyphens and remove most special characters but keep letters
                      const val = e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '');
                      setFormData({ ...formData, slug: val });
                    }}
                    placeholder="example-section"
                  />
                  <p className="text-[10px] text-muted-foreground">سيتم تحويل المسافات إلى شرطات تلقائياً</p>
                </div>
                <div className="space-y-2">
                  <Label>الأيقونة (Lucide Icon Name)</Label>
                  <Input 
                    value={formData.icon || ''} 
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="LayoutDashboard, Users, etc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>صورة القسم</Label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        value={formData.image?.startsWith('data:') ? 'صورة محلية مرفوعة' : (formData.image || '')} 
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="رابط الصورة أو قم بالتحميل..."
                        className="flex-1"
                      />
                      {formData.image && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => setFormData({ ...formData, image: '' })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="page-image-upload"
                        onChange={(e) => handleImageUpload(e, 'page')}
                      />
                      <Button 
                        variant="secondary" 
                        className="w-full gap-2"
                        disabled={isUploading === 'page'}
                        onClick={() => document.getElementById('page-image-upload')?.click()}
                      >
                        {isUploading === 'page' ? 'جاري المعالجة...' : (
                          <>
                            <Plus className="h-4 w-4" />
                            تحميل صورة
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الوصف (عربي)</Label>
                <Textarea 
                  value={formData.description?.ar || ''} 
                  onChange={(e) => setFormData({ ...formData, description: { ...formData.description, ar: e.target.value } })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>الفروع (Items)</CardTitle>
              <Button size="sm" onClick={addItem} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة فرع
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.items?.map((item: any, index: number) => (
                <div key={item.id} className="p-5 border-2 border-primary/20 rounded-2xl space-y-5 relative shadow-md bg-card transition-all hover:border-primary/40">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-xl opacity-80" />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-3 left-3 shadow-sm rounded-full h-8 w-8"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-2 items-center text-sm font-bold text-muted-foreground pb-2 border-b">
                    <span>الفرع #{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>عنوان الفرع (عربي)</Label>
                      <Input 
                        value={item.title.ar || ''} 
                        onChange={(e) => updateItem(item.id, 'title.ar', e.target.value)}
                      />
                    </div>
                    {formData.groups && formData.groups.length > 0 && (
                      <div className="space-y-2">
                        <Label>القسم (المجموعة)</Label>
                        <Select 
                          value={item.groupId || ''} 
                          onValueChange={(val) => updateItem(item.id, 'groupId', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر القسم" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">بدون قسم (أخرى)</SelectItem>
                            {formData.groups.map((g: any) => (
                              <SelectItem key={g.id} value={g.id}>{g.title.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label>رابط الفرع المباشر (تلقائي)</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={`${window.location.origin}/p/${formData.slug || 'new'}/${item.id}`} 
                          className="bg-muted/50 text-xs text-left" 
                          dir="ltr"
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/p/${formData.slug || 'new'}/${item.id}`);
                            toast.success('تم نسخ الرابط');
                          }}
                        >
                          نسخ
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>صورة الفرع</Label>
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <div className="w-10 h-10 rounded border overflow-hidden shrink-0">
                            <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex gap-1">
                            <Input 
                              value={item.image?.startsWith('data:') ? 'صورة محلية مرفوعة' : (item.image || '')} 
                              onChange={(e) => updateItem(item.id, 'image', e.target.value)}
                              placeholder="رابط الصورة..."
                              className="h-8 text-xs flex-1"
                            />
                            {item.image && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive"
                                onClick={() => updateItem(item.id, 'image', '')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              id={`item-image-upload-${item.id}`}
                              onChange={(e) => handleImageUpload(e, item.id)}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isUploading === item.id}
                              className="w-full h-7 text-[10px] gap-1"
                              onClick={() => document.getElementById(`item-image-upload-${item.id}`)?.click()}
                            >
                              {isUploading === item.id ? 'جاري...' : (
                                <>
                                  <Plus className="h-3 w-3" />
                                  تحميل صورة
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>المحتوى (عربي)</Label>
                    <Textarea 
                      value={item.content?.ar || ''} 
                      onChange={(e) => updateItem(item.id, 'content.ar', e.target.value)}
                    />
                  </div>
                  
                  {/* Additional Attachments */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-dashed">
                    <MultiLinkInput
                      label="روابط ملفات PDF"
                      placeholder="https://.../file.pdf"
                      icon={FileText}
                      value={item.pdfUrl}
                      onChange={(val: string) => updateItem(item.id, 'pdfUrl', val)}
                    />
                    
                    <MultiLinkInput
                      label="روابط فيديو"
                      placeholder="Youtube or mp4 link..."
                      icon={Video}
                      value={item.videoUrl}
                      onChange={(val: string) => updateItem(item.id, 'videoUrl', val)}
                    />

                    <MultiLinkWithTitleInput
                      label="روابط خارجية"
                      icon={LinkIcon}
                      value={item.externalLinks}
                      onChange={(val: string) => updateItem(item.id, 'externalLinks', val)}
                    />
                    
                    <MultiLinkInput
                      label="صور إضافية بداخل المحتوى"
                      placeholder="رابط الصورة..."
                      icon={ImageIcon}
                      value={item.contentImages}
                      onChange={(val: string) => updateItem(item.id, 'contentImages', val)}
                      extraAction={(onChange: any, links: string[]) => (
                        <div className="relative shrink-0">
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            className="hidden" 
                            id={`item-content-images-upload-${item.id}`}
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []) as File[];
                              if (files.length === 0) return;
                              setIsUploading(`contentImages-${item.id}`);
                              try {
                                const newImages = [];
                                for (const file of files) {
                                  newImages.push(await compressImage(file));
                                }
                                onChange([...links, ...newImages].join(','));
                                toast.success('تم رفع الصور الإضافية بنجاح');
                              } catch (error) {
                                console.error('Images upload error:', error);
                                toast.error('حدث خطأ أثناء رفع الصور');
                              } finally {
                                setIsUploading(null);
                              }
                            }}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            type="button"
                            disabled={isUploading === `contentImages-${item.id}`}
                            className="h-8 gap-1 px-3"
                            onClick={() => document.getElementById(`item-content-images-upload-${item.id}`)?.click()}
                          >
                            {isUploading === `contentImages-${item.id}` ? '...' : <ImageIcon className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
                    />
                  </div>
                </div>
              ))}
              {(!formData.items || formData.items.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد فروع مضافة لهذا القسم.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات والوسائط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('theme')}</Label>
                <Select 
                  value={formData.theme || 'light'} 
                  onValueChange={(val) => setFormData({ ...formData, theme: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الوسائط المرفقة</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="icon" className="h-12 w-full"><ImageIcon className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-12 w-full"><FileText className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-12 w-full"><Video className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-12 w-full"><Music className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-12 w-full"><LinkIcon className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-12 w-full"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
