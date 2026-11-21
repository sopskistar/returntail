# ReturnTail verification handoff — November 21, 2026 UTC

## Decision: begin unfunded preflight only

**Do not fund the preserved index-zero request. It is not independently ownership-verified.** No ReturnTail BCH payment/refund was executed, no mainnet proof was added, and the hackathon was not submitted.

### Paytaca v0.27.3 on Samsung S24 Ultra

Release source explicitly reserves receive0/0 for message encryption. Normal Receive substitutes index1 and may advance further. WizardConnect supplies the public receiving chain, not the currently displayed address. ReturnTail correctly derived child0 from that chain, but allocating zero conflicted with native inspection. BCH versus CashToken-aware encoding is a separate possible text difference; the new comparator normalizes actual destinations.

No supported arbitrary-index address display or independent message-signing proof was found for this release’s native interface/WizardConnect implementation. A local SDK `getPubkey` calculation uses the same xpub and is not independent ownership evidence. Account/Personal-versus-POS selection still matters for comparing the phone’s displayed positive index.

Existing account, wallet session key, merchant receiving key, order address/index and private capability were not reset or rewritten. Server and UI block new index-zero payment preparation/authorization. Existing durable signed bytes remain reconcilable/recoverable; unknown outcomes retain their reservations. Future allocations start at1, but this does not verify ownership or silently replace your current request.

### Exact safe actions

1. Keep the existing merchant account, request and browser profile. Do not export recovery material or spending keys.
2. On the Samsung, select the same wallet in Paytaca, open **Receive**, select BCH and **Personal** under **Receive for** if shown. Copy only the public address.
3. Open [wallet preflight](https://returntail.vercel.app/wallet-check) in the merchant browser, or the embedded checker on your existing request. Reuse the current connection. Paste the native address and select **Compare address locally**.
4. A match reports the native receiving index in0 through255. The embedded request checker also verifies that the connected chain derives the stored request address at its stored index. Nothing is uploaded/persisted by comparison.
5. A positive-index match establishes consistency with the advertised chain, not control of hidden zero. Wrong-network/no-match/account differences stop the workflow. There is **no supported safe exact-zero confirmation step available in the reviewed release**, so the request stays unfunded even if a later chain child matches. A wallet-supported exact-address proof/display capability or a separately authorized positive-index request with an exact native address match is needed before funding. No replacement was created.

### Next: Selene, still unfunded

Use a separate customer browser profile. Record installed Selene version and select its intended BCH wallet. Pair at `/wallet-check`, copy its native Receive address and compare locally. The actual matched index—not an assumed zero—locates its receiving chain. Checkout searches five consecutive receive indices from the selected start; change-only balances are not selected. No eligible confirmed BCH must yield a clear error without requesting a signature.

For a later refund, copy the destination from Selene’s native Receive screen, never from an original transaction input. Change is calculated from the wallet’s advertised change chain at child0. This calculation is not independent ownership proof. At eventual real signing, stop unless the wallet recognizes its sources/change and all destination/amount/fee outputs agree. Installed-device pairing, session recovery, rejection, change recognition and signing remain manual gates. Source compatibility reviewed at released2026.10.02 does not establish the installed app’s behavior.

## Genuinely verified on Vercel

- Application release `fed4923ade8902fdace7e73742ae232be1bf5a61` is READY at https://returntail.vercel.app; exact SHA verified from Vercel metadata. Build log proves migration checksum verified and optimized build/deployment completed.
- Hosted smoke: **21/21**,2026-11-21T04:35:29Z; public pages including `/lab` and `/wallet-check`, security headers, private caching, custom404, database/migration readiness, configured authentication, mainnet configuration, unauthorized APIs and cross-origin mutation rejection. No accounts/orders or funds created.
- Live lab: **3/3**,04:35:46Z; actual200 readiness and401 private workspace/purchase boundaries; no cookie/capability or financial writes. Health confirms configuration/readiness, not blockchain observation.
- Runtime sample: **50 recent entries**,0 error entries,0 HTTP5xx,0 TLS alias warnings at04:36:30Z. This is a bounded sample, not a promise of continuous uptime.
- Actual desktop/tablet/mobile captures inspected. Initial hosted run had9/12 clean and3 with Chromium `ERR_NETWORK_CHANGED` asset requests. All3 targeted retries were200, correctly styled, with no request/browser errors; originals retained. Local captures12/12 clean. No production merchant credentials or private receipt used.
- Play the Resolution explains a hypothetical damaged-item problem with a persistent no-transaction disclosure. Break It Lab performs real read-only boundary probes and separates isolated financial tests. Original branding/architecture retained. Pending/unknown transaction notices no longer use confirmation green.

Real production Paytaca pairing/key/request persistence is your directly reported result. It is recorded honestly, not replaced by an automated fixture claim. Existing HTTPS authentication/profile persistence verification predates this release; current auth flows were rerun locally, and production authorization boundaries were rechecked without modifying your account.

## Exact automated outcomes

| Check | Result |
|---|---|
| Typecheck | PASS |
| ESLint | PASS |
| Unit/core |40/40 PASS|
| Isolated PostgreSQL integration |45/45 PASS|
| Optimized production build |PASS|
| Localhost browser |17/17 PASS,55.5s|
| Local migration |Existing checksum verified/no-op|
| Local smoke |21/21 after explicit synthetic local job-auth configuration|
| Hosted smoke |21/21|
| Hosted read-only lab |3/3|
| npm audit |0 reported vulnerabilities|
| Secret-pattern scan |PASS,138 candidate files before this report; closing scan recorded in BUILD_STATUS|
| Hallmark |Actual render ran;0 FAIL,2 documented/adjudicated REFLEX,5 WARN|
| Impeccable |Independent A/B reviews; issues corrected; detector0 primary/181 advisory|

**102 automated unit/integration/browser tests passed.** They use isolated local financial fixtures and real BCH parsing/VM validation; they are not mainnet transfer evidence. The initial local smoke had19/21 because both jobs were intentionally unconfigured and returned503; setting a synthetic secret only on the local process yielded the expected401 and21/21. Initial database fixture failures and the synthetic credential-pattern scan finding were corrected and rerun; no real credential was committed. No tests or fixtures were run against production financial data.

## Still unverified or blocked

- Exact Paytaca index-zero destination control and all funded wallet-to-network behavior.
- Fresh mainnet provider probe in this session: local DNS returned ENOTFOUND. Public DNS resolves both providers, but this does not establish Electrum connectivity. Authenticated production network recheck was unavailable because Vercel’s sensitive environment API omits the secret value. Previous dated genuine network evidence is retained in MAINNET_PROOF.md; failed attempts are not described as passes. Provider/network verification must be repeated before any later authorized funding.
- Genuine purchase/refund txids, confirmations, excessive-refund rejection on that genuine journey and public-safe settlement receipt. `PUBLIC_PROOF_REFUND_ID` remains unset.
- Public Google Slides URL for `WIDGET_FACTORY_URL` remains absent. CashTokens donation address is configured and renders on production.
- Registration, workshop roll-call, Telegram verification and final track/video rules still require organizer/participant evidence. No eligibility claim or submission made.

## Preserved commit history

- `a985206` — fix: block unverified Paytaca index-zero funding and add safe preflight
- `ed57c82` — fix: preserve explicit PostgreSQL certificate verification
- `0f67a60` — test: clarify isolated PostgreSQL connection fixtures
- `fed4923` — feat: add resolution walkthrough and read-only security lab

Normal commits/pushes to main; no squash, rewrite or force-push. The closing documentation commit records these results and is independently visible in Git. Complete preflight detail: [WALLET_ADDRESS_PREFLIGHT](WALLET_ADDRESS_PREFLIGHT.md). Later funded steps remain gated in [deployment and physical-wallet checklist](OWNER_CHECKLIST.md).
