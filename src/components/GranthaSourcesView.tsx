import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ScrollText,
  Search,
  Library,
  Quote,
  ShieldCheck,
  Printer,
  ChevronDown,
} from 'lucide-react';
import {
  GRANTHAS,
  GRANTHA_DOMAINS,
  type GranthaDomain,
  type GranthaEntry,
} from '../engine/classicalSources.ts';

interface GranthaSourcesViewProps {
  lang?: 'te' | 'en';
}

const DOMAIN_ACCENT: Record<GranthaDomain, string> = {
  vedanga: '#C9A96E',
  siddhanta: '#5BBFB5',
  jataka: '#9B8FD4',
  samhita: '#E3B05E',
  muhurta: '#D4A373',
  prashna: '#8FBFA0',
  tajika: '#D47B7B',
  jaimini: '#B7A6E8',
  vastu: '#C25B5B',
  paddhati: '#6E8FD0',
};

const GranthaCard: React.FC<{ g: GranthaEntry; open: boolean; onToggle: () => void }> = ({
  g,
  open,
  onToggle,
}) => {
  const accent = DOMAIN_ACCENT[g.domain];
  return (
    <div
      className="rounded-2xl border bg-[#0F1326] overflow-hidden transition-colors"
      style={{ borderColor: open ? `${accent}88` : 'rgba(255,255,255,0.10)' }}
    >
      <button onClick={onToggle} className="w-full text-left px-4 py-3 flex items-start gap-3">
        <span
          className="mt-[2px] w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}1F`, color: accent }}
        >
          <BookOpen className="w-4 h-4" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-display text-[15px] text-[#EDE8E0] leading-tight">{g.nameTe}</span>
          <span className="block text-[11px] text-[#EDE8E0]/50 mt-0.5">
            {g.nameSanskrit} · {g.authorTe} · {g.periodTe}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: accent }}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: `${accent}33` }}>
          <p className="pt-3 text-[11.5px] text-[#EDE8E0]/70 leading-relaxed">{g.nameEn} — {g.languageTe}</p>

          <div>
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: `${accent}CC` }}>
              ఈ యాప్ తీసుకునే సిద్ధాంతాలు
            </div>
            <ul className="space-y-1">
              {g.doctrineTe.map((d, i) => (
                <li key={i} className="flex gap-1.5 text-[11.5px] text-[#EDE8E0]/80 leading-relaxed">
                  <span style={{ color: accent }}>•</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {g.chaptersTe.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1 text-[#EDE8E0]/40">అధ్యాయ ఆధారాలు</div>
              <div className="flex flex-wrap gap-1.5">
                {g.chaptersTe.map((c, i) => (
                  <span
                    key={i}
                    className="rounded-full border px-2 py-0.5 text-[10px]"
                    style={{ borderColor: `${accent}55`, color: `${accent}DD` }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {g.verses?.map((v, i) => (
            <div key={i} className="rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/5 px-3 py-2 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-[#C9A96E]">
                <Quote className="w-3 h-3" /> శ్లోకం
              </div>
              <div className="text-[12px] text-[#EDE8E0]/90 leading-relaxed">{v.sanskrit}</div>
              <div className="text-[10.5px] text-[#EDE8E0]/45 italic">{v.translitTe}</div>
              <div className="text-[11px] text-[#EDE8E0]/75 leading-relaxed">{v.meaningTe}</div>
              <div className="text-[10px] text-[#EDE8E0]/40">— {v.refTe}</div>
            </div>
          ))}

          <div>
            <div className="text-[10px] uppercase tracking-wider mb-1 text-[#EDE8E0]/40">ఉపయోగించే భాగాలు</div>
            <div className="flex flex-wrap gap-1.5">
              {g.usedByTe.map((u, i) => (
                <span key={i} className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#EDE8E0]/70">
                  {u}
                </span>
              ))}
            </div>
          </div>

          {g.precisionTe && (
            <div className="rounded-lg border border-[#5BBFB5]/25 bg-[#5BBFB5]/5 px-3 py-2 text-[11px] text-[#5BBFB5]/85 leading-relaxed">
              ఖచ్చితత్వ గమనిక: {g.precisionTe}
            </div>
          )}
          <div className="text-[10.5px] text-[#EDE8E0]/40 leading-relaxed">{g.publicDomainTe}</div>
        </div>
      )}
    </div>
  );
};

export function GranthaSourcesView({ lang = 'te' }: GranthaSourcesViewProps) {
  const isTe = lang !== 'en';
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<GranthaDomain | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GRANTHAS.filter((g) => {
      if (domain !== 'all' && g.domain !== domain) return false;
      if (!q) return true;
      return [g.nameTe, g.nameEn, g.nameSanskrit, g.authorTe, g.authorEn, ...g.doctrineTe, ...g.usedByTe]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [query, domain]);

  const grouped = useMemo(() => {
    const map = new Map<GranthaDomain, GranthaEntry[]>();
    for (const g of filtered) map.set(g.domain, [...(map.get(g.domain) ?? []), g]);
    return GRANTHA_DOMAINS.map((d) => ({ ...d, items: map.get(d.id) ?? [] })).filter((d) => d.items.length > 0);
  }, [filtered]);

  return (
    <div className="grantha-print-area max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-[#C9A96E]/25 bg-gradient-to-br from-[#12162B] to-[#0B0F1E] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 text-[#C9A96E] flex items-center justify-center">
              <Library className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display text-xl sm:text-2xl text-[#EDE8E0] leading-tight">
                {isTe ? 'గ్రంథ మండలం — మూల ఆధారాలు' : 'Grantha Mandala — primary sources'}
              </h1>
              <p className="text-[11.5px] text-[#EDE8E0]/55 mt-1 max-w-2xl leading-relaxed">
                {isTe
                  ? `ఈ యాప్‌లోని ప్రతి గణన ఒక ప్రామాణిక గ్రంథంపై ఆధారపడి ఉంటుంది. ${GRANTHAS.length} గ్రంథాలు, ఏ సిద్ధాంతం ఎక్కడ వాడబడిందో, ఏ అధ్యాయం నుంచి తీసుకున్నామో ఇక్కడ పారదర్శకంగా చూపిస్తున్నాము.`
                  : `Every calculation here is traceable to a classical text — ${GRANTHAS.length} granthas, what each contributes and which chapter it comes from.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[11.5px] text-[#EDE8E0]/75 hover:bg-white/5"
          >
            <Printer className="w-3.5 h-3.5" /> {isTe ? 'ప్రింట్' : 'Print'}
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-[#5BBFB5]/25 bg-[#5BBFB5]/5 px-3 py-2 text-[11.5px] text-[#EDE8E0]/80 leading-relaxed">
            <ShieldCheck className="inline w-3.5 h-3.5 mr-1 text-[#5BBFB5]" />
            {isTe
              ? 'గణిత ప్రమాణం: గ్రహ స్ఫుటాలు Swiss Ephemeris (DE431) తో, పంచాంగ అంగాలు 365 రోజుల స్విస్-ఎఫిమెరిస్ ఫిక్చర్ తో 100% ధృవీకరించబడ్డాయి.'
              : 'Numerical standard: planetary positions from Swiss Ephemeris (DE431); pañcāṅga aṅgas validated against a 365-day Swiss-Ephemeris fixture.'}
          </div>
          <div className="rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/5 px-3 py-2 text-[11.5px] text-[#EDE8E0]/80 leading-relaxed">
            <ScrollText className="inline w-3.5 h-3.5 mr-1 text-[#C9A96E]" />
            {isTe
              ? 'సంప్రదాయ ప్రమాణం: లహిరి (చిత్రపక్ష) అయనాంశం, అమాంత మాస పద్ధతి, దృగ్గణిత సూర్యోదయం — తెలుగు (తెలంగాణ & ఆంధ్రప్రదేశ్) పంచాంగ సంప్రదాయం ప్రకారం.'
              : 'Traditional standard: Lahiri (Chitrapaksha) ayanāṁśa, amānta months, dṛk sunrise — the Telugu pañcāṅga convention of Telangana and Andhra Pradesh.'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="no-print flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#EDE8E0]/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isTe ? 'గ్రంథం, రచయిత, సిద్ధాంతం వెతకండి…' : 'Search grantha, author, doctrine…'}
            className="w-full rounded-lg border border-white/15 bg-[#141932] pl-8 pr-3 py-1.5 text-[12px] text-[#EDE8E0] outline-none focus:border-[#C9A96E]/60"
          />
        </div>
        <button
          onClick={() => setDomain('all')}
          className={`rounded-full px-2.5 py-1 text-[11px] border ${
            domain === 'all' ? 'border-[#C9A96E] text-[#C9A96E] bg-[#C9A96E]/10' : 'border-white/15 text-[#EDE8E0]/60'
          }`}
        >
          అన్నీ ({GRANTHAS.length})
        </button>
        {GRANTHA_DOMAINS.map((d) => {
          const count = GRANTHAS.filter((g) => g.domain === d.id).length;
          if (count === 0) return null;
          return (
            <button
              key={d.id}
              onClick={() => setDomain(d.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] border ${
                domain === d.id ? 'text-[#EDE8E0] bg-white/10' : 'border-white/15 text-[#EDE8E0]/60'
              }`}
              style={domain === d.id ? { borderColor: DOMAIN_ACCENT[d.id] } : undefined}
            >
              {d.nameTe} ({count})
            </button>
          );
        })}
      </div>

      {/* Grouped lists */}
      {grouped.map((dom) => (
        <div key={dom.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded" style={{ backgroundColor: DOMAIN_ACCENT[dom.id] }} />
            <h2 className="font-display text-[15px] text-[#EDE8E0]">{dom.nameTe}</h2>
            <span className="text-[10.5px] text-[#EDE8E0]/40">{dom.noteTe}</span>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {dom.items.map((g) => (
              <GranthaCard
                key={g.id}
                g={g}
                open={openId === g.id}
                onToggle={() => setOpenId(openId === g.id ? null : g.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-6 text-center text-[12px] text-[#EDE8E0]/50">
          {isTe ? 'ఏ గ్రంథం కనిపించలేదు — వెతుకుడు మార్చండి.' : 'No grantha matched — change the search.'}
        </div>
      )}

      {/* Editorial note */}
      <div className="rounded-2xl border border-white/10 bg-[#0F1326] p-5 space-y-2">
        <div className="flex items-center gap-2 text-[#EDE8E0] font-display text-[15px]">
          <ScrollText className="w-4 h-4 text-[#C9A96E]" /> {isTe ? 'సంపాదకీయ నియమాలు' : 'Editorial rules'}
        </div>
        <ul className="space-y-1.5 text-[11.5px] text-[#EDE8E0]/65 leading-relaxed">
          {[
            'అధ్యాయ సంఖ్యలు ప్రామాణిక ముద్రణలలో ఒకే విధంగా ఉన్నప్పుడు మాత్రమే ఇస్తాము; లేకపోతే విషయం ద్వారా ఉల్లేఖిస్తాము.',
            'సంస్కృత శ్లోకాలు పాఠ భేదాలు లేని చోట మాత్రమే ఉద్ధరిస్తాము; అనుమానం ఉన్నప్పుడు భావార్థాన్ని ఇస్తాము.',
            'గ్రంథ కాలాలు పరిశోధనాత్మక అంచనాలు — ఖచ్చిత తేదీలుగా చెప్పము.',
            'మూల సంస్కృత గ్రంథాలు పబ్లిక్ డొమైన్; ఆధునిక అనువాదాల కాపీరైట్ మా వద్ద ఉంచము.',
          ].map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#C9A96E]/70">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default GranthaSourcesView;
