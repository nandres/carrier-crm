import { useState } from 'react';
import { balance, DAY, stationOf, sum } from '../domain/ledger';
import { useT } from '../i18n';
import { useCrm } from '../store';
import { PlusIcon, SearchIcon } from '../ui/Icons';

export function Clients() {
  const { t, tx, money } = useT();
  const clients = useCrm((s) => s.clients);
  const invoices = useCrm((s) => s.invoices);
  const setPanel = useCrm((s) => s.setPanel);
  const lit = useCrm((s) => s.litClientId);
  const [query, setQuery] = useState('');
  const now = new Date();

  const needle = query.trim().toLowerCase();
  const rows = clients
    .map((client) => {
      const own = invoices.filter((i) => i.clientId === client.id);
      const open = own.filter((i) => ['invoiced', 'due', 'overdue'].includes(stationOf(i, now)));
      const overdue = own.filter((i) => stationOf(i, now) === 'overdue');
      const paid12 = own.flatMap((i) => i.payments).filter((p) => now.getTime() - new Date(p.at).getTime() <= 365 * DAY);
      return { client, owed: sum(open.map(balance)), overdue: sum(overdue.map(balance)), paid: sum(paid12.map((p) => p.amount)) };
    })
    .filter(({ client }) => !needle || [tx(client.name), client.contact, client.city, tx(client.howTheyPay)].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => b.overdue - a.overdue || b.owed - a.owed || b.paid - a.paid);

  return (
    <main className="page">
      <header className="page-head page-head-row">
        <h1>{t('clients.title')}</h1>
        <label className="search-field">
          <SearchIcon />
          <span className="sr-only">{t('clients.search')}</span>
          <input type="search" value={query} placeholder={t('clients.search')} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="button" className="btn" onClick={() => setPanel({ type: 'new-client' })}>
          <PlusIcon />
          {t('action.newClient')}
        </button>
      </header>
      <section className="glass table-glass">
        <table className="clients-table">
          <thead>
            <tr>
              <th scope="col">{t('clients.name')}</th>
              <th scope="col" className="col-how">{t('clients.how')}</th>
              <th scope="col" className="col-terms">{t('clients.terms')}</th>
              <th scope="col" className="num">{t('clients.owed')}</th>
              <th scope="col" className="num col-overdue">{t('clients.overdue')}</th>
              <th scope="col" className="num col-paid">{t('clients.paid12')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ client, owed, overdue, paid }) => (
              <tr key={client.id} className={lit === client.id ? 'is-lit' : ''}>
                <td>
                  <button type="button" className="row-link" onClick={() => setPanel({ type: 'client', id: client.id })}>
                    <span className="row-title">{tx(client.name)}</span>
                    <span className="row-sub">
                      {client.contact}
                      {client.city ? ` · ${client.city}` : ''}
                    </span>
                  </button>
                </td>
                <td className="col-how">{tx(client.howTheyPay)}</td>
                <td className="col-terms">{t('clients.termsDays', { n: client.terms })}</td>
                <td className="num">{owed ? money(owed) : '–'}</td>
                <td className={`num col-overdue ${overdue ? 'has-overdue' : ''}`}>{overdue ? money(overdue) : '–'}</td>
                <td className="num col-paid">{paid ? money(paid) : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="tube-empty">{t('clients.none')}</p>}
      </section>
    </main>
  );
}
