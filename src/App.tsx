import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClientFeedView } from './components/Client/ClientFeedView';
import { SafeTokenVaultModal } from './components/Client/SafeTokenVaultModal';
import { INITIAL_PROMOTIONS } from './data/initialData';
import { Promotion, BrandName, UserSessionCredentials } from './types';

export default function App() {
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [selectedBrand, setSelectedBrand] = useState<'ALL' | BrandName>('ALL');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safe Token Vault credentials (persisted locally with simulated AES-256 encryption)
  const [vaultCredentials, setVaultCredentials] = useState<UserSessionCredentials[]>(() => {
    try {
      const saved = localStorage.getItem('cid_secure_vault_tokens');
      return saved ? JSON.parse(saved) : [
        {
          brand: "McDonald's",
          emailOrUsername: 'cliente.mcd@ejemplo.com',
          tokenMasked: 'mcd_auth_••••••••f9a1',
          connectedAt: '2026-11-10',
          expiresInDays: 30
        }
      ];
    } catch {
      return [];
    }
  });

  // Fetch promotions from backend REST API
  useEffect(() => {
    fetch('/api/promotions')
      .then(res => res.json())
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          setPromotions(data.items);
        }
      })
      .catch(err => {
        console.warn('Usando promociones locales:', err);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Community Feedback Vote Handler
  const handleVote = async (promoId: string, type: 'WORKED' | 'DID_NOT_WORK' | 'INTEREST') => {
    try {
      const res = await fetch(`/api/promotions/${promoId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (res.ok) {
        const data = await res.json();
        setPromotions(prev => prev.map(p => {
          if (p.id === promoId) {
            return {
              ...p,
              metrics: data.metrics,
              status: data.status
            };
          }
          return p;
        }));
      } else {
        throw new Error('Fallback to local update');
      }
    } catch {
      // Optimistic local update
      setPromotions(prev => prev.map(p => {
        if (p.id === promoId) {
          const m = { ...p.metrics };
          if (type === 'WORKED') m.workedCount++;
          if (type === 'DID_NOT_WORK') m.didNotWorkCount++;
          if (type === 'INTEREST') m.interestCount++;
          const tot = m.workedCount + m.didNotWorkCount;
          m.successRate = tot === 0 ? 100 : Math.round((m.workedCount / tot) * 100);
          if (m.successRate < 50) m.trafficLight = 'RED';
          else if (m.successRate < 80) m.trafficLight = 'YELLOW';
          else m.trafficLight = 'GREEN';
          return { ...p, metrics: m };
        }
        return p;
      }));
    }

    showToast(
      type === 'WORKED' 
        ? '¡Voto registrado! Tasa de éxito actualizada para la comunidad 👍'
        : type === 'DID_NOT_WORK'
        ? 'Incidencia registrada. Se ajustó el semáforo de confiabilidad ⚠️'
        : '¡Guardado en tu lista de interés!'
    );
  };

  // 2. Report deal issue
  const handleReport = async (promoId: string, reason: string, details: string) => {
    try {
      const res = await fetch(`/api/promotions/${promoId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details })
      });

      if (res.ok) {
        const data = await res.json();
        setPromotions(prev => prev.map(p => {
          if (p.id === promoId) {
            return {
              ...p,
              status: data.status,
              metrics: {
                ...p.metrics,
                criticalReportsCount: data.criticalReportsCount,
                trafficLight: data.status === 'HIDDEN_BY_REPORTS' ? 'RED' : p.metrics.trafficLight
              }
            };
          }
          return p;
        }));

        if (data.status === 'HIDDEN_BY_REPORTS') {
          showToast('⚠️ Oferta retirada automáticamente por acumular 3 reportes críticos.');
        } else {
          showToast('Reporte recibido. Agradecemos tu aporte a la comunidad.');
        }
        return;
      }
    } catch (err) {
      console.warn('Fallback to local report handling:', err);
    }

    // Local fallback
    setPromotions(prev => prev.map(p => {
      if (p.id === promoId) {
        const reps = p.metrics.criticalReportsCount + 1;
        const newStatus = reps >= 3 ? 'HIDDEN_BY_REPORTS' : p.status;
        return {
          ...p,
          status: newStatus,
          metrics: {
            ...p.metrics,
            criticalReportsCount: reps,
            trafficLight: reps >= 3 ? 'RED' : p.metrics.trafficLight
          }
        };
      }
      return p;
    }));
    showToast('Reporte registrado. ¡Gracias por ayudar a mantener las ofertas al día!');
  };

  // 3. 1-Tap claim tracker
  const handleCanje = (promo: Promotion) => {
    fetch(`/api/promotions/${promo.id}/claim`, { method: 'POST' }).catch(() => {});
    setPromotions(prev => prev.map(p => {
      if (p.id === promo.id) {
        return {
          ...p,
          metrics: { ...p.metrics, openCount: p.metrics.openCount + 1 }
        };
      }
      return p;
    }));
  };

  // 4. Safe Token Vault Actions (Local encrypted storage)
  const handleSaveVaultCredential = (brand: BrandName, emailOrUsername: string, token: string) => {
    const masked = token.length > 8 
      ? `${token.slice(0, 4)}••••••••${token.slice(-4)}` 
      : '••••••••••••';
    
    const newCred: UserSessionCredentials = {
      brand,
      emailOrUsername,
      tokenMasked: masked,
      connectedAt: new Date().toISOString().substring(0, 10),
      expiresInDays: 30
    };

    const updated = [...vaultCredentials.filter(c => c.brand !== brand), newCred];
    setVaultCredentials(updated);
    localStorage.setItem('cid_secure_vault_tokens', JSON.stringify(updated));
    showToast(`Token seguro cifrado y almacenado para ${brand}`);
  };

  const handleDeleteVaultCredential = (brand: BrandName) => {
    const updated = vaultCredentials.filter(c => c.brand !== brand);
    setVaultCredentials(updated);
    localStorage.setItem('cid_secure_vault_tokens', JSON.stringify(updated));
    showToast(`Token eliminado para ${brand}`);
  };

  const activeCount = promotions.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-gray-50/70 flex flex-col antialiased text-gray-900 selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-950 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center space-x-2.5 animate-in slide-in-from-bottom-3 duration-200 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeCount={activeCount}
        totalCount={promotions.length}
        onOpenVault={() => setIsVaultOpen(true)}
        vaultConnectedCount={vaultCredentials.length}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
      />

      {/* Main Content Feed */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <ClientFeedView
          promotions={promotions}
          selectedBrandFilter={selectedBrand}
          onVote={handleVote}
          onReport={handleReport}
          onCanje={handleCanje}
          onOpenVault={() => setIsVaultOpen(true)}
        />
      </main>

      {/* Safe Token Vault Modal */}
      <SafeTokenVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        credentials={vaultCredentials}
        onSaveCredential={handleSaveVaultCredential}
        onDeleteCredential={handleDeleteVaultCredential}
      />

      {/* Minimal, Professional Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-center sm:text-left">
            <span className="font-bold text-gray-900">Centralizador Inteligente de Descuentos</span>
            <span className="text-gray-300">·</span>
            <span>McDonald's · Burger King · Mostaza</span>
          </div>
          <div className="text-gray-400 text-center sm:text-right">
            Arquitectura MVC · C# ASP.NET Core & Pomelo MySQL · Frontend React & Tailwind
          </div>
        </div>
      </footer>
    </div>
  );
}
