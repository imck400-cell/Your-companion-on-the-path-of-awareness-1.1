import React from 'react';
import { Card } from './ui/card';

export const PageSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-pulse space-y-8" dir="rtl">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-12 bg-muted/60 rounded-2xl w-1/3"></div>
        <div className="h-4 bg-muted/40 rounded-xl w-2/3"></div>
      </div>

      {/* Hero Image Skeleton */}
      <div className="w-full h-48 md:h-[400px] bg-muted/40 rounded-[2rem] md:rounded-[3rem]"></div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-64 rounded-3xl bg-muted/20 border-border/50 p-6 flex flex-col justify-end">
            <div className="space-y-3">
              <div className="h-4 bg-muted/40 rounded-full w-full"></div>
              <div className="h-4 bg-muted/40 rounded-full w-4/5"></div>
              <div className="h-4 bg-muted/40 rounded-full w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <Card className="h-64 rounded-3xl bg-muted/20 border-border/50 p-6 flex flex-col justify-end animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted/40 rounded-full w-full"></div>
        <div className="h-4 bg-muted/40 rounded-full w-4/5"></div>
        <div className="h-4 bg-muted/40 rounded-full w-2/3"></div>
      </div>
    </Card>
  );
};
