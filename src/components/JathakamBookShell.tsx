import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, BookOpen, ChevronRight, List, Minus, Plus, Search } from 'lucide-react';

/**
 * JathakamBookShell — పూర్తి జాతక మహాగ్రంథానికి పఠన చట్రం (reading shell).
 *
 * సమస్య: సంపూర్ణ జాతకం ఒకే పేజీలో 20 అధ్యాయాలు, 94 ఉపాంశాలు, వందల పట్టికలతో
 * (దాదాపు 9 లక్షల అక్షరాల DOM) వస్తుంది. స్క్రోల్ చేస్తే ఏ అధ్యాయం ఎక్కడ
 * ఉందో తెలియదు — "పూర్తి జాతకం చదవడానికి వీలుగా రావట్లేదు" అనే ఫిర్యాది అందుకే.
 *
 * ఈ షెల్ ఆ సమస్యను మూడు విధాలుగా పరిష్కరిస్తుంది:
 *   1. **విషయ సూచిక** — లోపల ఉన్న h2 (అధ్యాయాలు) మరియు h3 (ఉపాంశాలు) లను
 *      ఆటోమేటిక్‌గా చదివి, ద్విస్థాయి సూచికను నిర్మిస్తుంది. అధ్యాయ ఫిల్టర్
 *      మారినప్పుడు MutationObserver ద్వారా తిరిగి లెక్కిస్తుంది.
 *   2. **స్టిక్కీ రైల్ (డెస్క్‌టాప్)** — ప్రస్తుతం చదువుతున్న అధ్యాయాన్ని
 *      కళ్ళు మిరుమిట్లు గొలిపించకుండా హైలైట్ చేస్తుంది (scroll-spy).
 *   3. **పఠన సౌలభ్యం** — అక్షర పరిమాణం (+/-), పైకి వెళ్లే బటన్, పఠన పురోగతి
 *      బార్, ప్రింట్ (రైల్/సూచిక ప్రింట్‌లో కనిపించవు).
 */
interface JathakamBookShellProps {
  children: React.ReactNode;
  titleTe?: string;
  subtitleTe?: string;
  idPrefix?: string;
}

interface TocEntry {
  id: string;
  label: string;
  subs: { id: string; label: string }[];
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const trimLabel = (s: string, n = 78) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export const JathakamBookShell: React.FC<JathakamBookShellProps> = ({
  children,
  titleTe = 'సంపూర్ణ జాతక మహాగ్రంథం',
  subtitleTe,
  idPrefix = 'jch',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState('');
  const [tocOpen, setTocOpen] = useState(true);
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  // శీర్షికలోని సంఖ్యలు నిజంగా స్కాన్ చేసిన సూచిక నుండే — స్థిర అంకెలు కాదు
  const subCount = useMemo(() => toc.reduce((n, e) => n + e.subs.length, 0), [toc]);
  const autoSubtitle =
    toc.length > 0
      ? `${toc.length} అధ్యాయాలు · ${subCount} ఉపాంశాలు — విషయ సూచిక నుండి నేరుగా ఏ అధ్యాయానికైనా వెళ్లవచ్చు.`
      : 'విషయ సూచిక సిద్ధమవుతోంది…';

  // ── విషయ సూచిక నిర్మాణం ─────────────────────────────────────────────
  const scan = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const headings = Array.from(root.querySelectorAll<HTMLElement>('h2, h3'));
    const entries: TocEntry[] = [];
    let counter = 0;
    for (const h of headings) {
      const label = clean(h.textContent ?? '');
      if (!label) continue;
      if (!h.id) {
        counter += 1;
        h.id = `${idPrefix}-${counter}`;
      }
      if (h.tagName === 'H2') {
        entries.push({ id: h.id, label, subs: [] });
      } else if (entries.length) {
        entries[entries.length - 1].subs.push({ id: h.id, label });
      } else {
        entries.push({ id: h.id, label, subs: [] });
      }
    }
    // చిన్న "ముఖ్యాంశం" శీర్షికలను (5 అక్షరాల లోపు) వదిలేయండి
    setToc(entries.filter((e) => e.label.length > 8));
  }, [idPrefix]);

  useEffect(() => {
    scan();
    const root = containerRef.current;
    if (!root || typeof MutationObserver === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const obs = new MutationObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => scan(), 220);
    });
    obs.observe(root, { childList: true, subtree: true });
    return () => {
      obs.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [scan]);

  // ── స్క్రోల్ స్పై + పురోగతి ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const root = containerRef.current;
        if (!root) return;
        const rect = root.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const done = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        setProgress(done);
        const heads = Array.from(root.querySelectorAll<HTMLElement>('h2'));
        let current = '';
        for (const h of heads) {
          if (h.getBoundingClientRect().top <= 140) current = h.id;
          else break;
        }
        setActiveId(current);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 92;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    setActiveId(id);
  };

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return toc;
    return toc
      .map((e) => ({ ...e, subs: e.subs.filter((s) => s.label.includes(q)) }))
      .filter((e) => e.label.includes(q) || e.subs.length > 0);
  }, [toc, query]);

  const chapterIndex = useMemo(() => {
    const map = new Map<string, number>();
    toc.forEach((e, i) => map.set(e.id, i + 1));
    return map;
  }, [toc]);

  return (
    <div className="relative">
      {/* పఠన పురోగతి */}
      <div className="no-print sticky top-[52px] z-30 h-[2px] w-full bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#D9B97B] via-[#E4C68C] to-[#66CBBF] transition-[width] duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[1500px] gap-6 px-1">
        {/* ── స్టిక్కీ అధ్యాయ రైల్ (డెస్క్‌టాప్) ───────────────────── */}
        <aside className="no-print hidden w-[236px] shrink-0 lg:block">
          <div className="sticky top-[74px] max-h-[calc(100vh-92px)] overflow-y-auto grantha-scroll rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
              <List className="h-3.5 w-3.5 text-[#E4C68C]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E4C68C]">
                విషయ సూచిక
              </span>
              <span className="ml-auto font-mono-tabular text-[10px] text-[#EDE8E0]/40">
                {toc.length}
              </span>
            </div>
            <nav className="p-2">
              {toc.map((e, i) => {
                const active = e.id === activeId;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => jump(e.id)}
                    className={
                      'group mb-0.5 flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ' +
                      (active
                        ? 'bg-[#D9B97B]/12 text-[#F1DCAE]'
                        : 'text-[#EDE8E0]/60 hover:bg-white/[0.04] hover:text-[#EDE8E0]')
                    }
                  >
                    <span
                      className={
                        'mt-[1px] w-[16px] shrink-0 font-mono-tabular text-[9.5px] ' +
                        (active ? 'text-[#E4C68C]' : 'text-[#EDE8E0]/30')
                      }
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] leading-snug">{trimLabel(e.label, 58)}</span>
                  </button>
                );
              })}
              {toc.length === 0 && (
                <p className="px-2 py-3 text-[10.5px] text-[#EDE8E0]/40">అధ్యాయాలు లోడ్ అవుతున్నాయి…</p>
              )}
            </nav>
          </div>
        </aside>

        {/* ── పుస్తక శరీరం ──────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          {/* కవర్ + విషయ సూచిక కార్డు */}
          <div className="no-print mb-5 overflow-hidden rounded-2xl border border-[#D9B97B]/25 bg-gradient-to-br from-[#12172A] via-[#0C1020] to-[#0A0E1A]">
            <div className="flex flex-wrap items-start gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-[#D9B97B]/35 bg-[#D9B97B]/10">
                <BookOpen className="h-4 w-4 text-[#E4C68C]" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-bold text-[#F1DCAE] sm:text-base">{titleTe}</h2>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#EDE8E0]/55">{subtitleTe ?? autoSubtitle}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.85, +(z - 0.05).toFixed(2)))}
                  className="ghost-btn h-7 w-7 cursor-pointer justify-center px-0"
                  title="అక్షరాలు చిన్నవి"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-9 text-center font-mono-tabular text-[10px] text-[#EDE8E0]/55">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.3, +(z + 0.05).toFixed(2)))}
                  className="ghost-btn h-7 w-7 cursor-pointer justify-center px-0"
                  title="అక్షరాలు పెద్దవి"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTocOpen((v) => !v)}
                  className="ghost-btn ml-1 cursor-pointer text-[10.5px]"
                >
                  <List className="h-3.5 w-3.5" />
                  {tocOpen ? 'సూచిక మూసివేయి' : 'విషయ సూచిక'}
                </button>
              </div>
            </div>

            {tocOpen && (
              <div className="px-4 py-3.5 sm:px-5">
                <div className="relative mb-2.5">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#EDE8E0]/35" />
                  <input
                    value={query}
                    onChange={(ev) => setQuery(ev.target.value)}
                    placeholder="అధ్యాయం లేదా విషయం వెతకండి (ఉదా. వివాహం, షడ్బల, దశ)"
                    className="w-full rounded-lg border border-white/12 bg-[#070A14] py-2 pl-8 pr-3 text-[11.5px] text-[#EDE8E0] placeholder:text-[#EDE8E0]/30 focus:border-[#D9B97B]/60 focus:outline-none"
                  />
                </div>
                <ol className="grid gap-1 sm:grid-cols-2">
                  {filtered.map((e) => {
                    const n = chapterIndex.get(e.id) ?? 0;
                    const active = e.id === activeId;
                    const subsOpen = !!openSubs[e.id] || !!query;
                    return (
                      <li key={e.id} className="rounded-lg border border-white/[0.06] bg-white/[0.015]">
                        <div className="flex items-stretch">
                          <button
                            type="button"
                            onClick={() => jump(e.id)}
                            className={
                              'flex min-w-0 flex-1 items-start gap-2 px-2.5 py-2 text-left transition-colors ' +
                              (active ? 'text-[#F1DCAE]' : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]')
                            }
                          >
                            <span className="mt-[1px] font-mono-tabular text-[9.5px] text-[#E4C68C]/70">
                              {String(n).padStart(2, '0')}
                            </span>
                            <span className="text-[11px] leading-snug">{trimLabel(e.label, 66)}</span>
                          </button>
                          {e.subs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setOpenSubs((m) => ({ ...m, [e.id]: !m[e.id] }))}
                              className="flex w-7 items-center justify-center border-l border-white/[0.06] text-[#EDE8E0]/35 hover:text-[#E4C68C]"
                              title="ఉపాంశాలు"
                            >
                              <ChevronRight
                                className={
                                  'h-3.5 w-3.5 transition-transform ' + (subsOpen ? 'rotate-90' : '')
                                }
                              />
                            </button>
                          )}
                        </div>
                        {subsOpen && e.subs.length > 0 && (
                          <ul className="border-t border-white/[0.06] px-2.5 pb-1.5 pt-1">
                            {e.subs.map((s) => (
                              <li key={s.id}>
                                <button
                                  type="button"
                                  onClick={() => jump(s.id)}
                                  className="block w-full truncate py-[3px] text-left text-[10px] text-[#EDE8E0]/45 hover:text-[#E4C68C]"
                                >
                                  · {trimLabel(s.label, 60)}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ol>
                {filtered.length === 0 && (
                  <p className="py-2 text-[11px] text-[#EDE8E0]/40">
                    “{query}” కి సరిపోయే అధ్యాయం లేదు.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* వాస్తవ పుస్తకం */}
          <div ref={containerRef} className="jathakam-book" style={{ zoom } as React.CSSProperties}>
            {children}
          </div>
        </div>
      </div>

      {/* పైకి వెళ్లే బటన్ */}
      {progress > 0.04 && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="no-print fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#D9B97B]/45 bg-[#0B0F1C]/95 text-[#E4C68C] shadow-lg backdrop-blur lg:bottom-6"
          title="పైకి"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default JathakamBookShell;
