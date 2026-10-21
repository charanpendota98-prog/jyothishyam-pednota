import React, { useState } from 'react';
import {
  Printer,
  FileText,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
  Compass,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react';

export interface PrintableSectionItem {
  pageNum: number;
  id: string;
  titleTe: string;
  titleEn: string;
  descriptionTe: string;
  categoryTe: string;
  recommendedFor: string;
}

export const PRINTABLE_JATHAKA_PAGES: PrintableSectionItem[] = [
  {
    pageNum: 1,
    id: 'page_1_mukhapatram',
    titleTe: 'పుట 1: ముఖపత్రం, పంచాంగం, లగ్న-నవాంశ కుండలి & స్ఫుటాలు',
    titleEn: 'Page 1: Title, Master Panchanga & D1/D9 Kundali',
    descriptionTe: 'జనన వివరాలు, పంచాంగ పంచాంగాలు, లగ్న-నవాంశ చక్రాలు, నిరయన గ్రహ స్ఫుట పట్టిక.',
    categoryTe: 'ప్రధాన కుండలి',
    recommendedFor: 'అన్ని ముద్రణలలో తప్పనిసరి',
  },
  {
    pageNum: 2,
    id: 'page_2_chalita_upagraha',
    titleTe: 'పుట 2: భావ చలిత పట్టిక, చలిత కుండలి & 11 ఉపగ్రహాలు',
    titleEn: 'Page 2: Bhava Chalita, Upagrahas & Friendship',
    descriptionTe: 'శ్రీపతి భావ చలిత ఆరంభ/మధ్య/సంధి స్ఫుటాలు, ధూమ/వ్యాతీపాత ఉపగ్రహాలు, పంచధా మైత్రి.',
    categoryTe: 'చలిత & ఉపగ్రహాలు',
    recommendedFor: 'లోతైన భావ విశ్లేషణకు',
  },
  {
    pageNum: 3,
    id: 'page_3_shodashavarga',
    titleTe: 'పుట 3: షోడశవర్గ చక్ర మాలిక (D2-D12) & వైశేషికాంశ బలం',
    titleEn: 'Page 3: Shodashavarga Charts (D2-D12) & Vaisheshikamsa',
    descriptionTe: 'హోరా (D2), ద్రేక్కాణ (D3), చతుర్థాంశ (D4), సప్తాంశ (D7), దశాంశ (D10), ద్వాదశాంశ (D12).',
    categoryTe: 'వర్గ చక్రాలు',
    recommendedFor: 'వృత్తి, సంతాన, ఆస్తి విచారణకు',
  },
  {
    pageNum: 4,
    id: 'page_4_shadbala_bhava',
    titleTe: 'పుట 4: షడ్బల పిండం, ఇష్ట-కష్ట ఫలాలు & భావ బలం',
    titleEn: 'Page 4: Shadbala Pinda, Ishta/Kashta & Bhava Bala',
    descriptionTe: 'సప్త గ్రహాల ఆరు విధాల బలాలు (విరూపలు & రూపాలు), ఇష్ట-కష్ట గణన, ద్వాదశ భావ బలాలు.',
    categoryTe: 'గ్రహ బలాలు',
    recommendedFor: 'గ్రహ సామర్థ్య విశ్లేషణకు',
  },
  {
    pageNum: 5,
    id: 'page_5_ashtakavarga',
    titleTe: 'పుట 5: భిన్నాష్టకవర్గ, సర్వాష్టకవర్గ & సుదర్శన చక్రం',
    titleEn: 'Page 5: Ashtakavarga 337 Bindus & Sudarshana Chakra',
    descriptionTe: 'సప్త గ్రహాల బిందువులు, సర్వాష్టకవర్గ 337 బిందువులు, శోధ్య పిండ సాధన, సుదర్శన చక్రం.',
    categoryTe: 'అష్టకవర్గ',
    recommendedFor: 'గోచార కాల నిర్ణయానికి',
  },
  {
    pageNum: 6,
    id: 'page_6_jaimini_sadesati',
    titleTe: 'పుట 6: జైమిని కారకులు, చర దశా కాలచక్రం & ఏలినాటి శని',
    titleEn: 'Page 6: Jaimini Karakas, Chara Dasha & Sade Sati',
    descriptionTe: 'ఆత్మకారకాది సప్త కారకులు, చర దశా కాలచక్రం, పాప సామ్యం, ఏలినాటి శని సమగ్ర దశలు.',
    categoryTe: 'దశా & శని గోచారం',
    recommendedFor: 'జైమిని & శని ప్రభావ పరిశీలనకు',
  },
  {
    pageNum: 7,
    id: 'page_7_vimshottari_81',
    titleTe: 'పుట 7: వింశోత్తరి 81 అంతర్దశల సంపూర్ణ కాలచక్ర పట్టిక',
    titleEn: 'Page 7: Vimshottari 81 Bhukti Periods & Dates',
    descriptionTe: '120 సంవత్సరాల 9 మహాదశల లోని 81 అంతర్దశల ఆరంభ-సమాప్తి తేదీల సంపూర్ణ పట్టిక.',
    categoryTe: 'కాల చక్రం',
    recommendedFor: 'జీవిత కాలగణనకు అత్యంత ముఖ్యం',
  },
  {
    pageNum: 8,
    id: 'page_8_graha_phala_1',
    titleTe: 'పుట 8: సమగ్ర జీవిత స్వరూపం & నవగ్రహ ఫలితాలు (భాగం-1)',
    titleEn: 'Page 8: Life Overview & Navagraha Phala Part 1',
    descriptionTe: 'జాతకుని శారీరక, మానసిక గుణాలు, రవి, చంద్ర, కుజ, బుధ గ్రహాల వ్యక్తిగత సమగ్ర ఫలితాలు.',
    categoryTe: 'జీవిత ఫలితాలు',
    recommendedFor: 'వ్యక్తిత్వ & ప్రవర్తన విశ్లేషణకు',
  },
  {
    pageNum: 9,
    id: 'page_9_graha_phala_2',
    titleTe: 'పుట 9: నవగ్రహ ఫలితాలు (భాగం-2), వివాహ & ఉద్యోగ బ్లూప్రింట్',
    titleEn: 'Page 9: Navagraha Phala Part 2, Marriage & Career',
    descriptionTe: 'గురు, శుక్ర, శని, రాహు, కేతు ఫలితాలు, వివాహ భాగస్వామి లక్షణాలు, అనుకూల వృత్తి రంగాలు.',
    categoryTe: 'జీవిత ఫలితాలు',
    recommendedFor: 'వివాహం & వ్యాపార నిర్ణయాలకు',
  },
  {
    pageNum: 10,
    id: 'page_10_seven_stages',
    titleTe: 'పుట 10: 7 జీవిత పర్వాల కాలచక్ర చరిత్ర & మహాదశా ఫలితాలు',
    titleEn: 'Page 10: 7 Life Stages Chronicle & Mahadasha Predictions',
    descriptionTe: 'బాల్యం, విద్యా ప్రస్థానం, ఉద్యోగం, గృహస్థం, ప్రౌఢ, ఉత్తరాయణ పర్వాల సమగ్ర జీవిత గాథ.',
    categoryTe: 'కాలచరిత్ర',
    recommendedFor: 'సమగ్ర భవిష్యత్ మార్గదర్శకానికి',
  },
  {
    pageNum: 11,
    id: 'page_11_dvadasha_bhavas',
    titleTe: 'పుట 11: ద్వాదశ భావ సంపూర్ణ ఫలితాలు (1–12 భావాలు)',
    titleEn: 'Page 11: 12 Bhavas Complete Comprehensive Predictions',
    descriptionTe: 'తను, ధన, సహజ, సుఖ, పుత్ర, శత్రు, కళత్ర, ఆయుష్షు, భాగ్య, రాజ్య, లాభ, వ్యయ భావాల ఫలితాలు.',
    categoryTe: 'భావ ఫలితాలు',
    recommendedFor: 'జీవిత సమగ్ర పార్శ్వాల అవగాహనకు',
  },
  {
    pageNum: 12,
    id: 'page_12_dosha_remedies',
    titleTe: 'పుట 12: సంపూర్ణ దోష పరీక్ష, వేదోక్త పరిహార మంజరి & ముగింపు',
    titleEn: 'Page 12: Dosha Diagnostics, Vedic Remedies & Siddhanti Seal',
    descriptionTe: 'కుజ/కాలసర్ప దోషాలు, నవగ్రహ జపాలు, రత్నధారణ, విశేష దానాలు, క్షేత్ర దర్శనాలు, ఆశీర్వాదం.',
    categoryTe: 'పరిహారములు',
    recommendedFor: 'శాంతి, ఉపాసన & నివారణకు',
  },
  {
    pageNum: 13,
    id: 'page_13_varshaphala_12month',
    titleTe: 'పుట 13: తాజిక వర్షఫలం, ముంథా, ముద్ద దశా & 12-నెలల ఫలితాలు',
    titleEn: 'Page 13: Tajika Varshaphala & 12-Month Calendar Forecast',
    descriptionTe: 'వర్ష ప్రవేశ ముహూర్తం, వర్ష కుండలి, ముంథా, వర్షేశ్వరుడు, 365-రోజుల ముద్ద దశ & 12 నెలల మాసవారీ ఫలితాలు.',
    categoryTe: 'వార్షిక ఫలితాలు',
    recommendedFor: 'ఈ సంవత్సర 12-నెలల భవిష్యవాణికి',
  },
];

export interface PrintSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPdfExport: (selectedPageNumbers: number[]) => void;
  onConfirmBrowserPrint: (selectedPageNumbers: number[]) => void;
  personName: string;
  birthDate: string;
}

export const PrintSettingsModal: React.FC<PrintSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfirmPdfExport,
  onConfirmBrowserPrint,
  personName,
  birthDate,
}) => {
  const [selectedPages, setSelectedPages] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  ]);

  if (!isOpen) return null;

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum)
        ? prev.filter((p) => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const applyPreset = (pages: number[]) => {
    setSelectedPages(pages);
  };

  const selectAll = () => {
    setSelectedPages([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  };

  const deselectAll = () => {
    setSelectedPages([1]); // Keep at least title page
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print overflow-y-auto">
      <div className="bg-[#0F1326] border-2 border-[#C9A96E]/60 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#171B36] via-[#10142B] to-[#0A0D1E] border-b border-white/10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40">
                <Printer className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
                ముద్రణ & PDF ఎగుమతి అనుకూలీకరణ పీఠం (Print & PDF Settings)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDE8E0]">
              జాతక పత్ర ముద్రణ అమరికలు ·{' '}
              <span className="text-[#C9A96E]">{personName || 'జాతకుడు'}</span>
            </h2>
            <p className="text-xs text-[#EDE8E0]/70 max-w-2xl leading-relaxed">
              మీకు అవసరమైన నిర్దిష్ట విభాగాలను (ఉదాహరణకు: కేవలం కుండలి, దశా పట్టిక, లేదా పరిహారములు మాత్రమే) ఎంచుకుని వృత్తిపరమైన, శుద్ధమైన PDF లేదా ప్రింట్-అవుట్ రూపొందించుకోండి.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#090C18] border border-white/15 text-[#EDE8E0]/60 hover:text-white hover:border-[#C9A96E] transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#C9A96E] font-bold uppercase text-[11px] tracking-wider">
              <span>శీఘ్ర ఎంపికలు (Tailored Quick Presets):</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[#5BBFB5] hover:underline cursor-pointer"
                >
                  అన్నీ ఎంచుకోండి
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[#EDE8E0]/60 hover:underline cursor-pointer"
                >
                  ముఖపత్రం మాత్రమే
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => applyPreset([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPages.length === 13
                    ? 'bg-[#C9A96E] text-[#090C18] font-bold border-[#C9A96E] shadow'
                    : 'bg-[#090C18] border-white/10 text-[#EDE8E0] hover:border-[#C9A96E]/50'
                }`}
              >
                <div className="font-bold text-xs truncate">1. సంపూర్ణ గ్రంథం</div>
                <div className="text-[10px] opacity-80 mt-0.5">పూర్తి 13 పుటలు</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset([1, 3, 7])}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPages.length === 3 &&
                  selectedPages.includes(1) &&
                  selectedPages.includes(3) &&
                  selectedPages.includes(7)
                    ? 'bg-[#5BBFB5] text-[#090C18] font-bold border-[#5BBFB5] shadow'
                    : 'bg-[#090C18] border-white/10 text-[#EDE8E0] hover:border-[#5BBFB5]/50'
                }`}
              >
                <div className="font-bold text-xs truncate">2. కుండలి & దశా పత్రం</div>
                <div className="text-[10px] opacity-80 mt-0.5">పుటలు 1, 3, 7 (3 పుటలు)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset([1, 12])}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPages.length === 2 &&
                  selectedPages.includes(1) &&
                  selectedPages.includes(12)
                    ? 'bg-[#E0A96D] text-[#090C18] font-bold border-[#E0A96D] shadow'
                    : 'bg-[#090C18] border-white/10 text-[#EDE8E0] hover:border-[#E0A96D]/50'
                }`}
              >
                <div className="font-bold text-xs truncate">3. పరిహార & దోష పత్రం</div>
                <div className="text-[10px] opacity-80 mt-0.5">పుటలు 1, 12 (2 పుటలు)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset([1, 4, 5])}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPages.length === 3 &&
                  selectedPages.includes(1) &&
                  selectedPages.includes(4) &&
                  selectedPages.includes(5)
                    ? 'bg-[#9B8FD4] text-[#090C18] font-bold border-[#9B8FD4] shadow'
                    : 'bg-[#090C18] border-white/10 text-[#EDE8E0] hover:border-[#9B8FD4]/50'
                }`}
              >
                <div className="font-bold text-xs truncate">4. గ్రహ బలాలు & అష్టక</div>
                <div className="text-[10px] opacity-80 mt-0.5">పుటలు 1, 4, 5 (3 పుటలు)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset([1, 8, 9, 10])}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPages.length === 4 &&
                  selectedPages.includes(1) &&
                  selectedPages.includes(8) &&
                  selectedPages.includes(9) &&
                  selectedPages.includes(10)
                    ? 'bg-[#10B981] text-[#090C18] font-bold border-[#10B981] shadow'
                    : 'bg-[#090C18] border-white/10 text-[#EDE8E0] hover:border-[#10B981]/50'
                }`}
              >
                <div className="font-bold text-xs truncate">5. జీవిత కాలచక్రం</div>
                <div className="text-[10px] opacity-80 mt-0.5">పుటలు 1, 8, 9, 10 (4 పుటలు)</div>
              </button>
            </div>
          </div>

          {/* Section List Checkboxes Grid */}
          <div className="space-y-2.5">
            <div className="text-[#C9A96E] font-bold uppercase text-[11px] tracking-wider">
              పుటల వివరాలు & ఎంపిక (Select Specific Sections):
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
              {PRINTABLE_JATHAKA_PAGES.map((sec) => {
                const isChecked = selectedPages.includes(sec.pageNum);
                return (
                  <div
                    key={sec.id}
                    onClick={() => togglePage(sec.pageNum)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isChecked
                        ? 'bg-[#141932] border-[#C9A96E] ring-1 ring-[#C9A96E]/50 shadow-sm'
                        : 'bg-[#090C18]/80 border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-[#C9A96E]">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#C9A96E]" />
                      ) : (
                        <Square className="w-4 h-4 text-white/40" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#EDE8E0] truncate">
                          {sec.titleTe}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-mono-tabular font-bold bg-[#C9A96E]/15 text-[#C9A96E] shrink-0 border border-[#C9A96E]/30">
                          {sec.categoryTe}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#EDE8E0]/70 leading-relaxed line-clamp-2">
                        {sec.descriptionTe}
                      </p>
                      <div className="text-[10px] text-[#5BBFB5] font-semibold pt-0.5">
                        సిఫార్సు: {sec.recommendedFor}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#090C18] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-[#5BBFB5] font-mono-tabular font-bold text-xs">
              ఎంపిక చేసినవి: {selectedPages.length} / 13 పుటలు
            </span>
            <span className="text-[11px] text-[#EDE8E0]/60 hidden sm:inline">
              A4 పోర్ట్రైట్ · హై-రెజల్యూషన్ ప్రింట్ క్వాలిటీ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-transparent border border-white/15 text-xs text-[#EDE8E0]/80 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            >
              రద్దు చేయి (Cancel)
            </button>

            <button
              type="button"
              onClick={() => onConfirmBrowserPrint(selectedPages)}
              className="px-4 py-2 rounded-xl bg-[#141932] border border-[#C9A96E]/60 text-xs text-[#EDE8E0] hover:bg-[#1E2548] font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>ప్రత్యక్ష ప్రింట్ (Print)</span>
            </button>

            <button
              type="button"
              onClick={() => onConfirmPdfExport(selectedPages)}
              disabled={selectedPages.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#d8b97e] text-[#090C18] text-xs font-bold shadow-lg hover:shadow-xl hover:from-[#d8b97e] hover:to-[#C9A96E] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>ఎంచుకున్న {selectedPages.length} పుటలతో PDF డౌన్‌లోడ్</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
