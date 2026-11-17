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

Headless screenshots and DOM/keyboard checks only. No complete screen-reader audit, 200% zoom matrix or physical wallet/confirmed mainnet transaction UI has been verified. Browser tests explicitly cover actual QR creation/cancellation, private access, refund form/XSS handling and account workflows, while transfer signing needs the owner gate. Motion is state-oriented, uses transform/opacity, and is disabled by reduced-motion CSS. No invented dashboard metrics or testimonials.

Video alias warning was fixed by using the actual documented `Rethink Sans Variable` font name. No font-rule suppression was added. SVG/PNG/social exports now use exact outlined OFL Rethink lettering, and their original source/provenance is retained.
