import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F3EAE6] via-[#EFE3DE] to-[#E6D5CE] text-[#6B5A5E] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Heart className="w-8 h-8 text-[#B83B5E]/60 mb-2 stroke-[1.5]" />
        <span className="font-serif-display text-base text-[#3A2E31]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
