# Competitive research

Research accessed November 17, 2026. These are product comparisons, not claims of exhaustive audits.

| Reference | Observed focus | ReturnTail's narrower job |
|---|---|---|
| [Paytaca Payment Hub](https://paymenthub.paytaca.com/) | Direct merchant settlement, invoices, subscriptions, CashTokens, signed webhooks | After-checkout full/partial refund eligibility, reserved amounts, merchant decisions, linked chain evidence |
| [Paytaca wallet](https://www.paytaca.com/) | BCH wallet and merchant ecosystem | Use an external wallet to sign; never become a wallet custodian |
| [BitPay refund documentation](https://developer.bitpay.com/docs/refunds) | Processor-managed invoice refunds | Merchant wallet retains spend authority; ReturnTail records intent and verifies new BCH outputs |
| [BLAZE 2025 archive](https://bchblaze.com/archive/) | Mainnet winner bch-ipfs-scrape; FortressVault second; other entries use BCH capabilities for specific jobs | Demonstrate a useful mainnet transaction and one understandable commercial problem rather than general wallet breadth |

Differentiator: an output-allocated purchase and an atomic remaining-refund budget connected to a wallet-signed, independently observed resolution. Merchant approval alone cannot make a receipt say BCH was returned. An uncertain broadcast cannot release its reservation.

Target: independent online BCH merchants handling damaged goods, unavailable inventory, or partial service credits. Customer value: a private request and trackable resolution. Merchant value: fewer manual txid spreadsheets, fewer application-level duplicate refunds, a durable decision trail.

Business hypothesis (unvalidated): hosted per-store subscription for support/audit workflows; open-source self-hosting. No platform fee or token is implemented. Conduct merchant interviews before claiming willingness to pay. Incumbents can add refund tooling; integration with existing checkouts is a future distribution path, not implemented scope.

Risks: public-indexer availability, wallet-version compatibility, chain confirmation delay, merchants refusing refunds, privacy of shared capabilities, maintainer eligibility, and limited time for independent security review. Application accounting cannot prevent a merchant sending extra BCH outside ReturnTail.

## Design references

[Framer free fintech collection](https://www.framer.com/marketplace/templates/categories/fintech/explore/free/), [Montra](https://www.framer.com/marketplace/templates/montra/), [BuildInADay](https://www.framer.com/marketplace/templates/buildinaday/), [Halfpenny](https://www.framer.com/marketplace/templates/halfpenny/) were publicly researched. Useful patterns: transaction details grouped for review, product-led first viewport, restrained navigation, explicit mobile layouts. Their sample financial values and restricted template artwork are not reused.

[21st](https://21st.dev/): action hierarchy and component anatomy. [beUI](https://beui.dev/): timeline/collapsible/alert states; public MIT claim observed. [React Bits](https://reactbits.dev/), [Magic UI](https://magicui.design/): state motion references. No copied components or extra animation package needed; CSS and native disclosure cover this product's motion. Original identity, original layouts, self-hosted OFL fonts. Actual ReturnTail captures, not template previews, are the visual acceptance evidence.
