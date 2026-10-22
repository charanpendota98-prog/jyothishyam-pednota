import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Compass,
  Info,
  Moon,
  Orbit,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  computeGocharaReport,
  GRAHA_NAMES_TE,
  type GocharaGrahaEntry,
  type GocharaReport,
} from '../engine/gocharaVedhaEngine.ts';
import { computeDayPanchanga } from '../engine/hinduCalendarEngine.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from '../engine/teluguJathakam.ts';
import { SourceStrip } from './SourceStrip.tsx';
import type { CompleteChartResult } from '../engine/ephemeris.ts';

interface GocharaViewProps {
  chart: CompleteChartResult;
  lang?: 'te' | 'en';
}

const GRAHA_GLYPH: Record<string, string> = {
  Sun: 'సూ',
  Moon: 'చం',
  Mars: 'కు',
  Mercury: 'బు',
  Jupiter: 'గు',
  Venus: 'శు',
  Saturn: 'శ',
  Rahu: 'రా',
  Ketu: 'కే',
};

const GRAHA_COLOR: Record<string, string> = {
  Sun: '#E3A85C',
  Moon: '#C9D2E3',
  Mars: '#D46B5E',
  Mercury: '#7FBFA0',
  Jupiter: '#C9A96E',
  Venus: '#B7A6E8',
  Saturn: '#8FA0B8',
  Rahu: '#9B8FD4',
  Ketu: '#A08B6E',
};

const TARA_NAMES_TE = [
  'జన్మ తార',
  'సంపత్ తార',
  'విపత్ తార',
  'క్షేమ తార',
  'ప్రత్యరి తార',
  'సాధక తార',
  'వధ తార',
  'మిత్ర తార',
  'అతిమిత్ర తార',
];
const TARA_GOOD = [false, true, false, true, false, true, false, true, true];

const todayISO = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/10 bg-[#0F1326] p-5 ${className}`}>{children}</div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; sub?: string }> = ({ icon, title, sub }) => (
  <div className="flex items-start gap-2 mb-3">
    <span className="text-[#C9A96E] mt-[2px]">{icon}</span>
    <div>
      <h2 className="font-display text-lg text-[#EDE8E0] leading-tight">{title}</h2>
      {sub && <p className="text-[11px] text-[#EDE8E0]/45 mt-0.5 leading-snug">{sub}</p>}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Transit wheel: 12 signs, natal Moon marked                          */
/* ------------------------------------------------------------------ */

const TransitWheel: React.FC<{ report: GocharaReport; size?: number }> = ({ report, size = 360 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const rOut = size * 0.47;
  const rIn = size * 0.3;
  const pt = (r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
  };
  const wedge = (a0: number, a1: number, rO: number, rI: number) => {
    const p1 = pt(rO, a0);
    const p2 = pt(rO, a1);
    const p3 = pt(rI, a1);
    const p4 = pt(rI, a0);
    return `M ${p1.x} ${p1.y} A ${rO} ${rO} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rI} ${rI} 0 0 0 ${p4.x} ${p4.y} Z`;
  };

  const grouped = useMemo(() => {
    const map = new Map<number, GocharaGrahaEntry[]>();
    for (const g of report.grahas) map.set(g.signIndex, [...(map.get(g.signIndex) ?? []), g]);
    return map;
  }, [report]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-[420px] mx-auto">
      <defs>
        <radialGradient id="gocharaBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#141A32" />
          <stop offset="100%" stopColor="#090C18" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={rOut + 3} fill="url(#gocharaBg)" stroke="rgba(201,169,110,0.25)" />
      {TELUGU_RASIS.map((rasi, i) => {
        const center = i * 30;
        const isJanma = i === report.janmaRasiIndex;
        const occupants = grouped.get(i) ?? [];
        const label = pt(rOut - 18, center);
        return (
          <g key={rasi.nameTe}>
            <path
              d={wedge(center - 15, center + 15, rOut, rIn)}
              fill={isJanma ? 'rgba(201,169,110,0.28)' : 'rgba(255,255,255,0.035)'}
              stroke="rgba(9,12,24,0.9)"
              strokeWidth={1}
            />
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isJanma ? 10 : 8.6}
              fontWeight={isJanma ? 700 : 400}
              fill={isJanma ? '#C9A96E' : '#EDE8E0'}
              opacity={isJanma ? 1 : 0.62}
            >
              {rasi.nameTe.split(' ')[0]}
            </text>
            {occupants.map((g, k) => {
              const rad = rIn + 14 + k * 15;
              const p = pt(rad, center);
              return (
                <g key={g.id}>
                  <circle cx={p.x} cy={p.y} r={7.2} fill={`${GRAHA_COLOR[g.id]}22`} stroke={GRAHA_COLOR[g.id]} strokeWidth={1} />
                  <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize={7.4} fill={GRAHA_COLOR[g.id]}>
                    {GRAHA_GLYPH[g.id]}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={rIn} fill="#0B1020" stroke="rgba(201,169,110,0.3)" />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={9} fill="#EDE8E0" opacity={0.5}>
        జన్మ రాశి
      </text>
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={13} fill="#C9A96E" fontWeight={700}>
        {report.janmaRasiTe.split(' ')[0]}
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize={8.5} fill="#EDE8E0" opacity={0.55}>
        {report.janmaNakshatraTe}
      </text>
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize={7.5} fill="#EDE8E0" opacity={0.35}>
        గోచార చక్రం
      </text>
    </svg>
  );
};

/* ------------------------------------------------------------------ */

export function GocharaView({ chart, lang = 'te' }: GocharaViewProps) {
  const isTe = lang !== 'en';
  const [dateISO, setDateISO] = useState<string>(todayISO());

  const moon = chart.planets.find((p) => p.id === 'Moon');
  const moonSignIndex = moon?.signIndex ?? 0;
  const moonNakIndex = Math.floor((moon?.siderealLon ?? 0) / (360 / 27));
  const tz = chart.input.tzOffsetHours ?? 5.5;

  const report = useMemo(
    () =>
      computeGocharaReport(moonSignIndex, moonNakIndex, {
        asOfISO: dateISO,
        tzOffsetHours: tz,
        siderealMode: (chart.input.ayanamsa as never) ?? 'lahiri',
      }),
    [moonSignIndex, moonNakIndex, dateISO, tz, chart.input.ayanamsa]
  );

  // Today's Chandra bala & Tara bala for this native
  const day = useMemo(
    () =>
      computeDayPanchanga(dateISO, {
        lat: chart.input.lat,
        lng: chart.input.lng,
        tzOffsetHours: tz,
        placeName: chart.input.city,
      }),
    [dateISO, chart.input.lat, chart.input.lng, tz, chart.input.city]
  );

  const todayMoonSign = day.moonSignIndex;
  const chandraHouse = ((todayMoonSign - moonSignIndex + 12) % 12) + 1;
  const chandraGood = [1, 2, 3, 5, 6, 7, 9, 10, 11].includes(chandraHouse);
  const todayMoonNak = day.tarabalam.nakshatraIndex;
  const taraIdx = (((todayMoonNak - moonNakIndex) % 27) + 27) % 27;
  const taraNumber = (taraIdx % 9) + 1;
  const taraGood = TARA_GOOD[taraNumber - 1];

  return (
    <div className="grantha-print-area max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-[#C9A96E]/25 bg-gradient-to-br from-[#12162B] to-[#0B0F1E] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 text-[#C9A96E] flex items-center justify-center">
              <Orbit className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display text-xl sm:text-2xl text-[#EDE8E0] leading-tight">
                {isTe ? 'గోచార ఫలం — రాశి గతులు & వేధ' : 'Gochara — Transits from the Natal Moon'}
              </h1>
              <p className="text-[11.5px] text-[#EDE8E0]/55 mt-1 max-w-2xl leading-relaxed">
                {isTe
                  ? 'జన్మ రాశి నుంచి నవగ్రహాల సంచారం, వేధ (నిరోధ) స్థానాలు, సాడే సాతి, చంద్రబలం & తారాబలం — బృహత్ సంహిత 104, ఫలదీపిక 26 ఆధారంగా.'
                  : 'Nine-graha transits from the natal Moon, vedha (obstruction) positions, Sade Sati, Chandra bala and Tara bala, per Brihat Samhita 104 and Phaladeepika 26.'}
              </p>
            </div>
          </div>
          <label className="no-print flex items-center gap-2 text-[11px] text-[#EDE8E0]/60">
            <CalendarDays className="w-3.5 h-3.5" />
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="rounded-lg border border-white/15 bg-[#141932] px-2 py-1 text-[12px] text-[#EDE8E0]"
            />
          </label>
        </div>
        <p className="mt-3 rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/5 px-3 py-2 text-[12px] text-[#EDE8E0]/80 leading-relaxed">
          {report.summaryTe}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full bg-[#5BBFB5]/15 text-[#5BBFB5] px-2.5 py-0.5">
            శుభ స్థానాలు: {report.favourableCount}
          </span>
          <span className="rounded-full bg-[#D46B5E]/15 text-[#D46B5E] px-2.5 py-0.5">
            వేధ ఉన్నవి: {report.blockedCount}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 ${
              report.sadeSati.active ? 'bg-[#D46B5E]/15 text-[#D46B5E]' : 'bg-[#5BBFB5]/15 text-[#5BBFB5]'
            }`}
          >
            సాడే సాతి: {report.sadeSati.active ? report.sadeSati.phaseTe : 'లేదు'}
          </span>
          {report.ashtamaShani && (
            <span className="rounded-full bg-[#D46B5E]/15 text-[#D46B5E] px-2.5 py-0.5">అష్టమ శని</span>
          )}
          {report.kantakaShani && (
            <span className="rounded-full bg-[#C9A96E]/15 text-[#C9A96E] px-2.5 py-0.5">కంటక శని</span>
          )}
        </div>
      </div>

      {/* Wheel + bala */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <SectionTitle
            icon={<Compass className="w-4 h-4" />}
            title={isTe ? 'గోచార చక్రం' : 'Transit wheel'}
            sub={isTe ? 'బయటి నుంచి: 12 రాశులు; లోపలి వృత్తాలు నవగ్రహాలు' : 'Signs outside, grahas inside'}
          />
          <TransitWheel report={report} />
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle
              icon={<Moon className="w-4 h-4" />}
              title={isTe ? 'ఈనాటి చంద్రబలం & తారాబలం' : "Today's Chandra & Tara bala"}
              sub={`${dateISO} · ${day.weekday.nameTe}`}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div
                className={`rounded-xl border px-3 py-2 ${
                  chandraGood ? 'border-[#5BBFB5]/40 bg-[#5BBFB5]/5' : 'border-[#D46B5E]/40 bg-[#D46B5E]/5'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/45">చంద్రబలం</div>
                <div className="text-[13px] text-[#EDE8E0] mt-0.5">
                  {TELUGU_RASIS[todayMoonSign]?.nameTe} · {chandraHouse}వ భావం
                </div>
                <div className={`text-[11px] mt-0.5 ${chandraGood ? 'text-[#5BBFB5]' : 'text-[#D46B5E]'}`}>
                  {chandraHouse === 8
                    ? 'అష్టమ చంద్రుడు — కీలక నిర్ణయాలు వాయిదా వేయండి'
                    : chandraGood
                      ? 'శుభ చంద్రబలం — ప్రయాణం, కార్యారంభం అనుకూలం'
                      : 'చంద్రబలం తక్కువ — ముఖ్య కార్యాలు మానండి'}
                </div>
              </div>
              <div
                className={`rounded-xl border px-3 py-2 ${
                  taraGood ? 'border-[#5BBFB5]/40 bg-[#5BBFB5]/5' : 'border-[#D46B5E]/40 bg-[#D46B5E]/5'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/45">తారాబలం</div>
                <div className="text-[13px] text-[#EDE8E0] mt-0.5">
                  {TARA_NAMES_TE[taraNumber - 1]} ({taraNumber}/9)
                </div>
                <div className={`text-[11px] mt-0.5 ${taraGood ? 'text-[#5BBFB5]' : 'text-[#D46B5E]'}`}>
                  {taraGood ? 'శుభ తార — కార్యసిద్ధి' : 'అశుభ తార — శుభ కార్యాలు వర్జించాలి'}
                </div>
                <div className="text-[10px] text-[#EDE8E0]/45 mt-0.5">
                  జన్మ: {TELUGU_NAKSHATRAS[moonNakIndex]?.nameTe} → నేడు: {TELUGU_NAKSHATRAS[todayMoonNak]?.nameTe}
                </div>
              </div>
            </div>
          </Card>

          <Card className={report.sadeSati.active ? 'border-[#D46B5E]/35' : ''}>
            <SectionTitle
              icon={<ShieldAlert className="w-4 h-4" />}
              title={isTe ? 'సాడే సాతి / శని సంచారం' : 'Sade Sati / Saturn transit'}
            />
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-[#EDE8E0]/60">{isTe ? 'శని ప్రస్తుత రాశి' : 'Saturn in'}</span>
                <span className="text-[#EDE8E0]">
                  {report.grahas.find((g) => g.id === 'Saturn')?.signTe} ·{' '}
                  {report.grahas.find((g) => g.id === 'Saturn')?.houseFromMoon}
                  {isTe ? 'వ భావం' : 'th house'}
                </span>
              </div>
              {report.sadeSati.active && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/40">ఆరంభం</div>
                    <div className="font-mono-tabular text-[#EDE8E0]">{report.sadeSati.startISO}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/40">ముగింపు</div>
                    <div className="font-mono-tabular text-[#EDE8E0]">{report.sadeSati.endISO}</div>
                  </div>
                </div>
              )}
              <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-[11.5px] text-[#EDE8E0]/70 leading-relaxed">
                {report.sadeSati.noteTe}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Graha table */}
      <Card>
        <SectionTitle
          icon={<Sparkles className="w-4 h-4" />}
          title={isTe ? 'నవగ్రహ గోచార ఫలం' : 'Nine-graha transit results'}
          sub={isTe ? 'శుభ స్థానం + వేధ లేకపోతే ఫలం పూర్తిగా లభిస్తుంది.' : 'A favourable house delivers fully only when unblocked by vedha.'}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/40">
                <th className="text-left py-1.5 pr-2">{isTe ? 'గ్రహం' : 'Graha'}</th>
                <th className="text-left py-1.5 pr-2">{isTe ? 'సంచారం' : 'Transit'}</th>
                <th className="text-left py-1.5 pr-2">{isTe ? 'భావం' : 'House'}</th>
                <th className="text-left py-1.5 pr-2">{isTe ? 'ఫలితం' : 'Verdict'}</th>
                <th className="text-left py-1.5 pr-2">{isTe ? 'తదుపరి రాశి' : 'Next ingress'}</th>
              </tr>
            </thead>
            <tbody>
              {report.grahas.map((g) => (
                <tr key={g.id} className="border-t border-white/5 align-top">
                  <td className="py-2 pr-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                        style={{ color: GRAHA_COLOR[g.id], backgroundColor: `${GRAHA_COLOR[g.id]}1F` }}
                      >
                        {GRAHA_GLYPH[g.id]}
                      </span>
                      <span className="text-[#EDE8E0]">{g.nameTe}</span>
                      {g.isRetrograde && <span className="text-[9px] text-[#D46B5E]">వ</span>}
                    </span>
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap text-[#EDE8E0]/80">
                    {g.signTe.split(' ')[0]} {g.degreeInSign.toFixed(1)}°
                    <div className="text-[9.5px] text-[#EDE8E0]/40">
                      {g.nakshatraTe} · {g.pada}
                    </div>
                  </td>
                  <td className="py-2 pr-2 text-[#EDE8E0]/70 whitespace-nowrap">{g.houseFromMoon}</td>
                  <td className="py-2 pr-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap ${
                        g.verdict === 'good'
                          ? 'bg-[#5BBFB5]/15 text-[#5BBFB5]'
                          : g.verdict === 'blocked'
                            ? 'bg-[#C9A96E]/15 text-[#C9A96E]'
                            : 'bg-[#D46B5E]/15 text-[#D46B5E]'
                      }`}
                    >
                      {g.verdict === 'good' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : g.verdict === 'blocked' ? (
                        <CircleDot className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {g.verdictTe}
                    </span>
                    <div className="text-[10px] text-[#EDE8E0]/55 mt-1 leading-snug max-w-[330px]">{g.effectTe}</div>
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap text-[#EDE8E0]/70">
                    {g.nextIngressISO}
                    <div className="text-[9.5px] text-[#EDE8E0]/40">
                      {g.nextIngressSignTe.split(' ')[0]} · {g.daysToIngress}d
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upcoming ingresses */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle
            icon={<TrendingUp className="w-4 h-4" />}
            title={isTe ? 'రాశి మార్పులు (సంక్రమణాలు)' : 'Upcoming sign ingresses'}
            sub={isTe ? 'గ్రహాలు తదుపరి రాశిలోకి ప్రవేశించే తేదీలు' : 'Exact instants of the next sign changes'}
          />
          <div className="space-y-1.5">
            {report.upcomingIngresses.map((u, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                <span className="text-[12px] text-[#EDE8E0]">
                  {u.grahaTe} <ArrowRight className="inline w-3 h-3 text-[#EDE8E0]/40" /> {u.signTe}
                </span>
                <span className="text-[11px] font-mono-tabular text-[#C9A96E]/85">
                  {u.dateISO} {u.timeLocal}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            icon={<Info className="w-4 h-4" />}
            title={isTe ? 'వేధ చక్రం — ఎలా చదవాలి' : 'How to read vedha'}
            sub={isTe ? 'శుభ గోచారాన్ని ఏ గ్రహం నిరోధిస్తుందో తెలుసుకోవడం ముఖ్యం' : 'Which graha blocks a favourable transit'}
          />
          <div className="space-y-1.5 text-[11.5px] text-[#EDE8E0]/70 leading-relaxed">
            <p className="rounded-lg bg-white/[0.03] px-3 py-2">
              శుభ స్థానంలో ఉన్న గ్రహానికి ఎదురుగా ఒక నిర్దిష్ట భావంలో మరో గ్రహం ఉంటే ఆ ఫలం నిరోధించబడుతుంది — దీనినే <span className="text-[#C9A96E]">వేధ</span> అంటారు.
            </p>
            <p className="rounded-lg bg-white/[0.03] px-3 py-2">
              మినహాయింపులు: <span className="text-[#EDE8E0]">సూర్యుడు–శని</span> మరియు{' '}
              <span className="text-[#EDE8E0]">చంద్రుడు–బుధుడు</span> పరస్పరం వేధ కలిగించరు.
            </p>
            <p className="rounded-lg bg-white/[0.03] px-3 py-2">
              అశుభ స్థానంలో ఉన్న గ్రహానికి వేధ కలిగితే ఆ అశుభ ఫలం కూడా తగ్గుతుంది (ఉదా: సూర్యుడు 4వ భావంలో ఉన్నప్పుడు 10వ భావంలోని గ్రహం వేధ).
            </p>
            <p className="rounded-lg border border-[#9B8FD4]/25 bg-[#9B8FD4]/10 px-3 py-2 text-[11px]">
              గమనిక: గోచార ఫలం జన్మ రాశి (చంద్ర రాశి) ఆధారంగా; దశ, అంతర్దశ, అష్టకవర్గ బలంతో కలిపి చూడాలి — ఇది ఒకటే తుది తీర్పు కాదు.
            </p>
          </div>
        </Card>
      </div>

      <SourceStrip feature="gochara" />
    </div>
  );
}
