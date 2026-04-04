import React from 'react';
import { Navbar } from './Navbar';
import { QuickNav } from './QuickNav';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/sonner';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <Navbar />
      <QuickNav />
      <main className="flex-grow container mx-auto py-0 px-0 md:px-4">
        {children}
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
};
