import { OutboxOperation, SyncState, SyncStatusType } from '../types';
import { storageService } from './storageService';

type SyncListener = (state: SyncState) => void;

class SyncManager {
  private queue: OutboxOperation[] = [];
  private listeners: Set<SyncListener> = new Set();
  private isProcessing = false;
  private syncTimer: any = null;
  private healthCheckTimer: any = null;
  
  private currentState: SyncState = {
    status: typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'ONLINE',
    lastSyncTime: storageService.getLastSyncTime(),
    pendingQueue: [],
    isServerReachable: true,
    isNetworkOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };

  constructor() {
    this.queue = storageService.getSyncQueue();
    this.currentState.pendingQueue = [...this.queue];

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      
      // Periodic health check and queue flush
      this.healthCheckTimer = setInterval(() => {
        this.checkHealthAndSync();
      }, 12000);

      // Initial check
      setTimeout(() => this.checkHealthAndSync(), 1000);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): SyncState {
    return {
      ...this.currentState,
      pendingQueue: [...this.queue],
    };
  }

  private notify() {
    this.currentState.pendingQueue = [...this.queue];
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  private setStatus(status: SyncStatusType, isServerReachable = true) {
    this.currentState.status = status;
    this.currentState.isServerReachable = isServerReachable;
    this.notify();
  }

  private handleNetworkChange(isOnline: boolean) {
    this.currentState.isNetworkOnline = isOnline;
    if (!isOnline) {
      this.setStatus('OFFLINE', false);
    } else {
      this.setStatus('SYNCING', true);
      this.checkHealthAndSync();
    }
  }

  public enqueue(entity: OutboxOperation['entity'], action: OutboxOperation['action'], payload: any) {
    const op: OutboxOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      entity,
      action,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(op);
    storageService.saveSyncQueue(this.queue);
    this.notify();

    // Trigger sync
    this.triggerSync();
  }

  public async checkHealthAndSync(): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setStatus('OFFLINE', false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('/api/health', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.currentState.isServerReachable = true;
        if (this.queue.length > 0) {
          await this.processQueue();
        } else {
          this.setStatus('ONLINE', true);
        }
      } else {
        this.setStatus('SERVER_UNAVAILABLE', false);
      }
    } catch {
      // Server unreachable or connection timeout
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.setStatus('OFFLINE', false);
      } else {
        this.setStatus('SERVER_UNAVAILABLE', false);
      }
    }
  }

  public triggerSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.processQueue();
    }, 300);
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (this.queue.length === 0) {
      this.setStatus('ONLINE', true);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setStatus('OFFLINE', false);
      return;
    }

    this.isProcessing = true;
    this.setStatus('SYNCING', true);

    try {
      const batch = [...this.queue];
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations: batch }),
      });

      if (!res.ok) {
        throw new Error(`Sync server responded with ${res.status}`);
      }

      const data = await res.json();
      
      // Successfully processed operations
      const syncedIds = new Set<string>(data.syncedIds || batch.map(b => b.id));
      this.queue = this.queue.filter(op => !syncedIds.has(op.id));
      storageService.saveSyncQueue(this.queue);

      const now = Date.now();
      this.currentState.lastSyncTime = now;
      storageService.setLastSyncTime(now);

      this.setStatus(this.queue.length > 0 ? 'SYNC_ERROR' : 'ONLINE', true);
    } catch (err: any) {
      console.warn('Sync failed, backing off:', err);
      // Increment retries
      this.queue.forEach((op) => {
        op.retryCount += 1;
        op.lastError = err.message || 'Unknown network error';
      });
      storageService.saveSyncQueue(this.queue);

      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (isOffline) {
        this.setStatus('OFFLINE', false);
      } else {
        this.setStatus('SYNC_ERROR', true);
      }

      // Exponential backoff
      const nextDelay = Math.min(1000 * Math.pow(2, (this.queue[0]?.retryCount || 1)), 16000);
      if (this.syncTimer) clearTimeout(this.syncTimer);
      this.syncTimer = setTimeout(() => this.processQueue(), nextDelay);
    } finally {
      this.isProcessing = false;
      this.notify();
    }
  }

  public clearQueue(): void {
    this.queue = [];
    storageService.saveSyncQueue(this.queue);
    this.setStatus('ONLINE', true);
  }
}

export const syncService = new SyncManager();
