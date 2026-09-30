import React, { useState, useEffect, useRef } from 'react';
import { Table, Restaurant } from '../../types';
import QRCode from 'qrcode';
import {
  QrCode,
  Nfc,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Printer,
  Smartphone,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';

interface TablesManagerProps {
  restaurant: Restaurant;
  tables: Table[];
  onSaveTable: (table: Table) => void;
  onDeleteTable: (tableId: string) => void;
}

export const TablesManager: React.FC<TablesManagerProps> = ({
  restaurant,
  tables,
  onSaveTable,
  onDeleteTable,
}) => {
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [selectedTableForNFC, setSelectedTableForNFC] = useState<Table | null>(null);
  
  // New Table Form
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCode, setNewTableCode] = useState('');
  const [newTableZone, setNewTableZone] = useState('Salón Principal');
  const [newTableCapacity, setNewTableCapacity] = useState(4);

  // Generated QR data URL for preview modal
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  // NFC writing state
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [copiedNfc, setCopiedNfc] = useState(false);

  // Generate QR when selectedTableForQR changes
  useEffect(() => {
    if (selectedTableForQR) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mesavision.app';
      const fullUrl = `${origin}/menu/${restaurant.slug}?mesa=${selectedTableForQR.code}`;

      QRCode.toDataURL(fullUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [selectedTableForQR, restaurant.slug]);

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim() || !newTableCode.trim()) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mesavision.app';
    const cleanCode = newTableCode.trim().toUpperCase().replace(/\s+/g, '-');
    const tableUrl = `${origin}/menu/${restaurant.slug}?mesa=${cleanCode}`;

    const newTable: Table = {
      id: `tbl_${Date.now()}`,
      restaurantId: restaurant.id,
      name: newTableName.trim(),
      code: cleanCode,
      zone: newTableZone,
      capacity: newTableCapacity,
      qrUrl: tableUrl,
      nfcPayload: tableUrl,
      updatedAt: new Date().toISOString(),
    };

    onSaveTable(newTable);
    setIsAddingTable(false);
    setNewTableName('');
    setNewTableCode('');
  };

  // Web NFC (NDEFReader)
  const handleWriteNFC = async (table: Table) => {
    setNfcWriting(true);
    setNfcError(null);
    setNfcSuccess(false);

    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      try {
        // @ts-ignore
        const ndef = new window.NDEFReader();
        await ndef.write({
          records: [
            {
              recordType: 'url',
              data: table.nfcPayload,
            },
          ],
        });
        setNfcSuccess(true);
      } catch (err: any) {
        console.error('NFC error:', err);
        setNfcError(err.message || 'Error al comunicarse con el chip NFC.');
      } finally {
        setNfcWriting(false);
      }
    } else {
      setNfcWriting(false);
      setNfcError(
        'Tu navegador actual no admite Web NFC directamente (disponible en Chrome para Android). Puedes copiar el payload URL abajo para grabarlo con cualquier app de NFC como "NFC Tools".'
      );
    }
  };

  const handleCopyNFC = (payload: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedNfc(true);
    setTimeout(() => setCopiedNfc(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl || !selectedTableForQR) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `MESAvision_QR_${selectedTableForQR.code}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining strict Carta Digital QR & NFC separation */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <span>Gestor de Mesas, Códigos QR y Chips NFC</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Cada mesa cuenta con su propio identificador único. El cliente escanea el QR o aproxima su móvil por NFC y accede inmediatamente a la Carta Digital con el contexto de su mesa.
          </p>
        </div>

        <button
          onClick={() => setIsAddingTable(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nueva Mesa</span>
        </button>
      </div>

      {/* Create Table Form Drawer / Modal */}
      {isAddingTable && (
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white">Configurar Nueva Mesa</h4>
            <button
              onClick={() => setIsAddingTable(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateTable} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de mesa *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Terraza 3"
                value={newTableName}
                onChange={(e) => {
                  setNewTableName(e.target.value);
                  if (!newTableCode) {
                    setNewTableCode(e.target.value.toUpperCase().replace(/\s+/g, '-'));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Código Único *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. TERR-03"
                value={newTableCode}
                onChange={(e) => setNewTableCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Zona / Ubicación
              </label>
              <select
                value={newTableZone}
                onChange={(e) => setNewTableZone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Salón Principal">Salón Principal</option>
                <option value="Terraza Exterior">Terraza Exterior</option>
                <option value="Barra Coctelería">Barra Coctelería</option>
                <option value="Zona VIP / Reservado">Zona VIP / Reservado</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Guardar Mesa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {table.zone}
                </span>
                <h4 className="text-lg font-black text-white mt-1">{table.name}</h4>
                <p className="text-xs text-slate-400 font-mono">ID: {table.code}</p>
              </div>

              <button
                onClick={() => onDeleteTable(table.id)}
                className="text-slate-600 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                title="Eliminar mesa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick payload summary */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono truncate">
              {table.qrUrl}
            </div>

            {/* Actions for QR & NFC */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
              <button
                onClick={() => setSelectedTableForQR(table)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver QR</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTableForNFC(table);
                  setNfcError(null);
                  setNfcSuccess(false);
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Nfc className="w-3.5 h-3.5 text-sky-400" />
                <span>NFC Tag</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Presentation Modal */}
      {selectedTableForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-4">
            <button
              onClick={() => setSelectedTableForQR(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Printable Tent Card View */}
            <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-inner space-y-3">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                  MESAvision • CARTA DIGITAL
                </span>
                <h4 className="text-xl font-black text-slate-950 mt-0.5">
                  {restaurant.name}
                </h4>
                <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold mt-1 text-slate-700">
                  {selectedTableForQR.name}
                </div>
              </div>

              {/* QR Image */}
              <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR ${selectedTableForQR.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-16 h-16 text-slate-400 animate-spin" />
                )}
              </div>

              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-900">Escanea con la cámara de tu móvil</p>
                <p>Para ver platos con videos y visualización en mesa 3D</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadQR}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PNG</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir Cartel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFC Payload Modal */}
      {selectedTableForNFC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setSelectedTableForNFC(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Nfc className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-base font-bold text-white">
                  Programador NFC: {selectedTableForNFC.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Identificador: {selectedTableForNFC.code}
                </p>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Principio de actualización dinámica:</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                El chip NFC almacena <strong>únicamente la URL</strong> de acceso a la carta. La carta digital se actualiza en tiempo real en la nube sin necesidad de reprogramar físicamente el chip en la mesa.
              </p>
            </div>

            {/* Payload box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Payload NDEF (URL directa de la mesa):
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                <input
                  type="text"
                  readOnly
                  value={selectedTableForNFC.nfcPayload}
                  className="bg-transparent flex-1 text-xs text-amber-300 font-mono focus:outline-none truncate"
                />
                <button
                  onClick={() => handleCopyNFC(selectedTableForNFC.nfcPayload)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  title="Copiar URL para app NFC externa"
                >
                  {copiedNfc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error or Success banners */}
            {nfcSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>¡Chip NFC grabado exitosamente con la URL de la mesa!</span>
              </div>
            )}

            {nfcError && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{nfcError}</span>
              </div>
            )}

            {/* Web NFC Write button */}
            <div className="pt-2">
              <button
                onClick={() => handleWriteNFC(selectedTableForNFC)}
                disabled={nfcWriting}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <Nfc className="w-4 h-4" />
                <span>
                  {nfcWriting ? 'Aproxima el chip NFC al dispositivo...' : 'Grabar en Chip NFC (Web NFC)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
