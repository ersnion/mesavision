import React, { useState, useRef, useEffect } from 'react';
import { Dish } from '../../types';
import { X, Box, Compass, RotateCcw, Sparkles, Layers, Maximize2, AlertCircle } from 'lucide-react';

interface DishARModalProps {
  dish: Dish | null;
  onClose: () => void;
}

export const DishARModal: React.FC<DishARModalProps> = ({ dish, onClose }) => {
  const [scale, setScale] = useState<number>(1.0);
  const [surfaceMode, setSurfaceMode] = useState<'studio' | 'wood-table'>('wood-table');
  const [arSupported, setArSupported] = useState<boolean>(true);
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    if (dish?.model3D?.scale) {
      setScale(dish.model3D.scale);
    }
  }, [dish]);

  if (!dish || !dish.model3D) return null;

  const handleLaunchAR = () => {
    const mv = modelViewerRef.current;
    if (mv && typeof mv.activateAR === 'function') {
      try {
        mv.activateAR();
      } catch (e) {
        console.warn('AR launch error, remaining in 3D fallback mode', e);
        setArSupported(false);
      }
    } else {
      setArSupported(false);
    }
  };

  const handleResetCamera = () => {
    const mv = modelViewerRef.current;
    if (mv) {
      mv.cameraOrbit = '0deg 75deg 105%';
      mv.fieldOfView = 'auto';
    }
    setScale(1.0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95 z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30">
              <Box className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Experiencia 3D & Realidad Aumentada
                </span>
                {dish.isDemo && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                    DEMO 3D
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-[280px] sm:max-w-md">
                {dish.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar visor 3D"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D / AR Viewport Container */}
        <div
          className={`relative flex-1 min-h-[360px] sm:min-h-[440px] flex items-center justify-center transition-colors duration-300 ${
            surfaceMode === 'wood-table'
              ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-stone-900 to-black'
              : 'bg-gradient-to-b from-slate-900 via-slate-950 to-black'
          }`}
        >
          {/* Table simulation surface ring */}
          {surfaceMode === 'wood-table' && (
            <div className="absolute inset-x-8 bottom-6 h-32 rounded-[50%] bg-gradient-to-b from-amber-900/20 to-transparent border border-amber-500/10 pointer-events-none blur-sm transform scale-y-50"></div>
          )}

          {/* Web Component <model-viewer> */}
          <model-viewer
            ref={modelViewerRef}
            src={dish.model3D.glbUrl}
            ios-src={dish.model3D.usdzUrl}
            alt={`Modelo 3D de ${dish.name}`}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            camera-controls
            auto-rotate
            rotation-per-second="15deg"
            camera-orbit="0deg 75deg 105%"
            shadow-intensity="1.5"
            shadow-softness="0.8"
            exposure="1.1"
            loading="lazy"
            style={{ width: '100%', height: '100%', minHeight: '360px' }}
          >
            {/* AR Launch Button Inside Model Viewer slot or floating fallback */}
            <div slot="ar-button" className="hidden"></div>
          </model-viewer>

          {/* Quick HUD controls overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={() => setSurfaceMode(surfaceMode === 'studio' ? 'wood-table' : 'studio')}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/60 backdrop-blur-md text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              title="Cambiar superficie de mesa"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">
                {surfaceMode === 'wood-table' ? 'Mesa Madera' : 'Estudio'}
              </span>
            </button>
            <button
              onClick={handleResetCamera}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/60 backdrop-blur-md text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              title="Restablecer posición inicial"
            >
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Centrar</span>
            </button>
          </div>

          {/* Interaction Guide */}
          <div className="absolute bottom-4 left-4 pointer-events-none z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Arrastra para rotar en 360° • Pellizca para zoom</span>
          </div>
        </div>

        {/* Footer controls & Real AR Action */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <div className="w-full sm:w-auto text-left">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Escala de porción:</span>
              <span className="font-bold text-white">{(scale * 100).toFixed(0)}%</span>
              <span className="text-[11px] text-slate-500">(Aproximada en mesa)</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={scale}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setScale(val);
                  if (modelViewerRef.current) {
                    modelViewerRef.current.scale = `${val} ${val} ${val}`;
                  }
                }}
                className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>

          {/* AR Trigger Button */}
          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              onClick={handleLaunchAR}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500 hover:from-sky-400 hover:to-amber-400 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
            >
              <Box className="w-5 h-5 animate-bounce" />
              <span>COLOCAR EN MI MESA (AR)</span>
            </button>
          </div>
        </div>

        {/* Disclaimer / Fallback note */}
        <div className="px-5 py-2 bg-slate-900/60 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>En dispositivos sin sensor AR se visualiza en 3D interactivo sobre mesa.</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500">ID: {dish.id}</span>
        </div>
      </div>
    </div>
  );
};
