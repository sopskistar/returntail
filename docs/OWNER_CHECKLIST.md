# BCH BLAZE final release checklist

Production: https://returntail.vercel.app. The public mainnet receipt and transaction links are now independently reconciled in [MAINNET_PROOF.md](MAINNET_PROOF.md). The confirmed event is a self-test, not an outside customer case.

## Publish the verified evidence index

The direct, privacy-limited receipt is public at:

`https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02`

In the existing Vercel project, set the **Production** environment variable below to the refund database UUID (not either txid), then redeploy:

```text
PUBLIC_PROOF_REFUND_ID=6c5fb204-f24e-4fa1-b944-d4ff710ecb02
```

This UUID is currently configured in Vercel Production. Open `/evidence` logged out after the latest deployment and confirm the receipt loads. The direct receipt URL remains available if the evidence page is temporarily unavailable.

## Verify application decisions in the existing merchant account

The public receipt shows the confirmed 4,000-sat resolution state and chain association. It does not show the separate 7,000-sat approval attempt or private decision audit. Sign in using the existing merchant account, open reference `RT-D992C0E1`, and check the refund history: 4,000 sats approved/settled, 7,000 sats rejected, 4,000 settled, 0 reserved, and 6,000 remaining. Do not share private customer links, access capabilities, browser cookies, passwords, wallet session material, QR codes, seed phrases, or private keys.

## Complete the presentation and video

- The existing deck is currently linked from the production homepage banner: https://docs.google.com/presentation/d/1dSwEQk5Qs9_TqOnJxOJmmFjK1PO3tGQLKaZ7u9cp12g/edit?usp=sharing. Confirm it is the intended public deck; do not create or replace it.
- Record a concise final demonstration using the public receipt, real chain explorer records, and current application screens. Use `VIDEO_SCRIPT.md` as the capture checklist. If there is no actual wallet recording, say so; do not recreate a signing UI.
- The existing `artifacts/video/ReturnTail-preview.mp4` is an engineering preview from isolated QA screens, not the final mainnet demo.

## Confirm competition eligibility manually

- Open the [official BCH BLAZE site](https://bchblaze.cash/) and the [DoraHacks event page](https://dorahacks.io/hackathon/bchblaze2026). The official site gives the schedule: submissions start November 22, 2026 at 14:00 UTC; registration closed November 13; the showcase is November 28.
- Verify registration status in the participant account. Verify that at least one representative completed the required preparation stream roll-call and that the project was confirmed in the BCH BLAZE Telegram. Neither is established by this repository or by the blockchain transactions.
- The published Mainnet Track listing calls for a Widget Factory-template presentation, a working mainnet transaction feature, a live usable demo, and WizardConnect integration. Read the current DoraHacks form for the binding requirements and any video, media, or banner fields; the portal’s full current form was not independently accessible in this audit.
- The project predates the November 17 first commit if earlier work existed. State its genuine pre-hackathon history and what materially changed during the event. The Git history alone does not establish project origin.
- Submit manually and keep the DoraHacks confirmation. No submission or public announcement is automated.

## Product limits and safety

The merchant wallet signs refunds; the server has no spending keys. The system cannot prevent the merchant from making transfers outside ReturnTail. An xpub or wallet pairing is not proof of ownership. Refunds are new transactions. Approval reserves an amount in PostgreSQL but does not send BCH. Unknown broadcast outcomes retain signed bytes and reservations for reconciliation. Current scope includes one store per account, standard P2PKH BCH, bounded receive discovery, no email verification or password recovery, provider-assisted inclusion checks (not a full node), and daily scheduled reconciliation plus manual refresh.
