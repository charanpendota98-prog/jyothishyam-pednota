import React, { useMemo, useRef, useState } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Layers,
  ZoomIn,
  ZoomOut,
  Flame,
  Award,
  BarChart3,
  TrendingUp,
  Info,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import {
  ZODIAC_SIGNS,
  type CompleteChartResult,
  type PlanetPosition,
} from '../engine/ephemeris.ts';
import {
  TELUGU_PLANETS,
  TELUGU_RASIS,
  type AppLanguage,
} from '../engine/teluguJathakam.ts';
import { generateUpayaPariharaReport } from '../engine/upayaPariharaEngine.ts';
import {
  generateAstroVisionMasterReport,
  generateTransitIntensityHeatmap,
  type DashaTimelineMarkerCategory,
  type TransitIntensityHeatmapSlice,
} from '../engine/astroVisionAndTransitEngine.ts';
import { generateSiddhantaAdvancedAppendices } from '../engine/siddhantaAdvancedAppendices.ts';
import { NorthIndianKundaliSvg, SouthIndianKundaliSvg } from './ChartsSvg.tsx';
import { JaiminiCharaDashaVisualizer } from './JaiminiCharaDashaVisualizer.tsx';

interface DashaVargaViewProps {
  chart: CompleteChartResult;
  selectedPlanetId: string | null;
  onSelectPlanet: (p: PlanetPosition) => void;
  lang?: AppLanguage;
}

const PLANET_TIMELINE_STYLE: Record<
  string,
  { bg: string; border: string; accent: string; badge: string; bar: string }
> = {
  Sun: {
    bg: 'bg-[#E07A5F]/15',
    border: 'border-[#E07A5F]/55',
    accent: 'text-[#E07A5F]',
    badge: 'bg-[#E07A5F]/25 text-[#F4A261]',
    bar: 'bg-[#E07A5F]',
  },
  Moon: {
    bg: 'bg-[#8ECAE6]/15',
    border: 'border-[#8ECAE6]/55',
    accent: 'text-[#8ECAE6]',
    badge: 'bg-[#8ECAE6]/25 text-[#BDE0FE]',
    bar: 'bg-[#8ECAE6]',
  },
  Mars: {
    bg: 'bg-[#D47B7B]/15',
    border: 'border-[#D47B7B]/55',
    accent: 'text-[#D47B7B]',
    badge: 'bg-[#D47B7B]/25 text-[#F28482]',
    bar: 'bg-[#D47B7B]',
  },
  Mercury: {
    bg: 'bg-[#5BBFB5]/15',
    border: 'border-[#5BBFB5]/55',
    accent: 'text-[#5BBFB5]',
    badge: 'bg-[#5BBFB5]/25 text-[#5BBFB5]',
    bar: 'bg-[#5BBFB5]',
  },
  Jupiter: {
    bg: 'bg-[#C9A96E]/20',
    border: 'border-[#C9A96E]/65',
    accent: 'text-[#C9A96E]',
    badge: 'bg-[#C9A96E]/25 text-[#E9C46A]',
    bar: 'bg-[#C9A96E]',
  },
  Venus: {
    bg: 'bg-[#E5989B]/15',
    border: 'border-[#E5989B]/55',
    accent: 'text-[#E5989B]',
    badge: 'bg-[#E5989B]/25 text-[#FFB5A7]',
    bar: 'bg-[#E5989B]',
  },
  Saturn: {
    bg: 'bg-[#7F8CAA]/15',
    border: 'border-[#7F8CAA]/55',
    accent: 'text-[#98A6C4]',
    badge: 'bg-[#7F8CAA]/25 text-[#B8C4E0]',
    bar: 'bg-[#7F8CAA]',
  },
  Rahu: {
    bg: 'bg-[#9B8FD4]/15',
    border: 'border-[#9B8FD4]/55',
    accent: 'text-[#9B8FD4]',
    badge: 'bg-[#9B8FD4]/25 text-[#BDB2FF]',
    bar: 'bg-[#9B8FD4]',
  },
  Ketu: {
    bg: 'bg-[#E0A96D]/15',
    border: 'border-[#E0A96D]/55',
    accent: 'text-[#E0A96D]',
    badge: 'bg-[#E0A96D]/25 text-[#E0A96D]',
    bar: 'bg-[#E0A96D]',
  },
};

const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const HOUSE_MEANING_SHORT_TE: Record<number, string> = {
  1: '1వ భావం (లగ్నం — ఆరోగ్యం, కీర్తి, ఆత్మబలం)',
  2: '2వ భావం (ధన-కుటుంబ-వాక్ స్థానం)',
  3: '3వ భావం (పరాక్రమ-సహోదర-ప్రయాణ స్థానం)',
  4: '4వ భావం (సుఖ-మాతృ-గృహ-వాహన స్థానం)',
  5: '5వ భావం (పూర్వపుణ్య-సంతాన-మేధా స్థానం)',
  6: '6వ భావం (రోగ-రుణ-శత్రు-పోటీ విజయం)',
  7: '7వ భావం (కళత్ర-వివాహ-భాగస్వామ్య స్థానం)',
  8: '8వ భావం (ఆయుర్దాయం-ఆకస్మిక మార్పులు)',
  9: '9వ భావం (భాగ్య-ధర్మ-గురు-దైవకృప స్థానం)',
  10: '10వ భావం (రాజ్య-ఉద్యోగ-కర్మ-అధికార స్థానం)',
  11: '11వ భావం (లాభ-ఆదాయ-అభీష్ట సిద్ధి స్థానం)',
  12: '12వ భావం (వ్యయ-విదేశీయాన-మోక్ష స్థానం)',
};

function parseDateMs(dateStr: string): number {
  const t = Date.parse(dateStr);
  return Number.isNaN(t) ? Date.now() : t;
}

function daysBetween(startStr: string, endStr: string): number {
  const diff = parseDateMs(endStr) - parseDateMs(startStr);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function getMutualHouseDistance(sign1: number, sign2: number): number {
  return ((sign2 - sign1 + 12) % 12) + 1;
}

function getSambandhaVerdictTe(dist: number): {
  titleTe: string;
  nature: 'auspicious' | 'challenging' | 'neutral';
  descTe: string;
} {
  if (dist === 1) {
    return {
      titleTe: 'ఏకరాశి యుతి సంబంధం (1/1 Conjunction)',
      nature: 'auspicious',
      descTe: 'మహాదశ మరియు భుక్తి నాథులు ఒకే రాశిలో ఉన్నందున ఈ కాలంలో ఆ రాశి-భావ ఫలితాలు అత్యంత తీవ్రంగా, వేగంగా అనుభవానికి వస్తాయి.',
    };
  }
  if (dist === 5 || dist === 9) {
    return {
      titleTe: 'నవపంచమ రాజయోగ సంబంధం (5/9 Trine)',
      nature: 'auspicious',
      descTe: 'మహాదశ నాథుని నుండి భుక్తి నాథుడు త్రికోణ (5/9) స్థానంలో ఉన్నందున అదృష్ట వృద్ధి, ధన లాభం, శుభకార్యాలు మరియు దైవ సహాయం లభిస్తాయి.',
    };
  }
  if (dist === 4 || dist === 10 || dist === 7) {
    return {
      titleTe: 'కేంద్ర బల సంబంధం (4/7/10 Kendra)',
      nature: 'auspicious',
      descTe: 'మహాదశ నాథుని నుండి భుక్తి నాథుడు కేంద్ర స్థానంలో ఉన్నందున వృత్తి-ఉద్యోగాలలో స్థిరత్వం, నూతన బాధ్యతలు మరియు గృహ-వాహన అభివృద్ధి కలుగుతాయి.',
    };
  }
  if (dist === 3 || dist === 11) {
    return {
      titleTe: 'త్రి-ఏకాదశ లాభ సంబంధం (3/11 Growth)',
      nature: 'auspicious',
      descTe: 'స్వయం కృషి, నూతన ఒప్పందాలు, మిత్రుల సహకారం మరియు ఆదాయ వృద్ధికి అనుకూలమైన కాలం.',
    };
  }
  if (dist === 6 || dist === 8) {
    return {
      titleTe: 'షష్టాష్టక స్థితి (6/8 Shad-Ashtaka — జాగ్రత్త అవసరం)',
      nature: 'challenging',
      descTe: 'పరాశర హోరా శాస్త్రం ప్రకారం మహాదశ నాథునికి భుక్తి నాథుడు 6 లేదా 8వ స్థానంలో ఉన్నందున పనులలో ఆలస్యం, ఆరోగ్య/మానసిక ఒత్తిడి ఉండవచ్చు. పరిహార జపం-దానం తప్పనిసరి.',
    };
  }
  return {
    titleTe: 'ద్వి-ద్వాదశ స్థితి (2/12 Dasa-Bhukti — వ్యయ/మార్పుల కాలం)',
    nature: 'neutral',
    descTe: 'మహాదశ నాథుని నుండి భుక్తి నాథుడు 2 లేదా 12వ స్థానంలో ఉన్నందున శుభ ఖర్చులు, స్థానచలనం లేదా కుటుంబ బాధ్యతల నిమిత్తం ధన వ్యయం కలుగుతుంది.',
  };
}

export const DashaVargaView: React.FC<DashaVargaViewProps> = ({
  chart,
  selectedPlanetId,
  onSelectPlanet,
  lang = 'te',
}) => {
  const currentMahaIdx = Math.max(
    0,
    chart.dashas.findIndex((d) => d.isCurrent)
  );
  const [selectedMahaIdx, setSelectedMahaIdx] = useState<number>(currentMahaIdx);
  const [selectedAntarIdx, setSelectedAntarIdx] = useState<number>(() => {
    const m = chart.dashas[currentMahaIdx];
    const aIdx = m?.antardashas.findIndex((a) => a.isCurrent) ?? 0;
    return Math.max(0, aIdx);
  });
  const [selectedPratyantarIdx, setSelectedPratyantarIdx] = useState<number>(() => {
    const m = chart.dashas[currentMahaIdx];
    const a = m?.antardashas.find((ant) => ant.isCurrent) ?? m?.antardashas[0];
    const pIdx = a?.pratyantardashas.findIndex((p) => p.isCurrent) ?? 0;
    return Math.max(0, pIdx);
  });

  const [kundaliStyle, setKundaliStyle] = useState<'north' | 'south'>('south');
  const [primaryVarga, setPrimaryVarga] = useState<'D1' | 'D9' | 'D10' | 'D3'>('D9');
  const [dashaSystemMode, setDashaSystemMode] = useState<
    'both' | 'vimshottari' | 'jaimini_chara'
  >('both');
  const [isTimelineZoomed, setIsTimelineZoomed] = useState<boolean>(true);
  const [markerCategoryFilter, setMarkerCategoryFilter] = useState<
    'all' | DashaTimelineMarkerCategory
  >('all');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [showSadeSatiPhaseTable, setShowSadeSatiPhaseTable] = useState<boolean>(false);

  const mahaScrollRef = useRef<HTMLDivElement>(null);
  const bhuktiScrollRef = useRef<HTMLDivElement>(null);

  const upayaReport = useMemo(() => generateUpayaPariharaReport(chart), [chart]);
  const astroVisionReport = useMemo(
    () => generateAstroVisionMasterReport(chart),
    [chart]
  );

  const filteredEventMarkers = useMemo(() => {
    if (markerCategoryFilter === 'all') {
      return astroVisionReport.timelineEventMarkers;
    }
    return astroVisionReport.timelineEventMarkers.filter(
      (m) => m.category === markerCategoryFilter
    );
  }, [astroVisionReport.timelineEventMarkers, markerCategoryFilter]);

  const activeEventMarker = useMemo(() => {
    if (selectedMarkerId) {
      const found = astroVisionReport.timelineEventMarkers.find(
        (m) => m.id === selectedMarkerId
      );
      if (found) return found;
    }
    return (
      filteredEventMarkers.find((m) => m.isCurrentNow) ??
      filteredEventMarkers[0] ??
      astroVisionReport.timelineEventMarkers[0]
    );
  }, [
    selectedMarkerId,
    filteredEventMarkers,
    astroVisionReport.timelineEventMarkers,
  ]);

  const activeMaha = chart.dashas[selectedMahaIdx] ?? chart.dashas[0];
  const activeAntar =
    activeMaha.antardashas[selectedAntarIdx] ?? activeMaha.antardashas[0];
  const activePratyantar =
    activeAntar.pratyantardashas[selectedPratyantarIdx] ??
    activeAntar.pratyantardashas[0];

  const vargottamaPlanets = chart.planets.filter((p) => p.d1Sign === p.d9Sign);
  const tePlanetName = (eng: string) => TELUGU_PLANETS[eng]?.nameTe ?? eng;
  const getPlanetGlyph = (pid: string) => chart.planets.find((p) => p.id === pid)?.glyph ?? '●';

  // Birth timestamp & current age calculations for Timeline Visualization
  const birthMs = useMemo(() => parseDateMs(chart.input.date), [chart.input.date]);
  const nowMs = Date.now();
  const currentAgeYears = useMemo(
    () => Math.max(0, (nowMs - birthMs) / (1000 * 60 * 60 * 24 * 365.25)),
    [nowMs, birthMs]
  );

  // Transit Intensity Heatmap calculation across 0-90 years lifetime
  const transitHeatmap: TransitIntensityHeatmapSlice[] = useMemo(
    () => generateTransitIntensityHeatmap(chart),
    [chart]
  );
  const [selectedHeatmapAge, setSelectedHeatmapAge] = useState<number | null>(null);
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState<boolean>(true);

  // Shadbala Six-Fold Strength Dashboard States & Calculations
  const [activeShadbalaTab, setActiveShadbalaTab] = useState<
    'dashboard' | 'sub_balas' | 'ishta_kashta' | 'table'
  >('dashboard');
  const [activeSubBalaMetric, setActiveSubBalaMetric] = useState<
    'sthanaBala' | 'digBala' | 'kalaBala' | 'cheshtaBala' | 'naisargikaBala' | 'drikBala'
  >('sthanaBala');
  const [selectedShadbalaPlanetId, setSelectedShadbalaPlanetId] = useState<string>('Sun');

  const siddhantaAppendices = useMemo(
    () => generateSiddhantaAdvancedAppendices(chart),
    [chart]
  );
  const sortedShadbala = useMemo(
    () => [...chart.shadbala].sort((a, b) => b.totalVirupas - a.totalVirupas),
    [chart.shadbala]
  );
  const topShadbalaPlanet = sortedShadbala[0];
  const lowestShadbalaPlanet = sortedShadbala[sortedShadbala.length - 1];
  const averageVirupas = useMemo(
    () =>
      Math.round(
        chart.shadbala.reduce((acc, s) => acc + s.totalVirupas, 0) /
          Math.max(1, chart.shadbala.length)
      ),
    [chart.shadbala]
  );

  const activeHeatmapSlice = useMemo(() => {
    const targetAge = selectedHeatmapAge ?? Math.round(currentAgeYears);
    return (
      transitHeatmap.find((s) => s.age === targetAge) ??
      transitHeatmap.find((s) => s.age === Math.round(currentAgeYears)) ??
      transitHeatmap[0]
    );
  }, [transitHeatmap, selectedHeatmapAge, currentAgeYears]);

  const mahaTimelineBlocks = useMemo(() => {
    let cumulativeYears = 0;
    return chart.dashas.map((maha, idx) => {
      const startMs = parseDateMs(maha.startDate);
      const endMs = parseDateMs(maha.endDate);
      const actualYears = Math.max(
        0.5,
        (endMs - startMs) / (1000 * 60 * 60 * 24 * 365.25)
      );
      const startAge = Math.max(0, cumulativeYears);
      const endAge = startAge + actualYears;
      cumulativeYears = endAge;

      let progressPct = 0;
      if (maha.isCurrent && endMs > startMs) {
        progressPct = Math.min(
          100,
          Math.max(2, Math.round(((nowMs - startMs) / (endMs - startMs)) * 100))
        );
      } else if (nowMs >= endMs) {
        progressPct = 100;
      }

      const planetPos = chart.planets.find((p) => p.id === maha.lord);
      return {
        idx,
        maha,
        actualYears: Number(actualYears.toFixed(1)),
        startAge: Math.round(startAge),
        endAge: Math.round(endAge),
        progressPct,
        planetPos,
      };
    });
  }, [chart.dashas, chart.planets, nowMs]);

  const totalTimelineYears = useMemo(
    () =>
      Math.max(
        1,
        mahaTimelineBlocks.reduce((acc, b) => acc + b.actualYears, 0)
      ),
    [mahaTimelineBlocks]
  );

  const handleJumpToCurrentNow = () => {
    const mIdx = Math.max(0, chart.dashas.findIndex((d) => d.isCurrent));
    const m = chart.dashas[mIdx];
    const aIdx = Math.max(0, m?.antardashas.findIndex((a) => a.isCurrent) ?? 0);
    const a = m?.antardashas[aIdx];
    const pIdx = Math.max(
      0,
      a?.pratyantardashas.findIndex((p) => p.isCurrent) ?? 0
    );
    setSelectedMahaIdx(mIdx);
    setSelectedAntarIdx(aIdx);
    setSelectedPratyantarIdx(pIdx);
  };

  const scrollTrack = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: 'left' | 'right'
  ) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir === 'left' ? -340 : 340,
      behavior: 'smooth',
    });
  };

  // Deep synthesis of selected Mahadasha + Bhukti + Pratyantardasha
  const selectedSynthesis = useMemo(() => {
    const mahaPos = chart.planets.find((p) => p.id === activeMaha.lord);
    const antarPos = chart.planets.find((p) => p.id === activeAntar.lord);
    const pratPos = chart.planets.find((p) => p.id === activePratyantar?.lord);

    const dist =
      mahaPos && antarPos
        ? getMutualHouseDistance(mahaPos.signIndex, antarPos.signIndex)
        : 1;
    const sambandha = getSambandhaVerdictTe(dist);

    const mahaRemedy = upayaReport.maleficInfluences.find(
      (m) => m.planetId === activeMaha.lord
    );
    const antarRemedy = upayaReport.maleficInfluences.find(
      (m) => m.planetId === activeAntar.lord
    );
    const pratRemedy = upayaReport.maleficInfluences.find(
      (m) => m.planetId === activePratyantar?.lord
    );

    const mahaHouseMeaning = HOUSE_MEANING_SHORT_TE[mahaPos?.house ?? 1] ?? '';
    const antarHouseMeaning = HOUSE_MEANING_SHORT_TE[antarPos?.house ?? 1] ?? '';
    const pratHouseMeaning = HOUSE_MEANING_SHORT_TE[pratPos?.house ?? 1] ?? '';

    return {
      mahaPos,
      antarPos,
      pratPos,
      dist,
      sambandha,
      mahaRemedy,
      antarRemedy,
      pratRemedy,
      mahaHouseMeaning,
      antarHouseMeaning,
      pratHouseMeaning,
    };
  }, [activeMaha, activeAntar, activePratyantar, chart.planets, upayaReport]);

  return (
    <div className="space-y-10">
      {/* Top Dasha Methodology Switcher (Vimshottari Nakshatra Dasha vs Jaimini Chara Rasi Dasha) */}
      <div className="bg-gradient-to-r from-[#141932] via-[#0F1326] to-[#141932] border border-[#C9A96E]/50 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[#C9A96E] font-bold">
            దశా విధాన ఎంపిక (Predictive Dasha Methodology Switcher)
          </div>
          <p className="text-xs text-[#EDE8E0]/80 mt-0.5">
            పరాశర మహర్షి <strong>వింశోత్తరి నక్షత్ర దశ (120 సం.)</strong> మరియు జైమిని మహర్షి <strong>చర రాశి దశ (Rasi Dasha)</strong> — రెండు పద్ధతులను విడివిడిగా లేదా ఒకేసారి పోల్చి పరిశీలించండి:
          </p>
        </div>

        <div className="flex flex-wrap items-center bg-[#090C18] p-1 rounded-lg border border-white/15 gap-1">
          <button
            onClick={() => setDashaSystemMode('both')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              dashaSystemMode === 'both'
                ? 'bg-[#C9A96E] text-[#090C18] shadow'
                : 'text-[#EDE8E0]/75 hover:text-[#EDE8E0]'
            }`}
          >
            ఉభయ దశలు (Both Vimshottari + Jaimini Chara)
          </button>
          <button
            onClick={() => setDashaSystemMode('vimshottari')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              dashaSystemMode === 'vimshottari'
                ? 'bg-[#C9A96E] text-[#090C18] shadow'
                : 'text-[#EDE8E0]/75 hover:text-[#EDE8E0]'
            }`}
          >
            వింశోత్తరి నక్షత్ర దశ (Vimshottari)
          </button>
          <button
            onClick={() => setDashaSystemMode('jaimini_chara')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              dashaSystemMode === 'jaimini_chara'
                ? 'bg-[#5BBFB5] text-[#090C18] shadow'
                : 'text-[#EDE8E0]/75 hover:text-[#EDE8E0]'
            }`}
          >
            జైమిని చర రాశి దశ (Jaimini Chara Dasha)
          </button>
        </div>
      </div>

      {/* Section 1A: Interactive Jaimini Chara Dasha Calculator & Timeline Viewer */}
      {(dashaSystemMode === 'both' || dashaSystemMode === 'jaimini_chara') && (
        <JaiminiCharaDashaVisualizer chart={chart} />
      )}

      {/* Section 1B: Interactive 120-Year Vimshottari Dasha Lifetime Visual Timeline */}
      {(dashaSystemMode === 'both' || dashaSystemMode === 'vimshottari') && (
      <section className="bg-[#0F1326] border border-[#C9A96E]/45 rounded-xl p-6 md:p-8 shadow-2xl space-y-7">
        {/* Top Header & Controls */}
        <div className="pb-5 border-b border-white/10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A96E]" />
              వింశోత్తరి మహాదశ · భుక్తి · అంతర (ప్రత్యంతర్దశ) దృశ్యమాన కాలరేఖ (Interactive Lifetime Timeline)
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[#EDE8E0] mt-1">
              120-సంవత్సరముల జీవిత దశా-భుక్తి-అంతర పరివర్తన కాలచక్రం
            </h2>
            <p className="text-xs text-[#EDE8E0]/70 mt-1">
              జన్మ నక్షత్రం: <strong className="text-[#5BBFB5]">{chart.panchanga.nakshatra.name} ({chart.panchanga.nakshatra.pada}వ పాదం)</strong> · ప్రస్తుత వయస్సు:{' '}
              <strong className="text-[#C9A96E]">{currentAgeYears.toFixed(1)} సంవత్సరములు</strong>. క్రింది కాలరేఖపై స్క్రోల్ చేసి ఏ మహాదశ, భుక్తి లేదా అంతర కాలాన్నైనా క్లిక్ చేసి పూర్తి ఫలితాన్ని చూడండి.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleJumpToCurrentNow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5BBFB5] text-[#090C18] text-xs font-bold hover:bg-[#6fd0c6] transition-colors cursor-pointer shadow-md"
            >
              <Crosshair className="w-3.5 h-3.5" />
              ప్రస్తుత కాలానికి వెళ్ళండి (Jump to Now)
            </button>

            <button
              onClick={() => setIsTimelineZoomed(!isTimelineZoomed)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#090C18] border border-white/15 text-[#EDE8E0] text-xs font-semibold hover:border-[#C9A96E]/50 transition-colors cursor-pointer"
            >
              {isTimelineZoomed ? (
                <>
                  <ZoomOut className="w-3.5 h-3.5 text-[#C9A96E]" />
                  120-ఏళ్ల పూర్తి వీక్షణ (Fit All)
                </>
              ) : (
                <>
                  <ZoomIn className="w-3.5 h-3.5 text-[#C9A96E]" />
                  విస్తృత స్క్రోల్ వీక్షణ (Zoom Scroll)
                </>
              )}
            </button>
          </div>
        </div>

        {/* TIER 1: LIFETIME 9-MAHADASHA VISUAL TIMELINE TRACK (AGE 0 -> 120) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-[#C9A96E] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C9A96E]" />
              స్థాయి 1 · 120-ఏళ్ల నవ మహాదశల జీవిత కాలరేఖ (Lifetime Mahadasha Timeline — వయస్సు 0 నుండి 120 సం. వరకు)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#EDE8E0]/55 mr-1">కదిలించండి (Scroll):</span>
              <button
                onClick={() => scrollTrack(mahaScrollRef, 'left')}
                className="p-1.5 rounded bg-[#090C18] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTrack(mahaScrollRef, 'right')}
                className="p-1.5 rounded bg-[#090C18] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Proportional Mahadasha Visual Ribbon */}
          <div
            ref={mahaScrollRef}
            className="overflow-x-auto pb-3 pt-1 select-none"
          >
            <div
              className={`flex items-stretch gap-2 ${
                isTimelineZoomed ? 'min-w-[1320px]' : 'w-full min-w-[780px]'
              }`}
            >
              {mahaTimelineBlocks.map((block) => {
                const { idx, maha, actualYears, startAge, endAge, progressPct, planetPos } =
                  block;
                const isSelected = idx === selectedMahaIdx;
                const style =
                  PLANET_TIMELINE_STYLE[maha.lord] ?? PLANET_TIMELINE_STYLE.Jupiter;
                const widthPct = Math.max(
                  7,
                  (actualYears / totalTimelineYears) * 100
                );

                return (
                  <button
                    key={maha.lord}
                    onClick={() => {
                      setSelectedMahaIdx(idx);
                      const defaultAntar = maha.isCurrent
                        ? Math.max(
                            0,
                            maha.antardashas.findIndex((a) => a.isCurrent)
                          )
                        : 0;
                      setSelectedAntarIdx(defaultAntar);
                      setSelectedPratyantarIdx(0);
                    }}
                    style={{ width: `${widthPct}%` }}
                    className={`relative text-left rounded-xl p-3.5 border transition-all flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? `${style.bg} border-2 border-[#C9A96E] shadow-lg ring-2 ring-[#C9A96E]/25`
                        : `${style.bg} ${style.border} hover:border-[#C9A96E]/60`
                    }`}
                  >
                    {/* Top Age Milestone Pill */}
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono-tabular">
                        <span className="px-1.5 py-0.5 rounded bg-[#090C18]/80 text-[#EDE8E0]/85 font-semibold">
                          వయస్సు {startAge}–{endAge} సం.
                        </span>
                        {maha.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded bg-[#5BBFB5] text-[#090C18] font-bold animate-pulse">
                            ఇప్పుడు ({progressPct}%)
                          </span>
                        )}
                      </div>

                      <div className={`text-sm font-bold mt-2 ${style.accent} truncate`}>
                        {tePlanetName(maha.lord)}
                      </div>

                      <div className="text-[11px] text-[#EDE8E0]/75 mt-0.5">
                        {planetPos
                          ? `${planetPos.house}వ భావం (${TELUGU_RASIS[planetPos.signIndex]?.nameTe.split(' ')[0]})`
                          : `${maha.years} సం.`}
                      </div>
                    </div>

                    {/* Visual Progress Bar & Date Span */}
                    <div className="mt-3 pt-2 border-t border-white/10 space-y-1.5">
                      <div className="w-full h-1.5 bg-[#090C18] rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full ${
                            maha.isCurrent ? 'bg-[#5BBFB5]' : style.bar
                          }`}
                          style={{
                            width: `${
                              maha.isCurrent
                                ? progressPct
                                : progressPct === 100
                                  ? 100
                                  : 30
                            }%`,
                            opacity: progressPct === 100 && !maha.isCurrent ? 0.45 : 1,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#EDE8E0]/65">
                        <span>{maha.startDate.slice(0, 4)}</span>
                        <span>→</span>
                        <span>{maha.endDate.slice(0, 4)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CRITICAL LIFE EVENTS, SADE SATI (7.5 YRS) & MAJOR PLANETARY TRANSITS VISUAL OVERLAY TRACK */}
          <div className="bg-[#090C18]/95 border border-[#C9A96E]/40 rounded-xl p-4 sm:p-5 space-y-4 mt-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <div className="text-xs font-bold text-[#C9A96E] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                  స్థాయి 1B · ఏలినాటి శని (Sade Sati 7.5 సం.), అష్టమ శని, గురు/శని పునరాగమనం & ప్రధాన జీవిత ఘట్టాల దృశ్యమాన సూచికలు (Life Events & Transit Markers)
                </div>
                <p className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
                  క్రింది గోచార / జీవిత ఘట్టం బ్యాడ్జ్‌పై క్లిక్ చేస్తే ఆ సమయానికి నడిచే ఖచ్చితమైన మహాదశ-భుక్తి మరియు దశా-గోచార సంగమ ఫలితం తెరుచుకుంటుంది:
                </p>
              </div>

              {/* Filter Pills for Event Categories */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0F1326] p-1 rounded-lg border border-white/10">
                {(
                  [
                    { id: 'all', labelTe: 'అన్ని ఘట్టాలు (All)' },
                    { id: 'sade_sati', labelTe: 'ఏలినాటి శని (7.5 సం.)' },
                    { id: 'kantaka_shani', labelTe: 'అష్టమ / అర్ధాష్టమ శని' },
                    { id: 'planetary_return', labelTe: 'గురు & శని పునరాగమనం' },
                    { id: 'life_milestone', labelTe: 'వివాహ / రాజయోగ / గృహ ఘట్టాలు' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setMarkerCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      markerCategoryFilter === cat.id
                        ? 'bg-[#C9A96E] text-[#090C18] font-bold'
                        : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                    }`}
                  >
                    {cat.labelTe}
                  </button>
                ))}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TRANSIT INTENSITY HEATMAP OVERLAY TRACK (గోచార తీవ్రతా ఉష్ణమాపకం) */}
            {/* ========================================================================= */}
            <div className="bg-[#0D1124] border border-[#C9A96E]/30 rounded-xl p-4 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#C9A96E]" />
                  <span className="text-xs font-bold text-[#EDE8E0]">
                    గోచార తీవ్రతా ఉష్ణమాపకం · దశా నాథునిపై శని/గురు గోచార ప్రభావ రేఖ (Transit Intensity Heatmap Overlay)
                  </span>
                </div>

                {/* Heatmap Legend */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono-tabular">
                  <span className="flex items-center gap-1 text-[#EDE8E0]/70">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    గురు అమృత దృష్టి (Growth)
                  </span>
                  <span className="flex items-center gap-1 text-[#EDE8E0]/70">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    అనుకూల గోచారం
                  </span>
                  <span className="flex items-center gap-1 text-[#EDE8E0]/70">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    శని కర్మ ఒత్తిడి (Friction)
                  </span>
                  <span className="flex items-center gap-1 text-[#EDE8E0]/70">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                    కర్మ సంధికాలం
                  </span>
                  <span className="flex items-center gap-1 text-[#EDE8E0]/70">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
                    సమతుల్యత
                  </span>
                </div>
              </div>

              {/* Continuous Overlaid Heatmap Bar (0 to 90 Years) */}
              <div className="space-y-1.5">
                <div className="relative h-7 w-full bg-[#090C18] rounded-lg overflow-hidden flex items-stretch border border-white/15 select-none">
                  {transitHeatmap.map((slice) => {
                    const isSelected = activeHeatmapSlice.age === slice.age;
                    return (
                      <button
                        key={`heatmap-slice-${slice.age}`}
                        onClick={() => setSelectedHeatmapAge(slice.age)}
                        style={{
                          backgroundColor: slice.intensityColor,
                          width: `${100 / transitHeatmap.length}%`,
                        }}
                        title={`వయస్సు ${slice.age} సం. (${slice.calendarYear}): ${slice.intensityLevelTe} · స్కోర్: ${slice.compositeIntensityScore}%`}
                        className={`h-full transition-transform hover:opacity-100 hover:scale-y-110 cursor-pointer relative ${
                          isSelected ? 'ring-2 ring-white z-10 scale-y-110 shadow-md' : 'opacity-85'
                        }`}
                      />
                    );
                  })}

                  {/* Current Age Indicator Needle */}
                  <div
                    style={{
                      left: `${Math.min(99, Math.max(1, (currentAgeYears / 90) * 100))}%`,
                    }}
                    className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none shadow-[0_0_6px_#ffffff]"
                    title={`ప్రస్తుత వయస్సు: ${currentAgeYears.toFixed(1)} సం.`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#EDE8E0]/50 px-1">
                  <span>జననం (0 సం.)</span>
                  <span>15 సం.</span>
                  <span>30 సం.</span>
                  <span>45 సం.</span>
                  <span>60 సం.</span>
                  <span>75 సం.</span>
                  <span>90 సం.</span>
                </div>
              </div>

              {/* Interactive Predictive Accuracy Matrix for Selected Heatmap Age */}
              <div className="bg-[#090C18]/90 border border-white/10 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[#C9A96E] font-mono-tabular text-xs font-bold border border-[#C9A96E]/40">
                      వయస్సు {activeHeatmapSlice.age} సం. (సంవత్సరం {activeHeatmapSlice.calendarYear})
                    </span>
                    <span className="text-xs font-bold text-[#EDE8E0]">
                      నడిచే దశాధిపతి:{' '}
                      <strong className="text-[#C9A96E]">
                        {activeHeatmapSlice.activeMahaLordTe} మహాదశ
                      </strong>{' '}
                      ({activeHeatmapSlice.activeBhuktiLordTe} భుక్తి)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      style={{ color: activeHeatmapSlice.intensityColor }}
                      className="text-xs font-bold font-mono-tabular"
                    >
                      {activeHeatmapSlice.intensityLevelTe} ({activeHeatmapSlice.compositeIntensityScore}%)
                    </span>
                    <button
                      onClick={() => setSelectedHeatmapAge(Math.round(currentAgeYears))}
                      className="text-[10px] underline text-[#5BBFB5] hover:text-[#EDE8E0] cursor-pointer"
                    >
                      ప్రస్తుత వయస్సుకి తిరిగొచ్చు (Current Age)
                    </button>
                  </div>
                </div>

                {/* 3-Column Transit Impact Breakdown on Dasha Lord */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {/* Saturn on Dasha Lord */}
                  <div className="p-3 rounded-lg bg-[#141932]/70 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#98A6C4]">గోచార శని స్థితి</span>
                      <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/50">
                        {activeHeatmapSlice.saturnTransitImpact.transitSignTe} రాశి
                      </span>
                    </div>
                    <div className="text-[#C9A96E] font-semibold text-[11px]">
                      {activeHeatmapSlice.saturnTransitImpact.aspectOrHouseOnLord}
                    </div>
                    <p className="text-[10.5px] text-[#EDE8E0]/75 leading-relaxed pt-1">
                      {activeHeatmapSlice.saturnTransitImpact.descriptionTe}
                    </p>
                  </div>

                  {/* Jupiter on Dasha Lord */}
                  <div className="p-3 rounded-lg bg-[#141932]/70 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#E9C46A]">గోచార బృహస్పతి స్థితి</span>
                      <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/50">
                        {activeHeatmapSlice.jupiterTransitImpact.transitSignTe} రాశి
                      </span>
                    </div>
                    <div className="text-[#10B981] font-semibold text-[11px]">
                      {activeHeatmapSlice.jupiterTransitImpact.aspectOrHouseOnLord}
                    </div>
                    <p className="text-[10.5px] text-[#EDE8E0]/75 leading-relaxed pt-1">
                      {activeHeatmapSlice.jupiterTransitImpact.descriptionTe}
                    </p>
                  </div>

                  {/* Rahu/Ketu & Synthesis */}
                  <div className="p-3 rounded-lg bg-[#141932]/70 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#BDB2FF]">రాహు-కేతువుల అక్షం</span>
                      <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/50">
                        {activeHeatmapSlice.rahuKetuTransitImpact.transitSignTe} రాశి
                      </span>
                    </div>
                    <div className="text-[#EDE8E0]/90 font-semibold text-[11px]">
                      {activeHeatmapSlice.rahuKetuTransitImpact.isOverLord
                        ? 'దశానాథుని మీదుగా అక్షం (Karmic Shift)'
                        : 'సహజ సంచార స్థితి'}
                    </div>
                    <p className="text-[10.5px] text-[#EDE8E0]/75 leading-relaxed pt-1">
                      {activeHeatmapSlice.rahuKetuTransitImpact.descriptionTe}
                    </p>
                  </div>
                </div>

                {/* Synthesis & Focus Tip */}
                <div className="p-2.5 rounded-lg bg-[#C9A96E]/10 border border-[#C9A96E]/25 text-xs text-[#EDE8E0]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-[#C9A96E]">దశా-గోచార ప్రవచన సమన్వయం: </strong>
                    {activeHeatmapSlice.predictiveAccuracyVerdictTe}
                  </div>
                  <div className="text-[11px] text-[#5BBFB5] shrink-0 font-medium">
                    🎯 సిఫార్సు: {activeHeatmapSlice.recommendedFocusTe}
                  </div>
                </div>
              </div>
            </div>

            {/* Proportional 0–100 Year Visual Axis with Sade Sati Bands & Event Pins */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#EDE8E0]/55 px-1">
                <span>జననం (0 సం.)</span>
                <span>20 సం.</span>
                <span>40 సం.</span>
                <span>60 సం. (షష్టిపూర్తి)</span>
                <span>80 సం.</span>
                <span>100+ సం.</span>
              </div>

              {/* Visual Track Bar with Sade Sati Spans + Current Age Needle */}
              <div className="relative h-9 w-full bg-[#0F1326] border border-white/15 rounded-lg overflow-hidden">
                {/* Current Age Vertical Marker Needle */}
                <div
                  style={{
                    left: `${Math.min(99, Math.max(1, (currentAgeYears / 100) * 100))}%`,
                  }}
                  className="absolute top-0 bottom-0 w-0.5 bg-[#5BBFB5] z-20 shadow-[0_0_8px_#5BBFB5]"
                  title={`ప్రస్తుత వయస్సు: ${currentAgeYears.toFixed(1)} సం.`}
                />

                {filteredEventMarkers.map((ev) => {
                  const leftPct = Math.min(96, Math.max(0, (ev.startAge / 100) * 100));
                  const spanPct = Math.max(
                    2.2,
                    Math.min(100 - leftPct, ((ev.endAge - ev.startAge) / 100) * 100)
                  );
                  const isSel = activeEventMarker?.id === ev.id;

                  const bgStyle =
                    ev.category === 'sade_sati'
                      ? 'bg-[#D47B7B]/40 border-[#D47B7B] text-[#FFD6D6]'
                      : ev.category === 'kantaka_shani'
                        ? 'bg-[#E07A5F]/35 border-[#E07A5F] text-[#FFE3D8]'
                        : ev.category === 'planetary_return'
                          ? 'bg-[#5BBFB5]/35 border-[#5BBFB5] text-[#D8FFF9]'
                          : 'bg-[#C9A96E]/40 border-[#C9A96E] text-[#FFF3D6]';

                  return (
                    <button
                      key={ev.id}
                      onClick={() => {
                        setSelectedMarkerId(ev.id);
                        const mIdx = chart.dashas.findIndex(
                          (d) => d.lord === ev.overlappingMahaLordId
                        );
                        if (mIdx >= 0) {
                          setSelectedMahaIdx(mIdx);
                        }
                      }}
                      style={{ left: `${leftPct}%`, width: `${spanPct}%` }}
                      title={`${ev.titleTe} (${ev.startAge}–${ev.endAge} సం.)`}
                      className={`absolute top-1 bottom-1 rounded border text-[9px] font-bold px-1 truncate flex items-center justify-center transition-all cursor-pointer ${bgStyle} ${
                        isSel ? 'ring-2 ring-white z-10 scale-y-105' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      {ev.startAge}–{ev.endAge}y
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Scrollable Event Marker Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredEventMarkers.map((ev) => {
                const isSel = activeEventMarker?.id === ev.id;
                const badgeClass =
                  ev.category === 'sade_sati'
                    ? 'bg-[#D47B7B]/20 text-[#D47B7B] border-[#D47B7B]/40'
                    : ev.category === 'kantaka_shani'
                      ? 'bg-[#E07A5F]/20 text-[#E07A5F] border-[#E07A5F]/40'
                      : ev.category === 'planetary_return'
                        ? 'bg-[#5BBFB5]/20 text-[#5BBFB5] border-[#5BBFB5]/40'
                        : 'bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/40';

                return (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setSelectedMarkerId(ev.id);
                      const mIdx = chart.dashas.findIndex(
                        (d) => d.lord === ev.overlappingMahaLordId
                      );
                      if (mIdx >= 0) {
                        setSelectedMahaIdx(mIdx);
                      }
                    }}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#141932] border-2 border-[#C9A96E] shadow-md'
                        : 'bg-[#0F1326]/90 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}
                      >
                        {ev.badgeTe}
                      </span>
                      {ev.isCurrentNow && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#5BBFB5] text-[#090C18]">
                          ప్రస్తుతం
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#EDE8E0] mt-1.5 line-clamp-1">
                      {ev.titleTe}
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[#C9A96E] mt-0.5">
                      వయస్సు {ev.startAge}–{ev.endAge} సం. ({ev.startDateStr} → {ev.endDateStr})
                    </div>
                    <div className="text-[10px] text-[#EDE8E0]/65 mt-1 truncate">
                      దశ: <strong className="text-[#5BBFB5]">{ev.overlappingMahaLordTe}</strong> / {ev.overlappingBhuktiLordTe} భుక్తి
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Event Marker Deep Dasha-Gochara Sangama Analysis Card */}
            {activeEventMarker && (
              <div className="p-4 rounded-xl bg-[#141932]/95 border border-[#C9A96E]/50 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#C9A96E] font-bold">
                      ఎంచుకున్న దశా-గోచార సంగమ ఘట్ట విశ్లేషణ (Selected Transit / Life Event Confluence)
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-[#EDE8E0] mt-0.5">
                      {activeEventMarker.titleTe} —{' '}
                      <span className="text-[#5BBFB5]">
                        వయస్సు {activeEventMarker.startAge} నుండి {activeEventMarker.endAge} సం. ({activeEventMarker.startDateStr} → {activeEventMarker.endDateStr})
                      </span>
                    </h4>
                  </div>

                  <button
                    onClick={() => setShowSadeSatiPhaseTable(!showSadeSatiPhaseTable)}
                    className="px-3 py-1.5 rounded-lg bg-[#090C18] border border-[#C9A96E]/45 text-[11px] font-semibold text-[#C9A96E] hover:bg-white/10 cursor-pointer"
                  >
                    {showSadeSatiPhaseTable
                      ? 'ఏలినాటి శని 9-పాదాల పట్టిక దాచండి'
                      : 'ఏలినాటి శని 3-విడతల (9 పాదాల) పూర్తి పట్టిక చూడండి'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#090C18]/80 border border-white/10">
                    <div className="text-[10px] text-[#EDE8E0]/55 font-semibold">
                      గోచార స్థితి & సమకాలీన దశ
                    </div>
                    <div className="font-bold text-[#EDE8E0] mt-1">
                      {activeEventMarker.subtitleTe}
                    </div>
                    <div className="text-[#C9A96E] font-semibold mt-1">
                      నడిచే దశ: {activeEventMarker.overlappingMahaLordTe} మహాదశ — {activeEventMarker.overlappingBhuktiLordTe} భుక్తి
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090C18]/80 border border-white/10">
                    <div className="text-[10px] text-[#5BBFB5] font-semibold">
                      దశా-గోచార సంగమ ఫలితం (Dasha + Transit Verdict)
                    </div>
                    <p className="text-[#EDE8E0]/85 mt-1 leading-relaxed">
                      {activeEventMarker.dashaGocharaSangamaTe}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090C18]/80 border border-[#C9A96E]/30">
                    <div className="text-[10px] text-[#C9A96E] font-semibold">
                      శాస్త్రోక్త పరిహారం (Recommended Remedy)
                    </div>
                    <p className="text-[#EDE8E0]/85 mt-1 leading-relaxed">
                      {activeEventMarker.pariharaTe}
                    </p>
                  </div>
                </div>

                {/* Collapsible Full 3-Cycle (9-Phase) Sade Sati Table */}
                {showSadeSatiPhaseTable && (
                  <div className="pt-3 border-t border-white/10 overflow-x-auto">
                    <div className="text-xs font-bold text-[#C9A96E] mb-2">
                      ఏలినాటి శని 3 విడతల (ఆరంభ, మధ్య/జన్మ, అంత్య పాదాల) జీవితకాల పట్టిక (Complete Lifetime Sade Sati Table):
                    </div>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#090C18] text-[#C9A96E] border-b border-white/15">
                          <th className="py-2 px-2.5">విడత (Cycle)</th>
                          <th className="py-2 px-2.5">ఏలినాటి శని పాదం</th>
                          <th className="py-2 px-2.5">శని సంచార రాశి</th>
                          <th className="py-2 px-2.5">ప్రారంభం → ముగింపు</th>
                          <th className="py-2 px-2.5">వయస్సు</th>
                          <th className="py-2 px-2.5">నడిచే మహాదశ - భుక్తి</th>
                          <th className="py-2 px-2.5">ప్రభావ భాగం & పరిహారం</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {astroVisionReport.sadeSatiPhases.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={
                              row.isCurrent
                                ? 'bg-[#D47B7B]/20 font-semibold'
                                : 'bg-[#090C18]/60'
                            }
                          >
                            <td className="py-2 px-2.5 font-bold text-[#C9A96E]">
                              {row.cycleNumber}వ విడత
                            </td>
                            <td className="py-2 px-2.5 text-[#EDE8E0]">
                              {row.phaseNameTe}
                            </td>
                            <td className="py-2 px-2.5 text-[#5BBFB5] font-semibold">
                              {row.transitRasiTe} ({row.houseFromMoon}వ ఇంట)
                            </td>
                            <td className="py-2 px-2.5 font-mono-tabular text-[#EDE8E0]">
                              {row.startDateStr} → {row.endDateStr}
                            </td>
                            <td className="py-2 px-2.5 font-mono-tabular text-[#C9A96E]">
                              {row.startAge} – {row.endAge}
                            </td>
                            <td className="py-2 px-2.5 text-[#9B8FD4]">
                              {row.overlappingDashaTe}
                            </td>
                            <td className="py-2 px-2.5 text-[#EDE8E0]/80">
                              <strong className="text-[#D47B7B]">{row.bodyPartTe}:</strong>{' '}
                              {row.phalaAndPariharaTe}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TIER 2: SELECTED MAHADASHA -> 9 BHUKTI (ANTARDASHA) VISUAL TIMELINE BAR */}
        <div className="bg-[#090C18]/90 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#5BBFB5]">
                స్థాయి 2 · {tePlanetName(activeMaha.lord)} మహాదశలోని 9 అంతర్దశల (భుక్తుల) దృశ్యమాన కాలరేఖ ({activeMaha.startDate} నుండి {activeMaha.endDate})
              </div>
              <p className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
                ప్రతి భుక్తి నిడివి గ్రహ దశా సంవత్సరాల నిష్పత్తి ప్రకారం చూపబడింది. ఏ భుక్తి పైనైనా క్లిక్ చేసి దానిలోని 9 ప్రత్యంతర్దశలను (Antaras) చూడండి:
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollTrack(bhuktiScrollRef, 'left')}
                className="p-1.5 rounded bg-[#0F1326] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => scrollTrack(bhuktiScrollRef, 'right')}
                className="p-1.5 rounded bg-[#0F1326] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Proportional 9-Bhukti Segmented Visual Ribbon */}
          <div ref={bhuktiScrollRef} className="overflow-x-auto pb-2">
            <div
              className={`flex items-stretch gap-2 ${
                isTimelineZoomed ? 'min-w-[1180px]' : 'w-full min-w-[740px]'
              }`}
            >
              {activeMaha.antardashas.map((antar, aIdx) => {
                const isSelected = aIdx === selectedAntarIdx;
                const style =
                  PLANET_TIMELINE_STYLE[antar.lord] ?? PLANET_TIMELINE_STYLE.Mercury;
                const weight = VIMSHOTTARI_YEARS[antar.lord] ?? 10;
                const widthPct = Math.max(8, (weight / 120) * 100);

                const startAge = Math.max(
                  0,
                  (parseDateMs(antar.startDate) - birthMs) /
                    (1000 * 60 * 60 * 24 * 365.25)
                );
                const endAge = Math.max(
                  startAge,
                  (parseDateMs(antar.endDate) - birthMs) /
                    (1000 * 60 * 60 * 24 * 365.25)
                );

                return (
                  <button
                    key={antar.lord}
                    onClick={() => {
                      setSelectedAntarIdx(aIdx);
                      const defaultPrat = antar.isCurrent
                        ? Math.max(
                            0,
                            antar.pratyantardashas.findIndex((p) => p.isCurrent)
                          )
                        : 0;
                      setSelectedPratyantarIdx(defaultPrat);
                    }}
                    style={{ width: `${widthPct}%` }}
                    className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `${style.bg} border-2 border-[#5BBFB5] shadow-md ring-2 ring-[#5BBFB5]/25`
                        : `bg-[#0F1326]/90 border-white/10 hover:border-white/30`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono-tabular">
                        <span className="text-[#EDE8E0]/60">
                          {antar.durationMonths} నె.
                        </span>
                        {antar.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded bg-[#5BBFB5] text-[#090C18] font-bold">
                            ప్రస్తుత భుక్తి
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-bold mt-1 ${style.accent} truncate`}>
                        {tePlanetName(antar.lord).split(' ')[0]} భుక్తి
                      </div>
                      <div className="text-[10px] text-[#EDE8E0]/55 mt-0.5 font-mono-tabular">
                        వయస్సు {startAge.toFixed(1)}–{endAge.toFixed(1)}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-white/10 text-[10px] font-mono-tabular text-[#EDE8E0]/75 space-y-0.5">
                      <div>{antar.startDate}</div>
                      <div className="text-[#C9A96E]">→ {antar.endDate}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* TIER 3: SELECTED BHUKTI -> 9 ANTARA (PRATYANTARDASHA) VISUAL TRANSITION TIMELINE */}
        <div className="bg-[#090C18]/90 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#C9A96E]">
                స్థాయి 3 · {tePlanetName(activeMaha.lord)} మహాదశ — {tePlanetName(activeAntar.lord)} భుక్తిలోని 9 ప్రత్యంతర్దశల (Antara) సూక్ష్మ కాలరేఖ
              </div>
              <p className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
                {activeAntar.startDate} నుండి {activeAntar.endDate} వరకు గల 9 అంతర (Pratyantardasha) పరివర్తన తేదీలు & రోజుల సంఖ్య:
              </p>
            </div>
            <span className="text-xs font-mono-tabular text-[#5BBFB5] font-semibold">
              ఎంచుకున్న అంతర: {tePlanetName(activePratyantar?.lord ?? '')} ({activePratyantar?.startDate} → {activePratyantar?.endDate})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
            {activeAntar.pratyantardashas.map((prat, pIdx) => {
              const isSelected = pIdx === selectedPratyantarIdx;
              const style =
                PLANET_TIMELINE_STYLE[prat.lord] ?? PLANET_TIMELINE_STYLE.Sun;
              const durationDays = daysBetween(prat.startDate, prat.endDate);

              return (
                <button
                  key={prat.lord}
                  onClick={() => setSelectedPratyantarIdx(pIdx)}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${style.bg} border-2 border-[#C9A96E] shadow-md`
                      : prat.isCurrent
                        ? 'bg-[#5BBFB5]/15 border-[#5BBFB5]'
                        : 'bg-[#0F1326] border-white/10 hover:border-white/25'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono-tabular">
                      <span className="text-[#EDE8E0]/60">{durationDays} రోజులు</span>
                      {prat.isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-[#5BBFB5] text-[#090C18] font-bold">
                          నేడు
                        </span>
                      )}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${style.accent}`}>
                      {tePlanetName(prat.lord).split(' ')[0]} అంతర
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] font-mono-tabular text-[#EDE8E0]/75">
                    <div>{prat.startDate}</div>
                    <div className="text-[#5BBFB5]">→ {prat.endDate}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DEEP SHASTRIC DASHA-BHUKTI-ANTARA SYNTHESIS & REMEDY INSPECTOR */}
        <div className="bg-gradient-to-r from-[#141932] to-[#090C18] border border-[#C9A96E]/45 rounded-xl p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#C9A96E]" />
              <h3 className="text-lg font-bold text-[#EDE8E0]">
                ఎంచుకున్న కాలచక్ర లోతైన విశ్లేషణ: {tePlanetName(activeMaha.lord)} మహాదశ ·{' '}
                {tePlanetName(activeAntar.lord)} భుక్తి · {tePlanetName(activePratyantar?.lord ?? '')} అంతర
              </h3>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                selectedSynthesis.sambandha.nature === 'auspicious'
                  ? 'bg-[#5BBFB5]/20 text-[#5BBFB5] border border-[#5BBFB5]/40'
                  : selectedSynthesis.sambandha.nature === 'challenging'
                    ? 'bg-[#D47B7B]/20 text-[#D47B7B] border border-[#D47B7B]/40'
                    : 'bg-[#E0A96D]/20 text-[#E0A96D] border border-[#E0A96D]/40'
              }`}
            >
              {selectedSynthesis.sambandha.nature === 'auspicious' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              {selectedSynthesis.sambandha.titleTe}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 3 Active Lords Natal Positions */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#0F1326] border border-white/10">
                <div className="text-[#C9A96E] font-bold">
                  1. మహాదశ నాథుడు: {tePlanetName(activeMaha.lord)}
                </div>
                <div className="text-[#EDE8E0]/85 mt-0.5">
                  కుండలి స్థితి: {selectedSynthesis.mahaHouseMeaning} ·{' '}
                  {selectedSynthesis.mahaRemedy?.functionalRoleTe}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0F1326] border border-white/10">
                <div className="text-[#5BBFB5] font-bold">
                  2. అంతర్దశ (భుక్తి) నాథుడు: {tePlanetName(activeAntar.lord)}
                </div>
                <div className="text-[#EDE8E0]/85 mt-0.5">
                  కుండలి స్థితి: {selectedSynthesis.antarHouseMeaning} (మహాదశ నాథుని నుండి{' '}
                  {selectedSynthesis.dist}వ స్థానం)
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0F1326] border border-white/10">
                <div className="text-[#E0A96D] font-bold">
                  3. ప్రత్యంతర్దశ (అంతర) నాథుడు: {tePlanetName(activePratyantar?.lord ?? '')}
                </div>
                <div className="text-[#EDE8E0]/85 mt-0.5">
                  కుండలి స్థితి: {selectedSynthesis.pratHouseMeaning} ({activePratyantar?.startDate} →{' '}
                  {activePratyantar?.endDate})
                </div>
              </div>
            </div>

            {/* Prediction & Specific Period Remedy */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3 bg-[#0F1326]/90 border border-white/10 rounded-lg p-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#C9A96E]">
                  దశా-భుక్తి-అంతర సంయుక్త ఫలిత నిర్ధారణ (BPHS Dasha Phala):
                </div>
                <p className="text-xs text-[#EDE8E0]/90 leading-relaxed">
                  {selectedSynthesis.sambandha.descTe} ఈ సమయంలో{' '}
                  {selectedSynthesis.mahaPos?.house ?? 1}వ భావం,{' '}
                  {selectedSynthesis.antarPos?.house ?? 1}వ భావం మరియు{' '}
                  {selectedSynthesis.pratPos?.house ?? 1}వ భావ కారకత్వాలు ప్రధానంగా ఉత్తేజితమవుతాయి.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#141932] border border-[#C9A96E]/35 space-y-1.5 text-xs">
                <div className="font-bold text-[#5BBFB5] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#C9A96E]" />
                  ఈ దశా-భుక్తి-అంతర కాలానికి ప్రత్యేక వైదిక పరిహారం (Period Upaya):
                </div>
                <p className="text-[#EDE8E0]/90 leading-relaxed">
                  • <strong>మంత్ర జపం:</strong> ప్రతిరోజూ ఉదయం{' '}
                  <span className="text-[#C9A96E] font-semibold">
                    "{selectedSynthesis.antarRemedy?.mantraUpaya.beejaMantraTe}"
                  </span>{' '}
                  మరియు{' '}
                  <span className="text-[#5BBFB5] font-semibold">
                    "{selectedSynthesis.pratRemedy?.mantraUpaya.beejaMantraTe}"
                  </span>{' '}
                  27 సార్లు జపించండి.
                  <br />• <strong>దాన ధర్మం & ఆలయ సేవ:</strong>{' '}
                  {selectedSynthesis.antarRemedy?.danaUpaya.dayAndHoraTe} నాడు{' '}
                  <strong>{selectedSynthesis.antarRemedy?.danaUpaya.danaItemsTe}</strong> దానం చేసి,{' '}
                  {selectedSynthesis.antarRemedy?.templeAndSevaUpaya.kshetraNameTe} దర్శనం చేయడం వలన ఈ కాలంలో సర్వ కార్యాలు నిర్విఘ్నంగా ఫలిస్తాయి.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Section 2: Divisional Kundali (Varga) Side-by-Side Comparison */}
      <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-display font-bold text-[#EDE8E0]">
              షోడశవర్గ కుండలి చక్రములు · <span className="text-[#C9A96E]">రాశి (D1) మరియు {primaryVarga} పోలిక</span>
            </h2>
            <p className="text-xs text-[#EDE8E0]/65 mt-1">
              రాశి చక్రం (D1) తో పాటు వివాహ-ధర్మ పరిశీలనకు నవాంశ (D9), ఉద్యోగ-అధికార పరిశీలనకు దశాంశ (D10), మరియు పరాక్రమానికి ద్రేక్కాణ (D3) చక్రములను పరిశీలించండి.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#090C18] p-1 rounded-lg border border-white/10">
              {(['D9', 'D10', 'D3'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setPrimaryVarga(v)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    primaryVarga === v
                      ? 'bg-[#C9A96E] text-[#090C18] font-semibold'
                      : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                  }`}
                >
                  {v === 'D9' ? 'D9 నవాంశ చక్రం' : v === 'D10' ? 'D10 దశాంశ చక్రం' : 'D3 ద్రేక్కాణ చక్రం'}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#090C18] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setKundaliStyle('south')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  kundaliStyle === 'south'
                    ? 'bg-white/15 text-[#EDE8E0]'
                    : 'text-[#EDE8E0]/60 hover:text-[#EDE8E0]'
                }`}
              >
                దక్షిణ భారత (తెలుగు)
              </button>
              <button
                onClick={() => setKundaliStyle('north')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  kundaliStyle === 'north'
                    ? 'bg-white/15 text-[#EDE8E0]'
                    : 'text-[#EDE8E0]/60 hover:text-[#EDE8E0]'
                }`}
              >
                ఉత్తర భారత
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 items-center">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#EDE8E0]">
                01. జన్మ రాశి చక్రం (D1 — Rasi Kundali)
              </span>
              <span className="text-xs font-mono-tabular text-[#C9A96E]">
                లగ్నం: {TELUGU_RASIS[chart.ascendant.signIndex].nameTe} · {chart.ascendant.formattedDMS}
              </span>
            </div>
            {kundaliStyle === 'north' ? (
              <NorthIndianKundaliSvg
                chart={chart}
                division="D1"
                selectedPlanetId={selectedPlanetId}
                onSelectPlanet={onSelectPlanet}
                lang={lang}
              />
            ) : (
              <SouthIndianKundaliSvg
                chart={chart}
                division="D1"
                selectedPlanetId={selectedPlanetId}
                onSelectPlanet={onSelectPlanet}
                lang={lang}
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#C9A96E]">
                02.{' '}
                {primaryVarga === 'D9'
                  ? 'నవాంశ చక్రం (D9 — వివాహ & ధర్మ బలం)'
                  : primaryVarga === 'D10'
                    ? 'దశాంశ చక్రం (D10 — ఉద్యోగ & వృత్తి బలం)'
                    : 'ద్రేక్కాణ చక్రం (D3 — పరాక్రమ బలం)'}
              </span>
              <span className="text-xs text-[#5BBFB5]">
                వర్గోత్తమ గ్రహాలు:{' '}
                {vargottamaPlanets.length > 0
                  ? vargottamaPlanets.map((p) => tePlanetName(p.id)).join(', ')
                  : 'లేవు'}
              </span>
            </div>
            {kundaliStyle === 'north' ? (
              <NorthIndianKundaliSvg
                chart={chart}
                division={primaryVarga}
                selectedPlanetId={selectedPlanetId}
                onSelectPlanet={onSelectPlanet}
                lang={lang}
              />
            ) : (
              <SouthIndianKundaliSvg
                chart={chart}
                division={primaryVarga}
                selectedPlanetId={selectedPlanetId}
                onSelectPlanet={onSelectPlanet}
                lang={lang}
              />
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Tabular Dasha-Bhukti-Pratyantardasha Reference */}
      <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
        <div className="pb-5 border-b border-white/10 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-[#EDE8E0]">
              వింశోత్తరి మహాదశ - అంతర్దశ - ప్రత్యంతర్దశ పట్టిక · <span className="text-[#C9A96E]">తేదీల వారీగా సమగ్ర పట్టిక</span>
            </h2>
            <p className="text-xs text-[#EDE8E0]/65 mt-1">
              ఎంచుకున్న మహాదశ ({tePlanetName(activeMaha.lord)}) లోని 9 భుక్తులు మరియు ప్రత్యంతర్దశల ఖచ్చితమైన తేదీల పట్టిక.
            </p>
          </div>
          <div className="text-xs font-bold text-[#5BBFB5]">
            ప్రస్తుత కాలం: {tePlanetName(chart.dashas.find((d) => d.isCurrent)?.lord ?? '')} మహాదశ ·{' '}
            {tePlanetName(
              chart.dashas
                .find((d) => d.isCurrent)
                ?.antardashas.find((a) => a.isCurrent)?.lord ?? ''
            )}{' '}
            అంతర్దశ
          </div>
        </div>

        {/* Antardasha (Bhukti) & Pratyantardasha Split Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          <div className="lg:col-span-7">
            <h3 className="text-sm font-bold text-[#EDE8E0] mb-3">
              {tePlanetName(activeMaha.lord)} మహాదశ — 9 అంతర్దశలు (భుక్తులు) ({activeMaha.startDate} నుండి {activeMaha.endDate})
            </h3>
            <div className="overflow-x-auto border border-white/10 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#090C18] text-xs text-[#EDE8E0]/60">
                    <th className="py-2.5 px-3">మహాదశ / అంతర్దశ</th>
                    <th className="py-2.5 px-3">ప్రారంభ తేదీ</th>
                    <th className="py-2.5 px-3">ముగింపు తేదీ</th>
                    <th className="py-2.5 px-3 text-right">వ్యవధి</th>
                    <th className="py-2.5 px-3 text-right">స్థితి</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {activeMaha.antardashas.map((antar, aIdx) => {
                    const isRowSelected = aIdx === selectedAntarIdx;
                    return (
                      <tr
                        key={antar.lord}
                        onClick={() => {
                          setSelectedAntarIdx(aIdx);
                          setSelectedPratyantarIdx(0);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isRowSelected
                            ? 'bg-[#C9A96E]/15 text-[#EDE8E0]'
                            : 'hover:bg-white/5 text-[#EDE8E0]/80'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold">
                          {tePlanetName(activeMaha.lord)} — {tePlanetName(antar.lord)}
                        </td>
                        <td className="py-2.5 px-3 font-mono-tabular text-[#EDE8E0]/75">
                          {antar.startDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono-tabular text-[#EDE8E0]/75">
                          {antar.endDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono-tabular text-right text-[#EDE8E0]/75">
                          {antar.durationMonths} నెలలు
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {antar.isCurrent ? (
                            <span className="text-[#5BBFB5] font-bold">ప్రస్తుతం నడుస్తున్నది</span>
                          ) : (
                            <span className="text-[#EDE8E0]/45">చూడండి →</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="text-sm font-bold text-[#EDE8E0] mb-3">
              ప్రత్యంతర్దశ వివరములు: {tePlanetName(activeMaha.lord)} – {tePlanetName(activeAntar.lord)}
            </h3>
            <div className="overflow-x-auto border border-white/10 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#090C18] text-xs text-[#EDE8E0]/60">
                    <th className="py-2.5 px-3">ప్రత్యంతర్దశ నాథుడు</th>
                    <th className="py-2.5 px-3">ప్రారంభం</th>
                    <th className="py-2.5 px-3">ముగింపు</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {activeAntar.pratyantardashas.map((prat, pIdx) => (
                    <tr
                      key={prat.lord}
                      onClick={() => setSelectedPratyantarIdx(pIdx)}
                      className={`cursor-pointer transition-colors ${
                        pIdx === selectedPratyantarIdx
                          ? 'bg-[#C9A96E]/20 text-[#EDE8E0]'
                          : prat.isCurrent
                            ? 'bg-[#5BBFB5]/15 text-[#EDE8E0]'
                            : 'text-[#EDE8E0]/75 hover:bg-white/5'
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold">
                        {tePlanetName(prat.lord)}
                      </td>
                      <td className="py-2 px-3 font-mono-tabular text-[#EDE8E0]/70">
                        {prat.startDate}
                      </td>
                      <td className="py-2 px-3 font-mono-tabular text-[#EDE8E0]/70">
                        {prat.endDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Shadbala (Six-Fold Planetary Strength) Dashboard */}
      <section className="bg-[#0F1326] border border-white/10 rounded-xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40">
                <BarChart3 className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
                మహర్షి పరాశర హోరా శాస్త్ర ప్రమాణం (BPHS Ch. 27)
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-[#EDE8E0] mt-1">
              షడ్బల గణన వేదిక (Shadbala Calculation Dashboard) ·{' '}
              <span className="text-[#C9A96E]">సప్త గ్రహాల ఆరు విధముల బల ప్రమాణం</span>
            </h2>
            <p className="text-xs text-[#EDE8E0]/70 mt-1 max-w-3xl leading-relaxed">
              స్థాన బలం, దిగ్బలం, కాల బలం, చేష్టా బలం, నైసర్గిక బలం మరియు దృక్ బలముల సమగ్ర గణన (విరూపలు మరియు రూపలలో). ఏ గ్రహం తన దశా-భుక్తులలో అఖండ ఫలితాలు ప్రసాదించగలదో స్పష్టంగా తెలుసుకునే శాస్త్రీయ పీఠం.
            </p>
          </div>

          {/* Dashboard View Mode Tabs */}
          <div className="flex flex-wrap items-center bg-[#090C18] p-1 rounded-xl border border-white/10 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveShadbalaTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeShadbalaTab === 'dashboard'
                  ? 'bg-[#C9A96E] text-[#090C18] shadow'
                  : 'text-[#EDE8E0]/70 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>సామర్థ్య డ్యాష్‌బోర్డ్</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShadbalaTab('sub_balas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeShadbalaTab === 'sub_balas'
                  ? 'bg-[#5BBFB5] text-[#090C18] shadow'
                  : 'text-[#EDE8E0]/70 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>6-ఉపబలాల పరిశీలన</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShadbalaTab('ishta_kashta')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeShadbalaTab === 'ishta_kashta'
                  ? 'bg-[#9B8FD4] text-[#090C18] shadow'
                  : 'text-[#EDE8E0]/70 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ఇష్ట-కష్ట ఫలాలు</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShadbalaTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeShadbalaTab === 'table'
                  ? 'bg-white/20 text-white shadow'
                  : 'text-[#EDE8E0]/70 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>సమగ్ర పట్టిక</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE EFFICACY DASHBOARD & PLANETARY RANKING CARDS */}
        {activeShadbalaTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 3 Executive Analytical Insight Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Strongest Planet Card */}
              <div className="bg-gradient-to-br from-[#141932] to-[#0D1022] border border-[#5BBFB5]/50 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-xs text-[#5BBFB5] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#5BBFB5]" />
                    సర్వోన్నత బల గ్రహం (1వ ర్యాంక్)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#5BBFB5]/20 text-[10px] font-mono-tabular">
                    {(topShadbalaPlanet.ratio * 100).toFixed(0)}% సామర్థ్యం
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#EDE8E0]">
                    {tePlanetName(topShadbalaPlanet.planet)}
                  </span>
                  <span className="text-xs text-[#5BBFB5] font-mono-tabular font-bold">
                    {topShadbalaPlanet.totalRupas.toFixed(2)} రూపాలు ({topShadbalaPlanet.totalVirupas.toFixed(0)} విరూపలు)
                  </span>
                </div>
                <p className="text-xs text-[#EDE8E0]/75 mt-1.5 leading-relaxed">
                  పరాశర సిద్ధాంతం ప్రకారం ఈ గ్రహం మీ జాతకంలో అత్యున్నత కారకత్వాన్ని కలిగి ఉంది. దీని మహాదశ మరియు అంతర్దశలలో ఆశించిన కార్యసిద్ధి, ఉన్నత గౌరవం మరియు విజయాలు లభిస్తాయి.
                </p>
              </div>

              {/* Weakest / Challenged Planet Card */}
              <div className="bg-gradient-to-br from-[#141932] to-[#0D1022] border border-[#D47B7B]/50 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-xs text-[#D47B7B] font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#D47B7B]" />
                    దుర్బల గ్రహం & పరిహార దిశ
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#D47B7B]/20 text-[10px] font-mono-tabular">
                    {(lowestShadbalaPlanet.ratio * 100).toFixed(0)}% సామర్థ్యం
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#EDE8E0]">
                    {tePlanetName(lowestShadbalaPlanet.planet)}
                  </span>
                  <span className="text-xs text-[#D47B7B] font-mono-tabular font-bold">
                    {lowestShadbalaPlanet.totalRupas.toFixed(2)} / {lowestShadbalaPlanet.requiredRupas.toFixed(1)} రూపాలు
                  </span>
                </div>
                <p className="text-xs text-[#EDE8E0]/75 mt-1.5 leading-relaxed">
                  కావలసిన కనీస రూపాల కన్నా తక్కువ బలం ఉన్నందున, ఈ గ్రహ సంబంధిత భావాలలో ఆలస్యాలు ఏర్పడవచ్చు. సంబంధిత స్తోత్ర పారాయణం లేదా దానములు ఆచరించడం ద్వారా శుభ ఫలితాలు బలపడతాయి.
                </p>
              </div>

              {/* Chart Vitality Average Card */}
              <div className="bg-gradient-to-br from-[#141932] to-[#0D1022] border border-[#C9A96E]/50 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-xs text-[#C9A96E] font-bold">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
                    సగటు పిండ బలం (Chart Vitality)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[10px] font-mono-tabular">
                    మొత్తం 7 గ్రహాలు
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#EDE8E0]">
                    {averageVirupas}
                  </span>
                  <span className="text-xs text-[#C9A96E] font-mono-tabular">
                    సగటు విరూపలు (Virupas Avg)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold mt-2 text-[#EDE8E0]/80">
                  <span className="text-[#5BBFB5]">
                    {chart.shadbala.filter((s) => s.status === 'Dominant').length} అధిక బలం
                  </span>
                  <span>·</span>
                  <span className="text-[#C9A96E]">
                    {chart.shadbala.filter((s) => s.status === 'Sufficient').length} సంపూర్ణ
                  </span>
                  <span>·</span>
                  <span className="text-[#D47B7B]">
                    {chart.shadbala.filter((s) => s.status === 'Under-Powered').length} తక్కువ
                  </span>
                </div>
              </div>
            </div>

            {/* 7 Planetary Strength Ranking Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[#C9A96E] font-bold text-xs uppercase tracking-wider">
                <span>సప్త గ్రహాల షడ్బల ప్రాధాన్యతా శ్రేణి (Ranked 1st to 7th):</span>
                <span className="text-[#EDE8E0]/60 text-[11px] lowercase">
                  కావలసిన కనీస రూపాల ప్రాతిపదికన శాతం లెక్కించబడింది
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {sortedShadbala.map((row, idx) => {
                  const pct = Math.round(row.ratio * 100);
                  const isSelected = selectedShadbalaPlanetId === row.planet;

                  return (
                    <div
                      key={`shadbala-rank-${row.planet}`}
                      onClick={() => setSelectedShadbalaPlanetId(row.planet)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 select-none ${
                        isSelected
                          ? 'bg-[#171D3A] border-[#C9A96E] ring-1 ring-[#C9A96E]/50 shadow-md'
                          : 'bg-[#090C18]/90 border-white/10 hover:border-white/25 hover:bg-[#0E1224]'
                      }`}
                    >
                      {/* Card Header: Rank, Glyph, Name, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono-tabular shrink-0 ${
                              idx === 0
                                ? 'bg-[#5BBFB5] text-[#090C18]'
                                : idx === 1
                                  ? 'bg-[#C9A96E] text-[#090C18]'
                                  : 'bg-white/10 text-[#EDE8E0]'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-[#EDE8E0] flex items-center gap-1">
                              <span>{getPlanetGlyph(row.planet)}</span>
                              <span>{tePlanetName(row.planet)}</span>
                            </div>
                            <div className="text-[10px] text-[#EDE8E0]/50 font-mono-tabular">
                              {row.planet}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            row.status === 'Dominant'
                              ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/30'
                              : row.status === 'Sufficient'
                                ? 'bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30'
                                : 'bg-[#D47B7B]/15 text-[#D47B7B] border border-[#D47B7B]/30'
                          }`}
                        >
                          {row.status === 'Dominant'
                            ? 'అధిక బలం'
                            : row.status === 'Sufficient'
                              ? 'సంపూర్ణ బలం'
                              : 'తక్కువ బలం'}
                        </span>
                      </div>

                      {/* Vitality Percentage & Rupas Score */}
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-[#EDE8E0]/60">సామర్థ్య శాతం:</span>
                          <span
                            className={`font-mono-tabular font-bold text-sm ${
                              pct >= 115
                                ? 'text-[#5BBFB5]'
                                : pct >= 100
                                  ? 'text-[#C9A96E]'
                                  : 'text-[#D47B7B]'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              pct >= 115
                                ? 'bg-gradient-to-r from-[#5BBFB5] to-[#80ded4]'
                                : pct >= 100
                                  ? 'bg-gradient-to-r from-[#C9A96E] to-[#e4c995]'
                                  : 'bg-gradient-to-r from-[#D47B7B] to-[#e89d9d]'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(8, (pct / 160) * 100))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono-tabular text-[#EDE8E0]/70 pt-0.5">
                          <span>రూపలు: {row.totalRupas.toFixed(2)} / {row.requiredRupas.toFixed(1)}</span>
                          <span className="font-semibold text-[#C9A96E]">
                            {row.totalVirupas.toFixed(0)} విరూపలు
                          </span>
                        </div>
                      </div>

                      {/* 6 Sub-Bala Mini Badges */}
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-[9.5px] font-mono-tabular">
                        <div className="bg-[#090C18] p-1 rounded text-center">
                          <div className="text-[#EDE8E0]/50">స్థాన</div>
                          <div className="font-bold text-[#EDE8E0]">{row.sthanaBala.toFixed(0)}</div>
                        </div>
                        <div className="bg-[#090C18] p-1 rounded text-center">
                          <div className="text-[#EDE8E0]/50">దిక్</div>
                          <div className="font-bold text-[#EDE8E0]">{row.digBala.toFixed(0)}</div>
                        </div>
                        <div className="bg-[#090C18] p-1 rounded text-center">
                          <div className="text-[#EDE8E0]/50">కాల</div>
                          <div className="font-bold text-[#EDE8E0]">{row.kalaBala.toFixed(0)}</div>
                        </div>
                        <div className="bg-[#090C18] p-1 rounded text-center">
                          <div className="text-[#EDE8E0]/50">చేష్టా</div>
                          <div className="font-bold text-[#EDE8E0]">{row.cheshtaBala.toFixed(0)}</div>
                        </div>
                        <div className="bg-[#090C18] p-1 rounded text-center">
                          <div className="text-[#EDE8E0]/50">నైసర్గిక</div>
                          <div className="font-bold text-[#EDE8E0]">{row.naisargikaBala.toFixed(0)}</div>
                        </div>
                        <div className="bg-[#090C18] p-1 rounded text-center">
                          <div className="text-[#EDE8E0]/50">దృక్</div>
                          <div className="font-bold text-[#EDE8E0]">{row.drikBala.toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Classical Parashari Dasha Efficacy Insight Box */}
            <div className="bg-[#141932] border border-[#C9A96E]/40 rounded-xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C9A96E]">
                <Info className="w-4 h-4 text-[#C9A96E]" />
                <span>షడ్బల శాస్త్ర రహస్యం & దశా ఫలితాల సామర్థ్య సూత్రం (BPHS Dasha-Shadbala Principle):</span>
              </div>
              <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                మహర్షి పరాశరుల ప్రమాణం ప్రకారం జాతకంలో గ్రహాల స్థాన బలం వాటి శాశ్వత పునాదిని, దిగ్బలం నిర్ణయాధికార ప్రభావశీలతను, చేష్టా బలం సంకల్ప శక్తిని మరియు కాల బలం సందర్భోచిత శుభ ఫలితాలను నిర్ధారిస్తాయి. ఏ గ్రహానికైతే 100% కన్నా ఎక్కువ షడ్బల రూపాలు ఉంటాయో, ఆ గ్రహం తన వింశోత్తరి మహాదశ మరియు అంతర్దశలలో ఎలాంటి అడ్డంకులు లేకుండా సంపూర్ణ శుభ ఫలితాలను, యోగకారకత్వాన్ని మరియు కీర్తిని ప్రసాదిస్తుంది.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: SIX-FOLD SUB-BALAS IN-DEPTH ANALYZER */}
        {activeShadbalaTab === 'sub_balas' && (
          <div className="space-y-5">
            {/* Metric Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'sthanaBala', labelTe: '1. స్థాన బలం (Positional)', descTe: 'ఉచ్ఛ, సప్తవర్గజ, ఓజయుగ్మ, కేంద్ర బలాలు' },
                { id: 'digBala', labelTe: '2. దిగ్బలం (Directional)', descTe: 'లగ్న/కేంద్రాలలో గ్రహాల దిశా బలం' },
                { id: 'kalaBala', labelTe: '3. కాల బలం (Temporal)', descTe: 'దివారాత్రి, పక్ష, త్రిభాగ, అబ్ద బలాలు' },
                { id: 'cheshtaBala', labelTe: '4. చేష్టా బలం (Motional)', descTe: 'వక్ర గమనం, కాంతి, సూర్యుని నుండి దూరం' },
                { id: 'naisargikaBala', labelTe: '5. నైసర్గిక బలం (Natural)', descTe: 'రవి నుండి శని వరకు సహజ కాంతి క్రమం' },
                { id: 'drikBala', labelTe: '6. దృక్ బలం (Aspectual)', descTe: 'శుభ/పాప గ్రహాల దృష్ట్యా సంస్కార బలం' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveSubBalaMetric(m.id as any)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                    activeSubBalaMetric === m.id
                      ? 'bg-[#5BBFB5] text-[#090C18] border-[#5BBFB5] shadow-md'
                      : 'bg-[#090C18] border-white/10 text-[#EDE8E0] hover:border-white/30'
                  }`}
                >
                  <div>{m.labelTe}</div>
                  <div className="text-[10px] opacity-75 font-normal mt-0.5">{m.descTe}</div>
                </button>
              ))}
            </div>

            {/* Sub-Bala Comparative Visual Bars */}
            <div className="bg-[#090C18] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider">
                సప్త గ్రహాల తులనాత్మక గ్రాఫ్ ·{' '}
                {activeSubBalaMetric === 'sthanaBala'
                  ? 'స్థాన బలం (Positional Strength)'
                  : activeSubBalaMetric === 'digBala'
                    ? 'దిగ్బలం (Directional Strength)'
                    : activeSubBalaMetric === 'kalaBala'
                      ? 'కాల బలం (Temporal Strength)'
                      : activeSubBalaMetric === 'cheshtaBala'
                        ? 'చేష్టా బలం (Motional Strength)'
                        : activeSubBalaMetric === 'naisargikaBala'
                          ? 'నైసర్గిక బలం (Natural Luminosity)'
                          : 'దృక్ బలం (Aspectual Strength)'}
              </div>

              <div className="space-y-3">
                {[...chart.shadbala]
                  .sort((a, b) => (b[activeSubBalaMetric] as number) - (a[activeSubBalaMetric] as number))
                  .map((row) => {
                    const score = row[activeSubBalaMetric] as number;
                    const maxPossible =
                      activeSubBalaMetric === 'sthanaBala'
                        ? 260
                        : activeSubBalaMetric === 'digBala'
                          ? 60
                          : activeSubBalaMetric === 'kalaBala'
                            ? 180
                            : activeSubBalaMetric === 'cheshtaBala'
                              ? 60
                              : activeSubBalaMetric === 'naisargikaBala'
                                ? 60
                                : 40;
                    const widthPct = Math.min(100, Math.max(5, (score / maxPossible) * 100));

                    return (
                      <div key={`subbala-${row.planet}-${activeSubBalaMetric}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono-tabular">
                          <span className="font-bold text-[#EDE8E0] flex items-center gap-1.5">
                            <span>{getPlanetGlyph(row.planet)}</span>
                            <span>{tePlanetName(row.planet)}</span>
                          </span>
                          <span className="font-bold text-[#5BBFB5]">
                            {score.toFixed(1)} విరూపలు ({(score / 60).toFixed(2)} రూపాలు)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#5BBFB5] to-[#C9A96E] rounded-full transition-all duration-300"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ISHTA PHALA & KASHTA PHALA DASHBOARD */}
        {activeShadbalaTab === 'ishta_kashta' && (
          <div className="space-y-5">
            <div className="p-4 bg-[#141932] border border-[#9B8FD4]/40 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-[#9B8FD4] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#9B8FD4]" />
                ఇష్ట ఫలము & కష్ట ఫలము (Ishta Phala & Kashta Phala — BPHS 27.34–40):
              </div>
              <p className="text-[#EDE8E0]/85 leading-relaxed">
                ఇష్ట ఫలము గ్రహం యొక్క ఉచ్ఛబలం మరియు చేష్టా బలాల గుణకార వర్గమూలం ద్వారా లెక్కించబడుతుంది. ఇది గ్రహం తన జీవిత కాలంలో కష్టాలు లేకుండా ఇచ్చే శుభత్వాన్ని సూచిస్తుంది. కష్ట ఫలము గ్రహం ఎదుర్కొనే ఘర్షణను లేదా కష్టాలను సూచిస్తుంది. మొత్తం 60 విరూపల కొలమానంలో ఇష్ట ఫలం అధికంగా ఉన్న గ్రహం విశేష యోగాన్ని ఇస్తుంది.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siddhantaAppendices.ishtaKashtaTable.map((ik) => {
                return (
                  <div
                    key={`ik-${ik.planetId}`}
                    className="p-4 bg-[#090C18] border border-white/10 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-[#EDE8E0] flex items-center gap-1.5">
                        <span>{getPlanetGlyph(ik.planetId)}</span>
                        <span>{ik.planetNameTe}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30">
                        {ik.uchchaBala >= 30 ? 'ఉచ్ఛ వర్గజ' : 'సాధారణ'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono-tabular">
                        <span className="text-[#5BBFB5] font-semibold">
                          ఇష్ట ఫలం: {ik.ishtaPhala} విరూపలు ({ik.netBeneficPercent}%)
                        </span>
                        <span className="text-[#D47B7B] font-semibold">
                          కష్ట ఫలం: {ik.kashtaPhala} విరూపలు
                        </span>
                      </div>

                      {/* Dual split bar for Ishta vs Kashta */}
                      <div className="w-full h-3 bg-white/10 rounded-full flex overflow-hidden">
                        <div
                          className="bg-[#5BBFB5] h-full"
                          style={{ width: `${ik.netBeneficPercent}%` }}
                          title={`ఇష్ట ఫలం: ${ik.netBeneficPercent}%`}
                        />
                        <div
                          className="bg-[#D47B7B] h-full"
                          style={{ width: `${100 - ik.netBeneficPercent}%` }}
                          title={`కష్ట ఫలం: ${100 - ik.netBeneficPercent}%`}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#EDE8E0]/75 leading-relaxed pt-1 border-t border-white/10">
                      {ik.dashaVerdictTe}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: COMPREHENSIVE 11-COLUMN CLASSICAL SHADBALA REFERENCE TABLE */}
        {activeShadbalaTab === 'table' && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-xs text-[#EDE8E0]/70 bg-white/5">
                  <th className="py-3 px-3">గ్రహం (Graha)</th>
                  <th className="py-3 px-3 text-right">స్థాన బలం</th>
                  <th className="py-3 px-3 text-right">దిగ్బలం</th>
                  <th className="py-3 px-3 text-right">కాల బలం</th>
                  <th className="py-3 px-3 text-right">చేష్టా బలం</th>
                  <th className="py-3 px-3 text-right">నైసర్గిక</th>
                  <th className="py-3 px-3 text-right">దృక్ బలం</th>
                  <th className="py-3 px-3 text-right text-[#C9A96E]">మొత్తం విరూపలు</th>
                  <th className="py-3 px-3 text-right">రూపలు / కావలసినవి</th>
                  <th className="py-3 px-3 text-right">శాతం</th>
                  <th className="py-3 px-3 text-right">బల నిర్ధారణ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {chart.shadbala.map((row) => (
                  <tr key={`full-table-${row.planet}`} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#EDE8E0] flex items-center gap-1.5">
                      <span>{getPlanetGlyph(row.planet)}</span>
                      <span>{tePlanetName(row.planet)}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-[#EDE8E0]/80">
                      {row.sthanaBala.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-[#EDE8E0]/80">
                      {row.digBala.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-[#EDE8E0]/80">
                      {row.kalaBala.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-[#EDE8E0]/80">
                      {row.cheshtaBala.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-[#EDE8E0]/80">
                      {row.naisargikaBala.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-[#EDE8E0]/80">
                      {row.drikBala.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular font-bold text-[#C9A96E]">
                      {row.totalVirupas.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-[#EDE8E0]">
                      {row.totalRupas.toFixed(2)} / {row.requiredRupas.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular font-bold text-[#EDE8E0]">
                      {(row.ratio * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      <span
                        className={
                          row.status === 'Dominant'
                            ? 'text-[#5BBFB5]'
                            : row.status === 'Sufficient'
                              ? 'text-[#C9A96E]'
                              : 'text-[#D47B7B]'
                        }
                      >
                        {row.status === 'Dominant'
                          ? 'అధిక బలం'
                          : row.status === 'Sufficient'
                            ? 'సంపూర్ణ బలం'
                            : 'తక్కువ బలం'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 5: Ashtakavarga 337-Bindu Transit Grid */}
      <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-display font-bold text-[#EDE8E0]">
              సర్వాష్టకవర్గ & భిన్నాష్టకవర్గ చక్రం · <span className="text-[#C9A96E]">337 శుభ బిందువుల పట్టిక</span>
            </h2>
            <p className="text-xs text-[#EDE8E0]/65 mt-1">
              28 లేదా అంతకంటే ఎక్కువ బిందువులు ఉన్న రాశులలో గురు, శని గోచార సంచారం జరిగినప్పుడు విశేష శుభ ఫలితాలు కలుగుతాయి.
            </p>
          </div>
          <div className="text-xs font-mono-tabular text-[#C9A96E]">
            మొత్తం బిందువులు: {chart.ashtakavarga.totalBindus}
          </div>
        </div>

        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-[#EDE8E0]/60">
                <th className="py-2.5 px-3">గ్రహం</th>
                {ZODIAC_SIGNS.map((s) => (
                  <th key={s.index} className="py-2.5 px-2 text-center">
                    {TELUGU_RASIS[s.index].nameTe.split(' ')[0]}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right">మొత్తం</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono-tabular">
              {Object.entries(chart.ashtakavarga.bhinnashtakavarga).map(([planet, row]) => {
                const rowSum = row.reduce((a, b) => a + b, 0);
                return (
                  <tr key={planet} className="hover:bg-white/5">
                    <td className="py-2.5 px-3 font-sans font-semibold text-[#EDE8E0]">
                      {tePlanetName(planet)}
                    </td>
                    {row.map((val, sIdx) => (
                      <td
                        key={sIdx}
                        className={`py-2.5 px-2 text-center ${
                          val >= 5
                            ? 'text-[#5BBFB5] font-semibold'
                            : val <= 2
                              ? 'text-[#D47B7B]/80'
                              : 'text-[#EDE8E0]/75'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right text-[#EDE8E0]/60">{rowSum}</td>
                  </tr>
                );
              })}

              <tr className="bg-[#090C18] border-t border-white/15 font-bold">
                <td className="py-3 px-3 font-sans text-[#C9A96E]">సర్వాష్టకవర్గ</td>
                {chart.ashtakavarga.sarvashtakavarga.map((total, sIdx) => (
                  <td
                    key={sIdx}
                    className={`py-3 px-2 text-center ${
                      total >= 30
                        ? 'text-[#5BBFB5]'
                        : total >= 25
                          ? 'text-[#C9A96E]'
                          : 'text-[#D47B7B]'
                    }`}
                  >
                    {total}
                  </td>
                ))}
                <td className="py-3 px-3 text-right text-[#C9A96E]">
                  {chart.ashtakavarga.totalBindus}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
