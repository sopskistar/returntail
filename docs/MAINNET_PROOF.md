# Mainnet proof ledger

**No ReturnTail mainnet payment or refund has been executed.** Production is live and infrastructure checks below are genuine; funded wallet execution and final transaction evidence remain pending. `PUBLIC_PROOF_REFUND_ID` remains unset.

## Verified read-only infrastructure

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

## Funded workflow record (fill only from genuine evidence)

| Field                         | Value                                                             |
| ----------------------------- | ----------------------------------------------------------------- |
| Public HTTPS deployment       | https://returntail.vercel.app — HTTPS/runtime verified November 20 |
| App commit                    | Pending final test                                                |
| Network                       | Mainnet required                                                  |
| Merchant wallet/version       | Pending                                                           |
| Customer wallet/version       | Pending                                                           |
| Original payment txid/output  | Pending                                                           |
| Original recipient amount     | Pending                                                           |
| Original block/confirmations  | Pending                                                           |
| Refund txid/output            | Pending                                                           |
| Refund recipient amount / fee | Pending                                                           |
| Refund block/confirmations    | Pending                                                           |
| Primary/witness provider      | Pending observed execution                                        |
| Public-safe receipt URL       | Pending                                                           |
| Duplicate rejection evidence  | Pending funded journey; isolated database tests are separate evidence |

Explorer: use the actual network-specific link on the purchase and resolution receipt. A valid-looking hash is not evidence. Confirm byte-derived identity, recipient output, amount, merkle inclusion and witness agreement.

What remains an application assertion: original-order association, customer's reason, merchant decision, internal reserved balance and decision history. Chain facts are transaction outputs and inclusion. Controls cannot prevent extra manual transfers outside ReturnTail.

## Physical-wallet report — November 20 (not an on-chain proof)

Reported directly: Paytaca v0.27.3 on Samsung S24 Ultra connected through WizardConnect; the public merchant receiving key and a real payment request were saved on production. Its receive index zero differs from native Receive. **No BCH transferred.** Native release source reserves receiving0/0 for message encryption and hides it in Receive. Exact destination control remains unverified; the request is preserved with new funding blocked. A local public-chain comparison is now available, but cannot prove hidden-index control. See [safe address preflight](WALLET_ADDRESS_PREFLIGHT.md). Selene physical pairing/signing and all app payment/refund txids remain pending. This is reported wallet/setup evidence, not independent BCH transaction evidence.
