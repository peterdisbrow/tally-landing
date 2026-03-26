# Tally Landing — Beta Persona Test Report
**Generated:** 2026-03-26
**Codebase:** tally-landing (Next.js 15 marketing site)
**Branch:** claude/modest-austin
**Auditor:** Claude Code (automated trace through source)

---

## Executive Summary

The Tally landing site has a strong visual identity, solid technical foundations, and thoughtful accessibility groundwork. However, critical gaps exist in SEO completeness (4 key pages missing from the sitemap), the conversion funnel for non-technical users, the absence of any competitor comparison content, and a Spanish-language experience that has structural issues limiting its discoverability. Several components suggest good intentions that aren't yet fully realized.

**Overall Score: 6.4 / 10**

---

## Persona 1: Church AV Director Researching Solutions

**Profile:** Technical Director at a 1,500-member church. Runs ATEM Mini Pro, OBS, ProPresenter. Has been burned by stream drops. Searching Google for "church streaming monitoring software." Spends 15–30 minutes reading before acting.

### What Works Well

- **Hero resonates immediately.** The headline "YOUR STREAM JUST CRASHED. TALLY ALREADY FIXED IT." speaks directly to the pain. The sub-copy explicitly names ATEM, OBS, ProPresenter, encoders — this person reads that list and nods.
- **Integrations grid is excellent.** 26 integrations displayed with category organization. An AV director can scan this in 30 seconds and confirm their stack is covered.
- **IncidentTimeline component** (Failure Detected → Verified → Auto-Recovery → Confirmed Live) maps precisely to how an AV director thinks about incident response.
- **Hardware compatibility page** (`/hardware`) with filterable categories is a rare and valuable resource for this persona.
- **FAQ is detailed and technical.** Questions like "What happens if my internet goes down?" and "How does Tally know when something is actually wrong vs. a false trigger?" are exactly what a TD will ask.
- **AppShowcase** with three tabs (Status View, Equipment Setup, Tally Engineer) gives concrete product evidence before asking for a signup.
- **Feature comparison table** covers 23 technical dimensions — this person will read all of them.

### What's Broken, Confusing, or Missing

1. **Hardware page not in sitemap** (`app/sitemap.js` only includes `/`, `/signup`, `/blog`, `/help`, `/portal`, `/terms`, `/privacy`). A TD searching "tally connect ATEM compatibility" or "tally connect hardware requirements" won't find this page via Google. **Severity: High**

2. **No explicit "Pricing" anchor in nav.** Nav links are: Features, The App, Pricing, Free Tools, Blog, Sign In. "Pricing" should scroll to the pricing section — it's unclear whether this is an anchor link (`#pricing`) or a page. If the nav link is broken or scrolls to the wrong place, the most action-oriented personas will bounce. Source: `lib/data.js` NAV_LINKS — needs verification that anchor target exists. **Severity: Medium**

3. **No competitor comparison content.** An AV director actively comparing options will search "Tally vs [competitor]" or "church streaming monitoring alternatives." There is no comparison page, no "vs." section, and no named competitor framing anywhere in the codebase. The ROI calculator positions against "status quo" cost but not against competing products. **Severity: High**

4. **"Coming Soon" features not dated.** "Live Video Preview" and others are tagged "COMING SOON" but no timeline is given. A TD making a purchasing decision wants to know: is this 2 weeks or 2 years away? **Severity: Medium**

5. **Download links on success page point to GitHub releases.** (`/signup/success` step 1). An AV director is fine with this, but GitHub releases don't communicate "stable product" to every buyer. No version number or release date is shown on the page. **Severity: Low**

6. **No alt text confirmed on app screenshots.** The AppShowcase images are `/public/app-status.png`, `app-equipment.png`, `app-engineer.png`. Without confirmed alt text in the component, these screenshots offer zero context to screen readers and no SEO image indexing value. **Severity: Medium**

### Severity Summary
| Issue | Severity |
|---|---|
| Hardware page missing from sitemap | High |
| No competitor comparison content | High |
| Nav pricing anchor unverified | Medium |
| Coming soon features undated | Medium |
| No alt text on app screenshots | Medium |
| GitHub download UX | Low |

---

## Persona 2: Pastor with No Tech Background

**Profile:** Lead pastor at a 300-member church. Not technical. Just had a bad Easter stream. Wants something their one volunteer can set up. Found Tally from a recommendation. Skeptical of tech products. Will not read feature lists.

### What Works Well

- **HowItWorks component** is excellent for this persona. "Three steps. Ten minutes." + "Tally watches and fixes first, then tells you" is reassuring and non-technical.
- **Founder quote** ("I built Tally because I wanted to sleep on Saturday night knowing Sunday would be fine") creates emotional resonance and trust.
- **FAQ** answers "Can our volunteers use this?" directly.
- **Problem section** opens with plain language: "Sunday morning is the worst time to discover something is broken." Pastors understand Sunday morning pain.
- **Testimonials** include "Harvest Fellowship" (Sarah K., Worship Pastor) whose quote is specifically about confident volunteers replacing paid techs — exactly this persona's scenario.
- **Trust line** in hero ("Free 30-day trial · No credit card required · Cancel anytime") reduces signup friction.

### What's Broken, Confusing, or Missing

1. **"Tally Engineer," "AI Autopilot," "Signal Failover" are jargon-heavy** for a non-tech pastor. The features grid contains 21 cards with no grouping by user type. A pastor scanning this sees "ATEM Program/Preview Bus," "vMix," "Companion" and feels this isn't for them. There is no "if you're a small church / non-technical" track. **Severity: High**

2. **Signup success page assumes Telegram familiarity.** Step 3 shows a Telegram bot registration code (`/register {code}` for `@tallybot`). For a pastor or office admin who doesn't use Telegram, this is a dead stop. There's no explanation of what Telegram is or why they need it. **Severity: Critical**

3. **No "small church" or "beginner" pricing messaging.** The Connect plan at $79/mo is the entry point. A 300-member church with one volunteer worries whether $79/mo is justified. The ROI calculator helps but is buried — it's unclear whether it's visible without significant scrolling. **Severity: High**

4. **"AI Broadcast Engineer" badge** in the hero may intimidate a non-technical pastor. "AI" is a loaded term that can mean anything. There's no plain-English explanation of what AI does specifically for their use case until the BoldStatement section. **Severity: Medium**

5. **No video demo.** This persona does not read feature docs. A 90-second "watch what happens when your stream crashes" video would convert this persona far better than text. There is no video anywhere in the codebase. **Severity: High**

6. **Success page onboarding is tech-heavy.** Step 1: download from GitHub. Step 2: sign in. Step 3: "Enter ATEM IP or click Auto-Discover." For a non-technical church, this will require calling someone for help. There's no "hand this to your AV person" email or share flow. **Severity: High**

### Severity Summary
| Issue | Severity |
|---|---|
| Telegram bot requirement unexplained | Critical |
| No onboarding path for non-technical users | High |
| Feature grid too jargon-heavy for pastors | High |
| No video demo | High |
| No small church ROI clarity | High |
| "AI" terminology uninitiated | Medium |

---

## Persona 3: IT Administrator Evaluating Security

**Profile:** IT director at a megachurch or multi-site church. Reports to CIO. Must vet any new SaaS before approval. Will read the privacy policy, terms of service, and check for SOC 2 / data handling details. Evaluates: what data leaves the network, what credentials are stored, what the blast radius of a breach is.

### What Works Well

- **Privacy policy page** exists (`/privacy`) with basic data handling disclosures.
- **Terms of service** page exists (`/terms`).
- **`/admin` is in `robots.txt` disallow** — admin panel not indexed.
- **API routes use token authentication** (church token in localStorage; admin routes have session-based auth).
- **Password strength meter** on signup form signals attention to credential quality.

### What's Broken, Confusing, or Missing

1. **No security page or security section.** There is no `/security`, no security FAQ, no mention of encryption (TLS, at-rest), no SOC 2 mention, no penetration testing disclosure, no data residency information. An IT admin with a security checklist will find zero answers in the site. **Severity: Critical**

2. **"Tally Agent" software download from GitHub raises red flags.** What does the agent do on the network? What ports does it need? What are its permissions? Is it open source? None of this is answered anywhere on the landing site. **Severity: Critical**

3. **Privacy policy and terms are not linked prominently from product features area** — only from the signup form checkbox and footer. **Severity: Medium**

4. **Church portal redirects to `https://api.tallyconnect.app/church-portal`** — the landing site leaks the relay server URL. Not a critical security risk, but notable for an IT evaluator. **Severity: Low**

5. **No data retention policy visible** (how long are session recordings, alert logs, production timelines stored?). The FAQ doesn't address this. **Severity: High**

6. **No mention of network requirements** (which IPs/domains the agent connects to, which ports must be open). IT admins in locked-down environments need this before they can approve installation. **Severity: High**

7. **Auth token stored in `localStorage`** (`tally_church_token`). `localStorage` is accessible to any JS on the page — not an httpOnly cookie. This is a meaningful security concern if the site ever loads third-party scripts. **Severity: Medium** (engineering concern, but discoverable by a security-literate evaluator)

### Severity Summary
| Issue | Severity |
|---|---|
| No security page / zero security information | Critical |
| No network requirements or agent documentation | Critical |
| No data retention policy | High |
| Auth token in localStorage not httpOnly | Medium |
| Privacy/Terms not prominently linked | Medium |
| Relay server URL exposed in redirect | Low |

---

## Persona 4: Price-Conscious Small Church Budget Holder

**Profile:** Business administrator or treasurer at a 200-member church. Controls spending. Skeptical. Will compare cost vs. existing subscriptions. Will ask: "Do we really need this? What happens if we cancel?"

### What Works Well

- **Annual billing toggle** prominently surfaced — "Save 3 months" messaging is clear. Annual discounts are meaningful (Connect: $79/mo → ~$59/mo equivalent).
- **Founding Church Rate** ($49/mo) with "LIMITED SPOTS" creates urgency and makes the entry price more attractive.
- **ROI Calculator** exists (`ROICalculator.js`) — frames Tally cost against saved failures.
- **Free trial + no credit card** messaging in hero and pricing is strong for budget-conscious buyers.
- **Event add-on** ($99 one-time) provides a low-commitment entry point for churches that only want coverage for Easter/Christmas.
- **FAQ answer on cancellation** ("cancel anytime, keep your data") reduces risk perception.

### What's Broken, Confusing, or Missing

1. **Founding rate "LIMITED SPOTS" counter is missing.** The badge says "FOUNDING CHURCH RATE — LIMITED SPOTS" but there's no counter showing how many spots remain or any scarcity evidence. This reads as empty urgency. **Severity: Medium**

2. **ROI Calculator location unclear.** The component exists but its position in the page flow is uncertain. If it's below the fold and the budget holder never scrolls to it, the core ROI argument is never made. **Severity: Medium**

3. **No "Compare to paying a tech" direct calculation.** The FAQ mentions "$200–500 per service for an experienced tech" but the ROI calculator focuses on stream failure cost, not labor replacement cost. For small churches whose primary spend is occasional tech contractor fees, the calculator may miss the mark. **Severity: Medium**

4. **Enterprise at $499/mo requires emailing sales.** The CTA is `mailto:sales@tallyconnect.app`. For a budget holder who wants instant information, email-gated pricing is a friction point (though standard for enterprise). **Severity: Low**

5. **Pricing not shown in feature comparison table header.** The pricing cards and comparison table are separate sections — a budget holder comparing plans must scroll between the two. **Severity: Medium**

6. **No money-back guarantee.** Free trial is 30 days with no credit card, which is good. But after the trial starts billing, there's no stated refund policy. A budget-conscious buyer will worry about being charged accidentally. **Severity: Medium**

### Severity Summary
| Issue | Severity |
|---|---|
| Fake scarcity on founding rate | Medium |
| ROI Calculator position unverified | Medium |
| No money-back guarantee statement | Medium |
| Labor replacement ROI not calculated | Medium |
| Pricing not in feature comparison table header | Medium |
| Enterprise email gate | Low |

---

## Persona 5: Spanish-Speaking Visitor

**Profile:** Technical director at a Spanish-speaking church. Primary language is Spanish. Found Tally via referral from another Hispanic church network. Navigates to `/es`. May have limited English comfort.

### What Works Well

- **`/es` page exists** with full Spanish translation — hero, features, pricing, FAQ, footer.
- **Translation quality** appears natural and uses Latin American Spanish per recent commits ("fix(es): rewrite Spanish translations to sound natural in Latin American context").
- **Hreflang tags** are properly configured: `en → /`, `es → /es` in root layout.
- **Language toggle** in footer ("ES · Español" from English, "EN · English" from Spanish).
- **i18n coverage** includes signup/signin form fields, validation errors, portal nav sections.
- **OG locale** on `/es` layout is set to `es_ES`.

### What's Broken, Confusing, or Missing

1. **`/es` is NOT in the sitemap** (`app/sitemap.js` doesn't include it). This means Google cannot discover the Spanish page via XML sitemap. For a Spanish-speaking visitor searching in Spanish on Google, the site is effectively invisible. **Severity: Critical**

2. **Language toggle is footer-only** — not in the navigation. A Spanish-speaking visitor who lands on the English homepage (`/`) has to scroll to the very bottom to find the language toggle. It will not be found by users who bounce quickly. **Severity: High**

3. **`/es/page.js` uses `'use client'`** — the entire Spanish page is client-rendered. This means: no server-side HTML for Google's Spanish crawl, slower First Contentful Paint on slow connections, and no streaming SSR benefits of Next.js 15. The English page (`/page.js`) is a server component. This is a structural inconsistency. **Severity: High**

4. **Blog posts have no Spanish versions.** `/blog` and `/blog/[slug]` have no i18n equivalent. A Spanish-speaking visitor interested in reading more will hit English-only blog content with no language toggle. **Severity: Medium**

5. **`es_ES` locale may not match target audience.** Google may interpret `es_ES` as Spain Spanish rather than Latin American Spanish (`es-419`). Given the stated goal of targeting Latin American churches, the hreflang should use `es-419` or `es-MX`. **Severity: Medium**

6. **Signup page (`/signup`) has no Spanish route.** A Spanish-speaking visitor who clicks "Empezar Gratis" from `/es` lands on the English-language signup form at `/signup`. The form fields are translated in `lib/i18n.js` but only if a locale is passed — the actual signup page doesn't auto-detect Spanish preference. **Severity: High**

7. **Help page has no Spanish equivalent.** A Spanish-speaking church with a setup question has no support resource in their language. **Severity: Medium**

### Severity Summary
| Issue | Severity |
|---|---|
| `/es` missing from sitemap | Critical |
| `/es/page.js` is fully client-rendered | High |
| Language toggle not in nav | High |
| Signup page not localized for Spanish | High |
| Blog has no Spanish content | Medium |
| hreflang locale should be es-419 not es_ES | Medium |
| No Spanish help content | Medium |

---

## Persona 6: Mobile User

**Profile:** Worship leader checking out Tally on their phone after someone mentioned it at a conference. Using iPhone 14 in Safari. Will spend 2–3 minutes max. Wants to quickly understand what it does and whether to bookmark for later.

### What Works Well

- **Responsive grid system** uses `auto-fit/auto-fill` with `minmax()` throughout — layouts adapt naturally.
- **Nav hamburger** at ≤840px with full-screen overlay menu is present and has proper aria labels.
- **BoldStatement heading** uses `clamp(3rem, 10vw, 7rem)` — scales gracefully with viewport.
- **Sticky CTA** visible on scroll (though text hidden at mobile, button still appears).
- **Feature comparison table** replaced with `<details>` accordion cards on mobile (≤768px) — avoids horizontal scroll.
- **`prefers-reduced-motion`** respected in GlobalStyles — animations disabled for users who need it.
- **PWA support** via `manifest.json` + `sw.js` + `PwaInit` component — can be added to home screen.

### What's Broken, Confusing, or Missing

1. **App showcase images likely unoptimized for mobile.** `/public/app-status.png`, `app-equipment.png`, `app-engineer.png` are referenced in `AppShowcase.js`. If these use raw `<img>` tags without Next.js `<Image>` component's `sizes` prop and WebP/AVIF generation, mobile users on LTE could wait 5–10 seconds for full-res PNGs to load. **Severity: High**

2. **Sticky CTA text hidden on mobile** — the Sticky CTA shows only the button ("Start Free Trial →") on mobile, hiding the supporting text "Church production monitoring that fixes itself." A mobile user who hasn't fully read the page won't know what they're starting a trial of. **Severity: Medium**

3. **Chat widget may occlude content on mobile.** The ChatWidget is a floating button that opens a chat panel. On mobile, this `position: fixed` overlay could cover CTA buttons or pricing content depending on panel height. **Severity: Medium** (requires visual verification)

4. **Hardware page filter UI on small screens** — the filterable category browser at `/hardware` may be cramped or require horizontal scrolling. Not verifiable from source alone. **Severity: Low**

5. **No "Share" or "Save for later" affordance.** A mobile user who wants to review later from desktop has no email-yourself or share CTA. **Severity: Low**

6. **Scrolling marquee motion sensitivity** — `aria-hidden="true"` on the device strip is correct, but if `prefers-reduced-motion` isn't specifically handled in the marquee component (vs. only in GlobalStyles), auto-scrolling animations may trigger motion sensitivity issues for some users. **Severity: Low**

### Severity Summary
| Issue | Severity |
|---|---|
| App showcase images likely unoptimized for mobile | High |
| Sticky CTA loses context on mobile | Medium |
| Chat widget may occlude content on mobile | Medium |
| Hardware filter UX on small screens unverified | Low |
| No share/save-for-later affordance | Low |
| Marquee motion sensitivity | Low |

---

## Persona 7: SEO Crawler / Bot

**Profile:** Googlebot crawling the site. Also covers: link preview bots (Twitter/X, Slack, LinkedIn, iMessage), Bing, and structured data validators.

### What Works Well

- **Root metadata** is comprehensive: title, description, keywords, OG tags, Twitter card, canonical URL.
- **hreflang** for en/es is configured in root layout.
- **JSON-LD structured data** (`SoftwareApplication` + `Organization`) on homepage.
- **Robots.txt** correctly disallows `/admin` and `/api/`.
- **Sitemap exists** at `app/sitemap.js` with proper priorities.
- **OG image** specified at `https://tallyconnect.app/og-image.png` — needed for link previews.
- **Blog posts** are dynamically included in sitemap.
- **Next.js 15 metadata API** used consistently — proper `<head>` generation.

### What's Broken, Confusing, or Missing

1. **`/es` missing from sitemap.** The Spanish landing page is not included in `app/sitemap.js`. Combined with client-side rendering, the Spanish page will be dramatically less discoverable than the English page. **Severity: Critical**

2. **`/hardware` missing from sitemap.** This high-intent page for AV directors searching specific equipment compatibility is not indexed by Google. **Severity: High**

3. **`/es/page.js` is fully client-rendered** (`'use client'`). Googlebot renders JavaScript, but client-side rendering delays indexing and reduces crawl efficiency. **Severity: High**

4. **No FAQPage JSON-LD schema.** The FAQ component has 12 well-formed Q&A pairs. Adding `FAQPage` structured data would enable Google's FAQ rich results in search, significantly increasing SERP real estate for branded and informational queries. **Severity: High**

5. **Blog post pages may share root metadata.** If `app/blog/[slug]/page.js` doesn't implement `generateMetadata()` per post, all blog pages will have identical `<title>` and `<description>` tags — a duplicate content signal that Google penalizes. **Severity: High** (needs verification)

6. **JSON-LD `offers.lowPrice: 0`** is misleading — there is no permanently free plan. The free period is a 30-day trial. Google's rich results may surface "$0" pricing which misrepresents the product. **Severity: Medium**

7. **No dynamic OG images for blog posts.** Shared blog links will show the generic Tally OG image regardless of post content, reducing click-through rate from social shares. **Severity: Medium**

8. **`/portal` is in the sitemap** (priority 0.6) but immediately redirects to an external URL. This wastes crawl budget and may confuse Google's understanding of site structure. **Severity: Medium**

9. **`/signup` is in sitemap at priority 0.8.** Signup pages are generally not the best pages to surface in search results — the primary organic entry points should be the homepage and feature/blog content. **Severity: Low**

### Severity Summary
| Issue | Severity |
|---|---|
| `/es` missing from sitemap | Critical |
| `/hardware` missing from sitemap | High |
| `/es` client-rendered limits crawlability | High |
| FAQ has no FAQPage schema | High |
| Blog posts may share root metadata | High |
| `/portal` in sitemap despite redirect | Medium |
| JSON-LD lowPrice: 0 misrepresents trial | Medium |
| No dynamic OG images for blog | Medium |
| `/signup` in sitemap at high priority | Low |

---

## Persona 8: User Comparing Tally to Competitors

**Profile:** TD who has already found 2–3 potential solutions. Searching "tally connect vs [X]" or "church streaming monitoring comparison." May have seen Restream, Castr, or DIY Uptime Robot setups. Wants to understand differentiation.

### What Works Well

- **Integrations list (26 items)** is a strong implicit differentiator — competitors with fewer integrations lose on this page.
- **ROI Calculator** implicitly compares against "paying a tech" — the most common real alternative.
- **Feature comparison table** across 4 Tally plans shows depth (23 rows) — suggests a mature, fully-featured product.
- **Founder credibility** (15 years in church broadcast booths) differentiates from generic SaaS.
- **Planning Center sync** is a specific, church-exclusive feature that generic monitoring tools almost certainly don't offer.

### What's Broken, Confusing, or Missing

1. **No competitor comparison page or section.** There is no `/compare`, no "Why Tally vs. DIY monitoring," no "Tally vs. Castr," no "Tally vs. paying a tech" structured page. A user evaluating alternatives has no page that directly addresses their comparison intent. **Severity: Critical**

2. **No explicit "church-specific" positioning vs. generic tools.** Generic uptime monitoring tools (UptimeRobot, Better Uptime, StatusPage) also exist. There's no paragraph explaining why a generic tool doesn't cover church AV use cases (ATEM integration, ProPresenter sync, audio monitoring, auto-recovery vs. just alerting). **Severity: High**

3. **No G2, Capterra, or third-party review integration.** The testimonials section is self-hosted (fetched from `/api/reviews` with hardcoded fallbacks). There are no badge embeds from review platforms that would validate social proof to a skeptical comparison shopper. **Severity: Medium**

4. **No named differentiators list.** Tally's differentiators (auto-recovery not just alerting, church-specific integrations, AI natural language control) are present throughout the page but never consolidated in one concise "Why Tally" section. **Severity: Medium**

5. **Chat widget could serve this persona** better with a comparison-focused quick-action pill. Currently "Ask about features," "See pricing," and "Try a live demo" don't address "How does Tally compare to X?" **Severity: Low**

### Severity Summary
| Issue | Severity |
|---|---|
| No competitor comparison content | Critical |
| No "why not generic tools" positioning | High |
| No third-party review platform badges | Medium |
| Differentiators not consolidated | Medium |
| Chat widget doesn't address comparison | Low |

---

## Persona 9: User Trying to Sign Up / Get Started

**Profile:** TD or pastor who has decided to try Tally. Follows "Start Free — 30 Days →" CTA from the hero or pricing section. Wants a smooth, fast signup experience with clear next steps.

### What Works Well

- **Signup form** (`/signup`) is well-built: all fields have proper `htmlFor`/`id` pairs, `aria-describedby` on errors, `aria-invalid` on invalid fields, `aria-live` on error container.
- **Password strength meter** is present and provides visual feedback (Weak/Fair/Good/Strong).
- **Plan selector** is on the signup page — user can choose their tier without a separate step.
- **Annual/monthly toggle** on signup means the user doesn't have to go back to pricing.
- **Referral code support** (`?ref=...`) with "you'll both get a free month" messaging is a nice touch.
- **Success page** provides clear 3-step onboarding (download → sign in → connect gear).
- **Mac Apple Silicon and Windows downloads** are both linked.

### What's Broken, Confusing, or Missing

1. **Telegram bot registration explained nowhere before signup.** The success page shows a registration code for `@tallybot` with a `/register {code}` command. There is no mention of Telegram anywhere in the signup flow, pricing page, or FAQ until after the user has already signed up. A user who doesn't use Telegram will be stuck at step 3 of onboarding with no path forward. **Severity: Critical**

2. **Plan selector on signup likely shows plan names without prices.** A user who arrived from the pricing page may not remember which plan was which. If prices are not shown in the plan selector, the user may pick the wrong tier. **Severity: High**

3. **No payment form in signup flow with advance notice.** The signup sends to Stripe checkout (`data.checkoutUrl`). If their popup blocker blocks the redirect, or if `checkoutUrl` is null (fallback goes directly to `/signup/success`), they may end up "signed up" but with no clear billing status. **Severity: Medium**

4. **Registration code string interpolation risk.** `/signup/success` shows a Telegram registration code. If the `code` query parameter is missing or the page is navigated to directly, this may render as a literal `{code}` string. Needs code-level verification. **Severity: Medium**

5. **No email confirmation step shown.** It's unclear whether the signup flow sends a verification email and whether the success page communicates this expectation. If users must verify email before logging in, the success page should state this. **Severity: Medium**

6. **Onboarding step 3 assumes technical knowledge.** "Enter ATEM IP or click Auto-Discover" has no "if you don't know your ATEM IP" guidance on the success page. Link to help docs exists but only at the bottom. **Severity: Medium**

7. **Portal link on success page redirects to different domain.** After just signing up, the redirect from `tallyconnect.app` to `api.tallyconnect.app` may feel unexpected and untrustworthy (browser shows new domain in URL bar). **Severity: Low**

### Severity Summary
| Issue | Severity |
|---|---|
| Telegram requirement surprise post-signup | Critical |
| Plan selector may not show prices | High |
| Stripe redirect with no warning | Medium |
| Registration code may render as literal string | Medium |
| No email confirmation expectation set | Medium |
| No ATEM IP guidance for beginners | Medium |
| Portal redirect to different domain | Low |

---

## Persona 10: Accessibility-Focused User with Screen Reader

**Profile:** Technical director who uses a screen reader due to visual impairment. Using VoiceOver on Mac with Safari, or NVDA on Windows with Firefox. Evaluating whether the site is navigable without vision.

### What Works Well

- **SkipNav component** — "Skip to main content" visually hidden link jumps to `#main-content`. Proper pattern, visible on focus.
- **FAQ accordion** — `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby` on each item. `aria-hidden` on decorative `+` icon. Full marks.
- **Nav hamburger** — `aria-label` toggles between "Open main menu" and "Close main menu"; `aria-expanded` state.
- **Mobile nav backdrop** — button with `aria-label="Close navigation"`.
- **Signup form** — `htmlFor`/`id` pairs on all inputs; `aria-describedby` on error messages; `aria-invalid` on invalid fields; `aria-live="polite"` on error container; `role="alert"` on error messages. Excellent form accessibility.
- **Sticky CTA** — `role="complementary"`, `aria-label="Start free trial"`.
- **Marquee strip** — `aria-hidden="true"` on decorative content.
- **Semantic HTML** — `<nav>`, `<main>`, `<section>`, `<footer>`, `<aside>`, proper heading hierarchy.
- **Focus styles** — `button:focus-visible` and `a:focus-visible` have 2px green outline in GlobalStyles.

### What's Broken, Confusing, or Missing

1. **No alt text confirmed on AppShowcase images.** The `AppShowcase.js` component references `/public/app-status.png`, `app-equipment.png`, `app-engineer.png`. If these `<img>` elements lack `alt` attributes (or have empty `alt=""`), screen reader users receive no information about the screenshots — which are the primary product evidence on the page. **Severity: High**

2. **Chat widget accessibility unconfirmed.** The floating chat button needs a clear `aria-label` (e.g., "Open support chat"). The `aria-live` region within the chat panel needs to announce new messages. Without these, screen reader users may not notice the widget or receive chat responses. **Severity: High**

3. **Billing toggle likely missing role="switch".** The annual/monthly pricing toggle needs `role="switch"`, `aria-checked`, and `aria-label` to be accessible to screen readers. If implemented as styled `<button>` elements without these attributes, screen reader users can't understand the toggle state. **Severity: High**

4. **Integration and feature card icons may lack alt text.** 26 integration cards and 21 feature cards sourced from arrays in `lib/data.js`. If cards contain icon images without alt text and no additional descriptive text, the visual icon context is lost to screen reader users. **Severity: Medium**

5. **IncidentTimeline animation accessibility.** The 4-step animated timeline uses IntersectionObserver to trigger CSS animations. If the animation is conveying meaning (the sequence Failure Detected → Verified → Auto-Recovery → Confirmed Live), the steps need to be present in the DOM in readable order regardless of animation state. **Severity: Medium**

6. **"Most Popular" badge on Pro plan needs context.** The badge needs `aria-label` or `sr-only` text associating it with the Pro plan (e.g., "Pro plan — Most Popular"). Otherwise a screen reader user hears "Most Popular" as floating text disconnected from context. **Severity: Medium**

7. **Color contrast likely passes but unverified.** `#94A3B8` (MUTED) on `#09090B` (BG) is approximately 5.7:1, passing WCAG AA. Green `#22c55e` on dark background is approximately 5.5:1. These are likely compliant but a full audit across all text/background combinations has not been confirmed. **Severity: Low**

### Severity Summary
| Issue | Severity |
|---|---|
| AppShowcase images likely missing alt text | High |
| Chat widget accessibility (aria-live, aria-label) | High |
| Billing toggle may lack role="switch" | High |
| Integrations/Features icons may lack alt text | Medium |
| Incident timeline animation accessibility | Medium |
| "Most Popular" badge context for screen readers | Medium |
| Color contrast — likely passes but unverified | Low |

---

## Cross-Cutting Issues

Issues that appeared across multiple personas:

| Issue | Affected Personas | Severity |
|---|---|---|
| Telegram requirement undisclosed pre-signup | Pastor, Non-tech user, Sign-up user | **Critical** |
| `/es` page missing from sitemap and client-rendered | Spanish speaker, SEO crawler | **Critical** |
| No competitor comparison content | AV Director, Comparison shopper | **Critical** |
| No security documentation | IT Admin | **Critical** |
| No network/agent requirements page | IT Admin, AV Director | **Critical** |
| App screenshots likely missing alt text | Screen reader user, Mobile, SEO | **High** |
| Language toggle not in nav | Spanish speaker, Mobile user | **High** |
| Hardware page missing from sitemap | AV Director, SEO crawler | **High** |
| No video demo | Pastor, Mobile user | **High** |
| FAQ missing FAQPage schema | SEO crawler | **High** |
| Billing toggle accessibility | Screen reader user | **High** |
| Chat widget accessibility | Screen reader user | **High** |

---

## Overall Score: 6.4 / 10

| Dimension | Score | Notes |
|---|---|---|
| Content & Messaging | 7.5 | Strong pain-point framing, good testimonials; jargon-heavy features list; no competitor positioning |
| SEO & Discoverability | 5.0 | Good root metadata; critical gaps: `/es` missing from sitemap, client-rendered Spanish page, no FAQ schema |
| Conversion Funnel | 6.0 | Solid CTAs and free trial; Telegram surprise is a critical post-signup drop-off risk |
| Mobile Experience | 6.5 | Responsive foundations solid; image optimization unverified; chat widget overlap risk |
| Accessibility | 7.0 | Strong ARIA groundwork; image alt text and billing toggle are meaningful gaps |
| Internationalization | 5.5 | Spanish page exists but structural problems limit effectiveness |
| Security & Trust | 4.0 | Zero security documentation; IT admin evaluation path completely unsupported |
| Competitive Positioning | 5.0 | Good implicit differentiation; zero explicit competitor comparison content |
| Technical Quality | 7.5 | Next.js 15 with metadata API, PWA support, good auth patterns; `localStorage` token minor concern |
| Onboarding Clarity | 6.0 | Success page well-structured; Telegram and ATEM IP gaps hurt non-technical users |

---

## Prioritized Action Items

### P0 — Critical (Fix Before Next User Acquisition Push)

1. **Add `/es` to `app/sitemap.js`** — one-line fix, huge SEO impact for Spanish-speaking audience.
   - File: `app/sitemap.js`

2. **Disclose Telegram requirement before signup** — add to FAQ ("How do alerts work?"), pricing section ("Alert channels: Slack, Telegram"), and the signup page itself. Consider making Telegram optional (Slack-only path).
   - Files: `app/components/FAQ.js`, pricing section, `app/signup/page.js`

3. **Convert `/es/page.js` from `'use client'` to server component** — extract only the tab/toggle interactive parts into a client component; keep the page shell as RSC for Google crawlability and faster FCP.
   - File: `app/es/page.js`

4. **Create a `/security` page** — document: TLS encryption, data at rest, SOC 2 status or roadmap, network requirements (ports, IP ranges), what the agent software does on the network, data retention policy. Link from footer and FAQ.
   - New file: `app/security/page.js`; update `app/components/Footer.js`

5. **Create a competitor comparison section or page** — even a simple "Why not just use UptimeRobot?" section addressing DIY monitoring limitations plus a "Tally vs. hiring a tech" table would serve the large segment of comparison shoppers.
   - Suggested: new section on homepage or new page `/compare`

### P1 — High (Fix Within 2 Sprints)

6. **Add `FAQPage` JSON-LD structured data** — the 12 FAQ items are ideal candidates. Google FAQ rich results can double SERP real estate for branded and informational queries.
   - File: `app/page.js` (JSON-LD section)

7. **Add `/hardware` to `app/sitemap.js`** — hardware compatibility is a high-intent SEO page for AV directors.
   - File: `app/sitemap.js`

8. **Move language toggle to navigation** — add "ES" or globe icon link to Nav component alongside Sign In. Spanish speakers should not have to scroll to the footer.
   - File: `app/components/Nav.js`

9. **Add alt text to all AppShowcase images** — `app-status.png`, `app-equipment.png`, `app-engineer.png` need descriptive alt text for accessibility and SEO image indexing.
   - File: `app/components/AppShowcase.js`

10. **Audit and fix billing toggle accessibility** — confirm `role="switch"` + `aria-checked` + `aria-label` on the pricing annual/monthly toggle. Fix if missing.
    - File: pricing component

11. **Audit and fix chat widget accessibility** — confirm `aria-label` on chat button, `aria-live` region on chat messages, focus management on open/close.
    - File: `app/components/ChatWidget.js`

12. **Add a video demo** — even a 90-second screen recording of the auto-recovery sequence would dramatically improve conversion for non-technical visitors (pastors, small church admins).
    - File: `app/components/AppShowcase.js` or new `VideoDemo.js` component

13. **Show prices in signup plan selector** — users choosing a plan at signup should see price alongside plan name.
    - File: `app/signup/page.js`

14. **Add a Spanish route for signup** — `/es/signup` or locale detection on `/signup` that renders Spanish form labels/errors from the existing i18n translations.
    - File: `app/signup/page.js` or new `app/es/signup/page.js`

### P2 — Medium (Fix Within 1 Quarter)

15. **Optimize AppShowcase images for mobile** — use Next.js `<Image>` component with `sizes` prop and WebP/AVIF formats instead of raw `<img>` tags for PNGs.
    - File: `app/components/AppShowcase.js`

16. **Add `aria-label` / `sr-only` text to "Most Popular" pricing badge** — associate it explicitly with the Pro plan for screen reader users.
    - File: pricing component

17. **Replace `lowPrice: 0` in JSON-LD** with `49` (founding rate) as the actual minimum paid price. Alternatively use `PriceSpecification` with a trial period type.
    - File: `app/page.js`

18. **Remove `/portal` from sitemap** or add noindex directive — redirect pages waste crawl budget.
    - File: `app/sitemap.js`

19. **Add money-back guarantee or cancellation clarity** — "cancel anytime, no questions asked" prominently near pricing reduces purchase anxiety.
    - File: pricing component

20. **Add scarcity evidence to founding rate** — if there truly are limited spots, show a counter. If not, remove "LIMITED SPOTS" claim as it reads as fake urgency.
    - File: pricing component

21. **Verify blog post per-page metadata** — confirm `app/blog/[slug]/page.js` generates unique `<title>` and `<description>` per post via `generateMetadata()`. Fix if sharing root metadata.
    - File: `app/blog/[slug]/page.js`

22. **Audit all integration and feature card icons for alt text.**
    - Files: `app/components/Integrations.js`, `app/components/Features.js`

23. **Change hreflang for Spanish from `es_ES` to `es-419`** (Latin American Spanish) to match the stated target audience.
    - File: `app/es/layout.js` and root layout hreflang tags

### P3 — Low (Backlog)

24. Add `loading="lazy"` and `decoding="async"` to non-critical images across all components.
25. Add a "How does Tally compare to DIY monitoring?" help article in the blog/help center.
26. Add a Spanish help page or at minimum a help center link from `/es` noting support is available in Spanish.
27. Consider moving church auth token from `localStorage` to `httpOnly` cookie if third-party scripts are ever added.
28. Add "Share" or "Email to teammate" affordance on mobile for visitors who want to share with their tech director.
29. Add version number and changelog link to the success page download section.
30. Add `HowTo` schema for the "How It Works" three-step section.

---

## Files Requiring Immediate Attention

| File | Issues |
|---|---|
| `app/sitemap.js` | Missing: `/es`, `/hardware`; remove: `/portal` |
| `app/es/page.js` | Client-rendered; no SSR; language toggle only in footer |
| `app/components/FAQ.js` | Missing FAQPage JSON-LD |
| `app/components/Nav.js` | Missing language toggle |
| `app/components/AppShowcase.js` | Missing image alt text; unoptimized images |
| `app/components/ChatWidget.js` | Accessibility unverified (aria-live, aria-label) |
| `app/signup/page.js` | No Telegram disclosure; plan selector missing prices |
| `app/signup/success/page.js` | Telegram explained too late; ATEM IP guidance absent |
| `app/page.js` | `lowPrice: 0` in JSON-LD; missing FAQPage schema |
| Pricing component | Billing toggle accessibility; scarcity evidence; no refund policy |

---

*Report generated by automated source code trace through all pages, components, routing, SEO metadata, i18n files, and API routes. Visual rendering, actual image content, and dynamic API behavior should be verified with browser-based testing.*
