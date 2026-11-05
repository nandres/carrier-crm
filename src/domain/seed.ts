import type { Activity, ActivityKind, Client, Invoice, Snapshot, Text } from './types';

export const SNAPSHOT_VERSION = 2;

const t = (en: string, es: string): Text => ({ en, es });

type ClientRow = [string, Text, string, string, number, Text];

const CLIENTS: ClientRow[] = [
  ['c1', 'Halloran Dental', 'Nora Halloran', 'Lisbon', 30, t('Pays on the 5th. Ask for the purchase order first.', 'Paga el día 5. Pedile primero la orden de compra.')],
  ['c2', 'Brasa Restaurant Group', 'Teo Marques', 'Porto', 15, t('Fast once the owner approves. Message him, not accounts.', 'Rápido si aprueba el dueño. Escribile a él, no a contabilidad.')],
  ['c3', 'Lindqvist & Oyelaran', 'Sade Oyelaran', 'Rotterdam', 30, t('Never late. Wants the invoice as a PDF, by email.', 'Nunca se atrasa. Quiere la factura en PDF, por correo.')],
  ['c4', 'Casa Tilo Hotel', 'Lucía Ferrer', 'Valencia', 45, t('Slow in low season. A call works better than email.', 'Lenta en temporada baja. Mejor llamar que escribir.')],
  ['c5', 'Northside Logistics', 'Amir Haddad', 'Antwerp', 30, t('Payment run every second Friday.', 'Paga cada dos viernes.')],
  ['c6', 'Aurelia Vineyards', 'Marco Bellini', 'Douro', 60, t('Cash is tight until after harvest.', 'Anda justo de caja hasta después de la vendimia.')],
  ['c7', 'Okafor Legal', 'Chidi Okafor', 'Madrid', 30, t('Pays in two parts. Offer it before he asks.', 'Paga en dos partes. Ofrecéselo antes de que lo pida.')],
  ['c8', 'Fjell Outdoor', 'Astrid Berg', 'Oslo', 30, t('Needs the project code on every invoice.', 'Necesita el código de proyecto en cada factura.')],
  ['c9', 'Teatro Lumbre', 'Elena Roca', 'Seville', 45, t('Depends on a grant. Check before chasing.', 'Depende de una subvención. Averiguá antes de reclamar.')],
  ['c10', 'Weiss Gallery', 'Jonas Weiss', 'Vienna', 15, t('Pays the day he reads it. Keep it short.', 'Paga el día que la lee. Sé breve.')],
  ['c11', 'Marlow Coworking', 'Priya Nair', 'Bristol', 30, t('Board signs anything over $5,000.', 'El directorio firma todo lo que pase de $5.000.')],
  ['c12', 'Pereira Studio', 'Ana Pereira', 'Braga', 15, t('Prefers a payment link and a reminder the day before.', 'Prefiere un aviso el día anterior.')],
];

type InvoiceRow = {
  client: string;
  title: Text;
  amount: number;
  /** Days ago the invoice was issued; omit for a proposal. */
  issued?: number;
  /** Days until due, negative when late; omit to use the client's terms. */
  due?: number;
  /** Days ago and amount of each payment. */
  paid?: [number, number][];
  cancelled?: boolean;
  chased?: number;
};

const INVOICES: InvoiceRow[] = [
  // Proposals
  { client: 'c5', title: t('Warehouse scheduling tool', 'Herramienta de turnos de depósito'), amount: 18400 },
  { client: 'c11', title: t('Member billing portal', 'Portal de cobro a socios'), amount: 12600 },
  { client: 'c9', title: t('Season ticketing setup', 'Boletería de temporada'), amount: 7900 },
  { client: 'c1', title: t('Patient reminders, phase 2', 'Recordatorios a pacientes, fase 2'), amount: 4250 },
  // Invoiced, due later
  { client: 'c3', title: t('Quarterly retainer, Q4', 'Abono trimestral, T4'), amount: 15000, issued: 6, due: 24 },
  { client: 'c8', title: t('Store rollout, milestone 2', 'Apertura de tiendas, hito 2'), amount: 22750, issued: 9, due: 21 },
  { client: 'c6', title: t('Harvest logistics dashboard', 'Tablero de logística de vendimia'), amount: 9800, issued: 12, due: 48 },
  { client: 'c2', title: t('Menu and ordering update', 'Actualización de menú y pedidos'), amount: 3650, issued: 2, due: 13 },
  // Due soon
  { client: 'c7', title: t('Case tracker, second payment', 'Seguimiento de casos, segundo pago'), amount: 8400, issued: 25, due: 5, paid: [[12, 4200]] },
  { client: 'c4', title: t('Booking site, final payment', 'Sitio de reservas, pago final'), amount: 11300, issued: 41, due: 4 },
  { client: 'c10', title: t('Catalogue maintenance', 'Mantenimiento de catálogo'), amount: 1850, issued: 14, due: 1 },
  { client: 'c12', title: t('Client portal fixes', 'Arreglos del portal de clientes'), amount: 960.5, issued: 9, due: 6 },
  // Overdue
  { client: 'c4', title: t('Booking site, milestone 2', 'Sitio de reservas, hito 2'), amount: 14200, issued: 73, due: -28, chased: 6 },
  { client: 'c9', title: t('Website relaunch', 'Relanzamiento del sitio'), amount: 6800, issued: 57, due: -12 },
  { client: 'c2', title: t('Loyalty programme build', 'Programa de fidelidad'), amount: 9450, issued: 23, due: -8, chased: 2 },
  { client: 'c6', title: t('Cellar door shop', 'Tienda de la bodega'), amount: 5200, issued: 136, due: -76, chased: 11 },
  // Recently paid
  { client: 'c3', title: t('Quarterly retainer, Q3', 'Abono trimestral, T3'), amount: 15000, issued: 34, due: -4, paid: [[6, 15000]] },
  { client: 'c10', title: t('Exhibition microsite', 'Micrositio de exposición'), amount: 4300, issued: 16, due: -1, paid: [[2, 4300]] },
  { client: 'c8', title: t('Store rollout, milestone 1', 'Apertura de tiendas, hito 1'), amount: 22750, issued: 40, due: -10, paid: [[12, 22750]] },
  // Cancelled
  { client: 'c11', title: t('Second site fit-out', 'Segunda sede'), amount: 16000, cancelled: true },
  { client: 'c9', title: t('Rehearsal room bookings', 'Reserva de salas de ensayo'), amount: 3100, issued: 80, due: -50, cancelled: true },
  // History: feeds the numbers, stays out of the tubes
  { client: 'c3', title: t('Quarterly retainer, Q2', 'Abono trimestral, T2'), amount: 15000, issued: 124, due: -94, paid: [[100, 15000]] },
  { client: 'c8', title: t('Winter stock tracker', 'Control de stock de invierno'), amount: 13800, issued: 99, due: -69, paid: [[66, 13800]] },
  { client: 'c7', title: t('Case tracker, first payment', 'Seguimiento de casos, primer pago'), amount: 8400, issued: 88, due: -58, paid: [[60, 4200], [47, 4200]] },
  { client: 'c5', title: t('Fleet reporting', 'Informes de flota'), amount: 19600, issued: 150, due: -120, paid: [[118, 19600]] },
  { client: 'c2', title: t('Second location launch', 'Apertura del segundo local'), amount: 17200, issued: 165, due: -150, paid: [[146, 17200]] },
  { client: 'c1', title: t('Patient reminders, phase 1', 'Recordatorios a pacientes, fase 1'), amount: 5900, issued: 180, due: -150, paid: [[149, 5900]] },
  { client: 'c3', title: t('Quarterly retainer, Q1', 'Abono trimestral, T1'), amount: 15000, issued: 215, due: -185, paid: [[190, 15000]] },
  { client: 'c4', title: t('Booking site, milestone 1', 'Sitio de reservas, hito 1'), amount: 14200, issued: 240, due: -195, paid: [[188, 14200]] },
  { client: 'c10', title: t('Online catalogue', 'Catálogo en línea'), amount: 7400, issued: 262, due: -247, paid: [[245, 7400]] },
  { client: 'c6', title: t('Wine club billing', 'Cobro del club de vinos'), amount: 11900, issued: 301, due: -241, paid: [[232, 11900]] },
  { client: 'c12', title: t('Studio client portal', 'Portal de clientes del estudio'), amount: 6200, issued: 322, due: -307, paid: [[305, 6200]] },
];

type ActivityRow = [number, ActivityKind, Text, number];

/** invoice index, kind, body, days ago */
const ACTIVITIES: ActivityRow[] = [
  [12, 'reminder', t('Reminder sent to Lucía. No reply yet.', 'Recordatorio enviado a Lucía. Aún sin respuesta.'), 6],
  [12, 'call', t('She promised to review it after the board meeting.', 'Prometió revisarla después de la reunión de directorio.'), 15],
  [13, 'note', t('Grant decision due in spring. Elena asked for patience.', 'La subvención se decide en primavera. Elena pidió paciencia.'), 9],
  [14, 'reminder', t('Sent to Teo directly. He read it.', 'Enviado directamente a Teo. Lo leyó.'), 2],
  [15, 'call', t('Marco offered half now and half after the harvest.', 'Marco ofreció la mitad ahora y la mitad después de la vendimia.'), 11],
  [8, 'system', t('First half received on time.', 'Primera mitad recibida a tiempo.'), 12],
  [0, 'note', t('Amir wants to start in January if the board agrees.', 'Amir quiere empezar en enero si el directorio aprueba.'), 3],
];

export function createSeed(now: Date = new Date()): Snapshot {
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
  const dueIn = (days: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 17).toISOString();

  const clients: Client[] = CLIENTS.map(([id, name, contact, city, terms, howTheyPay]) => ({
    id,
    name,
    contact,
    city,
    terms,
    howTheyPay,
    email: `${contact.split(' ').pop()!.toLowerCase()}@example.com`,
    phone: `+00 555 01${id.slice(1).padStart(2, '0')}`,
  }));

  const termsOf = (id: string) => clients.find((c) => c.id === id)?.terms ?? 30;
  const invoices: Invoice[] = INVOICES.map((row, index) => ({
    id: `i${index + 1}`,
    number: `INV-${String(2041 + index)}`,
    clientId: row.client,
    title: row.title,
    amount: row.amount,
    status: row.cancelled ? 'cancelled' : row.issued === undefined ? 'proposal' : 'issued',
    createdAt: daysAgo((row.issued ?? 4 + (index % 9)) + 6),
    issuedAt: row.issued === undefined ? undefined : daysAgo(row.issued),
    dueAt: row.issued === undefined ? undefined : dueIn(row.due ?? termsOf(row.client) - row.issued),
    lastChasedAt: row.chased === undefined ? undefined : daysAgo(row.chased),
    payments: (row.paid ?? []).map(([days, amount]) => ({ at: daysAgo(days), amount })),
  }));

  const activities: Activity[] = ACTIVITIES.map(([index, kind, body, days], position) => ({
    id: `a${position + 1}`,
    invoiceId: `i${index + 1}`,
    kind,
    body,
    at: daysAgo(days),
  }));

  return { version: SNAPSHOT_VERSION, clients, invoices, activities };
}
