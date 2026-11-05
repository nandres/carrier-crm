# Carrier

A financial CRM demo, designed and built by Marcos Arellano. It keeps clients, proposals, invoices, collections and incoming cash in one place, for a small service business that needs to know who owes what and who to chase today.

**Every client, invoice and amount in the demo is fictional.** Carrier is a portfolio project: it shows what a tailored CRM can look like. It is not a commercial product, has no customers, is not accounting software, and does not connect to banks or process payments.

## What works

- **Collections:** invoices are capsules in five glass tubes: Proposals, Invoiced, Due soon, Overdue and Paid. Each tube total matches its contents to the cent.
- **Rules that hold:** dropping a proposal on Invoiced issues it using the client's terms, and dropping an invoice on Paid records its balance. Only the date can move an invoice to Overdue, and the app says so if you try.
- **Partial payments:** record any amount; the balance updates everywhere. Removing a payment and most other actions can be undone.
- **To chase:** what is due or late, biggest and latest first, with how each client pays, a reminder to copy and a log of what was sent.
- **Clients:** what each one owes, what is overdue, payment terms and paid in the last 12 months.
- **Cash in:** what is owed by age, money collected per month and expected over the next 8 weeks (each also as a table), plus average days to pay.
- **Search:** `Ctrl K` finds invoices, clients and actions.
- **Also:** English and Spanish, phone layout, keyboard moves with `[` and `]`, CSV export safe for Excel, local persistence and a button to restore the sample data.

## The design

The interface takes its idea from a bank's pneumatic tubes, where the glass exists because money travels through it: clear glass tubes with smoked graphite heads, on a fine terrazzo floor in window light, in a current liquid-glass style. When an invoice changes state, a capsule runs along the manifold and drops into its new tube.

- State is carried by the line: dashed is pending, doubled is overdue. It reads without relying on colour.
- Signal red belongs only to what is late.
- The bar on each capsule is the real number of days to its due date, on a fixed scale.
- The logo and wordmark are drawn as bent tube, not set in a font.
- The floor and light are generated procedurally by `scripts/generate-materials.mjs`.
- Type: Archivo, with its width axis for labels and headings, and Martian Mono for every amount.

## Stack

React 19, TypeScript and Vite, with Zustand for state and dnd-kit for dragging. Money and state rules are pure functions in `src/domain/ledger.ts`, covered by Vitest. Storage sits behind the `CrmRepository` interface in `src/data/repository.ts`, so a real API could replace the browser version without touching the screens.

## Run it

```bash
npm install
npm run dev
```

```bash
npm test
```

```bash
npm run build
```
