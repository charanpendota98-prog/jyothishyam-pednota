import React, { useRef, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Award,
} from 'lucide-react';
import { type CompleteChartResult } from '../engine/ephemeris.ts';
import {
  TELUGU_RASIS,
  TELUGU_PLANETS,
  generateTeluguSampoornaJathakam,
} from '../engine/teluguJathakam.ts';
import { generateTajikaVarshaphalaReport } from '../engine/tajikaVarshaphalaEngine.ts';
import { generateKundaliSookshmaNadiReport } from '../engine/kundaliSookshmaNadiEngine.ts';
import { sanitizeCloneForHtml2Canvas } from '../utils/pdfBookExporter.ts';

interface RoyalWhatsAppSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart: CompleteChartResult;
  targetYear?: number;
}

const MiniSouthIndianGrid: React.FC<{
  chart: CompleteChartResult;
  division: 'D1' | 'D9';
  titleTe: string;
  subtitleTe: string;
}> = ({ chart, division, titleTe, subtitleTe }) => {
  const ascSign =
    division === 'D1'
      ? chart.ascendant.signIndex
      : Math.floor(((chart.ascendant.siderealLon % 30) / (30 / 9)) + chart.ascendant.signIndex * 9) % 12;

  const getCell = (signIdx: number) => {
    const isLagna = signIdx === ascSign;
    const planetsHere = chart.planets.slice(0, 9).filter((p) =>
      division === 'D1' ? p.signIndex === signIdx : p.d9Sign === signIdx
    );
    const rasiShort = TELUGU_RASIS[signIdx]?.nameTe.split(' ')[0] ?? '';

    return (
      <div
        className={`p-1.5 min-h-[58px] flex flex-col justify-between border border-[#C9A96E]/35 ${
          isLagna ? 'bg-[#C9A96E]/20' : 'bg-[#090C18]/90'
        }`}
      >
        <div className="flex items-center justify-between text-[9px] leading-none">
          <span className="text-[#EDE8E0]/60 font-semibold">{rasiShort}</span>
          {isLagna && (
            <span className="px-1 py-0.5 rounded bg-[#C9A96E] text-[#090C18] font-extrabold text-[8px]">
              లగ్నం
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1 my-auto py-0.5">
          {planetsHere.length > 0 ? (
            planetsHere.map((p) => (
              <span
                key={p.id}
                className="text-[10px] font-bold text-[#EDE8E0] bg-[#141932] px-1 rounded border border-white/10"
              >
                {(TELUGU_PLANETS[p.id]?.nameTe ?? p.name).slice(0, 3)}
              </span>
            ))
          ) : (
            <span className="text-[9px] text-white/20">·</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border-2 border-[#C9A96E]/60 rounded-lg overflow-hidden bg-[#090C18]">
      <div className="grid grid-cols-4">
        {getCell(11)}
        {getCell(0)}
        {getCell(1)}
        {getCell(2)}

        {getCell(10)}
        <div className="col-span-2 row-span-2 bg-[#141932] border border-[#C9A96E]/40 flex flex-col items-center justify-center p-2 text-center">
          <div className="text-[10px] text-[#C9A96E] font-bold">{titleTe}</div>
          <div className="text-[9px] text-[#5BBFB5] mt-0.5">{subtitleTe}</div>
        </div>
        {getCell(3)}

        {getCell(9)}
        {getCell(4)}

        {getCell(8)}
        {getCell(7)}
        {getCell(6)}
        {getCell(5)}
      </div>
    </div>
  );
};

export const RoyalWhatsAppSummaryModal: React.FC<
  RoyalWhatsAppSummaryModalProps
> = ({ isOpen, onClose, chart, targetYear = new Date().getFullYear() }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const jathakam = useMemo(
    () => generateTeluguSampoornaJathakam(chart),
    [chart]
  );
  const varshaReport = useMemo(
    () => generateTajikaVarshaphalaReport(chart, targetYear),
    [chart, targetYear]
  );
  const sookshmaReport = useMemo(
    () => generateKundaliSookshmaNadiReport(chart),
    [chart]
  );

  if (!isOpen) return null;

  const genderLabelTe =
    (chart.input.gender ?? 'male') === 'female'
      ? 'స్త్రీ / అమ్మాయి (Female)'
      : 'పురుషుడు / అబ్బాయి (Male)';

  const whatsappSummaryText = [
    `✨ *|| శ్రీ సంపూర్ణ తెలుగు జాతక రాజముద్ర సారాంశ పత్రం ||* ✨`,
    `👤 *పేరు:* ${chart.input.name} (${genderLabelTe})`,
    `📅 *జన్మ తేదీ & సమయం:* ${chart.input.date} · ${chart.input.time}`,
    `📍 *జన్మ స్థలం:* ${chart.input.city}`,
    `────────────────────`,
    `🌙 *జన్మ రాశి:* ${jathakam.janmaRasiTe} (అధిపతి: ${jathakam.janmaRasiAdhipatiTe})`,
    `⭐ *జన్మ నక్షత్రం:* ${jathakam.janmaNakshatramTe} (${jathakam.janmaPadam}వ పాదం)`,
    `🔤 *నామాక్షరం:* "${jathakam.namaAksharamTe}" (${jathakam.allFourPadaAksharaluTe})`,
    `🌅 *జన్మ లగ్నం:* ${jathakam.janmaLagnamTe} (అధిపతి: ${jathakam.janmaLagnaAdhipatiTe})`,
    `👑 *ఆత్మకారకుడు (AK):* ${jathakam.jaiminiKarakas[0]?.planetNameTe}`,
    `⏳ *ప్రస్తుత దశ:* ${jathakam.currentDashaPhalamTe.mahadashaTe.split(' (')[0]} — ${jathakam.currentDashaPhalamTe.antardashaTe.split(' (')[0]} అంతర్దశ`,
    `────────────────────`,
    `📆 *${targetYear} తాజిక వర్షఫల సారాంశం:*`,
    `• వర్ష లగ్నం: ${varshaReport.varshaLagnaRasiTe.split(' ')[0]} | ముంథా: ${varshaReport.munthaRasiTe.split(' ')[0]} (${varshaReport.munthaHouseFromVarshaLagna}వ భావం)`,
    `• వర్షేశ్వరుడు (Year Lord): ${varshaReport.varsheshwaraPlanetTe}`,
    `• వార్షిక శుభ ఫల స్కోరు: ${varshaReport.annualOverallScorePct}%`,
    `────────────────────`,
    `💡 *ప్రధాన సూచన:* ${sookshmaReport.exactActionableDoAndDontsTe.mustDoTe[0]}`,
  ].join('\n');

  const whatsappEncodedUrl = `https://wa.me/?text=${encodeURIComponent(
    whatsappSummaryText
  )}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(whatsappSummaryText);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    } catch {}
  };

  const handleDownloadPngCard = async () => {
    if (!cardRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        backgroundColor: '#090C18',
        useCORS: true,
        logging: false,
        onclone: (clonedDoc, clonedEl) => {
          sanitizeCloneForHtml2Canvas(clonedDoc, clonedEl, '#090C18');
        },
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = chart.input.name.replace(/[^a-zA-Z0-9\u0C00-\u0C7F_-]/g, '_');
      link.download = `Sri_Rajamudra_Jathaka_Card_${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleNativeWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${chart.input.name} — శ్రీ సంపూర్ణ తెలుగు జాతక సారాంశం`,
          text: whatsappSummaryText,
        });
      } catch {}
    } else {
      await handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
      <div className="bg-[#0F1326] border-2 border-[#C9A96E] rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Action Bar */}
        <div className="bg-[#141932] border-b border-white/10 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-[#C9A96E]">
              1-పేజీ రాజముద్ర జాతక సారాంశ కార్డు (WhatsApp & HD Image Share)
            </h2>
            <p className="text-xs text-[#EDE8E0]/70">
              ఒకే పేజీలో సంపూర్ణ జాతకం + {targetYear} వార్షిక ఫలితాల రాజముద్ర కార్డును ఇమేజ్‌గా డౌన్‌లోడ్ చేయండి లేదా WhatsApp లో షేర్ చేయండి
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPngCard}
              disabled={isCapturing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C9A96E] text-[#090C18] text-xs font-bold hover:bg-[#d8b97e] transition-colors cursor-pointer shadow"
            >
              {isCapturing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>HD ఇమేజ్ (.PNG) డౌన్‌లోడ్</span>
            </button>

            <a
              href={whatsappEncodedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] text-[#090C18] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp షేర్</span>
            </a>

            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#090C18] text-[#5BBFB5] border border-[#5BBFB5]/40 text-xs font-bold hover:bg-white/5 cursor-pointer"
            >
              {copiedNotice ? (
                <Check className="w-3.5 h-3.5 text-[#5BBFB5]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedNotice ? 'కాపీ అయింది!' : 'టెక్స్ట్ కాపీ'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#090C18] text-[#EDE8E0]/70 hover:text-white border border-white/10 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Body containing the Capture Target Card */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div
            ref={cardRef}
            className="bg-gradient-to-b from-[#141932] via-[#0B0E1D] to-[#141932] border-[3px] border-[#C9A96E] rounded-2xl p-5 sm:p-6 space-y-5 text-[#EDE8E0] shadow-2xl"
          >
            {/* Card Header */}
            <div className="text-center border-b border-[#C9A96E]/35 pb-4 space-y-1">
              <div className="text-[10px] tracking-[0.2em] text-[#C9A96E] font-bold">
                || శ్రీ గణేశాయ నమః · శ్రీ వేంకటేశ్వరాయ నమః · దృగ్గణిత జ్యోతిష్య రాజముద్ర పత్రం ||
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-[#EDE8E0]">
                శ్రీ సంపూర్ణ జాతక & {targetYear} వార్షిక ఫల సారాంశ పత్రిక
              </h3>
              <div className="text-xs text-[#EDE8E0]/85 pt-1">
                <strong className="text-[#C9A96E]">{chart.input.name}</strong> · {genderLabelTe} ·{' '}
                <span className="font-mono-tabular">
                  {chart.input.date} ({chart.input.time})
                </span>{' '}
                · {chart.input.city.split('(')[0].trim()}
              </div>
            </div>

            {/* 6 Key Panchanga & Horoscope Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
              <div className="bg-[#090C18] border border-[#C9A96E]/35 rounded-lg p-2.5">
                <div className="text-[10px] text-[#EDE8E0]/60">జన్మ రాశి</div>
                <div className="text-xs font-bold text-[#C9A96E] mt-0.5">
                  {jathakam.janmaRasiTe.split(' ')[0]}
                </div>
                <div className="text-[10px] text-[#EDE8E0]/60">
                  అధిపతి: {jathakam.janmaRasiAdhipatiTe}
                </div>
              </div>

              <div className="bg-[#090C18] border border-[#5BBFB5]/35 rounded-lg p-2.5">
                <div className="text-[10px] text-[#EDE8E0]/60">జన్మ నక్షత్రం</div>
                <div className="text-xs font-bold text-[#5BBFB5] mt-0.5">
                  {jathakam.janmaNakshatramTe} ({jathakam.janmaPadam}వ పా.)
                </div>
                <div className="text-[10px] text-[#C9A96E] font-bold">
                  నామాక్షరం: “{jathakam.namaAksharamTe}”
                </div>
              </div>

              <div className="bg-[#090C18] border border-white/15 rounded-lg p-2.5">
                <div className="text-[10px] text-[#EDE8E0]/60">జన్మ లగ్నం</div>
                <div className="text-xs font-bold text-[#EDE8E0] mt-0.5">
                  {jathakam.janmaLagnamTe.split(' ')[0]}
                </div>
                <div className="text-[10px] text-[#5BBFB5]">
                  అధిపతి: {jathakam.janmaLagnaAdhipatiTe}
                </div>
              </div>

              <div className="bg-[#090C18] border border-white/15 rounded-lg p-2.5">
                <div className="text-[10px] text-[#EDE8E0]/60">ఆత్మకారక & ఆరూఢం</div>
                <div className="text-xs font-bold text-[#C9A96E] mt-0.5">
                  AK: {jathakam.jaiminiKarakas[0]?.planetNameTe}
                </div>
                <div className="text-[10px] text-[#EDE8E0]/70">
                  AL: {jathakam.arudhaPadas[0]?.rasiNameTe.split(' ')[0]}
                </div>
              </div>

              <div className="bg-[#090C18] border border-[#9B8FD4]/35 rounded-lg p-2.5">
                <div className="text-[10px] text-[#EDE8E0]/60">ప్రస్తుత మహాదశ</div>
                <div className="text-xs font-bold text-[#9B8FD4] mt-0.5">
                  {jathakam.currentDashaPhalamTe.mahadashaTe.split(' (')[0]} దశ
                </div>
                <div className="text-[10px] text-[#EDE8E0]/70">
                  భుక్తి: {jathakam.currentDashaPhalamTe.antardashaTe.split(' (')[0]}
                </div>
              </div>

              <div className="bg-[#090C18] border border-[#C9A96E]/50 rounded-lg p-2.5">
                <div className="text-[10px] text-[#EDE8E0]/60">{targetYear} వర్షేశ్వరుడు</div>
                <div className="text-xs font-bold text-[#5BBFB5] mt-0.5">
                  {varshaReport.varsheshwaraPlanetTe}
                </div>
                <div className="text-[10px] text-[#C9A96E] font-mono-tabular">
                  ముంథా: {varshaReport.munthaHouseFromVarshaLagna}వ ఇంట ({varshaReport.annualOverallScorePct}%)
                </div>
              </div>
            </div>

            {/* Rasi (D1) & Navamsa (D9) Side-by-Side Mini Kundalis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MiniSouthIndianGrid
                chart={chart}
                division="D1"
                titleTe="జన్మ రాశి చక్రం (D1 Rasi)"
                subtitleTe={`లగ్నం: ${jathakam.janmaLagnamTe.split(' ')[0]} · రాశి: ${jathakam.janmaRasiTe.split(' ')[0]}`}
              />
              <MiniSouthIndianGrid
                chart={chart}
                division="D9"
                titleTe="నవాంశ చక్రం (D9 Navamsa)"
                subtitleTe={`D9 లగ్నం: ${jathakam.navamsaLagnamTe.split(' ')[0]} · ధర్మ & కళత్ర బలం`}
              />
            </div>

            {/* 2-Column Truths + Annual Varshaphala & Action Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-[#C9A96E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>కుండలి ప్రధాన రాజయోగ & స్వభావ నిర్ధారణ:</span>
                </div>
                <ul className="space-y-1 text-[11px] text-[#EDE8E0]/90 list-disc list-inside leading-relaxed">
                  {sookshmaReport.crystalClearUnfilteredTruthsTe.slice(0, 2).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#090C18]/90 border border-[#5BBFB5]/35 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-[#5BBFB5] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>{targetYear} తాజిక వర్షఫల & ముంథా తీర్పు:</span>
                </div>
                <p className="text-[11px] text-[#EDE8E0]/90 leading-relaxed">
                  {varshaReport.munthaDetailedVerdictTe}
                </p>
                <div className="text-[11px] text-[#C9A96E] font-semibold pt-1">
                  ★ ఆచరించవలసిన పరిహారం: {varshaReport.munthaRemedyTe}
                </div>
              </div>
            </div>

            {/* Footer Colophon */}
            <div className="text-center border-t border-white/10 pt-2.5 text-[10px] text-[#C9A96E]">
              || సర్వే జనాః సుఖినో భవంతు · AstroSphere సంపూర్ణ దృగ్గణిత తెలుగు జ్యోతిష్య పీఠం ||
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
