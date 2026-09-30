import React, { useState } from 'react';
import { Category, Dish, GeminiExtractedDish, GeminiMenuAnalysisResult } from '../../types';
import { geminiService } from '../../services/geminiService';
import { SAMPLE_MENU_OCR_TEXT } from '../../services/mockData';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  Edit2,
  Check,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  CopyCheck,
} from 'lucide-react';

interface PDFImporterModalProps {
  existingCategories: Category[];
  existingDishes: Dish[];
  onImportConfirmed: (newCategories: Category[], newDishes: Dish[], mergeMode: 'merge' | 'replace') => void;
  onClose: () => void;
}

export const PDFImporterModal: React.FC<PDFImporterModalProps> = ({
  existingCategories,
  existingDishes,
  onImportConfirmed,
  onClose,
}) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analyzingStepText, setAnalyzingStepText] = useState<string>('Enviando documento a Gemini...');

  // Parsed result
  const [analysisResult, setAnalysisResult] = useState<GeminiMenuAnalysisResult | null>(null);
  const [reviewDishes, setReviewDishes] = useState<GeminiExtractedDish[]>([]);
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'Alta' | 'Media' | 'Revisar'>('all');
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [mergeMode, setMergeMode] = useState<'merge' | 'replace'>('merge');

  // Start Gemini Analysis
  const handleStartAnalysis = async (useSample: boolean = false) => {
    setErrorMsg(null);
    setStep('analyzing');
    setAnalyzingStepText('Iniciando Gemini 3.8 Flash con visión multimodal...');

    const stepInterval = setInterval(() => {
      setAnalyzingStepText((prev) => {
        if (prev.includes('Iniciando')) return 'Detectando columnas, tipografías y categorías...';
        if (prev.includes('Detectando')) return 'Extrayendo platos, precios numéricos y variantes...';
        if (prev.includes('Extrayendo')) return 'Verificando alérgenos declarados e ingredientes...';
        return 'Aplicando regla estricta: NO INVENTAR INFORMACIÓN...';
      });
    }, 1400);

    try {
      let result: GeminiMenuAnalysisResult;
      if (useSample) {
        result = await geminiService.analyzeMenu({ sampleText: SAMPLE_MENU_OCR_TEXT });
      } else if (file) {
        result = await geminiService.analyzeMenu({ file });
      } else {
        throw new Error('Selecciona un archivo PDF o utiliza la carta demo de prueba.');
      }

      clearInterval(stepInterval);

      // Check duplicates against existing dishes
      const enriched = result.dishes.map((extracted) => {
        const duplicate = existingDishes.find(
          (ed) => ed.name.trim().toLowerCase() === extracted.name.trim().toLowerCase()
        );
        return {
          ...extracted,
          isDuplicate: Boolean(duplicate),
          duplicateDishId: duplicate?.id,
          isSelected: true,
        };
      });

      setAnalysisResult(result);
      setReviewDishes(enriched);
      setStep('review');
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Gemini PDF analysis failed:', err);
      setErrorMsg(err.message || 'Error al procesar la carta con Gemini.');
      setStep('upload');
    }
  };

  const handleToggleSelect = (tempId: string) => {
    setReviewDishes((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, isSelected: !d.isSelected } : d))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setReviewDishes((prev) => prev.map((d) => ({ ...d, isSelected: select })));
  };

  const handleUpdateDishField = (tempId: string, field: keyof GeminiExtractedDish, val: any) => {
    setReviewDishes((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, [field]: val } : d))
    );
  };

  const handleConfirmPublish = () => {
    const selectedDishes = reviewDishes.filter((d) => d.isSelected);
    if (selectedDishes.length === 0) {
      setErrorMsg('Debes seleccionar al menos un plato para importar.');
      return;
    }

    // 1. Map/create categories
    const categoryNameToId = new Map<string, string>();
    existingCategories.forEach((c) => categoryNameToId.set(c.name.toLowerCase(), c.id));

    const finalCategories: Category[] = [...existingCategories];
    const extractedCatNames = Array.from(new Set(selectedDishes.map((d) => d.categoryName.trim())));

    extractedCatNames.forEach((catName) => {
      const lower = catName.toLowerCase();
      if (!categoryNameToId.has(lower)) {
        const newCat: Category = {
          id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          restaurantId: 'rest_mesavision_demo',
          name: catName,
          order: finalCategories.length + 1,
          isActive: true,
          updatedAt: new Date().toISOString(),
        };
        finalCategories.push(newCat);
        categoryNameToId.set(lower, newCat.id);
      }
    });

    // 2. Build final dishes with incremental merge (preserving existing photos, videos, 3D models)
    let finalDishes: Dish[] = mergeMode === 'replace' ? [] : [...existingDishes];

    selectedDishes.forEach((ext, idx) => {
      const catId = categoryNameToId.get(ext.categoryName.toLowerCase()) || finalCategories[0]?.id || 'cat_default';
      
      const existingMatch = existingDishes.find((ed) => ed.id === ext.duplicateDishId);

      const dishObj: Dish = {
        id: existingMatch?.id || `dish_imported_${Date.now()}_${idx}`,
        restaurantId: 'rest_mesavision_demo',
        categoryId: catId,
        name: ext.name,
        description: ext.description || '',
        price: ext.price !== null ? ext.price : 0,
        currency: ext.currency || 'EUR',
        isAvailable: true,
        isFeatured: false,
        variants: ext.variants.map((v, vIdx) => ({
          id: `var_${vIdx}`,
          name: v.name,
          price: v.price,
        })),
        ingredients: ext.ingredients || [],
        allergens: ext.allergens || [],
        dietaryTags: ext.dietaryTags || [],
        
        // Incremental preservation
        photo: existingMatch?.photo,
        video: existingMatch?.video,
        model3D: existingMatch?.model3D,

        order: (existingMatch?.order ?? finalDishes.length) + 1,
        confidence: ext.confidence,
        confidenceNotes: ext.confidenceNotes || undefined,
        updatedAt: new Date().toISOString(),
      };

      if (mergeMode === 'merge' && existingMatch) {
        // Update in place
        const index = finalDishes.findIndex((d) => d.id === existingMatch.id);
        if (index !== -1) {
          finalDishes[index] = dishObj;
        } else {
          finalDishes.push(dishObj);
        }
      } else {
        finalDishes.push(dishObj);
      }
    });

    onImportConfirmed(finalCategories, finalDishes, mergeMode);
    onClose();
  };

  const filteredReviewDishes = reviewDishes.filter((d) => {
    if (confidenceFilter === 'all') return true;
    return d.confidence === confidenceFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Importador Inteligente PDF + Gemini</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  gemini-3.8-flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Convierte tu carta física o digital en formato interactivo estructurado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Upload / Select PDF */}
        {step === 'upload' && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Strict AI Rule Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-bold text-amber-300">
                  Garantía de fidelidad gastronómica: NO INVENTAR INFORMACIÓN
                </p>
                <p className="text-slate-400">
                  Gemini solo extraerá precios, categorías, ingredientes y alérgenos explícitamente legibles en el documento. Si un dato no aparece, se mantiene vacío para tu revisión humana.
                </p>
              </div>
            </div>

            {/* Dropzone */}
            <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/70 group">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-amber-400" />
              </div>
              <span className="text-base font-bold text-white">
                {file ? file.name : 'Sube tu carta en PDF o Imagen'}
              </span>
              <span className="text-xs text-slate-400 mt-1 max-w-sm">
                Arrastra aquí el archivo PDF de la carta o haz clic para seleccionarlo de tu dispositivo
              </span>
              <span className="text-[11px] text-amber-400/80 font-mono mt-3">
                Formatos: PDF, PNG, JPG (Hasta 30MB)
              </span>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />
            </label>

            {/* Fast 1-Click Demo Option */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                <p className="font-semibold text-slate-300">¿No tienes un PDF a mano ahora mismo?</p>
                <p>Prueba el análisis en tiempo real con una carta de temporada de ejemplo.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleStartAnalysis(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Probar con Carta Demo</span>
                </button>

                <button
                  disabled={!file}
                  onClick={() => handleStartAnalysis(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Analizar Documento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Analyzing in Progress */}
        {step === 'analyzing' && (
          <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin flex items-center justify-center"></div>
              <Sparkles className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-bold text-white">
                Gemini está analizando la carta
              </h3>
              <p className="text-xs text-amber-300/90 font-mono animate-pulse">
                {analyzingStepText}
              </p>
              <p className="text-[11px] text-slate-500 pt-2">
                Extrayendo estructura de columnas, precios, porciones y alérgenos con rigor estricto.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Human Review Screen */}
        {step === 'review' && analysisResult && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Top Review summary toolbar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Revisión Humana Requerida</span>
                    <span className="text-xs text-slate-400">
                      ({reviewDishes.filter((d) => d.isSelected).length} de {reviewDishes.length} platos seleccionados)
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Revisa los datos extraídos antes de publicar en tu carta digital.
                  </p>
                </div>

                {/* Confidence filter tabs */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 px-2 font-semibold">Filtro:</span>
                  {(['all', 'Alta', 'Media', 'Revisar'] as const).map((conf) => (
                    <button
                      key={conf}
                      onClick={() => setConfidenceFilter(conf)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        confidenceFilter === conf
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {conf === 'all' ? 'Todos' : conf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection helpers & merge mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="text-amber-400 hover:underline font-medium"
                  >
                    Seleccionar todos
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Deseleccionar todos
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Fusión:</span>
                  <select
                    value={mergeMode}
                    onChange={(e) => setMergeMode(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                  >
                    <option value="merge">
                      Fusión incremental (Mantiene fotos, videos y 3D existentes)
                    </option>
                    <option value="replace">Reemplazar carta existente por completo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dishes list table */}
            <div className="p-4 sm:p-6 space-y-3 flex-1 overflow-y-auto">
              {filteredReviewDishes.map((dish) => {
                const isEditing = editingDishId === dish.tempId;

                const confidenceColor =
                  dish.confidence === 'Alta'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : dish.confidence === 'Media'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                return (
                  <div
                    key={dish.tempId}
                    className={`rounded-2xl border transition-all p-4 ${
                      dish.isSelected
                        ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                        : 'bg-slate-950/50 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={dish.isSelected}
                        onChange={() => handleToggleSelect(dish.tempId)}
                        className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />

                      <div className="flex-1 space-y-2">
                        {/* Title line & confidence badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isEditing ? (
                              <input
                                type="text"
                                value={dish.name}
                                onChange={(e) =>
                                  handleUpdateDishField(dish.tempId, 'name', e.target.value)
                                }
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white"
                              />
                            ) : (
                              <h4 className="text-base font-bold text-white">{dish.name}</h4>
                            )}

                            {/* Confidence Badge */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${confidenceColor}`}
                            >
                              Confianza: {dish.confidence}
                            </span>

                            {/* Duplicate Warning */}
                            {dish.isDuplicate && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <CopyCheck className="w-3 h-3" />
                                <span>Coincide con plato existente (se actualizará)</span>
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.10"
                                  value={dish.price !== null ? dish.price : ''}
                                  placeholder="0.00"
                                  onChange={(e) =>
                                    handleUpdateDishField(
                                      dish.tempId,
                                      'price',
                                      parseFloat(e.target.value) || null
                                    )
                                  }
                                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-amber-400"
                                />
                                <span className="text-xs text-slate-400">€</span>
                              </div>
                            ) : (
                              <span className="text-base font-black text-amber-400">
                                {dish.price !== null ? `${dish.price.toFixed(2)} €` : 'Sin precio detectado'}
                              </span>
                            )}

                            <button
                              onClick={() =>
                                setEditingDishId(isEditing ? null : dish.tempId)
                              }
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
                            >
                              {isEditing ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Edit2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Category & Description */}
                        <div className="flex flex-col sm:flex-row gap-3 text-xs">
                          <div className="shrink-0 flex items-center gap-1.5 text-slate-400">
                            <span>Categoría:</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={dish.categoryName}
                                onChange={(e) =>
                                  handleUpdateDishField(dish.tempId, 'categoryName', e.target.value)
                                }
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-white"
                              />
                            ) : (
                              <span className="font-semibold text-amber-300/90">
                                {dish.categoryName}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 text-slate-300">
                            {isEditing ? (
                              <textarea
                                rows={2}
                                value={dish.description || ''}
                                onChange={(e) =>
                                  handleUpdateDishField(dish.tempId, 'description', e.target.value)
                                }
                                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                              />
                            ) : (
                              <p className="line-clamp-2">
                                {dish.description || (
                                  <span className="text-slate-500 italic">
                                    Sin descripción en el documento
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Allergens & Ingredients badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {dish.allergens.length > 0 ? (
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-rose-400 font-semibold">Alérgenos:</span>
                              {dish.allergens.map((all, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]"
                                >
                                  {all}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              Alérgenos no especificados en el texto
                            </span>
                          )}

                          {dish.confidenceNotes && (
                            <span className="text-[10px] text-amber-400/80 italic">
                              Nota Gemini: {dish.confidenceNotes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Volver a Subir
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPublish}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    Confirmar e Importar {reviewDishes.filter((d) => d.isSelected).length} Platos
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
