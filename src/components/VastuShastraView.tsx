import React, { useMemo, useState } from 'react';
import {
  Compass,
  Grid3x3,
  Home,
  MapPin,
  Printer,
  Sparkles,
  Sun,
  Hash,
  Moon,
  AlertTriangle,
  CheckCircle2,
  Ruler,
  Droplets,
  Flame,
  Mountain,
  Wind,
  ShieldCheck,
  ArrowUpRight,
  Info,
  ScrollText,
  Building2,
} from 'lucide-react';
import {
  DEFAULT_ROOM_MAP,
  DIK_BY_ID,
  DIK_INFO,
  ROOM_RULES,
  ZONE_INFO,
  buildMandalaGrid,
  generateVastuReport,
  type DikInfo,
  type RoomKey,
  type RoomMap,
} from '../engine/vastuShastraEngine.ts';
import { STATE_DISTRICT_ATLAS } from '../engine/teluguJathakam.ts';

interface VastuShastraViewProps {
  defaultName?: string;
  defaultPlaceName?: string;
  defaultLat?: number;
  defaultLng?: number;
  defaultTzOffsetHours?: number;
  lang?: 'te' | 'en';
}

type DikId = DikInfo['id'];

const DIK_COLOR: Record<DikId, string> = {
  N: '#5BBFB5',
  NE: '#C9A96E',
  E: '#E3B05E',
  SE: '#D46B5E',
  S: '#C25B5B',
  SW: '#9B8FD4',
  W: '#6E8FD0',
  NW: '#8FBFA0',
};

const DIK_ELEMENT_ICON: Record<DikId, React.ReactNode> = {
  N: <Droplets className="w-3.5 h-3.5" />,
  NE: <Sparkles className="w-3.5 h-3.5" />,
  E: <Sun className="w-3.5 h-3.5" />,
  SE: <Flame className="w-3.5 h-3.5" />,
  S: <Mountain className="w-3.5 h-3.5" />,
  SW: <Mountain className="w-3.5 h-3.5" />,
  W: <Droplets className="w-3.5 h-3.5" />,
  NW: <Wind className="w-3.5 h-3.5" />,
};

const PLACE_OPTIONS = STATE_DISTRICT_ATLAS.flatMap((state) =>
  state.districts.map((d) => ({
    id: d.id,
    label: `${d.nameEn} — ${d.hqTe}`,
    labelTe: d.nameTe,
    lat: d.lat,
    lng: d.lng,
    stateTe: state.nameTe,
    tz: d.tzOffsetHours,
  }))
);

/* ------------------------------------------------------------------ */
/*  16-zone compass                                                     */
/* ------------------------------------------------------------------ */

const VastuCompass: React.FC<{ highlight?: DikId | null; size?: number }> = ({
  highlight,
  size = 340,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.46;
  const inner = size * 0.26;

  const pt = (r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
  };

  const sectorPath = (rOut: number, rIn: number, a0: number, a1: number) => {
    const p1 = pt(rOut, a0);
    const p2 = pt(rOut, a1);
    const p3 = pt(rIn, a1);
    const p4 = pt(rIn, a0);
    return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 0 0 ${p4.x} ${p4.y} Z`;
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-md mx-auto">
      <defs>
        <radialGradient id="vastuCompassBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#141932" />
          <stop offset="100%" stopColor="#090C18" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={outer + 4} fill="url(#vastuCompassBg)" stroke="rgba(201,169,110,0.3)" />
      {ZONE_INFO.map((z, i) => {
        const center = i * 22.5;
        const isMain = i % 2 === 0;
        const active = highlight === z.dik;
        const mid = DIK_BY_ID[z.dik];
        return (
          <g key={z.nameEn}>
            <path
              d={sectorPath(outer, isMain ? inner * 1.05 : inner, center - 11.25, center + 11.25)}
              fill={DIK_COLOR[z.dik]}
              fillOpacity={active ? 0.55 : isMain ? 0.28 : 0.12}
              stroke="rgba(9,12,24,0.85)"
              strokeWidth={1}
            />
            <text
              x={pt(outer - 20, center).x}
              y={pt(outer - 20, center).y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isMain ? 10.5 : 8}
              fill="#EDE8E0"
              opacity={isMain ? 0.95 : 0.7}
              fontWeight={isMain ? 600 : 400}
            >
              {mid.nameTe}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={inner} fill="#0B1020" stroke="rgba(201,169,110,0.35)" />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={11} fill="#C9A96E" fontWeight={700}>
        బ్రహ్మ
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={8} fill="#EDE8E0" opacity={0.6}>
        స్థానం
      </text>
      <line x1={cx} y1={cy - outer} x2={cx} y2={cy + outer} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
      <line x1={cx - outer} y1={cy} x2={cx + outer} y2={cy} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
      <text x={cx} y={cy - outer - 6} textAnchor="middle" fontSize={9} fill="#C9A96E">
        ఉత్తరం (నిజ ఉత్తరం)
      </text>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  81-pada Paramasayika mandala                                        */
/* ------------------------------------------------------------------ */

const MandalaGrid: React.FC<{
  cells: ReturnType<typeof buildMandalaGrid>;
  onHover?: (row: number, col: number) => void;
}> = ({ cells, onHover }) => {
  return (
    <div className="grid grid-cols-9 gap-[2px] rounded-xl overflow-hidden bg-white/5 p-[2px]">
      {cells.map((c) => {
        const isCenter = c.dik === 'Center';
        const isOuter = c.row === 0 || c.row === 8 || c.col === 0 || c.col === 8;
        const isBrahmasthanRing = c.row >= 3 && c.row <= 5 && c.col >= 3 && c.col <= 5;
        return (
          <div
            key={`${c.row}-${c.col}`}
            onMouseEnter={() => onHover?.(c.row, c.col)}
            title={`${c.devata?.nameTe ?? 'బ్రహ్మ'} — ${c.ringTe} · ${c.zoneNameTe}`}
            className={`aspect-square flex items-center justify-center text-center px-[1px] ${
              isCenter
                ? 'bg-[#C9A96E]/70 text-[#090C18] font-bold'
                : isBrahmasthanRing
                  ? 'bg-[#C9A96E]/22 text-[#EDE8E0]'
                  : isOuter
                    ? 'bg-[#9B8FD4]/15 text-[#EDE8E0]/80'
                    : 'bg-white/[0.04] text-[#EDE8E0]/70'
            }`}
          >
            <span className="text-[6.5px] leading-[1.05]">{c.devata?.nameTe ?? 'బ్రహ్మ'}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Score ring                                                          */
/* ------------------------------------------------------------------ */

const ScoreRing: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const color = pct >= 75 ? '#5BBFB5' : pct >= 50 ? '#C9A96E' : '#D46B5E';
  return (
    <div className="flex items-center gap-2">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${(c * pct) / 100} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
        <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="700" fill={color}>
          {Math.round(pct)}
        </text>
      </svg>
      <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/50 max-w-[64px] leading-tight">{label}</div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/45">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; sub?: string }> = ({ icon, title, sub }) => (
  <div className="flex items-start gap-2 mb-3">
    <span className="text-[#C9A96E] mt-[2px]">{icon}</span>
    <div>
      <h2 className="font-display text-lg text-[#EDE8E0] leading-tight">{title}</h2>
      {sub && <p className="text-[11px] text-[#EDE8E0]/45 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main view                                                           */
/* ------------------------------------------------------------------ */

export function VastuShastraView({
  defaultName,
  defaultPlaceName,
  defaultLat,
  defaultLng,
  defaultTzOffsetHours,
  lang = 'te',
}: VastuShastraViewProps) {
  const isTe = lang !== 'en';
  const initialPlace = useMemo(
    () =>
      PLACE_OPTIONS.find(
        (p) => Math.abs(p.lat - (defaultLat ?? 17.385)) < 0.05 && Math.abs(p.lng - (defaultLng ?? 78.4867)) < 0.05
      ) ?? PLACE_OPTIONS.find((p) => p.id.startsWith('hyderabad')),
    [defaultLat, defaultLng]
  );

  const [personName, setPersonName] = useState<string>(defaultName ?? '');
  const [placeId, setPlaceId] = useState<string>(initialPlace?.id ?? '');
  const [manualLat, setManualLat] = useState<number>(defaultLat ?? 17.385);
  const [manualLng, setManualLng] = useState<number>(defaultLng ?? 78.4867);
  const [rooms, setRooms] = useState<RoomMap>({ ...DEFAULT_ROOM_MAP });
  const [plotShape, setPlotShape] = useState<'square' | 'rectangle' | 'irregular' | 'triangular' | 'l-shaped'>(
    'rectangle'
  );
  const [plotSlope, setPlotSlope] = useState<'north-east' | 'north' | 'east' | 'south-west' | 'south' | 'flat'>(
    'north-east'
  );
  const [plotRoad, setPlotRoad] = useState<DikId>('E');
  const [plotLen, setPlotLen] = useState<number>(40);
  const [plotWidth, setPlotWidth] = useState<number>(30);
  const [activeDik, setActiveDik] = useState<DikId | null>(null);
  const [showAllDevatas, setShowAllDevatas] = useState(false);

  const place = PLACE_OPTIONS.find((p) => p.id === placeId);
  const lat = place?.lat ?? manualLat;
  const lng = place?.lng ?? manualLng;
  const placeName = place?.labelTe ?? defaultPlaceName ?? 'హైదరాబాద్';
  const tz = place?.tz ?? defaultTzOffsetHours ?? 5.5;

  const report = useMemo(
    () =>
      generateVastuReport({
        name: personName,
        placeName,
        lat,
        lng,
        tzOffsetHours: tz,
        rooms,
        plot: {
          shape: plotShape,
          slope: plotSlope,
          road: plotRoad,
          lengthFt: plotLen,
          widthFt: plotWidth,
        },
      }),
    [personName, placeName, lat, lng, tz, rooms, plotShape, plotSlope, plotRoad, plotLen, plotWidth]
  );

  const { nama, place: placeReport, audit, plot } = report;

  const T = {
    title: isTe ? 'వాస్తు శాస్త్రం — నామ వాస్తు & గృహ విశ్లేషణ' : 'Vastu Shastra — Nama & Griha Analysis',
    intro: isTe
      ? 'నామాక్షరం నుంచి దిక్కులు, 81-పాద పరమశాయిక మండలం, 16-జోన్ దిక్ చక్రం, మరియు నిజ ఉత్తర నిర్ణయం (సూర్య-నీడ పద్ధతి).'
      : 'Nakshatra syllable to directions, the 81-pada Paramasayika mandala, the 16-zone dik chakra, and true north from solar shadow geometry.',
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-5 jathaka-print-book">
      {/* Header */}
      <div className="rounded-2xl border border-[#C9A96E]/25 bg-gradient-to-br from-[#12162B] to-[#0B0F1E] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 text-[#C9A96E] flex items-center justify-center">
              <Home className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display text-xl sm:text-2xl text-[#EDE8E0] leading-tight">{T.title}</h1>
              <p className="text-[11.5px] text-[#EDE8E0]/55 mt-1 max-w-2xl leading-relaxed">{T.intro}</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[11.5px] text-[#EDE8E0]/75 hover:bg-white/5"
          >
            <Printer className="w-3.5 h-3.5" /> {isTe ? 'ప్రింట్' : 'Print'}
          </button>
        </div>
        <p className="mt-3 rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/5 px-3 py-2 text-[12px] text-[#EDE8E0]/80 leading-relaxed">
          {report.summaryTe}
        </p>
      </div>

      {/* Inputs */}
      <div className="no-print grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-4 space-y-3">
          <SectionTitle icon={<Hash className="w-4 h-4" />} title={isTe ? 'నామ వాస్తు' : 'Nama Vastu'} />
          <Field label={isTe ? 'పేరు (తెలుగు లిపిలో ఉత్తమం)' : 'Name'}>
            <input
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder={isTe ? 'ఉదా: చరణ్' : 'e.g. Charan'}
              className="w-full rounded-lg border border-white/15 bg-[#141932] px-2.5 py-1.5 text-[12.5px] text-[#EDE8E0] outline-none focus:border-[#C9A96E]/60"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2 text-[11.5px]">
            <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
              <div className="text-[9.5px] uppercase tracking-wider text-[#EDE8E0]/40">{isTe ? 'అక్షరం' : 'Syllable'}</div>
              <div className="text-[#EDE8E0]">{nama.matchedSyllable}</div>
            </div>
            <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
              <div className="text-[9.5px] uppercase tracking-wider text-[#EDE8E0]/40">{isTe ? 'నామ అంకం' : 'Name number'}</div>
              <div className="font-mono-tabular text-[#EDE8E0]">{nama.nameNumber}</div>
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 text-[11.5px] text-[#EDE8E0]/75 leading-relaxed">
            {nama.nakshatraTe} · {nama.pada}{isTe ? 'వ పాదం' : ' pada'} · {nama.rasiTe}
            <div className="text-[10.5px] text-[#EDE8E0]/50 mt-0.5">
              {isTe ? 'నక్షత్రాధిపతి' : 'Nakshatra lord'}: {nama.nakshatraLordTe} · {isTe ? 'రాశ్యధిపతి' : 'Rasi lord'}:{' '}
              {nama.rasiLordTe}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-4 space-y-3">
          <SectionTitle icon={<MapPin className="w-4 h-4" />} title={isTe ? 'స్థలం' : 'Place'} />
          <Field label={isTe ? 'నగరం / గ్రామం' : 'City / village'}>
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] text-[#EDE8E0]"
            >
              <option value="">{isTe ? '— మాన్యువల్ నిర్దేశాంశాలు —' : '— manual coordinates —'}</option>
              {PLACE_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.labelTe} — {p.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label={isTe ? 'అక్షాంశం' : 'Latitude'}>
              <input
                type="number"
                step="0.0001"
                value={place ? place.lat : manualLat}
                disabled={!!place}
                onChange={(e) => setManualLat(Number(e.target.value))}
                className="w-full rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] font-mono-tabular text-[#EDE8E0] disabled:opacity-60"
              />
            </Field>
            <Field label={isTe ? 'రేఖాంశం' : 'Longitude'}>
              <input
                type="number"
                step="0.0001"
                value={place ? place.lng : manualLng}
                disabled={!!place}
                onChange={(e) => setManualLng(Number(e.target.value))}
                className="w-full rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] font-mono-tabular text-[#EDE8E0] disabled:opacity-60"
              />
            </Field>
          </div>
          <p className="text-[10.5px] text-[#EDE8E0]/45 leading-relaxed">
            {isTe
              ? 'నిజ ఉత్తరాన్ని ఎప్పుడూ సూర్య-నీడ పద్ధతితో ధృవీకరించండి; దిక్సూచి ముల్లు అయస్కాంత ఉత్తరాన్ని చూపుతుంది.'
              : 'Always verify true north by solar shadow; a compass needle points to magnetic north.'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-4">
          <SectionTitle icon={<Compass className="w-4 h-4" />} title={isTe ? '16-జోన్ దిక్ చక్రం' : '16-zone Dik Chakra'} />
          <VastuCompass highlight={activeDik} size={300} />
        </div>
      </div>

      {/* Personal directions + dik summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-5">
          <SectionTitle
            icon={<ShieldCheck className="w-4 h-4" />}
            title={isTe ? 'వ్యక్తిగత దిక్కులు (నామాక్షరం ఆధారంగా)' : 'Personal directions from the name syllable'}
            sub={nama.noteTe}
          />
          <div className="space-y-2">
            {report.personalDirectionsTe.map((p) => (
              <div key={p.purposeTe} className="rounded-lg bg-white/[0.03] px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-[#EDE8E0]">{p.purposeTe}</span>
                  <span className="shrink-0 rounded bg-[#C9A96E]/15 px-2 py-0.5 text-[11px] text-[#C9A96E]">
                    {p.dikTe}
                  </span>
                </div>
                <p className="text-[11px] text-[#EDE8E0]/55 mt-0.5 leading-relaxed">{p.reasonTe}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {nama.favourableDiks.map((d) => (
              <span
                key={d}
                className="rounded-full border px-2 py-0.5 text-[10.5px]"
                style={{ borderColor: `${DIK_COLOR[d]}55`, color: DIK_COLOR[d] }}
              >
                {DIK_BY_ID[d].nameTe}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-5">
          <SectionTitle
            icon={<Sun className="w-4 h-4" />}
            title={`${placeReport.placeName} — ${isTe ? 'స్థల జ్యామితి' : 'site geometry'}`}
            sub={isTe ? 'నిజ ఉత్తర నిర్ణయానికి సూర్యుడి స్థానాలు' : 'Solar positions used for true north'}
          />
          <div className="grid grid-cols-2 gap-2 text-[11.5px]">
            {[
              [isTe ? 'విషువత్తు సూర్యోదయ అజిముత్' : 'Equinox sunrise azimuth', `${placeReport.equinoxAzimuth.toFixed(1)}°`],
              [isTe ? 'విషువత్తు అస్తమయ అజిముత్' : 'Equinox sunset azimuth', `${placeReport.sunsetAzimuth.toFixed(1)}°`],
              [isTe ? 'వేసవి అయనాంత సూర్యోదయం' : 'Summer solstice sunrise', `${placeReport.summerSolsticeAzimuth.toFixed(1)}°`],
              [isTe ? 'చలికాల అయనాంత సూర్యోదయం' : 'Winter solstice sunrise', `${placeReport.winterSolsticeAzimuth.toFixed(1)}°`],
              [isTe ? 'స్థానిక మధ్యాహ్నం' : 'Solar noon', placeReport.solarNoonTime],
              [isTe ? 'మధ్యాహ్న నీడ దిక్కు' : 'Noon shadow azimuth', `${placeReport.solarNoonShadowAzimuth.toFixed(1)}°`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                <div className="text-[9.5px] uppercase tracking-wider text-[#EDE8E0]/40 leading-tight">{k}</div>
                <div className="font-mono-tabular text-[#EDE8E0]">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg border border-[#9B8FD4]/25 bg-[#9B8FD4]/10 px-3 py-2 text-[11px] text-[#EDE8E0]/75 leading-relaxed">
            {placeReport.trueNorthNoteTe} {placeReport.magneticDeclinationNoteTe}
          </div>
          <ol className="mt-2 space-y-1.5">
            {placeReport.trueNorthStepsTe.map((s, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] text-[#EDE8E0]/70 leading-relaxed">
                <span className="shrink-0 w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full bg-[#C9A96E]/15 text-[#C9A96E] text-[9.5px] flex items-center justify-center">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Dik cards */}
      <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-5">
        <SectionTitle
          icon={<ArrowUpRight className="w-4 h-4" />}
          title={isTe ? '8 దిక్కులు — దిక్పాలకులు & శాస్త్రీయ సూచనలు' : 'Eight directions — dikpalas and prescriptions'}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DIK_INFO.map((d) => (
            <div
              key={d.id}
              onMouseEnter={() => setActiveDik(d.id)}
              onMouseLeave={() => setActiveDik(null)}
              className="rounded-xl border p-3 space-y-1.5 transition-colors"
              style={{
                borderColor: activeDik === d.id ? DIK_COLOR[d.id] : `${DIK_COLOR[d.id]}44`,
                backgroundColor: `${DIK_COLOR[d.id]}0E`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[15px] text-[#EDE8E0] flex items-center gap-1.5">
                  <span style={{ color: DIK_COLOR[d.id] }}>{DIK_ELEMENT_ICON[d.id]}</span>
                  {d.nameTe}
                </span>
                <span className="text-[10px] font-mono-tabular" style={{ color: DIK_COLOR[d.id] }}>
                  {d.centerDeg}°
                </span>
              </div>
              <div className="text-[10px] text-[#EDE8E0]/45">
                {d.deityTe} · {d.elementTe} · {d.planetTe}
              </div>
              <p className="text-[10.5px] text-[#EDE8E0]/70 leading-snug">{d.qualitiesTe}</p>
              <p className="text-[10px] text-[#5BBFB5]/85 leading-snug">✓ {d.keepTe}</p>
              <p className="text-[10px] text-[#D46B5E]/85 leading-snug">✗ {d.avoidTe}</p>
              <p className="text-[10px] text-[#C9A96E]/80 leading-snug">↺ {d.remedyTe}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mandala + zones */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-5">
          <SectionTitle
            icon={<Grid3x3 className="w-4 h-4" />}
            title={isTe ? '81-పాద పరమశాయిక మండలం' : '81-pada Paramasayika mandala'}
            sub={
              isTe
                ? 'బ్రహ్మస్థానం (మధ్య 3×3) ఖాళీగా ఉంచాలి; 45 దేవతలు 81 పాదాలలో అధిష్ఠిస్తారు.'
                : 'Keep the Brahmasthan (centre 3×3) open; 45 devatas occupy the 81 padas.'
            }
          />
          <MandalaGrid cells={report.mandala} />
          <button
            onClick={() => setShowAllDevatas((v) => !v)}
            className="no-print mt-2 text-[11px] text-[#C9A96E]/80 hover:text-[#C9A96E] inline-flex items-center gap-1"
          >
            <ScrollText className="w-3.5 h-3.5" /> {showAllDevatas ? (isTe ? 'దేవతల జాబితా దాచు' : 'Hide devata list') : isTe ? '45 దేవతల వివరాలు' : 'Show 45 devatas'}
          </button>
          {showAllDevatas && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-white/[0.03] p-2">
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {report.devatas.map((dv) => (
                  <div key={dv.nameEn} className="text-[10px] text-[#EDE8E0]/65 leading-snug">
                    <span className="text-[#EDE8E0]">{dv.nameTe}</span> · {dv.zoneTe}
                    <span className="text-[#EDE8E0]/40 block">{dv.governsTe}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-5">
          <SectionTitle
            icon={<Compass className="w-4 h-4" />}
            title={isTe ? '16 జోన్లు — జీవిత క్షేత్రాలు' : '16 zones and life areas'}
            sub={isTe ? 'ప్రతి 22.5° సెక్టార్ ఒక జీవిత క్షేత్రానికి అధిపతి.' : 'Each 22.5° sector governs a life area.'}
          />
          <div className="max-h-[420px] overflow-y-auto space-y-1.5 pr-1">
            {ZONE_INFO.map((z) => (
              <div key={z.nameEn} className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-[#EDE8E0]">
                    {z.nameTe}
                    <span className="text-[10px] text-[#EDE8E0]/40 ml-1.5">{z.dik}</span>
                  </span>
                  <span className="text-[9.5px] font-mono-tabular text-[#C9A96E]/80">
                    {z.startDeg.toFixed(1)}°–{z.endDeg.toFixed(1)}°
                  </span>
                </div>
                <div className="text-[10.5px] text-[#EDE8E0]/55">
                  {z.lifeAreaTe} · {z.elementTe} · {z.planetTe}
                </div>
                <div className="text-[10px] text-[#5BBFB5]/75 leading-snug">✓ {z.keepTe}</div>
                <div className="text-[10px] text-[#D46B5E]/75 leading-snug">✗ {z.avoidTe}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* House audit */}
      <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle
            icon={<Building2 className="w-4 h-4" />}
            title={isTe ? 'గృహ వాస్తు పరిశీలన (Room-wise)' : 'House Vastu audit (room-wise)'}
            sub={isTe ? 'ప్రతి గదిని దిక్కుకు కేటాయించి శాస్త్రీయ మూల్యాంకనం చేయండి.' : 'Assign each room to a direction and score the layout.'}
          />
          <div className="flex items-center gap-4">
            <ScoreRing score={audit.totalScore} label={isTe ? 'గృహ స్కోరు' : 'House score'} />
            <div className="text-[11px]">
              <div className="text-[#EDE8E0]">{audit.gradeTe}</div>
              <div className="text-[#EDE8E0]/50">
                {isTe ? 'బలం' : 'Strong'}: {audit.strongestRoomTe}
              </div>
              <div className="text-[#EDE8E0]/50">
                {isTe ? 'సరిదిద్దాలి' : 'Fix'}: {audit.weakestRoomTe}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ROOM_RULES.map((rule) => {
            const current = rooms[rule.key as RoomKey] as DikId | undefined;
            const assessment = audit.rooms.find((r) => r.key === rule.key);
            const color =
              assessment?.verdict === 'best' ? '#5BBFB5' : assessment?.verdict === 'ok' ? '#C9A96E' : '#D46B5E';
            return (
              <div key={rule.key} className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-[#EDE8E0]">{rule.labelTe}</span>
                  <span className="text-[9.5px] rounded px-1.5 py-0.5" style={{ color, backgroundColor: `${color}1A` }}>
                    {assessment?.verdictTe ?? '—'}
                  </span>
                </div>
                <select
                  value={current}
                  onChange={(e) =>
                    setRooms((prev) => ({ ...prev, [rule.key]: e.target.value as DikId }))
                  }
                  className="no-print mt-1 w-full rounded border border-white/15 bg-[#141932] px-1.5 py-1 text-[11px] text-[#EDE8E0]"
                >
                  {DIK_INFO.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameTe}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-[10px] text-[#EDE8E0]/50 leading-snug">
                  {isTe ? 'ఉత్తమం' : 'Best'}: {rule.bestDiks.map((d) => DIK_BY_ID[d as DikId]?.nameTe ?? d).join(', ')}
                </div>
                {assessment?.adviceTe && (
                  <p className="mt-0.5 text-[10px] text-[#EDE8E0]/60 leading-snug">{assessment.adviceTe}</p>
                )}
              </div>
            );
          })}
        </div>

        {audit.doshas.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#D46B5E] text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" /> {isTe ? `దోషాలు & పరిహారాలు (${audit.doshas.length})` : `Doshas (${audit.doshas.length})`}
            </div>
            {audit.doshas.map((d, i) => (
              <div key={i} className="rounded-lg border border-[#D46B5E]/30 bg-[#D46B5E]/5 px-3 py-2">
                <div className="flex items-center gap-2 text-[12px] text-[#EDE8E0]">
                  {d.nameTe}
                  <span className="text-[9px] rounded bg-[#D46B5E]/20 text-[#D46B5E] px-1.5 py-0.5">{d.severityTe}</span>
                </div>
                <div className="text-[11px] text-[#EDE8E0]/60 mt-0.5">{d.effectTe}</div>
                <div className="text-[11px] text-[#C9A96E]/85 mt-0.5">{isTe ? 'పరిహారం' : 'Remedy'}: {d.remedyTe}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-[#5BBFB5]/30 bg-[#5BBFB5]/5 px-3 py-2 text-[12px] text-[#5BBFB5]">
            <CheckCircle2 className="w-4 h-4" /> {isTe ? 'ప్రధాన వాస్తు దోషాలు ఏవీ లేవు — ఈ అమరిక శ్రేష్ఠం.' : 'No major Vastu doshas in this layout.'}
          </div>
        )}
      </div>

      {/* Plot */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="no-print rounded-2xl border border-white/10 bg-[#0F1326] p-5 space-y-3">
          <SectionTitle icon={<Ruler className="w-4 h-4" />} title={isTe ? 'స్థల పరీక్ష (Plot)' : 'Plot check'} />
          <Field label={isTe ? 'ఆకారం' : 'Shape'}>
            <select
              value={plotShape}
              onChange={(e) => setPlotShape(e.target.value as typeof plotShape)}
              className="w-full rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] text-[#EDE8E0]"
            >
              <option value="square">{isTe ? 'చతురస్రం' : 'Square'}</option>
              <option value="rectangle">{isTe ? 'దీర్ఘ చతురస్రం' : 'Rectangle'}</option>
              <option value="irregular">{isTe ? 'అనియత ఆకారం' : 'Irregular'}</option>
              <option value="triangular">{isTe ? 'త్రికోణం' : 'Triangular'}</option>
              <option value="l-shaped">{isTe ? 'L-ఆకారం' : 'L-shaped'}</option>
            </select>
          </Field>
          <Field label={isTe ? 'వాలు (Slope)' : 'Slope'}>
            <select
              value={plotSlope}
              onChange={(e) => setPlotSlope(e.target.value as typeof plotSlope)}
              className="w-full rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] text-[#EDE8E0]"
            >
              <option value="north-east">{isTe ? 'ఈశాన్యం' : 'North-east'}</option>
              <option value="north">{isTe ? 'ఉత్తరం' : 'North'}</option>
              <option value="east">{isTe ? 'తూర్పు' : 'East'}</option>
              <option value="flat">{isTe ? 'సమతలం' : 'Flat'}</option>
              <option value="south">{isTe ? 'దక్షిణం' : 'South'}</option>
              <option value="south-west">{isTe ? 'నైరుతి' : 'South-west'}</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label={isTe ? 'పొడవు (అడుగులు)' : 'Length (ft)'}>
              <input
                type="number"
                value={plotLen}
                onChange={(e) => setPlotLen(Number(e.target.value))}
                className="w-full rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] text-[#EDE8E0]"
              />
            </Field>
            <Field label={isTe ? 'వెడల్పు (అడుగులు)' : 'Width (ft)'}>
              <input
                type="number"
                value={plotWidth}
                onChange={(e) => setPlotWidth(Number(e.target.value))}
                className="w-full rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] text-[#EDE8E0]"
              />
            </Field>
          </div>
          <Field label={isTe ? 'రోడ్డు ఉన్న దిక్కు' : 'Road side'}>
            <select
              value={plotRoad}
              onChange={(e) => setPlotRoad(e.target.value as DikId)}
              className="w-full rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] text-[#EDE8E0]"
            >
              {DIK_INFO.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameTe} ({d.id})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0F1326] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle icon={<Info className="w-4 h-4" />} title={isTe ? 'స్థల సలహా' : 'Plot guidance'} />
            <ScoreRing score={plot.score} label={isTe ? 'స్థల స్కోరు' : 'Plot score'} />
          </div>
          <div className="space-y-2 text-[12px] text-[#EDE8E0]/80">
            <p className="rounded-lg bg-white/[0.03] px-3 py-2 leading-relaxed">{plot.shapeAdviceTe}</p>
            <p className="rounded-lg bg-white/[0.03] px-3 py-2 leading-relaxed">{plot.slopeAdviceTe}</p>
            <p className="rounded-lg bg-white/[0.03] px-3 py-2 leading-relaxed">{plot.roadAdviceTe}</p>
          </div>
          <div className="rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/5 px-3 py-2 text-[11.5px] text-[#EDE8E0]/80 leading-relaxed">
            {placeReport.orientationAdviceTe}
          </div>
          <div className="rounded-lg bg-white/[0.03] px-3 py-2 text-[11.5px] text-[#EDE8E0]/70 leading-relaxed">
            {placeReport.gatewayAdviceTe}
          </div>
          <p className="text-[10.5px] text-[#EDE8E0]/45 leading-relaxed">
            {isTe
              ? 'గమనిక: ఇది శాస్త్రీయ-జ్యోతిష్య మార్గదర్శనం; నిర్మాణానికి ముందు స్థానిక సర్వేయర్ & నిజ ఉత్తర ధృవీకరణ తప్పనిసరి.'
              : 'Note: this is jyotisha-based guidance; a local survey and true-north verification are required before construction.'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-5">
        <SectionTitle
          icon={<ScrollText className="w-4 h-4" />}
          title={isTe ? 'మూల గ్రంథాలు' : 'Primary sources'}
          sub={isTe ? 'ఈ విశ్లేషణ ఆధారపడిన శాస్త్ర గ్రంథాలు' : 'Texts underlying this analysis'}
        />
        <ul className="grid gap-1.5 sm:grid-cols-2 text-[11.5px] text-[#EDE8E0]/65 leading-relaxed">
          {[
            'విశ్వకర్మ ప్రకాశం — 81 పాద పరమశాయిక మండలం, 45 దేవతలు',
            'మయమతం — 32 దేవతల వైదిక మండలం, బ్రహ్మస్థానం',
            'సమరాంగణ సూత్రధార (భోజరాజు) — గ్రామ/గృహ వాస్తు, దిక్కుల విభజన',
            'వాస్తు శాస్త్రం (అపరాజిత పృచ్ఛా) — దోషాలు, పరిహారాలు',
            'బృహత్ సంహిత (వరాహమిహిరుడు) — దిక్పాలకులు, శంకు (నీడ) పద్ధతి',
            'మానసార — నగర/గ్రామ నిర్మాణ క్రమం',
          ].map((s) => (
            <li key={s} className="flex gap-1.5">
              <span className="text-[#C9A96E]/70">•</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
