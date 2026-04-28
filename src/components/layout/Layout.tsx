import React, { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { QuickNav } from './QuickNav';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/sonner';
import { AnnouncementTicker } from '@/components/AnnouncementTicker';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<{ items: any[]; speed: number; active: boolean } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_settings', 'home_page'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAnnouncements(data?.announcements ?? null);
      }
    }, (err) => {
      // Ignored
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <Navbar />
      {announcements?.active && announcements.items?.length > 0 && (
        <AnnouncementTicker
          items={announcements.items}
          speed={announcements.speed}
          active={true}
        />
      )}
      <QuickNav />
      <main className="flex-grow container mx-auto py-0 px-0 md:px-4">
        {children}
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
};
