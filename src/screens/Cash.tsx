import { useState } from 'react';
import { agingBuckets, averageDaysToPay, balance, collectedByMonth, expectedByWeek, outstanding, stationOf, sum } from '../domain/ledger';
import { useT } from '../i18n';
import { useCrm } from '../store';

interface Point {
  key: string;
  label: string;
  long: string;
  value: number;
  detail: string;
}

function Bars({ points, tableLabel }: { points: Point[]; tableLabel: string }) {
  const { t, money } = useT();
  const [asTable, setAsTable] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <>
      <button type="button" className="chip chart-toggle" aria-pressed={asTable} onClick={() => setAsTable(!asTable)}>
        {asTable ? t('cash.chart') : t('cash.table')}
      </button>
      {asTable ? (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">{tableLabel}</th>
              <th scope="col" className="num">{t('cash.value')}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.key}>
                <td>{p.long}</td>
                <td className="num">{money(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bars" onMouseLeave={() => setHovered(null)}>
          <div className="bars-max">{money(max)}</div>
          {points.map((p, index) => (
            <button
              key={p.key}
              type="button"
              className="bar-slot"
              aria-label={`${p.long}: ${money(p.value)}, ${p.detail}`}
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
            >
              <span className="bar-tube">
                <span className="bar" style={{ height: `${p.value ? Math.max(4, (p.value / max) * 100) : 0}%` }} />
              </span>
              <span className="bar-label">{p.label}</span>
              {hovered === index && (
                <span className={`bar-tip ${index > points.length * 0.66 ? 'is-left' : ''} ${index < points.length * 0.2 ? 'is-right' : ''}`} role="presentation">
                  <b>{money(p.value)}</b>
                  {p.long} · {p.detail}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function Cash() {
  const { t, tx, lang, date, money } = useT();
  const invoices = useCrm((s) => s.invoices);
  const clients = useCrm((s) => s.clients);
  const setPanel = useCrm((s) => s.setPanel);
  const now = new Date();

  const owed = outstanding(invoices, now);
  const aging = agingBuckets(invoices, now);
  const average = averageDaysToPay(invoices);
  const monthName = (year: number, month: number, style: 'short' | 'long') =>
    new Intl.DateTimeFormat(lang === 'es' ? 'es' : 'en-GB', { month: style, year: style === 'long' ? 'numeric' : undefined }).format(new Date(year, month, 1));

  const collected: Point[] = collectedByMonth(invoices, now).map((m) => ({
    key: `${m.year}-${m.month}`,
    label: monthName(m.year, m.month, 'short'),
    long: monthName(m.year, m.month, 'long'),
    value: m.value,
    detail: t('cash.payments', { n: m.count }),
  }));
  const expected: Point[] = expectedByWeek(invoices, now).map((w) => ({
    key: String(w.week),
    label: date(w.start),
    long: t('cash.weekOf', { date: date(w.start) }),
    value: w.value,
    detail: t('cash.invoices', { n: w.count }),
  }));

  const debtors = clients
    .map((client) => ({
      client,
      value: sum(invoices.filter((i) => i.clientId === client.id && ['invoiced', 'due', 'overdue'].includes(stationOf(i, now))).map(balance)),
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const bucketNames = { current: t('cash.current'), late30: t('cash.late30'), late60: t('cash.late60'), late61: t('cash.late61') };

  return (
    <main className="page">
      <header className="page-head">
        <h1>{t('cash.title')}</h1>
        <p>{average === null ? t('cash.summaryNone') : t('cash.summary', { days: average })}</p>
      </header>

      <section className="glass aging">
        <h2>{t('cash.aging')}</h2>
        <p className="aging-total">{money(owed)}</p>
        <div className="aging-tube" role="img" aria-label={aging.map((b) => `${bucketNames[b.id]}: ${money(b.value)}`).join(', ')}>
          {aging.map((bucket) =>
            bucket.value > 0 ? <span key={bucket.id} className={`aging-part aging-${bucket.id}`} style={{ flexGrow: bucket.value }} /> : null,
          )}
        </div>
        <ul className="aging-legend">
          {aging.map((bucket) => (
            <li key={bucket.id}>
              <i className={`aging-key aging-${bucket.id}`} />
              <span>{bucketNames[bucket.id]}</span>
              <b>{money(bucket.value)}</b>
            </li>
          ))}
        </ul>
      </section>

      <div className="cash-grid">
        <section className="glass chart-glass">
          <h2>{t('cash.collected')}</h2>
          <Bars points={collected} tableLabel={t('cash.period')} />
        </section>
        <section className="glass chart-glass">
          <h2>{t('cash.expected')}</h2>
          <Bars points={expected} tableLabel={t('cash.period')} />
          <p className="chart-note">{t('cash.expectedNote')}</p>
        </section>
      </div>

      <section className="glass table-glass">
        <h2 className="table-title">{t('cash.top')}</h2>
        <table className="data-table">
          <tbody>
            {debtors.map(({ client, value }) => (
              <tr key={client.id}>
                <td>
                  <button type="button" className="row-link" onClick={() => setPanel({ type: 'client', id: client.id })}>
                    <span className="row-title">{tx(client.name)}</span>
                  </button>
                </td>
                <td className="num">{money(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="sample-note">{t('sample')}</p>
    </main>
  );
}
