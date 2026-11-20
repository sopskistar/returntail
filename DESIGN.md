---
name: ReturnTail
description: Make it right. Leave a trail.
colors:
  saffron: "#f3bc53"
  saffron-soft: "#ffdfa2"
  plum: "#2e1c36"
  plum-light: "#4c3555"
  plum-muted: "#6d5c73"
  paper: "#ffffff"
  ground: "#f5f3f6"
  rule: "#ded8e2"
  success: "#246149"
  success-soft: "#e5f2e9"
  danger: "#a02d37"
  danger-soft: "#fbecef"
  warning: "#7d4b08"
  warning-soft: "#fff1d7"
typography:
  display:
    fontFamily: "Rethink Sans Variable, sans-serif"
    fontSize: "clamp(42px,5.7vw,80px)"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Rethink Sans Variable, sans-serif"
    fontSize: "clamp(32px,3.5vw,48px)"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Rethink Sans Variable, sans-serif"
    fontSize: "24px"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  label:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 650
  wordmark:
    fontFamily: "Rethink Sans Variable, sans-serif"
    fontSize: "29px"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.04em"
rounded:
  control: "7px"
  panel: "12px"
  status: "6px"
  pill: "20px"
  dialog: "16px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  size-20: "20px"
  size-28: "28px"
components:
  button-primary:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.plum-light}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.plum}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-light:
    backgroundColor: "{colors.saffron}"
    textColor: "{colors.plum}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-danger:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.plum}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.plum}"
    rounded: "{rounded.panel}"
  network-label:
    backgroundColor: "{colors.saffron-soft}"
    textColor: "{colors.plum}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  status-confirmed:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.status}"
    padding: "4px 8px"
---

# Design System: ReturnTail

## Overview

**Creative North Star: "A connected resolution trail"**

ReturnTail makes merchant finance calm, human, and exact. Warm saffron fields introduce the product; deep plum carries words, controls, and accountability. White records on lavender-white work surfaces make purchases, decisions, and chain observations easy to inspect.

The signature is a connected trail from purchase through wallet authorization to observed settlement. It expresses progress without collapsing distinct financial states. The website combines generous introductory typography with compact operational data; the application keeps empty states honest and setup actionable. This document records the implemented local build, not a deployment or mainnet verification claim.

**Key Characteristics:**

- Saffron and plum identity, with restrained semantic state colors.
- Rethink Sans headings and wordmark; Manrope controls and records.
- Fine rules, softly rounded controls, and flat operational panels.
- Explicit network, authorization, observation, and confirmation language.
- Keyboard focus, responsive layouts, and reduced motion.

## Colors

Warm identity colors sit against clean paper and a faint lavender ground. The frontmatter owns exact values; semantic CSS aliases live in `src/app/globals.css`.

### Primary

- **Saffron:** broad introductory and authentication fields, current timeline nodes, and light actions on plum.
- **Soft Saffron:** network labels, setup notes, and approved or signing states.

### Secondary

- **Deep Plum:** primary ink, primary controls, completed timeline nodes, and the dark explanatory section.
- **Light Plum:** primary-button hover and the standard keyboard focus outline.

### Neutral

- **Paper:** page background, panels, fields, and text on plum controls.
- **Lavender Ground:** workspace background, table headings, secondary hover, and transaction review surfaces.
- **Rule:** borders, separators, and incomplete timeline connections.
- **Muted Plum:** supporting text, labels, timestamps, and inactive navigation.

Success green and its pale surface identify confirmed outcomes. Warning amber and its pale surface identify review requirements and unknown broadcast outcomes. Danger red and its pale surface identify errors and rejected requests. These are functional colors, not additional brand accents.

**The State Has Words Rule.** A state always has a readable label; status icons and color reinforce that label. Confirmation green belongs to confirmed state, never to connection or approval alone.

## Typography

**Display Font:** Rethink Sans Variable, with sans-serif fallback.  
**Body Font:** Manrope Variable, with sans-serif fallback.

Both families are self-hosted through Fontsource and carry bundled OFL license files. Headings are balanced, slightly tightened, and moderate in weight. Interface copy remains compact and precise. This is a role-based scale with responsive overrides, not a single mathematical ratio.

### Hierarchy

- **Display:** the frontmatter records the global heading default. The homepage hero uses `clamp(44px,5.5vw,78px)`, tighter leading (1.04), and tracking (-0.04em); responsive overrides are 60px at 1100px, 48px at 800px, 53px at 600px, and 80px from 1600px.
- **Headline:** section headings use the global headline role or explicit surface sizes. Workspace headings are 36px, then 33px and 32px at tablet and mobile widths.
- **Title:** operational panel headings use 21px, reduced to 20px on mobile. The global title role serves general tertiary headings.
- **Body:** global reading text uses the body role and a maximum line length of 70ch. Operational prose generally uses 12–14px; homepage introductory prose uses 18px before responsive reductions.
- **Label:** field labels use the frontmatter label role. Metadata and statuses generally use 11px; primary controls use 14px at weight 650.
- **Wordmark:** lowercase `returntail`, using the frontmatter wordmark role; mobile header lettering is 25px and footer lettering is 24px (23px on mobile).

**The Exact Figures Rule.** Use tabular numerals for amounts, transaction metadata, progress numbers, and balances. Preserve address and transaction wrapping rather than clipping identifying data.

## Layout

The core rhythm is 4px. The named spacing scale deliberately skips some steps; additional observed 20px and 28px values support control and panel padding. Larger section gaps use further multiples of 4px in the stylesheet. Reuse these values rather than treating every section measurement as a new primitive.

The centered content container caps at 1240px, with 48px outer gutters on wide screens, 32px gutters at 1100px, and 20px gutters at 600px. The workspace pairs a flexible main record area with a 320px side column, reduced to 270px at 1100px. At 800px it becomes one column and its supporting cards form two columns; at 600px those cards stack. Detail screens collapse to one column at 800px. Customer purchase panels are ordered around the next useful action at that breakpoint.

At mobile widths, headings and actions stack, two-column forms become single-column, tabs remain horizontally scrollable, and long data stays within its region. The homepage hero retains two columns at tablet width and stacks at 600px; the instructional record is centered with a 390px maximum width. The mobile header hides “How it works”; the footer retains the guide destination.

The product requires minimum 44px action targets. Primary controls and fields are at least 48px high; compact controls, icon buttons, the brand link, header links, and footer links retain 44px targets. Breadcrumb links also retain a 44px minimum.

## Elevation & Depth

Operational depth comes from white panels on lavender ground, thin borders, and clear divisions. The two shadows have specific roles: the homepage instructional record and the modal wallet dialog. They do not establish a general card-shadow style.

### Shadow Vocabulary

- **Instructional record:** `0 18px 46px color-mix(in srgb,var(--color-ink) 12%,transparent)`.
- **Wallet dialog:** `0 28px 90px color-mix(in srgb,var(--color-ink) 25%,transparent)`, with a 55% ink backdrop.

**The Flat Record Rule.** Operational panels stay flat; use border and surface contrast to group evidence. Reserve the documented shadows for their existing roles.

The desktop instructional record rotates slightly (2deg, then 1deg at 1100px) and becomes upright at 800px. Standard control transitions run for 180ms with `cubic-bezier(.16,1,.3,1)`. State entry lasts 420ms, moving from 6px below and 0.6 opacity. Reduced motion disables animations and transitions, restores automatic scrolling, and removes the record rotation.

## Shapes

Controls use a modest curve; panels use a slightly softer curve. Status tags remain compact rectangles, while network labels are pills and timeline nodes are circles. The wallet dialog has its own larger corner radius. Fine one-pixel borders organize data; current and completed nodes use filled silhouettes.

The original return-path R mark combines an upright letter structure, a returning arrow, and a diagonal tail. Its square stroke caps and angular joins distinguish the identity from the softer surrounding controls. Keep the original SVG geometry, aspect ratio, and single-color treatment; use the full brand lockup for a home link and the isolated mark for icons.

## Components

### Buttons

Confident, familiar controls with sentence-case labels. Primary buttons use plum on paper; the light variant uses saffron on plum sections. Secondary buttons use paper with a rule border. Danger controls use danger ink on paper and move to a pale danger surface on hover. Padding and corners are in frontmatter; the default minimum height is 48px, with a 44px compact variant.

Primary hover shifts to light plum; secondary hover shifts to ground; light hover shifts to soft saffron. Pressing a button translates it down 1px. Disabled controls use a not-allowed cursor and 0.55 opacity. Keep descriptive text beside decorative icons.

### Chips and statuses

Network labels are informational pills, not filter controls. Say “Mainnet — real BCH” or “Chipnet — test coins only” according to actual configuration. Status tags pair an icon with a full readable state. Confirmed uses success; approved, awaiting wallet signature, and signed use soft saffron; unknown broadcast and review required use warning; rejected uses danger; observed/unconfirmed and broadcast submitted use ground with plum ink. Cancellation, expiration, and other default states remain neutral.

### Cards / Containers

White, rule-bordered panels group records on the workspace ground. Heading strips use 24px vertical and 28px horizontal padding; panel bodies use 28px, becoming 20px on mobile. Pale saffron side notes provide setup guidance. Empty states explain the absence of records and offer a real next action without invented balances or completed activity.

### Inputs / Fields

Fields use paper, a rule border, control corners, and a persistent visible label. The minimum height is 48px; textareas resize vertically and start at 110px. Placeholders use muted plum and do not replace labels. Invalid inputs receive a danger border; nearby error text explains recovery. Alerts pair text with an icon and a semantic surface.

All focusable controls have an explicit focus-visible outline: 3px with a 4px offset by default; input and textarea focus use 2px with a 2px offset. On the dark section, links use saffron focus. Preserve the skip-to-content link and native labels, buttons, links, selects, and disclosure controls.

### Navigation

The brand returns home and has the accessible name “ReturnTail home.” Main and footer navigation have named landmarks. Workspace tabs use a muted default and a plum underline and text when `aria-current="page"`. Header links keep full targets while reducing visible type and spacing on smaller screens. Retain access to hidden mobile guide navigation through the footer.

### Connected resolution trail

An ordered list makes the purchase-to-refund progression explicit. Payments have four stages: Payment request, Wallet signed, Observed, Confirmed. Refunds have five: Requested, Approved, Wallet signed, Observed, Confirmed. Complete nodes use plum and a check; the current node uses saffron with `aria-current="step"`; future nodes use outlined numbered circles. On mobile, payment trails use four equal columns and refund trails five, with labels below their nodes.

An unknown broadcast outcome remains at its last known stage and receives an explicit warning label. The trail does not establish that a transaction happened: observation and confirmation must come from the actual application state and evidence.

### Wallet dialog

A native modal dialog presents wallet connection, QR/deep-link actions, copy feedback, and the active network. It has a titled accessible relationship and a named close button. Escape or closing cancels the connection attempt. The wallet button states “Connecting…” or “Reconnecting…” while disabled and exposes the connected wallet name when available. A wallet connection alone does not prove ownership or authorize a transaction.

## Do's and Don'ts

### Do:

- **Do** reuse the saffron/plum identity and distinct semantic state colors.
- **Do** preserve visible labels, keyboard focus, minimum 44px action targets, and reduced motion.
- **Do** distinguish merchant approval, wallet signing, network observation, and confirmation in words and progress.
- **Do** use honest empty states and clearly instructional examples until real evidence exists.
- **Do** retain original mark geometry and the Rethink Sans lowercase wordmark.

### Don't:

- **Don't** use confirmation green for a wallet connection, approval, signature, or broadcast alone.
- **Don't** turn flat operational records into floating decorative cards.
- **Don't** substitute emoji or text glyphs for interface icons or the brand mark.
- **Don't** present local screenshots or instructional trails as deployed mainnet proof.
- **Don't** substitute fallback lettering for the exact Rethink Sans wordmark or reduce action targets below 44px.

## November 20 accessibility refinements

Preserve the approved saffron/plum identity. Form boundaries use semantic `--color-control-rule` from primitive `--p-control-line` (#8b7a91) to exceed 3:1 against white and the pale form surface. Saffron authentication progress labels use ink for text contrast. At tablet widths the illustrative trail becomes a contained two-column sequence; narrow-phone navigation keeps Workspace on one line. Reading-page body measure is capped at 65ch; evidence lists retain real bullet markers. These are accessibility and containment refinements, not a new visual direction.
