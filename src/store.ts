import { create } from 'zustand';
import { browserRepository as repository } from './data/repository';
import { moveTo, recordPayment, stationOf } from './domain/ledger';
import { createSeed } from './domain/seed';
import type { Activity, ActivityKind, Client, Invoice, Lang, Snapshot, Station, Text } from './domain/types';

export type Panel =
  | { type: 'invoice'; id: string }
  | { type: 'client'; id: string }
  | { type: 'new-invoice'; clientId?: string; issued?: boolean }
  | { type: 'new-client' }
  | { type: 'cancelled' }
  | null;

interface Toast {
  id: number;
  message: Text;
  undo?: Snapshot;
  tone?: 'refusal';
}

/** A capsule currently travelling between two tubes. */
export interface Flight {
  key: number;
  invoiceId: string;
  from: Station;
  to: Station;
}

interface CrmState extends Snapshot {
  lang: Lang;
  panel: Panel;
  /** The client whose capsules stay lit on every screen. */
  litClientId: string | null;
  toast: Toast | null;
  flight: Flight | null;
  paletteOpen: boolean;
  setLang(lang: Lang): void;
  setPanel(panel: Panel): void;
  setPaletteOpen(open: boolean): void;
  dismissToast(): void;
  undo(): void;
  moveInvoice(id: string, target: Station): void;
  updateInvoice(id: string, patch: Partial<Pick<Invoice, 'title' | 'dueAt'>>): void;
  addInvoice(input: { title: string; clientId: string; amount: number; issued: boolean }): string;
  pay(id: string, amount: number): void;
  addClient(input: { name: string; contact: string; email: string; phone: string; city: string; terms: number; howTheyPay: string }): string;
  updateClient(id: string, patch: Partial<Pick<Client, 'howTheyPay'>>): void;
  addActivity(invoiceId: string, kind: ActivityKind, body: Text): void;
  logReminder(id: string): void;
  resetDemo(): void;
}

const snapshotOf = (state: Snapshot): Snapshot => ({
  version: state.version,
  clients: state.clients,
  invoices: state.invoices,
  activities: state.activities,
});

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('carrier.lang');
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    // Storage blocked: fall through to the English default.
  }
  return 'en';
}

let counter = Date.now();
const newId = (prefix: string) => `${prefix}${(counter++).toString(36)}`;

const EVENT_TEXT: Record<'issued' | 'paid' | 'reopened' | 'unissued' | 'cancelled' | 'restored', Text> = {
  issued: { en: 'Invoice issued.', es: 'Factura emitida.' },
  paid: { en: 'Payment recorded in full.', es: 'Pago registrado por el total.' },
  reopened: { en: 'Last payment removed: invoice reopened.', es: 'Último pago quitado: factura reabierta.' },
  unissued: { en: 'Back to proposal.', es: 'Volvió a propuesta.' },
  cancelled: { en: 'Cancelled.', es: 'Cancelada.' },
  restored: { en: 'Restored.', es: 'Restaurada.' },
};

const REFUSAL_TEXT: Record<'date-decides' | 'invoice-first' | 'has-payments', Text> = {
  'date-decides': {
    en: 'Only the date moves an invoice here. Change its due date in the invoice.',
    es: 'A esta estación la lleva solo la fecha. Cambiá el vencimiento en la factura.',
  },
  'invoice-first': {
    en: 'A proposal can’t be paid yet. Drop it on Invoiced first.',
    es: 'Una propuesta todavía no se puede cobrar. Soltala primero en Facturadas.',
  },
  'has-payments': {
    en: 'This invoice has payments. Remove them before doing that.',
    es: 'Esta factura tiene pagos. Quitalos antes de hacer eso.',
  },
};

export const useCrm = create<CrmState>((set, get) => ({
  ...(repository.load() ?? createSeed()),
  lang: initialLang(),
  panel: null,
  litClientId: null,
  toast: null,
  flight: null,
  paletteOpen: false,

  setLang(lang) {
    try {
      localStorage.setItem('carrier.lang', lang);
    } catch {
      // Language still changes for this visit.
    }
    document.documentElement.lang = lang;
    set({ lang });
  },
  setPanel(panel) {
    const state = get();
    let litClientId: string | null = null;
    if (panel?.type === 'invoice') litClientId = state.invoices.find((i) => i.id === panel.id)?.clientId ?? null;
    if (panel?.type === 'client') litClientId = panel.id;
    set({ panel, litClientId });
  },
  setPaletteOpen(paletteOpen) {
    set({ paletteOpen });
  },
  dismissToast() {
    set({ toast: null });
  },
  undo() {
    const undo = get().toast?.undo;
    if (undo) set({ ...undo, toast: null, flight: null });
  },

  moveInvoice(id, target) {
    const state = get();
    const invoice = state.invoices.find((i) => i.id === id);
    if (!invoice) return;
    const now = new Date();
    const client = state.clients.find((c) => c.id === invoice.clientId);
    const result = moveTo(invoice, target, client, now);
    if (!result.ok) {
      if (result.reason !== 'no-change') {
        set({ toast: { id: Date.now(), message: REFUSAL_TEXT[result.reason], tone: 'refusal' } });
      }
      return;
    }
    const activity: Activity = { id: newId('a'), invoiceId: id, kind: 'system', body: EVENT_TEXT[result.event], at: now.toISOString() };
    set({
      invoices: state.invoices.map((i) => (i.id === id ? result.invoice : i)),
      activities: [...state.activities, activity],
      toast: { id: Date.now(), message: EVENT_TEXT[result.event], undo: snapshotOf(state) },
      flight: { key: Date.now(), invoiceId: id, from: stationOf(invoice, now), to: stationOf(result.invoice, now) },
    });
  },
  updateInvoice(id, patch) {
    set((state) => ({ invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  },
  addInvoice({ title, clientId, amount, issued }) {
    const state = get();
    const now = new Date();
    const id = newId('i');
    const highest = state.invoices.reduce((max, i) => Math.max(max, Number(i.number.replace(/\D/g, '')) || 0), 2040);
    const terms = state.clients.find((c) => c.id === clientId)?.terms ?? 30;
    const invoice: Invoice = {
      id,
      number: `INV-${highest + 1}`,
      clientId,
      title,
      amount,
      status: issued ? 'issued' : 'proposal',
      createdAt: now.toISOString(),
      issuedAt: issued ? now.toISOString() : undefined,
      dueAt: issued ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + terms, 17).toISOString() : undefined,
      payments: [],
    };
    set({ invoices: [...state.invoices, invoice] });
    return id;
  },
  pay(id, amount) {
    const state = get();
    const invoice = state.invoices.find((i) => i.id === id);
    if (!invoice) return;
    const now = new Date();
    const updated = recordPayment(invoice, amount, now);
    if (updated === invoice) return;
    const message: Text = { en: 'Payment recorded.', es: 'Pago registrado.' };
    const activity: Activity = { id: newId('a'), invoiceId: id, kind: 'system', body: message, at: now.toISOString() };
    const from = stationOf(invoice, now);
    const to = stationOf(updated, now);
    set({
      invoices: state.invoices.map((i) => (i.id === id ? updated : i)),
      activities: [...state.activities, activity],
      toast: { id: Date.now(), message, undo: snapshotOf(state) },
      flight: from === to ? state.flight : { key: Date.now(), invoiceId: id, from, to },
    });
  },
  addClient(input) {
    const id = newId('c');
    set((state) => ({ clients: [...state.clients, { id, ...input }] }));
    return id;
  },
  updateClient(id, patch) {
    set((state) => ({ clients: state.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  },
  addActivity(invoiceId, kind, body) {
    const activity: Activity = { id: newId('a'), invoiceId, kind, body, at: new Date().toISOString() };
    set((state) => ({ activities: [...state.activities, activity] }));
  },
  logReminder(id) {
    const state = get();
    const now = new Date().toISOString();
    const message: Text = { en: 'Reminder logged.', es: 'Recordatorio registrado.' };
    const activity: Activity = { id: newId('a'), invoiceId: id, kind: 'reminder', body: message, at: now };
    set({
      invoices: state.invoices.map((i) => (i.id === id ? { ...i, lastChasedAt: now } : i)),
      activities: [...state.activities, activity],
      toast: { id: Date.now(), message, undo: snapshotOf(state) },
    });
  },
  resetDemo() {
    repository.clear();
    set({
      ...createSeed(),
      panel: null,
      litClientId: null,
      flight: null,
      toast: { id: Date.now(), message: { en: 'Sample data restored.', es: 'Datos de ejemplo restaurados.' } },
    });
  },
}));

let lastSaved: Snapshot | null = null;
useCrm.subscribe((state) => {
  if (lastSaved && lastSaved.invoices === state.invoices && lastSaved.clients === state.clients && lastSaved.activities === state.activities) {
    return;
  }
  lastSaved = snapshotOf(state);
  repository.save(lastSaved);
});
