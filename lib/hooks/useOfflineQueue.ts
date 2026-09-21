import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/db/offlineDB';

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const checkSyncCount = useCallback(async () => {
    try {
      const count = await db.offlineRecords.where('synced').equals(0).count();
      setPendingSyncCount(count);
    } catch (e) {
      console.warn('IndexedDB count failed', e);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        syncPendingData();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      checkSyncCount();

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [checkSyncCount]);

  const saveOffline = async (sessionId: string, type: 'session' | 'history' | 'ayush' | 'document', data: any) => {
    try {
      await db.offlineRecords.add({
        sessionId,
        type,
        data,
        createdAt: new Date().toISOString(),
        synced: false,
      });
      await checkSyncCount();
    } catch (e) {
      console.error('Save offline failed', e);
    }
  };

  const syncPendingData = async () => {
    try {
      const pending = await db.offlineRecords.where('synced').equals(0).toArray();
      if (pending.length === 0) return;

      for (const record of pending) {
        // Simulate API sync
        if (record.id) {
          await db.offlineRecords.update(record.id, { synced: true });
        }
      }
      await checkSyncCount();
    } catch (e) {
      console.error('Sync failed', e);
    }
  };

  return { isOnline, pendingSyncCount, saveOffline, syncPendingData };
}
