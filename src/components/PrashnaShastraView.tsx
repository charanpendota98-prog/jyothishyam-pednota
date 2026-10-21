import React, { useMemo, useState } from 'react';
import {
  Compass,
  Clock,
  Sparkles,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  MapPin,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Printer,
  ChevronRight,
  Flame,
  Award,
  Calendar,
  Layers,
  FileText,
  Target,
  Crosshair,
  Timer,
  CheckCheck,
  Key,
  ArrowUpRight,
  Lock,
  Unlock,
  Hourglass,
  TrendingUp,
  Eye,
  Zap,
} from 'lucide-react';
import {
  PRASHNA_CATEGORIES,
  calculatePrashnaReport,
  getKpSubLordForNumber,
  type PrashnaCategoryId,
  type PrashnaReport,
} from '../engine/prashnaEngine.ts';
import {
  SouthIndianKundaliSvg,
  NorthIndianKundaliSvg,
} from './ChartsSvg.tsx';
import type { PlanetPosition } from '../engine/ephemeris.ts';

interface HoraryCompassRoseProps {
  degree: number;
  directionTe: string;
}

const HoraryCompassRose: React.FC<HoraryCompassRoseProps> = ({ degree, directionTe }) => {
  const normDeg = ((degree % 360) + 360) % 360;
  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto flex items-center justify-center select-none">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
        <defs>
          <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#141932" />
            <stop offset="100%" stopColor="#090C18" />
          </radialGradient>
          <linearGradient id="needleGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE194" />
            <stop offset="100%" stopColor="#C9A96E" />
          </linearGradient>
        </defs>

        {/* Outer Ring & Ticks */}
        <circle cx="100" cy="100" r="94" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
        <circle cx="100" cy="100" r="86" fill="url(#compassBg)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* 8 Cardinal Radial Guides */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => {
          const rad = (ang - 90) * (Math.PI / 180);
          const x1 = 100 + 40 * Math.cos(rad);
          const y1 = 100 + 40 * Math.sin(rad);
          const x2 = 100 + 78 * Math.cos(rad);
          const y2 = 100 + 78 * Math.sin(rad);
          return (
            <line
              key={`compass-ray-${ang}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={ang % 90 === 0 ? 'rgba(201,169,110,0.35)' : 'rgba(255,255,255,0.1)'}
              strokeWidth={ang % 90 === 0 ? 1.5 : 1}
            />
          );
        })}

        {/* Cardinal Directions Labels */}
        <text x="100" y="26" textAnchor="middle" fill="#5BBFB5" fontSize="10" fontWeight="bold">ఉ (N)</text>
        <text x="178" y="104" textAnchor="middle" fill="#C9A96E" fontSize="10" fontWeight="bold">తూ (E)</text>
        <text x="100" y="182" textAnchor="middle" fill="#EDE8E0" fontSize="10" fontWeight="bold">ద (S)</text>
        <text x="22" y="104" textAnchor="middle" fill="#EDE8E0" fontSize="10" fontWeight="bold">ప (W)</text>

        {/* Diagonal Corner Labels */}
        <text x="156" y="44" textAnchor="middle" fill="#EDE8E0" fontSize="7.5" opacity="0.75">ఈశాన్యం</text>
        <text x="158" y="164" textAnchor="middle" fill="#EDE8E0" fontSize="7.5" opacity="0.75">ఆగ్నేయం</text>
        <text x="42" y="164" textAnchor="middle" fill="#EDE8E0" fontSize="7.5" opacity="0.75">నైరుతి</text>
        <text x="42" y="44" textAnchor="middle" fill="#EDE8E0" fontSize="7.5" opacity="0.75">వాయువ్యం</text>

        {/* Target Needle (Rotated by Target Degree) */}
        <g transform={`rotate(${normDeg} 100 100)`}>
          {/* North/Target pointer tip */}
          <polygon points="100,22 107,94 93,94" fill="url(#needleGold)" filter="drop-shadow(0 0 4px #C9A96E)" />
          {/* Subtle 3D needle split */}
          <polygon points="100,22 93,94 100,90" fill="#A88746" />
          {/* Counter tail */}
          <polygon points="100,166 105,106 95,106" fill="#475569" />
        </g>

        {/* Center Pivot */}
        <circle cx="100" cy="100" r="7" fill="#C9A96E" stroke="#090C18" strokeWidth="2" />
        <circle cx="100" cy="100" r="2.5" fill="#090C18" />
      </svg>

      {/* Target Direction Chip overlay */}
      <div className="absolute -bottom-2 bg-[#090C18] border border-[#C9A96E] px-3 py-0.5 rounded-full text-[10px] font-mono-tabular font-bold text-[#C9A96E] shadow-md flex items-center gap-1">
        <Target className="w-3 h-3 text-[#5BBFB5]" />
        <span>{normDeg}° {directionTe.split(' ')[0]}</span>
      </div>
    </div>
  );
};

interface PrashnaShastraViewProps {
  defaultLat: number;
  defaultLng: number;
  defaultTzOffsetHours: number;
  defaultCityName: string;
}

export const PrashnaShastraView: React.FC<PrashnaShastraViewProps> = ({
  defaultLat,
  defaultLng,
  defaultTzOffsetHours,
  defaultCityName,
}) => {
  const [categoryKey, setCategoryKey] = useState<PrashnaCategoryId>('lost_item');
  const [questionText, setQuestionText] = useState<string>('');
  const [kpNumberStr, setKpNumberStr] = useState<string>('');
  const [chartMode, setChartMode] = useState<'south' | 'north'>('south');

  // Query Date & Time State (Defaults to Current Moment)
  const [queryDateObj, setQueryDateObj] = useState<Date>(() => new Date());
  const [queryDateStr, setQueryDateStr] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [queryTimeStr, setQueryTimeStr] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>('Moon');

  // KP Sub Lord Preview
  const kpPreview = useMemo(() => {
    const num = parseInt(kpNumberStr, 10);
    if (!isNaN(num) && num >= 1 && num <= 249) {
      return getKpSubLordForNumber(num);
    }
    return null;
  }, [kpNumberStr]);

  // Recalculate full Prashna report
  const report: PrashnaReport = useMemo(() => {
    const [year, month, day] = queryDateStr.split('-').map(Number);
    const [hours, minutes] = queryTimeStr.split(':').map(Number);

    const targetDate = new Date(year, (month || 1) - 1, day || 1, hours || 12, minutes || 0, 0);
    const kpNum = parseInt(kpNumberStr, 10);

    return calculatePrashnaReport(
      targetDate,
      categoryKey,
      questionText,
      defaultLat,
      defaultLng,
      defaultTzOffsetHours,
      defaultCityName,
      'భారతదేశం',
      isNaN(kpNum) ? undefined : kpNum
    );
  }, [
    queryDateStr,
    queryTimeStr,
    categoryKey,
    questionText,
    defaultLat,
    defaultLng,
    defaultTzOffsetHours,
    defaultCityName,
    kpNumberStr,
  ]);

  const handleCastRightNow = () => {
    const now = new Date();
    setQueryDateObj(now);
    setQueryDateStr(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
    setQueryTimeStr(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  };

  const activeCategoryMeta = PRASHNA_CATEGORIES[categoryKey];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Hero: Grand Prashna Shastra Title & Live Cast Trigger */}
      <section className="bg-gradient-to-r from-[#171B36] via-[#10142B] to-[#0A0D1E] border-2 border-[#C9A96E]/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                వేదోక్త ప్రశ్న శాస్త్రం (HORARY ASTROLOGY)
              </span>
              <span className="text-xs text-[#5BBFB5] font-semibold">
                ప్రశ్న మార్గం · దైవజ్ఞ వల్లభ · తాజిక నీలకంఠి ప్రామాణికం
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#EDE8E0] tracking-wide">
              శ్రీ ప్రశ్న జ్యోతిష్యం — <span className="text-[#C9A96E]">క్షణ ప్రశ్న విచార పీఠం</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#EDE8E0]/80 max-w-3xl leading-relaxed">
              జన్మ సమయం తెలియని వారికి లేదా అత్యవసరంగా ఒక నిర్దిష్ట విషయం (పోయిన వస్తువు ఎక్కడుంది, ఆటంకాలు తొలగి కార్యం ఎప్పుడు నెరవేరుతుంది, ఉద్యోగం, వివాహం, ఆరోగ్యం) గురించి తెలుసుకోవడానికి ప్రచ్ఛకుడు ప్రశ్న అడిగిన క్షణ కుండలిని పరిశీలించి తీర్పు చెప్పే మహత్తర శాస్త్రం.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#EDE8E0]/70 pt-1">
              <span className="flex items-center gap-1 text-[#C9A96E]">
                <MapPin className="w-3.5 h-3.5" />
                ప్రదేశం: <strong>{defaultCityName}</strong>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#5BBFB5]">
                <Clock className="w-3.5 h-3.5" />
                ప్రశ్నా సమయం: <strong>{report.formattedQueryDateTimeTe}</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Button: Cast Prashna Right Now */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={handleCastRightNow}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#d8b97e] text-[#090C18] text-sm font-bold shadow-lg hover:shadow-xl hover:from-[#d8b97e] hover:to-[#C9A96E] transition-all cursor-pointer"
              title="ఇప్పుడే ప్రశ్న అడిగితే ప్రస్తుత క్షణ సమయానికి కుండలి వేసి తీర్పు పొందండి"
            >
              <RotateCw className="w-4 h-4" />
              ప్రస్తుత క్షణ ప్రశ్న వేయండి (Cast Now)
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#090C18] border border-white/15 text-xs font-semibold text-[#EDE8E0] hover:border-[#C9A96E] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#C9A96E]" />
              ప్రశ్నా పత్రం ముద్రణ (Print)
            </button>
          </div>
        </div>
      </section>

      {/* Hot-Key Query Quick Launchers for the 2 Most Requested Prashna Enquiries */}
      <section className="bg-gradient-to-r from-[#141932] via-[#0F1326] to-[#141932] border border-[#C9A96E]/40 rounded-2xl p-5 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
              అత్యంత ప్రాచుర్యం పొందిన క్షణ ప్రశ్న శోధనలు (Most Requested Classical Horary Queries)
            </span>
          </div>
          <span className="text-[11px] text-[#5BBFB5] font-mono-tabular">
            ఆరూఢ లగ్న + కార్య భావ సమన్వయ ఇంజిన్
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Option 1: Lost Item */}
          <button
            onClick={() => {
              setCategoryKey('lost_item');
              setQuestionText(PRASHNA_CATEGORIES.lost_item.defaultQuestionTe);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-4 ${
              categoryKey === 'lost_item'
                ? 'bg-gradient-to-br from-[#1A2342] to-[#0E1328] border-[#5BBFB5] ring-2 ring-[#5BBFB5]/40 shadow-lg'
                : 'bg-[#090C18]/90 border-white/15 hover:border-[#5BBFB5]/50 hover:bg-[#12162E]'
            }`}
          >
            <div className="p-3 rounded-xl bg-[#5BBFB5]/15 border border-[#5BBFB5]/30 text-[#5BBFB5] shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#EDE8E0]">
                  1. నష్ట ద్రవ్య శోధన (Lost Item Location & Time)
                </span>
                {categoryKey === 'lost_item' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#5BBFB5] text-[#090C18]">
                    సక్రియం
                  </span>
                )}
              </div>
              <p className="text-xs text-[#EDE8E0]/75 leading-relaxed">
                పోయిన వస్తువు (బంగారం, పత్రాలు, పర్సు, ఫోన్) ఎక్కడుంది? ఏ దిక్కున ఉంది? ఇంట్లోనే ఉందా? ఎప్పుడు దొరుకుతుంది?
              </p>
              <div className="text-[11px] text-[#5BBFB5] font-mono-tabular font-semibold pt-1">
                చతుర్థ భావం + ఆరూఢ లగ్నం + కార్తవీర్యార్జున మంత్ర సాధన
              </div>
            </div>
          </button>

          {/* Quick Option 2: Delayed Action */}
          <button
            onClick={() => {
              setCategoryKey('work_delay');
              setQuestionText(PRASHNA_CATEGORIES.work_delay.defaultQuestionTe);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-4 ${
              categoryKey === 'work_delay'
                ? 'bg-gradient-to-br from-[#271E36] to-[#0E1328] border-[#C9A96E] ring-2 ring-[#C9A96E]/40 shadow-lg'
                : 'bg-[#090C18]/90 border-white/15 hover:border-[#C9A96E]/50 hover:bg-[#12162E]'
            }`}
          >
            <div className="p-3 rounded-xl bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#C9A96E] shrink-0">
              <Timer className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#EDE8E0]">
                  2. కార్య విలంబన నివారణ (Delayed Actions & Timing)
                </span>
                {categoryKey === 'work_delay' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C9A96E] text-[#090C18]">
                    సక్రియం
                  </span>
                )}
              </div>
              <p className="text-xs text-[#EDE8E0]/75 leading-relaxed">
                తలపెట్టిన పని ఎందుకు ఆలస్యమవుతోంది? ఆటంకానికి మూల కారణం ఏమిటి? ఏ సమయానికి పని సిద్ధిస్తుంది?
              </p>
              <div className="text-[11px] text-[#C9A96E] font-mono-tabular font-semibold pt-1">
                దశమ/ఏకాదశ భావం + లాభారూఢం + బాధక నివారణ
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Category Pills Navigation (All 10 Specialized Horary Areas) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-[#C9A96E] font-bold">
            అన్ని ప్రశ్న విభాగాలు (All 10 Classical Categories):
          </div>
          <div className="text-xs text-[#EDE8E0]/60">
            కార్య భావం: <strong className="text-[#5BBFB5]">{activeCategoryMeta.karyaBhavaNumber}వ స్థానం</strong> · కారకుడు: <strong className="text-[#C9A96E]">{activeCategoryMeta.karyaKarakaPlanet}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {(Object.keys(PRASHNA_CATEGORIES) as PrashnaCategoryId[]).map((catId) => {
            const cat = PRASHNA_CATEGORIES[catId];
            const isActive = categoryKey === catId;
            return (
              <button
                key={`prashna-cat-${catId}`}
                onClick={() => {
                  setCategoryKey(catId);
                  setQuestionText(cat.defaultQuestionTe);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#141932] border-[#C9A96E] shadow-lg ring-1 ring-[#C9A96E]'
                    : 'bg-[#090C18]/80 border-white/10 hover:border-white/25 hover:bg-[#0F1326]'
                }`}
              >
                <div className="text-xs font-bold leading-snug line-clamp-2 text-[#EDE8E0]">
                  {cat.titleTe.split(' (')[0]}
                </div>
                <div className="text-[10px] text-[#C9A96E] mt-1 font-mono-tabular">
                  {cat.titleEn}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Question Customizer & Scrubber Panel */}
      <section className="bg-[#0F1326] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Question Text */}
          <div className="lg:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-[#EDE8E0]">
              మీ నిర్దిష్ట ప్రశ్న (Specific Inquiry Query):
            </label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={activeCategoryMeta.defaultQuestionTe}
              className="w-full bg-[#090C18] border border-white/15 focus:border-[#C9A96E] rounded-lg px-3.5 py-2 text-xs text-[#EDE8E0] placeholder-white/30 focus:outline-none"
            />
            <div className="text-[11px] text-[#EDE8E0]/60">
              {activeCategoryMeta.descriptionTe}
            </div>
          </div>

          {/* Date Picker */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#EDE8E0]">ప్రశ్నా తేదీ:</label>
            <input
              type="date"
              value={queryDateStr}
              onChange={(e) => setQueryDateStr(e.target.value)}
              className="w-full bg-[#090C18] border border-white/15 focus:border-[#C9A96E] rounded-lg px-3 py-2 text-xs text-[#EDE8E0] font-mono-tabular focus:outline-none"
            />
          </div>

          {/* Time Picker */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#EDE8E0]">ప్రశ్నా సమయం:</label>
            <input
              type="time"
              value={queryTimeStr}
              onChange={(e) => setQueryTimeStr(e.target.value)}
              className="w-full bg-[#090C18] border border-white/15 focus:border-[#C9A96E] rounded-lg px-3 py-2 text-xs text-[#EDE8E0] font-mono-tabular focus:outline-none"
            />
          </div>

          {/* Optional KP Prashna Number 1-249 */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#5BBFB5]">
              KP సంఖ్య (1–249):
            </label>
            <input
              type="number"
              min={1}
              max={249}
              value={kpNumberStr}
              onChange={(e) => setKpNumberStr(e.target.value)}
              placeholder="ఐచ్ఛికం (1..249)"
              className="w-full bg-[#090C18] border border-white/15 focus:border-[#5BBFB5] rounded-lg px-3 py-2 text-xs text-[#EDE8E0] font-mono-tabular focus:outline-none"
            />
          </div>
        </div>

        {/* KP Sub-Lord Feedback if provided */}
        {kpPreview && (
          <div className="p-2.5 rounded-lg bg-[#5BBFB5]/10 border border-[#5BBFB5]/30 text-xs flex flex-wrap items-center justify-between gap-2 text-[#5BBFB5]">
            <span>
              KP Prashna #{kpNumberStr} → రాశి: <strong>{kpPreview.signNameTe} ({kpPreview.cuspDegreeDMS})</strong>
            </span>
            <span>
              నక్షత్రాధిపతి: <strong>{kpPreview.starLordTe}</strong> · ఉప-నాథుడు (Sub-Lord):{' '}
              <strong className="underline font-bold text-white">{kpPreview.subLordTe}</strong>
            </span>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* AUTOMATED ARUDHA LAGNA PRASHNA ANALYSIS ENGINE (ఆటోమేటెడ్ ఆరూఢ లగ్న క్షణ ప్రశ్న విశ్లేషణ పీఠం) */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-[#151A36] via-[#0E1228] to-[#12162E] border-2 border-[#C9A96E]/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/15 pb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40 text-[10px] font-mono-tabular font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Vedic Horary Engine · Arudha Lagna (AL) Cross-Referencing
              </span>
              <span className="text-xs text-[#5BBFB5] font-semibold">
                జైమిని & ప్రశ్నమార్గ ప్రామాణికం
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDE8E0]">
              ఆటోమేటెడ్ ఆరూఢ లగ్న క్షణ ప్రశ్న విశ్లేషణ ఇంజిన్
            </h2>
            <p className="text-xs text-[#EDE8E0]/75 max-w-3xl leading-relaxed">
              ప్రశ్న కాల గ్రహ స్థితులను ఆరూఢ లగ్నంతో (Arudha Lagna) క్రాస్-రిఫరెన్స్ చేసి, పోయిన వస్తువుల ఖచ్చితమైన దిక్కు, స్థలం, ఎత్తు మట్టం మరియు ఆలస్యమైన పనుల నిర్దిష్ట సమాప్తి సమయాలను కాలానుగుణంగా లెక్కించే అత్యున్నత వైదిక విధానం.
            </p>
          </div>

          {/* Arudha Lagna Status Pill */}
          <div className="bg-[#090C18]/95 border border-[#C9A96E]/50 rounded-xl p-3.5 flex items-center gap-3 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-[#C9A96E]/15 border border-[#C9A96E]/40 flex items-center justify-center text-[#C9A96E] font-bold font-mono-tabular text-sm">
              AL
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono-tabular text-[#EDE8E0]/60">
                ఆరూఢ లగ్నం (Arudha Lagna)
              </div>
              <div className="text-sm font-bold text-[#EDE8E0]">
                {report.arudhaLagna.signNameTe} ({report.arudhaLagna.signNameEn})
              </div>
              <div className="text-[10px] text-[#5BBFB5]">
                లగ్నం నుండి {report.arudhaLagna.houseFromLagna}వ స్థానం · నాథుడు: {report.arudhaLagna.lordNameTe}
              </div>
            </div>
          </div>
        </div>

        {/* Arudha Lagna Deep Astrological Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#090C18]/80 border border-white/10 space-y-1">
            <div className="text-[#EDE8E0]/60 text-[10px]">కార్యాధిపతి స్థానం (AL నుండి):</div>
            <div className="font-bold text-sm text-[#5BBFB5]">
              {report.arudhaLagna.karyeshaHouseFromArudha}వ ఇల్లు
            </div>
            <div className="text-[10px] text-[#EDE8E0]/70">
              {[1, 2, 4, 5, 7, 9, 10, 11].includes(report.arudhaLagna.karyeshaHouseFromArudha)
                ? '✅ అత్యంత శుభప్రద స్థానం'
                : '⚠️ వ్యయ/రంధ్ర స్థానం'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090C18]/80 border border-white/10 space-y-1">
            <div className="text-[#EDE8E0]/60 text-[10px]">ఆరూఢాధిపతి స్థితి (AL నుండి):</div>
            <div className="font-bold text-sm text-[#C9A96E]">
              {report.arudhaLagna.lordHouseFromArudha}వ ఇల్లు
            </div>
            <div className="text-[10px] text-[#EDE8E0]/70">
              నాథుడు: {report.arudhaLagna.lordNameTe}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090C18]/80 border border-white/10 space-y-1">
            <div className="text-[#EDE8E0]/60 text-[10px]">ఆరూఢ దిక్కు & తత్త్వం:</div>
            <div className="font-bold text-sm text-[#EDE8E0]">
              {report.arudhaLagna.cardinalDirectionTe.split(' ')[0]} ({report.arudhaLagna.cardinalAngleDeg}°)
            </div>
            <div className="text-[10px] text-[#5BBFB5]">
              {report.arudhaLagna.elementNatureTe}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090C18]/80 border border-white/10 space-y-1">
            <div className="text-[#EDE8E0]/60 text-[10px]">చంద్రుని స్థితి (AL నుండి):</div>
            <div className="font-bold text-sm text-[#EDE8E0]">
              {report.arudhaLagna.chandraHouseFromArudha}వ ఇల్లు
            </div>
            <div className="text-[10px] text-[#C9A96E]">
              ప్రశ్న చంద్రబలం: {report.prashnaChandra.chandrabalaTe}
            </div>
          </div>
        </div>

        {/* Shastra Arudha Verdict Box */}
        <div className="p-4 rounded-xl bg-[#090C18]/90 border border-[#C9A96E]/30 flex items-start gap-3 text-xs leading-relaxed">
          <BookOpen className="w-5 h-5 text-[#C9A96E] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#C9A96E]">ఆరూఢ శాస్త్ర నిశ్చయం (Arudha Shastra Verdict): </span>
            <span className="text-[#EDE8E0]/90">{report.arudhaLagna.arudhaShastraVerdictTe}</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* DOMAIN MODULE 1: LOST ITEM TIME-BOUND DIAGNOSTICS (నష్ట ద్రవ్య శోధన)   */}
        {/* ======================================================================= */}
        {report.lostItemDetail && (
          <div className="bg-[#090C18] border-2 border-[#5BBFB5]/40 rounded-xl p-5 sm:p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#5BBFB5]/20 text-[#5BBFB5] text-[10px] font-mono-tabular font-bold uppercase">
                    Lost Item Horizon Compass & Timing
                  </span>
                  <span className="text-xs text-[#C9A96E] font-semibold">
                    నష్ట ద్రవ్య శోధన పీఠం
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#EDE8E0] mt-1">
                  పోయిన వస్తువు ఖచ్చితమైన స్థాన అన్వేషణ & లభ్యతా కాలం
                </h3>
              </div>

              {/* Time-Bound Recovery Target Countdown Badge */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#5BBFB5]/10 border border-[#5BBFB5]/40">
                <Timer className="w-5 h-5 text-[#5BBFB5]" />
                <div>
                  <div className="text-[10px] uppercase font-mono-tabular text-[#5BBFB5]">
                    అంచనా లభ్యతా సమయం
                  </div>
                  <div className="text-xs font-bold text-white">
                    {report.lostItemDetail.targetRecoveryDateStr || 'రాబోయే 24 గంటలలోపు'} ({report.lostItemDetail.targetRecoveryHours || 24} గంటల్లో)
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Compass Rose Visualizer */}
              <div className="lg:col-span-5 bg-[#12162E] rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center space-y-2">
                <div className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider text-center">
                  దిక్చక్ర సూచిక (Horary Compass Rose)
                </div>
                <HoraryCompassRose
                  degree={report.lostItemDetail.arudhaCompassDegree || 90}
                  directionTe={report.lostItemDetail.arudhaDirectionTe || report.lostItemDetail.directionTe}
                />
                <p className="text-[11px] text-center text-[#EDE8E0]/70 max-w-xs pt-1">
                  మీ గృహ లేదా కార్యాలయ కేంద్రం నుండి సరిగ్గా <strong>{report.lostItemDetail.arudhaCompassDegree || 90}°</strong> కోణంలో ఉన్న <strong>{report.lostItemDetail.arudhaDirectionTe || report.lostItemDetail.directionTe}</strong> వైపు వెతకండి.
                </p>
              </div>

              {/* Spatial Location Quad */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* 1. Direction */}
                <div className="p-3.5 rounded-xl bg-[#141932] border border-[#C9A96E]/30 space-y-1.5">
                  <div className="text-[#C9A96E] font-bold flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>1. ఖచ్చితమైన దిశ (Direction):</span>
                  </div>
                  <div className="text-base font-bold text-[#EDE8E0]">
                    {report.lostItemDetail.arudhaDirectionTe || report.lostItemDetail.directionTe}
                  </div>
                  <div className="text-[11px] text-[#EDE8E0]/70">
                    కోణం: <strong>{report.lostItemDetail.arudhaCompassDegree || 90}°</strong> డిగ్రీలు
                  </div>
                </div>

                {/* 2. Premises Status (Inside vs Outside) */}
                <div className="p-3.5 rounded-xl bg-[#141932] border border-[#5BBFB5]/30 space-y-1.5">
                  <div className="text-[#5BBFB5] font-bold flex items-center gap-1.5">
                    {report.lostItemDetail.isInsidePremises ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                    <span>2. గృహ స్థితి (Indoor vs Outdoor):</span>
                  </div>
                  <div className="text-sm font-bold text-[#EDE8E0]">
                    {report.lostItemDetail.isInsidePremises
                      ? '🏠 గృహ/ఆవరణ లోపలే ఉంది'
                      : '🚗 బయటి ప్రదేశంలో / వాహనంలో ఉంది'}
                  </div>
                  <div className="text-[11px] text-[#EDE8E0]/70">
                    {report.lostItemDetail.environmentTypeTe}
                  </div>
                </div>

                {/* 3. Room / Enclosure Type */}
                <div className="p-3.5 rounded-xl bg-[#141932] border border-white/15 space-y-1.5">
                  <div className="text-[#E0A96D] font-bold flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>3. నిర్దిష్ట గది / ప్రదేశం:</span>
                  </div>
                  <div className="text-sm font-bold text-[#EDE8E0]">
                    {report.lostItemDetail.arudhaRoomTypeTe || 'అల్మారా లేదా భద్రతా ప్రదేశం'}
                  </div>
                  <div className="text-[11px] text-[#EDE8E0]/70">
                    {report.lostItemDetail.placeDescriptionTe}
                  </div>
                </div>

                {/* 4. Height / Vertical Elevation Level */}
                <div className="p-3.5 rounded-xl bg-[#141932] border border-white/15 space-y-1.5">
                  <div className="text-[#9B8FD4] font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>4. వస్తువు ఉన్న ఎత్తు మట్టం:</span>
                  </div>
                  <div className="text-sm font-bold text-[#EDE8E0]">
                    {report.lostItemDetail.arudhaHeightLevelTe || 'మధ్యమ మట్టం (బల్ల/మంచం మీద)'}
                  </div>
                  <div className="text-[11px] text-[#EDE8E0]/70">
                    కారణం: {report.lostItemDetail.causeOfLossTe}
                  </div>
                </div>
              </div>
            </div>

            {/* Retrieval Protocol & Kartaviryarjuna Sacred Stotra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#0F1326] rounded-xl border border-white/10 text-xs space-y-2">
                <div className="text-[#5BBFB5] font-bold flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-[#5BBFB5]" />
                  <span>నష్ట ద్రవ్య అన్వేషణ మార్గదర్శక సూత్రాలు (Step-by-Step Guide):</span>
                </div>
                <p className="text-[#EDE8E0]/90 leading-relaxed whitespace-pre-line">
                  {report.lostItemDetail.retrievalGuideTe || report.lostItemDetail.practicalSearchGuideTe}
                </p>
                <div className="text-[11px] text-[#C9A96E] pt-1">
                  శోధన కాలం: <strong>{report.lostItemDetail.recoveryTimingTe}</strong>
                </div>
              </div>

              <div className="p-4 bg-[#141932] rounded-xl border border-[#C9A96E]/40 text-xs space-y-2">
                <div className="text-[#C9A96E] font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#C9A96E]" />
                  <span>నష్ట ద్రవ్య పునఃప్రాప్తి మంత్రం (కార్తవీర్యార్జున జపం):</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090C18] border border-[#C9A96E]/20 font-serif text-sm font-bold text-[#EDE8E0] text-center leading-relaxed">
                  &ldquo;ఓం కార్తవీర్యార్జునో నామ రాజా బాహుసహస్రవాన్ | యస్య స్మరణమాత్రేణ గతం నష్టం చ లభ్యతే ||&rdquo;
                </div>
                <p className="text-[11px] text-[#EDE8E0]/80 leading-relaxed">
                  ఈ మంత్రాన్ని శుచిగా 21 సార్లు మనస్సులో జపించి, పై సూచించిన <strong>{report.lostItemDetail.arudhaDirectionTe}</strong> దిక్కున ప్రశాంతంగా వెతకండి. వస్తువు వెంటనే దొరుకుతుంది.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DOMAIN MODULE 2: WORK DELAY TIME-BOUND RESOLUTION (కార్య విలంబన నివారణ) */}
        {/* ======================================================================= */}
        {report.workDelayDetail && (
          <div className="bg-[#090C18] border-2 border-[#C9A96E]/50 rounded-xl p-5 sm:p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[#C9A96E] text-[10px] font-mono-tabular font-bold uppercase">
                    Work Delay Diagnosis & Resolution Target
                  </span>
                  <span className="text-xs text-[#5BBFB5] font-semibold">
                    కార్య విలంబన నివారణ పీఠం
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#EDE8E0] mt-1">
                  పని ఎప్పుడు పూర్తవుతుంది? ఆటంక నివారణకు ఖచ్చితమైన పరిష్కారం
                </h3>
              </div>

              {/* Target Resolution Date Badge */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/40">
                <Calendar className="w-5 h-5 text-[#C9A96E]" />
                <div>
                  <div className="text-[10px] uppercase font-mono-tabular text-[#C9A96E]">
                    కార్య సిద్ధి లక్ష్య తేదీ (Target Completion)
                  </div>
                  <div className="text-xs font-bold text-white">
                    {report.workDelayDetail.delayResolutionTargetDateStr || 'సత్వర పరిష్కారం'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Delay Cause Card */}
              <div className="p-4 rounded-xl bg-[#141932] border border-[#D47B7B]/40 space-y-2">
                <div className="text-[#D47B7B] font-bold flex items-center gap-1.5 uppercase">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ఆలస్యానికి మూల కారణం:</span>
                </div>
                <div className="text-sm font-bold text-[#EDE8E0]">
                  {report.workDelayDetail.obstructionCategoryTe}
                </div>
                <p className="text-[#EDE8E0]/80 leading-relaxed">
                  {report.workDelayDetail.primaryCauseOfDelayTe}
                </p>
              </div>

              {/* Labharudha Status */}
              <div className="p-4 rounded-xl bg-[#141932] border border-[#5BBFB5]/40 space-y-2">
                <div className="text-[#5BBFB5] font-bold flex items-center gap-1.5 uppercase">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>లాభారూఢ బలం & విజయం:</span>
                </div>
                <div className="text-sm font-bold text-[#EDE8E0]">
                  {report.workDelayDetail.labharudhaLordStatusTe || 'లాభ స్థానం అనుకూలం'}
                </div>
                <p className="text-[#EDE8E0]/80 leading-relaxed">
                  {report.workDelayDetail.arudhaFruitionAlignmentTe || 'అంతిమ విజయం మీకే దక్కుతుంది.'}
                </p>
              </div>

              {/* Key Person & Favorable Window */}
              <div className="p-4 rounded-xl bg-[#141932] border border-[#C9A96E]/40 space-y-2">
                <div className="text-[#C9A96E] font-bold flex items-center gap-1.5 uppercase">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ఉత్తమ సమయం & సహాయకులు:</span>
                </div>
                <div className="text-sm font-bold text-[#EDE8E0]">
                  {report.workDelayDetail.favorableTimeSlotTe || 'గురు/శుక్ర శుభ హోర'}
                </div>
                <p className="text-[#EDE8E0]/80 leading-relaxed">
                  {report.workDelayDetail.keyPersonImpactTe || 'అధికార వర్గం లేదా అనుభవజ్ఞుల సాయం తీసుకోండి.'}
                </p>
              </div>
            </div>

            {/* Expected Fruition & Action Steps */}
            <div className="p-4 bg-[#0F1326] rounded-xl border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#5BBFB5] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBFB5]" />
                  ఆటంక నివారణకు తక్షణ శాస్త్రోక్త కార్యాచరణ (Recommended Remedial Steps):
                </span>
                <span className="text-[#C9A96E] font-mono-tabular">
                  వ్యవధి: {report.workDelayDetail.expectedFruitionTimeTe}
                </span>
              </div>
              <ul className="space-y-1.5 text-[#EDE8E0]/85 list-disc list-inside leading-relaxed">
                {report.workDelayDetail.actionableRemedialStepsTe.map((step, idx) => (
                  <li key={`delay-step-${idx}`}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* ASTROLOGER'S MASTER DEFINITE VERDICT (సిద్ధాంతి గారి నిశ్చిత తీర్పు)         */}
      {/* ========================================================================= */}
      <section
        className={`rounded-2xl border-2 p-6 sm:p-8 space-y-6 shadow-2xl transition-all ${
          report.verdictBadge === 'favorable'
            ? 'bg-gradient-to-br from-[#122E26] via-[#0F1E1B] to-[#090C18] border-[#5BBFB5]'
            : report.verdictBadge === 'moderate_delay'
            ? 'bg-gradient-to-br from-[#2E2412] via-[#1E190F] to-[#090C18] border-[#C9A96E]'
            : 'bg-gradient-to-br from-[#2E1414] via-[#1E0F0F] to-[#090C18] border-[#D47B7B]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-widest font-bold text-[#C9A96E]">
              సిద్ధాంతి గారి నిశ్చిత సమాధానం · Astrological Verdict
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDE8E0]">
              {report.verdictTitleTe}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-[#EDE8E0]/60 uppercase font-semibold">
                కార్యసిద్ధి / లభ్యతా సంభావ్యత
              </div>
              <div
                className={`text-2xl sm:text-3xl font-mono-tabular font-bold ${
                  report.confidenceScorePercent >= 70
                    ? 'text-[#5BBFB5]'
                    : report.confidenceScorePercent >= 50
                    ? 'text-[#C9A96E]'
                    : 'text-[#D47B7B]'
                }`}
              >
                {report.confidenceScorePercent}%
              </div>
            </div>

            <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center p-1 bg-[#090C18]">
              {report.confidenceScorePercent >= 70 ? (
                <ShieldCheck className="w-8 h-8 text-[#5BBFB5]" />
              ) : report.confidenceScorePercent >= 50 ? (
                <Clock className="w-8 h-8 text-[#C9A96E]" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-[#D47B7B]" />
              )}
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-[#EDE8E0]/90 leading-relaxed font-medium">
          {report.verdictSummaryTe}
        </p>
      </section>

      {/* Interactive Prashna Kundali (South Indian / North Indian) & Planetary Alignment */}
      <section className="bg-[#0F1326] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#C9A96E] font-bold">
              ప్రశ్నా కాల చక్రం · Horary Kundali at Query Moment
            </div>
            <h3 className="text-xl font-bold text-[#EDE8E0] mt-0.5">
              ప్రశ్న లగ్నం: {report.prashnaLagna.signNameTe} ({report.prashnaLagna.degreeDMS}) · కార్య భావం: {report.karyaBhava.houseNumber}వ ఇల్లు
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartMode('south')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                chartMode === 'south'
                  ? 'bg-[#C9A96E] text-[#090C18]'
                  : 'bg-[#090C18] border border-white/15 text-[#EDE8E0]'
              }`}
            >
              దక్షిణ భారత చక్రం (Telugu Tradition)
            </button>
            <button
              onClick={() => setChartMode('north')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                chartMode === 'north'
                  ? 'bg-[#C9A96E] text-[#090C18]'
                  : 'bg-[#090C18] border border-white/15 text-[#EDE8E0]'
              }`}
            >
              ఉత్తర భారత చక్రం (Diamond)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Chart Display */}
          <div className="lg:col-span-7 flex justify-center bg-[#090C18] border border-white/10 rounded-xl p-4">
            {chartMode === 'south' ? (
              <SouthIndianKundaliSvg
                chart={report.chartResult}
                division="D1"
                selectedPlanetId={selectedPlanetId}
                onSelectPlanet={(p: PlanetPosition) => setSelectedPlanetId(p.id)}
                lang="te"
              />
            ) : (
              <NorthIndianKundaliSvg
                chart={report.chartResult}
                division="D1"
                selectedPlanetId={selectedPlanetId}
                onSelectPlanet={(p: PlanetPosition) => setSelectedPlanetId(p.id)}
                lang="te"
              />
            )}
          </div>

          {/* Horary Pillars Analysis Grid */}
          <div className="lg:col-span-5 space-y-3.5 text-xs">
            {/* 1. Prashna Lagnesha */}
            <div className="p-3.5 rounded-xl bg-[#090C18] border border-white/10 space-y-1">
              <div className="flex justify-between font-bold text-[#C9A96E]">
                <span>1. ప్రచ్ఛకుడు (లగ్నాధిపతి):</span>
                <span>{report.prashnaLagna.lordNameTe}</span>
              </div>
              <div className="text-[#EDE8E0]/80">
                లగ్నం: {report.prashnaLagna.signNameTe} ({report.prashnaLagna.degreeDMS}) · {report.prashnaLagna.modalityTe}
              </div>
              <div className="text-[11px] text-[#5BBFB5]">
                లగ్నేశుడు {report.prashnaLagna.lordHouse}వ ఇంట స్థితి ({report.prashnaLagna.lordDignityTe})
              </div>
            </div>

            {/* 2. Karyesha */}
            <div className="p-3.5 rounded-xl bg-[#090C18] border border-white/10 space-y-1">
              <div className="flex justify-between font-bold text-[#5BBFB5]">
                <span>2. కార్యాధిపతి (Karyesha):</span>
                <span>{report.karyaBhava.lordNameTe}</span>
              </div>
              <div className="text-[#EDE8E0]/80">
                కార్య స్థానం: {report.karyaBhava.houseNumber}వ భావం ({report.karyaBhava.signNameTe})
              </div>
              <div className="text-[11px] text-[#C9A96E]">
                కార్యాధిపతి {report.karyaBhava.lordHouse}వ ఇంట స్థితి ({report.karyaBhava.lordDignityTe})
              </div>
            </div>

            {/* 3. Chandra Sthiti */}
            <div className="p-3.5 rounded-xl bg-[#090C18] border border-white/10 space-y-1">
              <div className="flex justify-between font-bold text-[#EDE8E0]">
                <span>3. ప్రశ్న చంద్రుడు (మనస్సు):</span>
                <span>{report.prashnaChandra.signNameTe} ({report.prashnaChandra.degreeDMS})</span>
              </div>
              <div className="text-[#EDE8E0]/80">
                {report.prashnaChandra.house}వ భావం · నక్షత్రం: {report.prashnaChandra.nakshatraNameTe} ({report.prashnaChandra.pada}వ పాదం)
              </div>
              <div className="text-[11px] text-[#5BBFB5]">
                {report.prashnaChandra.chandrabalaTe}
              </div>
            </div>

            {/* 4. Badhaka Sthana */}
            <div className="p-3.5 rounded-xl bg-[#090C18] border border-white/10 space-y-1">
              <div className="flex justify-between font-bold text-[#D47B7B]">
                <span>4. బాధక స్థానం & ఆటంకం:</span>
                <span>{report.badhakaDiagnosis.badhakaHouseNumber}వ ఇల్లు ({report.badhakaDiagnosis.badhakaLordNameTe})</span>
              </div>
              <div className="text-[11px] text-[#EDE8E0]/70 leading-relaxed">
                {report.badhakaDiagnosis.obstructionAnalysisTe}
              </div>
            </div>
          </div>
        </div>

        {/* Tajika Yogas Deep Diagnostics */}
        <div className="p-4 rounded-xl bg-[#141932] border border-[#C9A96E]/30 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold">
            <span className="text-[#C9A96E] uppercase tracking-wider">
              తాజిక యోగ విశ్లేషణ (Tajika Aspects):
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                report.tajikaYoga.isFavorable
                  ? 'bg-[#5BBFB5]/20 text-[#5BBFB5] border border-[#5BBFB5]/40'
                  : 'bg-[#D47B7B]/20 text-[#D47B7B] border border-[#D47B7B]/40'
              }`}
            >
              {report.tajikaYoga.nameTe}
            </span>
          </div>

          <p className="text-[#EDE8E0]/90 leading-relaxed">
            {report.tajikaYoga.explanationTe}
          </p>
        </div>
      </section>

      {/* Classical Authority Shloka & Sacred Vedic Remedies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classical Shloka Card */}
        <section className="bg-[#0F1326] border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A96E] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            ప్రాచీన శాస్త్ర ప్రమాణ శ్లోకం ({report.classicalShloka.sourceGranthaTe})
          </div>

          <div className="p-4 rounded-xl bg-[#090C18] border border-[#C9A96E]/20 text-center font-serif text-sm font-bold text-[#EDE8E0] leading-relaxed tracking-wide">
            &ldquo;{report.classicalShloka.sanskritShloka}&rdquo;
          </div>

          <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
            <strong>తాత్పర్యం:</strong> {report.classicalShloka.teluguMeaning}
          </p>
        </section>

        {/* Sacred Vedic Remedies Card */}
        <section className="bg-[#0F1326] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5BBFB5] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            శాస్త్రోక్త ఉపాయ-పరిహారములు & మంత్ర సాధన
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 bg-[#090C18] rounded-lg border border-[#5BBFB5]/30">
              <div className="font-bold text-[#5BBFB5] mb-1">
                {report.vedicRemedies.primaryMantraTitleTe}:
              </div>
              <div className="font-serif font-bold text-sm text-[#EDE8E0] py-1">
                {report.vedicRemedies.sanskritMantra}
              </div>
              <div className="text-[11px] text-[#EDE8E0]/70 mt-1">
                విధి: {report.vedicRemedies.mantraJapaCountTe}
              </div>
            </div>

            <div className="space-y-1 text-[#EDE8E0]/85">
              <div>
                <strong className="text-[#C9A96E]">దానం:</strong> {report.vedicRemedies.danamsTe}
              </div>
              <div>
                <strong className="text-[#C9A96E]">క్షేత్ర దర్శనం:</strong> {report.vedicRemedies.kshetraDarshanamTe}
              </div>
              <div>
                <strong className="text-[#5BBFB5]">ముఖ్యమైన నియమం:</strong> {report.vedicRemedies.specialProcedureTe}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
