/**
 * RashiPhalaStudioView.tsx — రాశి ఫలాలు & ముహూర్త స్టూడియో
 * --------------------------------------------------------
 * పండితుడు క్లయింట్‌కు ఇచ్చే రోజు/వారం/నెల/సంవత్సర ఫలాలు — అన్నీ నిజంగా
 * లెక్కించిన పంచాంగం, గోచారం, దశల నుంచి. ఏ తేదీకైనా పనిచేస్తుంది.
 *
 *  • ఒక క్లిక్‌తో WhatsApp టెక్స్ట్, HD PNG, బహుళ-పేజీ PDF
 *  • ప్రతి వాక్యానికి గ్రంథ ఆధారం
 */
import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  MessageCircle,
  Printer,
  Sparkles,
  TriangleAlert,
  CheckCircle2,
  Star,
} from 'lucide-react';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import {
  computeDayPhala,
  computeWeekPhala,
  computeMonthPhala,
  computeYearPhala,
  festivalsForYear,
  type DayPhala,
  type PhalaGrade,
  type PhalaGeo,
} from '../engine/rashiPhalaluPanditEngine.ts';
import SourceStrip from './SourceStrip.tsx';

type Period = 'day' | 'week' | 'month' | 'year';

interface Props {
  chart: CompleteChartResult;
  lang?: 'te' | 'en';
}

const GRADE_STYLE: Record<PhalaGrade, { bg: string; text: string; ring: string }> = {
  ఉత్తమం: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', ring: '#34d399' },
  శుభం: { bg: 'bg-teal-500/15', text: 'text-teal-300', ring: '#2dd4bf' },
  మధ్యమం: { bg: 'bg-amber-500/15', text: 'text-amber-300', ring: '#fbbf24' },
  జాగ్రత్త: { bg: 'bg-orange-500/15', text: 'text-orange-300', ring: '#fb923c' },
  అశుభం: { bg: 'bg-rose-500/15', text: 'text-rose-300', ring: '#fb7185' },
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function shiftISO(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

const ScoreRing: React.FC<{ score: number; grade: PhalaGrade; size?: number }> = ({
  score,
  grade,
  size = 96,
}) => {
  const style = GRADE_STYLE[grade];
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff18" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={style.ring}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${(c * score) / 100} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#EDE8E0"
        fontSize={size * 0.28}
        fontWeight="700"
      >
        {score}
      </text>
      <text x="50%" y="66%" textAnchor="middle" fill="#EDE8E0" fontSize={size * 0.13} opacity={0.6}>
        / 100
      </text>
    </svg>
  );
};

export default function RashiPhalaStudioView({ chart, lang = 'te' }: Props) {
  const isTe = lang === 'te';
  const [dateISO, setDateISO] = useState<string>(todayISO());
  const [period, setPeriod] = useState<Period>('day');
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [showFestivals, setShowFestivals] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const geo: PhalaGeo = useMemo(
    () => ({
      lat: chart.input.lat,
      lng: chart.input.lng,
      tzOffsetHours: chart.input.tzOffsetHours,
      placeNameTe: chart.input.city,
      placeNameEn: chart.input.city,
    }),
    [chart.input.lat, chart.input.lng, chart.input.tzOffsetHours, chart.input.city]
  );

  const day: DayPhala = useMemo(() => computeDayPhala(chart, dateISO, geo), [chart, dateISO, geo]);
  const week = useMemo(
    () => (period === 'week' ? computeWeekPhala(chart, dateISO, geo) : null),
    [period, chart, dateISO, geo]
  );
  const [y, m] = dateISO.split('-').map(Number);
  const month = useMemo(
    () => (period === 'month' ? computeMonthPhala(chart, y, m, geo) : null),
    [period, chart, y, m, geo]
  );
  const year = useMemo(
    () => (period === 'year' ? computeYearPhala(chart, y, geo) : null),
    [period, chart, y, geo]
  );
  const festivals = useMemo(
    () => (showFestivals ? festivalsForYear(y, geo) : []),
    [showFestivals, y, geo]
  );

  /* ---------------- షేర్ టెక్స్ట్ ---------------- */
  const shareText = useMemo(() => {
    const head = `🕉️ ${chart.input.name} — రాశి ఫలాలు\n${day.dateISO} (${day.weekdayTe}) · ${day.placeTe || chart.input.city}\n`;
    const body = [
      `బలం: ${day.score}/100 — ${day.grade}`,
      `పంచాంగం: ${day.panchangaTe}`,
      `${day.chandrabalaTe}`,
      `${day.tarabalaTe}`,
      `దశ: ${day.dashaTe}`,
      '',
      '✅ అనుకూలం:',
      ...day.favourable.map((x) => `• ${x}`),
      '',
      '⚠️ జాగ్రత్త:',
      ...day.cautions.slice(0, 4).map((x) => `• ${x}`),
      '',
      '🕐 శుభ కాలాలు:',
      ...day.windows.map((w) => `• ${w.startTime}–${w.endTime} ${w.labelTe}`),
      '',
      `ఆధారం: ముహూర్త చింతామణి · బృహత్ సంహిత 104 · ఫలదీపిక 26 · BPHS 46–47`,
    ].join('\n');
    return head + body;
  }, [chart.input.name, chart.input.city, day]);

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setShareNotice(isTe ? 'టెక్స్ట్ కాపీ అయింది — WhatsApp లో పేస్ట్ చేయండి' : 'Copied — paste into WhatsApp');
    } catch {
      setShareNotice(isTe ? 'కాపీ కుదరలేదు; కింది టెక్స్ట్‌ను ఎంచుకోండి' : 'Copy failed; select the text below');
    }
    setTimeout(() => setShareNotice(null), 4000);
  };

  const downloadPng = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0B0F1E',
      scale: 3,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `rashi-phala-${day.dateISO}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadPdf = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0B0F1E',
      scale: 2.6,
      useCORS: true,
      logging: false,
    });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    if (imgH <= pageH) {
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgW, imgH, undefined, 'SLOW');
    } else {
      const pages = Math.ceil(imgH / pageH);
      const sliceH = Math.floor(canvas.height / pages);
      for (let i = 0; i < pages; i++) {
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0B0F1E';
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, i * sliceH, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        }
        if (i > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.95),
          'JPEG',
          0,
          0,
          pageW,
          (sliceH * pageW) / canvas.width,
          undefined,
          'SLOW'
        );
      }
    }
    pdf.save(`rashi-phala-${day.dateISO}.pdf`);
  };

  const periodBtn = (id: Period, label: string) => (
    <button
      key={id}
      onClick={() => setPeriod(id)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
        period === id ? 'bg-[#C9A96E] text-[#090C18]' : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* ---- నియంత్రణలు ---- */}
      <div className="bg-[#0F1326] border border-white/10 rounded-xl p-4 no-print">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#C9A96E]" />
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value || todayISO())}
              className="bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            />
            <button
              onClick={() => setDateISO(shiftISO(dateISO, -1))}
              className="p-1.5 rounded-lg border border-white/10 text-[#EDE8E0]/70 hover:text-[#EDE8E0] cursor-pointer"
              aria-label="previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDateISO(shiftISO(dateISO, 1))}
              className="p-1.5 rounded-lg border border-white/10 text-[#EDE8E0]/70 hover:text-[#EDE8E0] cursor-pointer"
              aria-label="next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDateISO(todayISO())}
              className="px-2 py-1 rounded-lg border border-white/10 text-[11px] text-[#EDE8E0]/70 hover:text-[#EDE8E0] cursor-pointer"
            >
              {isTe ? 'నేడు' : 'Today'}
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#090C18] p-1 rounded-lg border border-white/10">
            {periodBtn('day', isTe ? 'రోజు' : 'Day')}
            {periodBtn('week', isTe ? 'వారం' : 'Week')}
            {periodBtn('month', isTe ? 'నెల' : 'Month')}
            {periodBtn('year', isTe ? 'సంవత్సరం' : 'Year')}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 text-[11px] text-[#EDE8E0]/80 hover:text-[#EDE8E0] cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> {isTe ? 'టెక్స్ట్' : 'Text'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-400/30 text-[11px] text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <button
              onClick={downloadPng}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 text-[11px] text-[#EDE8E0]/80 hover:text-[#EDE8E0] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> PNG
            </button>
            <button
              onClick={downloadPdf}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 text-[11px] text-[#EDE8E0]/80 hover:text-[#EDE8E0] cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 text-[11px] text-[#EDE8E0]/80 hover:text-[#EDE8E0] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> {isTe ? 'ముద్రణ' : 'Print'}
            </button>
          </div>
        </div>
        {shareNotice && <div className="mt-2 text-[11px] text-[#5BBFB5]">{shareNotice}</div>}
      </div>

      {/* ---- కార్డు (PNG/PDF షేర్ ఇదే భాగం) ---- */}
      <div ref={cardRef} className="bg-[#0B0F1E] rounded-xl border border-[#C9A96E]/25 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E]">
              {isTe ? 'శ్రీ జ్యోతిష్యం · పండిత స్టూడియో' : 'Sri Jyothishyam · Pandit Studio'}
            </div>
            <div className="font-display text-xl text-[#EDE8E0] mt-0.5">{chart.input.name}</div>
            <div className="text-[11.5px] text-[#EDE8E0]/60">
              {day.dateISO} · {day.weekdayTe} · {day.placeTe || chart.input.city}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-[#EDE8E0]/50">{isTe ? 'దిన బలం' : 'Day strength'}</div>
              <div className={`text-sm font-semibold ${GRADE_STYLE[day.grade].text}`}>{day.grade}</div>
            </div>
            <ScoreRing score={day.score} grade={day.grade} />
          </div>
        </div>

        {period === 'day' && (
          <>
            <div className="rounded-lg bg-white/[0.03] px-3 py-2 text-[12px] text-[#EDE8E0]/85">
              {day.panchangaTe}
            </div>

            {/* బల భాగాలు */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="text-left text-[#EDE8E0]/45 text-[10.5px] uppercase tracking-wider">
                    <th className="py-1">{isTe ? 'అంగం' : 'Factor'}</th>
                    <th className="py-1 w-20">{isTe ? 'బలం' : 'Score'}</th>
                    <th className="py-1">{isTe ? 'కారణం' : 'Reason'}</th>
                    <th className="py-1 hidden md:table-cell">{isTe ? 'గ్రంథం' : 'Source'}</th>
                  </tr>
                </thead>
                <tbody>
                  {day.parts.map((p) => (
                    <tr key={p.key} className="border-t border-white/5 align-top">
                      <td className="py-1.5 pr-2 text-[#EDE8E0] whitespace-nowrap">{p.labelTe}</td>
                      <td className="py-1.5 pr-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-10 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#C9A96E]"
                              style={{ width: `${(p.score / p.max) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono-tabular text-[#EDE8E0]/80">
                            {p.score}/{p.max}
                          </span>
                        </div>
                      </td>
                      <td className="py-1.5 pr-2 text-[#EDE8E0]/75 leading-snug">{p.reasonTe}</td>
                      <td className="py-1.5 hidden md:table-cell text-[#EDE8E0]/40 leading-snug">
                        {p.sourceTe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {isTe ? 'అనుకూలం' : 'Favourable'}
                </div>
                <ul className="space-y-1 text-[11.5px] text-[#EDE8E0]/80">
                  {day.favourable.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-rose-400/20 bg-rose-500/[0.06] p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-rose-300 mb-1">
                  <TriangleAlert className="w-3.5 h-3.5" /> {isTe ? 'నివారించండి' : 'Avoid'}
                </div>
                <ul className="space-y-1 text-[11.5px] text-[#EDE8E0]/80">
                  {day.avoid.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-[11px] text-[#C9A96E] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> {isTe ? 'శుభ కాలాలు' : 'Auspicious windows'}
                </div>
                <ul className="space-y-1.5 text-[11.5px] text-[#EDE8E0]/85">
                  {day.windows.map((w, i) => (
                    <li key={i}>
                      <span className="font-mono-tabular text-[#EDE8E0]">
                        {w.startTime}–{w.endTime}
                      </span>{' '}
                      <span className="text-[#5BBFB5]">{w.labelTe}</span>
                      <div className="text-[10.5px] text-[#EDE8E0]/45 leading-snug">{w.reasonTe}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-[11px] text-[#C9A96E] mb-1">{isTe ? 'జాగ్రత్తలు' : 'Cautions'}</div>
                <ul className="space-y-1 text-[11.5px] text-[#EDE8E0]/80">
                  {day.cautions.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                  {!day.cautions.length && <li>• {isTe ? 'ప్రత్యేక నిషేధం లేదు.' : 'No specific restriction.'}</li>}
                </ul>
              </div>
            </div>

            <div className="rounded-lg bg-white/[0.03] p-3">
              <div className="text-[11px] text-[#C9A96E] mb-1">{isTe ? 'గోచార స్థితి (జన్మ రాశి నుంచి)' : 'Transit state (from janma rashi)'}</div>
              <div className="flex flex-wrap gap-1.5">
                {day.gocharaHighlights.map((g) => {
                  const good = g.verdictTe.includes('శుభ') && !g.verdictTe.includes('వేధ');
                  const blocked = g.verdictTe.includes('వేధ');
                  return (
                    <span
                      key={g.grahaTe}
                      className={`px-2 py-0.5 rounded-md text-[10.5px] border ${
                        good
                          ? 'border-emerald-400/30 text-emerald-300'
                          : blocked
                            ? 'border-amber-400/30 text-amber-300'
                            : 'border-rose-400/25 text-rose-300'
                      }`}
                      title={`${g.themeTe} — ${g.verdictTe}`}
                    >
                      {g.grahaTe} {g.houseFromMoon}వ
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-[#EDE8E0]/35 leading-snug">{day.sourceNoteTe}</div>
          </>
        )}

        {period === 'week' && week && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-[#EDE8E0]/85">
                {week.startISO} → {week.endISO} · {isTe ? 'సగటు' : 'avg'} {week.averageScore}/100
              </div>
              <div className={`text-sm font-semibold ${GRADE_STYLE[week.grade].text}`}>{week.grade}</div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.days.map((d) => (
                <button
                  key={d.dateISO}
                  onClick={() => {
                    setDateISO(d.dateISO);
                    setPeriod('day');
                  }}
                  className={`rounded-lg border p-2 text-center cursor-pointer transition-colors ${
                    d.dateISO === dateISO ? 'border-[#C9A96E]' : 'border-white/10 hover:border-white/25'
                  } ${GRADE_STYLE[d.grade].bg}`}
                >
                  <div className="text-[9.5px] text-[#EDE8E0]/55">{d.weekdayTe.slice(0, 3)}</div>
                  <div className="text-[11px] text-[#EDE8E0]">{d.dateISO.slice(8)}</div>
                  <div className={`text-sm font-bold ${GRADE_STYLE[d.grade].text}`}>{d.score}</div>
                  <div className="text-[9px] text-[#EDE8E0]/45 leading-tight">{d.tithiTe}</div>
                </button>
              ))}
            </div>
            <div className="rounded-lg bg-white/[0.03] px-3 py-2 text-[12px] text-[#EDE8E0]/85">
              {week.themeTe}
              <div className="text-[11px] text-[#EDE8E0]/60 mt-1">{week.summaryTe}</div>
            </div>
          </>
        )}

        {period === 'month' && month && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-[#EDE8E0]/85">
                {month.labelTe} · {isTe ? 'సగటు' : 'avg'} {month.averageScore}/100
              </div>
              <div className={`text-sm font-semibold ${GRADE_STYLE[month.grade].text}`}>{month.grade}</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['ఆ', 'సో', 'మం', 'బు', 'గు', 'శు', 'శ'].map((w) => (
                <div key={w} className="text-center text-[9.5px] text-[#EDE8E0]/40">
                  {w}
                </div>
              ))}
              {Array.from({
                length: new Date(Date.UTC(month.year, month.month - 1, 1)).getUTCDay(),
              }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {month.days.map((d) => (
                <button
                  key={d.dateISO}
                  onClick={() => {
                    setDateISO(d.dateISO);
                    setPeriod('day');
                  }}
                  className={`rounded-md border border-white/5 p-1 text-center cursor-pointer hover:border-white/25 ${GRADE_STYLE[d.grade].bg}`}
                  title={`${d.dateISO} · ${d.tithiTe} · ${d.nakshatraTe}`}
                >
                  <div className="text-[10px] text-[#EDE8E0]/80">{Number(d.dateISO.slice(8))}</div>
                  <div className={`text-[10.5px] font-semibold ${GRADE_STYLE[d.grade].text}`}>{d.score}</div>
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white/[0.03] p-3 text-[11.5px] text-[#EDE8E0]/85">
                <div className="text-[11px] text-emerald-300 mb-1">{isTe ? 'ఉత్తమ తేదీలు' : 'Best days'}</div>
                {month.bestDays.map((d) => (
                  <div key={d.dateISO}>
                    {d.dateISO} · {d.weekdayTe} · <span className="text-emerald-300">{d.score}</span> · {d.tithiTe}
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 text-[11.5px] text-[#EDE8E0]/85">
                <div className="text-[11px] text-rose-300 mb-1">{isTe ? 'జాగ్రత్త తేదీలు' : 'Careful days'}</div>
                {month.weakestDays.map((d) => (
                  <div key={d.dateISO}>
                    {d.dateISO} · {d.weekdayTe} · <span className="text-rose-300">{d.score}</span> · {d.tithiTe}
                  </div>
                ))}
              </div>
            </div>
            {month.keyTransitsTe.length > 0 && (
              <div className="rounded-lg bg-white/[0.03] p-3 text-[11.5px] text-[#EDE8E0]/80">
                <div className="text-[11px] text-[#C9A96E] mb-1">{isTe ? 'నెలలో గ్రహ ప్రవేశాలు' : 'Ingresses this month'}</div>
                {month.keyTransitsTe.map((t) => (
                  <div key={t}>• {t}</div>
                ))}
              </div>
            )}
            <div className="text-[11.5px] text-[#EDE8E0]/60">{month.summaryTe}</div>
          </>
        )}

        {period === 'year' && year && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-[#EDE8E0]/85">
                {year.year} · {isTe ? 'సగటు' : 'avg'} {year.averageScore}/100
              </div>
              <div className={`text-sm font-semibold ${GRADE_STYLE[year.grade].text}`}>{year.grade}</div>
            </div>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
              {year.months.map((mth) => (
                <button
                  key={mth.month}
                  onClick={() => {
                    setDateISO(`${year.year}-${pad2(mth.month)}-01`);
                    setPeriod('month');
                  }}
                  className={`rounded-md border border-white/5 p-1.5 text-center cursor-pointer hover:border-white/25 ${GRADE_STYLE[mth.grade].bg}`}
                >
                  <div className="text-[9.5px] text-[#EDE8E0]/60">{mth.labelTe}</div>
                  <div className={`text-[11.5px] font-semibold ${GRADE_STYLE[mth.grade].text}`}>{mth.average}</div>
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-[11.5px] text-[#EDE8E0]/80">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-[11px] text-[#C9A96E] mb-1">{isTe ? 'దశా మార్పులు' : 'Dasha changes'}</div>
                {year.dashaChangesTe.length ? (
                  year.dashaChangesTe.map((d) => <div key={d}>• {d}</div>)
                ) : (
                  <div>• {isTe ? 'ఈ సంవత్సరం మహాదశ/అంతర్దశ మార్పు లేదు.' : 'No dasha change this year.'}</div>
                )}
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-[11px] text-[#C9A96E] mb-1">{isTe ? 'గ్రహ ప్రవేశాలు' : 'Ingresses'}</div>
                {year.ingressesTe.length ? (
                  year.ingressesTe.map((d) => <div key={d}>• {d}</div>)
                ) : (
                  <div>• {isTe ? 'లెక్కించిన కాలంలో ప్రవేశం లేదు.' : 'None in range.'}</div>
                )}
              </div>
            </div>
            <div className="text-[11.5px] text-[#EDE8E0]/60">{year.summaryTe}</div>
          </>
        )}
      </div>

      {/* ---- పండుగలు ---- */}
      <div className="bg-[#0F1326] border border-white/10 rounded-xl p-4 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#EDE8E0] text-sm">
            <Star className="w-4 h-4 text-[#C9A96E]" />
            {isTe ? `${y} సంవత్సర పండుగలు (పంచాంగ నియమాల నుంచి)` : `Festivals of ${y}`}
          </div>
          <button
            onClick={() => setShowFestivals((s) => !s)}
            className="px-2.5 py-1 rounded-lg border border-white/15 text-[11px] text-[#EDE8E0]/80 hover:text-[#EDE8E0] cursor-pointer"
          >
            {showFestivals ? (isTe ? 'దాచు' : 'Hide') : isTe ? 'చూపించు' : 'Show'}
          </button>
        </div>
        {showFestivals && (
          <div className="mt-3 max-h-72 overflow-y-auto text-[11.5px] text-[#EDE8E0]/80 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {festivals.length ? (
              festivals.map((f) => (
                <div key={`${f.dateISO}-${f.nameTe}`} className="flex justify-between gap-2 border-b border-white/5 py-0.5">
                  <span className="text-[#EDE8E0]/55 font-mono-tabular">{f.dateISO}</span>
                  <span className="flex-1">{f.nameTe}</span>
                  <span className="text-[10px] text-[#EDE8E0]/40">{f.kindTe}</span>
                </div>
              ))
            ) : (
              <div className="text-[#EDE8E0]/50">{isTe ? 'లెక్కిస్తోంది…' : 'Computing…'}</div>
            )}
          </div>
        )}
      </div>

      <div className="no-print">
        <SourceStrip feature="muhurta" lang={lang} />
      </div>
    </div>
  );
}
