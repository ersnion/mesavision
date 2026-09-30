import React, { useState } from 'react';
import { Table, TableCall, KitchenOrder } from '../../types';
import {
  Bell,
  Receipt,
  Clock,
  CheckCircle2,
  ChefHat,
  Flame,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  UtensilsCrossed,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

interface LiveServiceKDSProps {
  tableCalls: TableCall[];
  kitchenOrders: KitchenOrder[];
  tables: Table[];
  currencySymbol: string;
  onUpdateCallStatus: (callId: string, status: 'PENDING' | 'ATTENDING' | 'COMPLETED') => void;
  onUpdateOrderStatus: (orderId: string, status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED') => void;
  onClearCompletedCalls: () => void;
  onSimulateTableCall: (tableId?: string) => void;
  onSimulateOrder: (tableId?: string) => void;
}

export const LiveServiceKDS: React.FC<LiveServiceKDSProps> = ({
  tableCalls,
  kitchenOrders,
  tables,
  currencySymbol,
  onUpdateCallStatus,
  onUpdateOrderStatus,
  onClearCompletedCalls,
  onSimulateTableCall,
  onSimulateOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'calls' | 'orders'>('all');
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filtered lists
  const pendingCalls = tableCalls.filter(
    (c) => c.status !== 'COMPLETED' && (selectedTableFilter === 'all' || c.tableId === selectedTableFilter)
  );

  const activeOrders = kitchenOrders.filter(
    (o) => o.status !== 'SERVED' && (selectedTableFilter === 'all' || o.tableId === selectedTableFilter)
  );

  const servedOrders = kitchenOrders.filter((o) => o.status === 'SERVED');

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Ahora mismo';
    if (diff === 1) return 'Hace 1 min';
    if (diff < 60) return `Hace ${diff} min`;
    return `Hace ${Math.floor(diff / 60)}h`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Servicio de Sala & Cocina en Vivo (KDS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Monitor de Mesas & Comandas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recepción en tiempo real de llamadas al camarero, peticiones de cuenta y pedidos de los comensales.
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title="Avisos sonoros de nuevas comandas o llamadas"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Avisos activados' : 'Silenciado'}</span>
          </button>

          <button
            onClick={() => onSimulateTableCall()}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Simula que un comensal escaneó el QR y pulsó Asistencia"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>+ Probar Llamada Mesa</span>
          </button>

          <button
            onClick={() => onSimulateOrder()}
            className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Simula un pedido desde la carta digital"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>+ Probar Comanda</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Llamadas Pendientes
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {pendingCalls.length}
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${pendingCalls.length > 0 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-600'}`}>
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              Comandas en Cocina
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {activeOrders.length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
            <ChefHat className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
              Mesas Activas
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {new Set([...pendingCalls.map((c) => c.tableId), ...activeOrders.map((o) => o.tableId)]).size}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Comandas Servidas
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {servedOrders.length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Table Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todo en Sala ({pendingCalls.length + activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calls'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Llamadas Camarero</span>
            {pendingCalls.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingCalls.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Comandas Cocina</span>
            {activeOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter by Table */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTableFilter}
            onChange={(e) => setSelectedTableFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Todas las mesas ({tables.length})</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>

          {tableCalls.some((c) => c.status === 'COMPLETED') && (
            <button
              onClick={onClearCompletedCalls}
              className="text-xs text-slate-500 hover:text-slate-300 hover:underline px-2 py-1"
            >
              Limpiar atendidas
            </button>
          )}
        </div>
      </div>

      {/* Main Display Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Waiter & Bill Calls (Takes 5 cols on lg) */}
        {(activeTab === 'all' || activeTab === 'calls') && (
          <div className={`${activeTab === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Avisos de Camarero & Cuenta</span>
              </h3>
              <span className="text-xs text-slate-500">{pendingCalls.length} activas</span>
            </div>

            {pendingCalls.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Sala al día</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No hay comensales solicitando atención ni pidiendo la cuenta en este momento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCalls.map((call) => {
                  const isCheck = call.type === 'check';
                  const isAttending = call.status === 'ATTENDING';

                  return (
                    <div
                      key={call.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 shadow-lg ${
                        isCheck
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span
                            className={`p-2.5 rounded-xl ${
                              isCheck
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-slate-800 text-amber-400'
                            }`}
                          >
                            {isCheck ? <Receipt className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">
                                {call.tableName}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                                {call.tableCode}
                              </span>
                              {isAttending && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 font-bold animate-pulse">
                                  En camino
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-amber-300 mt-1">
                              {call.label}
                            </h4>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{getTimeAgo(call.createdAt)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-1.5 shrink-0">
                          {call.status === 'PENDING' && (
                            <button
                              onClick={() => onUpdateCallStatus(call.id, 'ATTENDING')}
                              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Acudiendo
                            </button>
                          )}
                          <button
                            onClick={() => onUpdateCallStatus(call.id, 'COMPLETED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 transition-all shadow-md cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Atendido</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Right Column: Kitchen Orders Tickets (Takes 7 cols on lg) */}
        {(activeTab === 'all' || activeTab === 'orders') && (
          <div className={`${activeTab === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-sky-400" />
                <span>Comandas & Tickets de Cocina</span>
              </h3>
              <span className="text-xs text-slate-500">{activeOrders.length} activas</span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 text-center space-y-2">
                <UtensilsCrossed className="w-10 h-10 text-sky-500/60 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Cocina limpia</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No hay tickets de pedidos pendientes de preparación en este momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOrders.map((order) => {
                  const isPending = order.status === 'PENDING';
                  const isCooking = order.status === 'COOKING';
                  const isReady = order.status === 'READY';

                  return (
                    <div
                      key={order.id}
                      className={`p-4 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-xl ${
                        isPending
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : isCooking
                          ? 'bg-sky-950/20 border-sky-500/40'
                          : 'bg-emerald-950/20 border-emerald-500/40'
                      }`}
                    >
                      <div>
                        {/* Ticket Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-white font-black text-xs">
                              {order.tableName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{order.id.slice(-4)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Pendiente</span>
                              </span>
                            )}
                            {isCooking && (
                              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-500/30 flex items-center gap-1 animate-pulse">
                                <Flame className="w-3 h-3 text-orange-400" />
                                <span>En Fogones</span>
                              </span>
                            )}
                            {isReady && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>¡Listo para Servir!</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Items list */}
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-lg bg-slate-800 text-amber-400 font-black flex items-center justify-center text-[11px] shrink-0">
                                  {item.quantity}x
                                </span>
                                <div>
                                  <span className="font-bold text-white">{item.dishName}</span>
                                  {item.variantName && (
                                    <span className="block text-[10px] text-amber-400">
                                      {item.variantName}
                                    </span>
                                  )}
                                  {item.notes && (
                                    <span className="block text-[10px] text-slate-400 italic">
                                      "{item.notes}"
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono text-slate-400 text-xs">
                                {(item.price * item.quantity).toFixed(2)} {currencySymbol}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Notes if any */}
                        {order.notes && (
                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-200 mb-3">
                            <span className="font-bold">Nota de sala: </span>
                            {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                        <div className="text-left">
                          <span className="text-[10px] text-slate-500 block">
                            {getTimeAgo(order.createdAt)}
                          </span>
                          <span className="text-sm font-black text-amber-400">
                            Total: {order.total.toFixed(2)} {currencySymbol}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'COOKING')}
                              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>Empezar</span>
                            </button>
                          )}
                          {isCooking && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'READY')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>¡Listo!</span>
                            </button>
                          )}
                          {isReady && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'SERVED')}
                              className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Servido</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
