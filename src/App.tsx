import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { toCsv } from './domain/csv';
import { balance, stationOf } from './domain/ledger';
import type { Text } from './domain/types';
import { resolveText, useT } from './i18n';
import { PanelHost } from './panels/Panels';
import { Cash } from './screens/Cash';
import { Chase } from './screens/Chase';
import { Clients } from './screens/Clients';
import { Tubes } from './screens/Tubes';
import { useCrm } from './store';
import { CarrierLogo } from './ui/Brand';
import { CashIcon, ChaseIcon, ClientsIcon, MoreIcon, PlusIcon, SearchIcon, TubesIcon } from './ui/Icons';

type Route = 'tubes' | 'chase' | 'clients' | 'cash';
const ROUTES: { id: Route; icon: ComponentType; key: 'nav.tubes' | 'nav.chase' | 'nav.clients' | 'nav.cash' }[] = [
  { id: 'tubes', icon: TubesIcon, key: 'nav.tubes' },
  { id: 'chase', icon: ChaseIcon, key: 'nav.chase' },
  { id: 'clients', icon: ClientsIcon, key: 'nav.clients' },
  { id: 'cash', icon: CashIcon, key: 'nav.cash' },
];

function readRoute(): Route {
  const hash = window.location.hash.replace('#/', '');
  return ROUTES.some((route) => route.id === hash) ? (hash as Route) : 'tubes';
}

function useRoute(): Route {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

const go = (route: Route) => {
  window.location.hash = `#/${route}`;
};

function exportCsv() {
  const { invoices, clients, lang } = useCrm.getState();
  const now = new Date();
  const text = (value: Text) => resolveText(value, lang);
  const rows: (string | number)[][] = [
    ['Invoice', 'Client', 'Description', 'Status', 'Amount (USD)', 'Balance (USD)', 'Issued', 'Due'],
    ...invoices.map((invoice) => [
      invoice.number,
      text(clients.find((c) => c.id === invoice.clientId)?.name ?? ''),
      text(invoice.title),
      stationOf(invoice, now),
      invoice.amount,
      balance(invoice),
      invoice.issuedAt?.slice(0, 10) ?? '',
      invoice.dueAt?.slice(0, 10) ?? '',
    ]),
  ];
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `carrier_invoices_${now.toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function OptionsMenu() {
  const { t } = useT();
  const resetDemo = useCrm((s) => s.resetDemo);
  const setPanel = useCrm((s) => s.setPanel);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="menu-wrap" ref={ref}>
      <button type="button" className="icon-btn" aria-label={t('menu.label')} aria-expanded={open} onClick={() => setOpen(!open)}>
        <MoreIcon />
      </button>
      {open && (
        <div className="menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              exportCsv();
              setOpen(false);
            }}
          >
            {t('action.exportCsv')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setPanel({ type: 'cancelled' });
              setOpen(false);
            }}
          >
            {t('cancelled.title')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              resetDemo();
              setOpen(false);
            }}
          >
            {t('action.reset')}
          </button>
          <p>{t('sample')}</p>
        </div>
      )}
    </div>
  );
}

function CommandPalette() {
  const { t, tx, stationName } = useT();
  const open = useCrm((s) => s.paletteOpen);
  const setOpen = useCrm((s) => s.setPaletteOpen);
  const invoices = useCrm((s) => s.invoices);
  const clients = useCrm((s) => s.clients);
  const setPanel = useCrm((s) => s.setPanel);
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery('');
      setCursor(0);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const match = (text: string) => !needle || text.toLowerCase().includes(needle);
    const items: { id: string; group: string; label: string; hint: string; run: () => void }[] = [];
    for (const route of ROUTES) {
      const label = t('palette.go', { section: t(route.key) });
      if (match(label)) items.push({ id: `go-${route.id}`, group: t('palette.actions'), label, hint: '', run: () => go(route.id) });
    }
    if (match(t('action.newInvoice'))) {
      items.push({ id: 'new-i', group: t('palette.actions'), label: t('action.newInvoice'), hint: '', run: () => setPanel({ type: 'new-invoice' }) });
    }
    if (match(t('action.newClient'))) {
      items.push({ id: 'new-c', group: t('palette.actions'), label: t('action.newClient'), hint: '', run: () => setPanel({ type: 'new-client' }) });
    }
    const now = new Date();
    for (const invoice of invoices) {
      const client = clients.find((c) => c.id === invoice.clientId);
      const clientName = client ? tx(client.name) : '';
      if (needle && match(`${invoice.number} ${tx(invoice.title)} ${clientName}`)) {
        items.push({
          id: invoice.id,
          group: t('palette.invoices'),
          label: `${invoice.number} · ${tx(invoice.title)}`,
          hint: `${clientName} · ${stationName(stationOf(invoice, now))}`,
          run: () => setPanel({ type: 'invoice', id: invoice.id }),
        });
      }
    }
    for (const client of clients) {
      if (needle && match(`${tx(client.name)} ${client.contact} ${client.city}`)) {
        items.push({
          id: client.id,
          group: t('palette.clients'),
          label: tx(client.name),
          hint: client.contact,
          run: () => setPanel({ type: 'client', id: client.id }),
        });
      }
    }
    return items.slice(0, 12);
  }, [query, invoices, clients, t, tx, stationName, setPanel]);

  const run = (index: number) => {
    const item = results[index];
    if (!item) return;
    setOpen(false);
    item.run();
  };

  return (
    <dialog
      ref={ref}
      className="palette glass"
      aria-label={t('action.search')}
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === ref.current) setOpen(false);
      }}
    >
      <div className="palette-input">
        <SearchIcon />
        <input
          autoFocus
          value={query}
          aria-label={t('palette.placeholder')}
          placeholder={t('palette.placeholder')}
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setCursor(Math.min(cursor + 1, results.length - 1));
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setCursor(Math.max(cursor - 1, 0));
            }
            if (event.key === 'Enter') run(cursor);
          }}
        />
      </div>
      <ul className="palette-list">
        {results.map((item, index) => (
          <li key={item.id}>
            <button type="button" className={index === cursor ? 'is-cursor' : ''} onMouseEnter={() => setCursor(index)} onClick={() => run(index)}>
              <span>{item.label}</span>
              <small>{item.hint || item.group}</small>
            </button>
          </li>
        ))}
      </ul>
      {results.length === 0 && <p className="stage-empty">{t('palette.none')}</p>}
    </dialog>
  );
}

function Toast() {
  const { t, tx } = useT();
  const toast = useCrm((s) => s.toast);
  const dismiss = useCrm((s) => s.dismissToast);
  const undo = useCrm((s) => s.undo);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismiss, 6000);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);
  if (!toast) return null;
  return (
    <div className={`toast ${toast.tone === 'refusal' ? 'is-refusal' : ''}`} role="status">
      <span>{tx(toast.message)}</span>
      {toast.undo && (
        <button type="button" onClick={undo}>
          {t('action.undo')}
        </button>
      )}
    </div>
  );
}

function MainNav({ route, bottom }: { route: Route; bottom?: boolean }) {
  const { t } = useT();
  return (
    <nav className={bottom ? 'nav nav-bottom' : 'nav nav-top'} aria-label={t('nav.label')}>
      {ROUTES.map(({ id, icon: Icon, key }) => (
        <a key={id} href={`#/${id}`} className={route === id ? 'is-active' : ''} aria-current={route === id ? 'page' : undefined}>
          <Icon />
          <span>{t(key)}</span>
        </a>
      ))}
    </nav>
  );
}

export function App() {
  const route = useRoute();
  const { t, lang } = useT();
  const setLang = useCrm((s) => s.setLang);
  const setPanel = useCrm((s) => s.setPanel);
  const setPaletteOpen = useCrm((s) => s.setPaletteOpen);
  const panelOpen = useCrm((s) => s.panel !== null);

  useEffect(() => {
    document.documentElement.lang = lang;
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lang, setPaletteOpen]);

  return (
    <div className={`app ${panelOpen ? 'has-panel' : ''}`}>
      <header className="strip glass">
        <a className="brand" href="#/tubes" aria-label="Carrier">
          <CarrierLogo />
        </a>
        <MainNav route={route} />
        <button type="button" className="search-trigger" onClick={() => setPaletteOpen(true)}>
          <SearchIcon />
          <span>{t('action.search')}</span>
          <kbd>Ctrl K</kbd>
        </button>
        <div className="lang" role="group" aria-label={t('lang.label')}>
          {(['en', 'es'] as const).map((option) => (
            <button key={option} type="button" aria-pressed={lang === option} className={lang === option ? 'is-on' : ''} onClick={() => setLang(option)}>
              {option.toUpperCase()}
            </button>
          ))}
        </div>
        <OptionsMenu />
        <button type="button" className="btn btn-primary new-invoice" onClick={() => setPanel({ type: 'new-invoice' })}>
          <PlusIcon />
          <span>{t('action.newInvoice')}</span>
        </button>
      </header>
      <MainNav route={route} bottom />
      {route === 'tubes' && <Tubes />}
      {route === 'chase' && <Chase />}
      {route === 'clients' && <Clients />}
      {route === 'cash' && <Cash />}
      <svg width="0" height="0" className="sr-only" aria-hidden="true">
        <filter id="bend-left" x="-100%" width="300%">
          <feOffset dx="6" dy="0" />
        </filter>
        <filter id="bend-right" x="-100%" width="300%">
          <feOffset dx="-6" dy="0" />
        </filter>
      </svg>
      <PanelHost />
      <CommandPalette />
      <Toast />
    </div>
  );
}
