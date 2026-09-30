import type { Restaurant, Category, Dish, Table, TableCall, KitchenOrder } from '../types/index.ts';

export const INITIAL_RESTAURANT: Restaurant = {
  id: 'rest_mesavision_demo',
  name: 'Bistró MESAvision Gourmet',
  slug: 'mesavision-gourmet',
  tagline: 'Alta cocina mediterránea con experiencia visual aumentada',
  description: 'Bienvenidos a MESAvision. Descubra nuestra carta digital con videos en alta definición de cada preparación y visualización 3D interactiva en su propia mesa antes de ordenar.',
  currency: 'EUR',
  currencySymbol: '€',
  logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80',
  phone: '+34 912 345 678',
  address: 'Calle del Laurel 24, Centro Gastronómico',
  wifiSsid: 'MESA_VISION_GUEST',
  wifiPassword: 'gourmet_experience',
  schedule: 'Mar - Dom: 13:00 a 16:30 | 20:00 a 23:45',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_entradas',
    restaurantId: 'rest_mesavision_demo',
    name: 'Entradas',
    description: 'Aperitivos de autor y platos para compartir',
    order: 1,
    icon: 'UtensilsCrossed',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_principales',
    restaurantId: 'rest_mesavision_demo',
    name: 'Principales',
    description: 'Cortes seleccionados y pescados frescos del día',
    order: 2,
    icon: 'Flame',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_hamburguesas',
    restaurantId: 'rest_mesavision_demo',
    name: 'Hamburguesas',
    description: 'Carne madurada 45 días en pan brioche artesanal',
    order: 3,
    icon: 'Sandwich',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_pastas',
    restaurantId: 'rest_mesavision_demo',
    name: 'Pastas',
    description: 'Elaboración casera tradicional italiana al dente',
    order: 4,
    icon: 'Wheat',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_postres',
    restaurantId: 'rest_mesavision_demo',
    name: 'Postres',
    description: 'Tentaciones dulces de nuestro maestro repostero',
    order: 5,
    icon: 'Cake',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_bebidas',
    restaurantId: 'rest_mesavision_demo',
    name: 'Bebidas & Coctelería',
    description: 'Vinos de denominación, cervezas artesanas y mocktails',
    order: 6,
    icon: 'Wine',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_DISHES: Dish[] = [
  {
    id: 'dish_01',
    restaurantId: 'rest_mesavision_demo',
    categoryId: 'cat_hamburguesas',
    name: 'Hamburguesa Trufada Dry-Aged',
    description: '200g de carne de buey madurada 45 días, queso brie fundido, cebolla caramelizada al Pedro Ximénez y mayonesa de trufa negra en pan brioche tostado con mantequilla.',
    price: 17.50,
    currency: 'EUR',
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: 'var_01_std', name: 'Carne Simple (200g)', price: 17.50 },
      { id: 'var_01_dbl', name: 'Doble Carne (400g)', price: 22.00 },
    ],
    ingredients: ['Carne madurada 45d', 'Pan Brioche', 'Queso Brie', 'Trufa Negra', 'Cebolla caramelizada', 'Mantequilla'],
    allergens: ['Gluten', 'Lácteos', 'Huevos'],
    dietaryTags: ['Especialidad de la Casa'],
    photo: {
      id: 'photo_01',
      dishId: 'dish_01',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=80',
      isPrimary: true,
      caption: 'Hamburguesa Trufada recién emplatada con guarnición de patatas rústicas',
      uploadedAt: new Date().toISOString(),
    },
    video: {
      id: 'video_01',
      dishId: 'dish_01',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
      durationSeconds: 8,
      mimeType: 'video/mp4',
      recordedAt: new Date().toISOString(),
    },
    model3D: {
      id: 'model_01',
      dishId: 'dish_01',
      // High quality public Khronos / GLTF sample food model
      glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Burger/glTF-Binary/Burger.glb',
      scale: 1.0,
      arPlacement: 'table',
      status: 'SYNCED',
      updatedAt: new Date().toISOString(),
    },
    order: 1,
    confidence: 'Alta',
    isDemo: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish_02',
    restaurantId: 'rest_mesavision_demo',
    categoryId: 'cat_entradas',
    name: 'Carpaccio de Buey con Parmesano Reggiano',
    description: 'Finas láminas de solomillo de buey con lascas de Parmigiano Reggiano D.O.P. curado 24 meses, rúcula salvaje, alcaparras y emulsión de mostaza antigua.',
    price: 14.00,
    currency: 'EUR',
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: 'var_02_1', name: 'Ración Individual', price: 14.00 },
      { id: 'var_02_2', name: 'Para Compartir', price: 19.50 },
    ],
    ingredients: ['Solomillo de Buey', 'Parmesano 24 meses', 'Rúcula', 'Alcaparras', 'Aceite Oliva Virgen Extra', 'Mostaza de Dijon'],
    allergens: ['Lácteos', 'Mostaza'],
    dietaryTags: ['Sin Gluten', 'Alto en Proteína'],
    photo: {
      id: 'photo_02',
      dishId: 'dish_02',
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80',
      isPrimary: true,
      caption: 'Presentación tradicional con rúcula y lascas de queso',
      uploadedAt: new Date().toISOString(),
    },
    video: {
      id: 'video_02',
      dishId: 'dish_02',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
      durationSeconds: 6,
      mimeType: 'video/mp4',
      recordedAt: new Date().toISOString(),
    },
    order: 2,
    confidence: 'Alta',
    isDemo: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish_03',
    restaurantId: 'rest_mesavision_demo',
    categoryId: 'cat_principales',
    name: 'Salmón Noruego a la Plancha con Espárragos',
    description: 'Lomo de salmón salvaje sellado a fuego vivo con costra crujiente, acompañado de espárragos trigueros al grill y salsa holandesa cítrica de lima kaffir.',
    price: 21.00,
    currency: 'EUR',
    isAvailable: true,
    isFeatured: false,
    variants: [],
    ingredients: ['Salmón salvaje', 'Espárragos verdes', 'Mantequilla clarificada', 'Yema de huevo', 'Lima kaffir', 'Sal en escamas'],
    allergens: ['Pescado', 'Huevos', 'Lácteos'],
    dietaryTags: ['Sin Gluten', 'Keto'],
    photo: {
      id: 'photo_03',
      dishId: 'dish_03',
      url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&auto=format&fit=crop&q=80',
      isPrimary: true,
      caption: 'Lomo de salmón dorado con espárragos trigueros',
      uploadedAt: new Date().toISOString(),
    },
    video: {
      id: 'video_03',
      dishId: 'dish_03',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop&q=80',
      durationSeconds: 7,
      mimeType: 'video/mp4',
      recordedAt: new Date().toISOString(),
    },
    model3D: {
      id: 'model_03',
      dishId: 'dish_03',
      // Public verified 3D asset
      glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
      scale: 0.9,
      arPlacement: 'table',
      status: 'SYNCED',
      updatedAt: new Date().toISOString(),
    },
    order: 3,
    confidence: 'Alta',
    isDemo: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish_04',
    restaurantId: 'rest_mesavision_demo',
    categoryId: 'cat_pastas',
    name: 'Tagliatelle Caseros con Boletus y Trufa',
    description: 'Pasta fresca estirada a mano cada mañana, salteada con boletus edulis de temporada, crema ligera de trufa blanca y yema de huevo de corral curada.',
    price: 16.80,
    currency: 'EUR',
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: 'var_04_norm', name: 'Ración Tradicional', price: 16.80 },
      { id: 'var_04_singluten', name: 'Pasta Sin Gluten (+2€)', price: 18.80 },
    ],
    ingredients: ['Sémola de trigo duro', 'Huevos de corral', 'Boletus Edulis', 'Trufa blanca', 'Parmesano', 'Nata fresca'],
    allergens: ['Gluten', 'Huevos', 'Lácteos'],
    dietaryTags: ['Vegetariano'],
    photo: {
      id: 'photo_04',
      dishId: 'dish_04',
      url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281724?w=900&auto=format&fit=crop&q=80',
      isPrimary: true,
      caption: 'Tagliatelle con boletus y lascas de queso',
      uploadedAt: new Date().toISOString(),
    },
    order: 4,
    confidence: 'Alta',
    isDemo: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish_05',
    restaurantId: 'rest_mesavision_demo',
    categoryId: 'cat_postres',
    name: 'Coulant de Chocolate Valrhona 70%',
    description: 'Bizcocho tibio de chocolate negro grand cru con corazón líquido fluyente, acompañado de helado artesanal de vainilla Bourbon de Madagascar.',
    price: 8.50,
    currency: 'EUR',
    isAvailable: true,
    isFeatured: true,
    variants: [],
    ingredients: ['Chocolate Valrhona 70%', 'Mantequilla francesa', 'Huevos', 'Azúcar moreno', 'Vainilla Bourbon'],
    allergens: ['Gluten', 'Huevos', 'Lácteos', 'Soja'],
    dietaryTags: ['Vegetariano'],
    photo: {
      id: 'photo_05',
      dishId: 'dish_05',
      url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&auto=format&fit=crop&q=80',
      isPrimary: true,
      caption: 'Coulant caliente con centro fluido de chocolate',
      uploadedAt: new Date().toISOString(),
    },
    video: {
      id: 'video_05',
      dishId: 'dish_05',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80',
      durationSeconds: 9,
      mimeType: 'video/mp4',
      recordedAt: new Date().toISOString(),
    },
    order: 5,
    confidence: 'Alta',
    isDemo: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish_06',
    restaurantId: 'rest_mesavision_demo',
    categoryId: 'cat_bebidas',
    name: 'Cocktail Ahumado MESAvision Signature',
    description: 'Mezcla artesanal de bourbon añejo, bitter de naranja amarga, jarabe de higos macerados e infusión de humo de madera de roble servido bajo campana.',
    price: 11.50,
    currency: 'EUR',
    isAvailable: true,
    isFeatured: false,
    variants: [],
    ingredients: ['Bourbon', 'Bitter de naranja', 'Jarabe de higos', 'Humo de roble', 'Cáscara de naranja'],
    allergens: ['Sulfitos'],
    dietaryTags: ['Vegano', 'Bebida Alcohólica'],
    photo: {
      id: 'photo_06',
      dishId: 'dish_06',
      url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900&auto=format&fit=crop&q=80',
      isPrimary: true,
      caption: 'Cocktail aromático ahumado en mesa',
      uploadedAt: new Date().toISOString(),
    },
    order: 6,
    confidence: 'Alta',
    isDemo: true,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_TABLE_CALLS: TableCall[] = [
  {
    id: 'call_1',
    restaurantId: 'rest_mesavision_demo',
    tableId: 'tbl_01',
    tableCode: 'MESA-01',
    tableName: 'Mesa 1',
    type: 'waiter',
    label: 'Llamar al Camarero',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'call_2',
    restaurantId: 'rest_mesavision_demo',
    tableId: 'tbl_03',
    tableCode: 'TERR-01',
    tableName: 'Terraza 1',
    type: 'check',
    label: 'Pedir la Cuenta',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
];

export const INITIAL_KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: 'order_341',
    restaurantId: 'rest_mesavision_demo',
    tableId: 'tbl_01',
    tableCode: 'MESA-01',
    tableName: 'Mesa 1',
    items: [
      {
        id: 'oi_1',
        dishId: 'dish_01',
        dishName: 'Hamburguesa Trufada Dry-Aged',
        price: 17.50,
        quantity: 1,
        variantName: 'Punto: Al punto, Sin cebolla',
      },
      {
        id: 'oi_2',
        dishId: 'dish_02',
        dishName: 'Carpaccio de Buey con Parmesano',
        price: 14.00,
        quantity: 1,
      },
    ],
    subtotal: 31.50,
    total: 31.50,
    status: 'COOKING',
    orderType: 'DINE_IN',
    notes: 'Servir entrante primero',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    estimatedMinutes: 8,
  },
  {
    id: 'order_342',
    restaurantId: 'rest_mesavision_demo',
    tableId: 'tbl_02',
    tableCode: 'MESA-02',
    tableName: 'Mesa 2',
    items: [
      {
        id: 'oi_3',
        dishId: 'dish_03',
        dishName: 'Salmón Noruego a la Plancha',
        price: 21.00,
        quantity: 2,
        notes: 'Salsa holandesa aparte',
      },
    ],
    subtotal: 42.00,
    total: 42.00,
    status: 'PENDING',
    orderType: 'DINE_IN',
    createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
    estimatedMinutes: 15,
  },
  {
    id: 'order_343',
    restaurantId: 'rest_mesavision_demo',
    tableId: 'tbl_03',
    tableCode: 'TERR-01',
    tableName: 'Terraza 1',
    items: [
      {
        id: 'oi_4',
        dishId: 'dish_04',
        dishName: 'Tagliatelle Caseros con Boletus',
        price: 16.80,
        quantity: 1,
      },
      {
        id: 'oi_5',
        dishId: 'dish_05',
        dishName: 'Coulant de Chocolate Valrhona',
        price: 8.50,
        quantity: 1,
      },
    ],
    subtotal: 25.30,
    total: 25.30,
    status: 'READY',
    orderType: 'DINE_IN',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    estimatedMinutes: 0,
  },
];

export const INITIAL_TABLES: Table[] = [
  {
    id: 'tbl_01',
    restaurantId: 'rest_mesavision_demo',
    name: 'Mesa 1',
    code: 'MESA-01',
    zone: 'Salón Principal',
    capacity: 2,
    qrUrl: '/menu/mesavision-gourmet?mesa=MESA-01',
    nfcPayload: 'https://mesavision.app/menu/mesavision-gourmet?mesa=MESA-01',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tbl_02',
    restaurantId: 'rest_mesavision_demo',
    name: 'Mesa 2',
    code: 'MESA-02',
    zone: 'Salón Principal',
    capacity: 4,
    qrUrl: '/menu/mesavision-gourmet?mesa=MESA-02',
    nfcPayload: 'https://mesavision.app/menu/mesavision-gourmet?mesa=MESA-02',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tbl_03',
    restaurantId: 'rest_mesavision_demo',
    name: 'Terraza 1',
    code: 'TERR-01',
    zone: 'Terraza Exterior',
    capacity: 4,
    qrUrl: '/menu/mesavision-gourmet?mesa=TERR-01',
    nfcPayload: 'https://mesavision.app/menu/mesavision-gourmet?mesa=TERR-01',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tbl_04',
    restaurantId: 'rest_mesavision_demo',
    name: 'Terraza 2',
    code: 'TERR-02',
    zone: 'Terraza Exterior',
    capacity: 6,
    qrUrl: '/menu/mesavision-gourmet?mesa=TERR-02',
    nfcPayload: 'https://mesavision.app/menu/mesavision-gourmet?mesa=TERR-02',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tbl_05',
    restaurantId: 'rest_mesavision_demo',
    name: 'Barra 1',
    code: 'BAR-01',
    zone: 'Barra Coctelería',
    capacity: 2,
    qrUrl: '/menu/mesavision-gourmet?mesa=BAR-01',
    nfcPayload: 'https://mesavision.app/menu/mesavision-gourmet?mesa=BAR-01',
    updatedAt: new Date().toISOString(),
  },
];

// Sample demo PDF text / document for testing Gemini menu parser when user doesn't upload a file
export const SAMPLE_MENU_OCR_TEXT = `
RESTAURANTE EL JARDÍN MEDITERRÁNEO
Carta Temporada Primavera

ENTRADAS & TAPAS
1. Jamón Ibérico de Bellota 100% - 24.00€
Acompañado de pan de cristal con tomate de colgar y aceite virgen extra.
Alérgenos: Gluten.

2. Croquetas Cremosas de Boletus (6 uds) - 12.50€
Con bechamel suave de leche entera fresca y crujiente de panko.
Alérgenos: Gluten, Lácteos, Huevos.

3. Ensalada Burrata Pugliese - 15.00€
Burrata de 250g con tomates cherry asados, pesto genovés de albahaca y piñones tostados.
Ingredientes: Burrata fresca, tomate cherry, albahaca, piñones, parmesano.
Alérgenos: Lácteos, Frutos de cáscara.
Apto para: Vegetariano, Sin Gluten.

PLATOS PRINCIPALES
4. Arroz Meloso con Bogavante - 26.00€ (por persona, mín 2 personas)
Arroz bomba de la Albufera en fondo intenso de marisco con bogavante fresco troceado.
Alérgenos: Crustáceos, Pescado.

5. Solomillo de Vaca Rubia Gallega - 28.00€
Maduración de 30 días, hecho a la brasa de carbón con patatas confitadas al romero.
Alérgenos: ninguno evidente.

6. Lubina Salvaje al Horno - 23.50€
Con lecho de patatas panaderas, cebolla dulce y emulsión bilbaína de ajos y guindilla.
Alérgenos: Pescado.

POSTRES ARTESANOS
7. Tarta de Queso Fluida al Horno - 7.50€
Estilo Donostia con queso crema y toque de Idiazábal ahumado.
Alérgenos: Lácteos, Huevos.

8. Sorbeto de Mandarina al Cava - 6.00€
Refrescante sorbete artesanal con toque cítrico.
Alérgenos: Sulfitos.
`;
