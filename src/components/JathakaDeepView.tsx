import React, { useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Compass,
  Crown,
  Flame,
  Gauge,
  Info,
  Layers,
  Sparkles,
  Table2,
  Target,
} from 'lucide-react';
import { SourceStrip } from './SourceStrip.tsx';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import {
  computeVargaVimshopaka,
  VARGA_ORDER,
  VARGA_BODY_SHORT_TE,
  VARGA_DIVISION_TE,
  type VargaSchemeId,
} from '../engine/vargaVimsopakaEngine.ts';
import { computeShadbalaDeep } from '../engine/shadbalaDeepEngine.ts';
import { computeAvakahada } from '../engine/avakahadaEngine.ts';
import { computeBhavaSandhi } from '../engine/bhavaSandhiEngine.ts';
import { computeUpagrahas } from '../engine/upagrahaEngine.ts';
import { computeVimshottariDeep } from '../engine/vimshottariDeepEngine.ts';

interface JathakaDeepViewProps {
  chart: CompleteChartResult;
  lang?: 'te' | 'en';
}

const panel =
  'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden';
const panelHead =
  'flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02] text-[11px] font-mono-tabular uppercase tracking-wider text-[#C9A96E] font-semibold';

const SCHEME_TABS: { id: VargaSchemeId; labelTe: string }[] = [
  { id: 'shadvarga', labelTe: 'షడ్వర్గం' },
  { id: 'saptavarga', labelTe: 'సప్తవర్గం' },
  { id: 'dashavarga', labelTe: 'దశవర్గం' },
  { id: 'shodashavarga', labelTe: 'షోడశవర్గం' },
];

const Bar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
    <div
      className="h-full rounded-full transition-all"
      style={{ width: `${Math.max(2, Math.min(100, (value / max) * 100))}%`, background: color }}
    />
  </div>
);

export function JathakaDeepView({ chart, lang = 'te' }: JathakaDeepViewProps) {
  const isTe = lang !== 'en';
  const [scheme, setScheme] = useState<VargaSchemeId>('shodashavarga');
  const [openGraha, setOpenGraha] = useState<string | null>('Sun');

  const varga = useMemo(() => computeVargaVimshopaka(chart), [chart]);
  const shadbala = useMemo(() => computeShadbalaDeep(chart), [chart]);
  const avakahada = useMemo(() => computeAvakahada(chart), [chart]);
  const bhava = useMemo(() => computeBhavaSandhi(chart), [chart]);
  const upagraha = useMemo(() => computeUpagrahas(chart), [chart]);
  const dasha = useMemo(() => computeVimshottariDeep(chart), [chart]);

  const schemeRows = varga.schemes;

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className={panel}>
        <div className="px-5 py-5 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/40 text-[#C9A96E] text-[10px] font-mono-tabular uppercase tracking-wider font-bold">
              {isTe ? 'గ్రంథ ప్రమాణం' : 'Classical Standard'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-[#5BBFB5] text-[10px] font-mono-tabular uppercase tracking-wider font-bold">
              {isTe ? '210 తనిఖీలు' : '210 checks'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#9B8FD4]/15 border border-[#9B8FD4]/40 text-[#9B8FD4] text-[10px] font-mono-tabular uppercase tracking-wider font-bold">
              BPHS 6 · 7 · 26 · 27
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#EDE8E0]">
            {isTe ? 'జాతక సూక్ష్మ చక్రం — అవకహడ, షోడశ వర్గ, వింశోపక, షడ్బల' : 'Deep Jathaka — Avakahada, 16 Vargas, Vimshopaka & Shadbala'}
          </h2>
          <p className="text-xs leading-relaxed text-[#EDE8E0]/65 max-w-4xl">
            {isTe
              ? 'ఈ విభాగం సంప్రదాయ తెలుగు జాతక పత్రికలోని అవకహడ చక్రం, ఘాత చక్రం, షోడశ వర్గ పట్టిక, వింశోపక బలం, పూర్తి షడ్బలం (స్థాన/దిగ్/కాల/చేష్టా/నైసర్గిక/దృక్), భావ బలం మరియు పంచధా మైత్రిని బృహత్ పరాశర హోరా శాస్త్ర గణితంతో లెక్కిస్తుంది. ప్రతి సంఖ్యను ఉపయోగించిన సూత్రంతో సహా ఇక్కడే తనిఖీ చేయవచ్చు.'
              : 'Avakahada & Ghata chakra, the full 16-varga grid, Vimshopaka bala, complete six-fold Shadbala (sthana / dig / kala / cheshta / naisargika / drik), bhava bala and panchadha maitri — all computed from Brihat Parashara Hora Shastra arithmetic with auditable formulas.'}
          </p>
        </div>
      </div>

      {/* ── Avakahada + Ghata ──────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={panel}>
          <div className={panelHead}>
            <Crown className="w-3.5 h-3.5" /> {isTe ? 'అవకహడ చక్రం' : 'Avakahada Chakra'}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {avakahada.rows.map((r) => (
              <div key={r.key} className="rounded-xl border border-white/10 bg-[#0B1020]/60 px-3 py-2">
                <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#EDE8E0]/45">
                  {r.labelTe}
                </div>
                <div className="text-sm text-[#EDE8E0] font-semibold">{r.valueTe}</div>
                {r.noteTe && (
                  <div className="text-[10px] text-[#EDE8E0]/40 mt-0.5">{r.noteTe}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={panel}>
          <div className={panelHead}>
            <Flame className="w-3.5 h-3.5" /> {isTe ? 'ఘాత చక్రం (అశుభ కాలాలు)' : 'Ghata Chakra'}
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#EDE8E0]/70">
              <span>{isTe ? 'జన్మ రాశి' : 'Janma rasi'}</span>
              <span className="text-[#C9A96E] font-bold">{avakahada.ghata.janmaRasiTe}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { k: isTe ? 'ఘాత మాసం' : 'Masa', v: avakahada.ghata.row.masaTe },
                { k: isTe ? 'ఘాత తిథి' : 'Tithi', v: avakahada.ghata.row.tithiGroupTe },
                { k: isTe ? 'ఘాత వారం' : 'Vara', v: avakahada.ghata.row.varaTe },
                { k: isTe ? 'ఘాత నక్షత్రం' : 'Nakshatra', v: avakahada.ghata.row.nakshatraTe },
                { k: isTe ? 'ఘాత యోగం' : 'Yoga', v: avakahada.ghata.row.yogaTe },
                { k: isTe ? 'ఘాత కరణం' : 'Karana', v: avakahada.ghata.row.karanaTe },
                { k: isTe ? 'ప్రహరం' : 'Prahar', v: String(avakahada.ghata.row.prahara) },
                {
                  k: isTe ? 'ఘాత చంద్రుడు (పురుష)' : 'Ghat Chandra (M)',
                  v: avakahada.ghata.row.chandraMale + '',
                },
                {
                  k: isTe ? 'ఘాత చంద్రుడు (స్త్రీ)' : 'Ghat Chandra (F)',
                  v: avakahada.ghata.row.chandraFemale + '',
                },
              ].map((x) => (
                <div key={x.k} className="rounded-lg border border-[#D47B7B]/25 bg-[#D47B7B]/[0.06] px-2.5 py-2">
                  <div className="text-[9.5px] font-mono-tabular uppercase tracking-wide text-[#EDE8E0]/40">
                    {x.k}
                  </div>
                  <div className="text-xs text-[#EDE8E0] font-semibold">{x.v}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-[#EDE8E0]/55 border-t border-white/10 pt-2">
              {avakahada.ghata.meaningTe}
            </p>
          </div>
        </div>
      </div>

      {/* ── Shodashavarga matrix ───────────────────────────────── */}
      <div className={panel}>
        <div className={panelHead}>
          <Table2 className="w-3.5 h-3.5" /> {isTe ? 'షోడశ వర్గ పట్టిక (D-1 … D-60)' : 'Shodashavarga grid'}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono-tabular">
            <thead>
              <tr className="text-[#EDE8E0]/45 text-[10px] uppercase tracking-wider">
                <th className="px-3 py-2 text-left">{isTe ? 'వర్గం' : 'Varga'}</th>
                <th className="px-2 py-2 text-left">{isTe ? 'భాగం' : 'Division'}</th>
                {Object.keys(VARGA_BODY_SHORT_TE).map((b) => (
                  <th key={b} className="px-2 py-2 text-center">
                    {VARGA_BODY_SHORT_TE[b as keyof typeof VARGA_BODY_SHORT_TE]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VARGA_ORDER.map((code) => {
                const row = varga.matrix.find((m) => m.code === code)!;
                return (
                  <tr key={code} className="border-t border-white/5 hover:bg-white/[0.03]">
                    <td className="px-3 py-1.5 text-[#C9A96E] font-bold">{code}</td>
                    <td className="px-2 py-1.5 text-[#EDE8E0]/40">{VARGA_DIVISION_TE[code]}</td>
                    {row.signIndexes.map((s, i) => (
                      <td key={i} className="px-2 py-1.5 text-center text-[#EDE8E0]/85">
                        {s + 1}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-[10.5px] text-[#EDE8E0]/40 border-t border-white/10">
          {isTe
            ? 'సంఖ్యలు రాశి క్రమం (1 = మేషం … 12 = మీనం). ల = లగ్నం, సూ = సూర్యుడు, చం = చంద్రుడు, కు = కుజుడు, బు = బుధుడు, గు = గురువు, శు = శుక్రుడు, శ = శని, రా = రాహువు, కే = కేతువు.'
            : 'Sign numbers, 1 = Aries … 12 = Pisces. L = Lagna, Su = Sun, Mo = Moon, Ma = Mars, Me = Mercury, Ju = Jupiter, Ve = Venus, Sa = Saturn, Ra = Rahu, Ke = Ketu.'}
        </div>
      </div>

      {/* ── Vimshopaka ─────────────────────────────────────────── */}
      <div className={panel}>
        <div className={panelHead}>
          <Gauge className="w-3.5 h-3.5" /> {isTe ? 'వింశోపక బలం (20 మార్కులు)' : 'Vimshopaka Bala (out of 20)'}
          <div className="ml-auto flex gap-1">
            {SCHEME_TABS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScheme(s.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                  scheme === s.id
                    ? 'bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40'
                    : 'text-[#EDE8E0]/50 border border-white/10 hover:text-[#EDE8E0]'
                }`}
              >
                {s.labelTe}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {varga.rows.map((r) => {
            const score = r.scores.find((s) => s.scheme === scheme)!;
            return (
              <div key={r.bodyId} className="rounded-xl border border-white/10 bg-[#0B1020]/60 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#EDE8E0] font-semibold">
                    <span className="text-[#C9A96E] mr-1">{r.glyph}</span>
                    {r.nameTe}
                  </span>
                  <span className="text-xs font-mono-tabular text-[#5BBFB5] font-bold">
                    {score.score.toFixed(2)} / 20
                  </span>
                </div>
                <div className="mt-1.5">
                  <Bar value={score.score} max={20} color="#5BBFB5" />
                </div>
                <div className="mt-1 text-[10px] text-[#EDE8E0]/50">{score.verdictTe}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.vargottama && (
                    <span className="px-1.5 py-0.5 rounded bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#C9A96E] text-[9px] font-bold">
                      {isTe ? 'వర్గోత్తమ' : 'Vargottama'}
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#EDE8E0]/60 text-[9px]">
                    {r.vaiseshikamsa.nameTe} · {r.vaiseshikamsa.count}/10
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-4 pb-3 text-[10.5px] leading-relaxed text-[#EDE8E0]/45">
          {isTe
            ? 'గణన: వర్గ విశ్వ (స్వక్షేత్రం 20 · అతిమిత్ర 18 · మిత్ర 15 · సమ 10 · శత్రు 7 · అతిశత్రు 5) × వర్గ భారం ÷ 20. భారాలు: ' +
              schemeRows.find((s) => s.id === scheme)!.nameTe +
              ' పథకం ప్రకారం మొత్తం 20.'
            : 'Score = Varga Viswa (own 20 · great friend 18 · friend 15 · neutral 10 · enemy 7 · sworn enemy 5) × weight ÷ 20.'}
        </div>
      </div>

      {/* ── Shadbala ───────────────────────────────────────────── */}
      <div className={panel}>
        <div className={panelHead}>
          <Activity className="w-3.5 h-3.5" /> {isTe ? 'షడ్బలం — ఆరు బలాల విభజన' : 'Shadbala — six-fold strength'}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono-tabular">
            <thead>
              <tr className="text-[#EDE8E0]/45 text-[9.5px] uppercase tracking-wider">
                <th className="px-3 py-2 text-left">{isTe ? 'గ్రహం' : 'Graha'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'స్థాన' : 'Sthana'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'దిగ్' : 'Dig'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'కాల' : 'Kala'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'చేష్టా' : 'Cheshta'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'నైసర్గిక' : 'Naisargika'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'దృక్' : 'Drik'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'మొత్తం (వి.)' : 'Total'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'రూపాలు' : 'Rupas'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'నిష్పత్తి' : 'Ratio'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'ర్యాంక్' : 'Rank'}</th>
                <th className="px-2 py-2 text-right">{isTe ? 'ఇష్ట/కష్ట' : 'Ishta/Kashta'}</th>
              </tr>
            </thead>
            <tbody>
              {shadbala.rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setOpenGraha(openGraha === r.id ? null : r.id)}
                  className={`border-t border-white/5 cursor-pointer transition ${
                    openGraha === r.id ? 'bg-[#C9A96E]/[0.07]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <td className="px-3 py-2 text-[#EDE8E0]">
                    <span className="text-[#C9A96E] mr-1">{r.glyph}</span>
                    {r.nameTe}
                  </td>
                  <td className="px-2 py-2 text-right text-[#EDE8E0]/75">{r.sthanaTotal.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right text-[#EDE8E0]/75">{r.dig.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right text-[#EDE8E0]/75">{r.kalaTotal.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right text-[#EDE8E0]/75">{r.cheshta.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right text-[#EDE8E0]/75">{r.naisargika.toFixed(2)}</td>
                  <td
                    className={`px-2 py-2 text-right ${
                      r.drik >= 0 ? 'text-[#5BBFB5]' : 'text-[#D47B7B]'
                    }`}
                  >
                    {r.drik.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right text-[#EDE8E0] font-bold">{r.totalVirupas.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right text-[#C9A96E] font-bold">{r.totalRupas.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right">
                    <span
                      className={
                        r.ratioPercent >= 100 ? 'text-[#5BBFB5]' : 'text-[#D47B7B]'
                      }
                    >
                      {r.ratioPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-[#EDE8E0]/70">#{r.rank}</td>
                  <td className="px-2 py-2 text-right text-[#EDE8E0]/60">
                    {r.ishtaPhala.toFixed(1)} / {r.kashtaPhala.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {openGraha && (
          <div className="border-t border-white/10 p-4 space-y-3">
            {(() => {
              const r = shadbala.rows.find((x) => x.id === openGraha)!;
              return (
                <>
                  <div className="text-xs text-[#C9A96E] font-semibold">
                    {r.glyph} {r.nameTe} — {r.verdictTe} ({r.ratioPercent.toFixed(1)}% ·{' '}
                    {isTe ? 'కనీసం' : 'required'} {r.requiredVirupas} {isTe ? 'వి.' : 'virupas'})
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/40">
                        {isTe ? 'స్థాన బలం' : 'Sthana bala'}
                      </div>
                      {r.sthana.map((k) => (
                        <div key={k.key} className="flex items-center gap-2">
                          <span className="w-40 text-[10.5px] text-[#EDE8E0]/70">{k.nameTe}</span>
                          <div className="flex-1">
                            <Bar value={k.virupas} max={60} color="#9B8FD4" />
                          </div>
                          <span className="w-14 text-right text-[10.5px] text-[#EDE8E0]">
                            {k.virupas.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/40">
                        {isTe ? 'కాల బలం' : 'Kala bala'}
                      </div>
                      {r.kala.map((k) => (
                        <div key={k.key} className="flex items-center gap-2">
                          <span className="w-40 text-[10.5px] text-[#EDE8E0]/70">{k.nameTe}</span>
                          <div className="flex-1">
                            <Bar value={k.virupas} max={60} color="#C9A96E" />
                          </div>
                          <span className="w-14 text-right text-[10.5px] text-[#EDE8E0]">
                            {k.virupas.toFixed(1)}
                          </span>
                        </div>
                      ))}
                      <div className="text-[10px] text-[#EDE8E0]/45 pt-1">
                        {r.cheshtaKindTe}
                      </div>
                    </div>
                  </div>
                  {r.drikNotesTe.length > 0 && (
                    <div className="text-[10px] leading-relaxed text-[#EDE8E0]/50">
                      <span className="text-[#5BBFB5] font-semibold">
                        {isTe ? 'దృక్ బలం: ' : 'Drik: '}
                      </span>
                      {r.drikNotesTe.join(' · ')}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Bhava bala + Maitri ────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={panel}>
          <div className={panelHead}>
            <Layers className="w-3.5 h-3.5" /> {isTe ? 'భావ బలం (12 భావాలు)' : 'Bhava bala'}
          </div>
          <div className="p-4 space-y-1.5">
            {[...shadbala.bhavaBala]
              .sort((a, b) => a.house - b.house)
              .map((b) => (
                <div key={b.house} className="flex items-center gap-2">
                  <span className="w-16 text-[10.5px] text-[#EDE8E0]/70">
                    {b.house}. {b.lordTe}
                  </span>
                  <div className="flex-1">
                    <Bar value={b.totalVirupas} max={700} color="#5BBFB5" />
                  </div>
                  <span className="w-14 text-right text-[10.5px] text-[#EDE8E0]">
                    {b.totalVirupas.toFixed(0)}
                  </span>
                  <span className="w-8 text-right text-[10px] text-[#C9A96E]">#{b.rank}</span>
                </div>
              ))}
          </div>
          <div className="px-4 pb-3 text-[10px] text-[#EDE8E0]/40">
            {isTe
              ? 'భావ బలం = భావాధిపతి షడ్బలం + భావ మధ్యంపై స్ఫుట దృష్టి (శుభ − పాప) ÷ 4.'
              : 'Bhava bala = lord shadbala + sphuta drishti on the bhava madhya (benefic − malefic) ÷ 4.'}
          </div>
        </div>

        <div className={panel}>
          <div className={panelHead}>
            <Target className="w-3.5 h-3.5" /> {isTe ? 'పంచధా మైత్రి' : 'Panchadha maitri'}
          </div>
          <div className="overflow-x-auto p-3">
            <table className="w-full text-[10px] font-mono-tabular">
              <thead>
                <tr className="text-[#EDE8E0]/40">
                  <th className="px-1 py-1" />
                  {avakahada.maitri.map((m) => (
                    <th key={m.from} className="px-1 py-1 text-center">
                      {m.fromTe.slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {avakahada.maitri.map((row) => (
                  <tr key={row.from} className="border-t border-white/5">
                    <td className="px-1 py-1 text-[#EDE8E0]/70">{row.fromTe}</td>
                    {row.cells.map((c) => (
                      <td
                        key={c.to}
                        className="px-1 py-1 text-center"
                        style={{
                          color:
                            c.compound === 'adhimitra'
                              ? '#5BBFB5'
                              : c.compound === 'mitra'
                                ? '#7FBFA0'
                                : c.compound === 'sama'
                                  ? '#C9A96E'
                                  : c.compound === 'satru'
                                    ? '#D47B7B'
                                    : '#9B8FD4',
                        }}
                        title={`${row.fromTe} → ${c.toTe}: ${c.naturalTe} + ${c.temporalTe} = ${c.compoundTe}`}
                      >
                        {c.compoundTe.slice(0, 3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-3 text-[10px] text-[#EDE8E0]/40">
            {isTe
              ? 'నైసర్గిక మైత్రి + తాత్కాలిక మైత్రి (2, 3, 4, 10, 11, 12 స్థానాలు) కలిపి పంచధా మైత్రి. చుక్కలపై హోవర్ చేస్తే పూర్తి వివరం.'
              : 'Natural + temporal (2, 3, 4, 10, 11, 12) friendship combined into five-fold relation.'}
          </div>
        </div>
      </div>

      {/* ── Method & context ───────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={panel}>
          <div className={panelHead}>
            <Compass className="w-3.5 h-3.5" /> {isTe ? 'కాల బలం ఆధారాలు' : 'Kala bala anchors'}
          </div>
          <div className="p-4 space-y-2 text-[11px] text-[#EDE8E0]/70">
            {[
              [isTe ? 'సూర్యోదయం' : 'Sunrise', shadbala.sunriseISO],
              [isTe ? 'సూర్యాస్తమయం' : 'Sunset', shadbala.sunsetISO],
              [isTe ? 'హోర (సంఖ్య)' : 'Hora', `${shadbala.hora.index} — ${shadbala.hora.lordTe}`],
              [isTe ? 'దినాధిపతి' : 'Dina lord', shadbala.dinaLordTe],
              [isTe ? 'మాసాధిపతి' : 'Masa lord', `${shadbala.masa.lordTe} (${shadbala.masa.startISO})`],
              [isTe ? 'వర్షాధిపతి' : 'Varsha lord', `${shadbala.varsha.lordTe} (${shadbala.varsha.startISO})`],
              [
                isTe ? 'పక్ష బలం' : 'Paksha bala',
                `${shadbala.paksha.pakshaBala.toFixed(2)} ${isTe ? 'వి.' : 'virupas'} (${shadbala.paksha.isShukla ? 'శుక్ల' : 'కృష్ణ'})`,
              ],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#EDE8E0]/50">{k}</span>
                <span className="text-[#EDE8E0] font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>


        {/* ── శ్రీపతి భావ సంధి ─────────────────────────────────── */}
        <div className={panel}>
          <div className={panelHead}>
            <Compass className="w-3.5 h-3.5" /> {isTe ? 'శ్రీపతి భావ సంధి చక్రం' : 'Śrīpati bhāva-sandhi'}
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[10.5px] leading-relaxed text-[#EDE8E0]/55">{bhava.methodNoteTe}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[10.5px] font-mono-tabular">
                <thead className="text-[#C9A96E]/70 uppercase tracking-wider text-[9px]">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-1.5 pr-2">{isTe ? 'భావం' : 'Bhāva'}</th>
                    <th className="text-left py-1.5 pr-2">{isTe ? 'ఆరంభం' : 'Start'}</th>
                    <th className="text-left py-1.5 pr-2">{isTe ? 'మధ్య' : 'Middle'}</th>
                    <th className="text-left py-1.5 pr-2">{isTe ? 'అంతం' : 'End'}</th>
                    <th className="text-right py-1.5 pr-2">{isTe ? 'వెడల్పు' : 'Span'}</th>
                    <th className="text-left py-1.5 pl-2">{isTe ? 'గ్రహాలు' : 'Grahas'}</th>
                  </tr>
                </thead>
                <tbody>
                  {bhava.rows.map((r) => (
                    <tr key={r.house} className="border-b border-white/5 text-[#EDE8E0]/75">
                      <td className="py-1.5 pr-2 text-[#EDE8E0] whitespace-nowrap">
                        {r.house}. {r.nameTe}
                      </td>
                      <td className="py-1.5 pr-2 whitespace-nowrap">{r.arambhaRasiTe} {r.arambhaDms}</td>
                      <td className="py-1.5 pr-2 whitespace-nowrap text-[#C9A96E]">{r.madhyaRasiTe} {r.madhyaDms}</td>
                      <td className="py-1.5 pr-2 whitespace-nowrap">{r.antaRasiTe} {r.antaDms}</td>
                      <td className="py-1.5 pr-2 text-right">{r.spanDeg.toFixed(1)}°</td>
                      <td className="py-1.5 pl-2 whitespace-nowrap">{r.planetsTe.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] leading-relaxed text-[#5BBFB5]/80">{bhava.caveatTe}</p>
          </div>
        </div>

        {/* ── ఉపగ్రహ చక్రం ─────────────────────────────────────── */}
        <div className={panel}>
          <div className={panelHead}>
            <Target className="w-3.5 h-3.5" /> {isTe ? 'ఉపగ్రహ చక్రం' : 'Upagraha chakra'}
          </div>
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#EDE8E0]/70">
                {isTe ? 'సూర్యోదయం' : 'Sunrise'} {upagraha.sunriseTe}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#EDE8E0]/70">
                {isTe ? 'సూర్యాస్తమయం' : 'Sunset'} {upagraha.sunsetTe}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#EDE8E0]/70">
                {isTe ? 'భాగ కాలం' : 'Part'} {upagraha.partLengthMinutes.toFixed(1)}m
              </span>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {upagraha.rows.map((u) => (
                <div key={u.id} className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#EDE8E0]">
                      {u.nameTe} <span className="text-[9px] text-[#EDE8E0]/40">{u.nameEn}</span>
                    </span>
                    <span className="text-[10.5px] font-mono-tabular text-[#C9A96E]">
                      {u.rasiShortTe} {u.dms}
                    </span>
                  </div>
                  <div className="text-[9.5px] text-[#EDE8E0]/45 font-mono-tabular">
                    {u.kind === 'sun'
                      ? u.chainTe
                      : `${isTe ? 'భాగం' : 'Part'} ${u.partNumber} · ${u.partLordTe} · ${u.partStartLocal}`}
                    {' · '}
                    {isTe ? 'భావం' : 'H'} {u.house} · {u.natureTe}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-[#EDE8E0]/45">{upagraha.methodNoteTe}</p>
            <p className="text-[10px] leading-relaxed text-[#5BBFB5]/80">{upagraha.caveatTe}</p>
          </div>
        </div>

        {/* ── వింశోత్తరీ దశా చక్రం ────────────────────────────── */}
        <div className={panel}>
          <div className={panelHead}>
            <Layers className="w-3.5 h-3.5" /> {isTe ? 'వింశోత్తరీ దశా చక్రం (5 స్థాయిలు)' : 'Vimśottarī dasha (5 levels)'}
          </div>
          <div className="p-4 space-y-3">
            <div className="rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/[0.06] px-3 py-2 space-y-1">
              <div className="text-[12px] font-semibold text-[#C9A96E]">{dasha.balance.textTe}</div>
              <div className="text-[10px] text-[#EDE8E0]/60 font-mono-tabular">
                {dasha.balance.mahadashaStartLocal} → {dasha.balance.mahadashaEndLocal}
              </div>
              <div className="text-[9.5px] text-[#EDE8E0]/40">
                {isTe ? 'జన్మ నక్షత్రం' : 'Janma nakṣatra'} {dasha.janmaNakshatraTe} ·{' '}
                {isTe ? 'పాదం' : 'pada'} {dasha.janmaNakshatraPada} · {dasha.yearLengthTe}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              {dasha.birthChain.map((c) => (
                <span
                  key={c.level}
                  className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[#EDE8E0]/80"
                >
                  <span className="text-[#9B8FD4]">{c.level}</span> {c.lordTe}
                  <span className="text-[#EDE8E0]/35"> · {c.startLocal.slice(0, 10)}</span>
                </span>
              ))}
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-[10.5px] font-mono-tabular">
                <thead className="sticky top-0 bg-[#12161C] text-[#C9A96E]/70 uppercase tracking-wider text-[9px]">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-1.5 pr-2">{isTe ? 'భుక్తి' : 'Bhukti'}</th>
                    <th className="text-left py-1.5 pr-2">{isTe ? 'ప్రత్యంతరం' : 'Pratyantar'}</th>
                    <th className="text-left py-1.5 pr-2">{isTe ? 'ఆరంభం' : 'Start'}</th>
                    <th className="text-left py-1.5 pl-2">{isTe ? 'ముగింపు' : 'End'}</th>
                  </tr>
                </thead>
                <tbody>
                  {dasha.mahadashas[0].children.flatMap((ad) =>
                    ad.children.slice(0, 9).map((pd) => (
                      <tr key={`${ad.lord}-${pd.lord}`} className="border-b border-white/5 text-[#EDE8E0]/70">
                        <td className="py-1 pr-2">{ad.lordTe}</td>
                        <td className="py-1 pr-2">{pd.lordTe}</td>
                        <td className="py-1 pr-2 text-[#C9A96E]/90">{pd.startLocal}</td>
                        <td className="py-1 pl-2">{pd.endLocal}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] leading-relaxed text-[#EDE8E0]/45">{dasha.methodNoteTe}</p>
          </div>
        </div>

        <div className={panel}>
          <div className={panelHead}>
            <Info className="w-3.5 h-3.5" /> {isTe ? 'గణన పద్ధతి & ఆధారాలు' : 'Method & sources'}
          </div>
          <div className="p-4 space-y-2 text-[10.5px] leading-relaxed text-[#EDE8E0]/55">
            <p>{shadbala.methodNoteTe}</p>
            <p>{varga.methodNoteTe}</p>
            <p className="flex items-center gap-1.5 text-[#5BBFB5]">
              <BadgeCheck className="w-3.5 h-3.5" />
              {isTe
                ? '210 పిన్-టు-పిన్ తనిఖీలు (3 సూచన జాతక పత్రికలు) — npm run verify:jathaka'
                : '210 pin-to-pin checks against 3 reference jathakam PDFs.'}
            </p>
            <p className="flex items-center gap-1.5 text-[#C9A96E]">
              <Sparkles className="w-3.5 h-3.5" />
              {isTe
                ? 'అష్టకవర్గం (భిన్న + సర్వ), షోడశ వర్గం, వింశోపకం, అవకహడ మరియు ఘాత చక్రం — సూచన పత్రికలతో ఖచ్చితంగా సరిపోయాయి.'
                : 'Ashtakavarga, 16 vargas, vimshopaka, avakahada and ghata match the reference PDFs exactly.'}
            </p>
          </div>
          <div className="px-4 pb-4">
            <SourceStrip feature="jathaka" titleTe="ఈ విభాగపు మూల గ్రంథాలు" compact />
          </div>
        </div>
      </div>
    </div>
  );
}

export default JathakaDeepView;
