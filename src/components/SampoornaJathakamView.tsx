import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Printer,
  BookOpen,
  Compass,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  Award,
  FileText,
  BarChart3,
  Flame,
  Gem,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Sliders,
  Share2,
  Calendar,
} from 'lucide-react';
import type { CompleteChartResult, PlanetPosition } from '../engine/ephemeris.ts';
import {
  generateTeluguSampoornaJathakam,
  type AppLanguage,
} from '../engine/teluguJathakam.ts';
import { generateUpayaPariharaReport } from '../engine/upayaPariharaEngine.ts';
import { generateVerificationAndAnalysisReport } from '../engine/jathakaVerifications.ts';
import { generateAstroVisionMasterReport } from '../engine/astroVisionAndTransitEngine.ts';
import { generateSiddhantaAdvancedAppendices } from '../engine/siddhantaAdvancedAppendices.ts';
import { generateSampoornaLifeChronicle } from '../engine/sampoornaLifeChronicleEngine.ts';
import { generateKundaliSookshmaNadiReport } from '../engine/kundaliSookshmaNadiEngine.ts';
import { computeAshtakavargaPhala } from '../engine/ashtakavargaPhalaEngine.ts';
import { computeAvakahada } from '../engine/avakahadaEngine.ts';
import { computeYogaVichara } from '../engine/yogaVicharaEngine.ts';
import { computeJeevitaVistara } from '../engine/jeevitaVistaraEngine.ts';
import { computePanditaVicharam } from '../engine/panditaVicharamEngine.ts';
import { computeAntardashaPhalaBook } from '../engine/antardashaPhalaBookEngine.ts';
import { computeGrahaSahayaka, AREAS as SAHAYAKA_AREAS } from '../engine/grahaSahayakaEngine.ts';
import {
  exportClassicalJathakaToPdf,
  type PdfExportProgress,
} from '../utils/pdfBookExporter.ts';
import { SouthIndianKundaliSvg, type VargaDivision } from './ChartsSvg.tsx';
import { ClassicalJathakaPdfDocument } from './ClassicalJathakaPdfDocument.tsx';
import { PrintSettingsModal } from './PrintSettingsModal.tsx';
import { TajikaVarshaphalaView } from './TajikaVarshaphalaView.tsx';
import { RoyalWhatsAppSummaryModal } from './RoyalWhatsAppSummaryModal.tsx';

interface SampoornaJathakamProps {
  chart: CompleteChartResult;
  lang: AppLanguage;
  selectedPlanetId: string | null;
  onSelectPlanet: (planet: PlanetPosition) => void;
  externalPdfTrigger?: number;
}

type JathakamChapter =
  | 'all'
  | 'pandita_vicharam'
  | 'sampoorna_jeevita_charitra'
  | 'sookshma_nadi_kp'
  | 'siddhanta_verifications'
  | 'siddhanta_appendices'
  | 'panchanga_kundali'
  | 'avakahada_ghata'
  | 'yoga_vichara'
  | 'life_domains_deep'
  | 'shodashavarga_jaimini'
  | 'shadbala_ashtakavarga'
  | 'grantha_research'
  | 'life_pillars'
  | 'dwadasha_bhava'
  | 'dasha_kalachakram'
  | 'phala_vivechana'
  | 'dosha_parihara'
  | 'upaya_pariharas'
  | 'tajika_varshaphala';

const VARGA_TABS: { code: VargaDivision; labelTe: string; subtitleTe: string }[] = [
  { code: 'D1', labelTe: 'D1 రాశి చక్రం', subtitleTe: 'దేహ & సర్వ ఫలితములు' },
  { code: 'D9', labelTe: 'D9 నవాంశ చక్రం', subtitleTe: 'ధర్మం, వివాహం & గ్రహ బలం' },
  { code: 'D10', labelTe: 'D10 దశాంశ చక్రం', subtitleTe: 'ఉద్యోగం, వృత్తి & రాజయోగం' },
  { code: 'D2', labelTe: 'D2 హోరా చక్రం', subtitleTe: 'ధన సంపద & కుటుంబం' },
  { code: 'D3', labelTe: 'D3 ద్రేక్కాణ చక్రం', subtitleTe: 'పరాక్రమం & సహోదరులు' },
  { code: 'D4', labelTe: 'D4 చతుర్థాంశ', subtitleTe: 'భూ-గృహ స్థిరాస్తులు' },
  { code: 'D7', labelTe: 'D7 సప్తాంశ చక్రం', subtitleTe: 'సంతానం & వంశ వృద్ధి' },
  { code: 'D12', labelTe: 'D12 ద్వాదశాంశ', subtitleTe: 'తల్లిదండ్రుల సుకృతం' },
  { code: 'D30', labelTe: 'D30 త్రింశాంశ', subtitleTe: 'అరిష్ట & దోష రక్షణ' },
  { code: 'D60', labelTe: 'D60 షష్ట్యంశ', subtitleTe: 'పూర్వజన్మ కర్మ ఫలం' },
];

/**
 * జాతక మహాగ్రంథ అధ్యాయాల జాబితా — ఒకే మూలం.
 * యాప్ నావిగేషన్, పుస్తక శీర్షిక, తనిఖీలు అన్నీ ఇక్కడి నుండి సంఖ్య తీసుకుంటాయి,
 * కాబట్టి "21 అధ్యాయాలు" వంటి తప్పుడు సంఖ్యలు మళ్లీ రావు.
 */
export const JATHAKAM_CHAPTERS: { id: JathakamChapter; labelTe: string; icon: React.ReactNode }[] = [
    { id: 'all', labelTe: 'సంపూర్ణ మహాగ్రంథం (అన్ని అధ్యాయాలు)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'pandita_vicharam', labelTe: 'పండిత విచారణ — జాతకం అసలు ఏమిటి? (స్తంభాలు · బలం · భావాలు · నేరుగా సమాధానాలు)', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'sampoorna_jeevita_charitra', labelTe: '0. సంపూర్ణ జీవిత చరిత్ర (0–100 సం. 7 పర్వాలు & నవగ్రహ ఫలితాలు)', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'sookshma_nadi_kp', labelTe: '0A. 100% కుండలి సూక్ష్మ నాడి, భావాధిపతి, KP సబ్-లార్డ్ & 18 మూల గ్రంథాలు', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'tajika_varshaphala', labelTe: '0B. తాజిక వర్షఫలం & 12-నెలల దినచర్య ఫలితాలు (Varshaphala & 12-Month)', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'panchanga_kundali', labelTe: '1. పంచాంగం, ఇష్టఘడియలు & నవగ్రహాలు', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'avakahada_ghata', labelTe: '1A. అవకహడ, ఘాత చక్రం & నామాక్షరం', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'yoga_vichara', labelTe: '1B. యోగ విచారణ — రాజ, ధన & మహాపురుష యోగాలు', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'life_domains_deep', labelTe: '1C. వివాహం · ఉద్యోగం · చదువు · ఆరోగ్యం — లోతైన విశ్లేషణ', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
    { id: 'siddhanta_verifications', labelTe: '2. గణిత తనిఖీ, భావ చలిత, పంచధా మైత్రి & అవస్థలు', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'siddhanta_appendices', labelTe: '3. మాందీ-ఉపగ్రహాలు, ఇష్ట-కష్ట ఫల, భావ బల & శోధన పిండ', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'shodashavarga_jaimini', labelTe: '4. షోడశవర్గ & జైమిని కారకులు', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'shadbala_ashtakavarga', labelTe: '5. షడ్బల, అష్టకవర్గ & తారాబలం', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'grantha_research', labelTe: '6. 12 ప్రాచీన గ్రంథాల పరిశోధన', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'life_pillars', labelTe: '7. జీవిత 6 ప్రధాన రంగాలు', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'dwadasha_bhava', labelTe: '8. ద్వాదశ భావ ఫలితాలు (1–12)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'dasha_kalachakram', labelTe: '9. 120 సం. దశా-భుక్తి కాలచక్రం', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'phala_vivechana', labelTe: '9A. సాముదాయిక అష్టకవర్గ ఫలం, 81 భుక్తి ఫలాలు & గ్రహ సహాయక సూచిక', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'dosha_parihara', labelTe: '10. దోష పరీక్ష (కుజ/కాలసర్ప/శని)', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'upaya_pariharas', labelTe: '11. ఉపాయములు & పరిహారాలు (Upaya & Pariharas)', icon: <Flame className="w-3.5 h-3.5" /> },
  ];

/** నిజమైన అధ్యాయాల సంఖ్య ('అన్నీ' అనే ఎంపికను లెక్కించము) */
export const JATHAKAM_SECTION_COUNT = JATHAKAM_CHAPTERS.length - 1;

export const SampoornaJathakamView: React.FC<SampoornaJathakamProps> = ({
  chart,
  selectedPlanetId,
  onSelectPlanet,
  externalPdfTrigger = 0,
}) => {
  const jathakam = useMemo(() => generateTeluguSampoornaJathakam(chart), [chart]);
  const upayaReport = useMemo(() => generateUpayaPariharaReport(chart), [chart]);
  const verificationReport = useMemo(
    () => generateVerificationAndAnalysisReport(chart),
    [chart]
  );
  const astroVisionReport = useMemo(
    () => generateAstroVisionMasterReport(chart),
    [chart]
  );
  const siddhantaAppendices = useMemo(
    () => generateSiddhantaAdvancedAppendices(chart),
    [chart]
  );
  const lifeChronicle = useMemo(
    () =>
      generateSampoornaLifeChronicle(
        chart,
        jathakam,
        verificationReport,
        astroVisionReport,
        siddhantaAppendices
      ),
    [chart, jathakam, verificationReport, astroVisionReport, siddhantaAppendices]
  );
  const sookshmaNadiReport = useMemo(
    () => generateKundaliSookshmaNadiReport(chart),
    [chart]
  );
  const avakahada = useMemo(() => computeAvakahada(chart), [chart]);
  const yogaVichara = useMemo(() => computeYogaVichara(chart), [chart]);
  const lifeVistara = useMemo(() => computeJeevitaVistara(chart), [chart]);
  const pandita = useMemo(() => computePanditaVicharam(chart), [chart]);
  const avPhala = useMemo(() => computeAshtakavargaPhala(chart), [chart]);
  const adBook = useMemo(() => computeAntardashaPhalaBook(chart), [chart]);
  const sahayaka = useMemo(() => computeGrahaSahayaka(chart), [chart]);
  const [openMahaIdx, setOpenMahaIdx] = useState<number>(() =>
    Math.max(0, adBook.sections.findIndex((sec) => sec.rows.some((r) => r.isRunning)))
  );

  const [activeChapter, setActiveChapter] = useState<JathakamChapter>('all');
  const [selectedVarga, setSelectedVarga] = useState<VargaDivision>('D10');
  const [isPrintBookMode, setIsPrintBookMode] = useState<boolean>(false);
  const [remedySubFilter, setRemedySubFilter] = useState<
    'all' | 'mantra_dana' | 'ratna_rudraksha' | 'pancha_upaya'
  >('all');
  const [showAllPlanetsInRemedy, setShowAllPlanetsInRemedy] =
    useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<PdfExportProgress | null>(null);
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState<boolean>(false);
  const [isRoyalCardOpen, setIsRoyalCardOpen] = useState<boolean>(false);

  const pdfBookContainerRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadRealPdfBook = () => {
    if (pdfProgress?.isExporting) return;
    setIsPrintSettingsOpen(true);
  };

  const handleConfirmPdfExport = async (selectedPages: number[]) => {
    setIsPrintSettingsOpen(false);
    if (pdfProgress?.isExporting) return;
    // Switch to the Astro-Vision Classical Book view so selected pages are rendered in DOM
    setIsPrintBookMode(true);

    // Wait a short moment for DOM layout to settle
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!pdfBookContainerRef.current) return;
    try {
      await exportClassicalJathakaToPdf(
        pdfBookContainerRef.current,
        chart.input.name,
        chart.input.date,
        (prog) => setPdfProgress(prog),
        selectedPages
      );
    } catch (err) {
      console.error('PDF export error:', err);
      setPdfProgress({
        isExporting: false,
        currentPage: 0,
        totalPages: selectedPages.length,
        statusMessageTe:
          'PDF డౌన్‌లోడ్‌లో అంతరాయం కలిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
      });
    }
  };

  const handleConfirmBrowserPrint = (selectedPages: number[]) => {
    setIsPrintSettingsOpen(false);
    setIsPrintBookMode(true);

    setTimeout(() => {
      const container = pdfBookContainerRef.current;
      if (container) {
        const allPages = Array.from(
          container.querySelectorAll<HTMLElement>('.classical-grantha-page')
        );
        allPages.forEach((p, idx) => {
          if (!selectedPages.includes(idx + 1)) {
            p.style.display = 'none';
          } else {
            p.style.display = '';
          }
        });

        window.print();

        // Restore visibility after print dialog is closed
        setTimeout(() => {
          allPages.forEach((p) => {
            p.style.display = '';
          });
        }, 1200);
      } else {
        window.print();
      }
    }, 250);
  };

  useEffect(() => {
    if (externalPdfTrigger > 0) {
      setIsPrintSettingsOpen(true);
    }
  }, [externalPdfTrigger]);

  const chapters = JATHAKAM_CHAPTERS;

  const showSection = (sec: JathakamChapter) => activeChapter === 'all' || activeChapter === sec;

  return (
    <div className="space-y-8 md:space-y-10 pb-20">
      {/* One-Page Royal Summary Card Modal for WhatsApp & PNG Download */}
      <RoyalWhatsAppSummaryModal
        isOpen={isRoyalCardOpen}
        onClose={() => setIsRoyalCardOpen(false)}
        chart={chart}
      />

      {/* Print Settings Modal for Tailored Section Selection */}
      <PrintSettingsModal
        isOpen={isPrintSettingsOpen}
        onClose={() => setIsPrintSettingsOpen(false)}
        onConfirmPdfExport={handleConfirmPdfExport}
        onConfirmBrowserPrint={handleConfirmBrowserPrint}
        personName={chart.input.name}
        birthDate={chart.input.date}
      />

      {/* Live PDF Generation Progress Banner */}
      {pdfProgress && (
        <div className="no-print sticky top-16 z-40 bg-[#141932] border-2 border-[#C9A96E] rounded-xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {pdfProgress.isExporting ? (
              <Loader2 className="w-5 h-5 text-[#C9A96E] animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#5BBFB5] shrink-0" />
            )}
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#EDE8E0]">
                {pdfProgress.statusMessageTe}
              </div>
              {pdfProgress.isExporting && (
                <div className="w-64 sm:w-80 h-2 bg-[#090C18] rounded-full overflow-hidden mt-1.5 border border-[#C9A96E]/40">
                  <div
                    className="h-full bg-gradient-to-r from-[#C9A96E] to-[#5BBFB5] transition-all duration-200"
                    style={{
                      width: `${Math.round(
                        (pdfProgress.currentPage / Math.max(1, pdfProgress.totalPages)) * 100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {!pdfProgress.isExporting && (
            <button
              onClick={() => setPdfProgress(null)}
              className="px-3 py-1 rounded bg-[#090C18] text-xs text-[#C9A96E] border border-[#C9A96E]/40 cursor-pointer"
            >
              మూసివేయి (Close)
            </button>
          )}
        </div>
      )}

      {/* ==================================================================================== */}
      {/* AUTHENTIC 12-PAGE ASTRO-VISION / PEETHAM PRINT & PDF DOCUMENT                        */}
      {/* Shown automatically during PDF download, print, OR when Print Book Preview is active */}
      {/* ==================================================================================== */}
      <div className={isPrintBookMode ? 'block classical-pdf-only' : 'hidden classical-pdf-only'}>
        <div className="no-print mb-4 bg-[#141932] border-2 border-[#C9A96E] rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#C9A96E] uppercase tracking-wider">
              సాంప్రదాయ 12-పుటల రాజముద్రణ సంపూర్ణ జాతక మహాగ్రంథం (Astro-Vision LifeSign 12-Page Full Horoscope Book)
            </div>
            <p className="text-xs text-[#EDE8E0]/85 mt-0.5">
              ఇది అచ్చమైన Astro-Vision సాఫ్ట్‌వేర్ & తెలుగు జ్యోతిష్య పీఠం ప్రమాణాలతో 12 పేజీల A4 సంపూర్ణ జీవిత జాతక పుస్తకంగా రూపొందించబడింది. క్రింది బటన్ నొక్కగానే నేరుగా 12-పేజీల .PDF ఫైల్ డౌన్‌లోడ్ అవుతుంది.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadRealPdfBook}
              disabled={pdfProgress?.isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C9A96E] text-[#090C18] text-xs font-bold hover:bg-[#d8b97e] transition-colors cursor-pointer shadow-lg disabled:opacity-60"
            >
              {pdfProgress?.isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              12-పేజీల పూర్తి జాతకం .PDF ఫైల్ డౌన్‌లోడ్ (Direct PDF Download)
            </button>
            <button
              onClick={() => setIsPrintSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#090C18] text-[#C9A96E] border border-[#C9A96E]/50 text-xs font-bold hover:bg-[#141932] cursor-pointer"
              title="ముద్రణ పుటల ఎంపిక & అనుకూలీకరణ"
            >
              <Sliders className="w-3.5 h-3.5" />
              విభాగాల ఎంపిక (Print Settings)
            </button>
            <button
              onClick={() => handleConfirmBrowserPrint([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#090C18] text-[#5BBFB5] border border-[#5BBFB5]/40 text-xs font-bold hover:bg-[#141932] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              ప్రింట్ (Print)
            </button>
            <button
              onClick={() => setIsPrintBookMode(false)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#090C18] text-[#EDE8E0] border border-white/20 text-xs font-semibold hover:border-[#C9A96E] cursor-pointer"
            >
              ఇంటరాక్టివ్ వ్యూకు తిరిగి వెళ్ళండి
            </button>
          </div>
        </div>

        <div ref={pdfBookContainerRef} className="classical-pdf-preview-wrapper">
          <ClassicalJathakaPdfDocument
            chart={chart}
            jathakam={jathakam}
            upayaReport={upayaReport}
            verificationReport={verificationReport}
            astroVisionReport={astroVisionReport}
            advancedAppendices={siddhantaAppendices}
            lifeChronicle={lifeChronicle}
          />
        </div>
      </div>

      {/* ==================================================================================== */}
      {/* INTERACTIVE SCREEN VIEW (Hidden automatically during Print / PDF export)              */}
      {/* ==================================================================================== */}
      <div className={isPrintBookMode ? 'hidden screen-interactive-only' : 'space-y-8 md:space-y-10 screen-interactive-only'}>
      {/* Traditional Telugu Jathaka Patrika Royal Header Banner */}
      <div className="bg-gradient-to-b from-[#141932] to-[#0F1326] border-2 border-[#C9A96E]/60 rounded-lg p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center space-y-2 border-b border-[#C9A96E]/25 pb-5">
          <div className="text-[11px] sm:text-xs tracking-[0.12em] sm:tracking-[0.2em] text-[#C9A96E] font-semibold">
            || శ్రీ గణేశాయ నమః · శ్రీ సరస్వత్యై నమః · శ్రీ గురుభ్యో నమః · శ్రీ వేంకటేశ్వరాయ నమః · అవిఘ్నమస్తు ||
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#EDE8E0] tracking-tight">
            శ్రీ సంపూర్ణ తెలుగు జాతక మహాగ్రంథం (దృగ్గణిత సిద్ధాంత ప్రమాణం)
          </h1>
          <p className="text-xs sm:text-sm text-[#EDE8E0]/75 max-w-4xl mx-auto leading-relaxed">
            బృహత్ పరాశర హోరా శాస్త్రం, బృహజ్జాతకం, ఫలదీపిక, జాతక పారిజాతం, సారావళి, భావార్థ రత్నాకరం, ఉత్తర కాలామృతం, మహర్షి జైమిని ఉపదేశ సూత్రాలు, లఘు పరాశరి, జాతకాలంకారం, చమత్కార చింతామణి & ముహూర్త చింతామణి — 12 ప్రాచీన గ్రంథాల మూల శ్లోక ప్రమాణాలతో కూడిన సంపూర్ణ కుండలి
          </p>

          {/* Formal Traditional Swasti Vachaka Jathaka Proclamation Box */}
          <div className="mt-3 max-w-4xl mx-auto bg-[#090C18]/90 border border-[#C9A96E]/40 rounded-lg p-3.5 text-xs text-[#EDE8E0]/90 leading-relaxed text-justify">
            <span className="font-bold text-[#C9A96E]">సాంప్రదాయ జనన కాల స్వస్తి వాచక ప్రకటన: </span>
            {siddhantaAppendices.swastiSriProclamationTe}
          </div>

          {/* Birth Metadata & Dedicated PDF / Print Book Controls */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#C9A96E]">
            <span className="px-3 py-1.5 rounded bg-[#090C18]/90 border border-[#C9A96E]/35 font-bold">
              జాతకుని పేరు: {chart.input.name}
            </span>
            <span className="px-3 py-1.5 rounded bg-[#090C18]/90 border border-[#5BBFB5]/40 text-[#5BBFB5] font-bold">
              లింగం: {(chart.input.gender ?? 'male') === 'female' ? '👧 స్త్రీ / అమ్మాయి (Female)' : '👦 పురుషుడు / అబ్బాయి (Male)'}
            </span>
            <span className="px-3 py-1.5 rounded bg-[#090C18]/90 border border-[#C9A96E]/35 font-mono-tabular font-semibold">
              జన్మ తేదీ: {chart.input.date} · సమయం: {chart.input.time} ({jathakam.udayadiIshtaGhatikaluTe})
            </span>
            <span className="px-3 py-1.5 rounded bg-[#090C18]/90 border border-[#C9A96E]/35 font-semibold">
              జన్మ స్థలం: {chart.input.city} ({chart.input.lat.toFixed(2)}°N, {chart.input.lng.toFixed(2)}°E)
            </span>
          </div>

          <div className="no-print pt-3 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={handleDownloadRealPdfBook}
              disabled={pdfProgress?.isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C9A96E] text-[#090C18] text-xs sm:text-sm font-bold hover:bg-[#d8b97e] transition-colors cursor-pointer shadow-lg disabled:opacity-60"
            >
              {pdfProgress?.isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Download className="w-4 h-4 shrink-0" />
              )}
              పూర్తి జాతకం PDF డౌన్‌లోడ్ (13-Page Astro-Vision PDF Download)
            </button>

            <button
              onClick={() => setIsRoyalCardOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/50 hover:bg-[#25D366]/25 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              1-పేజీ రాజముద్ర కార్డు & WhatsApp షేర్
            </button>

            <button
              onClick={() => setIsPrintSettingsOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer bg-[#090C18] text-[#C9A96E] border-[#C9A96E]/50 hover:bg-[#141932]"
              title="ముద్రణ పుటల ఎంపిక & అనుకూలీకరణ"
            >
              <Sliders className="w-4 h-4 shrink-0 text-[#C9A96E]" />
              విభాగాల ఎంపిక & ప్రింట్ అమరికలు (Print Settings)
            </button>

            <button
              onClick={() => setIsPrintBookMode(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer bg-[#090C18] text-[#5BBFB5] border-[#5BBFB5]/50 hover:bg-[#141932]"
            >
              <FileText className="w-4 h-4 shrink-0" />
              సాంప్రదాయ 13-పేజీల Astro-Vision జాతక పుస్తక వ్యూ (Open Classical Book View)
            </button>
          </div>
        </div>

        {/* 6-Highlight Pillar Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 pt-5">
          <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded p-3 text-center">
            <div className="text-[11px] text-[#EDE8E0]/55">జన్మ రాశి (చంద్ర రాశి)</div>
            <div className="text-sm sm:text-base font-bold text-[#C9A96E] mt-1">{jathakam.janmaRasiTe}</div>
            <div className="text-[11px] text-[#EDE8E0]/65 mt-0.5">అధిపతి: {jathakam.janmaRasiAdhipatiTe}</div>
          </div>
          <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded p-3 text-center">
            <div className="text-[11px] text-[#EDE8E0]/55">జన్మ నక్షత్రం & పాదం</div>
            <div className="text-sm sm:text-base font-bold text-[#5BBFB5] mt-1">
              {jathakam.janmaNakshatramTe} ({jathakam.janmaPadam}వ పాదం)
            </div>
            <div className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
              నామాక్షరం: <strong className="text-[#C9A96E]">"{jathakam.namaAksharamTe}"</strong> ({jathakam.allFourPadaAksharaluTe})
            </div>
          </div>
          <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded p-3 text-center">
            <div className="text-[11px] text-[#EDE8E0]/55">జన్మ లగ్నం (Ascendant)</div>
            <div className="text-sm sm:text-base font-bold text-[#EDE8E0] mt-1">{jathakam.janmaLagnamTe}</div>
            <div className="text-[11px] text-[#EDE8E0]/65 mt-0.5">లగ్నాధిపతి: {jathakam.janmaLagnaAdhipatiTe}</div>
          </div>
          <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded p-3 text-center">
            <div className="text-[11px] text-[#EDE8E0]/55">ఆత్మకారకుడు & ఆరూఢ లగ్నం</div>
            <div className="text-sm font-bold text-[#5BBFB5] mt-1">
              AK: {jathakam.jaiminiKarakas[0]?.planetNameTe}
            </div>
            <div className="text-[11px] text-[#C9A96E] mt-0.5">
              AL: {jathakam.arudhaPadas[0]?.rasiNameTe.split(' ')[0]} · UL: {jathakam.arudhaPadas[1]?.rasiNameTe.split(' ')[0]}
            </div>
          </div>
          <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded p-3 text-center">
            <div className="text-[11px] text-[#EDE8E0]/55">తెలుగు సంవత్సరం & తిథి</div>
            <div className="text-sm font-bold text-[#C9A96E] mt-1">{jathakam.samvatsaramTe}</div>
            <div className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
              {jathakam.masamTe.split(' (')[0]} · {jathakam.tithiTe.split(' (')[0]}
            </div>
          </div>
          <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded p-3 text-center">
            <div className="text-[11px] text-[#EDE8E0]/55">జన్మ దశా నిల్వ & ప్రస్తుత దశ</div>
            <div className="text-sm font-bold text-[#5BBFB5] mt-1">
              {jathakam.currentDashaPhalamTe.mahadashaTe.split(' (')[0]}
            </div>
            <div className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
              {jathakam.dashaBalanceAtBirthTe.split('(')[0]}
            </div>
          </div>
        </div>

        {/* Mobile Quick Chapter Select Dropdown + Desktop Filter Pills */}
        <div className="no-print mt-5 pt-4 border-t border-white/10 space-y-3">
          <div className="md:hidden">
            <label className="block text-[11px] font-bold text-[#C9A96E] mb-1.5">
              అధ్యాయం ఎంచుకోండి (Quick Chapter Jump for Mobile):
            </label>
            <select
              value={activeChapter}
              onChange={(e) => setActiveChapter(e.target.value as JathakamChapter)}
              className="w-full bg-[#090C18] border border-[#C9A96E]/50 rounded-lg px-3 py-2.5 text-xs font-bold text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            >
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.labelTe}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex flex-wrap items-center justify-center gap-2">
            {chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(ch.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeChapter === ch.id
                    ? 'bg-[#C9A96E] text-[#090C18] shadow-md font-bold'
                    : 'bg-[#090C18]/80 text-[#EDE8E0]/80 border border-white/10 hover:border-[#C9A96E]/40 hover:text-[#EDE8E0]'
                }`}
              >
                {ch.icon}
                {ch.labelTe}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================================================== */}
      {/* PANDITA VICHARAM — the actual reading: pillars, strength order, houses, direct answers */}
      {/* ==================================================================================== */}
      {showSection('pandita_vicharam') && (
        <div className="space-y-6 print-page-break">
          <div className="bg-gradient-to-b from-[#141932] to-[#0F1326] border-2 border-[#C9A96E]/70 rounded-xl p-4 sm:p-6 md:p-8 space-y-5 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C9A96E]" />
                పండిత విచారణ — జాతక పరిశీలన
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#EDE8E0] mt-1">
                ముందు జాతకాన్ని చదవడం — తర్వాత ఫలం. స్తంభాలు, గ్రహ బల క్రమం, భావ విచారణ, నేరుగా సమాధానాలు
              </h2>
              <p className="text-xs text-[#EDE8E0]/70 mt-2 leading-relaxed">{pandita.uddeshyamTe}</p>
            </div>

            {/* జన్మ వివరాలు */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {pandita.snapshot.map((s) => (
                <div key={s.labelTe} className="bg-[#090C18]/90 border border-white/10 rounded-lg p-3">
                  <div className="text-[11px] text-[#EDE8E0]/55">{s.labelTe}</div>
                  <div className="text-sm font-bold text-[#EDE8E0] mt-0.5">{s.valueTe}</div>
                  {s.noteTe ? <div className="text-[11px] text-[#C9A96E]/80 mt-0.5">{s.noteTe}</div> : null}
                </div>
              ))}
            </div>

            {/* మూడు స్తంభాలు */}
            <div className="space-y-3">
              {pandita.pillars.map((p) => (
                <div key={p.titleTe} className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-bold text-[#C9A96E]">
                    {p.titleTe} <span className="text-[11px] font-normal text-[#EDE8E0]/50">— {p.subtitleTe}</span>
                  </h3>
                  <ul className="text-[11px] text-[#EDE8E0]/75 space-y-0.5 list-disc pl-4">
                    {p.factsTe.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-[#EDE8E0]/90 leading-relaxed">
                    <strong className="text-[#5BBFB5]">తీర్పు: </strong>
                    {p.verdictTe}
                  </p>
                  <p className="text-[11px] text-[#EDE8E0]/80 leading-relaxed">{p.deepTe}</p>
                </div>
              ))}
            </div>

            {/* షడ్బల క్రమం */}
            <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#C9A96E] mb-2">గ్రహ బల క్రమం (షడ్బలం) — ఎవరు జాతకాన్ని నడుపుతున్నారు?</h3>
              <div className="space-y-2">
                {pandita.grahaBala.map((g, i) => (
                  <div key={g.id} className="grid grid-cols-12 gap-2 items-center text-[11px]">
                    <span className="col-span-1 text-[#EDE8E0]/45 font-mono-tabular">{i + 1}</span>
                    <span className="col-span-2 font-bold text-[#EDE8E0]">{g.nameTe}</span>
                    <span className="col-span-3 text-[#EDE8E0]/70">
                      {g.rasiTe} · {g.house}వ · {g.dignityTe}
                      {g.isRetrograde ? ' · వక్ర' : ''}
                    </span>
                    <span className="col-span-4">
                      <span className="block h-1.5 rounded bg-white/10 overflow-hidden">
                        <span
                          className="block h-full rounded"
                          style={{ width: `${Math.min(100, (g.shadbalaPct / 150) * 100)}%`, background: 'linear-gradient(90deg,#C9A96E,#5BBFB5)' }}
                        />
                      </span>
                      <span className="text-[10px] text-[#EDE8E0]/45">{g.ownsTe} అధిపతి · {g.functionalTe}</span>
                    </span>
                    <span className="col-span-2 text-right font-mono-tabular font-bold text-[#C9A96E]">{g.shadbalaPct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* భావ విచారణ */}
            <div className="bg-[#090C18]/90 border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#EDE8E0] mb-2">
                ద్వాదశ భావ విచారణ — బిందువులు, భావ బలం, అధిపతి స్థితి
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="text-[#C9A96E] border-b border-[#C9A96E]/40">
                      <th className="text-left py-1.5 pr-2">భావం</th>
                      <th className="text-left py-1.5 pr-2">రాశి</th>
                      <th className="text-left py-1.5 pr-2">అధిపతి</th>
                      <th className="text-left py-1.5 pr-2">గ్రహాలు</th>
                      <th className="text-center py-1.5 pr-2">బిందువులు</th>
                      <th className="text-center py-1.5 pr-2">బల ర్యాంక్</th>
                      <th className="text-left py-1.5">గ్రేడ్</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pandita.bhava.map((b) => (
                      <tr key={b.house} className="border-b border-white/5">
                        <td className="py-1.5 pr-2 font-bold text-[#EDE8E0]">{b.house}</td>
                        <td className="py-1.5 pr-2 text-[#EDE8E0]/75">{b.rasiTe}</td>
                        <td className="py-1.5 pr-2 text-[#EDE8E0]/75">
                          {b.lordTe} <span className="text-[#EDE8E0]/45">({b.lordHouse}వ)</span>
                        </td>
                        <td className="py-1.5 pr-2 text-[#5BBFB5]">{b.occupantsTe}</td>
                        <td className="py-1.5 pr-2 text-center font-mono-tabular text-[#C9A96E]">{b.sav}</td>
                        <td className="py-1.5 pr-2 text-center font-mono-tabular text-[#EDE8E0]/70">{b.bhavaBalaRank}</td>
                        <td className={`py-1.5 font-bold ${b.gradeTe === 'బలవత్' ? 'text-[#5BBFB5]' : b.gradeTe === 'మధ్యమ' ? 'text-[#C9A96E]' : 'text-[#E8A317]'}`}>
                          {b.gradeTe}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* యోగ దోష */}
            <div className="bg-[#090C18]/90 border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#EDE8E0] mb-2">యోగ — దోష పరిశీలన (గణన ఆధారంతో)</h3>
              <div className="space-y-1.5">
                {pandita.yogaDosha.map((y) => (
                  <div key={y.nameTe} className="text-[11px] border-b border-white/5 pb-1.5">
                    <span className="font-bold text-[#C9A96E]">{y.nameTe}: </span>
                    <span className="font-semibold text-[#5BBFB5]">{y.statusTe}</span>
                    <div className="text-[#EDE8E0]/70 mt-0.5">{y.detailTe}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ప్రశ్నోత్తరాలు */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#EDE8E0]">మీ ప్రశ్నలకు నేరుగా సమాధానాలు</h3>
              {pandita.prashnottaralu.map((q, i) => (
                <div key={i} className="bg-[#090C18]/90 border border-[#5BBFB5]/30 rounded-lg p-3.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#5BBFB5] mb-1">
                    {i + 1}. {q.prashnaTe}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#EDE8E0]/88 leading-relaxed text-justify">{q.uttaramTe}</p>
                </div>
              ))}
            </div>

            {/* దశా క్రమం */}
            <div className="bg-[#090C18]/90 border border-white/10 rounded-lg p-4 overflow-x-auto">
              <h3 className="text-sm font-bold text-[#EDE8E0] mb-2">దశా క్రమం — జీవిత పర్వాలు</h3>
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="text-[#C9A96E] border-b border-[#C9A96E]/40">
                    <th className="text-left py-1.5 pr-2">మహాదశ</th>
                    <th className="text-left py-1.5 pr-2">కాలం</th>
                    <th className="text-left py-1.5 pr-2">వయస్సు</th>
                    <th className="text-left py-1.5">ఏ గ్రహం ఎలా నడుపుతుంది</th>
                  </tr>
                </thead>
                <tbody>
                  {pandita.dashaKrama.map((d) => (
                    <tr key={d.lordTe + d.fromTe} className="border-b border-white/5">
                      <td className="py-1.5 pr-2 font-bold text-[#EDE8E0]">{d.lordTe}</td>
                      <td className="py-1.5 pr-2 font-mono-tabular text-[#C9A96E]">
                        {d.fromTe} → {d.toTe}
                      </td>
                      <td className="py-1.5 pr-2 text-[#EDE8E0]/70">{d.ageTe}</td>
                      <td className="py-1.5 text-[#EDE8E0]/80">{d.themeTe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* సారాంశం */}
            <div className="bg-[#C9A96E]/[0.08] border-2 border-[#C9A96E]/60 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#C9A96E] mb-2">అసలు ఈ జాతకం ఏమిటి? — ఎనిమిది వాక్యాల్లో</h3>
              <ol className="text-[11px] sm:text-xs text-[#EDE8E0]/90 leading-relaxed space-y-1.5 list-decimal pl-5">
                {pandita.sara.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ol>
            </div>

            {/* నిషేధ */}
            <div className="bg-[#E8A317]/[0.07] border border-[#E8A317]/40 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#E8A317] mb-1.5">ఈ జాతకం ఏమి చెప్పదు</h3>
              <ul className="text-[11px] text-[#EDE8E0]/85 leading-relaxed space-y-1 list-disc pl-4">
                {pandita.nishedha.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>

            {/* మార్గదర్శనం */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pandita.margadarshanam.map((m) => (
                <div key={m.headingTe} className="bg-[#090C18]/90 border border-white/10 rounded-lg p-3.5">
                  <h4 className="text-xs font-bold text-[#5BBFB5] mb-1">{m.headingTe}</h4>
                  <p className="text-[11px] text-[#EDE8E0]/85 leading-relaxed">{m.bodyTe}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================================== */}
      {/* CHAPTER 0: SAMPOORNA JEEVITA CHARITRA (0-100 YEARS 7 EPOCHS, 9 PLANETS & BLUEPRINTS) */}
      {/* ==================================================================================== */}
      {showSection('sampoorna_jeevita_charitra') && (
        <div className="space-y-6 print-page-break">
          {/* 00. SULABHA JATHAKA SARAMSHAM — EASY-TO-READ AT-A-GLANCE COMPLETE JATHAKAM GUIDE */}
          <div className="bg-gradient-to-br from-[#141932] via-[#0F1326] to-[#141932] border-2 border-[#5BBFB5]/70 rounded-xl p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#5BBFB5] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBFB5]" />
                  సులభ జాతక సారాంశం — ఒక్క చూపులో మీ పూర్తి జాతక వివరణ (Easy-to-Read Complete Guide)
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#EDE8E0] mt-1">
                  ఎటువంటి క్లిష్టమైన పదాలు లేకుండా — మీ స్వభావం, కెరీర్, ధనం, వివాహం & భవిష్యత్తు సారాంశం
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E] text-xs font-bold text-[#C9A96E]">
                జాతక బల స్కోరు: {lifeChronicle.horoscopeExecutiveIdentity.overallLifeFortuneScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs leading-relaxed">
              <div className="bg-[#090C18]/95 border border-[#C9A96E]/40 rounded-lg p-3.5 space-y-1.5">
                <div className="font-bold text-[#C9A96E] text-sm flex items-center justify-between border-b border-white/10 pb-1">
                  <span>1. మీ స్వభావం & మనస్తత్వం</span>
                  <span className="text-[11px] text-[#5BBFB5]">{jathakam.janmaLagnamTe.split('(')[0].trim()} లగ్నం</span>
                </div>
                <p className="text-[#EDE8E0]/90">{lifeChronicle.horoscopeExecutiveIdentity.physicalAndMentalConstitutionTe}</p>
              </div>

              <div className="bg-[#090C18]/95 border border-[#5BBFB5]/40 rounded-lg p-3.5 space-y-1.5">
                <div className="font-bold text-[#5BBFB5] text-sm flex items-center justify-between border-b border-white/10 pb-1">
                  <span>2. ఉద్యోగం & వ్యాపార యోగం</span>
                  <span className="text-[11px] text-[#C9A96E]">10వ భావం</span>
                </div>
                <p className="text-[#EDE8E0]/90">{lifeChronicle.careerWealthBlueprint.jobVsBusinessVerdictTe}</p>
                <div className="text-[#5BBFB5] font-semibold">
                  అనుకూల రంగాలు: {lifeChronicle.careerWealthBlueprint.recommendedSectorsTe.slice(0, 3).join(', ')}
                </div>
              </div>

              <div className="bg-[#090C18]/95 border border-[#C9A96E]/40 rounded-lg p-3.5 space-y-1.5">
                <div className="font-bold text-[#C9A96E] text-sm flex items-center justify-between border-b border-white/10 pb-1">
                  <span>3. ధన సంపాదన & సొంత ఇల్లు</span>
                  <span className="text-[11px] text-[#5BBFB5]">{lifeChronicle.careerWealthBlueprint.peakFinancialAgesTe}</span>
                </div>
                <p className="text-[#EDE8E0]/90">{lifeChronicle.careerWealthBlueprint.wealthAndPropertyYogasTe}</p>
              </div>

              <div className="bg-[#090C18]/95 border border-[#9B8FD4]/40 rounded-lg p-3.5 space-y-1.5">
                <div className="font-bold text-[#9B8FD4] text-sm flex items-center justify-between border-b border-white/10 pb-1">
                  <span>4. వివాహం & జీవిత భాగస్వామి</span>
                  <span className="text-[11px] text-[#C9A96E]">7వ భావం</span>
                </div>
                <p className="text-[#EDE8E0]/90">{lifeChronicle.marriageBlueprint.spouseNatureAndAppearanceTe}</p>
                <div className="text-[#9B8FD4] font-semibold">
                  {lifeChronicle.marriageBlueprint.marriageDirectionAndTimingTe}
                </div>
              </div>

              <div className="bg-[#090C18]/95 border border-[#5BBFB5]/40 rounded-lg p-3.5 space-y-1.5">
                <div className="font-bold text-[#5BBFB5] text-sm flex items-center justify-between border-b border-white/10 pb-1">
                  <span>5. ప్రస్తుత దశ & భవిష్యత్తు</span>
                  <span className="text-[11px] text-[#C9A96E]">కాలచక్రం</span>
                </div>
                <p className="text-[#EDE8E0]/90">{lifeChronicle.horoscopeExecutiveIdentity.atmakarakaAndSoulMissionTe}</p>
              </div>

              <div className="bg-[#090C18]/95 border border-[#E8A317]/40 rounded-lg p-3.5 space-y-1.5">
                <div className="font-bold text-[#E8A317] text-sm flex items-center justify-between border-b border-white/10 pb-1">
                  <span>6. ముఖ్య పరిహారం & అదృష్టం</span>
                  <span className="text-[11px] text-[#5BBFB5]">రక్షణ</span>
                </div>
                <p className="text-[#EDE8E0]/90">
                  <strong>ఇష్టదేవత:</strong> {verificationReport.jaiminiDevataNirnaya.ishtaDevataTe}
                  <br />
                  <strong>అదృష్ట రత్నం:</strong> {astroVisionReport.adrushtaSoochika.lifeGemstoneTe}
                  <br />
                  <strong>అదృష్ట సంఖ్యలు & వారాలు:</strong> {astroVisionReport.adrushtaSoochika.luckyNumbers} · {astroVisionReport.adrushtaSoochika.luckyDaysTe}
                </p>
              </div>
            </div>
          </div>

          {/* 0A. Horoscope Executive Identity & Soul Mission */}
          <div className="bg-[#0F1326] border-2 border-[#C9A96E]/55 rounded-xl p-4 sm:p-6 md:p-8 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                  జాతకుని సంపూర్ణ జీవిత స్వరూపం & ఆత్మకారక జీవన లక్ష్యం (Complete Horoscope Identity & Life Blueprint)
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#EDE8E0] mt-1">
                  {lifeChronicle.horoscopeExecutiveIdentity.swaroopaTitleTe}
                </h2>
              </div>
              <span className="px-3.5 py-1.5 rounded-lg bg-[#C9A96E]/20 border border-[#C9A96E] text-xs font-bold text-[#C9A96E]">
                సమగ్ర జాతక బల స్కోరు: {lifeChronicle.horoscopeExecutiveIdentity.overallLifeFortuneScore}%
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#EDE8E0]/90 leading-relaxed">
              <div className="bg-[#090C18]/90 border border-white/10 rounded-lg p-4">
                <div className="text-xs font-bold text-[#C9A96E] mb-1">
                  1. శారీరక, మానసిక & వ్యక్తిత్వ నిర్మాణం:
                </div>
                <p>{lifeChronicle.horoscopeExecutiveIdentity.physicalAndMentalConstitutionTe}</p>
              </div>

              <div className="bg-[#090C18]/90 border border-[#5BBFB5]/30 rounded-lg p-4">
                <div className="text-xs font-bold text-[#5BBFB5] mb-1">
                  2. పూర్వజన్మ సుకృతం & ఆత్మకారక జీవన లక్ష్యం:
                </div>
                <p>{lifeChronicle.horoscopeExecutiveIdentity.atmakarakaAndSoulMissionTe}</p>
              </div>

              <div className="bg-[#090C18]/90 border border-[#C9A96E]/30 rounded-lg p-4">
                <div className="text-xs font-bold text-[#C9A96E] mb-1">
                  3. లగ్న-చంద్ర-సూర్య రాజయోగ సమన్వయం:
                </div>
                <p>{lifeChronicle.horoscopeExecutiveIdentity.lagnaAndChandraSynthesisTe}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#090C18] border border-[#5BBFB5]/35 rounded-lg p-4">
                <div className="text-xs font-bold text-[#5BBFB5] mb-2">
                  జాతకంలోని ప్రధాన బలాలు (Core Horoscope Strengths):
                </div>
                <ul className="space-y-1.5 text-xs text-[#EDE8E0]/85 list-disc list-inside">
                  {lifeChronicle.horoscopeExecutiveIdentity.keyLifeStrengthsTe.map((st, idx) => (
                    <li key={`identity-strength-${idx}`}>{st}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#090C18] border border-[#E8A317]/35 rounded-lg p-4">
                <div className="text-xs font-bold text-[#E8A317] mb-2">
                  పాటించవలసిన శాస్త్ర జాగ్రత్తలు (Key Life Precautions):
                </div>
                <ul className="space-y-1.5 text-xs text-[#EDE8E0]/85 list-disc list-inside">
                  {lifeChronicle.horoscopeExecutiveIdentity.keyLifePrecautionsTe.map((pr, idx) => (
                    <li key={`identity-precaution-${idx}`}>{pr}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 100% Kundali-Driven Pratyaksha Nija Darshini & Actionable Future Guide */}
            <div className="bg-gradient-to-r from-[#141932] via-[#090C18] to-[#141932] border-2 border-[#C9A96E]/60 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#C9A96E]">
                    || 100% కుండలి గ్రహ-భావ-దశా ఆధారిత త్రికాల ప్రత్యక్ష నిజ దర్శిని ||
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#EDE8E0] mt-0.5">
                    కళ్ళకు కట్టినట్లు మీ కుండలి సత్యాలు · భవిష్యత్తు ఎలా ఉంటుంది? · మీ జాతకం ప్రకారం ఏం చేయాలి?
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#5BBFB5]/20 border border-[#5BBFB5]/40 text-xs font-bold text-[#5BBFB5]">
                  {sookshmaNadiReport.nativeGenderTe} · నామాక్షరం: “{jathakam.namaAksharamTe}”
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs leading-relaxed">
                <div className="p-4 rounded-lg bg-[#0F1326] border border-[#C9A96E]/35 space-y-2">
                  <div className="font-bold text-[#C9A96E] text-sm">
                    1. కళ్ళకు కట్టినట్లు మీ కుండలి నిజాలు (100% Chart-Specific Truths):
                  </div>
                  <ul className="space-y-2 text-[#EDE8E0]/90 list-disc list-inside">
                    {sookshmaNadiReport.crystalClearUnfilteredTruthsTe.map((item, i) => (
                      <li key={`truth-${i}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#0F1326] border border-[#5BBFB5]/35 space-y-2">
                  <div className="font-bold text-[#5BBFB5] text-sm">
                    2. రాబోయే భవిష్యత్తు ఎలా ఉండబోతోంది? (Exact Dasha & Nadi Destiny):
                  </div>
                  <ul className="space-y-2 text-[#EDE8E0]/90 list-disc list-inside">
                    {sookshmaNadiReport.futureTimelineVerdictsTe.map((item, i) => (
                      <li key={`future-${i}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#0F1326] border border-[#9B8FD4]/35 space-y-2">
                  <div className="font-bold text-[#9B8FD4] text-sm">
                    3. మీ జాతకం ప్రకారం ఏం చేయాలి & ఏం చేయకూడదు? (Action Plan):
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[#5BBFB5] font-bold">✅ తప్పక చేయవలసినవి:</div>
                    <ul className="space-y-1 text-[#EDE8E0]/90 list-disc list-inside">
                      {sookshmaNadiReport.exactActionableDoAndDontsTe.mustDoTe.map((d, i) => (
                        <li key={`do-${i}`}>{d}</li>
                      ))}
                    </ul>
                    <div className="text-[#D47B7B] font-bold pt-1">⚠️ నివారించవలసినవి:</div>
                    <ul className="space-y-1 text-[#EDE8E0]/85 list-disc list-inside">
                      {sookshmaNadiReport.exactActionableDoAndDontsTe.mustAvoidTe.map((av, i) => (
                        <li key={`avoid-${i}`}>{av}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 0B. 7 Life Epochs from Birth to 100 Years */}
          <div className="bg-[#0F1326] border border-[#5BBFB5]/45 rounded-xl p-4 sm:p-6 md:p-8 space-y-5">
            <div className="border-b border-white/10 pb-3">
              <div className="text-xs uppercase tracking-widest text-[#5BBFB5] font-semibold">
                బాల్యం నుండి శతాయుష్షు వరకు 7 జీవిత పర్వాల సంపూర్ణ కాలచక్ర చరిత్ర (Birth to 100 Years 7 Life Epochs)
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#EDE8E0] mt-1">
                వయస్సు వారీగా వింశోత్తరి + జైమిని చరదశల సమన్వయంతో జీవిత గమన విశ్లేషణ
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {lifeChronicle.sevenLifeEpochs.map((ep) => (
                <div
                  key={ep.epochNumber}
                  className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div>
                      <span className="px-2.5 py-0.5 rounded bg-[#C9A96E] text-[#090C18] text-xs font-bold mr-2">
                        వయస్సు: {ep.ageRangeTe} ({ep.calendarYearsTe})
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#EDE8E0]">
                        {ep.titleTe}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-xs font-bold text-[#5BBFB5]">
                      {ep.statusBadgeTe} · {ep.fortuneScorePct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-[#141932]/80 p-2.5 rounded-lg border border-white/10">
                    <div>
                      <span className="text-[#C9A96E] font-semibold">వింశోత్తరి మహాదశలు: </span>
                      <span className="text-[#EDE8E0]">{ep.activeVimshottariDashasTe}</span>
                    </div>
                    <div>
                      <span className="text-[#5BBFB5] font-semibold">జైమిని చర రాశి దశలు: </span>
                      <span className="text-[#EDE8E0]">{ep.activeJaiminiCharaDashasTe}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#EDE8E0]/85 leading-relaxed">
                    <div className="bg-[#0F1326] p-3 rounded border border-white/5">
                      <strong className="text-[#C9A96E] block mb-1">ఆరోగ్యం, మనస్తత్వం & వ్యక్తిత్వ వికాసం:</strong>
                      {ep.physicalAndMentalTe}
                    </div>
                    <div className="bg-[#0F1326] p-3 rounded border border-white/5">
                      <strong className="text-[#5BBFB5] block mb-1">విద్య, వృత్తి, ఉద్యోగం & ధన సంపాదన:</strong>
                      {ep.educationCareerWealthTe}
                    </div>
                    <div className="bg-[#0F1326] p-3 rounded border border-white/5">
                      <strong className="text-[#C9A96E] block mb-1">కుటుంబం, వివాహం & సంతాన వృద్ధి:</strong>
                      {ep.familyMarriageProgenyTe}
                    </div>
                    <div className="bg-[#0F1326] p-3 rounded border border-white/5">
                      <strong className="text-[#E8A317] block mb-1">శాస్త్ర జాగ్రత్తలు & ఉపాసన:</strong>
                      {ep.cautionsAndGuidanceTe}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 0C. Marriage & Career Blueprints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0F1326] border border-[#C9A96E]/45 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C9A96E] flex items-center gap-2 border-b border-white/10 pb-2.5">
                <HeartHandshake className="w-4 h-4 text-[#C9A96E]" />
                వివాహ & జీవిత భాగస్వామి సమగ్ర బ్లూప్రింట్ (Marriage & Spouse Blueprint)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#090C18] p-3 rounded border border-white/10">
                <div><span className="text-[#EDE8E0]/60">7వ భావం:</span> <strong className="text-[#C9A96E]">{lifeChronicle.marriageBlueprint.seventhHouseRasiTe}</strong></div>
                <div><span className="text-[#EDE8E0]/60">7వ అధిపతి:</span> <strong className="text-[#5BBFB5]">{lifeChronicle.marriageBlueprint.seventhLordTe} ({lifeChronicle.marriageBlueprint.seventhLordHouse}వ ఇంట)</strong></div>
                <div><span className="text-[#EDE8E0]/60">దారకారకుడు (DK):</span> <strong className="text-[#EDE8E0]">{lifeChronicle.marriageBlueprint.darakarakaPlanetTe}</strong></div>
                <div><span className="text-[#EDE8E0]/60">ఉపపాద లగ్నం (UL):</span> <strong className="text-[#C9A96E]">{lifeChronicle.marriageBlueprint.upapadaLagnaRasiTe}</strong></div>
              </div>
              <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                <strong className="text-[#C9A96E]">భాగస్వామి రూపం & స్వభావం: </strong>
                {lifeChronicle.marriageBlueprint.spouseNatureAndAppearanceTe}
              </p>
              <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                <strong className="text-[#5BBFB5]">కుటుంబ నేపథ్యం, దిక్కు & వివాహ కాలం: </strong>
                {lifeChronicle.marriageBlueprint.spouseCareerAndFamilyTe} {lifeChronicle.marriageBlueprint.marriageDirectionAndTimingTe}
              </p>
            </div>

            <div className="bg-[#0F1326] border border-[#5BBFB5]/45 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5BBFB5] flex items-center gap-2 border-b border-white/10 pb-2.5">
                <Award className="w-4 h-4 text-[#5BBFB5]" />
                ఉద్యోగ, వ్యాపార & ఆర్థిక రాజయోగ బ్లూప్రింట్ (Career & Wealth Blueprint)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#090C18] p-3 rounded border border-white/10">
                <div><span className="text-[#EDE8E0]/60">10వ భావం:</span> <strong className="text-[#C9A96E]">{lifeChronicle.careerWealthBlueprint.tenthHouseRasiTe}</strong></div>
                <div><span className="text-[#EDE8E0]/60">10వ అధిపతి:</span> <strong className="text-[#5BBFB5]">{lifeChronicle.careerWealthBlueprint.tenthLordTe} ({lifeChronicle.careerWealthBlueprint.tenthLordHouse}వ ఇంట)</strong></div>
                <div><span className="text-[#EDE8E0]/60">దశాంశ లగ్నం (D10):</span> <strong className="text-[#EDE8E0]">{lifeChronicle.careerWealthBlueprint.dasamsaLagnaRasiTe}</strong></div>
                <div><span className="text-[#EDE8E0]/60">అమాత్యకారకుడు (AmK):</span> <strong className="text-[#C9A96E]">{lifeChronicle.careerWealthBlueprint.amatyakarakaPlanetTe}</strong></div>
              </div>
              <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                <strong className="text-[#C9A96E]">ఉద్యోగమా? వ్యాపారమా?: </strong>
                {lifeChronicle.careerWealthBlueprint.jobVsBusinessVerdictTe}
              </p>
              <div className="text-xs text-[#EDE8E0]/85">
                <strong className="text-[#5BBFB5]">అనుకూల రంగాలు: </strong>
                {lifeChronicle.careerWealthBlueprint.recommendedSectorsTe.join(' · ')}
              </div>
              <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                <strong className="text-[#C9A96E]">స్థిరాస్తులు & విదేశీ యోగం: </strong>
                {lifeChronicle.careerWealthBlueprint.wealthAndPropertyYogasTe} {lifeChronicle.careerWealthBlueprint.foreignTravelAndSettlementTe}
              </p>
            </div>
          </div>

          {/* 0D. Navagraha 9 Planets Individual Deep Life Predictions */}
          <div className="bg-[#0F1326] border border-[#C9A96E]/45 rounded-xl p-4 sm:p-6 md:p-8 space-y-5">
            <div className="border-b border-white/10 pb-3">
              <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">
                నవగ్రహ వ్యక్తిగత సంపూర్ణ జీవిత ఫలితములు (Astro-Vision 9 Planets Deep Life Predictions)
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#EDE8E0] mt-1">
                ఈ జాతకంలో ప్రతి గ్రహం యొక్క భావాధిపత్యం, నక్షత్ర/సబ్-లార్డ్ స్థితి, వర్గ బలం & జీవిత ఫలితం
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {lifeChronicle.navagrahaLifePredictions.map((gp) => (
                <div
                  key={gp.planetId}
                  className="bg-[#090C18]/90 border border-white/15 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="text-sm sm:text-base font-bold text-[#C9A96E]">
                      {gp.glyph} {gp.planetNameTe} — {gp.houseNumber}వ భావం ({gp.rasiAndDegreeTe}) · {gp.lordshipHousesTe}
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-xs font-bold text-[#5BBFB5]">
                      {gp.functionalRoleTe}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#141932]/75 p-2.5 rounded border border-white/10">
                    <div><span className="text-[#EDE8E0]/60">నక్షత్రం & KP సబ్:</span> <strong className="text-[#EDE8E0]">{gp.nakshatraAndPadaTe} ({gp.kpSubLordTe})</strong></div>
                    <div><span className="text-[#EDE8E0]/60">వర్గ స్థితి:</span> <strong className="text-[#5BBFB5]">D9: {gp.navamsaRasiTe} · D10: {gp.dasamsaRasiTe}</strong></div>
                    <div><span className="text-[#EDE8E0]/60">బల ప్రమాణం:</span> <strong className="text-[#C9A96E]">{gp.shadbalaAndIshtaTe}</strong></div>
                  </div>
                  <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                    <strong className="text-[#C9A96E]">భావ & రాశి ఫలితం: </strong>
                    {gp.positionalPhalamTe}
                  </p>
                  <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                    <strong className="text-[#5BBFB5]">వృత్తి, ధన & దశా ఫలితం: </strong>
                    {gp.careerAndWealthImpactTe} {gp.dashaBhuktiPhalamTe}
                  </p>
                  <div className="text-xs text-[#EDE8E0]/75 border-t border-white/10 pt-2">
                    <strong className="text-[#E8A317]">శాంతి & ఉపాసన: </strong>
                    {gp.specificPariharaTe}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================================== */}
      {/* CHAPTER 0A: 100% KUNDALI SOOKSHMA NADI, 12 BHAVA LORDS, KP 249 SUB-LORD & 18 SOURCES */}
      {/* ==================================================================================== */}
      {showSection('sookshma_nadi_kp') && (
        <div className="space-y-6 print-page-break">
          {/* 1. 12 BHAVA LORDS PLACEMENT MATRIX (BPHS Ch. 24 — ద్వాదశ భావాధిపతుల స్థితి-గతి) */}
          <div className="bg-[#0F1326] border-2 border-[#C9A96E]/55 rounded-xl p-4 sm:p-6 md:p-8 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C9A96E]" />
                  బృహత్ పరాశర హోరా శాస్త్రం (అధ్యాయం 24 — భావాధిపతి ఫలాధ్యాయం)
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#EDE8E0] mt-1">
                  100% కుండలి ప్రకారం ద్వాదశ భావాధిపతుల (1–12 House Lords) స్థితి, నవాంశ & సూక్ష్మ ఫలితాలు
                </h2>
                <p className="text-xs text-[#EDE8E0]/70 mt-1">
                  మీ లగ్నం నుండి 1 నుండి 12 భావాల అధిపతులు ఏ భావంలో ఉన్నారు, వర్గోత్తమ / పుష్కర నవాంశ / వక్ర / మౌఢ్య స్థితి ఏమిటి మరియు దానివల్ల కలిగే ఖచ్చితమైన ఫలితం:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sookshmaNadiReport.bhavaLordPlacements.map((bl) => (
                <div
                  key={bl.houseNumber}
                  className="bg-[#090C18]/90 border border-[#C9A96E]/30 rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-[#C9A96E]">
                        {bl.houseNameTe}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#141932] border border-[#5BBFB5]/40 text-[11px] font-bold text-[#5BBFB5]">
                        రాశి: {bl.signNameTe} · అధిపతి: {bl.lordNameTe}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[#C9A96E] font-bold">
                        స్థితి: {bl.placedInHouse}వ భావం ({bl.placedInSignNameTe})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-[#EDE8E0]">
                        D9 నవాంశ: {bl.navamsaSignNameTe}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[#EDE8E0]/80">
                        {bl.dignityTe}
                      </span>
                      {bl.isVargottama && (
                        <span className="px-2 py-0.5 rounded bg-[#5BBFB5] text-[#090C18] font-bold">
                          ★ వర్గోత్తమం
                        </span>
                      )}
                      {bl.isPushkaraNavamsa && (
                        <span className="px-2 py-0.5 rounded bg-[#9B8FD4]/25 text-[#9B8FD4] font-bold">
                          ✦ పుష్కర నవాంశ
                        </span>
                      )}
                      {bl.isRetrograde && (
                        <span className="px-2 py-0.5 rounded bg-[#E8A317]/20 text-[#E8A317] font-bold">
                          వక్రం (Rx)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#EDE8E0]/90 leading-relaxed">
                      {bl.deepVivaranaTe}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[11px] text-[#5BBFB5] font-semibold">
                    💡 సూచన: {bl.actionableAdviceTe}
                  </div>
                </div>
              ))}
            </div>

            {/* Parivartana Yogas & Multi-Planet Conjunctions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3">
              <div className="bg-[#090C18] border border-[#5BBFB5]/40 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-[#5BBFB5] uppercase tracking-wider">
                  రాశి పరివర్తన యోగాలు (Mutual Sign Exchanges in Your Kundali)
                </div>
                {sookshmaNadiReport.parivartanaYogas.length > 0 ? (
                  <div className="space-y-2.5">
                    {sookshmaNadiReport.parivartanaYogas.map((pv, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#141932] border border-[#5BBFB5]/30 text-xs space-y-1">
                        <div className="font-bold text-[#C9A96E]">{pv.typeTe} ({pv.house1}వ ↔ {pv.house2}వ భావం)</div>
                        <p className="text-[#EDE8E0]/85">{pv.descriptionTe}</p>
                        <p className="text-[#5BBFB5] font-semibold">{pv.effectTe}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#EDE8E0]/75 leading-relaxed">
                    మీ కుండలిలో ప్రత్యక్ష రాశి పరివర్తన (Mutual Exchange) లేదు — గ్రహాలు తమ స్వంత భావ మరియు దృష్టి బలాలతో స్వతంత్రంగా ఫలితాలను ఇస్తాయి.
                  </p>
                )}
              </div>

              <div className="bg-[#090C18] border border-[#C9A96E]/40 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider">
                  గ్రహ యుతులు (Conjunctions), వర్గోత్తమ & వక్ర గ్రహ విశేషాలు
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {sookshmaNadiReport.conjunctionsAndSpecialStates.map((cj, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#141932] border border-white/10 text-xs space-y-1">
                      <div className="font-bold text-[#C9A96E]">{cj.titleTe}</div>
                      <div className="text-[10px] text-[#5BBFB5] font-semibold">{cj.shastraSourceTe}</div>
                      <p className="text-[#EDE8E0]/85 leading-relaxed">{cj.vivaranaTe}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. KP SYSTEM (KRISHNAMURTI PADDHATI — 249 SUB-LORD & CUSPAL SIGNIFICATORS) */}
          <div className="bg-[#0F1326] border-2 border-[#5BBFB5]/50 rounded-xl p-4 sm:p-6 md:p-8 space-y-5 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <div className="text-xs uppercase tracking-widest text-[#5BBFB5] font-semibold">
                కృష్ణమూర్తి పద్ధతి (KP Astrology — 249 Sub-Lord & Cuspal Significators)
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#EDE8E0] mt-1">
                12 భావ కస్ప్‌ల నక్షత్రాధిపతి (Star Lord) & ఉపనక్షత్రాధిపతి (Sub-Lord) ఖచ్చితమైన నిర్ధారణ
              </h3>
              <p className="text-xs text-[#EDE8E0]/70 mt-1">
                ఒకే రాశిలో పుట్టినప్పటికీ నిమిషాల తేడాతో జాతక ఫలితాలను మార్చే KP సబ్-లార్డ్ (ఉపనక్షత్రాధిపతి) మరియు అది సూచించే భావ కారకత్వాలు:
              </p>
            </div>

            {/* 6 Key Life Event Verdicts from KP Cusps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {sookshmaNadiReport.kpLifeEventVerdicts.map((ev, idx) => (
                <div
                  key={idx}
                  className="bg-[#090C18]/90 border border-[#5BBFB5]/35 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#C9A96E]">{ev.domainTe}</span>
                  </div>
                  <div className="text-[11px] text-[#5BBFB5] font-mono-tabular font-semibold">
                    {ev.primaryCusp}వ కస్ప్ సబ్-లార్డ్: {ev.cuspSubLordTe}
                  </div>
                  <div className="text-[10px] text-[#EDE8E0]/65">
                    అనుకూల భావాలు: {ev.favorableHouses}
                  </div>
                  <p className="text-xs text-[#EDE8E0]/90 leading-relaxed pt-1 border-t border-white/10">
                    {ev.verdictTe}
                  </p>
                </div>
              ))}
            </div>

            {/* 12 Cusps Table */}
            <div className="overflow-x-auto border border-white/15 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#141932] text-[#C9A96E] border-b border-white/15">
                    <th className="py-2.5 px-3">భావ కస్ప్ (Cusp)</th>
                    <th className="py-2.5 px-3">రాశి & డిగ్రీ</th>
                    <th className="py-2.5 px-3">రాశ్యాధిపతి</th>
                    <th className="py-2.5 px-3">నక్షత్రం & స్టార్ లార్డ్</th>
                    <th className="py-2.5 px-3">KP సబ్-లార్డ్ (Sub-Lord)</th>
                    <th className="py-2.5 px-3">సూచించే భావాలు (Signified Houses)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-[#090C18]/85">
                  {sookshmaNadiReport.kpSubLordTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-2 px-3 font-bold text-[#EDE8E0]">{row.entityTitleTe}</td>
                      <td className="py-2 px-3 font-mono-tabular text-[#EDE8E0]/80">
                        {row.rasiNameTe} ({row.degreeFormatted})
                      </td>
                      <td className="py-2 px-3 text-[#C9A96E] font-semibold">{row.rasiLordTe}</td>
                      <td className="py-2 px-3 text-[#EDE8E0]/85">
                        {row.nakshatraNameTe} ({row.starLordTe})
                      </td>
                      <td className="py-2 px-3 font-bold text-[#5BBFB5]">{row.subLordTe}</td>
                      <td className="py-2 px-3 font-mono-tabular text-[#C9A96E]">
                        [{row.signifiedHouses.join(', ')}]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. BHRIGU NANDI NADI & GENDER-SPECIFIC + BADHAKA/MARAKA DIAGNOSTIC */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bhrigu Nandi Nadi 7 cols */}
            <div className="lg:col-span-7 bg-[#0F1326] border border-[#C9A96E]/45 rounded-xl p-5 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
                  భృగు నంది నాడి & చంద్రకళా నాడి (Bhrigu Nandi Nadi Trine Planetary Links)
                </div>
                <h3 className="text-lg font-bold text-[#EDE8E0] mt-1">
                  జీవ (గురు), కర్మ (శని) & ధన-కళత్ర (శుక్ర) నాడి త్రికోణ సంబంధాలు
                </h3>
              </div>

              <div className="space-y-3.5">
                {sookshmaNadiReport.bhriguNandiNadiReadings.map((nadi, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#090C18]/90 border border-white/10 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#C9A96E]">
                        {nadi.karakaTitleTe}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[#141932] text-[11px] font-bold text-[#5BBFB5]">
                        {nadi.focalPlanetTe}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#EDE8E0]/70">
                      త్రికోణ (1-5-9) సంబంధ గ్రహాలు:{' '}
                      <strong className="text-[#EDE8E0]">
                        {nadi.trineConnectedPlanetsTe.length > 0
                          ? nadi.trineConnectedPlanetsTe.join(', ')
                          : 'స్వతంత్ర స్థితి (Unconjoined Trine)'}
                      </strong>{' '}
                      | 2–12 దిశా గ్రహాలు:{' '}
                      <strong className="text-[#C9A96E]">
                        {nadi.secondTwelfthPlanetsTe.length > 0
                          ? nadi.secondTwelfthPlanetsTe.join(', ')
                          : 'లేవు'}
                      </strong>
                    </div>
                    <p className="text-xs text-[#EDE8E0]/90 leading-relaxed">
                      {nadi.nadiPredictionTe}
                    </p>
                    <div className="text-[11px] text-[#5BBFB5] font-semibold">
                      ⏱️ ఫల కాల సూచన: {nadi.timingClueTe}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Specific Shastra + Badhaka/Maraka 5 cols */}
            <div className="lg:col-span-5 space-y-5">
              {/* Gender Specific */}
              <div className="bg-[#0F1326] border border-[#5BBFB5]/45 rounded-xl p-5 space-y-3.5">
                <div className="border-b border-white/10 pb-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#5BBFB5]">
                    {sookshmaNadiReport.genderSpecificShastraAnalysis.sourceTe}
                  </div>
                  <h3 className="text-base font-bold text-[#EDE8E0] mt-0.5">
                    {sookshmaNadiReport.genderSpecificShastraAnalysis.titleTe}
                  </h3>
                </div>
                <div className="space-y-3">
                  {sookshmaNadiReport.genderSpecificShastraAnalysis.pillars.map((pil, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#090C18]/90 border border-white/10 text-xs space-y-1">
                      <div className="font-bold text-[#C9A96E]">{pil.headingTe}</div>
                      <p className="text-[#EDE8E0]/85 leading-relaxed">{pil.analysisTe}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badhaka & Maraka Diagnostic */}
              <div className="bg-[#0F1326] border border-[#E8A317]/45 rounded-xl p-5 space-y-3">
                <div className="border-b border-white/10 pb-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8A317]">
                    ప్రశ్న మార్గం & పరాశర రహస్య పరీక్ష (Badhaka & Maraka Diagnostic)
                  </div>
                  <h3 className="text-base font-bold text-[#EDE8E0] mt-0.5">
                    బాధకాధిపతి & మారకాధిపతి రహస్య ఆటంకాల నివారణ
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-[#090C18]/90 border border-[#E8A317]/30 text-xs space-y-1.5">
                  <div className="font-bold text-[#C9A96E]">
                    {sookshmaNadiReport.badhakaMarakaDiagnostic.lagnaModalityTe}
                  </div>
                  <p className="text-[#EDE8E0]/85 leading-relaxed">
                    {sookshmaNadiReport.badhakaMarakaDiagnostic.badhakaImpactTe}
                  </p>
                  <p className="text-[#5BBFB5] font-semibold">
                    🛡️ పరిహారం: {sookshmaNadiReport.badhakaMarakaDiagnostic.badhakaRemedyTe}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#090C18]/90 border border-white/10 text-xs space-y-1">
                  <div className="font-bold text-[#D47B7B]">
                    మారక స్థానాలు (2, 7): {sookshmaNadiReport.badhakaMarakaDiagnostic.marakaLordsTe.join(' & ')}
                  </div>
                  <p className="text-[#EDE8E0]/80 leading-relaxed">
                    {sookshmaNadiReport.badhakaMarakaDiagnostic.marakaCautionTe}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 18 CLASSICAL & MODERN JYOTISHA SOURCES ENCYCLOPEDIA */}
          <div className="bg-[#0F1326] border-2 border-[#C9A96E]/60 rounded-xl p-4 sm:p-6 md:p-8 space-y-5 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C9A96E]" />
                సంపూర్ణ జ్యోతిష్య మూల గ్రంథాల ప్రమాణ దర్శిని (18 Supreme Classical & Nadi/KP Sources)
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#EDE8E0] mt-1">
                మీ కుండలి విశ్లేషణకు ఉపయోగించిన 18 ప్రాచీన & ఆధునిక జ్యోతిష్య సిద్ధాంత గ్రంథాలు
              </h2>
              <p className="text-xs text-[#EDE8E0]/75 mt-1">
                ఏ ఒక్క కోణాన్నీ వదిలిపెట్టకుండా పరాశర, జైమిని, సూర్య సిద్ధాంతం, భృగు నంది నాడి, కృష్ణమూర్తి పద్ధతి (KP), తాజిక వర్షఫల, అష్టకవర్గ మరియు ప్రశ్న మార్గ గ్రంథాల నుండి మీ కుండలిలో నిర్ధారించిన అంశాలు:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sookshmaNadiReport.eighteenClassicalSources.map((src) => (
                <div
                  key={src.id}
                  className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-xl p-4 flex flex-col justify-between space-y-2.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#C9A96E] text-[#090C18] text-[10px] font-extrabold">
                        గ్రంథం #{src.number}
                      </span>
                      <span className="text-[10px] font-semibold text-[#5BBFB5]">
                        {src.branchTe}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#EDE8E0] pt-0.5">
                      {src.titleTe}
                    </h4>
                    <div className="text-[11px] text-[#C9A96E] font-semibold">
                      కర్త: {src.authorAndEraTe}
                    </div>
                    <p className="text-xs text-[#EDE8E0]/80 leading-relaxed">
                      <strong className="text-[#EDE8E0]">శాస్త్ర పరిధి: </strong>
                      {src.whatItAnalyzesInYourChartTe}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-white/10 text-[11px] text-[#5BBFB5] leading-relaxed">
                    <strong className="text-[#C9A96E]">మీ కుండలి నిర్ధారణ: </strong>
                    {src.yourChartSpecificFindingTe}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIDDHANTA MATHEMATICAL VERIFICATION, BHAVA CHALIT, PANCHADHA MAITRI & AVASTHA SECTION */}
      {showSection('siddhanta_verifications') && (
        <div className="space-y-6 print-page-break">
          {/* 1. 8-Point Siddhanta Mathematical & Panchanga Audit */}
          <div className="bg-[#0F1326] border-2 border-[#5BBFB5]/45 rounded-lg p-4 sm:p-6 md:p-8 space-y-5 print-avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#5BBFB5] font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBFB5]" />
                  సిద్ధాంత గణిత & శాస్త్ర ప్రమాణ తనిఖీ (100% Pin-to-Pin Siddhanta Verification Audit)
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#EDE8E0] mt-1">
                  అయనాంశ, LMT రేఖాంశ సవరణ, సూర్యోదయాది వారం, దశా నిల్వ, గండంతర, పుష్కర నవాంశ & చలిత తనిఖీ
                </h2>
              </div>
              <span className="px-3 py-1 rounded bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-xs font-bold text-[#5BBFB5]">
                దృగ్గణిత తనిఖీ: ఉత్తీర్ణం (Verified)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verificationReport.siddhantaAuditPoints.map((audit) => (
                <div
                  key={audit.id}
                  className="bg-[#090C18]/90 border border-white/15 rounded-lg p-4 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#C9A96E]">
                        {audit.number} · {audit.titleTe}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          audit.status === 'special_yoga'
                            ? 'bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40'
                            : audit.status === 'caution'
                              ? 'bg-[#E0A96D]/20 text-[#E0A96D] border border-[#E0A96D]/40'
                              : 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                        }`}
                      >
                        {audit.statusBadgeTe}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[#EDE8E0]/65">
                      {audit.formulaOrRuleTe}
                    </div>
                    <div className="text-xs font-bold text-[#5BBFB5] bg-[#141932] px-2.5 py-1.5 rounded border border-white/10">
                      {audit.calculatedValueTe}
                    </div>
                  </div>
                  <p className="text-xs text-[#EDE8E0]/85 leading-relaxed pt-1">
                    {audit.deepExplanationTe}
                  </p>
                </div>
              ))}
            </div>

            {/* Jaimini Karakamsha & Ishta-Palana-Dharma Devata Nirnaya */}
            <div className="bg-gradient-to-r from-[#141932] to-[#090C18] border border-[#C9A96E]/45 rounded-lg p-5 space-y-3">
              <div className="text-sm font-bold text-[#C9A96E]">
                మహర్షి జైమిని కారకాంశ లగ్నం — ఇష్ట దేవత, పాలన దేవత & ధర్మ దేవతా నిర్ణయం:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded bg-[#0F1326] border border-white/10">
                  <span className="text-[#EDE8E0]/60 block text-[11px]">
                    1. ఇష్ట దేవత (మోక్ష & మంత్ర సిద్ధి):
                  </span>
                  <strong className="text-[#5BBFB5] block mt-0.5">
                    {verificationReport.jaiminiDevataNirnaya.ishtaDevataTe}
                  </strong>
                  <span className="text-[#C9A96E] block mt-1 text-[11px]">
                    మంత్రం: {verificationReport.jaiminiDevataNirnaya.ishtaMantraTe}
                  </span>
                </div>
                <div className="p-3 rounded bg-[#0F1326] border border-white/10">
                  <span className="text-[#EDE8E0]/60 block text-[11px]">
                    2. పాలన దేవత (జీవనోపాధి, ధన & కుటుంబ రక్షణ):
                  </span>
                  <strong className="text-[#C9A96E] block mt-0.5">
                    {verificationReport.jaiminiDevataNirnaya.palanaDevataTe}
                  </strong>
                  <span className="text-[#EDE8E0]/75 block mt-1 text-[11px]">
                    అమాత్యకారకుడు: {verificationReport.jaiminiDevataNirnaya.amatyakarakaTe}
                  </span>
                </div>
                <div className="p-3 rounded bg-[#0F1326] border border-white/10">
                  <span className="text-[#EDE8E0]/60 block text-[11px]">
                    3. గురు / ధర్మ దేవత (భాగ్య వృద్ధి):
                  </span>
                  <strong className="text-[#EDE8E0] block mt-0.5">
                    {verificationReport.jaiminiDevataNirnaya.dharmaDevataTe}
                  </strong>
                  <span className="text-[#5BBFB5] block mt-1 text-[11px]">
                    కారకాంశ రాశి: {verificationReport.jaiminiDevataNirnaya.karakamshaRasiTe}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                {verificationReport.jaiminiDevataNirnaya.spiritualPathAnalysisTe}
              </p>
            </div>
          </div>

          {/* 2. Sripati Bhava Chalit (భావ చలిత స్ఫుట పట్టిక) & Panchadha Maitri Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sripati Bhava Chalit 12-Bhava Sphuta Table */}
            <div className="lg:col-span-7 bg-[#0F1326] border border-white/15 rounded-lg p-4 sm:p-6 print-avoid-break">
              <h3 className="text-lg font-bold text-[#C9A96E] border-b border-white/10 pb-2.5 mb-3">
                శ్రీపతి భావ చలిత చక్రం — ద్వాదశ భావ ఆరంభ, మధ్య, అంత్య స్ఫుటములు
              </h3>
              <p className="text-xs text-[#EDE8E0]/70 mb-3">
                లగ్న స్ఫుటం మరియు దశమ స్ఫుటం (MC) ఆధారంగా గణించిన 12 భావ సంధులు మరియు రాశి-చలిత గ్రహ స్థితి పోలిక:
              </p>
              <div className="overflow-x-auto border border-white/10 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#090C18] border-b border-white/10 text-[#C9A96E]">
                      <th className="py-2 px-2.5">భావం</th>
                      <th className="py-2 px-2.5">భావ ఆరంభ సంధి</th>
                      <th className="py-2 px-2.5">భావ మధ్య స్ఫుటం</th>
                      <th className="py-2 px-2.5">రాశి గ్రహాలు</th>
                      <th className="py-2 px-2.5">చలిత భావ గ్రహాలు</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono-tabular">
                    {verificationReport.bhavaChalitaTable.map((row) => (
                      <tr key={row.bhavaNumber} className="hover:bg-white/5">
                        <td className="py-2 px-2.5 font-sans font-bold text-[#EDE8E0]">
                          {row.bhavaNameTe}
                        </td>
                        <td className="py-2 px-2.5 text-[#EDE8E0]/75">{row.arambhaDMS}</td>
                        <td className="py-2 px-2.5 text-[#C9A96E] font-semibold">{row.madhyaDMS}</td>
                        <td className="py-2 px-2.5 font-sans text-[#EDE8E0]/85">
                          {row.rasiPlanetsTe.length > 0 ? row.rasiPlanetsTe.join(', ') : '—'}
                        </td>
                        <td className="py-2 px-2.5 font-sans font-semibold text-[#5BBFB5]">
                          {row.chalitaPlanetsTe.length > 0 ? row.chalitaPlanetsTe.join(', ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panchadha Maitri 5-Fold Compound Relationship Matrix */}
            <div className="lg:col-span-5 bg-[#0F1326] border border-white/15 rounded-lg p-4 sm:p-6 print-avoid-break">
              <h3 className="text-lg font-bold text-[#C9A96E] border-b border-white/10 pb-2.5 mb-3">
                పంచధా మైత్రి చక్రం (నైసర్గిక + తత్కాలిక మైత్రి)
              </h3>
              <p className="text-xs text-[#EDE8E0]/70 mb-3">
                ప్రతి గ్రహానికి తన రాశ్యాధిపతితో గల నైసర్గిక మరియు తత్కాలిక మైత్రి కలయిక (అధిమిత్ర / మిత్ర / సమ / శత్రు / అధిశత్రు):
              </p>
              <div className="overflow-x-auto border border-white/10 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#090C18] border-b border-white/10 text-[#C9A96E]">
                      <th className="py-2 px-2.5">గ్రహం (రాశి)</th>
                      <th className="py-2 px-2.5">రాశ్యాధిపతి</th>
                      <th className="py-2 px-2.5">నైసర్గిక + తత్కాలిక</th>
                      <th className="py-2 px-2.5">పంచధా మైత్రి</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {verificationReport.panchadhaMaitriMatrix.map((pm) => (
                      <tr key={pm.planetId} className="hover:bg-white/5">
                        <td className="py-2.5 px-2.5 font-bold text-[#EDE8E0]">
                          {pm.planetNameTe.split(' ')[0]}
                          <span className="block text-[10px] text-[#EDE8E0]/60 font-normal">
                            ({pm.placedRasiTe})
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-[#C9A96E] font-semibold">
                          {pm.rasiLordTe}
                        </td>
                        <td className="py-2.5 px-2.5 text-[11px] text-[#EDE8E0]/80">
                          {pm.naisargikaWithLordTe} + {pm.tatkalikaWithLordTe}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold">
                          <span
                            className={
                              pm.panchadhaWithLordTe.startsWith('అధిమిత్ర') ||
                              pm.panchadhaWithLordTe.startsWith('మిత్ర')
                                ? 'text-[#5BBFB5]'
                                : pm.panchadhaWithLordTe.startsWith('సమ')
                                  ? 'text-[#C9A96E]'
                                  : 'text-[#D47B7B]'
                            }
                          >
                            {pm.panchadhaWithLordTe.split(' (')[0]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. Navagraha Tri-Vidha Avastha & Pushkara Navamsha Table */}
          <div className="bg-[#0F1326] border border-white/15 rounded-lg p-4 sm:p-6 print-avoid-break">
            <h3 className="text-lg font-bold text-[#C9A96E] border-b border-white/10 pb-2.5 mb-3">
              నవగ్రహ త్రివిధ అవస్థల పట్టిక (బాలాది · జాగ్రదాది · దీప్తాది అవస్థలు & పుష్కర నవాంశ)
            </h3>
            <div className="overflow-x-auto border border-white/10 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#090C18] border-b border-white/10 text-[#C9A96E]">
                    <th className="py-2.5 px-3">గ్రహం & స్ఫుటం</th>
                    <th className="py-2.5 px-3">బాలాది అవస్థ</th>
                    <th className="py-2.5 px-3">జాగ్రదాది అవస్థ</th>
                    <th className="py-2.5 px-3">దీప్తాది అవస్థ</th>
                    <th className="py-2.5 px-3">పుష్కర నవాంశ</th>
                    <th className="py-2.5 px-3">ఫలిత నిర్ధారణ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verificationReport.triVidhaAvasthas.map((av) => (
                    <tr key={av.planetId} className="hover:bg-white/5">
                      <td className="py-2.5 px-3 font-bold text-[#EDE8E0]">
                        {av.planetNameTe.split(' ')[0]}
                        <span className="block text-[10px] font-mono-tabular text-[#C9A96E] font-normal">
                          {av.rasiAndDegreeTe}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#EDE8E0]/90 font-semibold">
                        {av.baladiAvasthaTe}
                      </td>
                      <td className="py-2.5 px-3 text-[#5BBFB5]">{av.jagradadiAvasthaTe}</td>
                      <td className="py-2.5 px-3 text-[#C9A96E]">{av.deeptadiAvasthaTe}</td>
                      <td className="py-2.5 px-3">
                        {av.isPushkaraNavamsa ? (
                          <span className="px-2 py-0.5 rounded bg-[#5BBFB5]/20 text-[#5BBFB5] font-bold">
                            పుష్కర నవాంశ ★
                          </span>
                        ) : (
                          <span className="text-[#EDE8E0]/50">సాధారణ</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[#EDE8E0]/85 leading-relaxed">
                        {av.overallEffectTe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. ASTRO-VISION STYLE NIRAYANA SPASHTA GRAHA SPHUTAM & KP SUB-LORD TABLE */}
          <div className="bg-[#0F1326] border border-[#C9A96E]/45 rounded-lg p-5 sm:p-6 overflow-x-auto print-avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#C9A96E]">
                  నిరయన స్పష్ట గ్రహ స్ఫుటములు & KP ఉపనక్షత్రాధిపతి పట్టిక (Nirayana Planetary Longitudes & Sub-Lords)
                </h3>
                <p className="text-xs text-[#EDE8E0]/65 mt-0.5">
                  కలిదిన సంఖ్య: <strong className="text-[#5BBFB5]">{astroVisionReport.kaliDinaSankhya}</strong> · జూలియన్ డే: <strong className="text-[#C9A96E]">{chart.julianDay.toFixed(4)}</strong> · పగటి ప్రమాణం (దినమానం): <strong className="text-[#EDE8E0]">{astroVisionReport.dinamanaHoursTe}</strong> · రాత్రి ప్రమాణం: <strong className="text-[#EDE8E0]">{astroVisionReport.ratrimanaHoursTe}</strong>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/35 text-xs font-bold">
                Astro-Vision Sphuta Standard
              </span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/15 text-[#C9A96E] bg-[#090C18]/90">
                  <th className="py-2.5 px-3">గ్రహం (Body)</th>
                  <th className="py-2.5 px-3">రాశి (Sign)</th>
                  <th className="py-2.5 px-3">రాశిలో డిగ్రీ (DMS)</th>
                  <th className="py-2.5 px-3">పూర్తి స్ఫుటం (0°–360°)</th>
                  <th className="py-2.5 px-3">నక్షత్రం & పాదం</th>
                  <th className="py-2.5 px-3">రాశ్యాధిపతి</th>
                  <th className="py-2.5 px-3">నక్షత్రాధిపతి (Star Lord)</th>
                  <th className="py-2.5 px-3">ఉపనక్షత్రాధిపతి (Sub Lord)</th>
                  <th className="py-2.5 px-3">ప్రాణ నాథుడు (Sub-Sub)</th>
                  <th className="py-2.5 px-3">భావం & గమనం</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {astroVisionReport.nirayanaSphutaTable.map((row) => (
                  <tr key={row.bodyId} className="bg-[#090C18]/50 hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-bold text-[#EDE8E0]">
                      {row.glyph} {row.bodyNameTe}
                    </td>
                    <td className="py-2.5 px-3 text-[#C9A96E] font-semibold">
                      {row.rasiNameTe}
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular font-bold text-[#EDE8E0]">
                      {row.degreeInSignDMS}
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular text-[#EDE8E0]/75">
                      {row.absoluteSiderealDMS}
                    </td>
                    <td className="py-2.5 px-3 text-[#5BBFB5] font-semibold">
                      {row.nakshatraNameTe} ({row.pada}వ పాదం)
                    </td>
                    <td className="py-2.5 px-3 text-[#EDE8E0]/85">{row.rasiLordTe}</td>
                    <td className="py-2.5 px-3 font-bold text-[#C9A96E]">
                      {row.nakshatraLordTe}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#5BBFB5]">
                      {row.subLordTe}
                    </td>
                    <td className="py-2.5 px-3 text-[#9B8FD4] font-semibold">
                      {row.subSubLordTe}
                    </td>
                    <td className="py-2.5 px-3 text-[#EDE8E0]/80">
                      {row.houseNumber}వ భావం · {row.motionStatusTe}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 6. ASTRO-VISION FAVORABLE POINTS (అదృష్ట సూచికల పట్టిక) & PAPA SAMYAM (పాప సామ్య పట్టిక) SIDE-BY-SIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-avoid-break">
            {/* Left: Astro-Vision Favorable Points & Numerology Table */}
            <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-lg p-5 sm:p-6 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-[#C9A96E]">
                  అదృష్ట సూచికల పట్టిక & సంఖ్యాశాస్త్రం (Astro-Vision Favorable Points & Numerology)
                </h3>
                <p className="text-xs text-[#EDE8E0]/65 mt-0.5">
                  జన్మ తేదీ సంఖ్యాశాస్త్రం, లగ్న-పంచమ-భాగ్యాధిపతుల ఆధారంగా అదృష్ట రత్న, సంఖ్య, వారం & రంగుల నిర్ణయం:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded bg-[#090C18]/80 border border-[#C9A96E]/35">
                  <div className="text-[10px] text-[#EDE8E0]/55">జన్మ సంఖ్య (Psychic Number)</div>
                  <div className="text-base font-bold text-[#C9A96E] mt-0.5">
                    సంఖ్య {astroVisionReport.adrushtaSoochika.janmaSankhya}
                  </div>
                  <div className="text-[11px] text-[#EDE8E0]/80 mt-0.5">
                    {astroVisionReport.adrushtaSoochika.janmaSankhyaPlanetTe}
                  </div>
                </div>

                <div className="p-3 rounded bg-[#090C18]/80 border border-[#5BBFB5]/35">
                  <div className="text-[10px] text-[#EDE8E0]/55">భాగ్యాంకం (Destiny Number)</div>
                  <div className="text-base font-bold text-[#5BBFB5] mt-0.5">
                    సంఖ్య {astroVisionReport.adrushtaSoochika.bhagyaSankhya}
                  </div>
                  <div className="text-[11px] text-[#EDE8E0]/80 mt-0.5">
                    {astroVisionReport.adrushtaSoochika.bhagyaSankhyaPlanetTe}
                  </div>
                </div>
              </div>

              <dl className="divide-y divide-white/10 text-xs">
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">అదృష్ట సంఖ్యలు (Lucky Numbers):</dt>
                  <dd className="font-bold text-[#C9A96E] text-right font-mono-tabular">
                    {astroVisionReport.adrushtaSoochika.luckyNumbers}
                  </dd>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">మిత్ర సంఖ్యలు / నిషిద్ధ సంఖ్యలు:</dt>
                  <dd className="font-semibold text-[#EDE8E0] text-right font-mono-tabular">
                    మిత్ర: {astroVisionReport.adrushtaSoochika.friendlyNumbers} · నివారణ: {astroVisionReport.adrushtaSoochika.avoidNumbers}
                  </dd>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">జీవిత రత్నం (Life Stone - 1st):</dt>
                  <dd className="font-bold text-[#5BBFB5] text-right">
                    {astroVisionReport.adrushtaSoochika.lifeGemstoneTe}
                  </dd>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">అదృష్ట రత్నం (Lucky Stone - 5th):</dt>
                  <dd className="font-bold text-[#C9A96E] text-right">
                    {astroVisionReport.adrushtaSoochika.beneficGemstoneTe}
                  </dd>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">భాగ్య రత్నం (Fortune Stone - 9th):</dt>
                  <dd className="font-bold text-[#9B8FD4] text-right">
                    {astroVisionReport.adrushtaSoochika.fortuneGemstoneTe}
                  </dd>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">అనుకూల వారములు (Lucky Days):</dt>
                  <dd className="font-semibold text-[#EDE8E0] text-right">
                    {astroVisionReport.adrushtaSoochika.luckyDaysTe}
                  </dd>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">అదృష్ట రంగులు (Lucky Colors):</dt>
                  <dd className="font-semibold text-[#EDE8E0] text-right">
                    {astroVisionReport.adrushtaSoochika.luckyColorsTe}
                  </dd>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">అనుకూల దిశ & లోహం:</dt>
                  <dd className="font-semibold text-[#C9A96E] text-right">
                    {astroVisionReport.adrushtaSoochika.favorableDirectionTe} · {astroVisionReport.adrushtaSoochika.favorableMetalTe}
                  </dd>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-[#EDE8E0]/60">వివాహ / వ్యాపార మిత్ర రాశులు:</dt>
                  <dd className="font-bold text-[#5BBFB5] text-right">
                    {astroVisionReport.adrushtaSoochika.compatibleRasisTe}
                  </dd>
                </div>
              </dl>

              <p className="text-xs text-[#EDE8E0]/80 leading-relaxed p-3 rounded bg-[#090C18]/80 border border-white/10">
                {astroVisionReport.adrushtaSoochika.numerologySynthesisTe}
              </p>
            </div>

            {/* Right: Astro-Vision Papa Samyam (Dosha Samya Point Table) */}
            <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-lg p-5 sm:p-6 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-[#C9A96E]">
                  పాప సామ్య పట్టిక — కుజ & పాపగ్రహ దోష పాయింట్లు (Astro-Vision Papa Samyam Table)
                </h3>
                <p className="text-xs text-[#EDE8E0]/65 mt-0.5">
                  వివాహ పొంతన కోసం లగ్నం, చంద్రుడు మరియు శుక్రుని నుండి 1, 2, 4, 7, 8, 12 స్థానములలో పాపగ్రహ పాయింట్ల గణన:
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#090C18] text-[#C9A96E] border-b border-white/15">
                      <th className="py-2 px-2.5">పాప గ్రహం</th>
                      <th className="py-2 px-2.5 text-center">లగ్నం నుండి (భావం / పాయింట్లు)</th>
                      <th className="py-2 px-2.5 text-center">చంద్రుని నుండి (భావం / పాయింట్లు)</th>
                      <th className="py-2 px-2.5 text-center">శుక్రుని నుండి (భావం / పాయింట్లు)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {astroVisionReport.papaSamyam.rows.map((r) => (
                      <tr key={r.planetId} className="bg-[#090C18]/50">
                        <td className="py-2 px-2.5 font-bold text-[#EDE8E0]">
                          {r.planetNameTe}
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono-tabular">
                          <span className="text-[#EDE8E0]/65">{r.fromLagnaHouse}వ భావం</span> →{' '}
                          <strong className={r.fromLagnaPoints > 0 ? 'text-[#D47B7B]' : 'text-[#5BBFB5]'}>
                            {r.fromLagnaPoints}
                          </strong>
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono-tabular">
                          <span className="text-[#EDE8E0]/65">{r.fromMoonHouse}వ భావం</span> →{' '}
                          <strong className={r.fromMoonPoints > 0 ? 'text-[#E0A96D]' : 'text-[#5BBFB5]'}>
                            {r.fromMoonPoints}
                          </strong>
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono-tabular">
                          <span className="text-[#EDE8E0]/65">{r.fromVenusHouse}వ భావం</span> →{' '}
                          <strong className={r.fromVenusPoints > 0 ? 'text-[#C9A96E]' : 'text-[#5BBFB5]'}>
                            {r.fromVenusPoints}
                          </strong>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#141932] font-bold text-[#C9A96E]">
                      <td className="py-2.5 px-2.5">మొత్తం పాప పాయింట్లు</td>
                      <td className="py-2.5 px-2.5 text-center font-mono-tabular">
                        {astroVisionReport.papaSamyam.totalFromLagna}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono-tabular">
                        {astroVisionReport.papaSamyam.totalFromMoon}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono-tabular">
                        {astroVisionReport.papaSamyam.totalFromVenus}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded bg-[#090C18]/90 border border-[#C9A96E]/35">
                  <strong className="text-[#C9A96E]">కుజ దోష సమగ్ర నిర్ధారణ: </strong>
                  <span className="text-[#EDE8E0]/90">
                    {astroVisionReport.papaSamyam.kujaDoshaStatusTe}
                  </span>
                </div>
                <div className="p-3 rounded bg-[#090C18]/90 border border-[#5BBFB5]/35">
                  <strong className="text-[#5BBFB5]">వివాహ పాప సామ్య తీర్పు: </strong>
                  <span className="text-[#EDE8E0]/90">
                    {astroVisionReport.papaSamyam.marriageMatchingVerdictTe}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. ASTRO-VISION COMPLETE LIFETIME SADE SATI (ఏలినాటి శని 3 విడతలు - 9 పాదాలు) TABLE */}
          <div className="bg-[#0F1326] border border-white/15 rounded-lg p-5 sm:p-6 overflow-x-auto print-avoid-break">
            <div className="border-b border-white/10 pb-3 mb-4">
              <h3 className="text-lg font-bold text-[#C9A96E]">
                ఏలినాటి శని 3 విడతల (9 పాదాల) జీవితకాల పట్టిక & దశా-గోచార సంగమ ఫలితాలు (Lifetime Sade Sati Report)
              </h3>
              <p className="text-xs text-[#EDE8E0]/65 mt-0.5">
                జన్మ చంద్ర రాశి కి 12వ (ఆరంభ), 1వ (జన్మ), 2వ (అంత్య) స్థానములలో శని సంచరించే 7½ సంవత్సరాల మూడు జీవిత చక్రాల పూర్తి తేదీలు & సమకాలీన దశా-భుక్తులు:
              </p>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/15 text-[#C9A96E] bg-[#090C18]/90">
                  <th className="py-2.5 px-3">విడత (Cycle)</th>
                  <th className="py-2.5 px-3">ఏలినాటి శని పాదం</th>
                  <th className="py-2.5 px-3">శని సంచార రాశి</th>
                  <th className="py-2.5 px-3">ప్రారంభం → ముగింపు</th>
                  <th className="py-2.5 px-3">వయస్సు</th>
                  <th className="py-2.5 px-3">నడిచే మహాదశ - భుక్తి</th>
                  <th className="py-2.5 px-3">ప్రభావ భాగం & శాంతి పరిహారం</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {astroVisionReport.sadeSatiPhases.map((row, idx) => (
                  <tr
                    key={`interactive-sadesati-${row.cycleNumber}-${idx}`}
                    className={
                      row.isCurrent
                        ? 'bg-[#D47B7B]/20 font-semibold'
                        : 'bg-[#090C18]/50'
                    }
                  >
                    <td className="py-2.5 px-3 font-bold text-[#C9A96E]">
                      {row.cycleNumber}వ విడత
                    </td>
                    <td className="py-2.5 px-3 text-[#EDE8E0] font-semibold">
                      {row.phaseNameTe}
                    </td>
                    <td className="py-2.5 px-3 text-[#5BBFB5] font-bold">
                      {row.transitRasiTe} ({row.houseFromMoon}వ ఇంట)
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular text-[#EDE8E0]">
                      {row.startDateStr} → {row.endDateStr}
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular text-[#C9A96E]">
                      {row.startAge} – {row.endAge}
                    </td>
                    <td className="py-2.5 px-3 text-[#9B8FD4] font-semibold">
                      {row.overlappingDashaTe}
                    </td>
                    <td className="py-2.5 px-3 text-[#EDE8E0]/85 leading-relaxed">
                      <strong className="text-[#D47B7B]">{row.bodyPartTe}:</strong>{' '}
                      {row.phalaAndPariharaTe}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHAPTER 3: SIDDHANTA ADVANCED APPENDICES (UPAGRAHAS, ISHTA/KASHTA PHALA, BHAVA BALA, SHODHANA PINDA, SUDARSHANA CHAKRA, 22nd DREKKANA & 64th NAVAMSA) */}
      {showSection('siddhanta_appendices') && (
        <div className="space-y-6">
          {/* 1. 11 Upagrahas (Mandi, Gulika, Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu, Kala, Mrityu, Ardhaprahara, Yamaghantaka) */}
          <div className="bg-[#0F1326] border-2 border-[#C9A96E]/45 rounded-lg p-5 sm:p-6 overflow-x-auto">
            <div className="border-b border-white/10 pb-3 mb-4">
              <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">
                బృహత్ పరాశర హోరా శాస్త్రం — అప్రకాశ & కాలాంశ ఉపగ్రహ గణితం
              </div>
              <h2 className="text-xl font-bold text-[#EDE8E0] mt-1">
                మాందీ, గుళిక, ధూమ, వ్యతీపాత, పరివేష, ఇంద్రచాప, ఉపకేతు & కాలాది 11 ఉపగ్రహ స్ఫుటములు
              </h2>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/15 text-[#C9A96E] bg-[#090C18]/90">
                  <th className="py-2.5 px-3">ఉపగ్రహం</th>
                  <th className="py-2.5 px-3">వర్గం / మూల గ్రహం</th>
                  <th className="py-2.5 px-3">స్ఫుటం (DMS)</th>
                  <th className="py-2.5 px-3">రాశి (D1)</th>
                  <th className="py-2.5 px-3">నక్షత్రం (పాదం)</th>
                  <th className="py-2.5 px-3">నవాంశ (D9)</th>
                  <th className="py-2.5 px-3">భావం</th>
                  <th className="py-2.5 px-3">శాస్త్ర ఫలితం & గమనిక</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {siddhantaAppendices.upagrahas.map((ug) => (
                  <tr
                    key={ug.id}
                    className={
                      ug.id === 'Mandi' || ug.id === 'Gulika'
                        ? 'bg-[#D47B7B]/15 font-semibold'
                        : 'bg-[#090C18]/50 hover:bg-white/5'
                    }
                  >
                    <td className="py-2.5 px-3 font-bold text-[#C9A96E]">
                      {ug.nameTe}
                      <span className="block text-[10px] text-[#EDE8E0]/50 font-normal">
                        {ug.nameEn}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#EDE8E0]/85">{ug.formulaTe}</td>
                    <td className="py-2.5 px-3 font-mono-tabular text-[#5BBFB5] font-semibold">
                      {ug.formattedDMS}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#EDE8E0]">
                      {ug.rasiNameTe} ({ug.degreeInSignFormatted})
                    </td>
                    <td className="py-2.5 px-3 text-[#EDE8E0]">
                      {ug.nakshatraNameTe} ({ug.pada}వ పాదం)
                    </td>
                    <td className="py-2.5 px-3 text-[#C9A96E] font-semibold">
                      {ug.navamsaNameTe}
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular font-bold text-[#5BBFB5]">
                      {ug.houseFromLagna}వ భావం
                    </td>
                    <td className="py-2.5 px-3 text-[#EDE8E0]/85 leading-relaxed">
                      {ug.phalaTe}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Khara 22nd Drekkana, 64th Navamsa & Mrityu Bhaga Diagnostics */}
          <div className="bg-[#0F1326] border border-[#D47B7B]/40 rounded-lg p-5 sm:p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#C9A96E]">
              ఖర 22వ ద్రేక్కాణం (Khara Drekkana) · 64వ నవాంశ (Vainashika) & మృత్యు భాగ రహస్య విశ్లేషణ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded bg-[#090C18]/90 border border-white/10 space-y-1">
                <div className="text-[11px] text-[#EDE8E0]/60">లగ్నం నుండి 22వ ద్రేక్కాణం (ఖర):</div>
                <div className="font-bold text-[#D47B7B] text-sm">
                  {siddhantaAppendices.kharaSphutas.lagna22ndDrekkanaRasiTe}
                </div>
                <div className="text-[#EDE8E0]/80">
                  ఖర ద్రేక్కాణాధిపతి: <strong className="text-[#C9A96E]">{siddhantaAppendices.kharaSphutas.lagna22ndDrekkanaLordTe}</strong>
                </div>
              </div>
              <div className="p-3.5 rounded bg-[#090C18]/90 border border-white/10 space-y-1">
                <div className="text-[11px] text-[#EDE8E0]/60">చంద్రుని నుండి 64వ నవాంశ:</div>
                <div className="font-bold text-[#D47B7B] text-sm">
                  {siddhantaAppendices.kharaSphutas.chandra64thNavamsaRasiTe}
                </div>
                <div className="text-[#EDE8E0]/80">
                  అధిపతి: <strong className="text-[#C9A96E]">{siddhantaAppendices.kharaSphutas.chandra64thNavamsaLordTe}</strong>
                </div>
              </div>
              <div className="p-3.5 rounded bg-[#090C18]/90 border border-white/10 space-y-1">
                <div className="text-[11px] text-[#EDE8E0]/60">లగ్నం నుండి 64వ నవాంశ:</div>
                <div className="font-bold text-[#C9A96E] text-sm">
                  {siddhantaAppendices.kharaSphutas.lagna64thNavamsaRasiTe}
                </div>
                <div className="text-[#EDE8E0]/80">
                  అధిపతి: <strong className="text-[#5BBFB5]">{siddhantaAppendices.kharaSphutas.lagna64thNavamsaLordTe}</strong>
                </div>
              </div>
              <div className="p-3.5 rounded bg-[#090C18]/90 border border-[#5BBFB5]/35 space-y-1">
                <div className="text-[11px] text-[#5BBFB5] font-semibold">మృత్యు భాగ తనిఖీ:</div>
                <div className="font-bold text-[#EDE8E0] text-xs leading-relaxed">
                  {siddhantaAppendices.kharaSphutas.mrityuBhagaPlanetsTe.length > 0
                    ? siddhantaAppendices.kharaSphutas.mrityuBhagaPlanetsTe.join(', ')
                    : 'ఏ గ్రహమూ మృత్యు భాగలో లేదు (శుభం)'}
                </div>
              </div>
            </div>
            <div className="p-3.5 rounded bg-[#141932] border border-[#C9A96E]/35 text-xs text-[#EDE8E0]/90 leading-relaxed">
              <strong className="text-[#C9A96E]">సిద్ధాంత హెచ్చరిక & రక్షణ సూత్రం: </strong>
              {siddhantaAppendices.kharaSphutas.cautionGuidanceTe}
            </div>
          </div>

          {/* 3. Ishta Phala & Kashta Phala + Dasavarga Vaisheshikamsa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0F1326] border border-white/15 rounded-lg p-5 overflow-x-auto">
              <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2.5 mb-3">
                సప్తగ్రహ ఇష్ట ఫల & కష్ట ఫల పట్టిక (Ishta / Kashta Phala - Shashtiamsas)
              </h3>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#C9A96E] bg-[#090C18]/90">
                    <th className="py-2 px-2.5">గ్రహం</th>
                    <th className="py-2 px-2.5">ఉచ్చ రశ్మి</th>
                    <th className="py-2 px-2.5">చేష్టా రశ్మి</th>
                    <th className="py-2 px-2.5">ఇష్ట ఫలం</th>
                    <th className="py-2 px-2.5">కష్ట ఫలం</th>
                    <th className="py-2 px-2.5">నికర స్వభావం</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {siddhantaAppendices.ishtaKashtaTable.map((row) => (
                    <tr key={row.planetId} className="bg-[#090C18]/50">
                      <td className="py-2 px-2.5 font-bold text-[#EDE8E0]">{row.planetNameTe}</td>
                      <td className="py-2 px-2.5 font-mono-tabular text-[#EDE8E0]/80">{row.uchchaBala}</td>
                      <td className="py-2 px-2.5 font-mono-tabular text-[#EDE8E0]/80">{row.cheshtaBala}</td>
                      <td className="py-2 px-2.5 font-mono-tabular font-bold text-[#5BBFB5]">
                        {row.ishtaPhala}
                      </td>
                      <td className="py-2 px-2.5 font-mono-tabular font-bold text-[#D47B7B]">
                        {row.kashtaPhala}
                      </td>
                      <td className="py-2 px-2.5 font-semibold text-[#C9A96E]">{row.dashaVerdictTe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#0F1326] border border-white/15 rounded-lg p-5 overflow-x-auto">
              <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2.5 mb-3">
                దశవర్గ వైశేషికాంశ గౌరవ పట్టిక (Dasavarga Vaisheshikamsa Dignities)
              </h3>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#C9A96E] bg-[#090C18]/90">
                    <th className="py-2 px-2.5">గ్రహం</th>
                    <th className="py-2 px-2.5">శుభ వర్గాలు</th>
                    <th className="py-2 px-2.5">వైశేషికాంశ నామం</th>
                    <th className="py-2 px-2.5">శుభ వర్గ జాబితా & ఫలితం</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {siddhantaAppendices.vaisheshikamsaTable.map((v) => (
                    <tr key={v.planetId} className="bg-[#090C18]/50">
                      <td className="py-2 px-2.5 font-bold text-[#EDE8E0]">{v.planetNameTe}</td>
                      <td className="py-2 px-2.5 font-mono-tabular font-bold text-[#5BBFB5]">
                        {v.dignifiedVargasCount} / 10
                      </td>
                      <td className="py-2 px-2.5 font-bold text-[#C9A96E]">{v.amsaTitleTe}</td>
                      <td className="py-2 px-2.5 text-[#EDE8E0]/85">
                        <span className="font-mono-tabular text-[#5BBFB5]">[{v.dignifiedVargaCodes.join(', ')}]</span> — {v.phalaTe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Dvadasha Bhava Bala (12-House Strength) & Ashtakavarga Shodhana Pinda */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0F1326] border border-white/15 rounded-lg p-5 overflow-x-auto">
              <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2.5 mb-3">
                ద్వాదశ భావ బల పట్టిక (12-House Bhava Bala — Rupas & Shashtiamsas)
              </h3>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#C9A96E] bg-[#090C18]/90">
                    <th className="py-2 px-2">భావం</th>
                    <th className="py-2 px-2">రాశి & అధిపతి</th>
                    <th className="py-2 px-2">అధిపతి బలం</th>
                    <th className="py-2 px-2">దిగ్బలం</th>
                    <th className="py-2 px-2">దృష్టి బలం</th>
                    <th className="py-2 px-2">రూపాలు</th>
                    <th className="py-2 px-2">ర్యాంక్</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {siddhantaAppendices.bhavaBalaTable.map((bb) => (
                    <tr key={bb.houseNumber} className="bg-[#090C18]/50">
                      <td className="py-2 px-2 font-bold text-[#C9A96E]">{bb.bhavaNameTe}</td>
                      <td className="py-2 px-2 text-[#EDE8E0]">
                        {bb.rasiNameTe} ({bb.lordNameTe})
                      </td>
                      <td className="py-2 px-2 font-mono-tabular text-[#EDE8E0]/80">{bb.bhavadhipatiBala}</td>
                      <td className="py-2 px-2 font-mono-tabular text-[#EDE8E0]/80">{bb.bhavaDigbala}</td>
                      <td className="py-2 px-2 font-mono-tabular text-[#EDE8E0]/80">{bb.bhavaDrishtiBala}</td>
                      <td className="py-2 px-2 font-mono-tabular font-bold text-[#5BBFB5]">
                        {bb.totalRupas}
                      </td>
                      <td className="py-2 px-2 font-mono-tabular font-bold text-[#C9A96E]">
                        #{bb.rank} ({bb.strengthLabelTe})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#0F1326] border border-white/15 rounded-lg p-5 overflow-x-auto">
              <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2.5 mb-3">
                భిన్నాష్టకవర్గ త్రికోణ & ఏకాధిపత్య శోధన పిండ పట్టిక (Rasi / Graha / Shodhya Pinda)
              </h3>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#C9A96E] bg-[#090C18]/90">
                    <th className="py-2 px-2">గ్రహం</th>
                    <th className="py-2 px-2">ముడి బిందువులు</th>
                    <th className="py-2 px-2">రాశి పిండం</th>
                    <th className="py-2 px-2">గ్రహ పిండం</th>
                    <th className="py-2 px-2">శోధ్య పిండం</th>
                    <th className="py-2 px-2">దశా ఫల శక్తి</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {siddhantaAppendices.ashtakavargaShodhana.map((ap) => (
                    <tr key={ap.planetId} className="bg-[#090C18]/50">
                      <td className="py-2 px-2 font-bold text-[#EDE8E0]">{ap.planetNameTe}</td>
                      <td className="py-2 px-2 font-mono-tabular text-[#EDE8E0]/80">{ap.totalRawBindus}</td>
                      <td className="py-2 px-2 font-mono-tabular text-[#EDE8E0]">{ap.rasiPinda}</td>
                      <td className="py-2 px-2 font-mono-tabular text-[#EDE8E0]">{ap.grahaPinda}</td>
                      <td className="py-2 px-2 font-mono-tabular font-bold text-[#5BBFB5]">
                        {ap.shodhyaPinda}
                      </td>
                      <td className="py-2 px-2 text-[#C9A96E] font-semibold">
                        {ap.sadhanaVerdictTe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Sudarshana Chakra 3-Fold Synthesis Table */}
          <div className="bg-[#0F1326] border border-white/15 rounded-lg p-5 overflow-x-auto">
            <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2.5 mb-3">
              మహర్షి పరాశర సుదర్శన చక్ర త్రివిధ బల సమన్వయ పట్టిక (Lagna + Chandra + Surya Lagna Synthesis)
            </h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/15 text-[#C9A96E] bg-[#090C18]/90">
                  <th className="py-2 px-2.5">భావ సంఖ్య</th>
                  <th className="py-2 px-2.5">లగ్నం నుండి రాశి (దేహం)</th>
                  <th className="py-2 px-2.5">చంద్రుని నుండి రాశి (మనస్సు)</th>
                  <th className="py-2 px-2.5">సూర్యుని నుండి రాశి (ఆత్మ)</th>
                  <th className="py-2 px-2.5">త్రివిధ బలం (%)</th>
                  <th className="py-2 px-2.5">సుదర్శన సమన్వయ ఫలితం</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {siddhantaAppendices.sudarshanaTable.map((sh) => (
                  <tr key={sh.houseNumber} className="bg-[#090C18]/50">
                    <td className="py-2 px-2.5 font-bold text-[#C9A96E]">
                      {sh.houseNumber}వ భావం ({sh.bhavaSignificanceTe})
                    </td>
                    <td className="py-2 px-2.5 text-[#EDE8E0]">
                      {sh.fromLagnaRasiTe} ({sh.fromLagnaPlanetsTe})
                    </td>
                    <td className="py-2 px-2.5 text-[#5BBFB5]">
                      {sh.fromChandraRasiTe} ({sh.fromChandraPlanetsTe})
                    </td>
                    <td className="py-2 px-2.5 text-[#C9A96E]">
                      {sh.fromSuryaRasiTe} ({sh.fromSuryaPlanetsTe})
                    </td>
                    <td className="py-2 px-2.5 font-mono-tabular font-bold text-[#5BBFB5]">
                      {sh.fortificationScore}%
                    </td>
                    <td className="py-2 px-2.5 text-[#EDE8E0]/85">{sh.synthesisVerdictTe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHAPTER 1: PANCHANGAM, ISHTA GHATIKALU, LAGNA SHASTRA PRAMANAM, 4 KUNDALIS & NAVAGRAHA DEEP TABLE */}
      {showSection('panchanga_kundali') && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-avoid-break">
            {/* Column 1: Janma Panchangam with Exact Tithi, Sunrise, Ishta Ghatikalu & Dasha Balance */}
            <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6">
              <h2 className="text-lg font-bold text-[#C9A96E] border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
                <span>1. జన్మ పంచాంగం & ఇష్ట ఘడియలు</span>
                <span className="text-xs font-normal text-[#EDE8E0]/50">Janma Panchangam</span>
              </h2>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">తెలుగు సంవత్సరం:</dt>
                  <dd className="font-bold text-[#EDE8E0] text-right">{jathakam.samvatsaramTe}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">ఆయనం & ఋతువు:</dt>
                  <dd className="font-semibold text-[#EDE8E0] text-right">
                    {jathakam.ayanamTe} · {jathakam.rituvuTe}
                  </dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">మాసం (చాంద్రమాన / సౌరమాన):</dt>
                  <dd className="font-semibold text-[#C9A96E] text-right">{jathakam.masamTe}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">పక్షం & జన్మ తిథి:</dt>
                  <dd className="font-bold text-[#5BBFB5] text-right">
                    {jathakam.pakshamTe.split(' (')[0]} · {jathakam.tithiTe}
                  </dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">వాసరం (వారం):</dt>
                  <dd className="font-semibold text-[#EDE8E0] text-right">{jathakam.vasaramTe}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">జన్మ నక్షత్రం & పాదం:</dt>
                  <dd className="font-bold text-[#C9A96E] text-right">
                    {jathakam.janmaNakshatramTe} — {jathakam.janmaPadam}వ పాదం ("{jathakam.namaAksharamTe}")
                  </dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">నక్షత్ర భుక్తి / శేషం:</dt>
                  <dd className="font-mono-tabular text-[#EDE8E0] text-right">{jathakam.nakshatraBhuktiSeshamTe}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">నిత్య యోగం & కరణం:</dt>
                  <dd className="font-semibold text-[#EDE8E0] text-right">
                    {jathakam.yogamTe.split(' (')[0]} · {jathakam.karanamTe.split(' (')[0]}
                  </dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">సూర్యోదయం & సూర్యాస్తమయం:</dt>
                  <dd className="font-mono-tabular font-semibold text-[#C9A96E] text-right">
                    {jathakam.suryodayamTe} · {jathakam.suryastamayamTe} ({jathakam.dinamanamTe})
                  </dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">ఉదయాది ఇష్ట ఘడియలు:</dt>
                  <dd className="font-bold text-[#5BBFB5] text-right">{jathakam.udayadiIshtaGhatikaluTe}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <dt className="text-[#EDE8E0]/60">గణం · యోని · నాడి · రజ్జు:</dt>
                  <dd className="font-semibold text-[#EDE8E0] text-right">
                    {jathakam.ganaTe} · {jathakam.yoniTe.split(' ')[0]} · {jathakam.nadiTe.split(' ')[0]} · {jathakam.rajjuTe}
                  </dd>
                </div>
                <div className="flex justify-between pt-1.5">
                  <dt className="text-[#EDE8E0]/60">జన్మ దశా నిల్వ (Balance):</dt>
                  <dd className="font-bold text-[#C9A96E] text-right">{jathakam.dashaBalanceAtBirthTe}</dd>
                </div>
              </dl>
            </div>

            {/* Column 2: Lagna Shastra Pramanam (BPHS & Laghu Parashari) */}
            <div className="bg-[#0F1326] border border-[#C9A96E]/35 rounded-lg p-6">
              <h2 className="text-lg font-bold text-[#C9A96E] border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
                <span>2. లగ్న శాస్త్ర ప్రమాణం (BPHS)</span>
                <span className="text-xs font-normal text-[#EDE8E0]/50">Lagna Functional Nature</span>
              </h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded bg-[#090C18]/90 border border-[#C9A96E]/30">
                  <div className="text-xs text-[#C9A96E] font-semibold">
                    {jathakam.lagnaShastraPramanam.lagnaNameTe} — {jathakam.lagnaShastraPramanam.tattvamTe} · {jathakam.lagnaShastraPramanam.swabhavamTe}
                  </div>
                  <div className="text-xs text-[#EDE8E0]/80 mt-1">{jathakam.lagnaShastraPramanam.prakritiTe}</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-[#5BBFB5]/10 border border-[#5BBFB5]/30">
                    <span className="text-[#5BBFB5] font-bold">రాజయోగకారక గ్రహం: </span>
                    <span className="text-[#EDE8E0]">{jathakam.lagnaShastraPramanam.yogakarakaGrahaTe}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/10">
                    <span className="text-[#C9A96E] font-bold">శుభ గ్రహాలు (Benefics): </span>
                    <span className="text-[#EDE8E0]/90">{jathakam.lagnaShastraPramanam.shubhaGrahaluTe}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/10">
                    <span className="text-[#D47B7B] font-bold">పాప / సమ గ్రహాలు: </span>
                    <span className="text-[#EDE8E0]/85">{jathakam.lagnaShastraPramanam.papaGrahaluTe}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/10">
                    <span className="text-[#E0A96D] font-bold">బాధక స్థానం & అధిపతి: </span>
                    <span className="text-[#EDE8E0]/85">
                      {jathakam.lagnaShastraPramanam.badhakaSthanamTe} — {jathakam.lagnaShastraPramanam.badhakadhipatiTe}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#EDE8E0]/75 leading-relaxed pt-1">
                  {jathakam.lagnaShastraPramanam.lagnaSwaroopaVivaranamTe}
                </p>
              </div>
            </div>

            {/* Column 3: Adrushta Ratnam, Ishta Devata & Lucky Parameters */}
            <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6">
              <h2 className="text-lg font-bold text-[#C9A96E] border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
                <span>3. అదృష్ట రత్నం & దైవ బలం</span>
                <span className="text-xs font-normal text-[#EDE8E0]/50">Lucky Gem & Deity</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded bg-[#090C18]/70 border border-white/10">
                  <div className="text-[11px] text-[#EDE8E0]/55">జీవరత్నం (Lagna Gem)</div>
                  <div className="font-bold text-[#C9A96E] mt-1">{jathakam.adrushtaVivaralu.ratnamTe}</div>
                </div>
                <div className="p-3 rounded bg-[#090C18]/70 border border-white/10">
                  <div className="text-[11px] text-[#EDE8E0]/55">భాగ్య రత్నం (9th Lord Gem)</div>
                  <div className="font-bold text-[#5BBFB5] mt-1">{jathakam.adrushtaVivaralu.bhagyaRatnamTe}</div>
                </div>
                <div className="p-3 rounded bg-[#090C18]/70 border border-white/10">
                  <div className="text-[11px] text-[#EDE8E0]/55">అదృష్ట సంఖ్యలు</div>
                  <div className="font-bold text-[#EDE8E0] font-mono-tabular mt-1">
                    {jathakam.adrushtaVivaralu.luckyNumbers}
                  </div>
                </div>
                <div className="p-3 rounded bg-[#090C18]/70 border border-white/10">
                  <div className="text-[11px] text-[#EDE8E0]/55">అదృష్ట దిశ</div>
                  <div className="font-bold text-[#EDE8E0] mt-1">{jathakam.adrushtaVivaralu.luckyDirectionTe}</div>
                </div>
                <div className="p-3 rounded bg-[#090C18]/70 border border-white/10 col-span-2">
                  <div className="text-[11px] text-[#EDE8E0]/55">అదృష్ట వారములు & రంగులు</div>
                  <div className="font-semibold text-[#EDE8E0] mt-1">
                    {jathakam.adrushtaVivaralu.luckyDaysTe} · ({jathakam.adrushtaVivaralu.luckyColorsTe})
                  </div>
                </div>
                <div className="p-3.5 rounded bg-[#C9A96E]/10 border border-[#C9A96E]/35 col-span-2">
                  <div className="text-[11px] text-[#C9A96E] font-semibold">ఆరాధ్య ఇష్టదైవం & నిత్య మంత్రం</div>
                  <div className="font-bold text-[#EDE8E0] mt-1">{jathakam.adrushtaVivaralu.ishtaDevataTe}</div>
                  <div className="text-xs text-[#C9A96E] mt-1 font-medium">{jathakam.adrushtaVivaralu.mantramTe}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Essential South Indian Telugu Kundali Charts Grid: D1 Rasi, D9 Navamsa, D10 Dasamsa, D3 Drekkana */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-avoid-break">
            <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-lg p-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#C9A96E]">01. జన్మ రాశి చక్రం (D1 — Rasi Kundali)</h3>
                  <p className="text-xs text-[#EDE8E0]/60">
                    దక్షిణ భారత తెలుగు రాశి చక్రం · లగ్నం: {jathakam.janmaLagnamTe} · AL: {jathakam.arudhaPadas[0]?.rasiNameTe.split(' ')[0]}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/35 font-semibold">
                  D1 రాశి
                </span>
              </div>
              <SouthIndianKundaliSvg
                chart={chart}
                division="D1"
                selectedPlanetId={selectedPlanetId}
                onSelectPlanet={onSelectPlanet}
                lang="te"
              />
            </div>

            <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-lg p-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#5BBFB5]">02. నవాంశ చక్రం (D9 — ధర్మ & కళత్ర చక్రం)</h3>
                  <p className="text-xs text-[#EDE8E0]/60">
                    వివాహ, భాగ్య & గ్రహ అంతర్గత బల చక్రం · నవాంశ లగ్నం: {jathakam.navamsaLagnamTe}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35 font-semibold">
                  D9 నవాంశ
                </span>
              </div>
              <SouthIndianKundaliSvg
                chart={chart}
                division="D9"
                selectedPlanetId={selectedPlanetId}
                onSelectPlanet={onSelectPlanet}
                lang="te"
              />
            </div>
          </div>

          {/* Navagraha Deep Table (with Avastha, Combustion, Drishti, Shadbala & Phaladeepika Sutra) */}
          <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6 overflow-x-auto print-avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#C9A96E]">
                  నవగ్రహ ఆరు-స్తంభాల లోతైన స్థితి & ఫలదీపికా సూత్ర పట్టిక
                </h2>
                <p className="text-xs text-[#EDE8E0]/65 mt-0.5">
                  గ్రహ రాశి, డిగ్రీలు, నక్షత్ర పాదం, ఉచ్చ/నీచ/మూలత్రికోణ/స్వక్షేత్ర హోదా, వర్గోత్తమ, బాలాది అవస్థ, మౌఢ్యం, విశేష దృష్టి & షడ్బల రూపాలు
                </p>
              </div>
              <span className="text-xs font-mono-tabular text-[#C9A96E] bg-[#090C18] px-3 py-1 rounded border border-[#C9A96E]/30">
                చిత్రపక్ష (లహరి) అయనాంశం: {chart.ayanamsaFormatted}
              </span>
            </div>

            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="border-b border-white/15 text-[11px] uppercase text-[#EDE8E0]/55">
                  <th className="py-2.5 px-3">గ్రహం (Graha)</th>
                  <th className="py-2.5 px-3">రాశి (D1) & డిగ్రీలు</th>
                  <th className="py-2.5 px-3">భావం</th>
                  <th className="py-2.5 px-3">నక్షత్రం & పాదం</th>
                  <th className="py-2.5 px-3">నవాంశ (D9) / దశాంశ (D10)</th>
                  <th className="py-2.5 px-3">గ్రహ హోదా & అవస్థ</th>
                  <th className="py-2.5 px-3">గ్రహ దృష్టి (Aspects)</th>
                  <th className="py-2.5 px-3">షడ్బల</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {jathakam.navagrahaDeepTable.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#EDE8E0]">
                        <div className="flex items-center gap-2">
                          <span className="text-[#C9A96E] text-base">{row.glyph}</span>
                          <span>{row.nameTe}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {row.isRetrograde && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#D47B7B]/15 text-[#D47B7B] border border-[#D47B7B]/35">
                              వక్రం (R)
                            </span>
                          )}
                          {row.isCombust && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/35">
                              మౌఢ్యం (అస్తంగత్వం)
                            </span>
                          )}
                          {row.isVargottama && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35">
                              వర్గోత్తమ బలం
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[#EDE8E0] font-semibold">{row.rasiTe}</div>
                        <div className="text-xs font-mono-tabular text-[#C9A96E]">{row.dms}</div>
                      </td>
                      <td className="py-3 px-3 font-mono-tabular font-bold text-[#EDE8E0]">
                        {row.house}వ భావం
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[#5BBFB5] font-semibold">
                          {row.nakshatraTe} ({row.pada}వ పాదం)
                        </div>
                        <div className="text-xs text-[#EDE8E0]/55">అధిపతి: {row.nakshatraLordTe}</div>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <div className="text-[#EDE8E0]/90">D9: {row.d9RasiTe}</div>
                        <div className="text-[#EDE8E0]/65">D10: {row.d10RasiTe}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            row.dignityTe.includes('ఉచ్చ') ||
                            row.dignityTe.includes('స్వక్షేత్రం') ||
                            row.dignityTe.includes('మూలత్రికోణ')
                              ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                              : row.dignityTe.includes('నీచ') || row.dignityTe.includes('శత్రు')
                                ? 'bg-[#D47B7B]/15 text-[#D47B7B] border border-[#D47B7B]/35'
                                : 'bg-white/5 text-[#EDE8E0]/80 border border-white/10'
                          }`}
                        >
                          {row.dignityTe}
                        </span>
                        <div className="text-[11px] text-[#EDE8E0]/65 mt-1">{row.avasthaTe}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#EDE8E0]/85 font-medium">
                        {row.drishtiHousesTe}
                      </td>
                      <td className="py-3 px-3 font-mono-tabular text-xs font-bold text-[#C9A96E]">
                        {row.shadbalaRupas.toFixed(2)} రూపాలు
                      </td>
                    </tr>
                    <tr className="bg-[#090C18]/55">
                      <td colSpan={8} className="py-2 px-4 text-xs text-[#EDE8E0]/80 border-l-2 border-[#C9A96E]">
                        <strong className="text-[#C9A96E]">ఫలదీపికా గ్రహ ఫలం: </strong>
                        {row.phaladeepikaPhalamTe}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================================== */}
      {/* CHAPTER 1A: AVAKAHADA CHAKRA · GHATA CHAKRA · NAMA AKSHARA (శాస్త్ర మూల పరిచయ అధ్యాయం) */}
      {/* ==================================================================================== */}
      {showSection('avakahada_ghata') && (
        <div className="space-y-6 print-page-break">
          <div className="bg-[#0F1326] border-2 border-[#C9A96E]/55 rounded-xl p-4 sm:p-6 md:p-8 space-y-5 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                అధ్యాయం 1A · అవకహడ చక్రం, ఘాత చక్రం & నామాక్షర నిర్ణయం
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#EDE8E0] mt-1">
                జన్మ స్వరూపం — నక్షత్రం, పాదం, రాశి, వర్ణ-వశ్య-యోని-నాడి & ఘాత (నిషిద్ధ) కాలాలు
              </h2>
              <p className="text-xs text-[#EDE8E0]/70 mt-2 leading-relaxed">
                ప్రతి జాతక పత్రిక ఆరంభంలో ఉండే <strong className="text-[#C9A96E]">అవకహడ చక్రం</strong> —
                అనగా “అ అకారాది క్రమంలో” జన్మ వివరాలు. ఇది ఫలితం చెప్పే అధ్యాయం కాదు; తరువాతి అన్ని
                అధ్యాయాలకు <em>పునాది</em>. చంద్రుని రాశి (జన్మ రాశి) ఆధారంగా పంచాంగ పంచకం, వర్ణ-వశ్య-యోని-గణ-నాడి
                కూటాలు, జన్మ నామాక్షరం మరియు ఘాత చక్రం — అన్నీ ఇక్కడ ఒకే చోట సిద్ధాంత సూత్రంతో సహా ఇవ్వబడ్డాయి.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* అవకహడ పట్టిక */}
              <div className="bg-[#090C18]/85 border border-[#C9A96E]/40 rounded-lg p-4">
                <h3 className="text-sm font-bold text-[#C9A96E] border-b border-white/10 pb-2 mb-3 flex items-center justify-between">
                  <span>అవకహడ చక్రం (జన్మ వివర పట్టిక)</span>
                  <span className="text-[11px] font-normal text-[#EDE8E0]/50">Avakahada Chakra</span>
                </h3>
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    {avakahada.rows.map((r) => (
                      <tr key={r.key} className="border-b border-white/5 last:border-0">
                        <td className="py-1.5 pr-2 text-[#EDE8E0]/65 align-top w-[42%]">{r.labelTe}</td>
                        <td className="py-1.5 font-semibold text-[#EDE8E0] align-top">
                          {r.valueTe}
                          {r.noteTe ? (
                            <span className="block text-[11px] font-normal text-[#EDE8E0]/50 mt-0.5">{r.noteTe}</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ఘాత చక్రం */}
              <div className="space-y-4">
                <div className="bg-[#090C18]/85 border border-[#E8A317]/50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-[#E8A317] border-b border-white/10 pb-2 mb-3 flex items-center justify-between">
                    <span>ఘాత చక్రం — జన్మ రాశి ప్రకారం నిషిద్ధ కాలాలు</span>
                    <span className="text-[11px] font-normal text-[#EDE8E0]/50">Ghata Chakra</span>
                  </h3>
                  <div className="text-[11px] text-[#EDE8E0]/70 mb-2">
                    జన్మ రాశి: <strong className="text-[#C9A96E]">{avakahada.ghata.janmaRasiTe}</strong> —
                    ఈ రాశికి శాస్త్రంలో నిర్దిష్టమైన మాస, తిథి సమూహం, వార, నక్షత్ర, యోగ, కరణ, ప్రహరం కలవు.
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {[
                      { k: 'ఘాత మాసం', v: avakahada.ghata.row.masaTe },
                      { k: 'ఘాత తిథి సమూహం', v: avakahada.ghata.row.tithiGroupTe },
                      { k: 'ఘాత వారం', v: avakahada.ghata.row.varaTe },
                      { k: 'ఘాత నక్షత్రం', v: avakahada.ghata.row.nakshatraTe },
                      { k: 'ఘాత యోగం', v: avakahada.ghata.row.yogaTe },
                      { k: 'ఘాత కరణం', v: avakahada.ghata.row.karanaTe },
                      { k: 'ఘాత ప్రహరం', v: `${avakahada.ghata.row.prahara}వ ప్రహరం` },
                      { k: 'తిథి సమూహ స్వభావం', v: avakahada.ghata.tithiGroupTe },
                    ].map((it) => (
                      <div key={it.k} className="flex justify-between gap-2 border-b border-white/5 py-1">
                        <span className="text-[#EDE8E0]/60">{it.k}</span>
                        <span className="font-semibold text-[#EDE8E0] text-right">{it.v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-[#EDE8E0]/75 border-t border-white/10 pt-2">
                    {avakahada.ghata.meaningTe}
                  </p>
                </div>

                <div className="bg-[#5BBFB5]/10 border border-[#5BBFB5]/40 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-[#5BBFB5] border-b border-[#5BBFB5]/25 pb-2 mb-2">
                    నామాక్షరం — పేరు ఎలా పెట్టాలి?
                  </h3>
                  <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                    జన్మ నక్షత్రం <strong className="text-[#C9A96E]">{jathakam.janmaNakshatramTe}</strong> —
                    <strong className="text-[#C9A96E]"> {jathakam.janmaPadam}వ పాదం</strong> అక్షరం
                    <strong className="text-[#5BBFB5]"> “{jathakam.namaAksharamTe}”</strong>.
                    శాస్త్ర ప్రకారం పేరు ఈ అక్షరంతో ఆరంభం కావడం శుభం; అది సాధ్యం కానప్పుడు అదే నక్షత్రంలోని మిగతా పాదాక్షరాలు
                    ({jathakam.allFourPadaAksharaluTe}) ఉపయోగించవచ్చు. ఇది తంత్రం కాదు — శబ్ద-స్పందన ఆధారిత
                    సంప్రదాయ సూచన మాత్రమే; భావం, అర్థం ముఖ్యం.
                  </p>
                  <p className="mt-2 text-[11px] text-[#EDE8E0]/65 leading-relaxed">
                    వేద జ్యోతిషంలో పేరు-రాశి అనేది నామాక్షర పాదానికి చెందిన నక్షత్ర రాశిని సూచిస్తుంది — కేవలం
                    జన్మ రాశిని (చంద్ర రాశిని) కాదు. వాస్తు నామ సూచికలో ఈ భేదం స్పష్టంగా తెలుపబడింది.
                  </p>
                </div>
              </div>
            </div>

            {/* సమన్వయ వివరణ */}
            <div className="bg-[#090C18]/85 border border-[#C9A96E]/35 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#C9A96E] mb-2">శ్లోక సూత్రం & సమన్వయ వివరణ</h3>
              <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">{avakahada.summaryTe}</p>
              <ul className="mt-2 space-y-1 text-[11px] text-[#EDE8E0]/70 leading-relaxed list-disc pl-5">
                <li><strong className="text-[#EDE8E0]">జన్మ రాశి</strong> — చంద్రుడు ఉన్న రాశి; అన్ని కూట మైత్రి (వర్ణ, వశ్య, తార, యోని, గ్రహ మైత్రి, గణ, భకూట, నాడి) లెక్కలకు ఆధారం.</li>
                <li><strong className="text-[#EDE8E0]">జన్మ లగ్నం</strong> — ఆరంభ సమయంలో తూర్పు క్షితిజం; భావ విభజన (1–12) దీని నుండే.</li>
                <li><strong className="text-[#EDE8E0]">గణం · యోని · నాడి · రజ్జు</strong> — వివాహ మేలుకూర్పు (అష్టకూట) పరీక్షకు; ఇవి జన్మ నక్షత్రం నుండి నిర్ణయమవుతాయి.</li>
                <li><strong className="text-[#EDE8E0]">ఇష్ట ఘడియలు</strong> — సూర్యోదయం నుండి జన్మ సమయం వరకు గడిచిన ఘడియలు (1 ఘడియ = 24 నిమిషాలు); దశా నిల్వ గణనకు ప్రాణాధారం.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================================== */}
      {/* CHAPTER 1B: YOGA VICHARA — RAJA / DHANA / MAHAPURUSHA YOGAS (యోగ విచారణ) */}
      {/* ==================================================================================== */}
      {showSection('yoga_vichara') && (
        <div className="space-y-6 print-page-break">
          <div className="bg-[#0F1326] border-2 border-[#C9A96E]/55 rounded-xl p-4 sm:p-6 md:p-8 space-y-5 shadow-xl">
            <div className="border-b border-white/10 pb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C9A96E]" />
                  అధ్యాయం 1B · యోగ విచారణ (Yoga Vichara)
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#EDE8E0] mt-1">
                  రాజ యోగాలు, ధన యోగాలు, పంచ మహాపురుష యోగాలు & చంద్ర-సూర్య యోగాలు — బలం, ఆధారం & ఫలితం
                </h2>
                <p className="text-xs text-[#EDE8E0]/70 mt-2 leading-relaxed">
                  “గ్రహం బలవంతుడా?” అనేది ఒక ప్రశ్న. “ఏ గ్రహాలు కలిసి ఏ <strong className="text-[#C9A96E]">యోగాన్ని</strong> ఏర్పరుస్తున్నాయి?”
                  అనేది మరో ప్రశ్న — జాతక ఫలాన్ని నిర్ణయించేది ఈ రెండోదే. క్రింద ప్రతి యోగానికి
                  ఏర్పడిన/కాని స్థితి, దానికి కారణమైన గ్రహ-రాశి-భావం, శాస్త్ర సూత్రం, సులభ తెలుగులో ఫలితం
                  మరియు బలహీనత ఉంటే పరిహారం — అన్నీ ఒకే పట్టికలో.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-[#C9A96E]/20 border border-[#C9A96E] font-bold text-[#C9A96E]">
                  గుర్తించిన యోగాలు: {yogaVichara.activeCount}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-[#5BBFB5]/15 border border-[#5BBFB5]/50 font-bold text-[#5BBFB5]">
                  రాజ యోగాలు: {yogaVichara.rajaYogaCount} · ధన యోగాలు: {yogaVichara.dhanaYogaCount}
                </span>
              </div>
            </div>

            {/* సారాంశం & తీర్పు */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-lg p-4">
                <div className="text-xs font-bold text-[#C9A96E] mb-1">యోగ సారాంశం</div>
                <p className="text-xs text-[#EDE8E0]/90 leading-relaxed">{yogaVichara.summaryTe}</p>
              </div>
              <div className="bg-[#5BBFB5]/10 border border-[#5BBFB5]/40 rounded-lg p-4">
                <div className="text-xs font-bold text-[#5BBFB5] mb-1">శాస్త్ర తీర్పు</div>
                <p className="text-xs text-[#EDE8E0]/90 leading-relaxed">{yogaVichara.verdictTe}</p>
              </div>
            </div>

            {/* ఏర్పడిన యోగాల కార్డులు */}
            <div>
              <h3 className="text-sm font-bold text-[#EDE8E0] mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5BBFB5]" />
                మీ కుండలిలో ఏర్పడిన యోగాలు ({yogaVichara.findings.filter((f) => f.present).length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {yogaVichara.findings.filter((f) => f.present).map((f) => (
                  <div key={f.id} className="bg-[#090C18]/90 border border-[#C9A96E]/40 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-[#C9A96E]">{f.nameTe}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[#EDE8E0]/45">{f.nameEn}</div>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-[10px] font-bold text-[#5BBFB5]">
                        {f.strengthPct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${f.strengthPct}%`, background: 'linear-gradient(90deg,#C9A96E,#5BBFB5)' }}
                      />
                    </div>
                    <p className="text-[11px] text-[#EDE8E0]/70 leading-relaxed">{f.evidenceTe}</p>
                    <p className="text-xs text-[#EDE8E0]/90 leading-relaxed">{f.phalamTe}</p>
                    <p className="text-[10px] text-[#C9A96E]/80 leading-relaxed border-t border-white/10 pt-1.5">
                      సూత్రం: {f.sutraTe}
                    </p>
                    {f.cautionTe ? (
                      <p className="text-[10px] text-[#E8A317] leading-relaxed">⚠ {f.cautionTe}</p>
                    ) : null}
                  </div>
                ))}
                {yogaVichara.findings.filter((f) => f.present).length === 0 && (
                  <div className="text-xs text-[#EDE8E0]/60 border border-white/10 rounded-lg p-4">
                    ప్రామాణిక యోగాలు ఏవీ స్పష్టంగా ఏర్పడలేదు — ఫలితాలు గ్రహ స్థితి మరియు దశా కాలంపై ఆధారపడతాయి.
                  </div>
                )}
              </div>
            </div>

            {/* పూర్తి పట్టిక — ఏర్పడని యోగాలతో సహా */}
            <details open className="bg-[#090C18]/85 border border-white/15 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-bold text-[#EDE8E0]">
                సంపూర్ణ యోగ పట్టిక — పరీక్షించిన {yogaVichara.findings.length} యోగాలు (ఏర్పడనివి కూడా ఎందుకు లేవో స్పష్టంగా)
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="text-[#C9A96E] border-b border-[#C9A96E]/40">
                      <th className="text-left py-2 pr-2">యోగం</th>
                      <th className="text-left py-2 pr-2">స్థితి</th>
                      <th className="text-left py-2 pr-2">బలం</th>
                      <th className="text-left py-2 pr-2">ఆధారం (ఏ గ్రహం-రాశి-భావం)</th>
                      <th className="text-left py-2">ఫలితం</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yogaVichara.findings.map((f) => (
                      <tr key={f.id} className={`border-b border-white/5 align-top ${f.present ? 'bg-[#C9A96E]/[0.04]' : ''}`}>
                        <td className="py-2 pr-2">
                          <div className={`font-bold ${f.present ? 'text-[#C9A96E]' : 'text-[#EDE8E0]/55'}`}>{f.nameTe}</div>
                          <div className="text-[10px] text-[#EDE8E0]/40">{f.nameEn}</div>
                        </td>
                        <td className="py-2 pr-2">
                          <span className={`font-semibold ${f.present ? 'text-[#5BBFB5]' : 'text-[#EDE8E0]/45'}`}>
                            {f.present ? 'ఏర్పడింది' : 'లేదు'}
                          </span>
                        </td>
                        <td className="py-2 pr-2 font-mono-tabular">
                          <span className={f.present ? 'text-[#C9A96E] font-bold' : 'text-[#EDE8E0]/40'}>
                            {f.present ? `${f.strengthPct}%` : '—'}
                          </span>
                          <div className="text-[10px] text-[#EDE8E0]/45">{f.present ? f.strengthTe : ''}</div>
                        </td>
                        <td className="py-2 pr-2 text-[#EDE8E0]/75">{f.evidenceTe}</td>
                        <td className="py-2 text-[#EDE8E0]/85">
                          {f.phalamTe}
                          <div className="text-[10px] text-[#C9A96E]/70 mt-1">{f.sutraTe}</div>
                          {f.cautionTe ? <div className="text-[10px] text-[#E8A317] mt-0.5">⚠ {f.cautionTe}</div> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            {/* దశా అధిపతుల యోగాలు + ఎలా చదవాలి */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#090C18]/90 border border-white/10 rounded-lg p-4">
                <div className="text-xs font-bold text-[#EDE8E0] mb-2">ఏ గ్రహం ఏ యోగానికి కారణం?</div>
                <div className="space-y-1.5 text-[11px]">
                  {yogaVichara.dashaLordYogas.map((d) => (
                    <div key={d.planetTe} className="flex gap-2 border-b border-white/5 pb-1">
                      <span className="text-[#C9A96E] font-bold shrink-0 w-16">{d.planetTe}</span>
                      <span className="text-[#EDE8E0]/80">{d.yogasTe.join(', ')}</span>
                    </div>
                  ))}
                  {yogaVichara.dashaLordYogas.length === 0 && (
                    <div className="text-[#EDE8E0]/55">—</div>
                  )}
                </div>
              </div>
              <div className="bg-[#090C18]/90 border border-[#C9A96E]/30 rounded-lg p-4">
                <div className="text-xs font-bold text-[#C9A96E] mb-2">ఈ అధ్యాయం ఎలా చదవాలి?</div>
                <ul className="space-y-1.5 text-[11px] text-[#EDE8E0]/80 leading-relaxed list-disc pl-4">
                  <li><strong className="text-[#EDE8E0]">“ఏర్పడింది”</strong> అంటే యోగానికి కావలసిన శాస్త్ర నియమాలు అన్నీ నెరవేరాయి.</li>
                  <li><strong className="text-[#EDE8E0]">బలం %</strong> — క్షేత్ర బలం (ఉచ్ఛ/స్వక్షేత్ర), భావ స్థితి, మౌఢ్యం, వక్రత్వం కలిపి లెక్కించిన తీవ్రత. 80%+ అంటే పూర్తి ఫలం.</li>
                  <li>యోగం లేకపోవడం “అశుభం” కాదు — ఆ రంగంలో ఫలం కృషి, దశా కాలంపై ఆధారపడుతుంది అని మాత్రమే.</li>
                  <li>యోగ ఫలం ఆ యోగానికి కారణమైన గ్రహాల <strong className="text-[#EDE8E0]">మహాదశా-భుక్తి</strong> కాలంలో స్పష్టంగా కనిపిస్తుంది (అధ్యాయం 9 చూడండి).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================================== */}
      {/* CHAPTER 1C: LIFE DOMAINS IN DEPTH — వివాహం / ఉద్యోగం / చదువు / ఆరోగ్యం / ధనం … */}
      {/* ==================================================================================== */}
      {showSection('life_domains_deep') && (
        <div className="space-y-8 print-page-break">
          <div className="bg-[#0F1326] border-2 border-[#C9A96E]/55 rounded-xl p-4 sm:p-6 md:p-8 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#C9A96E]" />
                అధ్యాయం 1C · జీవిత రంగాల లోతైన విశ్లేషణ (Life Domains in Depth)
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#EDE8E0] mt-1">
                వివాహం, ఉద్యోగం, చదువు, ఆరోగ్యం, ధనం, సంతానం, విదేశం & ఆధ్యాత్మికత — ఒక్కో రంగానికి ప్రత్యేక అధ్యాయం
              </h2>
              <p className="text-xs text-[#EDE8E0]/70 mt-2 leading-relaxed">
                ప్రతి రంగానికి ఐదు భాగాలు: <strong className="text-[#C9A96E]">శాస్త్ర ఆధారం</strong> (ఏ భావం, ఏ అధిపతి, ఏ కారకుడు — వాస్తవ స్థితితో),
                <strong className="text-[#5BBFB5]"> లోతైన వివరణ</strong> (మూడు ఉపశీర్షికలతో),
                <strong className="text-[#EDE8E0]"> బలాలు</strong>, <strong className="text-[#E8A317]">జాగ్రత్తలు</strong> మరియు
                <strong className="text-[#C9A96E]"> కాల ఫలం</strong> (దశా-భుక్తి కాలాలు) + పరిహారం.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-lg p-3">
                <div className="text-[11px] text-[#EDE8E0]/55">మొత్తం జీవిత రంగాల బలం</div>
                <div className="text-base font-bold text-[#C9A96E] mt-1">{lifeVistara.overallTe}</div>
              </div>
              <div className="bg-[#090C18]/90 border border-[#5BBFB5]/35 rounded-lg p-3">
                <div className="text-[11px] text-[#EDE8E0]/55">అత్యంత బలమైన రంగం</div>
                <div className="text-base font-bold text-[#5BBFB5] mt-1">{lifeVistara.bestDomainTe}</div>
              </div>
              <div className="bg-[#090C18]/90 border border-[#E8A317]/40 rounded-lg p-3">
                <div className="text-[11px] text-[#EDE8E0]/55">ఎక్కువ శ్రద్ధ అవసరమైన రంగం</div>
                <div className="text-base font-bold text-[#E8A317] mt-1">{lifeVistara.watchDomainTe}</div>
              </div>
            </div>

            <div className="no-print flex flex-wrap gap-2">
              {lifeVistara.domains.map((d) => (
                <a
                  key={d.id}
                  href={`#jv-${d.id}`}
                  className="px-2.5 py-1.5 rounded bg-[#090C18] border border-white/10 text-[11px] text-[#EDE8E0]/80 hover:border-[#C9A96E]/50 hover:text-[#C9A96E]"
                >
                  {d.number}. {d.titleTe.split(' — ')[0]}
                </a>
              ))}
            </div>
          </div>

          {lifeVistara.domains.map((d) => (
            <div
              key={d.id}
              id={`jv-${d.id}`}
              className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-xl p-4 sm:p-6 space-y-4 shadow-lg print-avoid-break scroll-mt-24"
            >
              {/* శీర్షిక */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[#C9A96E] font-semibold">
                    అధ్యాయం 1C · రంగం {d.number} · {d.subtitleTe}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#EDE8E0] mt-0.5">
                    {d.number}. {d.titleTe}
                  </h2>
                  <p className="text-[11px] text-[#EDE8E0]/55 mt-1">{d.housesTe}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                      d.scorePct >= 65
                        ? 'text-[#5BBFB5] border-[#5BBFB5]/50 bg-[#5BBFB5]/10'
                        : d.scorePct >= 45
                          ? 'text-[#C9A96E] border-[#C9A96E]/50 bg-[#C9A96E]/10'
                          : 'text-[#E8A317] border-[#E8A317]/50 bg-[#E8A317]/10'
                    }`}
                  >
                    {d.scorePct}% · {d.verdictTe}
                  </span>
                </div>
              </div>

              {/* 1. శాస్త్ర ఆధారం */}
              <div className="bg-[#090C18]/90 border border-[#C9A96E]/30 rounded-lg p-3.5">
                <h3 className="text-xs font-bold text-[#C9A96E] mb-1.5">
                  1. శాస్త్ర ఆధారం — ఏ భావాలు, ఏ అధిపతులు, ఏ కారక గ్రహాలు పరిశీలించబడ్డాయి?
                </h3>
                <p className="text-[11px] sm:text-xs text-[#EDE8E0]/85 leading-relaxed">{d.foundationTe}</p>
              </div>

              {/* 2. లోతైన వివరణ */}
              <div className="space-y-3">
                {d.analysis.map((a, i) => (
                  <div key={i} className="bg-[#090C18]/70 border border-white/10 rounded-lg p-3.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#5BBFB5] mb-1.5">
                      2.{i + 1} {a.headingTe}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#EDE8E0]/88 leading-relaxed text-justify">{a.bodyTe}</p>
                  </div>
                ))}
              </div>

              {/* 3-4. బలాలు & జాగ్రత్తలు */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#5BBFB5]/[0.07] border border-[#5BBFB5]/35 rounded-lg p-3.5">
                  <h3 className="text-xs font-bold text-[#5BBFB5] mb-1.5">3. బలాలు — మీకు అనుకూల అంశాలు</h3>
                  <ul className="space-y-1 text-[11px] text-[#EDE8E0]/85 leading-relaxed list-disc pl-4">
                    {d.strengthsTe.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#E8A317]/[0.07] border border-[#E8A317]/35 rounded-lg p-3.5">
                  <h3 className="text-xs font-bold text-[#E8A317] mb-1.5">4. జాగ్రత్తలు — ఏమి గమనించాలి?</h3>
                  <ul className="space-y-1 text-[11px] text-[#EDE8E0]/85 leading-relaxed list-disc pl-4">
                    {d.cautionsTe.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. కాల ఫలం */}
              <div className="bg-[#090C18]/90 border border-[#C9A96E]/30 rounded-lg p-3.5">
                <h3 className="text-xs font-bold text-[#C9A96E] mb-2">
                  5. కాల ఫలం — ఈ రంగంలో ముఖ్యమైన దశా-భుక్తి కాలాలు
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="text-[#EDE8E0]/55 border-b border-white/10">
                        <th className="text-left py-1.5 pr-2">కాలం</th>
                        <th className="text-left py-1.5 pr-2">సంవత్సరాలు</th>
                        <th className="text-left py-1.5">ఏమి ఆశించవచ్చు</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.timing.map((t, i) => (
                        <tr
                          key={i}
                          className={`border-b border-white/5 ${t.isRunning ? 'bg-[#5BBFB5]/10' : ''}`}
                        >
                          <td className="py-1.5 pr-2 font-semibold text-[#EDE8E0]">
                            {t.periodTe}
                            {t.isRunning ? (
                              <span className="ml-1.5 text-[10px] text-[#5BBFB5] font-bold">● ఇప్పుడు నడుస్తోంది</span>
                            ) : null}
                          </td>
                          <td className="py-1.5 pr-2 font-mono-tabular text-[#C9A96E]">{t.yearsTe}</td>
                          <td className="py-1.5 text-[#EDE8E0]/75">{t.noteTe}</td>
                        </tr>
                      ))}
                      {d.timing.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-2 text-[#EDE8E0]/55">
                            ఈ కాలంలో ప్రత్యేక దశా-భుక్తి కిటికీ లేదు — లభ్యమైన కాలరేఖ ఆధారంగా.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-[11px] text-[#EDE8E0]/80 leading-relaxed border-t border-white/10 pt-2">
                  <span className="font-bold text-[#C9A96E]">పరిహారం: </span>
                  {d.remedyTe}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHAPTER 2: SHODASHAVARGA (10-VARGA) KUNDALI EXPLORER, VIMSHOPAKA BALA & JAIMINI CHARA KARAKAS */}
      {showSection('shodashavarga_jaimini') && (
        <div className="space-y-8 print-page-break">
          <div className="bg-[#0F1326] border border-[#C9A96E]/45 rounded-lg p-6 md:p-8">
            <div className="border-b border-white/10 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">
                  అధ్యాయం 2 · షోడశవర్గ ప్రమాణం & మహర్షి జైమిని సూత్ర విశ్లేషణ
                </div>
                <h2 className="text-2xl font-bold text-[#EDE8E0] mt-1">
                  దశవర్గ (D1–D60) వింశోపక బలం, ఆరూఢ లగ్నాలు & సప్త చర కారకులు
                </h2>
                <p className="text-xs text-[#EDE8E0]/65 mt-1">
                  బృహత్ పరాశర హోరా శాస్త్రం (అధ్యాయం 6–8) ప్రకారం 10 వర్గ చక్రాలలో గ్రహ స్థితి, వైశేషికాంశ బలం మరియు మహర్షి జైమిని చర కారక సిద్ధాంతం
                </p>
              </div>
            </div>

            {/* Interactive Varga Kundali Selector + Live South Indian Varga Kundali */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8 print-avoid-break">
              <div className="lg:col-span-5 bg-[#090C18]/90 border border-[#C9A96E]/35 rounded-lg p-5 flex flex-col items-center">
                <div className="no-print w-full flex flex-wrap gap-1.5 mb-4 justify-center">
                  {VARGA_TABS.map((vt) => (
                    <button
                      key={vt.code}
                      onClick={() => setSelectedVarga(vt.code)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        selectedVarga === vt.code
                          ? 'bg-[#C9A96E] text-[#090C18]'
                          : 'bg-[#141932] text-[#EDE8E0]/75 border border-white/10 hover:border-[#C9A96E]/40'
                      }`}
                    >
                      {vt.code}
                    </button>
                  ))}
                </div>
                <div className="text-center mb-2">
                  <div className="text-sm font-bold text-[#C9A96E]">
                    {VARGA_TABS.find((v) => v.code === selectedVarga)?.labelTe}
                  </div>
                  <div className="text-xs text-[#EDE8E0]/60">
                    {VARGA_TABS.find((v) => v.code === selectedVarga)?.subtitleTe}
                  </div>
                </div>
                <SouthIndianKundaliSvg
                  chart={chart}
                  division={selectedVarga}
                  selectedPlanetId={selectedPlanetId}
                  onSelectPlanet={onSelectPlanet}
                  lang="te"
                />
              </div>

              {/* Right 7 Cols: Arudha Lagna (AL), Upapada Lagna (UL), Karakamsa Lagna (KL) + Jaimini 7 Chara Karakas */}
              <div className="lg:col-span-7 space-y-5">
                <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2">
                  ఆరూఢ లగ్నం (AL), ఉపపాద లగ్నం (UL) & కారకాంశ లగ్నం (KL)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {jathakam.arudhaPadas.map((ap) => (
                    <div
                      key={ap.code}
                      className="bg-[#090C18]/90 border border-white/15 rounded-lg p-4 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/35">
                          {ap.code}
                        </span>
                        <span className="text-[11px] text-[#5BBFB5] font-semibold">
                          లగ్నం నుండి {ap.houseFromLagna}వ భావం
                        </span>
                      </div>
                      <div className="text-sm font-bold text-[#EDE8E0] pt-1">{ap.titleTe}</div>
                      <div className="text-base font-bold text-[#C9A96E]">{ap.rasiNameTe}</div>
                      <div className="text-[11px] text-[#EDE8E0]/60">అధిపతి: {ap.lordTe}</div>
                      <p className="text-xs text-[#EDE8E0]/80 leading-relaxed pt-1">{ap.analysisTe}</p>
                    </div>
                  ))}
                </div>

                {/* Jaimini 7 Chara Karakas Table */}
                <div className="bg-[#090C18]/90 border border-white/15 rounded-lg p-4 overflow-x-auto">
                  <h4 className="text-sm font-bold text-[#5BBFB5] mb-3">
                    మహర్షి జైమిని సప్త చర కారకులు (7 Jaimini Chara Karakas — "ఆత్మాధికః కళాదిభిర్నభోగః")
                  </h4>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/15 text-[#EDE8E0]/55">
                        <th className="py-2 px-2">కారక హోదా</th>
                        <th className="py-2 px-2">గ్రహం & డిగ్రీలు</th>
                        <th className="py-2 px-2">రాశి (D1) / నవాంశ (D9)</th>
                        <th className="py-2 px-2">జైమిని సూత్ర ఫలితం</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {jathakam.jaiminiKarakas.map((jk) => (
                        <tr key={jk.karakaCode} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span className="font-bold text-[#C9A96E]">{jk.karakaNameTe}</span>
                            <div className="text-[10px] text-[#EDE8E0]/55">{jk.karakaRoleTe}</div>
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span className="font-bold text-[#EDE8E0]">{jk.planetNameTe}</span>
                            <div className="font-mono-tabular text-[11px] text-[#5BBFB5]">{jk.degreeFormatted}</div>
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <div className="text-[#EDE8E0]">D1: {jk.rasiTe} ({jk.house}వ ఇంట)</div>
                            <div className="text-[#C9A96E]">D9: {jk.navamsaRasiTe}</div>
                          </td>
                          <td className="py-2.5 px-2 text-[#EDE8E0]/80 leading-relaxed">
                            {jk.jaiminiPhalamTe}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Full 10-Varga (Dashavarga) Table & Vimshopaka Bala */}
            <div className="bg-[#090C18]/90 border border-white/15 rounded-lg p-5 overflow-x-auto print-avoid-break">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-[#C9A96E]">
                  దశవర్గ (D1 నుండి D60 వరకు) గ్రహ స్థితి & వింశోపక బల పట్టిక (Shodashavarga Synthesis)
                </h3>
                <span className="text-xs text-[#EDE8E0]/60">
                  పారిజాతాంశ · ఉత్తమాంశ · గోపురాంశ · సింహాసనాంశ · పారావతాంశ · దేవలోకాంశ
                </span>
              </div>
              <table className="w-full text-left border-collapse min-w-[900px] text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#EDE8E0]/60">
                    <th className="py-2.5 px-2.5">లగ్నం / గ్రహం</th>
                    <th className="py-2.5 px-2">D1 రాశి</th>
                    <th className="py-2.5 px-2">D2 హోర</th>
                    <th className="py-2.5 px-2">D3 ద్రేక్కాణ</th>
                    <th className="py-2.5 px-2">D4 చతుర్థాంశ</th>
                    <th className="py-2.5 px-2">D7 సప్తాంశ</th>
                    <th className="py-2.5 px-2 text-[#5BBFB5]">D9 నవాంశ</th>
                    <th className="py-2.5 px-2 text-[#C9A96E]">D10 దశాంశ</th>
                    <th className="py-2.5 px-2">D12 ద్వాదశాంశ</th>
                    <th className="py-2.5 px-2">D30 త్రింశాంశ</th>
                    <th className="py-2.5 px-2">D60 షష్ట్యంశ</th>
                    <th className="py-2.5 px-2.5">వింశోపక బలం (/20)</th>
                    <th className="py-2.5 px-2.5">వైశేషికాంశ హోదా</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {jathakam.shodashavargaTable.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.03]">
                      <td className="py-2.5 px-2.5 font-bold text-[#EDE8E0] whitespace-nowrap">
                        <span className="text-[#C9A96E] mr-1.5">{row.glyph}</span>
                        {row.nameTe}
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-[#EDE8E0]">{row.d1Te}</td>
                      <td className="py-2.5 px-2 text-[#EDE8E0]/80">{row.d2Te}</td>
                      <td className="py-2.5 px-2 text-[#EDE8E0]/80">{row.d3Te}</td>
                      <td className="py-2.5 px-2 text-[#EDE8E0]/80">{row.d4Te}</td>
                      <td className="py-2.5 px-2 text-[#EDE8E0]/80">{row.d7Te}</td>
                      <td className="py-2.5 px-2 font-semibold text-[#5BBFB5]">{row.d9Te}</td>
                      <td className="py-2.5 px-2 font-semibold text-[#C9A96E]">{row.d10Te}</td>
                      <td className="py-2.5 px-2 text-[#EDE8E0]/80">{row.d12Te}</td>
                      <td className="py-2.5 px-2 text-[#EDE8E0]/80">{row.d30Te}</td>
                      <td className="py-2.5 px-2 text-[#EDE8E0]/80">{row.d60Te}</td>
                      <td className="py-2.5 px-2.5 font-mono-tabular font-bold text-[#C9A96E]">
                        {row.vimshopakaScore} / 20
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            row.vargottama
                              ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                              : 'bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/30'
                          }`}
                        >
                          {row.vargottama ? `వర్గోత్తమ · ${row.vaiseshikamsaTe}` : row.vaiseshikamsaTe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 3 (NEW): SHADBALA 6-FOLD PLANETARY STRENGTH, 12-RASI ASHTAKAVARGA & 9-TARA TARABALA CHAKRA */}
      {showSection('shadbala_ashtakavarga') && (
        <div className="space-y-8 print-page-break">
          <div className="bg-[#0F1326] border border-[#C9A96E]/45 rounded-lg p-6 md:p-8 space-y-8">
            <div className="border-b border-white/10 pb-4">
              <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">
                అధ్యాయం 3 · షడ్బల ప్రమాణం, అష్టకవర్గ బిందు చక్రం & నక్షత్ర తారాబల నిర్ణయం
              </div>
              <h2 className="text-2xl font-bold text-[#EDE8E0] mt-1">
                సప్తగ్రహ షడ్బల విరూపాలు (BPHS అధ్యాయం 27), ద్వాదశ రాశి సర్వాష్టకవర్గ & 9-తారల చక్రం
              </h2>
            </div>

            {/* 1. Authentic Six-Fold Shadbala Table */}
            <div className="bg-[#090C18]/90 border border-white/15 rounded-lg p-5 overflow-x-auto print-avoid-break">
              <h3 className="text-base font-bold text-[#C9A96E] mb-3">
                1. సప్తగ్రహ షడ్బల పట్టిక (స్థాన, దిక్, కాల, చేష్టా, నైసర్గిక, దృక్ బలములు — విరూపాలు & రూపాలు)
              </h3>
              <table className="w-full text-left border-collapse min-w-[880px] text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#EDE8E0]/60">
                    <th className="py-2.5 px-2.5">గ్రహం</th>
                    <th className="py-2.5 px-2">స్థాన బలం</th>
                    <th className="py-2.5 px-2">దిగ్బలం</th>
                    <th className="py-2.5 px-2">కాల బలం</th>
                    <th className="py-2.5 px-2">చేష్టా బలం</th>
                    <th className="py-2.5 px-2">నైసర్గిక బలం</th>
                    <th className="py-2.5 px-2">దృక్ బలం</th>
                    <th className="py-2.5 px-2 font-bold text-[#C9A96E]">మొత్తం విరూపాలు</th>
                    <th className="py-2.5 px-2 font-bold text-[#5BBFB5]">షడ్బల రూపాలు</th>
                    <th className="py-2.5 px-2">కనీస రూపాలు</th>
                    <th className="py-2.5 px-2.5">బల నిష్పత్తి & స్థాయి</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {jathakam.shadbalaTableTe.map((sb) => (
                    <tr key={sb.id} className="hover:bg-white/[0.03]">
                      <td className="py-2.5 px-2.5 font-bold text-[#EDE8E0]">
                        <span className="text-[#C9A96E] mr-1.5">{sb.glyph}</span>
                        {sb.nameTe}
                      </td>
                      <td className="py-2.5 px-2 font-mono-tabular text-[#EDE8E0]/85">{sb.sthanaBala}</td>
                      <td className="py-2.5 px-2 font-mono-tabular text-[#EDE8E0]/85">{sb.digBala}</td>
                      <td className="py-2.5 px-2 font-mono-tabular text-[#EDE8E0]/85">{sb.kalaBala}</td>
                      <td className="py-2.5 px-2 font-mono-tabular text-[#EDE8E0]/85">{sb.cheshtaBala}</td>
                      <td className="py-2.5 px-2 font-mono-tabular text-[#EDE8E0]/85">{sb.naisargikaBala}</td>
                      <td className="py-2.5 px-2 font-mono-tabular text-[#EDE8E0]/85">{sb.drikBala}</td>
                      <td className="py-2.5 px-2 font-mono-tabular font-bold text-[#C9A96E]">{sb.totalVirupas}</td>
                      <td className="py-2.5 px-2 font-mono-tabular font-bold text-[#5BBFB5]">{sb.totalRupas}</td>
                      <td className="py-2.5 px-2 font-mono-tabular text-[#EDE8E0]/60">{sb.requiredRupas}</td>
                      <td className="py-2.5 px-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            sb.ratioPercent >= 115
                              ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                              : 'bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/35'
                          }`}
                        >
                          {sb.ratioPercent}% · {sb.statusTe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. 12-Rasi Bhinnashtakavarga & Sarvashtakavarga Bindu Table */}
            <div className="bg-[#090C18]/90 border border-white/15 rounded-lg p-5 overflow-x-auto print-avoid-break">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-[#5BBFB5]">
                  2. ద్వాదశ రాశి భిన్నాష్టకవర్గ & సర్వాష్టకవర్గ బిందు పట్టిక (మొత్తం: {chart.ashtakavarga.totalBindus} బిందువులు)
                </h3>
                <span className="text-xs text-[#EDE8E0]/60">
                  28+ బిందువులు గల రాశులలో గోచార గ్రహ సంచారం విశేష శుభప్రదం
                </span>
              </div>
              <table className="w-full text-left border-collapse min-w-[880px] text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#EDE8E0]/60">
                    <th className="py-2 px-2.5">రాశి పేరు</th>
                    <th className="py-2 px-2">లగ్నం నుండి భావం</th>
                    <th className="py-2 px-2">సూర్య</th>
                    <th className="py-2 px-2">చంద్ర</th>
                    <th className="py-2 px-2">కుజ</th>
                    <th className="py-2 px-2">బుధ</th>
                    <th className="py-2 px-2">గురు</th>
                    <th className="py-2 px-2">శుక్ర</th>
                    <th className="py-2 px-2">శని</th>
                    <th className="py-2 px-2.5 font-bold text-[#C9A96E]">సర్వాష్టక బిందువులు</th>
                    <th className="py-2 px-2.5">రాశి బల ఫలితం</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {jathakam.ashtakavargaTableTe.map((av) => (
                    <tr key={av.signIndex} className="hover:bg-white/[0.03]">
                      <td className="py-2 px-2.5 font-bold text-[#EDE8E0]">{av.rasiNameTe}</td>
                      <td className="py-2 px-2 font-mono-tabular text-[#C9A96E] font-semibold">
                        {av.houseFromLagna}వ భావం
                      </td>
                      <td className="py-2 px-2 font-mono-tabular">{av.sunBindus}</td>
                      <td className="py-2 px-2 font-mono-tabular">{av.moonBindus}</td>
                      <td className="py-2 px-2 font-mono-tabular">{av.marsBindus}</td>
                      <td className="py-2 px-2 font-mono-tabular">{av.mercuryBindus}</td>
                      <td className="py-2 px-2 font-mono-tabular">{av.jupiterBindus}</td>
                      <td className="py-2 px-2 font-mono-tabular">{av.venusBindus}</td>
                      <td className="py-2 px-2 font-mono-tabular">{av.saturnBindus}</td>
                      <td className="py-2 px-2.5 font-mono-tabular font-bold text-sm text-[#5BBFB5]">
                        {av.sarvaBindus}
                      </td>
                      <td className="py-2 px-2.5 text-[#EDE8E0]/85">{av.phalamTe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 3. 9-Tara Tarabala Chakra for the Native's Janma Nakshatra */}
            <div className="bg-[#090C18]/90 border border-white/15 rounded-lg p-5 overflow-x-auto print-avoid-break">
              <h3 className="text-base font-bold text-[#C9A96E] mb-3">
                3. మీ జన్మ నక్షత్రానికి ({jathakam.janmaNakshatramTe}) నవతారాబల చక్రం (27 నక్షత్రముల శుభాశుభ నిర్ణయం)
              </h3>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#EDE8E0]/60">
                    <th className="py-2 px-3">తార పేరు (Tara)</th>
                    <th className="py-2 px-3">వర్తించే నక్షత్రములు (3 నక్షత్రాలు)</th>
                    <th className="py-2 px-3">శుభాశుభ స్వభావం</th>
                    <th className="py-2 px-3">ముహూర్త & దిన ఫలితం</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {jathakam.tarabalaChakraTe.map((tr) => (
                    <tr key={tr.taraNumber} className="hover:bg-white/[0.03]">
                      <td className="py-2.5 px-3 font-bold text-[#EDE8E0] whitespace-nowrap">{tr.taraNameTe}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#C9A96E]">{tr.nakshatrasTe}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            tr.natureTe === 'పరమ శుభం'
                              ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                              : tr.natureTe === 'శుభం'
                                ? 'bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/35'
                                : 'bg-[#D47B7B]/15 text-[#D47B7B] border border-[#D47B7B]/35'
                          }`}
                        >
                          {tr.natureTe}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#EDE8E0]/85">{tr.phalamTe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 4: DEEP RESEARCH FROM 12 CLASSICAL JYOTISHA SHASTRA GRANTHAS */}
      {showSection('grantha_research') && (
        <div className="bg-[#0F1326] border border-[#C9A96E]/45 rounded-lg p-6 md:p-8 print-page-break">
          <div className="border-b border-white/10 pb-4 mb-6">
            <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">
              అధ్యాయం 4 · ప్రాచీన జ్యోతిష్య మహాగ్రంథాల ప్రమాణ పరిశోధన (12 Classical Shastra Granthas)
            </div>
            <h2 className="text-2xl font-bold text-[#EDE8E0] mt-1">
              12 ప్రాచీన సంస్కృత / తెలుగు జ్యోతిష్య గ్రంథాల శ్లోక ప్రమాణాలు & జాతక సమన్వయం
            </h2>
            <p className="text-xs text-[#EDE8E0]/65 mt-1">
              మహర్షి పరాశరులు, వరాహమిహిరులు, మంత్రేశ్వరులు, వైద్యనాథ దీక్షితులు, కళ్యాణవర్మ, రామానుజాచార్యులు, కాళిదాసు, జైమిని మహర్షి, గణేశ దైవజ్ఞులు మరియు భట్ట నారాయణుల మూల సూత్రాల ఆధారంగా మీ కుండలి విశ్లేషణ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jathakam.granthaPramanaResearch.map((g) => (
              <div
                key={g.id}
                className="bg-[#090C18]/90 border border-[#C9A96E]/30 rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-[#C9A96E]/60 transition-colors print-avoid-break"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div>
                      <h3 className="text-base font-bold text-[#C9A96E]">{g.granthaNameTe}</h3>
                      <div className="text-xs text-[#EDE8E0]/60 mt-0.5">
                        రచయిత: {g.authorTe} · {g.chapterRefTe}
                      </div>
                    </div>
                  </div>

                  {/* Authentic Sanskrit Sutra in Telugu Script */}
                  <div className="p-3 rounded bg-[#141932] border-l-2 border-[#C9A96E] text-xs text-[#C9A96E] italic leading-relaxed">
                    "{g.sanskritSlokaTe}"
                  </div>

                  <div className="text-sm font-bold text-[#5BBFB5]">{g.topicTitleTe}</div>

                  <p className="text-sm text-[#EDE8E0]/90 leading-relaxed">{g.deepAnalysisTe}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[#EDE8E0]/50">శాస్త్ర నిర్ధారణ:</span>
                  <span className="font-semibold text-[#C9A96E]">{g.keyVerdictTe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAPTER 5: 6 DEEP LIFE-PILLAR CHAPTERS (Education, Career, Wealth, Marriage, Health, Foreign/Dharma) */}
      {showSection('life_pillars') && (
        <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6 md:p-8 print-page-break">
          <div className="border-b border-white/10 pb-4 mb-6">
            <div className="text-xs uppercase tracking-widest text-[#5BBFB5] font-semibold">
              అధ్యాయం 5 · జీవిత ప్రధాన రంగాల సమగ్ర పరిశీలన
            </div>
            <h2 className="text-2xl font-bold text-[#EDE8E0] mt-1">
              జీవిత 6 ప్రధాన రంగాల లోతైన విశ్లేషణ (విద్య, ఉద్యోగం, ధనం-ఆస్తులు, వివాహం, ఆరోగ్యం & విదేశీ యోగం)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jathakam.jeevitaPradhanaRangalu.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-[#090C18]/90 border border-white/15 rounded-lg p-6 flex flex-col justify-between space-y-4 print-avoid-break"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[#C9A96E] font-mono-tabular text-xs font-bold">
                          {pillar.number}
                        </span>
                        <h3 className="text-lg font-bold text-[#EDE8E0]">{pillar.titleTe}</h3>
                      </div>
                      <div className="text-xs text-[#EDE8E0]/50 mt-0.5">{pillar.subtitleEn}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35">
                        {pillar.verdictBadgeTe} ({pillar.scorePercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#141932]/90 p-3 rounded border border-white/10">
                    <div>
                      <span className="text-[#EDE8E0]/55">ప్రధాన భావములు: </span>
                      <span className="text-[#C9A96E] font-semibold">{pillar.keyHousesTe}</span>
                    </div>
                    <div>
                      <span className="text-[#EDE8E0]/55">కారక గ్రహములు: </span>
                      <span className="text-[#5BBFB5] font-semibold">{pillar.karakaPlanetsTe}</span>
                    </div>
                  </div>

                  {pillar.analysisParagraphsTe.map((para, i) => (
                    <p key={`pillar-para-${pillar.id}-${i}`} className="text-sm text-[#EDE8E0]/90 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                  <div className="text-[#EDE8E0]/85">
                    <strong className="text-[#5BBFB5]">అనుకూల దశా కాలములు: </strong>
                    {pillar.favorablePeriodsTe}
                  </div>
                  <div className="p-2.5 rounded bg-[#C9A96E]/10 border border-[#C9A96E]/25 text-[#EDE8E0]/90">
                    <strong className="text-[#C9A96E]">శాస్త్ర సూచన & ఉపాసన: </strong>
                    {pillar.shastraGuidanceTe}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAPTER 6: DWADASHA BHAVA PHALITALU (ALL 12 HOUSES WITH SANSKRIT SUTRAS & DRISHTI) */}
      {showSection('dwadasha_bhava') && (
        <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6 md:p-8 print-page-break">
          <div className="border-b border-white/10 pb-4 mb-6">
            <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">
              అధ్యాయం 6 · ద్వాదశ భావ ఫలితములు (1 నుండి 12 భావముల సంపూర్ణ విశ్లేషణ)
            </div>
            <h2 className="text-2xl font-bold text-[#EDE8E0] mt-1">
              ద్వాదశ భావ (12 Houses) శాస్త్ర సూత్రాలు, భావాధిపతి స్థితి, గ్రహ దృష్టి & ఫలితాలు
            </h2>
            <p className="text-xs text-[#EDE8E0]/65 mt-1">
              ప్రతి భావానికి అధిపతి, ఆ భావంలో ఉన్న గ్రహాలు, ఆ భావంపై పడుతున్న గ్రహ వీక్షణలు (Drishti) మరియు నవాంశ బలంతో సవివరమైన ఫలితాలు
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jathakam.dwadashaBhavaPhalitalu.map((b) => (
              <div
                key={b.bhavaNumber}
                className="bg-[#090C18]/90 border border-white/10 rounded-lg p-5 flex flex-col justify-between space-y-3 hover:border-[#C9A96E]/40 transition-colors print-avoid-break"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div>
                      <h3 className="text-base font-bold text-[#C9A96E]">{b.titleTe}</h3>
                      <div className="text-xs text-[#EDE8E0]/55 mt-0.5">
                        రాశి: <strong className="text-[#EDE8E0]">{b.rasiNameTe}</strong> · భావాధిపతి:{' '}
                        <strong className="text-[#5BBFB5]">{b.adhipatiTe}</strong> ({b.adhipatiPlacedHouse}వ భావంలో స్థితి)
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                        b.strengthTe.includes('ఉత్తమ')
                          ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                          : b.strengthTe.includes('శాంతి')
                            ? 'bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/35'
                            : 'bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/35'
                      }`}
                    >
                      {b.strengthTe}
                    </span>
                  </div>

                  {/* Classical Sutra Citation */}
                  <div className="text-[11px] text-[#C9A96E]/90 bg-[#141932] px-3 py-1.5 rounded border-l-2 border-[#C9A96E]">
                    {b.shastraSutraTe}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {b.occupantsTe.length > 0 ? (
                      <div className="px-2.5 py-1 rounded bg-[#5BBFB5]/10 border border-[#5BBFB5]/30 text-[#5BBFB5]">
                        <strong>భావంలోని గ్రహాలు:</strong> {b.occupantsTe.join(', ')}
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded bg-white/5 text-[#EDE8E0]/55">
                        ఈ భావంలో ప్రత్యక్ష గ్రహ సంచారం లేదు (భావాధిపతి బలం ప్రధానం)
                      </div>
                    )}

                    {b.aspectingPlanetsTe.length > 0 && (
                      <div className="px-2.5 py-1 rounded bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E]">
                        <strong>గ్రహ దృష్టి (Aspects):</strong> {b.aspectingPlanetsTe.join(', ')}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-[#EDE8E0]/90 leading-relaxed pt-1">{b.predictionTe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAPTER 7: CURRENT DASHA-BHUKTI-PRATYANTARDASHA & 120-YEAR 9-MAHADASHA + 81-ANTARDASHA ROADMAP */}
      {showSection('dasha_kalachakram') && (
        <div className="space-y-6 print-page-break">
          {/* Current Active Dasha Card */}
          <div className="bg-[#0F1326] border border-[#5BBFB5]/45 rounded-lg p-6 md:p-8 print-avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#5BBFB5] font-semibold">
                  అధ్యాయం 7 · వింశోత్తరి దశా-అంతర్దశ-ప్రత్యంతర్దశ కాలచక్రం (81 భుక్తులతో)
                </div>
                <h2 className="text-2xl font-bold text-[#EDE8E0] mt-1">
                  ప్రస్తుత గోచార & వింశోత్తరి దశా-భుక్తి ఫలితములు
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/40 font-bold">
                  {jathakam.currentDashaPhalamTe.mahadashaTe}
                </span>
                <span className="px-3 py-1.5 rounded bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/40 font-bold">
                  {jathakam.currentDashaPhalamTe.antardashaTe}
                </span>
                <span className="px-3 py-1.5 rounded bg-white/10 text-[#EDE8E0] font-mono-tabular">
                  {jathakam.currentDashaPhalamTe.pratyantardashaTe}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <div className="text-xs font-mono-tabular text-[#C9A96E]">
                  ప్రస్తుత భుక్తి కాలపరిమితి: {jathakam.currentDashaPhalamTe.periodRange}
                </div>
                <p className="text-sm text-[#EDE8E0]/90 leading-relaxed">
                  {jathakam.currentDashaPhalamTe.phalamTe}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#090C18]/90 border border-[#C9A96E]/35 space-y-2">
                <div className="text-xs font-bold text-[#C9A96E]">ప్రస్తుత దశా శాంతి & ఉపాసన పరిహారం:</div>
                <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                  {jathakam.currentDashaPhalamTe.pariharamTe}
                </p>
              </div>
            </div>
          </div>

          {/* 9 Mahadasha Life-Long Roadmap WITH All 9 Antardasha (Bhukti) Sub-Tables */}
          <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#C9A96E] border-b border-white/10 pb-3 mb-5">
              సంపూర్ణ 120-సంవత్సరాల 9 మహాదశల & 81 అంతర్దశల (భుక్తుల) జీవిత కాలచక్రం
            </h3>
            <div className="space-y-5">
              {jathakam.sampoornaDashaKalachakram.map((d, dIdx) => (
                <div
                  key={`interactive-dasha-${d.lordId}-${d.startDate}-${dIdx}`}
                  className={`p-5 rounded-lg border transition-colors print-avoid-break ${
                    d.isCurrent
                      ? 'bg-[#141932] border-[#5BBFB5] shadow-lg'
                      : 'bg-[#090C18]/85 border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-bold text-[#C9A96E]">{d.lordTe}</span>
                      {d.isCurrent && (
                        <span className="px-2.5 py-0.5 text-[11px] rounded bg-[#5BBFB5] text-[#090C18] font-bold">
                          ప్రస్తుతం నడుస్తున్న మహాదశ
                        </span>
                      )}
                      <span className="text-xs font-mono-tabular text-[#EDE8E0]/75">
                        ({d.startDate} నుండి {d.endDate} వరకు · వయస్సు: {d.ageRangeTe})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#EDE8E0]/60">
                        గ్రహ స్థితి: {d.planetRasiTe} ({d.planetHouse}వ భావం · {d.dignityTe})
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded font-semibold ${
                          d.ratingTe === 'రాజయోగ కాలం'
                            ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                            : d.ratingTe === 'శుభ వృద్ధి కాలం'
                              ? 'bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/35'
                              : 'bg-white/10 text-[#EDE8E0]/80'
                        }`}
                      >
                        {d.ratingTe}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#EDE8E0]/85 leading-relaxed mb-4">{d.predictionTe}</p>

                  {/* 9 Antardasha (Bhukti) Sub-Periods Grid for this Mahadasha */}
                  <div className="bg-[#0F1326]/90 border border-white/10 rounded p-3">
                    <div className="text-[11px] font-bold text-[#C9A96E] mb-2">
                      {d.lordTe}లోని 9 అంతర్దశలు (భుక్తులు — ప్రారంభం నుండి ముగింపు తేదీలు):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-[11px]">
                      {d.antardashasTe.map((ant) => (
                        <div
                          key={`${d.lordId}-${ant.bhuktiLordTe}`}
                          className={`p-2 rounded border ${
                            ant.isCurrent
                              ? 'bg-[#5BBFB5]/20 border-[#5BBFB5] text-[#EDE8E0] font-bold'
                              : 'bg-[#090C18]/80 border-white/10 text-[#EDE8E0]/80'
                          }`}
                        >
                          <div className="font-bold text-[#C9A96E]">{ant.bhuktiLordTe} భుక్తి</div>
                          <div className="font-mono-tabular text-[10px] mt-0.5">
                            {ant.startDate}
                          </div>
                          <div className="font-mono-tabular text-[10px] text-[#5BBFB5]">
                            → {ant.endDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 8A: PHALA VIVECHANA — SAV PHALA, 81 BHUKTI PHALA & SAHAYAKA INDEX */}
      {showSection('phala_vivechana') && (
        <div className="bg-[#0F1326] border border-white/15 rounded-lg p-5 md:p-7 space-y-6 print-page-break">
          <div className="border-b border-white/10 pb-4">
            <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">
              అధ్యాయం 8A · ఫల విచారణ — బిందు బలం, భుక్తి ఫలం & గ్రహ సహాయక సూచిక
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#EDE8E0] mt-1">
              సాముదాయిక అష్టకవర్గ ఫలితాలు (12 భావాలు), 81 భుక్తి ఫలాలు & 9×7 గ్రహ సహాయక సూచిక
            </h2>
            <p className="text-[12px] leading-relaxed text-[#EDE8E0]/60 mt-1.5">
              116-పుటల ప్రామాణిక పత్రికలోని 108–114 (సాముదాయిక అష్టకవర్గ ఫలం), 67–107 (అంతర దశా ఫల పుస్తకం) మరియు 29 (గ్రహ సహాయక సూచిక) పుటల సరిపడే అధ్యాయం — ప్రతి సంఖ్యతో పాటు సూత్రం కూడా చూపబడింది.
            </p>
          </div>

          {/* SAV PHALA */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2">
              1. సాముదాయిక అష్టకవర్గ ఫలితాలు — 12 భావాల బలం ({avPhala.totalBindus} బిందువులు, సగటు {avPhala.averageBindus})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono-tabular">
                <thead className="text-[#C9A96E]/70 uppercase tracking-wider text-[9px]">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-1.5 pr-2">భావం</th>
                    <th className="text-left py-1.5 pr-2">రాశి</th>
                    <th className="text-left py-1.5 pr-2">బిందువులు</th>
                    <th className="text-left py-1.5 pr-2">వర్గం</th>
                    <th className="text-left py-1.5">అధిపతి స్థితి</th>
                  </tr>
                </thead>
                <tbody>
                  {avPhala.rows.map((r) => (
                    <tr key={r.house} className="border-b border-white/5">
                      <td className="py-1.5 pr-2 text-[#EDE8E0]/80 whitespace-nowrap">{r.house}. {r.houseNameTe}</td>
                      <td className="py-1.5 pr-2 text-[#EDE8E0]/60 whitespace-nowrap">{r.signTe}</td>
                      <td className="py-1.5 pr-2 font-bold text-[#EDE8E0]">{r.bindus}</td>
                      <td className={'py-1.5 pr-2 whitespace-nowrap ' + (r.band === 'strong' ? 'text-[#5BBFB5]' : r.band === 'moderate' ? 'text-[#C9A96E]' : 'text-[#E08585]')}>
                        {r.bandLabelTe}
                      </td>
                      <td className="py-1.5 text-[#EDE8E0]/55">{r.lordPlacementTe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {avPhala.rows.map((r) => (
                <div key={`p-${r.house}`} className="rounded-lg border border-white/10 bg-[#090C18]/70 px-3 py-2">
                  <div className="text-[11.5px] font-semibold text-[#C9A96E]">
                    {r.house}వ భావం · {r.signTe} · {r.bindus} బిందువులు · {r.bandLabelTe}
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#EDE8E0]/75 mt-1">{r.phalaTe}</p>
                  {r.band !== 'strong' && (
                    <p className="text-[10.5px] leading-relaxed text-[#5BBFB5]/85 mt-1">పరిహారం: {r.pariharaTe}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-[#C9A96E]/25 bg-[#C9A96E]/[0.06] px-3.5 py-3 space-y-1.5">
              <p className="text-[11.5px] leading-relaxed text-[#EDE8E0]/85">{avPhala.synthesisTe}</p>
              <p className="text-[11px] leading-relaxed text-[#EDE8E0]/60">{avPhala.lagnaSeventhNoteTe}</p>
              <p className="text-[11px] leading-relaxed text-[#EDE8E0]/60">{avPhala.rasiRankingTe}</p>
              <p className="text-[10px] leading-relaxed text-[#EDE8E0]/40">{avPhala.classicalRuleTe}</p>
            </div>
          </section>

          {/* 81 BHUKTI PHALA */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2">
              2. అంతర దశా ఫల పుస్తకం — 9 మహాదశలు × 9 భుక్తులు = 81 ఫలాలు
            </h3>
            <p className="text-[11.5px] leading-relaxed text-[#EDE8E0]/70">{adBook.currentPathTe}</p>
            <div className="flex flex-wrap gap-1.5">
              {adBook.sections.map((sec, i) => (
                <button
                  key={`${sec.lord}-${i}`}
                  onClick={() => setOpenMahaIdx(i)}
                  className={
                    'px-2.5 py-1 rounded-full text-[10.5px] border cursor-pointer ' +
                    (i === openMahaIdx
                      ? 'bg-[#C9A96E]/20 border-[#C9A96E]/60 text-[#C9A96E] font-semibold'
                      : 'bg-[#090C18]/70 border-white/10 text-[#EDE8E0]/60 hover:border-[#C9A96E]/40')
                  }
                >
                  {sec.lordTe} · {sec.startLocal.slice(0, 4)}
                </button>
              ))}
            </div>
            {adBook.sections[openMahaIdx] && (
              <div className="space-y-2">
                <div className="rounded-lg border border-[#5BBFB5]/25 bg-[#5BBFB5]/[0.06] px-3 py-2">
                  <div className="text-[11.5px] font-semibold text-[#5BBFB5]">
                    {adBook.sections[openMahaIdx].lordTe} మహాదశ · {adBook.sections[openMahaIdx].startLocal.slice(0, 10)} → {adBook.sections[openMahaIdx].endLocal.slice(0, 10)} · సగటు అనుకూలత {adBook.sections[openMahaIdx].scoreAvg}/100
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#EDE8E0]/70 mt-1">{adBook.sections[openMahaIdx].summaryTe}</p>
                </div>
                {adBook.sections[openMahaIdx].rows.map((r) => (
                  <div key={`${r.mahaLord}-${r.bhuktiLord}`} className={'rounded-lg border px-3 py-2 ' + (r.isRunning ? 'border-[#5BBFB5]/50 bg-[#5BBFB5]/[0.06]' : 'border-white/10 bg-[#090C18]/60')}>
                    <div className="text-[11px] font-semibold text-[#EDE8E0]">
                      {r.bhuktiLordTe} భుక్తి · <span className="font-mono-tabular text-[10px] font-normal text-[#EDE8E0]/55">{r.startLocal.slice(0, 10)} → {r.endLocal.slice(0, 10)} ({r.widthTe})</span>
                      {r.isRunning && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#5BBFB5]/25 text-[#5BBFB5] text-[8.5px] font-bold">నడుస్తోంది</span>}
                    </div>
                    <div className="text-[10.5px] font-semibold text-[#C9A96E] mt-0.5">{r.headlineTe} · {r.score}/100</div>
                    <p className="text-[11px] leading-relaxed text-[#EDE8E0]/75 mt-1">{r.phalaTe}</p>
                    <p className="text-[10px] leading-relaxed text-[#E08585]/80 mt-1">జాగ్రత్త: {r.cautionTe}</p>
                    <p className="text-[10px] leading-relaxed text-[#5BBFB5]/80 mt-0.5">పరిహారం: {r.remedyTe}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] leading-relaxed text-[#EDE8E0]/45">{adBook.methodNoteTe}</p>
            <p className="text-[10px] leading-relaxed text-[#EDE8E0]/40">{adBook.sourceNoteTe}</p>
          </section>

          {/* SAHAYAKA */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-[#C9A96E] border-b border-white/10 pb-2">
              3. గ్రహ సహాయక సూచిక — 9 గ్రహాలు × 7 జీవితాంశాలు (−100 … +100)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10.5px] font-mono-tabular">
                <thead className="text-[#C9A96E]/70 uppercase tracking-wider text-[8.5px]">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-1.5 pr-2">గ్రహం</th>
                    <th className="py-1.5 px-1">భావం</th>
                    {SAHAYAKA_AREAS.map((a) => (
                      <th key={a.id} className="py-1.5 px-1 text-center whitespace-nowrap">{a.labelTe}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sahayaka.rows.map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-1.5 pr-2 text-[#EDE8E0] font-sans font-semibold whitespace-nowrap">
                        {r.nameTe} <span className="text-[8.5px] text-[#EDE8E0]/35">{r.dignityTe}</span>
                      </td>
                      <td className="py-1.5 px-1 text-center text-[#EDE8E0]/50">{r.house}</td>
                      {SAHAYAKA_AREAS.map((a) => {
                        const v = r.scores[a.id];
                        return (
                          <td key={a.id} className={'py-1.5 px-1 text-center font-bold ' + (v >= 50 ? 'text-[#5BBFB5]' : v >= 20 ? 'text-[#C9A96E]' : v >= 0 ? 'text-[#EDE8E0]/70' : 'text-[#E08585]')}>
                            {v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t border-[#C9A96E]/30">
                    <td className="py-1.5 pr-2 text-[#C9A96E] font-sans font-bold">సగటు</td>
                    <td className="py-1.5 px-1" />
                    {SAHAYAKA_AREAS.map((a) => (
                      <td key={a.id} className="py-1.5 px-1 text-center font-bold text-[#C9A96E]">{sahayaka.averages[a.id]}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#090C18]/70 px-3.5 py-3 space-y-1.5">
              <p className="text-[11.5px] leading-relaxed text-[#EDE8E0]/85">{sahayaka.synthesisTe}</p>
              <p className="text-[10.5px] leading-relaxed text-[#EDE8E0]/55">{sahayaka.areaRankingTe}</p>
              <p className="text-[10.5px] leading-relaxed text-[#EDE8E0]/55">{sahayaka.planetRankingTe}</p>
              <p className="text-[10px] leading-relaxed text-[#EDE8E0]/40">{sahayaka.methodNoteTe}</p>
            </div>
          </section>
        </div>
      )}

      {/* CHAPTER 8: DOSHA PARIKSHANA & SHANTI PARIHARAMULU */}
      {showSection('dosha_parihara') && (
        <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6 md:p-8 print-page-break">
          <div className="border-b border-white/10 pb-4 mb-6">
            <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">
              అధ్యాయం 8 · దోష పరిశీలన & వేద శాంతి పరిహారములు
            </div>
            <h2 className="text-2xl font-bold text-[#EDE8E0] mt-1">
              కుజ దోషం, కాలసర్ప దోషం & శని స్థితి నిర్ధారణ — శాస్త్రీయ పరిహారాలు
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {jathakam.doshaParikshana.map((dosha, idx) => (
              <div
                key={`dosha-${dosha.nameTe}-${idx}`}
                className="bg-[#090C18]/90 border border-white/15 rounded-lg p-5 flex flex-col justify-between space-y-4 print-avoid-break"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-[#EDE8E0]">{dosha.nameTe}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold shrink-0 ${
                        !dosha.isPresent
                          ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                          : 'bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/35'
                      }`}
                    >
                      {dosha.severityTe}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#C9A96E]">{dosha.statusTe}</div>
                  <p className="text-sm text-[#EDE8E0]/85 leading-relaxed">{dosha.explanationTe}</p>
                </div>

                <div className="p-3.5 rounded bg-[#141932] border border-[#C9A96E]/30 text-xs">
                  <strong className="text-[#C9A96E] block mb-1">శాంతి పరిహారం & ఆరాధన:</strong>
                  <span className="text-[#EDE8E0]/90 leading-relaxed">{dosha.remedyTe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAPTER 9: UPAYA & PARIHARAS (శాస్త్రోక్త వైదిక ఉపాయములు & పరిహార శాస్త్రం — Mantras, Dana, Ratna & Kshetra Shastra) */}
      {(showSection('upaya_pariharas') || activeChapter === 'dosha_parihara') && (
        <div className="space-y-8 print-page-break">
          {/* Header & Diagnostic Summary Card */}
          <div className="bg-gradient-to-b from-[#141932] to-[#0F1326] border-2 border-[#C9A96E]/55 rounded-lg p-6 md:p-8 print-avoid-break">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#C9A96E]/25 pb-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#C9A96E]" />
                  అధ్యాయం 9 · ఉపాయములు & శాస్త్రోక్త వైదిక పరిహారాలు (Upaya & Pariharas — BPHS Graha Shanti)
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#EDE8E0] mt-1">
                  పాపగ్రహ పీడా నిర్ధారణ · మంత్ర జపం, హోమం, దాన ధర్మం, రత్న & రుద్రాక్ష శాస్త్రం
                </h2>
                <p className="text-xs text-[#EDE8E0]/75 mt-1.5 max-w-4xl leading-relaxed">
                  బృహత్ పరాశర హోరా శాస్త్రం (గ్రహ శాంతి అధ్యాయం 84–97), గరుడ పురాణ రత్న పరీక్ష & జాతక పారిజాతం ప్రమాణంగా మీ కుండలిలోని దుస్థాన (6, 8, 12), నీచ, అస్తంగత్వ (మౌఢ్య), వక్ర, బాధక మరియు మారక గ్రహ ప్రభావాలను గణించి సిద్ధం చేసిన వ్యక్తిగత పరిహార మహాపత్రం.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded bg-[#090C18] border border-[#C9A96E]/40 text-[#C9A96E] font-bold">
                  జన్మ లగ్నం: {upayaReport.lagnaNameTe} (అధిపతి: {upayaReport.lagnaLordTe})
                </span>
                <span className="px-3 py-1.5 rounded bg-[#090C18] border border-[#D47B7B]/40 text-[#D47B7B] font-bold">
                  బాధకాధిపతి ({upayaReport.badhakaSthana}వ భావం): {upayaReport.badhakaLordTe}
                </span>
                <span className="px-3 py-1.5 rounded bg-[#090C18] border border-white/15 text-[#EDE8E0]/85 font-semibold">
                  మారకాధిపతులు: {upayaReport.marakaLordsTe.join(', ')}
                </span>
              </div>
            </div>

            {/* Overall Siddhanti Diagnosis & Current Dasha Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5">
              <div className="lg:col-span-7 bg-[#090C18]/90 border border-white/15 rounded-lg p-5 space-y-2.5">
                <div className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider">
                  సిద్ధాంతి సమగ్ర గ్రహ పీడా విశ్లేషణ (Chart Malefic Influence Verdict):
                </div>
                <p className="text-sm text-[#EDE8E0]/90 leading-relaxed">
                  {upayaReport.overallAfflictionSummaryTe}
                </p>
              </div>

              <div className="lg:col-span-5 bg-[#090C18]/90 border border-[#5BBFB5]/40 rounded-lg p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#5BBFB5]">
                    ప్రస్తుత దశా-భుక్తి తక్షణ పరిహార కేంద్రం:
                  </span>
                  <span className="text-[11px] font-mono-tabular text-[#C9A96E]">
                    {upayaReport.activeDashaRemedyFocusTe.periodRange}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#EDE8E0]">
                  {upayaReport.activeDashaRemedyFocusTe.mahaLordTe} మహాదశ ·{' '}
                  {upayaReport.activeDashaRemedyFocusTe.bhuktiLordTe} భుక్తి ·{' '}
                  {upayaReport.activeDashaRemedyFocusTe.antarLordTe} అంతర
                </div>
                <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                  {upayaReport.activeDashaRemedyFocusTe.immediatePariharaTe}
                </p>
              </div>
            </div>

            {/* Interactive Sub-Filter Bar inside Upaya & Pariharas */}
            <div className="no-print mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'సంపూర్ణ పరిహార దర్శిని (All Sections)' },
                  { id: 'mantra_dana', label: '1. గ్రహ పీడా, మంత్రం, హోమం & దాన విధి' },
                  { id: 'ratna_rudraksha', label: '2. రత్న శాస్త్రం & రుద్రాక్ష నిర్ణయం' },
                  { id: 'pancha_upaya', label: '3. పంచ మహా ఉపాయములు & నిత్య కర్మ' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRemedySubFilter(tab.id as typeof remedySubFilter)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                      remedySubFilter === tab.id
                        ? 'bg-[#C9A96E] text-[#090C18]'
                        : 'bg-[#090C18] text-[#EDE8E0]/75 border border-white/15 hover:text-[#EDE8E0]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {(remedySubFilter === 'all' || remedySubFilter === 'mantra_dana') && (
                <button
                  onClick={() => setShowAllPlanetsInRemedy(!showAllPlanetsInRemedy)}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-[#090C18] border border-[#5BBFB5]/40 text-[#5BBFB5] hover:bg-[#5BBFB5]/10 cursor-pointer"
                >
                  {showAllPlanetsInRemedy
                    ? 'ప్రధాన పీడిత గ్రహాలను మాత్రమే చూపించు (Top Afflicted Only)'
                    : 'నవగ్రహాల (9 గ్రహాల) పూర్తి పరిహారాలు చూపించు (Show All 9 Grahas)'}
                </button>
              )}
            </div>
          </div>

          {/* SUB-SECTION A: MALEFIC PLANETARY INFLUENCES -> MANTRAS, HOMA, DANA & KSHETRA DARSHANAM */}
          {(remedySubFilter === 'all' || remedySubFilter === 'mantra_dana') && (
            <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#C9A96E] flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#C9A96E]" />
                    9A. కుండలిలో పాపగ్రహ పీడా నిర్ధారణ — బీజ మంత్రం, హోమ సమిధ, దాన ధర్మం & పుణ్యక్షేత్ర దర్శనం
                  </h3>
                  <p className="text-xs text-[#EDE8E0]/70 mt-1">
                    మీ కుండలిలో అత్యధికంగా పీడింపబడిన / పాప ఆధిపత్యం కలిగిన గ్రహాల క్రమంలో (Affliction Priority Order) శాస్త్రోక్త పరిహారాలు:
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {(showAllPlanetsInRemedy
                  ? upayaReport.maleficInfluences
                  : upayaReport.maleficInfluences.slice(0, 6)
                ).map((item, idx) => (
                  <div
                    key={item.planetId}
                    className={`rounded-lg border p-5 md:p-6 space-y-4 print-avoid-break ${
                      item.severity === 'critical'
                        ? 'bg-[#141932]/95 border-[#D47B7B]/55'
                        : item.severity === 'moderate'
                          ? 'bg-[#090C18]/95 border-[#E0A96D]/45'
                          : 'bg-[#090C18]/85 border-white/15'
                    }`}
                  >
                    {/* Planet Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E] text-[#C9A96E] font-mono-tabular text-xs font-bold flex items-center justify-center">
                          0{idx + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-bold text-[#EDE8E0]">{item.planetNameTe}</h4>
                            <span className="text-xs text-[#C9A96E] font-semibold">
                              ({item.rasiNameTe} · {item.house}వ భావం · {item.degreeFormatted})
                            </span>
                            {item.isRetrograde && (
                              <span className="px-2 py-0.5 text-[10px] rounded bg-[#D47B7B]/20 text-[#D47B7B] font-bold">
                                వక్రం (Retrograde)
                              </span>
                            )}
                            {item.isCombust && (
                              <span className="px-2 py-0.5 text-[10px] rounded bg-[#E0A96D]/20 text-[#E0A96D] font-bold">
                                మౌఢ్యం / అస్తంగత్వం ({item.combustDistanceDeg}°)
                              </span>
                            )}
                            {item.isCurrentDashaOrBhukti && (
                              <span className="px-2 py-0.5 text-[10px] rounded bg-[#5BBFB5]/20 text-[#5BBFB5] border border-[#5BBFB5]/40 font-bold">
                                ప్రస్తుత దశా/భుక్తి నాథుడు
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#EDE8E0]/70 mt-0.5">
                            ఆధిపత్యం: <strong className="text-[#C9A96E]">{item.functionalRoleTe}</strong> · స్థితి:{' '}
                            {item.dignityTe} · షడ్బలం: {item.shadbalaPercent}% · అష్టకవర్గ బిందువులు:{' '}
                            {item.ashtakavargaBindus}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${
                            item.severity === 'critical'
                              ? 'bg-[#D47B7B]/20 text-[#D47B7B] border border-[#D47B7B]/45'
                              : item.severity === 'moderate'
                                ? 'bg-[#E0A96D]/20 text-[#E0A96D] border border-[#E0A96D]/45'
                                : 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/35'
                          }`}
                        >
                          {item.severityLabelTe} ({item.afflictionScore}%)
                        </span>
                      </div>
                    </div>

                    {/* Why this planet needs remedy in THIS chart */}
                    <div className="bg-[#0F1326] border border-white/10 rounded p-3.5 space-y-1.5">
                      <div className="text-xs font-bold text-[#E0A96D]">
                        ఈ జాతక కుండలిలో పరిహారం అవసరమగుటకు గల శాస్త్రీయ కారణాలు:
                      </div>
                      <ul className="space-y-1 text-xs text-[#EDE8E0]/90 list-disc list-inside leading-relaxed">
                        {item.afflictionReasonsTe.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 3-Column Vedic Remedy Prescription: 1. Mantra & Homa, 2. Dana (Charity), 3. Temple & Vrata */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Column 1: Mantra & Homa */}
                      <div className="bg-[#141932]/90 border border-[#C9A96E]/35 rounded-lg p-4 space-y-2">
                        <div className="text-xs font-bold text-[#C9A96E] border-b border-white/10 pb-1.5">
                          1. మంత్ర జపం, స్తోత్రం & హోమ విధి (Mantra & Homa)
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="text-[#EDE8E0]/60 block text-[11px]">తాంత్రిక బీజ మంత్రం:</span>
                            <strong className="text-[#5BBFB5] text-sm block mt-0.5">
                              {item.mantraUpaya.beejaMantraTe}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60 block text-[11px]">వేద మంత్రం:</span>
                            <span className="text-[#EDE8E0]/90 italic leading-relaxed block">
                              "{item.mantraUpaya.vedicMantraTe}"
                            </span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">నిత్య పారాయణ స్తోత్రం: </span>
                            <strong className="text-[#C9A96E]">{item.mantraUpaya.stotraOrSuktamTe}</strong>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">జప సంఖ్య: </span>
                            <span className="text-[#EDE8E0] font-semibold">
                              {item.mantraUpaya.dailyCountTe} (మొత్తం: {item.mantraUpaya.japaCountTe})
                            </span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">హోమ సమిధ: </span>
                            <span className="text-[#EDE8E0]/90">{item.mantraUpaya.homaSamidhaTe}</span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">సమయం & దిశ: </span>
                            <span className="text-[#5BBFB5]">{item.mantraUpaya.bestTimeAndDirectionTe}</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Shastric Dana (Charity) */}
                      <div className="bg-[#141932]/90 border border-[#5BBFB5]/35 rounded-lg p-4 space-y-2">
                        <div className="text-xs font-bold text-[#5BBFB5] border-b border-white/10 pb-1.5">
                          2. శాస్త్రోక్త దాన ధర్మ విధి (Vedic Dana / Charity)
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="text-[#EDE8E0]/60 block text-[11px]">దానమివ్వవలసిన ద్రవ్యములు:</span>
                            <strong className="text-[#EDE8E0] block mt-0.5 leading-relaxed">
                              {item.danaUpaya.danaItemsTe}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">వస్త్రం & లోహం: </span>
                            <span className="text-[#C9A96E] font-semibold">
                              {item.danaUpaya.vastramColorTe} · {item.danaUpaya.metalOrVesselTe}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">ఎవరికి దానం ఇవ్వాలి: </span>
                            <span className="text-[#EDE8E0]/90">{item.danaUpaya.recipientTe}</span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">దాన సమయం (వారం & హోర): </span>
                            <span className="text-[#5BBFB5] font-semibold">{item.danaUpaya.dayAndHoraTe}</span>
                          </div>
                          <div className="pt-1 border-t border-white/10">
                            <span className="text-[#C9A96E] font-semibold">దాన ఫలితం: </span>
                            <span className="text-[#EDE8E0]/85 leading-relaxed">{item.danaUpaya.phalaTe}</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Parihara Kshetra & Vrata */}
                      <div className="bg-[#141932]/90 border border-white/15 rounded-lg p-4 space-y-2">
                        <div className="text-xs font-bold text-[#EDE8E0] border-b border-white/10 pb-1.5">
                          3. పుణ్యక్షేత్ర దర్శనం & నిత్య జీవన ఉపాయం
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="text-[#EDE8E0]/60 block text-[11px]">దర్శించవలసిన పరిహార క్షేత్రం:</span>
                            <strong className="text-[#C9A96E] block mt-0.5 leading-relaxed">
                              {item.templeAndSevaUpaya.kshetraNameTe}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60 block text-[11px]">ఆలయ సేవ / అభిషేకం:</span>
                            <span className="text-[#5BBFB5] font-semibold block mt-0.5 leading-relaxed">
                              {item.templeAndSevaUpaya.abhishekamOrArchanaTe}
                            </span>
                          </div>
                          <div className="pt-1 border-t border-white/10">
                            <span className="text-[#EDE8E0]/60 block text-[11px]">
                              ఆచరించవలసిన నిత్య కర్మ ఉపాయం (Lifestyle Upaya):
                            </span>
                            <span className="text-[#EDE8E0]/90 leading-relaxed block mt-0.5">
                              {item.templeAndSevaUpaya.vrataOrKarmaUpayaTe}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#EDE8E0]/55 pt-1">
                            అధిదేవత: {item.mantraUpaya.adhidevataTe}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-SECTION B: VEDIC RATNA SHASTRA (GEMSTONE & RUDRAKSHA SELECTION + PROHIBITED GEMS) */}
          {(remedySubFilter === 'all' || remedySubFilter === 'ratna_rudraksha') && (
            <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-lg p-6 md:p-8 space-y-6 print-avoid-break">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-[#C9A96E] flex items-center gap-2">
                  <Gem className="w-5 h-5 text-[#C9A96E]" />
                  9B. శాస్త్రోక్త రత్న శాస్త్రం & రుద్రాక్ష కవచ నిర్ణయం (Vedic Gemstone & Rudraksha Prescription)
                </h3>
                <p className="text-xs text-[#EDE8E0]/80 mt-1.5 leading-relaxed">
                  {upayaReport.ratnaShastra.shastricRuleTe}
                </p>
              </div>

              {/* Recommended Trikona Gemstones */}
              <div>
                <div className="text-sm font-bold text-[#5BBFB5] mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBFB5]" />
                  మీ {upayaReport.lagnaNameTe} లగ్నానికి ధరించదగిన శుభ త్రికోణ రత్నాలు (Benefic Lifesaving Gemstones):
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {upayaReport.ratnaShastra.recommendedGems.map((gem) => (
                    <div
                      key={gem.planetId}
                      className="bg-[#090C18]/95 border border-[#C9A96E]/45 rounded-lg p-5 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <span className="text-xs font-bold text-[#C9A96E]">{gem.roleTe}</span>
                          <span className="px-2 py-0.5 rounded bg-[#5BBFB5]/15 text-[#5BBFB5] text-[10px] font-bold">
                            {gem.planetNameTe}
                          </span>
                        </div>

                        <div className="pt-1">
                          <div className="text-lg font-bold text-[#EDE8E0]">{gem.primaryGemTe}</div>
                          <div className="text-[11px] text-[#EDE8E0]/60">{gem.primaryGemEn}</div>
                        </div>

                        <div className="space-y-1 text-xs pt-1">
                          <div>
                            <span className="text-[#EDE8E0]/60">ఉప-రత్నం (ప్రత్యామ్నాయం): </span>
                            <span className="text-[#5BBFB5] font-semibold">{gem.subGemTe}</span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">బరువు (Carat / Ratti): </span>
                            <span className="text-[#EDE8E0] font-semibold">{gem.weightRattiOrCaratTe}</span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">లోహం & వేలు: </span>
                            <span className="text-[#C9A96E] font-semibold">
                              {gem.metalTe} · {gem.fingerTe}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">ధారణ ముహూర్తం: </span>
                            <span className="text-[#EDE8E0]/90">{gem.wearingDayAndHoraTe}</span>
                          </div>
                          <div>
                            <span className="text-[#EDE8E0]/60">రుద్రాక్ష ప్రత్యామ్నాయం: </span>
                            <span className="text-[#5BBFB5] font-semibold">{gem.rudrakshaMukhiTe}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded bg-[#141932] border border-white/10 text-xs space-y-1">
                        <div className="font-bold text-[#C9A96E]">జాతక పరిశీలన నిర్ధారణ:</div>
                        <p className="text-[#EDE8E0]/85 leading-relaxed">{gem.whyWearInThisChartTe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strictly Prohibited Gemstones Warning Table */}
              <div className="pt-2">
                <div className="text-sm font-bold text-[#D47B7B] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D47B7B]" />
                  ఈ కుండలికి ధరించకూడని నిషిద్ధ రత్నాలు (Strictly Avoid These Malefic Gemstones):
                </div>
                <div className="overflow-x-auto border border-[#D47B7B]/35 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#141932] border-b border-white/10 text-[#C9A96E]">
                        <th className="py-2.5 px-3">గ్రహం & ఆధిపత్యం</th>
                        <th className="py-2.5 px-3">నిషిద్ధ రత్నం</th>
                        <th className="py-2.5 px-3">ఎందుకు ధరించకూడదు? (శాస్త్రీయ కారణం)</th>
                        <th className="py-2.5 px-3">ప్రత్యామ్నాయ శాంతి మార్గం</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-[#090C18]/90">
                      {upayaReport.ratnaShastra.prohibitedGems.map((pg) => (
                        <tr key={pg.planetId} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 font-bold text-[#EDE8E0]">
                            {pg.planetNameTe}
                            <span className="block text-[10px] text-[#D47B7B] font-normal">
                              ({pg.ruledHousesTe})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#D47B7B]">{pg.gemNameTe}</td>
                          <td className="py-2.5 px-3 text-[#EDE8E0]/85 leading-relaxed">
                            {pg.reasonToAvoidTe}
                          </td>
                          <td className="py-2.5 px-3 text-[#5BBFB5] leading-relaxed">
                            {pg.alternativeRemedyTe}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sacred Rudraksha Kavacham */}
              <div className="bg-[#090C18] border border-[#5BBFB5]/40 rounded-lg p-5 space-y-3">
                <div className="text-sm font-bold text-[#5BBFB5]">
                  పరమ పవిత్ర రుద్రాక్ష త్రిశూల రక్షణ కవచం (Zero Side-Effect Rudraksha Kavacham):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded bg-[#141932] border border-white/10 font-semibold text-[#EDE8E0]">
                    {upayaReport.ratnaShastra.rudrakshaKavachamTe.lagnaRudrakshaTe}
                  </div>
                  <div className="p-3 rounded bg-[#141932] border border-white/10 font-semibold text-[#C9A96E]">
                    {upayaReport.ratnaShastra.rudrakshaKavachamTe.nakshatraRudrakshaTe}
                  </div>
                  <div className="p-3 rounded bg-[#141932] border border-white/10 font-semibold text-[#5BBFB5]">
                    {upayaReport.ratnaShastra.rudrakshaKavachamTe.dashaRudrakshaTe}
                  </div>
                </div>
                <p className="text-xs text-[#EDE8E0]/80 leading-relaxed">
                  {upayaReport.ratnaShastra.rudrakshaKavachamTe.wearingRulesTe}
                </p>
              </div>
            </div>
          )}

          {/* SUB-SECTION C: PANCHA MAHA UPAYAS (5 DAILY KARMIC & LIFESTYLE REMEDIES) */}
          {(remedySubFilter === 'all' || remedySubFilter === 'pancha_upaya') && (
            <div className="bg-[#0F1326] border border-white/15 rounded-lg p-6 md:p-8 space-y-5 print-avoid-break">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-xl font-bold text-[#C9A96E]">
                  9C. పంచ మహా ఉపాయములు — నిత్య జీవన కర్మ విమోచన & అదృష్ట వృద్ధి సూత్రాలు
                </h3>
                <p className="text-xs text-[#EDE8E0]/70 mt-1">
                  ఖర్చు లేకుండా భక్తి, క్రమశిక్షణ మరియు జీవ కారుణ్యంతో ప్రారబ్ధ కర్మను అనుకూలంగా మార్చుకునే 5 వేద మార్గాలు:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upayaReport.panchaMahaUpayasTe.map((up, uIdx) => (
                  <div
                    key={uIdx}
                    className="bg-[#090C18]/90 border border-white/15 rounded-lg p-5 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono-tabular text-[#C9A96E] font-bold">
                        {up.categoryTe}
                      </div>
                      <h4 className="text-base font-bold text-[#EDE8E0]">{up.titleTe}</h4>
                      <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">{up.prescriptionTe}</p>
                    </div>
                    <div className="pt-3 border-t border-white/10 space-y-1 text-xs">
                      <div>
                        <span className="text-[#EDE8E0]/60">ఆచరించవలసిన సమయం: </span>
                        <span className="text-[#5BBFB5] font-semibold">{up.timingTe}</span>
                      </div>
                      <div>
                        <span className="text-[#C9A96E] font-semibold">శాస్త్ర ఫలం: </span>
                        <span className="text-[#EDE8E0]/80">{up.shastricBenefitTe}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traditional Siddhanti Colophon / Seal for Print & PDF */}
          <div className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-lg p-6 text-center space-y-1.5 print-avoid-break">
            <div className="text-xs font-bold text-[#C9A96E] tracking-widest">
              || స్వస్తి ప్రజాభ్యః పరిపాలయంతాం న్యాయేన మార్గేణ మహీం మహీశాః · లోకాః సమస్తాః సుఖినో భవంతు ||
            </div>
            <p className="text-xs text-[#EDE8E0]/65">
              ఈ సంపూర్ణ తెలుగు జాతక మహాగ్రంథం & వైదిక పరిహార శాస్త్రం దృగ్గణిత చిత్రపక్ష (లహరి) అయనాంశ ప్రమాణంగా గణించబడినది · AstroSphere Jyotisha Peetham
            </p>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHAPTER 0B: TAJIKA VARSHAPHALA & 12-MONTH FORECAST                    */}
      {/* ===================================================================== */}
      {showSection('tajika_varshaphala') && (
        <div className="pt-2">
          <TajikaVarshaphalaView chart={chart} embeddedMode />
        </div>
      )}
      </div>
    </div>
  );
};
