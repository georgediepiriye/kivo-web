import Dexie, { Table } from "dexie";

export interface PendingSync {
  id?: number;
  checkInCode: string;
  eventId: string;
  timestamp: number;
}

export interface LocalTicket {
  id: string;
  checkInCode: string;
  guestName: string;
  tier: string;
  status: string;
  updatedAt: number;
}

export class KivoScannerDB extends Dexie {
  tickets!: Table<LocalTicket>;
  outbox!: Table<PendingSync>;

  constructor() {
    super("KivoScannerDB");
    this.version(2).stores({
      tickets: "id, checkInCode, status, updatedAt",
      outbox: "++id, checkInCode",
    });
  }
}

export const db = new KivoScannerDB();
