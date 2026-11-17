# ReturnTail release report

November 17, 2026. Verified application/video source through `06b83de`; final documentation/handoff commit and clean/push state are recorded in the conversation and generated local `artifacts/RELEASE_MANIFEST.json`.

## A. Working features

Secure merchant registration/login and revocable sessions; store/public-key setup; official WizardConnect pairing QR/cancellation and signing adapter; unique-address payment requests; private customer links; actual raw-transaction recipient/amount/network verification; full/partial refund requests; merchant approve/reject decisions; atomic refund accounting; explicit wallet transaction review/signing; signed-byte validation and durable broadcasts; reconciliation/identical-byte recovery; confirmation/reorg handling; safe receipts/audit events; responsive original identity and deployment/judging preparation.

Money-moving code uses genuine wallet/network interfaces. Funded-wallet execution is the manual gate; isolated fixtures do not establish it.

## B. Exact checks

**75 tests pass: 28 core/unit, 36 genuine PostgreSQL integration, 11 browser.** Type generation/typecheck, lint and optimized production build pass. Final localhost smoke: 11/11; atomic migration and repeated checksum/no-op passed; secret scan passed; `npm audit` reported 0 vulnerabilities.

Actual desktop/tablet/phone/landscape captures were inspected. Independent design review returned ship; named target/focus fixes were remeasured. Hallmark static: 0 FAIL / 0 REFLEX, 7 adjudicated WARN; Impeccable detector `[]`. Overlay/Puppeteer render tier were not executed. See VISUAL_QA.md for precise limits.

## C. Mainnet evidence

**No ReturnTail mainnet payment/refund was executed. No owner funds were spent.** Live infrastructure verified an unrelated public transaction with merkle inclusion and agreement between bch.imaginary.cash and bch0.kister.net. Timestamp and identity are in MAINNET_PROOF.md. It is not app proof or Mainnet Track compliance.

## D. Deployment

No verified public deployment URL. Vercel/Neon configuration and smoke scripts are prepared. Optimized localhost:3001 was checked; this is not hosted verification.

## E. Security findings and mitigations

Scrypt, protected server sessions, origin checks, validation/body cap, persistent limits, HMAC capabilities, encrypted idempotency responses, SQL parameterization, locked/conditional reservations, unique output/input/settlement identities, VM/sighash/intent checks, TLS/checkpoints/merkle/witness verification and conservative unknown/reorg states are implemented.

Advisories from an unused generator were eliminated by removing it. WASM CSP was corrected without production arbitrary eval. Remaining risks: public-provider trust/availability, single-confirmation reorg risk, private links, xpub privacy, inline Next hydration CSP and no independent security review. No recovery/email-verification workflow, complete address discovery, token refunds, custody or AI endpoint is advertised.

## F. Incomplete verification

Physical Paytaca/Selene readiness/reconnect/refusal/signing; real payment/refund/confirmation; public deployment/hosted DB/cron; full screen-reader/zoom matrix; official DoraHacks eligibility/video duration; owner presentation and donation values. Final mainnet video needs actual wallet/chain footage.

## G–H. Owner actions and exact test

Use OWNER_CHECKLIST.md for secure Neon/auth/URL/network/cron configuration, Vercel authorization, eligibility confirmation, Widget Factory/token address, two tiny funded wallets, and the exact eleven-step payment→4,000-sat partial refund→over-limit rejection journey. It covers receive-index limits, fees, unknown-broadcast recovery, restart persistence and public receipt inspection. Never send recovery phrases or secrets in chat.

## I. Source history and status

`f970c0a`: foundation/research. `45748e2`: security/recovery/adversarial tests. `1db3218`: responsive app/identity/QA. `06b83de`: editable rendered preview. Closing documentation/push follow final scans; final SHA is in the handoff manifest/conversation. Origin is github.com/sopskistar/returntail. No unrelated owner configuration was committed.

## J. Competition readiness

**Not yet ready to claim complete Mainnet Track compliance.** Local code/QA and presentation/script are ready for owner verification. Real app transactions, live site, eligibility and required owner links/address remain gates. No DoraHacks entry or announcement was published.

The playable engineering preview is 45 seconds, 1080p, 30 fps, H.264 and explicitly labels no funds/mainnet pending. It is a progress preview, not the final mainnet demo.
