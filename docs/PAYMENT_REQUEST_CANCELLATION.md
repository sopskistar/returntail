# Cancel an unpaid payment request and create a correction

Keep the existing merchant account, saved receiving key and Paytaca browser session. This workflow never rewrites an existing destination or moves BCH.

## Cancel the incorrect request

1. Open [Payments](https://returntail.vercel.app/workspace) in your existing merchant browser and open the **100,000-satoshi / 0.00100000 BCH** request. Verify its recorded receive index is **0**. Do not fund it.
2. Select **Cancel payment request**, then **Confirm cancellation**. The server checks merchant authentication, recorded payments, all signing attempts (including cancelled signing intents), refunds, reservations and settlements. It also checks receiving-address history before committing cancellation.
3. Continue only when the request says **Cancelled**. It remains in Payments and retains its original destination, amount and activity record. If activity or uncertain transaction evidence blocks cancellation, stop for manual review; do not replace, delete or hide those records.

## Create the 10,000-satoshi correction

1. On the cancelled request, select **Create corrected request**. The original description is carried forward; the amount field displays **10000**. Confirm **10,000 satoshis = 0.00010000 BCH**.
2. Select **Review payment request**. The confirmation shows the exact receiving address and index. New automatic allocation starts at index **1 or later**, checks previous allocation and blockchain history, and never reuses a cancelled address.
3. If the preview uses **index 1**, compare its entire address with the native Paytaca BCH Receive address before confirming. The reported physical preflight found a public receiving-chain match at index 1; this does not establish cryptographic control or verify every newly created request.
4. If a different index is proposed, select **Go back** and expand **Match a different positive Paytaca Receive index**. Keep the existing merchant wallet connected. To request index 1 specifically, enter **1** and paste the native Paytaca public address. The browser must derive that same destination from the connected advertised receiving chain. The server requires the saved merchant chain, an unused positive index and no blockchain history. If index 1 is already allocated or has history, it cannot be recycled. Select a fresh native Receive address and its verified positive index instead.
5. Review again, then select **Create private payment request**. Freshness is checked again when saving. An automatic allocation change requires another review. An uncertain creation response can be retried with the same reviewed input and idempotency key to recover the same private link.
6. The creation screen displays the complete **Private customer purchase link**, including its fragment access token. Select **Copy private customer link** and save it privately. Never paste that link into public chat, a public receipt, a screenshot for sharing or the repository.

## Compare the exact new destination with Paytaca

1. In Paytaca, select the same personal wallet/account used for WizardConnect. Open **Receive**, choose **BCH**, and choose **Personal** under **Receive for** if offered.
2. Copy the native public receiving address, including its network prefix. Keep the payment request unfunded.
3. On the new request or creation screen, use **Compare your wallet’s Receive address**. Paste only the native public address and select **Compare address locally**. The comparison checks both the connected chain at the request’s recorded index and the pasted native destination. It handles equivalent standard/token-aware CashAddress encodings by comparing their locking scripts.
4. Continue only on an **Exact destination match** at the new request’s recorded positive index. A match to some other index is a different destination. A mismatch or inconclusive search stops funding. The exact recorded destination can be checked even beyond the discovery search’s 0–255 range.
5. This is a public-address consistency check. Pairing, public derivation and matching are not cryptographic ownership proof. No signing request or BCH transfer is part of this preflight.

## Late activity and evidence

Cancellation closes the application payment path; it cannot prevent an external transfer to a BCH address. **Check cancelled address**, order reconciliation and the authenticated daily reconciliation job check retained cancelled destinations. Any history, even an underpayment or other unexpected activity, sets a persistent **Review required** flag while keeping the lifecycle **Cancelled**. The activity record retains transaction identifiers and any separately obtained full observation. It does not automatically mark the purchase paid, create refundable balance, release uncertain reservations or discard evidence. A failed provider check never establishes absence. The screen shows the last successful check; the daily job has no real-time guarantee.

## Unfunded Selene preflight

You can proceed with pairing and native-address comparison in a **separate customer browser profile** at [Wallet Preflight](https://returntail.vercel.app/wallet-check), preserving the merchant Paytaca session. Record Selene’s installed version and compare its native BCH Receive address with its advertised receiving chain. Do not authorize a payment, sign a transaction or transfer BCH during this step. Selene physical compatibility and any future signatures remain unverified until actually tested. See [the wallet preflight](WALLET_ADDRESS_PREFLIGHT.md).

## Implementation and verification boundary

`0002_payment_request_cancellation.sql` only adds the cancellation metadata table and index. The migration runner checks every migration checksum under one advisory lock and transaction; it does not reset accounts, keys, orders or sessions. The Vercel production build applies this additive migration using the existing production database configuration. Local fixtures are restricted to localhost and never run against Neon.

Cancellation and payment preparation/verification/signing serialize on the existing order row lock. Cancellation is merchant-only and idempotent, with an atomic audit event. Fresh address allocation serializes on the store lock, checks orders as well as wallet-address rows, and keeps the receiving high-water mark from moving backwards. Manual selection accepts only the saved chain plus a positive index; arbitrary destination strings are rejected by the strict API schema.
