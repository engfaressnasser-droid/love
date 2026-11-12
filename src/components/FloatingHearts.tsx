import React, { useMemo } from 'react';

interface FloatingHeartItem {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  shape: 'heart' | 'petal' | 'sparkle';
  color: string;
}

export const FloatingHearts: React.FC = () => {
  const items = useMemo<FloatingHeartItem[]>(() => {
    const colors = ['#FF4D88', '#FF6B9E', '#E11D48', '#FDA4AF', '#BE185D', '#FB7185'];
    const shapes: Array<'heart' | 'petal' | 'sparkle'> = ['heart', 'heart', 'petal', 'sparkle'];

    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: Math.round(((i * 4.2) % 96) + 2),
      duration: 10 + ((i * 3) % 12),
      delay: ((i * 1.7) % 14),
      size: 14 + ((i * 5) % 18),
      opacity: 0.25 + ((i % 5) * 0.12),
      shape: shapes[i % shapes.length],
      color: colors[i % colors.length],
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-float-heart"
          style={
            {
              left: `${item.left}%`,
              '--duration': `${item.duration}s`,
              '--delay': `${item.delay}s`,
              fontSize: `${item.size}px`,
              opacity: item.opacity,
              color: item.color,
            } as React.CSSProperties
          }
        >
          {item.shape === 'heart' && '❤'}
          {item.shape === 'petal' && '🌸'}
          {item.shape === 'sparkle' && '✦'}
        </div>
      ))}
    </div>
  );
};
