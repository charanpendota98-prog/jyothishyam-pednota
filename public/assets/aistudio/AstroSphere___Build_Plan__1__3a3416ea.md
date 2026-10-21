♈

# Build an *Advanced* Astrology Platform

Architecture plan · Open source repos · Full feature set · Build roadmap

Vedic + Western AI Interpretations Swiss Ephemeris React + FastAPI Open Source

## The *Vision*

A full-stack, professional-grade astrology platform combining Western and Vedic traditions — birth charts, synastry, AI interpretations, Panchanga, and Dasha timelines — all powered by battle-tested open source engines.

React + TypeScript

SVG Chart Viewer

User Dashboard

Frontend

↓

FastAPI (Python)

Auth & Users

AI Layer

Backend

↓

Kerykeion (Western)

VedAstro (Vedic)

Swiss Ephemeris

Calc Engine

↓

PostgreSQL

Redis Cache

File Storage (PDFs)

Data Layer

🔭

### Precise Calculations

Swiss Ephemeris under the hood — the industry gold standard, accurate to sub-arc-second precision across 5,000+ years and all major bodies.

⚖️

### Western + Vedic

Tropical and sidereal zodiacs, 47+ Ayanamsa systems, multiple house systems — Placidus, Koch, Whole Sign, Lagna and more.

🤖

### AI Interpretations

RAG-powered AI reads from classical texts — BPHS, Phaladeepika — to generate cited, grounded natal and predictive interpretations.

📊

### Advanced Chart Types

Natal, synastry, composite, transit, solar return, progressions, Navamsa, Dasha timeline — fully interactive SVG output.

👤

### Astrologer Workspace

Professional client management: save profiles, generate PDF reports, write consultation notes, track Dasha periods per client.

📅

### Panchanga & Muhurta

Daily Vedic almanac — Tithi, Nakshatra, Yoga, Karana, Vara — plus auspicious timing (Muhurta) for any date and location.

## Open Source *Repos*

We build on proven, actively maintained foundations — not from scratch. Each library handles a distinct layer of the platform. These are the six to clone.

### Kerykeion

Python

The primary Western astrology engine. Generates natal, synastry, transit, composite and solar return charts as polished SVGs. Modern and Classic styles, dark theme, multilingual. Built on Swiss Ephemeris.

Birth Charts Synastry SVG Output Placidus / Koch Dark Theme AGPL-3.0

### VedAstro

Python / C#

The most comprehensive Vedic astrology open source project. 596+ calculation methods, 47 Ayanamsa systems, AI chatbot, Panchanga, Dasha periods, Kundali charts and classical text RAG search.

Vedic / Kundali 596+ Calcs AI Chatbot Panchanga Dasha MIT

### AstrologerStudio

Python + React

Professional open-source astrology workspace built on Kerykeion. Client management, AI chart interpretations, clean UI — the best full-stack reference architecture to build on top of.

Full-Stack Ref Client Mgmt AI Reports Professional UI AGPL-3.0

### Swiss Ephemeris

C / pyswisseph

The industry-standard astronomical engine used by every serious astrology platform. 8,000+ year coverage, all major bodies, asteroids, nodes. `pip install pyswisseph` wraps it for Python.

±5000 Years All Planets Asteroids GPL-2.0

### astro-chart (TS)

TypeScript

Open-source TypeScript library for generating SVG astrology charts in the browser. Handles the zodiac wheel rendering layer on the frontend for real-time, client-side chart display without a server round-trip.

SVG Charts Browser-Side TypeScript MIT

### Astrolog 8.0

C++

The veteran open source astrology application (since 1991, latest v8.0 in 2026). Reference for advanced techniques: midpoints, harmonics, Arabic Parts, solar arc directions, parallel aspects.

Midpoints Harmonics Arabic Parts GPL-3.0

## Tech *Stack*

A modern Python + TypeScript monorepo. The backend handles all calculations and serves a REST API; the frontend is a reactive SPA with real-time chart rendering and a dark cosmic UI.

Frontend

React 18 + TypeScript

Vite

Tailwind CSS

Zustand (state)

React Query

D3.js + SVG

Backend

Python 3.12+

FastAPI

Pydantic v2

SQLAlchemy

Alembic

JWT Auth

Astro Engine

Kerykeion 6.x

VedAstro Python

pyswisseph

GeoNames API

TimezoneFinder

AI Layer

Claude / GPT-4o

LangChain RAG

BPHS Text Index

pgvector

Data

PostgreSQL 16

Redis (cache)

S3 / R2 (PDFs)

Celery (tasks)

Infra

Docker Compose

GitHub Actions CI

Nginx

Railway / Render

## Full *Feature Set*

A complete professional platform covering every major feature of advanced Western and Vedic astrology software — from basic natal charts to Ashtakavarga grids and AI-generated reports.

🌟 Western Charts

- Natal (birth) chart — full planet & point list
- House systems: Placidus, Koch, Equal, Whole Sign, Campanus, Regiomontanus
- Synastry (2-person compatibility)
- Composite & Davison charts
- Transit chart overlay
- Solar Return chart
- Secondary Progressions
- Solar Arc Directions
- Interactive aspect grid

🕉️ Vedic / Jyotish

- Kundali (Rasi) — North & South Indian styles
- Navamsa D9, Drekkana D3, Dashamsha D10
- Vimshottari Dasha timeline
- Antardasha & Pratyantardasha
- Shadbala (planetary strength)
- Ashtakavarga transit grid
- 47+ Ayanamsa systems (Lahiri, KP, Raman…)
- Kundali Milan — 8-fold compatibility

📅 Panchanga & Timing

- Daily Panchanga: Tithi, Nakshatra, Yoga, Karana, Vara
- 28 Nakshatras with full qualities
- Muhurta (auspicious timing) calculator
- Rahu Kalam & Gulika Kalam
- Lunar phases & eclipses
- Planetary ingresses & retrogrades
- Predictive event timeline

🤖 AI Interpretations

- Natal chart personality report
- Synastry relationship analysis
- Classical text citations (BPHS, Phaladeepika)
- Ask-the-astrologer chat interface
- Dasha period predictions
- Muhurta recommendations
- PDF report generation & export

👤 User Platform

- User accounts with saved birth data
- Multiple chart profiles (self, family, clients)
- Astrologer client workspace
- Consultation notes & history
- Chart sharing & export
- Daily horoscope feed
- Public REST API for developers

⚙️ Advanced Techniques

- Midpoints table & midpoint trees
- Arabic Parts / Lots calculator
- Fixed stars conjunctions
- Asteroids: Chiron, Ceres, Pallas, Vesta, Juno
- Declinations & out-of-bounds planets
- Heliacal risings & settings
- Harmonic charts (3rd, 4th, 5th…)

## Build *Roadmap*

Five phases — working software at every milestone, progressively adding advanced features. Total estimated build: 8–12 weeks solo, faster with collaboration.

I

Phase 1 · Week 1–2

Core Engine + REST API

Clone & install Kerykeion + VedAstro FastAPI project scaffold Birth chart calculation endpoint SVG chart generation GeoNames city search Timezone resolution

II

Phase 2 · Week 3–4

Frontend + Auth

React + Vite setup Birth data input form Interactive chart SVG viewer User accounts (JWT) Save & load profiles PostgreSQL schema + Alembic

III

Phase 3 · Week 5–6

Vedic + Advanced Chart Types

Kundali chart (N/S Indian style) Vimshottari Dasha timeline Panchanga daily view Synastry chart Transit overlay House system selector

IV

Phase 4 · Week 7–8

AI Interpretations

Classical text indexing (BPHS) pgvector RAG search Natal report generation AI chat interface Synastry analysis report PDF export

V

Phase 5 · Week 9–12

Advanced Features + Production

Solar Return & Progressions Divisional charts D9, D10… Ashtakavarga grid Asteroids & fixed stars Public REST API Docker Compose deployment

✓ Ready to build

### Where do we start?

Tell me: **Western-only, Vedic-only, or both?**\
And do you want to start with cloning the repos and setting up the backend engine, or jump straight into the full project scaffold?