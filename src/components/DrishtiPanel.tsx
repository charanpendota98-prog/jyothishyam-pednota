/**
 * DrishtiPanel.tsx — గ్రహ దృష్టి విస్తరణ
 * ---------------------------------------
 * లగ్నంపై పడిన దృష్టులు (ఫల వాక్యాలతో), ప్రతి గ్రహం ఏయే రాశులను చూస్తుంది,
 * జంటల మధ్య స్ఫుట దృష్టి విరూపాలు, రాశి దృష్టి చక్రం, అర్గళా/విరోధార్గళా.
 */
import React, { useMemo, useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import { computeGrahaDrishti } from '../engine/grahaDrishtiEngine.ts';

const TABS = [
  { id: 'lagna', te: 'లగ్నంపై దృష్టి' },
  { id: 'casts', te: 'గ్రహ దృష్టులు' },
  { id: 'pairs', te: 'స్ఫుట దృష్టి విరూపాలు' },
  { id: 'rasi', te: 'రాశి దృష్టి' },
  { id: 'argala', te: 'అర్గళా' },
] as const;

export default function DrishtiPanel({ chart }: { chart: CompleteChartResult }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('lagna');
  const report = useMemo(() => computeGrahaDrishti(chart), [chart]);

  return (
    <section className="bg-[#0F1326] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-[#EDE8E0] text-sm">
          <Eye className="w-4 h-4 text-[#C9A96E]" />
          గ్రహ దృష్టి విస్తరణ
        </div>
        <div className="flex flex-wrap gap-1.5 ml-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1 rounded-md text-[10.5px] cursor-pointer border ${
                tab === t.id
                  ? 'bg-[#C9A96E] text-[#090C18] border-[#C9A96E]'
                  : 'bg-white/[0.03] text-[#EDE8E0]/70 border-white/10 hover:border-[#C9A96E]/50'
              }`}
            >
              {t.te}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[11.5px] text-[#EDE8E0]/70">{report.summaryTe}</div>

      {tab === 'lagna' && (
        <div className="space-y-1.5">
          {report.lagnaDrishti.map((r) => (
            <div
              key={`${r.from}-${r.house}`}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    r.nature === 'malefic' ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                />
                <span className="text-[#EDE8E0]/90">{r.fromTe}</span>
                <span className="text-[#EDE8E0]/50">{r.house}వ స్థానం</span>
                <span className="text-[#C9A96E] font-mono-tabular">{r.virupas}</span>
                <span className="text-[#EDE8E0]/45 text-[10px]">{r.strengthTe}</span>
                <span className="ml-auto text-[10px] text-[#EDE8E0]/40">{r.lordshipsTe}</span>
              </div>
              <div className="text-[10.5px] text-[#EDE8E0]/60 mt-0.5">{r.phalaTe}</div>
            </div>
          ))}
          {!report.lagnaDrishti.length && (
            <div className="text-[11px] text-[#EDE8E0]/50">లగ్నంపై ఏ గ్రహ దృష్టి లేదు.</div>
          )}
        </div>
      )}

      {tab === 'casts' && (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {report.casts.map((c) => (
            <div
              key={`${c.from}-${c.house}`}
              className="flex items-center gap-2 text-[10.5px] rounded border border-white/[0.07] px-2 py-1"
            >
              <span className="text-[#EDE8E0]/85 w-16 shrink-0">{c.fromTe}</span>
              <span className="text-[#EDE8E0]/45 w-12 shrink-0">{c.house}వ</span>
              <span className="text-[#EDE8E0]/65 flex-1 truncate">{c.toSignTe}</span>
              <span
                className={`font-mono-tabular ${
                  c.special ? 'text-[#C9A96E]' : 'text-[#EDE8E0]/55'
                }`}
              >
                {c.virupas}
              </span>
              {c.rule === 'node-phaladipika' && (
                <span className="text-[9px] text-[#5BBFB5]">ఫలదీపిక</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'pairs' && (
        <div className="grid gap-1 sm:grid-cols-2 max-h-[420px] overflow-y-auto pr-1">
          {[...report.pairs]
            .sort((a, b) => b.aToB + b.bToA - (a.aToB + a.bToA))
            .map((p) => (
              <div
                key={`${p.a}-${p.b}`}
                className="flex items-center gap-2 text-[10.5px] border-b border-white/[0.05] py-1"
              >
                <span className="text-[#EDE8E0]/80 w-14 shrink-0">{p.aTe}</span>
                <span className="text-[#EDE8E0]/30">→</span>
                <span className="text-[#EDE8E0]/80 w-14 shrink-0">{p.bTe}</span>
                <span className="text-[#C9A96E] font-mono-tabular w-12 text-right">{p.aToB.toFixed(1)}</span>
                <span className="text-[#EDE8E0]/30">/</span>
                <span className="text-[#5BBFB5] font-mono-tabular w-12">{p.bToA.toFixed(1)}</span>
                {p.mutual && (
                  <span className="ml-auto text-[9px] text-[#C9A96E] flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> పరస్పరం
                  </span>
                )}
              </div>
            ))}
        </div>
      )}

      {tab === 'rasi' && (
        <div className="grid gap-1 sm:grid-cols-2">
          {report.rasiDrishti.map((r) => (
            <div key={r.signIndex} className="text-[10.5px] flex gap-2">
              <span className="text-[#EDE8E0]/85 w-24 shrink-0">{r.signTe}</span>
              <span className="text-[#EDE8E0]/40 w-14 shrink-0">{r.natureTe}</span>
              <span className="text-[#5BBFB5]/80">{r.seesTe.join(' · ')}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'argala' && (
        <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
          {report.argala.map((a) => (
            <div key={a.house} className="text-[10.5px] flex items-start gap-2">
              <span className="text-[#EDE8E0]/85 w-8 shrink-0">{a.house}</span>
              <span
                className={`font-mono-tabular w-6 shrink-0 ${
                  a.net > 0 ? 'text-emerald-400' : a.net < 0 ? 'text-rose-400' : 'text-[#EDE8E0]/40'
                }`}
              >
                {a.net > 0 ? `+${a.net}` : a.net}
              </span>
              <span className="text-[#EDE8E0]/60">{a.verdictTe}</span>
            </div>
          ))}
        </div>
      )}

      <div className="text-[10px] text-[#EDE8E0]/35 leading-snug">{report.sourceTe}</div>
    </section>
  );
}
