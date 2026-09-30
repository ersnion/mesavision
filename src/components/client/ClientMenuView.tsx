import React, { useState, useMemo } from 'react';
import { Restaurant, Category, Dish, Table, OrderItem, KitchenOrder, TableCall } from '../../types';
import {
  Search,
  Video,
  Box,
  Wifi,
  Clock,
  Phone,
  MapPin,
  Sparkles,
  Filter,
  Check,
  Utensils,
  Bell,
  ShoppingBag,
  Plus,
  Receipt,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { DishDetailModal } from './DishDetailModal';
import { DishVideoModal } from './DishVideoModal';
import { DishARModal } from './DishARModal';
import { WaiterCallModal } from './WaiterCallModal';
import { OrderDrawerModal } from './OrderDrawerModal';

interface ClientMenuViewProps {
  restaurant: Restaurant;
  categories: Category[];
  dishes: Dish[];
  activeTable?: Table | null;
  onSelectTable?: (table: Table | null) => void;
  availableTables: Table[];
  cartItems: OrderItem[];
  onAddToCart: (dish: Dish, variant?: any, quantity?: number) => void;
  onUpdateCartQty: (index: number, newQty: number) => void;
  onRemoveCartItem: (index: number) => void;
  onClearCart: () => void;
  onSubmitOrder: (order: KitchenOrder) => void;
  onSubmitWaiterCall: (call: Omit<TableCall, 'id' | 'createdAt'>) => void;
}

export const ClientMenuView: React.FC<ClientMenuViewProps> = ({
  restaurant,
  categories,
  dishes,
  activeTable,
  onSelectTable,
  availableTables,
  cartItems,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onSubmitOrder,
  onSubmitWaiterCall,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [copiedWifi, setCopiedWifi] = useState<boolean>(false);

  // Modals state
  const [detailDish, setDetailDish] = useState<Dish | null>(null);
  const [videoDish, setVideoDish] = useState<Dish | null>(null);
  const [arDish, setArDish] = useState<Dish | null>(null);
  const [isWaiterCallOpen, setIsWaiterCallOpen] = useState<boolean>(false);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState<boolean>(false);

  // Cart totals
  const cartTotalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotalPrice = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // Active sorted categories
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.isActive)
      .sort((a, b) => a.order - b.order);
  }, [categories]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Category filter
      if (selectedCategoryId !== 'all' && dish.categoryId !== selectedCategoryId) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(q);
        const matchesDesc = dish.description.toLowerCase().includes(q);
        const matchesIng = dish.ingredients.some((i) => i.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesIng) return false;
      }
      // Dietary filter
      if (selectedDietary !== 'all') {
        const hasTag = dish.dietaryTags.some((t) =>
          t.toLowerCase().includes(selectedDietary.toLowerCase())
        );
        if (!hasTag) return false;
      }
      return true;
    });
  }, [dishes, selectedCategoryId, searchQuery, selectedDietary]);

  const handleCopyWifi = () => {
    if (restaurant.wifiPassword) {
      navigator.clipboard.writeText(restaurant.wifiPassword);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
      {/* Restaurant Header & Cover */}
      <div className="relative">
        <div className="h-44 sm:h-64 w-full bg-slate-900 overflow-hidden relative">
          <img
            src={restaurant.coverUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        </div>

        {/* Restaurant profile & info */}
        <div className="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              {/* Logo */}
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
              />

              <div className="flex-1 space-y-1.5 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {restaurant.name}
                  </h1>

                  {/* Table identifier banner with quick change */}
                  {activeTable ? (
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold self-center sm:self-auto shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                      <span>Mesa: {activeTable.name} ({activeTable.code})</span>
                      {onSelectTable && availableTables.length > 1 && (
                        <button
                          onClick={() => {
                            const nextIdx = (availableTables.findIndex((t) => t.id === activeTable.id) + 1) % availableTables.length;
                            onSelectTable(availableTables[nextIdx]);
                          }}
                          className="text-[10px] text-amber-400 underline hover:text-white ml-1 cursor-pointer"
                          title="Cambiar mesa para prueba"
                        >
                          (Cambiar)
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs self-center sm:self-auto">
                      <span>Mesa libre</span>
                      {availableTables.length > 0 && onSelectTable && (
                        <select
                          className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer text-xs"
                          onChange={(e) => {
                            const tbl = availableTables.find((t) => t.id === e.target.value);
                            onSelectTable(tbl || null);
                          }}
                          defaultValue=""
                        >
                          <option value="" className="bg-slate-900 text-white">Elegir Mesa...</option>
                          {availableTables.map((t) => (
                            <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                              {t.name} ({t.zone})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-amber-400/90 text-sm font-medium">
                  {restaurant.tagline}
                </p>

                <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">
                  {restaurant.description}
                </p>

                {/* Practical info pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-[11px] text-slate-400">
                  {restaurant.schedule && (
                    <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {restaurant.schedule}
                    </span>
                  )}
                  {restaurant.address && (
                    <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {restaurant.address}
                    </span>
                  )}
                  {restaurant.wifiSsid && (
                    <button
                      onClick={handleCopyWifi}
                      className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      title="Copiar contraseña Wi-Fi"
                    >
                      <Wifi className="w-3.5 h-3.5 text-sky-400" />
                      <span>Wi-Fi: {restaurant.wifiSsid}</span>
                      {copiedWifi ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-sky-400 font-mono underline">
                          (Copiar clave)
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Search & Dietary Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar platos o ingredientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'vegetariano', label: '🌱 Vegetariano' },
              { id: 'vegano', label: '🌿 Vegano' },
              { id: 'sin gluten', label: '🌾 Sin Gluten' },
            ].map((diet) => (
              <button
                key={diet.id}
                onClick={() => setSelectedDietary(diet.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedDietary === diet.id
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {diet.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Horizontal Tabs */}
        <div className="sticky top-14 z-20 bg-slate-950/95 backdrop-blur-md py-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Toda la Carta ({dishes.length})
            </button>
            {activeCategories.map((cat) => {
              const count = dishes.filter((d) => d.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategoryId === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-8 space-y-3">
            <Utensils className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-slate-300">
              No se encontraron platos
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Prueba cambiando la búsqueda o seleccionando otra categoría o filtro dietético.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => setDetailDish(dish)}
                className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/40 rounded-3xl p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl"
              >
                <div>
                  {/* Photo with action pills */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 mb-3.5">
                    {dish.photo?.url ? (
                      <img
                        src={dish.photo.url}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <Utensils className="w-10 h-10" />
                      </div>
                    )}

                    {/* Gradient shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

                    {/* Top badging */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <div className="flex gap-1">
                        {dish.dietaryTags?.slice(0, 1).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-black/70 text-emerald-300 backdrop-blur-md border border-emerald-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {dish.isFeatured && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                          <Sparkles className="w-2.5 h-2.5 fill-current" />
                          Destacado
                        </span>
                      )}
                    </div>

                    {/* Multimedia Badges Bottom */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <div className="flex gap-1.5">
                        {dish.video && (
                          <span className="px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md text-amber-400 text-[11px] font-bold flex items-center gap-1 border border-amber-500/30 shadow">
                            <Video className="w-3.5 h-3.5" />
                            <span>Video</span>
                          </span>
                        )}
                        {dish.model3D && (
                          <span className="px-2.5 py-1 rounded-xl bg-sky-950/90 backdrop-blur-md text-sky-400 text-[11px] font-bold flex items-center gap-1 border border-sky-500/40 shadow">
                            <Box className="w-3.5 h-3.5" />
                            <span>3D / AR</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Title & Price */}
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                      {dish.name}
                    </h3>
                    <span className="text-base font-black text-amber-400 whitespace-nowrap">
                      {dish.price.toFixed(2)} {restaurant.currencySymbol}
                    </span>
                  </div>

                  {/* Truncated Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {dish.description}
                  </p>
                </div>

                {/* Footer with action buttons */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1.5">
                    {dish.video && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoDish(dish);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Ver video del plato"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Video</span>
                      </button>
                    )}

                    {dish.model3D && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setArDish(dish);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Ver en mi mesa 3D / AR"
                      >
                        <Box className="w-3.5 h-3.5" />
                        <span>Ver en mi mesa</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(dish);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md hover:shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar (Matches User's Screenshots!) */}
      <div className="fixed bottom-4 left-4 right-4 z-30 max-w-xl mx-auto">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-2 shadow-2xl flex items-center justify-between gap-2">
          {/* Asistencia / Llamar camarero / Pedir cuenta */}
          <button
            onClick={() => setIsWaiterCallOpen(true)}
            className="flex-1 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/70 transition-all active:scale-98 cursor-pointer"
          >
            <span className="p-1 rounded-lg bg-amber-500 text-slate-950">
              <Bell className="w-3.5 h-3.5" />
            </span>
            <span>Asistencia / Cuenta</span>
          </button>

          {/* Cart / Comanda Drawer Button */}
          <button
            onClick={() => setIsOrderDrawerOpen(true)}
            className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-lg ${
              cartTotalCount > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border border-slate-700/70'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-slate-950 text-amber-400 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold">
                  {cartTotalCount}
                </span>
              )}
            </div>
            <span>
              {cartTotalCount > 0
                ? `${cartTotalPrice.toFixed(2)} ${restaurant.currencySymbol} • Comanda`
                : 'Mi Comanda (0)'}
            </span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Dish Detail Modal */}
      <DishDetailModal
        dish={detailDish}
        currencySymbol={restaurant.currencySymbol}
        onClose={() => setDetailDish(null)}
        onOpenVideo={(d) => {
          setDetailDish(null);
          setVideoDish(d);
        }}
        onOpenAR={(d) => {
          setDetailDish(null);
          setArDish(d);
        }}
        onAddToCart={(d, variant, qty) => {
          onAddToCart(d, variant, qty);
        }}
      />

      {/* 2. Real Video Modal */}
      <DishVideoModal
        dish={videoDish}
        onClose={() => setVideoDish(null)}
      />

      {/* 3. 3D / AR "Ver en mi mesa" Modal */}
      <DishARModal
        dish={arDish}
        onClose={() => setArDish(null)}
      />

      {/* 4. Waiter & Bill Call Modal */}
      <WaiterCallModal
        isOpen={isWaiterCallOpen}
        onClose={() => setIsWaiterCallOpen(false)}
        activeTable={activeTable || null}
        availableTables={availableTables}
        onSelectTable={(tbl) => onSelectTable && onSelectTable(tbl)}
        onSubmitCall={onSubmitWaiterCall}
        restaurantPhone={restaurant.phone}
      />

      {/* 5. Kitchen Order Drawer Modal */}
      <OrderDrawerModal
        isOpen={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        items={cartItems}
        currencySymbol={restaurant.currencySymbol}
        activeTable={activeTable || null}
        availableTables={availableTables}
        onSelectTable={(tbl) => onSelectTable && onSelectTable(tbl)}
        onUpdateQuantity={onUpdateCartQty}
        onRemoveItem={onRemoveCartItem}
        onClearCart={onClearCart}
        onSubmitOrder={onSubmitOrder}
      />
    </div>
  );
};
