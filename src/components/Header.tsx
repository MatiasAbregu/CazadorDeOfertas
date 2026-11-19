import React from 'react';
import { Sparkles, Shield, KeyRound, Smartphone } from 'lucide-react';
import { BrandName } from '../types';

interface HeaderProps {
  activeCount: number;
  totalCount: number;
  onOpenVault: () => void;
  vaultConnectedCount: number;
  selectedBrand: 'ALL' | BrandName;
  onSelectBrand: (brand: 'ALL' | BrandName) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCount,
  totalCount,
  onOpenVault,
  vaultConnectedCount,
  selectedBrand,
  onSelectBrand
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <span className="font-black text-xl sm:text-2xl tracking-tighter">%</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-none">
                  Centralizador Inteligente
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verificado
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                <span className="font-medium text-gray-700">McDonald's · Burger King · Mostaza</span>
                <span className="text-gray-300">|</span>
                <span className="text-emerald-600 font-semibold">{activeCount} activas hoy</span>
              </p>
            </div>
          </div>

          {/* Right Action: Safe Token Vault Modal Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenVault}
              className="relative px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Administrar credenciales y tokens seguros de apps oficiales"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Bóveda de Cuentas</span>
              <span className="sm:hidden">Cuentas</span>
              {vaultConnectedCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {vaultConnectedCount}
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Brand Selector Bar */}
        <div className="flex items-center space-x-2 py-2.5 border-t border-gray-100 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
            Marcas:
          </span>
          {[
            { id: 'ALL', label: 'Todas las Ofertas', emoji: '🔥', count: totalCount },
            { id: "McDonald's", label: "McDonald's", emoji: '🍟', color: 'hover:bg-red-50 hover:text-red-700' },
            { id: 'Burger King', label: 'Burger King', emoji: '👑', color: 'hover:bg-amber-50 hover:text-amber-900' },
            { id: 'Mostaza', label: 'Mostaza', emoji: '🍔', color: 'hover:bg-rose-50 hover:text-rose-800' }
          ].map(brand => {
            const isSelected = selectedBrand === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => onSelectBrand(brand.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{brand.emoji}</span>
                <span>{brand.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
