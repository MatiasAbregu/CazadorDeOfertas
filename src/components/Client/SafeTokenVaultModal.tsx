import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { BrandName, UserSessionCredentials } from '../../types';

interface SafeTokenVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: UserSessionCredentials[];
  onSaveCredential: (brand: BrandName, emailOrUsername: string, token: string) => void;
  onDeleteCredential: (brand: BrandName) => void;
}

export const SafeTokenVaultModal: React.FC<SafeTokenVaultModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSaveCredential,
  onDeleteCredential
}) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandName>("McDonald's");
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !tokenInput.trim()) return;

    onSaveCredential(selectedBrand, emailOrUsername.trim(), tokenInput.trim());
    setEmailOrUsername('');
    setTokenInput('');
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const existingCredential = credentials.find(c => c.brand === selectedBrand);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Bóveda de Cuentas & Tokens Seguros
              </h3>
              <p className="text-xs text-gray-500">
                Cifrado AES-256 local para cupones exclusivos que exigen inicio de sesión
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Security Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block text-emerald-900">Almacenamiento Seguro y Cifrado</span>
              Tus credenciales y tokens de acceso se almacenan cifrados con clave de sesión efímera. Permiten sincronizar cupones VIP sin exponer contraseñas a terceros.
            </div>
          </div>

          {/* Connected Accounts Status */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
              Cuentas Conectadas ({credentials.length}/3)
            </h4>
            <div className="space-y-2">
              {(["McDonald's", "Burger King", "Mostaza"] as BrandName[]).map(brand => {
                const cred = credentials.find(c => c.brand === brand);
                return (
                  <div
                    key={brand}
                    className="p-3 rounded-2xl border border-gray-200 flex items-center justify-between hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {brand === "McDonald's" ? '🍟' : brand === 'Burger King' ? '👑' : '🍔'}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{brand}</span>
                        {cred ? (
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                            <span>{cred.emailOrUsername} ({cred.tokenMasked})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">Sin cuenta vinculada</span>
                        )}
                      </div>
                    </div>

                    {cred && (
                      <button
                        onClick={() => onDeleteCredential(brand)}
                        className="text-xs text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Desvincular y eliminar token cifrado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to Add or Update Credential */}
          <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-5 space-y-3.5">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Vincular Nueva Cuenta o Actualizar Token</span>
            </h4>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Marca de la App Oficial
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value as BrandName)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="McDonald's">McDonald's Argentina</option>
                <option value="Burger King">Burger King Argentina</option>
                <option value="Mostaza">Mostaza: Beneficios Increíbles</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Correo electrónico o Usuario en la App
              </label>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="ej: usuario@ejemplo.com"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Token de Sesión o Código de Autorización
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Pegá tu token de sesión oficial..."
                  className="w-full text-xs p-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {isSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Credenciales cifradas y guardadas con éxito para {selectedBrand}!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Cifrar y Guardar en Bóveda</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
