import React, { useRef, useEffect } from 'react';
import { Dish } from '../../types';
import { X, Play, Volume2, Video as VideoIcon } from 'lucide-react';

interface DishVideoModalProps {
  dish: Dish | null;
  onClose: () => void;
}

export const DishVideoModal: React.FC<DishVideoModalProps> = ({ dish, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (dish?.video && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy might require user interaction or mute
      });
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [dish]);

  if (!dish || !dish.video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <VideoIcon className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
                Presentación Real
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-[240px]">
                {dish.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={dish.video.videoUrl}
            poster={dish.video.thumbnailUrl || dish.photo?.url}
            preload="none"
            controls
            playsInline
            loop
            className="w-full h-full object-contain"
          />
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Grabación del emplatado en cocina</span>
          </div>
          <span className="font-mono text-slate-500">
            {dish.video.durationSeconds ? `${dish.video.durationSeconds}s` : 'Video real'}
          </span>
        </div>
      </div>
    </div>
  );
};
