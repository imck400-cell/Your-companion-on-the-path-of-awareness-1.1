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

  // Duplicate items to ensure smooth infinite scroll
  const displayItems = [...items, ...items, ...items];
  
  // Invert speed logic: higher value = faster
  // speed range 5-100. 
  // We use an exponential decay so it gets significantly faster at higher values
  const duration = Math.max(0.5, 60 * Math.pow(0.95, speed));
  
  const colors = [
    'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
    'bg-purple-500/20 text-purple-700 border-purple-500/30',
    'bg-orange-500/20 text-orange-700 border-orange-500/30',
    'bg-pink-500/20 text-pink-700 border-pink-500/30',
  ];

  return (
    <div className="w-full bg-white/30 backdrop-blur-md border-y border-primary/5 overflow-hidden py-3 relative z-40">
      <motion.div 
        className="flex whitespace-nowrap gap-6"
        animate={{ x: ["-33.33%", "0%"] }}
        transition={{ 
          duration: duration, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {displayItems.map((text, i) => (
          <div 
            key={i} 
            className={`inline-flex items-center px-4 py-1.5 rounded-xl border font-bold text-sm md:text-base shadow-sm ${colors[i % colors.length]}`}
          >
            {text} ...
          </div>
        ))}
      </motion.div>
    </div>
  );
};
