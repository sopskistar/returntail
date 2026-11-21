# Final BCH BLAZE demo — proof-first production plan

**Final render is blocked on transaction reconciliation and real evidence capture.** The existing `artifacts/video/ReturnTail-preview.mp4` is a 45-second silent engineering preview built from isolated QA screenshots. It is not a mainnet demo and must not be uploaded as the final video. No physical-wallet screen recording or verified refund transaction data is available in this workspace. The deadline stated by the official site is November 22, 2026, 14:00 UTC; no official duration/codec cap was confirmed. Ask DoraHacks/organizers or inspect the submission form before encoding a duration.

The user's damaged-parcel setup may be used only as a clearly labeled hypothetical scenario. The actual payment/refund was a creator self-test. The user-reported transaction details must not appear as independently verified until `MAINNET_PROOF.md` is complete.

## Storyboard (target 100–120 seconds; not an official requirement)

| Beat | Picture to capture from the real release | Voice-over / on-screen copy |
|---|---|---|
| 0–10s: problem | ReturnTail opening; “hypothetical damaged parcel” card | “A small problem after checkout should not become a trust problem.” |
| 10–22s: purchase | Logged-in production order status and publicly verified 10,000-sat output; hide customer access and unrelated balances | “A customer pays the merchant directly in BCH. ReturnTail checks the exact payment output.” Include txid only after external reconciliation. |
| 22–36s: request | Customer refund request screen with reason/address masked | “The customer asks for a partial refund to a receiving address they choose.” |
| 36–52s: decision | Merchant inbox showing approved 4,000; then 7,000 approval failure and rejected request; show recorded remaining amount | “Approval reserves the balance. A second request that would exceed it is refused.” Label as the user's self-test and capture the actual UI; do not reconstruct a fake error dialog. |
| 52–72s: wallet authorization | Actual Paytaca review/signing recording if available; show 4,000 amount and 454-sat fee, hide unrelated data | “The merchant reviews and authorizes a new refund transaction in their wallet.” If no recording exists, use an honest product screen plus text “Wallet authorization reported; no wallet footage recorded.” Do not animate a fake wallet. |
| 72–92s: chain proof | Independently inspected refund tx, output, block and explorer; show application record beside chain data | “A wallet signature is not settlement. ReturnTail checks the transaction and its block inclusion.” Do not show “confirmed” until proof is reproduced. |
| 92–108s: public-safe receipt | Logged-out public receipt and `/evidence`, after live privacy review | “The receipt shows what happened on chain and distinguishes it from application decisions.” Never show private customer link, refund reason, login or address. |
| 108–120s: value and limits | Existing logo, live app and repository URLs | “ReturnTail makes direct BCH refunds easier to track. Wallet custody stays with the merchant; the app cannot stop transfers made outside it.” |

## Capture and quality gates

1. Use the live production app with the existing authorized merchant session; do not create a new financial record. Capture merchant order/refund UI only after the record is independently reconciled. Keep raw source clips local and redact unrelated customer/private data.
2. Capture the real transaction lookup in two BCH sources. Record a shot manifest with the exact txids and retrieval time. No fabricated wallet response, fake customer, mock chain status, synthetic balance, transaction ID, or artificial confirmation wait.
3. If the physical wallet was not recorded, disclose that the signing was user-reported and use a text card; do not imitate the Paytaca UI.
4. Follow official duration and format requirements if obtained. Then render with the existing `video/` Remotion project, inspect the start/middle/end and a contact sheet, verify mobile text readability, watch the complete video, listen to the complete audio, and verify duration/codec/resolution/frame rate with FFprobe.
5. Keep the editable Remotion source, original captures, license notes, shot manifest, final MP4, and verification report. Do not publish the old engineering preview under a final-demo label.
