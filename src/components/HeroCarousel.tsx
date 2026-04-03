import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSlide {
  id: string;
  image: string;
  title?: { ar?: string; en?: string };
  description?: { ar?: string; en?: string };
  interval?: number;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  lang: 'ar' | 'en';
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = [], lang = 'ar' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const currentSlide = slides[currentIndex];
    const intervalTime = (currentSlide?.interval || 5) * 1000;
    
    const timer = setInterval(() => {
      nextSlide();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, slides]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          className="absolute inset-0"
        >
          <img 
            src={currentSlide.image} 
            alt="" 
            className="w-full h-full object-contain bg-black/5"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16 text-white text-right">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 max-w-3xl ml-auto"
            >
              <h2 className="text-3xl md:text-6xl font-heading font-bold leading-tight">
                {currentSlide.title?.[lang] || currentSlide.title?.ar}
              </h2>
              <p className="text-lg md:text-2xl text-white/80 font-light leading-relaxed">
                {currentSlide.description?.[lang] || currentSlide.description?.ar}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 -translate-y-1/2 z-10 rounded-full bg-black/20 hover:bg-black/40 text-white shadow-lg border border-white/20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 -translate-y-1/2 z-10 rounded-full bg-black/20 hover:bg-black/40 text-white shadow-lg border border-white/20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-8' : 'bg-white/40'}`}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
