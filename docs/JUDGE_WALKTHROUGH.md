# Two-minute judge journey

No mainnet demo is claimed before the owner completes the proof ledger. Use `/guide` for the public self-guided journey and `/evidence` for the distinction between blockchain facts and application assertions.

| Time     | Show                                             | Explain                                                                                      |
| -------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 0–15s    | Homepage                                         | A small merchant can resolve a purchase problem without surrendering wallet control.         |
| 15–35s   | Actual order / customer payment review           | Unique receive address; exact BCH amount; wallet signing separate from network verification. |
| 35–50s   | Confirmed original receipt                       | Real payment txid and output; network and last check visible.                                |
| 50–75s   | Customer partial refund request / merchant inbox | A request is not a transfer. Merchant approval atomically reserves remaining eligibility.    |
| 75–95s   | Actual merchant wallet signing                   | Destination, amount, fee and total debit reviewed; explicit wallet authorization.            |
| 95–110s  | Confirmed refund receipt                         | A new BCH transaction, independently checked; public-safe receipt for both parties.          |
| 110–120s | Rejected over-limit request / source             | Application-level duplicate protection; commercial case for merchant support tooling.        |

If no funded wallet is available, inspect honest empty states, secure registration, order construction and source/test evidence. Do not describe that as a mainnet demonstration. Do not expose private capabilities or personal wallet balances during presentation.

Actual human gates: public deployment, two funded wallets, wallet version compatibility, real transfers and confirmation wait, Widget Factory publishing, eligibility confirmation. See OWNER_CHECKLIST.md.
