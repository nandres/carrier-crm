import { DndContext, DragOverlay, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { capsuleAmount, onBoard, outstanding, overdueTotal, stationOf, stationTotals, sum } from '../domain/ledger';
import { STATIONS, type BoardStation, type Invoice, type Station } from '../domain/types';
import { useT } from '../i18n';
import { useCrm } from '../store';
import { Capsule } from '../ui/Capsule';

function Draggable({ invoice }: { invoice: Invoice }) {
  const setPanel = useCrm((s) => s.setPanel);
  const moveInvoice = useCrm((s) => s.moveInvoice);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: invoice.id });
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = STATIONS.indexOf(stationOf(invoice, new Date()) as BoardStation);
    if (event.key === '[' && index > 0) moveInvoice(invoice.id, STATIONS[index - 1]);
    if (event.key === ']' && index < STATIONS.length - 1) moveInvoice(invoice.id, STATIONS[index + 1]);
  };
  return (
    <Capsule
      ref={setNodeRef}
      invoice={invoice}
      ghost={isDragging}
      onClick={() => setPanel({ type: 'invoice', id: invoice.id })}
      {...attributes}
      {...listeners}
      onKeyDown={onKeyDown}
      aria-describedby="tubes-hint"
      role="button"
    />
  );
}

function Tube({ station, invoices, total }: { station: BoardStation; invoices: Invoice[]; total: { count: number; value: number } }) {
  const { t, stationName, money } = useT();
  const { setNodeRef, isOver } = useDroppable({ id: station });
  return (
    <section ref={setNodeRef} data-station={station} className={`tube tube-${station} ${isOver ? 'is-over' : ''}`} aria-label={stationName(station)}>
      <span className="tube-neck" aria-hidden="true" />
      <header className="collar">
        <h2>
          <span className="lamp" aria-hidden="true" />
          {stationName(station)}
          <span className="collar-count">{total.count}</span>
        </h2>
        <p className="collar-total">{money(total.value)}</p>
        {station === 'paid' && <p className="collar-note">{t('tubes.paidWindow')}</p>}
      </header>
      <div className="tube-glass">
        {invoices.map((invoice) => (
          <Draggable key={invoice.id} invoice={invoice} />
        ))}
        {invoices.length === 0 && <p className="tube-empty">{t('tubes.empty')}</p>}
      </div>
    </section>
  );
}

function CancelledTray({ count, value }: { count: number; value: number }) {
  const { t, money } = useT();
  const setPanel = useCrm((s) => s.setPanel);
  const { setNodeRef, isOver } = useDroppable({ id: 'cancelled' });
  return (
    <button ref={setNodeRef} type="button" className={`tray ${isOver ? 'is-over' : ''}`} onClick={() => setPanel({ type: 'cancelled' })}>
      <strong>{t('cancelled.tray')}</strong>
      <span>
        {count} · {money(value)}
      </span>
    </button>
  );
}

/** The signature: the capsule leaves one tube, runs along the manifold and drops into the next. */
function useFlight(rootRef: React.RefObject<HTMLElement | null>, pillRef: React.RefObject<HTMLDivElement | null>, indexRef: React.RefObject<HTMLElement | null>) {
  const flight = useCrm((s) => s.flight);
  const seen = useRef(flight?.key ?? 0);
  useEffect(() => {
    if (!flight || flight.key === seen.current) return;
    seen.current = flight.key;
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const from = root.querySelector<HTMLElement>(`[data-station="${flight.from}"]`);
    const to = root.querySelector<HTMLElement>(`[data-station="${flight.to}"]`);
    if (window.innerWidth <= 860) {
      const index = indexRef.current;
      const small = index?.querySelector<HTMLElement>('.index-pill');
      const fromTab = index?.querySelector<HTMLElement>(`.at-${flight.from}`);
      const toTab = index?.querySelector<HTMLElement>(`.at-${flight.to}`);
      if (index && small && fromTab && toTab) {
        small.animate(
          [
            { transform: `translateX(${fromTab.offsetLeft + fromTab.offsetWidth / 2 - 20}px)`, opacity: 1 },
            { transform: `translateX(${toTab.offsetLeft + toTab.offsetWidth / 2 - 20}px)`, opacity: 1 },
          ],
          { duration: 620, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
        );
      }
      return;
    }
    if (!from || !to) return;
    const origin = root.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const fromX = a.left + a.width / 2 - origin.left - 27;
    const toX = b.left + b.width / 2 - origin.left - 27;
    const pipeY = 10;
    const insideY = 130;
    const fallY = Math.min(b.height, 300);
    pill.getAnimations().forEach((animation) => animation.cancel());
    pill.animate(
      [
        { transform: `translate(${fromX}px, ${insideY}px) rotate(90deg)`, opacity: 0, offset: 0 },
        { transform: `translate(${fromX}px, ${insideY - 12}px) rotate(90deg)`, opacity: 1, offset: 0.05 },
        { transform: `translate(${fromX}px, ${pipeY + 14}px) rotate(90deg)`, opacity: 1, offset: 0.2, easing: 'cubic-bezier(0.4, 0, 0.3, 1)' },
        { transform: `translate(${fromX}px, ${pipeY}px) rotate(0deg)`, opacity: 1, offset: 0.27, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
        { transform: `translate(${toX}px, ${pipeY}px) rotate(0deg)`, opacity: 1, offset: 0.72 },
        { transform: `translate(${toX}px, ${pipeY + 14}px) rotate(90deg)`, opacity: 1, offset: 0.79, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)' },
        { transform: `translate(${toX}px, ${fallY}px) rotate(90deg)`, opacity: 1, offset: 0.97 },
        { transform: `translate(${toX}px, ${fallY}px) rotate(90deg)`, opacity: 0, offset: 1 },
      ],
      { duration: 900, fill: 'none' },
    );
  }, [flight, rootRef, pillRef, indexRef]);
}

export function Tubes() {
  const { t, money, stationName } = useT();
  const invoices = useCrm((s) => s.invoices);
  const moveInvoice = useCrm((s) => s.moveInvoice);
  const [dragging, setDragging] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLElement>(null);
  const [here, setHere] = useState<BoardStation>('overdue');
  useFlight(rootRef, pillRef, indexRef);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }));

  const now = new Date();
  const totals = stationTotals(invoices, now);
  const shown = invoices.filter((invoice) => onBoard(invoice, now));
  const cancelled = invoices.filter((invoice) => invoice.status === 'cancelled');
  const active = dragging ? invoices.find((invoice) => invoice.id === dragging) : undefined;
  const byUrgency = (station: BoardStation) =>
    shown
      .filter((invoice) => stationOf(invoice, now) === station)
      .sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? '') || capsuleAmount(b, now) - capsuleAmount(a, now));

  const onDragStart = (event: DragStartEvent) => setDragging(String(event.active.id));
  const onDragEnd = (event: DragEndEvent) => {
    setDragging(null);
    if (event.over) moveInvoice(String(event.active.id), event.over.id as Station);
  };
  const overdue = overdueTotal(invoices, now);
  const showStation = (station: BoardStation, behavior: ScrollBehavior = 'smooth') =>
    rootRef.current?.querySelector(`[data-station="${station}"]`)?.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });

  // On a phone only one tube fits: open on what is stuck.
  useEffect(() => {
    if (!window.matchMedia('(max-width: 860px)').matches || !rootRef.current) return;
    showStation('overdue', 'auto');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setHere((entry.target as HTMLElement).dataset.station as BoardStation);
        }
      },
      { root: rootRef.current, threshold: 0.6 },
    );
    rootRef.current.querySelectorAll('[data-station]').forEach((tube) => observer.observe(tube));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <main className="tubes-page">
        <h1 className="sr-only">{t('nav.tubes')}</h1>
        <p id="tubes-hint" className="sr-only">
          {t('tubes.hint')}
        </p>
        <nav className="station-index" ref={indexRef} aria-label={t('nav.tubes')}>
          <span className="index-pill" aria-hidden="true" />
          {STATIONS.map((station) => (
            <button key={station} type="button" className={`at-${station} ${here === station ? 'is-here' : ''}`} aria-current={here === station ? 'true' : undefined} onClick={() => showStation(station)}>
              {station === 'overdue' && <i className="lamp" aria-hidden="true" />}
              {stationName(station)}
            </button>
          ))}
        </nav>
        <div className="tubes" ref={rootRef}>
          <span className="manifold" aria-hidden="true" />
          <div className="flight-pill" ref={pillRef} aria-hidden="true" />
          {STATIONS.map((station, index) => (
            <Tube key={station} station={station} invoices={byUrgency(station)} total={totals[index]} />
          ))}
        </div>
        <footer className="bench">
          <p className="bench-owed">
            <span>{t('tubes.outstanding')}</span>
            <b>{money(outstanding(invoices, now))}</b>
            <small>{t('tubes.ofWhich', { amount: money(overdue) })}</small>
          </p>
          <ul className="legend">
            <li>
              <i className="swatch swatch-pending" />
              {t('legend.pending')}
            </li>
            <li>
              <i className="swatch swatch-live" />
              {t('legend.live')}
            </li>
            <li>
              <i className="swatch swatch-urgent" />
              {t('legend.urgent')}
            </li>
            <li>{t('legend.bar')}</li>
          </ul>
          <CancelledTray count={cancelled.length} value={sum(cancelled.map((i) => i.amount))} />
          <p className="sample-note">
            {t('sample')}
            <span className="note-bar"> · {t('legend.bar')}</span>
          </p>
        </footer>
      </main>
      <DragOverlay dropAnimation={null}>{active ? <Capsule invoice={active} overlay tabIndex={-1} /> : null}</DragOverlay>
    </DndContext>
  );
}
