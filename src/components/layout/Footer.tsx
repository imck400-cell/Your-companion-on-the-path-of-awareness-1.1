import React from 'react';
import { Phone, MessageCircle, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-20 overflow-hidden pt-20">
      {/* Semi-circle background */}
      <div className="absolute bottom-0 left-1/2 h-[400px] w-[200%] -translate-x-1/2 rounded-t-[100%] bg-orange-600/90 dark:bg-orange-900/90" />
      
      <div className="relative container mx-auto px-4 pb-12 text-white">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Platform Info (Right side in RTL) */}
          <div className="flex flex-col items-center text-center md:items-end md:text-right">
            <h3 className="mb-4 text-2xl font-bold">رفيقك في طريق الوعي</h3>
            <p className="max-w-xs text-sm leading-relaxed opacity-90">
              المنظومة الشاملة للتطوير التربوي والإداري. نسعى لتمكين القادة والمعلمين والطلاب من خلال المعرفة والوعي.
            </p>
          </div>

          {/* Contact Info (Center) */}
          <div className="flex flex-col items-center text-center">
            <h3 className="mb-6 text-xl font-semibold">تواصل معنا</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <a href="tel:967780804012" className="flex items-center gap-2 hover:text-orange-200 transition-colors">
                  <Phone className="h-5 w-5" />
                  <span dir="ltr">967 780 804 012</span>
                </a>
                <a href="https://wa.me/967780804012" target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                <a href="tel:967770315516" className="flex items-center gap-2 hover:text-orange-200 transition-colors">
                  <Phone className="h-5 w-5" />
                  <span dir="ltr">967 770 315 516</span>
                </a>
                <a href="https://wa.me/967770315516" target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Social & Description (Left side in RTL) */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="mb-4 text-xl font-semibold">تابعنا على</h3>
            <div className="mb-6 flex gap-4">
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs opacity-75">
              جميع الحقوق محفوظة © {new Date().getFullYear()} رفيقك في طريق الوعي
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
