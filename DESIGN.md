---
name: Carrier
description: A financial CRM read as money moving through clear glass pneumatic tubes.
colors:
  ink: "#1b2224"
  ink-2: "#414c4f"
  ink-3: "#566265"
  graphite: "#1f2628"
  graphite-lift: "#39454a"
  smoke-top: "rgb(40 49 52 / 0.94)"
  smoke-foot: "rgb(22 28 30 / 0.97)"
  signal: "#b92c12"
  signal-lamp: "#e0401f"
  signal-tint: "#f6c9bb"
  ground: "#dfe3de"
  floor: "#d8dcd8"
  popover: "#f2f4f2"
  white: "#ffffff"
  lamp-idle: "#6d7a7e"
  gauge-current: "#9fabad"
  line: "rgb(27 34 36 / 0.16)"
  line-strong: "rgb(27 34 36 / 0.34)"
  capsule-wall: "rgb(27 34 36 / 0.42)"
  tube-wall: "rgb(27 34 36 / 0.58)"
  pipe-wall: "rgb(27 34 36 / 0.72)"
  control-fill: "rgb(255 255 255 / 0.62)"
  field-fill: "rgb(255 255 255 / 0.72)"
typography:
  display:
    fontFamily: "Archivo Variable, Segoe UI, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 122"
  headline:
    fontFamily: "Archivo Variable, Segoe UI, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.012em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo Variable, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 650
    lineHeight: 1.45
    fontVariation: "'wdth' 112"
  station:
    fontFamily: "Archivo Variable, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.005em"
    fontVariation: "'wdth' 115"
  name:
    fontFamily: "Archivo Variable, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 650
    lineHeight: 1.2
  body:
    fontFamily: "Archivo Variable, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
  body-small:
    fontFamily: "Archivo Variable, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo Variable, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.45
  figure-xl:
    fontFamily: "Martian Mono Variable, ui-monospace, monospace"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 80"
  figure-lg:
    fontFamily: "Martian Mono Variable, ui-monospace, monospace"
    fontSize: "1.3125rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 80"
  figure-md:
    fontFamily: "Martian Mono Variable, ui-monospace, monospace"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 85"
  figure-sm:
    fontFamily: "Martian Mono Variable, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 85"
rounded:
  hairline: "2px"
  tag: "5px"
  chip: "8px"
  control: "9px"
  popover: "13px"
  head: "14px"
  pane: "16px"
  pipe: "19px"
  capsule: "22px"
  tube-foot: "0 0 50% 50% / 0 0 40px 40px"
  lamp: "50%"
spacing:
  hairline: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "14px"
  xxl: "18px"
  capsule-gap: "7px"
  capsule-cap: "6px"
  bore: "38px"
  control-height: "36px"
components:
  button-primary:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.graphite-lift}"
  button-secondary:
    backgroundColor: "{colors.control-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.white}"
  button-quiet:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  chip:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-small}"
    rounded: "{rounded.chip}"
    padding: "0 9px"
    height: "28px"
  input-field:
    backgroundColor: "{colors.field-fill}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "7px 9px"
    height: "36px"
  nav-link:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "7px 11px"
  nav-link-active:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "7px 11px"
  station-head:
    backgroundColor: "{colors.smoke-foot}"
    textColor: "{colors.white}"
    typography: "{typography.station}"
    rounded: "{rounded.head}"
    padding: "10px 15px 11px"
  pane:
    textColor: "{colors.ink}"
    rounded: "{rounded.pane}"
    padding: "14px 16px 13px"
  capsule:
    textColor: "{colors.ink}"
    typography: "{typography.name}"
    rounded: "{rounded.capsule}"
    padding: "15px 16px 12px"
  toast:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    rounded: "11px"
    padding: "9px 13px"
---

# Design System: Carrier

## Overview

**Creative North Star: "The Pneumatic Station"**

Carrier is a bank's pneumatic tube station rebuilt as a contemporary instrument: money travels in the glass, and the glass exists because it is the pipe. A fine pale terrazzo floor lies in soft window light, clear tubes stand on it with a true foot, smoked graphite heads crown each tube, and frosted capsules with flat graphite caps pile up inside by gravity. It is modern, not retro: there is no brass, no patina and no period ornament.

The palette is neutral everywhere so that one colour can mean one thing. Density is that of a working tool: a whole pipeline fits one screen, every figure is legible at a glance, and form carries state before colour does. Controls stay flat and quiet because the material drama belongs to the objects that carry money.

The system refuses navy-and-gold fintech, white frosted cards on a light blue ground, corporate blue, the dark neon dashboard, and system fonts as a display voice.

**Key Characteristics:**
- Glass is a pipe or a capsule first; other panes are flat and borrow only its clarity.
- Terrazzo and window light are the permanent ground of every screen.
- Graphite supplies all structure, and selection is always a graphite fill.
- Signal red means late money and nothing else.
- State reads from line form and shape, so it survives without colour.
- Money is set in a narrowed monospaced face; words are set in a wide-capable grotesque.

## Colors

A cool mineral neutral range built around graphite, with a single hot signal reserved for overdue money.

### Primary
- **Station Graphite** (#1f2628): The primary action, capsule caps, active navigation, selected segments, couplings, chart fill, toasts and the focus ring. It is the board's structural dark note.
- **Lifted Graphite** (#39454a): Hover state of a graphite fill.
- **Smoked Glass** (rgb(40 49 52 / 0.94) to rgb(22 28 30 / 0.97)): The vertical gradient of every head, on tubes and on page titles alike.

### Secondary
- **Signal Text** (#b92c12): Words and figures that report lateness. It clears AA against the ground at 4.71:1.
- **Signal Lamp** (#e0401f): Lamps, doubled borders, capsule caps, due bars and gauge fills in the overdue state. At 3.29:1 against the ground it is for shapes only, never for text.
- **Signal Tint** (#f6c9bb): The light stripe in the hatched gauge segments for moderately late money.

### Neutral
- **Ink** (#1b2224): Primary text, 12.44:1 on the ground.
- **Ink Two** (#414c4f): Secondary text, resting navigation and capsule titles.
- **Ink Three** (#566265): The faintest permitted text, for placeholders and tertiary metadata; 4.86:1 on the ground.
- **Ground** (#dfe3de): The browser theme colour, matching the lit floor.
- **Floor Base** (#d8dcd8): The solid colour beneath the terrazzo raster while it loads.
- **Popover Paper** (#f2f4f2): Opaque surface for menus, where blur would hurt reading.
- **White** (#ffffff): Text on graphite and smoke, the paid lamp, and the highlight stripes on glass.
- **Idle Lamp** (#6d7a7e): A lamp with nothing to report.
- **Gauge Current** (#9fabad): The not-yet-due part of the ageing gauge.
- **Line** (rgb(27 34 36 / 0.16)) and **Strong Line** (rgb(27 34 36 / 0.34)): Dividers and table rules; control and field outlines.
- **Capsule Wall** (rgb(27 34 36 / 0.42)), **Tube Wall** (rgb(27 34 36 / 0.58)) and **Pipe Wall** (rgb(27 34 36 / 0.72)): Glass edges, darkening with the thickness of the object.
- **Control Fill** (rgb(255 255 255 / 0.62)) and **Field Fill** (rgb(255 255 255 / 0.72)): The translucent white behind secondary buttons and form fields.

### Named Rules
**The One Signal Rule.** Red appears only on money that is past due. Validation errors, destructive actions and alerts of any other kind stay in ink and rely on an icon and a heavier border.

**The Neutral Station Rule.** Interface elements take no other hue; only the faint mineral chips in the terrazzo carry a trace of warmth. New states are expressed through form, weight or lamp brightness, not a new colour.

**The Text Red Rule.** Text takes Signal Text; shapes take Signal Lamp. The two are not interchangeable.

## Typography

**Display Font:** Archivo Variable (with Segoe UI, sans-serif as fallback only)
**Body Font:** Archivo Variable (with Segoe UI, sans-serif as fallback only)
**Label/Mono Font:** Martian Mono Variable (with ui-monospace, monospace as fallback only)

**Character:** Archivo's width axis does the expressive work: page titles stretch wide like lettering on station signage while running text stays at normal width. Martian Mono, compressed on its own width axis and tightly tracked, gives every amount the aligned look of a counter without the bulk of a default monospace. Both families are self-hosted through the build.

### Hierarchy
- **Display** (700, 1.875rem, 1.1, width 122%, -0.02em): Page titles inside a smoked head; 1.625rem on phones.
- **Headline** (700, 1.375rem, 1.2, width 112%, -0.012em): Record names in the side panel.
- **Title** (650, 0.875rem, 1.45, width 112%): Section titles on panes, charts and tables.
- **Station** (600, 0.8125rem, 1.45, width 115%, 0.005em): Tube names on a smoked head.
- **Name** (650, 0.9375rem, 1.2): The client name on a capsule or row. It is the first thing read in any money object.
- **Body** (400, 0.9375rem, 1.45): Default text and controls.
- **Body Small** (400, 0.8125rem, 1.45): The workhorse secondary size for metadata, legends, field labels and notes.
- **Label** (400, 0.75rem, 1.45): Table headers, capsule feet and summary labels, in sentence case.
- **Figure XL** (500, 2rem, 1.15, width 80%, -0.04em): A page's single grand total.
- **Figure LG** (500, 1.3125rem, 1.25, width 80%, -0.03em): Tube totals on a head.
- **Figure MD** (500, 0.9375rem, 1.2, width 85%, -0.02em): Capsule amounts, and with small size steps, panel sums and row amounts.
- **Figure SM** (500, 0.8125rem, 1.2, width 85%, -0.02em): Table cells and payment lists.

### Named Rules
**The Money Is Mono Rule.** A standalone amount renders in Martian Mono, narrowed and tracked tight; an amount inside a phrase stays in that phrase's Archivo. Words stay in Archivo, with the keyboard hint as the one exception.

**The Width Is The Hierarchy Rule.** Rank rises through Archivo's width axis together with weight. Headings never rely on size alone, and letterspaced uppercase is not used to create rank.

## Layout

The shell is a fixed viewport (100dvh, padding 10px 12px, gaps of 8px) with a slim top bar, a body that fills the remaining height, and on the board a slim bottom bench. Pages do not scroll as a whole; tubes and page bodies scroll inside themselves.

The station board is an equal-column grid (five columns, minimum 220px each, 14px gutters) that fills the full width, with 56px of headroom for the manifold. Capsules are bottom-aligned in their tube with 7px between them, so a fuller tube visibly stands taller. Other pages centre on a 1240px column, or 980px for narrow lists, with 12px between blocks.

Rhythm is tight and slightly irregular on purpose: 2, 4, 6 and 8px inside controls, 12 and 14px between blocks, 18px at most between groups.

Responsive behaviour is structural. On desktops under 800px tall, capsules compact and drop their title line. At 1240px wide and below, search collapses to an icon and the bench legend leaves. At 860px and below, navigation moves to a fixed bottom bar, the board becomes a horizontal snap carousel of 84vw tubes that opens on the most urgent station, and a small tube-shaped index replaces the manifold. The bench moves its bar legend into the sample note.

## Elevation & Depth

Depth is physical and hybrid. The terrazzo raster and window-light raster form the ground; translucent glass lets that floor show through; soft, tightly spread shadows with a cool graphite tint set objects on it. Tubes are the only objects that throw a raking shadow, to the lower right, because they stand on the floor in window light. All other shadows fall straight down. Blur is 9 to 11px on panes and capsules, and 22px on the side panel, where reading needs more separation.

### Shadow Vocabulary
- **Tube cast** (`box-shadow: 16px 18px 26px -14px rgb(24 34 36 / 0.38)`): The standing tube, in window light.
- **Pipe sag** (`box-shadow: 0 12px 14px -9px rgb(24 34 36 / 0.45)`): The manifold over the floor.
- **Head** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.2), 0 12px 16px -9px rgb(20 28 30 / 0.7)`): Smoked heads, with a single lit top edge.
- **Capsule rest** (`box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.5), 0 9px 12px -7px rgb(24 34 36 / 0.55)`): A capsule lying in a tube.
- **Capsule hover** (`box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.65), 0 14px 16px -8px rgb(24 34 36 / 0.65)`): Lifted by one pixel under the pointer.
- **Capsule carried** (`box-shadow: 0 26px 28px -14px rgb(20 28 30 / 0.7)`): In the hand during a drag, tilted 1.2 degrees.
- **Pane** (`box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.5), 0 18px 28px -20px rgb(28 40 42 / 0.5)`): Flat glass panes.
- **Side panel** (`box-shadow: inset 0 1px 0 #fff, 0 26px 44px -18px rgb(28 40 42 / 0.75)`): The highest surface.

### Named Rules
**The Reason For Glass Rule.** A surface is curved, highlighted glass only if something travels in it or it measures something. Everything else is a flat pane.

**The Soft Shadow Rule.** Every cast shadow has real blur and negative spread. Solid offset shadows do not exist in this world.

**The Backed Text Rule.** Running text sits on a pane, a capsule or a head; the speckled floor is never a reading surface.

## Shapes

The form language is the tube: long straight runs ending in generous curves. Capsules are rounded at 22px, the manifold at 19px, tube feet as a shallow true ellipse (50% across, 40px deep), and bar gauges with round heads over tight 4px feet. Against these, working surfaces stay measured: 16px on panes, 14px on heads, 13px on popovers, 9px on controls, 8px on chips and 5px on tags. A smoked head overlaps its body, and the body beneath it is inset by 10px each side so the head reads as a collar on a narrower cylinder.

Line form carries meaning. A thin solid edge is a live object, a dashed edge is pending, and a doubled edge is urgent.

### Named Rules
**The Line Carries State Rule.** Dashed and uncapped means pending. Thin with graphite caps means issued. Doubled with red caps means overdue. Never restyle these three forms for decoration.

## Components

### Buttons
Flat, solid and quick to read; none has a bevel or gloss.
- **Shape:** Gently curved (9px), 36px minimum height, 12px side padding, weight 600.
- **Primary:** Graphite fill with white text, one per view's main action; icon-only at 36px square on phones.
- **Secondary:** Control Fill with a Strong Line outline; on a smoked head it inverts to 10% white with a 40% white outline.
- **Quiet:** No fill or outline, Ink Two text, for repeated row actions.
- **Hover / Focus:** Fill change in 160ms; pressed moves down 1px; a 2px graphite outline with 2px offset marks keyboard focus. Disabled drops to 50% opacity.

### Chips
- **Style:** Transparent with a Line outline, Ink Two text in Body Small, 28px tall, 8px radius.
- **State:** Hover adds 6% ink and darkens the text. Chips are small toggles and secondary actions, not status tags.

### Cards / Containers
- **Corner Style:** Softly rounded (16px).
- **Background:** A 160-degree white gradient from 56% to 30% opacity over 11px blur with raised saturation.
- **Shadow Strategy:** The Pane shadow from Elevation & Depth.
- **Border:** A white inner edge at 75% opacity outlined by Line.
- **Internal Padding:** 14 to 18px, 30px for empty states.
- **Page idiom:** A page title is a smoked head with the first pane tucked 19px beneath it, inset 10px, repeating the station silhouette.

### Inputs / Fields
- **Style:** Field Fill with a Strong Line outline, 9px radius, 36px minimum height, Body Small label above.
- **Focus:** 2px graphite outline at 1px offset, or white on a smoked head.
- **Error / Disabled:** The border thickens to 2px graphite, and a message in semibold ink carries a circular alert icon. Errors are never red.
- **Selects and dates:** A custom drawn chevron, and graphite as the native accent.

### Navigation
- **Style:** Icon and label at weight 500 in Ink Two, 9px radius, in a flat glass top bar.
- **States:** Hover adds 6% ink; active is a graphite fill with white text. The language toggle and segmented controls share this selected state.
- **Phone:** A fixed bottom bar of four equal stacked tabs, 14px radius, 14px blur and an 82% near-white fill.

### Station
The signature unit: a smoked head on a clear glass cylinder.
- **Head:** Holds lamp, tube name, count and total. The total always equals the sum of the capsules below it, to the cent.
- **Cylinder:** No fill of its own, only wall lines, a bright 2px highlight stripe on the left, a fine one on the right, and a soft foot glow. Where supported, slivers at the walls offset what is behind them by 6px, so the curved glass appears to bend the floor; without support the tube still reads.
- **Drop target:** The wall thickens with a 2px inner graphite line.

### Capsule
One invoice, the object that moves. Frosted body at 9px blur, 22px radius, 6px flat graphite caps cut by the rounded corners.
- **Content order:** Client name, title, amount, then a foot with due bar and days, or a date.
- **Forms:** Follows The Line Carries State Rule, and a paid capsule adds a check icon and date.
- **States:** Hover lifts 1px. Dragging leaves a 25% ghost. Finding a client lights their capsules to 72% white and dims the rest to 45% opacity.
- **Row form:** Lists of items to chase use the same body laid horizontally inside a tube-walled list, with a lamp and one fixed line on how that client pays.

### Manifold And Flight
A real-bore horizontal pipe (38px) feeds every station through short necks with thin graphite couplings. When an invoice changes station, a small capsule leaves the source tube, rotates into the pipe, runs along it and drops into the target in 900ms, then the real capsule settles 22px in over 300ms. On phones the capsule runs along the index in 620ms. Reduced motion removes the flight and leaves the state change.

### Lamp
A flat 8px disc with no glow (6px on the phone index): idle grey, white once money has landed, Signal Lamp when late.

### Due Bar
A 3px track where length is the exact number of days on a fixed 60-day scale, with a 2% minimum. Graphite before due, Signal Lamp after. It is a measurement and is never scaled to look fuller.

### Gauges
Charts are lengths of tube. Monthly bars are 26px glass tubes filling with solid graphite. The ageing gauge is one horizontal 30px tube split by exact share. Late segments use hatching at two densities and then solid Signal Lamp, so age remains readable without colour, and its legend prints each amount. Bar charts offer a table view.

### Bench
A slim 42px pane at the foot of the board with the outstanding total, the overdue amount, a legend drawn in the real line forms, a drop tray for cancelled work, and the sample data label.

### Side Panel And Overlays
The side panel floats 10 to 12px from the edges, 440px wide, with stronger blur and a 200ms slide of 22px. Menus and tooltips are near-opaque. The command palette is 620px wide over a 22% graphite scrim. Toasts are solid graphite with an underlined undo.

### Logo And Icons
The Carrier mark is a C drawn as a length of tube with a capsule passing through its opening; the wordmark is drawn from the same bent tube, not set in a font. Both take graphite on light surfaces, and the favicon reverses to white on a graphite tile. Interface icons are an authored set on a 20px grid, with a single 1.6px stroke and round ends, inlined as SVG.

## Do's and Don'ts

### Do:
- **Do** keep terrazzo and window light beneath every screen, as procedural rasters with a provenance file beside each.
- **Do** express a new status through line form, lamp brightness or an icon before considering colour.
- **Do** set every standalone amount in Martian Mono at a narrowed width with negative tracking.
- **Do** make any new measuring visual a length of tube filled to an exact, truthful value, and print its figures or give it a table view.
- **Do** keep state transitions at 150 to 200ms, and reserve longer motion for a capsule actually travelling.
- **Do** use a graphite fill for selected state, across navigation, segmented controls and language.
- **Do** invert focus rings to white on smoked heads and graphite toasts.
- **Do** carry the sample data label on a backed surface, in the bench or at the foot of the page.

### Don't:
- **Don't** use navy and gold, corporate blue, white glass on a light blue ground, or a dark neon dashboard.
- **Don't** use red for anything except past-due money, including errors and destructive actions.
- **Don't** add bevels or gloss to buttons, fields or tabs. Highlights belong to tubes, capsules and heads.
- **Don't** add curved highlights to a pane that carries and measures nothing.
- **Don't** put Signal Lamp on text, or set text on light surfaces fainter than Ink Three.
- **Don't** use a system font as the visible voice, or replace the drawn wordmark with type.
- **Don't** use solid offset shadows.
- **Don't** add retro brass, patina or period ornament; the station is contemporary.
- **Don't** add small uppercase labels above headings to create rank.
