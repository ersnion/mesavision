import React, { useState } from 'react';
import { Dish, Category, DishVariant, DishPhoto } from '../../types';
import { X, Plus, Trash2, Camera, Video, Box, Sparkles, Check, AlertCircle } from 'lucide-react';

interface DishFormModalProps {
  dish: Dish | null; // null for new dish
  categories: Category[];
  currencySymbol: string;
  onSave: (dish: Dish) => void;
  onClose: () => void;
  onOpenVideoRecorder: (dish: Dish) => void;
  onOpen3DManager: (dish: Dish) => void;
}

const ALLERGENS_LIST = [
  'Gluten',
  'Crustáceos',
  'Huevos',
  'Pescado',
  'Cacahuetes',
  'Soja',
  'Lácteos',
  'Frutos de cáscara',
  'Apio',
  'Mostaza',
  'Sésamo',
  'Sulfitos',
  'Altramuces',
  'Moluscos',
];

const DIETARY_TAGS = ['Vegetariano', 'Vegano', 'Sin Gluten', 'Bajo en Calorías', 'Picante'];

export const DishFormModal: React.FC<DishFormModalProps> = ({
  dish,
  categories,
  currencySymbol,
  onSave,
  onClose,
  onOpenVideoRecorder,
  onOpen3DManager,
}) => {
  const isEditing = Boolean(dish);

  const [categoryId, setCategoryId] = useState<string>(
    dish?.categoryId || (categories[0]?.id ?? '')
  );
  const [name, setName] = useState<string>(dish?.name || '');
  const [description, setDescription] = useState<string>(dish?.description || '');
  const [price, setPrice] = useState<number>(dish?.price ?? 12.0);
  const [isAvailable, setIsAvailable] = useState<boolean>(dish?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(dish?.isFeatured ?? false);
  
  // Variants
  const [variants, setVariants] = useState<DishVariant[]>(dish?.variants || []);
  const [newVariantName, setNewVariantName] = useState<string>('');
  const [newVariantPrice, setNewVariantPrice] = useState<number>(0);

  // Ingredients
  const [ingredients, setIngredients] = useState<string[]>(dish?.ingredients || []);
  const [ingredientInput, setIngredientInput] = useState<string>('');

  // Allergens & Dietary
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(dish?.allergens || []);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(dish?.dietaryTags || []);

  // Photo
  const [photoUrl, setPhotoUrl] = useState<string>(dish?.photo?.url || '');

  const handleAddIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    setIngredients(ingredients.filter((i) => i !== ing));
  };

  const handleAddVariant = () => {
    if (newVariantName.trim() && newVariantPrice > 0) {
      setVariants([
        ...variants,
        {
          id: `var_${Date.now()}`,
          name: newVariantName.trim(),
          price: newVariantPrice,
        },
      ]);
      setNewVariantName('');
      setNewVariantPrice(0);
    }
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const toggleAllergen = (item: string) => {
    if (selectedAllergens.includes(item)) {
      setSelectedAllergens(selectedAllergens.filter((a) => a !== item));
    } else {
      setSelectedAllergens([...selectedAllergens, item]);
    }
  };

  const toggleDietary = (item: string) => {
    if (selectedDietary.includes(item)) {
      setSelectedDietary(selectedDietary.filter((d) => d !== item));
    } else {
      setSelectedDietary([...selectedDietary, item]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let photoObj: DishPhoto | undefined = dish?.photo;
    if (photoUrl) {
      photoObj = {
        id: dish?.photo?.id || `pho_${Date.now()}`,
        dishId: dish?.id || `dish_${Date.now()}`,
        url: photoUrl,
        isPrimary: true,
        uploadedAt: new Date().toISOString(),
      };
    } else {
      photoObj = undefined;
    }

    const savedDish: Dish = {
      id: dish?.id || `dish_${Date.now()}`,
      restaurantId: dish?.restaurantId || 'rest_mesavision_demo',
      categoryId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      currency: 'EUR',
      isAvailable,
      isFeatured,
      variants,
      ingredients,
      allergens: selectedAllergens,
      dietaryTags: selectedDietary,
      photo: photoObj,
      video: dish?.video,
      model3D: dish?.model3D,
      order: dish?.order ?? 99,
      confidence: dish?.confidence,
      confidenceNotes: dish?.confidenceNotes,
      updatedAt: new Date().toISOString(),
    };

    onSave(savedDish);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? `Editar: ${dish?.name}` : 'Crear Nuevo Plato en Carta'}
            </h2>
            <p className="text-xs text-slate-400">
              Configura información, multimedia y alérgenos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del plato *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Tartar de Atún Rojo"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoría *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Precio Base ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.10"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 w-4 h-4"
                />
                <span>Disponible en Carta</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 w-4 h-4"
                />
                <span>Plato Destacado</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción del plato
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla la elaboración, textura, guarnición o historia del plato..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Photo Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Fotografía de presentación
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-20 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-600" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  placeholder="URL de la imagen (o sube un archivo)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors inline-block">
                    Subir foto desde dispositivo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Video & 3D shortcuts for this dish */}
          {dish && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Multimedia Especializada (Asociada por dishId)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onOpenVideoRecorder(dish)}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-white">Video Real</div>
                      <div className="text-[10px] text-slate-400">
                        {dish.video ? `${dish.video.durationSeconds}s grabado` : 'Sin video'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">Configurar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpen3DManager(dish)}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="font-semibold text-white">Modelo 3D & AR</div>
                      <div className="text-[10px] text-slate-400">
                        {dish.model3D ? 'Configurado' : 'Sin modelo'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-400 font-bold">Configurar</span>
                </button>
              </div>
            </div>
          )}

          {/* Variants */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Variantes o Tamaños (Opcional)
            </label>
            <div className="space-y-1.5">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="font-medium text-white">{v.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">{v.price.toFixed(2)} {currencySymbol}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nombre de porción (ej. 400g)"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Precio"
                  step="0.10"
                  value={newVariantPrice || ''}
                  onChange={(e) => setNewVariantPrice(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir
                </button>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Ingredientes
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                >
                  <span>{ing}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe un ingrediente y pulsa Enter o Añadir..."
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Añadir
              </button>
            </div>
          </div>

          {/* Allergens Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-rose-300">
              Alérgenos Presentes (Normativa 1169/2011)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ALLERGENS_LIST.map((all) => {
                const isSelected = selectedAllergens.includes(all);
                return (
                  <button
                    type="button"
                    key={all}
                    onClick={() => toggleAllergen(all)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/25 border-rose-500/60 text-rose-200'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{all}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-emerald-300">
              Distintivos Dietéticos
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_TAGS.map((diet) => {
                const isSelected = selectedDietary.includes(diet);
                return (
                  <button
                    type="button"
                    key={diet}
                    onClick={() => toggleDietary(diet)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isEditing ? 'Guardar Cambios' : 'Crear Plato'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
