# ReturnTail brand guide

ReturnTail connects a verified BCH purchase to a merchant-authorized refund and a durable resolution record. Its voice is precise, calm, and human. “Make it right. Make it verifiable.” introduces the product; “Make it right. Leave a trail.” is the compact footer signature.

The visual source of truth is [DESIGN.md](../DESIGN.md), extracted from the local implementation and desktop, tablet, and mobile review screenshots. This guide covers identity and assets; it does not certify a deployment, mainnet transaction, or trademark clearance.

## Name and voice

Write **ReturnTail** in prose and product metadata. The visual wordmark is lowercase **returntail**. Use clear verbs and describe the next action: request, review, approve, sign, observe, confirm. Keep application assertions separate from independently observed chain evidence.

Say “merchant-authorized refund,” “new refund transaction,” and “observed, unconfirmed” when those describe the actual state. Explain that BCH payments are irreversible and a refund is a new transaction. Wallet connection reveals public address paths; connection does not prove ownership, custody, or spending authorization. Never imply that ReturnTail holds signing keys or automatically moves production funds.

Instructional material may explain the resolution mechanism, but must not invent transaction identifiers, balances, endorsements, completed refunds, or mainnet proof. Screenshots in `.impeccable/review/` capture local presentation. Use the evidence workflow and real artifacts before publishing completion claims.

## Identity

The original mark is an R containing a returning arrow and a diagonal tail. The source geometry is implemented by `Mark` in `src/components/brand.tsx` and exported by `scripts/brand-assets.mjs`. Keep its square caps, angular arrow, original proportions, and one-color silhouette. Use deep plum on paper or saffron; use the light variant on dark plum. Never stretch, redraw, add decorative effects, or replace it with a generic return arrow.

The app lockup pairs this mark with **Rethink Sans Variable**, weight 650, tight tracking (-0.04em). Header lettering is 29px on desktop and 25px on mobile; the mark is 31×34px on desktop and 27×30px on mobile. The entire home link keeps a minimum 44px target. Use the isolated mark for small application icons and the lockup where the product name needs to be explicit. The current implementation does not establish a formal print clear-space or minimum-reproduction standard; test legibility at the intended export size.

Rethink Sans Variable carries headlines and the wordmark. **Manrope Variable** carries body copy and controls. Both are self-hosted from Fontsource and have bundled OFL licenses. The standalone wordmark and social artwork use the same Rethink lettering as the app, converted to scalable glyph outlines by Fontkit. Their SVG/PNG exports need no installed font.

## Color and material

Saffron (`#f3bc53`) and deep plum (`#2e1c36`) are the identity pair. White paper and lavender ground (`#f5f3f6`) provide the record surfaces. Use light plum, muted plum, and fine lavender-gray rules for hover, supporting text, and divisions. Exact secondary and semantic colors are recorded in `DESIGN.md` and `src/app/globals.css`.

Green communicates confirmed success, amber communicates uncertainty or review, and red communicates errors or rejection. Always pair these colors with readable text and an icon where used by the status component. A mainnet label identifies the active network; it is not proof that a transaction has occurred.

Flat operational panels, soft control corners, and connected numbered trails define the interface. The homepage instructional record and native wallet dialog have specific shadows; avoid adding general decorative elevation. Support reduced motion and keyboard focus in every branded interactive surface.

## Asset inventory and provenance

| Asset | Location | Use |
| --- | --- | --- |
| App mark and wordmark lockup | `src/components/brand.tsx` | Original inline SVG mark plus live Rethink Sans text |
| Original asset generator | `scripts/brand-assets.mjs` | Reproducible vector/raster export source |
| Plum mark | `public/brand/mark-dark.svg`, `.png` | Light-background brand use |
| Light mark | `public/brand/mark-light.svg`, `.png` | Dark-background brand use |
| Plum wordmark | `public/brand/wordmark-dark.svg`, `.png` | Standalone light-background lockup |
| Light wordmark | `public/brand/wordmark-light.svg`, `.png` | Standalone dark-background lockup |
| Social card | `public/brand/social.svg`, `.png` | 1200×630 sharing preview |
| Browser icon | `public/icon.svg`, `public/favicon-32.png` | Scalable and small browser icons |
| Application icons | `public/app-icon-192.png`, `public/app-icon-512.png` | Web manifest icons |
| Apple touch icon | `public/apple-touch-icon.png` | Home-screen icon |
| Web manifest | `public/manifest.webmanifest` | App name, saffron theme, lavender background |
| Provenance record | `public/brand/provenance.json` | Export origin and implementation notes |
| Font licenses | `public/brand/licenses/rethink-sans-OFL.txt`, `manrope-OFL.txt` | Bundled type licenses |

The mark and compositions are original ReturnTail vectors; no stock or generated raster artwork is used for this identity. Reference research informs the visual direction without copying another product's logo or layout. General interface symbols come from Lucide, separate from the original brand mark. Open-source dependencies and fonts retain their own licenses. Original creation and provenance do not constitute legal trademark clearance.

## Review checklist

- Confirm exported lettering matches the live Rethink Sans wordmark and update provenance when regeneration changes it.
- Check icon silhouette and text legibility at actual output size, on light and dark backgrounds.
- Preserve labeled controls, visible focus, minimum 44px action targets, and reduced motion.
- Check mobile wrapping for BCH addresses, network labels, amounts, and timeline stages.
- Verify every proof or completion claim against actual evidence before publishing.
