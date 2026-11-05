import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { balance, capsuleAmount, daysToDue, paidSoFar, stationOf, sum } from '../domain/ledger';
import type { ActivityKind, Invoice } from '../domain/types';
import { useT } from '../i18n';
import { useCrm } from '../store';
import { ArrowIcon, CloseIcon, LateIcon } from '../ui/Icons';

/** Accepts "1500", "1,500.50" or "1.500,50" and returns a number, or null if it isn't one. */
export function parseAmount(raw: string): number | null {
  const text = raw.trim().replace(/\s|\$/g, '');
  if (!/^\d[\d.,]*$/.test(text)) return null;
  const lastSeparator = Math.max(text.lastIndexOf('.'), text.lastIndexOf(','));
  const decimals = lastSeparator >= 0 && text.length - lastSeparator - 1 <= 2;
  const whole = decimals ? text.slice(0, lastSeparator) : text;
  const fraction = decimals ? text.slice(lastSeparator + 1) : '';
  const value = Number(`${whole.replace(/[.,]/g, '')}.${fraction || '0'}`);
  return Number.isFinite(value) && value > 0 ? value : null;
}

const localDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function PanelFrame({ title, children }: { title: ReactNode; children: ReactNode }) {
  const { t } = useT();
  const setPanel = useCrm((s) => s.setPanel);
  const closeRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  return (
    <aside className="glass panel" role="dialog" aria-labelledby={headingId}>
      <div className="panel-head">
        <div id={headingId} className="panel-title">
          {title}
        </div>
        <button ref={closeRef} type="button" className="icon-btn" aria-label={t('action.close')} onClick={() => setPanel(null)}>
          <CloseIcon />
        </button>
      </div>
      <div className="panel-body">{children}</div>
    </aside>
  );
}

function PaymentForm({ invoice }: { invoice: Invoice }) {
  const { t } = useT();
  const pay = useCrm((s) => s.pay);
  const [draft, setDraft] = useState(String(balance(invoice)));
  const [error, setError] = useState(false);
  useEffect(() => setDraft(String(balance(invoice))), [invoice.payments.length]); // eslint-disable-line
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const amount = parseAmount(draft);
    setError(amount === null);
    if (amount !== null) pay(invoice.id, amount);
  };
  return (
    <form className="pay-form" onSubmit={submit} noValidate>
      <label className="field">
        <span>{t('invoice.payAmount')}</span>
        <input inputMode="decimal" value={draft} aria-invalid={error} onChange={(e) => setDraft(e.target.value)} />
      </label>
      <button type="submit" className="btn btn-primary">
        {t('invoice.payFull')}
      </button>
      {error && <small className="field-error">{t('invoice.invalidAmount')}</small>}
    </form>
  );
}

function InvoicePanel({ id }: { id: string }) {
  const { t, tx, stationName, kindName, date, money } = useT();
  const invoice = useCrm((s) => s.invoices.find((i) => i.id === id));
  const client = useCrm((s) => s.clients.find((c) => c.id === invoice?.clientId));
  const allActivities = useCrm((s) => s.activities);
  const { moveInvoice, updateInvoice, addActivity, setPanel } = useCrm.getState();
  const [note, setNote] = useState('');
  const [kind, setKind] = useState<ActivityKind>('note');

  if (!invoice) return null;
  const now = new Date();
  const station = stationOf(invoice, now);
  const days = daysToDue(invoice, now);
  const open = ['invoiced', 'due', 'overdue'].includes(station);
  const history = allActivities.filter((a) => a.invoiceId === id).sort((a, b) => b.at.localeCompare(a.at));

  const submitNote = (event: FormEvent) => {
    event.preventDefault();
    if (!note.trim()) return;
    addActivity(id, kind, note.trim());
    setNote('');
  };

  return (
    <PanelFrame title={<textarea className="title-input" rows={1} aria-label={t('invoice.title')} value={tx(invoice.title)} onChange={(e) => updateInvoice(id, { title: e.target.value.replace(/\n/g, ' ') })} />}>
      <p className="panel-subtitle">
        {invoice.number} · {stationName(station)}
      </p>
      {client && (
        <button type="button" className="link-line" onClick={() => setPanel({ type: 'client', id: client.id })}>
          {tx(client.name)} · {client.contact} <ArrowIcon />
        </button>
      )}
      {client && tx(client.howTheyPay) && <p className="how-line">{tx(client.howTheyPay)}</p>}

      <dl className={`sums ${invoice.status === 'proposal' ? 'sums-one' : ''}`}>
        <div>
          <dt>{t('invoice.amount')}</dt>
          <dd>{money(invoice.amount)}</dd>
        </div>
        {invoice.status !== 'proposal' && (
          <>
            <div>
              <dt>{t('invoice.paid')}</dt>
              <dd>{money(paidSoFar(invoice))}</dd>
            </div>
            <div className={station === 'overdue' ? 'is-overdue' : ''}>
              <dt>{t('invoice.balance')}</dt>
              <dd>{money(balance(invoice))}</dd>
            </div>
          </>
        )}
      </dl>

      {invoice.issuedAt && invoice.status === 'issued' && (
        <div className="field-row">
          <div className="field">
            <span>{t('invoice.issued')}</span>
            <p className="field-static">{date(invoice.issuedAt, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <label className="field">
            <span>
              {t('invoice.due')}
              {station === 'overdue' && (
                <em className="late-tag">
                  <LateIcon /> {t('capsule.late', { n: -days })}
                </em>
              )}
            </span>
            <span className="date-field">
              <input
                type="date"
                value={invoice.dueAt ? localDate(invoice.dueAt) : ''}
                onChange={(e) => {
                  if (e.target.value) updateInvoice(id, { dueAt: new Date(`${e.target.value}T17:00:00`).toISOString() });
                }}
              />
              {invoice.dueAt && <span aria-hidden="true">{date(invoice.dueAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </span>
          </label>
        </div>
      )}

      {open && (
        <>
          <h3>{t('invoice.payTitle')}</h3>
          <PaymentForm invoice={invoice} />
        </>
      )}

      <div className="panel-actions">
        {station === 'proposal' && (
          <button type="button" className="btn btn-primary" onClick={() => moveInvoice(id, 'invoiced')}>
            {t('invoice.issue')}
          </button>
        )}
        {station === 'cancelled' ? (
          <button type="button" className="btn" onClick={() => moveInvoice(id, invoice.issuedAt ? 'invoiced' : 'proposal')}>
            {t('invoice.restore')}
          </button>
        ) : invoice.payments.length === 0 ? (
          <button type="button" className="btn btn-quiet" onClick={() => moveInvoice(id, 'cancelled')}>
            {invoice.status === 'proposal' ? t('invoice.cancelProposal') : t('invoice.cancel')}
          </button>
        ) : null}
      </div>

      {invoice.payments.length > 0 && (
        <>
          <h3>{t('invoice.payments')}</h3>
          <ul className="payments">
            {invoice.payments.map((payment, index) => (
              <li key={index}>
                <span>{date(payment.at, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <b>{money(payment.amount)}</b>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>{t('invoice.history')}</h3>
      <form className="note-form" onSubmit={submitNote}>
        <textarea rows={2} aria-label={t('invoice.notePlaceholder')} placeholder={t('invoice.notePlaceholder')} value={note} onChange={(e) => setNote(e.target.value)} />
        <div>
          <select aria-label={t('invoice.history')} value={kind} onChange={(e) => setKind(e.target.value as ActivityKind)}>
            {(['note', 'call', 'email'] as ActivityKind[]).map((option) => (
              <option key={option} value={option}>
                {kindName(option)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn" disabled={!note.trim()}>
            {t('action.save')}
          </button>
        </div>
      </form>
      {history.length === 0 && <p className="meta-line">{t('invoice.noHistory')}</p>}
      <ol className="timeline">
        {history.map((entry) => (
          <li key={entry.id}>
            <span className="timeline-meta">
              {kindName(entry.kind)} · {date(entry.at)}
            </span>
            <p>{tx(entry.body)}</p>
          </li>
        ))}
      </ol>
    </PanelFrame>
  );
}

function ClientPanel({ id }: { id: string }) {
  const { t, tx, stationName, money } = useT();
  const client = useCrm((s) => s.clients.find((c) => c.id === id));
  const allInvoices = useCrm((s) => s.invoices);
  const { updateClient, setPanel } = useCrm.getState();
  if (!client) return null;
  const now = new Date();
  const invoices = allInvoices.filter((i) => i.clientId === id).sort((a, b) => (b.issuedAt ?? b.createdAt).localeCompare(a.issuedAt ?? a.createdAt));
  const owed = sum(invoices.filter((i) => ['invoiced', 'due', 'overdue'].includes(stationOf(i, now))).map(balance));
  return (
    <PanelFrame title={<h2 className="panel-name">{tx(client.name)}</h2>}>
      <p className="meta-line">
        {client.contact}
        {client.city ? ` · ${client.city}` : ''} · {t('clients.termsDays', { n: client.terms })}
      </p>
      <dl className="sums sums-one">
        <div>
          <dt>{t('clients.owed')}</dt>
          <dd>{money(owed)}</dd>
        </div>
      </dl>
      <label className="field">
        <span>{t('client.how')}</span>
        <textarea rows={2} placeholder={t('client.howPlaceholder')} value={tx(client.howTheyPay)} onChange={(e) => updateClient(id, { howTheyPay: e.target.value })} />
      </label>
      <dl className="facts">
        <div>
          <dt>{t('client.email')}</dt>
          <dd>{client.email || '–'}</dd>
        </div>
        <div>
          <dt>{t('client.phone')}</dt>
          <dd>{client.phone || '–'}</dd>
        </div>
      </dl>
      <h3>{t('client.invoices')}</h3>
      {invoices.length === 0 && <p className="meta-line">{t('client.noInvoices')}</p>}
      <ul className="linked">
        {invoices.map((invoice) => {
          const station = stationOf(invoice, now);
          return (
            <li key={invoice.id}>
              <button type="button" className="row-link" onClick={() => setPanel({ type: 'invoice', id: invoice.id })}>
                <span className="row-title">{tx(invoice.title)}</span>
                <span className="row-sub">
                  {invoice.number} · {stationName(station)}
                </span>
              </button>
              <b>{money(capsuleAmount(invoice, now))}</b>
            </li>
          );
        })}
      </ul>
      <button type="button" className="btn" onClick={() => setPanel({ type: 'new-invoice', clientId: id })}>
        {t('action.newInvoice')}
      </button>
    </PanelFrame>
  );
}

function NewInvoicePanel({ clientId: presetClient }: { clientId?: string }) {
  const { t, tx } = useT();
  const clients = useCrm((s) => s.clients);
  const { addInvoice, setPanel } = useCrm.getState();
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(presetClient ?? '');
  const [amount, setAmount] = useState('');
  const [issued, setIssued] = useState(true);
  const [error, setError] = useState('');
  const chosen = clients.find((c) => c.id === clientId);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!clientId) return setError(t('invoice.needClient'));
    if (!title.trim()) return setError(t('invoice.needTitle'));
    const value = parseAmount(amount);
    if (value === null) return setError(t('invoice.invalidAmount'));
    const id = addInvoice({ title: title.trim(), clientId, amount: value, issued });
    setPanel({ type: 'invoice', id });
  };

  return (
    <PanelFrame title={<h2 className="panel-name">{t('action.newInvoice')}</h2>}>
      <form className="stack-form" onSubmit={submit} noValidate>
        <label className="field">
          <span>{t('invoice.client')}</span>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">–</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {tx(client.name)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="link-line" onClick={() => setPanel({ type: 'new-client' })}>
          {t('action.newClient')} <ArrowIcon />
        </button>
        <label className="field">
          <span>{t('invoice.title')}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>{t('invoice.amount')}</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <fieldset className="segment">
          <legend>{t('invoice.startAs')}</legend>
          <button type="button" className={issued ? 'is-on' : ''} aria-pressed={issued} onClick={() => setIssued(true)}>
            {t('invoice.asInvoice')}
          </button>
          <button type="button" className={!issued ? 'is-on' : ''} aria-pressed={!issued} onClick={() => setIssued(false)}>
            {t('invoice.asProposal')}
          </button>
        </fieldset>
        {issued && chosen && <p className="meta-line">{t('invoice.termsNote', { n: chosen.terms })}</p>}
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary">
          {t('action.save')}
        </button>
      </form>
    </PanelFrame>
  );
}

function NewClientPanel() {
  const { t } = useT();
  const { addClient, setPanel } = useCrm.getState();
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', city: '', howTheyPay: '' });
  const [terms, setTerms] = useState('30');
  const [error, setError] = useState('');
  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </label>
  );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return setError(t('client.needName'));
    const id = addClient({ ...form, name: form.name.trim(), terms: Math.max(0, Number(terms) || 30) });
    setPanel({ type: 'client', id });
  };
  return (
    <PanelFrame title={<h2 className="panel-name">{t('action.newClient')}</h2>}>
      <form className="stack-form" onSubmit={submit} noValidate>
        {field('name', t('client.name'))}
        {field('contact', t('client.contact'))}
        <div className="field-row">
          {field('email', t('client.email'), 'email')}
          {field('phone', t('client.phone'), 'tel')}
        </div>
        <div className="field-row">
          {field('city', t('client.city'))}
          <label className="field">
            <span>{t('client.terms')}</span>
            <input inputMode="numeric" value={terms} onChange={(e) => setTerms(e.target.value)} />
          </label>
        </div>
        {field('howTheyPay', t('client.how'))}
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary">
          {t('action.save')}
        </button>
      </form>
    </PanelFrame>
  );
}

function CancelledPanel() {
  const { t, tx, money } = useT();
  const all = useCrm((s) => s.invoices);
  const clients = useCrm((s) => s.clients);
  const { setPanel, moveInvoice } = useCrm.getState();
  const invoices = all.filter((i) => i.status === 'cancelled');
  return (
    <PanelFrame title={<h2 className="panel-name">{t('cancelled.title')}</h2>}>
      {invoices.length === 0 && <p className="meta-line">{t('cancelled.empty')}</p>}
      <ul className="linked">
        {invoices.map((invoice) => {
          const client = clients.find((c) => c.id === invoice.clientId);
          return (
            <li key={invoice.id}>
              <button type="button" className="row-link" onClick={() => setPanel({ type: 'invoice', id: invoice.id })}>
                <span className="row-title">{tx(invoice.title)}</span>
                <span className="row-sub">
                  {client ? tx(client.name) : ''} · {money(invoice.amount)}
                </span>
              </button>
              <button type="button" className="chip" onClick={() => moveInvoice(invoice.id, invoice.issuedAt ? 'invoiced' : 'proposal')}>
                {t('cancelled.restore')}
              </button>
            </li>
          );
        })}
      </ul>
    </PanelFrame>
  );
}

export function PanelHost() {
  const panel = useCrm((s) => s.panel);
  const setPanel = useCrm((s) => s.setPanel);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !useCrm.getState().paletteOpen) setPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPanel]);
  if (!panel) return null;
  if (panel.type === 'invoice') return <InvoicePanel key={panel.id} id={panel.id} />;
  if (panel.type === 'client') return <ClientPanel key={panel.id} id={panel.id} />;
  if (panel.type === 'new-invoice') return <NewInvoicePanel clientId={panel.clientId} />;
  if (panel.type === 'new-client') return <NewClientPanel />;
  return <CancelledPanel />;
}
