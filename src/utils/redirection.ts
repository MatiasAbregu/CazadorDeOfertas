import { BrandName, Promotion } from '../types';

export interface BrandConfig {
  name: BrandName;
  packageName: string;
  androidIntentUrl: string;
  iosScheme: string;
  webUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
  accentColor: string;
}

export const BRAND_CONFIGS: Record<BrandName, BrandConfig> = {
  "McDonald's": {
    name: "McDonald's",
    packageName: "com.mcdo.mcdonalds",
    androidIntentUrl: "intent:#Intent;package=com.mcdo.mcdonalds;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.mcdonalds.com.ar;end",
    iosScheme: "mcdmobileapp://",
    webUrl: "https://www.mcdonalds.com.ar",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.mcdo.mcdonalds",
    appStoreUrl: "https://apps.apple.com/ar/app/mcdonalds-app-ofertas-y-mop/id1114009171",
    accentColor: "#DA291C"
  },
  "Burger King": {
    name: "Burger King",
    packageName: "ar.burgerking",
    androidIntentUrl: "intent:#Intent;package=ar.burgerking;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.burgerking.com.ar;end",
    iosScheme: "bkarg://",
    webUrl: "https://www.burgerking.com.ar",
    playStoreUrl: "https://play.google.com/store/apps/details?id=ar.burgerking",
    appStoreUrl: "https://apps.apple.com/ar/app/burger-king-argentina/id1256346337",
    accentColor: "#502314"
  },
  "Mostaza": {
    name: "Mostaza",
    packageName: "com.candoit.mostaza",
    androidIntentUrl: "intent:#Intent;package=com.candoit.mostaza;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fwww.mostazaweb.com.ar;end",
    iosScheme: "mostaza://",
    webUrl: "https://www.mostazaweb.com.ar",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.candoit.mostaza",
    appStoreUrl: "https://apps.apple.com/ar/app/mostaza/id1458999434",
    accentColor: "#C41230"
  }
};

/**
 * Detecta si el cliente está ejecutando en un dispositivo móvil Android o iOS.
 */
export function getDevicePlatform(): { isAndroid: boolean; isIOS: boolean; isMobile: boolean } {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isAndroid: false, isIOS: false, isMobile: false };
  }
  const ua = navigator.userAgent || navigator.vendor || '';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = isAndroid || isIOS || /mobile/i.test(ua);

  return { isAndroid, isIOS, isMobile };
}

/**
 * Resuelve la URL o Intent óptimo para canjear la oferta en un solo toque.
 * En celulares con la app instalada, invoca el Intent nativo de Android o Scheme de iOS.
 * En computadoras de escritorio, dirige a la web oficial verificada.
 */
export function resolveRedirection(promo: Promotion): {
  url: string;
  isNativeApp: boolean;
  label: string;
} {
  const brand = BRAND_CONFIGS[promo.brand] || BRAND_CONFIGS["McDonald's"];
  const { isAndroid, isIOS } = getDevicePlatform();

  if (isAndroid) {
    return {
      url: brand.androidIntentUrl,
      isNativeApp: true,
      label: `Abrir App ${brand.name}`
    };
  }

  if (isIOS) {
    return {
      url: brand.iosScheme,
      isNativeApp: true,
      label: `Abrir App ${brand.name}`
    };
  }

  return {
    url: brand.webUrl,
    isNativeApp: false,
    label: `Web Oficial ${brand.name}`
  };
}
