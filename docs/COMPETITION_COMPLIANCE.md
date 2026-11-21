# BCH BLAZE 2026 requirements and evidence

Checked November 21, 2026. The [official BCH BLAZE site](https://bchblaze.cash/) gives the hacking period as November 14–22, registration closing November 13, submissions/judging beginning November 22 at 14:00 UTC, and showcase/results on November 28. The site also links to the DoraHacks event. The DoraHacks details/resources page itself was not readable in this audit, so confirm its live form before relying on secondary summaries.

A current [public competition summary](https://competehub.dev/en/competitions/dorahacksbchblaze2026) lists the Mainnet Track requirements as: registered participant and valid submission; short Widget Factory-template presentation; original project or significant hackathon-period improvement; useful BCH mainnet transaction feature; live usable demo; WizardConnect integration; one representative attending a preparation stream with roll call; and confirming the project in BCH BLAZE Telegram. Treat DoraHacks/organizers as authoritative. No official video duration or codec requirement was verified.

| Requirement | Evidence/status |
| --- | --- |
| Public source | https://github.com/sopskistar/returntail — public repository. Earliest commit is November 17; this does not prove when all earlier work began. Disclose prior work accurately. |
| Live demo | https://returntail.vercel.app — Vercel reports successful deployment of `eed83e7d9346a1a59cec81535079f63e5c3ffbd3`; read-only mainnet smoke passed 23/23. |
| No-payment judge access | `/guide`, `/lab`, and direct public receipt are linked in README. Read-only lab probes do not write financial records. |
| WizardConnect | Integrated and used in the participant-reported Selene/Paytaca production self-test. Mainnet tx records are independently cross-checked; chain data does not identify the wallet app. |
| Mainnet transaction feature | Verified 10,000-sat payment and 4,000-sat refund, including matching spend/output/block facts in two providers. See [MAINNET_PROOF.md](MAINNET_PROOF.md). This is a self-test, not an external customer result. |
| Excess-refund demonstration | User reports 4,000 approved, 6,000 remaining, 7,000 approval refused and request rejected. Private merchant audit entries were not independently accessed; do not state they are independently verified. |
| Widget Factory presentation | Existing deck URL has not been supplied. Do not create a replacement. Set Vercel Production `WIDGET_FACTORY_URL` to the existing public deck after the URL is ready. |
| Homepage banner/links | Hosted homepage shows source repository, presentation placeholder and EMBER2026 donation CashAddress. The presentation is not configured. Address parsing as token-compatible does not prove balance, ownership or event eligibility. No donation was sent. |
| Evidence index | Direct receipt is public. Set `PUBLIC_PROOF_REFUND_ID=6c5fb204-f24e-4fa1-b944-d4ff710ecb02` in Vercel Production and redeploy to feature it on `/evidence`. |
| Video | No final video published. Existing 45-second artifact is an isolated-QA engineering preview. See the [recording plan](VIDEO_SCRIPT.md); no official duration/codec cap was verified. |
| Registration | Participant previously reported registering before November 13. No DoraHacks account record is available in the repository; verify in the participant account. |
| Stream roll-call | No evidence available here. Verify in the participant’s own event account or with organizers. |
| Telegram confirmation | No evidence available here. Verify the project confirmation in the official BCH BLAZE Telegram. |
| Licenses/AI | MIT project license; dependencies and fonts listed in `THIRD_PARTY_NOTICES.md`. AI tools assisted implementation, review, and documentation; disclose as requested in the current form. |
| Submission | Not submitted by automation. Submit manually and save DoraHacks confirmation. |

## Manual completion

1. Set the exact `PUBLIC_PROOF_REFUND_ID` above in the existing Vercel project’s Production environment; redeploy and inspect `/evidence` logged out.
2. Set `WIDGET_FACTORY_URL` to the existing published deck. Verify the homepage presentation link.
3. Record the verified transaction/public receipt and no-payment product walkthrough using `VIDEO_SCRIPT.md`; avoid private merchant/customer information and fabricated signing footage.
4. Check the current DoraHacks page/form for final fields and personally verify registration, roll-call, Telegram confirmation, any banner rules, and media requirements.
5. Submit manually before the time shown in DoraHacks (official site schedule: November 22, 2026 at 14:00 UTC) and keep the confirmation.
