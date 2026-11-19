// ============================================================================
// Tipos de Dominio y Modelos de la Aplicación (Centralizador de Descuentos)
// Todos los identificadores y código en inglés según especificación.
// ============================================================================

export type BrandName = "McDonald's" | "Burger King" | "Mostaza";

export type FoodCategory =
  | 'Burgers'
  | 'Chicken'
  | 'Fries'
  | 'Desserts'
  | 'Combos'
  | 'Beverages';

export type PaymentMethod =
  | 'Any Method'
  | 'Mercado Pago'
  | 'Credit/Debit Card'
  | 'Cash'
  | 'Exclusive App QR';

export type PromotionStatus = 'ACTIVE' | 'EXPIRED_BY_DATE' | 'HIDDEN_BY_REPORTS';

export type TrafficLightStatus = 'GREEN' | 'YELLOW' | 'RED';

export type BenefitType =
  | 'FINAL_PRICE'
  | 'PERCENTAGE_DISCOUNT'
  | 'AMOUNT_DISCOUNT'
  | 'FREE_ITEM'
  | 'BOGO_2X1'
  | 'BANK_PROMO';

export interface PromotionRestrictions {
  minimumAmount: number;
  validDays: string[];
  schedule: string;
  paymentMethod: PaymentMethod;
  requiresApp: boolean;
  requiresLogin: boolean;
  finePrint: string;
}

export interface PromotionMetrics {
  workedCount: number;
  didNotWorkCount: number;
  interestCount: number;
  openCount: number;
  criticalReportsCount: number;
  trafficLight: TrafficLightStatus;
  successRate: number;
}

export interface Promotion {
  id: string;
  brand: BrandName;
  brandColor: string;
  title: string;
  description: string;
  category: FoodCategory;
  benefitType: BenefitType;
  imageUrl: string;
  originalPrice?: number;
  promotionalPrice: number;
  discountPercentage?: number;
  couponCode?: string;
  expirationDate: string; // Formato YYYY-MM-DD
  restrictions: PromotionRestrictions;
  sourceUrl: string;
  deepLinkApp: string;
  deduplicationKey: string;
  lastVerifiedAt: string;
  status: PromotionStatus;
  metrics: PromotionMetrics;
  recommendationTags: string[];
}

export interface UserSessionCredentials {
  brand: BrandName;
  emailOrUsername: string;
  tokenMasked: string;
  connectedAt: string;
  expiresInDays: number;
}

export interface UserPreferences {
  categories: FoodCategory[];
  favoriteBrand?: BrandName | 'ALL';
  maxPrice?: number;
}

export interface FeedbackVoteRequest {
  type: 'WORKED' | 'DID_NOT_WORK' | 'INTEREST';
}

export interface ReportDealRequest {
  reason: 'EXPIRED' | 'WRONG_DATA' | 'REJECTED_AT_STORE' | 'BROKEN_LINK';
  details?: string;
}
