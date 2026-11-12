import React from 'react';
import { Edit3, Sparkles, Heart, Crown, LogOut } from 'lucide-react';
import { CoupleProfile, formatArabicDate } from '../utils/memoriesLogic';
import { UserRole } from '../utils/authLogic';

interface TopBarProps {
  profile: CoupleProfile;
  currentRole: UserRole;
  onOpenEditNames: () => void;
  onOpenEditHero: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  profile,
  currentRole,
  onOpenEditNames,
  onOpenEditHero,
  onLogout,
}) => {
  const isAdmin = currentRole === 'admin';

  return (
    <header className="relative z-20 pt-6 pb-4 px-4 sm:px-6">
      <div className="max-w-[1240px] mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-xs sm:text-sm">
        {/* Right side in RTL: Romantic metadata & start date */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-[13px] text-[#FFA5BA]">
          <span className="text-[#FFB3C6] font-medium flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-[#FF3366] text-[#FF3366]" />
            <span>{profile.partnerOneName} و {profile.partnerTwoName}</span>
          </span>

          <span aria-hidden="true" className="text-[#FF3366]/40">·</span>

          <span className="text-[#EAD5E8]">
            {profile.firstMetLabel} <span className="font-medium text-[#FFA5BA]">{formatArabicDate(profile.startDate)}</span>
          </span>

          <span aria-hidden="true" className="text-[#FF3366]/40">·</span>

          <span className="inline-flex items-center gap-1 text-[#FF85A2] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3366]" />
            <span>{profile.romanticTagline || 'حكايتنا الحلوة'}</span>
          </span>
        </div>

        {/* Left side in RTL: User badge, Edit buttons (if Ahmed), and Logout */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={onOpenEditNames}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FF3366]/40 bg-[#1D0C26]/70 hover:bg-[#2F123C] text-[#FFA5BA] transition-colors cursor-pointer text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل الأسماء والتواريخ</span>
              </button>

              <button
                type="button"
                onClick={onOpenEditHero}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FF3366]/40 bg-[#1D0C26]/70 hover:bg-[#2F123C] text-[#FFA5BA] transition-colors cursor-pointer text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل الواجهة</span>
              </button>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-[#FBBF24] bg-[#2E200C] border border-[#F59E0B]/30">
                <Crown className="w-3 h-3 text-[#F59E0B]" />
                <span>أحمد (تعديل)</span>
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#FFA5BA] bg-[#2E0F23] border border-[#FF3366]/30">
              <Heart className="w-3.5 h-3.5 fill-[#FF3366] text-[#FF3366]" />
              <span>حبيبتي ودنيتي ❤️</span>
            </span>
          )}

          <button
            type="button"
            onClick={onLogout}
            title="تسجيل الخروج أو تبديل الحساب"
            aria-label="تسجيل الخروج أو تبديل الحساب"
            className="p-1.5 rounded-full border border-[#3E1B4A] bg-[#160B1E] text-[#A888A4] hover:text-white hover:border-[#FF3366]/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
