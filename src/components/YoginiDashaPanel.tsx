/**
 * YoginiDashaPanel.tsx — యోగినీ దశ (36 సంవత్సరాల చక్రం)
 * ----------------------------------------------------
 * జన్మ నక్షత్రం నుంచి లెక్కించిన దశా క్రమం, జన్మనాటి శేషం, ప్రస్తుత యోగినీ,
 * మరియు ప్రతి యోగినీ అధిపతి కుండలిలో ఎక్కడ ఉన్నాడు — అన్నీ కుండలి నుంచే.
 */
import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import { computeYoginiDasha } from '../engine/yoginiDashaEngine.ts';

export default function YoginiDashaPanel({ chart }: { chart: CompleteChartResult }) {
  const report = useMemo(() => computeYoginiDasha(chart), [chart]);
  const [openIdx, setOpenIdx] = useState<number | null>(
    report.currentIndex >= 0 ? report.currentIndex : 0
  );

  return (
    <section className="bg-[#0F1326] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-[#EDE8E0] text-sm">
        <Sparkles className="w-4 h-4 text-[#C9A96E]" />
        యోగినీ దశ — 36 సంవత్సరాల చక్రం
      </div>
      <div className="text-[11.5px] text-[#EDE8E0]/70">{report.summaryTe}</div>

      <div className="space-y-1">
        {report.periods.slice(0, 8).map((p, i) => (
          <div key={`${p.nameTe}-${i}`} className="rounded-lg border border-white/[0.08] bg-white/[0.02]">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex flex-wrap items-center gap-2 px-2.5 py-1.5 text-left cursor-pointer"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${p.nature.startsWith('శుభ') ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className="text-[11.5px] text-[#EDE8E0]/90 w-16">{p.nameTe}</span>
              <span className="text-[10.5px] text-[#EDE8E0]/45 w-16">{p.lordTe}</span>
              <span className="text-[10.5px] text-[#EDE8E0]/55 font-mono-tabular">
                {p.startISO} → {p.endISO}
              </span>
              {p.balanceTe && (
                <span className="text-[10px] text-[#C9A96E]">జన్మ శేషం {p.balanceTe}</span>
              )}
              {i === report.currentIndex && (
                <span className="ml-auto text-[9.5px] text-[#5BBFB5] border border-[#5BBFB5]/40 rounded px-1.5">
                  ప్రస్తుతం
                </span>
              )}
            </button>
            {openIdx === i && (
              <div className="px-2.5 pb-2 space-y-1">
                <div className="text-[10.5px] text-[#EDE8E0]/60">{p.lordPositionsTe}</div>
                <div className="text-[10.5px] text-[#EDE8E0]/50">{p.nature} · {p.years} సంవత్సరాలు</div>
                <div className="grid gap-0.5 sm:grid-cols-2">
                  {p.subs.map((s, k) => (
                    <div key={k} className="flex gap-2 text-[10px] text-[#EDE8E0]/55">
                      <span className="text-[#C9A96E]/80 w-14">{s.nameTe}</span>
                      <span className="font-mono-tabular">{s.startISO} → {s.endISO}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-[10px] text-[#EDE8E0]/35 leading-snug">{report.sourceTe}</div>
    </section>
  );
}
