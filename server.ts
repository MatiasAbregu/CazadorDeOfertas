import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ============================================================================
// Simulación Segura de Almacén Cifrado (Safe Token Vault con AES-256-GCM)
// Permite guardar tokens de sesión de apps oficiales que exigen login.
// ============================================================================
const ENCRYPTION_KEY = process.env.VAULT_SECRET_KEY 
  ? crypto.scryptSync(process.env.VAULT_SECRET_KEY, 'salt-cid-2026', 32)
  : crypto.scryptSync('dev-key-secure-cid-9872134', 'salt-cid-2026', 32);

function encryptToken(plainText: string): { iv: string; encryptedData: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    tag
  };
}

interface EncryptedVaultRecord {
  id: string;
  brand: string;
  emailOrUsername: string;
  tokenMasked: string;
  encryptedToken: { iv: string; encryptedData: string; tag: string };
  connectedAt: string;
  expiresInDays: number;
}

const safeVaultDatabase: EncryptedVaultRecord[] = [
  {
    id: 'vault-mcd-01',
    brand: "McDonald's",
    emailOrUsername: 'cliente.mcd@ejemplo.com',
    tokenMasked: 'mcd_auth_••••••••f9a1',
    encryptedToken: encryptToken('mcd_live_bearer_token_super_secret_sample'),
    connectedAt: '2026-11-10',
    expiresInDays: 30
  }
];

// ============================================================================
// Base de Datos Activa de Promociones (Alineada con C# ASP.NET Core & MySQL)
// ============================================================================
let promotionsDatabase = [
  {
    id: 'promo-mcd-01',
    brand: "McDonald's",
    brandColor: '#DA291C',
    title: 'Combo Cuarto de Libra con Queso Doble + Papas Medianas',
    description: 'Doble carne 100% vacuna, doble queso cheddar fundido, cebolla picada, pepinillos y kétchup con papas doradas.',
    category: 'Burgers',
    benefitType: 'FINAL_PRICE',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    originalPrice: 9200,
    promotionalPrice: 5690,
    discountPercentage: 38,
    couponCode: 'MCD-DBL-4LB',
    expirationDate: '2026-11-30',
    restrictions: {
      minimumAmount: 0,
      validDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      schedule: '11:00 a 23:59',
      paymentMethod: 'Any Method',
      requiresApp: true,
      requiresLogin: true,
      finePrint: 'Válido para consumo en mostrador o AutoMac escaneando el cupón desde la App Oficial de McDonald’s Argentina.'
    },
    sourceUrl: 'https://www.mcdonalds.com.ar/app',
    deepLinkApp: 'intent:#Intent;package=com.mcdo.mcdonalds;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.mcdonalds.com.ar;end',
    deduplicationKey: 'mcdonalds_combo_cuarto_de_libra_doble',
    lastVerifiedAt: '2026-11-11 09:15 UTC',
    status: 'ACTIVE',
    metrics: {
      workedCount: 84,
      didNotWorkCount: 5,
      interestCount: 162,
      openCount: 290,
      criticalReportsCount: 0,
      trafficLight: 'GREEN',
      successRate: 94
    },
    recommendationTags: ['#Burgers', '#Combos', '#TopAhorro']
  },
  {
    id: 'promo-bk-01',
    brand: 'Burger King',
    brandColor: '#502314',
    title: '2x1 Whopper Jr Clásica a la Parrilla',
    description: 'Dos Whopper Jr preparadas al momento con carne a la parrilla, lechuga fresca, tomate jugoso y mayonesa al precio de una.',
    category: 'Burgers',
    benefitType: 'BOGO_2X1',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    originalPrice: 8400,
    promotionalPrice: 4200,
    discountPercentage: 50,
    couponCode: 'BK-2X1-WHOPPERJR',
    expirationDate: '2026-11-28',
    restrictions: {
      minimumAmount: 0,
      validDays: ['Lunes', 'Martes', 'Miércoles'],
      schedule: '12:00 a 22:00',
      paymentMethod: 'Any Method',
      requiresApp: true,
      requiresLogin: false,
      finePrint: 'Beneficio 2x1 canjeable exclusivamente presentando el código desde la App Oficial de Burger King Argentina.'
    },
    sourceUrl: 'https://www.burgerking.com.ar',
    deepLinkApp: 'intent:#Intent;package=ar.burgerking;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.burgerking.com.ar;end',
    deduplicationKey: 'burger_king_2x1_whopper_jr_clasica',
    lastVerifiedAt: '2026-11-11 08:40 UTC',
    status: 'ACTIVE',
    metrics: {
      workedCount: 128,
      didNotWorkCount: 7,
      interestCount: 240,
      openCount: 410,
      criticalReportsCount: 1,
      trafficLight: 'GREEN',
      successRate: 95
    },
    recommendationTags: ['#Burgers', '#2x1', '#Parrilla']
  },
  {
    id: 'promo-mos-01',
    brand: 'Mostaza',
    brandColor: '#C41230',
    title: 'Mega Cuarto XL Simple + Papas Rústicas + Gaseosa 500ml',
    description: 'Hamburguesa con pan de papa artesanal esponjoso, medallón gigante de carne 100% vacuna, cheddar y salsa Mostaza.',
    category: 'Combos',
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    benefitType: 'FINAL_PRICE',
    originalPrice: 9800,
    promotionalPrice: 6490,
    discountPercentage: 34,
    couponCode: 'MOS-MEGA-XL64',
    expirationDate: '2026-12-05',
    restrictions: {
      minimumAmount: 0,
      validDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      schedule: 'Todo el día',
      paymentMethod: 'Mercado Pago',
      requiresApp: true,
      requiresLogin: false,
      finePrint: 'Exclusivo abonando mediante QR de Mercado Pago o cupón oficial de la app Mostaza en locales adheridos.'
    },
    sourceUrl: 'https://www.mostazaweb.com.ar',
    deepLinkApp: 'intent:#Intent;package=com.candoit.mostaza;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.mostazaweb.com.ar;end',
    deduplicationKey: 'mostaza_mega_cuarto_xl_simple_combo',
    lastVerifiedAt: '2026-11-11 10:00 UTC',
    status: 'ACTIVE',
    metrics: {
      workedCount: 73,
      didNotWorkCount: 9,
      interestCount: 130,
      openCount: 220,
      criticalReportsCount: 0,
      trafficLight: 'GREEN',
      successRate: 89
    },
    recommendationTags: ['#Combos', '#MercadoPago', '#MegaCarne']
  },
  {
    id: 'promo-bk-02',
    brand: 'Burger King',
    brandColor: '#502314',
    title: 'Balde de King Nuggets x 20 + 2 Salsas Barbacoa',
    description: '20 bocaditos crujientes de pechuga de pollo rebozada con dip de barbacoa ahumada y salsa agridulce.',
    category: 'Chicken',
    benefitType: 'PERCENTAGE_DISCOUNT',
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    originalPrice: 7600,
    promotionalPrice: 4940,
    discountPercentage: 35,
    couponCode: 'BK-NUGGETS-20X',
    expirationDate: '2026-11-25',
    restrictions: {
      minimumAmount: 0,
      validDays: ['Jueves', 'Viernes', 'Sábado', 'Domingo'],
      schedule: '15:00 a 20:00',
      paymentMethod: 'Any Method',
      requiresApp: true,
      requiresLogin: false,
      finePrint: 'Válido en sucursales físicas de todo el país. No acumulable con envíos de plataformas terceras.'
    },
    sourceUrl: 'https://www.burgerking.com.ar',
    deepLinkApp: 'intent:#Intent;package=ar.burgerking;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.burgerking.com.ar;end',
    deduplicationKey: 'burger_king_balde_king_nuggets_20',
    lastVerifiedAt: '2026-11-11 08:42 UTC',
    status: 'ACTIVE',
    metrics: {
      workedCount: 51,
      didNotWorkCount: 4,
      interestCount: 95,
      openCount: 160,
      criticalReportsCount: 0,
      trafficLight: 'GREEN',
      successRate: 93
    },
    recommendationTags: ['#Chicken', '#Snacks', '#ParaCompartir']
  },
  {
    id: 'promo-mcd-02',
    brand: "McDonald's",
    brandColor: '#DA291C',
    title: 'McFlurry Oreo o KitKat Dulce de Leche',
    description: 'Helado suave de vainilla combinado con crocantes galletitas Oreo trituradas o KitKat bañado en dulce de leche.',
    category: 'Desserts',
    benefitType: 'PERCENTAGE_DISCOUNT',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    originalPrice: 4800,
    promotionalPrice: 2880,
    discountPercentage: 40,
    couponCode: 'MCD-MCFLURRY-40',
    expirationDate: '2026-11-20',
    restrictions: {
      minimumAmount: 0,
      validDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      schedule: '14:00 a 19:00',
      paymentMethod: 'Any Method',
      requiresApp: true,
      requiresLogin: true,
      finePrint: 'Tope de 2 unidades por transacción. Cupón canjeable una única vez por cuenta registrada en la app.'
    },
    sourceUrl: 'https://www.mcdonalds.com.ar/app',
    deepLinkApp: 'intent:#Intent;package=com.mcdo.mcdonalds;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.mcdonalds.com.ar;end',
    deduplicationKey: 'mcdonalds_mcflurry_oreo_kitkat_descuento',
    lastVerifiedAt: '2026-11-11 09:18 UTC',
    status: 'ACTIVE',
    metrics: {
      workedCount: 110,
      didNotWorkCount: 12,
      interestCount: 195,
      openCount: 310,
      criticalReportsCount: 1,
      trafficLight: 'GREEN',
      successRate: 90
    },
    recommendationTags: ['#Desserts', '#Sweet', '#Merienda']
  },
  {
    id: 'promo-mos-02',
    brand: 'Mostaza',
    brandColor: '#C41230',
    title: 'Papas Rústicas Cheddar & Bacon Mega Grandes',
    description: 'Papas cortadas rústicas crocantes bañadas en salsa de queso cheddar caliente y panceta ahumada crujiente.',
    category: 'Fries',
    benefitType: 'FINAL_PRICE',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    originalPrice: 6200,
    promotionalPrice: 3890,
    discountPercentage: 37,
    couponCode: 'MOS-PAPAS-BACON',
    expirationDate: '2026-12-01',
    restrictions: {
      minimumAmount: 0,
      validDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      schedule: 'Todo el día',
      paymentMethod: 'Any Method',
      requiresApp: true,
      requiresLogin: false,
      finePrint: 'Disponible en todos los locales de Mostaza presentando el código de la app.'
    },
    sourceUrl: 'https://www.mostazaweb.com.ar',
    deepLinkApp: 'intent:#Intent;package=com.candoit.mostaza;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.mostazaweb.com.ar;end',
    deduplicationKey: 'mostaza_papas_cheddar_bacon_mega',
    lastVerifiedAt: '2026-11-11 10:05 UTC',
    status: 'ACTIVE',
    metrics: {
      workedCount: 64,
      didNotWorkCount: 6,
      interestCount: 112,
      openCount: 190,
      criticalReportsCount: 0,
      trafficLight: 'GREEN',
      successRate: 91
    },
    recommendationTags: ['#Fries', '#Cheddar', '#Bacon']
  },
  {
    id: 'promo-bk-03',
    brand: 'Burger King',
    brandColor: '#502314',
    title: 'Stacker Cuádruple con Salsa Stacker + Papas King',
    description: 'Cuatro medallones de carne vacuna a la parrilla, cuatro capas de queso cheddar y crocante panceta ahumada con salsa secreta.',
    category: 'Burgers',
    benefitType: 'FINAL_PRICE',
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    originalPrice: 11200,
    promotionalPrice: 7900,
    discountPercentage: 30,
    couponCode: 'BK-STACKER-4X',
    expirationDate: '2026-11-22',
    restrictions: {
      minimumAmount: 0,
      validDays: ['Viernes', 'Sábado', 'Domingo'],
      schedule: '19:00 a 02:00',
      paymentMethod: 'Credit/Debit Card',
      requiresApp: true,
      requiresLogin: false,
      finePrint: 'Exclusivo para días de fin de semana en compras nocturnas abonando con tarjeta.'
    },
    sourceUrl: 'https://www.burgerking.com.ar',
    deepLinkApp: 'intent:#Intent;package=ar.burgerking;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.burgerking.com.ar;end',
    deduplicationKey: 'burger_king_stacker_cuadruple_combo',
    lastVerifiedAt: '2026-11-11 08:45 UTC',
    status: 'ACTIVE',
    metrics: {
      workedCount: 38,
      didNotWorkCount: 12,
      interestCount: 88,
      openCount: 145,
      criticalReportsCount: 2,
      trafficLight: 'YELLOW',
      successRate: 76
    },
    recommendationTags: ['#Burgers', '#Stacker', '#NightPromo']
  },
  {
    id: 'promo-mcd-03',
    brand: "McDonald's",
    brandColor: '#DA291C',
    title: 'Desayuno Toast + Café Latte Mediano 300ml',
    description: 'Tostado de jamón cocido y queso derretido en pan de molde tostado acompañado de café con leche recién preparado.',
    category: 'Combos',
    benefitType: 'FINAL_PRICE',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    originalPrice: 4900,
    promotionalPrice: 2990,
    discountPercentage: 39,
    couponCode: 'MCD-BREAKFAST-39',
    expirationDate: '2026-11-30',
    restrictions: {
      minimumAmount: 0,
      validDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      schedule: '07:00 a 11:30',
      paymentMethod: 'Any Method',
      requiresApp: true,
      requiresLogin: false,
      finePrint: 'Válido durante el horario de desayuno de McCafé y mostrador en locales participantes.'
    },
    sourceUrl: 'https://www.mcdonalds.com.ar/app',
    deepLinkApp: 'intent:#Intent;package=com.mcdo.mcdonalds;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.mcdonalds.com.ar;end',
    deduplicationKey: 'mcdonalds_desayuno_toast_cafe_latte',
    lastVerifiedAt: '2026-11-11 09:20 UTC',
    status: 'ACTIVE',
    metrics: {
      workedCount: 42,
      didNotWorkCount: 3,
      interestCount: 71,
      openCount: 110,
      criticalReportsCount: 0,
      trafficLight: 'GREEN',
      successRate: 93
    },
    recommendationTags: ['#Breakfast', '#Coffee', '#Toast']
  }
];

function recalculateTrafficLight(promo: any) {
  const total = promo.metrics.workedCount + promo.metrics.didNotWorkCount;
  const rate = total === 0 ? 100 : Math.round((promo.metrics.workedCount / total) * 100);
  promo.metrics.successRate = rate;

  if (promo.metrics.criticalReportsCount >= 3 || rate < 50) {
    promo.metrics.trafficLight = 'RED';
    if (promo.metrics.criticalReportsCount >= 3) {
      promo.status = 'HIDDEN_BY_REPORTS';
    }
  } else if (promo.metrics.criticalReportsCount >= 2 || rate < 80) {
    promo.metrics.trafficLight = 'YELLOW';
  } else {
    promo.metrics.trafficLight = 'GREEN';
  }
}

// ----------------------------------------------------------------------------
// REST API Endpoints (Mapean a la arquitectura C# ASP.NET Core PromotionsController)
// ----------------------------------------------------------------------------

// 1. GET /api/promotions
app.get('/api/promotions', (req: Request, res: Response) => {
  const { brand, category, search, paymentMethod, includeHidden } = req.query;

  let list = [...promotionsDatabase];

  if (includeHidden !== 'true') {
    list = list.filter(p => p.status === 'ACTIVE');
  }

  if (brand && brand !== 'ALL') {
    list = list.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }

  if (category && category !== 'ALL') {
    list = list.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.couponCode && p.couponCode.toLowerCase().includes(q))
    );
  }

  if (paymentMethod && paymentMethod !== 'ALL') {
    list = list.filter(p => p.restrictions.paymentMethod === paymentMethod);
  }

  res.json({
    total: list.length,
    items: list
  });
});

// 2. POST /api/promotions/:id/feedback
app.post('/api/promotions/:id/feedback', (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.body; // 'WORKED' | 'DID_NOT_WORK' | 'INTEREST'

  const promo = promotionsDatabase.find(p => p.id === id);
  if (!promo) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  if (type === 'WORKED') {
    promo.metrics.workedCount++;
  } else if (type === 'DID_NOT_WORK') {
    promo.metrics.didNotWorkCount++;
  } else if (type === 'INTEREST') {
    promo.metrics.interestCount++;
  } else {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  recalculateTrafficLight(promo);

  res.json({
    id: promo.id,
    metrics: promo.metrics,
    status: promo.status
  });
});

// 3. POST /api/promotions/:id/report
app.post('/api/promotions/:id/report', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, details } = req.body;

  const promo = promotionsDatabase.find(p => p.id === id);
  if (!promo) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  promo.metrics.criticalReportsCount++;

  if (promo.metrics.criticalReportsCount >= 3) {
    promo.status = 'HIDDEN_BY_REPORTS';
    promo.metrics.trafficLight = 'RED';
  } else {
    recalculateTrafficLight(promo);
  }

  res.json({
    success: true,
    message: 'Report received and processed',
    status: promo.status,
    criticalReportsCount: promo.metrics.criticalReportsCount
  });
});

// 4. POST /api/promotions/:id/claim
app.post('/api/promotions/:id/claim', (req: Request, res: Response) => {
  const { id } = req.params;
  const promo = promotionsDatabase.find(p => p.id === id);
  if (!promo) return res.status(404).json({ error: 'Promotion not found' });

  promo.metrics.openCount++;
  res.json({
    id: promo.id,
    openCount: promo.metrics.openCount
  });
});

// 5. GET & POST /api/vault/credentials (Bóveda Segura de Tokens Cifrados)
app.get('/api/vault/credentials', (_req: Request, res: Response) => {
  // Retornar lista de credenciales con tokens enmascarados (nunca exponer datos planos)
  const safeList = safeVaultDatabase.map(v => ({
    id: v.id,
    brand: v.brand,
    emailOrUsername: v.emailOrUsername,
    tokenMasked: v.tokenMasked,
    connectedAt: v.connectedAt,
    expiresInDays: v.expiresInDays
  }));
  res.json({ items: safeList });
});

app.post('/api/vault/credentials', (req: Request, res: Response) => {
  const { brand, emailOrUsername, token } = req.body;
  if (!brand || !emailOrUsername || !token) {
    return res.status(400).json({ error: 'brand, emailOrUsername and token are required' });
  }

  const masked = token.length > 8 
    ? `${token.slice(0, 4)}••••••••${token.slice(-4)}` 
    : '••••••••••••';

  const encrypted = encryptToken(token);

  const existingIndex = safeVaultDatabase.findIndex(v => v.brand === brand);
  const newRecord: EncryptedVaultRecord = {
    id: 'vault-' + Date.now(),
    brand,
    emailOrUsername,
    tokenMasked: masked,
    encryptedToken: encrypted,
    connectedAt: new Date().toISOString().substring(0, 10),
    expiresInDays: 30
  };

  if (existingIndex >= 0) {
    safeVaultDatabase[existingIndex] = newRecord;
  } else {
    safeVaultDatabase.push(newRecord);
  }

  res.json({
    success: true,
    message: `Secure encrypted credentials saved for ${brand}`,
    credential: {
      brand: newRecord.brand,
      emailOrUsername: newRecord.emailOrUsername,
      tokenMasked: newRecord.tokenMasked,
      connectedAt: newRecord.connectedAt
    }
  });
});

// ----------------------------------------------------------------------------
// Servidor Vite / Estático
// ----------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Centralizador de Descuentos backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
