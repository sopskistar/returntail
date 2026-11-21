# No-payment judge walkthrough

**Time: about two minutes.** No account, wallet connection, BCH, or production write is required. The walkthrough explains the system; the public receipt and explorer links separately show the completed mainnet self-test.

| Time | Open / do | What to inspect |
| --- | --- | --- |
| 0:00–0:20 | Open the [homepage](https://returntail.vercel.app). | The post-checkout problem, app boundary, and links to the workflow and evidence. The homepage resolution card is an explanation, not a transaction replay. |
| 0:20–0:50 | Open [How it works](https://returntail.vercel.app/guide). | The six stages: fresh receiving address, customer payment, chain verification, refund request, merchant approval/signing, and receipt. The page explicitly distinguishes a guide from payment proof. |
| 0:50–1:15 | Open [Break It Lab](https://returntail.vercel.app/lab), run the three read-only checks. | `GET /api/health` reports public readiness; unauthenticated workspace and order queries return the expected access-denied status. The fixed probes omit credentials and do not create records. |
| 1:15–1:35 | In Break It Lab, inspect the source-test links. | PostgreSQL tests cover access boundaries, exact payment evidence, concurrent refund budgets, idempotency, durable signed bytes, and cancellation. Core tests cover BCH transaction intent and signatures. These are isolated fixtures, not real chain activity. |
| 1:35–2:00 | Open the [public receipt](https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02). Follow its purchase and refund transaction links. | The 10,000-sat purchase output, 4,000-sat refund output, spend relationship, fee, block data, and provider observations. The receipt separates application association/approval from chain facts. |

## Proof available without login

- Purchase: [Selene Explorer](https://explorer.selene.cash/tx/2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65?network=mainnet) · [Blockchair](https://blockchair.com/bitcoin-cash/transaction/2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65)
- Refund: [Selene Explorer](https://explorer.selene.cash/tx/c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b?network=mainnet) · [Blockchair](https://blockchair.com/bitcoin-cash/transaction/c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b)
- Full verification, transaction times and block/confirmation snapshot: [MAINNET_PROOF.md](MAINNET_PROOF.md).

Do not enter a customer access link or merchant workspace in a public judging session. Do not sign or broadcast BCH for the walkthrough. The evidence index currently features refund UUID `6c5fb204-f24e-4fa1-b944-d4ff710ecb02`; the direct receipt link above is also public.
