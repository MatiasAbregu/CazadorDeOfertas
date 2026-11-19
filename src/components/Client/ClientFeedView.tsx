import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Sparkles, 
  Filter
} from 'lucide-react';
import { Promotion, BrandName, FoodCategory, PaymentMethod } from '../../types';
import { PreferencesBar } from './PreferencesBar';
import { PromoCard } from './PromoCard';
import { PromoDetailModal } from './PromoDetailModal';
import { DeepLinkModal } from './DeepLinkModal';
import { ReportModal } from './ReportModal';

interface ClientFeedViewProps {
  promotions: Promotion[];
  selectedBrandFilter: 'ALL' | BrandName;
  onVote: (promoId: string, type: 'WORKED' | 'DID_NOT_WORK' | 'INTEREST') => void;
  onReport: (promoId: string, reason: string, details: string) => void;
  onCanje: (promo: Promotion) => void;
  onOpenVault: () => void;
}

export const ClientFeedView: React.FC<ClientFeedViewProps> = ({
  promotions,
  selectedBrandFilter,
  onVote,
  onReport,
  onCanje,
  onOpenVault
}) => {
  // Onboarding Preferences (stored in localStorage, max 3)
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>(() => {
    try {
      const saved = localStorage.getItem('cid_user_food_prefs');
      return saved ? JSON.parse(saved) : ['Burgers'];
    } catch {
      return ['Burgers'];
    }
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | FoodCategory>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<'ALL' | PaymentMethod>('ALL');
  const [sortBy, setSortBy] = useState<'RECOMMENDED' | 'DISCOUNT' | 'LOWEST_PRICE' | 'SUCCESS_RATE'>('RECOMMENDED');

  // Modal states
  const [detailPromo, setDetailPromo] = useState<Promotion | null>(null);
  const [deepLinkPromo, setDeepLinkPromo] = useState<Promotion | null>(null);
  const [reportPromo, setReportPromo] = useState<Promotion | null>(null);

  // Preference handlers
  const handleToggleCategory = (cat: FoodCategory) => {
    let next: FoodCategory[];
    if (selectedCategories.includes(cat)) {
      next = selectedCategories.filter(c => c !== cat);
    } else {
      if (selectedCategories.length >= 3) return;
      next = [...selectedCategories, cat];
    }
    setSelectedCategories(next);
    localStorage.setItem('cid_user_food_prefs', JSON.stringify(next));
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
    localStorage.removeItem('cid_user_food_prefs');
  };

  const handleCanjeAction = (promo: Promotion) => {
    onCanje(promo);
    setDeepLinkPromo(promo);
  };

  // Filtered & Ranked promotions
  const filteredAndRankedPromos = useMemo(() => {
    let list = promotions.filter(p => p.status === 'ACTIVE');

    // 1. Brand filter (synced from Header or local selection)
    if (selectedBrandFilter !== 'ALL') {
      list = list.filter(p => p.brand === selectedBrandFilter);
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.couponCode && p.couponCode.toLowerCase().includes(q))
      );
    }

    // 3. Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // 4. Payment filter
    if (selectedPayment !== 'ALL') {
      list = list.filter(p => p.restrictions.paymentMethod === selectedPayment);
    }

    // Helper: does promo match user preferences?
    const checkMatchPreference = (p: Promotion) => {
      if (selectedCategories.length === 0) return false;
      return selectedCategories.some(cat => 
        p.category.toLowerCase() === cat.toLowerCase() ||
        p.recommendationTags.some(t => t.toLowerCase().includes(cat.toLowerCase()))
      );
    };

    // 5. Ranking & Sorting
    return list.sort((a, b) => {
      const matchA = checkMatchPreference(a);
      const matchB = checkMatchPreference(b);

      if (sortBy === 'RECOMMENDED') {
        if (matchA && !matchB) return -1;
        if (!matchA && matchB) return 1;
        const discA = a.discountPercentage || 0;
        const discB = b.discountPercentage || 0;
        return discB - discA;
      }

      if (sortBy === 'DISCOUNT') {
        const discA = a.discountPercentage || 0;
        const discB = b.discountPercentage || 0;
        return discB - discA;
      }

      if (sortBy === 'LOWEST_PRICE') {
        return a.promotionalPrice - b.promotionalPrice;
      }

      if (sortBy === 'SUCCESS_RATE') {
        return b.metrics.successRate - a.metrics.successRate;
      }

      return 0;
    });
  }, [promotions, selectedBrandFilter, searchQuery, selectedCategory, selectedPayment, sortBy, selectedCategories]);

  return (
    <div className="py-6 space-y-6">
      {/* Hero Banner: Clean Fast-Food Deals Hub */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-gray-900 via-stone-900 to-black text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sin Registro Previo Obligatorio · Canje en 1 Toque</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Todas las Ofertas Oficiales en una Sola Pantalla
          </h2>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            Explorá descuentos de McDonald's, Burger King y Mostaza verificados por la comunidad. Tocá cualquier cupón para abrir directamente la app oficial en tu celular o el sitio web verificado en escritorio.
          </p>
        </div>

        {/* Decorative ambient elements */}
        <div className="absolute right-[-20px] bottom-[-30px] opacity-10 pointer-events-none select-none text-9xl">
          🍔
        </div>
      </div>

      {/* 3-Click Onboarding Preferences Bar */}
      <PreferencesBar
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onClearCategories={handleClearCategories}
      />

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por combo, Whopper, Cuarto de Libra, McFlurry, 2x1..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              <option value="RECOMMENDED">Priorizar Mis Preferencias</option>
              <option value="DISCOUNT">Mayor Descuento (%)</option>
              <option value="LOWEST_PRICE">Menor Precio ($)</option>
              <option value="SUCCESS_RATE">Mayor Confiabilidad de Canje</option>
            </select>
          </div>
        </div>

        {/* Secondary Category & Payment Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 font-semibold text-gray-700 outline-hidden cursor-pointer"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="Burgers">Hamburguesas</option>
              <option value="Chicken">Pollo & Nuggets</option>
              <option value="Combos">Combos</option>
              <option value="Fries">Papas & Snacks</option>
              <option value="Desserts">Postres & Helados</option>
              <option value="Beverages">Bebidas</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">Medio de Pago:</span>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 font-semibold text-gray-700 outline-hidden cursor-pointer"
            >
              <option value="ALL">Cualquier medio</option>
              <option value="Mercado Pago">Mercado Pago</option>
              <option value="Credit/Debit Card">Tarjetas Débito/Crédito</option>
              <option value="Any Method">Sin restricción</option>
            </select>
          </div>

          <span className="ml-auto text-gray-400 font-semibold text-xs">
            Mostrando {filteredAndRankedPromos.length} ofertas disponibles
          </span>
        </div>
      </div>

      {/* Promotions Grid with High-Fidelity Food Photography */}
      {filteredAndRankedPromos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl">
            🍔
          </div>
          <h3 className="text-base font-bold text-gray-900">
            No se encontraron cupones para los filtros seleccionados
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Probá quitando algún filtro o restableciendo la búsqueda para ver todas las promociones activas.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedPayment('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
          >
            Ver todas las ofertas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndRankedPromos.map(promo => {
            const isRec = selectedCategories.some(cat => 
              promo.category.toLowerCase() === cat.toLowerCase() ||
              promo.recommendationTags.some(t => t.toLowerCase().includes(cat.toLowerCase()))
            );

            return (
              <PromoCard
                key={promo.id}
                promo={promo}
                isRecommended={isRec}
                onOpenDetail={(p) => setDetailPromo(p)}
                onCanjeAction={handleCanjeAction}
                onVote={onVote}
                onOpenReport={(p) => setReportPromo(p)}
              />
            );
          })}
        </div>
      )}

      {/* Unified Modals */}
      <PromoDetailModal
        promo={detailPromo}
        onClose={() => setDetailPromo(null)}
        onCanjeAction={handleCanjeAction}
        onOpenReport={(p) => setReportPromo(p)}
      />

      <DeepLinkModal
        promo={deepLinkPromo}
        onClose={() => setDeepLinkPromo(null)}
        onSubmitFeedback={onVote}
        onOpenReport={(p) => setReportPromo(p)}
      />

      <ReportModal
        promo={reportPromo}
        onClose={() => setReportPromo(null)}
        onSubmitReport={onReport}
      />
    </div>
  );
};
