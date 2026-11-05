import { balance, chaseOrder, daysToDue, sum } from '../domain/ledger';
import type { Invoice } from '../domain/types';
import { useT } from '../i18n';
import { useCrm } from '../store';
import { LateIcon } from '../ui/Icons';

function Row({ invoice }: { invoice: Invoice }) {
  const { t, tx, date, money } = useT();
  const client = useCrm((s) => s.clients.find((c) => c.id === invoice.clientId));
  const setPanel = useCrm((s) => s.setPanel);
  const logReminder = useCrm((s) => s.logReminder);
  const lit = useCrm((s) => s.litClientId === invoice.clientId);
  const now = new Date();
  const days = daysToDue(invoice, now);

  const copy = async () => {
    const text = t('reminder.text', {
      contact: client?.contact.split(' ')[0] ?? '',
      number: invoice.number,
      title: tx(invoice.title),
      amount: money(balance(invoice)),
      date: date(invoice.dueAt!, { day: 'numeric', month: 'long' }),
    });
    let copied = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      copied = false;
    }
    useCrm.setState({ toast: { id: Date.now(), message: t(copied ? 'chase.copied' : 'chase.copyFailed') } });
  };

  const sinceChased = invoice.lastChasedAt ? Math.floor((now.getTime() - new Date(invoice.lastChasedAt).getTime()) / 86_400_000) : null;

  return (
    <li className={`chase-row ${days < 0 ? 'is-late' : ''} ${lit ? 'is-lit' : ''}`}>
      <i className="lamp" aria-hidden="true" />
      <button type="button" className="chase-main" onClick={() => setPanel({ type: 'invoice', id: invoice.id })}>
        <span className="chase-client">{client ? tx(client.name) : ''}</span>
        <span className="chase-title">
          {invoice.number} · {tx(invoice.title)}
        </span>
        {client && tx(client.howTheyPay) && <span className="chase-how">{tx(client.howTheyPay)}</span>}
      </button>
      <div className="chase-money">
        <b>{money(balance(invoice))}</b>
        <span className={days < 0 ? 'chase-late' : ''}>
          {days < 0 ? (
            <>
              <LateIcon /> {t('capsule.late', { n: -days })}
            </>
          ) : days === 0 ? (
            t('capsule.dueToday')
          ) : (
            t('capsule.dueIn', { n: days })
          )}
        </span>
        <small>{sinceChased === null ? t('chase.neverReminded') : sinceChased === 0 ? t('chase.remindedToday') : t('chase.reminded', { n: sinceChased })}</small>
      </div>
      <div className="chase-actions">
        <button type="button" className="btn" onClick={copy}>
          {t('chase.copy')}
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => logReminder(invoice.id)}>
          {t('chase.log')}
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => setPanel({ type: 'invoice', id: invoice.id })}>
          {t('chase.pay')}
        </button>
      </div>
    </li>
  );
}

export function Chase() {
  const { t, money } = useT();
  const invoices = useCrm((s) => s.invoices);
  const list = chaseOrder(invoices, new Date());
  return (
    <main className="page page-narrow">
      <header className="page-head">
        <h1>{t('chase.title')}</h1>
        {list.length > 0 && <p>{t('chase.summary', { count: list.length, amount: money(sum(list.map(balance))) })}</p>}
      </header>
      {list.length === 0 ? (
        <p className="glass empty-glass">{t('chase.clear')}</p>
      ) : (
        <ul className="glass chase-list">
          {list.map((invoice) => (
            <Row key={invoice.id} invoice={invoice} />
          ))}
        </ul>
      )}
      <p className="sample-note">{t('sample')}</p>
    </main>
  );
}
