import Dexie, { type EntityTable } from 'dexie';

export interface OfflineRecord {
  id?: number;
  sessionId: string;
  type: 'session' | 'history' | 'ayush' | 'document';
  data: any;
  createdAt: string;
  synced: boolean;
}

class SwaasthSaathiDB extends Dexie {
  offlineRecords!: EntityTable<OfflineRecord, 'id'>;

  constructor() {
    super('SwaasthSaathiOfflineDB');
    this.version(1).stores({
      offlineRecords: '++id, sessionId, type, synced, createdAt',
    });
  }
}

export const db = new SwaasthSaathiDB();
