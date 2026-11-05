import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { capsuleAmount, daysToDue, lastPaymentAt, stationOf } from '../domain/ledger';
import type { Invoice } from '../domain/types';
import { useT } from '../i18n';
import { useCrm } from '../store';
import { CheckIcon, LateIcon } from './Icons';

/** Days-to-due bar: its length is the real number of days, on a fixed 60-day scale. */
function DueBar({ days }: { days: number }) {
  const width = Math.min(100, (Math.abs(days) / 60) * 100);
  return (
    <span className={`due-bar ${days < 0 ? 'is-late' : ''}`} aria-hidden="true">
      <span style={{ width: `${Math.max(width, 2)}%` }} />
    </span>
  );
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  invoice: Invoice;
  ghost?: boolean;
  overlay?: boolean;
}

/** One invoice: a capsule that travels through the tubes. */
export const Capsule = forwardRef<HTMLButtonElement, Props>(function Capsule({ invoice, ghost, overlay, className = '', ...rest }, ref) {
  const { t, tx, date, money } = useT();
  const client = useCrm((s) => s.clients.find((c) => c.id === invoice.clientId));
  const lit = useCrm((s) => s.litClientId);
  const arrived = useCrm((s) => s.flight?.invoiceId === invoice.id);
  const now = new Date();
  const station = stationOf(invoice, now);
  const days = daysToDue(invoice, now);
  const state = lit ? (lit === invoice.clientId ? 'is-lit' : 'is-dim') : '';
  const paidAt = lastPaymentAt(invoice);

  return (
    <button
      ref={ref}
      type="button"
      data-invoice={invoice.id}
      className={`capsule at-${station} ${state} ${ghost ? 'is-ghost' : ''} ${overlay ? 'is-overlay' : ''} ${arrived ? 'is-arrived' : ''} ${className}`}
      {...rest}
    >
      <span className="capsule-client">{client ? tx(client.name) : ''}</span>
      <span className="capsule-title">{tx(invoice.title)}</span>
      <span className="capsule-amount">{money(capsuleAmount(invoice, now))}</span>
      <span className="capsule-foot">
        {station === 'proposal' && <span>{t('capsule.notIssued')}</span>}
        {(station === 'invoiced' || station === 'due') && (
          <>
            <DueBar days={days} />
            <span>{days === 0 ? t('capsule.dueToday') : t('capsule.dueIn', { n: days })}</span>
          </>
        )}
        {station === 'overdue' && (
          <>
            <DueBar days={days} />
            <span className="capsule-late">
              <LateIcon />
              {t('capsule.late', { n: -days })}
            </span>
          </>
        )}
        {station === 'paid' && paidAt && (
          <span className="capsule-paid">
            <CheckIcon />
            {t('capsule.paidOn', { date: date(paidAt) })}
          </span>
        )}
        {station === 'cancelled' && <span>{invoice.number}</span>}
      </span>
    </button>
  );
});
