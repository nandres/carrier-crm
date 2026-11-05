export type Lang = 'en' | 'es';

/** Sample content ships in both languages; anything a person types is a plain string. */
export type Text = string | { en: string; es: string };

export const STATIONS = ['proposal', 'invoiced', 'due', 'overdue', 'paid'] as const;
export type BoardStation = (typeof STATIONS)[number];
export type Station = BoardStation | 'cancelled';

export type InvoiceStatus = 'proposal' | 'issued' | 'cancelled';
export type ActivityKind = 'note' | 'call' | 'email' | 'reminder' | 'system';

export interface Client {
  id: string;
  name: Text;
  contact: string;
  email: string;
  phone: string;
  city: string;
  /** Days to pay an invoice, agreed with this client. */
  terms: number;
  /** The one thing worth knowing before asking this client for money. */
  howTheyPay: Text;
}

export interface Payment {
  at: string;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  title: Text;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
  issuedAt?: string;
  dueAt?: string;
  lastChasedAt?: string;
  payments: Payment[];
}

export interface Activity {
  id: string;
  invoiceId: string;
  kind: ActivityKind;
  body: Text;
  at: string;
}

export interface Snapshot {
  version: number;
  clients: Client[];
  invoices: Invoice[];
  activities: Activity[];
}
