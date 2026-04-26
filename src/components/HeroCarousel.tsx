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
    <div className="relative w-full overflow-hidden shadow-2xl group bg-black/5 grid">
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
          className="col-start-1 row-start-1 w-full relative"
        >
          <div className="relative w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Main image - fully visible, dictates height up to 80vh */}
            <img 
              src={currentSlide.image} 
              alt={currentSlide.title?.[lang] || ""} 
              className="w-full h-auto max-h-[80vh] object-contain z-10"
              referrerPolicy="no-referrer"
            />
            {/* Subtle overlay to unify the look and make text readable */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-20" />
          </div>
          
          <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 md:p-12 text-white text-right pointer-events-none">
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 max-w-2xl ml-auto pointer-events-auto"
            >
              <h2 className="text-xl md:text-4xl lg:text-5xl font-heading font-bold leading-tight drop-shadow-2xl">
                {currentSlide.title?.[lang] || currentSlide.title?.ar}
              </h2>
              <p className="text-sm md:text-lg lg:text-xl text-white/95 font-medium leading-relaxed line-clamp-2 md:line-clamp-none drop-shadow-xl max-w-lg ml-auto">
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
