# Tajika Varshaphala, 12-Month Forecast & Royal WhatsApp Summary Card

This plan delivers a complete **Tajika Nilakanthi Varshaphala (Annual Solar Return Horoscope) & 12-Month Forecast Engine**, accessible both as a **dedicated top-level workspace tab** and as a **chapter within the Sampoorna Jathakam & PDF Book**, alongside a **One-Page Royal Jathaka Summary Card** with instant PNG image download and WhatsApp sharing.

## User Review & Critical Decisions

> [!IMPORTANT]
> All core product choices were confirmed during Phase 1 clarification:

- **Confirmed Decision 1 (Astrological Module)**: Build the **Tajika Varshaphala (Annual Solar Return) & 12-Month Forecast** module with exact Solar Return timing, Varsha Lagna, Muntha progression, Varsheshwara (Lord of the Year), Tajika Yogas (Ithasala, Ishrafa, Kamboola, Nakta), Sahams (Punya,uestras, Karyasiddhi, Vivaha, Dhana), Mudda Annual Dasha (365-day cycle), and a month-by-month 12-Month Calendar Forecast.
- **Confirmed Decision 2 (Navigation & Print Integration)**: Expose the module in **both** a dedicated top-level navigation tab (`వార్షిక ఫలితాలు / Varshaphala`) and as an integrated chapter inside the **Sampoorna Jathakam View & Classical PDF Book / Print Settings Modal**.
- **Confirmed Decision 3 (Sharing Experience)**: Include a **One-Page Royal Summary Card (రాజముద్ర ఏక-పుట జాతక సారాంశ పత్రం)** with one-click high-resolution `.PNG` card download and formatted WhatsApp share functionality.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Tajika Varshaphala (వార్షిక జాతక ఫల దర్శిని)**: Computes the exact astronomical moment when the Sun returns to its exact natal sidereal longitude in any selected year (e.g., 2024 to 2036). Generates the Annual Kundali (Varsha Chakra), calculates the progressed **Muntha** sign and house, determines the **Varsheshwara (Year Lord)**, evaluates **Tajika Yogas** and **Sahams** (sensitive mathematical points), breaks down the 365-day **Mudda Vimshottari Dasha**, and provides a detailed **12-Month Forecast** (Career, Wealth, Family, Health, Auspicious Dates, and Cautions for each month).
  2. **One-Page Royal Summary Card (వాట్సాప్ షేరబుల్ రాజముద్ర జాతక కార్డు)**: Renders a compact, high-contrast, temple-gold & deep-indigo single-page horoscope summary card containing the South Indian Rasi & Navamsa charts, Panchanga essentials, Nama Aksharam, Current Dasha, Annual Muntha status, and Core Remedies—ready to download as a crisp `.PNG` image or share directly via WhatsApp.
- **Target Audience / Persona**: Telugu & Vedic astrology enthusiasts, families, and professional Siddhantis seeking both lifetime natal depth and actionable year-by-year / month-by-month predictions.
- **Key Value**: Bridges lifetime Parashari/Nadi destiny with immediate annual and monthly timing, while making it effortless to share a prestigious 1-page horoscope snapshot on WhatsApp.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Dedicated Varshaphala Workspace Tab**:
     - User clicks **వార్షిక ఫలితాలు (Varshaphala)** in the top bar.
     - A Year Selector bar allows switching between any year (defaulting to current year `2026`, with quick buttons for `2025`, `2026`, `2027`, `2028`, `2029`, `2030` or any custom birth-to-100 age year).
     - Displays the **Varsha Pravesha Moment** (exact date, time, weekday, Varsha Lagna, Muntha Rasi & House, and Varsheshwara), followed by the side-by-side **Natal D1 vs. Varsha Kundali**, **365-Day Mudda Dasha Timeline**, **Tajika Yogas & Sahams Table**, and the **12-Month Interactive Forecast Grid**.
  2. **Sampoorna Jathakam & PDF Book Integration**:
     - Appears as a selectable chapter in `SampoornaJathakamView` and as a toggleable section in `PrintSettingsModal` so users can include or isolate the Annual Varshaphala report when exporting to PDF.
  3. **One-Page Royal WhatsApp Summary Modal / Drawer**:
     - Accessible from both the main Jathakam header and the Varshaphala view via a **"1-పేజీ రాజముద్ర కార్డు & WhatsApp షేర్"** button.
     - Lets the user preview the ornate 1-page card, download it as a high-DPI `.PNG` image, or click **"WhatsApp లో షేర్ చేయండి"** to share the formatted Telugu horoscope summary.
- **Visual Identity & Theme**:
  - **60-30-10 Palette Discipline**:
    - *60% Primary Canvas*: Deep cosmic obsidian (`#090C18`) for interactive studio views; traditional parchment ivory (`#FFFEFA` / `#FBF6E9`) for classical print/PDF pages.
    - *30% Structural Surfaces*: Midnight slate (`#0F1326` / `#141932`) with crisp 1px borders (`border-[#C9A96E]/35`).
    - *10% Calibrated Accents*: Temple Gold (`#C9A96E`) for primary headers and sacred seals, Celestial Teal (`#5BBFB5`) for auspicious metrics, and Vermilion Crimson (`#7A1818` / `#D47B7B`) for classical print borders and caution alerts.
  - **Typography & Hierarchy**:
    - Display headers in classical serif/Telugu display weight; all astronomical degrees, dates, dasha intervals, and longitudes in `font-mono-tabular` (`tabular-nums`) to prevent layout jitter.
    - Unboxed inline metadata separated by `·` typographic dividers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Exact Sidereal Solar Return Solver**
  - *Chosen Approach*: Use an iterative Newton-Raphson / binary search over `Astronomy.SunPosition` and Lahiri Ayanamsa around the native's birthday in the target year to pinpoint the Solar Return (`Varsha Pravesha`) within 1 second of arc, then compute the full `CompleteChartResult` for that exact timestamp and birth location.
  - *Why*: Authentic Tajika Varshaphala requires the true Varsha Lagna at the exact moment the Sun reaches its natal sidereal longitude, rather than a rough midnight approximation.
- **Decision 2: Client-Side High-DPI PNG Rendering + Web Share / WhatsApp Protocol**
  - *Chosen Approach*: Render the One-Page Royal Summary Card in a dedicated fixed-aspect container and capture it at `scale: 2.5` using `html2canvas` for instant `.PNG` download, paired with `navigator.share` (with image file support on mobile) and a direct `https://wa.me/?text=...` fallback containing a richly formatted Telugu Jathaka summary.
  - *Why*: Works reliably inside iframe and mobile/desktop browsers without requiring external server-side image rendering.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Main Studio Shell)                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  SampoornaJathakam   │  │  TajikaVarshaphala   │  │ RoyalWhatsApp    │  │
│  │  View + PDF Book     │  │  Dedicated Tab View  │  │ SummaryCardModal │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
└─────────────┼─────────────────────────┼───────────────────────┼────────────┘
              │                         │                       │
              ▼                         ▼                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                 Tajika Varshaphala & 12-Month Engine                       │
│  • Solar Return Solver (exact sidereal Sun return timestamp)               │
│  • Muntha & Munthesh Calculator ((Janma Lagna + Age) % 12)                 │
│  • Varsheshwara & Panchavargiya Bala Evaluator                             │
│  • Tajika Yogas (Ithasala, Ishrafa, Kamboola) & 7 Sahams Calculator        │
│  • 365-Day Mudda Vimshottari Dasha & 12-Month Telugu Forecast Generator    │
└────────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping

- **Target Year State (`selectedYear: number`)**: Changing the year in `TajikaVarshaphalaView` immediately recalculates the Solar Return timestamp, Varsha Kundali, Muntha house, Mudda Dasha periods, and 12-month cards.
- **Month Filter / Inspector (`selectedMonthIdx: number | null`)**: Clicking any of the 12 monthly cards expands its detailed planetary transit triggers, lucky dates, financial/career score, and monthly Vedic remedy.
- **One-Page Royal Card Modal (`isRoyalCardOpen: boolean`)**: Opens the interactive preview modal with working handlers for `.PNG` download (`handleDownloadPngCard`), copy text (`handleCopySummaryText`), and WhatsApp share (`handleShareWhatsApp`).
