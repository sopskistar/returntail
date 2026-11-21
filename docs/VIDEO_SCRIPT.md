# ReturnTail final demo — screen-recording plan

**Editorial target: 100–120 seconds; this is not an official BCH BLAZE duration rule.** Check the DoraHacks upload form for any file/link requirement before rendering. The actual mainnet self-test is now independently matched across Selene Explorer and Blockchair. The merchant decision trail for the 7,000-sat request is still first-hand reported and should only be shown from the authenticated production history if captured directly and safely.

## Scene-by-scene capture checklist

| Time | Record this real screen/action | Narration or on-screen copy |
| --- | --- | --- |
| 0–9s | Start on the actual ReturnTail homepage at `https://returntail.vercel.app`. Hold on the brand and workflow summary. | “BCH payments settle directly. The hard part can come after checkout.” |
| 9–18s | Show a simple text card over the app: **“Hypothetical example — one parcel arrives damaged.”** Then open `/guide`. Do not stage a fake order or customer. | “Imagine one item needs a partial refund. Both sides need a clear record of the decision and the new payment.” |
| 18–34s | Open the corrected purchase tx in Selene Explorer, then Blockchair. Show the txid, output `0`, 10,000 sats, height 978327, and block hash. Keep unrelated wallet/address history out of frame. | “In my real self-test, Selene paid 10,000 sats to the merchant request. Two explorers agree on the exact output and block.” |
| 34–47s | Open the public ReturnTail receipt `/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02`. Pause on `RT-D992C0E1`, confirmed state, linked purchase/refund IDs, 4,000 sats, and 454-sat fee. | “The receipt connects the application record to the chain evidence. The refund is a new transaction.” |
| 47–60s | Show the refund tx in Selene Explorer and Blockchair. Point to input purchase `vout 0`, output `vout 0` for 4,000 sats, 5,546-sat second output, 454-sat fee, block 978337. | “The 4,000-sat refund spends the original 10,000-sat output. Each explorer reports the same transaction and block.” |
| 60–76s | Optional: in the existing logged-in merchant account, show only the `RT-D992C0E1` refund decision trail and 7,000-sat request result. Capture directly; crop/blur customer name, email, reason, receive address, balance unrelated to the test, customer link, and session details. If the actual audit view is unavailable or unsafe to expose, use a static disclosure card instead. | “I approved 4,000 sats in the merchant workflow. In this self-test the additional 7,000-sat approval was blocked and the request was rejected.” Add small copy: “Decision result reported from the production test; not a blockchain fact.” |
| 76–89s | If an original physical Paytaca signing recording exists, show only the actual capture. Otherwise show the verified refund receipt and a clear card: **“Paytaca authorization reported; no signing footage recorded.”** Do not fabricate a phone, QR, wallet prompt, or approval animation. | “The merchant authorizes the refund in their wallet. ReturnTail does not hold the spending key.” |
| 89–105s | Open `/lab`; run the read-only checks and show expected unauthenticated rejection. Then point to test source links. Do not imply fixture tests are mainnet attacks. | “Public probes show no anonymous workspace access. Isolated tests cover concurrent refund limits, replay, and uncertain settlement.” |
| 105–118s | End on the privacy-safe receipt and the source link. | “ReturnTail makes a direct BCH refund easier to follow—without turning wallet custody into a platform promise.” |

## Capture rules

1. Record from the current public deployment at desktop 1440×900 or higher and test text legibility at phone width. Use the real hosted app, direct public receipt, and explorer pages above.
2. Use the exact verified transaction IDs from [MAINNET_PROOF.md](MAINNET_PROOF.md). Do not show the former typo `2ea6feed…` as a valid transaction.
3. If showing the 4,000/7,000 merchant audit, use only the authenticated account’s actual order history. Do not fabricate an error dialog from reported text. If the audit is not available, label the result as reported or omit the claim.
4. Do not record new transfers, wallet signing, QR codes, private links, sessions, passwords, customer reasons, email addresses, wallet balances, or unnecessary addresses.
5. Do not use `artifacts/video/ReturnTail-preview.mp4` as the final demo; it is a 45-second isolated-QA engineering preview. Keep it labeled as such.
6. Before publication, review the complete render with sound, check every transaction identifier and link, inspect a mobile-sized contact sheet, and report actual duration, dimensions, codec, and frame rate. AI-assisted narration/scripts and any generated material must be disclosed as required by the event rules.

The final published video URL can be added to the README’s **Demo video** link without changing this plan or replacing the existing Widget Factory deck.
