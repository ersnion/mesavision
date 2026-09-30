import React, { useState } from 'react';
import { Dish } from '../../types';
import { Camera, Video, Box, Play, Eye, Sparkles, AlertCircle } from 'lucide-react';
import { DishVideoModal } from '../client/DishVideoModal';
import { DishARModal } from '../client/DishARModal';

interface MediaLibraryProps {
  dishes: Dish[];
  onOpenVideoRecorder: (dish: Dish) => void;
  onOpen3DManager: (dish: Dish) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  dishes,
  onOpenVideoRecorder,
  onOpen3DManager,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | '3d' | 'photos'>('all');
  const [previewVideoDish, setPreviewVideoDish] = useState<Dish | null>(null);
  const [previewARDish, setPreviewARDish] = useState<Dish | null>(null);

  const dishesWithVideo = dishes.filter((d) => Boolean(d.video));
  const dishesWith3D = dishes.filter((d) => Boolean(d.model3D));
  const dishesWithPhoto = dishes.filter((d) => Boolean(d.photo?.url));

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Fotografías de Platos</span>
            <div className="text-2xl font-black text-white mt-1">
              {dishesWithPhoto.length} <span className="text-sm font-normal text-slate-500">/ {dishes.length}</span>
            </div>
          </div>
          <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Camera className="w-6 h-6" />
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Videos Reales de Cocina</span>
            <div className="text-2xl font-black text-white mt-1">
              {dishesWithVideo.length} <span className="text-sm font-normal text-slate-500">/ {dishes.length}</span>
            </div>
          </div>
          <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Video className="w-6 h-6" />
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Modelos 3D & AR</span>
            <div className="text-2xl font-black text-white mt-1">
              {dishesWith3D.length} <span className="text-sm font-normal text-slate-500">/ {dishes.length}</span>
            </div>
          </div>
          <span className="p-3 rounded-2xl bg-sky-500/10 text-sky-400">
            <Box className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'Todo el Contenido Multimedia' },
          { id: 'videos', label: `Videos (${dishesWithVideo.length})` },
          { id: '3d', label: `Modelos 3D/AR (${dishesWith3D.length})` },
          { id: 'photos', label: `Fotografías (${dishesWithPhoto.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Dishes with Multimedia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dishes
          .filter((d) => {
            if (activeTab === 'videos') return Boolean(d.video);
            if (activeTab === '3d') return Boolean(d.model3D);
            if (activeTab === 'photos') return Boolean(d.photo?.url);
            return true;
          })
          .map((dish) => (
            <div
              key={dish.id}
              className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-3">
                  {dish.photo?.url ? (
                    <img
                      src={dish.photo.url}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}

                  {/* Overlaid Badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {dish.video && (
                      <span className="p-1.5 rounded-lg bg-black/80 text-amber-400 backdrop-blur-md">
                        <Video className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {dish.model3D && (
                      <span className="p-1.5 rounded-lg bg-black/80 text-sky-400 backdrop-blur-md">
                        <Box className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white truncate">{dish.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">dishId: {dish.id}</p>
              </div>

              {/* Status and Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Video real:</span>
                  {dish.video ? (
                    <button
                      onClick={() => setPreviewVideoDish(dish)}
                      className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{dish.video.durationSeconds}s (Reproducir)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenVideoRecorder(dish)}
                      className="text-slate-500 hover:text-amber-400"
                    >
                      + Grabar / Subir
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Modelo 3D:</span>
                  {dish.model3D ? (
                    <button
                      onClick={() => setPreviewARDish(dish)}
                      className="text-sky-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver 3D / AR</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpen3DManager(dish)}
                      className="text-slate-500 hover:text-sky-400"
                    >
                      + Configurar 3D
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modals for media preview */}
      <DishVideoModal dish={previewVideoDish} onClose={() => setPreviewVideoDish(null)} />
      <DishARModal dish={previewARDish} onClose={() => setPreviewARDish(null)} />
    </div>
  );
};
