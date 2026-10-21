import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Compass,
  Award,
  Clock,
  Sparkles,
  Share2,
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
} from 'lucide-react';
import { type CompleteChartResult } from '../engine/ephemeris.ts';
import { generateTajikaVarshaphalaReport } from '../engine/tajikaVarshaphalaEngine.ts';
import { SouthIndianKundaliSvg } from './ChartsSvg.tsx';
import { RoyalWhatsAppSummaryModal } from './RoyalWhatsAppSummaryModal.tsx';

interface TajikaVarshaphalaViewProps {
  chart: CompleteChartResult;
  embeddedMode?: boolean;
}

export const TajikaVarshaphalaView: React.FC<TajikaVarshaphalaViewProps> = ({
  chart,
  embeddedMode = false,
}) => {
  const currentYear = new Date().getFullYear();
  const birthYear = Number(chart.input.date.split('-')[0]) || 1998;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(
    new Date().getMonth()
  );
  const [isRoyalCardOpen, setIsRoyalCardOpen] = useState<boolean>(false);
  const [selectedVarshaPlanetId, setSelectedVarshaPlanetId] = useState<string | null>('Sun');

  const report = useMemo(
    () => generateTajikaVarshaphalaReport(chart, selectedYear),
    [chart, selectedYear]
  );

  const quickYears = [
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
    currentYear + 3,
    currentYear + 4,
  ];

  const activeMonthForecast =
    report.twelveMonthForecasts[selectedMonthIdx] ??
    report.twelveMonthForecasts[0];

  return (
    <div className={embeddedMode ? 'space-y-6' : 'space-y-8 pb-20'}>
      <RoyalWhatsAppSummaryModal
        isOpen={isRoyalCardOpen}
        onClose={() => setIsRoyalCardOpen(false)}
        chart={chart}
        targetYear={selectedYear}
      />

      {/* ===================================================================== */}
      {/* 1. ROYAL HEADER & TARGET YEAR SELECTOR CONSOLE                        */}
      {/* ===================================================================== */}
      <section className="bg-gradient-to-b from-[#141932] to-[#0F1326] border-2 border-[#C9A96E]/60 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#C9A96E]/25 pb-5">
          <div className="space-y-1.5">
            <div className="text-[11px] tracking-[0.14em] text-[#C9A96E] font-semibold">
              || తాజిక నీలకంఠీ వర్షఫల సిద్ధాంతం · వార్షిక సూర్య ప్రవేశ కుండలి & 12-నెలల పంచాంగ ఫలితాలు ||
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EDE8E0]">
              {selectedYear} తాజిక వర్షఫల & 12-నెలల దినచర్య ఫల దర్శిని ({report.runningYearOfLife}వ ఏడు)
            </h1>
            <p className="text-xs sm:text-sm text-[#EDE8E0]/75 max-w-3xl leading-relaxed">
              సూర్యుడు మీ జన్మ కుండలిలోని ఖచ్చితమైన డిగ్రీకి తిరిగి చేరుకునే <strong className="text-[#C9A96E]">వర్ష ప్రవేశ కాలం</strong> ఆధారంగా — ముంథా స్థితి, వర్షేశ్వరుడు (Year Lord), తాజిక యోగాలు, 7 సహమ్‌లు, 365-రోజుల ముద్ద దశ మరియు 12 నెలల శుభ తేదీల విశ్లేషణ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsRoyalCardOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] text-[#090C18] text-xs font-bold hover:bg-[#d8b97e] transition-colors cursor-pointer shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>1-పేజీ రాజముద్ర కార్డు & WhatsApp షేర్</span>
            </button>
          </div>
        </div>

        {/* Target Year Selector Bar */}
        <div className="bg-[#090C18]/90 border border-white/10 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C9A96E]" />
            <span className="text-xs font-bold text-[#EDE8E0]">
              వర్షఫల సంవత్సరం ఎంచుకోండి (Select Target Year):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedYear((y) => Math.max(birthYear, y - 1))}
              className="p-1.5 rounded-lg bg-[#141932] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {quickYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-[#C9A96E] text-[#090C18] shadow-md'
                    : 'bg-[#141932] text-[#EDE8E0]/80 border border-white/10 hover:border-[#C9A96E]/50'
                }`}
              >
                {yr} ({ Math.max(0, yr - birthYear) + 1}వ ఏడు)
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedYear((y) => Math.min(birthYear + 100, y + 1))}
              className="p-1.5 rounded-lg bg-[#141932] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5 Key Varshaphala Telemetry Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-xl p-3.5">
            <div className="text-[11px] text-[#EDE8E0]/60">1. వర్ష ప్రవేశ సమయం</div>
            <div className="text-sm font-mono-tabular font-bold text-[#C9A96E] mt-1">
              {report.varshaPraveshaDate} · {report.varshaPraveshaTime}
            </div>
            <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
              {report.varshaPraveshaWeekdayTe}
            </div>
          </div>

          <div className="bg-[#090C18]/90 border border-[#5BBFB5]/35 rounded-xl p-3.5">
            <div className="text-[11px] text-[#EDE8E0]/60">2. వర్ష లగ్నం (Annual Ascendant)</div>
            <div className="text-sm font-bold text-[#EDE8E0] mt-1">
              {report.varshaLagnaRasiTe}
            </div>
            <div className="text-[11px] text-[#5BBFB5] mt-0.5">
              వర్ష లగ్నాధిపతి: {report.varshaLagnaLordTe}
            </div>
          </div>

          <div className="bg-[#090C18]/90 border border-[#C9A96E]/45 rounded-xl p-3.5">
            <div className="text-[11px] text-[#EDE8E0]/60">3. ముంథా స్థితి (Progressed Muntha)</div>
            <div className="text-sm font-bold text-[#C9A96E] mt-1">
              {report.munthaRasiTe.split(' ')[0]} ({report.munthaHouseFromVarshaLagna}వ భావం)
            </div>
            <div className="text-[11px] text-[#EDE8E0]/75 mt-0.5">
              ముంథాధిపతి: {report.muntheshPlanetTe} ({report.muntheshHouseInVarsha}వ ఇంట)
            </div>
          </div>

          <div className="bg-[#090C18]/90 border border-[#9B8FD4]/45 rounded-xl p-3.5">
            <div className="text-[11px] text-[#EDE8E0]/60">4. వర్షేశ్వరుడు (Lord of the Year)</div>
            <div className="text-sm font-bold text-[#9B8FD4] mt-1">
              👑 {report.varsheshwaraPlanetTe}
            </div>
            <div className="text-[11px] font-mono-tabular text-[#5BBFB5] mt-0.5">
              పంచవర్గీయ బలం: {report.varsheshwaraPanchavargiyaBala} / 20
            </div>
          </div>

          <div className="bg-[#090C18]/90 border border-[#5BBFB5]/50 rounded-xl p-3.5">
            <div className="text-[11px] text-[#EDE8E0]/60">5. వార్షిక శుభ ఫల స్కోరు</div>
            <div className="text-xl font-mono-tabular font-bold text-[#5BBFB5] mt-0.5">
              {report.annualOverallScorePct}%
            </div>
            <div className="text-[11px] text-[#C9A96E] mt-0.5">
              {report.tajikaYogas.length} తాజిక రాజయోగాలు
            </div>
          </div>
        </div>

        {/* Executive Summary Box */}
        <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-xl p-4 text-xs sm:text-sm text-[#EDE8E0]/90 leading-relaxed">
          <strong className="text-[#C9A96E]">వార్షిక సంక్షిప్త తీర్పు: </strong>
          {report.annualExecutiveSummaryTe}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. VARSHA KUNDALI SVG + MUNTHA & PANCHADHIKARI DEEP ANALYSIS          */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 6 cols: Varsha Kundali Chart */}
        <div className="lg:col-span-6 bg-[#0F1326] border border-[#C9A96E]/40 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-[#EDE8E0]">
                {selectedYear} వర్ష ప్రవేశ కుండలి (Solar Return Chart)
              </h2>
              <p className="text-xs text-[#C9A96E]">
                వర్ష లగ్నం: {report.varshaLagnaRasiTe.split(' ')[0]} · ముంథా: {report.munthaRasiTe.split(' ')[0]} ({report.munthaHouseFromVarshaLagna}వ భావం)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <SouthIndianKundaliSvg
              chart={report.varshaChart}
              division="D1"
              selectedPlanetId={selectedVarshaPlanetId}
              onSelectPlanet={(p) => setSelectedVarshaPlanetId(p.id)}
              lang="te"
            />
          </div>
        </div>

        {/* Right 6 cols: Muntha Verdict & Panchadhikari (5 Officeholders) */}
        <div className="lg:col-span-6 bg-[#0F1326] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="border-b border-white/10 pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
                ముంథా & వర్షేశ్వర నిర్ణయ పీఠం (Muntha & Year Lord Verdict)
              </div>
              <h3 className="text-lg font-bold text-[#EDE8E0] mt-0.5">
                {selectedYear} లో ముంథా ({report.munthaHouseFromVarshaLagna}వ భావం) మరియు పంచాధికారుల బలాబలాలు
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-[#090C18]/90 border border-[#C9A96E]/40 space-y-2 text-xs leading-relaxed">
              <div className="font-bold text-[#C9A96E] text-sm">
                ★ ముంథా ఫలితం ({report.munthaRasiTe} — వర్ష లగ్నం నుండి {report.munthaHouseFromVarshaLagna}వ భావం):
              </div>
              <p className="text-[#EDE8E0]/90">{report.munthaDetailedVerdictTe}</p>
              <div className="text-[#5BBFB5] font-semibold pt-1">
                🛡️ వార్షిక ముంథా పరిహారం: {report.munthaRemedyTe}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090C18]/90 border border-[#9B8FD4]/40 text-xs leading-relaxed">
              <div className="font-bold text-[#9B8FD4]">
                👑 వర్షేశ్వరుడు ({report.varsheshwaraPlanetTe}) ఫలితం:
              </div>
              <p className="text-[#EDE8E0]/85 mt-1">{report.varsheshwaraVerdictTe}</p>
            </div>
          </div>

          {/* Panchadhikaris Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#EDE8E0]">
              తాజిక పంచాధికారులు & పంచవర్గీయ బలం (5 Officeholders of {selectedYear}):
            </div>
            <div className="overflow-x-auto border border-white/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#141932] text-[#C9A96E] border-b border-white/10">
                    <th className="py-2 px-3">అధికార పదవి</th>
                    <th className="py-2 px-3">గ్రహం</th>
                    <th className="py-2 px-3">వర్ష స్థితి</th>
                    <th className="py-2 px-3">బలం (/20)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#090C18]/90">
                  {report.panchadhikaris.map((pa, idx) => (
                    <tr
                      key={idx}
                      className={pa.isVarsheshwara ? 'bg-[#C9A96E]/15 font-bold' : ''}
                    >
                      <td className="py-2 px-3 text-[#EDE8E0]">{pa.roleTe}</td>
                      <td className="py-2 px-3 text-[#5BBFB5] font-bold">
                        {pa.planetNameTe} {pa.isVarsheshwara ? '👑 (వర్షేశ్వరుడు)' : ''}
                      </td>
                      <td className="py-2 px-3 text-[#EDE8E0]/80">
                        {pa.houseInVarsha}వ భావం ({pa.rasiNameTe})
                      </td>
                      <td className="py-2 px-3 font-mono-tabular text-[#C9A96E]">
                        {pa.panchavargiyaScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. 12-MONTH INTERACTIVE CALENDAR FORECAST (12 నెలల మాస ఫలితాలు)       */}
      {/* ===================================================================== */}
      <section className="bg-[#0F1326] border-2 border-[#5BBFB5]/50 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#5BBFB5]">
              12-నెలల దినచర్య & గోచార క్యాలెండర్ (12-Month Calendar Forecast for {selectedYear})
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDE8E0] mt-1">
              ప్రతి నెలా ఉద్యోగం, ధనం, కుటుంబం, శుభ తేదీలు & పాటించవలసిన జాగ్రత్తలు
            </h2>
          </div>
          <span className="text-xs text-[#C9A96E] font-semibold">
            నెల కార్డుపై క్లిక్ చేసి పూర్తి వివరాలు చూడండి
          </span>
        </div>

        {/* Active Month Spotlight Banner */}
        <div className="bg-gradient-to-r from-[#141932] via-[#090C18] to-[#141932] border border-[#C9A96E]/55 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <span className="text-xs font-mono-tabular text-[#C9A96E] font-bold">
                ఎంచుకున్న మాసం #{activeMonthForecast.monthNumber}
              </span>
              <h3 className="text-lg font-bold text-[#EDE8E0]">
                {activeMonthForecast.calendarMonthLabelTe} — సూర్య సంచారం: {activeMonthForecast.sunTransitRasiTe} రాశి (చంద్రుని నుండి {activeMonthForecast.monthlyHouseFromMoon}వ స్థానం)
              </h3>
            </div>
            <span className="px-3 py-1 rounded-lg bg-[#5BBFB5]/20 border border-[#5BBFB5]/50 text-xs font-mono-tabular font-bold text-[#5BBFB5]">
              {activeMonthForecast.statusBadgeTe} · {activeMonthForecast.fortuneScorePct}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="p-3 rounded-lg bg-[#0F1326] border border-white/10">
              <strong className="text-[#C9A96E] block mb-1">వృత్తి, ఉద్యోగం & ధన ప్రవాహం:</strong>
              <p className="text-[#EDE8E0]/90">{activeMonthForecast.careerAndWealthTe}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0F1326] border border-white/10">
              <strong className="text-[#5BBFB5] block mb-1">కుటుంబం, ఆరోగ్యం & మనశ్శాంతి:</strong>
              <p className="text-[#EDE8E0]/90">{activeMonthForecast.familyAndHealthTe}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <span className="text-[#5BBFB5] font-semibold">
              ✨ శుభ కార్యాలకు అనుకూల తేదీలు: <strong className="font-mono-tabular">{activeMonthForecast.auspiciousDatesTe}</strong>
            </span>
            <span className="text-[#D47B7B] font-semibold">
              ⚠️ జాగ్రత్త వహించాల్సిన తేదీలు: <strong className="font-mono-tabular">{activeMonthForecast.cautionDatesTe}</strong>
            </span>
            <span className="text-[#C9A96E] font-semibold">
              🙏 మాస పరిహారం: {activeMonthForecast.monthlyRemedyTe}
            </span>
          </div>
        </div>

        {/* 12 Months Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {report.twelveMonthForecasts.map((mf, idx) => {
            const isSelected = idx === selectedMonthIdx;
            return (
              <div
                key={mf.monthNumber}
                onClick={() => setSelectedMonthIdx(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'bg-[#141932] border-2 border-[#C9A96E] shadow-lg'
                    : 'bg-[#090C18]/90 border-white/10 hover:border-[#5BBFB5]/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#EDE8E0]">
                      {mf.monthNumber}. {mf.calendarMonthLabelTe.split(' ')[0]}
                    </span>
                    <span className="font-mono-tabular font-bold text-[#5BBFB5]">
                      {mf.fortuneScorePct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#141932] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C9A96E] to-[#5BBFB5]"
                      style={{ width: `${mf.fortuneScorePct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[#C9A96E] font-semibold">
                    రవి: {mf.sunTransitRasiTe} ({mf.monthlyHouseFromMoon}వ గోచారం)
                  </div>
                  <p className="text-[11px] text-[#EDE8E0]/80 line-clamp-3 leading-relaxed">
                    {mf.careerAndWealthTe}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-[#5BBFB5] font-mono-tabular">
                    శుభ: {mf.auspiciousDatesTe}
                  </span>
                  <span className="text-[#C9A96E] font-bold">వివరాలు →</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. 365-DAY MUDDA VIMSHOTTARI DASHA & TAJIKA YOGAS / 7 SAHAMS          */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: 365-Day Mudda Dasha */}
        <div className="lg:col-span-6 bg-[#0F1326] border border-[#C9A96E]/40 rounded-2xl p-5 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
              365-రోజుల తాజిక ముద్ద వింశోత్తరి దశా కాలచక్రం (Annual Mudda Dasha)
            </div>
            <h3 className="text-lg font-bold text-[#EDE8E0] mt-0.5">
              {selectedYear} వర్ష ప్రవేశం నుండి 9 గ్రహాల వార్షిక దశా విభజన
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {report.muddaDashas.map((md) => (
              <div
                key={md.lordId}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  md.isCurrent
                    ? 'bg-[#C9A96E]/15 border-[#C9A96E] shadow-md'
                    : 'bg-[#090C18]/90 border-white/10'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#EDE8E0] text-sm">
                    {md.lordNameTe} ముద్ద దశ ({md.daysCount} రోజులు)
                    {md.isCurrent && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-[#5BBFB5] text-[#090C18] text-[10px] font-extrabold">
                        ప్రస్తుతం నడుస్తున్నది
                      </span>
                    )}
                  </span>
                  <span className="font-mono-tabular text-[#C9A96E] font-semibold">
                    {md.startDate} → {md.endDate}
                  </span>
                </div>
                <p className="text-[#EDE8E0]/85 leading-relaxed">{md.phalamTe}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 cols: Tajika Yogas & 7 Sahams */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tajika Yogas */}
          <div className="bg-[#0F1326] border border-[#5BBFB5]/40 rounded-2xl p-5 space-y-3.5">
            <div className="border-b border-white/10 pb-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5BBFB5]">
                తాజిక నీలకంఠీ షోడశ యోగ పరీక్ష (Tajika Yogas — Ithasala, Kamboola, Iqbal)
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#EDE8E0] mt-0.5">
                {selectedYear} వర్ష కుండలిలో ఏర్పడిన తాజిక యోగాలు ({report.tajikaYogas.length})
              </h3>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {report.tajikaYogas.map((ty) => (
                <div
                  key={ty.id}
                  className="p-3 rounded-xl bg-[#090C18]/90 border border-white/10 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#C9A96E]">{ty.nameTe}</span>
                    <span className="text-[10px] text-[#5BBFB5] font-semibold">
                      {ty.natureTe}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#EDE8E0]/65 font-italic">
                    “{ty.sanskritRuleTe}”
                  </div>
                  <p className="text-[#EDE8E0]/90 leading-relaxed">{ty.vivaranaTe}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7 Sahams */}
          <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-2xl p-5 space-y-3.5">
            <div className="border-b border-white/10 pb-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
                సప్త ప్రధాన తాజిక సహమ్‌లు (7 Sensitive Mathematical Saham Lots)
              </div>
              <h3 className="text-base font-bold text-[#EDE8E0] mt-0.5">
                పుణ్య, విద్యా, యశో, గౌరవ, మిత్ర, కార్యసిద్ధి & వివాహ సహమ్ స్ఫుటములు
              </h3>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {report.sahams.map((sh) => (
                <div
                  key={sh.id}
                  className="p-3 rounded-lg bg-[#090C18]/90 border border-white/10 text-xs space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#5BBFB5]">{sh.nameTe}</span>
                    <span className="font-mono-tabular text-[#C9A96E] font-bold">
                      {sh.rasiNameTe} ({sh.degreeFormatted}) · {sh.houseInVarsha}వ భావం
                    </span>
                  </div>
                  <p className="text-[#EDE8E0]/85 leading-relaxed">{sh.phalamTe}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
