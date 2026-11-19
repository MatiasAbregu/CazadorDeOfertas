import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Heart, 
  X,
  AlertCircle,
  Smartphone,
  Globe,
  Download
} from 'lucide-react';
import { Promotion } from '../../types';
import { BRAND_CONFIGS, getDevicePlatform, resolveRedirection } from '../../utils/redirection';

interface DeepLinkModalProps {
  promo: Promotion | null;
  onClose: () => void;
  onSubmitFeedback: (promoId: string, type: 'WORKED' | 'DID_NOT_WORK' | 'INTEREST') => void;
  onOpenReport: (promo: Promotion) => void;
}

export const DeepLinkModal: React.FC<DeepLinkModalProps> = ({
  promo,
  onClose,
  onSubmitFeedback,
  onOpenReport
}) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!promo) return null;

  const brand = BRAND_CONFIGS[promo.brand] || BRAND_CONFIGS["McDonald's"];
  const { isAndroid, isIOS, isMobile } = getDevicePlatform();
  const destination = resolveRedirection(promo);

  const handleVote = (type: 'WORKED' | 'DID_NOT_WORK' | 'INTEREST') => {
    setFeedbackType(type);
    setFeedbackSent(true);
    onSubmitFeedback(promo.id, type);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const handleCopy = () => {
    if (promo.couponCode) {
      navigator.clipboard.writeText(promo.couponCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon & Heading */}
        <div 
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md mb-3"
          style={{ backgroundColor: promo.brandColor }}
        >
          {promo.brand === "McDonald's" ? '🍟' : promo.brand === 'Burger King' ? '👑' : '🍔'}
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-snug">
          Acceso Oficial a {promo.brand}
        </h3>

        {/* Device Detection Pill */}
        <div className="flex items-center justify-center space-x-1.5 my-1.5">
          {isMobile ? (
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Smartphone className="w-3 h-3 text-emerald-600" />
              <span>Celular detectado: Abre la App Oficial instalada</span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Globe className="w-3 h-3 text-blue-600" />
              <span>Escritorio: Enlace directo a la web verificada</span>
            </span>
          )}
        </div>

        {/* Coupon Code Banner */}
        {promo.couponCode && (
          <div className="my-3 p-3 bg-amber-50 border border-dashed border-amber-300 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
              Código de cupón oficial
            </span>
            <span className="text-xl font-mono font-black text-amber-950 select-all block my-0.5">
              {promo.couponCode}
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline transition-colors cursor-pointer"
            >
              {copiedCode ? '¡Código copiado al portapapeles!' : 'Copiar código al portapapeles'}
            </button>
          </div>
        )}

        {/* Action Buttons: Native App Direct Launch + Official Web */}
        <div className="space-y-2 mb-4">
          {/* 1. Open Installed Native App */}
          <a
            href={destination.url}
            className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>{destination.label}</span>
          </a>

          {/* 2. Open Official Web Page */}
          <a
            href={brand.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            <span>Sitio Web Oficial de {promo.brand}</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          {/* 3. Open Store if they want to check or update */}
          <a
            href={isIOS ? brand.appStoreUrl : brand.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-[11px] font-medium transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span>Ver en la App Store / Google Play</span>
          </a>
        </div>

        {/* Feedback Loop Question */}
        <div className="border-t border-gray-100 pt-3">
          <span className="text-xs font-bold text-gray-900 block mb-0.5">
            ¿Te funcionó esta oferta en el local?
          </span>
          <p className="text-[11px] text-gray-500 mb-2.5">
            Tu voto actualiza el semáforo comunitario de confianza en tiempo real.
          </p>

          {feedbackSent ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-center space-x-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {feedbackType === 'WORKED' && '¡Excelente! Semáforo verificado para la comunidad.'}
                {feedbackType === 'DID_NOT_WORK' && 'Incidencia registrada. Ajustamos el semáforo.'}
                {feedbackType === 'INTEREST' && '¡Guardado! Priorizaremos ofertas similares en tu feed.'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleVote('WORKED')}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex flex-col items-center space-y-1 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Me funcionó</span>
              </button>

              <button
                onClick={() => handleVote('DID_NOT_WORK')}
                className="p-2 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-800 text-xs font-bold transition-all flex flex-col items-center space-y-1 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ThumbsDown className="w-4 h-4 text-red-600" />
                <span>No funcionó</span>
              </button>

              <button
                onClick={() => handleVote('INTEREST')}
                className="p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all flex flex-col items-center space-y-1 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-purple-600" />
                <span>Me interesa</span>
              </button>
            </div>
          )}
        </div>

        {/* Small report button */}
        <div className="mt-3 pt-2.5 border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              onOpenReport(promo);
            }}
            className="text-[11px] text-gray-400 hover:text-red-600 transition-colors flex items-center justify-center space-x-1 mx-auto cursor-pointer"
          >
            <AlertCircle className="w-3 h-3" />
            <span>¿Información incorrecta o cupón rechazado? Reportar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
