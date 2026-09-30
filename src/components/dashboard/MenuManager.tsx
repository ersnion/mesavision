import React, { useState } from 'react';
import { Category, Dish, Restaurant } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Video,
  Box,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  ArrowUpDown,
  UtensilsCrossed,
  Check,
  X,
} from 'lucide-react';

interface MenuManagerProps {
  restaurant: Restaurant;
  categories: Category[];
  dishes: Dish[];
  activeSubTab?: 'all' | 'categories' | 'dishes';
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (catId: string) => void;
  onEditDish: (dish: Dish) => void;
  onNewDish: () => void;
  onDeleteDish: (dishId: string) => void;
  onToggleDishAvailability: (dishId: string) => void;
  onOpenVideoRecorder: (dish: Dish) => void;
  onOpen3DManager: (dish: Dish) => void;
  onOpenImporter: () => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({
  restaurant,
  categories,
  dishes,
  activeSubTab = 'all',
  onSaveCategory,
  onDeleteCategory,
  onEditDish,
  onNewDish,
  onDeleteDish,
  onToggleDishAvailability,
  onOpenVideoRecorder,
  onOpen3DManager,
  onOpenImporter,
}) => {
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [searchDish, setSearchDish] = useState<string>('');

  // Category inline create / edit state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catNameInput, setCatNameInput] = useState('');
  const [catDescInput, setCatDescInput] = useState('');

  const handleStartAddCategory = () => {
    setEditingCategory(null);
    setCatNameInput('');
    setCatDescInput('');
    setIsAddingCategory(true);
  };

  const handleStartEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatNameInput(cat.name);
    setCatDescInput(cat.description || '');
    setIsAddingCategory(true);
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;

    const saved: Category = {
      id: editingCategory?.id || `cat_${Date.now()}`,
      restaurantId: restaurant.id,
      name: catNameInput.trim(),
      description: catDescInput.trim() || undefined,
      order: editingCategory?.order ?? categories.length + 1,
      isActive: editingCategory?.isActive ?? true,
      updatedAt: new Date().toISOString(),
    };

    onSaveCategory(saved);
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const filteredDishes = dishes.filter((d) => {
    if (selectedCatFilter !== 'all' && d.categoryId !== selectedCatFilter) return false;
    if (searchDish.trim()) {
      const q = searchDish.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.ingredients.some((i) => i.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>Administración de Carta</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {categories.length} categorías y {dishes.length} platos registrados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImporter}
            className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Importar PDF (Gemini)</span>
          </button>

          <button
            onClick={handleStartAddCategory}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Categoría</span>
          </button>

          <button
            onClick={onNewDish}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Plato</span>
          </button>
        </div>
      </div>

      {/* Category Editor Drawer */}
      {isAddingCategory && (
        <form
          onSubmit={handleSaveCategorySubmit}
          className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">
              {editingCategory ? `Editar Categoría: ${editingCategory.name}` : 'Nueva Categoría'}
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de la categoría *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Pescados y Mariscos"
                value={catNameInput}
                onChange={(e) => setCatNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción breve (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Capturas salvajes de lonja diaria"
                value={catDescInput}
                onChange={(e) => setCatDescInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow"
            >
              Guardar Categoría
            </button>
          </div>
        </form>
      )}

      {/* Categories Horizontal Pills with Edit/Delete options */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Categorías ({categories.length}):
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCatFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCatFilter === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Todas ({dishes.length})
          </button>
          {categories.map((cat) => {
            const count = dishes.filter((d) => d.categoryId === cat.id).length;
            const isSelected = selectedCatFilter === cat.id;
            return (
              <div
                key={cat.id}
                className={`inline-flex items-center rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setSelectedCatFilter(cat.id)}
                  className="px-3 py-1.5 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
                <div className="pr-1.5 flex items-center gap-0.5 border-l border-black/10">
                  <button
                    onClick={() => handleStartEditCategory(cat)}
                    className="p-1 hover:text-amber-300 cursor-pointer"
                    title="Editar categoría"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1 hover:text-rose-400 cursor-pointer"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar plato por nombre, descripción o ingrediente..."
          value={searchDish}
          onChange={(e) => setSearchDish(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
        />
      </div>

      {/* Dishes List */}
      <div className="space-y-3">
        {filteredDishes.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-6 space-y-2">
            <UtensilsCrossed className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No hay platos en esta vista</p>
            <p className="text-xs text-slate-500">
              Pulsa "Nuevo Plato" o "Importar PDF" para digitalizar la carta.
            </p>
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const cat = categories.find((c) => c.id === dish.categoryId);

            return (
              <div
                key={dish.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-16 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative">
                    {dish.photo?.url ? (
                      <img
                        src={dish.photo.url}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white truncate max-w-[260px]">
                        {dish.name}
                      </span>
                      {cat && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                          {cat.name}
                        </span>
                      )}
                      {dish.confidence && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            dish.confidence === 'Alta'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          Gemini: {dish.confidence}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {dish.description || 'Sin descripción'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="text-amber-400 font-extrabold font-mono">
                        {dish.price.toFixed(2)} {restaurant.currencySymbol}
                      </span>
                      {dish.variants.length > 0 && (
                        <span className="text-slate-500">
                          ({dish.variants.length} variante{dish.variants.length > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Multimedia Badges & Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  {/* Video status / trigger */}
                  <button
                    onClick={() => onOpenVideoRecorder(dish)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      dish.video
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Configurar video real"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span className="text-[11px]">
                      {dish.video ? `${dish.video.durationSeconds}s` : '+ Video'}
                    </span>
                  </button>

                  {/* 3D Model status / trigger */}
                  <button
                    onClick={() => onOpen3DManager(dish)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      dish.model3D
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Configurar modelo 3D / AR"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span className="text-[11px]">
                      {dish.model3D ? '3D Listo' : '+ 3D/AR'}
                    </span>
                  </button>

                  {/* Availability toggle */}
                  <button
                    onClick={() => onToggleDishAvailability(dish.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      dish.isAvailable
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    }`}
                    title={dish.isAvailable ? 'Disponible' : 'Agotado'}
                  >
                    {dish.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEditDish(dish)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    title="Editar plato"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteDish(dish.id)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                    title="Eliminar plato"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
