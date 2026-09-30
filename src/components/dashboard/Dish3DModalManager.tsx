import React, { useState, useRef } from 'react';
import { Dish, Dish3DModel, Model3DStatus } from '../../types';
import { Box, X, Check, Trash2, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';

interface Dish3DModalManagerProps {
  dish: Dish;
  onSave3DModel: (dishId: string, model: Dish3DModel | undefined) => void;
  onClose: () => void;
}

const CULINARY_PRESETS = [
  {
    name: 'Hamburguesa Gourmet (GLB)',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Burger/glTF-Binary/Burger.glb',
    scale: 1.0,
  },
  {
    name: 'Cámara Antigua / Vajilla Clásica (GLB)',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    scale: 0.9,
  },
  {
    name: 'Aguacate Fresco / Fruta (GLB)',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
    scale: 1.2,
  },
  {
    name: 'Caja de Bocadillo / Postre (GLB)',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxTextured/glTF-Binary/BoxTextured.glb',
    scale: 0.8,
  },
];

export const Dish3DModalManager: React.FC<Dish3DModalManagerProps> = ({
  dish,
  onSave3DModel,
  onClose,
}) => {
  const [glbUrl, setGlbUrl] = useState<string>(dish.model3D?.glbUrl || '');
  const [usdzUrl, setUsdzUrl] = useState<string>(dish.model3D?.usdzUrl || '');
  const [scale, setScale] = useState<number>(dish.model3D?.scale || 1.0);
  const [status, setStatus] = useState<Model3DStatus>(dish.model3D?.status || 'LOCAL');
  const [arPlacement, setArPlacement] = useState<'table' | 'floor'>(
    dish.model3D?.arPlacement || 'table'
  );

  const modelViewerRef = useRef<any>(null);

  const handleSave = () => {
    if (!glbUrl.trim()) {
      onSave3DModel(dish.id, undefined);
      onClose();
      return;
    }

    const model: Dish3DModel = {
      id: dish.model3D?.id || `mod_${Date.now()}`,
      dishId: dish.id, // Asociado estrictamente mediante dishId
      glbUrl: glbUrl.trim(),
      usdzUrl: usdzUrl.trim() || undefined,
      scale,
      arPlacement,
      status: 'SYNCED',
      updatedAt: new Date().toISOString(),
    };

    onSave3DModel(dish.id, model);
    onClose();
  };

  const handleRemove = () => {
    onSave3DModel(dish.id, undefined);
    onClose();
  };

  const handleSelectPreset = (preset: typeof CULINARY_PRESETS[0]) => {
    setGlbUrl(preset.url);
    setScale(preset.scale);
    setStatus('SYNCED');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Box className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-sky-400 uppercase">
                Configuración de Modelo 3D & AR
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-[280px]">
                {dish.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Modelos 3D de Prueba Rápida (DEMO):</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CULINARY_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    glbUrl === p.url
                      ? 'bg-sky-500/20 border-sky-500/60 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="block truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL del Modelo GLB (Android, WebXR, SceneViewer & Visor 3D) *
              </label>
              <input
                type="url"
                value={glbUrl}
                onChange={(e) => setGlbUrl(e.target.value)}
                placeholder="https://.../plato.glb"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL del Modelo USDZ (Opcional para Apple iOS Quick Look)
              </label>
              <input
                type="url"
                value={usdzUrl}
                onChange={(e) => setUsdzUrl(e.target.value)}
                placeholder="https://.../plato.usdz"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Escala Inicial: <strong className="text-sky-400">{(scale * 100).toFixed(0)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Colocación AR
                </label>
                <select
                  value={arPlacement}
                  onChange={(e) => setArPlacement(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="table">Superficie Horizontal (Mesa)</option>
                  <option value="floor">Suelo / Mostrador</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          {glbUrl && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">
                Previsualización Interactiva del Modelo:
              </span>
              <div className="h-56 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
                <model-viewer
                  ref={modelViewerRef}
                  src={glbUrl}
                  ios-src={usdzUrl || undefined}
                  camera-controls
                  auto-rotate
                  style={{ width: '100%', height: '100%' }}
                >
                </model-viewer>
                <span className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                  Gira con el cursor para inspeccionar
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {dish.model3D ? (
            <button
              onClick={handleRemove}
              className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Desvincular Modelo 3D</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Modelo 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
