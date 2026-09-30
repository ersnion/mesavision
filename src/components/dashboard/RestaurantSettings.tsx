import React, { useState } from 'react';
import { Restaurant } from '../../types';
import { Settings, Save, RefreshCw, Check, Cloud, Database, Wifi } from 'lucide-react';

interface RestaurantSettingsProps {
  restaurant: Restaurant;
  onSaveRestaurant: (restaurant: Restaurant) => void;
  onResetDemo: () => void;
}

export const RestaurantSettings: React.FC<RestaurantSettingsProps> = ({
  restaurant,
  onSaveRestaurant,
  onResetDemo,
}) => {
  const [formData, setFormData] = useState<Restaurant>({ ...restaurant });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof Restaurant, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRestaurant({ ...formData, updatedAt: new Date().toISOString() });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>Configuración del Restaurante y Carta</span>
            </h3>
            <p className="text-xs text-slate-400">
              Personaliza la identidad visual y datos de contacto de tu carta digital
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onResetDemo}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restablecer Datos Demo</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Datos del restaurante guardados correctamente y sincronizados.</span>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre Comercial del Restaurante *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Slug URL de la Carta (ej. /menu/mi-restaurante) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lema o Tagline Gastronómico
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción del Restaurante
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed"
            />
          </div>
        </div>

        {/* Currency & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Moneda (Código ISO)
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              placeholder="EUR, USD, MXN"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Símbolo de Moneda
            </label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => handleChange('currencySymbol', e.target.value)}
              placeholder="€, $, MX$"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Teléfono de Reservas
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Wi-Fi & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre de Red Wi-Fi Clientes
            </label>
            <input
              type="text"
              value={formData.wifiSsid || ''}
              onChange={(e) => handleChange('wifiSsid', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contraseña Wi-Fi Clientes
            </label>
            <input
              type="text"
              value={formData.wifiPassword || ''}
              onChange={(e) => handleChange('wifiPassword', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Horario de Cocina
            </label>
            <input
              type="text"
              value={formData.schedule || ''}
              onChange={(e) => handleChange('schedule', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Media URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL del Logotipo
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL de la Portada / Header
            </label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => handleChange('coverUrl', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>
        </div>
      </form>

      {/* Architecture Readiness Box */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-sky-400" />
          <span>Arquitectura de Producción & Almacenamiento</span>
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Esta versión implementa almacenamiento local Offline-First con IndexedDB y sincronización mediante la cola Outbox <code className="text-amber-400 font-mono">mesavision_sync_queue_v1</code>. La arquitectura modular está preparada para conectarse con Firebase Firestore, Google Cloud Storage, AWS S3 o Cloudflare R2 para el alojamiento de modelos 3D y videos de alta resolución en producción.
        </p>
      </div>
    </div>
  );
};
