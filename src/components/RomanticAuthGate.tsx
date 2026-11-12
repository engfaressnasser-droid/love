import React, { useState } from 'react';
import { Heart, Sparkles, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';
import { authenticateUser, UserRole } from '../utils/authLogic';

interface RomanticAuthGateProps {
  onLoginSuccess: (role: UserRole, displayName: string, welcomeMsg?: string) => void;
}

export const RomanticAuthGate: React.FC<RomanticAuthGateProps> = ({ onLoginSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      window.dispatchEvent(new CustomEvent('romantic-start-music'));
    } catch {
      // Ignore
    }
    const result = authenticateUser(passcode);
    if (result.success) {
      setError('');
      onLoginSuccess(result.role, result.displayName, result.welcomeMessage);
    } else {
      setError(result.errorMessage || 'كلمة السر غير صحيحة، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0B060F] text-[#F3EBF5] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full bg-[#FF3366]/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#140A1A]/90 border border-[#8C1D4F]/50 rounded-3xl p-7 sm:p-9 backdrop-blur-xl shadow-[0_0_50px_rgba(236,72,153,0.2)] text-center">
        {/* Glowing Heart Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#360D24] to-[#1F0816] border border-[#FF3366]/40 flex items-center justify-center shadow-[0_0_25px_rgba(255,51,102,0.4)]">
          <Heart className="w-8 h-8 fill-[#FF3366] text-[#FF3366] animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          بوابة حكايتنا الخاصة
        </h1>
        <p className="text-xs sm:text-sm text-[#D8B4D4] mb-8 leading-relaxed">
          مساحة سرية لتوثيق حبنا، صورنا، وأجمل اللحظات التي عشناها معاً
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-right">
          <div>
            <label
              htmlFor="auth-passcode-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-2"
            >
              كلمة المرور السرية
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#FF3366] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth-passcode-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="أدخل كلمة المرور السرية..."
                className="w-full pr-10 pl-11 py-3 text-sm bg-[#1A0C22] border border-[#3E1B4A] rounded-xl text-white placeholder:text-[#8C6D88] focus:outline-none focus:border-[#FF3366] shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C6D88] hover:text-[#FFA5BA] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p role="alert" className="text-xs text-[#FF4D88] mt-2 font-medium">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-5 text-sm font-bold text-white bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:from-[#FF4D88] hover:to-[#F43F5E] rounded-xl shadow-[0_0_20px_rgba(255,51,102,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>دخول عالمنا الخاص</span>
          </button>
        </form>

        {/* Private discreet footer note */}
        <div className="mt-8 pt-6 border-t border-[#2C1438] flex items-center justify-center gap-2 text-xs text-[#A888A4]">
          <Lock className="w-3.5 h-3.5 text-[#FF3366]" />
          <span>مساحة خاصة ومحمية بكلمة مرور سرية</span>
        </div>
      </div>
    </div>
  );
};
