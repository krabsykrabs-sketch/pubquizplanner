# Claude Code Instructions — PubQuizPlanner

## How to use this document

Feed this entire file to Claude Code at the start of your session:
```
cat CLAUDE_CODE_INSTRUCTIONS.md | claude
```

---

## Project Overview

**PubQuizPlanner.com** — a web-based pub quiz generator for the German market. Users configure a quiz (rounds, categories, difficulty), preview and swap questions, then download an HTML slide presentation + PDF answer sheets.

**German-first.** UI, content, and SEO pages in German. English ready via next-intl v4.

**No AI at runtime.** Curated PostgreSQL question database + configurator + HTML/PDF template engine. Zero API calls per quiz. AI only in admin CMS for batch-generating candidate questions.

---

## Domains & Infrastructure

| Item | Value |
|------|-------|
| Main domain | pubquizplanner.com |
| Typo redirect | pubquizplaner.com |
| Server | Hetzner VPS 46.225.177.175 (Ubuntu 24.04) |
| Deployment | Coolify v4.0.0-beta.463 |
| GitHub | https://github.com/krabsykrabs-sketch/pubquizplanner.git |
| DB container | v4kw00cs04cgcc848csgw004 |
| Database | pubquizplanner (PostgreSQL) |

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router), TypeScript |
| Database | PostgreSQL via `pg` library (NO ORM) |
| Styling | Tailwind CSS |
| i18n | next-intl v4 (German default) |
| Output | Custom HTML (single offline file) |
| Hosting | Hetzner via Coolify |
| Admin AI | Anthropic API (claude-sonnet-4-20250514) — admin only |

---

## Database Schema

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,  -- 14 categories
    name_de VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    icon VARCHAR(10),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id),
    text_de TEXT NOT NULL,
    text_de_open TEXT,
    text_en TEXT,
    answer_de TEXT NOT NULL,
    answer_en TEXT,
    fun_fact_de TEXT,
    fun_fact_en TEXT,
    difficulty INTEGER,            -- CHANGING: 1-4 → 1-3
    round_type VARCHAR(30) DEFAULT 'standard',
    tags TEXT[],
    image_url TEXT,
    audio_url TEXT,
    wrong_answers_de TEXT[],       -- [] for open-ended
    is_current_event BOOLEAN DEFAULT false,
    current_event_week VARCHAR(10),
    is_highlight BOOLEAN DEFAULT false,  -- PENDING: special questions
    verified BOOLEAN DEFAULT false,
    times_served INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    generation_batch_id VARCHAR(100),
    verification_note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

Categories: allgemeinwissen, sport, geschichte, geographie, film-tv, musik, wissenschaft, essen-trinken, literatur, kunst-kultur, technik, popkultur, sprache, logik-mathe

---

## Project Structure

```
pubquizplanner/
├── scripts/
│   ├── generate-from-wikidata.ts
│   ├── import-opentdb.ts
│   ├── fetch-opentriviaqa.ts
│   ├── prefilter.py
│   ├── cc-pipeline-prompt.md
│   └── cc-qc-existing-prompt.md
├── data/
│   ├── opentriviaqa/            # Raw English (22 categories)
│   ├── pipeline/
│   │   ├── 1-prefiltered/
│   │   ├── 2-translated/
│   │   ├── 3-qc-checked/
│   │   ├── 4-final/             # Import-ready JSON
│   │   └── logs/
│   └── wikidata/
├── src/app/
│   ├── (admin-app)/admin/       # Dashboard, generate, review, questions, import
│   ├── (public)/[locale]/       # Landing page, generator
│   └── api/                     # Admin + public API routes
└── tsconfig.json                # scripts/ excluded from build
```

---

## Quiz Builder (4 Steps)

1. **Setup:** title, date, venue, rounds (3-8), answer placement
2. **Round config:** category, difficulty, questions per round (5/8/10), round type
3. **Preview & swap:** unlimited swaps, drag reorder
4. **Download:** HTML presentation + answer sheet PDF + cheat sheet (premium)

---

## Admin CMS

- Auth: ADMIN_PASSWORD cookie (httpOnly, 24h)
- Generate: Claude Sonnet + web search → pending
- Review: approve/reject/edit, bulk actions
- Import: JSON upload with duplicate detection
- Current events: AI + web_search, weekly

---

## Question Pipeline

1. Pre-filter (code): `python3 scripts/prefilter.py`
2. Translate (CC): `Read scripts/cc-pipeline-prompt.md`
3. QC (CC): independent fact-check
4. Import via /admin/import → pending → manual review → approve

---

## Environment Variables (Coolify)

```
DATABASE_URL=postgres://postgres:xxx@v4kw00cs04cgcc848csgw004:5432/pubquizplanner
NIXPACKS_NODE_VERSION=22
NODE_ENV=production
ADMIN_PASSWORD=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

---

## Deployment

```bash
git add -A && git commit -m "msg" && git push
# Redeploy in Coolify
```

DB migration (Coolify Terminal):
```bash
npm run db:migrate
```

---

## Constraints

1. No runtime AI — everything from database
2. Single-file HTML export — works offline
3. German-first — next-intl for i18n
4. Copyright: only PD, CC0, CC BY-SA with attribution
5. Only status='approved' questions served to users
6. scripts/ excluded from tsconfig.json

---

## Pending Tasks

### High Priority
- [ ] Finish reviewing pending questions
- [ ] Schema: difficulty 4→3, add is_highlight
- [ ] ⭐ highlight toggle in review page + algorithm (1 per 5 questions)
- [ ] QC + import Wikidata (~1,999 questions)
- [ ] Fill weak categories (Essen & Trinken, Kunst & Kultur, Technik, Sprache, Logik & Mathe)
- [ ] Impressum + Datenschutzerklärung
- [ ] Credits page with OpenTriviaQA + OpenTDB attribution
- [ ] SEO pages /de/fragen/[category]
- [ ] Sitemap, meta tags, OpenGraph

### Medium Priority
- [ ] Google Search Console + AdSense
- [ ] Premium tier (Stripe)
- [ ] Special round types
