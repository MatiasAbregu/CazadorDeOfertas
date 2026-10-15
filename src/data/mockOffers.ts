export interface OfferItem {
  id: string;
  brand: 'McDonald\'s' | 'Burger King' | 'Mostaza';
  brandColor: string;
  brandLogo: string;
  title: string;
  category: 'Hamburguesas' | 'Combos' | 'Postres' | 'Vegetariano';
  originalPrice: number;
  promoPrice: number;
  discountPercentage: number;
  code?: string;
  expirationDate: string;
  expirationText: string;
  conditions: string[];
  requiresApp: boolean;
  requiresAccount: boolean;
  paymentMethods: string[];
  sourceUrl: string;
  lastVerified: string;
  validityScore: number; // 0 to 1
  validityState: 'VERIFIED' | 'REVIEW' | 'WARNING';
  positiveVotes: number;
  negativeVotes: number;
  recommendationTag?: string;
}

export const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'mcd-01',
    brand: 'McDonald\'s',
    brandColor: '#DA291C',
    brandLogo: '🍟',
    title: 'Combo Cuarto de Libra Mediano + Sundae',
    category: 'Combos',
    originalPrice: 8500,
    promoPrice: 5100,
    discountPercentage: 40,
    code: 'MCDCUARTO40',
    expirationDate: '2026-10-31',
    expirationText: 'Válido hasta el 31 de Octubre',
    conditions: [
      'Exclusivo presentando código en mostrador o AutoMac',
      'No acumulable con otras promociones ni en horario de desayuno',
      'Válido en sucursales adheridas del país'
    ],
    requiresApp: true,
    requiresAccount: true,
    paymentMethods: ['Efectivo', 'Mercado Pago', 'Tarjetas de Débito/Crédito'],
    sourceUrl: 'https://www.mcdonalds.com.ar/cupones',
    lastVerified: 'Hoy a las 09:30 hs (vía LLM Parser)',
    validityScore: 0.94,
    validityState: 'VERIFIED',
    positiveVotes: 48,
    negativeVotes: 3,
    recommendationTag: 'Coincide con tu preferencia por #Combos',
  },
  {
    id: 'bk-01',
    brand: 'Burger King',
    brandColor: '#D62300',
    brandLogo: '👑',
    title: '2x1 Whopper Jr. con Queso y Papas Regulares',
    category: 'Hamburguesas',
    originalPrice: 7900,
    promoPrice: 3950,
    discountPercentage: 50,
    code: 'BKWHOPPER2X1',
    expirationDate: '2026-10-25',
    expirationText: 'Válido hasta el 25 de Octubre',
    conditions: [
      'Canjeable en sucursales físicas y pedido web oficial',
      'Máximo 2 cupones por ticket de compra',
      'No incluye bebidas grandes'
    ],
    requiresApp: false,
    requiresAccount: false,
    paymentMethods: ['Efectivo', 'MODO', 'Tarjetas Bancarias'],
    sourceUrl: 'https://www.burgerking.com.ar/cuponera',
    lastVerified: 'Hoy a las 08:45 hs (vía OCR flyer)',
    validityScore: 0.88,
    validityState: 'VERIFIED',
    positiveVotes: 35,
    negativeVotes: 5,
    recommendationTag: 'Coincide con tu preferencia por #Hamburguesas',
  },
  {
    id: 'mos-01',
    brand: 'Mostaza',
    brandColor: '#E4002B',
    brandLogo: '🍔',
    title: 'Mega Cuádruple XL + Papas Rústicas con Cheddar',
    category: 'Hamburguesas',
    originalPrice: 9900,
    promoPrice: 6930,
    discountPercentage: 30,
    code: 'MEGAMOSTAZA30',
    expirationDate: '2026-11-05',
    expirationText: 'Válido hasta el 05 de Noviembre',
    conditions: [
      'Válido en compras presenciales y mostrador',
      'Aplica los días lunes, miércoles y jueves',
      'Sujeto a disponibilidad de stock de papas rústicas'
    ],
    requiresApp: false,
    requiresAccount: false,
    paymentMethods: ['Efectivo', 'Mercado Pago', 'Tarjetas de Crédito'],
    sourceUrl: 'https://www.mostazaweb.com.ar/promociones',
    lastVerified: 'Ayer a las 18:20 hs (vía Web Scraper)',
    validityScore: 0.91,
    validityState: 'VERIFIED',
    positiveVotes: 29,
    negativeVotes: 2,
    recommendationTag: 'Coincide con tu preferencia por #Hamburguesas',
  },
  {
    id: 'mcd-02',
    brand: 'McDonald\'s',
    brandColor: '#DA291C',
    brandLogo: '🍟',
    title: '2 McFlurry Oreo con 40% OFF en la 2da unidad',
    category: 'Postres',
    originalPrice: 6200,
    promoPrice: 4960,
    discountPercentage: 20,
    code: 'MCFLURRYDUO',
    expirationDate: '2026-10-20',
    expirationText: 'Válido hasta el 20 de Octubre',
    conditions: [
      'Válido exclusivamente mediante código en la App oficial de McDonald\'s',
      'No combinable con otros sabores especiales'
    ],
    requiresApp: true,
    requiresAccount: true,
    paymentMethods: ['Mercado Pago', 'Tarjetas Débito/Crédito'],
    sourceUrl: 'https://www.mcdonalds.com.ar/promociones',
    lastVerified: 'Hoy a las 11:15 hs (vía LLM Parser)',
    validityScore: 0.85,
    validityState: 'VERIFIED',
    positiveVotes: 19,
    negativeVotes: 3,
    recommendationTag: 'Coincide con tu preferencia por #Postres',
  },
  {
    id: 'bk-02',
    brand: 'Burger King',
    brandColor: '#D62300',
    brandLogo: '👑',
    title: 'King Vegetariano Whopper + Bebida Mediana',
    category: 'Vegetariano',
    originalPrice: 7200,
    promoPrice: 4680,
    discountPercentage: 35,
    code: 'BKVEG35',
    expirationDate: '2026-10-30',
    expirationText: 'Válido hasta el 30 de Octubre',
    conditions: [
      'Medallón vegetal a base de plantas',
      'Disponible en todos los locales del país'
    ],
    requiresApp: false,
    requiresAccount: false,
    paymentMethods: ['Efectivo', 'Tarjetas Bancarias', 'MODO'],
    sourceUrl: 'https://www.burgerking.com.ar/menu/vegetariano',
    lastVerified: 'Hoy a las 09:10 hs (vía Web Scraper)',
    validityScore: 0.96,
    validityState: 'VERIFIED',
    positiveVotes: 22,
    negativeVotes: 1,
    recommendationTag: 'Coincide con tu preferencia por #Vegetariano',
  },
  {
    id: 'mos-02',
    brand: 'Mostaza',
    brandColor: '#E4002B',
    brandLogo: '🍔',
    title: 'Sundae Dulce de Leche y Chocolate 2x1',
    category: 'Postres',
    originalPrice: 4200,
    promoPrice: 2100,
    discountPercentage: 50,
    code: 'SUNDAEMOS2X1',
    expirationDate: '2026-10-18',
    expirationText: 'Vence pronto (18 de Octubre)',
    conditions: [
      'Presentar captura o cupón al cajero',
      'Hasta agotar stock de 50 promociones por local'
    ],
    requiresApp: false,
    requiresAccount: false,
    paymentMethods: ['Efectivo', 'Mercado Pago'],
    sourceUrl: 'https://www.mostazaweb.com.ar/promociones',
    lastVerified: 'Hoy a las 07:40 hs (vía OCR flyer)',
    validityScore: 0.76,
    validityState: 'REVIEW',
    positiveVotes: 14,
    negativeVotes: 4,
    recommendationTag: 'Coincide con tu preferencia por #Postres',
  }
];
