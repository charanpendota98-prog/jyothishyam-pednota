import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Moon, Sun } from 'lucide-react';
import type { CompleteChartResult } from '../engine/ephemeris.ts';
import { getYearOverview } from '../engine/hinduCalendarEngine.ts';

interface Props {
  chart: CompleteChartResult;
  lang?: 'te' | 'en';
}

export default function EclipsesView({ chart, lang = 'te' }: Props) {
  const isTe = lang === 'te';
  const [year, setYear] = useState(new Date().getFullYear());
  const geo = useMemo(() => ({
    lat: chart.input.lat,
    lng: chart.input.lng,
    tzOffsetHours: chart.input.tzOffsetHours,
    placeName: chart.input.city,
  }), [chart.input.lat, chart.input.lng, chart.input.tzOffsetHours, chart.input.city]);
  const overview = useMemo(() => getYearOverview(year, geo, { siderealMode: 'lahiri' }), [year, geo]);
  const events = overview.eclipses;

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-white/10 bg-[#0F1326] p-5 sm:p-6">
        <div>
          <div className="section-eyebrow">{isTe ? 'ఖగోళ గణన · స్థానిక దర్శన స్థితి' : 'Astronomical events · local visibility'}</div>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#F4F0E8]">
            {isTe ? 'సూర్య & చంద్ర గ్రహణాలు' : 'Solar & Lunar Eclipses'}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[#EDE8E0]/55">
            <MapPin className="h-3.5 w-3.5 text-[#C9A96E]" />
            {chart.input.city} · {geo.lat.toFixed(3)}°, {geo.lng.toFixed(3)}° · UTC{geo.tzOffsetHours >= 0 ? '+' : ''}{geo.tzOffsetHours}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#090C18] p-1.5">
          <button onClick={() => setYear((y) => y - 1)} className="rounded-lg p-2 text-[#EDE8E0]/70 hover:bg-white/5" aria-label="Previous year"><ChevronLeft className="h-4 w-4" /></button>
          <div className="flex items-center gap-2 px-2 text-sm font-semibold tabular-nums text-[#E4C68C]"><CalendarDays className="h-4 w-4" />{year}</div>
          <button onClick={() => setYear((y) => y + 1)} className="rounded-lg p-2 text-[#EDE8E0]/70 hover:bg-white/5" aria-label="Next year"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => {
          const solar = event.kind === 'solar';
          const Icon = solar ? Sun : Moon;
          return (
            <article key={`${event.dateISO}-${event.kind}`} className="rounded-2xl border border-white/10 bg-[#0B0F1E] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`grid h-10 w-10 place-items-center rounded-xl border ${solar ? 'border-amber-300/25 bg-amber-300/10 text-amber-200' : 'border-indigo-300/25 bg-indigo-300/10 text-indigo-200'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${event.visible ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-[#EDE8E0]/45'}`}>
                  {event.visible ? (isTe ? 'గరిష్ఠ సమయంలో కనిపిస్తుంది' : 'Visible at maximum') : (isTe ? 'గరిష్ఠ సమయంలో కనిపించదు' : 'Not visible at maximum')}
                </span>
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-[0.16em] text-[#C9A96E]">
                {solar ? (isTe ? 'సూర్య గ్రహణం' : 'Solar eclipse') : (isTe ? 'చంద్ర గ్రహణం' : 'Lunar eclipse')}
              </div>
              <h2 className="mt-1 text-lg font-bold text-[#F4F0E8]">{event.typeTe}</h2>
              <div className="mt-3 flex items-baseline gap-2 font-mono-tabular">
                <span className="text-sm text-[#EDE8E0]">{event.dateISO}</span>
                <span className="text-sm text-[#E4C68C]">{event.timeLocal}</span>
                <span className="text-[10px] text-[#EDE8E0]/40">{isTe ? 'స్థానిక గరిష్ఠం' : 'local maximum'}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#EDE8E0]/60">{event.detailTe}</p>
            </article>
          );
        })}
        {events.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-[#EDE8E0]/55">
            {isTe ? `${year}లో ఈ ప్రదేశానికి గ్రహణ గరిష్ఠాలు లేవు.` : `No eclipse maxima are listed for this location in ${year}.`}
          </div>
        )}
      </div>

      <aside className="rounded-xl border border-amber-200/15 bg-amber-200/[0.035] p-4 text-xs leading-relaxed text-[#EDE8E0]/60">
        {isTe
          ? 'ఇక్కడి దర్శన స్థితి గరిష్ఠ క్షణంలో సూర్యుడు/చంద్రుని ఎత్తుపై ఆధారపడుతుంది; గ్రహణపు అన్ని స్థానిక స్పర్శ-మోక్ష సమయాలను ఇది సూచించదు. సూతక/ఆచార నియమాలు సంప్రదాయం, ప్రాంతాన్ని బట్టి మారుతాయి; అందుకే ధృవీకరించని సూతక సమయాన్ని చూపించడం లేదు.'
          : 'Visibility is evaluated at the eclipse maximum only; local contact and end times are not represented here. Sutak observance varies by tradition and region, so no unverified Sutak window is shown.'}
      </aside>
    </section>
  );
}
