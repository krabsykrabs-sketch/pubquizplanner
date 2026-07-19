# PubQuizPlanner — Concept Paper v4

*Last updated: March 26, 2026*

---

## 1. Executive Summary

A web-based tool that assembles verified quiz questions into beautiful, downloadable HTML slide presentations and printable answer sheets. German-first launch at **pubquizplanner.com** targeting an underserved market with zero dedicated competition.

**No AI at runtime.** The product is a curated question database + configurator + template engine. AI is used only in the admin content pipeline to generate and verify questions offline. Every question is human-reviewed before going live. The user never interacts with AI.

**Current status:** Core product built (quiz builder, presentation export, answer sheets, admin CMS). Question database at ~960 approved questions across 14 categories, with ~2,000+ additional questions in pipeline. Pre-launch phase — curating content and building legal/SEO pages.

---

## 2. The Opportunity

### Why German-first?

| Factor | English Market | German Market |
|--------|---------------|---------------|
| Dedicated quiz tools | 10+ established players | Zero |
| Weekly quiz events | ~25,000 (UK alone) | Growing, emerging |
| SEO competition | BuzzFeed, Britannica, Mentimeter | Blog posts, Dutch translations |
| Quiz generator tools | PubQuizCreator (52K questions) | None |
| Addressable population | ~70M (UK + Ireland) | ~100M (DE + AT + CH) |

### Competitive Landscape (German)

| Competitor | Offering | Weakness |
|-----------|----------|----------|
| Spiele-gruppen.de | PowerPoint quiz for €29.95 | Dutch company, translated content |
| Quiz-maestro.de | Blog with 20 sample questions | Dutch, minimal content |
| QWissen.com | PDF quiz templates | Tiny site |
| Kneipenquiz.org | How-to instructions | No questions, no tool |

**No German quiz generator exists.** First-mover advantage is ours.

---

## 3. Product Description

### What It Is

A website where quiz hosts configure a pub quiz (rounds, categories, difficulty), preview and swap individual questions, and download a complete presentation-ready HTML slideshow plus printable answer sheets.

### What Makes It Different

1. **Presentation-ready output** — single offline HTML file for any laptop/TV/projector. Competitors offer raw question lists or PDFs.
2. **Curated & verified** — every question human-reviewed. No AI hallucinations.
3. **Full customization** — categories, difficulty, round types, individual question swaps, answer placement.
4. **Highlight questions** — algorithm guarantees surprising/witty questions in every round, preventing boring repetitive quizzes.
5. **Complete package** — slides + team answer sheets + quizmaster cheat sheet.

### What It Is NOT

- Not a live quiz hosting platform (no phone buzzing, no real-time scoring)
- Not a Kahoot/Mentimeter competitor
- Not an educational quiz maker
- Not AI-generated at runtime

---

## 4. Quiz Builder — The Configurator

### Step 1: Basic Setup

| Field | Options | Default |
|-------|---------|---------|
| Quiz title | Free text | "Quiz Abend" |
| Date | Date picker | Today |
| Venue name | Free text | Empty |
| Number of rounds | 3–8 | 5 |
| Answer placement | "After each round" / "All at the end" | All at the end |

### Step 2: Round Configuration (per round)

1. Pick a category from dropdown (14 options)
2. See example questions per difficulty level inline
3. Select difficulty (1-3 stars, all checked by default, at least 1 required)
4. Pick questions per round (5, 8, or 10)
5. Pick round type (Standard / Multiple Choice)

### Step 3: Preview & Swap

- All questions listed by round with answers
- 🔄 swap button per question (unlimited, free)
- Drag to reorder within rounds

### Step 4: Download

- HTML presentation (single offline file, dark theme)
- Team answer sheet PDF (numbered lines, no questions)
- Quizmaster cheat sheet PDF (PREMIUM — all Q+A + fun facts)

---

## 5. Question Categories

| Category | German Name | Icon |
|----------|------------|------|
| General Knowledge | Allgemeinwissen | 🧠 |
| Sport | Sport | ⚽ |
| History | Geschichte | 📜 |
| Geography | Geographie | 🌍 |
| Film & TV | Film & TV | 🎬 |
| Music | Musik | 🎵 |
| Science & Nature | Wissenschaft & Natur | 🔬 |
| Food & Drink | Essen & Trinken | 🍕 |
| Literature | Literatur | 📚 |
| Art & Culture | Kunst & Kultur | 🎨 |
| Technology | Technik | 💻 |
| Pop Culture | Popkultur | ⭐ |
| Language & Words | Sprache & Wörter | 💬 |
| Logic & Maths | Logik & Mathe | 🔢 |

---

## 6. Question Database

### Current State (~March 26, 2026)

| Category | Approved | Status |
|----------|----------|--------|
| Wissenschaft & Natur | 166 | ✅ Launch-ready |
| Geschichte | 168 | ✅ Launch-ready |
| Geographie | 118 | ✅ Launch-ready |
| Literatur | 104 | ✅ Launch-ready |
| Allgemeinwissen | 87 | ✅ Launch-ready |
| Film & TV | 78 | ✅ Launch-ready |
| Musik | 77 | ✅ Launch-ready |
| Sport | 57 | ✅ Launch-ready |
| Popkultur | 31 | ✅ Launch-ready |
| Essen & Trinken | 18 | ⚠️ Needs content |
| Technik | 15 | ⚠️ Needs content |
| Kunst & Kultur | 14 | ⚠️ Needs content |
| Sprache & Wörter | 12 | ⚠️ Needs content |
| Logik & Mathe | 12 | ⚠️ Needs content |
| **Total** | **~960** | |

**Additional in pipeline:**
- ~182 questions pending manual review (Wissenschaft, Musik)
- ~1,999 Wikidata questions awaiting QC + import
- Potential: ~6,000 total after all sources processed

### Data Sources

| Source | License | Raw Questions | Yield |
|--------|---------|--------------|-------|
| OpenTriviaQA (github.com/uberspot) | CC BY-SA 4.0 | 49,599 | ~1,130 verified |
| Wikidata SPARQL | Public domain | N/A | 1,999 generated |
| OpenTDB | CC BY-SA 4.0 | ~4,500 | ~1,000 estimated |
| Admin CMS AI (Claude Sonnet) | Original | Various | Ongoing |

### Difficulty Scale (changing to 3 levels)

| Level | Description |
|-------|------------|
| ⭐ | Almost everyone knows this |
| ⭐⭐ | Good general knowledge needed |
| ⭐⭐⭐ | Need to know the topic well / expert |

### Highlight Questions (planned)

Special `is_highlight` flag for questions that are witty, surprising, or have a great "aha!" moment. Algorithm guarantees at least 1 highlight per 5 questions per round. Prevents boring quizzes with 5 capital-city questions in a row.

### Automated Pipeline

```
Raw English source files (OpenTriviaQA, OpenTDB)
  ↓
Pre-filter (Python, no AI) — removes T/F, MC-only, medical, US-specific
  ↓
Translate + curate (Claude Code) — strict keep/reject, German pub quiz quality
  ↓
QC fact-check (Claude Code) — independent answer verification
  ↓
Import via admin CMS → status: pending
  ↓
Manual review → approve / reject / edit
```

---

## 7. Output Package

### 🖥️ HTML Presentation

Single self-contained HTML file. Works offline. No internet needed.

- Dark theme (readable in dim pub lighting)
- Arrow keys / click navigation
- T = timer, F = fullscreen, R = reveal answers
- Slide types: title, round title, question, answer (with fun fact), halftime, final
- Answer placement configurable (after each round or all at end)

### 📝 Team Answer Sheet (PDF)

- No questions shown — just numbered lines per round
- Score boxes per round + total
- Site branding in footer (removed in premium)

### 📋 Quizmaster Cheat Sheet (PDF, PREMIUM)

- All questions with answers and fun facts
- Scoring instructions

---

## 8. Content Pipeline — Admin CMS

No AI at runtime. All AI usage in the admin backend, offline, with human review.

### Admin Features (all built ✅)

- **Dashboard:** question counts per category (approved only)
- **AI Generation:** Claude Sonnet with web search verification → pending
- **Review Queue:** approve ✅ / reject ❌ / edit, bulk approve/reject all
- **Question Browser:** search, filter by category/difficulty/tags/status
- **Import:** bulk JSON upload with duplicate detection
- **Current Events:** AI + web_search tool, tagged by week

---

## 9. Free vs Premium

### Free Tier

| Feature | Limit |
|---------|-------|
| Quiz generation | 2 per month |
| Rounds per quiz | Up to 4 |
| Questions per round | 5, 8, or 10 |
| All categories | ✅ |
| All difficulty levels | ✅ |
| Question swaps | Unlimited |
| HTML presentation | ✅ |
| Team answer sheet PDF | ✅ |
| Quizmaster cheat sheet | ❌ Premium only |
| Custom questions | ❌ Premium only |
| Watermark | "Erstellt mit pubquizplanner.com" |

### Premium (€4.99/month or €39.99/year)

| Feature | Included |
|---------|----------|
| Quiz generation | Unlimited |
| Rounds per quiz | Up to 8 |
| Quizmaster cheat sheet PDF | ✅ |
| Custom questions | ✅ |
| No watermark | ✅ |
| Custom branding (logo) | ✅ |
| "Already used" tracking | ✅ |
| Visual themes | Multiple |

---

## 10. Domain & Branding

- **Domain:** pubquizplanner.com (purchased, DNS active)
- **Typo redirect:** pubquizplaner.com
- **Branding:** No "AI" in branding. Focus on verified, curated quality.
- **Visual identity:** dark backgrounds, amber/gold accents (#d4a843)

---

## 11. Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router), TypeScript |
| Database | PostgreSQL via pg library (no ORM) |
| Styling | Tailwind CSS |
| i18n | next-intl v4 |
| Hosting | Hetzner VPS via Coolify |
| Admin AI | Anthropic API (Sonnet) — admin only |
| Runtime AI cost | €0 |

---

## 12. Site Structure

```
/de/                                → German homepage + generator
/de/generator                       → Full quiz builder (4 steps)
/de/fragen/[category]              → SEO category pages (PENDING)
/de/fragen/aktuell                 → Current events questions (PENDING)
/de/blog/                          → Blog (PENDING)
/de/impressum                      → Legal notice (PENDING)
/de/datenschutz                    → Privacy policy (PENDING)
/de/credits                        → Attribution page (PENDING)

/admin/                            → Admin CMS (built ✅)
```

---

## 13. Revenue Model

### Phase 1: Ad-Supported (Months 1–4)

- Google AdSense on SEO pages
- Target: slow growth, realistic expectations

### Phase 2: Freemium (Month 5+)

- Premium at €4.99/month or €39.99/year

### Revenue Expectations (Realistic)

| Milestone | Monthly Revenue |
|-----------|----------------|
| Month 1-2 | €0 (building content, indexing) |
| Month 3 | €0-20 (first SEO traffic) |
| Month 6 | €30-100 (growing ad traffic) |
| Month 9 | €100-400 (ads + first premium) |
| Month 12 | €200-800 |

---

## 14. Licensing

All question sources use **CC BY-SA 4.0**, which:
- ✅ Allows commercial use
- ✅ Allows paywall
- ✅ Allows translation and modification
- Requires: attribution (credits page) + share adapted versions under same license

---

## 15. Development Status

### ✅ Completed
- [x] Domain purchased + DNS configured
- [x] Next.js project with i18n
- [x] PostgreSQL schema + categories
- [x] Admin CMS: dashboard, generate, review, questions, import, current-events
- [x] Quiz builder UI (4 steps)
- [x] HTML presentation export (offline, dark theme, keyboard nav)
- [x] Team answer sheet PDF
- [x] Automated question pipeline (prefilter + CC translate + CC QC)
- [x] Wikidata questions generated (1,999)
- [x] OpenTriviaQA pipeline: ~1,130 verified questions
- [x] ~960 questions approved in database
- [x] Deployed to Hetzner via Coolify

### 🔲 Pending (pre-launch)
- [ ] Finish manual review of pending questions
- [ ] Difficulty 4→3 migration + is_highlight feature
- [ ] QC + import Wikidata questions
- [ ] Fill weak categories (Essen, Kunst, Technik, Sprache, Logik)
- [ ] Impressum + Datenschutzerklärung
- [ ] Credits page (OpenTriviaQA + OpenTDB attribution)
- [ ] SEO category pages /de/fragen/[category]
- [ ] Sitemap.xml, meta tags, OpenGraph

### 🔲 Post-launch
- [ ] Google Search Console + sitemap
- [ ] Google AdSense application
- [ ] Premium tier (Stripe)
- [ ] Special round types (emoji, flags, connection, estimation)
- [ ] English expansion

---

## 16. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Wrong answers | 3-layer QC pipeline + manual review + user report button |
| Low German search volume | Multiple keyword variants, broad "Quizfragen" terms |
| Competitor enters | First-mover + growing DB + domain authority |
| AdSense rejection | Alternatives: Ezoic, direct ads, earlier freemium |
| Questions feel repetitive | is_highlight system, track served questions, weekly additions |

---

## 17. Open Decisions (Resolved)

| Decision | Resolution |
|----------|-----------|
| Domain | pubquizplanner.com ✅ |
| Difficulty scale | 3 levels (changing from 4) |
| Runtime AI | No — pure database ✅ |
| ORM | None — pg library directly ✅ |
| User accounts at launch | No — just generate + download ✅ |
| Payment provider | TBD (Stripe likely) |
| DACH content ratio | ~20-30% DACH-specific in pipeline output |
