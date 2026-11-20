# Visual verification

Actual localhost captures were inspected at 1440×1000, 1280×800, 768×1024, 390×844, 375×812 and 844×390. Screenshots live in ignored `artifacts/screenshots/` and `.impeccable/review/`. Public captures show the actual optimized app; authenticated captures use explicitly labeled QA fixtures. They are not mainnet evidence.

Installed Premium UI Design, Hallmark, Impeccable, UI UX Pro Max, Brand Identity Studio, Frontend Motion Design, Design System and Frontend Visual QA informed this implementation. Reference research and access limits are documented in COMPETITIVE_RESEARCH.md. Browser reference capture of Framer preview/21st failed; beUI capture loaded without complete styling, so none is represented as a successful pixel reference. Public source/text research was completed before implementation.

## Independent review

Separate agents performed Impeccable assessments A and B. A established its design findings before agent-status metadata inadvertently exposed B's summary; A did not use B's detector/metrics to reach its design judgment. Hallmark finish-review guidance was included in A. A returned **ship**, 30/40 Nielsen heuristic score (“Good”), for the inspected screenshots/source. This is a visual verdict, not a security or funded-workflow certification.

Resolved findings: unpaid refundable amount now zero; mobile wallet payment moves before refund/activity content; narrow header no longer wraps a third navigation link; wallet internals move under “Can’t find your BCH?”; missing competition inputs become one honest status link; all named header/brand/tablet targets reach 44px; dark-section focus uses saffron.

B ran the Impeccable detector exactly once: exit 0, JSON `[]`. Nine fresh production route/viewport cases showed no horizontal overflow, no visible out-of-bounds descendants and no page errors. Registration keyboard traversal followed a logical sequence with visible focus. Final bounded measurements:

| Width | Brand | Visible header targets |
|---|---|---|
| 375 / 390 | 44px | Evidence 44px; workspace 51px |
| 768 | 44px | All navigation 44px |
| 1440 | 44px | Text links 47.09px; workspace 45.5px |

Both dark-section CTAs received actual `:focus-visible`: 3px saffron outline, 4px offset on plum, about 9.08:1. Muted text token on white calculates 6.12:1 and on the ground 5.55:1. These are measured pairings, not a comprehensive screenshot contrast audit.

The Hallmark static sweep reported **0 FAIL, 0 REFLEX, 7 WARN**. Warnings adjudicated: large saffron hero is the declared chromatic field; root token comparison does not represent button foreground (paper on plum); numeric selector warnings are false semantic matches/cascade already has tabular figures; shared field/control containment is deliberate operator consistency; long recovery label wraps to preserve meaning; “confirmed original payment” explanatory copy is not a fabricated success message (actual fetch/mutation handlers exist).

Hallmark’s Puppeteer render tier did not run because puppeteer-core was unavailable. Existing Playwright captured and inspected the real app instead. No redundant browser library was installed. Impeccable overlay injection was not run because it would require weakening the deliberate same-origin CSP. No overlay pass is claimed.

## Limits

Headless screenshots and DOM/keyboard checks only. No complete screen-reader audit, 200% zoom matrix or physical wallet/confirmed mainnet transaction UI has been verified. Browser tests explicitly cover actual QR creation/cancellation, private access, refund form/XSS handling and account workflows, while transfer signing needs the manual gate. Motion is state-oriented, uses transform/opacity, and is disabled by reduced-motion CSS. No invented dashboard metrics or testimonials.

Video alias warning was fixed by using the actual documented `Rethink Sans Variable` font name. No font-rule suppression was added. SVG/PNG/social exports now use exact outlined OFL Rethink lettering, and their original source/provenance is retained.

## November 20 follow-up: existing identity preserved

Impeccable assessments A and B ran independently. A inspected guide/auth/evidence at1440,834,390; its initial bounded score was27/36 (error-recovery n/a), with three concrete issues: a tablet trail collision, late wallet-preflight link and missing evidence bullets. All three were refined and rechecked; no new score is invented. B inspected nine fresh pages with loaded fonts/styles, no runtime errors/failed requests/overflow, and visible focus at120 keyboard stops. The CLI detector exited0 with151 advisories (148 font-size,3 radius, existing globals.css token conventions), not zero findings. No wholesale typography refactor was made during this production-readiness pass.

Actual Hallmark --render used already-installed Puppeteer/Chromium and produced15 captures. The first run reported5 FAIL,2 REFLEX,5 WARN. After refinement, the final-v2 run reports **0 FAIL,2 REFLEX,4 WARN**; its exit remains1 because reflexes are reported. Input boundaries measure3.97:1 on white and3.60:1 on form ground; auth trail text/saffron measures9.08:1. Login at834px is contained, and Workspace remains one line at320px. Final evidence paragraph width is585px/65ch.

Reflex adjudications: broad saffron auth fields are explicitly approved in DESIGN.md. The prose estimator still reports89 characters from inferred line counts despite verified65ch CSS/DOM width matching the design; this is dismissed as a heuristic mismatch. Warnings about hero accent and token similarity follow the approved identity; numeral-selector heuristics are nonblocking, and guide numbers/empty-state headings already have tabular-nums declarations.

Mutable overlay injection was attempted on three pages and blocked by the application's script-src self policy. No reliable overlay is claimed and CSP was not weakened. The temporary8401 tool server was stopped. Playwright screenshots/DOM checks and CLI findings supplied the evidence. Local captures and review artifacts are under ignored artifacts/local-final-refined and artifacts/review-b/final-v2. Headless checks do not establish complete screen-reader coverage or physical-wallet states.

Questions skipped: this was the authorized bounded release QA, not a request to select a new visual direction.

Hosted follow-up at the deployed a6382f3 frontend:15 real page captures (home/guide/register/login/evidence at1440,834,390) returned200 with no horizontal overflow and no JavaScript page errors; desktop/mobile captures were inspected. Browser transport emitted12 ERR_NETWORK_CHANGED console events; an earlier navigation failed outright and was retained as a failed attempt before the separate completed retry. These events are reported, not counted as a clean transport audit. The HTTPS account/QR flow completed separately with zero browser errors, and hosted smoke passed19/19.
