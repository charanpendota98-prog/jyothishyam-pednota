import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportProgress {
  isExporting: boolean;
  currentPage: number;
  totalPages: number;
  statusMessageTe: string;
}

const UNSUPPORTED_COLOR_FN_REGEX = /(?:oklab|oklch|lab|lch|color)\([^()]+\)/gi;

let sharedColorCanvasCtx: CanvasRenderingContext2D | null = null;

function getColorCanvasCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!sharedColorCanvasCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    sharedColorCanvasCtx = canvas.getContext('2d', { willReadFrequently: true });
  }
  return sharedColorCanvasCtx;
}

/**
 * Converts a single CSS color token (such as `oklab(...)`, `oklch(...)`, `color(srgb ...)`)
 * into an html2canvas-safe `rgb(r, g, b)` or `rgba(r, g, b, a)` string using the browser's
 * native 2D canvas color parser.
 */
export function convertCssColorToRgb(colorToken: string, fallback = 'rgba(0, 0, 0, 0)'): string {
  const trimmed = colorToken.trim();
  if (!trimmed || trimmed === 'none' || trimmed === 'transparent') {
    return trimmed || fallback;
  }
  const ctx = getColorCanvasCtx();
  if (!ctx) return fallback;

  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillStyle = trimmed;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];
    const a = data[3];
    if (a === 0) return 'rgba(0, 0, 0, 0)';
    if (a === 255) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(3))})`;
  } catch {
    return fallback;
  }
}

/**
 * Replaces any `oklab(...)`, `oklch(...)`, `lab(...)`, `lch(...)`, or `color(...)`
 * occurrences inside a computed CSS value (e.g., `box-shadow`, `linear-gradient`, `border-color`)
 * with standard `rgb()` / `rgba()` strings that html2canvas 1.4.1 can parse.
 */
export function sanitizeCssValueString(cssValue: string): string {
  if (!cssValue) return cssValue;
  if (
    !/(?:oklab|oklch|lab|lch|color)\(/i.test(cssValue) &&
    !/\bin\s+okl(?:ab|ch)\b/i.test(cssValue)
  ) {
    return cssValue;
  }

  // Strip gradient color-space interpolation tokens (e.g. "linear-gradient(to right in oklab, ...)")
  let cleaned = cssValue.replace(
    /\s+in\s+(?:oklab|oklch|srgb|srgb-linear|hsl|hwb)\b(?:\s+(?:shorter|longer|increasing|decreasing)\s+hue)?/gi,
    ''
  );

  // Replace every oklab(...), oklch(...), color(...) occurrence with rgba(...)
  cleaned = cleaned.replace(UNSUPPORTED_COLOR_FN_REGEX, (match) =>
    convertCssColorToRgb(match, 'rgb(139, 105, 20)')
  );

  return cleaned;
}

const COLOR_STYLE_PROPS = [
  'color',
  'backgroundColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'textDecorationColor',
  'webkitTextStrokeColor',
  'outlineColor',
  'columnRuleColor',
] as const;

/**
 * Sanitizes a cloned Document and root element inside html2canvas's `onclone` hook
 * so that Tailwind CSS v4's `oklab()` / `oklch()` / `color-mix()` computed values
 * are converted to standard `rgb()` / `rgba()` inline styles before html2canvas parses them.
 */
export function sanitizeCloneForHtml2Canvas(
  clonedDoc: Document,
  clonedRootEl: HTMLElement,
  defaultBgColor = '#FFFEFA'
): void {
  const win = clonedDoc.defaultView;
  if (!win) return;

  // Collect ancestors of clonedRootEl (including body and documentElement) plus all descendants
  const ancestors: Element[] = [];
  let curr: Element | null = clonedRootEl.parentElement;
  while (curr) {
    ancestors.push(curr);
    curr = curr.parentElement;
  }

  const elements: Element[] = [
    ...ancestors,
    clonedRootEl,
    ...Array.from(clonedRootEl.querySelectorAll('*')),
  ];

  // Snapshot and convert computed styles to inline rgb()/rgba()
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    if (!el.style) continue;

    const cs = win.getComputedStyle(el);

    for (const prop of COLOR_STYLE_PROPS) {
      const val = cs[prop as keyof CSSStyleDeclaration] as string | undefined;
      if (val && /(?:oklab|oklch|lab|lch|color)\(/i.test(val)) {
        (el.style as unknown as Record<string, string>)[prop] = convertCssColorToRgb(val);
      }
    }

    if (
      cs.boxShadow &&
      cs.boxShadow !== 'none' &&
      /(?:oklab|oklch|lab|lch|color)\(/i.test(cs.boxShadow)
    ) {
      const sanitizedShadow = sanitizeCssValueString(cs.boxShadow);
      el.style.boxShadow = /(?:oklab|oklch|lab|lch|color)\(/i.test(sanitizedShadow)
        ? 'none'
        : sanitizedShadow;
    }

    if (
      cs.textShadow &&
      cs.textShadow !== 'none' &&
      /(?:oklab|oklch|lab|lch|color)\(/i.test(cs.textShadow)
    ) {
      const sanitizedTextShadow = sanitizeCssValueString(cs.textShadow);
      el.style.textShadow = /(?:oklab|oklch|lab|lch|color)\(/i.test(sanitizedTextShadow)
        ? 'none'
        : sanitizedTextShadow;
    }

    if (
      cs.backgroundImage &&
      cs.backgroundImage !== 'none' &&
      (/(?:oklab|oklch|lab|lch|color)\(/i.test(cs.backgroundImage) ||
        /\bin\s+okl/i.test(cs.backgroundImage))
    ) {
      const sanitizedBgImg = sanitizeCssValueString(cs.backgroundImage);
      el.style.backgroundImage = /(?:oklab|oklch|lab|lch|color)\(/i.test(sanitizedBgImg)
        ? 'none'
        : sanitizedBgImg;
    }
  }

  // Ensure html and body have explicit safe RGB backgrounds for parseBackgroundColor()
  if (clonedDoc.documentElement) {
    clonedDoc.documentElement.style.backgroundColor = defaultBgColor;
  }
  if (clonedDoc.body) {
    clonedDoc.body.style.backgroundColor = defaultBgColor;
  }
}

/**
 * Generates and downloads a real multi-page A4 .pdf file directly from all
 * `.classical-grantha-page` elements inside the provided container.
 * Works 100% reliably inside cross-origin sandboxed iframes where window.print() is blocked.
 */
export async function exportClassicalJathakaToPdf(
  containerEl: HTMLElement,
  personName: string,
  birthDate: string,
  onProgress?: (progress: PdfExportProgress) => void,
  selectedPages?: number[]
): Promise<void> {
  const allPages = Array.from(
    containerEl.querySelectorAll<HTMLElement>('.classical-grantha-page')
  );

  if (allPages.length === 0) {
    throw new Error('No Jathaka pages found to export.');
  }

  // Filter to selected pages if provided, otherwise export all pages
  const pages =
    selectedPages && selectedPages.length > 0
      ? allPages.filter((_, idx) => selectedPages.includes(idx + 1))
      : allPages;

  if (pages.length === 0) {
    throw new Error('No selected Jathaka pages found to export.');
  }

  const totalPages = pages.length;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const a4WidthMm = 210;
  const a4HeightMm = 297;
  const marginMm = 6;
  const printableWidthMm = a4WidthMm - marginMm * 2;
  const printableHeightMm = a4HeightMm - marginMm * 2;

  for (let i = 0; i < totalPages; i++) {
    const pageEl = pages[i];
    onProgress?.({
      isExporting: true,
      currentPage: i + 1,
      totalPages,
      statusMessageTe: `సంపూర్ణ జాతక మహాగ్రంథం PDF తయారవుతోంది... పుట ${i + 1} / ${totalPages} (Generating Page ${i + 1} of ${totalPages})`,
    });

    // Give UI thread a frame to paint progress bar
    await new Promise((resolve) => setTimeout(resolve, 40));

    // Temporarily force desktop A4 width so mobile phones also export crisp A4 tables
    const prevWidth = pageEl.style.width;
    const prevMaxWidth = pageEl.style.maxWidth;
    pageEl.style.width = '960px';
    pageEl.style.maxWidth = '960px';

    try {
      const canvas = await html2canvas(pageEl, {
        scale: 1.85,
        useCORS: true,
        backgroundColor: '#FFFEFA',
        logging: false,
        windowWidth: 1080,
        onclone: (clonedDoc, clonedEl) => {
          sanitizeCloneForHtml2Canvas(clonedDoc, clonedEl, '#FFFEFA');
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      // Scale to fit A4 page width or height cleanly
      let renderWidthMm = printableWidthMm;
      let renderHeightMm = (imgHeightPx * renderWidthMm) / imgWidthPx;

      if (renderHeightMm > printableHeightMm) {
        renderHeightMm = printableHeightMm;
        renderWidthMm = (imgWidthPx * renderHeightMm) / imgHeightPx;
      }

      const xOffsetMm = (a4WidthMm - renderWidthMm) / 2;
      const yOffsetMm = marginMm;

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(
        imgData,
        'JPEG',
        xOffsetMm,
        yOffsetMm,
        renderWidthMm,
        renderHeightMm,
        undefined,
        'FAST'
      );
    } finally {
      pageEl.style.width = prevWidth;
      pageEl.style.maxWidth = prevMaxWidth;
    }
  }

  const safeName = personName
    .replace(/[^a-zA-Z0-9_\u0C00-\u0C7F-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 32);

  const fileName = `Sampoorna_Jathakam_${safeName || 'Jathakudu'}_${birthDate}.pdf`;
  pdf.save(fileName);

  onProgress?.({
    isExporting: false,
    currentPage: totalPages,
    totalPages,
    statusMessageTe: `${totalPages}-పుటల సంపూర్ణ జాతక PDF విజయవంతంగా డౌన్‌లోడ్ చేయబడింది! (${fileName})`,
  });
}
