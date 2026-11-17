# Product specification

Promise: **A payment problem should not become a trust problem.**

Small BCH merchants create a unique-address payment request, share a private customer link, verify payment, review refund requests, and authorize a new BCH refund transaction through their own wallet. Customers hold an unguessable receipt capability, request a valid destination and amount, and track settlement.

Acceptance criteria:

1. Account password is scrypt-hashed; server-side session enforces store isolation.
2. Merchant explicitly saves a wallet-provided receive xpub. Connection and xpub possession are **not** ownership proof.
3. Orders derive one P2PKH address per order under a locked store counter. Network is immutable and validated.
4. Server retrieves raw transaction data, computes its txid, checks exactly one token-free recipient output and exact integer-satoshi amount, and allocates `(network, txid, vout)` uniquely.
5. Refund requests require a confirmed purchase and a receipt capability. They do not reserve money until merchant approval.
6. Approval atomically reserves remaining eligibility. Concurrent approvals cannot reserve above the original amount.
7. A prepared transaction exposes recipient, wallet sources, amount, fee, total debit, change, network, and original reference. Wallet explicitly signs with broadcast disabled.
8. Server checks all reviewed transaction fields, source-output signatures and 0x61 signing flags before persisting raw bytes and broadcasting.
9. Unknown broadcast fate keeps raw bytes, txid, input reservations and refund reservation. Only identical bytes may be resubmitted; no replacement attempt.
10. Independent network observation distinguishes unconfirmed and confirmed. Merkle inclusion is checked. Mainnet confirmations require an independent witness provider.
11. Confirmed settlement atomically converts reserved to settled once. Reorgs retain counted amounts and flag review; they never create new eligibility.
12. Public resolution receipts omit customer reasons, receipt capabilities, email and wallet session data. Chain facts are identified separately from merchant assertions.

Explicit limits: BCH only, standard P2PKH, exact payment amounts, confirmed token-free funding UTXOs, one store per merchant account, bounded wallet-address discovery, no multi-store roles, passkeys, password recovery, token refunds or fiat rates. Neither a merchant decision nor wallet connection transfers funds. BCH refunds are new transactions.

Expiry policy: new payment evidence after the 24-hour order window requires manual review rather than automatic acceptance. Signed transactions never expire out of accounting. Unsigned prepared intents expire after 15 minutes and require explicit cancellation before preparing again.
