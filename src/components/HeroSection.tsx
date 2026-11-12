import React from 'react';
import { CoupleProfile } from '../utils/memoriesLogic';
import { CountdownCards } from './CountdownCards';
import { DailyMessageCard } from './DailyMessageCard';

interface HeroSectionProps {
  profile: CoupleProfile;
  canEdit?: boolean;
  onOpenEditDates: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  canEdit = true,
  onOpenEditDates,
}) => {
  return (
    <section id="hero" className="relative z-10 pt-4 pb-12 sm:pb-16 text-center">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Giant Glowing Neon Title */}
        <div className="my-6 sm:my-8">
          <h1
            className="neon-glow-pink font-heading text-4xl sm:text-6xl md:text-7xl font-black leading-[1.3] tracking-tight whitespace-pre-line select-none"
            style={{ textWrap: 'balance' }}
          >
            {profile.heroTitle}
          </h1>
        </div>

        {/* Romantic Dedication Subtitle */}
        <p
          className="text-base sm:text-xl text-[#F3EBF5]/90 max-w-2xl mx-auto leading-relaxed font-normal mb-8 sm:mb-10 px-4"
          style={{ textWrap: 'balance' }}
        >
          {profile.heroSubtitle}
        </p>

        {/* Message of the Day (Randomly chosen on every visit) */}
        <DailyMessageCard />

        {/* The Two Dual Countdown Cards */}
        <CountdownCards
          profile={profile}
          canEdit={canEdit}
          onOpenEditDates={onOpenEditDates}
        />
      </div>
    </section>
  );
};
