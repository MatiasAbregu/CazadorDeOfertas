import React from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { FoodCategory } from '../../types';

interface PreferencesBarProps {
  selectedCategories: FoodCategory[];
  onToggleCategory: (cat: FoodCategory) => void;
  onClearCategories: () => void;
}

const CATEGORIES_LIST: { id: FoodCategory; label: string; icon: string }[] = [
  { id: 'Burgers', label: 'Hamburguesas', icon: '🍔' },
  { id: 'Chicken', label: 'Pollo & Nuggets', icon: '🍗' },
  { id: 'Combos', label: 'Combos Completos', icon: '🥤' },
  { id: 'Fries', label: 'Papas & Snacks', icon: '🍟' },
  { id: 'Desserts', label: 'Postres & Helados', icon: '🍦' },
  { id: 'Beverages', label: 'Bebidas & Cafetería', icon: '☕' }
];

export const PreferencesBar: React.FC<PreferencesBarProps> = ({
  selectedCategories,
  onToggleCategory,
  onClearCategories
}) => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-3.5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
            <span>Tus Preferencias</span>
            <span className="text-[11px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
              {selectedCategories.length}/3 activas
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Seleccioná hasta 3 categorías para priorizar automáticamente en el feed sin necesidad de registrarte.
          </p>
        </div>

        {selectedCategories.length > 0 && (
          <button
            onClick={onClearCategories}
            className="text-xs text-gray-400 hover:text-red-600 flex items-center space-x-1 font-semibold transition-colors self-start sm:self-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES_LIST.map(cat => {
          const isSelected = selectedCategories.includes(cat.id);
          const isDisabled = !isSelected && selectedCategories.length >= 3;

          return (
            <button
              key={cat.id}
              onClick={() => onToggleCategory(cat.id)}
              disabled={isDisabled}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-sm ring-2 ring-orange-300 scale-[1.02]'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
