import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface RomanticAudioPlayerProps {
  songTitle?: string;
  audioSrc?: string;
}

const DEFAULT_AUDIO_SRC = '/assets/aistudio/WhatsApp_Audio_2026-11-12_at_5.02.07_PM_abd06135.mpeg';
const DEFAULT_SONG_TITLE = 'تامر عاشور — خليني في حضنك';

export const RomanticAudioPlayer: React.FC<RomanticAudioPlayerProps> = ({
  songTitle = DEFAULT_SONG_TITLE,
  audioSrc = DEFAULT_AUDIO_SRC,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.volume = isMuted ? 0 : volume;
      await audioRef.current.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
      setHasInteracted(true);
    } catch {
      // Browser blocked unmuted autoplay policy before user gesture
      setIsPlaying(false);
      setAutoplayBlocked(true);
    }
  }, [isMuted, volume]);

  const pauseAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  // Autoplay as soon as the site opens
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initial attempt to play immediately on page mount
    playAudio();

    // Browser autoplay policy handler: unlock audio on the very first user interaction
    const unlockOnGesture = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
            setHasInteracted(true);
            removeGestureListeners();
          })
          .catch(() => {
            // Still waiting for valid gesture
          });
      }
    };

    const removeGestureListeners = () => {
      window.removeEventListener('click', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
      window.removeEventListener('scroll', unlockOnGesture);
      window.removeEventListener('romantic-start-music', unlockOnGesture);
    };

    window.addEventListener('click', unlockOnGesture, { passive: true });
    window.addEventListener('touchstart', unlockOnGesture, { passive: true });
    window.addEventListener('keydown', unlockOnGesture, { passive: true });
    window.addEventListener('scroll', unlockOnGesture, { passive: true, once: true });
    window.addEventListener('romantic-start-music', unlockOnGesture);

    return () => {
      removeGestureListeners();
    };
  }, [playAudio]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      // Attempt autoplay again once metadata is loaded
      playAudio();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Hidden audio element pointing to the uploaded song */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        loop
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          // In case loop attribute is handled manually
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* Floating Audio Player Widget on Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40 max-w-[92vw] sm:max-w-sm select-none">
        {/* Autoplay prompt toast if browser blocked unmuted autoplay */}
        {autoplayBlocked && !isPlaying && !hasInteracted && (
          <button
            type="button"
            onClick={playAudio}
            className="mb-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF3366] to-[#E11D48] text-white text-xs font-bold shadow-[0_0_25px_rgba(255,51,102,0.6)] animate-bounce flex items-center gap-2 cursor-pointer border border-[#FFA5BA]/40"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>اضغطي هنا لتشغيل أغنيتنا 🎶❤️</span>
          </button>
        )}

        <div className="relative rounded-2xl sm:rounded-3xl bg-[#140A1A]/95 border border-[#8C1D4F]/60 backdrop-blur-xl shadow-[0_0_35px_rgba(255,51,102,0.25)] p-2.5 sm:p-3 transition-all duration-300">
          {/* Main Control Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause Main Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'إيقاف الأغنية مؤقتاً' : 'تشغيل أغنية خليني في حضنك'}
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الأغنية'}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
                isPlaying
                  ? 'bg-gradient-to-br from-[#FF3366] to-[#D81B60] text-white shadow-[0_0_20px_rgba(255,51,102,0.7)]'
                  : 'bg-[#2A1136] text-[#FDA4AF] hover:bg-[#3D184E] border border-[#FF3366]/40'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white translate-x-[-1px]" />
              )}
            </button>

            {/* Song Info & Equalizer */}
            <div
              className="flex-1 min-w-[130px] sm:min-w-[180px] cursor-pointer text-right"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <Heart className={`w-3 h-3 text-[#FF3366] shrink-0 ${isPlaying ? 'fill-[#FF3366] animate-pulse' : ''}`} />
                  <p className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                    {songTitle}
                  </p>
                </div>
                {/* Animated Equalizer Waveform */}
                <div className="flex items-end gap-[2px] h-3 shrink-0 ml-1">
                  <span
                    className={`w-[2.5px] bg-[#FF3366] rounded-full transition-all duration-300 ${
                      isPlaying ? 'h-3 animate-pulse' : 'h-1'
                    }`}
                  />
                  <span
                    className={`w-[2.5px] bg-[#FFA5BA] rounded-full transition-all duration-300 ${
                      isPlaying ? 'h-2 animate-bounce' : 'h-1'
                    }`}
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className={`w-[2.5px] bg-[#FF3366] rounded-full transition-all duration-300 ${
                      isPlaying ? 'h-3.5 animate-pulse' : 'h-1'
                    }`}
                    style={{ animationDelay: '300ms' }}
                  />
                  <span
                    className={`w-[2.5px] bg-[#FDA4AF] rounded-full transition-all duration-300 ${
                      isPlaying ? 'h-1.5 animate-bounce' : 'h-1'
                    }`}
                    style={{ animationDelay: '450ms' }}
                  />
                </div>
              </div>

              {/* Time display */}
              <div className="flex items-center justify-between text-[10px] text-[#C5A5C2]">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 213)}</span>
              </div>
            </div>

            {/* Expand / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label={isExpanded ? 'تصغير المشغل' : 'توسيع المشغل'}
              className="p-1 text-[#C5A5C2] hover:text-white transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Expanded Drawer: Seeker & Volume Controls */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-[#361342] flex flex-col gap-2.5 animate-in fade-in duration-200">
              {/* Progress Slider */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="تقديم أو ترجيع الأغنية"
                  className="w-full h-1.5 bg-[#2A1136] rounded-lg appearance-none cursor-pointer accent-[#FF3366]"
                />
              </div>

              {/* Volume & Details */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                    className="text-[#C5A5C2] hover:text-[#FFA5BA] transition-colors cursor-pointer"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-[#FF4D88]" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#FDA4AF]" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="مستوى الصوت"
                    className="w-16 sm:w-20 h-1 bg-[#2A1136] rounded-lg appearance-none cursor-pointer accent-[#FF3366]"
                  />
                </div>

                <div className="flex items-center gap-1 text-[10px] text-[#FFA5BA]">
                  <Music className="w-3 h-3 text-[#FF3366]" />
                  <span>أغنيتنا المفضلة</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
