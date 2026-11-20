# Physical-wallet readiness — November 20, 2026

**Ready for an unfunded device preflight; a funded journey is conditional on that preflight.** No physical Paytaca or Selene handshake, signature or app mainnet transfer has been observed yet. Production QR creation/cancellation and the deployed runtime's real BCH provider connections have been verified. See [the exact checklist](OWNER_CHECKLIST.md).

## Reviewed compatibility

| Component | Reviewed evidence | Remaining device check |
| --- | --- | --- |
| ReturnTail | Official core 0.2.10, dapp 0.2.7, React 0.2.6; hex transaction, complete source outputs, explicit input paths, `broadcast:false`, strict 0x61 BCH VM verification | Pair, reconnect, reject and sign with the installed applications |
| Paytaca merchant | [Released v0.27.3](https://github.com/paytaca/paytaca-app/releases/tag/v0.27.3), November 8. [Service](https://github.com/paytaca/paytaca-app/blob/v0.27.3/src/wallet/wizardconnect/service.js) exports receive/change chain xpubs and derives exact input paths; [actions](https://github.com/paytaca/paytaca-app/blob/v0.27.3/src/store/wizardconnect/actions.js) honor `broadcast:false`; [signer](https://github.com/paytaca/paytaca-app/blob/v0.27.3/src/wallet/bch-sign.js) uses 0x61 | Exact installed version/platform, address match and physical authorization |
| Selene customer | [Release 2026.10.02](https://git.xulu.tech/selene.cash/selene-wallet/-/tags/2026.10.02), commit `2eec950287c414f55a480c63ba5132606b6f8b33`; [released adapter](https://git.xulu.tech/selene.cash/selene-wallet/-/blob/2026.10.02/src/kernel/bch/WizardConnectService.tsx) exports named chain xpubs, validates source ownership, signs exact input paths with 0x61 and returns signed hex | Exact installed binary, pairing, receive/change paths, sign-only behavior and refusal |

Use the reviewed Paytaca release or independently review any different version before funding. **Exclude Paytaca v0.26.1**: its [release notes](https://github.com/paytaca/paytaca-app/releases/tag/v0.26.1) explicitly say it broadcasts regardless of the dapp flag. ReturnTail must save and validate signed bytes before broadcasting; a wallet that broadcasts early breaks that safety boundary. Later release numbers alone are not compatibility evidence. Source review is not an installed-device test.

[WizardConnect protocol](https://docs.riftenlabs.com/wizardconnect/protocol/) shares public paths, not an authenticated legal identity. No wallet message-signing capability is assumed. No recovery phrase, WIF or private spending key belongs in ReturnTail.

## Before any transfer

Use a dedicated, initially unfunded merchant wallet in Paytaca and a separate customer wallet in Selene. Select BCH mainnet in both; record exact app versions/platforms. Use separate browser profiles so merchant login and customer receipt access remain separate. Pair each wallet with its own real ReturnTail QR; approve the connection only after checking the app and relay. Reject a connection, reconnect and reload once. A QR alone does not establish compatibility.

Save the merchant's receive public key. ReturnTail derives children of the wallet's advertised `receive` chain; it does not guess an account-level path. Paytaca's reviewed implementation uses `m/44'/145'/0'/0/N` for receiving and `m/44'/145'/0'/1/N` for change. Selene uses the selected wallet's derivation, via the protocol's abstract receive/change names.

Create a request and read its **merchant receive index**. Compare the complete address at that index against Paytaca's own address list/derivation view. Also compare the first receive address in Store & wallet. If the installed wallet cannot show the requested index, or the full addresses disagree, **stop before funding**. Do not substitute a matching prefix, an explorer balance or a pasted xpub for this check. Record the full-address match privately; do not publish xpubs. This is a human wallet/address check, not a claim of cryptographic ownership proof. The app keeps ownership unverified until a valid observed spend proves control of a specific source address.

New requests probe at most five candidate receive addresses. Mainnet uses the union of two providers' histories and skips previously used addresses; failure to check history stops creation. Requests from before this safeguard cannot prepare/verify a payment and require a new link or manual review of any existing transfer. Never backfill a freshness audit marker to bypass that gate.

## Transaction and recovery checks

Funding discovery currently scans five **receive** addresses starting at the selected index. It selects confirmed, token-free standard P2PKH BCH only. Change-only funds are not selected. Use the exact receive range holding the confirmed coins; merchant refunds can use the original confirmed payment if its index is in that range. Change is derived from the connected wallet's change chain at index zero. Compare it during review. A token-aware donation address is distinct from the standard BCH refund destination required here.

Review network, original purchase, recipient, integer-satoshi amount, fee, total debit, sources and change both in ReturnTail and the physical wallet. Reject signing once before the intended approval. Disconnect before signing once. Neither action may mark an order paid. If a wallet signs but the browser loses its response before ReturnTail receives it, reconcile known evidence; do not assume no transaction exists, particularly with an unreviewed wallet build.

ReturnTail validates unchanged transaction fields and every signature against independently retrieved source outputs, then durably saves signed bytes and txid before broadcasting. A timeout retains reservations. Reconcile first; recovery only rebroadcasts identical saved bytes. Never prepare a replacement with new inputs while the prior fate is unknown. Confirmed settlement converts reserved to settled once; reorgs retain accounting and flag review.

## Genuine runtime evidence

At 2026-11-20 07:41:15 UTC, authenticated `/api/jobs/network` on Vercel verified BCH checkpoints and matching mainnet tip header at height 978134 through `bch.imaginary.cash` and `bch0.kister.net`, block `000000000000000000e14ed5753390ed0c7e8f42d46c95ee729923f155af0c82`. No transfer, wallet response or app transaction is implied. The protected check queries no wallet addresses and cannot sign or broadcast.
