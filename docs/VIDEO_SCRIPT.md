# Video direction and script

Format: a precise product walkthrough with a brief animated explanation. Avoid a cinematic trailer hiding the actual transaction workflow. Default 1920×1080, 30fps, 16:9; final duration must be checked against official rules before submission.

## Final proof-driven storyboard (target 120 seconds, duration unverified against DoraHacks)

| Seconds | Visual | Narration |
|---|---|---|
| 0–10 | ReturnTail mark; damaged-order problem in plain type | “Imagine a delivery with one damaged item. The customer wants a partial refund. The merchant wants to make it right without paying twice.” |
| 10–25 | Genuine merchant creates an order; private customer link | “ReturnTail gives each purchase a unique receiving address. The customer pays directly to the merchant’s wallet.” |
| 25–40 | Actual customer wallet request, authorization and original tx receipt | “Your wallet signs. ReturnTail independently checks the transaction, recipient and exact amount.” |
| 40–55 | Actual customer partial refund request; explain the recorded issue accurately | “The customer describes the issue and chooses their own refund destination.” |
| 55–70 | Merchant inbox, approval, reserved/remaining amounts | “The merchant reviews the request. Approval reserves the amount, so concurrent requests cannot overrun the purchase balance.” |
| 70–90 | Genuine merchant wallet review and signature; readable fee and debit | “A refund is a new BCH transaction. Only the merchant’s wallet can authorize it.” |
| 90–105 | Actual refund txid, observation, confirmation, explorer | “The signed intent is checked before broadcast. Both sides can inspect the confirmed refund and its linked resolution record.” |
| 105–115 | Actual over-limit rejection; capture it before signing the approved refund and show the recorded result here | “A duplicate cannot spend the same refund budget again. Unknown broadcasts remain reserved until reconciled.” |
| 115–120 | Brand outro + real public URL | “ReturnTail. Make it right. Make it verifiable.” |

Never stage a wallet approval, fabricate a txid or speed a false confirmation into existence. Capture long confirmation waits honestly, then edit with an explicit elapsed-time label. Mask unrelated wallet balances and addresses; never show private receipt capabilities or secrets.

## Engineering preview

The available local application footage can show real pages, registration, order creation, private access and genuine WizardConnect pairing QR creation. It cannot show a funded mainnet transfer. Any rendered preview must label **Local application preview — no funds transferred; mainnet proof pending** throughout. It is not the final hackathon demo.

Preview timeline: 0–7 brand/problem; 7–17 actual app landing/workspace capture; 17–28 actual isolated QA purchase/checkout; 28–38 connected approval/signing/observation model (explicit explanation); 38–45 precise remaining wallet/mainnet gates. Narration is optional for the preview; use readable editorial captions rather than unlicensed audio or fake wallet footage.

## Recording/edit plan after the funded journey

Use separate merchant/customer browser profiles. Capture real workflows at 1920×1080 with Playwright or screen recording and keep original footage. Record both physical wallet screens with explicit consent. Create a shot manifest linking txids and timestamps to the proof ledger. Render a style proof and inspect frames, then final MP4; run FFprobe for duration, H.264/AAC or compatible playback, resolution and frame rate. Listen/watch the complete result. Use original audio or documented free licenses. Record voice-over if desired. Verify judging rules again before publishing.

The presentation is the separately prepared Google Slides deck; do not build another presentation application. Treat the damaged-item story as a hypothetical explanation until genuine case details support it. Label a self-purchase accurately. The current Vercel deployment and network checks may be shown as engineering evidence; they do not substitute for the pending wallet/payment/refund footage.

Current capture gate: Paytaca v0.27.3 on Samsung S24 Ultra connects, but its preserved receive-index-zero request cannot be independently inspected in native Receive. Keep it unfunded. The homepage player may illustrate the mechanism with its no-transaction disclosure visible; the lab may show genuine read-only responses. Neither substitutes for actual wallet authorization or mainnet evidence. Use the separately prepared Google Slides presentation; no new presentation app or fabricated footage.
