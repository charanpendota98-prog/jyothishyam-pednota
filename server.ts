import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  calculateChart,
  calculateSynastryComparison,
  type BirthInput,
  type ZodiacTradition,
} from './src/engine/ephemeris.ts';
import {
  retrieveClassicalPassagesForChart,
  buildCitedScholarlySynthesis,
  CLASSICAL_CORPUS,
} from './src/engine/classicalCorpus.ts';
import {
  TELUGU_RASIS,
  TELUGU_PLANETS,
  generateTeluguSampoornaJathakam,
} from './src/engine/teluguJathakam.ts';
import {
  computeDayPanchanga,
  getMonthCalendar,
  getYearOverview,
  upcomingFestivals,
  resolveHinduEra,
  type GeoContext,
} from './src/engine/hinduCalendarEngine.ts';
import { computeGocharaReport } from './src/engine/gocharaVedhaEngine.ts';
import { GRANTHAS, GRANTHA_DOMAINS } from './src/engine/classicalSources.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Pre-populated Astrologer Workspace Client Profiles (Telugu & International)
const savedProfiles: BirthInput[] = [
  {
    id: 'charan-telugu-jathakam',
    name: 'చరణ్ పెందోట (Charan Pendota)',
    date: '1998-05-14',
    time: '08:45',
    lat: 17.3850,
    lng: 78.4867,
    tzOffsetHours: 5.5,
    city: 'హైదరాబాద్ (Hyderabad)',
    country: 'తెలంగాణ, భారతదేశం',
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
    notes: 'సంపూర్ణ తెలుగు జాతక చక్రం — ద్వాదశ భావ ఫలితాలు, వింశోత్తరి దశా-అంతర్దశలు, మరియు రాజయోగ పరిశీలన.',
  },
  {
    id: 'srinivas-visakhapatnam',
    name: 'డా. శ్రీనివాస రావు (Dr. Srinivasa Rao)',
    date: '1991-11-08',
    time: '06:42',
    lat: 17.6868,
    lng: 83.2185,
    tzOffsetHours: 5.5,
    city: 'విశాఖపట్నం (Visakhapatnam)',
    country: 'ఆంధ్రప్రదేశ్, భారతదేశం',
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
    notes: 'దశాంశ (D10) ఉద్యోగ-రాజయోగ పరిశీలన మరియు గురు-శని అంతర్దశ విశ్లేషణ.',
  },
  {
    id: 'lakshmi-vijayawada',
    name: 'శ్రీమతి లక్ష్మీ ప్రసన్న (Smt. Lakshmi Prasanna)',
    date: '1995-08-14',
    time: '09:30',
    lat: 16.5062,
    lng: 80.6480,
    tzOffsetHours: 5.5,
    city: 'ఎన్టీఆర్ జిల్లా - విజయవాడ (NTR District)',
    country: 'ఆంధ్రప్రదేశ్, భారతదేశం',
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
    notes: 'నవాంశ (D9) వివాహ పొందిక, అష్టకూట గుణ నిర్ణయం మరియు శుక్ర మహాదశ ఫలితాలు.',
  },
  {
    id: 'swami-vivekananda-archive',
    name: 'స్వామి వివేకానంద (Swami Vivekananda)',
    date: '1863-01-12',
    time: '06:33',
    lat: 22.5726,
    lng: 88.3639,
    tzOffsetHours: 5.5,
    city: 'కోల్‌కతా (Kolkata)',
    country: 'భారతదేశం',
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
    notes: 'ధనుర్లగ్న ఆదర్శ జాతక చక్రం — హంస మహాపురుష యోగం & రాజయోగ ప్రమాణం.',
  },
];

/* ==================================================================== *
 *  Panchanga / calendar / gochara / sources API
 *
 *  All of these are pure functions of (date, lat, lng, tz, ayanamsa), so the
 *  endpoints validate their inputs strictly and answer deterministically.
 * ==================================================================== */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseGeo(body: any): { geo: GeoContext; mode: 'lahiri' | 'raman' | 'kp' | 'true_citra' } {
  const lat = Number(body?.lat ?? 17.385);
  const lng = Number(body?.lng ?? 78.4867);
  const tzOffsetHours = Number(body?.tzOffsetHours ?? 5.5);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error('lat must be between -90 and 90');
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error('lng must be between -180 and 180');
  if (!Number.isFinite(tzOffsetHours) || tzOffsetHours < -12 || tzOffsetHours > 14)
    throw new Error('tzOffsetHours must be between -12 and 14');
  const allowed = ['lahiri', 'raman', 'kp', 'true_citra'] as const;
  const mode = (allowed as readonly string[]).includes(body?.ayanamsa) ? body.ayanamsa : 'lahiri';
  return {
    geo: { lat, lng, tzOffsetHours, placeName: String(body?.placeName ?? body?.city ?? '') || '—' },
    mode: mode as (typeof allowed)[number],
  };
}

/** Full panchanga for one civil day. `GET /api/panchanga?date=2026-10-22&lat=..&lng=..&tz=5.5` */
app.get('/api/panchanga', (req, res) => {
  try {
    const date = String(req.query.date ?? '').trim();
    if (!ISO_DATE_RE.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    const { geo, mode } = parseGeo(req.query);
    const day = computeDayPanchanga(date, { ...geo, placeName: String(req.query.placeName ?? geo.placeName) }, {
      siderealMode: mode,
    });
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(day);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to compute panchanga' });
  }
});

/** Same input, POST body (for long place names / clients that avoid query strings). */
app.post('/api/panchanga', (req, res) => {
  try {
    const date = String(req.body?.date ?? '').trim();
    if (!ISO_DATE_RE.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    const { geo, mode } = parseGeo(req.body);
    res.json(computeDayPanchanga(date, geo, { siderealMode: mode }));
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to compute panchanga' });
  }
});

/** Month grid. `GET /api/calendar/month?year=2026&month=10` */
app.get('/api/calendar/month', (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!Number.isInteger(year) || year < 1900 || year > 2200) return res.status(400).json({ error: 'year out of range' });
    if (!Number.isInteger(month) || month < 1 || month > 12) return res.status(400).json({ error: 'month must be 1-12' });
    const { geo, mode } = parseGeo(req.query);
    res.json({
      year,
      month,
      days: getMonthCalendar(year, month, geo, { siderealMode: mode }),
    });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to compute month' });
  }
});

/** Year overview: months, sankrantis, eclipses, festivals, era. */
app.get('/api/calendar/year', (req, res) => {
  try {
    const year = Number(req.query.year);
    if (!Number.isInteger(year) || year < 1900 || year > 2200) return res.status(400).json({ error: 'year out of range' });
    const { geo, mode } = parseGeo(req.query);
    res.json(getYearOverview(year, geo, { siderealMode: mode }));
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to compute year' });
  }
});

/** Upcoming festivals. `GET /api/festivals/upcoming?from=2026-10-22&count=12` */
app.get('/api/festivals/upcoming', (req, res) => {
  try {
    const from = String(req.query.from ?? new Date().toISOString().slice(0, 10));
    if (!ISO_DATE_RE.test(from)) return res.status(400).json({ error: 'from must be YYYY-MM-DD' });
    const count = Math.min(60, Math.max(1, Number(req.query.count ?? 12) || 12));
    const { geo, mode } = parseGeo(req.query);
    res.json({ from, count, festivals: upcomingFestivals(from, geo, { siderealMode: mode, count }) });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to list festivals' });
  }
});

/**
 * Gochara (transits from the natal Moon).
 * Accepts either a full birth `input` (moon sign derived) or an explicit
 * `moonSignIndex` (0 = Mesha) + `moonNakshatraIndex`.
 */
app.post('/api/gochara', (req, res) => {
  try {
    const body = req.body ?? {};
    let moonSignIndex: number;
    let moonNakIndex: number;
    let tz = Number(body.tzOffsetHours ?? 5.5);
    let mode: any = body.ayanamsa ?? 'lahiri';

    if (body.input) {
      const chart = calculateChart(body.input as BirthInput, body.tradition ?? 'vedic');
      const moon = chart.planets.find((p) => p.id === 'Moon');
      if (!moon) throw new Error('Moon position unavailable');
      moonSignIndex = moon.signIndex;
      moonNakIndex = Math.floor(moon.siderealLon / (360 / 27));
      tz = Number(body.input.tzOffsetHours ?? tz);
      mode = body.input.ayanamsa ?? mode;
    } else {
      moonSignIndex = Number(body.moonSignIndex);
      moonNakIndex = Number(body.moonNakshatraIndex ?? 0);
      if (!Number.isInteger(moonSignIndex) || moonSignIndex < 0 || moonSignIndex > 11)
        throw new Error('moonSignIndex must be 0-11 (0 = Mesha)');
      if (!Number.isInteger(moonNakIndex) || moonNakIndex < 0 || moonNakIndex > 26)
        throw new Error('moonNakshatraIndex must be 0-26');
    }

    const asOfISO = String(body.asOfISO ?? new Date().toISOString().slice(0, 10));
    if (!ISO_DATE_RE.test(asOfISO)) throw new Error('asOfISO must be YYYY-MM-DD');
    const report = computeGocharaReport(moonSignIndex, moonNakIndex, {
      asOfISO,
      tzOffsetHours: tz,
      siderealMode: mode,
    });
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to compute gochara' });
  }
});

/** Era / samvatsara for a date (Shaka, Vikram, Kali, samvatsara name). */
app.get('/api/era', (req, res) => {
  try {
    const date = String(req.query.date ?? '').trim();
    if (!ISO_DATE_RE.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    const { geo, mode } = parseGeo(req.query);
    res.json(resolveHinduEra(date, geo, mode));
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to resolve era' });
  }
});

/** Classical source registry — the bibliography every calculation cites. */
app.get('/api/sources', (req, res) => {
  const domain = String(req.query.domain ?? '').trim();
  const list = domain ? GRANTHAS.filter((g) => g.domain === domain) : GRANTHAS;
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.json({ count: list.length, domains: GRANTHA_DOMAINS, granthas: list });
});

// 1. Calculate Natal / Divisional Chart API
app.post('/api/chart/calculate', (req, res) => {
  try {
    const { input, tradition = 'vedic' } = req.body as {
      input: BirthInput;
      tradition?: ZodiacTradition;
    };
    const chart = calculateChart(input, tradition);
    res.json(chart);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to calculate chart' });
  }
});

// 2. Calculate Synastry & Ashta Koota API
app.post('/api/chart/synastry', (req, res) => {
  try {
    const { inputA, inputB, tradition = 'vedic' } = req.body as {
      inputA: BirthInput;
      inputB: BirthInput;
      tradition?: ZodiacTradition;
    };
    const result = calculateSynastryComparison(inputA, inputB, tradition);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to compute synastry' });
  }
});

// 3. Classical Text RAG Search API
app.post('/api/rag/search', (req, res) => {
  try {
    const { input, tradition = 'vedic', query = '' } = req.body as {
      input?: BirthInput;
      tradition?: ZodiacTradition;
      query?: string;
    };
    if (input) {
      const chart = calculateChart(input, tradition);
      const passages = retrieveClassicalPassagesForChart(chart, query);
      res.json({ passages });
    } else {
      const q = query.toLowerCase();
      const passages = CLASSICAL_CORPUS.filter(
        (p) =>
          !q ||
          p.translation.toLowerCase().includes(q) ||
          p.source.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
      res.json({ passages });
    }
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'RAG search failed' });
  }
});

// 4. Server-Side Gemini AI Structured Interpretation Endpoint (Supports Telugu & English)
app.post('/api/ai/interpret', async (req, res) => {
  const {
    input,
    inputB,
    tradition = 'vedic',
    focus = 'natal',
    lang = 'te',
  } = req.body as {
    input: BirthInput;
    inputB?: BirthInput;
    tradition?: ZodiacTradition;
    focus?: 'natal' | 'dasha' | 'panchanga' | 'synastry';
    lang?: 'te' | 'en';
  };

  try {
    const chart = calculateChart(input, tradition);
    const synastryData =
      focus === 'synastry' && inputB
        ? calculateSynastryComparison(input, inputB, tradition)
        : undefined;
    const passages = retrieveClassicalPassagesForChart(chart, focus);
    const teJathakam = generateTeluguSampoornaJathakam(chart);

    const teBaseline = {
      title: `సంపూర్ణ జ్యోతిష్య శాస్త్ర విశ్లేషణ: ${chart.input.name}`,
      executiveSummary: `జన్మ లగ్నం: ${teJathakam.janmaLagnamTe} (అధిపతి: ${teJathakam.janmaLagnaAdhipatiTe}) · జన్మ రాశి: ${teJathakam.janmaRasiTe} · జన్మ నక్షత్రం: ${teJathakam.janmaNakshatramTe} (${teJathakam.janmaPadam}వ పాదం, నామ అక్షరం: "${teJathakam.namaAksharamTe}"). ${teJathakam.currentDashaPhalamTe.mahadashaTe} — ${teJathakam.currentDashaPhalamTe.antardashaTe}.`,
      sections: [
        {
          heading: '01. లగ్న బలం, ఆత్మకారకత్వం & స్వభావ విశ్లేషణ',
          citation: 'బృహత్ పరాశర హోరా శాస్త్రం (BPHS) అధ్యాయం 3 & 24',
          body: `${teJathakam.dwadashaBhavaPhalitalu[0].predictionTe} అంతేకాక, మీ అదృష్ట రత్నం ${teJathakam.adrushtaVivaralu.ratnamTe}, ఆరాధ్య దైవం ${teJathakam.adrushtaVivaralu.ishtaDevataTe}.`,
        },
        {
          heading: '02. రాజ్య-కర్మ-ఉద్యోగ (10వ భావం) & భాగ్య (9వ భావం) ఫలితాలు',
          citation: 'ఫలదీపిక అధ్యాయం 6 · సారావళి అధ్యాయం 34',
          body: `${teJathakam.dwadashaBhavaPhalitalu[9].predictionTe} ${teJathakam.dwadashaBhavaPhalitalu[8].predictionTe}`,
        },
        {
          heading: '03. ప్రస్తుత వింశోత్తరి మహాదశ - అంతర్దశ & శాంతి పరిహారములు',
          citation: 'బృహత్ పరాశర హోరా శాస్త్రం అధ్యాయం 46–47',
          body: `${teJathakam.currentDashaPhalamTe.phalamTe} ${teJathakam.currentDashaPhalamTe.pariharamTe}`,
        },
      ],
    };

    const baseline = lang === 'te' ? teBaseline : buildCitedScholarlySynthesis(chart, focus, synastryData);

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        report: baseline,
        passages,
        engineMode: 'classical-rag-synthesis',
      });
    }

    const planetSummary = chart.planets
      .slice(0, 9)
      .map(
        (p) =>
          `${p.name} (${TELUGU_PLANETS[p.id]?.nameTe ?? p.sanskrit}): ${TELUGU_RASIS[p.signIndex].nameTe} ${p.formattedDMS}, House ${p.house}, Nakshatra ${p.nakshatra} Pada ${p.pada}, Dignity ${p.dignity}`
      )
      .join('\n');

    const activeMaha = chart.dashas.find((d) => d.isCurrent) ?? chart.dashas[0];
    const activeAntar = activeMaha.antardashas.find((a) => a.isCurrent) ?? activeMaha.antardashas[0];

    const promptText = `You are a master Vedic Jyotish Siddhanti and classical astrologer fluent in authentic scholarly Telugu (తెలుగు జ్యోతిష్య శాస్త్ర భాష).
Analyze the following calculated birth chart and produce a deeply detailed, authoritative report in ${lang === 'te' ? 'PURE TELUGU (తెలుగు భాషలో)' : 'English'} grounded in Brihat Parashara Hora Shastra (బృహత్ పరాశర హోరా శాస్త్రం), Phaladeepika (ఫలదీపిక), and Saravali (సారావళి).

Subject: ${chart.input.name} (${chart.input.city}, ${chart.input.country})
Ascendant (జన్మ లగ్నం): ${TELUGU_RASIS[chart.ascendant.signIndex].nameTe} (${chart.ascendant.signName}) ${chart.ascendant.formattedDMS}, Nakshatra ${chart.ascendant.nakshatra} Pada ${chart.ascendant.pada}
Focus Topic: ${focus.toUpperCase()}
Active Vimshottari Dasha: ${activeMaha.lord} Mahadasha / ${activeAntar.lord} Antardasha (${activeAntar.startDate} to ${activeAntar.endDate})
Detected Yogas: ${chart.vedicYogas.map((y) => `${y.name} (${y.citation})`).join('; ') || 'Kendra/Trikona Lord alignments'}

Planetary Positions:
${planetSummary}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  citation: { type: Type.STRING },
                  body: { type: Type.STRING },
                },
                required: ['heading', 'citation', 'body'],
              },
            },
          },
          required: ['title', 'executiveSummary', 'sections'],
        },
      },
    });

    const rawText = response.text?.trim();
    if (rawText) {
      const parsed = JSON.parse(rawText);
      return res.json({
        report: parsed,
        passages,
        engineMode: 'gemini-rag-synthesis',
      });
    }

    return res.json({
      report: baseline,
      passages,
      engineMode: 'classical-rag-synthesis',
    });
  } catch (err: any) {
    const chart = calculateChart(input, tradition);
    const teJathakam = generateTeluguSampoornaJathakam(chart);
    const passages = retrieveClassicalPassagesForChart(chart, focus);
    return res.json({
      report: {
        title: `సంపూర్ణ జ్యోతిష్య శాస్త్ర విశ్లేషణ: ${chart.input.name}`,
        executiveSummary: `జన్మ లగ్నం: ${teJathakam.janmaLagnamTe} · జన్మ రాశి: ${teJathakam.janmaRasiTe} · జన్మ నక్షత్రం: ${teJathakam.janmaNakshatramTe} (${teJathakam.janmaPadam}వ పాదం).`,
        sections: [
          {
            heading: '01. లగ్న & రాశి స్వభావ విశ్లేషణ',
            citation: 'బృహత్ పరాశర హోరా శాస్త్రం అధ్యాయం 24',
            body: teJathakam.dwadashaBhavaPhalitalu[0].predictionTe,
          },
          {
            heading: '02. ఉద్యోగ & భాగ్య స్థాన ఫలితాలు',
            citation: 'ఫలదీపిక అధ్యాయం 6',
            body: teJathakam.dwadashaBhavaPhalitalu[9].predictionTe,
          },
          {
            heading: '03. ప్రస్తుత దశా-అంతర్దశ ఫలితాలు',
            citation: 'బృహత్ పరాశర హోరా శాస్త్రం అధ్యాయం 46',
            body: teJathakam.currentDashaPhalamTe.phalamTe,
          },
        ],
      },
      passages,
      engineMode: 'classical-rag-synthesis',
      notice: err?.message,
    });
  }
});

// 5. Ask-the-Astrologer Interactive Consultation Chat API (Supports Telugu)
app.post('/api/ai/chat', async (req, res) => {
  const { input, tradition = 'vedic', question } = req.body as {
    input: BirthInput;
    tradition?: ZodiacTradition;
    question: string;
  };

  try {
    const chart = calculateChart(input, tradition);
    const teJathakam = generateTeluguSampoornaJathakam(chart);
    const passages = retrieveClassicalPassagesForChart(chart, question);
    const ai = getGenAIClient();

    if (!ai) {
      const fallbackReply = `${chart.input.name} గారి జాతక పరిశీలన ప్రకారం (జన్మ లగ్నం: ${teJathakam.janmaLagnamTe}, జన్మ రాశి: ${teJathakam.janmaRasiTe}, జన్మ నక్షత్రం: ${teJathakam.janmaNakshatramTe} ${teJathakam.janmaPadam}వ పాదం):

1. **ప్రస్తుత దశా కాల ఫలితం**: ${teJathakam.currentDashaPhalamTe.phalamTe}
2. **ఉద్యోగ & కర్మ స్థాన బలం (10వ భావం)**: ${teJathakam.dwadashaBhavaPhalitalu[9].predictionTe}
3. **శాంతి & ఉపాసనా పరిహారం**: ${teJathakam.currentDashaPhalamTe.pariharamTe}`;

      return res.json({
        answer: fallbackReply,
        citations: passages.slice(0, 3).map((p) => p.reference),
      });
    }

    const planetLines = chart.planets
      .slice(0, 9)
      .map(
        (p) =>
          `${p.name} (${TELUGU_PLANETS[p.id]?.nameTe ?? ''}): ${TELUGU_RASIS[p.signIndex].nameTe} ${p.formattedDMS} (House ${p.house}, ${p.nakshatra} Pada ${p.pada}, ${p.dignity})`
      )
      .join('; ');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Chart of ${chart.input.name}:
Ascendant (లగ్నం): ${teJathakam.janmaLagnamTe} (${chart.ascendant.formattedDMS})
Janma Rasi (జన్మ రాశి): ${teJathakam.janmaRasiTe}, Nakshatra: ${teJathakam.janmaNakshatramTe} Pada ${teJathakam.janmaPadam}
Planets: ${planetLines}
Current Dasha: ${teJathakam.currentDashaPhalamTe.mahadashaTe} / ${teJathakam.currentDashaPhalamTe.antardashaTe} (${teJathakam.currentDashaPhalamTe.periodRange})

User Question: ${question}

Respond in clear, scholarly TELUGU (తెలుగు భాషలో) citing specific Rasis, Bhavas, Nakshatras, Dashas, and classical texts (బృహత్ పరాశర హోరా శాస్త్రం / ఫలదీపిక) from the chart above.`,
    });

    return res.json({
      answer: response.text || teJathakam.currentDashaPhalamTe.phalamTe,
      citations: passages.slice(0, 3).map((p) => p.reference),
    });
  } catch {
    const chart = calculateChart(input, tradition);
    const teJathakam = generateTeluguSampoornaJathakam(chart);
    return res.json({
      answer: `${teJathakam.currentDashaPhalamTe.phalamTe}\n\nపరిహారం: ${teJathakam.currentDashaPhalamTe.pariharamTe}`,
      citations: ['బృహత్ పరాశర హోరా శాస్త్రం అధ్యాయం 46'],
    });
  }
});

// 6. Client Profiles CRUD API
app.get('/api/profiles', (_req, res) => {
  res.json({ profiles: savedProfiles });
});

app.post('/api/profiles', (req, res) => {
  const profile = req.body as BirthInput;
  if (!profile || !profile.name) {
    return res.status(400).json({ error: 'Profile name is required' });
  }
  const id = profile.id || `profile-${Date.now()}`;
  const existingIdx = savedProfiles.findIndex((p) => p.id === id);
  const record: BirthInput = { ...profile, id };
  if (existingIdx >= 0) {
    savedProfiles[existingIdx] = record;
  } else {
    savedProfiles.unshift(record);
  }
  res.json({ profile: record, profiles: savedProfiles });
});

app.delete('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const idx = savedProfiles.findIndex((p) => p.id === id);
  if (idx >= 0) {
    savedProfiles.splice(idx, 1);
  }
  res.json({ profiles: savedProfiles });
});

async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Allow the sandbox preview proxy host (and any host in dev) so the
        // live preview can reach the Vite middleware.
        allowedHosts: true,
        host: '0.0.0.0',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AstroSphere Observatory Server running at http://localhost:${PORT}`);
  });
}

startServer();
