# November 20 interface refinement

The established saffron/plum identity, R mark, self-hosted Rethink Sans/Manrope typography, app architecture and financial controls remain authoritative in DESIGN.md. No new packages, template assets, decorative transaction records or presentation application.

## References actually consulted

- [Framer Marketplace free templates](https://www.framer.com/marketplace/templates/explore/free/) and [Finn](https://www.framer.com/marketplace/templates/finn/) / [public preview](https://finn.framer.media/): inspected editorial type hierarchy, short navigation and indexed project presentation. Finn is free to remix under its stated limited license; no assets/source copied. Used its prioritization of words and focused composition, not its portfolio anatomy or image cursor trail.
- [Magic UI Animated Beam](https://magicui.design/docs/components/animated-beam): inspected connected-node storytelling. Used the conceptual connection between stages, with original semantic HTML/CSS rather than an animated decorative network or copied component.
- [React Bits Split Text](https://reactbits.dev/text-animations/split-text): reviewed character/word entrances; rejected moving financial copy. The one authored motion is a brief chapter transition with reduced-motion support.
- [beUI](https://beui.dev/): inspected its timeline/collapsible navigation and publicly described MIT component library. Used a disclosure for the refund-limit explanation, not repetitive animated cards. No dependencies copied/installed.
- [21st.dev](https://21st.dev/): browsed component organization; kept transaction and security behavior in the existing bespoke code.

UI UX Pro Max’s local financial-status queries returned broad confirmation/form-feedback guidelines rather than BCH-specific material. They support explicit loading/failure feedback, but are not treated as an authoritative transaction-state model. The actual model comes from ReturnTail’s existing state machine and protocol evidence.

## Direction and alternatives

Considered a full-screen narrative, a dense operational landing page and an interactive connected trail. Chose the trail: visitors understand a partial-refund problem without creating a wallet session, while the real workspace remains the primary action. Existing fonts and colors are preserved. Composition shifts the hero from a passive conceptual record to a navigable explanation, tightens section spacing and adds one row-based inspection surface. No invented users, transaction IDs, amounts or completed outcomes.

“Play the Resolution” uses a clearly hypothetical damaged-item story. The persistent disclosure says no wallet requests or transactions. Chapters distinguish request, decision, authorization, broadcast, observation and confirmation. Financial invariant text links to isolated tests rather than pretending a button executed an excessive refund.

“Break It Lab” is a fixed GET-only allowlist: health, unauthenticated workspace and a synthetic UUID private-access boundary. Requests omit cookies/capabilities, never call reconciliation or mutation endpoints, and never render private response bodies. Results are actual HTTP responses and readiness fields. Infrastructure may log ordinary access requests. Network failures and unexpected statuses are visible. Database concurrency/BCH VM tests are explicitly separate fixture evidence.

`/wallet-check` and the merchant request comparator use only the already advertised public receiving chain and a native public address. No export/upload/storage of addresses or new credentials. Existing index-zero funding remains blocked regardless of the comparison result. New positive-index allocation is not an ownership proof.

## Verification

Actual screenshot and automated-check outcomes are recorded in VISUAL_QA.md and BUILD_STATUS.md after execution. No screenshot inspection or audit is implied merely by this design brief.
