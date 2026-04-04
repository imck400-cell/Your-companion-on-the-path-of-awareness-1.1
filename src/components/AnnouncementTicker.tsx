import React from 'react';
import { motion } from 'motion/react';

interface AnnouncementTickerProps {
  items: string[];
  speed?: number;
  active?: boolean;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ 
  items = [], 
  speed = 20, 
  active = true 
}) => {
  if (!active || items.length === 0) return null;

  // Duplicate items many times to ensure smooth infinite scroll
  // We use 4 sets of items to be safe
  const displayItems = [...items, ...items, ...items, ...items];
  
  // Adjust speed logic: higher value = faster
  // We use a duration that depends on the number of items to keep speed consistent
  const baseDuration = 30;
  const duration = Math.max(1, (baseDuration * items.length) / (speed / 10));
  
  const colors = [
    'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    'bg-purple-500/10 text-purple-700 border-purple-500/20',
    'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'bg-pink-500/10 text-pink-700 border-pink-500/20',
  ];

  return (
    <div className="w-full bg-orange-500/5 backdrop-blur-md border-y border-orange-500/10 overflow-hidden py-2 relative z-40 h-10 md:h-12 flex items-center group">
      <motion.div 
        className="flex whitespace-nowrap gap-8 px-4"
        animate={{ x: ["0%", "-25%"] }}
        transition={{ 
          duration: duration, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop"
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {displayItems.map((text, i) => (
          <div 
            key={i} 
            className={`inline-flex items-center px-4 py-1 rounded-full border font-bold text-xs md:text-sm shadow-xs transition-all hover:scale-105 ${colors[i % colors.length]}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50" />
            {text}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
