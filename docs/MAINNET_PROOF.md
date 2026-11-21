# Mainnet proof ledger

**Status — reported completed; independently reconciled proof is incomplete.** On November 21, 2026, the creator reported that the hosted ReturnTail application completed a physical-wallet BCH mainnet purchase and confirmed partial refund. This supersedes earlier statements below that no application mainnet payment/refund had occurred. Do not read the earlier reports as current state.

The reported journey is a self-test, not an unrelated customer case. User-reported facts are separated from independently checked chain facts and production application records. No transaction ID, output, block or refund database ID is claimed verified unless the corresponding field below says so.

## User-reported journey

| Event | Reported detail | Verification status |
|---|---|---|
| Customer payment | Selene → merchant Paytaca; BCH mainnet; 10,000 sats; txid `2ea6feed4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65` | Reported by the user; independent lookups below returned not found. Output index, address association, block, confirmations, and verification timestamp not independently established here. |
| Refund accounting | Customer requested 4,000 and 7,000 sats; merchant approved 4,000; app showed 6,000 remaining; approval of 7,000 failed with “Other approved refunds already reserve this purchase balance”; 7,000 request was rejected | User-reported production application result. Production audit/session evidence was not accessible to this read-only session. |
| Merchant refund | Paytaca signed 4,000 sats to Selene; displayed fee 454 sats; app later showed Confirmed and five trail stages complete | User-reported. Refund txid, actual output index/value, destination, block data, proof check time, refund record UUID, and persisted attempt/settlement rows still need authenticated retrieval and independent verification. |

## Independent lookup attempted — November 21, 2026

The supplied purchase txid was checked against three public endpoints:

- [Selene Explorer transaction lookup](https://explorer.selene.cash/tx/2ea6feed4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65?network=mainnet): returned “The requested page or chain item was not found.”
- [Blockchain.com BCH Haskoin transaction endpoint](https://api.blockchain.info/haskoin-store/bch/tx/2ea6feed4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65): returned `not-found-or-invalid-arg`.
- [Blockchair BCH transaction endpoint](https://api.blockchair.com/bitcoin-cash/dashboards/transaction/2ea6feed4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65): returned zero results at observed chain state 978340.

These responses do not prove the transaction never occurred; they do mean this session cannot attest to its bytes, output, confirmations or block. Recheck the exact txid copied from the persisted production order. The transaction id provided in chat may contain a transcription error, or indexers may not expose it; neither explanation is assumed.

## Safe production reconciliation still required

The current browser session has no authenticated merchant session, and the Vercel sensitive environment API returned 403. No authentication bypass was attempted and no production database credentials were read. To complete the ledger safely:

1. Sign in to the existing merchant workspace in your browser and open the confirmed 10,000-satoshi order.
2. Copy the payment txid and the 4,000-satoshi refund’s transaction id and refund record UUID from that order’s transaction/refund details. **Do not send a private customer link, browser cookie, access token, QR, seed phrase, or private key.** If the UI does not expose the refund record UUID, provide only the public reference and txids; the merchant session can use the existing authorized API/UI to retrieve it.
3. Check each exact txid in the [Selene BCH explorer](https://explorer.selene.cash/) and a separate BCH provider. Compare transaction bytes/identity, recipient output script and amount, block hash/height, confirmations and timestamp. For the app-level record, check the logged-in order detail and merchant audit/history screens; do not use a public txid as proof of merchant approval or reservation accounting.

The public receipt route uses the **refund database UUID**, not the transaction hash: `https://returntail.vercel.app/resolution/<refund-record-UUID>`. The read-only endpoint is `/api/resolutions/<refund-record-UUID>`. The hosted `/evidence` page currently displays “Mainnet proof is not yet published.” `PUBLIC_PROOF_REFUND_ID` has not been independently inspected or changed. Configure it only with the actual refund record UUID after the public receipt has been reviewed.

## Public receipt privacy review

Code review found that the receipt API selected the complete persisted chain observation, which included raw transaction bytes. The receipt API now whitelists public proof fields only: network, order reference, transaction IDs, output index and amounts, fee, confirmation/block details, and provider-proof metadata. It excludes destination addresses, customer reason, email, session/capability data, and raw transaction bytes. The isolated PostgreSQL regression test exercises this projection; it does not verify the production refund. This privacy fix is not public until its deployment is verified.

## Verified read-only infrastructure (not transaction evidence)

- November 20, 2026, 07:41:15 UTC: the authenticated Vercel runtime check verified TLS, mainnet fork checkpoints and matching block headers through bch.imaginary.cash and bch0.kister.net. Height 978134, block `000000000000000000e14ed5753390ed0c7e8f42d46c95ee729923f155af0c82`. **No transfer or wallet response.** Source milestone `5a67a44`; public app https://returntail.vercel.app.

- November 17, 2026, 12:41:04 UTC: Chipnet TLS provider chipnet.imaginary.cash; fork checkpoint at 115252 validated; observed tip 335328. No transfer.
- November 17, 2026, 13:03:52 UTC: mainnet TLS provider bch.imaginary.cash; BCH checkpoint at 661648 validated; observed tip 977752. No transfer.
- Machine-readable output is generated under ignored `artifacts/evidence/` by `npm run proof:network -- chipnet` and `npm run proof:network -- mainnet`.

These observations prove provider connectivity and chain identification only. They do not prove a purchase, refund, wallet handshake, wallet signing, or competition eligibility.

## Independently witnessed read-only transaction probe

On November 17 at 13:33:33 UTC, the actual verification path retrieved **an unrelated public coinbase transaction**, computed its identity, checked merkle inclusion, and compared block header/transaction bytes using bch.imaginary.cash and bch0.kister.net:

- Txid: `f19727e987b0f1d3c2caf62ea5ff340af1ec0c128674d5779f965cc223d9ea53`.
- Block: 977747, `000000000000000000604c1b8801ab7f0ecdb18a2baf4ef5c4b57ab35e07bcbd`.
- Observed confirmations: 7 at that timestamp; merkle inclusion verified and witness agreed.

**This is not a ReturnTail purchase/refund, maintainer transfer, or Mainnet Track transaction.** It verifies infrastructure behavior only. Machine-readable summary is in `artifacts/evidence/mainnet-external-probe.json`. The initial historical witness endpoint timed out; replacement was chosen from [Electron Cash's maintained registry](https://github.com/Electron-Cash/Electron-Cash/blob/master/electroncash/servers.json) and tested. Provider availability is an operational dependency.

## Chain proof fields (fill only after independent lookup)

| Field                         | Value                                                             |
| ----------------------------- | ----------------------------------------------------------------- |
| Public HTTPS deployment       | https://returntail.vercel.app — HTTPS/runtime verified November 20 |
| App commit                    | `d2f635de60a17e4e47915bc4de3288d189ad3148` (latest before this evidence update; verify deploy again after new commit) |
| Network                       | Mainnet required                                                  |
| Merchant wallet/version       | Creator reports Paytaca; earlier reported version was v0.27.3, not reconfirmed for the refund |
| Customer wallet/version       | Creator reports Selene; exact installed build for the funded payment not recorded here |
| Original payment txid/output  | User-reported txid above; output unverified                       |
| Original recipient amount     | User-reported 10,000 sats; output unverified                      |
| Original block/confirmations  | Not independently verified                                        |
| Refund txid/output            | Not accessible to this session                                    |
| Refund recipient amount / fee | User-reported 4,000 / 454 sats; chain output unverified            |
| Refund block/confirmations    | Not independently verified                                        |
| Primary/witness provider      | Not checked for these reported transactions                       |
| Public-safe receipt URL       | UUID unavailable; `/evidence` remains unpublished                 |
| Excess approval refusal      | User-reported production result; audit record not retrieved        |

Explorer: use the actual network-specific link on the purchase and resolution receipt. A valid-looking hash is not evidence. Confirm byte-derived identity, recipient output, amount, merkle inclusion and witness agreement.

What remains an application assertion even after chain lookup: original-order association, customer's reason, merchant decision, internal reserved balance and decision history. Chain facts are transaction outputs and inclusion. Controls cannot prevent extra manual transfers outside ReturnTail.

## Physical-wallet report — November 20 snapshot (superseded by the November 21 user report)

The earlier state was reported directly: Paytaca v0.27.3 on Samsung S24 Ultra connected through WizardConnect; the public merchant receiving key and a real payment request were saved on production. Its receive index zero differs from native Receive. **At that November 20 checkpoint no BCH had been transferred.** Native release source reserves receiving0/0 for message encryption and hides it in Receive. The index-zero request remained unfunded, and exact destination control was unverified. This is a dated wallet/setup report, not current funded-journey status. The November 21 user report and present evidence gaps are documented at the top of this ledger.
