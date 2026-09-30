import React, { useState, useEffect } from 'react';
import { SyncState, Table } from '../types';
import { syncService } from '../services/syncService';
import {
  UtensilsCrossed,
  LayoutDashboard,
  Wifi,
  WifiOff,
  RefreshCw,
  ServerOff,
  AlertTriangle,
  Download,
  Eye,
  CheckCircle2,
  ChefHat,
  Bell,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'client' | 'kds';
  onSwitchView: (view: 'dashboard' | 'client' | 'kds') => void;
  activeTable?: Table | null;
  pendingAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSwitchView,
  activeTable,
  pendingAlertsCount = 0,
}) => {
  const [syncState, setSyncState] = useState<SyncState>(syncService.getState());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const unsub = syncService.subscribe((state) => {
      setSyncState(state);
    });

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      unsub();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-3 py-2 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => onSwitchView('client')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            title="MESAvision Carta Digital"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-sm shadow">
              MV
            </span>
            <span className="text-sm font-black text-white tracking-tight hidden md:inline">
              MESAvision
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* View Switcher Pill */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => onSwitchView('client')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'client'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Carta</span>
            </button>

            <button
              onClick={() => onSwitchView('kds')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                currentView === 'kds'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Cocina & Sala</span>
              {pendingAlertsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-mono font-black animate-pulse">
                  {pendingAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSwitchView('dashboard')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>

        {/* Right side status & PWA button */}
        <div className="flex items-center gap-2">
          {/* Active Table indicator if in client view */}
          {currentView === 'client' && activeTable && (
            <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl text-[11px] font-bold hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>{activeTable.name}</span>
            </span>
          )}

          {/* Sync Status Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px]">
            {syncState.status === 'ONLINE' && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden md:inline">Sincronizado</span>
              </span>
            )}

            {syncState.status === 'SYNCING' && (
              <span className="flex items-center gap-1 text-sky-400 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="hidden md:inline">Sincronizando</span>
              </span>
            )}

            {syncState.status === 'OFFLINE' && (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}

            {syncState.status === 'SERVER_UNAVAILABLE' && (
              <span className="flex items-center gap-1 text-orange-400 font-medium">
                <ServerOff className="w-3 h-3" />
                <span className="hidden sm:inline">Local</span>
              </span>
            )}

            {syncState.status === 'SYNC_ERROR' && (
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <AlertTriangle className="w-3 h-3" />
                <span>Error Sync</span>
              </span>
            )}
          </div>

          {/* PWA Install Button */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstallPWA}
              className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
