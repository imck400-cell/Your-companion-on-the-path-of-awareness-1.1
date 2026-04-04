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
    <div className="sticky top-16 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="container flex h-12 items-center gap-2 px-4 overflow-x-auto no-scrollbar">
        {/* Home Button */}
        <Button variant="ghost" size="sm" render={<Link to="/" />} className="flex items-center gap-2 whitespace-nowrap rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 group transition-colors">
          <Home className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </Button>

        {/* Platform Areas Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap rounded-full hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 group transition-colors" />}>
            <LayoutGrid className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">{language === 'ar' ? 'مجالات المنصة' : 'Platform Areas'}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl p-1">
            {DEFAULT_HUBS.map((hub) => (
              <DropdownMenuItem 
                key={hub.id} 
                onClick={() => handleHubSelect(hub)}
                className="flex items-center justify-between cursor-pointer rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 py-3 px-3 font-medium"
              >
                <span>{hub.title[language as keyof typeof hub.title]}</span>
                {language === 'ar' ? <ChevronLeft className="h-4 w-4 opacity-60" /> : <ChevronRight className="h-4 w-4 opacity-60" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Training Courses */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/p/training-courses')}
          className="flex items-center gap-2 whitespace-nowrap rounded-full hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 group transition-colors"
        >
          <GraduationCap className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">{language === 'ar' ? 'الدورات التدريبية الحالية' : 'Current Training Courses'}</span>
        </Button>

        {/* About Us */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/p/about')}
          className="flex items-center gap-2 whitespace-nowrap rounded-full hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-900/20 group transition-colors"
        >
          <Info className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">{language === 'ar' ? 'من نحن' : 'About Us'}</span>
        </Button>

        {/* Side Panel for Branches */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[320px] sm:w-[420px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SheetHeader className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 p-4 -mx-6 -mt-6 mb-2 border-b border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-3 pt-2">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-purple-600" />
                </div>
                <SheetTitle className="text-right text-xl font-bold text-purple-800 dark:text-purple-200">
                  {selectedHub?.title[language as keyof typeof selectedHub.title]}
                </SheetTitle>
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)] pr-2">
              <div className="flex flex-col gap-1.5 py-2">
                {selectedHub?.items.map((item: any, idx: number) => {
                  const colors = ['bg-blue-50 hover:bg-blue-100 text-blue-800', 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800', 'bg-purple-50 hover:bg-purple-100 text-purple-800', 'bg-orange-50 hover:bg-orange-100 text-orange-800', 'bg-pink-50 hover:bg-pink-100 text-pink-800'];
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`justify-start text-right h-auto py-3 px-4 whitespace-normal rounded-xl font-medium transition-all ${colors[idx % colors.length]}`}
                      onClick={() => handleItemSelect(selectedHub.id, item.id)}
                    >
                      <div className="flex flex-col items-start text-right w-full gap-0.5">
                        <span className="font-bold text-base">{item.title[language as keyof typeof item.title]}</span>
                        <span className="text-xs opacity-70 line-clamp-1">
                          {item.content[language as keyof typeof item.content]}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
