import { Restaurant, Category, Dish, Table, OutboxOperation, TableCall, KitchenOrder } from '../types';
import {
  INITIAL_RESTAURANT,
  INITIAL_CATEGORIES,
  INITIAL_DISHES,
  INITIAL_TABLES,
  INITIAL_TABLE_CALLS,
  INITIAL_KITCHEN_ORDERS,
} from './mockData';

const STORAGE_KEYS = {
  RESTAURANT: 'mesavision_restaurant_v1',
  CATEGORIES: 'mesavision_categories_v1',
  DISHES: 'mesavision_dishes_v1',
  TABLES: 'mesavision_tables_v1',
  TABLE_CALLS: 'mesavision_table_calls_v1',
  KITCHEN_ORDERS: 'mesavision_kitchen_orders_v1',
  SYNC_QUEUE: 'mesavision_sync_queue_v1',
  LAST_SYNC: 'mesavision_last_sync_timestamp',
};

export const storageService = {
  getRestaurant(): Restaurant {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESTAURANT);
      return data ? JSON.parse(data) : INITIAL_RESTAURANT;
    } catch {
      return INITIAL_RESTAURANT;
    }
  },

  saveRestaurant(restaurant: Restaurant): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RESTAURANT, JSON.stringify(restaurant));
    } catch (e) {
      console.error('Error saving restaurant to localStorage', e);
    }
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories to localStorage', e);
    }
  },

  getDishes(): Dish[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISHES);
      return data ? JSON.parse(data) : INITIAL_DISHES;
    } catch {
      return INITIAL_DISHES;
    }
  },

  saveDishes(dishes: Dish[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishes));
    } catch (e) {
      console.error('Error saving dishes to localStorage', e);
    }
  },

  getTables(): Table[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TABLES);
      return data ? JSON.parse(data) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  },

  saveTables(tables: Table[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    } catch (e) {
      console.error('Error saving tables to localStorage', e);
    }
  },

  getTableCalls(): TableCall[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TABLE_CALLS);
      return data ? JSON.parse(data) : INITIAL_TABLE_CALLS;
    } catch {
      return INITIAL_TABLE_CALLS;
    }
  },

  saveTableCalls(calls: TableCall[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLE_CALLS, JSON.stringify(calls));
    } catch (e) {
      console.error('Error saving table calls to localStorage', e);
    }
  },

  getKitchenOrders(): KitchenOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KITCHEN_ORDERS);
      return data ? JSON.parse(data) : INITIAL_KITCHEN_ORDERS;
    } catch {
      return INITIAL_KITCHEN_ORDERS;
    }
  },

  saveKitchenOrders(orders: KitchenOrder[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.KITCHEN_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving kitchen orders to localStorage', e);
    }
  },

  getSyncQueue(): OutboxOperation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSyncQueue(queue: OutboxOperation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Error saving sync queue to localStorage', e);
    }
  },

  getLastSyncTime(): number | null {
    try {
      const ts = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return ts ? parseInt(ts, 10) : null;
    } catch {
      return null;
    }
  },

  setLastSyncTime(timestamp: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (e) {
      console.error('Error setting last sync time', e);
    }
  },

  resetAllToDemo(): { restaurant: Restaurant; categories: Category[]; dishes: Dish[]; tables: Table[] } {
    localStorage.removeItem(STORAGE_KEYS.RESTAURANT);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.DISHES);
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.TABLE_CALLS);
    localStorage.removeItem(STORAGE_KEYS.KITCHEN_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    
    this.saveRestaurant(INITIAL_RESTAURANT);
    this.saveCategories(INITIAL_CATEGORIES);
    this.saveDishes(INITIAL_DISHES);
    this.saveTables(INITIAL_TABLES);
    this.saveTableCalls(INITIAL_TABLE_CALLS);
    this.saveKitchenOrders(INITIAL_KITCHEN_ORDERS);

    return {
      restaurant: INITIAL_RESTAURANT,
      categories: INITIAL_CATEGORIES,
      dishes: INITIAL_DISHES,
      tables: INITIAL_TABLES,
    };
  }
};
