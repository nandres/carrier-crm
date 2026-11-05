import { SNAPSHOT_VERSION } from '../domain/seed';
import type { Snapshot } from '../domain/types';

/** The app only talks to this interface; a real API can replace the browser version. */
export interface CrmRepository {
  load(): Snapshot | null;
  save(snapshot: Snapshot): void;
  clear(): void;
}

const KEY = 'carrier.crm.snapshot';

export const browserRepository: CrmRepository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Snapshot;
      const valid = parsed.version === SNAPSHOT_VERSION && [parsed.clients, parsed.invoices, parsed.activities].every(Array.isArray);
      return valid ? parsed : null;
    } catch {
      return null;
    }
  },
  save(snapshot) {
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch {
      // Private windows can refuse storage: the demo keeps working until the tab closes.
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Same as above.
    }
  },
};
