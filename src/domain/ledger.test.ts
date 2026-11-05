import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';
import {
  agingBuckets,
  averageDaysToPay,
  balance,
  capsuleAmount,
  chaseOrder,
  collectedByMonth,
  expectedByWeek,
  moveTo,
  onBoard,
  outstanding,
  recordPayment,
  stationOf,
  stationTotals,
  sum,
} from './ledger';
import { createSeed } from './seed';
import type { Client, Invoice } from './types';

const now = new Date(2026, 10, 4, 12);
const inDays = (days: number) => new Date(2026, 10, 4 + days, 17).toISOString();
const client: Client = { id: 'c', name: 'C', contact: '', email: '', phone: '', city: '', terms: 30, howTheyPay: '' };

const invoice = (over: Partial<Invoice> = {}): Invoice => ({
  id: 'i',
  number: 'INV-1',
  clientId: 'c',
  title: 'Work',
  amount: 1000,
  status: 'issued',
  createdAt: inDays(-20),
  issuedAt: inDays(-10),
  dueAt: inDays(20),
  payments: [],
  ...over,
});

describe('stations follow the facts', () => {
  it('puts an invoice in the tube its date and balance call for', () => {
    expect(stationOf(invoice({ status: 'proposal', dueAt: undefined }), now)).toBe('proposal');
    expect(stationOf(invoice(), now)).toBe('invoiced');
    expect(stationOf(invoice({ dueAt: inDays(7) }), now)).toBe('due');
    expect(stationOf(invoice({ dueAt: inDays(0) }), now)).toBe('due');
    expect(stationOf(invoice({ dueAt: inDays(-1) }), now)).toBe('overdue');
    expect(stationOf(invoice({ payments: [{ at: inDays(0), amount: 1000 }] }), now)).toBe('paid');
    expect(stationOf(invoice({ status: 'cancelled' }), now)).toBe('cancelled');
  });

  it('keeps a partly paid late invoice overdue, showing what is left', () => {
    const partial = invoice({ dueAt: inDays(-3), payments: [{ at: inDays(-5), amount: 400 }] });
    expect(stationOf(partial, now)).toBe('overdue');
    expect(capsuleAmount(partial, now)).toBe(600);
  });

  it('takes old paid work out of the tube', () => {
    expect(onBoard(invoice({ payments: [{ at: inDays(-5), amount: 1000 }] }), now)).toBe(true);
    expect(onBoard(invoice({ payments: [{ at: inDays(-40), amount: 1000 }] }), now)).toBe(false);
  });
});

describe('money adds up', () => {
  it('does not drift on cents', () => {
    expect(sum([0.1, 0.2])).toBe(0.3);
    expect(balance(invoice({ amount: 960.5, payments: [{ at: inDays(0), amount: 480.25 }] }))).toBe(480.25);
  });

  it('reconciles the sample data: aging, weeks and tubes all match what is owed', () => {
    const seed = createSeed(now);
    const owed = outstanding(seed.invoices, now);
    expect(sum(agingBuckets(seed.invoices, now).map((b) => b.value))).toBe(owed);
    const tubes = stationTotals(seed.invoices, now).filter((t) => ['invoiced', 'due', 'overdue'].includes(t.station));
    expect(sum(tubes.map((t) => t.value))).toBe(owed);
    const longest = Math.max(...seed.invoices.filter((i) => i.dueAt).map((i) => new Date(i.dueAt!).getTime()));
    const weeks = Math.ceil((longest - now.getTime()) / (7 * 86_400_000)) + 1;
    expect(sum(expectedByWeek(seed.invoices, now, weeks).map((w) => w.value))).toBe(owed);
  });

  it('counts each payment in the month it arrived', () => {
    const months = collectedByMonth([invoice({ payments: [{ at: new Date(2026, 10, 1).toISOString(), amount: 300 }, { at: new Date(2026, 5, 1).toISOString(), amount: 200 }, { at: new Date(2024, 0, 1).toISOString(), amount: 999 }] })], now);
    expect(months).toHaveLength(12);
    expect(months[11].value).toBe(300);
    expect(sum(months.map((m) => m.value))).toBe(500);
  });

  it('averages days to pay only over fully paid invoices', () => {
    expect(averageDaysToPay([invoice()])).toBeNull();
    const paid = invoice({ issuedAt: inDays(-10), payments: [{ at: inDays(0), amount: 1000 }] });
    expect(averageDaysToPay([paid, invoice()])).toBe(10);
  });

  it('caps a payment at the balance and ignores empty ones', () => {
    expect(balance(recordPayment(invoice(), 5000, now))).toBe(0);
    const same = invoice();
    expect(recordPayment(same, 0, now)).toBe(same);
  });
});

describe('dragging a capsule', () => {
  it('issues a proposal using the client terms', () => {
    const result = moveTo(invoice({ status: 'proposal', issuedAt: undefined, dueAt: undefined }), 'invoiced', client, now);
    expect(result.ok && result.event).toBe('issued');
    if (result.ok) expect(new Date(result.invoice.dueAt!).getDate()).toBe(4);
  });

  it('refuses to fake lateness: only the date decides', () => {
    expect(moveTo(invoice(), 'overdue', client, now)).toEqual({ ok: false, reason: 'date-decides' });
    expect(moveTo(invoice({ dueAt: inDays(-2) }), 'invoiced', client, now)).toEqual({ ok: false, reason: 'date-decides' });
  });

  it('records the balance when dropped on Paid, and undoes it when dragged back', () => {
    const partial = invoice({ payments: [{ at: inDays(-1), amount: 250 }] });
    const paid = moveTo(partial, 'paid', client, now);
    expect(paid.ok && paid.event).toBe('paid');
    if (paid.ok) {
      expect(paid.invoice.payments.at(-1)?.amount).toBe(750);
      const reopened = moveTo(paid.invoice, 'invoiced', client, now);
      expect(reopened.ok && balance(reopened.invoice)).toBe(750);
    }
  });

  it('will not pay a proposal or cancel money already received', () => {
    expect(moveTo(invoice({ status: 'proposal' }), 'paid', client, now)).toEqual({ ok: false, reason: 'invoice-first' });
    expect(moveTo(invoice({ payments: [{ at: inDays(0), amount: 1 }] }), 'cancelled', client, now)).toEqual({ ok: false, reason: 'has-payments' });
  });
});

describe('chasing', () => {
  it('puts the biggest, latest debt first and skips what is not due', () => {
    const big = invoice({ id: 'big', amount: 9000, dueAt: inDays(-20) });
    const small = invoice({ id: 'small', amount: 500, dueAt: inDays(-2) });
    const later = invoice({ id: 'later', dueAt: inDays(30) });
    expect(chaseOrder([small, later, big], now).map((i) => i.id)).toEqual(['big', 'small']);
  });
});

describe('sample data', () => {
  const seed = createSeed(now);
  it('only references clients and invoices that exist', () => {
    const clients = new Set(seed.clients.map((c) => c.id));
    const invoices = new Set(seed.invoices.map((i) => i.id));
    expect(seed.invoices.every((i) => clients.has(i.clientId))).toBe(true);
    expect(seed.activities.every((a) => invoices.has(a.invoiceId))).toBe(true);
  });
  it('fills every tube and never pays more than was invoiced', () => {
    expect(stationTotals(seed.invoices, now).every((t) => t.count > 0)).toBe(true);
    expect(seed.invoices.every((i) => balance(i) >= 0)).toBe(true);
  });
});

describe('csv export', () => {
  it('quotes commas, quotes and line breaks and starts with a BOM for Excel', () => {
    const csv = toCsv([['a', 'b'], ['x,y', 'say "hi"\nnow']]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe('a,b\r\n"x,y","say ""hi""\nnow"');
  });
  it('neutralises spreadsheet formulas in cell text', () => {
    expect(toCsv([['=SUM(A1)']]).slice(1)).toBe("'=SUM(A1)");
  });
});
