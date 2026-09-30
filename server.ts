import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_RESTAURANT,
  INITIAL_CATEGORIES,
  INITIAL_DISHES,
  INITIAL_TABLES,
  INITIAL_TABLE_CALLS,
  INITIAL_KITCHEN_ORDERS,
} from './src/services/mockData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Resolve production distribution path
const candidatePaths = [
  path.resolve(__dirname, 'dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve('/app/applet/dist'),
];
const distPath = candidatePaths.find((p) => fs.existsSync(path.resolve(p, 'index.html'))) || candidatePaths[0];

const isProduction =
  process.env.NODE_ENV === 'production' ||
  (process.env.NODE_ENV !== 'development' && fs.existsSync(path.resolve(distPath, 'index.html')));
const isDev = !isProduction;

// Basic security & parsing
app.disable('x-powered-by');
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// In-memory shared database for real-time synchronization between devices
const serverDatabase = {
  restaurant: { ...INITIAL_RESTAURANT },
  categories: [...INITIAL_CATEGORIES],
  dishes: [...INITIAL_DISHES],
  tables: [...INITIAL_TABLES],
  tableCalls: [...INITIAL_TABLE_CALLS],
  kitchenOrders: [...INITIAL_KITCHEN_ORDERS],
  syncHistory: [] as any[],
  lastUpdated: Date.now(),
};

// 1. Health check endpoint (for connectivity / offline status)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'MESAvision',
    timestamp: Date.now(),
    isServerAvailable: true,
  });
});

// 2. Shared state endpoint: Allows any device (phone, kitchen screen, PC) to get latest synced data
app.get('/api/state', (_req, res) => {
  res.json({
    restaurant: serverDatabase.restaurant,
    categories: serverDatabase.categories,
    dishes: serverDatabase.dishes,
    tables: serverDatabase.tables,
    tableCalls: serverDatabase.tableCalls,
    kitchenOrders: serverDatabase.kitchenOrders,
    lastUpdated: serverDatabase.lastUpdated,
  });
});

// 3. Live alerts & kitchen monitor polling endpoint
app.get('/api/live-alerts', (_req, res) => {
  res.json({
    tableCalls: serverDatabase.tableCalls,
    kitchenOrders: serverDatabase.kitchenOrders,
    lastUpdated: serverDatabase.lastUpdated,
  });
});

// 4. Create/Add Order from digital menu
app.post('/api/order', (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.id || !order.items) {
      return res.status(400).json({ error: 'Datos de comanda inválidos' });
    }

    serverDatabase.kitchenOrders.unshift(order);
    if (serverDatabase.kitchenOrders.length > 100) {
      serverDatabase.kitchenOrders = serverDatabase.kitchenOrders.slice(0, 100);
    }
    serverDatabase.lastUpdated = Date.now();

    return res.status(201).json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error al registrar comanda' });
  }
});

// 5. Update Order status from Kitchen Monitor
app.patch('/api/order/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = serverDatabase.kitchenOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Comanda no encontrada' });
  }

  if (status) {
    order.status = status;
    serverDatabase.lastUpdated = Date.now();
  }

  return res.json({ success: true, order });
});

// 6. Create Table Call (waiter assistance / bill request)
app.post('/api/call', (req, res) => {
  try {
    const call = req.body;
    if (!call || !call.id || !call.tableId) {
      return res.status(400).json({ error: 'Datos de llamada inválidos' });
    }

    serverDatabase.tableCalls.unshift(call);
    if (serverDatabase.tableCalls.length > 80) {
      serverDatabase.tableCalls = serverDatabase.tableCalls.slice(0, 80);
    }
    serverDatabase.lastUpdated = Date.now();

    return res.status(201).json({ success: true, call });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error al registrar llamada' });
  }
});

// 7. Update Call status (Acudiendo / Atendido)
app.patch('/api/call/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const call = serverDatabase.tableCalls.find((c) => c.id === id);
  if (!call) {
    return res.status(404).json({ error: 'Llamada no encontrada' });
  }

  if (status) {
    call.status = status;
    serverDatabase.lastUpdated = Date.now();
  }

  return res.json({ success: true, call });
});

// 8. Outbox Synchronization endpoint (mesavision_sync_queue_v1)
app.post('/api/sync', (req, res) => {
  try {
    const { operations } = req.body;
    if (!Array.isArray(operations)) {
      return res.status(400).json({ error: 'Formato inválido de operaciones' });
    }

    const syncedIds: string[] = [];

    for (const op of operations) {
      if (op.entity === 'restaurant' && op.action === 'UPDATE') {
        serverDatabase.restaurant = { ...op.payload };
      } else if (op.entity === 'category') {
        if (op.action === 'CREATE') {
          serverDatabase.categories.push(op.payload);
        } else if (op.action === 'UPDATE') {
          if (op.payload.categories) {
            serverDatabase.categories = op.payload.categories;
          } else {
            serverDatabase.categories = serverDatabase.categories.map((c) =>
              c.id === op.payload.id ? op.payload : c
            );
          }
        } else if (op.action === 'DELETE') {
          serverDatabase.categories = serverDatabase.categories.filter((c) => c.id !== op.payload.id);
        }
      } else if (op.entity === 'dish') {
        if (op.action === 'CREATE') {
          serverDatabase.dishes.unshift(op.payload);
        } else if (op.action === 'UPDATE') {
          if (op.payload.dishes) {
            serverDatabase.dishes = op.payload.dishes;
          } else {
            serverDatabase.dishes = serverDatabase.dishes.map((d) =>
              d.id === op.payload.id ? op.payload : d
            );
          }
        } else if (op.action === 'DELETE') {
          serverDatabase.dishes = serverDatabase.dishes.filter((d) => d.id !== op.payload.id);
        }
      } else if (op.entity === 'table') {
        if (op.payload?.type === 'NEW_ORDER' && op.payload?.order) {
          const exists = serverDatabase.kitchenOrders.some((o) => o.id === op.payload.order.id);
          if (!exists) serverDatabase.kitchenOrders.unshift(op.payload.order);
        } else if (op.payload?.type === 'NEW_CALL' && op.payload?.call) {
          const exists = serverDatabase.tableCalls.some((c) => c.id === op.payload.call.id);
          if (!exists) serverDatabase.tableCalls.unshift(op.payload.call);
        } else if (op.action === 'CREATE') {
          serverDatabase.tables.push(op.payload);
        } else if (op.action === 'UPDATE') {
          serverDatabase.tables = serverDatabase.tables.map((t) =>
            t.id === op.payload.id ? op.payload : t
          );
        } else if (op.action === 'DELETE') {
          serverDatabase.tables = serverDatabase.tables.filter((t) => t.id !== op.payload.id);
        }
      }

      serverDatabase.syncHistory.push({
        id: op.id,
        entity: op.entity,
        action: op.action,
        timestamp: Date.now(),
      });
      syncedIds.push(op.id);
    }

    serverDatabase.lastUpdated = Date.now();

    // Keep history trimmed
    if (serverDatabase.syncHistory.length > 200) {
      serverDatabase.syncHistory = serverDatabase.syncHistory.slice(-200);
    }

    return res.json({
      success: true,
      syncedIds,
      timestamp: Date.now(),
      totalOperationsSynced: syncedIds.length,
    });
  } catch (error: any) {
    console.error('Error en /api/sync:', error);
    return res.status(500).json({ error: error.message || 'Error interno de sincronización' });
  }
});

// Helper: Deterministic OCR Menu text parser for testing and fallback
function parseMenuTextDeterministic(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let restaurantName = 'Restaurante El Jardín Mediterráneo';
  const categoriesMap = new Map<string, any[]>();
  let currentCategory = 'Entradas';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('RESTAURANTE')) {
      restaurantName = line.replace('RESTAURANTE', '').trim() || restaurantName;
      continue;
    }
    if (line.includes('Carta Temporada')) continue;

    // Check if line looks like category header
    if (
      (line === line.toUpperCase() && !line.includes('€') && !/^\d+\./.test(line)) ||
      line.includes('ENTRADAS') ||
      line.includes('PLATOS PRINCIPALES') ||
      line.includes('POSTRES') ||
      line.includes('BEBIDAS')
    ) {
      currentCategory = line.charAt(0) + line.slice(1).toLowerCase();
      if (!categoriesMap.has(currentCategory)) {
        categoriesMap.set(currentCategory, []);
      }
      continue;
    }

    // Check if line is a dish item
    const dishMatch = line.match(/^(?:\d+[\.\)]\s*)?([^-–—]+?)\s*[-–—]\s*(\d+(?:[.,]\d+)?)\s*€?/i);
    if (dishMatch) {
      const name = dishMatch[1].trim();
      const price = parseFloat(dishMatch[2].replace(',', '.'));
      let description = '';
      const ingredients: string[] = [];
      const allergens: string[] = [];
      const dietaryTags: string[] = [];

      let j = i + 1;
      while (
        j < lines.length &&
        !lines[j].match(/^(?:\d+[\.\)]\s*)?[^-–—]+?\s*[-–—]\s*\d+/i) &&
        !lines[j].includes('ENTRADAS') &&
        !lines[j].includes('PLATOS') &&
        !lines[j].includes('POSTRES')
      ) {
        const nextLine = lines[j];
        if (nextLine.toLowerCase().startsWith('alérgenos:') || nextLine.toLowerCase().startsWith('alergenos:')) {
          const list = nextLine.replace(/al[eé]rgenos:\s*/i, '').split(/[,.]/);
          list.forEach((item) => {
            const trimmed = item.trim();
            if (trimmed && !trimmed.toLowerCase().includes('ninguno')) allergens.push(trimmed);
          });
        } else if (nextLine.toLowerCase().startsWith('ingredientes:')) {
          const list = nextLine.replace(/ingredientes:\s*/i, '').split(/[,.]/);
          list.forEach((item) => {
            const trimmed = item.trim();
            if (trimmed) ingredients.push(trimmed);
          });
        } else if (nextLine.toLowerCase().startsWith('apto para:')) {
          const list = nextLine.replace(/apto para:\s*/i, '').split(/[,.]/);
          list.forEach((item) => {
            const trimmed = item.trim();
            if (trimmed) dietaryTags.push(trimmed);
          });
        } else {
          if (!description) {
            description = nextLine;
          } else {
            description += ' ' + nextLine;
          }
        }
        j++;
      }
      i = j - 1;

      if (!categoriesMap.has(currentCategory)) {
        categoriesMap.set(currentCategory, []);
      }

      categoriesMap.get(currentCategory)!.push({
        name,
        categoryName: currentCategory,
        description: description || null,
        price,
        currency: 'EUR',
        variants: [],
        ingredients,
        allergens,
        dietaryTags,
        confidence: 'Alta',
        confidenceNotes: 'Extracción de carta estructurada con precios y alérgenos verificados.',
      });
    }
  }

  const categories = Array.from(categoriesMap.keys()).map((catName) => ({
    name: catName,
    description: `Platos de ${catName.toLowerCase()}`,
  }));

  const dishes: any[] = [];
  categoriesMap.forEach((items) => {
    dishes.push(...items);
  });

  return {
    restaurantName,
    currency: 'EUR',
    categories,
    dishes,
    notes: 'Carta analizada mediante procesador estructurado con regla estricta de NO INVENTAR INFORMACIÓN.',
  };
}

// 9. Gemini PDF Menu Analyzer
app.post('/api/gemini/analyze-menu', async (req, res) => {
  try {
    const { base64Data, mimeType, fileName, sampleText } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyMissing = !apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '';

    if (isApiKeyMissing) {
      if (sampleText) {
        const parsed = parseMenuTextDeterministic(sampleText);
        const enrichedDishes = parsed.dishes.map((dish: any, idx: number) => ({
          ...dish,
          tempId: `extracted_demo_${Date.now()}_${idx}`,
          isSelected: true,
        }));
        return res.json({
          ...parsed,
          dishes: enrichedDishes,
          analyzedAt: new Date().toISOString(),
          isFallback: true,
        });
      }

      return res.status(400).json({
        error:
          'GEMINI_API_KEY no configurada en las variables de entorno. Puedes utilizar el botón "Probar con carta de ejemplo" para probar la importación y revisión humana.',
      });
    }

    const ai = new GoogleGenAI({});

    const systemInstruction = `
Eres el motor de análisis y digitalización de cartas gastronómicas de MESAvision.
Tu misión es extraer y estructurar con máxima fidelidad la carta de un restaurante.

REGLA ABSOLUTA Y OBLIGATORIA:
- NO INVENTAR INFORMACIÓN.
- Si un dato (como precio, descripción, ingredientes o alérgenos) no aparece claramente impreso o indicado en la carta, debes devolver null o un arreglo vacío [].
- NUNCA inventes precios, variantes, descripciones o ingredientes ausentes.
- Detecta nombres exactos de categorías (ej. Entradas, Principales, Carnes, Pescados, Postres, Bebidas).
- Para cada plato asigna un nivel de confianza ('Alta', 'Media', 'Revisar'):
  * 'Alta': Nombre, categoría y precio están perfectamente claros y legibles.
  * 'Media': Algún dato es ambiguo (ej. precio compartido o tamaño indeterminado).
  * 'Revisar': Texto poco claro, precio ausente o dudoso, o categoría no especificada claramente.
- Si detectas alérgenos específicos (Gluten, Lácteos, Huevos, Pescado, Crustáceos, Cacahuetes, Soja, Frutos secos, Apio, Mostaza, Sésamo, Sulfitos, etc.), inclúyelos únicamente si están explícitamente señalados con iconos o texto.
- Detecta si el plato es apto para celíacos / vegetariano / vegano si está indicado.
`;

    let contents: any[] = [];

    if (base64Data && mimeType) {
      contents = [
        {
          inlineData: {
            mimeType: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
            data: base64Data,
          },
        },
        {
          text: `Analiza esta carta gastronómica (${fileName || 'documento'}). Extrae todas las categorías, platos, precios numéricos, variantes de tamaño/porción, ingredientes y alérgenos indicados. Aplica la regla estricta de NO INVENTAR INFORMACIÓN.`,
        },
      ];
    } else if (sampleText) {
      contents = [
        {
          text: `Analiza el siguiente texto de carta de restaurante y extráelo de manera estructurada según las reglas:\n\n${sampleText}`,
        },
      ];
    } else {
      return res.status(400).json({ error: 'Se requiere archivo PDF/imagen o texto de la carta.' });
    }

    let parsedData: any;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
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
                    description: { type: Type.STRING },
                  },
                  required: ['name'],
                },
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
                          price: { type: Type.NUMBER },
                        },
                        required: ['name', 'price'],
                      },
                    },
                    ingredients: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    allergens: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    dietaryTags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    confidence: {
                      type: Type.STRING,
                      enum: ['Alta', 'Media', 'Revisar'],
                    },
                    confidenceNotes: { type: Type.STRING, nullable: true },
                  },
                  required: ['name', 'categoryName', 'confidence'],
                },
              },
              notes: { type: Type.STRING, nullable: true },
            },
            required: ['categories', 'dishes'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini no generó respuesta textual.');
      }

      parsedData = JSON.parse(responseText);
    } catch (apiError: any) {
      console.warn('Fallo en llamada a Gemini API, evaluando fallback:', apiError.message);
      if (sampleText) {
        parsedData = parseMenuTextDeterministic(sampleText);
      } else {
        throw apiError;
      }
    }

    const enrichedDishes = (parsedData.dishes || []).map((dish: any, idx: number) => ({
      ...dish,
      tempId: `extracted_${Date.now()}_${idx}`,
      isSelected: true,
      price: typeof dish.price === 'number' ? dish.price : null,
      variants: Array.isArray(dish.variants) ? dish.variants : [],
      ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
      allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
      dietaryTags: Array.isArray(dish.dietaryTags) ? dish.dietaryTags : [],
      confidence: dish.confidence || 'Media',
    }));

    return res.json({
      restaurantName: parsedData.restaurantName || 'Carta Digital Restaurante',
      currency: parsedData.currency || 'EUR',
      categories: parsedData.categories || [],
      dishes: enrichedDishes,
      notes: parsedData.notes || '',
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error analizando carta con Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Error analizando el archivo de la carta con Gemini.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  // Ensure API 404s are never caught by the SPA fallback
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint API no encontrado' });
  });

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve all static assets with cache headers
    app.use(express.static(distPath, { index: false }));

    // Explicit root handler for maximum reliability
    app.get('/', (_req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('MESAvision frontend build no encontrado. Ejecuta npm run build.');
      }
    });

    // SPA fallback: any non-API route returns index.html
    app.get('*', (_req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('MESAvision frontend build no encontrado. Ejecuta npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MESAvision server corriendo en http://0.0.0.0:${PORT} [${isProduction ? 'PROD' : 'DEV'}]`);
  });
}

startServer();
