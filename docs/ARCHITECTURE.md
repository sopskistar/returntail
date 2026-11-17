# Architecture

Next.js App Router / strict TypeScript / React, PostgreSQL via parameterized `pg`, versioned SQL migrations, Zod boundary validation, WizardConnect, Libauth BCH parsing/VM, and a small TLS Fulcrum adapter. Tailwind is available; semantic CSS tokens own the visual system.

`src/core/bch.ts`: network-specific CashAddress checks, BIP32 public derivation, exact recipient matching, token-free coin selection, conservative 2 sat/byte fee budget, unsigned serialization, signed intent comparison, BCH VM signature validation and 0x61 flags.

`src/server/chain.ts`: TLS with certificate validation; chain-specific fork checkpoint checks (mainnet height 661648, Chipnet 115252) from [BCHN chainparams](https://github.com/bitcoin-cash-node/bitcoin-cash-node/blob/master/src/chainparams.cpp). Shared genesis or address prefixes alone cannot distinguish all BCH forks. Raw source transactions checked against UTXO metadata. Confirmations verify a merkle branch and current header; mainnet also compares header/raw bytes at a different provider. This is provider-assisted verification, **not a full independently validated proof-of-work node**. [Fulcrum protocol](https://electrum-cash-protocol.readthedocs.io/en/latest/protocol-methods.html).

`src/server/service.ts`: order-level row locks, conditional balance writes, advisory locks for idempotency scopes, unique output allocation, unique active attempt, unique UTXO reservations, unique settlement ledger and audit events. No lock is held while waiting for a human signature. Raw bytes and txid are durable before broadcast. Refund destination is explicit; never inferred from an input.

`src/server/auth.ts`, `security.ts`: scrypt, random seven-day server-side sessions, HttpOnly SameSite cookies, origin checks on mutations, persistent database rate limits, HMAC-hashed customer capabilities in URL fragments. Capabilities go in Authorization headers; fragment removed into sessionStorage. Private links must be handled like credentials. The person receiving a private link is authorized to request a refund, not cryptographically identified as the payer.

Server stores public xpubs and signed transaction bytes, never recovery phrases or spend keys. WizardConnect's relay key is an encrypted-transport key, not a wallet spending key; it remains browser-side in tab session storage. The merchant wallet owns signing authority. Xpub disclosure reveals address history; make this clear during setup.

Database tables: merchants, sessions, stores, wallet_addresses, orders, payments, refunds, attempts, input_reservations, refund_settlements, idempotency, audit_events, rate_limits, schema_migrations. SQL has checks, FKs and unique/indexed identities. Direct SQL keeps locking and accounting explicit; migrations are checksum-verified and atomic. Neon pooler connection strings are supported by `pg`.

Wallet APIs verified against installed package declarations, which differ in places from docs examples: core 0.2.10, dapp 0.2.7, react 0.2.6. [WizardConnect integration](https://docs.riftenlabs.com/wizardconnect/dapp/), [React](https://docs.riftenlabs.com/wizardconnect/react/), [protocol](https://docs.riftenlabs.com/wizardconnect/protocol/). Official package transitively uses prerelease Libauth; ReturnTail's own verification uses pinned stable 3.0.0. [Mainnet.cash](https://mainnet.cash/tutorial/) consulted; no backend wallet generation or custodial mainnet-js instance is used.

Reconciliation runs on user refresh and the authenticated scheduled job. Vercel free cron is daily; for faster automatic updates use a permitted external scheduler or paid scheduling only with owner approval. Receipts show last check; no promised real-time SLA. Restart cannot erase attempts. Public providers may learn queried script hashes.
