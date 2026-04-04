import React from 'react';

import { useNavigate } from 'react-router-dom';

interface AnnouncementTickerProps {
  items: any[];
  speed?: number;
  active?: boolean;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({
  items = [],
  speed = 20,
  active = true
}) => {
  const navigate = useNavigate();
  if (!active || items.length === 0) return null;

  // By defining dir=ltr on the wrapper, elements flow left-to-right.
  // Translating -100% will smoothly slide them from right to left.
  const baseDuration = 30;
  const duration = Math.max(1, (baseDuration * items.length) / (speed / 10));

  const colors = [
    'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    'bg-purple-500/10 text-purple-700 border-purple-500/20',
    'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'bg-pink-500/10 text-pink-700 border-pink-500/20',
  ];

  const handleClick = (item: any) => {
    if (typeof item !== 'string' && item.link) {
      if (item.link.startsWith('http')) {
        window.open(item.link, '_blank');
      } else {
        navigate(item.link);
      }
    }
  };

  const renderItem = (item: any, i: number) => {
    const text = typeof item === 'string' ? item : item.text;
    const isClickable = typeof item !== 'string' && item.link;
    return (
      <div
        key={i}
        dir="rtl"
        onClick={() => handleClick(item)}
        className={`inline-flex items-center px-4 py-1 rounded-full border font-bold text-xs md:text-sm shadow-xs transition-all hover:scale-105 ${colors[i % colors.length]} ${isClickable ? 'cursor-pointer hover:bg-white/50' : ''}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current ml-2 opacity-50" />
        {text}
      </div>
    );
  };

  return (
    <div
      className="w-full bg-orange-500/5 backdrop-blur-md border-y border-orange-500/10 overflow-hidden py-2 relative z-40 h-10 md:h-12 flex items-center group"
      dir="ltr"
    >
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee {
            display: flex;
            flex-shrink: 0;
            white-space: nowrap;
            min-width: 100%;
            justify-content: space-around;
            animation: marquee ${duration}s linear infinite;
          }
          .group:hover .animate-marquee {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="animate-marquee gap-8 px-4">
        {items.map((item, i) => renderItem(item, i))}
      </div>
      <div className="animate-marquee gap-8 px-4" aria-hidden="true">
        {items.map((item, i) => renderItem(item, `dup-${i}` as any))}
      </div>
    </div>
  );
};
