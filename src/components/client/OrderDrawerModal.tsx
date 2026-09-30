import React, { useState } from 'react';
import { Table, KitchenOrder, OrderItem, Restaurant } from '../../types';
import { ArrowLeft, Trash2, Plus, Minus, Send, CheckCircle2, Clock, Utensils } from 'lucide-react';

interface OrderDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  currencySymbol: string;
  activeTable: Table | null;
  availableTables: Table[];
  onSelectTable: (table: Table) => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onSubmitOrder: (order: KitchenOrder) => void;
}

export const OrderDrawerModal: React.FC<OrderDrawerModalProps> = ({
  isOpen,
  onClose,
  items,
  currencySymbol,
  activeTable,
  availableTables,
  onSelectTable,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
}) => {
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [selectedTableId, setSelectedTableId] = useState<string>(activeTable?.id || availableTables[0]?.id || '');
  const [instructions, setInstructions] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentTable = availableTables.find((t) => t.id === selectedTableId) || activeTable || availableTables[0];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const handleSendOrder = () => {
    if (items.length === 0 || !currentTable) return;

    const newOrder: KitchenOrder = {
      id: `order_${Math.floor(100 + Math.random() * 900)}`,
      restaurantId: currentTable.restaurantId,
      tableId: currentTable.id,
      tableCode: currentTable.code,
      tableName: currentTable.name,
      items: [...items],
      subtotal,
      total,
      status: 'PENDING',
      orderType,
      notes: instructions.trim() || undefined,
      createdAt: new Date().toISOString(),
      estimatedMinutes: 15,
    };

    onSubmitOrder(newOrder);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClearCart();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-slate-900">
              Mi Comanda de Mesa
            </h3>
          </div>
          {items.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Vaciar
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {isSuccess ? (
            <div className="py-12 text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                ¡Comanda enviada a cocina!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                El equipo de cocina ha recibido el pedido de la <strong>{currentTable?.name}</strong> y comenzará su preparación.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-400">
              <Utensils className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Tu comanda está vacía</p>
              <p className="text-xs text-slate-500">
                Explora la carta y pulsa "+ Añadir" en los platos que desees pedir.
              </p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3 divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.dishName}
                        </h4>
                      </div>
                      {item.variantName && (
                        <p className="text-[11px] text-amber-700 font-medium pl-3.5">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-xs font-black text-slate-800 pl-3.5 mt-0.5">
                        {item.price.toFixed(2)} {currencySymbol}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="p-1 text-slate-600 hover:text-slate-900"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-slate-900 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="p-1 text-slate-600 hover:text-slate-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right w-16">
                      <span className="text-xs font-black text-amber-600">
                        {(item.price * item.quantity).toFixed(2)} {currencySymbol}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Type Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">Tipo de servicio:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      orderType === 'DINE_IN'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🍽️ Consumo en Mesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TAKEAWAY')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      orderType === 'TAKEAWAY'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🛍️ Para Llevar
                  </button>
                </div>
              </div>

              {/* Table Selection / Confirmation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Mesa de entrega *</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => {
                    setSelectedTableId(e.target.value);
                    const t = availableTables.find((x) => x.id === e.target.value);
                    if (t) onSelectTable(t);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code} - {t.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Instrucciones o notas para cocina (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ej. Carne poco hecha, sin cebolla, salsas al lado..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Calculation Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)} {currencySymbol}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Impuestos incluidos (10% IVA)</span>
                  <span>Incluido</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Comanda</span>
                  <span className="text-amber-600 font-mono">{total.toFixed(2)} {currencySymbol}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Submit */}
        {!isSuccess && items.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={handleSendOrder}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Comanda a Cocina ({total.toFixed(2)} {currencySymbol})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
