/**
 * MuhurtaPlannerPanel.tsx — ఏడాది ముహూర్త ప్లానర్
 * -------------------------------------------------
 * కార్యం ఎంచుకోండి → ఆ సంవత్సరంలో శాస్త్ర నియమాలను దాటిన రోజులు, ప్రతి రోజుకూ
 * నిజమైన లగ్న కిటికీలు (రాహుకాలాది తీసేసి), తారా/చంద్ర బలం, కారణాలు, జాగ్రత్తలు.
 *
 * స్థిర జాబితా కాదు — ప్రతి అభ్యర్థనలో 365 రోజుల పంచాంగం + లగ్న గణన జరుగుతుంది.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, Clock, Loader2, Search, TriangleAlert, CheckCircle2 } from 'lucide-react';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import {
  searchYearMuhurta,
  ACTIVITY_LAGNAS,
  type AnnualMuhurtaReport,
} from '../engine/annualMuhurtaEngine.ts';
import {
  MUHURTA_ACTIVITIES,
  type MuhurtaActivityId,
} from '../engine/muhurtaEngine.ts';
import { TELUGU_RASIS } from '../engine/teluguJathakam.ts';

const ACTIVITY_ORDER: MuhurtaActivityId[] = [
  'vivaha',
  'grihapravesham',
  'bhumi_puja',
  'vyaparam',
  'vahana',
  'namakaranam',
  'vidyarambham',
  'upanayanam',
  'sarva_karya',
];

interface Props {
  chart: CompleteChartResult;
  lang?: 'te' | 'en';
  initialYear?: number;
}

export default function MuhurtaPlannerPanel({ chart, lang = 'te', initialYear }: Props) {
  const isTe = lang === 'te';
  const [year, setYear] = useState<number>(initialYear ?? new Date().getFullYear());
  const [activity, setActivity] = useState<MuhurtaActivityId>('vivaha');
  const [report, setReport] = useState<AnnualMuhurtaReport | null>(null);
  const [busy, setBusy] = useState(false);

  const tz = chart.input.tzOffsetHours;
  const keyRef = useRef(`${activity}|${year}`);

  const run = () => {
    setBusy(true);
    // ఒక ఫ్రేమ్ ఇచ్చి, ఆ తర్వాత భారీ గణన — UI బ్లాక్ అవ్వకుండా
    window.setTimeout(() => {
      const [act, yr] = keyRef.current.split('|');
      const rep = searchYearMuhurta(act as MuhurtaActivityId, Number(yr), chart.input.lat, chart.input.lng, tz, {
        chart,
        placeTe: chart.input.city,
        limit: 12,
      });
      setReport(rep);
      setBusy(false);
    }, 30);
  };

  // కార్యం/సంవత్సరం మారగానే స్వయంగా వెతుకు — ఖాళీ ప్యానెల్ చూపవద్దు
  useEffect(() => {
    keyRef.current = `${activity}|${year}`;
    setReport(null);
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, year]);

  const lagnaListTe = useMemo(
    () =>
      ACTIVITY_LAGNAS[activity]
        .map((i) => TELUGU_RASIS[i].nameTe.replace(' రాశి', ''))
        .join(', '),
    [activity]
  );

  return (
    <div className="bg-[#0F1326] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[#EDE8E0] text-sm">
          <CalendarClock className="w-4 h-4 text-[#C9A96E]" />
          {isTe ? 'ముహూర్త ప్లానర్ — ఏడాది మొత్తం' : 'Muhurta planner — whole year'}
        </div>
        <select
          value={activity}
          onChange={(e) => {
            setActivity(e.target.value as MuhurtaActivityId);
            setReport(null);
          }}
          className="bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
        >
          {ACTIVITY_ORDER.map((id) => (
            <option key={id} value={id}>
              {MUHURTA_ACTIVITIES[id].titleTe}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          min={1900}
          max={2100}
          onChange={(e) => {
            setYear(Number(e.target.value));
            setReport(null);
          }}
          className="w-24 bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
        />
        <button
          onClick={run}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A96E] text-[#090C18] text-[11px] font-semibold cursor-pointer disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          {isTe ? 'వెతుకు' : 'Search'}
        </button>
        <div className="text-[10.5px] text-[#EDE8E0]/50">
          {isTe ? 'ముహూర్త లగ్నాలు' : 'Muhurta lagnas'}: {lagnaListTe}
        </div>
      </div>

      {report && (
        <>
          <div className="text-[11.5px] text-[#EDE8E0]/70">{report.summaryTe}</div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {report.candidates.map((c) => (
              <div key={c.dateISO} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="text-[12px] text-[#EDE8E0]">
                    <span className="font-mono-tabular text-[#C9A96E]">{c.dateISO}</span> · {c.weekdayTe}
                    <span className="text-[#EDE8E0]/55"> · {c.tithiTe} · {c.nakshatraTe}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] text-emerald-300">{c.gradeTe}</span>
                    <span className="text-[12px] font-semibold text-[#EDE8E0]">{c.score}</span>
                    <span className="text-[9.5px] text-[#EDE8E0]/40">/100</span>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {c.windows.map((w, i) => (
                    <span
                      key={`${c.dateISO}-w${i}`}
                      className="px-2 py-0.5 rounded-md border border-[#5BBFB5]/30 text-[10.5px] text-[#5BBFB5]"
                    >
                      <Clock className="w-3 h-3 inline -mt-0.5 mr-1" />
                      {w.startTime}–{w.endTime} · {w.lagnaTe}
                    </span>
                  ))}
                </div>
                <div className="mt-1 grid gap-1 sm:grid-cols-2">
                  <ul className="text-[10.5px] text-[#EDE8E0]/70 space-y-0.5">
                    {c.reasonsTe.slice(0, 3).map((r, i) => (
                      <li key={i} className="flex gap-1">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-400/70 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="text-[10.5px] text-[#EDE8E0]/60 space-y-0.5">
                    {c.warningsTe.slice(0, 2).map((r, i) => (
                      <li key={i} className="flex gap-1">
                        <TriangleAlert className="w-3 h-3 mt-0.5 text-amber-400/70 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                    <li className="text-[#EDE8E0]/45">{c.chandrabalaTe}</li>
                    <li className="text-[#EDE8E0]/45">{c.tarabalaTe}</li>
                  </ul>
                </div>
              </div>
            ))}
            {!report.candidates.length && (
              <div className="text-[11.5px] text-[#EDE8E0]/60">
                {isTe ? 'ఈ సంవత్సరం ఈ కార్యానికి శుద్ధి దాటిన రోజు లేదు.' : 'No day passed the rules.'}
              </div>
            )}
          </div>
          <div className="text-[10px] text-[#EDE8E0]/35 leading-snug">{report.sourceTe}</div>
        </>
      )}
    </div>
  );
}
