/**
 * KakshyaTimelinePanel.tsx — సంవత్సరపు బిందు కక్ష్యా కాలరేఖ
 * --------------------------------------------------------------
 * ఏడాది మొత్తంలో ఏ గ్రహం ఎప్పుడు బిందువు ఉన్న కక్ష్యలో (శుభం) నడిచింది,
 * ఎప్పుడు బిందువు లేని కక్ష్యలో (ఫలం లోపిస్తుంది) నడిచింది — నిమిషం కచ్చితత్వంతో.
 * స్థిర పాఠ్యం కాదు: ప్రతి సరిహద్దు సిద్ధాంత గ్రహ స్ఫుటం నుంచి ద్విభాజనంతో వస్తుంది.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarRange, Loader2 } from 'lucide-react';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import {
  kakshyaSegmentsForYear,
  kakshyaBinduOverlaps,
  type KakshyaSegment,
} from '../engine/ashtakavargaKakshyaEngine.ts';

const GRAHA_ORDER = ['Sun', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const GRAHA_COLOR: Record<string, string> = {
  Sun: '#E8B04B',
  Mars: '#D9614C',
  Mercury: '#7FC8A9',
  Jupiter: '#C9A96E',
  Venus: '#B79CE0',
  Saturn: '#5B8DBF',
};

interface Props {
  chart: CompleteChartResult;
  year: number;
}

export default function KakshyaTimelinePanel({ chart, year }: Props) {
  const [segments, setSegments] = useState<KakshyaSegment[] | null>(null);
  const [busy, setBusy] = useState(false);
  const tz = chart.input.tzOffsetHours;
  const yearRef = useRef(year);

  const run = () => {
    setBusy(true);
    window.setTimeout(() => {
      setSegments(kakshyaSegmentsForYear(chart, yearRef.current, tz));
      setBusy(false);
    }, 20);
  };

  // సంవత్సరం మారినప్పుడు (మరియు మొదటిసారి) స్వయంగా లెక్కించు — ఖాళీ ప్యానెల్ చూపవద్దు
  useEffect(() => {
    yearRef.current = year;
    setSegments(null);
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const binduDays = useMemo(() => {
    if (!segments) return {} as Record<string, number>;
    const out: Record<string, number> = {};
    for (const s of segments) if (s.verdict === 'bindu') out[s.graha] = (out[s.graha] ?? 0) + s.days;
    return out;
  }, [segments]);

  const trimToYear = (s: KakshyaSegment): number =>
    Math.min(1, Math.max(0, (Number(s.days) || 0) / 365));

  return (
    <div className="bg-[#0F1326] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[#EDE8E0] text-sm">
          <CalendarRange className="w-4 h-4 text-[#C9A96E]" />
          {year} — బిందు కక్ష్యా కాలరేఖ
        </div>
        <button
          onClick={run}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A96E] text-[#090C18] text-[11px] font-semibold cursor-pointer disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {busy ? 'లెక్కిస్తోంది…' : segments ? 'మళ్లీ లెక్కించు' : 'కాలరేఖ తయారుచేయి'}
        </button>
        {segments && (
          <div className="text-[10.5px] text-[#EDE8E0]/50">
            {segments.filter((s) => s.verdict === 'bindu').length} శుభ విభాగాలు ·{' '}
            {segments.length} మొత్తం విభాగాలు
          </div>
        )}
      </div>

      {segments && (
        <div className="space-y-2.5">
          {GRAHA_ORDER.map((g) => {
            const list = segments.filter((s) => s.graha === g);
            const grahaTe = list[0]?.grahaTe ?? g;
            return (
              <div key={g}>
                <div className="flex items-center justify-between text-[10.5px] mb-1">
                  <span className="text-[#EDE8E0]/85">{grahaTe}</span>
                  <span className="text-[#EDE8E0]/45 font-mono-tabular">
                    శుభం {Math.round(binduDays[g] ?? 0)} రోజులు / 365
                  </span>
                </div>
                <div className="flex h-3 rounded overflow-hidden border border-white/10">
                  {list.map((s, i) => (
                    <div
                      key={`${g}-${i}`}
                      title={`${s.startLocal} → ${s.endLocal} · ${s.signTe} ${s.kakshyaNumber}/8 · ${s.contributorTe} · ${
                        s.verdict === 'bindu' ? 'బిందువు' : 'బిందువు లేదు'
                      }`}
                      style={{
                        width: `${trimToYear(s) * 100}%`,
                        backgroundColor:
                          s.verdict === 'bindu' ? GRAHA_COLOR[g] ?? '#C9A96E' : 'rgba(255,255,255,0.08)',
                        opacity: 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pt-1">
            <div className="text-[11px] text-[#C9A96E] mb-1">
              గురు–శని ఇద్దరూ బిందువు ఉన్న కక్ష్యలో (దీర్ఘకాల శుభ సంధి)
            </div>
            <div className="grid gap-1 sm:grid-cols-2">
              {kakshyaBinduOverlaps(segments, ['Jupiter', 'Saturn']).map((o, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#5BBFB5]/25 bg-[#5BBFB5]/[0.05] px-2.5 py-1.5 text-[10.5px] text-[#5BBFB5] font-mono-tabular"
                >
                  {o.startLocal} → {o.endLocal}
                  <span className="text-[#EDE8E0]/45 ml-1.5">{Math.round(o.days)} రోజులు</span>
                </div>
              ))}
              {!kakshyaBinduOverlaps(segments, ['Jupiter', 'Saturn']).length && (
                <div className="text-[10.5px] text-[#EDE8E0]/50">
                  ఈ సంవత్సరం గురు-శని ఇద్దరూ బిందు కక్ష్యలో ఒకేసారి లేరు.
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-[#EDE8E0]/35 leading-snug">
            ఆధారం: బృహత్ పరాశర హోరా శాస్త్రం — అష్టకవర్గ కక్ష్యా అధ్యాయం (రాశి 30° ను 3°45′
            చొప్పున ఎనిమిది కక్ష్యలు; క్రమం శని, గురు, కుజ, రవి, శుక్ర, బుధ, చంద్ర, లగ్నం).
            సరిహద్దులు గ్రహ స్ఫుటం నుంచి ద్విభాజనంతో — నిమిషం కచ్చితత్వం.
          </div>
        </div>
      )}
    </div>
  );
}
