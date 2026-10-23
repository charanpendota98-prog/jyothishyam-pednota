import React from 'react';
import { ACCURACY } from '../engine/accuracySummary.ts';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import type { CompleteTeluguJathakamReport } from '../engine/teluguJathakam.ts';
import { TELUGU_PLANETS, TELUGU_RASIS } from '../engine/teluguJathakam.ts';
import { GRANTHAS } from '../engine/classicalSources.ts';
import type { CompleteVerificationAndAnalysisReport } from '../engine/jathakaVerifications.ts';
import type { AstroVisionMasterReport } from '../engine/astroVisionAndTransitEngine.ts';
import type { SiddhantaAdvancedAppendicesReport } from '../engine/siddhantaAdvancedAppendices.ts';
import type { UpayaPariharaReport } from '../engine/upayaPariharaEngine.ts';
import type { SampoornaLifeChronicleReport } from '../engine/sampoornaLifeChronicleEngine.ts';
import { computeSampradayaSamanyaya } from '../engine/sampradayaSamanyayaEngine.ts';
import { generateTajikaVarshaphalaReport } from '../engine/tajikaVarshaphalaEngine.ts';
import {
  GRANTHA_PAGE_COUNT,
  GRANTHA_PAGES,
  granthaAnchor,
  granthaPartsTe,
} from '../engine/granthaPageMap.ts';
import { buildGranthaProvenance } from '../engine/granthaProvenanceEngine.ts';
import { computeYogaVichara } from '../engine/yogaVicharaEngine.ts';
import { computeAshtakavargaPhala } from '../engine/ashtakavargaPhalaEngine.ts';
import { computeAvakahada, MAITRI_TE } from '../engine/avakahadaEngine.ts';
import { generateKundaliSookshmaNadiReport } from '../engine/kundaliSookshmaNadiEngine.ts';
import { computeJeevitaVistara } from '../engine/jeevitaVistaraEngine.ts';
import { computeAntardashaPhalaBook } from '../engine/antardashaPhalaBookEngine.ts';
import type { AntardashaPhalaBook } from '../engine/antardashaPhalaBookEngine.ts';
import { computeGrahaSahayaka, AREAS } from '../engine/grahaSahayakaEngine.ts';
import { computeBhavaGrahaVistara } from '../engine/bhavaGrahaVistaraEngine.ts';
import { computeGocharaReport } from '../engine/gocharaVedhaEngine.ts';
import { computeGrahaAvastha } from '../engine/grahaAvasthaEngine.ts';
import { computeDashaGocharaSamanvaya } from '../engine/dashaGocharaSamanvayaEngine.ts';
import {
  buildGranthaPrayoga,
  granthaPrayogaSummaryTe,
  granthaSampradayaNoteTe,
} from '../engine/granthaPrayogaEngine.ts';

interface ClassicalJathakaPdfDocumentProps {
  chart: CompleteChartResult;
  jathakam: CompleteTeluguJathakamReport;
  verificationReport: CompleteVerificationAndAnalysisReport;
  astroVisionReport: AstroVisionMasterReport;
  advancedAppendices: SiddhantaAdvancedAppendicesReport;
  upayaReport: UpayaPariharaReport;
  lifeChronicle: SampoornaLifeChronicleReport;
}

type ClassicalVargaKey =
  | 'd1Sign'
  | 'd9Sign'
  | 'd10Sign'
  | 'd2Sign'
  | 'd3Sign'
  | 'd4Sign'
  | 'd7Sign'
  | 'd12Sign';

/**
 * Pure Classical South Indian 4x4 Box Kundali Table (Maroon & Black Ink on Ivory/White Paper)
 * Layout follows the traditional Telugu peetham printed-jathakam format
 */
const ClassicalSouthIndianChakraBox: React.FC<{
  chart: CompleteChartResult;
  vargaKey: ClassicalVargaKey;
  titleTe: string;
  subtitleTe: string;
  mandiSign?: number;
  gulikaSign?: number;
  compact?: boolean;
}> = ({
  chart,
  vargaKey,
  titleTe,
  subtitleTe,
  mandiSign,
  gulikaSign,
  compact = false,
}) => {
  const ascSign =
    vargaKey === 'd1Sign'
      ? chart.ascendant.signIndex
      : chart.ascendant[vargaKey];

  const getCellContent = (signIdx: number) => {
    const isLagna = ascSign === signIdx;
    const planetsHere = chart.planets.filter((p) => {
      const pSign = vargaKey === 'd1Sign' ? p.signIndex : p[vargaKey];
      return pSign === signIdx;
    });
    const hasMandi = mandiSign === signIdx;
    const hasGulika = gulikaSign === signIdx;
    const rasiShort = TELUGU_RASIS[signIdx]?.nameTe.split(' ')[0] ?? '';

    return (
      <div
        className={`w-full h-full flex flex-col justify-between ${
          compact ? 'p-1 min-h-[52px]' : 'p-1.5 min-h-[72px]'
        } relative ${isLagna ? 'bg-[#FDF4DC]' : 'bg-[#FFFEFA]'}`}
      >
        <div className="flex items-center justify-between text-[9px] leading-none border-b border-[#8B6914]/25 pb-0.5">
          <span className="text-[#6E5528] font-semibold">{rasiShort}</span>
          {isLagna && (
            <span className="px-1 py-0.2 bg-[#7A1818] text-white font-bold text-[8.5px] rounded-[2px]">
              లగ్నం
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 my-auto py-0.5">
          {planetsHere.map((p) => {
            const shortTe = TELUGU_PLANETS[p.id]?.shortTe ?? p.name.slice(0, 2);
            return (
              <span
                key={p.id}
                className={`font-bold ${
                  compact ? 'text-[10.5px]' : 'text-[12px]'
                } leading-tight ${
                  p.id === 'Sun' || p.id === 'Mars'
                    ? 'text-[#8B1A1A]'
                    : p.id === 'Jupiter' || p.id === 'Venus'
                      ? 'text-[#144D3E]'
                      : 'text-[#181412]'
                }`}
              >
                {shortTe}
                {p.isRetrograde && p.id !== 'Rahu' && p.id !== 'Ketu' ? '(వ)' : ''}
              </span>
            );
          })}
          {hasMandi && (
            <span className="text-[10px] font-bold text-[#6E260E] underline">
              మాం
            </span>
          )}
          {hasGulika && (
            <span className="text-[9.5px] font-semibold text-[#5C3A21]">
              (గుళి)
            </span>
          )}
        </div>

        <div className="text-right text-[8px] text-[#8B6914] leading-none">
          {((signIdx - ascSign + 12) % 12) + 1}వ భా.
        </div>
      </div>
    );
  };

  return (
    <div className="border-2 border-[#7A1818] bg-[#FFFEFA] text-[#181412]">
      <div className="grid grid-cols-4 border-collapse">
        {/* Row 1: Pisces (11), Aries (0), Taurus (1), Gemini (2) */}
        <div className="border border-[#8B6914]">{getCellContent(11)}</div>
        <div className="border border-[#8B6914]">{getCellContent(0)}</div>
        <div className="border border-[#8B6914]">{getCellContent(1)}</div>
        <div className="border border-[#8B6914]">{getCellContent(2)}</div>

        {/* Row 2: Aquarius (10), Center 2x2 Box, Cancer (3) */}
        <div className="border border-[#8B6914]">{getCellContent(10)}</div>
        <div className="col-span-2 row-span-2 border-2 border-[#7A1818] bg-[#FBF5E6] flex flex-col items-center justify-center p-2 text-center">
          <div className="text-[9px] text-[#7A1818] font-bold tracking-wider">
            || శ్రీరస్తు - శుభమస్తు ||
          </div>
          <div
            className={`${
              compact ? 'text-xs' : 'text-sm'
            } font-bold text-[#7A1818] mt-0.5`}
          >
            {titleTe}
          </div>
          <div className="text-[9.5px] text-[#4A3B2C] mt-0.5">{subtitleTe}</div>
          <div className="text-[9.5px] font-bold text-[#144D3E] mt-1">
            లగ్నం: {TELUGU_RASIS[ascSign]?.nameTe.split(' ')[0]}
          </div>
        </div>
        <div className="border border-[#8B6914]">{getCellContent(3)}</div>

        {/* Row 3: Capricorn (9), [Center], Leo (4) */}
        <div className="border border-[#8B6914]">{getCellContent(9)}</div>
        <div className="border border-[#8B6914]">{getCellContent(4)}</div>

        {/* Row 4: Sagittarius (8), Scorpio (7), Libra (6), Virgo (5) */}
        <div className="border border-[#8B6914]">{getCellContent(8)}</div>
        <div className="border border-[#8B6914]">{getCellContent(7)}</div>
        <div className="border border-[#8B6914]">{getCellContent(6)}</div>
        <div className="border border-[#8B6914]">{getCellContent(5)}</div>
      </div>
    </div>
  );
};

/**
 * Sripati Bhava Chalita 4x4 Classical Box (shows shifted planets in their true Chalita Bhava)
 */
const ClassicalBhavaChalitaBox: React.FC<{
  chart: CompleteChartResult;
  verificationReport: CompleteVerificationAndAnalysisReport;
}> = ({ chart, verificationReport }) => {
  const ascSign = chart.ascendant.signIndex;

  const getCellContent = (signIdx: number) => {
    const houseNum = ((signIdx - ascSign + 12) % 12) + 1;
    const isLagna = houseNum === 1;
    const row = verificationReport.bhavaChalitaTable.find(
      (b) => b.bhavaNumber === houseNum
    );
    const rasiShort = TELUGU_RASIS[signIdx]?.nameTe.split(' ')[0] ?? '';

    return (
      <div
        className={`w-full h-full flex flex-col justify-between p-1.5 min-h-[68px] relative ${
          isLagna ? 'bg-[#FDF4DC]' : 'bg-[#FFFEFA]'
        }`}
      >
        <div className="flex items-center justify-between text-[9px] leading-none border-b border-[#8B6914]/25 pb-0.5">
          <span className="text-[#6E5528] font-semibold">
            {houseNum}వ భా. ({rasiShort})
          </span>
          {isLagna && (
            <span className="px-1 py-0.2 bg-[#7A1818] text-white font-bold text-[8px] rounded-[2px]">
              లగ్న మధ్యం
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 my-auto py-0.5">
          {row && row.chalitaPlanetsTe.length > 0 ? (
            row.chalitaPlanetsTe.map((pName, i) => (
              <span
                key={`chalita-p-${pName}-${i}`}
                className="font-bold text-[10.5px] text-[#7A1818] leading-tight"
              >
                {pName.split(' ')[0]}
              </span>
            ))
          ) : (
            <span className="text-[9px] text-[#8B6914]/50">—</span>
          )}
        </div>

        <div className="text-right text-[7.5px] text-[#5C3A21] font-mono-tabular leading-none">
          మధ్య: {row?.madhyaDMS.split(' ')[0] ?? ''}
        </div>
      </div>
    );
  };

  return (
    <div className="border-2 border-[#7A1818] bg-[#FFFEFA] text-[#181412]">
      <div className="grid grid-cols-4 border-collapse">
        <div className="border border-[#8B6914]">{getCellContent(11)}</div>
        <div className="border border-[#8B6914]">{getCellContent(0)}</div>
        <div className="border border-[#8B6914]">{getCellContent(1)}</div>
        <div className="border border-[#8B6914]">{getCellContent(2)}</div>

        <div className="border border-[#8B6914]">{getCellContent(10)}</div>
        <div className="col-span-2 row-span-2 border-2 border-[#7A1818] bg-[#FBF5E6] flex flex-col items-center justify-center p-2 text-center">
          <div className="text-[9px] text-[#7A1818] font-bold">
            || శ్రీపతి పద్ధతి ||
          </div>
          <div className="text-xs font-bold text-[#7A1818] mt-0.5">
            భావ చలిత కుండలి (Bhava Chalita)
          </div>
          <div className="text-[9px] text-[#4A3B2C] mt-0.5">
            భావ సంధి & చలిత గ్రహ స్థితి
          </div>
          <div className="text-[9px] font-bold text-[#144D3E] mt-1">
            10వ మధ్యం (MC): {chart.midheaven.formattedDMS}
          </div>
        </div>
        <div className="border border-[#8B6914]">{getCellContent(3)}</div>

        <div className="border border-[#8B6914]">{getCellContent(9)}</div>
        <div className="border border-[#8B6914]">{getCellContent(4)}</div>

        <div className="border border-[#8B6914]">{getCellContent(8)}</div>
        <div className="border border-[#8B6914]">{getCellContent(7)}</div>
        <div className="border border-[#8B6914]">{getCellContent(6)}</div>
        <div className="border border-[#8B6914]">{getCellContent(5)}</div>
      </div>
    </div>
  );
};

/** పుస్తక పుటల సంఖ్య — ఒకే మూలం (PDF హెడర్, UI టెక్స్ట్ రెండూ ఇదే చదువుతాయి) */
export const JATHAKAM_PDF_PAGES = GRANTHA_PAGE_COUNT;


/** 81 భుక్తి ఫలాలు — మూడు పుటలుగా (మహాదశ 3 చొప్పున). */
const BhuktiPhalaPage: React.FC<{
  adBook: AntardashaPhalaBook;
  part: number;
  id: string;
  header: React.ReactNode;
}> = ({ adBook, part, id, header }) => (
  <section id={id} className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
    {header}
    <div className="mb-1.5 text-[9px] text-[#5C3A21] leading-snug">
      {adBook.methodNoteTe} <span className="text-[#7A1818]">{adBook.sourceNoteTe}</span>
    </div>

    {adBook.sections.slice(part * 3, part * 3 + 3).map((sec) => (
      <div key={sec.lord} className="mb-2 border border-[#8B6914]">
        <div className="bg-[#F3E8CE] px-2 py-1 flex flex-wrap items-baseline justify-between gap-1">
          <span className="text-[10px] font-bold text-[#7A1818]">
            {sec.lordTe} మహాదశ — {sec.house}వ భావం · సగటు బలం {sec.scoreAvg}%
          </span>
          <span className="text-[8.5px] font-mono-tabular text-[#5C3A21]">{sec.startLocal} → {sec.endLocal}</span>
        </div>
        <div className="px-2 py-1 text-[8.6px] leading-snug text-justify border-b border-[#8B6914]/40">{sec.summaryTe}</div>
        <table className="w-full border-collapse text-[8.1px] leading-tight">
          <thead>
            <tr className="bg-[#F9F4E8] text-[#5C3A21]">
              <th className="py-0.5 px-1 text-left w-[11%]">భుక్తి</th>
              <th className="py-0.5 px-1 text-left w-[13%]">కాలం</th>
              <th className="py-0.5 px-1 text-left w-[52%]">ఫలం</th>
              <th className="py-0.5 px-1 text-left w-[24%]">జాగ్రత్త · పరిహారం</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/25">
            {sec.rows.map((r, i) => (
              <tr key={`${r.bhuktiLord}-${i}`} className={r.isRunning ? 'bg-[#FDF0D5]' : i % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#FAF6EC]'}>
                <td className="py-[2px] px-1 align-top">
                  <div className="font-semibold text-[#7A1818]">{r.bhuktiLordTe.split(' ')[0]}{r.isRunning ? ' ★' : ''}</div>
                  <div className="text-[7.1px]">{r.relationTe} · {r.dignityTe.split('(')[0]}</div>
                </td>
                <td className="py-[2px] px-1 align-top font-mono-tabular text-[7.4px]">{r.startLocal}<br />{r.endLocal}</td>
                <td className="py-[2px] px-1 align-top">
                  <strong>{r.headlineTe}</strong> {r.phalaTe}
                </td>
                <td className="py-[2px] px-1 align-top text-[7.6px]">
                  <div className="text-[#7A1818]">{r.cautionTe}</div>
                  <div className="text-[#144D3E]">{r.remedyTe}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}
    <div className="text-[8px] text-[#5C3A21] text-right">★ = ప్రస్తుతం నడుస్తున్న భుక్తి · మొత్తం 81 భుక్తులు · {adBook.currentPathTe}</div>
  </section>
);

export const ClassicalJathakaPdfDocument: React.FC<
  ClassicalJathakaPdfDocumentProps
> = ({
  chart,
  jathakam,
  verificationReport,
  astroVisionReport,
  advancedAppendices,
  upayaReport,
  lifeChronicle,
}) => {
  const TOTAL_PAGES = JATHAKAM_PDF_PAGES;
  const currentYear = new Date().getFullYear();
  const varshaphalaReport = React.useMemo(
    () => generateTajikaVarshaphalaReport(chart, currentYear),
    [chart, currentYear]
  );
  const samanyaya = React.useMemo(() => computeSampradayaSamanyaya(chart), [chart]);
  const yogaVichara = React.useMemo(() => computeYogaVichara(chart), [chart]);
  const avPhala = React.useMemo(() => computeAshtakavargaPhala(chart), [chart]);
  const avakahada = React.useMemo(() => computeAvakahada(chart), [chart]);
  const sookshma = React.useMemo(() => generateKundaliSookshmaNadiReport(chart), [chart]);
  const vistara = React.useMemo(() => computeJeevitaVistara(chart), [chart]);
  const adBook = React.useMemo(() => computeAntardashaPhalaBook(chart), [chart]);
  const sahayaka = React.useMemo(() => computeGrahaSahayaka(chart), [chart]);
  const vistaraDeep = React.useMemo(() => computeBhavaGrahaVistara(chart), [chart]);
  const avastha = React.useMemo(() => computeGrahaAvastha(chart), [chart]);
  const samanvaya = React.useMemo(() => computeDashaGocharaSamanvaya(chart), [chart]);
  const granthaPrayoga = React.useMemo(() => buildGranthaPrayoga(chart), [chart]);
  const granthaSampradayaNote = React.useMemo(() => granthaSampradayaNoteTe(chart), [chart]);
  const gochara = React.useMemo(() => {
    const moon = chart.planets.find((p) => p.id === 'Moon');
    return computeGocharaReport(moon?.signIndex ?? 0, Math.floor((moon?.siderealLon ?? 0) / (360 / 27)), {
      tzOffsetHours: chart.input.tzOffsetHours ?? 5.5,
      siderealMode: (chart.input.ayanamsa as never) ?? 'lahiri',
    });
  }, [chart]);
  const mandiObj = advancedAppendices.upagrahas.find((u) => u.id === 'Mandi');
  const gulikaObj = advancedAppendices.upagrahas.find((u) => u.id === 'Gulika');

  const PageHeaderStrip: React.FC<{ pageNum: number; pageTitleTe: string }> = ({
    pageNum,
    pageTitleTe,
  }) => (
    <div className="flex flex-wrap items-center justify-between border-b-2 border-[#7A1818] pb-1.5 mb-3 text-[10.5px] text-[#4A3B2C] gap-2">
      <div className="font-bold text-[#7A1818]">
        శ్రీ సంపూర్ణ దృగ్గణిత తెలుగు జాతక మహాగ్రంథం (దృక్ సిద్ధాంత ప్రమాణం) — {pageTitleTe}
      </div>
      <div className="font-semibold">
        జాతకులు: <strong className="text-[#181412]">{chart.input.name}</strong> ({chart.input.date} · {chart.input.time}) |{' '}
        <span className="font-bold text-[#7A1818] bg-[#FBF0D9] px-1.5 py-0.5 border border-[#8B6914]">
          పుట {pageNum} / {TOTAL_PAGES}
        </span>
      </div>
    </div>
  );

  const saptaIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  // ప్రమాణ పట్టిక — ప్రతి వాక్యానికి ఆధారం (ఇంజిన్ నుంచే, చేతితో కాదు)
  const provenance = buildGranthaProvenance(chart);

  return (
    <div className="classical-grantha-root space-y-8 text-[#181412] font-serif">
      {/* ===================================================================== */}
      {/* PAGE 1: MUKHAPATRAM, SWASTISRI PROCLAMATION, PANCHANGA, D1 & D9, SPHUTAS */}
      {/* ===================================================================== */}
      <section id="grantha-p1" className="classical-grantha-page bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl print-avoid-break">
        <PageHeaderStrip
          pageNum={1}
          pageTitleTe="ముఖపత్రం, పంచాంగం, రాశి-నవాంశ చక్రాలు & నిరయన గ్రహ స్ఫుటములు"
        />

        {/* Sacred Mangala Shloka Header */}
        <div className="text-center border-b-2 border-[#7A1818] pb-2.5 mb-3.5 bg-[#FBF6E9] p-2.5 border border-[#8B6914]">
          <div className="text-[11px] font-bold text-[#7A1818] tracking-widest">
            || శ్రీ గణాధిపతయే నమః · శ్రీ సరస్వత్యై నమః · శ్రీ గురుభ్యో నమః · శ్రీ వేంకటేశ్వరాయ నమః · అవిఘ్నమస్తు ||
          </div>
          <div className="text-[10.5px] text-[#5C3A21] italic mt-0.5">
            &ldquo;ఆదిత్యాయ చ సోమాయ మంగళాయ బుధాయ చ | గురు శుక్ర శనిభ్యశ్చ రాహవే కేతవే నమః ||&rdquo;
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#7A1818] mt-1 tracking-tight">
            శ్రీ సంపూర్ణ దృగ్గణిత జాతక మహాగ్రంథం ({JATHAKAM_PDF_PAGES} పుటలు · దృక్ సిద్ధాంత ప్రమాణం)
          </h1>
          <div className="text-[10.5px] text-[#4A3B2C] font-semibold mt-0.5">
            చిత్రపక్ష (లహిరి) అయనాంశం: {chart.ayanamsaFormatted} · కలియుగ శాలివాహన శక దృగ్గణిత పద్ధతి · జూలియన్ దినం: {chart.julianDay.toFixed(4)}
          </div>
        </div>

        {/* SwastiSri Formal Horoscope Proclamation Box */}
        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2.5 mb-3.5 text-[11px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">స్వస్తిశ్రీ జన్మపత్రికా వాక్య ప్రమాణము: </strong>
          {advancedAppendices.swastiSriProclamationTe}
        </div>

        {/* Two-Column Master Panchanga & Janma Vivaralu Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
          <table className="w-full border-collapse border border-[#8B6914] text-[10.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th colSpan={2} className="py-1 px-2.5 text-left font-bold">
                  1. జన్మ వివరములు & పంచాంగ అంగములు (Birth & Panchanga Details)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B6914]/40">
              <tr className="bg-[#FFFEFA]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] w-2/5 border-r border-[#8B6914]/40">
                  జాతకుని పేరు & లింగం
                </td>
                <td className="py-1 px-2 font-bold text-[#7A1818]">
                  {chart.input.name} ({(chart.input.gender ?? 'male') === 'female' ? 'స్త్రీ / అమ్మాయి' : 'పురుషుడు / అబ్బాయి'})
                </td>
              </tr>
              <tr className="bg-[#F9F4E8]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  జన్మ తేదీ & సమయం (ఇష్టఘడియలు)
                </td>
                <td className="py-1 px-2 font-bold">
                  {chart.input.date} · {chart.input.time} ({jathakam.udayadiIshtaGhatikaluTe})
                </td>
              </tr>
              <tr className="bg-[#FFFEFA]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  జన్మ స్థలం (అక్షాంశ-రేఖాంశాలు)
                </td>
                <td className="py-1 px-2">
                  {chart.input.city} ({chart.input.lat.toFixed(2)}°N, {chart.input.lng.toFixed(2)}°E)
                </td>
              </tr>
              <tr className="bg-[#F9F4E8]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  తెలుగు సంవత్సరం, ఆయనం, ఋతువు
                </td>
                <td className="py-1 px-2 font-semibold">
                  {jathakam.samvatsaramTe} · {jathakam.ayanamTe.split(' (')[0]} · {jathakam.rituvuTe.split(' (')[0]}
                </td>
              </tr>
              <tr className="bg-[#FFFEFA]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  మాసం, పక్షం & తిథి
                </td>
                <td className="py-1 px-2">
                  {jathakam.masamTe.split(' (')[0]} · {jathakam.pakshamTe.split(' (')[0]} · <strong>{jathakam.tithiTe.split(' (')[0]}</strong>
                </td>
              </tr>
              <tr className="bg-[#F9F4E8]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  వాసరం (వారం), యోగం & కరణం
                </td>
                <td className="py-1 px-2">
                  {jathakam.vasaramTe} · {jathakam.yogamTe.split(' (')[0]} · {jathakam.karanamTe.split(' (')[0]}
                </td>
              </tr>
              <tr className="bg-[#FFFEFA]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  సూర్యోదయం – సూర్యాస్తమయం
                </td>
                <td className="py-1 px-2 font-mono-tabular">
                  {jathakam.suryodayamTe} – {jathakam.suryastamayamTe} (దినమానం: {jathakam.dinamanamTe})
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-[#8B6914] text-[10.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th colSpan={2} className="py-1 px-2.5 text-left font-bold">
                  2. ముఖ్య జాతక సూచికలు (Horoscope Key Signatures)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B6914]/40">
              <tr className="bg-[#FFFEFA]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] w-2/5 border-r border-[#8B6914]/40">
                  జన్మ రాశి (చంద్ర రాశి) & అధిపతి
                </td>
                <td className="py-1 px-2 font-bold text-[#7A1818]">
                  {jathakam.janmaRasiTe} (అధిపతి: {jathakam.janmaRasiAdhipatiTe})
                </td>
              </tr>
              <tr className="bg-[#F9F4E8]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  జన్మ నక్షత్రం, పాదం & నామాక్షరం
                </td>
                <td className="py-1 px-2 font-bold text-[#144D3E]">
                  {jathakam.janmaNakshatramTe} — {jathakam.janmaPadam}వ పాదం (అక్షరం: &ldquo;{jathakam.namaAksharamTe}&rdquo; | {jathakam.allFourPadaAksharaluTe})
                </td>
              </tr>
              <tr className="bg-[#FFFEFA]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  జన్మ లగ్నం, నవాంశ & దశాంశ లగ్నం
                </td>
                <td className="py-1 px-2 font-bold">
                  {jathakam.janmaLagnamTe} · D9: {jathakam.navamsaLagnamTe.split(' ')[0]} · D10: {jathakam.dasamsaLagnamTe.split(' ')[0]}
                </td>
              </tr>
              <tr className="bg-[#F9F4E8]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  గణం, యోని, నాడి & రజ్జువు
                </td>
                <td className="py-1 px-2">
                  {jathakam.ganaTe.split(' (')[0]} · {jathakam.yoniTe.split(' (')[0]} · {jathakam.nadiTe.split(' (')[0]} · {jathakam.rajjuTe.split(' (')[0]}
                </td>
              </tr>
              <tr className="bg-[#FFFEFA]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  జన్మకాల వింశోత్తరి దశా శేషం
                </td>
                <td className="py-1 px-2 font-bold text-[#7A1818]">
                  {jathakam.dashaBalanceAtBirthTe}
                </td>
              </tr>
              <tr className="bg-[#F9F4E8]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  మాంది (Mandi) & గుళిక (Gulika)
                </td>
                <td className="py-1 px-2 font-semibold">
                  మాంది: {mandiObj?.rasiNameTe} ({mandiObj?.degreeInSignFormatted}) · గుళిక: {gulikaObj?.rasiNameTe} ({gulikaObj?.degreeInSignFormatted})
                </td>
              </tr>
              <tr className="bg-[#FFFEFA]">
                <td className="py-1 px-2 font-semibold text-[#5C3A21] border-r border-[#8B6914]/40">
                  ఆత్మకారకుడు (AK) & ఆరూఢ లగ్నం (AL)
                </td>
                <td className="py-1 px-2 font-semibold">
                  AK: {jathakam.jaiminiKarakas[0]?.planetNameTe} · AL: {jathakam.arudhaPadas[0]?.rasiNameTe.split(' ')[0]} · UL: {jathakam.arudhaPadas[1]?.rasiNameTe.split(' ')[0]}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Side-by-Side Classical South Indian Rasi (D1) & Navamsa (D9) Chakras with Mandi & Gulika */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3.5">
          <ClassicalSouthIndianChakraBox
            chart={chart}
            vargaKey="d1Sign"
            titleTe="రాశి చక్రం (D1 Rasi Kundali)"
            subtitleTe="నవగ్రహములు + మాంది (మాం) & గుళిక (గుళి)"
            mandiSign={mandiObj?.rasiIndex}
            gulikaSign={gulikaObj?.rasiIndex}
          />
          <ClassicalSouthIndianChakraBox
            chart={chart}
            vargaKey="d9Sign"
            titleTe="నవాంశ చక్రం (D9 Navamsa Kundali)"
            subtitleTe="ధర్మ, కళత్ర & గ్రహ అంతర్బల చక్రం"
            mandiSign={mandiObj?.navamsaIndex}
            gulikaSign={gulikaObj?.navamsaIndex}
          />
        </div>

        {/* Complete Nirayana Graha & Upagraha Sphuta Table (with KP Sub-Lord) */}
        <table className="w-full border-collapse border border-[#8B6914] text-[10px]">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-1 px-2 text-left border border-[#8B6914]">గ్రహం / ప్రమాణం</th>
              <th className="py-1 px-2 text-left border border-[#8B6914]">నిరయన స్ఫుటం (DMS)</th>
              <th className="py-1 px-2 text-left border border-[#8B6914]">రాశి (D1) & డిగ్రీ</th>
              <th className="py-1 px-2 text-left border border-[#8B6914]">నక్షత్రం (పాదం)</th>
              <th className="py-1 px-2 text-left border border-[#8B6914]">నక్షత్రాధిపతి</th>
              <th className="py-1 px-2 text-left border border-[#8B6914]">KP సబ్-లార్డ్ / సబ్-సబ్</th>
              <th className="py-1 px-2 text-left border border-[#8B6914]">రాశ్యాధిపతి</th>
              <th className="py-1 px-2 text-left border border-[#8B6914]">భావం & గమన స్థితి</th>
            </tr>
          </thead>
          <tbody>
            {astroVisionReport.nirayanaSphutaTable.map((row, idx) => (
              <tr
                key={row.bodyId}
                className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}
              >
                <td className="py-1 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                  {row.glyph} {row.bodyNameTe}
                </td>
                <td className="py-1 px-2 border border-[#8B6914]/50 font-mono-tabular">
                  {row.absoluteSiderealDMS}
                </td>
                <td className="py-1 px-2 border border-[#8B6914]/50 font-semibold">
                  {row.rasiNameTe} ({row.degreeInSignDMS})
                </td>
                <td className="py-1 px-2 border border-[#8B6914]/50 font-semibold text-[#144D3E]">
                  {row.nakshatraNameTe} ({row.pada}వ పా.)
                </td>
                <td className="py-1 px-2 border border-[#8B6914]/50">
                  {row.nakshatraLordTe}
                </td>
                <td className="py-1 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                  {row.subLordTe} / {row.subSubLordTe}
                </td>
                <td className="py-1 px-2 border border-[#8B6914]/50">
                  {row.rasiLordTe}
                </td>
                <td className="py-1 px-2 border border-[#8B6914]/50">
                  {row.houseNumber > 0 ? `${row.houseNumber}వ భా.` : '1వ భా.'} · {row.motionStatusTe}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* రాహు పాత సంప్రదాయం — మధ్యమ (పంచాంగం) మరియు సత్య (ఆస్కులేటింగ్) రెండూ */}
        <div className="mt-2 border-t border-[#8B6914]/40 pt-1.5 text-[9.5px] leading-snug text-[#5C3A21]">
          <strong className="text-[#7A1818]">రాహు పాత సంప్రదాయం:</strong>{' '}
          ఈ గ్రంథం మధ్యమ రాహును (తెలుగు పంచాంగ పత్రికల ముద్రిత జాతక ప్రమాణం) వాడుతుంది —
          మధ్యమ రాహు{' '}
          <span className="font-semibold">
            {TELUGU_RASIS[Math.floor(chart.nodeSphuta.meanSiderealLon / 30)]?.nameTe.split(' ')[0]}{' '}
            {(chart.nodeSphuta.meanSiderealLon % 30).toFixed(2)}°
          </span>
          , సత్య రాహు{' '}
          <span className="font-semibold">
            {TELUGU_RASIS[Math.floor(chart.nodeSphuta.trueSiderealLon / 30)]?.nameTe.split(' ')[0]}{' '}
            {(chart.nodeSphuta.trueSiderealLon % 30).toFixed(2)}°
          </span>{' '}
          (భేదం {chart.nodeSphuta.differenceDeg.toFixed(2)}°). కేతువు ఎల్లప్పుడూ రాహువుకు సరిగ్గా 180° ఎదురుగా.
        </div>
      </section>

      {/* ===================================================================== */}
      {/* ===================================================================== */}
      {/* PAGE 2: విషయ సూచిక — గ్రంథ పుట చిట్టా (granthaPageMap) నుంచే          */}
      {/* ===================================================================== */}
      <section id="grantha-p2" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={2} pageTitleTe="విషయ సూచిక (Table of Contents)" />

        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2.5 mb-3 text-[10px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">ఈ గ్రంథాన్ని ఎలా చదవాలి: </strong>
          మొదటి పుటలో మూల కుండలి (D1 · D9 · స్ఫుటాలు · పంచాంగం). తర్వాత భావ చలితం, షోడశవర్గాలు,
          <strong> గ్రహ అవస్థలు</strong> (బాలాది · దీప్తాది · జాగ్రదాది · గ్రహ యుద్ధం · అస్తంగతం), షడ్బలం, అష్టకవర్గం,
          కాల చక్రం (81 భుక్తులు), నవగ్రహ-ద్వాదశ భావ విచారాలు, యోగ-దోష పరిశీలన, పరిహారాలు,
          <strong> దశా × గోచార సమన్వయం</strong> (రాబోయే 12 నెలలు · ప్రత్యంతర దశలు), <strong>గోచార ఫలం</strong>
          (సాడే సాతి · వేధ), చివరగా గ్రంథ మండలం (మూల గ్రంథాలు) మరియు గణన పద్ధతి.
          ఏ అంశాన్ని ఎక్కడ వెతకాలో క్రింది సూచిక చెబుతుంది.
        </div>

        <div className="space-y-2.5">
          {granthaPartsTe().map((part) => (
            <div key={part.partTe}>
              <div className="text-[9.5px] font-bold text-[#7A1818] tracking-wide border-b border-[#8B6914]/60 pb-0.5 mb-1">
                {part.partTe}
              </div>
              <ol className="space-y-[3px]">
                {part.pages.map((pg) => (
                  <li key={pg.id} className="flex items-baseline gap-1 text-[10.5px] leading-snug">
                    <a href={`#${pg.id}`} className="text-[#181412] hover:text-[#7A1818]">
                      {pg.titleTe}
                    </a>
                    <span className="flex-1 border-b border-dotted border-[#8B6914]/60" />
                    <span className="font-mono font-bold text-[#7A1818] w-6 text-right">{pg.num}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-[#8B6914] pt-1.5 text-[8.5px] text-[#5C3A21] leading-relaxed">
          <strong className="text-[#7A1818]">పుటలు: </strong>
          మొత్తం {TOTAL_PAGES} పుటలు, {granthaPartsTe().length} భాగాలు. ప్రతి పుట శీర్షికపై “పుట n / {TOTAL_PAGES}”
          ఉంటుంది; ఈ సూచికలోని నంబర్లే ముద్రిత పుటల నంబర్లు. ఏ భాగాన్ని ముందు చదవాలో —
          ముందుగా మూల కుండలి, తర్వాత బలం, ఆ పైన ఫలం; తొందర ఉంటే గ్రహాలు, భావాలు, దశలు మూడు చాలు.
        </div>
      </section>

      {/* PAGE 2: SRIPATI BHAVA CHALITA TABLE & KUNDALI, ALL 11 UPAGRAHAS & PANCHADHA MAITRI */}
      {/* ===================================================================== */}
      <section id="grantha-p3" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={3}
          pageTitleTe="శ్రీపతి భావ చలిత పట్టిక, భావ చలిత కుండలి, 11 ఉపగ్రహ స్ఫుటములు & పంచధా మైత్రి"
        />

        {/* Top Split: Bhava Chalita Kundali + Sripati 12 Bhava Cusps Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-3.5 items-start">
          <div className="lg:col-span-5">
            <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
              3. శ్రీపతి భావ చలిత కుండలి (Chalita Chakra)
            </h3>
            <ClassicalBhavaChalitaBox
              chart={chart}
              verificationReport={verificationReport}
            />
            <div className="mt-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[9.5px] leading-snug">
              <strong className="text-[#7A1818]">లగ్న శాస్త్ర ప్రమాణం ({jathakam.lagnaShastraPramanam.lagnaNameTe}): </strong>
              యోగకారకులు: <strong>{jathakam.lagnaShastraPramanam.yogakarakaGrahaTe}</strong> · శుభులు: {jathakam.lagnaShastraPramanam.shubhaGrahaluTe} · పాపులు: {jathakam.lagnaShastraPramanam.papaGrahaluTe} · బాధక స్థానం: {jathakam.lagnaShastraPramanam.badhakaSthanamTe} ({jathakam.lagnaShastraPramanam.badhakadhipatiTe}).
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
              4. శ్రీపతి ద్వాదశ భావ స్ఫుట పట్టిక (12 Bhava Arambha - Madhya - Antya Cusps)
            </h3>
            <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
              <thead>
                <tr className="bg-[#7A1818] text-white">
                  <th className="py-1 px-1.5 text-left border border-[#8B6914]">భావం</th>
                  <th className="py-1 px-1.5 text-left border border-[#8B6914]">భావ ఆరంభం</th>
                  <th className="py-1 px-1.5 text-left border border-[#8B6914]">భావ మధ్యం (Cusp)</th>
                  <th className="py-1 px-1.5 text-left border border-[#8B6914]">భావ అంత్యం</th>
                  <th className="py-1 px-1.5 text-left border border-[#8B6914]">చలిత గ్రహాలు & మార్పు</th>
                </tr>
              </thead>
              <tbody>
                {verificationReport.bhavaChalitaTable.map((bc, idx) => (
                  <tr
                    key={bc.bhavaNumber}
                    className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}
                  >
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                      {bc.bhavaNumber}. {bc.bhavaNameTe.split(' (')[0]} ({bc.madhyaRasiTe.split(' ')[0]})
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-mono-tabular">
                      {bc.arambhaDMS}
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-mono-tabular font-bold text-[#144D3E]">
                      {bc.madhyaDMS}
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-mono-tabular">
                      {bc.antyaDMS}
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50">
                      {bc.chalitaPlanetsTe.length > 0
                        ? bc.chalitaPlanetsTe.map((p) => p.split(' ')[0]).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All 11 Upagrahas Table */}
        <div className="mb-3.5">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            5. ఏకాదశ ఉపగ్రహ & అప్రకాశా గ్రహ స్ఫుట పట్టిక (All 11 Upagrahas: Mandi, Gulika, Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu, Kala, Mrityu, Ardhaprahara, Yamaghantaka)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914]">ఉపగ్రహం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">స్ఫుటం (DMS)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">రాశి (D1) & డిగ్రీ</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">నవాంశ (D9)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">నక్షత్రం (పాదం)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">భావం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">గణిత సూత్రం & శాస్త్ర ఫలితం</th>
              </tr>
            </thead>
            <tbody>
              {advancedAppendices.upagrahas.map((u, idx) => (
                <tr key={u.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {u.nameTe}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-mono-tabular">
                    {u.formattedDMS}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-semibold">
                    {u.rasiNameTe} ({u.degreeInSignFormatted})
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50">
                    {u.navamsaNameTe}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 text-[#144D3E] font-semibold">
                    {u.nakshatraNameTe} ({u.pada})
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-bold">
                    {u.houseFromLagna}వ భావం
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50">
                    <strong>{u.formulaTe}:</strong> {u.phalaTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panchadha Maitri 7x7 Matrix */}
        <div>
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            6. పంచధా మైత్రి చక్రం (Naisargika + Tatkalika = 5-Fold Planetary Compound Friendship Matrix)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914]">గ్రహం (స్థిత రాశి)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">రాశ్యాధిపతితో మైత్రి</th>
                {saptaIds.map((pid) => (
                  <th key={pid} className="py-1 px-1.5 text-center border border-[#8B6914]">
                    {TELUGU_PLANETS[pid]?.shortTe}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {verificationReport.panchadhaMaitriMatrix.map((pm, idx) => (
                <tr key={pm.planetId} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {pm.planetNameTe.split(' ')[0]} ({pm.placedRasiTe.split(' ')[0]})
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-semibold text-[#144D3E]">
                    {pm.rasiLordTe.split(' ')[0]}: {pm.panchadhaWithLordTe.split(' (')[0]}
                  </td>
                  {saptaIds.map((targetId) => {
                    const rel = pm.relationsByPlanet[targetId] ?? '—';
                    return (
                      <td
                        key={targetId}
                        className={`py-0.5 px-1.5 border border-[#8B6914]/50 text-center ${
                          rel.includes('అధిమిత్ర') || rel === 'మిత్ర'
                            ? 'text-[#144D3E] font-bold'
                            : rel.includes('శత్రు')
                              ? 'text-[#8B1A1A]'
                              : ''
                        }`}
                      >
                        {rel}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 3: 6 DIVISIONAL VARGA KUNDALIS (D2, D3, D4, D7, D10, D12) & VAISHESHIKAMSA */}
      {/* ===================================================================== */}
      <section id="grantha-p4" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={4}
          pageTitleTe="షోడశవర్గ చక్ర మాలిక (D2, D3, D4, D7, D10, D12), షోడశవర్గ పట్టిక & వైశేషికాంశ బలం"
        />

        {/* 6 Divisional Varga Kundalis Grid */}
        <div className="mb-3.5">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            7. షడ్వర్గ / దశవర్గ కుండలి మాలిక (D10 దశాంశ, D2 హోరా, D3 ద్రేక్కాణ, D4 చతుర్థాంశ, D7 సప్తాంశ, D12 ద్వాదశాంశ)
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
            <ClassicalSouthIndianChakraBox
              chart={chart}
              vargaKey="d10Sign"
              titleTe="దశాంశ చక్రం (D10)"
              subtitleTe="ఉద్యోగం, వృత్తి & రాజయోగం"
              compact
            />
            <ClassicalSouthIndianChakraBox
              chart={chart}
              vargaKey="d2Sign"
              titleTe="హోరా చక్రం (D2)"
              subtitleTe="ధన సంపద & కుటుంబ బలం"
              compact
            />
            <ClassicalSouthIndianChakraBox
              chart={chart}
              vargaKey="d3Sign"
              titleTe="ద్రేక్కాణ చక్రం (D3)"
              subtitleTe="సహోదర & పరాక్రమ బలం"
              compact
            />
            <ClassicalSouthIndianChakraBox
              chart={chart}
              vargaKey="d4Sign"
              titleTe="చతుర్థాంశ (D4)"
              subtitleTe="భూమి, గృహ & స్థిరాస్తులు"
              compact
            />
            <ClassicalSouthIndianChakraBox
              chart={chart}
              vargaKey="d7Sign"
              titleTe="సప్తాంశ చక్రం (D7)"
              subtitleTe="సంతానం & వంశ వృద్ధి"
              compact
            />
            <ClassicalSouthIndianChakraBox
              chart={chart}
              vargaKey="d12Sign"
              titleTe="ద్వాదశాంశ (D12)"
              subtitleTe="తల్లిదండ్రుల సుకృతం & వంశం"
              compact
            />
          </div>
        </div>

        {/* Complete 10-Varga Summary Table */}
        <div className="mb-3.5">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            8. దశవర్గ రాశి స్థితి పట్టిక (D1 నుండి D60 వరకు గ్రహాల వర్గ రాశులు)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">గ్రహం</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D1 రాశి</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D2 హోరా</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D3 ద్రేక్కాణ</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D4 తుర్యాంశ</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D7 సప్తాంశ</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D9 నవాంశ</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D10 దశాంశ</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D12 ద్వాదశాంశ</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D30 త్రింశాంశ</th>
                <th className="py-1 px-1 text-left border border-[#8B6914]">D60 షష్ట్యంశ</th>
              </tr>
            </thead>
            <tbody>
              {jathakam.shodashavargaTable.map((sv, idx) => (
                <tr key={sv.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {sv.nameTe.split(' ')[0]} {sv.vargottama ? '★' : ''}
                  </td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50 font-semibold">{sv.d1Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50">{sv.d2Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50">{sv.d3Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50">{sv.d4Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50">{sv.d7Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50 font-bold text-[#144D3E]">{sv.d9Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50 font-semibold">{sv.d10Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50">{sv.d12Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50">{sv.d30Te.split(' ')[0]}</td>
                  <td className="py-0.5 px-1 border border-[#8B6914]/50">{sv.d60Te.split(' ')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dasavarga Vaisheshikamsa & Pushkara Navamsa Table */}
        <div>
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            9. దశవర్గ వైశేషికాంశ బలం, వింశోపక బలం (/20) & పుష్కర నవాంశ / పుష్కర భాగ పట్టిక
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914]">గ్రహం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">స్వ/ఉచ్చ వర్గాలు</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">వైశేషికాంశ స్థాయి (Amsa Dignity)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">వింశోపక బలం (/20)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">వర్గోత్తమ / పుష్కర నవాంశ స్థితి</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">శాస్త్ర ఫలితం</th>
              </tr>
            </thead>
            <tbody>
              {advancedAppendices.vaisheshikamsaTable.map((v, idx) => (
                <tr key={v.planetId} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {v.planetNameTe}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-mono-tabular">
                    {v.dignifiedVargasCount} ({v.dignifiedVargaCodes.join(', ') || 'సాధారణ'})
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-bold text-[#144D3E]">
                    {v.amsaTitleTe}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-mono-tabular font-bold">
                    {v.vimshopakaScore} / 20 ({v.vimshopakaPercent}%)
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-semibold">
                    {v.pushkaraNoteTe}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50">
                    {v.phalaTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 4: SHADBALA, ISHTA/KASHTA PHALA, 12-HOUSE BHAVA BALA & AVASTHAS */}
      {/* ===================================================================== */}
      <section id="grantha-p5" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={5}
          pageTitleTe="షడ్బల పిండం, ఇష్ట-కష్ట ఫలములు, ద్వాదశ భావ బలం & త్రివిధ గ్రహావస్థలు"
        />

        {/* Table 4A: Shadbala + Ishta Phala & Kashta Phala Merged Table */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            10. సప్తగ్రహ షడ్బల పిండం మరియు ఇష్ట ఫల - కష్ట ఫల పట్టిక (Shadbala & Ishta-Kashta Phala in Shashtiamsas)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[10px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">గ్రహం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">స్థాన బలం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">దిగ్బలం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">కాల బలం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">చేష్టా బలం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">మొత్తం రూపాలు</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">ఉచ్చ బలం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">ఇష్ట ఫలం (/60)</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">కష్ట ఫలం (/60)</th>
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">దశా ఫల నిర్ణయం</th>
              </tr>
            </thead>
            <tbody>
              {jathakam.shadbalaTableTe.map((sb, idx) => {
                const ik = advancedAppendices.ishtaKashtaTable.find(
                  (r) => r.planetId === sb.id
                );
                return (
                  <tr key={sb.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                      {sb.nameTe}
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular">
                      {sb.sthanaBala.toFixed(1)}
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular">
                      {sb.digBala.toFixed(1)}
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular">
                      {sb.kalaBala.toFixed(1)}
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular">
                      {sb.cheshtaBala.toFixed(1)}
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular font-bold">
                      {sb.totalRupas} ({sb.ratioPercent}%)
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular">
                      {ik?.uchchaBala ?? 30}
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular font-bold text-[#144D3E]">
                      {ik?.ishtaPhala ?? 30}
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular font-bold text-[#8B1A1A]">
                      {ik?.kashtaPhala ?? 30}
                    </td>
                    <td className="py-1 px-1.5 border border-[#8B6914]/50 text-[9.5px]">
                      {ik?.dashaVerdictTe}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table 4B: Dwadasha Bhava Bala (12 Houses Strength & Kartari Table) */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            11. ద్వాదశ భావ బల పట్టిక & కర్తరి యోగ స్థితి (12-House Bhava Bala in Virupas & Rupas)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[10px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914]">భావం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">రాశి & భావాధిపతి</th>
                <th className="py-1 px-2 text-right border border-[#8B6914]">భావాధిపతి బలం</th>
                <th className="py-1 px-2 text-right border border-[#8B6914]">భావ దిగ్బలం</th>
                <th className="py-1 px-2 text-right border border-[#8B6914]">భావ దృష్టి బలం</th>
                <th className="py-1 px-2 text-right border border-[#8B6914]">మొత్తం విరూపాలు (రూపాలు)</th>
                <th className="py-1 px-2 text-center border border-[#8B6914]">ర్యాంక్</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">శుభ/పాప కర్తరి & భావ స్థితి</th>
              </tr>
            </thead>
            <tbody>
              {advancedAppendices.bhavaBalaTable.map((bb, idx) => (
                <tr key={bb.houseNumber} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-1 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {bb.bhavaNameTe}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 font-semibold">
                    {bb.rasiNameTe} ({bb.lordNameTe.split(' ')[0]})
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 text-right font-mono-tabular">
                    {bb.bhavadhipatiBala}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 text-right font-mono-tabular">
                    {bb.bhavaDigbala}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 text-right font-mono-tabular">
                    {bb.bhavaDrishtiBala}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 text-right font-mono-tabular font-bold text-[#144D3E]">
                    {bb.totalVirupas} ({bb.totalRupas} రూ.)
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 text-center font-mono-tabular font-bold">
                    #{bb.rank}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50">
                    {bb.kartariStatusTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 4C: Tri-Vidha Graha Avasthas */}
        <div>
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            12. త్రివిధ గ్రహావస్థలు (Baladi, Jagradadi & Deeptadi Avasthas)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[10px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914]">గ్రహం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">బాలాది అవస్థ (ఫల శాతం)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">జాగ్రదాది అవస్థ</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">దీప్తాది అవస్థ</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">అవస్థా ఫలిత సారాంశం</th>
              </tr>
            </thead>
            <tbody>
              {verificationReport.triVidhaAvasthas.map((av, idx) => (
                <tr key={av.planetId} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-1 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {av.planetNameTe}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 font-semibold">
                    {av.baladiAvasthaTe} ({av.baladiStrengthPct}%)
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50">
                    {av.jagradadiAvasthaTe}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 font-bold text-[#144D3E]">
                    {av.deeptadiAvasthaTe}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50">
                    {av.overallEffectTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 5: BHINNASHTAKAVARGA 7×12 MATRIX, SHODHYA PINDA & SUDARSHANA CHAKRA */}
      {/* ===================================================================== */}
      <section id="grantha-p6" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={6}
          pageTitleTe="భిన్నాష్టకవర్గ, సర్వాష్టకవర్గ, శోధ్య పిండ సాధన & సుదర్శన చక్ర సమన్వయం"
        />

        {/* Table 5A: Complete Bhinnashtakavarga 7×12 + Sarvashtakavarga + Shodhya Pinda */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            13. భిన్నాష్టకవర్గ & సర్వాష్టకవర్గ బిందు పట్టిక + త్రికోణ/ఏకాధిపత్య శోధన & శోధ్య పిండములు
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[10px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">గ్రహం</th>
                {TELUGU_RASIS.map((r) => (
                  <th key={r.index} className="py-1 px-1 text-center border border-[#8B6914]">
                    {r.nameTe.slice(0, 2)}
                  </th>
                ))}
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">మొత్తం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">రాశి పిండం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">గ్రహ పిండం</th>
                <th className="py-1 px-1.5 text-right border border-[#8B6914]">శోధ్య పిండం</th>
              </tr>
            </thead>
            <tbody>
              {advancedAppendices.ashtakavargaShodhana.map((row, idx) => (
                <tr key={row.planetId} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-1 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {row.planetNameTe.split(' ')[0]}
                  </td>
                  {row.bavBySign.map((b, sIdx) => (
                    <td
                      key={sIdx}
                      className={`py-1 px-1 border border-[#8B6914]/50 text-center font-mono-tabular ${
                        b >= 5 ? 'font-bold text-[#144D3E]' : b <= 2 ? 'text-[#8B1A1A]' : ''
                      }`}
                    >
                      {b}
                    </td>
                  ))}
                  <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular font-bold">
                    {row.totalRawBindus}
                  </td>
                  <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular">
                    {row.rasiPinda}
                  </td>
                  <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular">
                    {row.grahaPinda}
                  </td>
                  <td className="py-1 px-1.5 border border-[#8B6914]/50 text-right font-mono-tabular font-bold text-[#7A1818]">
                    {row.shodhyaPinda}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#FBF0D9] font-bold">
                <td className="py-1.5 px-1.5 border border-[#8B6914] text-[#7A1818]">
                  సర్వాష్టకవర్గ (SAV)
                </td>
                {advancedAppendices.sarvashtakavargaBySign.map((sv, sIdx) => (
                  <td
                    key={sIdx}
                    className={`py-1.5 px-1 border border-[#8B6914] text-center font-mono-tabular ${
                      sv >= 30 ? 'text-[#144D3E]' : sv < 25 ? 'text-[#8B1A1A]' : 'text-[#181412]'
                    }`}
                  >
                    {sv}
                  </td>
                ))}
                <td className="py-1.5 px-1.5 border border-[#8B6914] text-right font-mono-tabular text-[#7A1818]">
                  {chart.ashtakavarga.totalBindus}
                </td>
                <td colSpan={3} className="py-1.5 px-1.5 border border-[#8B6914] text-center text-[9.5px] text-[#144D3E]">
                  28+ బిందువులు గల రాశులలో శుభ ఫలితాలు
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table 5B: Sudarshana Chakra 3-Fold Synthesis (Lagna, Chandra, Surya Kundali) */}
        <div>
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            14. మహర్షి పరాశర సుదర్శన చక్ర త్రి-కోణ సమన్వయ పట్టిక (Lagna - Chandra - Surya 12-House Synthesis)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[10px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914]">భావం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">లగ్న చక్రం నుండి (రాశి & గ్రహాలు)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">చంద్ర లగ్నం నుండి (రాశి & గ్రహాలు)</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">సూర్య లగ్నం నుండి (రాశి & గ్రహాలు)</th>
                <th className="py-1 px-2 text-right border border-[#8B6914]">త్రి-చక్ర బలం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">సుదర్శన సమన్వయ ఫలితం</th>
              </tr>
            </thead>
            <tbody>
              {advancedAppendices.sudarshanaTable.map((sr, idx) => (
                <tr key={sr.houseNumber} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-1 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {sr.bhavaSignificanceTe}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50">
                    <strong>{sr.fromLagnaRasiTe}:</strong> {sr.fromLagnaPlanetsTe}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50">
                    <strong>{sr.fromChandraRasiTe}:</strong> {sr.fromChandraPlanetsTe}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50">
                    <strong>{sr.fromSuryaRasiTe}:</strong> {sr.fromSuryaPlanetsTe}
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 text-right font-mono-tabular font-bold text-[#144D3E]">
                    {sr.fortificationScore}%
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50">
                    {sr.synthesisVerdictTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 6: JAIMINI KARAKAS, JAIMINI CHARA DASHA, 22ND DREKKANA, PAPA SAMYAM & SADE SATI */}
      {/* ===================================================================== */}
      <section id="grantha-p7" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={7}
          pageTitleTe="జైమిని కారకులు, జైమిని చర రాశి దశా కాలచక్రం, పాప సామ్యం & ఏలినాటి శని"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          {/* Jaimini Chara Karakas + Arudha Padas */}
          <div>
            <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1">
              15. మహర్షి జైమిని సప్త చరకారకులు & ఆరూఢ పాదాలు
            </h3>
            <table className="w-full border-collapse border border-[#8B6914] text-[9.5px] mb-2">
              <thead>
                <tr className="bg-[#7A1818] text-white">
                  <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">కారకత్వం</th>
                  <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">గ్రహం</th>
                  <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">డిగ్రీ</th>
                  <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">నవాంశ (D9)</th>
                </tr>
              </thead>
              <tbody>
                {jathakam.jaiminiKarakas.map((jk, idx) => (
                  <tr key={jk.karakaCode} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                      {jk.karakaNameTe} ({jk.karakaCode})
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold">
                      {jk.planetNameTe}
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-mono-tabular">
                      {jk.degreeFormatted}
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50">
                      {jk.navamsaRasiTe}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Papa Samyam */}
            <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1">
              16. కుజ దోష & పాప సామ్య పాయింట్ల పట్టిక (Papa Samyam)
            </h3>
            <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
              <thead>
                <tr className="bg-[#7A1818] text-white">
                  <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">గ్రహం</th>
                  <th className="py-0.5 px-1.5 text-center border border-[#8B6914]">లగ్నం నుండి</th>
                  <th className="py-0.5 px-1.5 text-center border border-[#8B6914]">చంద్రుని నుండి</th>
                  <th className="py-0.5 px-1.5 text-center border border-[#8B6914]">శుక్రుని నుండి</th>
                </tr>
              </thead>
              <tbody>
                {astroVisionReport.papaSamyam.rows.map((pr, idx) => (
                  <tr key={pr.planetId} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold">
                      {pr.planetNameTe}
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 text-center font-mono-tabular">
                      {pr.fromLagnaHouse}వ భా. ({pr.fromLagnaPoints} Pt)
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 text-center font-mono-tabular">
                      {pr.fromMoonHouse}వ భా. ({pr.fromMoonPoints} Pt)
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 text-center font-mono-tabular">
                      {pr.fromVenusHouse}వ భా. ({pr.fromVenusPoints} Pt)
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#FBF0D9] font-bold">
                  <td className="py-0.5 px-1.5 border border-[#8B6914] text-[#7A1818]">మొత్తం పాపం</td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914] text-center font-mono-tabular">
                    {astroVisionReport.papaSamyam.totalFromLagna}
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914] text-center font-mono-tabular">
                    {astroVisionReport.papaSamyam.totalFromMoon}
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914] text-center font-mono-tabular">
                    {astroVisionReport.papaSamyam.totalFromVenus}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Jaimini Chara Rasi Dasha 12 Rasis Table */}
          <div>
            <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1">
              17. మహర్షి జైమిని చర రాశి దశా కాలచక్రం (12 Rasi Mahadashas)
            </h3>
            <table className="w-full border-collapse border border-[#8B6914] text-[9px]">
              <thead>
                <tr className="bg-[#7A1818] text-white">
                  <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">దశా రాశి (భావం)</th>
                  <th className="py-0.5 px-1 text-center border border-[#8B6914]">సం.</th>
                  <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">కాలం (వయస్సు)</th>
                  <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">AL/UL & కారకులు</th>
                </tr>
              </thead>
              <tbody>
                {lifeChronicle.jaiminiCharaDashaReport.mahadashas.map((cd, idx) => (
                  <tr
                    key={`chara-maha-${cd.cycleIndex}-${cd.orderIndex}-${cd.rasiIndex}`}
                    className={
                      cd.isCurrent
                        ? 'bg-[#FDF0D5] font-bold text-[#7A1818]'
                        : idx % 2 === 0
                          ? 'bg-[#FFFEFA]'
                          : 'bg-[#F9F4E8]'
                    }
                  >
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                      {cd.orderIndex + 1}. {cd.rasiNameTe.split(' ')[0]} ({cd.houseFromLagna}వ భా.) {cd.isCurrent ? '★' : ''}
                    </td>
                    <td className="py-0.5 px-1 border border-[#8B6914]/50 text-center font-mono-tabular font-bold">
                      {cd.durationYears}y
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-mono-tabular">
                      {cd.startDate.slice(0, 4)}–{cd.endDate.slice(0, 4)} ({cd.startAge}–{cd.endAge} సం.)
                    </td>
                    <td className="py-0.5 px-1.5 border border-[#8B6914]/50">
                      AL-{cd.houseFromAL} · UL-{cd.houseFromUL} {cd.karakasInSignTe && cd.karakasInSignTe.length > 0 ? `· ${cd.karakasInSignTe[0].split(' ')[0]}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lifetime Sade Sati 3 Cycles (9 Phases) Table */}
        <div>
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1">
            18. జీవితకాల ఏలినాటి శని (Sade Sati 3 Cycles — 9 Phases) కాలచక్ర పట్టిక
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914]">విడత & దశ</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">శని సంచార రాశి</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">ప్రారంభం – ముగింపు</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">వయస్సు</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">ఆ సమయంలో దశ</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">ప్రభావం & పరిహార సూచన</th>
              </tr>
            </thead>
            <tbody>
              {astroVisionReport.sadeSatiPhases.map((sc, idx) => (
                <tr key={`sadesati-${sc.cycleNumber}-${idx}`} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {sc.cycleNumber}వ విడత · {sc.phaseNameTe.split(' (')[0]}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-semibold">
                    {sc.transitRasiTe} ({sc.houseFromMoon}వ ఇంట)
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-mono-tabular">
                    {sc.startDateStr} → {sc.endDateStr}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-mono-tabular">
                    {sc.startAge} – {sc.endAge}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-semibold text-[#144D3E]">
                    {sc.overlappingDashaTe}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50">
                    <strong>{sc.bodyPartTe}:</strong> {sc.phalaAndPariharaTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 7: COMPLETE 9 MAHADASHA × 9 BHUKTI (81 ANTARDASHAS) EXACT DATES MATRIX */}
      {/* ===================================================================== */}
      <section id="grantha-p8" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={8}
          pageTitleTe="వింశోత్తరి 120-సంవత్సరాల 9 మహాదశలు × 9 భుక్తులు (81 అంతర్దశల తేదీల సంపూర్ణ పట్టిక)"
        />

        <div className="mb-2 text-[11px] bg-[#FBF6E9] border border-[#8B6914] p-2">
          <strong className="text-[#7A1818]">ప్రస్తుత నడుస్తున్న దశ: </strong>
          <strong>{jathakam.currentDashaPhalamTe.mahadashaTe}</strong> — భుక్తి:{' '}
          <strong>{jathakam.currentDashaPhalamTe.antardashaTe}</strong> — ప్రత్యంతర దశ:{' '}
          <strong>{jathakam.currentDashaPhalamTe.pratyantardashaTe}</strong> ({jathakam.currentDashaPhalamTe.periodRange})
        </div>

        {/* 3x3 Grid of All 9 Mahadashas and their 9 Bhuktis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {jathakam.sampoornaDashaKalachakram.map((md) => (
            <div
              key={md.lordId}
              className={`border ${
                md.isCurrent ? 'border-2 border-[#7A1818]' : 'border-[#8B6914]'
              } bg-[#FFFEFA]`}
            >
              <div
                className={`px-2 py-1 text-[10.5px] font-bold flex items-center justify-between ${
                  md.isCurrent
                    ? 'bg-[#7A1818] text-white'
                    : 'bg-[#F3E8CE] text-[#7A1818] border-b border-[#8B6914]'
                }`}
              >
                <span>
                  {md.lordTe.split(' ')[0]} మహాదశ ({md.years} సం.)
                </span>
                <span className="font-mono-tabular text-[9px]">
                  {md.startDate} → {md.endDate}
                </span>
              </div>
              <table className="w-full border-collapse text-[9.5px]">
                <thead>
                  <tr className="bg-[#F9F4E8] text-[#5C3A21] border-b border-[#8B6914]/40">
                    <th className="py-0.5 px-1.5 text-left">భుక్తి (అంతర్దశ)</th>
                    <th className="py-0.5 px-1.5 text-right">ప్రారంభం</th>
                    <th className="py-0.5 px-1.5 text-right">ముగింపు</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8B6914]/25">
                  {md.antardashasTe.map((ad, aIdx) => (
                    <tr
                      key={aIdx}
                      className={
                        ad.isCurrent
                          ? 'bg-[#FDF0D5] font-bold text-[#7A1818]'
                          : aIdx % 2 === 0
                            ? 'bg-[#FFFEFA]'
                            : 'bg-[#FAF6EC]'
                      }
                    >
                      <td className="py-0.5 px-1.5">
                        {ad.bhuktiLordTe.split(' ')[0]} భుక్తి {ad.isCurrent ? '★' : ''}
                      </td>
                      <td className="py-0.5 px-1.5 text-right font-mono-tabular">
                        {ad.startDate}
                      </td>
                      <td className="py-0.5 px-1.5 text-right font-mono-tabular">
                        {ad.endDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 8: HOROSCOPE EXECUTIVE IDENTITY & NAVAGRAHA INDIVIDUAL LIFE PREDICTIONS (PART 1: SUN TO JUPITER) */}
      {/* ===================================================================== */}
      <section id="grantha-p9" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={9}
          pageTitleTe="జాతకుని సమగ్ర జీవిత స్వరూపం & నవగ్రహ వ్యక్తిగత జీవిత ఫలితములు (భాగం-1)"
        />

        {/* Horoscope Executive Identity Box */}
        <div className="border-2 border-[#7A1818] bg-[#FBF6E9] p-3 mb-3.5 text-[10px] leading-snug space-y-1.5">
          <div className="font-bold text-[#7A1818] text-xs border-b border-[#8B6914]/50 pb-1 flex items-center justify-between">
            <span>19. {lifeChronicle.horoscopeExecutiveIdentity.swaroopaTitleTe}</span>
            <span className="text-[#144D3E]">జాతక బల స్కోరు: {lifeChronicle.horoscopeExecutiveIdentity.overallLifeFortuneScore}%</span>
          </div>
          <ul className="space-y-1 list-none">
            <li>
              <strong className="text-[#7A1818]">• స్వభావం & వ్యక్తిత్వం: </strong>
              {lifeChronicle.horoscopeExecutiveIdentity.physicalAndMentalConstitutionTe}
            </li>
            <li>
              <strong className="text-[#144D3E]">• జీవన లక్ష్యం & యోగం: </strong>
              {lifeChronicle.horoscopeExecutiveIdentity.atmakarakaAndSoulMissionTe}
            </li>
            <li>
              <strong className="text-[#5C3A21]">• లగ్న-రాశి సమన్వయం: </strong>
              {lifeChronicle.horoscopeExecutiveIdentity.lagnaAndChandraSynthesisTe}
            </li>
          </ul>
        </div>

        {/* Navagraha Deep Individual Life Predictions: First 5 Planets (Sun, Moon, Mars, Mercury, Jupiter) */}
        <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-2">
          20. నవగ్రహ వ్యక్తిగత జీవిత ఫలితములు — రవి, చంద్ర, కుజ, బుధ, గురు గ్రహాల స్పష్టమైన విశ్లేషణ
        </h3>
        <div className="space-y-2">
          {lifeChronicle.navagrahaLifePredictions.slice(0, 5).map((gp) => (
            <div
              key={gp.planetId}
              className="border border-[#8B6914] bg-[#FFFEFA] p-2 text-[9.5px] leading-snug"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F3E8CE] border-b border-[#8B6914] px-2 py-1 -mx-2 -mt-2 mb-1.5 font-bold">
                <span className="text-[#7A1818] text-[10.5px]">
                  {gp.glyph} {gp.planetNameTe} — {gp.houseNumber}వ భావం ({gp.rasiAndDegreeTe}) · {gp.lordshipHousesTe}
                </span>
                <span className="text-[#144D3E] text-[9px]">
                  {gp.functionalRoleTe} | నక్షత్రం: {gp.nakshatraAndPadaTe}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px] bg-[#FAF6EC] px-2 py-1 border border-[#8B6914]/30 mb-1">
                <div><strong>వర్గ స్థితి:</strong> D9: {gp.navamsaRasiTe} · D10: {gp.dasamsaRasiTe}</div>
                <div><strong>హోదా:</strong> {gp.dignityAndAvasthaTe}</div>
                <div><strong>బలం:</strong> {gp.shadbalaAndIshtaTe}</div>
              </div>
              <ul className="space-y-0.5 list-none">
                <li>
                  <strong className="text-[#7A1818]">• గ్రహ ఫలితం: </strong>
                  {gp.positionalPhalamTe}
                </li>
                <li>
                  <strong className="text-[#144D3E]">• వృత్తి & ధన ప్రభావం: </strong>
                  {gp.careerAndWealthImpactTe}
                </li>
                <li>
                  <strong className="text-[#5C3A21]">• దశా కాలం & పరిహారం: </strong>
                  {gp.dashaBhuktiPhalamTe} <span className="font-semibold text-[#7A1818]">({gp.specificPariharaTe})</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 9: NAVAGRAHA PREDICTIONS (PART 2: VENUS TO KETU) + MARRIAGE & CAREER BLUEPRINTS */}
      {/* ===================================================================== */}
      <section id="grantha-p10" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={10}
          pageTitleTe="నవగ్రహ వ్యక్తిగత ఫలితములు (భాగం-2), వివాహ భాగస్వామి & ఉద్యోగ-వ్యాపార బ్లూప్రింట్"
        />

        {/* Remaining 4 Planets: Venus, Saturn, Rahu, Ketu */}
        <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-2">
          21. నవగ్రహ వ్యక్తిగత జీవిత ఫలితములు — శుక్ర, శని, రాహు, కేతు గ్రహాల స్పష్టమైన విశ్లేషణ
        </h3>
        <div className="space-y-2 mb-3.5">
          {lifeChronicle.navagrahaLifePredictions.slice(5, 9).map((gp) => (
            <div
              key={gp.planetId}
              className="border border-[#8B6914] bg-[#FFFEFA] p-2 text-[9.5px] leading-snug"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F3E8CE] border-b border-[#8B6914] px-2 py-1 -mx-2 -mt-2 mb-1.5 font-bold">
                <span className="text-[#7A1818] text-[10.5px]">
                  {gp.glyph} {gp.planetNameTe} — {gp.houseNumber}వ భావం ({gp.rasiAndDegreeTe}) · {gp.lordshipHousesTe}
                </span>
                <span className="text-[#144D3E] text-[9px]">
                  {gp.functionalRoleTe} | నక్షత్రం: {gp.nakshatraAndPadaTe}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px] bg-[#FAF6EC] px-2 py-1 border border-[#8B6914]/30 mb-1">
                <div><strong>వర్గ స్థితి:</strong> D9: {gp.navamsaRasiTe} · D10: {gp.dasamsaRasiTe}</div>
                <div><strong>హోదా:</strong> {gp.dignityAndAvasthaTe}</div>
                <div><strong>బలం:</strong> {gp.shadbalaAndIshtaTe}</div>
              </div>
              <ul className="space-y-0.5 list-none">
                <li>
                  <strong className="text-[#7A1818]">• గ్రహ ఫలితం: </strong>
                  {gp.positionalPhalamTe}
                </li>
                <li>
                  <strong className="text-[#144D3E]">• వృత్తి & ధన ప్రభావం: </strong>
                  {gp.careerAndWealthImpactTe}
                </li>
                <li>
                  <strong className="text-[#5C3A21]">• దశా కాలం & పరిహారం: </strong>
                  {gp.dashaBhuktiPhalamTe} <span className="font-semibold text-[#7A1818]">({gp.specificPariharaTe})</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Marriage & Career Side-by-Side Deep Blueprints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[9.5px] leading-snug">
          <div className="border-2 border-[#7A1818] bg-[#FBF6E9] p-3 space-y-1.5">
            <div className="font-bold text-[#7A1818] text-xs border-b border-[#8B6914] pb-1">
              22. వివాహ & జీవిత భాగస్వామి విశ్లేషణ (Marriage & Spouse)
            </div>
            <div className="bg-[#FFFEFA] p-1.5 border border-[#8B6914]/40">
              <strong>7వ భావం:</strong> {lifeChronicle.marriageBlueprint.seventhHouseRasiTe} (అధిపతి: {lifeChronicle.marriageBlueprint.seventhLordTe} - {lifeChronicle.marriageBlueprint.seventhLordHouse}వ ఇంట) | <strong>D9 సప్తమం:</strong> {lifeChronicle.marriageBlueprint.navamsaSeventhRasiTe}
              <br />
              <strong>దారకారకుడు (DK):</strong> {lifeChronicle.marriageBlueprint.darakarakaPlanetTe} | <strong>ఉపపాదం (UL):</strong> {lifeChronicle.marriageBlueprint.upapadaLagnaRasiTe}
            </div>
            <ul className="space-y-1 list-none">
              <li>
                <strong className="text-[#7A1818]">• భాగస్వామి స్వభావం: </strong>
                {lifeChronicle.marriageBlueprint.spouseNatureAndAppearanceTe}
              </li>
              <li>
                <strong className="text-[#144D3E]">• కుటుంబం & వృత్తి: </strong>
                {lifeChronicle.marriageBlueprint.spouseCareerAndFamilyTe}
              </li>
              <li>
                <strong className="text-[#7A1818]">• దిక్కు & వివాహ కాలం: </strong>
                {lifeChronicle.marriageBlueprint.marriageDirectionAndTimingTe}
              </li>
              <li>
                <strong className="text-[#5C3A21]">• పొందిక సూచన: </strong>
                {lifeChronicle.marriageBlueprint.maritalHarmonyAndPapaSamyaTe}
              </li>
            </ul>
          </div>

          <div className="border-2 border-[#7A1818] bg-[#FBF6E9] p-3 space-y-1.5">
            <div className="font-bold text-[#7A1818] text-xs border-b border-[#8B6914] pb-1">
              23. ఉద్యోగ, వ్యాపార & ఆర్థిక విశ్లేషణ (Career & Wealth)
            </div>
            <div className="bg-[#FFFEFA] p-1.5 border border-[#8B6914]/40">
              <strong>10వ భావం:</strong> {lifeChronicle.careerWealthBlueprint.tenthHouseRasiTe} (అధిపతి: {lifeChronicle.careerWealthBlueprint.tenthLordTe} - {lifeChronicle.careerWealthBlueprint.tenthLordHouse}వ ఇంట) | <strong>D10 లగ్నం:</strong> {lifeChronicle.careerWealthBlueprint.dasamsaLagnaRasiTe}
              <br />
              <strong>అమాత్యకారకుడు:</strong> {lifeChronicle.careerWealthBlueprint.amatyakarakaPlanetTe} | <strong>ధన వృద్ధి వయస్సు:</strong> {lifeChronicle.careerWealthBlueprint.peakFinancialAgesTe}
            </div>
            <ul className="space-y-1 list-none">
              <li>
                <strong className="text-[#7A1818]">• ఉద్యోగమా? వ్యాపారమా?: </strong>
                {lifeChronicle.careerWealthBlueprint.jobVsBusinessVerdictTe}
              </li>
              <li>
                <strong className="text-[#144D3E]">• అనుకూల రంగాలు: </strong>
                {lifeChronicle.careerWealthBlueprint.recommendedSectorsTe.join(' · ')}
              </li>
              <li>
                <strong className="text-[#7A1818]">• ఆస్తులు & గృహ యోగం: </strong>
                {lifeChronicle.careerWealthBlueprint.wealthAndPropertyYogasTe}
              </li>
              <li>
                <strong className="text-[#5C3A21]">• విదేశీ యోగం: </strong>
                {lifeChronicle.careerWealthBlueprint.foreignTravelAndSettlementTe}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 10: BIRTH-TO-100 YEARS 7 LIFE EPOCHS CHRONICLE & 9 MAHADASHA PHALALU */}
      {/* ===================================================================== */}
      <section id="grantha-p11" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={11}
          pageTitleTe="బాల్యం నుండి శతాయుష్షు వరకు 7 జీవిత పర్వాల విశ్లేషణ & మహాదశా ఫలితాలు"
        />

        <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-2">
          24. వయస్సు వారీగా 7 జీవిత పర్వాల స్పష్టమైన ఫలితాలు (0 నుండి 100 సం.ల వరకు)
        </h3>
        <div className="space-y-1.5 mb-3.5">
          {lifeChronicle.sevenLifeEpochs.map((ep) => (
            <div
              key={ep.epochNumber}
              className="border border-[#8B6914] bg-[#FFFEFA] p-2 text-[9px] leading-snug"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F3E8CE] border-b border-[#8B6914] px-2 py-0.5 -mx-2 -mt-2 mb-1 font-bold">
                <span className="text-[#7A1818] text-[10px]">
                  {ep.titleTe} — వయస్సు: {ep.ageRangeTe} ({ep.calendarYearsTe})
                </span>
                <span className="text-[#144D3E]">
                  {ep.statusBadgeTe} ({ep.fortuneScorePct}% బలం) | దశలు: {ep.activeVimshottariDashasTe}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-0.5">
                <div><strong className="text-[#7A1818]">• విద్య / వృత్తి / ధనం:</strong> {ep.educationCareerWealthTe}</div>
                <div><strong className="text-[#144D3E]">• కుటుంబం & ఆరోగ్యం:</strong> {ep.familyMarriageProgenyTe}</div>
                <div className="md:col-span-2 text-[#5C3A21]"><strong>• సూచన:</strong> {ep.cautionsAndGuidanceTe}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 9 Mahadasha Predictions Summary Table */}
        <div>
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            25. నవ మహాదశల జీవితకాల ఫలిత సారాంశం (9 Vimshottari Mahadasha Predictions)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">మహాదశ & కాలం</th>
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">వయస్సు</th>
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">గ్రహ స్థితి</th>
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">మహాదశా ఫలిత సారాంశం</th>
              </tr>
            </thead>
            <tbody>
              {jathakam.sampoornaDashaKalachakram.map((md, idx) => (
                <tr
                  key={`vim-report-${md.lordId}-${md.startDate}-${idx}`}
                  className={
                    md.isCurrent
                      ? 'bg-[#FDF0D5] font-semibold'
                      : idx % 2 === 0
                        ? 'bg-[#FFFEFA]'
                        : 'bg-[#F9F4E8]'
                  }
                >
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818] whitespace-nowrap">
                    {md.lordTe.split(' ')[0]} ({md.startDate.slice(0, 4)}–{md.endDate.slice(0, 4)})
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-mono-tabular whitespace-nowrap">
                    {md.ageRangeTe}
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 whitespace-nowrap">
                    {md.planetHouse}వ భా. ({md.planetRasiTe.split(' ')[0]})
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50">
                    {md.predictionTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 11: DWADASHA BHAVA PHALITALU (ALL 12 HOUSES) & ALL 12 GRANTHA CITATIONS */}
      {/* ===================================================================== */}
      <section id="grantha-p12" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={12}
          pageTitleTe="ద్వాదశ భావ సంపూర్ణ ఫలితములు (1–12 భావాలు) & 12 ప్రాచీన గ్రంథాల ప్రమాణ విశ్లేషణ"
        />

        {/* Dwadasha Bhava Phalitalu Complete Table */}
        <div className="mb-3.5">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            26. ద్వాదశ భావ ఫలిత పట్టిక — 12 భావాల స్పష్టమైన ఫలితాలు (All 12 Houses Summary)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914] w-1/5">భావం & రాశి</th>
                <th className="py-1 px-2 text-left border border-[#8B6914] w-1/5">భావాధిపతి & గ్రహ స్థితి</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">భావ ఫలిత విశ్లేషణ</th>
              </tr>
            </thead>
            <tbody>
              {jathakam.dwadashaBhavaPhalitalu.map((bh, idx) => (
                <tr key={bh.bhavaNumber} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-1 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    <div>{bh.titleTe.split('(')[0]}</div>
                    <div className="text-[8.5px] text-[#5C3A21]">{bh.rasiNameTe} · {bh.strengthTe.split(' (')[0]}</div>
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50">
                    <div>అధిపతి: <strong>{bh.adhipatiTe.split(' ')[0]}</strong> ({bh.adhipatiPlacedHouse}వ ఇంట)</div>
                    <div className="text-[#144D3E]">
                      గ్రహాలు: {bh.occupantsTe.length > 0 ? bh.occupantsTe.join(', ') : '—'}
                    </div>
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 leading-snug">
                    {bh.predictionTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* All 12 Classical Sanskrit Grantha Citations */}
        <div>
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            27. ద్వాదశ ప్రాచీన జ్యోతిష్య మహాగ్రంథాల ముఖ్య తీర్పులు (12 Classical Grantha Verdicts)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {jathakam.granthaPramanaResearch.map((gr, idx) => (
              <div
                key={`grantha-${gr.granthaNameTe}-${idx}`}
                className="border border-[#8B6914] bg-[#FBF6E9] p-1.5 text-[9px] leading-snug"
              >
                <div className="font-bold text-[#7A1818] flex items-center justify-between border-b border-[#8B6914]/30 pb-0.5 mb-0.5">
                  <span>{gr.granthaNameTe.split('(')[0].trim()}</span>
                  <span className="text-[#144D3E]">{gr.authorTe.split('(')[0].trim()}</span>
                </div>
                <div className="font-semibold text-[#5C3A21] mb-0.5">• {gr.topicTitleTe}</div>
                <div className="text-[#144D3E] font-bold">ఫలితం: {gr.keyVerdictTe}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE: DWADASHA BHAVA DEEP I — భావాలు 1–6                                */}
      {/* ===================================================================== */}
      <section id="grantha-p13" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={13} pageTitleTe="ద్వాదశ భావ సూక్ష్మ విచారం I — భావాలు 1–6 (ఆధారం · అధిపతి · నివాసులు · దృష్టి · బలం · కాలం)" />
        <div className="mb-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[9px] leading-snug">
          <strong className="text-[#7A1818]">సమగ్ర సమన్వయం: </strong>{vistaraDeep.synthesisTe}
          <div className="text-[8px] text-[#5C3A21] mt-0.5">{vistaraDeep.methodNoteTe}</div>
        </div>
        <div className="space-y-2">
          {vistaraDeep.bhavas.slice(0, 6).map((bh) => (
            <div key={bh.house} className="border border-[#8B6914]">
              <div className="flex flex-wrap items-baseline justify-between gap-1 bg-[#F3E8CE] px-2 py-1">
                <span className="text-[10px] font-bold text-[#7A1818]">{bh.house}. {bh.titleTe}</span>
                <span className="text-[8.4px]">
                  {bh.rasiTe} · SAV <strong>{bh.sav}</strong> ({bh.savBandTe}) · అధిపతి {bh.lordTe} {bh.lordHouse}వ భావంలో · <strong className="text-[#144D3E]">{bh.scorePct}%</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 px-2 py-1 text-[8.2px] leading-snug">
                {bh.sections.map((sec) => (
                  <div key={sec.headingTe}>
                    <span className="font-bold text-[#5C3A21]">{sec.headingTe}: </span>
                    {sec.bodyTe}
                  </div>
                ))}
              </div>
              <div className="border-t border-[#8B6914]/40 px-2 py-1 text-[8.4px] leading-snug">
                <div><strong className="text-[#7A1818]">తీర్పు: </strong>{bh.verdictTe}</div>
                <div><strong className="text-[#144D3E]">పరిహారం: </strong>{bh.remedyTe}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE: DWADASHA BHAVA DEEP II — భావాలు 7–12                              */}
      {/* ===================================================================== */}
      <section id="grantha-p14" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={14} pageTitleTe="ద్వాదశ భావ సూక్ష్మ విచారం II — భావాలు 7–12 (ఆధారం · అధిపతి · నివాసులు · దృష్టి · బలం · కాలం)" />
        <div className="mb-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[9px] leading-snug">
          <strong className="text-[#7A1818]">బలమైన భావం: </strong>{vistaraDeep.strongBhavaTe} · <strong className="text-[#7A1818]">శ్రద్ధార్హ భావం: </strong>{vistaraDeep.weakBhavaTe}
        </div>
        <div className="space-y-2">
          {vistaraDeep.bhavas.slice(6, 12).map((bh) => (
            <div key={bh.house} className="border border-[#8B6914]">
              <div className="flex flex-wrap items-baseline justify-between gap-1 bg-[#F3E8CE] px-2 py-1">
                <span className="text-[10px] font-bold text-[#7A1818]">{bh.house}. {bh.titleTe}</span>
                <span className="text-[8.4px]">
                  {bh.rasiTe} · SAV <strong>{bh.sav}</strong> ({bh.savBandTe}) · అధిపతి {bh.lordTe} {bh.lordHouse}వ భావంలో · <strong className="text-[#144D3E]">{bh.scorePct}%</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 px-2 py-1 text-[8.2px] leading-snug">
                {bh.sections.map((sec) => (
                  <div key={sec.headingTe}>
                    <span className="font-bold text-[#5C3A21]">{sec.headingTe}: </span>
                    {sec.bodyTe}
                  </div>
                ))}
              </div>
              <div className="border-t border-[#8B6914]/40 px-2 py-1 text-[8.4px] leading-snug">
                <div><strong className="text-[#7A1818]">తీర్పు: </strong>{bh.verdictTe}</div>
                <div><strong className="text-[#144D3E]">పరిహారం: </strong>{bh.remedyTe}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE: NAVAGRAHA DEEP I — సూర్యుడు · చంద్రుడు · కుజుడు                    */}
      {/* ===================================================================== */}
      <section id="grantha-p15" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={15} pageTitleTe="నవగ్రహ సూక్ష్మ విచారం I — సూర్యుడు · చంద్రుడు · కుజుడు (స్థానం · కర్మ · బలం · సంబంధం · ఫలం · కాలం)" />
        <div className="mb-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[9px]">
          <strong className="text-[#7A1818]">బలమైన గ్రహం: </strong>{vistaraDeep.strongestGrahaTe} · <strong className="text-[#7A1818]">బలహీన గ్రహం: </strong>{vistaraDeep.weakestGrahaTe}
        </div>
        <div className="space-y-2">
          {vistaraDeep.grahas.slice(0, 3).map((g) => (
            <div key={g.id} className="border border-[#8B6914]">
              <div className="flex flex-wrap items-baseline justify-between gap-1 bg-[#F3E8CE] px-2 py-1">
                <span className="text-[10px] font-bold text-[#7A1818]">{g.nameTe} — {g.rasiTe} {g.degreeTe} · {g.house}వ భావం</span>
                <span className="text-[8.4px]">{g.nakshatraTe} · {g.dignityTe} · {g.motionTe} · {g.shadbalaRank > 0 ? `షడ్బల ${g.shadbalaVirupas.toFixed(1)} v. (ర్యాంక్ ${g.shadbalaRank}/7)` : 'ఛాయా గ్రహం — షడ్బలం వర్తించదు'} · <strong className="text-[#144D3E]">{g.scorePct}%</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 px-2 py-1 text-[8.2px] leading-snug">
                {g.sections.map((sec) => (
                  <div key={sec.headingTe}>
                    <span className="font-bold text-[#5C3A21]">{sec.headingTe}: </span>
                    {sec.bodyTe}
                  </div>
                ))}
              </div>
              <div className="border-t border-[#8B6914]/40 px-2 py-1 text-[8.4px] leading-snug">
                <div><strong className="text-[#7A1818]">తీర్పు: </strong>{g.verdictTe} <span className="text-[#5C3A21]">| జాగ్రత్త: {g.cautionTe}</span></div>
                <div><strong className="text-[#144D3E]">పరిహారం: </strong>{g.remedyTe}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE: NAVAGRAHA DEEP II — బుధుడు · గురువు · శుక్రుడు                    */}
      {/* ===================================================================== */}
      <section id="grantha-p16" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={16} pageTitleTe="నవగ్రహ సూక్ష్మ విచారం II — బుధుడు · గురువు · శుక్రుడు (స్థానం · కర్మ · బలం · సంబంధం · ఫలం · కాలం)" />
        <div className="space-y-2">
          {vistaraDeep.grahas.slice(3, 6).map((g) => (
            <div key={g.id} className="border border-[#8B6914]">
              <div className="flex flex-wrap items-baseline justify-between gap-1 bg-[#F3E8CE] px-2 py-1">
                <span className="text-[10px] font-bold text-[#7A1818]">{g.nameTe} — {g.rasiTe} {g.degreeTe} · {g.house}వ భావం</span>
                <span className="text-[8.4px]">{g.nakshatraTe} · {g.dignityTe} · {g.motionTe} · {g.shadbalaRank > 0 ? `షడ్బల ${g.shadbalaVirupas.toFixed(1)} v. (ర్యాంక్ ${g.shadbalaRank}/7)` : 'ఛాయా గ్రహం — షడ్బలం వర్తించదు'} · <strong className="text-[#144D3E]">{g.scorePct}%</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 px-2 py-1 text-[8.2px] leading-snug">
                {g.sections.map((sec) => (
                  <div key={sec.headingTe}>
                    <span className="font-bold text-[#5C3A21]">{sec.headingTe}: </span>
                    {sec.bodyTe}
                  </div>
                ))}
              </div>
              <div className="border-t border-[#8B6914]/40 px-2 py-1 text-[8.4px] leading-snug">
                <div><strong className="text-[#7A1818]">తీర్పు: </strong>{g.verdictTe} <span className="text-[#5C3A21]">| జాగ్రత్త: {g.cautionTe}</span></div>
                <div><strong className="text-[#144D3E]">పరిహారం: </strong>{g.remedyTe}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE: NAVAGRAHA DEEP III — శని · రాహువు · కేతువు                        */}
      {/* ===================================================================== */}
      <section id="grantha-p17" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={17} pageTitleTe="నవగ్రహ సూక్ష్మ విచారం III — శని · రాహువు · కేతువు (స్థానం · కర్మ · బలం · సంబంధం · ఫలం · కాలం)" />
        <div className="space-y-2">
          {vistaraDeep.grahas.slice(6, 9).map((g) => (
            <div key={g.id} className="border border-[#8B6914]">
              <div className="flex flex-wrap items-baseline justify-between gap-1 bg-[#F3E8CE] px-2 py-1">
                <span className="text-[10px] font-bold text-[#7A1818]">{g.nameTe} — {g.rasiTe} {g.degreeTe} · {g.house}వ భావం</span>
                <span className="text-[8.4px]">{g.nakshatraTe} · {g.dignityTe} · {g.motionTe} · {g.shadbalaRank > 0 ? `షడ్బల ${g.shadbalaVirupas.toFixed(1)} v. (ర్యాంక్ ${g.shadbalaRank}/7)` : 'ఛాయా గ్రహం — షడ్బలం వర్తించదు'} · <strong className="text-[#144D3E]">{g.scorePct}%</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 px-2 py-1 text-[8.2px] leading-snug">
                {g.sections.map((sec) => (
                  <div key={sec.headingTe}>
                    <span className="font-bold text-[#5C3A21]">{sec.headingTe}: </span>
                    {sec.bodyTe}
                  </div>
                ))}
              </div>
              <div className="border-t border-[#8B6914]/40 px-2 py-1 text-[8.4px] leading-snug">
                <div><strong className="text-[#7A1818]">తీర్పు: </strong>{g.verdictTe} <span className="text-[#5C3A21]">| జాగ్రత్త: {g.cautionTe}</span></div>
                <div><strong className="text-[#144D3E]">పరిహారం: </strong>{g.remedyTe}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE: DOSHA DEEP — దోష పరిశీలన                                        */}
      {/* ===================================================================== */}
      <section id="grantha-p18" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={18} pageTitleTe="దోష సూక్ష్మ పరిశీలన — ఏర్పడ్డాయా · భంగం ఉందా · ప్రభావం · పరిహారం · కాలం" />

        <div className="mb-2 grid grid-cols-3 gap-1.5 text-[9px]">
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">పరిశీలించిన దోషాలు <strong className="text-[#7A1818]">{vistaraDeep.doshas.length}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">ఏర్పడినవి <strong className="text-[#7A1818]">{vistaraDeep.doshas.filter((d) => d.present).length}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">తీవ్రమైనవి <strong className="text-[#7A1818]">{vistaraDeep.doshas.filter((d) => d.severityTe === 'తీవ్రం').length}</strong></div>
        </div>

        <table className="w-full border-collapse border border-[#8B6914] text-[8.2px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left w-[13%]">దోషం</th>
              <th className="py-0.5 px-1 text-left w-[7%]">స్థితి</th>
              <th className="py-0.5 px-1 text-left w-[22%]">ఆధారం (ఈ కుండలిలో)</th>
              <th className="py-0.5 px-1 text-left w-[16%]">భంగం / ఉపశమనం</th>
              <th className="py-0.5 px-1 text-left w-[18%]">ప్రభావం</th>
              <th className="py-0.5 px-1 text-left w-[16%]">పరిహారం</th>
              <th className="py-0.5 px-1 text-left w-[8%]">కాలం</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {vistaraDeep.doshas.map((d, idx) => (
              <tr key={d.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[3px] px-1 align-top">
                  <div className="font-bold text-[#7A1818]">{d.nameTe}</div>
                  <div className="text-[7.2px] text-[#6E5528]">{d.sourceTe}</div>
                </td>
                <td className="py-[3px] px-1 align-top">
                  <div className={d.present ? 'font-bold text-[#7A1818]' : 'text-[#144D3E]'}>{d.present ? `ఉంది · ${d.severityTe}` : 'లేదు'}</div>
                </td>
                <td className="py-[3px] px-1 align-top">{d.evidenceTe}</td>
                <td className="py-[3px] px-1 align-top">{d.bhangaTe}</td>
                <td className="py-[3px] px-1 align-top">{d.effectTe}</td>
                <td className="py-[3px] px-1 align-top text-[#144D3E]">{d.remedyTe}</td>
                <td className="py-[3px] px-1 align-top text-[7.4px]">{d.timingTe || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[8.8px] leading-relaxed">
          <strong className="text-[#7A1818]">చదవడం ఎలా: </strong>
          ఇక్కడ ఏ దోషమూ "ఉంది/లేదు" అని మాత్రమే చెప్పబడలేదు — ఆ దోషం ఏ గ్రహ స్థితి నుంచి వచ్చింది (సంఖ్యలతో),
          భంగం (ఉపశమనం) ఉందా, ఏ దశలో స్పష్టమవుతుంది, ఏ పరిహారం సరిపోతుంది — అన్నీ ఒకే వరుసలో ఉన్నాయి.
          దోషం అనేది శాపం కాదు; గ్రహ స్థితి యొక్క ఒత్తిడి. పరిహారం + క్రమశిక్షణతో అది ఫలాన్ని ఇవ్వదు.
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 12: 6 LIFE PILLARS (FULL), DOSHA PARIKSHANA, ALL 9 PLANET REMEDIES & COLOPHON */}
      {/* ===================================================================== */}
      <section id="grantha-p19" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={19}
          pageTitleTe="జీవిత 6 ప్రధాన రంగాలు, సంపూర్ణ దోష పరీక్ష, వేదోక్త ఉపాయ-పరిహార మంజరి & స్వస్తి వాక్యం"
        />

        {/* 6 Life Pillars Complete Unabridged Table */}
        <div className="mb-3.5">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            28. జీవిత 6 ప్రధాన రంగాల స్పష్టమైన విశ్లేషణ (విద్య, ఉద్యోగం, ధనం, వివాహం, ఆరోగ్యం & భాగ్యోదయం)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914] w-1/5">జీవిత రంగం & భావాలు</th>
                <th className="py-1 px-2 text-center border border-[#8B6914] w-14">బలం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">ముఖ్య జాతక ఫలితాలు & అనుకూల కాలం</th>
              </tr>
            </thead>
            <tbody>
              {jathakam.jeevitaPradhanaRangalu.map((lp, idx) => (
                <tr key={lp.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-1 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    <div>{lp.titleTe}</div>
                    <div className="text-[8.5px] text-[#5C3A21] font-normal">భావాలు: {lp.keyHousesTe}</div>
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 text-center font-mono-tabular font-bold text-[#144D3E]">
                    {lp.scorePercent}%
                  </td>
                  <td className="py-1 px-2 border border-[#8B6914]/50 leading-snug">
                    <ul className="space-y-0.5 list-none">
                      {lp.analysisParagraphsTe.map((para, pIdx) => (
                        <li key={`lp-para-${lp.id}-${pIdx}`}>• {para}</li>
                      ))}
                    </ul>
                    <div className="text-[#7A1818] font-semibold mt-0.5">
                      ★ యోగ కాలం: {lp.favorablePeriodsTe} | పరిహారం: {lp.shastraGuidanceTe}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dosha Parikshana + Upaya & Pariharas Table */}
        <div className="mb-3.5">
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1.5">
            29. దోష పరీక్ష (కుజ, కాలసర్ప, గండమూల, ఏలినాటి శని) & వేదోక్త నవగ్రహ శాంతి పరిహార పట్టిక
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-2 text-left border border-[#8B6914]">గ్రహం / దోషం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">జాతకంలో పీడా కారణం</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">బీజ మంత్రం & జప సంఖ్య</th>
                <th className="py-1 px-2 text-left border border-[#8B6914]">దాన ద్రవ్యములు, రత్నం & ఆరాధ్య క్షేత్రం</th>
              </tr>
            </thead>
            <tbody>
              {upayaReport.maleficInfluences.map((rem, idx) => (
                <tr key={rem.planetId} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    {rem.planetNameTe} ({rem.severityLabelTe})
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50">
                    {rem.afflictionReasonsTe[0] ?? 'దశా/గోచార రక్షణ కొరకు'}
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50 font-semibold text-[#144D3E]">
                    {rem.mantraUpaya.beejaMantraTe} ({rem.mantraUpaya.japaCountTe})
                  </td>
                  <td className="py-0.5 px-2 border border-[#8B6914]/50">
                    <strong>దానం:</strong> {rem.danaUpaya.danaItemsTe} · <strong>రత్నం:</strong> {TELUGU_PLANETS[rem.planetId]?.ratnamTe ?? 'రత్నం'} · <strong>క్షేత్రం:</strong> {rem.templeAndSevaUpaya.kshetraNameTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lucky Gemstones, Numerology & Royal Siddhanti Colophon Seal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2.5">
            <div className="font-bold text-[#7A1818] border-b border-[#8B6914]/40 pb-1 mb-1">
              30. రత్న ధారణ, ఇష్టదేవత & అదృష్ట సూచికలు (Gemstone & Favorable Points)
            </div>
            <div><strong>జీవన రత్నం (Life Stone):</strong> {astroVisionReport.adrushtaSoochika.lifeGemstoneTe}</div>
            <div><strong>భాగ్య రత్నం (Lucky Stone):</strong> {astroVisionReport.adrushtaSoochika.beneficGemstoneTe} ({astroVisionReport.adrushtaSoochika.fortuneGemstoneTe})</div>
            <div><strong>అదృష్ట సంఖ్యలు & వారములు:</strong> {astroVisionReport.adrushtaSoochika.luckyNumbers} · {astroVisionReport.adrushtaSoochika.luckyDaysTe}</div>
            <div><strong>అదృష్ట రంగులు & దిక్కు:</strong> {astroVisionReport.adrushtaSoochika.luckyColorsTe} · {astroVisionReport.adrushtaSoochika.favorableDirectionTe}</div>
            <div><strong>ఆరాధ్య ఇష్టదేవత:</strong> {verificationReport.jaiminiDevataNirnaya.ishtaDevataTe}</div>
          </div>

          <div className="border-2 border-[#7A1818] bg-[#FBF6E9] p-2.5 flex flex-col justify-between text-center">
            <div className="text-[10.5px] font-bold text-[#7A1818]">
              || స్వస్తి ప్రజాభ్యః పరిపాలయంతాం న్యాయేన మార్గేణ మహీం మహీశాః |
              <br />
              గోబ్రాహ్మణేభ్యః శుభమస్తు నిత్యం లోకాః సమస్తాః సుఖినో భవంతు ||
            </div>
            <div className="text-[10px] font-bold text-[#144D3E] mt-1">
              || గ్రహారాజ్య బలేనైవ లోకాః తిష్ఠంతి సర్వదా · సర్వే గ్రహాః శుభకరా భవంతు ||
            </div>
            <div className="text-[9.5px] text-[#4A3B2C] mt-1.5 border-t border-[#8B6914]/40 pt-1">
              శ్రీ సంపూర్ణ దృగ్గణిత తెలుగు జాతక మహాగ్రంథం · పుట 12 సమాప్తం
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 13: TAJIKA VARSHAPHALA & 12-MONTH FORECAST CALENDAR              */}
      {/* ===================================================================== */}
      <section id="grantha-p20" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip
          pageNum={20}
          pageTitleTe={`తాజిక నీలకంఠీ వర్షఫలం (${varshaphalaReport.targetYear}–${varshaphalaReport.targetYear + 1}) & 12-నెలల దినచర్య ఫలితాలు`}
        />

        {/* Varsha Pravesha, Muntha & Varsheshwara Summary Box */}
        <div className="mb-3 border-2 border-[#7A1818] bg-[#FBF6E9] p-2.5 text-[10px]">
          <div className="font-bold text-[#7A1818] border-b border-[#8B6914]/40 pb-1 mb-1.5 flex items-center justify-between">
            <span>31. వర్ష ప్రవేశ ముహూర్తం, ముంథా స్థితి & వర్షేశ్వర (Year Lord) నిర్ణయం</span>
            <span className="text-[#144D3E]">వయస్సు: {varshaphalaReport.runningYearOfLife}వ వర్షం · స్కోరు: {varshaphalaReport.annualOverallScorePct}%</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1.5">
            <div>
              <strong>వర్ష ప్రవేశ తేదీ & సమయం:</strong> {varshaphalaReport.varshaPraveshaDate} ({varshaphalaReport.varshaPraveshaWeekdayTe}) · {varshaphalaReport.varshaPraveshaTime}
            </div>
            <div>
              <strong>వర్ష లగ్నం:</strong> {varshaphalaReport.varshaLagnaRasiTe} (అధిపతి: {varshaphalaReport.varshaLagnaLordTe})
            </div>
            <div>
              <strong>ముంథా రాశి & భావం:</strong> {varshaphalaReport.munthaRasiTe} (వర్ష లగ్నం నుండి {varshaphalaReport.munthaHouseFromVarshaLagna}వ భావం)
            </div>
            <div>
              <strong>వర్షేశ్వరుడు (Year Lord):</strong> {varshaphalaReport.varsheshwaraPlanetTe} ({varshaphalaReport.varsheshwaraPanchavargiyaBala} వి.బలం)
            </div>
          </div>
          <div className="text-[9.5px] leading-snug text-[#2B1E16] border-t border-[#8B6914]/30 pt-1">
            <strong>ముంథా ఫలితం:</strong> {varshaphalaReport.munthaDetailedVerdictTe} <strong>వార్షిక తీర్పు:</strong> {varshaphalaReport.annualExecutiveSummaryTe}
          </div>
        </div>

        {/* Varsha Kundali & Mudda Dasha + Sahams Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
          <div className="md:col-span-5">
            <ClassicalSouthIndianChakraBox
              chart={varshaphalaReport.varshaChart}
              vargaKey="d1Sign"
              titleTe={`వర్ష కుండలి (${varshaphalaReport.targetYear})`}
              subtitleTe={`వర్ష లగ్నం: ${varshaphalaReport.varshaLagnaRasiTe.split(' ')[0]}`}
              compact
            />
          </div>
          <div className="md:col-span-7 space-y-2">
            <div>
              <h4 className="text-[10px] font-bold text-[#7A1818] mb-1">
                32. 365-రోజుల ముద్ద వింశోత్తరి దశా కాలచక్రం (Mudda Annual Dasha)
              </h4>
              <table className="w-full border-collapse border border-[#8B6914] text-[9px]">
                <thead>
                  <tr className="bg-[#7A1818] text-white">
                    <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">ముద్ద దశ</th>
                    <th className="py-0.5 px-1.5 text-center border border-[#8B6914]">రోజులు</th>
                    <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">కాల వ్యవధి</th>
                    <th className="py-0.5 px-1.5 text-left border border-[#8B6914]">ప్రధాన ఫలితం</th>
                  </tr>
                </thead>
                <tbody>
                  {varshaphalaReport.muddaDashas.map((md, idx) => (
                    <tr key={md.lordId} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                      <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                        {md.lordNameTe} ({md.houseInVarsha}వ భా.)
                      </td>
                      <td className="py-0.5 px-1.5 border border-[#8B6914]/50 text-center font-mono-tabular">
                        {md.daysCount}
                      </td>
                      <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-mono-tabular">
                        {md.startDate} → {md.endDate}
                      </td>
                      <td className="py-0.5 px-1.5 border border-[#8B6914]/50 truncate max-w-[210px]">
                        {md.phalamTe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border border-[#8B6914] bg-[#FBF6E9] p-1.5 text-[9px]">
              <div className="font-bold text-[#7A1818] mb-0.5">
                33. సప్త సహమములు (7 Tajika Sahams) & తాజిక యోగాలు:
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {varshaphalaReport.sahams.map((s) => (
                  <span key={s.id}>
                    <strong>{s.nameTe.split(' ')[0]}:</strong> {s.rasiNameTe.split(' ')[0]} ({s.degreeFormatted})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 12-Month Calendar Forecast Table */}
        <div>
          <h3 className="text-xs font-bold text-[#7A1818] uppercase mb-1">
            34. 12-నెలల మాసవారీ సవివర జాతక ఫలితాలు (Month-by-Month 12-Month Forecast)
          </h3>
          <table className="w-full border-collapse border border-[#8B6914] text-[9px]">
            <thead>
              <tr className="bg-[#7A1818] text-white">
                <th className="py-1 px-1.5 text-left border border-[#8B6914] w-28">మాసం & తేదీలు</th>
                <th className="py-1 px-1.5 text-center border border-[#8B6914] w-16">రవి సంచారం</th>
                <th className="py-1 px-1.5 text-center border border-[#8B6914] w-10">స్కోరు</th>
                <th className="py-1 px-1.5 text-left border border-[#8B6914]">కెరీర్, ఆర్థికం, కుటుంబం & మాస పరిహారం</th>
                <th className="py-1 px-1.5 text-left border border-[#8B6914] w-24">శుభ తేదీలు</th>
              </tr>
            </thead>
            <tbody>
              {varshaphalaReport.twelveMonthForecasts.map((m, idx) => (
                <tr key={m.monthNumber} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-bold text-[#7A1818]">
                    <div>{m.monthNumber}. {m.calendarMonthLabelTe}</div>
                    <div className="text-[8px] font-mono-tabular text-[#5C3A21] font-normal">{m.dateRangeTe}</div>
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 text-center font-semibold text-[#144D3E]">
                    {m.sunTransitRasiTe.split(' ')[0]}
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 text-center font-mono-tabular font-bold text-[#7A1818]">
                    {m.fortuneScorePct}%
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 leading-tight">
                    <strong>వృత్తి/ధనం:</strong> {m.careerAndWealthTe} <strong>పరిహారం:</strong> {m.monthlyRemedyTe}
                  </td>
                  <td className="py-0.5 px-1.5 border border-[#8B6914]/50 font-mono-tabular text-[8.5px] text-[#144D3E]">
                    {m.auspiciousDatesTe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 14: SAPTA — సప్త-సంప్రదాయ సమన్వయం (multi-school convergence)        */}
      {/* ===================================================================== */}
      <section id="grantha-p21" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={21} pageTitleTe="పండిత విచారణ — సప్త-సంప్రదాయ సమన్వయం (Multi-School Convergence)" />

        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2.5 mb-2 text-[10.5px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">పద్ధతి: </strong>
          ఒకే భావాన్ని ఏడు స్వతంత్ర సంప్రదాయాలు విడివిడిగా లెక్కించాయి — పారాశరీ (భావేశ స్థానం · క్షేత్రం · నివాసులు),
          అష్టకవర్గ (సర్వాష్టకవర్గ బిందువులు, సగటు 28.08), జైమిని (చర కారకులు AK…DK · రాశి దృష్టి), వింశోత్తరి
          (మహాదశా/భుక్తి అధిపతుల భావ సంబంధం), కేపీ (కస్ప్ సబ్-లార్డ్, 249 ఉప-విభాగం), చరదశ (నడుస్తున్న జైమిని రాశి దశ · రాశి దృష్టి),
          తాజిక (ఈ సంవత్సరపు వర్ష లగ్నం · ముంథ · వర్షేశుడు). ప్రతి స్కోరు −2 … +2.
          ఒక్క పద్ధతి తీర్పు కాదు — సగటు <em>మరియు</em> వ్యాప్తి రెండూ చూడాలి. లగ్నం {samanyaya.lagnaRasiTe} · జన్మ నక్షత్రం {samanyaya.lagnaMasaTe}.
        </div>

        <div className="grid grid-cols-4 gap-1 mb-2 text-[9px]">
          {samanyaya.karakas.map((k) => (
            <div key={k.code} className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">
              <span className="font-bold text-[#7A1818]">{k.code}</span> · {k.labelTe}
              <div className="text-[#5C3A21]">{k.planetTe} ({k.degreeInSign.toFixed(2)}°)</div>
            </div>
          ))}
        </div>

        <table className="w-full border-collapse border border-[#8B6914] text-[9.5px]">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-1 px-1.5 text-left font-bold w-[17%]">భావం (జీవనాంగం)</th>
              <th className="py-1 px-1 text-center font-bold">పారా</th>
              <th className="py-1 px-1 text-center font-bold">అష్ట</th>
              <th className="py-1 px-1 text-center font-bold">జైమి</th>
              <th className="py-1 px-1 text-center font-bold">వింశో</th>
              <th className="py-1 px-1 text-center font-bold">కేపీ</th>
              <th className="py-1 px-1 text-center font-bold">చరదశ</th>
              <th className="py-1 px-1 text-center font-bold">తాజిక</th>
              <th className="py-1 px-1 text-center font-bold">సగటు</th>
              <th className="py-1 px-1 text-center font-bold">వ్యా.</th>
              <th className="py-1 px-1 text-left font-bold">ప్రధాన తీర్పు / కాలం</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {samanyaya.domains.map((d, idx) => {
              const tone = d.consensusScore >= 0.6 ? '#1F6B5E' : d.consensusScore <= -0.6 ? '#9C3B12' : '#7A5A12';
              const cell = (v: number) => (
                <td
                  className="py-0.5 px-1 text-center font-mono"
                  style={{ color: v >= 1 ? '#1F6B5E' : v <= -1 ? '#9C3B12' : '#5C3A21' }}
                >
                  {v > 0 ? '+' : ''}{v.toFixed(1)}
                </td>
              );
              const vs = d.verdicts;
              return (
                <tr key={d.house} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                  <td className="py-0.5 px-1.5 leading-tight">
                    <span className="font-bold text-[#7A1818]">{d.house}.</span> {d.domainTe}
                  </td>
                  {cell(vs[0].score)}
                  {cell(vs[1].score)}
                  {cell(vs[2].score)}
                  {cell(vs[3].score)}
                  {cell(vs[4].score)}
                  {cell(vs[5]?.score ?? 0)}
                  {cell(vs[6]?.score ?? 0)}
                  <td className="py-0.5 px-1 text-center font-bold font-mono" style={{ color: tone }}>
                    {d.consensusScore > 0 ? '+' : ''}{d.consensusScore.toFixed(2)}
                  </td>
                  <td className="py-0.5 px-1 text-center font-mono text-[#5C3A21]">{d.spread.toFixed(1)}</td>
                  <td className="py-0.5 px-1.5 leading-tight text-[8.5px]">
                    {d.phalaTe}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[9px] leading-relaxed">
          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2">
            <div className="font-bold text-[#7A1818] mb-0.5">సమగ్ర స్థితి</div>
            {samanyaya.samasyayaTe}
          </div>
          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2">
            <div className="font-bold text-[#7A1818] mb-0.5">పద్ధతుల భారం</div>
            {samanyaya.prabhutvaTe}
            <div className="mt-1 text-[8.5px] text-[#5C3A21]">
              గమనిక: 6/8/12 భావాల్లో ఎక్కువ స్కోరు అంటే ఆ భావ విషయాలు (రోగం/ఋణం/ఆటంకాలు) సక్రియం — “శుభం” అని అర్థం కాదు.
            </div>
          </div>
        </div>

        <div className="mt-2 border-t border-[#8B6914] pt-1.5 text-[8.5px] text-[#5C3A21] leading-relaxed">
          ప్రమాణం: ప్రతి తీర్పు వెనుక లెక్క ఉంది (గణన వివరాలు ఇంటరాక్టివ్ గ్రంథంలో); ప్రతి తీర్పుకు గ్రంథ నియమం ఉంది.
          యాంత్రిక గేట్ <em>npm run verify:sampradaya</em> — 3 జాతకాలు · 1531 తనిఖీలు (స్కోరు పరిధి, ఆధారం, సగటు/వ్యాప్తి గణితం,
          కారకుల అనన్యత, చరదశ/తాజిక ఆధారాలు, దశా కిటికీ తేదీలు). జాతకం చెప్పలేని అంశాలు (పేరు, హోదా, ఆయుర్దాయ సంఖ్య, వ్యాధి నిర్ధారణ) ఇక్కడ కల్పించబడవు.
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 16: YOGA VICHARA — ప్రతి యోగానికి ఆధారం, బలం, ఫలం               */}
      {/* ===================================================================== */}
      <section id="grantha-p22" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={22} pageTitleTe="యోగ విచారం — ప్రతి యోగానికి ఆధారం · బలం · ఫలం · జాగ్రత్త" />

        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2.5 mb-2 text-[9.5px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">సారాంశం: </strong>{yogaVichara.summaryTe}{' '}
          <strong className="text-[#7A1818]">తీర్పు: </strong>{yogaVichara.verdictTe}
        </div>

        <div className="grid grid-cols-4 gap-1.5 mb-2 text-[9px]">
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">ఏర్పడిన యోగాలు <strong className="text-[#7A1818]">{yogaVichara.activeCount}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">రాజ యోగాలు <strong className="text-[#7A1818]">{yogaVichara.rajaYogaCount}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">ధన యోగాలు <strong className="text-[#7A1818]">{yogaVichara.dhanaYogaCount}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">పరిశీలించిన సూత్రాలు <strong className="text-[#7A1818]">{yogaVichara.findings.length}</strong></div>
        </div>

        <table className="w-full border-collapse border border-[#8B6914] text-[8.4px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left w-[17%]">యోగం</th>
              <th className="py-0.5 px-1 text-left w-[13%]">స్థితి · బలం</th>
              <th className="py-0.5 px-1 text-left w-[27%]">ఆధారం (ఈ కుండలిలో)</th>
              <th className="py-0.5 px-1 text-left w-[43%]">ఫలం · జాగ్రత్త</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {yogaVichara.findings.map((y, idx) => (
              <tr key={y.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[3px] px-1 align-top">
                  <div className="font-bold text-[#7A1818]">{y.nameTe}</div>
                  <div className="text-[7.4px] text-[#6E5528]">{y.tier}</div>
                </td>
                <td className="py-[3px] px-1 align-top">
                  <div className={y.present ? 'font-bold text-[#144D3E]' : 'text-[#8A7A66]'}>
                    {y.present ? `ఏర్పడింది · ${y.strengthPct}%` : 'ఏర్పడలేదు'}
                  </div>
                  <div className="text-[7.4px]">{y.present ? y.strengthTe : '—'}</div>
                </td>
                <td className="py-[3px] px-1 align-top">{y.evidenceTe}</td>
                <td className="py-[3px] px-1 align-top">
                  <div>{y.phalamTe}</div>
                  {y.cautionTe && <div className="text-[#7A1818] mt-0.5">జాగ్రత్త: {y.cautionTe}</div>}
                  <div className="text-[7.2px] text-[#6E5528] mt-0.5">{y.sutraTe}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 border border-[#8B6914] bg-[#FBF6E9] p-2">
          <div className="text-[9.5px] font-bold text-[#7A1818] mb-1">దశాధిపతుల యోగ సంబంధం — ఏ దశలో ఏ యోగం ఫలిస్తుంది</div>
          <div className="grid grid-cols-3 gap-1 text-[8.4px]">
            {yogaVichara.dashaLordYogas.map((d) => (
              <div key={d.planetTe} className="border border-[#8B6914]/40 bg-[#FFFEFA] px-1.5 py-1">
                <strong className="text-[#7A1818]">{d.planetTe}</strong>
                <div>{d.yogasTe.length ? d.yogasTe.join(' · ') : 'ప్రత్యేక యోగం లేదు'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 17: ASHTAKAVARGA BHAVA PHALA & AVAKAHADA                        */}
      {/* ===================================================================== */}
      <section id="grantha-p23" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={23} pageTitleTe="అష్టకవర్గ భావ ఫలాలు & అవకహడా చక్రం — బిందువుల నుంచే తీర్పు" />

        <div className="grid grid-cols-5 gap-1.5 mb-2 text-[9px]">
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">మొత్తం బిందువులు <strong className="text-[#7A1818]">{avPhala.totalBindus}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">సగటు <strong className="text-[#7A1818]">{avPhala.averageBindus.toFixed(2)}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">కేంద్ర సగటు <strong>{avPhala.kendraAvg.toFixed(1)}</strong> · త్రికోణ <strong>{avPhala.trikonaAvg.toFixed(1)}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">దుస్థాన సగటు <strong>{avPhala.dusthanaAvg.toFixed(1)}</strong> · ఉపచయ <strong>{avPhala.upachayaAvg.toFixed(1)}</strong></div>
          <div className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">బలవత్ {avPhala.bandCounts.strong} · మధ్యమ {avPhala.bandCounts.moderate} · శ్రద్ధార్హ {avPhala.bandCounts.weak}</div>
        </div>

        <table className="w-full border-collapse border border-[#8B6914] text-[8.4px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left w-[14%]">భావం · రాశి</th>
              <th className="py-0.5 px-1 text-center w-[6%]">బిందువులు</th>
              <th className="py-0.5 px-1 text-left w-[12%]">బ్యాండ్</th>
              <th className="py-0.5 px-1 text-left w-[18%]">భావాధిపతి స్థితి</th>
              <th className="py-0.5 px-1 text-left w-[28%]">ఫలం</th>
              <th className="py-0.5 px-1 text-left w-[22%]">పరిహారం</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {avPhala.rows.map((r, idx) => (
              <tr key={r.house} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[3px] px-1 align-top">
                  <div className="font-bold text-[#7A1818]">{r.house}. {r.houseNameTe}</div>
                  <div className="text-[7.4px]">{r.signTe} · {r.houseThemeTe}</div>
                </td>
                <td className="py-[3px] px-1 align-top text-center font-bold text-[#144D3E]">{r.bindus}</td>
                <td className="py-[3px] px-1 align-top">
                  <div className="font-semibold">{r.bandLabelTe}</div>
                  <div className="text-[7.2px]">{r.bandRangeTe}</div>
                </td>
                <td className="py-[3px] px-1 align-top">
                  <div>{r.lordTe}</div>
                  <div className="text-[7.4px]">{r.lordPlacementTe} · రాశి బిందువులు {r.lordRasiBindus}</div>
                </td>
                <td className="py-[3px] px-1 align-top">{r.phalaTe}</td>
                <td className="py-[3px] px-1 align-top text-[#144D3E]">{r.pariharaTe}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-1.5 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[9px] leading-relaxed">
          <div><strong className="text-[#7A1818]">బలమైన భావాలు: </strong>{avPhala.strongHousesTe}</div>
          <div><strong className="text-[#7A1818]">శ్రద్ధార్హ భావాలు: </strong>{avPhala.weakHousesTe}</div>
          <div><strong className="text-[#7A1818]">లగ్న–సప్తమ నిష్పత్తి: </strong>{avPhala.lagnaSeventhNoteTe}</div>
          <div><strong className="text-[#7A1818]">రాశి క్రమం: </strong>{avPhala.rasiRankingTe}</div>
        </div>

        <div className="mt-2">
          <h3 className="text-[10px] font-bold text-[#7A1818] mb-1">అవకహడా చక్రం — నామ, రాశి, నక్షత్ర ప్రమాణాలు</h3>
          <div className="grid grid-cols-3 gap-1 text-[8.4px]">
            {avakahada.rows.map((r) => (
              <div key={r.key} className="border border-[#8B6914]/40 bg-[#FFFEFA] px-1.5 py-[3px]">
                <span className="text-[#6E5528]">{r.labelTe}: </span>
                <strong className="text-[#7A1818]">{r.valueTe}</strong>
                {r.noteTe && <span className="text-[7.4px]"> — {r.noteTe}</span>}
              </div>
            ))}
          </div>
          <div className="mt-1 border border-[#8B6914] bg-[#FBF6E9] px-1.5 py-1 text-[8.6px] leading-relaxed">
            <strong className="text-[#7A1818]">ఘట చక్రం: </strong>{avakahada.ghata.janmaRasiTe} · {avakahada.ghata.tithiGroupTe} — {avakahada.ghata.meaningTe}
            <div className="mt-0.5"><strong className="text-[#7A1818]">పంచధా మైత్రి: </strong>{avakahada.summaryTe}</div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 18: SOOKSHMA NADI — KP SUB LORDS, PARIVARTANA, BADHAKA             */}
      {/* ===================================================================== */}
      <section id="grantha-p24" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={24} pageTitleTe="సూక్ష్మ నాడీ విచారం — కేపీ సబ్-లార్డ్ · పరివర్తన · బాధక-మారక" />

        <h3 className="text-[10px] font-bold text-[#7A1818] mb-1">కేపీ (కృష్ణమూర్తి) స్టార్-లార్డ్ · సబ్-లార్డ్ పట్టిక — 249 ఉప-విభాగ క్రమం</h3>
        <table className="w-full border-collapse border border-[#8B6914] text-[8.4px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left w-[16%]">అంశం</th>
              <th className="py-0.5 px-1 text-left w-[12%]">రాశి · అంశ</th>
              <th className="py-0.5 px-1 text-left w-[16%]">నక్షత్రం · తారాధిపతి</th>
              <th className="py-0.5 px-1 text-left w-[10%]">సబ్-లార్డ్</th>
              <th className="py-0.5 px-1 text-left w-[10%]">సూచిత భావాలు</th>
              <th className="py-0.5 px-1 text-left w-[36%]">కేపీ తీర్పు</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {sookshma.kpSubLordTable.map((k, idx) => (
              <tr key={`${k.entityTitleTe}-${idx}`} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[3px] px-1 align-top font-bold text-[#7A1818]">{k.entityTitleTe}</td>
                <td className="py-[3px] px-1 align-top">{k.rasiNameTe} · {k.degreeFormatted}</td>
                <td className="py-[3px] px-1 align-top">{k.nakshatraNameTe} · {k.starLordTe}</td>
                <td className="py-[3px] px-1 align-top font-semibold text-[#144D3E]">{k.subLordTe}</td>
                <td className="py-[3px] px-1 align-top">{k.signifiedHouses.join(', ')}</td>
                <td className="py-[3px] px-1 align-top">{k.kpVerdictTe}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 grid grid-cols-1 gap-1.5">
          <div>
            <h3 className="text-[10px] font-bold text-[#7A1818] mb-1">కేపీ జీవన ఘటనల తీర్పు — కస్ప్ సబ్-లార్డ్ ఆధారంగా</h3>
            <table className="w-full border-collapse border border-[#8B6914] text-[8.4px] leading-tight">
              <thead>
                <tr className="bg-[#7A1818] text-white">
                  <th className="py-0.5 px-1 text-left w-[14%]">రంగం</th>
                  <th className="py-0.5 px-1 text-left w-[8%]">కస్ప్</th>
                  <th className="py-0.5 px-1 text-left w-[12%]">కస్ప్ సబ్-లార్డ్</th>
                  <th className="py-0.5 px-1 text-left w-[14%]">అనుకూల భావాలు</th>
                  <th className="py-0.5 px-1 text-left w-[52%]">తీర్పు</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8B6914]/40">
                {sookshma.kpLifeEventVerdicts.map((k, idx) => (
                  <tr key={`${k.domainTe}-${idx}`} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                    <td className="py-[3px] px-1 align-top font-semibold text-[#7A1818]">{k.domainTe}</td>
                    <td className="py-[3px] px-1 align-top">{k.primaryCusp}</td>
                    <td className="py-[3px] px-1 align-top">{k.cuspSubLordTe}</td>
                    <td className="py-[3px] px-1 align-top">{k.favorableHouses}</td>
                    <td className="py-[3px] px-1 align-top">{k.verdictTe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sookshma.parivartanaYogas.length > 0 && (
            <div className="border border-[#8B6914] bg-[#FBF6E9] p-2 text-[8.8px]">
              <div className="font-bold text-[#7A1818] mb-0.5">పరివర్తన యోగాలు (ఇరువురి గ్రహాలు ఇచ్చిపుచ్చుకున్న స్థానాలు) — {sookshma.parivartanaYogas.length}</div>
              {sookshma.parivartanaYogas.map((p, idx) => (
                <div key={idx} className="mb-0.5">
                  <strong>{p.typeTe}</strong> · {p.planet1Te} ({p.house1}) ↔ {p.planet2Te} ({p.house2}) — {p.effectTe}{' '}
                  <span className="text-[#5C3A21]">{p.descriptionTe}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2 text-[8.8px] leading-relaxed">
            <div className="font-bold text-[#7A1818] mb-0.5">బాధక · మారక విచారం</div>
            <div>లగ్న స్వభావం: {sookshma.badhakaMarakaDiagnostic.lagnaModalityTe} · బాధక భావం {sookshma.badhakaMarakaDiagnostic.badhakaHouse} ({sookshma.badhakaMarakaDiagnostic.badhakaRasiTe}) · బాధకేశుడు {sookshma.badhakaMarakaDiagnostic.badhakeshPlanetTe} — {sookshma.badhakaMarakaDiagnostic.badhakeshPlacedHouse}వ భావంలో.</div>
            <div>{sookshma.badhakaMarakaDiagnostic.badhakaImpactTe}</div>
            <div className="text-[#144D3E]">పరిహారం: {sookshma.badhakaMarakaDiagnostic.badhakaRemedyTe}</div>
            <div>మారక భావాలు {sookshma.badhakaMarakaDiagnostic.marakaHouses.join(', ')} · అధిపతులు {sookshma.badhakaMarakaDiagnostic.marakaLordsTe.join(', ')}</div>
            <div className="text-[#7A1818]">{sookshma.badhakaMarakaDiagnostic.marakaCautionTe}</div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 19: JEEVITA VISTARA — DOMAIN-WISE DEEP READING                     */}
      {/* ===================================================================== */}
      <section id="grantha-p25" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={25} pageTitleTe="జీవిత విస్తర — ప్రతి జీవన రంగం లోతైన విచారం (శాస్త్రం · విశ్లేషణ · కాలం · పరిహారం)" />

        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2 mb-2 text-[9.5px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">సమగ్ర తీర్పు: </strong>{vistara.overallTe}
          <div className="mt-0.5"><strong className="text-[#144D3E]">అత్యుత్తమ రంగం: </strong>{vistara.bestDomainTe}</div>
          <div><strong className="text-[#7A1818]">శ్రద్ధ అవసరమైన రంగం: </strong>{vistara.watchDomainTe}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[8.2px] leading-tight">
          {vistara.domains.map((d) => (
            <div key={d.id} className="border border-[#8B6914] bg-[#FFFEFA] p-1.5">
              <div className="flex items-baseline justify-between border-b border-[#8B6914]/40 pb-0.5 mb-0.5">
                <span className="font-bold text-[#7A1818] text-[9px]">{d.number}. {d.titleTe}</span>
                <span className="font-bold text-[#144D3E]">{d.scorePct}% · {d.verdictTe}</span>
              </div>
              <div className="text-[7.6px] text-[#6E5528] mb-0.5">{d.subtitleTe} · భావాలు {d.housesTe}</div>
              <div className="mb-0.5"><strong>శాస్త్రం: </strong>{d.foundationTe}</div>
              {d.analysis.slice(0, 2).map((a, i) => (
                <div key={i} className="mb-0.5">
                  <strong className="text-[#5C3A21]">{a.headingTe}: </strong>{a.bodyTe}
                </div>
              ))}
              {d.strengthsTe.length > 0 && (
                <div className="text-[#144D3E]">బలం: {d.strengthsTe.slice(0, 2).join(' · ')}</div>
              )}
              {d.cautionsTe.length > 0 && (
                <div className="text-[#7A1818]">జాగ్రత్త: {d.cautionsTe.slice(0, 2).join(' · ')}</div>
              )}
              {d.timing.length > 0 && (
                <div className="text-[7.6px]">
                  <strong>కాలం: </strong>
                  {d.timing.slice(0, 2).map((t) => `${t.periodTe} (${t.yearsTe})${t.isRunning ? ' ★' : ''}`).join(' · ')}
                </div>
              )}
              <div className="text-[#5C3A21]">పరిహారం: {d.remedyTe}</div>
            </div>
          ))}
        </div>
      </section>

      <BhuktiPhalaPage part={0} adBook={adBook} id="grantha-p26"
        header={<PageHeaderStrip pageNum={26} pageTitleTe="వింశోత్తరి భుక్తి ఫలాలు (1/3) — 81 అంతర్దశలకు విడివిడి ఫలితం" />} />
      <BhuktiPhalaPage part={1} adBook={adBook} id="grantha-p27"
        header={<PageHeaderStrip pageNum={27} pageTitleTe="వింశోత్తరి భుక్తి ఫలాలు (2/3) — 81 అంతర్దశలకు విడివిడి ఫలితం" />} />
      <BhuktiPhalaPage part={2} adBook={adBook} id="grantha-p28"
        header={<PageHeaderStrip pageNum={28} pageTitleTe="వింశోత్తరి భుక్తి ఫలాలు (3/3) — 81 అంతర్దశలకు విడివిడి ఫలితం" />} />

      {/* ===================================================================== */}
      {/* PAGE: గ్రహ అవస్థలు — బాలాది · దీప్తాది · జాగ్రదాది · యుద్ధం · అస్తంగతం   */}
      {/* ===================================================================== */}
      <section id="grantha-p29" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={29} pageTitleTe="గ్రహ అవస్థలు — బాలాది · దీప్తాది · జాగ్రదాది · గ్రహ యుద్ధం · అస్తంగతం" />

        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2 mb-2 text-[9px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">అవస్థ అంటే ఏమిటి: </strong>
          గ్రహం ఏ రాశిలో ఉంది అనేది ఒక విషయం; ఆ గ్రహం ఇప్పుడు <em>ఎంత బలంగా పనిచేస్తోంది</em> అనేది వేరే విషయం.
          అదే అవస్థ. బృహత్ పారాశర 45వ అధ్యాయంలో మూడు కోణాల నుంచి చెప్పబడింది —
          <strong> బాలాది</strong> (రాశిలోని డిగ్రీ), <strong>దీప్తాది</strong> (స్థాన గౌరవం),
          <strong> జాగ్రదాది</strong> (మేల్కొన్నదా నిద్రలో ఉందా). మూడూ కలిపి ఇక్కడ చూపబడ్డాయి.
          <div className="mt-0.5 text-[#5C3A21]">{avastha.summaryTe}</div>
        </div>

        <table className="w-full border-collapse border border-[#8B6914] text-[7.8px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left w-[10%]">గ్రహం</th>
              <th className="py-0.5 px-1 text-left w-[9%]">స్థానం</th>
              <th className="py-0.5 px-1 text-left w-[7%]">బాలాది</th>
              <th className="py-0.5 px-1 text-left w-[8%]">దీప్తాది</th>
              <th className="py-0.5 px-1 text-left w-[9%]">జాగ్రదాది</th>
              <th className="py-0.5 px-1 text-left w-[9%]">అస్తంగత / యుద్ధం</th>
              <th className="py-0.5 px-1 text-left w-[48%]">ఈ గ్రహం ఇక్కడ ఎలా పనిచేస్తుంది</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {avastha.rows.map((r, idx) => (
              <tr key={r.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[3px] px-1 align-top font-bold text-[#7A1818]">{r.nameTe}</td>
                <td className="py-[3px] px-1 align-top">
                  {r.rasiTe} {r.degreeInSign.toFixed(2)}°
                </td>
                <td className="py-[3px] px-1 align-top">{r.baladiTe}</td>
                <td className="py-[3px] px-1 align-top">{r.deeptadiTe}</td>
                <td className="py-[3px] px-1 align-top">{r.jagradadiTe}</td>
                <td className="py-[3px] px-1 align-top">
                  {r.combustionDeg !== null ? (
                    <span className="text-[#7A1818] font-semibold">అస్తంగత ({r.combustionDeg.toFixed(1)}°)</span>
                  ) : r.warResult ? (
                    <span className="text-[#7A1818] font-semibold">{r.warResult === 'won' ? 'యుద్ధ విజేత' : 'యుద్ధ ఓటమి'}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-[3px] px-1 align-top">
                  <div className="font-semibold">{r.compactTe}</div>
                  <div className="text-[6.8px] text-[#4A3B2C] leading-snug">
                    {r.combustionDeg !== null
                      ? `సూర్యునికి ${r.combustionDeg.toFixed(1)}° దూరం — అస్తంగత కోణం లోపు; ఫలం మరుగున`
                      : r.warResult
                        ? r.warNoteTe
                        : `${r.baladiTe === 'యువ' ? 'నిండు బలం' : r.baladiTe === '—' ? 'స్థాన బలమే ప్రధానం' : 'ఫల భాగం పరిమితం'} — ${r.jagradadiTe === 'జాగ్రత్' ? 'మేల్కొని పనిచేస్తుంది' : r.jagradadiTe === 'స్వప్న' ? 'సగం ఫలం' : r.jagradadiTe === 'సుషుప్తి' ? 'ఆలస్యంగా ఫలించే తత్వం' : 'అవస్థలు వర్తించవు'}`}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[8.4px] leading-snug">
          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2">
            <div className="font-bold text-[#7A1818] mb-0.5">గ్రహ యుద్ధం (గ్రహ యుద్ధ నియమం)</div>
            <ul className="list-disc pl-3 space-y-0.5">
              {avastha.warsTe.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            <div className="mt-1 text-[7.6px] text-[#5C3A21]">
              ఒకే రాశిలో 1° లోపు నిలిచిన రెండు తారా గ్రహాలు యుద్ధం చేస్తాయి; ఉత్తర శరం (అక్షాంశం) ఎక్కువ ఉన్నది గెలుస్తుంది.
            </div>
          </div>
          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2">
            <div className="font-bold text-[#7A1818] mb-0.5">అవస్థల ఫల భాగం</div>
            <div className="grid grid-cols-5 gap-1 text-center text-[7.6px]">
              {['బాల ¼', 'కుమార ½', 'యువ 1', 'వృద్ధ ¼', 'మృత 0'].map((x) => (
                <div key={x} className="border border-[#8B6914]/40 px-0.5 py-0.5">
                  {x}
                </div>
              ))}
            </div>
            <div className="mt-1 text-[7.6px] text-[#5C3A21]">{avastha.methodNoteTe}</div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE: దశా × గోచార సమన్వయం — రాబోయే 12 నెలలు · ప్రత్యంతర దశలు          */}
      {/* ===================================================================== */}
      <section id="grantha-p30" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={30} pageTitleTe={`దశా × గోచార సమన్వయం — ${samanvaya.asOfISO} నుంచి రాబోయే 12 నెలలు`} />

        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2 mb-2 text-[9px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">నడుస్తున్న కాలం: </strong>
          {samanvaya.runningTe}
          <div className="mt-0.5">{samanvaya.summaryTe}</div>
        </div>

        <div className="text-[8.6px] font-bold text-[#7A1818] mb-0.5">నెలవారీ కాలరేఖ</div>
        <table className="w-full border-collapse border border-[#8B6914] text-[7.6px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left w-[10%]">నెల</th>
              <th className="py-0.5 px-1 text-left w-[8%]">మహాదశ / భుక్తి</th>
              <th className="py-0.5 px-1 text-left w-[7%]">ప్రత్యంతర</th>
              <th className="py-0.5 px-1 text-left w-[19%]">రాశి మార్పులు (గోచారం)</th>
              <th className="py-0.5 px-1 text-left w-[11%]">శని · గురు · రాహు<br />జన్మ రాశి నుంచి</th>
              <th className="py-0.5 px-1 text-right w-[5%]">SAV</th>
              <th className="py-0.5 px-1 text-right w-[6%]">స్కోరు</th>
              <th className="py-0.5 px-1 text-left w-[34%]">తీర్మానం (గణన నుంచే)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {samanvaya.months.map((m, idx) => (
              <tr key={m.startISO} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[2px] px-1 align-top font-semibold text-[#7A1818]">
                  {m.monthTe}
                  <div className="font-normal text-[6.6px] text-[#5C3A21]">
                    {m.startISO.slice(5)} → {m.endISO.slice(5)}
                  </div>
                </td>
                <td className="py-[2px] px-1 align-top">
                  {m.mdTe} / {m.adTe}
                </td>
                <td className="py-[2px] px-1 align-top">{m.pdTe}</td>
                <td className="py-[2px] px-1 align-top">{m.ingressTe}</td>
                <td className="py-[2px] px-1 align-top">{m.keyTransitsTe}</td>
                <td className="py-[2px] px-1 align-top text-right font-mono-tabular">{m.savBindus}</td>
                <td className="py-[2px] px-1 align-top text-right font-bold">{m.score}</td>
                <td className="py-[2px] px-1 align-top">{m.verdictTe}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-1.5 text-[8.6px] font-bold text-[#7A1818] mb-0.5">
          నడుస్తున్న భుక్తిలో ప్రత్యంతర దశలు (9)
        </div>
        <table className="w-full border-collapse border border-[#8B6914] text-[7.6px]">
          <tbody>
            <tr className="bg-[#F9F4E8]">
              {samanvaya.pratyantars.slice(0, 5).map((p) => (
                <td
                  key={`${p.startISO}-a`}
                  className={`px-1 py-[2px] align-top border border-[#8B6914]/40 ${
                    p.running ? 'bg-[#FBF0C9] font-bold text-[#7A1818]' : ''
                  }`}
                >
                  {p.lordTe}
                  {p.running ? ' ★' : ''}
                  <div className="font-normal text-[6.6px]">
                    {p.startISO.slice(0, 7)} → {p.endISO.slice(0, 7)}
                  </div>
                  <div className="font-normal text-[6.6px] text-[#5C3A21]">{p.widthTe}</div>
                </td>
              ))}
            </tr>
            <tr className="bg-[#F9F4E8]">
              {samanvaya.pratyantars.slice(5).map((p) => (
                <td
                  key={`${p.startISO}-b`}
                  className={`px-1 py-[2px] align-top border border-[#8B6914]/40 ${
                    p.running ? 'bg-[#FBF0C9] font-bold text-[#7A1818]' : ''
                  }`}
                >
                  {p.lordTe}
                  {p.running ? ' ★' : ''}
                  <div className="font-normal text-[6.6px]">
                    {p.startISO.slice(0, 7)} → {p.endISO.slice(0, 7)}
                  </div>
                  <div className="font-normal text-[6.6px] text-[#5C3A21]">{p.widthTe}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className="mt-1.5 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[7.8px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">తీర్మానం ఎలా లెక్కించబడింది: </strong>
          {samanvaya.methodNoteTe}
          <div className="mt-0.5">
            దశా కాలం ముగింపు తేదీలు నక్షత్ర గతి ఆధారంగా 365.25 రోజుల సంవత్సరంతో; గోచార రాశి మార్పులు దృక్ సిద్ధాంత
            స్థానాల నుంచి నెల మొదటి/చివరి రోజు పోలికతో తీసుకోబడ్డాయి.
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE: GOCHARA — నడుస్తున్న గోచారం · సాడే సాతి · వేధ                    */}
      {/* ===================================================================== */}
      <section id="grantha-p31" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={31} pageTitleTe={`గోచార ఫలం — ${gochara.asOfISO} నాటి గ్రహ సంచారం (జన్మ రాశి ${gochara.janmaRasiTe} నుంచి) · సాడే సాతి · వేధ`} />

        <div className="mb-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[9.5px] leading-snug text-justify">
          <strong className="text-[#7A1818]">గోచార నియమం: </strong>
          గోచారం జన్మ రాశి (చంద్ర రాశి) నుంచి లెక్కిస్తారు — లగ్నం నుంచి కాదు.
          జన్మ రాశి <strong>{gochara.janmaRasiTe}</strong>, జన్మ నక్షత్రం <strong>{gochara.janmaNakshatraTe}</strong>.
          <div className="mt-0.5">{gochara.summaryTe}</div>
        </div>

        <table className="w-full border-collapse border border-[#8B6914] text-[8.4px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left w-[10%]">గ్రహం</th>
              <th className="py-0.5 px-1 text-left w-[13%]">గోచార స్థానం</th>
              <th className="py-0.5 px-1 text-left w-[6%]">భావం</th>
              <th className="py-0.5 px-1 text-left w-[8%]">ఫలం</th>
              <th className="py-0.5 px-1 text-left w-[15%]">వేధ (నిరోధం)</th>
              <th className="py-0.5 px-1 text-left w-[24%]">వివరణ</th>
              <th className="py-0.5 px-1 text-left w-[11%]">తదుపరి రాశి</th>
              <th className="py-0.5 px-1 text-right w-[6%]">రోజులు</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {gochara.grahas.map((g, idx) => (
              <tr key={g.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[3px] px-1 align-top font-bold text-[#7A1818]">
                  {g.nameTe}{g.isRetrograde ? ' (వ)' : ''}
                </td>
                <td className="py-[3px] px-1 align-top">
                  {g.signTe} {g.degreeInSign.toFixed(2)}°<div className="text-[7.2px]">{g.nakshatraTe}-{g.pada}</div>
                </td>
                <td className="py-[3px] px-1 align-top text-center font-semibold">{g.houseFromMoon}</td>
                <td className="py-[3px] px-1 align-top">
                  <span className={g.verdict === 'good' ? 'text-[#144D3E] font-bold' : g.verdict === 'bad' ? 'text-[#7A1818] font-bold' : 'text-[#8A6A20] font-bold'}>
                    {g.verdictTe}
                  </span>
                </td>
                <td className="py-[3px] px-1 align-top">
                  {g.vedhaBy && g.vedhaHouse ? `${g.vedhaBy} — ${g.vedhaHouse}వ భావం నుంచి` : 'వేధ లేదు'}
                </td>
                <td className="py-[3px] px-1 align-top">{g.effectTe}</td>
                <td className="py-[3px] px-1 align-top">{g.nextIngressSignTe}<div className="text-[7.2px]">{g.nextIngressISO}</div></td>
                <td className="py-[3px] px-1 align-top text-right font-mono-tabular">{g.daysToIngress}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[8.6px] leading-snug">
          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2">
            <div className="font-bold text-[#7A1818] mb-0.5">సాడే సాతి (గోచార శని)</div>
            <div className={gochara.sadeSati.active ? 'font-bold text-[#7A1818]' : 'font-bold text-[#144D3E]'}>
              {gochara.sadeSati.active ? `నడుస్తోంది — ${gochara.sadeSati.phaseTe}` : 'ఇప్పుడు లేదు'}
            </div>
            {gochara.sadeSati.active && (
              <div className="mt-0.5">
                కాలం: <strong>{gochara.sadeSati.startISO?.slice(0, 10)} → {gochara.sadeSati.endISO?.slice(0, 10)}</strong>
              </div>
            )}
            <div className="mt-0.5 text-[#5C3A21]">{gochara.sadeSati.noteTe}</div>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <div className={`border px-1 py-0.5 ${gochara.ashtamaShani ? 'border-[#7A1818] font-bold text-[#7A1818]' : 'border-[#8B6914]/40'}`}>
                అష్టమ శని: {gochara.ashtamaShani ? 'ఉంది' : 'లేదు'}
              </div>
              <div className={`border px-1 py-0.5 ${gochara.kantakaShani ? 'border-[#7A1818] font-bold text-[#7A1818]' : 'border-[#8B6914]/40'}`}>
                కంటక శని: {gochara.kantakaShani ? 'ఉంది' : 'లేదు'}
              </div>
            </div>
          </div>

          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2">
            <div className="font-bold text-[#7A1818] mb-0.5">రాబోయే రాశి మార్పులు (సంచార క్రమం)</div>
            <ol className="list-decimal ml-4 space-y-0.5">
              {gochara.upcomingIngresses.slice(0, 7).map((u, i) => (
                <li key={`${u.grahaId}-${i}`}>
                  <strong>{u.grahaTe}</strong> → {u.signTe} · {u.dateISO} ({u.daysAway} రోజులు)
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[8.6px] leading-relaxed">
          <strong className="text-[#7A1818]">చదవడం ఎలా: </strong>
          ఇది ఈ రోజు నాటి గోచారం — జన్మ కుండలి శాశ్వతం, గోచారం ప్రతి రోజూ మారుతుంది.
          పై పట్టికలో “భావం” అనేది జన్మ రాశి నుంచి లెక్కించిన స్థానం; వేధ ఉన్న శుభ గోచారం ఫలించదు (ఫలదీపిక 26),
          సూర్యుడు–శని మినహాయింపు. సాడే సాతి 7½ సంవత్సరాల శని సంచారం — ఇది శిక్షణా కాలం, శాపం కాదు:
          ఇక్కడ శ్రమ పడ్డది తర్వాత స్థిరంగా నిలుస్తుంది.
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 23: GRAHA SAHAYAKA — ఏ గ్రహం ఏ రంగానికి సహాయం                     */}
      {/* ===================================================================== */}
      <section id="grantha-p32" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={32} pageTitleTe="గ్రహ సహాయకులు — ఏ గ్రహం ఏ జీవన రంగానికి తోడ్పడుతుంది" />

        <table className="w-full border-collapse border border-[#8B6914] text-[8.4px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left w-[12%]">గ్రహం</th>
              <th className="py-0.5 px-1 text-left w-[8%]">భావం · స్థితి</th>
              {AREAS.map((a) => (
                <th key={a.id} className="py-0.5 px-1 text-center w-[7%]">{a.labelTe}</th>
              ))}
              <th className="py-0.5 px-1 text-left w-[16%]">బలమైన రంగం</th>
              <th className="py-0.5 px-1 text-left w-[14%]">బలహీన రంగం</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {sahayaka.rows.map((r, idx) => (
              <tr key={r.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[3px] px-1 align-top font-bold text-[#7A1818]">{r.nameTe}</td>
                <td className="py-[3px] px-1 align-top">{r.house} · {r.dignityTe.split('(')[0]}</td>
                {AREAS.map((a) => {
                  const v = r.scores[a.id] ?? 0;
                  return (
                    <td key={a.id} className={`py-[3px] px-1 text-center ${v >= 70 ? 'text-[#144D3E] font-bold' : v < 45 ? 'text-[#7A1818]' : ''}`}>{v}</td>
                  );
                })}
                <td className="py-[3px] px-1 align-top">{r.bestAreaTe}</td>
                <td className="py-[3px] px-1 align-top">{r.weakAreaTe}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-[8.6px]">
          {AREAS.map((a) => (
            <div key={a.id} className="border border-[#8B6914]/50 bg-[#FBF6E9] px-1.5 py-1">
              <strong className="text-[#7A1818]">{a.labelTe}</strong> — సగటు {(sahayaka.averages[a.id] ?? 0).toFixed(1)}
              <div className="text-[7.6px]">ప్రధాన భావాలు {a.primaryHouses.join('/')} · కారకుడు {a.karakaTe}</div>
            </div>
          ))}
        </div>

        <div className="mt-1.5 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[8.8px] leading-relaxed">
          <div><strong className="text-[#7A1818]">రంగాల క్రమం: </strong>{sahayaka.areaRankingTe}</div>
          <div><strong className="text-[#7A1818]">గ్రహాల క్రమం: </strong>{sahayaka.planetRankingTe}</div>
          <div><strong className="text-[#7A1818]">సమన్వయం: </strong>{sahayaka.synthesisTe}</div>
          <div className="text-[7.6px] text-[#5C3A21] mt-0.5">{sahayaka.methodNoteTe} {sahayaka.scaleNoteTe}</div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 24: GRANTHA MANDALA — SOURCE APPENDIX                             */}
      {/* ===================================================================== */}
      <section id="grantha-p33" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={33} pageTitleTe="గ్రంథ మండలం — మూల ఆధార గ్రంథములు & సిద్ధాంత ప్రమాణం" />

        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2.5 mb-3 text-[11px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">గ్రంథ ప్రమాణ వాక్యం: </strong>
          గ్రహ స్ఫుటాలు, భావ చలితం, దశలు, అష్టకవర్గం, గోచారం, ముహూర్తం, వాస్తు దిక్కులు — ప్రతి గణన ఏ మూల గ్రంథం
          నుంచి వచ్చిందో, ఆ గ్రంథం ఈ కుండలిలో ఏమి ఇచ్చిందో పక్క వరుసలో ఉంది.
          <strong> {granthaPrayogaSummaryTe(granthaPrayoga)}.</strong>
        </div>

        <table className="w-full border-collapse border border-[#8B6914] text-[10px]">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-1 px-2 text-left font-bold w-[18%]">గ్రంథం</th>
              <th className="py-1 px-2 text-left font-bold w-[13%]">రచయిత / కాలం</th>
              <th className="py-1 px-2 text-left font-bold w-[24%]">ఈ గ్రంథంలో వాడిన సిద్ధాంతం</th>
              <th className="py-1 px-2 text-left font-bold w-[25%]">ఈ జాతకంలో దాని ఫలితం (గణన)</th>
              <th className="py-1 px-2 text-left font-bold w-[20%]">అధ్యాయ / భాగం</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {GRANTHAS.map((g, idx) => (
              <tr key={g.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-1 px-2 border-r border-[#8B6914]/40">
                  <div className="font-bold text-[#7A1818]">{g.nameTe}</div>
                  <div className="text-[8.5px] text-[#5C3A21]">{g.nameSanskrit} · {g.nameEn}</div>
                </td>
                <td className="py-1 px-2 border-r border-[#8B6914]/40">
                  {g.authorTe}
                  <div className="text-[8.5px] text-[#5C3A21]">{g.periodTe}</div>
                </td>
                <td className="py-1 px-2 border-r border-[#8B6914]/40 leading-tight">
                  {g.doctrineTe.slice(0, 2).join(' · ')}
                </td>
                <td
                  className={`py-1 px-2 border-r border-[#8B6914]/40 leading-tight ${
                    granthaPrayoga.find((x) => x.granthaId === g.id)?.applicable === false
                      ? 'text-[#8A6A20] italic'
                      : 'text-[#1A120B]'
                  }`}
                >
                  {granthaPrayoga.find((x) => x.granthaId === g.id)?.phalaTe ?? '—'}
                </td>
                <td className="py-1 px-2 leading-tight text-[9px]">
                  {g.chaptersTe.length > 0 ? g.chaptersTe.join(' · ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[9px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">సప్త-సంప్రదాయ పోలిక: </strong>
          {granthaSampradayaNote}
        </div>


        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2.5 text-[10px] leading-relaxed">
            <div className="font-bold text-[#7A1818] mb-1">గణిత ప్రమాణం (Numerical Standard)</div>
            గ్రహ స్ఫుటాలు: VSOP87 (గ్రహాలు) + ELP-2000 (చంద్రుడు) — astronomy-engine. స్విస్ ఎఫెమెరిస్
            2.10.03 (FLG_SWIEPH, SIDM_LAHIRI, TRUE_NODE) గోల్డెన్ ఫిక్చర్‌తో {ACCURACY.epochs} జనన క్షణాల్లో
            పోల్చగా గరిష్ఠ భేదం {ACCURACY.maxDegText} (≈{ACCURACY.maxArcsecText} ఆర్క్-సెకన్లు); 7 అయనాంశ విధానాలు సహితం. అయనాంశం: లహిరి (చిత్రపక్ష) —
            {chart.ayanamsaFormatted}. సూర్యోదయం/అస్తమయం వక్రీభవన సహిత దృగ్గణిత పద్ధతి.
            పంచాంగ అంగాలు 365 రోజుల స్విస్-ఎఫిమెరిస్ ఫిక్చర్‌తో ధృవీకరించబడ్డాయి (తిథి/నక్షత్ర/యోగ
            365/365, సూర్యోదయం ±1 నిమిషం).
          </div>
          <div className="border border-[#8B6914] bg-[#FBF6E9] p-2.5 text-[10px] leading-relaxed">
            <div className="font-bold text-[#7A1818] mb-1">సంప్రదాయ ప్రమాణం (Traditional Standard)</div>
            అమాంత మాస పద్ధతి (తెలుగు సంప్రదాయం), క్షయ తిథి నియమం, అధిక మాస నిర్ణయం, ఇష్టఘడియలు, ధనుర్మాస
            వైకుంఠ ఏకాదశి నిర్ణయం — తెలంగాణ & ఆంధ్రప్రదేశ్ పంచాంగ సంప్రదాయం ప్రకారం. నిజ ఉత్తరం సూర్య-నీడ
            (శంకు) పద్ధతిలో — దిక్సూచి అయస్కాంత దిక్పాతాన్ని సరిచేసి.
          </div>
        </div>

        <div className="mt-3 border-t-2 border-[#7A1818] pt-2 text-center text-[9.5px] text-[#5C3A21]">
          ఓం తత్ సత్ · శుభమస్తు · సర్వే జనాః సుఖినో భవంతు ·{' '}
          <span className="font-bold text-[#7A1818]">
            గ్రంథ పుట్టిక సమాప్తం — {TOTAL_PAGES} పుటలు
          </span>
        </div>
      </section>
      {/* ===================================================================== */}
      {/* PAGE: గణన పద్ధతి — సూత్రం & గ్రంథ ప్రమాణం (Method Appendix)               */}
      {/* ===================================================================== */}
      <section id="grantha-p34" className="classical-grantha-page print-page-break bg-[#FFFEFA] border-[3px] border-double border-[#7A1818] p-5 sm:p-7 shadow-xl">
        <PageHeaderStrip pageNum={34} pageTitleTe="గణన పద్ధతి — ప్రతి అంకె వెనుక సూత్రం & గ్రంథ ప్రమాణం" />

        <div className="border border-[#8B6914] bg-[#FBF6E9] p-2 mb-2 text-[9px] leading-relaxed text-justify">
          <strong className="text-[#7A1818]">పద్ధతి: </strong>
          ప్రతి అంకె ఏ సూత్రంతో, ఏ గ్రంథ ప్రమాణంతో వచ్చిందో ఇక్కడ చూపబడింది — సూత్రంలో ప్రవేశించిన సంఖ్యలతో సహా,
          కాబట్టి ఎవరైనా స్వతంత్రంగా తిరిగి లెక్కించి సరిచూసుకోవచ్చు. {granthaPrayogaSummaryTe(granthaPrayoga)}.
        </div>

        <table className="w-full border-collapse border border-[#8B6914] text-[7.4px] leading-tight">
          <thead>
            <tr className="bg-[#7A1818] text-white">
              <th className="py-0.5 px-1 text-left font-bold w-[16%]">అంశం</th>
              <th className="py-0.5 px-1 text-left font-bold w-[21%]">ఈ జాతకంలో విలువ</th>
              <th className="py-0.5 px-1 text-left font-bold w-[47%]">సూత్రం (ప్రవేశించిన సంఖ్యలతో)</th>
              <th className="py-0.5 px-1 text-left font-bold w-[16%]">గ్రంథ ప్రమాణం</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B6914]/40">
            {provenance.rows.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-[#FFFEFA]' : 'bg-[#F9F4E8]'}>
                <td className="py-[3px] px-1 align-top font-semibold text-[#7A1818]">{row.subjectTe}</td>
                <td className="py-[3px] px-1 align-top text-[#181412]">{row.valueTe}</td>
                <td className="py-[3px] px-1 align-top text-[#4A3B2C]">{row.derivationTe}</td>
                <td className="py-[3px] px-1 align-top text-[#144D3E]">{row.sourceTe}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 border border-[#8B6914] bg-[#FBF6E9] p-2 text-[8.2px] leading-relaxed">
          <div className="font-bold text-[#7A1818] mb-0.5">ఈ జాతకం చెప్పలేని అంశాలు (ఊహించబడవు)</div>
          <ul className="list-disc pl-3 space-y-[2px] text-[#4A3B2C]">
            {provenance.unverifiableTe.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
