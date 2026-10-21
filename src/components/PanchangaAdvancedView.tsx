import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Search,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Heart,
  Home,
  Briefcase,
  Award,
  Compass,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import {
  NAKSHATRAS,
  calculateChart,
  type BirthInput,
  type CompleteChartResult,
  type ZodiacTradition,
} from '../engine/ephemeris.ts';
import {
  MUHURTA_ACTIVITIES,
  calculateIntradayAuspiciousTimings,
  evaluateDateMuhurta,
  getVedicPanditDeepConsultation,
  searchFavorableMuhurtas,
  checkMuhurtaWindowConflicts,
  type MuhurtaActivityId,
  type MuhurtaEvaluation,
  type MuhurtaConflictReport,
  type MuhurtaConflictDetail,
} from '../engine/muhurtaEngine.ts';
import { RealtimePanchangaFeedCard } from './RealtimePanchangaFeedCard.tsx';

interface PanchangaAdvancedProps {
  chart: CompleteChartResult;
  tradition: ZodiacTradition;
  lang?: 'te' | 'en';
  onNavigateToPrashna?: () => void;
}

type PanchangaSubTab =
  | 'auspicious_time_finder'
  | 'muhurta_search'
  | 'pandit_consultation'
  | 'panchanga_almanac'
  | 'arabic_lots_stars';

export const PanchangaAdvancedView: React.FC<PanchangaAdvancedProps> = ({
  chart,
  tradition,
  onNavigateToPrashna,
}) => {
  const [subTab, setSubTab] = useState<PanchangaSubTab>('auspicious_time_finder');

  // Daily Panchanga Scrubber State
  const [almanacDate, setAlmanacDate] = useState<string>(chart.input.date);
  const [almanacTime, setAlmanacTime] = useState<string>(chart.input.time);
  const [intradayViewMode, setIntradayViewMode] = useState<
    'hora' | 'choghadiya' | 'lagna'
  >('hora');

  // Muhurta Search Tool State
  const [selectedActivity, setSelectedActivity] =
    useState<MuhurtaActivityId>('vivaha');
  const [searchHorizonDays, setSearchHorizonDays] = useState<number>(60);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(70);
  const [onlyWeekends, setOnlyWeekends] = useState<boolean>(false);
  const [onlyFavorableTarabala] = useState<boolean>(false);

  // Vedic Pandit Consultation State (custom date & time test: "మన దగ్గర Date & Time ఉంటే చెప్పొచ్చు గా!")
  const [consultDate, setConsultDate] = useState<string>(chart.input.date);
  const [consultTime, setConsultTime] = useState<string>('10:30');
  const [consultActivity, setConsultActivity] =
    useState<MuhurtaActivityId>('vivaha');

  // Real-time Conflict-Checker in Muhurta Tool
  const [conflictWindowStart, setConflictWindowStart] = useState<string>('09:30');
  const [conflictWindowEnd, setConflictWindowEnd] = useState<string>('10:45');
  const [conflictActiveLabel, setConflictActiveLabel] = useState<string>('ఎంచుకున్న ముహూర్త సమయం');

  // Compute daily Panchanga for the selected almanac date/time at the active chart's coordinates
  const customInput: BirthInput = useMemo(
    () => ({
      ...chart.input,
      date: almanacDate,
      time: almanacTime,
    }),
    [chart.input, almanacDate, almanacTime]
  );

  const almanacChart = useMemo(() => {
    if (almanacDate === chart.input.date && almanacTime === chart.input.time) {
      return chart;
    }
    return calculateChart(customInput, tradition);
  }, [almanacDate, almanacTime, chart, customInput, tradition]);

  const p = almanacChart.panchanga;

  // Intraday Auspicious Time Finder Calculation (Hora, Choghadiya, Udaya Lagna & Optimal Event Windows)
  const intradayTimingReport = useMemo(() => {
    return calculateIntradayAuspiciousTimings(
      almanacDate || chart.input.date,
      selectedActivity,
      chart.input.lat,
      chart.input.lng,
      chart.input.tzOffsetHours,
      chart
    );
  }, [almanacDate, selectedActivity, chart]);

  // Real-Time Muhurta Conflict-Checker Report
  const conflictReport: MuhurtaConflictReport = useMemo(() => {
    return checkMuhurtaWindowConflicts(
      conflictWindowStart,
      conflictWindowEnd,
      almanacDate || chart.input.date,
      selectedActivity,
      chart.input.lat,
      chart.input.lng,
      chart.input.tzOffsetHours,
      chart
    );
  }, [
    conflictWindowStart,
    conflictWindowEnd,
    almanacDate,
    selectedActivity,
    chart,
  ]);

  // Search Results Calculation
  const searchResults = useMemo(() => {
    return searchFavorableMuhurtas(
      selectedActivity,
      almanacDate || chart.input.date,
      searchHorizonDays,
      chart.input.lat,
      chart.input.lng,
      chart.input.tzOffsetHours,
      chart,
      {
        minScore: minScoreFilter,
        onlyWeekends,
        onlyFavorableTarabala,
      }
    );
  }, [
    selectedActivity,
    almanacDate,
    chart,
    searchHorizonDays,
    minScoreFilter,
    onlyWeekends,
    onlyFavorableTarabala,
  ]);

  // Active Evaluation for Pandit Consultation
  const consultEvaluation: MuhurtaEvaluation = useMemo(() => {
    return evaluateDateMuhurta(
      consultDate,
      consultTime,
      consultActivity,
      chart.input.lat,
      chart.input.lng,
      chart.input.tzOffsetHours,
      chart
    );
  }, [consultDate, consultTime, consultActivity, chart]);

  const panditConsultation = useMemo(() => {
    return getVedicPanditDeepConsultation(consultEvaluation, consultActivity);
  }, [consultEvaluation, consultActivity]);

  const handleSelectDateForConsultation = (res: MuhurtaEvaluation) => {
    setConsultDate(res.date);
    setConsultTime(res.time);
    setConsultActivity(selectedActivity);
    setSubTab('pandit_consultation');
  };

  const activityIcons: Record<MuhurtaActivityId, React.ReactNode> = {
    vivaha: <Heart className="w-4 h-4 text-[#D47B7B]" />,
    grihapravesham: <Home className="w-4 h-4 text-[#5BBFB5]" />,
    vyaparam: <Briefcase className="w-4 h-4 text-[#C9A96E]" />,
    upanayanam: <Sparkles className="w-4 h-4 text-[#9B8FD4]" />,
    bhumi_puja: <Compass className="w-4 h-4 text-[#C9A96E]" />,
    vahana: <Clock className="w-4 h-4 text-[#5BBFB5]" />,
    namakaranam: <Award className="w-4 h-4 text-[#C9A96E]" />,
    vidyarambham: <BookOpen className="w-4 h-4 text-[#9B8FD4]" />,
    sarva_karya: <Flame className="w-4 h-4 text-[#C9A96E]" />,
  };

  return (
    <div className="space-y-8">
      {/* 1. REAL-TIME PANCHANGA LIVE FEED (Automatic live updates for current date & GPS location) */}
      <RealtimePanchangaFeedCard
        defaultLat={chart.input.lat}
        defaultLng={chart.input.lng}
        defaultTzOffsetHours={chart.input.tzOffsetHours}
        defaultCityName={chart.input.city}
      />

      {/* Top Level Sub-Tabs Navigation */}
      <div className="bg-[#0F1326] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubTab('auspicious_time_finder')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'auspicious_time_finder'
                ? 'bg-[#C9A96E] text-[#090C18] shadow-md'
                : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0] hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>శుభ సమయ శోధిని (Auspicious Time Finder)</span>
          </button>

          <button
            onClick={() => setSubTab('muhurta_search')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'muhurta_search'
                ? 'bg-[#C9A96E] text-[#090C18] shadow-md'
                : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0] hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>తేదీల ముహూర్త శోధన (Date Muhurta Search)</span>
          </button>

          <button
            onClick={() => setSubTab('pandit_consultation')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'pandit_consultation'
                ? 'bg-[#C9A96E] text-[#090C18] shadow-md'
                : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0] hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>సిద్ధాంతి ముహూర్త పరిశీలన & ఆటంకాలు (Pandit Consultation)</span>
          </button>

          <button
            onClick={() => setSubTab('panchanga_almanac')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'panchanga_almanac'
                ? 'bg-[#C9A96E] text-[#090C18] shadow-md'
                : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0] hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>శ్రీ పంచాంగం & ఆల్మనాక్ (Daily Panchanga)</span>
          </button>

          <button
            onClick={() => setSubTab('arabic_lots_stars')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'arabic_lots_stars'
                ? 'bg-[#C9A96E] text-[#090C18] shadow-md'
                : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0] hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>లాట్స్ & నక్షత్రాలు (Lots & Stars)</span>
          </button>

          {onNavigateToPrashna && (
            <button
              onClick={onNavigateToPrashna}
              className="px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/40 hover:bg-[#5BBFB5]/25 transition-all cursor-pointer ml-auto"
            >
              <Compass className="w-4 h-4 text-[#5BBFB5]" />
              <span>ప్రశ్న జ్యోతిష్యం (Horary Prashna)</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono-tabular text-[#EDE8E0]/60 px-2">
          స్థలం: <span className="text-[#C9A96E] font-semibold">{chart.input.city}</span> ({chart.input.lat.toFixed(2)}°N, {chart.input.lng.toFixed(2)}°E)
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: AUSPICIOUS TIME FINDER (అత్యుత్తమ శుభ సమయ నిర్ణయ యంత్రం - INTRADAY MUHURTA) */}
      {/* ========================================================================= */}
      {subTab === 'auspicious_time_finder' && (
        <div className="space-y-6">
          {/* Top Hero & Date/Panchanga Live Status Banner */}
          <div className="bg-gradient-to-r from-[#141932] via-[#0F1326] to-[#141932] border border-[#C9A96E]/45 rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C9A96E]" />
                  <span className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#C9A96E]">
                    Intraday Auspicious Time Finder · దిన ప్రమాణ హోరా, చోఘడియా & ఉదయ లగ్న ముహూర్త నిర్ణయం
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDE8E0] mt-1">
                  శుభ సమయ నిర్ణయ యంత్రం (Auspicious Time Finder — Optimal Event Timings)
                </h2>
                <p className="text-xs text-[#EDE8E0]/80 mt-1.5 leading-relaxed">
                  ఎంచుకున్న తేదీ యొక్క <strong>పంచాంగ అంగాలు (తిథి, వార, నక్షత్ర, యోగ, కరణాలు)</strong>, మీ జన్మ నక్షత్రం (
                  <strong className="text-[#5BBFB5]">
                    {chart.planets.find((pl) => pl.id === 'Moon')?.nakshatra}
                  </strong>
                  ) తో <strong>తారాబలం & చంద్రాబలం</strong>, మరియు ఆ రోజు <strong>సూర్యోదయం ({intradayTimingReport.sunriseLocal}) నుండి సూర్యాస్తమయం ({intradayTimingReport.sunsetLocal})</strong> వరకు గల 24 గ్రహ హోరలు, చోఘడియాలు, 12 ఉదయ లగ్నాలు మరియు రాహుకాల/యమగండ వర్జ్యాలను గణించి ఏ సమయం అత్యుత్తమమో సూచిస్తుంది.
                </p>
              </div>

              {/* Date Picker & Quick Reset */}
              <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-xl p-3.5 flex flex-col gap-2 min-w-[230px]">
                <label className="text-[11px] font-semibold text-[#C9A96E] flex items-center justify-between">
                  <span>ముహూర్త తేదీ (Select Date):</span>
                  <button
                    onClick={() => setAlmanacDate(chart.input.date)}
                    className="text-[10px] underline text-[#5BBFB5] hover:text-[#EDE8E0] cursor-pointer"
                  >
                    Reset to Chart Date
                  </button>
                </label>
                <input
                  type="date"
                  value={almanacDate}
                  onChange={(e) => setAlmanacDate(e.target.value)}
                  className="bg-[#141932] border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                />
                <div className="text-[10px] font-mono-tabular text-[#EDE8E0]/65 flex items-center justify-between pt-0.5">
                  <span>🌅 {intradayTimingReport.sunriseLocal}</span>
                  <span>🌇 {intradayTimingReport.sunsetLocal}</span>
                </div>
              </div>
            </div>

            {/* Current Panchanga & Shuddhi Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-white/10">
              <div className="p-2.5 rounded-lg bg-[#090C18]/80 border border-white/10">
                <div className="text-[10px] text-[#EDE8E0]/50">వారం (Vara)</div>
                <div className="text-xs font-bold text-[#C9A96E] mt-0.5">
                  {intradayTimingReport.dayNameTe}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#090C18]/80 border border-white/10">
                <div className="text-[10px] text-[#EDE8E0]/50">తిథి (Tithi)</div>
                <div className="text-xs font-bold text-[#EDE8E0] mt-0.5 truncate">
                  {intradayTimingReport.tithiNameTe}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#090C18]/80 border border-white/10">
                <div className="text-[10px] text-[#EDE8E0]/50">నక్షత్రం (Nakshatra)</div>
                <div className="text-xs font-bold text-[#5BBFB5] mt-0.5">
                  {intradayTimingReport.nakshatraNameTe}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#090C18]/80 border border-white/10">
                <div className="text-[10px] text-[#EDE8E0]/50">నిత్య యోగం & కరణం</div>
                <div className="text-xs font-bold text-[#9B8FD4] mt-0.5 truncate">
                  {intradayTimingReport.yogaNameTe} · {intradayTimingReport.karanaNameTe}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#5BBFB5]/10 border border-[#5BBFB5]/30">
                <div className="text-[10px] text-[#5BBFB5]">అభిజిత్ ముహూర్తం</div>
                <div className="text-[11px] font-mono-tabular font-bold text-[#EDE8E0] mt-0.5">
                  {intradayTimingReport.abhijitWindow}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#D47B7B]/10 border border-[#D47B7B]/30">
                <div className="text-[10px] text-[#D47B7B]">రాహుకాలం (Avoid)</div>
                <div className="text-[11px] font-mono-tabular font-bold text-[#D47B7B] mt-0.5">
                  {intradayTimingReport.rahuKalamWindow}
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Select Event Type for Optimal Intraday Windows */}
          <div className="bg-[#0F1326] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-[#EDE8E0] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                1. శుభ కార్యం ఎంచుకోండి — ఆ కార్యానికి ఈ రోజు అత్యుత్తమ ముహూర్త సమయాలు (Select Key Event):
              </label>
              <span className="text-[11px] font-mono-tabular text-[#C9A96E]">
                దిన పంచాంగ శుద్ధి స్కోర్: <strong>{intradayTimingReport.dayPanchangaScore}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {(Object.keys(MUHURTA_ACTIVITIES) as MuhurtaActivityId[]).map((actId) => {
                const conf = MUHURTA_ACTIVITIES[actId];
                const isSel = selectedActivity === actId;
                return (
                  <button
                    key={actId}
                    onClick={() => setSelectedActivity(actId)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSel
                        ? 'bg-[#141932] border-[#C9A96E] shadow-sm ring-1 ring-[#C9A96E]/40'
                        : 'bg-[#090C18]/80 border-white/10 hover:border-white/25 hover:bg-[#141932]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {activityIcons[actId]}
                      {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" />}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-[#EDE8E0]">
                        {conf.titleTe.split('(')[0].trim()}
                      </div>
                      <div className="text-[10px] text-[#EDE8E0]/50 truncate mt-0.5">
                        {conf.titleEn.split('(')[0].trim()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Day Summary Verdict Banner for Selected Event */}
            <div className="p-3.5 rounded-lg bg-[#090C18] border border-[#C9A96E]/30 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                <strong className="text-[#C9A96E]">నేటి ముహూర్త సారాంశం: </strong>
                {intradayTimingReport.daySummaryTe}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setConsultDate(almanacDate);
                    setConsultActivity(selectedActivity);
                    setSubTab('pandit_consultation');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#C9A96E]/15 border border-[#C9A96E]/40 text-[#C9A96E] text-[11px] font-bold hover:bg-[#C9A96E] hover:text-[#090C18] transition-all cursor-pointer"
                >
                  సిద్ధాంతి లోతైన విశ్లేషణ & ఆటంకాలు →
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Top Recommended Auspicious Time Windows for Selected Event */}
          <div className="bg-[#0F1326] border border-[#5BBFB5]/35 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-display font-bold text-[#EDE8E0] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBFB5]" />
                  <span>
                    సిఫార్సు చేయబడిన అత్యుత్తమ ముహూర్త సమయాలు (Top Optimal Time Windows for{' '}
                    <span className="text-[#C9A96E]">
                      {MUHURTA_ACTIVITIES[selectedActivity].titleTe.split('(')[0].trim()}
                    </span>
                    )
                  </span>
                </h3>
                <p className="text-[11px] text-[#EDE8E0]/60 mt-0.5">
                  రాహుకాలం ({intradayTimingReport.rahuKalamWindow}) మరియు యమగండం ({intradayTimingReport.yamagandaWindow}) పూర్తిగా నివారించి, హోరా + చోఘడియా + శుభ లగ్న బలంతో లెక్కించిన సమయాలు
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-[#5BBFB5] text-xs font-mono-tabular font-bold">
                {intradayTimingReport.optimalSlotsForActivity.length} శ్రేష్ఠ సమయాలు
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {intradayTimingReport.optimalSlotsForActivity.map((win, idx) => (
                <div
                  key={win.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-br from-[#141932] to-[#090C18] border-[#5BBFB5]/60 shadow-lg ring-1 ring-[#5BBFB5]/30'
                      : 'bg-[#090C18]/90 border-white/10 hover:border-[#C9A96E]/40'
                  }`}
                >
                  <div>
                    {/* Top Row: Rank Badge + Time Window + Score */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              idx === 0
                                ? 'bg-[#5BBFB5] text-[#090C18]'
                                : 'bg-[#C9A96E]/20 text-[#C9A96E]'
                            }`}
                          >
                            #{idx + 1} {win.gradeBadgeTe}
                          </span>
                          {win.isAbhijitWindow && (
                            <span className="px-2 py-0.5 rounded bg-[#C9A96E]/25 border border-[#C9A96E]/50 text-[#C9A96E] text-[10px] font-bold">
                              ✨ అభిజిత్ బలం
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-mono-tabular font-bold text-[#EDE8E0] mt-2">
                          {win.startTime} – {win.endTime}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xl font-mono-tabular font-bold ${
                            win.score >= 85
                              ? 'text-[#5BBFB5]'
                              : win.score >= 72
                                ? 'text-[#C9A96E]'
                                : 'text-[#9B8FD4]'
                          }`}
                        >
                          {win.score}%
                        </div>
                        <div className="text-[9px] font-mono-tabular uppercase text-[#EDE8E0]/45">
                          Muhurta Score
                        </div>
                      </div>
                    </div>

                    {/* Hora + Choghadiya + Lagna Chips */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-white/10 text-[11px]">
                      <div className="p-1.5 rounded bg-[#141932]/80 border border-white/5">
                        <div className="text-[9px] text-[#EDE8E0]/45">గ్రహ హోర</div>
                        <div className="font-semibold text-[#C9A96E] truncate">
                          {win.horaLordTe}
                        </div>
                      </div>
                      <div className="p-1.5 rounded bg-[#141932]/80 border border-white/5">
                        <div className="text-[9px] text-[#EDE8E0]/45">చోఘడియా</div>
                        <div className="font-semibold text-[#5BBFB5] truncate">
                          {win.choghadiyaNameTe}
                        </div>
                      </div>
                      <div className="p-1.5 rounded bg-[#141932]/80 border border-white/5">
                        <div className="text-[9px] text-[#EDE8E0]/45">ఉదయ లగ్నం</div>
                        <div className="font-semibold text-[#9B8FD4] truncate">
                          {win.risingLagnaTe}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Explanation */}
                    <p className="text-[11px] text-[#EDE8E0]/80 mt-3 leading-relaxed">
                      {win.panchangaAlignmentNoteTe}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                    <span className="flex items-center gap-1.5 text-[#5BBFB5] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5BBFB5]" />
                      <span>{win.doshaAuditBadgeTe}</span>
                    </span>
                    <button
                      onClick={() => {
                        setConflictWindowStart(win.startTime);
                        setConflictWindowEnd(win.endTime);
                        setConflictActiveLabel(`సిఫార్సు విండో #${win.rank} (${win.startTime} – ${win.endTime})`);
                      }}
                      className="px-2.5 py-1 rounded bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-[#5BBFB5] hover:bg-[#5BBFB5] hover:text-[#090C18] font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>దోష తనిఖీ చేయి →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* REAL-TIME MUHURTA CONFLICT CHECKER & DOSHA SHIELD PANEL */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-[#12162E] via-[#0D1022] to-[#12162E] border-2 border-[#5BBFB5]/45 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#5BBFB5]/20 text-[#5BBFB5] border border-[#5BBFB5]/40">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#5BBFB5] font-bold">
                    Real-Time Muhurta Conflict-Checker & Panchanga Dosha Shield
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#EDE8E0]">
                  రియల్-టైమ్ ముహూర్త దోష పరిరక్షక శోధిని{' '}
                  <span className="text-[#C9A96E] text-base font-sans font-normal">
                    (రాహుకాల, యమగండ, గుళిక & పంచాంగ దోష తనిఖీ)
                  </span>
                </h3>
                <p className="text-xs text-[#EDE8E0]/75 max-w-3xl leading-relaxed">
                  ఎంచుకున్న ఏ ముహూర్త సమయానికైనా <strong>రాహుకాలం</strong>, <strong>యమగండం</strong>, <strong>గుళిక కాలం</strong>, <strong>దుర్ముహూర్తం</strong>, <strong>వర్జ్యం</strong>, మరియు తిథి/కరణ దోషాలతో ఎటువంటి తాకిడి (Overlap) లేకుండా <strong>100% సురక్షితమైన రిస్క్-ఫ్రీ సిఫార్సు</strong>ను ఖచ్చితంగా నిర్ధారిస్తుంది.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 shadow-md ${
                    conflictReport.overallRiskLevel === 'risk_free'
                      ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#10B981]'
                      : conflictReport.overallRiskLevel === 'caution'
                      ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#F59E0B]'
                      : 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]'
                  }`}
                >
                  {conflictReport.overallRiskLevel === 'risk_free' ? (
                    <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                  <div>
                    <div className="text-[10px] uppercase font-mono-tabular tracking-wider opacity-75">
                      Conflict Audit Status
                    </div>
                    <div className="text-xs font-bold">{conflictReport.riskBadgeTe}</div>
                  </div>
                </div>

                <div className="text-center p-2.5 rounded-xl bg-[#090C18] border border-white/10 min-w-[85px]">
                  <div className="text-[10px] text-[#EDE8E0]/50 font-mono-tabular uppercase">
                    Purity Score
                  </div>
                  <div
                    className={`text-lg font-mono-tabular font-bold ${
                      conflictReport.purityScorePercent >= 85
                        ? 'text-[#10B981]'
                        : conflictReport.purityScorePercent >= 60
                        ? 'text-[#F59E0B]'
                        : 'text-[#EF4444]'
                    }`}
                  >
                    {conflictReport.purityScorePercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* Time Window Customizer & Presets */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#090C18]/80 p-4 rounded-xl border border-white/10">
              <div className="md:col-span-5 flex flex-wrap items-center gap-3">
                <div>
                  <label className="text-[10px] text-[#EDE8E0]/55 font-mono-tabular block mb-1">
                    ముహూర్త ప్రారంభ సమయం (Start):
                  </label>
                  <input
                    type="time"
                    value={conflictWindowStart}
                    onChange={(e) => {
                      setConflictWindowStart(e.target.value);
                      setConflictActiveLabel(`కస్టమ్ సమయం (${e.target.value} – ${conflictWindowEnd})`);
                    }}
                    className="bg-[#141932] border border-white/20 rounded-lg px-3 py-1.5 text-sm font-mono-tabular font-bold text-[#EDE8E0] focus:outline-none focus:border-[#5BBFB5]"
                  />
                </div>
                <span className="text-[#EDE8E0]/40 text-sm font-bold pt-4">→</span>
                <div>
                  <label className="text-[10px] text-[#EDE8E0]/55 font-mono-tabular block mb-1">
                    ముగింపు సమయం (End):
                  </label>
                  <input
                    type="time"
                    value={conflictWindowEnd}
                    onChange={(e) => {
                      setConflictWindowEnd(e.target.value);
                      setConflictActiveLabel(`కస్టమ్ సమయం (${conflictWindowStart} – ${e.target.value})`);
                    }}
                    className="bg-[#141932] border border-white/20 rounded-lg px-3 py-1.5 text-sm font-mono-tabular font-bold text-[#EDE8E0] focus:outline-none focus:border-[#5BBFB5]"
                  />
                </div>
                <div className="text-[11px] font-mono-tabular text-[#5BBFB5] pt-4">
                  ({conflictReport.windowDurationMinutes} నిమిషాల వ్యవధి)
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="md:col-span-7 flex flex-wrap items-center gap-2 justify-end">
                <span className="text-[10px] text-[#EDE8E0]/50 mr-1">త్వరిత విండో ఎంపిక:</span>
                {intradayTimingReport.optimalSlotsForActivity.slice(0, 3).map((slot) => (
                  <button
                    key={`preset-${slot.id}`}
                    onClick={() => {
                      setConflictWindowStart(slot.startTime);
                      setConflictWindowEnd(slot.endTime);
                      setConflictActiveLabel(`సిఫార్సు #${slot.rank}`);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono-tabular transition-all cursor-pointer border ${
                      conflictWindowStart === slot.startTime
                        ? 'bg-[#5BBFB5] text-[#090C18] border-[#5BBFB5] font-bold'
                        : 'bg-[#141932] text-[#EDE8E0]/80 border-white/10 hover:border-white/30'
                    }`}
                  >
                    #{slot.rank} {slot.startTime}–{slot.endTime}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const [as, ae] = intradayTimingReport.abhijitWindow.split(/[–-]/).map((s) => s.trim());
                    if (as && ae) {
                      setConflictWindowStart(as);
                      setConflictWindowEnd(ae);
                      setConflictActiveLabel('అభిజిత్ ముహూర్తం');
                    }
                  }}
                  className="px-2.5 py-1 rounded text-[11px] font-mono-tabular bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40 hover:bg-[#C9A96E] hover:text-[#090C18] font-bold transition-all cursor-pointer"
                >
                  ✨ అభిజిత్
                </button>
              </div>
            </div>

            {/* In-Depth Conflict Breakdown Meters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#EDE8E0]">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>పంచాంగ కాల దోషాల సంపర్క పరిశీలన (Incursion Overlap Audit):</span>
                </span>
                <span className="text-[11px] font-mono-tabular text-[#EDE8E0]/60">
                  పరిశీలిస్తున్న సమయం: <strong className="text-[#5BBFB5]">{conflictWindowStart} – {conflictWindowEnd}</strong> ({conflictActiveLabel})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Rahu Kalam */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    conflictReport.conflicts.some((c) => c.category === 'rahu_kalam')
                      ? 'bg-[#EF4444]/15 border-[#EF4444]/50'
                      : 'bg-[#090C18] border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#D47B7B]">రాహుకాలం</span>
                      <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/50">
                        {conflictReport.rahuKalamWindow}
                      </span>
                    </div>
                    <div className="text-sm font-mono-tabular font-bold mt-2">
                      {conflictReport.conflicts.find((c) => c.category === 'rahu_kalam') ? (
                        <span className="text-[#EF4444] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {conflictReport.conflicts.find((c) => c.category === 'rahu_kalam')?.overlapMinutes} ని. సంపర్కం!
                        </span>
                      ) : (
                        <span className="text-[#10B981] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          సంపూర్ణ సురక్షితం (0 ని.)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#EDE8E0]/60 mt-2 pt-2 border-t border-white/10">
                    సకల శుభకార్య వినాశక దోషం
                  </div>
                </div>

                {/* 2. Yamagandam */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    conflictReport.conflicts.some((c) => c.category === 'yamagandam')
                      ? 'bg-[#EF4444]/15 border-[#EF4444]/50'
                      : 'bg-[#090C18] border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#E07A5F]">యమగండం</span>
                      <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/50">
                        {conflictReport.yamagandaWindow}
                      </span>
                    </div>
                    <div className="text-sm font-mono-tabular font-bold mt-2">
                      {conflictReport.conflicts.find((c) => c.category === 'yamagandam') ? (
                        <span className="text-[#EF4444] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {conflictReport.conflicts.find((c) => c.category === 'yamagandam')?.overlapMinutes} ని. సంపర్కం!
                        </span>
                      ) : (
                        <span className="text-[#10B981] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          దోష రహితం (0 ని.)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#EDE8E0]/60 mt-2 pt-2 border-t border-white/10">
                    మృత్యుతుల్య విఘ్న నివారణ
                  </div>
                </div>

                {/* 3. Gulika Kalam */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    conflictReport.conflicts.some((c) => c.category === 'gulika_kalam')
                      ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50'
                      : 'bg-[#090C18] border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#C9A96E]">గుళిక కాలం</span>
                      <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/50 truncate">
                        {conflictReport.gulikaWindow}
                      </span>
                    </div>
                    <div className="text-sm font-mono-tabular font-bold mt-2">
                      {conflictReport.conflicts.find((c) => c.category === 'gulika_kalam') ? (
                        <span className="text-[#F59E0B] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {conflictReport.conflicts.find((c) => c.category === 'gulika_kalam')?.overlapMinutes} ని. సంపర్కం
                        </span>
                      ) : (
                        <span className="text-[#10B981] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          సురక్షితం (0 ని.)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#EDE8E0]/60 mt-2 pt-2 border-t border-white/10">
                    శనిపుత్ర కారక జాప్య నివారణ
                  </div>
                </div>

                {/* 4. Durmuhurtham */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    conflictReport.conflicts.some((c) => c.category === 'durmuhurtham')
                      ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50'
                      : 'bg-[#090C18] border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#9B8FD4]">దుర్ముహూర్తం</span>
                      <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/50 truncate">
                        {conflictReport.durmuhurthamWindow.slice(0, 13)}
                      </span>
                    </div>
                    <div className="text-sm font-mono-tabular font-bold mt-2">
                      {conflictReport.conflicts.find((c) => c.category === 'durmuhurtham') ? (
                        <span className="text-[#F59E0B] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {conflictReport.conflicts.find((c) => c.category === 'durmuhurtham')?.overlapMinutes} ని. సంపర్కం
                        </span>
                      ) : (
                        <span className="text-[#10B981] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          దుర్ముహూర్త రహితం
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#EDE8E0]/60 mt-2 pt-2 border-t border-white/10">
                    నిరర్థక కార్య దోష రహితం
                  </div>
                </div>

                {/* 5. Varjyam (Visha Ghatika) */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    conflictReport.conflicts.some((c) => c.category === 'varjyam')
                      ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50'
                      : 'bg-[#090C18] border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#5BBFB5]">వర్జ్యం</span>
                      <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/50 truncate">
                        {conflictReport.varjyamWindow}
                      </span>
                    </div>
                    <div className="text-sm font-mono-tabular font-bold mt-2">
                      {conflictReport.conflicts.find((c) => c.category === 'varjyam') ? (
                        <span className="text-[#F59E0B] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {conflictReport.conflicts.find((c) => c.category === 'varjyam')?.overlapMinutes} ని. సంపర్కం
                        </span>
                      ) : (
                        <span className="text-[#10B981] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          విష ఘడియలు లేవు
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#EDE8E0]/60 mt-2 pt-2 border-t border-white/10">
                    అమృత ఘడియల శుద్ధి
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Verdict Banner & Auto-Adjust Button */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                conflictReport.overallRiskLevel === 'risk_free'
                  ? 'bg-[#10B981]/10 border-[#10B981]/30'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {conflictReport.overallRiskLevel === 'risk_free' ? (
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  )}
                  <strong
                    className={`text-xs ${
                      conflictReport.overallRiskLevel === 'risk_free'
                        ? 'text-[#10B981]'
                        : 'text-[#EF4444]'
                    }`}
                  >
                    సిద్ధాంతి దోష విశ్లేషణ & తీర్పు:
                  </strong>
                </div>
                <p className="text-xs text-[#EDE8E0]/90 leading-relaxed">
                  {conflictReport.verdictBannerTe}
                </p>
                {conflictReport.safeAdjustmentActionTe && (
                  <p className="text-[11px] text-[#C9A96E] font-semibold mt-1">
                    💡 శాస్త్ర సూచన: {conflictReport.safeAdjustmentActionTe}
                  </p>
                )}
              </div>

              {conflictReport.hasConflict && (
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const parts = conflictReport.safeAlternativeWindowTe.split(/[–-]/).map((s) => s.trim().slice(0, 5));
                      if (parts.length >= 2) {
                        setConflictWindowStart(parts[0]);
                        setConflictWindowEnd(parts[1]);
                        setConflictActiveLabel('రిస్క్-ఫ్రీ ఆటో సర్దుబాటు విండో');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>సురక్షిత సమయానికి మార్చు (Auto-Adjust)</span>
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* Step 3: Interactive Intraday Breakdown Tabs (24 Horas / Choghadiyas / 12 Udaya Lagnas) */}
          <div className="bg-[#0F1326] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-display font-bold text-[#EDE8E0]">
                  సంపూర్ణ దిన విభజన పట్టికలు (Intraday Hora, Choghadiya & Udaya Lagna Shuddhi)
                </h3>
                <p className="text-[11px] text-[#EDE8E0]/60">
                  సూర్యోదయం ({intradayTimingReport.sunriseLocal}) నుండి మరుసటి సూర్యోదయం వరకు ప్రతి గంట మరియు లగ్న ప్రమాణ విశ్లేషణ
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 bg-[#090C18] p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setIntradayViewMode('hora')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    intradayViewMode === 'hora'
                      ? 'bg-[#C9A96E] text-[#090C18]'
                      : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                  }`}
                >
                  24 గ్రహ హోరలు (Planetary Horas)
                </button>
                <button
                  onClick={() => setIntradayViewMode('choghadiya')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    intradayViewMode === 'choghadiya'
                      ? 'bg-[#C9A96E] text-[#090C18]'
                      : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                  }`}
                >
                  చోఘడియా ముహూర్తాలు (Choghadiya)
                </button>
                <button
                  onClick={() => setIntradayViewMode('lagna')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    intradayViewMode === 'lagna'
                      ? 'bg-[#C9A96E] text-[#090C18]'
                      : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                  }`}
                >
                  12 ఉదయ లగ్న శుద్ధి (Lagna Windows)
                </button>
              </div>
            </div>

            {/* MODE A: 24 PLANETARY HORAS */}
            {intradayViewMode === 'hora' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Day Horas (1-12) */}
                  <div className="bg-[#090C18]/90 border border-white/10 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-[#C9A96E]" />
                      పగటి హోరలు — Day Horas (Sunrise {intradayTimingReport.sunriseLocal} to Sunset {intradayTimingReport.sunsetLocal})
                    </h4>
                    <div className="space-y-2">
                      {intradayTimingReport.dayHoras.map((h) => (
                        <div
                          key={h.horaNumber}
                          className={`p-2.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${
                            h.isRahuOverlap
                              ? 'bg-[#D47B7B]/10 border-[#D47B7B]/35'
                              : h.nature === 'auspicious'
                                ? 'bg-[#5BBFB5]/10 border-[#5BBFB5]/30'
                                : h.nature === 'neutral'
                                  ? 'bg-[#C9A96E]/10 border-[#C9A96E]/30'
                                  : 'bg-[#141932]/50 border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono-tabular font-bold text-[#EDE8E0] bg-[#090C18] px-2 py-1 rounded border border-white/10">
                              {h.startTime} – {h.endTime}
                            </span>
                            <div>
                              <div className="font-bold text-[#EDE8E0] flex items-center gap-1.5">
                                <span>{h.lordNameTe}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                    h.isRahuOverlap
                                      ? 'bg-[#D47B7B]/25 text-[#D47B7B]'
                                      : h.nature === 'auspicious'
                                        ? 'bg-[#5BBFB5]/20 text-[#5BBFB5]'
                                        : 'bg-[#C9A96E]/20 text-[#C9A96E]'
                                  }`}
                                >
                                  {h.qualityBadgeTe}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
                                {h.bestActivitiesTe}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Night Horas (13-24) */}
                  <div className="bg-[#090C18]/90 border border-white/10 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#9B8FD4] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-[#9B8FD4]" />
                      రాత్రి హోరలు — Night Horas (Sunset {intradayTimingReport.sunsetLocal} to Next Sunrise)
                    </h4>
                    <div className="space-y-2">
                      {intradayTimingReport.nightHoras.map((h) => (
                        <div
                          key={h.horaNumber}
                          className={`p-2.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${
                            h.nature === 'auspicious'
                              ? 'bg-[#5BBFB5]/10 border-[#5BBFB5]/30'
                              : h.nature === 'neutral'
                                ? 'bg-[#C9A96E]/10 border-[#C9A96E]/30'
                                : 'bg-[#141932]/50 border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono-tabular font-bold text-[#EDE8E0] bg-[#090C18] px-2 py-1 rounded border border-white/10">
                              {h.startTime} – {h.endTime}
                            </span>
                            <div>
                              <div className="font-bold text-[#EDE8E0] flex items-center gap-1.5">
                                <span>{h.lordNameTe}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                    h.nature === 'auspicious'
                                      ? 'bg-[#5BBFB5]/20 text-[#5BBFB5]'
                                      : 'bg-[#C9A96E]/20 text-[#C9A96E]'
                                  }`}
                                >
                                  {h.qualityBadgeTe}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
                                {h.bestActivitiesTe}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODE B: CHOGHADIYA WINDOWS */}
            {intradayViewMode === 'choghadiya' && (
              <div className="bg-[#090C18]/90 border border-white/10 rounded-xl p-4">
                <h4 className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider mb-3">
                  పగటి చోఘడియా ముహూర్తాలు (8 Day Choghadiyas — Sunrise to Sunset)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {intradayTimingReport.dayChoghadiyas.map((c) => (
                    <div
                      key={c.slotNumber}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        c.nature === 'amrita' || c.nature === 'shubha' || c.nature === 'labha'
                          ? 'bg-[#5BBFB5]/10 border-[#5BBFB5]/30'
                          : c.nature === 'ashubha'
                            ? 'bg-[#D47B7B]/10 border-[#D47B7B]/30'
                            : 'bg-[#C9A96E]/10 border-[#C9A96E]/30'
                      }`}
                    >
                      <div>
                        <div className="font-mono-tabular font-bold text-[#EDE8E0]">
                          {c.startTime} – {c.endTime}
                        </div>
                        <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
                          {c.verdictTe}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#EDE8E0]">
                          {c.nameTe}
                        </div>
                        <div className="text-[10px] text-[#C9A96E]">
                          అధిపతి: {c.rulerPlanetTe}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODE C: 12 UDAYA LAGNA SHUDDHI WINDOWS */}
            {intradayViewMode === 'lagna' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/15 text-[#C9A96E] font-mono-tabular uppercase">
                      <th className="py-2.5 px-3">లగ్న సమయం (Time Window)</th>
                      <th className="py-2.5 px-3">ఉదయ లగ్నం (Ascending Sign)</th>
                      <th className="py-2.5 px-3">లగ్న స్వభావం (Modality)</th>
                      <th className="py-2.5 px-3">కర్తరి / లగ్న శుద్ధి</th>
                      <th className="py-2.5 px-3">అనుకూల శుభ కార్యాలు (Recommended Events)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {intradayTimingReport.lagnaWindows.map((lw, i) => (
                      <tr
                        key={`lagna-window-${lw.startTime}-${lw.endTime}-${i}`}
                        className={
                          lw.isKendraOrTrikonaBenefic
                            ? 'bg-[#5BBFB5]/5 hover:bg-[#5BBFB5]/10'
                            : 'hover:bg-white/5'
                        }
                      >
                        <td className="py-2.5 px-3 font-mono-tabular font-bold text-[#EDE8E0]">
                          {lw.startTime} – {lw.endTime}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#C9A96E]">
                          {lw.signNameTe} లగ్నం ({lw.signNameEn})
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              lw.modality === 'sthira'
                                ? 'bg-[#5BBFB5]/20 text-[#5BBFB5]'
                                : lw.modality === 'chara'
                                  ? 'bg-[#C9A96E]/20 text-[#C9A96E]'
                                  : 'bg-[#9B8FD4]/20 text-[#9B8FD4]'
                            }`}
                          >
                            {lw.modalityTe}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#EDE8E0]/85">
                          {lw.kartariStatusTe}
                        </td>
                        <td className="py-2.5 px-3 text-[#EDE8E0]/75">
                          {lw.recommendedActivitiesTe}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MUHURTA SEARCH TOOL (శుభ ముహూర్త శోధన యంత్రం) */}
      {/* ========================================================================= */}
      {subTab === 'muhurta_search' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#141932] via-[#0F1326] to-[#141932] border border-[#C9A96E]/40 rounded-xl p-6 relative overflow-hidden">
            <div className="max-w-3xl">
              <span className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#C9A96E]">
                వేద జ్యోతిష్య దృగ్గణిత ముహూర్త శోధనా యంత్రం · Vedic Muhurta Finder
              </span>
              <h2 className="text-2xl font-display font-bold text-[#EDE8E0] mt-1">
                సంకల్ప కార్య శుభ ముహూర్తాల అన్వేషణ & ఫిల్టర్
              </h2>
              <p className="text-xs text-[#EDE8E0]/80 mt-2 leading-relaxed">
                ముహూర్త చింతామణి, ముహూర్త మార్తాండం మరియు కాలామృత శాస్త్ర ప్రమాణాల ప్రకారం మీ జన్మ నక్షత్రం (
                <strong className="text-[#5BBFB5]">{chart.planets.find((pl) => pl.id === 'Moon')?.nakshatra}</strong>)
                మరియు జన్మరాశికి అనుగుణమైన <strong>తారాబలం, చంద్రాబలం, పంచాంగ శుద్ధి</strong> కలిగిన ఉత్తమ తేదీలను కంప్యూట్ చేస్తుంది.
              </p>
            </div>
          </div>

          {/* Activity Category Selection Grid */}
          <div className="bg-[#0F1326] border border-white/10 rounded-xl p-5 space-y-4">
            <label className="block text-xs font-semibold text-[#EDE8E0] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#C9A96E]" />
              1. సంకల్ప కార్యం ఎంచుకోండి (Select Auspicious Event Criteria):
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {(Object.keys(MUHURTA_ACTIVITIES) as MuhurtaActivityId[]).map((actId) => {
                const conf = MUHURTA_ACTIVITIES[actId];
                const isSel = selectedActivity === actId;
                return (
                  <button
                    key={actId}
                    onClick={() => setSelectedActivity(actId)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSel
                        ? 'bg-[#141932] border-[#C9A96E] shadow-sm ring-1 ring-[#C9A96E]/40'
                        : 'bg-[#090C18]/80 border-white/10 hover:border-white/25 hover:bg-[#141932]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {activityIcons[actId]}
                      {isSel && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-[#EDE8E0]">
                        {conf.titleTe.split('(')[0].trim()}
                      </div>
                      <div className="text-[10px] text-[#EDE8E0]/50 truncate mt-0.5">
                        {conf.titleEn.split('(')[0].trim()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Activity Deep Shastra Brief */}
            <div className="p-3.5 bg-[#090C18] border border-white/10 rounded-lg text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <span className="font-bold text-[#C9A96E]">
                  {MUHURTA_ACTIVITIES[selectedActivity].titleTe}
                </span>
                <span className="text-[#EDE8E0]/60">
                  ఆరాధ్య దైవం: <strong className="text-[#5BBFB5]">{MUHURTA_ACTIVITIES[selectedActivity].deityTe}</strong> · కారక గ్రహాలు: <strong className="text-[#9B8FD4]">{MUHURTA_ACTIVITIES[selectedActivity].primaryGrahamsTe}</strong>
                </span>
              </div>
              <p className="text-[#EDE8E0]/75 leading-relaxed text-[11px]">
                {MUHURTA_ACTIVITIES[selectedActivity].descriptionTe}
              </p>
              <div className="text-[10px] font-mono-tabular text-[#EDE8E0]/50 pt-1">
                శాస్త్ర ప్రమాణం: {MUHURTA_ACTIVITIES[selectedActivity].shastraPramanamTe}
              </div>
            </div>
          </div>

          {/* Search Controls & Filters Bar */}
          <div className="bg-[#0F1326] border border-white/10 rounded-xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[11px] text-[#EDE8E0]/60 mb-1">
                  అన్వేషణ ప్రారంభ తేదీ (Start Search From):
                </label>
                <input
                  type="date"
                  value={almanacDate}
                  onChange={(e) => setAlmanacDate(e.target.value)}
                  className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#EDE8E0]/60 mb-1">
                  అన్వేషణ వ్యవధి (Search Window):
                </label>
                <select
                  value={searchHorizonDays}
                  onChange={(e) => setSearchHorizonDays(Number(e.target.value))}
                  className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                >
                  <option value={30}>రాబోయే 30 రోజులు (Next 30 Days)</option>
                  <option value={60}>రాబోయే 60 రోజులు (Next 60 Days - Recommended)</option>
                  <option value={90}>రాబోయే 90 రోజులు (Next 90 Days)</option>
                  <option value={120}>రాబోయే 120 రోజులు (Next 4 Months)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#EDE8E0]/60 mb-1">
                  కనిష్ట శుభ స్కోర్ (Minimum Score Filter):
                </label>
                <select
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                  className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                >
                  <option value={80}>అత్యుత్తమ ముహూర్తాలు మాత్రమే (Score 80%+)</option>
                  <option value={70}>ఉత్తమ & మంచి ముహూర్తాలు (Score 70%+)</option>
                  <option value={60}>మధ్యమ ముహూర్తాలతో సహా (Score 60%+)</option>
                  <option value={50}>అన్ని రోజులు చూపించు (All Days)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pb-1">
                <label className="flex items-center gap-2 text-xs text-[#EDE8E0]/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyWeekends}
                    onChange={(e) => setOnlyWeekends(e.target.checked)}
                    className="accent-[#C9A96E] rounded"
                  />
                  <span>శని/ఆదివారాలు మాత్రమే (Weekends)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Header Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#EDE8E0]">
                లభించిన శుభ ముహూర్తాలు:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] font-mono-tabular font-bold text-xs">
                {searchResults.length} రోజులు
              </span>
              <span className="text-xs text-[#EDE8E0]/50">
                (స్థలం: {chart.input.city} దృగ్గణిత లెక్కలు)
              </span>
            </div>

            <div className="text-xs text-[#EDE8E0]/60 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5BBFB5]" />
                అత్యుత్తమం (85+)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A96E]" />
                ఉత్తమం (72-84)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9B8FD4]" />
                మధ్యమం (55-71)
              </span>
            </div>
          </div>

          {/* Results Grid */}
          {searchResults.length === 0 ? (
            <div className="bg-[#0F1326] border border-white/10 rounded-xl p-8 text-center text-[#EDE8E0]/60">
              ఎంచుకున్న ఫిల్టర్లకు అనువైన ముహూర్తాలు లభించలేదు. దయచేసి కనిష్ట స్కోర్ తగ్గించి లేదా అన్వేషణ వ్యవధిని (60/90 రోజులకు) పెంచి చూడండి.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((res) => {
                return (
                  <div
                    key={res.date}
                    className="bg-[#0F1326] border border-white/10 hover:border-[#C9A96E]/50 rounded-xl p-5 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Top Date & Day Badge */}
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <div className="text-base font-bold text-[#EDE8E0] group-hover:text-[#C9A96E] transition-colors">
                            {res.date} ({res.dayNameTe})
                          </div>
                          <div className="text-[11px] font-mono-tabular text-[#EDE8E0]/50">
                            {res.dayNameEn}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold"
                            style={{
                              backgroundColor: `${res.gradeColor}20`,
                              color: res.gradeColor,
                              border: `1px solid ${res.gradeColor}40`,
                            }}
                          >
                            {res.shubhaScore}% · {res.gradeTe.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Panchanga Limbs Summary */}
                      <div className="py-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#EDE8E0]/55">తిథి:</span>
                          <span className="font-semibold text-[#EDE8E0]">
                            {res.tithiNameTe}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#EDE8E0]/55">నక్షత్రం:</span>
                          <span className="font-semibold text-[#5BBFB5]">
                            {res.nakshatraNameTe} ({res.pada}వ పాదం)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#EDE8E0]/55">తారాబలం:</span>
                          <span
                            className={`font-semibold ${
                              res.isTarabalaFavorable
                                ? 'text-[#5BBFB5]'
                                : 'text-[#D47B7B]'
                            }`}
                          >
                            {res.tarabalaNameTe}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#EDE8E0]/55">చంద్రాబలం:</span>
                          <span
                            className={`font-semibold ${
                              res.isChandrashtama
                                ? 'text-[#D47B7B]'
                                : 'text-[#C9A96E]'
                            }`}
                          >
                            {res.isChandrashtama
                              ? 'చంద్రాష్టమ దోషం!'
                              : `శుభం (${res.chandrabalaHouse}వ రాశి)`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#EDE8E0]/55">నిత్య యోగం & కరణం:</span>
                          <span className="text-[#EDE8E0]/80">
                            {res.yogaNameTe} · {res.karanaNameTe}
                          </span>
                        </div>
                      </div>

                      {/* Time Slots (Abhijit & Rahu Kalam) */}
                      <div className="bg-[#090C18] p-2.5 rounded-lg border border-white/5 space-y-1 text-[11px] font-mono-tabular">
                        <div className="flex justify-between">
                          <span className="text-[#5BBFB5]">అభిజిత్ ముహూర్తం:</span>
                          <span className="font-bold text-[#EDE8E0]">
                            {res.abhijitMuhurta}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#D47B7B]">రాహుకాలం (వర్జ్యం):</span>
                          <span className="text-[#EDE8E0]/70">
                            {res.rahuKalam}
                          </span>
                        </div>
                      </div>

                      {/* Key Favorable Highlight */}
                      {res.favorablePointsTe.length > 0 && (
                        <div className="mt-3 text-[11px] text-[#5BBFB5] leading-snug flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{res.favorablePointsTe[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Intraday Time Finder & Deep Pandit Consultation */}
                    <div className="pt-4 mt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setAlmanacDate(res.date);
                          setSubTab('auspicious_time_finder');
                        }}
                        className="py-2 px-2.5 rounded-lg bg-[#5BBFB5]/15 hover:bg-[#5BBFB5] text-[#5BBFB5] hover:text-[#090C18] border border-[#5BBFB5]/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>శుభ సమయాలు (Timings)</span>
                      </button>
                      <button
                        onClick={() => handleSelectDateForConsultation(res)}
                        className="py-2 px-2.5 rounded-lg bg-[#141932] hover:bg-[#C9A96E] text-[#C9A96E] hover:text-[#090C18] border border-[#C9A96E]/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>సిద్ధాంతి విశ్లేషణ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VEDIC SCHOLAR DEEP CONSULTATION & OBSTACLES DIAGNOSTIC */}
      {/* ========================================================================= */}
      {subTab === 'pandit_consultation' && (
        <div className="space-y-8">
          {/* Royal Erudite Banner */}
          <div className="bg-[#0F1326] border-2 border-[#C9A96E]/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="max-w-4xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] text-xs font-bold border border-[#C9A96E]/30">
                <Sparkles className="w-3.5 h-3.5" />
                స్వస్తిశ్రీ వేద సిద్ధాంతి ముహూర్త నిర్ణయ పీఠం · Vedic Astrologer Consultation
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#EDE8E0]">
                ఒక గొప్ప పండితుడి సమగ్ర ముహూర్త పరిశీలన & ఆటంకాల విశ్లేషణ
              </h2>

              <p className="text-xs sm:text-sm text-[#EDE8E0]/80 leading-relaxed font-serif italic">
                &ldquo;కాలః సృజతి భూతాని కాలః సంహరతే ప్రజాః | సర్వే సుప్తాః ప్రబుధ్యంతే కాలో హి పరమేశ్వరః ||&rdquo;
                <br />
                <span className="not-italic text-xs text-[#C9A96E] mt-1 block">
                  — కాలపు ప్రవాహంలో ఏ శుభకార్యమైనా దేవతల అనుగ్రహం మరియు నవగ్రహ కిరణాల సంయోగంతో మాత్రమే సిద్ధిస్తుంది. దోషపూరిత క్షణంలో సంకల్పించిన కార్యం ఆటంకాలను, కలతలను, నష్టాలను తెస్తుంది.
                </span>
              </p>
            </div>
          </div>

          {/* "మన దగ్గర Date & Time ఉంటే చెప్పొచ్చు గా!" Custom Date/Time Scrubber */}
          <div className="bg-[#0F1326] border border-white/10 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#EDE8E0] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C9A96E]" />
                  మీ వద్ద ఉన్న తేదీ & సమయాన్ని ఇక్కడ పరీక్షించండి (Test Any Proposed Date & Time)
                </h3>
                <p className="text-xs text-[#EDE8E0]/60 mt-0.5">
                  వివాహం జరిగిన రోజు, గృహప్రవేశం చేసిన తేది లేదా రాబోయే ముహూర్తాన్ని ఇస్తే... అప్పుడు ఎలాంటి ఆటంకాలు జరిగాయి? ఎందుకు జరిగాయి? ఆటంకాలు రాకుండా ముందే ఏం చేయాలి? అనే సమాధానాలను సిద్ధాంతి వివరిస్తారు.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#EDE8E0]/70 mb-1">
                  పరీక్షించవలసిన తేదీ (Test Date):
                </label>
                <input
                  type="date"
                  value={consultDate}
                  onChange={(e) => setConsultDate(e.target.value)}
                  className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#EDE8E0]/70 mb-1">
                  నిర్దిష్ట సమయం (Test Time):
                </label>
                <input
                  type="time"
                  value={consultTime}
                  onChange={(e) => setConsultTime(e.target.value)}
                  className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#EDE8E0]/70 mb-1">
                  సంకల్ప కార్యం (Event Purpose):
                </label>
                <select
                  value={consultActivity}
                  onChange={(e) =>
                    setConsultActivity(e.target.value as MuhurtaActivityId)
                  }
                  className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                >
                  {(Object.keys(MUHURTA_ACTIVITIES) as MuhurtaActivityId[]).map(
                    (actId) => (
                      <option key={actId} value={actId}>
                        {MUHURTA_ACTIVITIES[actId].titleTe}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Deep Diagnostic Results Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 Cols: Pandit Verdict Score Gauge & Key Telemetry */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-xl p-5 text-center space-y-4">
                <span className="text-[11px] font-mono-tabular uppercase text-[#EDE8E0]/60">
                  పంచాంగ శుద్ధి పరీక్షా స్కోర్ (Panchanga Purity Score)
                </span>

                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className="text-5xl font-display font-bold"
                    style={{ color: consultEvaluation.gradeColor }}
                  >
                    {consultEvaluation.shubhaScore}
                  </span>
                  <span className="text-base text-[#EDE8E0]/50 font-mono-tabular">
                    /100
                  </span>
                </div>

                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${consultEvaluation.gradeColor}20`,
                    color: consultEvaluation.gradeColor,
                    border: `1px solid ${consultEvaluation.gradeColor}50`,
                  }}
                >
                  {consultEvaluation.gradeTe}
                </div>

                <p className="text-xs text-[#EDE8E0]/75 leading-relaxed text-left border-t border-white/10 pt-3">
                  {consultEvaluation.siddhantiVerdictTe}
                </p>
              </div>

              {/* Exact Ephemeris Coordinates for this test moment */}
              <div className="bg-[#0F1326] border border-white/10 rounded-xl p-4 space-y-2.5 text-xs font-mono-tabular">
                <div className="font-sans font-bold text-xs text-[#C9A96E] border-b border-white/10 pb-1.5">
                  ఆ క్షణపు గ్రహస్థితి & కాలచక్రం
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDE8E0]/55">వారం & తిథి:</span>
                  <span className="text-[#EDE8E0]">
                    {consultEvaluation.dayNameTe} · {consultEvaluation.tithiNameTe}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDE8E0]/55">నక్షత్రం:</span>
                  <span className="text-[#5BBFB5]">
                    {consultEvaluation.nakshatraNameTe} (పాదం {consultEvaluation.pada})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDE8E0]/55">తారాబలం:</span>
                  <span
                    className={
                      consultEvaluation.isTarabalaFavorable
                        ? 'text-[#5BBFB5]'
                        : 'text-[#D47B7B]'
                    }
                  >
                    {consultEvaluation.tarabalaNameTe}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDE8E0]/55">చంద్రాబలం:</span>
                  <span
                    className={
                      consultEvaluation.isChandrashtama
                        ? 'text-[#D47B7B]'
                        : 'text-[#C9A96E]'
                    }
                  >
                    {consultEvaluation.isChandrashtama
                      ? 'చంద్రాష్టమం!'
                      : `${consultEvaluation.chandrabalaHouse}వ స్థానం`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDE8E0]/55">రాహుకాలం:</span>
                  <span className="text-[#D47B7B]">
                    {consultEvaluation.rahuKalam}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDE8E0]/55">అభిజిత్ ముహూర్తం:</span>
                  <span className="text-[#5BBFB5]">
                    {consultEvaluation.abhijitMuhurta}
                  </span>
                </div>
              </div>
            </div>

            {/* Right 8 Cols: Deep Obstacle Diagnosis & Precise Shanti Remedies */}
            <div className="lg:col-span-8 space-y-6">
              {/* Box 1: "అసలు ఏమేమి ఆటంకాలు వస్తాయి? ఏం జరిగింది / ఏం జరగవచ్చు?" */}
              <div className="bg-[#0F1326] border border-white/10 rounded-xl p-6 space-y-5">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[11px] font-mono-tabular text-[#D47B7B] uppercase font-bold tracking-wider">
                    ఆటంకాల విశ్లేషణ · Obstacle Diagnosis & Causality
                  </span>
                  <h3 className="text-xl font-display font-bold text-[#EDE8E0] mt-1">
                    ఈ ముహూర్తంలో ఏమేమి ఆటంకాలు ఉన్నాయి? ఏం జరిగి ఉండవచ్చు / ఏం జరగవచ్చు?
                  </h3>
                  <p className="text-xs text-[#EDE8E0]/60 mt-1">
                    ముహూర్తంలో లోపాలున్నప్పుడు అవి భౌతిక జీవితంలో ఏయే రూపాల్లో ఆటంకాలుగా మారుతాయో శాస్త్రోక్తంగా చూడండి:
                  </p>
                </div>

                <div className="space-y-4">
                  {panditConsultation.pradhanaAtankaluTe.map((atk, idx) => {
                    const isSevere = atk.intensityTe.includes('Severe');
                    const isMod = atk.intensityTe.includes('Moderate');
                    const isClean = atk.intensityTe.includes('Clean');

                    return (
                      <div
                        key={`atankam-${atk.doshaNameTe}-${idx}`}
                        className={`p-4 rounded-xl border transition-all ${
                          isClean
                            ? 'bg-[#5BBFB5]/10 border-[#5BBFB5]/30'
                            : isSevere
                            ? 'bg-[#D47B7B]/10 border-[#D47B7B]/40'
                            : isMod
                            ? 'bg-[#C9A96E]/10 border-[#C9A96E]/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            {isClean ? (
                              <ShieldCheck className="w-4 h-4 text-[#5BBFB5]" />
                            ) : (
                              <ShieldAlert
                                className={`w-4 h-4 ${
                                  isSevere ? 'text-[#D47B7B]' : 'text-[#C9A96E]'
                                }`}
                              />
                            )}
                            <h4 className="text-sm font-bold text-[#EDE8E0]">
                              {atk.doshaNameTe}
                            </h4>
                          </div>

                          <span
                            className={`text-[11px] font-mono-tabular font-bold px-2 py-0.5 rounded ${
                              isClean
                                ? 'bg-[#5BBFB5]/20 text-[#5BBFB5]'
                                : isSevere
                                ? 'bg-[#D47B7B]/20 text-[#D47B7B]'
                                : 'bg-[#C9A96E]/20 text-[#C9A96E]'
                            }`}
                          >
                            {atk.intensityTe}
                          </span>
                        </div>

                        <div className="pt-3 space-y-2 text-xs leading-relaxed">
                          <div>
                            <span className="font-bold text-[#EDE8E0]/70">
                              అసలు ఈ ఆటంకం ఎందుకు వస్తుంది? (Why it happens):
                            </span>
                            <p className="text-[#EDE8E0]/85 mt-0.5">
                              {atk.whyItHappensTe}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-[#C9A96E]">
                              గతంలో ఏం జరిగి ఉండవచ్చు / భవిష్యత్తులో ఏం జరిగే అవకాశం ఉంది? (Practical Manifestation):
                            </span>
                            <p className="text-[#EDE8E0]/85 mt-0.5">
                              {atk.pastOrFutureManifestationTe}
                            </p>
                          </div>

                          <div className="bg-[#090C18]/80 p-2.5 rounded-lg border border-white/10 mt-2">
                            <span className="font-bold text-[#5BBFB5]">
                              శాస్త్రోక్త పరిష్కారం / పరిహారం (Remedy):
                            </span>
                            <p className="text-[#EDE8E0]/90 mt-0.5">
                              {atk.pariharamTe}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 2: "ఆటంకాలు జరగకుండా ఏమి చేయాలి? సిద్ధాంతి గారి సమగ్ర కార్యాచరణ ప్రణాళిక" */}
              <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-xl p-6 space-y-5">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[11px] font-mono-tabular text-[#5BBFB5] uppercase font-bold tracking-wider">
                    రక్షా విధానం · Shanti & Protective Remedies
                  </span>
                  <h3 className="text-xl font-display font-bold text-[#EDE8E0] mt-1">
                    ఆటంకాలు జరగకుండా ముందుగానే ఏమి చేయాలి? (Vedic Protection Protocol)
                  </h3>
                  <p className="text-xs text-[#EDE8E0]/60 mt-1">
                    ఒకవేళ ఈ తేదీ లేదా సమయానికి మాత్రమే కార్యం చేయవలసి వస్తే, ఆటంకాలు తొలగించడానికి పండితుడు సూచించిన 4 రక్షా సూత్రాలు:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {panditConsultation.recommendedActionPlanTe.map((act, i) => (
                    <div
                      key={`action-plan-${i}`}
                      className="p-3.5 bg-[#090C18] border border-white/10 rounded-lg text-xs leading-relaxed text-[#EDE8E0]/85"
                    >
                      {act}
                    </div>
                  ))}
                </div>

                {/* Karya Siddhi Maha Mantram */}
                <div className="bg-gradient-to-r from-[#141932] to-[#090C18] border border-[#C9A96E]/30 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C9A96E]">
                    <Sparkles className="w-4 h-4" />
                    కార్యసిద్ధి & నిర్విఘ్న మహా గణపతి మంత్రం (Chant before starting):
                  </div>
                  <div className="text-sm font-bold text-[#EDE8E0] font-serif tracking-wide py-1">
                    {panditConsultation.karyasiddhiMantraTe}
                  </div>
                  <p className="text-[11px] text-[#EDE8E0]/60">
                    విధి: సంకల్పానికి 30 నిమిషాల ముందు నెయ్యి దీపం వెలిగించి, 21 సార్లు ఈ మంత్రాన్ని జపించి ప్రారంభించిన యెడల సకల గ్రహదోషాలు ఉపశమిస్తాయి.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DAILY PANCHANGA & ALMANAC (శ్రీ పంచాంగం & దివ్య ఆల్మనాక్) */}
      {/* ========================================================================= */}
      {subTab === 'panchanga_almanac' && (
        <div className="space-y-6">
          <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-display font-normal text-[#EDE8E0]">
                  Vedic Panchanga & Muhurta ·{' '}
                  <span className="italic text-[#C9A96E]">
                    Five-Limb Celestial Almanac
                  </span>
                </h2>
                <p className="text-sm text-[#EDE8E0]/60 mt-1">
                  Calculated for {chart.input.city}, {chart.input.country} (
                  {chart.input.lat.toFixed(2)}°N, {chart.input.lng.toFixed(2)}°E · UTC
                  {chart.input.tzOffsetHours >= 0
                    ? `+${chart.input.tzOffsetHours}`
                    : chart.input.tzOffsetHours}
                  ).
                </p>
              </div>

              {/* Date/Time Scrubber */}
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="date"
                  value={almanacDate}
                  onChange={(e) => setAlmanacDate(e.target.value)}
                  className="bg-[#090C18] border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                />
                <input
                  type="time"
                  value={almanacTime}
                  onChange={(e) => setAlmanacTime(e.target.value)}
                  className="bg-[#090C18] border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
                />
                <button
                  onClick={() => {
                    const now = new Date();
                    setAlmanacDate(now.toISOString().slice(0, 10));
                    setAlmanacTime(now.toTimeString().slice(0, 5));
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-[#141932] hover:bg-white/10 text-[#C9A96E] border border-[#C9A96E]/30 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Set to Today
                </button>
                <button
                  onClick={() => {
                    setAlmanacDate(chart.input.date);
                    setAlmanacTime(chart.input.time);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-[#090C18] hover:bg-white/5 text-[#EDE8E0]/70 border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reset to Birth
                </button>
              </div>
            </div>

            {/* 5 Limbs of Panchanga Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-6">
              <div className="p-4 bg-[#090C18]/80 border border-white/10 rounded-lg">
                <div className="text-xs text-[#EDE8E0]/50">01 · Tithi (Lunar Day)</div>
                <div className="text-lg font-semibold text-[#EDE8E0] mt-1">
                  {p.tithi.name} ({p.tithi.number}/30)
                </div>
                <div className="text-xs text-[#C9A96E] mt-1">{p.tithi.paksha}</div>
                <div className="text-xs font-mono-tabular text-[#EDE8E0]/55 mt-2">
                  Lord: {p.tithi.lord} · {p.tithi.percentElapsed}% elapsed
                </div>
              </div>

              <div className="p-4 bg-[#090C18]/80 border border-white/10 rounded-lg">
                <div className="text-xs text-[#EDE8E0]/50">02 · Vara (Solar Weekday)</div>
                <div className="text-lg font-semibold text-[#EDE8E0] mt-1">
                  {p.vara.sanskrit}
                </div>
                <div className="text-xs text-[#C9A96E] mt-1">{p.vara.name}</div>
                <div className="text-xs font-mono-tabular text-[#EDE8E0]/55 mt-2">
                  Planetary Ruler: {p.vara.lord}
                </div>
              </div>

              <div className="p-4 bg-[#090C18]/80 border border-white/10 rounded-lg">
                <div className="text-xs text-[#EDE8E0]/50">03 · Nakshatra (Star Mansion)</div>
                <div className="text-lg font-semibold text-[#EDE8E0] mt-1">
                  {p.nakshatra.name} · Pada {p.nakshatra.pada}
                </div>
                <div className="text-xs text-[#5BBFB5] mt-1">
                  Ruler: {p.nakshatra.lord} · {p.nakshatra.deity}
                </div>
                <div className="text-xs font-mono-tabular text-[#EDE8E0]/55 mt-2">
                  {p.nakshatra.gana.split(' ')[0]} · {p.nakshatra.nadi}
                </div>
              </div>

              <div className="p-4 bg-[#090C18]/80 border border-white/10 rounded-lg">
                <div className="text-xs text-[#EDE8E0]/50">04 · Nitya Yoga (Solar-Lunar Sum)</div>
                <div className="text-lg font-semibold text-[#EDE8E0] mt-1">
                  {p.yoga.name} (#{p.yoga.number})
                </div>
                <div className="text-xs text-[#9B8FD4] mt-1">{p.yoga.meaning}</div>
                <div className="text-xs font-mono-tabular text-[#EDE8E0]/55 mt-2">
                  Elongation: {p.lunarPhaseAngle}°
                </div>
              </div>

              <div className="p-4 bg-[#090C18]/80 border border-white/10 rounded-lg">
                <div className="text-xs text-[#EDE8E0]/50">05 · Karana (Half-Tithi)</div>
                <div className="text-lg font-semibold text-[#EDE8E0] mt-1">
                  {p.karana.name}
                </div>
                <div className="text-xs text-[#C9A96E] mt-1">{p.karana.type}</div>
                <div className="text-xs font-mono-tabular text-[#EDE8E0]/55 mt-2">
                  Next Eclipse: {p.nextEclipse.dateUTC} ({p.nextEclipse.kind})
                </div>
              </div>
            </div>

            {/* Solar & Muhurta Windows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="p-4 bg-[#090C18]/60 border border-white/10 rounded-lg">
                <div className="text-xs font-semibold text-[#EDE8E0] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#C9A96E]" />
                  Local Solar Horizon (Dinamana)
                </div>
                <div className="mt-2 space-y-1.5 text-xs font-mono-tabular">
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Sunrise (Suryodaya):</span>
                    <span className="text-[#C9A96E]">{p.sunTimes.sunriseLocal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Sunset (Suryasta):</span>
                    <span className="text-[#C9A96E]">{p.sunTimes.sunsetLocal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Daylight Span:</span>
                    <span className="text-[#EDE8E0]">
                      {p.sunTimes.dayDurationHours} hrs
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#090C18]/60 border border-white/10 rounded-lg">
                <div className="text-xs font-semibold text-[#5BBFB5] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#5BBFB5]" />
                  Shubha Muhurta (Auspicious Windows)
                </div>
                <div className="mt-2 space-y-1.5 text-xs font-mono-tabular">
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Brahma Muhurta:</span>
                    <span className="text-[#5BBFB5]">{p.muhurtas.brahmaMuhurta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Abhijit Muhurta (Midday):</span>
                    <span className="text-[#5BBFB5]">
                      {p.muhurtas.abhijitMuhurta}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Nakshatra Yoni / Nadi:</span>
                    <span className="text-[#EDE8E0]">
                      {p.nakshatra.yoni} · {p.nakshatra.nadi}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#090C18]/60 border border-white/10 rounded-lg">
                <div className="text-xs font-semibold text-[#D47B7B] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D47B7B]" />
                  Ashubha Kalam (Caution Intervals)
                </div>
                <div className="mt-2 space-y-1.5 text-xs font-mono-tabular">
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Rahu Kalam:</span>
                    <span className="text-[#D47B7B]">{p.muhurtas.rahuKalam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Yamaganda Kalam:</span>
                    <span className="text-[#EDE8E0]/85">
                      {p.muhurtas.yamagandaKalam}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDE8E0]/60">Gulika Kalam:</span>
                    <span className="text-[#EDE8E0]/85">
                      {p.muhurtas.gulikaKalam}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HERMETIC LOTS, COSMOBIOLOGY MIDPOINTS & FIXED STARS */}
      {/* ========================================================================= */}
      {subTab === 'arabic_lots_stars' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hermetic / Arabic Lots */}
            <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-xl font-display font-normal text-[#EDE8E0]">
                  Hermetic & Arabic Lots ·{' '}
                  <span className="italic text-[#C9A96E]">Hellenistic Klēroi</span>
                </h3>
                <p className="text-xs text-[#EDE8E0]/60 mt-1">
                  Calculated with diurnal/nocturnal sect reversal according to Dorotheus of Sidon and Vettius Valens.
                </p>
              </div>
              <div className="overflow-x-auto pt-3">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-mono-tabular text-[#EDE8E0]/55">
                      <th className="py-2.5 px-2">Lot / Formula</th>
                      <th className="py-2.5 px-2">Position</th>
                      <th className="py-2.5 px-2 text-right">House</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {chart.arabicLots.map((lot) => (
                      <tr key={lot.name} className="hover:bg-white/5">
                        <td className="py-2.5 px-2">
                          <div className="font-medium text-[#EDE8E0]">{lot.name}</div>
                          <div className="text-[11px] text-[#EDE8E0]/50 font-mono-tabular">
                            {lot.formula}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono-tabular text-[#C9A96E] whitespace-nowrap">
                          {lot.signGlyph} {lot.signName} {lot.formattedDMS}
                        </td>
                        <td className="py-2.5 px-2 font-mono-tabular text-right text-[#EDE8E0]/80">
                          H{lot.house}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Cosmobiology Midpoint Tree */}
            <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-xl font-display font-normal text-[#EDE8E0]">
                  Cosmobiology Midpoints ·{' '}
                  <span className="italic text-[#C9A96E]">90° Dial Activations</span>
                </h3>
                <p className="text-xs text-[#EDE8E0]/60 mt-1">
                  Half-sum planetary midpoints (Ebertin / Astrolog 8.0 method) and closest activating body in the 8th-harmonic dial.
                </p>
              </div>
              <div className="overflow-x-auto pt-3">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-mono-tabular text-[#EDE8E0]/55">
                      <th className="py-2.5 px-2">Midpoint Pair</th>
                      <th className="py-2.5 px-2">Degree</th>
                      <th className="py-2.5 px-2">Activator</th>
                      <th className="py-2.5 px-2 text-right">Orb</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {chart.midpoints.map((mp) => (
                      <tr key={mp.pair} className="hover:bg-white/5">
                        <td className="py-2.5 px-2">
                          <div className="font-medium text-[#EDE8E0]">{mp.pair}</div>
                          <div className="text-[11px] text-[#EDE8E0]/50">
                            {mp.interpretation}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono-tabular text-[#EDE8E0]/80 whitespace-nowrap">
                          {mp.midpointDMS}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="font-medium text-[#9B8FD4]">
                            {mp.activatingPlanet}
                          </span>
                          <div className="text-[10px] font-mono-tabular text-[#EDE8E0]/50">
                            {mp.contactType}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono-tabular text-right text-[#5BBFB5]">
                          {mp.orb.toFixed(2)}°
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Royal & Major Fixed Stars */}
          <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
            <div className="pb-4 border-b border-white/10">
              <h3 className="text-xl font-display font-normal text-[#EDE8E0]">
                Fixed Star Parans & Ecliptic Conjunctions ·{' '}
                <span className="italic text-[#C9A96E]">Brady & Ptolemaic Catalog</span>
              </h3>
              <p className="text-xs text-[#EDE8E0]/60 mt-1">
                Precession-adjusted positions of the Four Royal Stars of Persia and major first-magnitude fiducial stars relative to natal planets.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {chart.fixedStars.map((st) => (
                <div
                  key={st.starName}
                  className="p-4 bg-[#090C18]/75 border border-white/10 rounded-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-tabular text-[#EDE8E0]/55">
                      <span>
                        {st.designation} · {st.constellation}
                      </span>
                      <span>Mag {st.magnitude}</span>
                    </div>
                    <div className="text-base font-semibold text-[#C9A96E] mt-1">
                      {st.starName}
                    </div>
                    <p className="text-xs text-[#EDE8E0]/70 mt-1.5 leading-relaxed">
                      {st.significance}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-mono-tabular">
                    <span className="text-[#EDE8E0]">Conjunct {st.planet}</span>
                    <span className="text-[#5BBFB5]">
                      Orb {st.orb.toFixed(2)}° · {st.ptolemaicNature}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 27 Nakshatras Directory */}
          <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
            <div className="pb-4 border-b border-white/10">
              <h3 className="text-xl font-display font-normal text-[#EDE8E0]">
                27 Lunar Mansions ·{' '}
                <span className="italic text-[#C9A96E]">Nakshatra Mandala Occupancy</span>
              </h3>
              <p className="text-xs text-[#EDE8E0]/60 mt-1">
                Each Nakshatra spans 13°20' (4 Padas of 3°20'). Highlighted cells indicate lunar mansions occupied by planets in {chart.input.name}'s chart.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
              {NAKSHATRAS.map((nak) => {
                const occupants = chart.planets.filter(
                  (pl) => pl.nakshatra === nak.name
                );
                const isAscNak = chart.ascendant.nakshatra === nak.name;
                const hasOccupancy = occupants.length > 0 || isAscNak;

                return (
                  <div
                    key={nak.index}
                    className={`p-3.5 rounded-lg border transition-colors ${
                      hasOccupancy
                        ? 'bg-[#141932] border-[#C9A96E]/50'
                        : 'bg-[#090C18]/50 border-white/5 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="text-[#EDE8E0]/50">
                        #{String(nak.index + 1).padStart(2, '0')} · Ruler: {nak.ruler}
                      </span>
                      <span className="text-[#EDE8E0]/50">{nak.nadi}</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-semibold text-[#EDE8E0]">
                        {nak.name}
                      </span>
                      <span className="text-xs text-[#EDE8E0]/55">{nak.deity}</span>
                    </div>
                    {hasOccupancy && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-2 text-xs font-mono-tabular text-[#C9A96E]">
                        {isAscNak && <span>Asc (Pada {chart.ascendant.pada})</span>}
                        {occupants.map((occ) => (
                          <span key={occ.id}>
                            {occ.glyph} {occ.name} (P{occ.pada})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
