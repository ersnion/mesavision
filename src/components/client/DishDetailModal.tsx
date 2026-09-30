import React, { useState } from 'react';
import { Dish, DishVariant } from '../../types';
import { X, Video, Box, AlertOctagon, Sparkles, Plus, Minus, ShoppingBag, Check } from 'lucide-react';

interface DishDetailModalProps {
  dish: Dish | null;
  currencySymbol: string;
  onClose: () => void;
  onOpenVideo: (dish: Dish) => void;
  onOpenAR: (dish: Dish) => void;
  onAddToCart?: (dish: Dish, variant?: DishVariant, quantity?: number) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  currencySymbol,
  onClose,
  onOpenVideo,
  onOpenAR,
  onAddToCart,
}) => {
  if (!dish) return null;

  const [selectedVariant, setSelectedVariant] = useState<DishVariant | null>(
    dish.variants && dish.variants.length > 0 ? dish.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const displayPrice = selectedVariant ? selectedVariant.price : dish.price;
  const totalPrice = displayPrice * quantity;

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(dish, selectedVariant || undefined, quantity);
      setAddedAnimation(true);
      setTimeout(() => {
        setAddedAnimation(false);
        onClose();
      }, 900);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal / Bottom Drawer Container */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Sticky top close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg"
          aria-label="Cerrar ficha de plato"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Dish Image */}
          <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
            {dish.photo?.url ? (
              <img
                src={dish.photo.url}
                alt={dish.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                <Box className="w-12 h-12 mb-2 stroke-1" />
                <span className="text-sm">Sin fotografía de presentación</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex flex-wrap gap-1.5">
                {dish.dietaryTags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs font-semibold rounded-full bg-black/75 text-emerald-300 backdrop-blur-md border border-emerald-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {dish.isFeatured && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/90 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 fill-current" />
                  Especialidad
                </span>
              )}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            {/* Title & Price Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                  {dish.name}
                </h2>
                {dish.isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Disponible en carta
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    Agotado por el momento
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-extrabold text-amber-400">
                  {displayPrice.toFixed(2)} {currencySymbol}
                </span>
                {dish.variants && dish.variants.length > 0 && (
                  <p className="text-[11px] text-slate-400">Según porción</p>
                )}
              </div>
            </div>

            {/* Multimedia Experience Buttons (3D / AR & Video) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {/* 3D / AR Button */}
              {dish.model3D ? (
                <button
                  onClick={() => onOpenAR(dish)}
                  className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all active:scale-98 cursor-pointer"
                >
                  <Box className="w-4 h-4 text-sky-200 animate-pulse" />
                  <span>🥽 VER EN MI MESA (3D/AR)</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Box className="w-4 h-4 opacity-40" />
                  <span>Modelo 3D no configurado</span>
                </button>
              )}

              {/* Video Button */}
              {dish.video ? (
                <button
                  onClick={() => onOpenVideo(dish)}
                  className="w-full py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>🎥 Ver cómo se presenta</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Video className="w-4 h-4 opacity-40" />
                  <span>Video no disponible</span>
                </button>
              )}
            </div>

            {/* Variants Selector */}
            {dish.variants && dish.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Seleccionar opción o tamaño:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dish.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-md'
                            : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <span className="text-xs font-medium">{v.name}</span>
                        <span className="text-xs font-bold text-amber-400">
                          {v.price.toFixed(2)} {currencySymbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {dish.description && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Descripción
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {dish.description}
                </p>
              </div>
            )}

            {/* Ingredients */}
            {dish.ingredients && dish.ingredients.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ingredientes principales
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {dish.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens warning */}
            {dish.allergens && dish.allergens.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-950/25 border border-rose-800/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Información de Alérgenos:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dish.allergens.map((all, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-medium border border-rose-500/30"
                    >
                      {all}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Ordering Bar */}
        {onAddToCart && (
          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-black text-sm text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to order CTA */}
            <button
              onClick={handleAdd}
              disabled={!dish.isAvailable}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                addedAnimation
                  ? 'bg-emerald-500 text-slate-950 scale-102'
                  : dish.isAvailable
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Añadido a tu mesa!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Añadir a comanda • {totalPrice.toFixed(2)} {currencySymbol}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
