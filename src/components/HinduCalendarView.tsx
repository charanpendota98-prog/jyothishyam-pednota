import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Clock,
  MapPin,
  Printer,
  Sunrise,
  Sunset,
  MoonStar,
  Star,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Grid3x3,
  ListOrdered,
  Info,
  Timer,
  CircleDot,
  CalendarRange,
  Eclipse,
  ScrollText,
} from 'lucide-react';
import {
  computeDayPanchanga,
  getMonthCalendar,
  getYearOverview,
  upcomingFestivals,
  type DayPanchanga,
  type GeoContext,
  type KalaWindow,
  type MonthDayCell,
  type FestivalEntry,
} from '../engine/hinduCalendarEngine.ts';
import { SourceStrip } from './SourceStrip.tsx';
import { STATE_DISTRICT_ATLAS, TELUGU_NAKSHATRAS } from '../engine/teluguJathakam.ts';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import type { AppLanguage } from '../engine/teluguJathakam.ts';

interface HinduCalendarViewProps {
  chart: CompleteChartResult;
  lang?: AppLanguage;
}

const TELUGU_MONTHS = [
  'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
  'జూలై', 'ఆగస్టు', 'సెప్టెంబరు', 'అక్టోబరు', 'నవంబరు', 'డిసెంబరు',
];
const WEEKDAY_SHORT_TE = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];
const RASI_SHORT_TE = ['మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం', 'సింహం', 'కన్య', 'తుల', 'వృశ్చికం', 'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం'];

const ISO_TODAY = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const addDaysISO = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
};
const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const CityPicker: React.FC<{ value: GeoContext; onChange: (g: GeoContext) => void }> = ({ value, onChange }) => (
  <select
    className="rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] text-[#EDE8E0] outline-none focus:border-[#C9A96E]/60"
    value={`${value.placeName}|${value.lat}|${value.lng}`}
    onChange={(e) => {
      const [name, lat, lng] = e.target.value.split('|');
      onChange({ lat: Number(lat), lng: Number(lng), tzOffsetHours: 5.5, placeName: name });
    }}
  >
    {STATE_DISTRICT_ATLAS.map((state) => (
      <optgroup key={state.id} label={state.nameTe}>
        {state.districts.map((d) => (
          <option key={d.id} value={`${d.hqTe} (${d.nameEn})|${d.lat}|${d.lng}`}>
            {d.hqTe} — {d.nameEn}
          </option>
        ))}
      </optgroup>
    ))}
  </select>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }> = ({
  icon,
  children,
  right,
}) => (
  <div className="flex items-center justify-between gap-2 mb-3">
    <div className="flex items-center gap-2 text-[#EDE8E0] font-display text-[15px]">
      <span className="text-[#C9A96E]">{icon}</span>
      {children}
    </div>
    {right}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-white/10 bg-[#0F1326] p-4 ${className}`}>{children}</div>
);

const AngaCard: React.FC<{
  labelTe: string;
  valueTe: string;
  subTe: string;
  start: string;
  end: string;
  percent: number;
  accent: string;
  icon: React.ReactNode;
}> = ({ labelTe, valueTe, subTe, start, end, percent, accent, icon }) => (
  <div className="rounded-xl border border-white/10 bg-[#0F1326] p-3">
    <div className="flex items-center justify-between">
      <span className="text-[10.5px] tracking-wider uppercase" style={{ color: accent }}>
        {labelTe}
      </span>
      <span style={{ color: accent }}>{icon}</span>
    </div>
    <div className="font-display text-[16px] text-[#EDE8E0] mt-0.5 leading-tight">{valueTe}</div>
    <div className="text-[10.5px] text-[#EDE8E0]/45 leading-tight mt-0.5 h-7 overflow-hidden">{subTe}</div>
    <div className="mt-1 h-1 rounded-full bg-white/8 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, percent)}%`, background: accent }} />
    </div>
    <div className="mt-1 flex items-center justify-between font-mono-tabular text-[10px] text-[#EDE8E0]/50">
      <span>{start}</span>
      <span>{end}</span>
    </div>
  </div>
);

const KalaRow: React.FC<{ win: KalaWindow; live: boolean }> = ({ win, live }) => {
  const tone =
    win.quality === 'auspicious'
      ? { bg: 'bg-[#5BBFB5]/8', border: 'border-[#5BBFB5]/30', text: 'text-[#5BBFB5]' }
      : win.quality === 'inauspicious'
        ? { bg: 'bg-[#D47B7B]/8', border: 'border-[#D47B7B]/30', text: 'text-[#D47B7B]' }
        : { bg: 'bg-white/[0.03]', border: 'border-white/10', text: 'text-[#C9A96E]' };
  return (
    <div className={`rounded-lg border ${tone.border} ${tone.bg} px-2.5 py-2 ${live ? 'ring-1 ring-[#C9A96E]' : ''}`}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[12px] text-[#EDE8E0] leading-tight">{win.nameTe}</span>
        {live && <span className="text-[9px] text-[#C9A96E] font-semibold">ఇప్పుడు</span>}
      </div>
      <div className={`font-mono-tabular text-[11px] ${tone.text}`}>
        {win.startTime} – {win.endTime}
      </div>
      {win.noteTe && <div className="text-[9.5px] text-[#EDE8E0]/35 leading-snug mt-0.5">{win.noteTe}</div>}
    </div>
  );
};

export const HinduCalendarView: React.FC<HinduCalendarViewProps> = ({ chart }) => {
  const [dateISO, setDateISO] = useState<string>(ISO_TODAY());
  const [todayISO] = useState<string>(ISO_TODAY());
  const [geo, setGeo] = useState<GeoContext>({
    lat: chart.input.lat,
    lng: chart.input.lng,
    tzOffsetHours: chart.input.tzOffsetHours,
    placeName: chart.input.city || 'హైదరాబాద్',
  });
  const [view, setView] = useState<'day' | 'month' | 'year'>('day');
  const [monthYear, setMonthYear] = useState<number>(() => Number(ISO_TODAY().slice(0, 4)));
  const [monthIdx, setMonthIdx] = useState<number>(() => Number(ISO_TODAY().slice(5, 7)) - 1);
  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const mo = useMemo(() => chart.planets.find((p) => p.id === 'Moon'), [chart]);
  const janmaNakshatraIndex = mo ? Math.floor(mo.siderealLon / (360 / 27)) : 0;

  const [ayanamsaMode, setAyanamsaMode] = useState<'lahiri' | 'sayana'>('lahiri');
  const [riseMode, setRiseMode] = useState<'hindu' | 'centre-refraction'>('hindu');
  const day: DayPanchanga = useMemo(
    () => computeDayPanchanga(dateISO, geo, { siderealMode: ayanamsaMode, riseConvention: riseMode }),
    [dateISO, geo, ayanamsaMode, riseMode]
  );
  const monthCells: MonthDayCell[] = useMemo(
    () => getMonthCalendar(monthYear, monthIdx + 1, geo, { todayISO }),
    [monthYear, monthIdx, geo, todayISO]
  );
  const yearData = useMemo(() => (view === 'year' ? getYearOverview(monthYear, geo) : null), [view, monthYear, geo]);
  const upcoming = useMemo(() => upcomingFestivals(dateISO, geo, { count: 10 }), [dateISO, geo]);

  const isLiveWindow = (w: KalaWindow) => {
    if (dateISO !== todayISO || !w.startTime || !w.endTime) return false;
    const s = minutesOf(w.startTime);
    const e = minutesOf(w.endTime);
    return e > s ? nowMinutes >= s && nowMinutes < e : nowMinutes >= s || nowMinutes < e;
  };

  const goToDate = (iso: string) => {
    setDateISO(iso);
    setMonthYear(Number(iso.slice(0, 4)));
    setMonthIdx(Number(iso.slice(5, 7)) - 1);
  };

  const inauspicious = day.kalas.filter((k) => k.quality === 'inauspicious');
  const auspicious = day.kalas.filter((k) => k.quality === 'auspicious');
  const moonNak = TELUGU_NAKSHATRAS[day.nakshatra.number - 1];
  const taraForMe = day.tarabalam.taras[(day.nakshatra.number - 1 - janmaNakshatraIndex + 27) % 9];

  const leadingBlanks = monthCells.length > 0 ? monthCells[0].weekdayIndex : 0;

  return (
    <div className="grantha-print-area space-y-4">
      {/* ---------- Title / controls ---------- */}
      <div className="rounded-2xl border border-[#C9A96E]/25 bg-gradient-to-br from-[#141932] via-[#0F1326] to-[#0B0F1E] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#C9A96E] text-[11px] tracking-[0.18em] uppercase">
              <CalendarDays className="w-4 h-4" /> వైదిక పంచాంగం · సిద్ధాంత గణన
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#EDE8E0] mt-1">
              హిందూ క్యాలెండర్ & పంచాంగం
            </h1>
            <p className="text-[12.5px] text-[#EDE8E0]/55 mt-1">
              {geo.placeName} · శ్రీ {day.era.samvatsaraTe} నామ సంవత్సరం · శాలివాహన శక {day.era.shakaYear} · విక్రమ సంవత్సరం{' '}
              {day.era.vikramYear} · కలియుగ {day.era.kaliYear}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <CityPicker value={geo} onChange={setGeo} />
            <input
              type="date"
              value={dateISO}
              onChange={(e) => goToDate(e.target.value)}
              className="rounded-lg border border-white/15 bg-[#141932] px-2 py-1.5 text-[12px] text-[#EDE8E0] outline-none focus:border-[#C9A96E]/60"
            />
            <button
              onClick={() => goToDate(todayISO)}
              className="rounded-lg border border-[#C9A96E]/40 bg-[#C9A96E]/10 px-2.5 py-1.5 text-[12px] text-[#C9A96E] hover:bg-[#C9A96E]/20"
            >
              నేడు
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-white/15 px-2 py-1.5 text-[#EDE8E0]/60 hover:text-[#EDE8E0]"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 rounded-xl border border-white/10 overflow-hidden text-[12px]">
          {[
            ['మాసం', `${day.era.masaLabelTe} (అమాంత)`],
            ['పక్షం', day.era.pakshaTe],
            ['ఋతువు', day.era.rituTe],
            ['సంవత్సరం', `శ్రీ ${day.era.samvatsaraTe}`],
            ['అయనం', day.era.ayanaTe],
            ['సూర్య రాశి (సౌర మాసం)', `${day.era.solarMonthTe} · ${day.era.solarMonthDay}వ దినం`],
          ].map(([k, v], idx) => (
            <div key={k} className={`px-3 py-2 ${idx < 3 ? 'border-b border-white/10' : ''} ${idx % 3 !== 2 ? 'border-r border-white/10' : ''}`}>
              <div className="text-[9.5px] uppercase tracking-wider text-[#EDE8E0]/35">{k}</div>
              <div className="text-[#EDE8E0] leading-snug">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Date nav ---------- */}
      <div className="rounded-xl border border-white/10 bg-[#0F1326] px-3 py-2 flex items-center justify-between">
        <button onClick={() => goToDate(addDaysISO(dateISO, -1))} className="p-1.5 text-[#EDE8E0]/60 hover:text-[#EDE8E0]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="font-display text-lg text-[#EDE8E0]">
            {dateISO} · {day.weekday.nameTe}
          </div>
          <div className="text-[11px] text-[#EDE8E0]/45">
            {day.weekday.lordTe} వారం · {day.tithi.nameTe} · {day.nakshatra.nameTe} నక్షత్రం
          </div>
        </div>
        <button onClick={() => goToDate(addDaysISO(dateISO, 1))} className="p-1.5 text-[#EDE8E0]/60 hover:text-[#EDE8E0]">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ---------- చట్రం (నిరయన/సాయన) & ఉదయ నిర్వచనం ---------- */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#EDE8E0]/45">చట్రం:</span>
          {([
            ['lahiri', 'నిరయనం (లహిరి)'],
            ['sayana', 'సాయనం (ఖగోళ)'],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setAyanamsaMode(k)}
              className={`rounded-md px-2 py-0.5 border ${
                ayanamsaMode === k
                  ? 'border-[#C9A96E]/60 bg-[#C9A96E]/15 text-[#E8D3A9]'
                  : 'border-white/10 text-[#EDE8E0]/55 hover:text-[#EDE8E0]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#EDE8E0]/45">సూర్యోదయ నిర్వచనం:</span>
          {([
            ['hindu', 'డ్రిక్ (కేంద్రం, వక్రీభవనం లేదు)'],
            ['centre-refraction', 'ఖగోళ (కేంద్రం + వక్రీభవనం)'],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRiseMode(k)}
              className={`rounded-md px-2 py-0.5 border ${
                riseMode === k
                  ? 'border-[#C9A96E]/60 bg-[#C9A96E]/15 text-[#E8D3A9]'
                  : 'border-white/10 text-[#EDE8E0]/55 hover:text-[#EDE8E0]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-[#EDE8E0]/35">
          {ayanamsaMode === 'sayana'
            ? 'సాయనం పోలిక కోసం మాత్రమే — జ్యోతిష ప్రమాణం నిరయనం (లహిరి).'
            : `అయనాంశం ${day.ayanamsaFormatted}`}
        </span>
      </div>

      {/* ---------- Five angas ---------- */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        <AngaCard
          labelTe="తిథి"
          valueTe={day.tithi.nameTe}
          subTe={`${day.tithi.pakshaTe} · తర్వాత ${day.tithi.nextNameTe ?? '—'}`}
          start={day.tithi.startTime}
          end={day.tithi.endTime}
          percent={day.tithi.percentElapsed}
          accent="#C9A96E"
          icon={<Moon className="w-3.5 h-3.5" />}
        />
        <AngaCard
          labelTe="నక్షత్రం"
          valueTe={`${day.nakshatra.nameTe} · ${day.nakshatra.pada}`}
          subTe={`${day.nakshatra.nameEn} · ${day.nakshatra.lordTe} · ${moonNak?.deityTe ?? ''}`}
          start={day.nakshatra.startTime}
          end={day.nakshatra.endTime}
          percent={day.nakshatra.percentElapsed}
          accent="#9B8FD4"
          icon={<Star className="w-3.5 h-3.5" />}
        />
        <AngaCard
          labelTe="యోగం"
          valueTe={day.yoga.nameTe}
          subTe={`${day.yoga.nameEn} · ${day.yoga.isAuspicious ? 'శుభం' : 'అశుభం'}`}
          start={day.yoga.startTime}
          end={day.yoga.endTime}
          percent={day.yoga.percentElapsed}
          accent={day.yoga.isAuspicious ? '#5BBFB5' : '#D47B7B'}
          icon={<Sparkles className="w-3.5 h-3.5" />}
        />
        <AngaCard
          labelTe="కరణం"
          valueTe={day.karana.nameTe}
          subTe={day.karana.typeTe}
          start={day.karana.startTime}
          end={day.karana.endTime}
          percent={day.karana.percentElapsed}
          accent={day.karana.isBhadra ? '#D47B7B' : '#8FBFA0'}
          icon={<CircleDot className="w-3.5 h-3.5" />}
        />
        <AngaCard
          labelTe="వారం"
          valueTe={day.weekday.nameTe}
          subTe={`అధిపతి ${day.weekday.lordTe} · ${day.weekday.nameEn}`}
          start={day.sunrise}
          end={day.sunset}
          percent={Math.min(100, Math.max(0, ((nowMinutes - minutesOf(day.sunrise)) / Math.max(1, minutesOf(day.sunset) - minutesOf(day.sunrise))) * 100))}
          accent="#E3B05E"
          icon={<Sun className="w-3.5 h-3.5" />}
        />
      </div>

      {/* ---------- Sun / Moon ---------- */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <SectionTitle icon={<Sunrise className="w-4 h-4" />}>సూర్య గణన</SectionTitle>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {[
              ['సూర్యోదయం', day.sunrise],
              ['సూర్యాస్తమయం', day.sunset],
              ['మధ్యాహ్నం', day.solarNoon],
              ['దినమానం', day.dinmanaTe],
              ['రాత్రిమానం', day.ratrimanaTe],
              [
                'సూర్య రాశి',
                `${RASI_SHORT_TE[day.sunSignIndex]}${
                  day.sunSignEnd
                    ? ` · ${day.sunSignEnd.nextSignTe.replace(' రాశి', '')}లోకి ${
                        day.sunSignEnd.sameDay ? day.sunSignEnd.time : day.sunSignEnd.dateISO.slice(8) + 'వ తేదీ ' + day.sunSignEnd.time
                      }`
                    : ''
                }`,
              ],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                <div className="text-[9.5px] text-[#EDE8E0]/35">{k}</div>
                <div className="text-[#EDE8E0] font-mono-tabular text-[12px]">{v}</div>
              </div>
            ))}
          </div>
          <div className="text-[10.5px] text-[#EDE8E0]/40 mt-2">
            సూర్య నక్షత్రం: {TELUGU_NAKSHATRAS[day.sunNakshatraIndex]?.nameTe} · అయనాంశం: {day.ayanamsaFormatted}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={<MoonStar className="w-4 h-4" />}>చంద్ర గణన</SectionTitle>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {[
              ['చంద్రోదయం', day.moonrise],
              ['చంద్రాస్తమయం', `${day.moonset}${day.moonsetNextDay ? ' (+1)' : ''}`],
              [
                'చంద్ర రాశి',
                `${RASI_SHORT_TE[day.moonSignIndex]}${
                  day.moonSignEnd
                    ? ` · ${day.moonSignEnd.nextSignTe.replace(' రాశి', '')}లోకి ${
                        day.moonSignEnd.sameDay ? day.moonSignEnd.time : day.moonSignEnd.dateISO.slice(8) + 'వ తేదీ ' + day.moonSignEnd.time
                      }`
                    : ''
                }`,
              ],
              ['నక్షత్రం', `${day.nakshatra.nameTe} ${day.nakshatra.pada}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                <div className="text-[9.5px] text-[#EDE8E0]/35">{k}</div>
                <div className="text-[#EDE8E0] font-mono-tabular text-[12px]">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10.5px] leading-relaxed text-[#EDE8E0]/45">
            చంద్రబలం: {day.chandrabalam.goodRasis.map((r) => RASI_SHORT_TE[r]).join(', ')}
            <br />
            మీ జన్మ నక్షత్రానికి: <span className={taraForMe?.good ? 'text-[#5BBFB5]' : 'text-[#D47B7B]'}>
              {taraForMe?.te ?? '—'}
            </span>{' '}
            ({taraForMe?.good ? 'శుభం' : 'అశుభం'})
          </div>
        </Card>

        <Card>
          <SectionTitle icon={<ScrollText className="w-4 h-4" />}>కాల గణన</SectionTitle>
          <div className="space-y-1 text-[11.5px]">
            {[
              ['కలి అహర్గణ', `${day.kaliAhargana}`],
              ['జూలియన్ దినం', `${day.julianDay.toFixed(3)}`],
              ['రాట డై', `${day.rataDie}`],
              ['సంశోధిత జూలియన్', `${day.mjd.toFixed(3)}`],
              ['ఉగాది', day.era.ugadiISO],
              ['అధిక మాసం', day.era.masaIsAdhika ? 'అవును (ఈ నెల అధికం)' : 'ఈ నెల నిజం'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2 border-b border-white/5 pb-1">
                <span className="text-[#EDE8E0]/40">{k}</span>
                <span className="font-mono-tabular text-[#EDE8E0]/85">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------- Kalas ---------- */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={<AlertTriangle className="w-4 h-4" />}>వర్జ్య / అశుభ కాలాలు</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {inauspicious.map((k) => (
              <KalaRow key={k.key} win={k} live={isLiveWindow(k)} />
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle icon={<CheckCircle2 className="w-4 h-4" />}>శుభ కాలాలు (ముహూర్తాలు)</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {auspicious.map((k) => (
              <KalaRow key={k.key} win={k} live={isLiveWindow(k)} />
            ))}
          </div>
        </Card>
      </div>

      {/* ---------- Karana + choghadiya + hora ---------- */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <SectionTitle icon={<ListOrdered className="w-4 h-4" />}>కరణ పట్టిక</SectionTitle>
          <div className="space-y-1">
            {day.karanaSchedule.map((k, i) => (
              <div
                key={`${k.nameTe}-${i}`}
                className={`flex items-center justify-between rounded-md px-2 py-1 text-[11.5px] ${
                  k.isBhadra ? 'bg-[#D47B7B]/10 text-[#D47B7B]' : 'bg-white/[0.03] text-[#EDE8E0]/80'
                }`}
              >
                <span>{k.nameTe}</span>
                <span className="font-mono-tabular text-[10.5px] text-[#EDE8E0]/50">
                  {k.startTime} – {k.endTime}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={<Clock className="w-4 h-4" />}>చోఘడియ</SectionTitle>
          <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/35 mb-1">పగలు</div>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {day.choghadiya.day.map((c) => (
              <div
                key={c.key}
                className={`rounded px-1 py-1 text-center text-[9.5px] border ${
                  c.quality === 'auspicious'
                    ? 'border-[#5BBFB5]/30 bg-[#5BBFB5]/8 text-[#5BBFB5]'
                    : 'border-[#D47B7B]/25 bg-[#D47B7B]/6 text-[#D47B7B]/90'
                }`}
              >
                <div>{c.nameTe.replace(' చోఘడియ', '')}</div>
                <div className="font-mono-tabular text-[9px] opacity-60">{c.startTime}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/35 mb-1">రాత్రి</div>
          <div className="grid grid-cols-4 gap-1">
            {day.choghadiya.night.map((c) => (
              <div
                key={c.key}
                className={`rounded px-1 py-1 text-center text-[9.5px] border ${
                  c.quality === 'auspicious'
                    ? 'border-[#5BBFB5]/30 bg-[#5BBFB5]/8 text-[#5BBFB5]'
                    : 'border-[#D47B7B]/25 bg-[#D47B7B]/6 text-[#D47B7B]/90'
                }`}
              >
                <div>{c.nameTe.replace(' చోఘడియ', '')}</div>
                <div className="font-mono-tabular text-[9px] opacity-60">{c.startTime}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={<Timer className="w-4 h-4" />}>హోర (24)</SectionTitle>
          <div className="grid grid-cols-4 gap-1">
            {day.hora.map((h, i) => (
              <div
                key={h.key}
                className="rounded px-1 py-1 text-center border border-white/10 bg-white/[0.03]"
                title={`${h.nameTe} · ${h.startTime}`}
              >
                <div className="text-[9.5px] text-[#EDE8E0]/85">{h.nameTe.replace(' హోర', '').slice(0, 6)}</div>
                <div className="font-mono-tabular text-[8.5px] text-[#EDE8E0]/40">{h.startTime}</div>
                <div className="text-[8px] text-[#EDE8E0]/25">{i + 1}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------- Observances ---------- */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={<Flame className="w-4 h-4" />}>ఈ రోజు పండుగలు / వ్రతాలు</SectionTitle>
          {day.observances.length === 0 ? (
            <div className="text-[12px] text-[#EDE8E0]/40">ప్రత్యేక పర్వదినాలు లేవు.</div>
          ) : (
            <div className="space-y-1.5">
              {day.observances.map((f) => (
                <div key={`${f.id}-${f.dateISO}`} className="rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/[0.07] px-2.5 py-2">
                  <div className="text-[12.5px] text-[#EDE8E0]">{f.nameTe}</div>
                  <div className="text-[11px] text-[#EDE8E0]/50 leading-snug">{f.descriptionTe}</div>
                  {f.timingNoteTe && <div className="text-[10px] text-[#C9A96E]/70 mt-0.5">{f.timingNoteTe}</div>}
                </div>
              ))}
            </div>
          )}
          {day.specialFlags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {day.specialFlags.map((f) => (
                <span
                  key={f.key}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    ['ekadashi', 'purnima', 'amavasya'].includes(f.key)
                      ? 'bg-[#C9A96E]/15 text-[#C9A96E]'
                      : 'bg-[#D47B7B]/15 text-[#D47B7B]'
                  }`}
                >
                  {f.te}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle icon={<CalendarRange className="w-4 h-4" />}>రాబోయే పండుగలు</SectionTitle>
          <div className="space-y-1">
            {upcoming.map((f: FestivalEntry) => (
              <button
                key={`${f.id}-${f.dateISO}`}
                onClick={() => goToDate(f.dateISO)}
                className="w-full flex items-center justify-between gap-2 rounded-md px-2 py-1 text-left hover:bg-white/5"
              >
                <span className="text-[12px] text-[#EDE8E0]">{f.nameTe}</span>
                <span className="font-mono-tabular text-[10.5px] text-[#C9A96E]">{f.dateISO}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------- Month / Year ---------- */}
      <div className="rounded-xl border border-white/10 bg-[#0F1326] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <SectionTitle icon={<Grid3x3 className="w-4 h-4" />}>నెల క్యాలెండర్</SectionTitle>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => {
                if (monthIdx === 0) {
                  setMonthIdx(11);
                  setMonthYear((y) => y - 1);
                } else setMonthIdx((m) => m - 1);
              }}
              className="p-1 text-[#EDE8E0]/60 hover:text-[#EDE8E0]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-display text-[15px] text-[#EDE8E0] min-w-[150px] text-center">
              {TELUGU_MONTHS[monthIdx]} {monthYear}
            </span>
            <button
              onClick={() => {
                if (monthIdx === 11) {
                  setMonthIdx(0);
                  setMonthYear((y) => y + 1);
                } else setMonthIdx((m) => m + 1);
              }}
              className="p-1 text-[#EDE8E0]/60 hover:text-[#EDE8E0]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_SHORT_TE.map((w) => (
            <div key={w} className="text-center text-[10px] text-[#EDE8E0]/35 py-1">
              {w}
            </div>
          ))}
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`b${i}`} />
          ))}
          {monthCells.map((c) => {
            const selected = c.dateISO === dateISO;
            return (
              <button
                key={c.dateISO}
                onClick={() => goToDate(c.dateISO)}
                className={`relative rounded-md border p-1 text-left min-h-[62px] transition-colors ${
                  selected
                    ? 'border-[#C9A96E] bg-[#C9A96E]/12'
                    : c.isToday
                      ? 'border-[#5BBFB5]/60 bg-[#5BBFB5]/8'
                      : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-[11.5px] text-[#EDE8E0]">{c.dayOfMonth}</span>
                  <span className="flex gap-0.5">
                    {c.isPurnima && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />}
                    {c.isAmavasya && <span className="w-1.5 h-1.5 rounded-full bg-[#6E8FD0]" />}
                  </span>
                </div>
                <div className="text-[8.5px] text-[#EDE8E0]/55 leading-tight truncate">{c.tithiNameTe}</div>
                <div className="text-[8px] text-[#9B8FD4]/70 leading-tight truncate">{c.nakshatraNameTe}</div>
                {c.festivals.length > 0 && (
                  <div className="text-[8px] text-[#E3B05E] leading-tight truncate">◆ {c.festivals[0].nameTe}</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-[#EDE8E0]/35">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" /> పౌర్ణమి</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#6E8FD0]" /> అమావాస్య</span>
          <span className="flex items-center gap-1"><span className="text-[#E3B05E]">◆</span> పండుగ</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm border border-[#5BBFB5]" /> నేడు</span>
        </div>

        <div className="mt-3 flex gap-2 no-print">
          <button
            onClick={() => setView(view === 'year' ? 'day' : 'year')}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-[11.5px] text-[#EDE8E0]/70 hover:text-[#EDE8E0]"
          >
            {view === 'year' ? 'సంవత్సర వివరాలు మూసివేయి' : `${monthYear} సంవత్సర వివరాలు చూపించు`}
          </button>
        </div>
      </div>

      {view === 'year' && yearData && (
        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <SectionTitle icon={<CalendarRange className="w-4 h-4" />}>{yearData.gregorianYear} — మాస క్రమం</SectionTitle>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              {yearData.months.map((m) => (
                <div
                  key={`${m.masaTe}-${m.startISO}-${m.isAdhika}`}
                  className={`flex items-center justify-between rounded-md px-2 py-1 ${
                    m.isAdhika ? 'bg-[#D47B7B]/10 text-[#D47B7B]' : 'bg-white/[0.03] text-[#EDE8E0]/80'
                  }`}
                >
                  <span className="text-[11.5px]">
                    {m.isAdhika ? `అధిక ${m.masaTe}` : m.masaTe}
                  </span>
                  <span className="font-mono-tabular text-[10px] opacity-70">
                    {m.startISO} → {m.endISO}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<Sun className="w-4 h-4" />}>సంక్రమణాలు</SectionTitle>
            <div className="grid gap-1 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
              {yearData.sankrantis.map((s) => (
                <button
                  key={`${s.signIndex}-${s.dateISO}`}
                  onClick={() => goToDate(s.dateISO)}
                  className="flex items-center justify-between rounded-md px-2 py-1 bg-white/[0.03] hover:bg-white/[0.07] text-left"
                >
                  <span className="text-[11.5px] text-[#EDE8E0]/85">{s.signTe} సంక్రమణం</span>
                  <span className="font-mono-tabular text-[10px] text-[#C9A96E]">
                    {s.dateISO} {s.timeLocal}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<Eclipse className="w-4 h-4" />}>గ్రహణాలు</SectionTitle>
            {yearData.eclipses.length === 0 ? (
              <div className="text-[12px] text-[#EDE8E0]/40">ఈ సంవత్సరం గ్రహణాలు లేవు.</div>
            ) : (
              <div className="space-y-1">
                {yearData.eclipses.map((e) => (
                  <div key={`${e.kind}-${e.dateISO}`} className="rounded-md bg-white/[0.03] px-2 py-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] text-[#EDE8E0]">
                        {e.kind === 'solar' ? 'సూర్య గ్రహణం' : 'చంద్ర గ్రహణం'} — {e.typeTe}
                      </span>
                      <span className="font-mono-tabular text-[10px] text-[#9B8FD4]">{e.dateISO}</span>
                    </div>
                    <div className="text-[10.5px] text-[#EDE8E0]/45">{e.detailTe}</div>
                    <div className="text-[10px] text-[#EDE8E0]/35">
                      {e.visible ? 'భారతదేశంలో కనిపిస్తుంది' : 'భారతదేశంలో కనిపించదు'} · {e.timeLocal}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle icon={<ScrollText className="w-4 h-4" />}>{yearData.gregorianYear} పండుగలు</SectionTitle>
            <div className="grid gap-x-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
              {yearData.festivals
                .filter((f) => f.category !== 'monthly')
                .map((f) => (
                  <button
                    key={`${f.id}-${f.dateISO}`}
                    onClick={() => goToDate(f.dateISO)}
                    className="flex items-baseline justify-between gap-2 border-b border-white/5 py-1 text-left hover:bg-white/5"
                  >
                    <span className="text-[11px] text-[#EDE8E0]/80 truncate">{f.nameTe}</span>
                    <span className="font-mono-tabular text-[9.5px] text-[#C9A96E] shrink-0">{f.dateISO.slice(5)}</span>
                  </button>
                ))}
            </div>
          </Card>
        </div>
      )}

      <SourceStrip feature="panchanga" compact />

      <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[10.5px] text-[#EDE8E0]/40">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          గణన విధానం: నిరయన సిద్ధాంత (లాహిరి అయనాంశం), స్థానిక సూర్యోదయ ప్రామాణికం, నిజ సూర్య-చంద్ర స్ఫుటాలు.
          అవమాన/పౌర్ణిమాంత మాసాలు, అధిక మాసం, క్షయ తిథులు స్వయంచాలకంగా నిర్ణయించబడతాయి. ప్రాంతీయ ఆచార భేదాలను
          బట్టి కొన్ని పండుగల తేదీలు ఒక రోజు తేడా ఉండవచ్చు.
        </span>
      </div>
    </div>
  );
};
