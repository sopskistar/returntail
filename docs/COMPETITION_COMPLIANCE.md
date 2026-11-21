# BCH BLAZE 2026 submission requirements and evidence

Checked November 21, 2026. The [official BCH BLAZE site](https://bchblaze.com/) lists hacking November 14–22, registration closing November 13, a final check-in stream November 21, submissions/judging beginning November 22 at 14:00 UTC, and showcase/results November 28. Those dates are directly visible on its schedule.

The official [DoraHacks event](https://dorahacks.io/hackathon/bchblaze2026) and its detail/resources routes could not be read through automated browsing (405/inaccessible). A current third-party [competition summary](https://competehub.dev/en/competitions/dorahacksbchblaze2026) reports these Mainnet Track requirements: DoraHacks registration and valid submission; short presentation using the BCH BLAZE Widget Factory template; original work or significant improvements during the event; a feature involving BCH mainnet transactions; live usable demo; WizardConnect integration; one representative attending a preparation stream with roll call; and confirming the project in BCH BLAZE Telegram. Use the DoraHacks page/organizers as the final authority and confirm any changed wording personally.

| Requirement | Current evidence/status |
|---|---|
| Public repo | https://github.com/sopskistar/returntail; repository history is public. First commit is Nov 17, 2026; this documents repository history but does not prove no earlier work existed. |
| Live usable demo | https://returntail.vercel.app; latest prior deployment was verified for commit `d2f635d`. Verify the new release commit after this privacy change deploys. |
| WizardConnect | Integrated with `@wizardconnect/dapp`, `@wizardconnect/core`, and `@wizardconnect/react`; physical Paytaca and Selene use reported by the creator. |
| Mainnet transaction feature | User reports a real 10,000-sat Selene purchase and 4,000-sat Paytaca-signed refund in hosted production. The supplied payment txid was not found by three independent API lookups; refund txid/record were not accessible. Chain proof and app association remain to be independently reconciled. |
| Refund-limit demonstration | User reports 4,000 approved, 6,000 remaining, a 7,000 approval failure, and subsequent rejection. Production audit evidence has not been retrieved in this session. |
| Widget Factory | Organizer-referenced [template](https://docs.google.com/presentation/d/1Yfuk9CJkf4U9M_WukcELhumWgj3Ak6345Ewy8hSp-Hk/edit?usp=sharing). Existing presentation URL is not available here; `WIDGET_FACTORY_URL` is not verified. |
| Homepage links | Live homepage currently shows the repository and “Presentation publishing in progress”; `WIDGET_FACTORY_URL` is not configured. The donation address is rendered on the homepage. |
| EMBER / Community Choice | Current homepage address `bitcoincash:zpkcwxlmsarx8vau45y2dkzqqlqzj24vxyl9l852se` locally decodes as mainnet `p2pkhWithTokens`. This verifies the address format/type, not balance, ownership or DoraHacks eligibility. The event listing says Community Choice requires an address that can receive EMBER2026. No donation was sent. |
| Video | No official video duration/codec cap located. Existing 45-second Remotion artifact is explicitly an engineering preview, not the final mainnet demo. |
| Registration | User reports registration before Nov 13; no account evidence is accessible here. Verify it in DoraHacks. |
| Workshop / roll call | Not evidenced in repository or this session. User must check their roll-call/account record or ask organizers. |
| Telegram project verification | Not evidenced in repository or this session. User must confirm the project in the official [BCH BLAZE Telegram](https://t.me/bchblaze). |
| Pre-existing work / dependencies | Git history begins Nov 17, within the announced coding window. Do not imply that Git proves the entire project originated then. `THIRD_PARTY_NOTICES.md` lists dependencies and licenses; disclose the true project ideation/prototype history in DoraHacks. |
| Manual submission | Not submitted by automation. Save the DoraHacks confirmation after manual submission. |

## Recommended manual steps

1. Open the [DoraHacks event page](https://dorahacks.io/hackathon/bchblaze2026) while signed in. Verify the submission window and current required fields; deadline on the official site is November 22 at 14:00 UTC.
2. Confirm registration and eligibility, including the preparation-stream roll-call and Telegram project-confirmation requirements. Do not infer them from the public site or repository.
3. Finish the existing Widget Factory deck, the public-safe receipt, and the final proof-backed video if required. The current slide/content guidance and proof gaps are in `WIDGET_FACTORY.md`, `MAINNET_PROOF.md`, and `VIDEO_SCRIPT.md`.
4. Verify the live homepage shows the correct presentation link, public repo, and validated EMBER CashTokens address. Verify no placeholder remains.
5. Submit manually and save a screenshot/confirmation URL. Do not announce or claim eligibility until the platform confirms submission.
