/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Github,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  UploadCloud,
  FileCode,
  Tag,
  Search,
  Filter,
  Check,
  RefreshCw,
  Terminal,
  Settings,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Key,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Share2,
  Zap,
  Clock,
  MapPin,
  Flame,
  X
} from 'lucide-react';
import { CAZADOR_README_MARKDOWN, CAZADOR_ISSUES, GitHubIssueTemplate } from './data/cazadorProjectData.ts';
import { INITIAL_OFFERS, OfferItem } from './data/mockOffers.ts';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'issues' | 'readme' | 'simulator' | 'config'>('issues');

  // GitHub Auth state
  const [token, setToken] = useState<string>(() => localStorage.getItem('gh_token') || '');
  const [user, setUser] = useState<any>(null);
  const [authConfig, setAuthConfig] = useState<any>(null);
  const [isPatModalOpen, setIsPatModalOpen] = useState(false);
  const [patInput, setPatInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Target repository state
  const [targetOwner, setTargetOwner] = useState('MatiasAbregu');
  const [targetRepo, setTargetRepo] = useState('CazadorDeOfertas');
  const [repoStatus, setRepoStatus] = useState<{
    checked: boolean;
    exists?: boolean;
    isPrivate?: boolean;
    openIssues?: number;
    error?: string;
  }>({ checked: false });

  // Issues management state
  const [issuesFilter, setIssuesFilter] = useState<'all' | 'backend' | 'frontend' | 'architecture'>('all');
  const [searchIssueQuery, setSearchIssueQuery] = useState('');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>('ISSUE-01');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; logs: string[] }>({
    current: 0,
    total: 0,
    logs: [],
  });
  const [createdIssueMap, setCreatedIssueMap] = useState<Record<string, { number: number; url: string }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // README state
  const [readmeSubTab, setReadmeSubTab] = useState<'preview' | 'raw'>('preview');
  const [pushingReadme, setPushingReadme] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<{ commitSha?: string; url?: string } | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  // Simulator state
  const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchOfferQuery, setSearchOfferQuery] = useState('');
  const [selectedOfferModal, setSelectedOfferModal] = useState<OfferItem | null>(null);
  const [reportModalOffer, setReportModalOffer] = useState<OfferItem | null>(null);
  const [reportReason, setReportReason] = useState('Oferta ya no está disponible');
  const [redeemedOffer, setRedeemedOffer] = useState<OfferItem | null>(null);
  const [feedbackPrompt, setFeedbackPrompt] = useState<OfferItem | null>(null);
  const [userPreferences, setUserPreferences] = useState<{
    categories: string[];
    zone: string;
    onboarded: boolean;
  }>(() => {
    const saved = localStorage.getItem('cazador_user_prefs');
    return saved
      ? JSON.parse(saved)
      : { categories: ['Hamburguesas', 'Combos'], zone: 'Córdoba Capital', onboarded: false };
  });
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  // Initial load: check config & verify token
  useEffect(() => {
    fetch('/api/auth/config')
      .then((r) => r.json())
      .then((cfg) => setAuthConfig(cfg))
      .catch((e) => console.error('Failed to get auth config:', e));

    if (token) {
      verifyToken(token);
    }
  }, []);

  // Check repo info when user or repo target changes
  useEffect(() => {
    checkRepository();
  }, [targetOwner, targetRepo, token]);

  // Listen for OAuth postMessage callback from popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const receivedToken = event.data.token;
        if (receivedToken) {
          setToken(receivedToken);
          localStorage.setItem('gh_token', receivedToken);
          if (event.data.user) {
            setUser(event.data.user);
          } else {
            verifyToken(receivedToken);
          }
          setAuthError(null);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setAuthError(event.data.error || 'Error al autorizar con GitHub');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const verifyToken = async (tok: string) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/github/user', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setAuthError(null);
      } else {
        const err = await res.json();
        setAuthError(err.message || 'Token inválido o expirado');
        setUser(null);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error verificando usuario');
    } finally {
      setAuthLoading(false);
    }
  };

  const checkRepository = async () => {
    try {
      const res = await fetch(`/api/github/check-repo?owner=${targetOwner}&repo=${targetRepo}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setRepoStatus({
          checked: true,
          exists: true,
          isPrivate: data.isPrivate,
          openIssues: data.openIssuesCount,
        });
      } else {
        setRepoStatus({
          checked: true,
          exists: false,
          error: 'Repositorio no encontrado o privado (requiere token de acceso)',
        });
      }
    } catch {
      setRepoStatus({ checked: true, exists: false });
    }
  };

  const handleOAuthConnect = async () => {
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Falta configurar GITHUB_CLIENT_ID en el servidor');
      }
      const { url } = await response.json();

      const popup = window.open(url, 'github_oauth_popup', 'width=620,height=750,scrollbars=yes');
      if (!popup) {
        alert('Por favor habilita las ventanas emergentes (popups) para conectar con GitHub.');
      }
    } catch (err: any) {
      setAuthError(err.message);
      setIsPatModalOpen(true); // Offer PAT token alternative immediately
    }
  };

  const handleSavePat = () => {
    if (!patInput.trim()) return;
    const cleanToken = patInput.trim();
    setToken(cleanToken);
    localStorage.setItem('gh_token', cleanToken);
    verifyToken(cleanToken);
    setIsPatModalOpen(false);
    setPatInput('');
  };

  const handleDisconnect = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('gh_token');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Push single issue to GitHub
  const handleCreateSingleIssue = async (issue: GitHubIssueTemplate) => {
    if (!token) {
      setIsPatModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/github/create-issue', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: targetOwner,
          repo: targetRepo,
          title: issue.title,
          body: issue.body,
          labels: issue.labels,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedIssueMap((prev) => ({
          ...prev,
          [issue.id]: { number: data.number, url: data.html_url },
        }));
        alert(`✅ Issue #${data.number} creada con éxito en ${targetOwner}/${targetRepo}!`);
      } else {
        alert(`❌ Error al crear issue: ${data.message || 'Verifica permisos del token'}`);
      }
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  };

  // Batch create all issues
  const handleBatchCreateIssues = async () => {
    if (!token) {
      setIsPatModalOpen(true);
      return;
    }

    const confirmRun = window.confirm(
      `¿Deseas crear las ${CAZADOR_ISSUES.length} issues del MVP directamente en el repositorio ${targetOwner}/${targetRepo}?`
    );
    if (!confirmRun) return;

    setBatchLoading(true);
    setBatchProgress({
      current: 0,
      total: CAZADOR_ISSUES.length,
      logs: [`Iniciando publicación de ${CAZADOR_ISSUES.length} issues en ${targetOwner}/${targetRepo}...`],
    });

    const newMap = { ...createdIssueMap };

    for (let i = 0; i < CAZADOR_ISSUES.length; i++) {
      const issue = CAZADOR_ISSUES[i];
      setBatchProgress((p) => ({
        ...p,
        current: i + 1,
        logs: [`[${i + 1}/${CAZADOR_ISSUES.length}] Creando: "${issue.title}"...`, ...p.logs],
      }));

      try {
        const res = await fetch('/api/github/create-issue', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            owner: targetOwner,
            repo: targetRepo,
            title: issue.title,
            body: issue.body,
            labels: issue.labels,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          newMap[issue.id] = { number: data.number, url: data.html_url };
          setCreatedIssueMap({ ...newMap });
          setBatchProgress((p) => ({
            ...p,
            logs: [`✅ Issue #${data.number} publicada: ${issue.title}`, ...p.logs],
          }));
        } else {
          setBatchProgress((p) => ({
            ...p,
            logs: [`❌ Falló "${issue.title}": ${data.message || 'Error'}`, ...p.logs],
          }));
        }

        // Delay to avoid GitHub rate limits
        await new Promise((r) => setTimeout(r, 650));
      } catch (err: any) {
        setBatchProgress((p) => ({
          ...p,
          logs: [`❌ Excepción en "${issue.title}": ${err.message}`, ...p.logs],
        }));
      }
    }

    setBatchLoading(false);
    setBatchProgress((p) => ({
      ...p,
      logs: [`🎉 ¡Proceso finalizado! Revisa las issues en GitHub.`, ...p.logs],
    }));
  };

  // Push README.md to GitHub
  const handlePushReadme = async () => {
    if (!token) {
      setIsPatModalOpen(true);
      return;
    }

    setPushingReadme(true);
    setPushError(null);
    setPushSuccess(null);

    try {
      const res = await fetch('/api/github/update-readme', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: targetOwner,
          repo: targetRepo,
          content: CAZADOR_README_MARKDOWN,
          commitMessage: 'docs: actualizar README con arquitectura MVC y metodología SPEC para el MVP',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPushSuccess({
          commitSha: data.commit?.sha?.slice(0, 7) || 'completado',
          url: data.contentUrl || `https://github.com/${targetOwner}/${targetRepo}/blob/main/README.md`,
        });
      } else {
        setPushError(data.message || 'Error al actualizar el README.md. Verifica permisos de escritura.');
      }
    } catch (e: any) {
      setPushError(e.message || 'Error de conexión');
    } finally {
      setPushingReadme(false);
    }
  };

  // Simulator actions
  const handleRedeemClick = (offer: OfferItem) => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
    }
    setRedeemedOffer(offer);
    // Simulate opening official restaurant destination
    window.open(offer.sourceUrl, '_blank', 'noopener,noreferrer');

    // Prompt user for feedback loop after returning
    setTimeout(() => {
      setFeedbackPrompt(offer);
    }, 1500);
  };

  const handleFeedbackVote = (offerId: string, isPositive: boolean) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          const newPos = isPositive ? o.positiveVotes + 1 : o.positiveVotes;
          const newNeg = !isPositive ? o.negativeVotes + 1 : o.negativeVotes;
          const total = newPos + newNeg;
          const score = total > 0 ? newPos / total : 1;
          const state: 'VERIFIED' | 'REVIEW' | 'WARNING' =
            score >= 0.8 ? 'VERIFIED' : score >= 0.6 ? 'REVIEW' : 'WARNING';
          return {
            ...o,
            positiveVotes: newPos,
            negativeVotes: newNeg,
            validityScore: Math.round(score * 100) / 100,
            validityState: state,
          };
        }
        return o;
      })
    );
    setFeedbackPrompt(null);
  };

  const handleReportSubmit = () => {
    if (!reportModalOffer) return;
    alert(`📢 Reporte enviado: "${reportReason}" para la oferta ${reportModalOffer.title}. ¡Gracias por alertar a la comunidad!`);
    // Negative vote
    handleFeedbackVote(reportModalOffer.id, false);
    setReportModalOffer(null);
  };

  // Filter issues
  const filteredIssues = CAZADOR_ISSUES.filter((issue) => {
    const matchesModule = issuesFilter === 'all' || issue.module === issuesFilter;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchIssueQuery.toLowerCase()) ||
      issue.summary.toLowerCase().includes(searchIssueQuery.toLowerCase()) ||
      issue.labels.some((l) => l.toLowerCase().includes(searchIssueQuery.toLowerCase()));
    return matchesModule && matchesSearch;
  });

  // Filter offers in simulator
  const filteredOffers = offers.filter((offer) => {
    const matchesBrand = selectedBrand === 'all' || offer.brand === selectedBrand;
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    const matchesSearch =
      offer.title.toLowerCase().includes(searchOfferQuery.toLowerCase()) ||
      offer.conditions.some((c) => c.toLowerCase().includes(searchOfferQuery.toLowerCase()));
    return matchesBrand && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-xl shadow-lg shadow-red-950/40">
              🍔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">CazadorDeOfertas</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  MVP SPEC & MVC
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Centralizador Inteligente: McDonald's · Burger King · Mostaza
              </p>
            </div>
          </div>

          {/* Target Repo & GitHub Auth */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Target Repo Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700 text-xs text-neutral-300">
              <Github className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-400">Repo:</span>
              <a
                href={`https://github.com/${targetOwner}/${targetRepo}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-medium text-amber-400 hover:underline flex items-center gap-1"
              >
                {targetOwner}/{targetRepo}
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
              {repoStatus.checked && (
                <span
                  className={`w-2 h-2 rounded-full ml-1 ${
                    repoStatus.exists ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  title={repoStatus.exists ? 'Repositorio accesible' : 'Repositorio no detectado o privado'}
                />
              )}
            </div>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-200">
                  <img
                    src={user.avatar_url || 'https://github.com/ghost.png'}
                    alt={user.login}
                    className="w-5 h-5 rounded-full border border-emerald-500/50"
                  />
                  <span className="font-medium">@{user.login}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-2.5 py-1.5 text-xs rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleOAuthConnect}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-white text-neutral-900 font-semibold text-xs transition shadow-sm"
                >
                  <Github className="w-3.5 h-3.5" />
                  Conectar GitHub
                </button>
                <button
                  onClick={() => setIsPatModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs border border-neutral-700 flex items-center gap-1 transition"
                  title="Ingresar Personal Access Token manualmente"
                >
                  <Key className="w-3.5 h-3.5" />
                  Token PAT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-neutral-800/80 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-2.5 px-4 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'issues'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            Issues del MVP ({CAZADOR_ISSUES.length})
            {Object.keys(createdIssueMap).length > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {Object.keys(createdIssueMap).length} Creadas
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`py-2.5 px-4 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'readme'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            README.md (Arquitectura MVC + SPEC)
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-2.5 px-4 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'simulator'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Simulador Interactivo del MVP
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50">
              Demo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-2.5 px-4 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'config'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Guía de Conexión & OAuth
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Error or Alert banner if any */}
        {authError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={() => setIsPatModalOpen(true)}
              className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded text-xs shrink-0"
            >
              Usar Token PAT
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: GITHUB ISSUES MANAGER                             */}
        {/* ======================================================== */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            {/* Top Action Bar */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <GitPullRequest className="w-5 h-5 text-amber-400" />
                  Issues Estructuradas para el Repositorio
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                  {CAZADOR_ISSUES.length} tareas técnicas indispensables derivadas del análisis del MVP:
                  Módulo 1 (Backend, OCR, LLM, Deduplicación, Expiración) y Módulo 2 (Cliente, Feed, Canje 1-Toque, Feedback Loop).
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleBatchCreateIssues}
                  disabled={batchLoading}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
                >
                  {batchLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Publicando ({batchProgress.current}/{batchProgress.total})...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Publicar Todas las Issues ({CAZADOR_ISSUES.length})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Batch Progress Log Display */}
            {batchLoading || batchProgress.logs.length > 0 ? (
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-2">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    Consola de Publicación de Issues
                  </span>
                  <span>
                    Progreso: {batchProgress.current} / {batchProgress.total}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{
                      width: `${(batchProgress.current / (batchProgress.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] pt-1 text-neutral-300">
                  {batchProgress.logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800 w-full sm:w-auto overflow-x-auto text-xs">
                <button
                  onClick={() => setIssuesFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    issuesFilter === 'all'
                      ? 'bg-neutral-800 text-white shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Todas ({CAZADOR_ISSUES.length})
                </button>
                <button
                  onClick={() => setIssuesFilter('backend')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    issuesFilter === 'backend'
                      ? 'bg-neutral-800 text-amber-300 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Módulo 1: Backend ({CAZADOR_ISSUES.filter((i) => i.module === 'backend').length})
                </button>
                <button
                  onClick={() => setIssuesFilter('frontend')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    issuesFilter === 'frontend'
                      ? 'bg-neutral-800 text-sky-300 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Módulo 2: Cliente ({CAZADOR_ISSUES.filter((i) => i.module === 'frontend').length})
                </button>
                <button
                  onClick={() => setIssuesFilter('architecture')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    issuesFilter === 'architecture'
                      ? 'bg-neutral-800 text-purple-300 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Arquitectura SPEC (1)
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar issue o etiqueta..."
                  value={searchIssueQuery}
                  onChange={(e) => setSearchIssueQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const isExpanded = expandedIssueId === issue.id;
                const createdInfo = createdIssueMap[issue.id];

                return (
                  <div
                    key={issue.id}
                    className="border border-neutral-800/90 rounded-xl bg-neutral-900/70 hover:border-neutral-700 transition overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span
                          className={`mt-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                            issue.module === 'backend'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                              : issue.module === 'frontend'
                              ? 'bg-sky-950/80 text-sky-400 border border-sky-800/50'
                              : 'bg-purple-950/80 text-purple-400 border border-purple-800/50'
                          }`}
                        >
                          {issue.id}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-neutral-100 truncate">
                            {issue.title}
                          </h3>
                          <p className="text-xs text-neutral-400 truncate mt-0.5">{issue.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {createdInfo ? (
                          <a
                            href={createdInfo.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-mono flex items-center gap-1 hover:underline"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Issue #{createdInfo.number}
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        ) : null}

                        <div className="hidden sm:flex items-center gap-1">
                          {issue.labels.slice(0, 3).map((lbl) => (
                            <span
                              key={lbl}
                              className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400"
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-neutral-800 bg-neutral-950/70 p-4 sm:p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-neutral-400">Etiquetas:</span>
                            {issue.labels.map((lbl) => (
                              <span
                                key={lbl}
                                className="px-2 py-0.5 rounded-full text-xs bg-neutral-800/90 text-amber-300/80 border border-neutral-700"
                              >
                                {lbl}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(issue.body, `body-${issue.id}`)}
                              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1.5 transition"
                            >
                              {copiedId === `body-${issue.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              Copiar Markdown
                            </button>

                            <button
                              onClick={() => handleCreateSingleIssue(issue)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              {createdInfo ? 'Re-publicar en GitHub' : 'Crear en Repositorio'}
                            </button>
                          </div>
                        </div>

                        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                          {issue.body}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: README.MD WITH MVC ARCHITECTURE & SPEC            */}
        {/* ======================================================== */}
        {activeTab === 'readme' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-amber-400" />
                  Arquitectura MVC con Metodología SPEC
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                  Especificación de arquitectura Model-View-Controller adaptada con los 4 pilares SPEC (State & Specification, Process & Pipeline, Entities & Endpoints, Components & Client).
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => copyToClipboard(CAZADOR_README_MARKDOWN, 'readme-all')}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-neutral-700 transition"
                >
                  {copiedId === 'readme-all' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copiar Todo
                </button>

                <button
                  onClick={handlePushReadme}
                  disabled={pushingReadme}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
                >
                  {pushingReadme ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Pusheando...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Pushear README.md a {targetOwner}/{targetRepo}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Commit success or error message */}
            {pushSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    ¡README.md actualizado exitosamente en el repositorio! Commit:{' '}
                    <code className="font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded">
                      {pushSuccess.commitSha}
                    </code>
                  </span>
                </div>
                {pushSuccess.url && (
                  <a
                    href={pushSuccess.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline flex items-center gap-1 shrink-0"
                  >
                    Ver en GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {pushError && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{pushError}</span>
              </div>
            )}

            {/* View Sub-tabs */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReadmeSubTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    readmeSubTab === 'preview'
                      ? 'bg-neutral-800 text-amber-300 border border-neutral-700'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Vista Estructurada Formateada
                </button>
                <button
                  onClick={() => setReadmeSubTab('raw')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    readmeSubTab === 'raw'
                      ? 'bg-neutral-800 text-amber-300 border border-neutral-700'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Markdown Raw (.md)
                </button>
              </div>

              <span className="text-xs text-neutral-500 font-mono">
                {CAZADOR_README_MARKDOWN.split('\n').length} líneas · Listo para git commit
              </span>
            </div>

            {/* Content view */}
            {readmeSubTab === 'preview' ? (
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-200 space-y-6 text-sm leading-relaxed">
                {/* Visual Architecture Diagram Box */}
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto whitespace-pre leading-snug">
{`┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA MVC CON METODOLOGÍA SPEC                          │
│                                                                                        │
│  [CONTROLLERS]                                                                         │
│  • IngestionController (Cron Diario, Scrapers McDonald's / BK / Mostaza)             │
│  • FeedCatalogController (Filtros, Motor de Recomendación por Reglas, Expiración)      │
│  • InteractionController (Canje 1-Toque, Deep Link, Bucle de Feedback, Reportes)       │
│                                                                                        │
│  [MODELS & SPEC PIPELINE]                                                              │
│  • S - State & Specification: Oferta, Marca, Reglas de Expiración Pasiva, Semáforo     │
│  • P - Process & Pipeline: Web Scrapers, Motor OCR (flyers), Parser Semántico LLM      │
│  • E - Entities & Endpoints: Entidades BD, Hash de Deduplicación, Endpoints REST       │
│                                                                                        │
│  [VIEWS & CLIENT]                                                                      │
│  • C - Components & Client: Feed Mobile-First, Ficha Detallada, Canje, Feedback Loop   │
└────────────────────────────────────────────────────────────────────────────────────────┘`}
                </div>

                {/* SPEC Pillars Card */}
                <div>
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Pilares Metodológicos SPEC en CazadorDeOfertas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-center leading-5 text-[10px]">S</span>
                        State & Specification (Modelo de Reglas)
                      </div>
                      <p className="text-neutral-400">
                        Invariantes de datos con Zod, clave única determinística (<code className="text-neutral-300">marca + slug_titulo</code>), motor de expiración pasiva y cálculo del semáforo público.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <div className="font-bold text-sky-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-sky-500/20 text-center leading-5 text-[10px]">P</span>
                        Process & Pipeline (Ingesta Automatizada)
                      </div>
                      <p className="text-neutral-400">
                        Worker cron diario, scraping de las 3 marcas, motor OCR para flyers y banners gráficos, y extracción semántica de letra chica con LLM.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <div className="font-bold text-purple-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-purple-500/20 text-center leading-5 text-[10px]">E</span>
                        Entities & Endpoints (Contratos y Almacenamiento)
                      </div>
                      <p className="text-neutral-400">
                        Entidades de persistencia (<code className="text-neutral-300">Offer, Brand, Restriction, FeedbackLog</code>) y API RESTful para alimentar el feed y registrar canjes.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-center leading-5 text-[10px]">C</span>
                        Components & Client (Presentación y UX)
                      </div>
                      <p className="text-neutral-400">
                        Interfaz visual unificada mobile-first, canje en 1 toque con copiado de código al portapapeles y bucle de feedback inmediato al regresar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Directory Tree */}
                <div>
                  <h3 className="text-base font-bold text-white mb-2">Árbol de Directorios del Repositorio</h3>
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300">
{`CazadorDeOfertas/
├── src/
│   ├── models/                   # [SPEC - State, Entities & Specifications]
│   │   ├── entities/ (Offer.ts, Brand.ts, Restriction.ts, FeedbackReport.ts)
│   │   ├── schemas/  (offerSchema.ts, feedbackSchema.ts)
│   │   └── services/ (pipeline/scrapers, ocrService, llmParserService, deduplication)
│   ├── controllers/              # [Controllers MVC]
│   │   ├── ingestionController.ts
│   │   ├── catalogController.ts
│   │   ├── recommendationController.ts
│   │   └── interactionController.ts
│   ├── views/                    # [SPEC - Components & Client / UI]
│   │   ├── components/ (OfferCard, OfferDetailsModal, FilterBar, FeedbackWidget)
│   │   └── pages/      (FeedPage.tsx)
│   └── config/
└── tests/`}
                  </div>
                </div>

                {/* Scope & Exclusions summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                    <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
                      ✅ Funcionalidades Indispensables del MVP
                    </h4>
                    <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                      <li>Pipeline de ingesta programado diario (McDonald's, BK, Mostaza).</li>
                      <li>OCR para imágenes de cuponeras y documentos.</li>
                      <li>Parser semántico con LLM para desglosar letra chica y beneficios.</li>
                      <li>Deduplicación con clave única y Upsert en BD.</li>
                      <li>Expiración pasiva y baja por reportes comunitarios.</li>
                      <li>Feed unificado mobile-first con filtros y búsqueda.</li>
                      <li>Canje en 1-toque con copiado de cupón y deep link.</li>
                      <li>Bucle de retroalimentación inmediata post-canje.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">
                      🚫 Exclusiones Justificadas (Fuera de Alcance)
                    </h4>
                    <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                      <li>Sin login obligatorio ni contraseñas (cero fricción).</li>
                      <li>Sin carrito propio ni procesamiento de pagos.</li>
                      <li>Sin notificaciones push ni alertas en tiempo real.</li>
                      <li>Sin geolocalización GPS activa (reemplazada por selector de zona).</li>
                      <li>Sin logística ni backoffice de repartidores o restaurantes.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  readOnly
                  value={CAZADOR_README_MARKDOWN}
                  className="w-full h-[600px] p-4 rounded-2xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-300 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: INTERACTIVE MVP SIMULATOR                         */}
        {/* ======================================================== */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Top Bar for Simulator */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Simulador Interactivo del MVP CazadorDeOfertas
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    En Vivo
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Experimenta el flujo completo del cliente: preferencias sin login, feed de 3 marcas, motor de recomendación, canje en 1-toque, y bucle de feedback con semáforo de validez.
                </p>
              </div>

              {/* User Preferences Quick Widget */}
              <button
                onClick={() => setIsPrefModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-neutral-200 flex items-center gap-2 transition shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{userPreferences.zone}</span>
                <span className="text-neutral-500">·</span>
                <span className="text-amber-300">
                  {userPreferences.categories.join(', ') || 'Sin preferencias'}
                </span>
              </button>
            </div>

            {/* Feedback Prompt Floater (simulating return from restaurant app) */}
            {feedbackPrompt && (
              <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500 text-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 font-bold flex items-center justify-center text-lg">
                    ✨
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-300">
                      ¿Pudiste aprovechar la promo en {feedbackPrompt.brand}?
                    </h4>
                    <p className="text-xs text-neutral-300">
                      Tu voto alimenta el semáforo público de validez comunitaria de "{feedbackPrompt.title}".
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleFeedbackVote(feedbackPrompt.id, true)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    ¡Sí, me funcionó!
                  </button>
                  <button
                    onClick={() => handleFeedbackVote(feedbackPrompt.id, false)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    No funcionó
                  </button>
                  <button
                    onClick={() => setFeedbackPrompt(null)}
                    className="p-1.5 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Buscar combo, hamburguesa, helado o beneficio..."
                    value={searchOfferQuery}
                    onChange={(e) => setSearchOfferQuery(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Brand Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
                  {['all', 'McDonald\'s', 'Burger King', 'Mostaza'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-2 rounded-xl font-medium transition ${
                        selectedBrand === b
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {b === 'all' ? 'Todas las Marcas' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
                <span className="text-neutral-500 text-[11px] mr-1">Categorías:</span>
                {['all', 'Hamburguesas', 'Combos', 'Postres', 'Vegetariano'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition ${
                      selectedCategory === c
                        ? 'bg-neutral-800 text-amber-300 border border-amber-500/50'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {c === 'all' ? 'Todo el Menú' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => {
                const isFavoriteMatch = userPreferences.categories.includes(offer.category);

                return (
                  <div
                    key={offer.id}
                    className="rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between overflow-hidden shadow-lg"
                  >
                    {/* Header: Brand & Recommendation Tag */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5"
                          style={{ backgroundColor: `${offer.brandColor}22`, color: '#f0f6fc' }}
                        >
                          <span className="text-base">{offer.brandLogo}</span>
                          {offer.brand}
                        </span>

                        {/* Validity Semaphore */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-950 border border-neutral-800">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              offer.validityState === 'VERIFIED'
                                ? 'bg-emerald-500'
                                : offer.validityState === 'REVIEW'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="text-neutral-300">
                            {offer.validityState === 'VERIFIED'
                              ? 'Verificada'
                              : offer.validityState === 'REVIEW'
                              ? 'En Revisión'
                              : 'Alerta'}
                          </span>
                        </div>
                      </div>

                      {/* Transparent Recommendation Reason */}
                      {isFavoriteMatch && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-medium">
                          <Flame className="w-3 h-3 text-amber-400" />
                          Coincide con tu gusto por #{offer.category}
                        </div>
                      )}

                      <h3 className="font-bold text-base text-white line-clamp-2">
                        {offer.title}
                      </h3>

                      {/* Price & Savings */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-xl font-extrabold text-white">
                          ${offer.promoPrice.toLocaleString('es-AR')}
                        </span>
                        <span className="text-xs text-neutral-500 line-through">
                          ${offer.originalPrice.toLocaleString('es-AR')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                          {offer.discountPercentage}% OFF
                        </span>
                      </div>

                      <div className="text-xs text-neutral-400 flex items-center gap-1 pt-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        {offer.expirationText}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 pt-2 border-t border-neutral-800/80 bg-neutral-950/40 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOfferModal(offer)}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
                      >
                        Ver Letra Chica
                      </button>

                      <button
                        onClick={() => handleRedeemClick(offer)}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Canjear en 1-Toque
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: OAUTH & CONFIGURATION GUIDE                       */}
        {/* ======================================================== */}
        {activeTab === 'config' && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                Guía de Conexión con GitHub (OAuth & Personal Access Token)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Para interactuar directamente con tu repositorio{' '}
                <strong className="text-amber-400">{targetOwner}/{targetRepo}</strong> (crear issues y actualizar el README), sigue uno de los dos métodos:
              </p>
            </div>

            {/* Method A: Direct PAT (Fastest) */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Opción 1: Personal Access Token (PAT) — Conexión Inmediata
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Recomendado para testing rápido
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Genera un token de GitHub con permisos de <code className="bg-neutral-800 px-1 py-0.5 rounded text-amber-300">repo</code> y pégalo directamente en la aplicación:
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=CazadorDeOfertas+Hub"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-neutral-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Generar Token en GitHub (1 Clic)
                </a>
                <button
                  onClick={() => setIsPatModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Pegar Token PAT
                </button>
              </div>
            </div>

            {/* Method B: OAuth App Settings */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Opción 2: Configurar OAuth App en GitHub (Login con Popup)
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Si deseas habilitar el inicio de sesión con ventana emergente estándar para cualquier usuario:
              </p>

              <ol className="text-xs text-neutral-300 space-y-3 list-decimal list-inside leading-relaxed">
                <li>
                  Ingresa a{' '}
                  <a
                    href="https://github.com/settings/developers"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline font-mono"
                  >
                    GitHub Developer Settings &gt; OAuth Apps
                  </a>{' '}
                  y crea una <strong>New OAuth App</strong>.
                </li>
                <li>
                  Configura exactamente las siguientes URLs de retorno (Callback URLs):
                  <div className="mt-2 space-y-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Development Callback URL:</span>
                        <span className="text-amber-300">
                          https://ais-dev-m4ztqwcazbjkhs6ozdrlro-474861943942.us-east5.run.app/auth/callback
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            'https://ais-dev-m4ztqwcazbjkhs6ozdrlro-474861943942.us-east5.run.app/auth/callback',
                            'cb-dev'
                          )
                        }
                        className="p-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                      >
                        {copiedId === 'cb-dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Shared / Deployed Callback URL:</span>
                        <span className="text-amber-300">
                          https://ais-pre-m4ztqwcazbjkhs6ozdrlro-474861943942.us-east5.run.app/auth/callback
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            'https://ais-pre-m4ztqwcazbjkhs6ozdrlro-474861943942.us-east5.run.app/auth/callback',
                            'cb-pre'
                          )
                        }
                        className="p-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                      >
                        {copiedId === 'cb-pre' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </li>
                <li>
                  Configura las variables de entorno en el panel de AI Studio:
                  <div className="mt-1 font-mono text-[11px] bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 space-y-1">
                    <div>GITHUB_CLIENT_ID="tu_client_id"</div>
                    <div>GITHUB_CLIENT_SECRET="tu_client_secret"</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: PERSONAL ACCESS TOKEN INPUT                       */}
      {/* ======================================================== */}
      {isPatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Ingresar GitHub Personal Access Token
              </h3>
              <button
                onClick={() => setIsPatModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Pega un token con permiso <code className="text-amber-300 bg-neutral-800 px-1 py-0.5 rounded">repo</code> para crear las issues y actualizar el README directamente en{' '}
              <strong className="text-white">{targetOwner}/{targetRepo}</strong>.
            </p>

            <div>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=CazadorDeOfertas+Studio"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                Crear token en GitHub
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsPatModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePat}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Guardar y Conectar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: OFFER LETRA CHICA & DETAILS                       */}
      {/* ======================================================== */}
      {selectedOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span
                className="px-2.5 py-1 rounded text-xs font-bold"
                style={{ backgroundColor: `${selectedOfferModal.brandColor}33`, color: '#fff' }}
              >
                {selectedOfferModal.brandLogo} {selectedOfferModal.brand}
              </span>
              <button
                onClick={() => setSelectedOfferModal(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-lg text-white">{selectedOfferModal.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Categoría: <strong className="text-neutral-200">{selectedOfferModal.category}</strong>
              </p>
            </div>

            {/* Price Box */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-500 block">Precio Promocional</span>
                <span className="text-2xl font-black text-white">
                  ${selectedOfferModal.promoPrice.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500 block">Precio Original</span>
                <span className="text-sm line-through text-neutral-400">
                  ${selectedOfferModal.originalPrice.toLocaleString('es-AR')}
                </span>
                <span className="text-xs font-bold text-emerald-400 ml-2">
                  (Ahorras ${(selectedOfferModal.originalPrice - selectedOfferModal.promoPrice).toLocaleString('es-AR')})
                </span>
              </div>
            </div>

            {/* Conditions / Letra chica */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-neutral-300">Condiciones y Letra Chica:</h4>
              <ul className="space-y-1 text-neutral-400 list-disc list-inside">
                {selectedOfferModal.conditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-neutral-400 space-y-1">
              <div>
                <strong>Medios de Pago:</strong> {selectedOfferModal.paymentMethods.join(', ')}
              </div>
              <div>
                <strong>Última Verificación:</strong> {selectedOfferModal.lastVerified}
              </div>
              {selectedOfferModal.requiresApp && (
                <div className="text-amber-400 font-medium">
                  ⚠️ Requiere tener instalada la App oficial de {selectedOfferModal.brand}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <button
                onClick={() => {
                  setReportModalOffer(selectedOfferModal);
                  setSelectedOfferModal(null);
                }}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <Flag className="w-3 h-3" />
                Reportar oferta vencida
              </button>

              <button
                onClick={() => {
                  handleRedeemClick(selectedOfferModal);
                  setSelectedOfferModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                Canjear Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REPORT EXPIRED OFFER                              */}
      {/* ======================================================== */}
      {reportModalOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-rose-400 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Reportar Problema con la Oferta
              </h3>
              <button
                onClick={() => setReportModalOffer(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Oferta: <strong>{reportModalOffer.title}</strong> ({reportModalOffer.brand})
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-neutral-400 block">Motivo del reporte:</label>
              {[
                'Oferta ya no está disponible / Vencida',
                'El precio en el local es diferente',
                'El código de cupón no funciona',
                'El enlace está roto o no abre la promo',
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700"
                >
                  <input
                    type="radio"
                    name="report_reason"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="accent-amber-500"
                  />
                  <span className="text-neutral-300">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReportModalOffer(null)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Enviar Reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: USER PREFERENCES (Agile Onboarding Without Login)  */}
      {/* ======================================================== */}
      {isPrefModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Preferencias de Comida y Zona
              </h3>
              <button
                onClick={() => setIsPrefModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Selecciona hasta 3 categorías favoritas para priorizar tus promociones sin necesidad de registrarte con contraseña.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Tu Zona Geográfica:</label>
                <select
                  value={userPreferences.zone}
                  onChange={(e) =>
                    setUserPreferences((prev) => ({ ...prev, zone: e.target.value }))
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Córdoba Capital">Córdoba Capital</option>
                  <option value="CABA (Buenos Aires)">CABA (Buenos Aires)</option>
                  <option value="GBA Norte">GBA Norte</option>
                  <option value="GBA Sur / Oeste">GBA Sur / Oeste</option>
                  <option value="Rosario">Rosario</option>
                  <option value="Mendoza">Mendoza</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1.5">
                  Categorías favoritas (máx. 3):
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Hamburguesas', 'Combos', 'Postres', 'Vegetariano'].map((cat) => {
                    const isSelected = userPreferences.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setUserPreferences((prev) => {
                            if (isSelected) {
                              return {
                                ...prev,
                                categories: prev.categories.filter((c) => c !== cat),
                              };
                            } else {
                              if (prev.categories.length >= 3) return prev;
                              return { ...prev, categories: [...prev.categories, cat] };
                            }
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('cazador_user_prefs', JSON.stringify(userPreferences));
                  setIsPrefModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
