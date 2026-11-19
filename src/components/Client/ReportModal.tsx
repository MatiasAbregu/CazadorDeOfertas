import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Flag, AlertTriangle } from 'lucide-react';
import { Promotion } from '../../types';

interface ReportModalProps {
  promo: Promotion | null;
  onClose: () => void;
  onSubmitReport: (promoId: string, reason: string, details: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  promo,
  onClose,
  onSubmitReport
}) => {
  const [reason, setReason] = useState<'EXPIRED' | 'WRONG_DATA' | 'REJECTED_AT_STORE' | 'BROKEN_LINK'>('EXPIRED');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!promo) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(promo.id, reason, details);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-3 text-red-600">
          <ShieldAlert className="w-6 h-6" />
          <h3 className="text-base font-bold text-gray-900">
            Reportar Incidencia de Oferta
          </h3>
        </div>

        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Estás reportando el cupón <strong className="text-gray-900">{promo.title}</strong> de <strong className="text-gray-900">{promo.brand}</strong>.
        </p>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex flex-col items-center text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            <span className="font-bold text-sm">¡Reporte recibido con éxito!</span>
            <p className="text-emerald-700">
              Si la oferta acumula 3 reportes críticos de fallo, el motor de expiración pasiva la ocultará automáticamente del catálogo visible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Motivo del problema
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'EXPIRED', label: 'Oferta vencida / Ya no está vigente en la marca' },
                  { id: 'REJECTED_AT_STORE', label: 'Rechazada en mostrador o AutoMac por el personal' },
                  { id: 'WRONG_DATA', label: 'Precios, descuento o letra chica incorrectos' },
                  { id: 'BROKEN_LINK', label: 'El cupón o enlace profundo a la app no funciona' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      reason === opt.id
                        ? 'border-red-500 bg-red-50/60 font-semibold text-red-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={opt.id}
                      checked={reason === opt.id}
                      onChange={() => setReason(opt.id as any)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Detalles adicionales (opcional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                placeholder="Ej: En la sucursal me informaron que el beneficio ya expiró..."
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent outline-hidden"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-tight flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Regla de Expiración Pasiva:</strong> Al acumular 3 reportes de la comunidad, la oferta pasa a estado <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">HIDDEN_BY_REPORTS</code> y se retira del catálogo.
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Enviar reporte</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
