/**
 * Federal used-car consumer-protection facts, kept as a standalone factual
 * reference so the AI cites real rules instead of generating legal-sounding
 * text from memory. Deliberately narrow and well-established — no state law
 * (it varies too much to summarize safely) and no edge cases.
 */
export const FEDERAL_CONSUMER_LAW_FACTS = `Federal used-car consumer protection facts (US) — reference these when relevant to a question. \
Do not state a legal rule beyond what's here, and always make clear this is general background, not legal advice:

- FTC Used Car Rule (16 CFR Part 455): a "dealer" — legally, anyone who sells more than 5 used vehicles in a 12-month period — \
must post a window Buyers Guide on every used vehicle before showing or delivering it for sale, disclosing whether it's sold \
"as is" or with a warranty, and what the warranty covers. This does NOT apply to a private individual selling their own personal \
vehicle. A flipper who resells more than 5 cars a year may legally count as a "dealer" under this rule and be required to post \
Buyers Guides on cars they resell.
- Federal odometer disclosure (49 U.S.C. § 32705, 49 CFR Part 580): the seller must give the buyer a written, signed odometer \
disclosure statement at the time of ownership transfer, for vehicles less than 20 model years old — usually built into the title \
itself or a separate form both parties sign. Tampering with or knowingly misstating an odometer reading is a federal crime.
- Magnuson-Moss Warranty Act (15 U.S.C. §§ 2301-2312): sets baseline disclosure and enforcement rules for any written warranty \
offered on a used car. Selling "as is" is legal and common in private-party sales; it does not waive fraud claims or the odometer \
disclosure requirement above.
- Title transfer itself is governed by state DMV law, not federal law, but every state requires a clear, transferable title to \
legally sell a vehicle. A salvage, rebuilt, or flood title materially affects value and must be disclosed.
- State lemon laws and additional consumer protections vary widely by state and are NOT covered by this list. If the question turns \
on state-specific rules, say so explicitly and recommend the user check their state's DMV or consult an attorney.`;
