import React, { useEffect, useState } from 'react';
import { syncService } from '../services/syncService';
import { SyncState } from '../types';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, ServerOff, CheckCircle2 } from 'lucide-react';

export const SyncStatusBar: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>(syncService.getState());

  useEffect(() => {
    return syncService.subscribe((state) => {
      setSyncState(state);
    });
  }, []);

  const handleManualSync = () => {
    syncService.triggerSync();
  };

  if (syncState.status === 'OFFLINE') {
    return (
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-amber-300 text-xs sm:text-sm flex items-center justify-between transition-all">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong>Sin conexión</strong> — mostrando la última versión disponible en este dispositivo.
          </span>
        </div>
        {syncState.pendingQueue.length > 0 && (
          <span className="bg-amber-500/30 px-2 py-0.5 rounded text-amber-200 text-xs font-medium">
            {syncState.pendingQueue.length} pendiente{syncState.pendingQueue.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  if (syncState.status === 'SERVER_UNAVAILABLE') {
    return (
      <div className="bg-orange-500/15 border-b border-orange-500/30 px-4 py-2 text-orange-300 text-xs sm:text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ServerOff className="w-4 h-4 text-orange-400 shrink-0" />
          <span>
            <strong>Servidor no disponible</strong> — trabajando en modo local. Los cambios se sincronizarán al restablecerse.
          </span>
        </div>
        <button
          onClick={handleManualSync}
          className="bg-orange-500/30 hover:bg-orange-500/50 px-2.5 py-1 rounded text-orange-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Reintentar
        </button>
      </div>
    );
  }

  if (syncState.status === 'SYNC_ERROR') {
    return (
      <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Error de sincronización</strong> — reintentando automáticamente con backoff exponencial ({syncState.pendingQueue.length} pendiente{syncState.pendingQueue.length > 1 ? 's' : ''}).
          </span>
        </div>
        <button
          onClick={handleManualSync}
          className="bg-rose-500/30 hover:bg-rose-500/50 px-2.5 py-1 rounded text-rose-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Forzar sync
        </button>
      </div>
    );
  }

  if (syncState.status === 'SYNCING') {
    return (
      <div className="bg-sky-500/15 border-b border-sky-500/30 px-4 py-1.5 text-sky-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
          <span>Sincronizando operaciones con el servidor...</span>
        </div>
        <span className="text-sky-400/80 font-mono text-[11px]">Outbox: {syncState.pendingQueue.length}</span>
      </div>
    );
  }

  // ONLINE status - subtle pill in header or minimal indicator
  return null;
};
