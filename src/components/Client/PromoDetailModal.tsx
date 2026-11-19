import React from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  CreditCard, 
  Smartphone,
  Check,
  Flag,
  Sparkles
} from 'lucide-react';
import { Promotion } from '../../types';
import { resolveRedirection } from '../../utils/redirection';

interface PromoDetailModalProps {
  promo: Promotion | null;
  onClose: () => void;
  onCanjeAction: (promo: Promotion) => void;
  onOpenReport: (promo: Promotion) => void;
}

export const PromoDetailModal: React.FC<PromoDetailModalProps> = ({
  promo,
  onClose,
  onCanjeAction,
  onOpenReport
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!promo) return null;

  const destination = resolveRedirection(promo);

  const handleCopyCode = () => {
    if (promo.couponCode) {
      navigator.clipboard.writeText(promo.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const savingsAmount = promo.originalPrice
    ? promo.originalPrice - promo.promotionalPrice
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2.5">
            <span
              className="font-black text-xs px-2.5 py-1 rounded-xl text-white shadow-xs"
              style={{ backgroundColor: promo.brandColor }}
            >
              {promo.brand}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Ficha Técnica Oficial
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Image Hero */}
        <div className="relative w-full h-56 bg-gray-100">
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-4 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
              {promo.category}
            </span>
            <span className="text-lg font-black">{promo.title}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">
            {promo.description}
          </p>

          {/* Pricing Box */}
          <div className="bg-linear-to-br from-gray-50 to-orange-50/50 border border-orange-200/60 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-medium">Precio final a pagar</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-gray-900">
                    ${promo.promotionalPrice.toLocaleString('es-AR')}
                  </span>
                  {promo.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ${promo.originalPrice.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>

              {promo.discountPercentage ? (
                <div className="text-right">
                  <span className="text-sm font-black px-3 py-1.5 rounded-xl bg-red-600 text-white shadow-xs">
                    {promo.discountPercentage}% OFF
                  </span>
                  {savingsAmount && (
                    <span className="block text-xs text-emerald-700 font-bold mt-1">
                      Ahorrás ${savingsAmount.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-500 text-white shadow-xs">
                  2x1 BENEFICIO
                </span>
              )}
            </div>
          </div>

          {/* Coupon Code Action */}
          {promo.couponCode && (
            <div className="bg-amber-50 border border-dashed border-amber-300 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Código de Cupón
                </span>
                <span className="text-lg font-mono font-black text-amber-950">
                  {promo.couponCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar código</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Conditions & Letra Chica */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Condiciones de la Oferta
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-700 block">Vigencia</span>
                  <span className="text-gray-500">Hasta el {promo.expirationDate}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start space-x-2">
                <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-700 block">Horarios</span>
                  <span className="text-gray-500">{promo.restrictions.schedule}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start space-x-2">
                <CreditCard className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-700 block">Medio de Pago</span>
                  <span className="text-gray-500">{promo.restrictions.paymentMethod}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start space-x-2">
                <Smartphone className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-700 block">Canje</span>
                  <span className="text-gray-500">
                    {promo.restrictions.requiresApp ? 'App Oficial requerida' : 'Válido en mostrador'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-800 block mb-1">Letra chica oficial:</span>
              <p>{promo.restrictions.finePrint}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenReport(promo);
            }}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reportar cupón vencido o con errores</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-white transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <a
              href={destination.url}
              onClick={() => {
                if (promo.couponCode) {
                  try {
                    navigator.clipboard.writeText(promo.couponCode);
                  } catch {
                    // ignore
                  }
                }
                onClose();
                onCanjeAction(promo);
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-linear-to-r from-red-600 via-orange-600 to-amber-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{destination.isNativeApp ? 'Abrir App & Canjear' : 'Canjear en 1 Toque'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
