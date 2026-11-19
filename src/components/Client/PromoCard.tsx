import React, { useState } from 'react';
import { 
  Copy, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Tag, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Smartphone,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { Promotion, TrafficLightStatus } from '../../types';
import { resolveRedirection } from '../../utils/redirection';

interface PromoCardProps {
  promo: Promotion;
  isRecommended: boolean;
  onOpenDetail: (promo: Promotion) => void;
  onCanjeAction: (promo: Promotion) => void;
  onVote: (promoId: string, type: 'WORKED' | 'DID_NOT_WORK' | 'INTEREST') => void;
  onOpenReport: (promo: Promotion) => void;
}

export const PromoCard: React.FC<PromoCardProps> = ({
  promo,
  isRecommended,
  onOpenDetail,
  onCanjeAction,
  onVote,
  onOpenReport
}) => {
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState<'WORKED' | 'DID_NOT_WORK' | null>(null);

  const destination = resolveRedirection(promo);

  const handleCopyAndClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (promo.couponCode) {
      try {
        navigator.clipboard.writeText(promo.couponCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // ignore
      }
    }
    onCanjeAction(promo);
  };

  const handleInlineVote = (e: React.MouseEvent, type: 'WORKED' | 'DID_NOT_WORK') => {
    e.stopPropagation();
    setVoted(type);
    onVote(promo.id, type);
  };

  const trafficLightMap: Record<TrafficLightStatus, { bg: string; border: string; text: string; dot: string; label: string }> = {
    GREEN: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      label: 'Verificado'
    },
    YELLOW: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      label: 'En observación'
    },
    RED: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      dot: 'bg-rose-500',
      label: 'Reportes críticos'
    }
  };

  const traffic = trafficLightMap[promo.metrics.trafficLight] || trafficLightMap.GREEN;

  return (
    <div
      onClick={() => onOpenDetail(promo)}
      className={`group relative bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
        isRecommended
          ? 'border-orange-300 ring-2 ring-orange-200/70 shadow-md'
          : 'border-gray-200/80 shadow-xs hover:border-gray-300'
      }`}
    >
      {/* Recommended Tag Header */}
      {isRecommended && (
        <div className="bg-linear-to-r from-orange-500 to-amber-500 text-white text-[11px] font-bold px-3.5 py-1.5 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coincide con tu preferencia por #{promo.category}</span>
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
            {promo.discountPercentage ? `-${promo.discountPercentage}%` : '2x1'}
          </span>
        </div>
      )}

      {/* High-Fidelity Food Image with Brand Badge & Traffic Light */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-gray-100">
        <img
          src={promo.imageUrl}
          alt={promo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>

        {/* Brand Pill */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span
            className="font-black text-xs px-2.5 py-1 rounded-xl text-white shadow-md backdrop-blur-xs"
            style={{ backgroundColor: promo.brandColor }}
          >
            {promo.brand}
          </span>
          <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl">
            {promo.category}
          </span>
        </div>

        {/* Traffic Light Confidence Badge */}
        <div
          className={`absolute top-3 right-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shadow-md backdrop-blur-md ${traffic.bg} ${traffic.text} ${traffic.border}`}
          title={`Tasa de éxito comprobada: ${promo.metrics.successRate}%`}
        >
          <span className={`w-2 h-2 rounded-full ${traffic.dot} animate-pulse`}></span>
          <span>{promo.metrics.successRate}%</span>
        </div>

        {/* Price Tag Overlay on Bottom Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/80 block tracking-wider">
              Precio Promocional
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white drop-shadow-xs">
                ${promo.promotionalPrice.toLocaleString('es-AR')}
              </span>
              {promo.originalPrice && (
                <span className="text-xs text-white/70 line-through">
                  ${promo.originalPrice.toLocaleString('es-AR')}
                </span>
              )}
            </div>
          </div>

          {promo.discountPercentage ? (
            <span className="px-2.5 py-1 rounded-xl bg-red-600 text-white font-black text-xs shadow-md">
              {promo.discountPercentage}% OFF
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md">
              2x1
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-orange-600 transition-colors mb-1.5 line-clamp-2">
            {promo.title}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3.5 leading-relaxed">
            {promo.description}
          </p>

          {/* Coupon Code Pill */}
          {promo.couponCode && (
            <div className="flex items-center justify-between bg-amber-50/70 border border-dashed border-amber-300 rounded-xl px-3 py-2 mb-3">
              <div className="flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-xs font-mono font-black text-amber-950">
                  {promo.couponCode}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(promo.couponCode!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center space-x-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Expiration & Device Requirements */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Hasta el {promo.expirationDate}</span>
          </span>
          <span className="flex items-center space-x-1 text-gray-600 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-gray-400" />
            <span>{promo.restrictions.requiresApp ? 'App requerida' : 'Mostrador'}</span>
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
        {/* Community Feedback Mini-Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => handleInlineVote(e, 'WORKED')}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition-colors cursor-pointer ${
              voted === 'WORKED'
                ? 'bg-emerald-100 text-emerald-800 font-bold'
                : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
            title="Me funcionó en el local"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="text-[11px]">{promo.metrics.workedCount}</span>
          </button>

          <button
            onClick={(e) => handleInlineVote(e, 'DID_NOT_WORK')}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition-colors cursor-pointer ${
              voted === 'DID_NOT_WORK'
                ? 'bg-rose-100 text-rose-800 font-bold'
                : 'text-gray-500 hover:text-rose-700 hover:bg-rose-50'
            }`}
            title="No me funcionó o hubo inconvenientes"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span className="text-[11px]">{promo.metrics.didNotWorkCount}</span>
          </button>
        </div>

        {/* Claim in 1-Tap Direct Anchor */}
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(promo);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Detalle</span>
          </button>

          <a
            href={destination.url}
            onClick={handleCopyAndClaim}
            className="px-3.5 py-1.5 rounded-xl bg-linear-to-r from-red-600 via-orange-600 to-amber-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{destination.isNativeApp ? 'Abrir App' : 'Canjear'}</span>
              </>
            )}
          </a>
        </div>
      </div>
    </div>
  );
};
