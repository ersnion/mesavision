// server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

// src/services/mockData.ts
var INITIAL_RESTAURANT = {
  id: "rest_mesavision_demo",
  name: "Bistr\xF3 MESAvision Gourmet",
  slug: "mesavision-gourmet",
  tagline: "Alta cocina mediterr\xE1nea con experiencia visual aumentada",
  description: "Bienvenidos a MESAvision. Descubra nuestra carta digital con videos en alta definici\xF3n de cada preparaci\xF3n y visualizaci\xF3n 3D interactiva en su propia mesa antes de ordenar.",
  currency: "EUR",
  currencySymbol: "\u20AC",
  logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80",
  coverUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80",
  phone: "+34 912 345 678",
  address: "Calle del Laurel 24, Centro Gastron\xF3mico",
  wifiSsid: "MESA_VISION_GUEST",
  wifiPassword: "gourmet_experience",
  schedule: "Mar - Dom: 13:00 a 16:30 | 20:00 a 23:45",
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
var INITIAL_CATEGORIES = [
  {
    id: "cat_entradas",
    restaurantId: "rest_mesavision_demo",
    name: "Entradas",
    description: "Aperitivos de autor y platos para compartir",
    order: 1,
    icon: "UtensilsCrossed",
    isActive: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "cat_principales",
    restaurantId: "rest_mesavision_demo",
    name: "Principales",
    description: "Cortes seleccionados y pescados frescos del d\xEDa",
    order: 2,
    icon: "Flame",
    isActive: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "cat_hamburguesas",
    restaurantId: "rest_mesavision_demo",
    name: "Hamburguesas",
    description: "Carne madurada 45 d\xEDas en pan brioche artesanal",
    order: 3,
    icon: "Sandwich",
    isActive: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "cat_pastas",
    restaurantId: "rest_mesavision_demo",
    name: "Pastas",
    description: "Elaboraci\xF3n casera tradicional italiana al dente",
    order: 4,
    icon: "Wheat",
    isActive: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "cat_postres",
    restaurantId: "rest_mesavision_demo",
    name: "Postres",
    description: "Tentaciones dulces de nuestro maestro repostero",
    order: 5,
    icon: "Cake",
    isActive: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "cat_bebidas",
    restaurantId: "rest_mesavision_demo",
    name: "Bebidas & Cocteler\xEDa",
    description: "Vinos de denominaci\xF3n, cervezas artesanas y mocktails",
    order: 6,
    icon: "Wine",
    isActive: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var INITIAL_DISHES = [
  {
    id: "dish_01",
    restaurantId: "rest_mesavision_demo",
    categoryId: "cat_hamburguesas",
    name: "Hamburguesa Trufada Dry-Aged",
    description: "200g de carne de buey madurada 45 d\xEDas, queso brie fundido, cebolla caramelizada al Pedro Xim\xE9nez y mayonesa de trufa negra en pan brioche tostado con mantequilla.",
    price: 17.5,
    currency: "EUR",
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "var_01_std", name: "Carne Simple (200g)", price: 17.5 },
      { id: "var_01_dbl", name: "Doble Carne (400g)", price: 22 }
    ],
    ingredients: ["Carne madurada 45d", "Pan Brioche", "Queso Brie", "Trufa Negra", "Cebolla caramelizada", "Mantequilla"],
    allergens: ["Gluten", "L\xE1cteos", "Huevos"],
    dietaryTags: ["Especialidad de la Casa"],
    photo: {
      id: "photo_01",
      dishId: "dish_01",
      url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=80",
      isPrimary: true,
      caption: "Hamburguesa Trufada reci\xE9n emplatada con guarnici\xF3n de patatas r\xFAsticas",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    video: {
      id: "video_01",
      dishId: "dish_01",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
      durationSeconds: 8,
      mimeType: "video/mp4",
      recordedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    model3D: {
      id: "model_01",
      dishId: "dish_01",
      // High quality public Khronos / GLTF sample food model
      glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Burger/glTF-Binary/Burger.glb",
      scale: 1,
      arPlacement: "table",
      status: "SYNCED",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    order: 1,
    confidence: "Alta",
    isDemo: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "dish_02",
    restaurantId: "rest_mesavision_demo",
    categoryId: "cat_entradas",
    name: "Carpaccio de Buey con Parmesano Reggiano",
    description: "Finas l\xE1minas de solomillo de buey con lascas de Parmigiano Reggiano D.O.P. curado 24 meses, r\xFAcula salvaje, alcaparras y emulsi\xF3n de mostaza antigua.",
    price: 14,
    currency: "EUR",
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "var_02_1", name: "Raci\xF3n Individual", price: 14 },
      { id: "var_02_2", name: "Para Compartir", price: 19.5 }
    ],
    ingredients: ["Solomillo de Buey", "Parmesano 24 meses", "R\xFAcula", "Alcaparras", "Aceite Oliva Virgen Extra", "Mostaza de Dijon"],
    allergens: ["L\xE1cteos", "Mostaza"],
    dietaryTags: ["Sin Gluten", "Alto en Prote\xEDna"],
    photo: {
      id: "photo_02",
      dishId: "dish_02",
      url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80",
      isPrimary: true,
      caption: "Presentaci\xF3n tradicional con r\xFAcula y lascas de queso",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    video: {
      id: "video_02",
      dishId: "dish_02",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
      durationSeconds: 6,
      mimeType: "video/mp4",
      recordedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    order: 2,
    confidence: "Alta",
    isDemo: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "dish_03",
    restaurantId: "rest_mesavision_demo",
    categoryId: "cat_principales",
    name: "Salm\xF3n Noruego a la Plancha con Esp\xE1rragos",
    description: "Lomo de salm\xF3n salvaje sellado a fuego vivo con costra crujiente, acompa\xF1ado de esp\xE1rragos trigueros al grill y salsa holandesa c\xEDtrica de lima kaffir.",
    price: 21,
    currency: "EUR",
    isAvailable: true,
    isFeatured: false,
    variants: [],
    ingredients: ["Salm\xF3n salvaje", "Esp\xE1rragos verdes", "Mantequilla clarificada", "Yema de huevo", "Lima kaffir", "Sal en escamas"],
    allergens: ["Pescado", "Huevos", "L\xE1cteos"],
    dietaryTags: ["Sin Gluten", "Keto"],
    photo: {
      id: "photo_03",
      dishId: "dish_03",
      url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&auto=format&fit=crop&q=80",
      isPrimary: true,
      caption: "Lomo de salm\xF3n dorado con esp\xE1rragos trigueros",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    video: {
      id: "video_03",
      dishId: "dish_03",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop&q=80",
      durationSeconds: 7,
      mimeType: "video/mp4",
      recordedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    model3D: {
      id: "model_03",
      dishId: "dish_03",
      // Public verified 3D asset
      glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb",
      scale: 0.9,
      arPlacement: "table",
      status: "SYNCED",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    order: 3,
    confidence: "Alta",
    isDemo: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "dish_04",
    restaurantId: "rest_mesavision_demo",
    categoryId: "cat_pastas",
    name: "Tagliatelle Caseros con Boletus y Trufa",
    description: "Pasta fresca estirada a mano cada ma\xF1ana, salteada con boletus edulis de temporada, crema ligera de trufa blanca y yema de huevo de corral curada.",
    price: 16.8,
    currency: "EUR",
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "var_04_norm", name: "Raci\xF3n Tradicional", price: 16.8 },
      { id: "var_04_singluten", name: "Pasta Sin Gluten (+2\u20AC)", price: 18.8 }
    ],
    ingredients: ["S\xE9mola de trigo duro", "Huevos de corral", "Boletus Edulis", "Trufa blanca", "Parmesano", "Nata fresca"],
    allergens: ["Gluten", "Huevos", "L\xE1cteos"],
    dietaryTags: ["Vegetariano"],
    photo: {
      id: "photo_04",
      dishId: "dish_04",
      url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281724?w=900&auto=format&fit=crop&q=80",
      isPrimary: true,
      caption: "Tagliatelle con boletus y lascas de queso",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    order: 4,
    confidence: "Alta",
    isDemo: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "dish_05",
    restaurantId: "rest_mesavision_demo",
    categoryId: "cat_postres",
    name: "Coulant de Chocolate Valrhona 70%",
    description: "Bizcocho tibio de chocolate negro grand cru con coraz\xF3n l\xEDquido fluyente, acompa\xF1ado de helado artesanal de vainilla Bourbon de Madagascar.",
    price: 8.5,
    currency: "EUR",
    isAvailable: true,
    isFeatured: true,
    variants: [],
    ingredients: ["Chocolate Valrhona 70%", "Mantequilla francesa", "Huevos", "Az\xFAcar moreno", "Vainilla Bourbon"],
    allergens: ["Gluten", "Huevos", "L\xE1cteos", "Soja"],
    dietaryTags: ["Vegetariano"],
    photo: {
      id: "photo_05",
      dishId: "dish_05",
      url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&auto=format&fit=crop&q=80",
      isPrimary: true,
      caption: "Coulant caliente con centro fluido de chocolate",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    video: {
      id: "video_05",
      dishId: "dish_05",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80",
      durationSeconds: 9,
      mimeType: "video/mp4",
      recordedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    order: 5,
    confidence: "Alta",
    isDemo: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "dish_06",
    restaurantId: "rest_mesavision_demo",
    categoryId: "cat_bebidas",
    name: "Cocktail Ahumado MESAvision Signature",
    description: "Mezcla artesanal de bourbon a\xF1ejo, bitter de naranja amarga, jarabe de higos macerados e infusi\xF3n de humo de madera de roble servido bajo campana.",
    price: 11.5,
    currency: "EUR",
    isAvailable: true,
    isFeatured: false,
    variants: [],
    ingredients: ["Bourbon", "Bitter de naranja", "Jarabe de higos", "Humo de roble", "C\xE1scara de naranja"],
    allergens: ["Sulfitos"],
    dietaryTags: ["Vegano", "Bebida Alcoh\xF3lica"],
    photo: {
      id: "photo_06",
      dishId: "dish_06",
      url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900&auto=format&fit=crop&q=80",
      isPrimary: true,
      caption: "Cocktail arom\xE1tico ahumado en mesa",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    order: 6,
    confidence: "Alta",
    isDemo: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var INITIAL_TABLE_CALLS = [
  {
    id: "call_1",
    restaurantId: "rest_mesavision_demo",
    tableId: "tbl_01",
    tableCode: "MESA-01",
    tableName: "Mesa 1",
    type: "waiter",
    label: "Llamar al Camarero",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3 * 6e4).toISOString()
  },
  {
    id: "call_2",
    restaurantId: "rest_mesavision_demo",
    tableId: "tbl_03",
    tableCode: "TERR-01",
    tableName: "Terraza 1",
    type: "check",
    label: "Pedir la Cuenta",
    status: "PENDING",
    createdAt: new Date(Date.now() - 8 * 6e4).toISOString()
  }
];
var INITIAL_KITCHEN_ORDERS = [
  {
    id: "order_341",
    restaurantId: "rest_mesavision_demo",
    tableId: "tbl_01",
    tableCode: "MESA-01",
    tableName: "Mesa 1",
    items: [
      {
        id: "oi_1",
        dishId: "dish_01",
        dishName: "Hamburguesa Trufada Dry-Aged",
        price: 17.5,
        quantity: 1,
        variantName: "Punto: Al punto, Sin cebolla"
      },
      {
        id: "oi_2",
        dishId: "dish_02",
        dishName: "Carpaccio de Buey con Parmesano",
        price: 14,
        quantity: 1
      }
    ],
    subtotal: 31.5,
    total: 31.5,
    status: "COOKING",
    orderType: "DINE_IN",
    notes: "Servir entrante primero",
    createdAt: new Date(Date.now() - 12 * 6e4).toISOString(),
    estimatedMinutes: 8
  },
  {
    id: "order_342",
    restaurantId: "rest_mesavision_demo",
    tableId: "tbl_02",
    tableCode: "MESA-02",
    tableName: "Mesa 2",
    items: [
      {
        id: "oi_3",
        dishId: "dish_03",
        dishName: "Salm\xF3n Noruego a la Plancha",
        price: 21,
        quantity: 2,
        notes: "Salsa holandesa aparte"
      }
    ],
    subtotal: 42,
    total: 42,
    status: "PENDING",
    orderType: "DINE_IN",
    createdAt: new Date(Date.now() - 4 * 6e4).toISOString(),
    estimatedMinutes: 15
  },
  {
    id: "order_343",
    restaurantId: "rest_mesavision_demo",
    tableId: "tbl_03",
    tableCode: "TERR-01",
    tableName: "Terraza 1",
    items: [
      {
        id: "oi_4",
        dishId: "dish_04",
        dishName: "Tagliatelle Caseros con Boletus",
        price: 16.8,
        quantity: 1
      },
      {
        id: "oi_5",
        dishId: "dish_05",
        dishName: "Coulant de Chocolate Valrhona",
        price: 8.5,
        quantity: 1
      }
    ],
    subtotal: 25.3,
    total: 25.3,
    status: "READY",
    orderType: "DINE_IN",
    createdAt: new Date(Date.now() - 25 * 6e4).toISOString(),
    estimatedMinutes: 0
  }
];
var INITIAL_TABLES = [
  {
    id: "tbl_01",
    restaurantId: "rest_mesavision_demo",
    name: "Mesa 1",
    code: "MESA-01",
    zone: "Sal\xF3n Principal",
    capacity: 2,
    qrUrl: "/menu/mesavision-gourmet?mesa=MESA-01",
    nfcPayload: "https://mesavision.app/menu/mesavision-gourmet?mesa=MESA-01",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "tbl_02",
    restaurantId: "rest_mesavision_demo",
    name: "Mesa 2",
    code: "MESA-02",
    zone: "Sal\xF3n Principal",
    capacity: 4,
    qrUrl: "/menu/mesavision-gourmet?mesa=MESA-02",
    nfcPayload: "https://mesavision.app/menu/mesavision-gourmet?mesa=MESA-02",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "tbl_03",
    restaurantId: "rest_mesavision_demo",
    name: "Terraza 1",
    code: "TERR-01",
    zone: "Terraza Exterior",
    capacity: 4,
    qrUrl: "/menu/mesavision-gourmet?mesa=TERR-01",
    nfcPayload: "https://mesavision.app/menu/mesavision-gourmet?mesa=TERR-01",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "tbl_04",
    restaurantId: "rest_mesavision_demo",
    name: "Terraza 2",
    code: "TERR-02",
    zone: "Terraza Exterior",
    capacity: 6,
    qrUrl: "/menu/mesavision-gourmet?mesa=TERR-02",
    nfcPayload: "https://mesavision.app/menu/mesavision-gourmet?mesa=TERR-02",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "tbl_05",
    restaurantId: "rest_mesavision_demo",
    name: "Barra 1",
    code: "BAR-01",
    zone: "Barra Cocteler\xEDa",
    capacity: 2,
    qrUrl: "/menu/mesavision-gourmet?mesa=BAR-01",
    nfcPayload: "https://mesavision.app/menu/mesavision-gourmet?mesa=BAR-01",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var candidatePaths = [
  path.resolve(__dirname, "dist"),
  path.resolve(process.cwd(), "dist"),
  path.resolve("/app/applet/dist")
];
var distPath = candidatePaths.find((p) => fs.existsSync(path.resolve(p, "index.html"))) || candidatePaths[0];
var isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV !== "development" && fs.existsSync(path.resolve(distPath, "index.html"));
var isDev = !isProduction;
app.disable("x-powered-by");
app.use(express.json({ limit: "60mb" }));
app.use(express.urlencoded({ extended: true, limit: "60mb" }));
var serverDatabase = {
  restaurant: { ...INITIAL_RESTAURANT },
  categories: [...INITIAL_CATEGORIES],
  dishes: [...INITIAL_DISHES],
  tables: [...INITIAL_TABLES],
  tableCalls: [...INITIAL_TABLE_CALLS],
  kitchenOrders: [...INITIAL_KITCHEN_ORDERS],
  syncHistory: [],
  lastUpdated: Date.now()
};
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "MESAvision",
    timestamp: Date.now(),
    isServerAvailable: true
  });
});
app.get("/api/state", (_req, res) => {
  res.json({
    restaurant: serverDatabase.restaurant,
    categories: serverDatabase.categories,
    dishes: serverDatabase.dishes,
    tables: serverDatabase.tables,
    tableCalls: serverDatabase.tableCalls,
    kitchenOrders: serverDatabase.kitchenOrders,
    lastUpdated: serverDatabase.lastUpdated
  });
});
app.get("/api/live-alerts", (_req, res) => {
  res.json({
    tableCalls: serverDatabase.tableCalls,
    kitchenOrders: serverDatabase.kitchenOrders,
    lastUpdated: serverDatabase.lastUpdated
  });
});
app.post("/api/order", (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.id || !order.items) {
      return res.status(400).json({ error: "Datos de comanda inv\xE1lidos" });
    }
    serverDatabase.kitchenOrders.unshift(order);
    if (serverDatabase.kitchenOrders.length > 100) {
      serverDatabase.kitchenOrders = serverDatabase.kitchenOrders.slice(0, 100);
    }
    serverDatabase.lastUpdated = Date.now();
    return res.status(201).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error al registrar comanda" });
  }
});
app.patch("/api/order/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = serverDatabase.kitchenOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Comanda no encontrada" });
  }
  if (status) {
    order.status = status;
    serverDatabase.lastUpdated = Date.now();
  }
  return res.json({ success: true, order });
});
app.post("/api/call", (req, res) => {
  try {
    const call = req.body;
    if (!call || !call.id || !call.tableId) {
      return res.status(400).json({ error: "Datos de llamada inv\xE1lidos" });
    }
    serverDatabase.tableCalls.unshift(call);
    if (serverDatabase.tableCalls.length > 80) {
      serverDatabase.tableCalls = serverDatabase.tableCalls.slice(0, 80);
    }
    serverDatabase.lastUpdated = Date.now();
    return res.status(201).json({ success: true, call });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error al registrar llamada" });
  }
});
app.patch("/api/call/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const call = serverDatabase.tableCalls.find((c) => c.id === id);
  if (!call) {
    return res.status(404).json({ error: "Llamada no encontrada" });
  }
  if (status) {
    call.status = status;
    serverDatabase.lastUpdated = Date.now();
  }
  return res.json({ success: true, call });
});
app.post("/api/sync", (req, res) => {
  try {
    const { operations } = req.body;
    if (!Array.isArray(operations)) {
      return res.status(400).json({ error: "Formato inv\xE1lido de operaciones" });
    }
    const syncedIds = [];
    for (const op of operations) {
      if (op.entity === "restaurant" && op.action === "UPDATE") {
        serverDatabase.restaurant = { ...op.payload };
      } else if (op.entity === "category") {
        if (op.action === "CREATE") {
          serverDatabase.categories.push(op.payload);
        } else if (op.action === "UPDATE") {
          if (op.payload.categories) {
            serverDatabase.categories = op.payload.categories;
          } else {
            serverDatabase.categories = serverDatabase.categories.map(
              (c) => c.id === op.payload.id ? op.payload : c
            );
          }
        } else if (op.action === "DELETE") {
          serverDatabase.categories = serverDatabase.categories.filter((c) => c.id !== op.payload.id);
        }
      } else if (op.entity === "dish") {
        if (op.action === "CREATE") {
          serverDatabase.dishes.unshift(op.payload);
        } else if (op.action === "UPDATE") {
          if (op.payload.dishes) {
            serverDatabase.dishes = op.payload.dishes;
          } else {
            serverDatabase.dishes = serverDatabase.dishes.map(
              (d) => d.id === op.payload.id ? op.payload : d
            );
          }
        } else if (op.action === "DELETE") {
          serverDatabase.dishes = serverDatabase.dishes.filter((d) => d.id !== op.payload.id);
        }
      } else if (op.entity === "table") {
        if (op.payload?.type === "NEW_ORDER" && op.payload?.order) {
          const exists = serverDatabase.kitchenOrders.some((o) => o.id === op.payload.order.id);
          if (!exists) serverDatabase.kitchenOrders.unshift(op.payload.order);
        } else if (op.payload?.type === "NEW_CALL" && op.payload?.call) {
          const exists = serverDatabase.tableCalls.some((c) => c.id === op.payload.call.id);
          if (!exists) serverDatabase.tableCalls.unshift(op.payload.call);
        } else if (op.action === "CREATE") {
          serverDatabase.tables.push(op.payload);
        } else if (op.action === "UPDATE") {
          serverDatabase.tables = serverDatabase.tables.map(
            (t) => t.id === op.payload.id ? op.payload : t
          );
        } else if (op.action === "DELETE") {
          serverDatabase.tables = serverDatabase.tables.filter((t) => t.id !== op.payload.id);
        }
      }
      serverDatabase.syncHistory.push({
        id: op.id,
        entity: op.entity,
        action: op.action,
        timestamp: Date.now()
      });
      syncedIds.push(op.id);
    }
    serverDatabase.lastUpdated = Date.now();
    if (serverDatabase.syncHistory.length > 200) {
      serverDatabase.syncHistory = serverDatabase.syncHistory.slice(-200);
    }
    return res.json({
      success: true,
      syncedIds,
      timestamp: Date.now(),
      totalOperationsSynced: syncedIds.length
    });
  } catch (error) {
    console.error("Error en /api/sync:", error);
    return res.status(500).json({ error: error.message || "Error interno de sincronizaci\xF3n" });
  }
});
function parseMenuTextDeterministic(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let restaurantName = "Restaurante El Jard\xEDn Mediterr\xE1neo";
  const categoriesMap = /* @__PURE__ */ new Map();
  let currentCategory = "Entradas";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("RESTAURANTE")) {
      restaurantName = line.replace("RESTAURANTE", "").trim() || restaurantName;
      continue;
    }
    if (line.includes("Carta Temporada")) continue;
    if (line === line.toUpperCase() && !line.includes("\u20AC") && !/^\d+\./.test(line) || line.includes("ENTRADAS") || line.includes("PLATOS PRINCIPALES") || line.includes("POSTRES") || line.includes("BEBIDAS")) {
      currentCategory = line.charAt(0) + line.slice(1).toLowerCase();
      if (!categoriesMap.has(currentCategory)) {
        categoriesMap.set(currentCategory, []);
      }
      continue;
    }
    const dishMatch = line.match(/^(?:\d+[\.\)]\s*)?([^-–—]+?)\s*[-–—]\s*(\d+(?:[.,]\d+)?)\s*€?/i);
    if (dishMatch) {
      const name = dishMatch[1].trim();
      const price = parseFloat(dishMatch[2].replace(",", "."));
      let description = "";
      const ingredients = [];
      const allergens = [];
      const dietaryTags = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].match(/^(?:\d+[\.\)]\s*)?[^-–—]+?\s*[-–—]\s*\d+/i) && !lines[j].includes("ENTRADAS") && !lines[j].includes("PLATOS") && !lines[j].includes("POSTRES")) {
        const nextLine = lines[j];
        if (nextLine.toLowerCase().startsWith("al\xE9rgenos:") || nextLine.toLowerCase().startsWith("alergenos:")) {
          const list = nextLine.replace(/al[eé]rgenos:\s*/i, "").split(/[,.]/);
          list.forEach((item) => {
            const trimmed = item.trim();
            if (trimmed && !trimmed.toLowerCase().includes("ninguno")) allergens.push(trimmed);
          });
        } else if (nextLine.toLowerCase().startsWith("ingredientes:")) {
          const list = nextLine.replace(/ingredientes:\s*/i, "").split(/[,.]/);
          list.forEach((item) => {
            const trimmed = item.trim();
            if (trimmed) ingredients.push(trimmed);
          });
        } else if (nextLine.toLowerCase().startsWith("apto para:")) {
          const list = nextLine.replace(/apto para:\s*/i, "").split(/[,.]/);
          list.forEach((item) => {
            const trimmed = item.trim();
            if (trimmed) dietaryTags.push(trimmed);
          });
        } else {
          if (!description) {
            description = nextLine;
          } else {
            description += " " + nextLine;
          }
        }
        j++;
      }
      i = j - 1;
      if (!categoriesMap.has(currentCategory)) {
        categoriesMap.set(currentCategory, []);
      }
      categoriesMap.get(currentCategory).push({
        name,
        categoryName: currentCategory,
        description: description || null,
        price,
        currency: "EUR",
        variants: [],
        ingredients,
        allergens,
        dietaryTags,
        confidence: "Alta",
        confidenceNotes: "Extracci\xF3n de carta estructurada con precios y al\xE9rgenos verificados."
      });
    }
  }
  const categories = Array.from(categoriesMap.keys()).map((catName) => ({
    name: catName,
    description: `Platos de ${catName.toLowerCase()}`
  }));
  const dishes = [];
  categoriesMap.forEach((items) => {
    dishes.push(...items);
  });
  return {
    restaurantName,
    currency: "EUR",
    categories,
    dishes,
    notes: "Carta analizada mediante procesador estructurado con regla estricta de NO INVENTAR INFORMACI\xD3N."
  };
}
app.post("/api/gemini/analyze-menu", async (req, res) => {
  try {
    const { base64Data, mimeType, fileName, sampleText } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyMissing = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "";
    if (isApiKeyMissing) {
      if (sampleText) {
        const parsed = parseMenuTextDeterministic(sampleText);
        const enrichedDishes2 = parsed.dishes.map((dish, idx) => ({
          ...dish,
          tempId: `extracted_demo_${Date.now()}_${idx}`,
          isSelected: true
        }));
        return res.json({
          ...parsed,
          dishes: enrichedDishes2,
          analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
          isFallback: true
        });
      }
      return res.status(400).json({
        error: 'GEMINI_API_KEY no configurada en las variables de entorno. Puedes utilizar el bot\xF3n "Probar con carta de ejemplo" para probar la importaci\xF3n y revisi\xF3n humana.'
      });
    }
    const ai = new GoogleGenAI({});
    const systemInstruction = `
Eres el motor de an\xE1lisis y digitalizaci\xF3n de cartas gastron\xF3micas de MESAvision.
Tu misi\xF3n es extraer y estructurar con m\xE1xima fidelidad la carta de un restaurante.

REGLA ABSOLUTA Y OBLIGATORIA:
- NO INVENTAR INFORMACI\xD3N.
- Si un dato (como precio, descripci\xF3n, ingredientes o al\xE9rgenos) no aparece claramente impreso o indicado en la carta, debes devolver null o un arreglo vac\xEDo [].
- NUNCA inventes precios, variantes, descripciones o ingredientes ausentes.
- Detecta nombres exactos de categor\xEDas (ej. Entradas, Principales, Carnes, Pescados, Postres, Bebidas).
- Para cada plato asigna un nivel de confianza ('Alta', 'Media', 'Revisar'):
  * 'Alta': Nombre, categor\xEDa y precio est\xE1n perfectamente claros y legibles.
  * 'Media': Alg\xFAn dato es ambiguo (ej. precio compartido o tama\xF1o indeterminado).
  * 'Revisar': Texto poco claro, precio ausente o dudoso, o categor\xEDa no especificada claramente.
- Si detectas al\xE9rgenos espec\xEDficos (Gluten, L\xE1cteos, Huevos, Pescado, Crust\xE1ceos, Cacahuetes, Soja, Frutos secos, Apio, Mostaza, S\xE9samo, Sulfitos, etc.), incl\xFAyelos \xFAnicamente si est\xE1n expl\xEDcitamente se\xF1alados con iconos o texto.
- Detecta si el plato es apto para cel\xEDacos / vegetariano / vegano si est\xE1 indicado.
`;
    let contents = [];
    if (base64Data && mimeType) {
      contents = [
        {
          inlineData: {
            mimeType: mimeType === "application/pdf" ? "application/pdf" : mimeType,
            data: base64Data
          }
        },
        {
          text: `Analiza esta carta gastron\xF3mica (${fileName || "documento"}). Extrae todas las categor\xEDas, platos, precios num\xE9ricos, variantes de tama\xF1o/porci\xF3n, ingredientes y al\xE9rgenos indicados. Aplica la regla estricta de NO INVENTAR INFORMACI\xD3N.`
        }
      ];
    } else if (sampleText) {
      contents = [
        {
          text: `Analiza el siguiente texto de carta de restaurante y extr\xE1elo de manera estructurada seg\xFAn las reglas:

${sampleText}`
        }
      ];
    } else {
      return res.status(400).json({ error: "Se requiere archivo PDF/imagen o texto de la carta." });
    }
    let parsedData;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              restaurantName: { type: Type.STRING },
              currency: { type: Type.STRING },
              categories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["name"]
                }
              },
              dishes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    categoryName: { type: Type.STRING },
                    description: { type: Type.STRING, nullable: true },
                    price: { type: Type.NUMBER, nullable: true },
                    currency: { type: Type.STRING },
                    variants: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          price: { type: Type.NUMBER }
                        },
                        required: ["name", "price"]
                      }
                    },
                    ingredients: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    allergens: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    dietaryTags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    confidence: {
                      type: Type.STRING,
                      enum: ["Alta", "Media", "Revisar"]
                    },
                    confidenceNotes: { type: Type.STRING, nullable: true }
                  },
                  required: ["name", "categoryName", "confidence"]
                }
              },
              notes: { type: Type.STRING, nullable: true }
            },
            required: ["categories", "dishes"]
          }
        }
      });
      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini no gener\xF3 respuesta textual.");
      }
      parsedData = JSON.parse(responseText);
    } catch (apiError) {
      console.warn("Fallo en llamada a Gemini API, evaluando fallback:", apiError.message);
      if (sampleText) {
        parsedData = parseMenuTextDeterministic(sampleText);
      } else {
        throw apiError;
      }
    }
    const enrichedDishes = (parsedData.dishes || []).map((dish, idx) => ({
      ...dish,
      tempId: `extracted_${Date.now()}_${idx}`,
      isSelected: true,
      price: typeof dish.price === "number" ? dish.price : null,
      variants: Array.isArray(dish.variants) ? dish.variants : [],
      ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
      allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
      dietaryTags: Array.isArray(dish.dietaryTags) ? dish.dietaryTags : [],
      confidence: dish.confidence || "Media"
    }));
    return res.json({
      restaurantName: parsedData.restaurantName || "Carta Digital Restaurante",
      currency: parsedData.currency || "EUR",
      categories: parsedData.categories || [],
      dishes: enrichedDishes,
      notes: parsedData.notes || "",
      analyzedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error analizando carta con Gemini:", error);
    return res.status(500).json({
      error: error.message || "Error analizando el archivo de la carta con Gemini."
    });
  }
});
async function startServer() {
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "Endpoint API no encontrado" });
  });
  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, { index: false }));
    app.get("/", (_req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("MESAvision frontend build no encontrado. Ejecuta npm run build.");
      }
    });
    app.get("*", (_req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("MESAvision frontend build no encontrado. Ejecuta npm run build.");
      }
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MESAvision server corriendo en http://0.0.0.0:${PORT} [${isProduction ? "PROD" : "DEV"}]`);
  });
}
startServer();
