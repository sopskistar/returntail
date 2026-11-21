# BCH BLAZE 2026 requirements and evidence

Checked November 21, 2026. The [official BCH BLAZE site](https://bchblaze.cash/) gives the hacking period as November 14–22, registration closing November 13, submissions/judging beginning November 22 at 14:00 UTC, and showcase/results on November 28. The site also links to the DoraHacks event. The DoraHacks details/resources page itself was not readable in this audit, so confirm its live form before relying on secondary summaries.

A current [public competition summary](https://competehub.dev/en/competitions/dorahacksbchblaze2026) lists the Mainnet Track requirements as: registered participant and valid submission; short Widget Factory-template presentation; original project or significant hackathon-period improvement; useful BCH mainnet transaction feature; live usable demo; WizardConnect integration; one representative attending a preparation stream with roll call; and confirming the project in BCH BLAZE Telegram. Treat DoraHacks/organizers as authoritative. No official video duration or codec requirement was verified.

| Requirement | Evidence/status |
| --- | --- |
| Public source | https://github.com/sopskistar/returntail — public repository. Earliest commit is November 17; this does not prove when all earlier work began. Disclose prior work accurately. |
| Live demo | https://returntail.vercel.app — production deployment verified for this release; read-only smoke results are recorded in the release handoff. |
| No-payment judge access | `/guide`, `/lab`, and direct public receipt are linked in README. Read-only lab probes do not write financial records. |
| WizardConnect | Integrated and used in the participant-reported Selene/Paytaca production self-test. Mainnet tx records are independently cross-checked; chain data does not identify the wallet app. |
| Mainnet transaction feature | Verified 10,000-sat payment and 4,000-sat refund, including matching spend/output/block facts in two providers. See [MAINNET_PROOF.md](MAINNET_PROOF.md). This is a self-test, not an external customer result. |
| Excess-refund demonstration | User reports 4,000 approved, 6,000 remaining, 7,000 approval refused and request rejected. Private merchant audit entries were not independently accessed; do not state they are independently verified. |
| Widget Factory presentation | Production banner currently links the existing public [Google Slides deck](https://docs.google.com/presentation/d/1dSwEQk5Qs9_TqOnJxOJmmFjK1PO3tGQLKaZ7u9cp12g/edit?usp=sharing); its URL returned HTTP 200. The deck was not replaced. |
| Homepage banner/links | Production banner displays the presentation, public ReturnTail repository and `bitcoincash:zpkcwxlmsarx8vau45y2dkzqqlqzj24vxyl9l852se`. The address decodes as `p2pkhWithTokens`; this does not prove balance, ownership or event eligibility. No donation was sent. |
| Evidence index | Production `/evidence` server-renders the receipt client for refund UUID `6c5fb204-f24e-4fa1-b944-d4ff710ecb02`; the direct privacy-limited receipt remains public. |
| Video | No final video published. Existing 45-second artifact is an isolated-QA engineering preview. See the [recording plan](VIDEO_SCRIPT.md); no official duration/codec cap was verified. |
| Registration | Participant previously reported registering before November 13. No DoraHacks account record is available in the repository; verify in the participant account. |
| Stream roll-call | No evidence available here. Verify in the participant’s own event account or with organizers. |
| Telegram confirmation | No evidence available here. Verify the project confirmation in the official BCH BLAZE Telegram. |
| Licenses/AI | MIT project license; dependencies and fonts listed in `THIRD_PARTY_NOTICES.md`. AI tools assisted implementation, review, and documentation; disclose as requested in the current form. |
| Submission | Not submitted by automation. Submit manually and save DoraHacks confirmation. |

## Manual completion

1. Verify the currently featured receipt on `/evidence` while logged out after this release deploys.
2. Open the existing deck link from the homepage banner and confirm it is the intended public presentation.
3. Record the verified transaction/public receipt and no-payment product walkthrough using `VIDEO_SCRIPT.md`; avoid private merchant/customer information and fabricated signing footage.
4. Check the current DoraHacks page/form for final fields and personally verify registration, roll-call, Telegram confirmation, any banner rules, and media requirements.
5. Submit manually before the time shown in DoraHacks (official site schedule: November 22, 2026 at 14:00 UTC) and keep the confirmation.
