import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Home, LayoutGrid, GraduationCap, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_HUBS } from '@/data/defaultPages';
import { useLanguage } from '@/context/LanguageContext';

export const QuickNav: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedHub, setSelectedHub] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleHubSelect = (hub: any) => {
    setSelectedHub(hub);
    setIsSheetOpen(true);
  };

  const handleItemSelect = (hubSlug: string, itemId: string) => {
    navigate(`/p/${hubSlug}/${itemId}`);
    setIsSheetOpen(false);
  };

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center gap-4 px-4 overflow-x-auto no-scrollbar">
        {/* Home Button */}
        <Button variant="ghost" size="sm" render={<Link to="/" />} className="flex items-center gap-2 whitespace-nowrap">
          <Home className="h-4 w-4" />
          <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </Button>

        {/* Platform Areas Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap" />}>
            <LayoutGrid className="h-4 w-4" />
            <span>{language === 'ar' ? 'مجالات المنصة' : 'Platform Areas'}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {DEFAULT_HUBS.map((hub) => (
              <DropdownMenuItem 
                key={hub.id} 
                onClick={() => handleHubSelect(hub)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{hub.title[language as keyof typeof hub.title]}</span>
                {language === 'ar' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Training Courses */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/p/training-courses')}
          className="flex items-center gap-2 whitespace-nowrap hover:bg-primary/10"
        >
          <GraduationCap className="h-4 w-4" />
          <span>{language === 'ar' ? 'الدورات التدريبية الحالية' : 'Current Training Courses'}</span>
        </Button>

        {/* About Us */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/p/about')}
          className="flex items-center gap-2 whitespace-nowrap hover:bg-primary/10"
        >
          <Info className="h-4 w-4" />
          <span>{language === 'ar' ? 'من نحن' : 'About Us'}</span>
        </Button>

        {/* Side Panel for Branches */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-right">
                {selectedHub?.title[language as keyof typeof selectedHub.title]}
              </SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
              <div className="flex flex-col gap-2">
                {selectedHub?.items.map((item: any) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="justify-start text-right h-auto py-3 px-4 whitespace-normal"
                    onClick={() => handleItemSelect(selectedHub.id, item.id)}
                  >
                    <div className="flex flex-col items-start text-right w-full">
                      <span className="font-semibold">{item.title[language as keyof typeof item.title]}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {item.content[language as keyof typeof item.content]}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
