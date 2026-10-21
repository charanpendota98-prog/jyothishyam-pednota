import React, { useMemo, useRef, useState } from 'react';
import {
  Compass,
  Clock,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Sparkles,
  Award,
  Layers,
  Eye,
  ShieldCheck,
  ArrowRightLeft,
} from 'lucide-react';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import {
  calculateJaiminiCharaDasha,
  type JaiminiDashaSchool,
} from '../engine/jaiminiCharaDashaEngine.ts';

interface JaiminiCharaDashaVisualizerProps {
  chart: CompleteChartResult;
}

const GRADE_STYLE: Record<
  'raja_yoga' | 'shubha' | 'misrama' | 'pariksha',
  { bg: string; border: string; badge: string; bar: string; text: string }
> = {
  raja_yoga: {
    bg: 'bg-[#C9A96E]/20',
    border: 'border-[#C9A96E]',
    badge: 'bg-[#C9A96E]/25 text-[#C9A96E] border-[#C9A96E]/50',
    bar: 'bg-[#C9A96E]',
    text: 'text-[#C9A96E]',
  },
  shubha: {
    bg: 'bg-[#5BBFB5]/15',
    border: 'border-[#5BBFB5]/70',
    badge: 'bg-[#5BBFB5]/20 text-[#5BBFB5] border-[#5BBFB5]/45',
    bar: 'bg-[#5BBFB5]',
    text: 'text-[#5BBFB5]',
  },
  misrama: {
    bg: 'bg-[#9B8FD4]/15',
    border: 'border-[#9B8FD4]/60',
    badge: 'bg-[#9B8FD4]/20 text-[#BDB2FF] border-[#9B8FD4]/45',
    bar: 'bg-[#9B8FD4]',
    text: 'text-[#BDB2FF]',
  },
  pariksha: {
    bg: 'bg-[#D47B7B]/15',
    border: 'border-[#D47B7B]/65',
    badge: 'bg-[#D47B7B]/20 text-[#D47B7B] border-[#D47B7B]/45',
    bar: 'bg-[#D47B7B]',
    text: 'text-[#D47B7B]',
  },
};

export const JaiminiCharaDashaVisualizer: React.FC<
  JaiminiCharaDashaVisualizerProps
> = ({ chart }) => {
  const [school, setSchool] = useState<JaiminiDashaSchool>('kn_rao');
  const [showSecondCycle, setShowSecondCycle] = useState<boolean>(false);

  const report = useMemo(
    () => calculateJaiminiCharaDasha(chart, school),
    [chart, school]
  );

  const visibleMahadashas = useMemo(
    () =>
      showSecondCycle
        ? report.mahadashas
        : report.mahadashas.filter((m) => m.cycleIndex === 1),
    [report.mahadashas, showSecondCycle]
  );

  const currentMahaIdx = useMemo(() => {
    const idx = report.mahadashas.findIndex((m) => m.isCurrent);
    return idx >= 0 ? idx : 0;
  }, [report.mahadashas]);

  const [selectedMahaIdx, setSelectedMahaIdx] = useState<number>(currentMahaIdx);
  const [selectedAntarIdx, setSelectedAntarIdx] = useState<number>(() => {
    const m = report.mahadashas[currentMahaIdx] ?? report.mahadashas[0];
    const aIdx = m?.antardashas.findIndex((a) => a.isCurrent) ?? 0;
    return Math.max(0, aIdx);
  });
  const [selectedPratIdx, setSelectedPratIdx] = useState<number>(() => {
    const m = report.mahadashas[currentMahaIdx] ?? report.mahadashas[0];
    const a = m?.antardashas.find((ant) => ant.isCurrent) ?? m?.antardashas[0];
    const pIdx = a?.pratyantardashas.findIndex((p) => p.isCurrent) ?? 0;
    return Math.max(0, pIdx);
  });

  const mahaTrackRef = useRef<HTMLDivElement>(null);
  const antarTrackRef = useRef<HTMLDivElement>(null);

  const activeMaha =
    report.mahadashas[selectedMahaIdx] ?? report.mahadashas[0];
  const activeAntar =
    activeMaha.antardashas[selectedAntarIdx] ?? activeMaha.antardashas[0];
  const activePrat =
    activeAntar.pratyantardashas[selectedPratIdx] ??
    activeAntar.pratyantardashas[0];

  const handleJumpToNow = () => {
    const mIdx = Math.max(
      0,
      report.mahadashas.findIndex((m) => m.isCurrent)
    );
    const m = report.mahadashas[mIdx];
    if (m && m.cycleIndex === 2) {
      setShowSecondCycle(true);
    }
    const aIdx = Math.max(
      0,
      m?.antardashas.findIndex((a) => a.isCurrent) ?? 0
    );
    const a = m?.antardashas[aIdx];
    const pIdx = Math.max(
      0,
      a?.pratyantardashas.findIndex((p) => p.isCurrent) ?? 0
    );
    setSelectedMahaIdx(mIdx);
    setSelectedAntarIdx(aIdx);
    setSelectedPratIdx(pIdx);
  };

  const scrollTrack = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: 'left' | 'right'
  ) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-[#0F1326] border-2 border-[#5BBFB5]/50 rounded-xl p-5 sm:p-6 md:p-8 shadow-2xl space-y-7">
      {/* Top Banner & Jaimini School Controls */}
      <div className="pb-5 border-b border-white/10 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs uppercase tracking-widest text-[#5BBFB5] font-semibold flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#5BBFB5]" />
            మహర్షి జైమిని ఉపదేశ సూత్రములు — చర రాశి దశా కాలచక్రం (Jaimini Chara Dasha Calculator & Timeline)
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-[#EDE8E0]">
            జైమిని చర మహాదశ · అంతర్దశ · ప్రత్యంతర్దశ దృశ్యమాన కాలరేఖ
          </h2>
          <p className="text-xs text-[#EDE8E0]/75 max-w-4xl leading-relaxed">
            నక్షత్ర ఆధారిత వింశోత్తరి దశకు ప్రత్యామ్నాయంగా, రాశుల సవ్య-అపసవ్య గమనం, సప్త చర కారకులు (AK, AmK, PK, DK), ఆరూఢ పాదాలు (AL, UL) మరియు జైమిని రాశి దృష్టులతో ఫలితాలను నిర్ధారించే మహర్షి జైమిని చర దశా విధానం.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* School Switcher */}
          <div className="flex items-center bg-[#090C18] p-1 rounded-lg border border-white/15">
            <button
              onClick={() => setSchool('kn_rao')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                school === 'kn_rao'
                  ? 'bg-[#C9A96E] text-[#090C18]'
                  : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
              }`}
            >
              K.N. Rao జైమిని ప్రమాణం
            </button>
            <button
              onClick={() => setSchool('parashara_traditional')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                school === 'parashara_traditional'
                  ? 'bg-[#C9A96E] text-[#090C18]'
                  : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
              }`}
            >
              పరాశర / నీలకంఠ సాంప్రదాయం
            </button>
          </div>

          <button
            onClick={() => setShowSecondCycle(!showSecondCycle)}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              showSecondCycle
                ? 'bg-[#9B8FD4]/20 border-[#9B8FD4] text-[#BDB2FF]'
                : 'bg-[#090C18] border-white/15 text-[#EDE8E0]/80 hover:border-[#C9A96E]/50'
            }`}
          >
            {showSecondCycle
              ? '2వ చక్రం ఆన్ (100+ సం. పూర్తి ఆయుష్షు)'
              : `1వ చక్రం (${report.firstCycleTotalYears} సం.) · 2వ చక్రం చూపించు`}
          </button>

          <button
            onClick={handleJumpToNow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5BBFB5] text-[#090C18] text-xs font-bold hover:bg-[#6fd0c6] transition-colors cursor-pointer shadow-md"
          >
            <Crosshair className="w-3.5 h-3.5" />
            ప్రస్తుత చర దశకు వెళ్ళండి
          </button>
        </div>
      </div>

      {/* Jaimini Key Pillars Strip (AK, Karakamsha, AL, UL, A10, Progression Rule) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-lg p-3">
          <div className="text-[10px] text-[#EDE8E0]/55 uppercase">ఆత్మకారకుడు (Atmakaraka)</div>
          <div className="text-sm font-bold text-[#C9A96E] mt-0.5">
            {report.atmakaraka.planetNameTe} ({report.atmakaraka.degreeDMS})
          </div>
          <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
            రాశి: {report.atmakaraka.rasiNameTe}
          </div>
        </div>

        <div className="bg-[#090C18]/90 border border-[#5BBFB5]/35 rounded-lg p-3">
          <div className="text-[10px] text-[#EDE8E0]/55 uppercase">కారాకాంశ లగ్నం (KL - D9)</div>
          <div className="text-sm font-bold text-[#5BBFB5] mt-0.5">
            {report.karakamshaRasiNameTe}
          </div>
          <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
            AK నవాంశ స్థానం
          </div>
        </div>

        <div className="bg-[#090C18]/90 border border-white/15 rounded-lg p-3">
          <div className="text-[10px] text-[#EDE8E0]/55 uppercase">ఆరూఢ లగ్నం (AL - మాయా/కీర్తి)</div>
          <div className="text-sm font-bold text-[#EDE8E0] mt-0.5">
            {report.arudhaLagnaNameTe}
          </div>
          <div className="text-[11px] text-[#C9A96E] mt-0.5">
            లగ్న పాదం (A1)
          </div>
        </div>

        <div className="bg-[#090C18]/90 border border-white/15 rounded-lg p-3">
          <div className="text-[10px] text-[#EDE8E0]/55 uppercase">ఉపపాద లగ్నం (UL - వివాహం)</div>
          <div className="text-sm font-bold text-[#5BBFB5] mt-0.5">
            {report.upapadaLagnaNameTe}
          </div>
          <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
            12వ భావ ఆరూఢం (A12)
          </div>
        </div>

        <div className="bg-[#090C18]/90 border border-white/15 rounded-lg p-3">
          <div className="text-[10px] text-[#EDE8E0]/55 uppercase">రాజ్య పాదం (A10 - ఉద్యోగం)</div>
          <div className="text-sm font-bold text-[#C9A96E] mt-0.5">
            {report.rajyaPadaA10NameTe}
          </div>
          <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
            10వ భావ ఆరూఢం
          </div>
        </div>

        <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-lg p-3">
          <div className="text-[10px] text-[#EDE8E0]/55 uppercase">మహాదశ గమన క్రమం</div>
          <div className="text-sm font-bold text-[#C9A96E] mt-0.5">
            {report.mahadashaProgressionDirection === 'savya'
              ? 'సవ్య క్రమం (→)'
              : 'అపసవ్య క్రమం (←)'}
          </div>
          <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
            9వ భావం: {report.ninthHouseRasiNameTe}
          </div>
        </div>
      </div>

      {/* Progression Formula Explanation Banner */}
      <div className="bg-[#090C18]/90 border border-[#5BBFB5]/35 rounded-lg p-3.5 text-xs text-[#EDE8E0]/90 flex flex-wrap items-center justify-between gap-2">
        <div>
          <strong className="text-[#5BBFB5]">జైమిని గమన సూత్రం: </strong>
          {report.mahadashaProgressionReasonTe}
        </div>
        <span className="font-mono-tabular text-[#C9A96E] font-semibold">
          1వ చక్రం మొత్తం ఆయుర్దాయం: {report.firstCycleTotalYears} సంవత్సరములు
        </span>
      </div>

      {/* ===================================================================== */}
      {/* TIER 1: RASI MAHADASHA INTERACTIVE TIMELINE TRACK                     */}
      {/* ===================================================================== */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-[#C9A96E] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C9A96E]" />
            స్థాయి 1 · ద్వాదశ రాశి చర మహాదశల కాలరేఖ (Rasi Mahadasha Timeline — ఏ రాశినైనా క్లిక్ చేయండి)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#EDE8E0]/55 mr-1">కదిలించండి:</span>
            <button
              onClick={() => scrollTrack(mahaTrackRef, 'left')}
              className="p-1.5 rounded bg-[#090C18] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTrack(mahaTrackRef, 'right')}
              className="p-1.5 rounded bg-[#090C18] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={mahaTrackRef}
          className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 select-none"
        >
          {visibleMahadashas.map((maha) => {
            const globalIdx = report.mahadashas.findIndex(
              (m) =>
                m.cycleIndex === maha.cycleIndex && m.orderIndex === maha.orderIndex
            );
            const isSelected = globalIdx === selectedMahaIdx;
            const st = GRADE_STYLE[maha.auspiciousnessGrade];

            return (
              <button
                key={`${maha.cycleIndex}-${maha.rasiIndex}`}
                onClick={() => {
                  setSelectedMahaIdx(globalIdx);
                  const currAntar = maha.antardashas.findIndex((a) => a.isCurrent);
                  setSelectedAntarIdx(currAntar >= 0 ? currAntar : 0);
                  setSelectedPratIdx(0);
                }}
                style={{ minWidth: `${Math.max(175, maha.durationYears * 19)}px` }}
                className={`text-left rounded-xl p-3.5 border transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer shrink-0 ${
                  isSelected
                    ? `${st.bg} ${st.border} ring-2 ring-[#C9A96E]/60 shadow-lg`
                    : maha.isCurrent
                      ? 'bg-[#141932] border-[#5BBFB5] shadow-md'
                      : 'bg-[#090C18]/90 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-black/40 text-[#EDE8E0]/80">
                      {maha.cycleIndex === 2 ? '2వ చక్రం · ' : ''}#{maha.orderIndex + 1} ·{' '}
                      {maha.countingDirection === 'savya' ? 'సవ్య →' : '← అపసవ్య'}
                    </span>
                    {maha.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-[#5BBFB5] text-[#090C18] text-[9.5px] font-bold">
                        ప్రస్తుత దశ
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between gap-2 pt-0.5">
                    <h3 className="text-base font-bold text-[#EDE8E0]">
                      {maha.rasiNameTe} దశ
                    </h3>
                    <span className={`text-xs font-mono-tabular font-bold ${st.text}`}>
                      {maha.durationYears} సం.
                    </span>
                  </div>

                  <div className="text-[11px] text-[#EDE8E0]/70">
                    అధిపతి: <strong className="text-[#C9A96E]">{maha.lordNameTe}</strong> ({maha.lordRasiNameTe}లో)
                  </div>

                  {maha.karakasInSignTe.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {maha.karakasInSignTe.map((k, kIdx) => (
                        <span
                          key={kIdx}
                          className="px-1.5 py-0.5 rounded bg-[#C9A96E]/20 border border-[#C9A96E]/40 text-[#C9A96E] text-[9.5px] font-bold"
                        >
                          {k.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-2 border-t border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10.5px] font-mono-tabular text-[#EDE8E0]/80">
                    <span>వయస్సు: {maha.startAge}–{maha.endAge} సం.</span>
                    <span className="text-[#5BBFB5]">L:{maha.houseFromLagna} · AL:{maha.houseFromAL}</span>
                  </div>
                  <div className="text-[10px] font-mono-tabular text-[#EDE8E0]/55">
                    {maha.startDate} → {maha.endDate}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TIER 2: 12 RASI ANTARDASHA (BHUKTI) SUB-PERIOD TRACK                  */}
      {/* ===================================================================== */}
      <div className="bg-[#090C18]/90 border border-white/15 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <div className="text-xs font-bold text-[#5BBFB5] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5BBFB5]" />
              స్థాయి 2 · {activeMaha.rasiNameTe} మహాదశలోని 12 చర అంతర్దశలు (Rasi Antardashas — ప్రతి భుక్తి: {activeMaha.durationYears} నెలలు)
            </div>
            <p className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
              {activeMaha.rasiNameTe} ({activeMaha.countingDirectionTe}) నుండి వరుసగా 12 రాశుల అంతర్దశలు ({activeMaha.startDate} నుండి {activeMaha.endDate} వరకు):
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollTrack(antarTrackRef, 'left')}
              className="p-1.5 rounded bg-[#141932] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTrack(antarTrackRef, 'right')}
              className="p-1.5 rounded bg-[#141932] border border-white/15 text-[#EDE8E0] hover:border-[#C9A96E] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={antarTrackRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5"
        >
          {activeMaha.antardashas.map((antar, aIdx) => {
            const isAntarSelected = aIdx === selectedAntarIdx;
            return (
              <button
                key={antar.rasiIndex}
                onClick={() => {
                  setSelectedAntarIdx(aIdx);
                  setSelectedPratIdx(0);
                }}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isAntarSelected
                    ? 'bg-[#C9A96E]/20 border-[#C9A96E] ring-1 ring-[#C9A96E]'
                    : antar.isCurrent
                      ? 'bg-[#5BBFB5]/15 border-[#5BBFB5]'
                      : 'bg-[#141932]/80 border-white/10 hover:border-white/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono-tabular text-[#EDE8E0]/55">
                      భుక్తి #{aIdx + 1}
                    </span>
                    {antar.isCurrent && (
                      <span className="px-1.5 py-0.2 rounded bg-[#5BBFB5] text-[#090C18] text-[9px] font-bold">
                        ప్రస్తుతం
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#EDE8E0] mt-1">
                    {activeMaha.rasiNameTe} – {antar.rasiNameTe}
                  </div>
                  <div className="text-[10.5px] text-[#C9A96E] mt-0.5">
                    అధిపతి: {antar.lordNameTe} · {antar.durationMonths} నెలలు
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-white/10 space-y-0.5">
                  <div className="text-[10px] text-[#5BBFB5] font-semibold">
                    లగ్నం నుండి {antar.houseFromLagna}వ · AL నుండి {antar.houseFromAL}వ
                  </div>
                  <div className="text-[9.5px] font-mono-tabular text-[#EDE8E0]/65">
                    {antar.startDate} → {antar.endDate}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* TIER 3: 12 RASI PRATYANTARDASHA PILLS */}
        <div className="pt-3 border-t border-white/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#C9A96E]">
              స్థాయి 3 · {activeMaha.rasiNameTe} మహాదశ – {activeAntar.rasiNameTe} అంతర్దశలోని 12 ప్రత్యంతర్దశలు (ఒక్కొక్కటి ~{activePrat?.durationDays ?? 15} రోజులు):
            </span>
            <span className="text-[11px] font-mono-tabular text-[#5BBFB5]">
              ఎంచుకున్న ప్రత్యంతర్దశ: {activePrat?.rasiNameTe} ({activePrat?.startDate} నుండి {activePrat?.endDate})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {activeAntar.pratyantardashas.map((prat, pIdx) => {
              const isPratSelected = pIdx === selectedPratIdx;
              return (
                <button
                  key={prat.rasiIndex}
                  onClick={() => setSelectedPratIdx(pIdx)}
                  className={`p-2 rounded border text-left transition-all cursor-pointer ${
                    isPratSelected
                      ? 'bg-[#C9A96E] text-[#090C18] border-[#C9A96E] font-bold'
                      : prat.isCurrent
                        ? 'bg-[#5BBFB5]/20 text-[#5BBFB5] border-[#5BBFB5]'
                        : 'bg-[#090C18] text-[#EDE8E0]/80 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{prat.rasiNameTe}</div>
                  <div
                    className={`text-[9px] font-mono-tabular mt-0.5 ${
                      isPratSelected ? 'text-[#090C18]/80' : 'text-[#EDE8E0]/55'
                    }`}
                  >
                    {prat.startDate.slice(5)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SELECTED CHARA DASHA DEEP JAIMINI SUTRA SYNTHESIS & DOUBLE-LOCK CARD  */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Deep Jaimini Sutra Interpretation */}
        <div className="lg:col-span-7 bg-[#090C18]/95 border border-[#C9A96E]/45 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="text-[11px] text-[#C9A96E] font-semibold uppercase tracking-wider">
                ఎంచుకున్న చర దశా-భుక్తి లోతైన జైమిని సూత్ర విశ్లేషణ
              </div>
              <h3 className="text-lg font-bold text-[#EDE8E0] mt-0.5">
                {activeMaha.rasiNameTe} మహాదశ ({activeMaha.durationYears} సం.) — {activeAntar.rasiNameTe} అంతర్దశ ({activeAntar.durationMonths} నెలలు)
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                GRADE_STYLE[activeMaha.auspiciousnessGrade].badge
              }`}
            >
              {activeMaha.auspiciousnessLabelTe}
            </span>
          </div>

          {/* Mathematical Duration Proof */}
          <div className="p-3.5 rounded-lg bg-[#141932] border border-white/10 text-xs space-y-1">
            <div className="font-bold text-[#5BBFB5]">
              1. దశా సంవత్సర గణిత ప్రమాణం (Mathematical Derivation of Years):
            </div>
            <p className="text-[#EDE8E0]/90 leading-relaxed">
              {activeMaha.calculationExplanationTe}
            </p>
          </div>

          {/* Mahadasha & Antardasha Detailed Phala */}
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-lg bg-[#0F1326] border border-white/10 space-y-1.5">
              <div className="font-bold text-[#C9A96E]">
                2. {activeMaha.rasiNameTe} మహాదశ ప్రధాన ఫలితం ({activeMaha.startDate} → {activeMaha.endDate}):
              </div>
              <p className="text-[#EDE8E0]/90">{activeMaha.detailedPhalaTe}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0F1326] border border-[#5BBFB5]/35 space-y-1.5">
              <div className="font-bold text-[#5BBFB5]">
                3. {activeAntar.rasiNameTe} అంతర్దశ (భుక్తి) ఫలితం ({activeAntar.startDate} → {activeAntar.endDate}):
              </div>
              <p className="text-[#EDE8E0]/90">{activeAntar.predictionSummaryTe}</p>
            </div>
          </div>

          {/* Double-Lock Dasha Confirmation (Jaimini Chara + Parashara Vimshottari) */}
          <div className="p-3.5 rounded-lg bg-[#C9A96E]/10 border border-[#C9A96E]/45 text-xs flex items-start gap-3">
            <ArrowRightLeft className="w-5 h-5 text-[#C9A96E] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#C9A96E]">
                ఉభయ దశా సమన్వయం (Double-Lock Confirmation: Jaimini Chara × Parashara Vimshottari):
              </div>
              <p className="text-[#EDE8E0]/90 mt-1 leading-relaxed">
                ఈ <strong>{activeMaha.rasiNameTe} చర మహాదశ</strong> నడిచే కాలంలోనే నక్షత్ర ఆధారిత వింశోత్తరి దశలో{' '}
                <strong className="text-[#5BBFB5]">{activeMaha.overlappingVimshottariTe}</strong> సమకాలీనంగా నడుస్తుంది. రెండు దశా పద్ధతులు ఒకే భావాన్ని లేదా కారకుని సూచించినప్పుడు ఆ సంఘటన 100% నిశ్చయంగా జరుగుతుంది.
              </p>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Rasi Drishti, Argala/Virodhargala & 7 Chara Karakas Table */}
        <div className="lg:col-span-5 space-y-4">
          {/* Jaimini Rasi Drishti & Argala Box */}
          <div className="bg-[#090C18]/95 border border-white/15 rounded-xl p-5 space-y-3 text-xs">
            <h4 className="text-sm font-bold text-[#C9A96E] flex items-center gap-2 border-b border-white/10 pb-2.5">
              <Eye className="w-4 h-4 text-[#C9A96E]" />
              {activeMaha.rasiNameTe} రాశిపై జైమిని రాశి దృష్టి & అర్గళ బలం
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded bg-[#141932] border border-white/10">
                <div className="text-[10px] text-[#EDE8E0]/55">లగ్నం & ఆరూఢ స్థితి:</div>
                <div className="font-bold text-[#EDE8E0] mt-0.5">
                  లగ్నం నుండి {activeMaha.houseFromLagna}వ · AL నుండి {activeMaha.houseFromAL}వ
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#141932] border border-white/10">
                <div className="text-[10px] text-[#EDE8E0]/55">ఉపపాద (UL) & కారాకాంశ (KL):</div>
                <div className="font-bold text-[#5BBFB5] mt-0.5">
                  UL నుండి {activeMaha.houseFromUL}వ · KL నుండి {activeMaha.houseFromKarakamsha}వ
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div>
                <span className="text-[#EDE8E0]/60">రాశిలోని గ్రహాలు / కారకులు: </span>
                <strong className="text-[#C9A96E]">
                  {activeMaha.occupantsTe.length > 0
                    ? activeMaha.occupantsTe.join(', ')
                    : 'గ్రహాలు లేవు (నిర్మల రాశి)'}
                </strong>
              </div>
              <div>
                <span className="text-[#EDE8E0]/60">జైమిని రాశి దృష్టి వేసే రాశులు: </span>
                <span className="text-[#5BBFB5] font-semibold">
                  {activeMaha.rasiDrishtiSignsTe.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-[#EDE8E0]/60">రాశి దృష్టి వేసే గ్రహాలు & కారకులు: </span>
                <strong className="text-[#EDE8E0]">
                  {activeMaha.rasiDrishtiPlanetsAndKarakasTe.length > 0
                    ? activeMaha.rasiDrishtiPlanetsAndKarakasTe.join(' · ')
                    : 'దృష్టి గ్రహాలు లేవు'}
                </strong>
              </div>
              <div className="pt-1 border-t border-white/10">
                <span className="text-[#5BBFB5] font-semibold">శుభ/ధన అర్గళ (2, 4, 11, 5): </span>
                <span className="text-[#EDE8E0]/85">{activeMaha.argalaSummaryTe}</span>
              </div>
              <div>
                <span className="text-[#D47B7B] font-semibold">విరోధార్గళ (12, 10, 3): </span>
                <span className="text-[#EDE8E0]/85">{activeMaha.virodhargalaSummaryTe}</span>
              </div>
            </div>
          </div>

          {/* 7 Jaimini Chara Karakas Compact Reference Table */}
          <div className="bg-[#090C18]/95 border border-white/15 rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-[#5BBFB5] flex items-center gap-2 border-b border-white/10 pb-2.5">
              <Award className="w-4 h-4 text-[#5BBFB5]" />
              జైమిని సప్త చర కారకుల పట్టిక (7 Chara Karakas)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#C9A96E] bg-[#141932]">
                    <th className="py-1.5 px-2">కారకత్వం</th>
                    <th className="py-1.5 px-2">గ్రహం (డిగ్రీ)</th>
                    <th className="py-1.5 px-2">రాశి (D1)</th>
                    <th className="py-1.5 px-2">నవాంశ (D9)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {report.charaKarakas.map((ck) => (
                    <tr key={ck.karakaCode} className="hover:bg-white/5">
                      <td className="py-1.5 px-2 font-bold text-[#C9A96E]">
                        {ck.karakaNameTe}
                      </td>
                      <td className="py-1.5 px-2 font-semibold text-[#EDE8E0]">
                        {ck.planetNameTe}{' '}
                        <span className="font-mono-tabular text-[10px] text-[#EDE8E0]/60">
                          ({ck.degreeDMS})
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-[#5BBFB5] font-semibold">
                        {ck.rasiNameTe}
                      </td>
                      <td className="py-1.5 px-2 text-[#EDE8E0]/85">
                        {ck.navamsaNameTe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* COMPLETE 12-RASI CHARA MAHADASHA SUMMARY TABLE                        */}
      {/* ===================================================================== */}
      <div className="bg-[#090C18]/90 border border-white/15 rounded-xl p-5 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
          <h3 className="text-base font-bold text-[#C9A96E] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
            జైమిని ద్వాదశ రాశి చర మహాదశల పూర్తి పట్టిక (Complete 12-Rasi Chara Dasha Table)
          </h3>
          <span className="text-xs text-[#EDE8E0]/65">
            ఏ వరుసనైనా క్లిక్ చేస్తే ఆ రాశి యొక్క 12 అంతర్దశలు పైన తెరుచుకుంటాయి
          </span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/15 text-[#C9A96E] bg-[#141932]">
              <th className="py-2 px-2.5">క్రమం</th>
              <th className="py-2 px-2.5">చర దశా రాశి</th>
              <th className="py-2 px-2.5">అధిపతి (స్థితి)</th>
              <th className="py-2 px-2.5">గణన క్రమం</th>
              <th className="py-2 px-2.5">వ్యవధి</th>
              <th className="py-2 px-2.5">ప్రారంభం → ముగింపు</th>
              <th className="py-2 px-2.5">వయస్సు</th>
              <th className="py-2 px-2.5">L / AL / UL భావం</th>
              <th className="py-2 px-2.5">సమకాలీన వింశోత్తరి</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visibleMahadashas.map((m) => {
              const globalIdx = report.mahadashas.findIndex(
                (item) =>
                  item.cycleIndex === m.cycleIndex && item.orderIndex === m.orderIndex
              );
              const isRowSel = globalIdx === selectedMahaIdx;
              return (
                <tr
                  key={`${m.cycleIndex}-${m.rasiIndex}`}
                  onClick={() => {
                    setSelectedMahaIdx(globalIdx);
                    setSelectedAntarIdx(0);
                    setSelectedPratIdx(0);
                  }}
                  className={`cursor-pointer transition-colors ${
                    isRowSel
                      ? 'bg-[#C9A96E]/20 font-semibold'
                      : m.isCurrent
                        ? 'bg-[#5BBFB5]/15 font-semibold'
                        : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-2 px-2.5 font-mono-tabular text-[#EDE8E0]/70">
                    {m.cycleIndex === 2 ? `C2-#${m.orderIndex + 1}` : `#${m.orderIndex + 1}`}
                  </td>
                  <td className="py-2 px-2.5 font-bold text-[#EDE8E0]">
                    {m.rasiNameTe}
                    {m.isCurrent && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded bg-[#5BBFB5] text-[#090C18] text-[9px] font-bold">
                        ప్రస్తుతం
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-[#C9A96E]">
                    {m.lordNameTe} ({m.lordRasiNameTe})
                  </td>
                  <td className="py-2 px-2.5 text-[#EDE8E0]/80">{m.countingDirectionTe}</td>
                  <td className="py-2 px-2.5 font-mono-tabular font-bold text-[#5BBFB5]">
                    {m.durationYears} సం.
                  </td>
                  <td className="py-2 px-2.5 font-mono-tabular text-[#EDE8E0]">
                    {m.startDate} → {m.endDate}
                  </td>
                  <td className="py-2 px-2.5 font-mono-tabular text-[#C9A96E]">
                    {m.startAge} – {m.endAge} సం.
                  </td>
                  <td className="py-2 px-2.5 font-mono-tabular text-[#EDE8E0]/85">
                    L:{m.houseFromLagna} · AL:{m.houseFromAL} · UL:{m.houseFromUL}
                  </td>
                  <td className="py-2 px-2.5 text-[#9B8FD4] font-semibold">
                    {m.overlappingVimshottariTe}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
