import React, { useState, useEffect, useRef } from 'react';
import { Restaurant, Category, Dish, Table, TableCall, KitchenOrder, OrderItem, DishVariant } from './types';
import { storageService } from './services/storageService';
import { syncService } from './services/syncService';
import { Header } from './components/Header';
import { SyncStatusBar } from './components/SyncStatusBar';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { ClientMenuView } from './components/client/ClientMenuView';
import { LiveServiceKDS } from './components/dashboard/LiveServiceKDS';

export default function App() {
  const [restaurant, setRestaurant] = useState<Restaurant>(() => storageService.getRestaurant());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [dishes, setDishes] = useState<Dish[]>(() => storageService.getDishes());
  const [tables, setTables] = useState<Table[]>(() => storageService.getTables());
  const [tableCalls, setTableCalls] = useState<TableCall[]>(() => storageService.getTableCalls());
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(() => storageService.getKitchenOrders());
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'client' | 'kds'>('client');
  const [activeTable, setActiveTable] = useState<Table | null>(() => {
    const list = storageService.getTables();
    return list.length > 0 ? list[0] : null;
  });

  const lastServerTimestampRef = useRef<number>(0);

  // Check URL parameters for table QR / NFC access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('mesa') || params.get('table');
      const isMenuView = window.location.pathname.startsWith('/menu');

      if (tableParam) {
        const found = tables.find(
          (t) => t.code.toLowerCase() === tableParam.toLowerCase() || t.id === tableParam
        );
        if (found) {
          setActiveTable(found);
          setCurrentView('client');
        }
      } else if (isMenuView) {
        setCurrentView('client');
      }
    }
  }, [tables]);

  // Initial state fetch from server
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.restaurant) {
            setRestaurant(data.restaurant);
            storageService.saveRestaurant(data.restaurant);
          }
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            storageService.saveCategories(data.categories);
          }
          if (Array.isArray(data.dishes) && data.dishes.length > 0) {
            setDishes(data.dishes);
            storageService.saveDishes(data.dishes);
          }
          if (Array.isArray(data.tables) && data.tables.length > 0) {
            setTables(data.tables);
            storageService.saveTables(data.tables);
          }
          if (Array.isArray(data.tableCalls)) {
            setTableCalls(data.tableCalls);
            storageService.saveTableCalls(data.tableCalls);
          }
          if (Array.isArray(data.kitchenOrders)) {
            setKitchenOrders(data.kitchenOrders);
            storageService.saveKitchenOrders(data.kitchenOrders);
          }
          lastServerTimestampRef.current = data.lastUpdated || Date.now();
        }
      } catch (e) {
        // Offline / server starting - local storage acts as pristine fallback
      }
    };

    fetchInitialState();

    // Poll live alerts (waiter calls & kitchen orders) periodically for cross-device updates
    const pollInterval = setInterval(async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      try {
        const res = await fetch('/api/live-alerts');
        if (res.ok) {
          const data = await res.json();
          if (data.lastUpdated && data.lastUpdated > lastServerTimestampRef.current) {
            lastServerTimestampRef.current = data.lastUpdated;
            if (Array.isArray(data.tableCalls)) {
              setTableCalls(data.tableCalls);
              storageService.saveTableCalls(data.tableCalls);
            }
            if (Array.isArray(data.kitchenOrders)) {
              setKitchenOrders(data.kitchenOrders);
              storageService.saveKitchenOrders(data.kitchenOrders);
            }
          }
        }
      } catch {
        // Silently skip if network blips
      }
    }, 3500);

    return () => clearInterval(pollInterval);
  }, []);

  // Restaurant CRUD & Outbox Sync
  const handleSaveRestaurant = (updated: Restaurant) => {
    setRestaurant(updated);
    storageService.saveRestaurant(updated);
    syncService.enqueue('restaurant', 'UPDATE', updated);
  };

  // Category CRUD & Outbox Sync
  const handleSaveCategory = (cat: Category) => {
    const existing = categories.some((c) => c.id === cat.id);
    const updated = existing
      ? categories.map((c) => (c.id === cat.id ? cat : c))
      : [...categories, cat];
    
    setCategories(updated);
    storageService.saveCategories(updated);
    syncService.enqueue('category', existing ? 'UPDATE' : 'CREATE', cat);
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    storageService.saveCategories(updated);
    syncService.enqueue('category', 'DELETE', { id: catId });
  };

  // Dish CRUD & Outbox Sync
  const handleSaveDish = (dish: Dish) => {
    const existing = dishes.some((d) => d.id === dish.id);
    const updated = existing
      ? dishes.map((d) => (d.id === dish.id ? dish : d))
      : [dish, ...dishes];

    setDishes(updated);
    storageService.saveDishes(updated);
    syncService.enqueue('dish', existing ? 'UPDATE' : 'CREATE', dish);
  };

  const handleDeleteDish = (dishId: string) => {
    const updated = dishes.filter((d) => d.id !== dishId);
    setDishes(updated);
    storageService.saveDishes(updated);
    syncService.enqueue('dish', 'DELETE', { id: dishId });
  };

  // Table CRUD & Outbox Sync
  const handleSaveTable = (table: Table) => {
    const existing = tables.some((t) => t.id === table.id);
    const updated = existing
      ? tables.map((t) => (t.id === table.id ? table : t))
      : [...tables, table];

    setTables(updated);
    storageService.saveTables(updated);
    syncService.enqueue('table', existing ? 'UPDATE' : 'CREATE', table);
  };

  const handleDeleteTable = (tableId: string) => {
    const updated = tables.filter((t) => t.id !== tableId);
    setTables(updated);
    storageService.saveTables(updated);
    syncService.enqueue('table', 'DELETE', { id: tableId });
  };

  // Cart & Order Operations
  const handleAddToCart = (dish: Dish, variant?: DishVariant, quantity: number = 1) => {
    const price = variant ? variant.price : dish.price;
    const variantName = variant ? variant.name : undefined;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.dishId === dish.id && i.variantName === variantName
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `oi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            dishId: dish.id,
            dishName: dish.name,
            price,
            quantity,
            variantName,
          },
        ];
      }
    });
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
    } else {
      setCartItems((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], quantity: newQty };
        return copy;
      });
    }
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Submit Order from Table
  const handleSubmitOrder = (order: KitchenOrder) => {
    const updatedOrders = [order, ...kitchenOrders];
    setKitchenOrders(updatedOrders);
    storageService.saveKitchenOrders(updatedOrders);

    // Direct API send
    fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(() => {});

    // Outbox backup
    syncService.enqueue('table', 'UPDATE', { type: 'NEW_ORDER', order });
  };

  // Submit Waiter Call / Bill Request
  const handleSubmitWaiterCall = (callData: Omit<TableCall, 'id' | 'createdAt'>) => {
    const newCall: TableCall = {
      ...callData,
      id: `call_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedCalls = [newCall, ...tableCalls];
    setTableCalls(updatedCalls);
    storageService.saveTableCalls(updatedCalls);

    // Direct API send
    fetch('/api/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCall),
    }).catch(() => {});

    // Outbox backup
    syncService.enqueue('table', 'UPDATE', { type: 'NEW_CALL', call: newCall });
  };

  // Update Call Status
  const handleUpdateCallStatus = (callId: string, status: 'PENDING' | 'ATTENDING' | 'COMPLETED') => {
    const updated = tableCalls.map((c) => (c.id === callId ? { ...c, status } : c));
    setTableCalls(updated);
    storageService.saveTableCalls(updated);

    fetch(`/api/call/${callId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  // Update Order Status
  const handleUpdateOrderStatus = (orderId: string, status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED') => {
    const updated = kitchenOrders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setKitchenOrders(updated);
    storageService.saveKitchenOrders(updated);

    fetch(`/api/order/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  // Clear completed calls
  const handleClearCompletedCalls = () => {
    const updated = tableCalls.filter((c) => c.status !== 'COMPLETED');
    setTableCalls(updated);
    storageService.saveTableCalls(updated);
  };

  // Simulate Table Call for quick testing
  const handleSimulateTableCall = (tableId?: string) => {
    const targetTable = tableId
      ? tables.find((t) => t.id === tableId) || tables[0]
      : tables[Math.floor(Math.random() * tables.length)] || {
          id: 'tbl_01',
          restaurantId: restaurant.id,
          name: 'Mesa 10',
          code: 'MESA-10',
          zone: 'Salón Principal',
          capacity: 4,
          qrUrl: '',
          nfcPayload: '',
          updatedAt: new Date().toISOString(),
        };

    const types: Array<{ type: 'waiter' | 'check' | 'help'; label: string }> = [
      { type: 'waiter', label: 'Llamar al Camarero — Atención en mesa' },
      { type: 'check', label: 'Pedir la Cuenta — Pagar con Tarjeta' },
      { type: 'check', label: 'Pedir la Cuenta — Pagar en Efectivo' },
      { type: 'help', label: 'Petición rápida — Pan y Servilletas' },
    ];
    const picked = types[Math.floor(Math.random() * types.length)];

    handleSubmitWaiterCall({
      restaurantId: targetTable.restaurantId,
      tableId: targetTable.id,
      tableCode: targetTable.code,
      tableName: targetTable.name,
      type: picked.type,
      label: picked.label,
      status: 'PENDING',
    });
  };

  // Simulate Order for quick testing
  const handleSimulateOrder = (tableId?: string) => {
    const targetTable = tableId
      ? tables.find((t) => t.id === tableId) || tables[0]
      : tables[Math.floor(Math.random() * tables.length)] || tables[0];

    const randomDishes = [...dishes].sort(() => 0.5 - Math.random()).slice(0, 2);
    const items: OrderItem[] = randomDishes.map((d, i) => ({
      id: `oi_sim_${Date.now()}_${i}`,
      dishId: d.id,
      dishName: d.name,
      price: d.price,
      quantity: 1,
    }));

    const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const newOrder: KitchenOrder = {
      id: `order_${Math.floor(100 + Math.random() * 900)}`,
      restaurantId: targetTable.restaurantId,
      tableId: targetTable.id,
      tableCode: targetTable.code,
      tableName: targetTable.name,
      items,
      subtotal: total,
      total,
      status: 'PENDING',
      orderType: 'DINE_IN',
      createdAt: new Date().toISOString(),
      estimatedMinutes: 15,
    };

    handleSubmitOrder(newOrder);
  };

  // Incremental Import from Gemini PDF
  const handleImportConfirmed = (
    newCategories: Category[],
    newDishes: Dish[],
    mergeMode: 'merge' | 'replace'
  ) => {
    setCategories(newCategories);
    setDishes(newDishes);

    storageService.saveCategories(newCategories);
    storageService.saveDishes(newDishes);

    syncService.enqueue('category', 'UPDATE', { categories: newCategories });
    syncService.enqueue('dish', 'UPDATE', { dishes: newDishes, mode: mergeMode });
  };

  // Reset demo
  const handleResetDemo = () => {
    const data = storageService.resetAllToDemo();
    setRestaurant(data.restaurant);
    setCategories(data.categories);
    setDishes(data.dishes);
    setTables(data.tables);
    setTableCalls(storageService.getTableCalls());
    setKitchenOrders(storageService.getKitchenOrders());
    setCartItems([]);
    syncService.clearQueue();
  };

  const pendingAlertsCount = tableCalls.filter((c) => c.status !== 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onSwitchView={setCurrentView}
        activeTable={activeTable}
        pendingAlertsCount={pendingAlertsCount}
      />

      {/* Real-time Offline & Sync Outbox banner */}
      <SyncStatusBar />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'client' && (
          <ClientMenuView
            restaurant={restaurant}
            categories={categories}
            dishes={dishes}
            activeTable={activeTable}
            onSelectTable={setActiveTable}
            availableTables={tables}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onSubmitOrder={handleSubmitOrder}
            onSubmitWaiterCall={handleSubmitWaiterCall}
          />
        )}

        {currentView === 'kds' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-8 w-full">
            <LiveServiceKDS
              tableCalls={tableCalls}
              kitchenOrders={kitchenOrders}
              tables={tables}
              currencySymbol={restaurant.currencySymbol}
              onUpdateCallStatus={handleUpdateCallStatus}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onClearCompletedCalls={handleClearCompletedCalls}
              onSimulateTableCall={handleSimulateTableCall}
              onSimulateOrder={handleSimulateOrder}
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <DashboardLayout
            restaurant={restaurant}
            categories={categories}
            dishes={dishes}
            tables={tables}
            tableCalls={tableCalls}
            kitchenOrders={kitchenOrders}
            onSaveRestaurant={handleSaveRestaurant}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onSaveDish={handleSaveDish}
            onDeleteDish={handleDeleteDish}
            onSaveTable={handleSaveTable}
            onDeleteTable={handleDeleteTable}
            onImportConfirmed={handleImportConfirmed}
            onResetDemo={handleResetDemo}
            onPreviewClientMenu={() => setCurrentView('client')}
            onUpdateCallStatus={handleUpdateCallStatus}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onClearCompletedCalls={handleClearCompletedCalls}
            onSimulateTableCall={handleSimulateTableCall}
            onSimulateOrder={handleSimulateOrder}
          />
        )}
      </div>
    </div>
  );
}
