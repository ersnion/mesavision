import React, { useState } from 'react';
import { Table, TableCall } from '../../types';
import { Bell, Receipt, HelpCircle, Check, X, Smartphone, MessageCircle } from 'lucide-react';

interface WaiterCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTable: Table | null;
  availableTables: Table[];
  onSelectTable: (table: Table) => void;
  onSubmitCall: (call: Omit<TableCall, 'id' | 'createdAt'>) => void;
  restaurantPhone?: string;
}

export const WaiterCallModal: React.FC<WaiterCallModalProps> = ({
  isOpen,
  onClose,
  activeTable,
  availableTables,
  onSelectTable,
  onSubmitCall,
  restaurantPhone,
}) => {
  const [selectedType, setSelectedType] = useState<'waiter' | 'check' | 'help'>('waiter');
  const [selectedTableId, setSelectedTableId] = useState<string>(activeTable?.id || availableTables[0]?.id || '');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentTable = availableTables.find((t) => t.id === selectedTableId) || activeTable;

  const handleSend = () => {
    if (!currentTable) return;

    const label =
      selectedType === 'waiter'
        ? 'Llamar al Camarero'
        : selectedType === 'check'
        ? 'Pedir la Cuenta'
        : 'Consulta en Mesa';

    onSubmitCall({
      restaurantId: currentTable.restaurantId,
      tableId: currentTable.id,
      tableCode: currentTable.code,
      tableName: currentTable.name,
      type: selectedType,
      label,
      status: 'PENDING',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Asistencia en Mesa</h3>
              <p className="text-[11px] text-slate-500">Avisa al personal en un solo toque</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="py-6 text-center space-y-2 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                ¡Aviso enviado a sala!
              </h4>
              <p className="text-xs text-slate-500">
                Un camarero se dirige hacia la <strong>{currentTable?.name}</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* Table Selector */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/70">
                <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                  Tu Mesa Confirmada:
                </label>
                <div className="flex items-center justify-between">
                  <select
                    value={selectedTableId}
                    onChange={(e) => {
                      setSelectedTableId(e.target.value);
                      const t = availableTables.find((x) => x.id === e.target.value);
                      if (t) onSelectTable(t);
                    }}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {availableTables.map((tbl) => (
                      <option key={tbl.id} value={tbl.id}>
                        {tbl.name} ({tbl.code} - {tbl.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ¿Qué necesitas en este momento?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedType('waiter')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedType === 'waiter'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-amber-500 text-slate-950">
                        <Bell className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold">Llamar al Camarero</div>
                        <div className="text-[10px] text-slate-500">
                          Pedir bebidas, cambio de cubiertos o atención
                        </div>
                      </div>
                    </div>
                    {selectedType === 'waiter' && <Check className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType('check')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedType === 'check'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-orange-500 text-white">
                        <Receipt className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold">Pedir la Cuenta</div>
                        <div className="text-[10px] text-slate-500">
                          Efectivo o datáfono para tarjeta
                        </div>
                      </div>
                    </div>
                    {selectedType === 'check' && <Check className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType('help')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedType === 'help'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-sky-500 text-white">
                        <HelpCircle className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold">Consulta / Duda</div>
                        <div className="text-[10px] text-slate-500">
                          Preguntar por ingredientes o sugerencias
                        </div>
                      </div>
                    </div>
                    {selectedType === 'help' && <Check className="w-4 h-4 text-amber-600" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSend}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
              >
                <Bell className="w-4 h-4" />
                <span>Enviar Aviso a Sala</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
