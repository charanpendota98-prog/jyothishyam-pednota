import React, { useState } from 'react';
import { Activity, ShieldCheck, ChevronDown, Sigma, RefreshCw } from 'lucide-react';
import { EPHEMERIS_ACCURACY, type EphemerisAccuracyRow } from '../generated/ephemerisAccuracy.ts';

/**
 * AccuracyLedgerPanel — గణన ప్రమాణ పత్రం
 * ----------------------------------------------------------------------------
 * `npm run verify:astro` ప్రతిసారీ ఈ పట్టికను తిరిగి లెక్కించి
 * `src/generated/ephemerisAccuracy.ts` లో రాస్తుంది. కాబట్టి ఇక్కడ కనిపించే
 * ప్రతి సంఖ్యాం నిజంగా నడిచిన పరీక్ష ఫలితం — చేతితో రాసిన marketing సంఖ్య కాదు.
 */

interface Props {
  lang?: 'te' | 'en';
  compact?: boolean;
  /** నిజంగా తెరిచి చూపాలా (ప్రింట్ / గ్రంథ మండలం) */
  defaultOpen?: boolean;
}

const GROUP_LABEL_TE: Record<string, string> = {
  ay: 'అయనాంశ విధానాలు',
  graha: 'గ్రహ స్ఫుటాలు',
  angle: 'లగ్నం / మధ్యాకాశం',
};

function groupOf(key: string): keyof typeof GROUP_LABEL_TE {
  if (key.startsWith('ay:')) return 'ay';
  if (key === 'asc' || key === 'mc') return 'angle';
  return 'graha';
}

const fmtArcsec = (v: number) => `${v.toFixed(1)}″`;
const fmtDeg = (v: number) => `${v.toFixed(4)}°`;

export function AccuracyLedgerPanel({ lang = 'te', compact = false, defaultOpen = false }: Props) {
  const isTe = lang !== 'en';
  const [openKey, setOpenKey] = useState<string | null>(defaultOpen ? 'panel' : null);
  const ledger = EPHEMERIS_ACCURACY;

  const rows = ledger.rows;
  const maxDeg = Math.max(...rows.map((r) => r.maxDeg));
  const classicalMax = ledger.classicalMaxDeg;
  const allPassed = ledger.failed === 0;
  const yearSpan = `${ledger.firstUtc.slice(0, 4)}–${ledger.lastUtc.slice(0, 4)}`;

  const byGroup = (g: keyof typeof GROUP_LABEL_TE) => rows.filter((r) => groupOf(r.key) === g);

  const Row = ({ r }: { r: EphemerisAccuracyRow }) => {
    const ratio = r.maxDeg / r.tolDeg;
    const tone = ratio < 0.5 ? '#5BBFB5' : ratio < 0.9 ? '#C9A96E' : '#E39A6B';
    return (
      <tr className="border-t border-white/5">
        <td className="py-1.5 pr-3 text-[11.5px] text-[#EDE8E0]/85">{r.labelTe}</td>
        <td className="py-1.5 pr-3 font-mono-tabular text-[11.5px] text-right" style={{ color: tone }}>
          {fmtDeg(r.maxDeg)}
        </td>
        <td className="py-1.5 pr-3 font-mono-tabular text-[11px] text-[#EDE8E0]/55 text-right">
          {fmtArcsec(r.maxArcsec)}
        </td>
        <td className="py-1.5 pr-3 font-mono-tabular text-[11px] text-[#EDE8E0]/40 text-right">
          ±{r.tolDeg.toFixed(3)}°
        </td>
        <td className="py-1.5 text-[10.5px] text-[#EDE8E0]/40 truncate max-w-[160px]" title={r.where}>
          {r.where}
        </td>
      </tr>
    );
  };

  return (
    <div className="rounded-2xl border border-[#5BBFB5]/25 bg-[#0C1120] overflow-hidden">
      <button
        onClick={() => setOpenKey(openKey === 'panel' ? null : 'panel')}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        <span className="w-9 h-9 shrink-0 rounded-xl bg-[#5BBFB5]/15 text-[#5BBFB5] flex items-center justify-center">
          <Activity className="w-4.5 h-4.5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[15px] text-[#EDE8E0]">
              {isTe ? 'గణన ప్రమాణ పత్రం — స్విస్ ఎఫెమెరిస్ పరీక్ష' : 'Accuracy Ledger — Swiss Ephemeris audit'}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-mono-tabular"
              style={{
                backgroundColor: allPassed ? 'rgba(91,191,181,0.14)' : 'rgba(227,154,107,0.16)',
                color: allPassed ? '#6FD2C7' : '#E39A6B',
              }}
            >
              {ledger.passed}/{ledger.measurements} {isTe ? 'ఉత్తీర్ణం' : 'passed'}
            </span>
          </span>
          <span className="block text-[11px] text-[#EDE8E0]/50 mt-0.5">
            {isTe
              ? `${ledger.fixtureEpochs} జనన క్షణాలు · గరిష్ఠ భేదం ${fmtDeg(maxDeg)} (${fmtArcsec(maxDeg * 3600)}) · ప్రధాన గ్రహాలు ${fmtArcsec(
                  classicalMax * 3600
                )}`
              : `${ledger.fixtureEpochs} epochs · max deviation ${fmtDeg(maxDeg)} (${fmtArcsec(
                  maxDeg * 3600
                )}) · classical bodies ${fmtArcsec(classicalMax * 3600)}`}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#5BBFB5]/70 transition-transform ${openKey === 'panel' ? 'rotate-180' : ''}`}
        />
      </button>

      {openKey === 'panel' && (
        <div className="px-4 pb-4 border-t border-[#5BBFB5]/15 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            {[
              [String(ledger.fixtureEpochs), isTe ? 'జనన క్షణాలు' : 'epochs'],
              [yearSpan, isTe ? 'సంవత్సరాల వ్యాప్తి' : 'year span'],
              [fmtDeg(maxDeg), isTe ? 'గరిష్ఠ భేదం' : 'max deviation'],
              [String(ledger.measurements), isTe ? 'కొలతలు' : 'measurements'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2">
                <div className="font-mono-tabular text-[13px] font-bold text-[#E4C68C]">{v}</div>
                <div className="text-[10px] text-[#EDE8E0]/50 mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {(['ay', 'angle', 'graha'] as const).map((g) => {
            const items = byGroup(g);
            if (!items.length) return null;
            return (
              <div key={g}>
                <div className="text-[10px] uppercase tracking-wider text-[#5BBFB5]/80 mb-1">
                  {GROUP_LABEL_TE[g]}
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-[9.5px] uppercase tracking-wider text-[#EDE8E0]/35">
                      <th className="text-left font-normal pb-1">{isTe ? 'అంశం' : 'Item'}</th>
                      <th className="text-right font-normal pb-1">{isTe ? 'గరిష్ఠ భేదం' : 'max Δ'}</th>
                      <th className="text-right font-normal pb-1">{isTe ? 'ఆర్క్-సెకన్లు' : 'arcsec'}</th>
                      <th className="text-right font-normal pb-1">{isTe ? 'సహనం' : 'tolerance'}</th>
                      <th className="text-left font-normal pb-1 pl-3">{isTe ? 'ఎక్కడ (అత్యంత భేదం)' : 'worst case'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <Row key={r.key} r={r} />
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          {!compact && (
            <>
              <div className="rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/5 px-3 py-2 text-[11px] text-[#EDE8E0]/75 leading-relaxed">
                <span className="text-[#C9A96E] font-semibold">{isTe ? 'పద్ధతులు: ' : 'Methods: '}</span>
                {isTe
                  ? 'గ్రహాలు VSOP87, చంద్రుడు ELP-2000 (astronomy-engine) — సత్య క్రాంతివృత్తం (అయన చలనం + పోషణ + వార్షిక విపర్యయం). రాహు/కేతు: చంద్రుని క్షణిక స్థాన-వేగ వెక్టర్ల నుండి ఆస్కులేటింగ్ పాతం (h = r × v). నిజ చిత్రా/పుష్య: స్పైకా, డెల్టా కర్కాటక నక్షత్రాల నిజ రేఖాంశం నుండి. లగ్నం/మధ్యాకాశం: స్థానిక సత్య సైడెరియల్ కాలం నుండి గోళ త్రికోణమితి.'
                  : 'Planets by VSOP87, Moon by ELP-2000 (astronomy-engine), on the true ecliptic of date (precession + nutation + annual aberration). Rāhu/Ketu as the osculating node from the Moon’s instantaneous state vectors (h = r × v). True Citrā / Puṣya from the apparent longitudes of Spica and δ Cancri. Asc/MC by spherical trigonometry from local apparent sidereal time.'}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-[#EDE8E0]/45">
                <span className="flex items-center gap-1">
                  <Sigma className="w-3 h-3" /> {ledger.source}
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> {isTe ? 'పునఃపరీక్ష' : 're-run'}:{' '}
                  <code className="text-[#5BBFB5]/80">npm run verify:astro</code>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />{' '}
                  {isTe
                    ? 'ఫిక్చర్: pyswisseph 2.10.03, FLG_SWIEPH'
                    : 'fixture: pyswisseph 2.10.03, FLG_SWIEPH'}
                </span>
              </div>
              <div className="text-[10px] text-[#EDE8E0]/35 leading-relaxed">
                {isTe
                  ? 'గమనిక: సూచన జాతక పత్రికలు (ప్రింట్ PDF) మధ్యమ రాహును వాడతాయి; ఈ యాప్ సత్య రాహును (TRUE_NODE) వాడుతుంది — అందుకే ఆ పత్రికలతో రాహు/కేతు భేదం సహజం, తప్పు కాదు.'
                  : 'Note: the printed reference jātakam PDFs use the mean node, while this app uses the true node (TRUE_NODE); that difference against those PDFs is expected, not an error.'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AccuracyLedgerPanel;
