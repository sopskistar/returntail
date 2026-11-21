# BCH mainnet evidence ledger

**Status: the reported Selene/Paytaca self-test is independently reconciled on chain.** This ledger was updated November 21, 2026 after locating the correct purchase txid and opening the screenshot’s public receipt. Chain records below are cross-checked between Selene Explorer and Blockchair. The ReturnTail receipt is available without authentication. Merchant decision/audit rows remain an application-level record and were not accessed in this verification session.

This was a self-test, not an unrelated customer transaction. Wallet product attribution (Selene and Paytaca) is based on the participant’s first-hand report and ReturnTail application context; an on-chain transaction alone does not identify the wallet application that created it.

## Corrected transaction identifier

The first supplied identifier in the previous ledger was `2ea6feed4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65`. The screenshot/public receipt gives **`2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65`**. These differ at one character (`...feed...` versus `...fecd...`). The earlier hash did not resolve in the prior checks; the corrected hash resolves independently in two BCH providers and is linked to the refund as its input. The previous not-found results were for the mistyped hash, not evidence that the BCH network or explorers were unavailable.

## Independently checked BCH mainnet facts

| Fact | Purchase | Refund |
| --- | --- | --- |
| Transaction ID | [`2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65`](https://explorer.selene.cash/tx/2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65?network=mainnet) | [`c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b`](https://explorer.selene.cash/tx/c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b?network=mainnet) |
| Second provider | [Blockchair transaction](https://blockchair.com/bitcoin-cash/transaction/2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65) | [Blockchair transaction](https://blockchair.com/bitcoin-cash/transaction/c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b) |
| Payment/refund output | `vout 0` — **10,000 sats** | `vout 0` — **4,000 sats** |
| Block | Height **978327**; hash `0000000000000000002aa13e287c2ac732a0f45edfd1897ce63b610cc9940e70` | Height **978337**; hash `000000000000000001a1fd253dac1529f3de6e130440f5678a79ead87cd2d172` |
| Transaction time | 2026-11-21 14:57:19 UTC | 2026-11-21 15:56:01 UTC |
| Provider confirmations | **28** at observed tip 978354 | **18** at observed tip 978354 |
| Transaction economics | One 3,680,000-sat input; 10,000-sat merchant output and 3,669,546-sat second output; 454-sat fee | Spends the purchase’s exact `vout 0` (10,000 sats); 4,000-sat refund output and 5,546-sat second output; 454-sat fee |

The transaction data and heights agree in both explorers. Selene Explorer reports the block hashes and confirmation counts; the production receipt records matching block hashes, block heights, merkle verification, and provider/witness agreement. Blockchair’s API response reported chain state 978354 (cache timestamp 2026-11-21 18:17:30 UTC); the confirmation numbers above are a snapshot at that tip and will increase or change if the chain advances or reorganizes. They are not a promise of finality.

The public `explorer.selene.cash` transaction JSON exposes the raw transaction; Blockchair reports the same txids, outputs, spend relationship, fees, and block heights. Blockchain.com’s Haskoin endpoint returned not-found for the corrected hashes during this check, so it is not counted as an agreeing source. The two agreeing sources are Selene Explorer and Blockchair.

## ReturnTail application record and public receipt

The logged-out public API `GET https://returntail.vercel.app/api/resolutions/6c5fb204-f24e-4fa1-b944-d4ff710ecb02` returned HTTP 200 during this check. Its persisted application fields were:

- Refund database UUID: **`6c5fb204-f24e-4fa1-b944-d4ff710ecb02`** (this is not a transaction hash).
- Reference: `RT-D992C0E1`; network: `mainnet`; refund state: `confirmed`.
- Purchase txid/output/amount: corrected purchase txid, `vout 0`, 10,000 sats.
- Refund txid/amount/fee: `c4ce3d46…`, 4,000 sats, 454 sats.
- At the last stored application check: purchase 16 confirmations at block 978327, checked `2026-11-21T16:52:54.138Z`; refund 6 confirmations at block 978337, checked `2026-11-21T16:52:52.917Z`. Later explorer observations above reported 28/18 at tip 978354.
- ReturnTail recorded `bch.imaginary.cash` as primary and `bch0.kister.net` as witness, with merkle inclusion marked verified for both transactions.

The receipt response contains only the public-safe projection: identifiers, order reference, network, amounts/output, fees, confirmation/block metadata, and provider-proof metadata. It does not include raw transaction bytes, destination addresses, customer reason/email, private customer capability, or merchant session. The endpoint was queried without authentication. The direct [public resolution receipt](https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02) remains the judge-facing proof link.

The existing Vercel **Production** configuration currently features this record on `/evidence` using `PUBLIC_PROOF_REFUND_ID`:

```text
6c5fb204-f24e-4fa1-b944-d4ff710ecb02
```

The logged-out production page rendered the configured receipt after deployment. If the setting is ever removed, restore this UUID (not either transaction hash), redeploy, and check the page logged out.

## Application decisions that need the merchant record

The participant reports that the merchant approved the 4,000-sat refund, that this reserved 4,000 sats and left 6,000 sats available, and that approving the additional 7,000-sat request failed with `Other approved refunds already reserve this purchase balance`; the 7,000-sat request was then rejected. This is first-hand production testimony. The public receipt proves a confirmed 4,000-sat resolution record and its chain link, but it does **not** include the private decision audit trail or the failed 7,000-sat decision. This session did not possess an authenticated merchant session and did not access private records.

For a complete application audit, sign in through the existing merchant account, open reference `RT-D992C0E1`, and inspect its refund decision/history entries. Confirm the 4,000 request is approved/settled, the 7,000 request is rejected, and the final 4,000 settled / 0 reserved / 6,000 available accounting is shown. Do not share a private customer link, cookie, password, capability, wallet session, QR, seed phrase or private key.

## What each evidence source establishes

- **BCH provider data:** txids, raw transaction identity as reported, exact outputs/fees, spend relationship, block height/hash, and provider confirmation/inclusion data.
- **ReturnTail public receipt:** the application’s purchase/refund association and stored settlement/evidence state, with private details excluded.
- **Authenticated merchant history:** who requested/approved/rejected each refund and the internal reservation/settlement accounting. This remains to be checked directly by the participant.
- **Wallet attribution:** Selene/Paytaca use is first-hand reported; chain data cannot prove which phone application was used.

These checks are provider-assisted. ReturnTail does not run a full independently validated proof-of-work node. A correct public transaction and a connected/public wallet key are not proof of ownership of every wallet address. No extra BCH was sent during this verification.

## Historical infrastructure checks (not this transaction)

Prior read-only mainnet probes validated network identity, TLS provider connectivity, BCH fork checkpoints, and a merkle proof for an unrelated coinbase transaction. These are infrastructure tests, not this purchase/refund. Their timestamps and commands remain in Git history and earlier dated report entries. The old November 20 section stating there was no funded payment is a snapshot from before the user-reported November 21 journey and is superseded by the verified chain facts above.
