import type { BoardStation, Client, Invoice, Station } from './types';

export const DAY = 86_400_000;
/** "Due soon" means within this many days. */
export const DUE_SOON_DAYS = 7;
/** Paid invoices leave the Paid tube after this long, but stay in the numbers. */
export const PAID_WINDOW_DAYS = 30;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** Amounts are stored as dollars with up to two decimals; this avoids float drift. */
const cents = (value: number) => Math.round(value * 100);
export const sum = (values: number[]) => values.reduce((total, value) => total + cents(value), 0) / 100;

export const paidSoFar = (invoice: Invoice) => sum(invoice.payments.map((p) => p.amount));
export const balance = (invoice: Invoice) => (cents(invoice.amount) - cents(paidSoFar(invoice))) / 100;

/** Whole days until the due date; negative when late. */
export function daysToDue(invoice: Invoice, now: Date): number {
  if (!invoice.dueAt) return 0;
  return Math.round((startOfDay(new Date(invoice.dueAt)) - startOfDay(now)) / DAY);
}

export function stationOf(invoice: Invoice, now: Date): Station {
  if (invoice.status === 'cancelled') return 'cancelled';
  if (invoice.status === 'proposal') return 'proposal';
  if (balance(invoice) <= 0) return 'paid';
  const days = daysToDue(invoice, now);
  if (days < 0) return 'overdue';
  return days <= DUE_SOON_DAYS ? 'due' : 'invoiced';
}

export const lastPaymentAt = (invoice: Invoice) =>
  invoice.payments.reduce<string | undefined>((latest, p) => (!latest || p.at > latest ? p.at : latest), undefined);

/** What a tube shows: paid work leaves after the window so the tube stays readable. */
export function onBoard(invoice: Invoice, now: Date): boolean {
  const station = stationOf(invoice, now);
  if (station === 'cancelled') return false;
  if (station !== 'paid') return true;
  const paid = lastPaymentAt(invoice);
  return !!paid && now.getTime() - new Date(paid).getTime() <= PAID_WINDOW_DAYS * DAY;
}

/** The amount a capsule shows: what is still owed, or the full value once paid or proposed. */
export function capsuleAmount(invoice: Invoice, now: Date): number {
  const station = stationOf(invoice, now);
  return station === 'paid' || station === 'proposal' ? invoice.amount : balance(invoice);
}

export function stationTotals(invoices: Invoice[], now: Date) {
  const shown = invoices.filter((invoice) => onBoard(invoice, now));
  const stations: BoardStation[] = ['proposal', 'invoiced', 'due', 'overdue', 'paid'];
  return stations.map((station) => {
    const inTube = shown.filter((invoice) => stationOf(invoice, now) === station);
    return { station, count: inTube.length, value: sum(inTube.map((invoice) => capsuleAmount(invoice, now))) };
  });
}

const isOpen = (invoice: Invoice, now: Date) => ['invoiced', 'due', 'overdue'].includes(stationOf(invoice, now));

export function outstanding(invoices: Invoice[], now: Date): number {
  return sum(invoices.filter((invoice) => isOpen(invoice, now)).map(balance));
}

export function overdueTotal(invoices: Invoice[], now: Date): number {
  return sum(invoices.filter((invoice) => stationOf(invoice, now) === 'overdue').map(balance));
}

/** Everything still owed, by how late it is. Buckets always add up to `outstanding`. */
export function agingBuckets(invoices: Invoice[], now: Date) {
  const buckets = [
    { id: 'current', from: -Infinity, to: 0 },
    { id: 'late30', from: 1, to: 30 },
    { id: 'late60', from: 31, to: 60 },
    { id: 'late61', from: 61, to: Infinity },
  ] as const;
  const totals = buckets.map((bucket) => ({ ...bucket, value: 0, count: 0 }));
  for (const invoice of invoices) {
    if (!isOpen(invoice, now)) continue;
    const late = -daysToDue(invoice, now);
    const slot = totals.find((bucket) => late >= bucket.from && late <= bucket.to);
    if (slot) {
      slot.value = sum([slot.value, balance(invoice)]);
      slot.count += 1;
    }
  }
  return totals;
}

/** Money due in each of the next weeks. Week 0 also holds everything already late. */
export function expectedByWeek(invoices: Invoice[], now: Date, weeks = 8) {
  const slots = Array.from({ length: weeks }, (_, index) => ({
    week: index,
    start: new Date(startOfDay(now) + index * 7 * DAY),
    value: 0,
    count: 0,
  }));
  for (const invoice of invoices) {
    if (!isOpen(invoice, now)) continue;
    const week = Math.max(0, Math.floor(daysToDue(invoice, now) / 7));
    if (week >= weeks) continue;
    slots[week].value = sum([slots[week].value, balance(invoice)]);
    slots[week].count += 1;
  }
  return slots;
}

/** Money received per month for the 12 months ending at `now`, oldest first. */
export function collectedByMonth(invoices: Invoice[], now: Date) {
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return { year: date.getFullYear(), month: date.getMonth(), value: 0, count: 0 };
  });
  for (const invoice of invoices) {
    for (const payment of invoice.payments) {
      const date = new Date(payment.at);
      const slot = months.find((m) => m.year === date.getFullYear() && m.month === date.getMonth());
      if (slot) {
        slot.value = sum([slot.value, payment.amount]);
        slot.count += 1;
      }
    }
  }
  return months;
}

/** Average days from issue to final payment, over fully paid invoices. Null with no history. */
export function averageDaysToPay(invoices: Invoice[]): number | null {
  const durations = invoices
    .filter((invoice) => invoice.issuedAt && invoice.status === 'issued' && balance(invoice) <= 0 && invoice.payments.length > 0)
    .map((invoice) => (new Date(lastPaymentAt(invoice)!).getTime() - new Date(invoice.issuedAt!).getTime()) / DAY);
  if (durations.length === 0) return null;
  return Math.round(durations.reduce((total, days) => total + days, 0) / durations.length);
}

export type MoveResult =
  | { ok: true; invoice: Invoice; event: 'issued' | 'paid' | 'reopened' | 'unissued' | 'cancelled' | 'restored' }
  | { ok: false; reason: 'date-decides' | 'invoice-first' | 'has-payments' | 'no-change' };

/**
 * What dragging a capsule means. Only people issue, get paid or cancel;
 * whether an invoice is due soon or overdue is decided by its date alone.
 */
export function moveTo(invoice: Invoice, target: Station, client: Client | undefined, now: Date): MoveResult {
  const current = stationOf(invoice, now);
  if (current === target) return { ok: false, reason: 'no-change' };
  const iso = now.toISOString();

  if (target === 'cancelled') {
    if (invoice.payments.length > 0) return { ok: false, reason: 'has-payments' };
    return { ok: true, event: 'cancelled', invoice: { ...invoice, status: 'cancelled' } };
  }
  if (current === 'cancelled') {
    return { ok: true, event: 'restored', invoice: { ...invoice, status: invoice.issuedAt ? 'issued' : 'proposal' } };
  }
  if (target === 'paid') {
    if (current === 'proposal') return { ok: false, reason: 'invoice-first' };
    return { ok: true, event: 'paid', invoice: { ...invoice, payments: [...invoice.payments, { at: iso, amount: balance(invoice) }] } };
  }
  if (current === 'paid') {
    if (target === 'proposal') return { ok: false, reason: 'has-payments' };
    return { ok: true, event: 'reopened', invoice: { ...invoice, payments: invoice.payments.slice(0, -1) } };
  }
  if (target === 'proposal') {
    if (invoice.payments.length > 0) return { ok: false, reason: 'has-payments' };
    return { ok: true, event: 'unissued', invoice: { ...invoice, status: 'proposal', issuedAt: undefined, dueAt: undefined } };
  }
  if (current === 'proposal') {
    if (target === 'overdue') return { ok: false, reason: 'date-decides' };
    const due = new Date(startOfDay(now) + (client?.terms ?? 30) * DAY + 17 * 3_600_000);
    return { ok: true, event: 'issued', invoice: { ...invoice, status: 'issued', issuedAt: iso, dueAt: due.toISOString() } };
  }
  return { ok: false, reason: 'date-decides' };
}

/** Records part or all of a payment. Refuses nothing above the balance silently: it caps it. */
export function recordPayment(invoice: Invoice, amount: number, now: Date): Invoice {
  const capped = Math.min(amount, balance(invoice));
  if (capped <= 0) return invoice;
  return { ...invoice, payments: [...invoice.payments, { at: now.toISOString(), amount: capped }] };
}

/** Who to chase first: most money, longest late. */
export function chaseOrder(invoices: Invoice[], now: Date): Invoice[] {
  const score = (invoice: Invoice) => balance(invoice) * (1 + Math.max(0, -daysToDue(invoice, now)) / 10);
  return invoices
    .filter((invoice) => ['due', 'overdue'].includes(stationOf(invoice, now)))
    .sort((a, b) => score(b) - score(a));
}
