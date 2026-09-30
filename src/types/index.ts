/**
 * MESAvision — Data Models
 * REGLA ABSOLUTA: CERO RESEÑAS. Esta aplicación es exclusivamente para Carta Digital.
 */

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  currency: string;        // e.g. "EUR", "USD", "MXN"
  currencySymbol: string;  // e.g. "€", "$", "MX$"
  logoUrl: string;
  coverUrl: string;
  phone: string;
  address: string;
  wifiSsid?: string;
  wifiPassword?: string;
  schedule?: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  order: number;
  icon?: string; // lucide icon identifier or emoji
  isActive: boolean;
  updatedAt: string;
}

export interface DishVariant {
  id: string;
  name: string;      // e.g., "Media ración", "Completa", "250g", "400g"
  price: number;
}

export interface DishPhoto {
  id: string;
  dishId: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface DishVideo {
  id: string;
  dishId: string;     // Asociado exclusivamente mediante dishId
  videoUrl: string;   // blob:, data: o URL remota
  thumbnailUrl: string;
  durationSeconds: number;
  mimeType: string;
  sizeBytes?: number;
  recordedAt: string;
}

export type Model3DStatus = 'NO_MODEL' | 'LOCAL' | 'PENDING_SYNC' | 'SYNCED' | 'SYNC_ERROR';

export interface Dish3DModel {
  id: string;
  dishId: string;     // Asociado exclusivamente mediante dishId
  glbUrl: string;     // Modelo GLB (Android, WebXR, SceneViewer, fallback)
  usdzUrl?: string;   // Modelo USDZ (iOS Quick Look)
  thumbnailUrl?: string;
  scale: number;      // e.g. 1.0
  arPlacement: 'floor' | 'table';
  status: Model3DStatus;
  updatedAt: string;
}

export interface Dish {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  variants: DishVariant[];
  ingredients: string[];
  allergens: string[]; // e.g. Gluten, Crustáceos, Huevos, Pescado, Lácteos, etc.
  dietaryTags: string[]; // e.g. "Vegetariano", "Vegano", "Sin Gluten", "Picante"
  
  // Multimedia asociada por dishId
  photo?: DishPhoto;
  video?: DishVideo;
  model3D?: Dish3DModel;

  order: number;
  
  // Metadatos de importación Gemini (si procede)
  confidence?: 'Alta' | 'Media' | 'Revisar';
  confidenceNotes?: string;
  isDemo?: boolean;

  updatedAt: string;
}

export interface Table {
  id: string;
  restaurantId: string;
  name: string;          // e.g. "Mesa 1", "Terraza 4", "Barra 2"
  code: string;          // Identificador único ej. "MESA-01", "TERR-04"
  zone: string;          // "Interior", "Terraza", "Barra", "VIP"
  capacity: number;
  qrUrl: string;         // URL que abre la carta digital con parámetro de mesa
  nfcPayload: string;    // URI NDEF estándar que se graba en el chip NFC
  updatedAt: string;
}

export interface TableCall {
  id: string;
  restaurantId: string;
  tableId: string;
  tableCode: string;
  tableName: string;
  type: 'waiter' | 'check' | 'help';
  label: string;
  status: 'PENDING' | 'ATTENDING' | 'COMPLETED';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
  variantName?: string;
  notes?: string;
}

export interface KitchenOrder {
  id: string;
  restaurantId: string;
  tableId: string;
  tableCode: string;
  tableName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED';
  orderType: 'DINE_IN' | 'TAKEAWAY';
  notes?: string;
  createdAt: string;
  estimatedMinutes?: number;
}

// Sistema de Sincronización Outbox
export type SyncStatusType = 
  | 'ONLINE'
  | 'OFFLINE'
  | 'SYNCING'
  | 'SYNC_ERROR'
  | 'SERVER_UNAVAILABLE';

export interface OutboxOperation {
  id: string;
  entity: 'restaurant' | 'category' | 'dish' | 'table' | 'multimedia';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export interface SyncState {
  status: SyncStatusType;
  lastSyncTime: number | null;
  pendingQueue: OutboxOperation[];
  isServerReachable: boolean;
  isNetworkOnline: boolean;
}

// Importador PDF Gemini & Revisión Humana
export interface GeminiExtractedCategory {
  name: string;
  description?: string;
}

export interface GeminiExtractedDish {
  tempId: string;
  name: string;
  categoryName: string;
  description: string | null;
  price: number | null;
  currency?: string;
  variants: { name: string; price: number }[];
  ingredients: string[];
  allergens: string[];
  dietaryTags?: string[];
  confidence: 'Alta' | 'Media' | 'Revisar';
  confidenceNotes?: string;
  
  // Campos de revisión humana
  isSelected: boolean;
  isDuplicate?: boolean;
  duplicateDishId?: string;
}

export interface GeminiMenuAnalysisResult {
  restaurantName?: string;
  currency?: string;
  categories: GeminiExtractedCategory[];
  dishes: GeminiExtractedDish[];
  notes?: string;
  analyzedAt: string;
}
