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
import { GRANTHA_PAGES } from '../engine/granthaPageMap.ts';
import { PRINT_RENDER_SCALE, renderDpi } from '../utils/pdfBookExporter.ts';

export interface PrintableSectionItem {
  pageNum: number;
  id: string;
  titleTe: string;
  titleEn: string;
  descriptionTe: string;
  categoryTe: string;
  recommendedFor: string;
}

/** ప్రతి పుటకూ — గ్రంథ చిట్టా (granthaPageMap) నుంచే, చేతితో రాసిన జాబితా కాదు. */
export const PRINTABLE_JATHAKA_PAGES: PrintableSectionItem[] = GRANTHA_PAGES.map((pg) => ({
  pageNum: pg.num,
  id: pg.id,
  titleTe: `పుట ${pg.num}: ${pg.titleTe}`,
  titleEn: pg.titleEn,
  descriptionTe: pg.partTe,
  categoryTe: pg.partTe.replace(/^\S+ భాగం · /, ''),
  recommendedFor: pg.num === 1 ? 'తప్పనిసరి — జనన వివరాలు, కుండలి' : pg.partTe.replace(/^\S+ భాగం · /, ''),
}));

/** అన్ని పుటల సంఖ్యలు — ఎగుమతి డిఫాల్ట్ ఇదే. */
export const ALL_JATHAKA_PAGES: number[] = GRANTHA_PAGES.map((pg) => pg.num);

/** భాగం వారీగా పుటలు — శీఘ్ర ఎంపికలకు. */
const pagesOfPart = (partPrefix: string) =>
  GRANTHA_PAGES.filter((pg) => pg.partTe.startsWith(partPrefix)).map((pg) => pg.num);

const PART_I = pagesOfPart('ప్రథమ');
const PART_II = pagesOfPart('ద్వితీయ');
const PART_V = pagesOfPart('పంచమ');
const PART_VI = pagesOfPart('షష్ఠ');
const PART_VII = pagesOfPart('సప్తమ');
const PART_VIII = pagesOfPart('అష్టమ');

interface PresetItem {
  key: string;
  labelTe: string;
  pages: number[];
  color: string;
}

const PRESETS: PresetItem[] = [
  { key: 'all', labelTe: 'సంపూర్ణ గ్రంథం', pages: ALL_JATHAKA_PAGES, color: '#C9A96E' },
  {
    key: 'kundali',
    labelTe: 'కుండలి & బలాలు',
    pages: [...PART_I, ...PART_II],
    color: '#5BBFB5',
  },
  { key: 'dasha', labelTe: 'దశా · గోచారం', pages: [...PART_VII, ...PART_VIII], color: '#10B981' },
  { key: 'yoga', labelTe: 'యోగ · పండిత విచారణ', pages: PART_VI, color: '#9B8FD4' },
  { key: 'parihara', labelTe: 'పరిహారం', pages: PART_V, color: '#E0A96D' },
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
  const [selectedPages, setSelectedPages] = useState<number[]>(ALL_JATHAKA_PAGES);

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
    setSelectedPages(ALL_JATHAKA_PAGES);
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
              {PRESETS.map((preset) => {
                const active =
                  selectedPages.length === preset.pages.length &&
                  preset.pages.every((p) => selectedPages.includes(p));
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset.pages)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'text-[#090C18] font-bold shadow'
                        : 'bg-[#090C18] border-white/10 text-[#EDE8E0] hover:border-white/30'
                    }`}
                    style={active ? { backgroundColor: preset.color, borderColor: preset.color } : undefined}
                  >
                    <div className="font-bold text-xs truncate">{preset.labelTe}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {preset.pages.length === ALL_JATHAKA_PAGES.length
                        ? `పూర్తి ${preset.pages.length} పుటలు`
                        : `${preset.pages.length} పుటలు`}
                    </div>
                  </button>
                );
              })}
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
              ఎంపిక చేసినవి: {selectedPages.length} / {ALL_JATHAKA_PAGES.length} పుటలు
            </span>
            <span className="text-[11px] text-[#EDE8E0]/60 hidden sm:inline">
              A4 పోర్ట్రైట్ · {renderDpi(PRINT_RENDER_SCALE)} DPI ముద్రణ నాణ్యత · {ALL_JATHAKA_PAGES.length} పుటలు
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
