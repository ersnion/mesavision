import React, { useState } from 'react';
import { Restaurant, Category, Dish, Table, TableCall, KitchenOrder } from '../../types';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Grid,
  QrCode,
  Settings,
  Plus,
  Video,
  Box,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChefHat,
  Bell,
} from 'lucide-react';
import { MenuManager } from './MenuManager';
import { TablesManager } from './TablesManager';
import { MediaLibrary } from './MediaLibrary';
import { RestaurantSettings } from './RestaurantSettings';
import { PDFImporterModal } from './PDFImporterModal';
import { DishFormModal } from './DishFormModal';
import { DishVideoRecorderModal } from './DishVideoRecorderModal';
import { Dish3DModalManager } from './Dish3DModalManager';
import { LiveServiceKDS } from './LiveServiceKDS';

interface DashboardLayoutProps {
  restaurant: Restaurant;
  categories: Category[];
  dishes: Dish[];
  tables: Table[];
  tableCalls: TableCall[];
  kitchenOrders: KitchenOrder[];
  onSaveRestaurant: (restaurant: Restaurant) => void;
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (catId: string) => void;
  onSaveDish: (dish: Dish) => void;
  onDeleteDish: (dishId: string) => void;
  onSaveTable: (table: Table) => void;
  onDeleteTable: (tableId: string) => void;
  onImportConfirmed: (newCategories: Category[], newDishes: Dish[], mergeMode: 'merge' | 'replace') => void;
  onResetDemo: () => void;
  onPreviewClientMenu: () => void;
  onUpdateCallStatus: (callId: string, status: 'PENDING' | 'ATTENDING' | 'COMPLETED') => void;
  onUpdateOrderStatus: (orderId: string, status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED') => void;
  onClearCompletedCalls: () => void;
  onSimulateTableCall: (tableId?: string) => void;
  onSimulateOrder: (tableId?: string) => void;
}

export type DashboardTab =
  | 'inicio'
  | 'kds'
  | 'carta'
  | 'categorias'
  | 'platos'
  | 'importar'
  | 'multimedia'
  | 'mesas'
  | 'qr_nfc'
  | 'configuracion';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  restaurant,
  categories,
  dishes,
  tables,
  tableCalls,
  kitchenOrders,
  onSaveRestaurant,
  onSaveCategory,
  onDeleteCategory,
  onSaveDish,
  onDeleteDish,
  onSaveTable,
  onDeleteTable,
  onImportConfirmed,
  onResetDemo,
  onPreviewClientMenu,
  onUpdateCallStatus,
  onUpdateOrderStatus,
  onClearCompletedCalls,
  onSimulateTableCall,
  onSimulateOrder,
}) => {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('inicio');

  // Modals state
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isNewDishOpen, setIsNewDishOpen] = useState(false);
  const [videoModalDish, setVideoModalDish] = useState<Dish | null>(null);
  const [model3DModalDish, setModel3DModalDish] = useState<Dish | null>(null);

  const dishesWithVideo = dishes.filter((d) => Boolean(d.video));
  const dishesWith3D = dishes.filter((d) => Boolean(d.model3D));
  const availableDishes = dishes.filter((d) => d.isAvailable);

  const pendingCallsCount = tableCalls.filter((c) => c.status !== 'COMPLETED').length;
  const activeOrdersCount = kitchenOrders.filter((o) => o.status !== 'SERVED').length;

  const navItems: Array<{
    id: DashboardTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }> = [
    { id: 'inicio', label: '1. Inicio', icon: LayoutDashboard },
    {
      id: 'kds',
      label: '2. Cocina & Sala',
      icon: ChefHat,
      badge: pendingCallsCount > 0 ? `${pendingCallsCount} alertas` : activeOrdersCount > 0 ? `${activeOrdersCount} com.` : undefined,
      badgeColor: pendingCallsCount > 0 ? 'bg-rose-500 text-white' : 'bg-sky-500 text-slate-950',
    },
    { id: 'carta', label: '3. Carta', icon: UtensilsCrossed },
    { id: 'categorias', label: '4. Categorías', icon: Layers },
    { id: 'platos', label: '5. Platos', icon: UtensilsCrossed },
    { id: 'importar', label: '6. Importar PDF', icon: Sparkles, badge: 'Gemini', badgeColor: 'bg-purple-500/30 text-purple-300' },
    { id: 'multimedia', label: '7. Multimedia', icon: ImageIcon },
    { id: 'mesas', label: '8. Mesas', icon: Grid },
    { id: 'qr_nfc', label: '9. QR / NFC', icon: QrCode },
    { id: 'configuracion', label: '10. Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand mark */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-500/20">
              MV
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>MESAvision</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Carta Digital Inteligente
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'importar') {
                    setIsImporterOpen(true);
                  } else {
                    setCurrentTab(item.id as DashboardTab);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-black text-amber-400' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Public menu quick launch */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onPreviewClientMenu}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Carta Digital (Cliente)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* TAB 1: INICIO (Dashboard Overview) */}
        {currentTab === 'inicio' && (
          <div className="space-y-6">
            {/* Hero Welcome Card */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Carta Digital Activa & Sincronizada</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {restaurant.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Gestiona tu carta digital interactiva con modelos 3D AR, videos de preparación real por plato, monitor de cocina y códigos QR/NFC individuales para cada mesa.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('kds')}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Abrir Monitor Cocina & Sala ({pendingCallsCount + activeOrdersCount} avisos)</span>
                  </button>

                  <button
                    onClick={() => setIsImporterOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Importar Carta PDF con Gemini</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('qr_nfc')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>Generar QR / NFC de Mesas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Service Alerts Banner if there are calls */}
            {(pendingCallsCount > 0 || activeOrdersCount > 0) && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                    <Bell className="w-4 h-4 animate-bounce" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">
                      Actividad en vivo en Sala y Cocina
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Hay {pendingCallsCount} comensales solicitando atención y {activeOrdersCount} comandas en cocina.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentTab('kds')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors cursor-pointer shrink-0"
                >
                  Ver en Vivo
                </button>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Categorías</span>
                <div className="text-2xl font-black text-white mt-1">{categories.length}</div>
                <span className="text-[11px] text-amber-400">En menú digital</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Platos Totales</span>
                <div className="text-2xl font-black text-white mt-1">{dishes.length}</div>
                <span className="text-[11px] text-emerald-400">{availableDishes.length} disponibles</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Con Video Real</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{dishesWithVideo.length}</div>
                <span className="text-[11px] text-slate-500">De {dishes.length} platos</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Con Modelo 3D & AR</span>
                <div className="text-2xl font-black text-sky-400 mt-1">{dishesWith3D.length}</div>
                <span className="text-[11px] text-slate-500">Listos para mesa</span>
              </div>
            </div>

            {/* Mesas Summary Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-amber-400" />
                  <span>Mesas Configuradas ({tables.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cada mesa tiene su propio QR y chip NFC que dirige directamente a la carta digital.
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('mesas')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Administrar Mesas
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MONITOR COCINA & SALA (KDS) */}
        {currentTab === 'kds' && (
          <LiveServiceKDS
            tableCalls={tableCalls}
            kitchenOrders={kitchenOrders}
            tables={tables}
            currencySymbol={restaurant.currencySymbol}
            onUpdateCallStatus={onUpdateCallStatus}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onClearCompletedCalls={onClearCompletedCalls}
            onSimulateTableCall={onSimulateTableCall}
            onSimulateOrder={onSimulateOrder}
          />
        )}

        {/* TAB 3 & 5: CARTA & PLATOS */}
        {(currentTab === 'carta' || currentTab === 'platos') && (
          <MenuManager
            restaurant={restaurant}
            categories={categories}
            dishes={dishes}
            onSaveCategory={onSaveCategory}
            onDeleteCategory={onDeleteCategory}
            onEditDish={(dish) => setEditingDish(dish)}
            onNewDish={() => setIsNewDishOpen(true)}
            onDeleteDish={onDeleteDish}
            onToggleDishAvailability={(dishId) => {
              const target = dishes.find((d) => d.id === dishId);
              if (target) {
                onSaveDish({ ...target, isAvailable: !target.isAvailable });
              }
            }}
            onOpenVideoRecorder={(dish) => setVideoModalDish(dish)}
            onOpen3DManager={(dish) => setModel3DModalDish(dish)}
            onOpenImporter={() => setIsImporterOpen(true)}
          />
        )}

        {/* TAB 4: CATEGORIAS */}
        {currentTab === 'categorias' && (
          <MenuManager
            restaurant={restaurant}
            categories={categories}
            dishes={dishes}
            activeSubTab="categories"
            onSaveCategory={onSaveCategory}
            onDeleteCategory={onDeleteCategory}
            onEditDish={(dish) => setEditingDish(dish)}
            onNewDish={() => setIsNewDishOpen(true)}
            onDeleteDish={onDeleteDish}
            onToggleDishAvailability={(dishId) => {
              const target = dishes.find((d) => d.id === dishId);
              if (target) {
                onSaveDish({ ...target, isAvailable: !target.isAvailable });
              }
            }}
            onOpenVideoRecorder={(dish) => setVideoModalDish(dish)}
            onOpen3DManager={(dish) => setModel3DModalDish(dish)}
            onOpenImporter={() => setIsImporterOpen(true)}
          />
        )}

        {/* TAB 7: MULTIMEDIA */}
        {currentTab === 'multimedia' && (
          <MediaLibrary
            dishes={dishes}
            onOpenVideoRecorder={(dish) => setVideoModalDish(dish)}
            onOpen3DManager={(dish) => setModel3DModalDish(dish)}
          />
        )}

        {/* TAB 8 & 9: MESAS & QR / NFC */}
        {(currentTab === 'mesas' || currentTab === 'qr_nfc') && (
          <TablesManager
            restaurant={restaurant}
            tables={tables}
            onSaveTable={onSaveTable}
            onDeleteTable={onDeleteTable}
          />
        )}

        {/* TAB 10: CONFIGURACION */}
        {currentTab === 'configuracion' && (
          <RestaurantSettings
            restaurant={restaurant}
            onSaveRestaurant={onSaveRestaurant}
            onResetDemo={onResetDemo}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. PDF Importer Gemini */}
      {isImporterOpen && (
        <PDFImporterModal
          existingCategories={categories}
          existingDishes={dishes}
          onImportConfirmed={onImportConfirmed}
          onClose={() => setIsImporterOpen(false)}
        />
      )}

      {/* 2. Dish Form (Edit or New) */}
      {(editingDish || isNewDishOpen) && (
        <DishFormModal
          dish={editingDish}
          categories={categories}
          currencySymbol={restaurant.currencySymbol}
          onSave={onSaveDish}
          onClose={() => {
            setEditingDish(null);
            setIsNewDishOpen(false);
          }}
          onOpenVideoRecorder={(dish) => setVideoModalDish(dish)}
          onOpen3DManager={(dish) => setModel3DModalDish(dish)}
        />
      )}

      {/* 3. Video Recorder / Uploader Modal */}
      {videoModalDish && (
        <DishVideoRecorderModal
          dish={videoModalDish}
          onSaveVideo={(dishId, video) => {
            const target = dishes.find((d) => d.id === dishId);
            if (target) {
              onSaveDish({ ...target, video });
            }
          }}
          onClose={() => setVideoModalDish(null)}
        />
      )}

      {/* 4. 3D Model Manager Modal */}
      {model3DModalDish && (
        <Dish3DModalManager
          dish={model3DModalDish}
          onSave3DModel={(dishId, model3D) => {
            const target = dishes.find((d) => d.id === dishId);
            if (target) {
              onSaveDish({ ...target, model3D });
            }
          }}
          onClose={() => setModel3DModalDish(null)}
        />
      )}
    </div>
  );
};
