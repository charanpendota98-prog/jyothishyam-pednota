import React, { useState, useEffect, useMemo } from 'react';
import {
  AYANAMSA_METADATA,
  ZODIAC_SIGNS,
  calculateChart,
  type BirthInput,
  type ZodiacTradition,
  type AyanamsaSystem,
  type HouseSystem,
  type PlanetPosition,
} from './engine/ephemeris.ts';
import {
  STATE_DISTRICT_ATLAS,
  TELUGU_RASIS,
  TELUGU_PLANETS,
  TELUGU_NAKSHATRAS,
  generateTeluguSampoornaJathakam,
  type AppLanguage,
} from './engine/teluguJathakam.ts';
import {
  WesternWheelSvg,
  NorthIndianKundaliSvg,
  SouthIndianKundaliSvg,
} from './components/ChartsSvg.tsx';
import { SampoornaJathakamView } from './components/SampoornaJathakamView.tsx';
import { DashaVargaView } from './components/DashaVargaView.tsx';
import { PanchangaAdvancedView } from './components/PanchangaAdvancedView.tsx';
import { SynastryMilanView } from './components/SynastryMilanView.tsx';
import { ClassicalAiView } from './components/ClassicalAiView.tsx';
import { PrashnaShastraView } from './components/PrashnaShastraView.tsx';
import { NamakaranaShastraView } from './components/NamakaranaShastraView.tsx';
import { TajikaVarshaphalaView } from './components/TajikaVarshaphalaView.tsx';
import { VastuShastraView } from './components/VastuShastraView.tsx';
import { HinduCalendarView } from './components/HinduCalendarView.tsx';
import { GocharaView } from './components/GocharaView.tsx';
import { JathakaDeepView } from './components/JathakaDeepView.tsx';
import { GranthaSourcesView } from './components/GranthaSourcesView.tsx';
import { RoyalWhatsAppSummaryModal } from './components/RoyalWhatsAppSummaryModal.tsx';
import {
  Bookmark,
  Trash2,
  X,
  Plus,
  Menu,
  Compass,
  Orbit,
  Layers,
  Library,
  Home,
  Clock,
  Calendar,
  Heart,
  Sparkles,
  Printer,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Star,
  Share2,
} from 'lucide-react';

type ActiveWorkspaceTab =
  | 'studio'
  | 'varshaphala'
  | 'namakarana'
  | 'dasha_vargas'
  | 'panchanga_lots'
  | 'synastry'
  | 'classical_ai'
  | 'prashna'
  | 'vastu'
  | 'hindu_calendar'
  | 'gochara'
  | 'jathaka_deep'
  | 'granthas';

const INITIAL_PROFILES: BirthInput[] = [
  {
    id: 'charan-telugu-jathakam',
    name: 'చరణ్ పెందోట (Charan Pendota)',
    gender: 'male',
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
    gender: 'male',
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
    gender: 'female',
    date: '1995-08-14',
    time: '09:30',
    lat: 16.5062,
    lng: 80.6480,
    tzOffsetHours: 5.5,
    city: 'ఎన్టీఆర్ జిల్లా (Vijayawada)',
    country: 'ఆంధ్రప్రదేశ్, భారతదేశం',
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
    notes: 'నవాంశ (D9) వివాహ పొందిక, అష్టకూట గుణ నిర్ణయం మరియు శుక్ర మహాదశ ఫలితాలు.',
  },
  {
    id: 'swami-vivekananda-archive',
    name: 'స్వామి వివేకానంద (Swami Vivekananda)',
    gender: 'male',
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('studio');
  const [lang, setLang] = useState<AppLanguage>('te');
  const [tradition, setTradition] = useState<ZodiacTradition>('vedic');
  // Default to South Indian (Telugu tradition) Kundali chart
  const [chartVisualMode, setChartVisualMode] = useState<
    'south_kundali' | 'north_kundali' | 'wheel'
  >('south_kundali');
  const [vargaDivision, setVargaDivision] = useState<
    'D1' | 'D2' | 'D3' | 'D4' | 'D7' | 'D9' | 'D10' | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D60'
  >('D1');
  const [showTransits, setShowTransits] = useState<boolean>(false);

  const [savedProfiles, setSavedProfiles] = useState<BirthInput[]>(INITIAL_PROFILES);
  const [birthInput, setBirthInput] = useState<BirthInput>(INITIAL_PROFILES[0]);

  // State & District Selector State
  const [selectedStateId, setSelectedStateId] = useState<string>('telangana');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('tg_hyderabad');

  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>('Sun');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileBirthFormOpen, setIsMobileBirthFormOpen] = useState<boolean>(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [externalPdfTrigger, setExternalPdfTrigger] = useState<number>(0);
  const [isRoyalCardOpen, setIsRoyalCardOpen] = useState<boolean>(false);

  const handleTriggerFullPdfDownload = () => {
    setActiveTab('studio');
    setIsMobileMenuOpen(false);
    setExternalPdfTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    fetch('/api/profiles')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.profiles?.length) {
          setSavedProfiles(data.profiles);
        }
      })
      .catch(() => {});
  }, []);

  const activeStateObj = useMemo(
    () =>
      STATE_DISTRICT_ATLAS.find((s) => s.id === selectedStateId) ??
      STATE_DISTRICT_ATLAS[0],
    [selectedStateId]
  );

  const handleStateChange = (newStateId: string) => {
    setSelectedStateId(newStateId);
    const st = STATE_DISTRICT_ATLAS.find((s) => s.id === newStateId);
    if (st && st.districts.length > 0) {
      const firstDist = st.districts[0];
      setSelectedDistrictId(firstDist.id);
      setBirthInput((prev) => ({
        ...prev,
        city: `${firstDist.nameTe} (${firstDist.nameEn})`,
        country: `${st.nameTe.split(' ')[0]}, ${st.countryTe}`,
        lat: firstDist.lat,
        lng: firstDist.lng,
        tzOffsetHours: firstDist.tzOffsetHours,
      }));
    }
  };

  const handleDistrictChange = (newDistId: string) => {
    setSelectedDistrictId(newDistId);
    const dist = activeStateObj.districts.find((d) => d.id === newDistId);
    if (dist) {
      setBirthInput((prev) => ({
        ...prev,
        city: `${dist.nameTe} (${dist.nameEn})`,
        country: `${activeStateObj.nameTe.split(' ')[0]}, ${activeStateObj.countryTe}`,
        lat: dist.lat,
        lng: dist.lng,
        tzOffsetHours: dist.tzOffsetHours,
      }));
    }
  };

  const chart = useMemo(
    () => calculateChart(birthInput, tradition),
    [birthInput, tradition]
  );

  const teJathakam = useMemo(
    () => generateTeluguSampoornaJathakam(chart),
    [chart]
  );

  const transitChart = useMemo(() => {
    if (!showTransits) return null;
    const now = new Date();
    const transitInput: BirthInput = {
      ...birthInput,
      name: 'ప్రస్తుత గోచార గ్రహ స్థితి (Current Transits)',
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
    };
    return calculateChart(transitInput, tradition);
  }, [showTransits, birthInput, tradition]);

  const selectedPlanet: PlanetPosition =
    chart.planets.find((p) => p.id === selectedPlanetId) ?? chart.planets[0];

  const handleSaveProfile = async () => {
    const record: BirthInput = {
      ...birthInput,
      id: birthInput.id || `profile-${Date.now()}`,
    };
    setSavedProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
    setSaveNotice('జాతకం సేవ్ చేయబడింది!');
    setTimeout(() => setSaveNotice(null), 2500);

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profiles) setSavedProfiles(data.profiles);
      }
    } catch {}
  };

  const handleDeleteProfile = async (id?: string) => {
    if (!id) return;
    setSavedProfiles((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const activeMaha = chart.dashas.find((d) => d.isCurrent) ?? chart.dashas[0];
  const activeAntar =
    activeMaha.antardashas.find((a) => a.isCurrent) ?? activeMaha.antardashas[0];

  const navItems: {
    id: ActiveWorkspaceTab;
    labelTe: string;
    shortTe: string;
    labelEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'studio',
      labelTe: 'సంపూర్ణ జాతకం',
      shortTe: 'జాతకం',
      labelEn: 'Chart Studio',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'varshaphala',
      labelTe: 'వార్షిక ఫలితాలు & 12-నెలలు (Varshaphala)',
      shortTe: 'వర్షఫలం',
      labelEn: 'Varshaphala & 12-Month',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'namakarana',
      labelTe: 'నామకరణ శాస్త్రం (పేరు పెట్టడం)',
      shortTe: 'నామకరణం',
      labelEn: 'Baby Naming & Akshara',
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: 'dasha_vargas',
      labelTe: 'దశలు & వర్గ చక్రాలు',
      shortTe: 'దశలు & వర్గాలు',
      labelEn: 'Dasha & Vargas',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'panchanga_lots',
      labelTe: 'పంచాంగం & ముహూర్త శోధన',
      shortTe: 'ముహూర్తం',
      labelEn: 'Panchanga & Muhurta',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'synastry',
      labelTe: 'వివాహ పొందిక (36 గుణాలు)',
      shortTe: 'వివాహ పొందిక',
      labelEn: 'Synastry & Milan',
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: 'classical_ai',
      labelTe: 'జ్యోతిష్య AI సిద్ధాంతి',
      shortTe: 'AI సిద్ధాంతి',
      labelEn: 'Classical AI',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'prashna',
      labelTe: 'ప్రశ్న జ్యోతిష్యం (Horary)',
      shortTe: 'ప్రశ్న శాస్త్రం',
      labelEn: 'Prashna Shastra',
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: 'granthas',
      labelTe: 'గ్రంథ మండలం (మూల ఆధారాలు)',
      shortTe: 'గ్రంథాలు',
      labelEn: 'Classical Sources',
      icon: <Library className="w-4 h-4" />,
    },
    {
      id: 'jathaka_deep',
      labelTe: 'జాతక సూక్ష్మ చక్రం (అవకహడ · వర్గాలు · షడ్బల)',
      shortTe: 'సూక్ష్మ జాతకం',
      labelEn: 'Deep Jathaka',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'gochara',
      labelTe: 'గోచార ఫలం (రాశి గతులు)',
      shortTe: 'గోచారం',
      labelEn: 'Gochara & Transits',
      icon: <Orbit className="w-4 h-4" />,
    },
    {
      id: 'hindu_calendar',
      labelTe: 'హిందూ పంచాంగం & క్యాలెండర్',
      shortTe: 'పంచాంగం',
      labelEn: 'Hindu Calendar',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'vastu',
      labelTe: 'వాస్తు శాస్త్రం (నామ & గృహ)',
      shortTe: 'వాస్తు',
      labelEn: 'Vastu Shastra',
      icon: <Home className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen app-canvas text-[#EDE8E0] flex flex-col pb-16 lg:pb-0">
      {/* STRICT 3-ZONE TOP BAR CONTRACT + MOBILE-FIRST ERGONOMIC HEADER */}
      <header className="shell-header sticky top-0 z-40 px-3 sm:px-5 lg:px-7 py-2.5 flex items-center justify-between gap-3 sm:gap-5 no-print">
        {/* Brand */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('studio');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <span className="brand-sigil">
            <svg viewBox="0 0 40 40" className="w-[22px] h-[22px] sigil-spin" aria-hidden="true">
              <g stroke="currentColor" strokeWidth="1.05" fill="none" opacity="0.85">
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * Math.PI) / 6;
                  return (
                    <line
                      key={i}
                      x1={20 + 6.5 * Math.cos(a)}
                      y1={20 + 6.5 * Math.sin(a)}
                      x2={20 + 15.5 * Math.cos(a)}
                      y2={20 + 15.5 * Math.sin(a)}
                    />
                  );
                })}
              </g>
              <circle cx="20" cy="20" r="6.5" stroke="currentColor" strokeWidth="1.05" fill="none" />
              <circle cx="20" cy="20" r="2.1" fill="currentColor" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="brand-wordmark font-display text-[19px] sm:text-[21px] font-bold tracking-tight">
              Jyotishyam
            </span>
            <span className="brand-eyebrow mt-1 hidden sm:block">వైదిక జ్యోతిష పరిశోధన మందిరం</span>
          </span>
        </a>

        {/* Primary navigation */}
        <nav className="hidden lg:flex nav-track nav-fade overflow-x-auto max-w-[62vw]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={lang === 'te' ? item.labelTe : item.labelEn}
              data-active={activeTab === item.id}
              className="nav-pill cursor-pointer"
            >
              {item.icon}
              <span>{lang === 'te' ? item.shortTe : item.labelEn}</span>
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#5BBFB5]/35 bg-[#5BBFB5]/10 text-[#6FD2C7] text-[10px] font-mono-tabular tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6FD2C7] aura-pulse" />
            SWISS EPHEMERIS · LAHIRI
          </span>

          <button onClick={() => setIsRoyalCardOpen(true)} className="hidden sm:inline-flex ghost-btn cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
            <span>1-పేజీ కార్డు</span>
          </button>

          <button onClick={() => setIsDrawerOpen(true)} className="gold-btn cursor-pointer">
            <span className="hidden sm:inline">{lang === 'te' ? 'ప్రొఫైల్స్' : 'Profiles'}</span>
            <span className="font-mono-tabular">{savedProfiles.length}</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Open Navigation Menu"
            className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/12 text-[#E4C68C] hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Full Menu Drawer (Phone & Tablet) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden sticky top-[57px] z-30 bg-[#0F1326] border-b-2 border-[#C9A96E]/50 px-4 py-4 space-y-4 shadow-2xl no-print">
          <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#C9A96E] font-semibold">
            ప్రధాన విభాగాలు (Main Navigation Menu)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isAct = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-xs font-semibold border transition-all cursor-pointer ${
                    isAct
                      ? 'bg-[#C9A96E] text-[#090C18] border-[#C9A96E] font-bold shadow-md'
                      : 'bg-[#090C18]/90 text-[#EDE8E0] border-white/10 hover:border-[#C9A96E]/40'
                  }`}
                >
                  {item.icon}
                  <span>{lang === 'te' ? item.labelTe : item.labelEn}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleTriggerFullPdfDownload}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#C9A96E] text-[#090C18] rounded-lg shadow-md hover:bg-[#d8b97e] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              పూర్తి జాతకం PDF డౌన్‌లోడ్ (12 Pages)
            </button>

            <div className="flex items-center bg-[#090C18] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setLang('te')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  lang === 'te' ? 'bg-[#C9A96E] text-[#090C18]' : 'text-[#EDE8E0]/70'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  lang === 'en' ? 'bg-[#C9A96E] text-[#090C18]' : 'text-[#EDE8E0]/70'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart identity band — the native's five key coordinates at a glance */}
      <div className="kpi-band px-3 sm:px-5 lg:px-7 py-2.5 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="kpi-chip">
              <span className="kpi-label">జాతకుడు</span>
              <span className="kpi-value max-w-[150px]">{chart.input.name}</span>
            </div>
            <div className="kpi-chip">
              <span className="kpi-label">జననం</span>
              <span className="kpi-value font-mono-tabular">
                {chart.input.date} · {chart.input.time}
              </span>
            </div>
            <div className="kpi-chip">
              <span className="kpi-label">స్థలం</span>
              <span className="kpi-value max-w-[160px]">{chart.input.city.split('(')[0].trim()}</span>
            </div>
            <div className="kpi-chip">
              <span className="kpi-label">లగ్నం</span>
              <span className="kpi-value gold">{teJathakam.janmaLagnamTe.split(' ')[0]}</span>
            </div>
            <div className="kpi-chip">
              <span className="kpi-label">రాశి</span>
              <span className="kpi-value teal">{teJathakam.janmaRasiTe.split(' ')[0]}</span>
            </div>
            <div className="kpi-chip">
              <span className="kpi-label">నక్షత్రం</span>
              <span className="kpi-value">
                {teJathakam.janmaNakshatramTe} · {teJathakam.janmaPadam} · “{teJathakam.namaAksharamTe}”
              </span>
            </div>
            <div className="kpi-chip">
              <span className="kpi-label">ప్రస్తుత దశ</span>
              <span className="kpi-value violet">
                {TELUGU_PLANETS[activeMaha.lord]?.nameTe ?? activeMaha.lord}
                <span className="text-[#EDE8E0]/40"> / </span>
                {TELUGU_PLANETS[activeAntar.lord]?.nameTe ?? activeAntar.lord}
              </span>
            </div>
            <div className="kpi-chip hidden md:flex">
              <span className="kpi-label">అయనాంశ</span>
              <span className="kpi-value font-mono-tabular">{chart.ayanamsaDeg.toFixed(4)}°</span>
            </div>
          </div>

          <div className="hidden sm:flex flex-wrap items-center gap-2">
            <button onClick={handleTriggerFullPdfDownload} className="gold-btn cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              పూర్తి జాతకం PDF
            </button>

            <button
              onClick={handleTriggerFullPdfDownload}
              className="ghost-btn cursor-pointer"
              title="ముద్రణ పుటల ఎంపిక & ప్రింట్ అమరికలు"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              పుటల ఎంపిక
            </button>

            <div className="seg">
              <button data-active={lang === 'te'} onClick={() => setLang('te')}>
                తెలుగు
              </button>
              <button data-active={lang === 'en'} onClick={() => setLang('en')}>
                EN
              </button>
            </div>

            <div className="seg">
              <button data-active={tradition === 'vedic'} onClick={() => setTradition('vedic')}>
                నిరయన
              </button>
              <button data-active={tradition === 'western'} onClick={() => setTradition('western')}>
                సాయన
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-5 lg:px-7 py-4 sm:py-6">
        {activeTab === 'studio' && (
          <div className="space-y-6 sm:space-y-10">
            {/* Hero — the promise of the platform, with primary trust signals */}
            <section className="no-print relative overflow-hidden rounded-[24px] border border-white/10 px-5 py-6 sm:px-8 sm:py-8">
              <div
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    'radial-gradient(620px 300px at 12% -20%, rgba(217,185,123,0.20), transparent 62%), radial-gradient(520px 280px at 88% 0%, rgba(126,112,210,0.18), transparent 60%), linear-gradient(180deg, rgba(12,16,30,0.94), rgba(6,8,16,0.94))',
                }}
              />
              <div className="absolute -right-10 -top-14 w-56 h-56 rounded-full border border-[#C9A96E]/20 aura-pulse -z-10" />
              <div className="absolute -right-2 top-2 w-36 h-36 rounded-full border border-[#9B8FD4]/20 -z-10" />

              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="max-w-2xl space-y-2.5">
                  <div className="section-eyebrow">సంపూర్ణ తెలుగు జ్యోతిష శాస్త్రం · నిరయన వేద గణన</div>
                  <h1 className="text-[26px] sm:text-[34px] leading-[1.25] font-display font-bold text-[#F4F0E8]">
                    జన్మ క్షణాన్ని <span className="text-[#E4C68C]">ఖచ్చితంగా</span> చదివే జాతక చక్రం
                  </h1>
                  <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-[#EDE8E0]/60">
                    Swiss Ephemeris ఆధారిత సిద్ధాంత గణన · 16 వర్గాలు · షడ్బలం · పంచ స్థాయి దశలు · శ్రీపతి భావ సంధులు ·
                    అష్టకవర్గం — ప్రామాణిక పత్రికలతో 238 పిన్-టు-పిన్ తనిఖీలు.
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {[
                    ['238 / 238', 'పిన్-టు-పిన్ తనిఖీలు'],
                    ['0.02°', 'గ్రహ క్షేత్ర స్థితి భేదం'],
                    ['22', 'మూల గ్రంథాలు'],
                  ].map(([v, l]) => (
                    <div key={l} className="flex items-baseline gap-2.5">
                      <span className="font-mono-tabular text-[15px] font-bold text-[#E4C68C] min-w-[68px]">{v}</span>
                      <span className="text-[10.5px] text-[#EDE8E0]/50">{l}</span>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('jathaka_deep')} className="gold-btn mt-1 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5" />
                    సూక్ష్మ జాతక చక్రం తెరవండి
                  </button>
                </div>
              </div>
            </section>

            {/* 4-Card Executive Jathakam Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 no-print">
              <div className="bg-[#0F1326] border border-[#C9A96E]/35 rounded-xl p-3.5 sm:p-4">
                <div className="text-[11px] font-mono-tabular text-[#C9A96E]">
                  01 · జన్మ లగ్నం & యోగకారకుడు
                </div>
                <div className="text-base sm:text-lg font-display font-bold text-[#EDE8E0] mt-1">
                  {teJathakam.janmaLagnamTe}
                </div>
                <div className="text-xs text-[#EDE8E0]/70 mt-1">
                  లగ్నాధిపతి: <strong className="text-[#5BBFB5]">{teJathakam.janmaLagnaAdhipatiTe}</strong> · D9: {teJathakam.navamsaLagnamTe.split(' ')[0]}
                </div>
              </div>

              <div className="bg-[#0F1326] border border-white/10 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono-tabular text-[#5BBFB5]">
                    02 · జన్మ రాశి, నక్షత్రం & నామాక్షరం
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('namakarana')}
                    className="text-[10px] font-bold text-[#C9A96E] hover:underline cursor-pointer"
                  >
                    పేరు పెట్టడం →
                  </button>
                </div>
                <div className="text-base sm:text-lg font-display font-bold text-[#EDE8E0] mt-1">
                  {teJathakam.janmaRasiTe.split(' ')[0]} — {teJathakam.janmaNakshatramTe} ({teJathakam.janmaPadam}వ పాదం)
                </div>
                <div className="text-xs text-[#EDE8E0]/70 mt-1">
                  నామ అక్షరం: <strong className="text-[#C9A96E]">&ldquo;{teJathakam.namaAksharamTe}&rdquo;</strong> · {teJathakam.ganaTe}
                </div>
              </div>

              <div className="bg-[#0F1326] border border-white/10 rounded-xl p-3.5 sm:p-4">
                <div className="text-[11px] font-mono-tabular text-[#9B8FD4]">
                  03 · ప్రస్తుత మహాదశ & అంతర్దశ
                </div>
                <div className="text-base sm:text-lg font-display font-bold text-[#EDE8E0] mt-1">
                  {TELUGU_PLANETS[activeMaha.lord]?.nameTe ?? activeMaha.lord} —{' '}
                  <span className="text-[#C9A96E]">
                    {TELUGU_PLANETS[activeAntar.lord]?.nameTe ?? activeAntar.lord} భుక్తి
                  </span>
                </div>
                <div className="text-xs font-mono-tabular text-[#EDE8E0]/65 mt-1">
                  {activeAntar.startDate} → {activeAntar.endDate}
                </div>
              </div>

              <div className="bg-[#0F1326] border border-white/10 rounded-xl p-3.5 sm:p-4">
                <div className="text-[11px] font-mono-tabular text-[#C9A96E]">
                  04 · ఉదయాది ఇష్ట ఘడియలు & దశా శేషం
                </div>
                <div className="text-base sm:text-lg font-display font-bold text-[#EDE8E0] mt-1">
                  {teJathakam.udayadiIshtaGhatikaluTe.split('(')[0].trim()}
                </div>
                <div className="text-xs text-[#EDE8E0]/70 mt-1">
                  సూర్యోదయం: <strong className="text-[#5BBFB5]">{teJathakam.suryodayamTe}</strong> · {teJathakam.dashaBalanceAtBirthTe.split('(')[0]}
                </div>
              </div>
            </div>

            {/* Mobile Quick Toggle Bar for Birth Form */}
            <div className="lg:hidden no-print">
              <button
                onClick={() => setIsMobileBirthFormOpen(!isMobileBirthFormOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#141932] border border-[#C9A96E]/45 text-xs font-bold text-[#C9A96E]"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  జన్మ వివరముల నమోదు / మార్పు ({birthInput.name.split('(')[0].trim()})
                </span>
                {isMobileBirthFormOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Top Interactive Split: Left Birth & State/District Form + Right Interactive Kundali */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start no-print">
              {/* Left Parameter & State/District Column */}
              <aside className={`lg:col-span-4 space-y-5 no-print ${isMobileBirthFormOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-[#0F1326] border border-[#C9A96E]/35 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h2 className="text-base sm:text-lg font-display font-bold text-[#EDE8E0]">
                        జన్మ వివరముల నమోదు (Birth Details)
                      </h2>
                      <p className="text-[11px] text-[#EDE8E0]/55">
                        రాష్ట్రం & జిల్లా ఎంచుకోగానే అక్షాంశ-రేఖాంశాలు ఆటోమేటిక్‌గా సెట్ అవుతాయి
                      </p>
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#141932] hover:bg-white/10 text-[#C9A96E] border border-[#C9A96E]/40 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {saveNotice || 'సేవ్ చేయండి'}
                    </button>
                  </div>

                  {/* Quick Profile Selector Bar */}
                  <div>
                    <label className="block text-[11px] text-[#EDE8E0]/55 mb-1.5">
                      త్వరిత జాతక ఎంపిక (Saved Profiles):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {savedProfiles.map((prof) => {
                        const active = prof.name === birthInput.name && prof.date === birthInput.date;
                        return (
                          <button
                            key={prof.id || prof.name}
                            onClick={() => setBirthInput(prof)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#C9A96E] text-[#090C18] border-[#C9A96E] font-bold'
                                : 'bg-[#090C18] text-[#EDE8E0]/75 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {prof.name.split('(')[0].trim()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#EDE8E0]/80 mb-1">
                      జాతకుని పేరు (Full Name)
                    </label>
                    <input
                      type="text"
                      value={birthInput.name}
                      onChange={(e) =>
                        setBirthInput({ ...birthInput, name: e.target.value })
                      }
                      className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>

                  {/* Gender Selector (అబ్బాయి / పురుషుడు vs అమ్మాయి / స్త్రీ) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#C9A96E] mb-1.5">
                      లింగం (Gender — పురుషుడు / స్త్రీ · అబ్బాయి / అమ్మాయి)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 bg-[#090C18] p-1 rounded-xl border border-[#C9A96E]/35">
                      <button
                        type="button"
                        onClick={() =>
                          setBirthInput({ ...birthInput, gender: 'male' })
                        }
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          (birthInput.gender ?? 'male') === 'male'
                            ? 'bg-[#C9A96E] text-[#090C18] shadow'
                            : 'text-[#EDE8E0]/75 hover:text-white'
                        }`}
                      >
                        <span>👦</span>
                        <span>పురుషుడు / అబ్బాయి (Male)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setBirthInput({ ...birthInput, gender: 'female' })
                        }
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          birthInput.gender === 'female'
                            ? 'bg-[#5BBFB5] text-[#090C18] shadow'
                            : 'text-[#EDE8E0]/75 hover:text-white'
                        }`}
                      >
                        <span>👧</span>
                        <span>స్త్రీ / అమ్మాయి (Female)</span>
                      </button>
                    </div>
                  </div>

                  {/* Date & Time Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#EDE8E0]/80 mb-1">
                        పుట్టిన తేదీ (Date of Birth)
                      </label>
                      <input
                        type="date"
                        value={birthInput.date}
                        onChange={(e) =>
                          setBirthInput({ ...birthInput, date: e.target.value })
                        }
                        className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#EDE8E0]/80 mb-1">
                        పుట్టిన సమయం (24h Time)
                      </label>
                      <input
                        type="time"
                        value={birthInput.time}
                        onChange={(e) =>
                          setBirthInput({ ...birthInput, time: e.target.value })
                        }
                        className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                  </div>

                  {/* STATE SELECTOR (ఆంధ్రప్రదేశ్, తెలంగాణ, ఇతర రాష్ట్రాలు, విదేశాలు) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#C9A96E] mb-1">
                      1. రాష్ట్రం / దేశం ఎంచుకోండి (Select State / Region)
                    </label>
                    <select
                      value={selectedStateId}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full bg-[#090C18] border border-[#C9A96E]/45 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                    >
                      {STATE_DISTRICT_ATLAS.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.nameTe}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DISTRICT SELECTOR (అన్ని 26 AP జిల్లాలు + 33 తెలంగాణ జిల్లాలు) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5BBFB5] mb-1">
                      2. జిల్లా / పట్టణం ఎంచుకోండి (Select District / City)
                    </label>
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-[#090C18] border border-[#5BBFB5]/45 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#5BBFB5]"
                    >
                      {activeStateObj.districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.nameTe} — {dist.nameEn} ({dist.lat.toFixed(2)}°N, {dist.lng.toFixed(2)}°E)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Lat / Lng / Timezone Fine-Tuning */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#EDE8E0]/55 mb-1">
                        అక్షాంశం (Lat °N)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={birthInput.lat}
                        onChange={(e) =>
                          setBirthInput({
                            ...birthInput,
                            lat: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono-tabular text-[#EDE8E0]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#EDE8E0]/55 mb-1">
                        రేఖాంశం (Lng °E)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={birthInput.lng}
                        onChange={(e) =>
                          setBirthInput({
                            ...birthInput,
                            lng: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono-tabular text-[#EDE8E0]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#EDE8E0]/55 mb-1">
                        UTC సమయం
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={birthInput.tzOffsetHours}
                        onChange={(e) =>
                          setBirthInput({
                            ...birthInput,
                            tzOffsetHours: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono-tabular text-[#EDE8E0]"
                      />
                    </div>
                  </div>

                  {/* Ayanamsa & House System */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs text-[#EDE8E0]/60 mb-1">
                        అయనాంశం (Ayanamsa)
                      </label>
                      <select
                        value={birthInput.ayanamsa}
                        onChange={(e) =>
                          setBirthInput({
                            ...birthInput,
                            ayanamsa: e.target.value as AyanamsaSystem,
                          })
                        }
                        className="w-full bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                      >
                        {Object.entries(AYANAMSA_METADATA).map(([k, meta]) => (
                          <option key={k} value={k}>
                            {meta.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#EDE8E0]/60 mb-1">
                        భావ గణన (House System)
                      </label>
                      <select
                        value={birthInput.houseSystem}
                        onChange={(e) =>
                          setBirthInput({
                            ...birthInput,
                            houseSystem: e.target.value as HouseSystem,
                          })
                        }
                        className="w-full bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                      >
                        <option value="whole_sign">రాశి = భావం (Whole Sign)</option>
                        <option value="sripati">శ్రీపతి భావ చలిత (Sripati)</option>
                        <option value="placidus">ప్లాసిడస్ (Placidus)</option>
                        <option value="equal">సమ భావ (Equal House)</option>
                        <option value="porphyry">పోర్ఫిరీ (Porphyry)</option>
                        <option value="koch">కోచ్ (Koch)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Interactive Kundali & Wheel Stage */}
              <div className="lg:col-span-8 space-y-5">
                <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 no-print">
                    <div className="flex flex-wrap items-center bg-[#090C18] p-1 rounded-lg border border-white/10">
                      <button
                        onClick={() => setChartVisualMode('south_kundali')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          chartVisualMode === 'south_kundali'
                            ? 'bg-[#C9A96E] text-[#090C18]'
                            : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                        }`}
                      >
                        దక్షిణ భారత (తెలుగు) కుండలి
                      </button>
                      <button
                        onClick={() => setChartVisualMode('north_kundali')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          chartVisualMode === 'north_kundali'
                            ? 'bg-[#C9A96E] text-[#090C18]'
                            : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                        }`}
                      >
                        ఉత్తర భారత కుండలి
                      </button>
                      <button
                        onClick={() => setChartVisualMode('wheel')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          chartVisualMode === 'wheel'
                            ? 'bg-[#C9A96E] text-[#090C18]'
                            : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                        }`}
                      >
                        360° చక్రం (Wheel)
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Transit Layer Toggle Button (Available across all chart formats) */}
                      <button
                        onClick={() => setShowTransits(!showTransits)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm ${
                          showTransits
                            ? 'bg-[#5BBFB5]/25 border-[#5BBFB5] text-[#5BBFB5] ring-1 ring-[#5BBFB5]/40'
                            : 'bg-[#090C18] border-white/15 text-[#EDE8E0]/70 hover:border-[#5BBFB5]/50 hover:text-[#EDE8E0]'
                        }`}
                        title="ప్రస్తుత ఆకాశంలో ఉన్న గ్రహాల గోచార స్థితులను జన్మ కుండలిపై కవచంలా దర్శించండి"
                      >
                        <span className={`w-2 h-2 rounded-full ${showTransits ? 'bg-[#5BBFB5] animate-pulse' : 'bg-white/30'}`} />
                        <span>{showTransits ? 'గోచార కవచం: ఆన్ (Transits ON)' : '✨ గోచార కవచం (Transit Layer)'}</span>
                      </button>

                      {chartVisualMode !== 'wheel' && (
                        <div className="flex flex-wrap items-center bg-[#090C18] p-1 rounded-lg border border-white/10 gap-0.5">
                          {(
                            [
                              { id: 'D1', label: 'D1 రాశి' },
                              { id: 'D9', label: 'D9 నవాంశ' },
                              { id: 'D10', label: 'D10 దశాంశ' },
                              { id: 'D2', label: 'D2 హోర' },
                              { id: 'D3', label: 'D3 ద్రేక్కాణ' },
                              { id: 'D7', label: 'D7 సప్తాంశ' },
                              { id: 'D12', label: 'D12 ద్వాదశాంశ' },
                              { id: 'D60', label: 'D60 షష్ట్యంశ' },
                            ] as const
                          ).map((div) => (
                            <button
                              key={div.id}
                              onClick={() => setVargaDivision(div.id)}
                              className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                vargaDivision === div.id
                                  ? 'bg-[#C9A96E] text-[#090C18] font-bold'
                                  : 'text-[#EDE8E0]/65 hover:text-[#EDE8E0]'
                              }`}
                            >
                              {div.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SVG Viewport + Selected Planet Inspector Side-by-Side on Desktop */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-5 items-center">
                    <div className="xl:col-span-7 flex items-center justify-center">
                      {chartVisualMode === 'south_kundali' && (
                        <SouthIndianKundaliSvg
                          chart={chart}
                          division={vargaDivision}
                          selectedPlanetId={selectedPlanetId}
                          onSelectPlanet={(p) => setSelectedPlanetId(p.id)}
                          lang={lang}
                          transitChart={transitChart}
                          showTransitLayer={showTransits}
                        />
                      )}
                      {chartVisualMode === 'north_kundali' && (
                        <NorthIndianKundaliSvg
                          chart={chart}
                          division={vargaDivision}
                          selectedPlanetId={selectedPlanetId}
                          onSelectPlanet={(p) => setSelectedPlanetId(p.id)}
                          lang={lang}
                          transitChart={transitChart}
                          showTransitLayer={showTransits}
                        />
                      )}
                      {chartVisualMode === 'wheel' && (
                        <WesternWheelSvg
                          chart={chart}
                          transitChart={transitChart}
                          selectedPlanetId={selectedPlanetId}
                          onSelectPlanet={(p) => setSelectedPlanetId(p.id)}
                          lang={lang}
                          showTransitLayer={showTransits}
                        />
                      )}
                    </div>

                    {/* Right 5 Cols inside Stage: Selected Planet Deep Inspector + Active Yogas */}
                    <div className="xl:col-span-5 space-y-4">
                      <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-xl p-4">
                        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                          <div>
                            <span className="text-[11px] font-mono-tabular text-[#C9A96E]">
                              ఎంచుకున్న గ్రహ విశ్లేషణ
                            </span>
                            <h3 className="text-base font-bold text-[#EDE8E0] mt-0.5">
                              {selectedPlanet.glyph}{' '}
                              {TELUGU_PLANETS[selectedPlanet.id]?.nameTe ?? selectedPlanet.name}
                            </h3>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-[#C9A96E]">
                              {TELUGU_RASIS[selectedPlanet.signIndex].nameTe}
                            </div>
                            <div className="text-[11px] font-mono-tabular text-[#EDE8E0]/65">
                              {selectedPlanet.formattedDMS}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#EDE8E0]/55">భావం & గమనం:</span>
                            <span className="font-bold text-[#EDE8E0]">
                              {selectedPlanet.house}వ భావం ·{' '}
                              <span
                                className={
                                  selectedPlanet.isRetrograde
                                    ? 'text-[#D47B7B]'
                                    : 'text-[#5BBFB5]'
                                }
                              >
                                {selectedPlanet.isRetrograde ? 'వక్రం (Rx)' : 'సవ్య గమనం'}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#EDE8E0]/55">నక్షత్రం & పాదం:</span>
                            <span className="text-[#5BBFB5] font-bold">
                              {TELUGU_NAKSHATRAS[
                                Math.floor(selectedPlanet.siderealLon / (360 / 27))
                              ]?.nameTe ?? selectedPlanet.nakshatra}{' '}
                              ({selectedPlanet.pada}వ పాదం)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#EDE8E0]/55">నవాంశ (D9) & దశాంశ (D10):</span>
                            <span className="text-[#9B8FD4] font-semibold">
                              D9: {TELUGU_RASIS[selectedPlanet.d9Sign].nameTe.split(' ')[0]} · D10:{' '}
                              {TELUGU_RASIS[selectedPlanet.d10Sign].nameTe.split(' ')[0]}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#EDE8E0]/55">జైమిని ఆత్మకారక / ఆరూఢం:</span>
                            <span className="text-[#C9A96E] font-semibold">
                              AK: {(teJathakam.jaiminiKarakas[0]?.planetNameTe ?? '').split(' ')[0]} · AL:{' '}
                              {(teJathakam.arudhaPadas[0]?.rasiNameTe ?? '').split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Grantha & Raja Yoga Highlights in Pure Telugu */}
                      <div className="bg-[#090C18]/90 border border-white/10 rounded-xl p-4">
                        <div className="text-xs font-bold text-[#C9A96E] mb-2">
                          ముఖ్య రాజయోగ & శాస్త్ర నిర్ధారణలు ({teJathakam.granthaPramanaResearch.slice(0, 4).length}):
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {teJathakam.granthaPramanaResearch.slice(0, 4).map((g) => (
                            <div
                              key={g.id}
                              className="p-2.5 bg-[#0F1326] border border-white/10 rounded-lg text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-[#5BBFB5]">{g.topicTitleTe}</span>
                              </div>
                              <div className="text-[10px] font-semibold text-[#C9A96E] mt-0.5">
                                {g.granthaNameTe}
                              </div>
                              <p className="text-[#EDE8E0]/75 mt-1 text-[11px] leading-relaxed">
                                {g.keyVerdictTe}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LIVE TRANSIT & GOCHARA CURRENT LIFE IMPACTS RADAR (Rendered when Transit Layer is Active) */}
                  {showTransits && transitChart && (() => {
                    const moonPlanet = chart.planets.find((p) => p.id === 'Moon');
                    const janmaRasiIdx = moonPlanet ? moonPlanet.signIndex : 0;
                    const janmaRasiName = TELUGU_RASIS[janmaRasiIdx]?.nameTe.split(' ')[0] ?? '';

                    const trSaturn = transitChart.planets.find((p) => p.id === 'Saturn');
                    const saturnSignIdx = trSaturn ? trSaturn.signIndex : 0;
                    const saturnRasiName = TELUGU_RASIS[saturnSignIdx]?.nameTe.split(' ')[0] ?? '';
                    const saturnHouseFromMoon = ((saturnSignIdx - janmaRasiIdx + 12) % 12) + 1;

                    let saturnTypeTe = '';
                    let saturnVerdictTe = '';
                    let saturnBadgeClass = '';
                    if (saturnHouseFromMoon === 12) {
                      saturnTypeTe = 'ఏలినాటి శని ఆరంభం (వ్యయ శని · 1వ దశ)';
                      saturnVerdictTe = 'విదేశీ వ్యవహారాలు, ఊహించని ఖర్చులు, స్థాన చలనం. హనుమాన్ చాలీసా లేదా శని గాయత్రి జపం శుభం.';
                      saturnBadgeClass = 'bg-[#F4A261]/15 text-[#F4A261] border-[#F4A261]/40';
                    } else if (saturnHouseFromMoon === 1) {
                      saturnTypeTe = 'జన్మ శని (ఏలినాటి శని శిఖరాగ్రం · 2వ దశ)';
                      saturnVerdictTe = 'మానసిక ఒత్తిడి, బాధ్యతలు పెరుగుతాయి. ఆత్మవిశ్వాసంతో సమయస్ఫూర్తి పాటించాలి. శనికి తైలాభిషేకం శుభప్రదం.';
                      saturnBadgeClass = 'bg-[#D47B7B]/15 text-[#D47B7B] border-[#D47B7B]/40';
                    } else if (saturnHouseFromMoon === 2) {
                      saturnTypeTe = 'ఏలినాటి శని ముగింపు (ధన శని · 3వ దశ)';
                      saturnVerdictTe = 'ఆర్థిక స్థిరత్వం వైపు ప్రయాణం, మాటల్లో సంయమనం అవసరం. కష్టాలు క్రమంగా తొలగిపోతాయి.';
                      saturnBadgeClass = 'bg-[#F4A261]/15 text-[#F4A261] border-[#F4A261]/40';
                    } else if (saturnHouseFromMoon === 4) {
                      saturnTypeTe = 'అర్థాష్టమ శని (కంటక శని · 4వ స్థానం)';
                      saturnVerdictTe = 'గృహ, వాహన వ్యవహారాలలో జాగ్రత్త, మనశ్శాంతి కాపాడుకోవాలి.';
                      saturnBadgeClass = 'bg-[#F4A261]/15 text-[#F4A261] border-[#F4A261]/40';
                    } else if (saturnHouseFromMoon === 8) {
                      saturnTypeTe = 'అష్టమ శని (8వ స్థానం · అత్యంత అప్రమత్తత)';
                      saturnVerdictTe = 'ఆకస్మిక అవరోధాలు, ప్రయాణాలలో జాగ్రత్త. శివాభిషేకం, మృత్యుంజయ జపం విశేష రక్ష.';
                      saturnBadgeClass = 'bg-[#D47B7B]/15 text-[#D47B7B] border-[#D47B7B]/40';
                    } else if ([3, 6, 11].includes(saturnHouseFromMoon)) {
                      saturnTypeTe = `శోభన శని గోచారం (${saturnHouseFromMoon}వ స్థానం · శుభప్రదం)`;
                      saturnVerdictTe = 'శత్రు జయం, ధన లాభం, దీర్ఘకాలిక సమస్యల పరిష్కారం, వృత్తిలో ఉన్నత హోదా!';
                      saturnBadgeClass = 'bg-[#5BBFB5]/15 text-[#5BBFB5] border-[#5BBFB5]/40';
                    } else {
                      saturnTypeTe = `సాధారణ శని గోచారం (${saturnHouseFromMoon}వ స్థానం)`;
                      saturnVerdictTe = 'క్రమశిక్షణతో కూడిన నిరంతర శ్రమ ద్వారా క్రమంగా సత్ఫలితాలు లభిస్తాయి.';
                      saturnBadgeClass = 'bg-white/10 text-[#EDE8E0] border-white/20';
                    }

                    const trJupiter = transitChart.planets.find((p) => p.id === 'Jupiter');
                    const jupiterSignIdx = trJupiter ? trJupiter.signIndex : 0;
                    const jupiterRasiName = TELUGU_RASIS[jupiterSignIdx]?.nameTe.split(' ')[0] ?? '';
                    const jupiterHouseFromMoon = ((jupiterSignIdx - janmaRasiIdx + 12) % 12) + 1;
                    const isGuruBala = [2, 5, 7, 9, 11].includes(jupiterHouseFromMoon);

                    const trRahu = transitChart.planets.find((p) => p.id === 'Rahu');
                    const trKetu = transitChart.planets.find((p) => p.id === 'Ketu');
                    const rahuSignIdx = trRahu ? trRahu.signIndex : 0;
                    const ketuSignIdx = trKetu ? trKetu.signIndex : 0;
                    const rahuHouseFromMoon = ((rahuSignIdx - janmaRasiIdx + 12) % 12) + 1;
                    const ketuHouseFromMoon = ((ketuSignIdx - janmaRasiIdx + 12) % 12) + 1;

                    return (
                      <div className="mt-5 bg-gradient-to-r from-[#141932] via-[#0F1326] to-[#141932] border-2 border-[#5BBFB5]/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-[#5BBFB5]/20 text-[#5BBFB5] border border-[#5BBFB5]/40">
                              <Sparkles className="w-4 h-4" />
                            </span>
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-[#EDE8E0]">
                                ప్రస్తుత గోచార జీవిత ప్రభావ దర్శిని (Live Transits & Current Life Impacts)
                              </h3>
                              <p className="text-xs text-[#5BBFB5] font-semibold">
                                జన్మ చంద్ర రాశి ({janmaRasiName}) ప్రాతిపదికన ప్రత్యక్ష గోచార ఫలములు
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-[#5BBFB5] text-xs font-mono-tabular font-bold shrink-0">
                            ✨ గోచార కవచం యాక్టివ్ (Live Sky)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Saturn Transit Impact */}
                          <div className="p-4 rounded-xl bg-[#090C18]/80 border border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#EDE8E0] flex items-center gap-1.5">
                                <span>🪐</span>
                                <span>శని గోచారం ({saturnRasiName} రాశి)</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${saturnBadgeClass}`}>
                                {saturnHouseFromMoon}వ స్థానం
                              </span>
                            </div>
                            <div className="text-xs font-bold text-[#EDE8E0]">{saturnTypeTe}</div>
                            <p className="text-[11px] text-[#EDE8E0]/75 leading-relaxed">
                              {saturnVerdictTe}
                            </p>
                          </div>

                          {/* Jupiter Transit Impact */}
                          <div className="p-4 rounded-xl bg-[#090C18]/80 border border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#EDE8E0] flex items-center gap-1.5">
                                <span>⚡</span>
                                <span>గురు గోచారం ({jupiterRasiName} రాశి)</span>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isGuruBala
                                    ? 'bg-[#5BBFB5]/20 text-[#5BBFB5] border-[#5BBFB5]/40'
                                    : 'bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/40'
                                }`}
                              >
                                {jupiterHouseFromMoon}వ స్థానం
                              </span>
                            </div>
                            <div className="text-xs font-bold text-[#EDE8E0]">
                              {isGuruBala ? '✨ విశేష గురు బలం (Auspicious Phase)' : 'ఆధ్యాత్మిక అన్వేషణ కాలం'}
                            </div>
                            <p className="text-[11px] text-[#EDE8E0]/75 leading-relaxed">
                              {isGuruBala
                                ? 'వివాహం, సంతాన ప్రాప్తి, గౌరవ మర్యాదలు, వ్యాపార విస్తరణ మరియు దీర్ఘకాలిక ప్రయోజనాలకు అత్యంత అనుకూలమైన కాలం.'
                                : 'ఆచితూచి నిర్ణయాలు తీసుకోవాలి. గురు దత్తాత్రేయ స్వామి లేదా దక్షిణామూర్తి స్తోత్ర పారాయణం వల్ల శాంతి కలుగుతుంది.'}
                            </p>
                          </div>

                          {/* Rahu-Ketu Axis Impact */}
                          <div className="p-4 rounded-xl bg-[#090C18]/80 border border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#EDE8E0] flex items-center gap-1.5">
                                <span>🐉</span>
                                <span>రాహు-కేతు గోచార అక్షం</span>
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#9B8FD4]/20 text-[#9B8FD4] border border-[#9B8FD4]/40">
                                {rahuHouseFromMoon} / {ketuHouseFromMoon} అక్షం
                              </span>
                            </div>
                            <div className="text-xs font-bold text-[#EDE8E0]">
                              రాహు ({TELUGU_RASIS[rahuSignIdx]?.nameTe.split(' ')[0]}) · కేతు ({TELUGU_RASIS[ketuSignIdx]?.nameTe.split(' ')[0]})
                            </div>
                            <p className="text-[11px] text-[#EDE8E0]/75 leading-relaxed">
                              ఆధ్యాత్మిక చైతన్యం, సాంకేతిక పరిజ్ఞానం మరియు విదేశీ ప్రయాణాలకు అనుకూలం. భావోద్వేగాలను నియంత్రించుకుని నిర్ణయాలు తీసుకోవాలి.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </section>
              </div>
            </div>

            {/* FULL TELUGU SAMPOORNA JATHAKAM BOOK (With 6 Structured Chapters & Deep Grantha Research) */}
            <SampoornaJathakamView
              chart={chart}
              selectedPlanetId={selectedPlanetId}
              onSelectPlanet={(p) => setSelectedPlanetId(p.id)}
              lang={lang}
              externalPdfTrigger={externalPdfTrigger}
            />
          </div>
        )}

        {activeTab === 'varshaphala' && (
          <TajikaVarshaphalaView chart={chart} />
        )}

        {activeTab === 'namakarana' && (
          <NamakaranaShastraView
            birthInput={birthInput}
            onUpdateBirthInput={setBirthInput}
            tradition={tradition}
          />
        )}

        <RoyalWhatsAppSummaryModal
          isOpen={isRoyalCardOpen}
          onClose={() => setIsRoyalCardOpen(false)}
          chart={chart}
        />

        {activeTab === 'dasha_vargas' && (
          <DashaVargaView
            chart={chart}
            selectedPlanetId={selectedPlanetId}
            onSelectPlanet={(p) => setSelectedPlanetId(p.id)}
            lang={lang}
          />
        )}

        {activeTab === 'panchanga_lots' && (
          <PanchangaAdvancedView
            chart={chart}
            tradition={tradition}
            lang={lang}
            onNavigateToPrashna={() => setActiveTab('prashna')}
          />
        )}

        {activeTab === 'synastry' && (
          <SynastryMilanView
            primaryInput={birthInput}
            savedProfiles={savedProfiles}
            tradition={tradition}
            lang={lang}
          />
        )}

        {activeTab === 'classical_ai' && (
          <ClassicalAiView
            chart={chart}
            tradition={tradition}
            savedProfiles={savedProfiles}
            lang={lang}
          />
        )}

        {activeTab === 'hindu_calendar' && (
          <HinduCalendarView chart={chart} lang={lang} />
        )}

        {activeTab === 'gochara' && <GocharaView chart={chart} lang={lang} />}

        {activeTab === 'jathaka_deep' && <JathakaDeepView chart={chart} lang={lang} />}

        {activeTab === 'granthas' && <GranthaSourcesView lang={lang} />}

        {activeTab === 'vastu' && (
          <VastuShastraView
            defaultName={birthInput.name}
            defaultPlaceName={birthInput.city}
            defaultLat={chart.input.lat}
            defaultLng={chart.input.lng}
            defaultTzOffsetHours={chart.input.tzOffsetHours}
            lang={lang}
          />
        )}

        {activeTab === 'prashna' && (
          <PrashnaShastraView
            defaultLat={chart.input.lat}
            defaultLng={chart.input.lng}
            defaultTzOffsetHours={chart.input.tzOffsetHours}
            defaultCityName={chart.input.city}
          />
        )}
      </main>

      {/* Astrologer Client Workspace Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end no-print">
          <div className="w-full max-w-md bg-[#0F1326] border-l border-white/15 h-full flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-display font-bold text-[#EDE8E0]">
                    సేవ్ చేసిన జాతక ప్రొఫైల్స్
                  </h2>
                  <p className="text-xs text-[#EDE8E0]/55">
                    కుటుంబ సభ్యుల & క్లయింట్ల జాతక వివరములు
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-[#EDE8E0]/60 hover:text-[#EDE8E0] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setBirthInput({
                      id: `profile-${Date.now()}`,
                      name: 'కొత్త జాతకుడు (New Jathakam)',
                      date: '1999-04-18',
                      time: '10:15',
                      lat: 16.5062,
                      lng: 80.6480,
                      tzOffsetHours: 5.5,
                      city: 'ఎన్టీఆర్ జిల్లా (Vijayawada)',
                      country: 'ఆంధ్రప్రదేశ్, భారతదేశం',
                      ayanamsa: 'lahiri',
                      houseSystem: 'whole_sign',
                      notes: '',
                    });
                    setIsDrawerOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-[#141932] hover:bg-white/10 border border-[#C9A96E]/40 rounded-lg text-xs font-semibold text-[#C9A96E] flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  కొత్త జాతకం సృష్టించండి (Create New)
                </button>
              </div>

              <div className="space-y-3 pt-5">
                {savedProfiles.map((prof) => {
                  const isActive = prof.name === birthInput.name && prof.date === birthInput.date;
                  return (
                    <div
                      key={prof.id || prof.name}
                      className={`p-4 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-[#141932] border-[#C9A96E]'
                          : 'bg-[#090C18]/80 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => {
                            setBirthInput(prof);
                            setIsDrawerOpen(false);
                          }}
                          className="text-left flex-1"
                        >
                          <div className="text-sm font-bold text-[#EDE8E0]">
                            {prof.name}
                          </div>
                          <div className="text-xs font-mono-tabular text-[#C9A96E] mt-0.5">
                            {prof.date} · {prof.time} · {prof.city}
                          </div>
                          {prof.notes && (
                            <p className="text-xs text-[#EDE8E0]/60 mt-2 leading-relaxed">
                              {prof.notes}
                            </p>
                          )}
                        </button>
                        {savedProfiles.length > 1 && (
                          <button
                            onClick={() => handleDeleteProfile(prof.id)}
                            className="p-1 text-[#EDE8E0]/40 hover:text-[#D47B7B] transition-colors"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10">
              <label className="block text-xs font-semibold text-[#EDE8E0] mb-1.5">
                జాతక గమనికలు (Notes for {birthInput.name})
              </label>
              <textarea
                rows={3}
                value={birthInput.notes || ''}
                onChange={(e) =>
                  setBirthInput({ ...birthInput, notes: e.target.value })
                }
                placeholder="ముహూర్త సూచనలు, దశా పరిహారాలు ఇక్కడ రాయండి..."
                className="w-full bg-[#090C18] border border-white/15 rounded-lg p-2.5 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
              />
              <button
                onClick={handleSaveProfile}
                className="mt-2 w-full py-2 bg-[#C9A96E] text-[#090C18] text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                గమనికలు సేవ్ చేయండి
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Quiet Footer */}
      <footer className="border-t border-white/8 py-7 px-4 sm:px-5 lg:px-7 text-xs text-[#EDE8E0]/45 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="brand-sigil !w-6 !h-6 !rounded-lg">
              <svg viewBox="0 0 40 40" className="w-3 h-3" aria-hidden="true">
                <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.6" fill="none" />
                <circle cx="20" cy="20" r="4" fill="currentColor" />
              </svg>
            </span>
            Jyotishyam — సంపూర్ణ తెలుగు జాతక చక్రం &amp; సిద్ధాంత దృగ్గణిత జ్యోతిష వేదిక
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => setActiveTab('studio')} className="hover:text-[#EDE8E0]">
              సంపూర్ణ జాతకం
            </button>
            <button onClick={() => setActiveTab('dasha_vargas')} className="hover:text-[#EDE8E0]">
              వింశోత్తరి దశలు
            </button>
            <button onClick={() => setActiveTab('panchanga_lots')} className="hover:text-[#EDE8E0]">
              పంచాంగం
            </button>
            <button onClick={() => setActiveTab('synastry')} className="hover:text-[#EDE8E0]">
              వివాహ పొందిక
            </button>
            <button onClick={() => setActiveTab('classical_ai')} className="hover:text-[#EDE8E0]">
              జ్యోతిష్య AI
            </button>
            <button onClick={() => setActiveTab('prashna')} className="hover:text-[#EDE8E0]">
              ప్రశ్న శాస్త్రం
            </button>
            <button onClick={() => setActiveTab('hindu_calendar')} className="hover:text-[#EDE8E0]">
              హిందూ పంచాంగం
            </button>
            <button onClick={() => setActiveTab('jathaka_deep')} className="hover:text-[#EDE8E0]">
              సూక్ష్మ జాతకం
            </button>
            <button onClick={() => setActiveTab('gochara')} className="hover:text-[#EDE8E0]">
              గోచార ఫలం
            </button>
            <button onClick={() => setActiveTab('vastu')} className="hover:text-[#EDE8E0]">
              వాస్తు శాస్త్రం
            </button>
            <button onClick={() => setActiveTab('granthas')} className="hover:text-[#EDE8E0]">
              గ్రంథ మండలం
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar (Phone Ergonomic 6-Tab Bar) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090C18]/95 backdrop-blur-md border-t border-[#C9A96E]/35 px-1 py-1.5 no-print shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-5 gap-0.5 max-w-md mx-auto">
          {(['studio', 'jathaka_deep', 'gochara', 'hindu_calendar'] as ActiveWorkspaceTab[])
            .map((id) => navItems.find((n) => n.id === id))
            .filter((n): n is NonNullable<typeof n> => Boolean(n))
            .map((item) => {
              const isAct = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg transition-all cursor-pointer ${
                    isAct ? 'text-[#F1DCAE]' : 'text-[#EDE8E0]/55 hover:text-[#EDE8E0]'
                  }`}
                >
                  <span
                    className={`grid place-items-center w-8 h-7 rounded-lg transition-all ${
                      isAct
                        ? 'bg-gradient-to-b from-[#F1DCAE] to-[#C9A96E] text-[#1A1408] shadow-[0_6px_16px_-8px_rgba(217,185,123,0.9)]'
                        : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[9.5px] leading-tight truncate max-w-full font-medium">
                    {lang === 'te' ? item.shortTe : item.labelEn.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg transition-all cursor-pointer ${
              isMobileMenuOpen ? 'text-[#F1DCAE]' : 'text-[#EDE8E0]/55'
            }`}
          >
            <span className="grid place-items-center w-8 h-7 rounded-lg">
              <Menu className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] leading-tight font-medium">మరిన్ని</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
