/**
 * నామాక్షర నిర్ణయం — పేరు (ఇంగ్లీష్/తెలుగు) → 108 పాదాక్షరాలలో ఖచ్చితమైన అక్షరం.
 *
 * Nāma Vastu / Nāmakaraṇa రెండింటికీ ఆధారం: పేరు మొదటి అక్షరం → నక్షత్ర పాదం →
 * రాశి → దిక్కు. ఇంగ్లీషులో టైప్ చేసిన పేరు ("Charan", "Sravani", "Shwetha") కూడా
 * సరైన తెలుగు అక్షరానికి రావాలి.
 *
 * సమస్య: అనువాదం వచ్చిన మొదటి అక్షరం 108 జాబితాలో లేకపోవచ్చు (ఉదా: "శ" — హస్త
 * పాదాక్షరం "ష"; "ళ", "ఱ", "జ్ఞ", "క్ష"). అప్పుడు వర్ణ సామ్యం (phonetic class) ప్రకారం
 * సమానార్థక అక్షరానికి కుదిస్తాము — శ/ష/స, ళ/ల, ఱ/ర, ఖ/క, ఘ/గ …
 * ఇది యథాతథంగా "S" తో మొదలయ్యే ప్రతి పేరును ఒకటే నక్షత్రానికి పంపే తప్పును నివారిస్తుంది.
 */

import { TELUGU_NAKSHATRAS } from './teluguJathakam.ts';
import { englishToTeluguSmart, isLatinText } from './teluguTransliteration.ts';

export interface NamaAksharaMatch {
  /** 108 జాబితాలోని ప్రామాణిక పాదాక్షరం (ఉదా: చ, సా, శ్రీ లేదు → ష/స) */
  syllable: string;
  nakshatraIndex: number;
  pada: number;
  /** పేరు నుంచి తీసుకున్న అసలు అక్షరం (సరిపోలకపోతే వేరుగా ఉంటుంది) */
  inputAkshara: string;
  /** వర్ణ సామ్యంతో కుదించబడిందా */
  normalized: boolean;
  nameTelugu: string;
}

const CONSONANTS = new Set(
  'కఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహళఱ'.split('')
);
const VOWEL_SIGNS = new Set('ాిీుూృెేైొోౌ'.split(''));
const INDEPENDENT_VOWELS = new Set('అఆఇఈఉఊఋఎఏఐఒఓఔ'.split(''));

/**
 * వర్ణ సామ్య కుటుంబాలు — మొదటిది ప్రాముఖ్యం.
 * సంప్రదాయ నామాక్షర జాబితాలో ఈ అక్షరాలు మాత్రమే ఉన్నాయి, కాబట్టి మిగతావి
 * తమ కుటుంబంలోని ప్రామాణిక అక్షరానికి మారతాయి.
 */
const FAMILIES: string[][] = [
  ['చ', 'ఛ'], ['జ', 'ఝ', 'య'], ['ట', 'ఠ'], ['డ', 'ఢ'], ['ణ', 'న'],
  ['త', 'థ'], ['ద', 'ధ'], ['ప', 'ఫ'], ['బ', 'భ'], ['మ'],
  ['య'], ['ర', 'ఱ'], ['ల', 'ళ'], ['వ'],
  ['శ', 'ష', 'స'], ['హ'], ['క', 'ఖ'], ['గ', 'ఘ'], ['ఙ', 'ఞ'],
];

const VOWEL_ORDER = ['', 'ా', 'ి', 'ీ', 'ు', 'ూ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ'];

function familyOf(base: string): string[] {
  const fam = FAMILIES.find((f) => f.includes(base));
  return fam ?? [base];
}

/** మొదటి అక్షరాన్ని (వ్యంజన సముదాయం + అచ్చు) వేరు చేస్తుంది. */
export function splitFirstAkshara(te: string): { base: string; vowel: string } {
  const chars = Array.from(te).filter((c) => /[\u0C00-\u0C7F]/.test(c));
  if (!chars.length) return { base: '', vowel: '' };

  // స్వరం తో మొదలైతే (అ, ఆ, ఇ …) — అదే అక్షరం
  if (INDEPENDENT_VOWELS.has(chars[0])) return { base: '', vowel: chars[0] };

  const consonants: string[] = [];
  let i = 0;
  while (i < chars.length && (CONSONANTS.has(chars[i]) || chars[i] === '\u0C4D')) {
    if (CONSONANTS.has(chars[i])) consonants.push(chars[i]);
    i += 1;
    // వ్యంజనం తర్వాత హల్లు (్) ఉంటే కలిపి చదవాలి; లేకపోతే ఆగిపోవాలి
    if (chars[i] !== '\u0C4D') break;
  }
  const vowel = chars[i] && VOWEL_SIGNS.has(chars[i]) ? chars[i] : '';
  // సముదాయంలో (శ్ర, క్ష) మొదటి హల్లే తెలుగు అక్షర సంప్రదాయం ప్రకారం గ్రహించబడుతుంది
  return { base: consonants[0] ?? '', vowel };
}

interface Candidate {
  syllable: string;
  base: string;
  vowel: string;
  nakshatraIndex: number;
  pada: number;
}

const CANON: Candidate[] = TELUGU_NAKSHATRAS.flatMap((n) =>
  n.padasTe.map((s, p) => {
    const { base, vowel } = splitFirstAkshara(s);
    // స్వరాక్షరాలు (అ, ఈ, ఉ, ఏ) — హల్లు లేదు, అచ్చే అక్షరం
    return {
      syllable: s,
      base,
      vowel: base ? vowel : s,
      nakshatraIndex: n.index,
      pada: p + 1,
    };
  })
);

const BY_BASE = new Map<string, Candidate[]>();
for (const c of CANON) {
  const list = BY_BASE.get(c.base) ?? [];
  list.push(c);
  BY_BASE.set(c.base, list);
}

/** అచ్చు దూరం — సమానం 0, దగ్గరి అచ్చుకు చిన్న సంఖ్య. */
function vowelDistance(a: string, b: string): number {
  const ia = VOWEL_ORDER.indexOf(a);
  const ib = VOWEL_ORDER.indexOf(b);
  if (ia < 0 || ib < 0) return 99;
  return Math.abs(ia - ib);
}

/**
 * హల్లు అచ్చుల సమానార్థ రూపాలు — పాదాక్షర జాబితాలో సాధారణంగా దీర్ఘం ఉంటుంది.
 * (ఉదా: "Ve" అంటే వే → మృగశిర 1; "Su" అంటే సూ → శతభిష 4)
 */
function normalizeConsonantVowel(v: string): string {
  const map: Record<string, string> = {
    'ె': 'ే', 'ొ': 'ో', 'ి': 'ీ', 'ు': 'ూ', 'ృ': 'ూ', 'ై': 'ే', 'ౌ': 'ో',
  };
  return map[v] ?? v;
}

function normalizeIndependentVowel(v: string): string {
  const map: Record<string, string> = {
    'ఆ': 'అ', 'ఇ': 'ఈ', 'ఊ': 'ఉ', 'ఎ': 'ఏ', 'ఒ': 'ఓ', 'ఐ': 'ఏ', 'ఔ': 'ఓ', 'ఋ': 'ఉ',
  };
  return map[v] ?? v;
}

/**
 * పేరు → ప్రామాణిక పాదాక్షరం. తెలుగు పేరుకు నేరుగా, ఇంగ్లీషు పేరుకు
 * లిప్యంతరీకరణ తర్వాత పరిష్కరిస్తుంది.
 */
export function resolveNamaAkshara(name: string): NamaAksharaMatch | null {
  const raw = (name ?? '').trim();
  if (!raw) return null;
  const nameTelugu = isLatinText(raw) ? englishToTeluguSmart(raw) : raw;
  const { base, vowel } = splitFirstAkshara(nameTelugu);
  const inputAkshara = `${base}${vowel}`;

  // 1) స్వరాక్షరాలు (అ, ఈ, ఉ, ఏ, ఓ) — హల్లు లేని పేర్లు (Anitha, Omkar, Ishaan…)
  if (!base) {
    const v = normalizeIndependentVowel(vowel);
    const hit = CANON.find((c) => !c.base && c.vowel === v);
    if (hit) {
      return {
        syllable: hit.syllable,
        nakshatraIndex: hit.nakshatraIndex,
        pada: hit.pada,
        inputAkshara: inputAkshara || v,
        normalized: hit.syllable !== inputAkshara,
        nameTelugu,
      };
    }
  }

  if (base) {
    // 2) అదే హల్లు + అదే అచ్చు — ఖచ్చిత సరిపోలిక (చ → రేవతి 3, సా → శతభిష 2)
    const direct = BY_BASE.get(base)?.find((c) => c.vowel === vowel);
    if (direct) {
      return {
        syllable: direct.syllable,
        nakshatraIndex: direct.nakshatraIndex,
        pada: direct.pada,
        inputAkshara,
        normalized: false,
        nameTelugu,
      };
    }

    // 3) అదే హల్లు — దగ్గరి అచ్చు (ఎ→ఏ, ఒ→ఓ, ఇ→ఈ, ఉ→ఊ …)
    const sameBase = BY_BASE.get(base);
    if (sameBase?.length) {
      const target = normalizeConsonantVowel(vowel);
      const exact2 = sameBase.find((c) => c.vowel === target);
      const pick =
        exact2 ??
        [...sameBase].sort((a, b) => vowelDistance(a.vowel, target) - vowelDistance(b.vowel, target))[0];
      if (pick) {
        return {
          syllable: pick.syllable,
          nakshatraIndex: pick.nakshatraIndex,
          pada: pick.pada,
          inputAkshara,
          normalized: pick.syllable !== inputAkshara,
          nameTelugu,
        };
      }
    }

    // 4) వర్ణ సామ్య కుటుంబం (శ/ష/స, ళ/ల, ఱ/ర, జ/ఝ/య …)
    for (const equiv of familyOf(base)) {
      if (equiv === base) continue;
      const list = BY_BASE.get(equiv);
      if (!list?.length) continue;
      const sameVowel = list.find((c) => c.vowel === vowel || c.vowel === normalizeConsonantVowel(vowel));
      const pick = sameVowel ?? [...list].sort(
        (a, b) => vowelDistance(a.vowel, vowel) - vowelDistance(b.vowel, vowel)
      )[0];
      if (pick) {
        return {
          syllable: pick.syllable,
          nakshatraIndex: pick.nakshatraIndex,
          pada: pick.pada,
          inputAkshara,
          normalized: true,
          nameTelugu,
        };
      }
    }
  }

  return null;
}

/** పాదాక్షరం యొక్క లాటిన్ రూపం (ఇంగ్లీష్ మోడ్‌లో చూపడానికి). */
export function latinAkshara(syllable: string): string {
  const map: Record<string, string> = {
    'చూ': 'Chu', 'చే': 'Che', 'చో': 'Cho', 'లా': 'La', 'లీ': 'Li', 'లూ': 'Lu', 'లే': 'Le', 'లో': 'Lo',
    'అ': 'A', 'ఇ': 'I', 'ఈ': 'I', 'ఉ': 'U', 'ఏ': 'E', 'ఓ': 'O', 'వా': 'Va', 'వీ': 'Vi', 'వూ': 'Vu',
    'వే': 'Ve', 'వో': 'Vo', 'కా': 'Ka', 'కీ': 'Ki', 'కూ': 'Ku', 'ఘ': 'Gha', 'ఙ': 'Nga', 'ఛ': 'Chha',
    'కే': 'Ke', 'కో': 'Ko', 'హా': 'Ha', 'హీ': 'Hi', 'హూ': 'Hu', 'హే': 'He', 'హో': 'Ho', 'డా': 'Da',
    'డీ': 'Di', 'డూ': 'Du', 'డే': 'De', 'డో': 'Do', 'మా': 'Ma', 'మీ': 'Mi', 'మూ': 'Mu', 'మే': 'Me',
    'మో': 'Mo', 'టా': 'Ta', 'టీ': 'Ti', 'టూ': 'Tu', 'టే': 'Te', 'టో': 'To', 'పా': 'Pa', 'పీ': 'Pi',
    'పూ': 'Pu', 'ష': 'Sha', 'ణ': 'Na', 'ఠ': 'Tha', 'పే': 'Pe', 'పో': 'Po', 'రా': 'Ra', 'రీ': 'Ri',
    'రూ': 'Ru', 'రే': 'Re', 'రో': 'Ro', 'తా': 'Ta', 'తీ': 'Ti', 'తూ': 'Tu', 'తే': 'Te', 'తో': 'To',
    'నా': 'Na', 'నీ': 'Ni', 'నూ': 'Nu', 'నే': 'Ne', 'నో': 'No', 'యా': 'Ya', 'యీ': 'Yi', 'యూ': 'Yu',
    'యే': 'Ye', 'యో': 'Yo', 'భా': 'Bha', 'భీ': 'Bhi', 'భూ': 'Bhu', 'ధా': 'Dha', 'ఫా': 'Pha',
    'ఢా': 'Dha', 'భే': 'Bhe', 'భో': 'Bho', 'జా': 'Ja', 'జీ': 'Ji', 'ఖీ': 'Khi', 'ఖూ': 'Khu',
    'ఖే': 'Khe', 'ఖో': 'Kho', 'గా': 'Ga', 'గీ': 'Gi', 'గూ': 'Gu', 'గే': 'Ge', 'గో': 'Go',
    'సా': 'Sa', 'సీ': 'Si', 'సూ': 'Su', 'సే': 'Se', 'సో': 'So', 'దా': 'Da', 'దీ': 'Di',
    'దూ': 'Du', 'థ': 'Tha', 'ఝ': 'Jha', 'ఞ': 'Na', 'దే': 'De', 'దో': 'Do', 'చ': 'Cha', 'చి': 'Chi',
  };
  return map[syllable] ?? syllable;
}
