/**
 * ఆంగ్లం → తెలుగు లిప్యంతరీకరణ (English → Telugu transliteration).
 *
 * ఉపయోగం: వాస్తు / నామకరణ / ప్రొఫైల్ ఫారమ్‌లలో పేరు లేదా స్థలాన్ని
 * ఆంగ్లంలో టైప్ చేసినప్పుడు, దానిని సరైన తెలుగు రూపంలో చూపడానికి.
 * ఉదా. "Charan" → "చరణ్", "Hyderabad" → "హైదరాబాద్", "Lakshmi" → "లక్ష్మి".
 *
 * పద్ధతి: పొడవైన అక్షర సముదాయాన్ని మొదట匹配 చేసే greedy syllable parser
 * (ksh, shr, chh, th, dh, ph, bh, kh, gh, jh, Th, Dh, aa, ee, oo, ai, au …)
 * తర్వాత హల్లు+అచ్చు కలిపి తెలుగు అక్షరం ఏర్పాటు. పదం చివరి 'a' సాధారణంగా
 * హల్లుగా ముగుస్తుంది (Charan → చరణ్), కానీ 'a' తో ముగిసే సాధారణ పేర్లలో
 * (Rama, Krishna) తెలుగు సంప్రదాయం ప్రకారం 'అ' నిలుపుతాము.
 */

interface Tok { seq: string; out: string; kind: 'v' | 'c' | 's'; matra?: string }

const V = (seq: string, out: string, matra: string): Tok => ({ seq, out, kind: 'v', matra });
const C = (seq: string, out: string): Tok => ({ seq, out, kind: 'c' });
const S = (seq: string, out: string): Tok => ({ seq, out, kind: 's' });

const TOKENS: Tok[] = [
  // ── ప్రత్యేక సముదాయాలు ─────────────────────────────────
  S('ksh', 'క్ష'), S('Ksh', 'క్ష'), S('KSH', 'క్ష'),
  S('gn', 'జ్ఞ'), S('jn', 'జ్ఞ'),
  S('shri', 'శ్రీ'), S('Sri', 'శ్రీ'), S('sri', 'శ్రీ'),
  S('shr', 'శ్ర'), S('Shr', 'శ్ర'),
  S('chh', 'ఛ'), S('Chh', 'ఛ'),
  // అనుస్వార సముదాయాలు (Venkata → వెంకట)
  S('nk', 'ంక'), S('Nk', 'ంక'), S('ng', 'ంగ'), S('Ng', 'ంగ'),
  S('nt', 'ంత'), S('Nt', 'ంత'), S('nd', 'ంద'), S('Nd', 'ంద'),
  S('nth', 'ంత'), S('ndh', 'ంధ'),
  S('mp', 'ంప'), S('Mp', 'ంప'), S('mb', 'ంబ'), S('Mb', 'ంబ'),
  S('nch', 'ంచ'), S('nchh', 'ంఛ'), S('nj', 'ంజ'),
  // ── అచ్చులు (పొడవైనవి మొదట) ─────────────────────────────
  V('aa', 'ఆ', 'ా'), V('AA', 'ఆ', 'ా'),
  V('ee', 'ఈ', 'ీ'), V('EE', 'ఈ', 'ీ'), V('ii', 'ఈ', 'ీ'), V('II', 'ఈ', 'ీ'),
  V('oo', 'ఊ', 'ూ'), V('OO', 'ఊ', 'ూ'), V('uu', 'ఊ', 'ూ'), V('UU', 'ఊ', 'ూ'),
  V('ai', 'ఐ', 'ై'), V('Ai', 'ఐ', 'ై'), V('AI', 'ఐ', 'ై'),
  V('au', 'ఔ', 'ౌ'), V('Au', 'ఔ', 'ౌ'),
  V('A', 'ఆ', 'ా'), V('I', 'ఈ', 'ీ'), V('U', 'ఊ', 'ూ'),
  V('E', 'ఏ', 'ే'), V('O', 'ఓ', 'ో'),
  V('a', 'అ', ''), V('i', 'ఇ', 'ి'), V('u', 'ఉ', 'ు'),
  V('e', 'ఎ', 'ె'), V('o', 'ఒ', 'ొ'),
  // ── హల్లులు ─────────────────────────────────────────────
  C('kh', 'ఖ'), C('Kh', 'ఖ'), C('KH', 'ఖ'),
  C('gh', 'ఘ'), C('Gh', 'ఘ'),
  C('ch', 'చ'), C('Ch', 'చ'), C('CH', 'చ'),
  C('jh', 'ఝ'), C('Jh', 'ఝ'),
  C('Th', 'ఠ'), C('Dh', 'ఢ'),
  C('th', 'థ'), C('dh', 'ధ'),
  C('ph', 'ఫ'), C('Ph', 'ఫ'),
  C('bh', 'భ'), C('Bh', 'భ'),
  C('sh', 'ష'), C('Sh', 'ష'),
  C('k', 'క'), C('K', 'క'),
  C('g', 'గ'), C('G', 'గ'),
  C('c', 'చ'), C('C', 'చ'),
  C('j', 'జ'), C('J', 'జ'),
  C('T', 'ట'), C('D', 'డ'), C('N', 'న'),
  C('t', 'త'), C('d', 'ద'), C('n', 'న'),
  C('p', 'ప'), C('P', 'ప'), C('f', 'ఫ'), C('F', 'ఫ'),
  C('b', 'బ'), C('B', 'బ'), C('m', 'మ'), C('M', 'మ'),
  C('y', 'య'), C('Y', 'య'),
  C('r', 'ర'), C('R', 'ర'),
  C('l', 'ల'), C('L', 'ళ'),
  C('v', 'వ'), C('V', 'వ'), C('w', 'వ'), C('W', 'వ'),
  C('s', 'స'), C('S', 'స'),
  C('h', 'హ'), C('H', 'హ'),
  C('z', 'జ'), C('Z', 'జ'),
  C('q', 'క'), C('Q', 'క'), C('x', 'క్స'), C('X', 'క్స'),
];

const HALANT = '\u0C4D';
const ANUSVARA = '\u0C02';
const RICHA_MATRA = '\u0C43'; // ృ

const sortedTokens = [...TOKENS].sort((a, b) => b.seq.length - a.seq.length);

/** ఒక పదాన్ని తెలుగులోకి మార్చు (దేవనాగరి/తెలుగు ఉన్నట్టయితే అలాగే ఇవ్వు). */
export function latinToTelugu(input: string): string {
  const src = (input ?? '').trim();
  if (!src) return '';
  // ఇప్పటికే తెలుగు అయితే మార్చవద్దు
  if (/[\u0C00-\u0C7F]/.test(src)) return src;

  const words = src.split(/\s+/);
  return words.map(transliterateWord).join(' ');
}

function transliterateWord(wordRaw: string): string {
  const word = wordRaw.replace(/[^A-Za-z]/g, '');
  if (!word) return wordRaw;

  let out = '';
  let i = 0;
  let pending: string | null = null; // హల్లు (ఇంకా అచ్చు రాలేదు)

  const flush = (matra: string) => {
    if (pending === null) return;
    out += pending + matra;
    pending = null;
  };

  while (i < word.length) {
    const tok = sortedTokens.find((t) => word.startsWith(t.seq, i));
    if (!tok) {
      if (pending !== null) flush(HALANT);
      out += word[i];
      i += 1;
      continue;
    }

    if (tok.kind === 'c' || tok.kind === 's') {
      if (pending !== null) flush(HALANT);
      let out2 = tok.out;
      // అనుస్వారం తర్వాత వచ్చే దంత్య హల్లులు మూర్ధన్యాలుగా (వెంకట, పండు)
      if (out.endsWith(ANUSVARA)) {
        if (out2 === 'త') out2 = 'ట';
        else if (out2 === 'ద') out2 = 'డ';
        else if (out2 === 'న') out2 = 'ణ';
      }
      pending = out2;
      i += tok.seq.length;
      continue;
    }

    // అచ్చు
    if (pending !== null) {
      flush(tok.matra!);
    } else {
      out += tok.out;
    }
    i += tok.seq.length;

    // 'ri' → ృ (Krishna → కృష్ణ)
    if (word.startsWith('ri', i) && out.endsWith('ర') && pending === null) {
      out = out.slice(0, -1) + RICHA_MATRA;
      i += 2;
    }
  }

  if (pending !== null) flush(HALANT);
  return normalizeTelugu(out.replace(/\u0C4D{2,}/g, HALANT))
    .replace(new RegExp('్' + ANUSVARA, 'g'), ANUSVARA);
}

/** తరచుగా వచ్చే పొరపాట్లను సరిచేయు */
function normalizeTelugu(s: string): string {
  return s
    .replace(/అన్$/u, 'న్')
    .replace(/య్య్$/u, 'య్')
    .replace(/ః+$/u, 'ః');
}

/** పదం లాటిన్ అక్షరాలతో ఉందా? */
export function isLatinText(s: string): boolean {
  const t = (s ?? '').trim();
  return t.length > 0 && /^[A-Za-z0-9 .'\-]+$/.test(t);
}

/**
 * పేరు/స్థలం రెండు రూపాలను ఇచ్చు:
 *   { telugu, display } — display = "Charan → చరణ్"
 */
export function bilingualLabel(input: string): { telugu: string; display: string; wasLatin: boolean } {
  const wasLatin = isLatinText(input);
  const telugu = wasLatin ? latinToTelugu(input) : input.trim();
  return {
    telugu,
    display: wasLatin && telugu !== input ? `${input.trim()} → ${telugu}` : telugu,
    wasLatin,
  };
}

/** దేశీయ పేర్లలో సాధారణంగా వచ్చే రూపాలు (నేరుగా సరిపోయేవి) */
const NAME_OVERRIDES: Record<string, string> = {
  hyderabad: 'హైదరాబాద్',
  secunderabad: 'సికింద్రాబాద్',
  warangal: 'వరంగల్',
  vijayawada: 'విజయవాడ',
  visakhapatnam: 'విశాఖపట్నం',
  tirupati: 'తిరుపతి',
  guntur: 'గుంటూరు',
  nellore: 'నెల్లూరు',
  kurnool: 'కర్నూలు',
  rajamahendravaram: 'రాజమహేంద్రవరం',
  bengaluru: 'బెంగళూరు',
  bangalore: 'బెంగళూరు',
  chennai: 'చెన్నై',
  mumbai: 'ముంబై',
  delhi: 'ఢిల్లీ',
  newdelhi: 'న్యూఢిల్లీ',
  pune: 'పుణె',
  kolkata: 'కోల్‌కతా',
  charan: 'చరణ్',
  sai: 'సాయి',
  ramesh: 'రమేష్',
  lakshmi: 'లక్ష్మి',
  krishna: 'కృష్ణ',
  anitha: 'అనిత',
  anita: 'అనిత',
  venkatesh: 'వెంకటేష్',
  srinivas: 'శ్రీనివాస్',
  sravani: 'శ్రావణి',
  pradeep: 'ప్రదీప్',
  prasad: 'ప్రసాద్',
  kumar: 'కుమార్',
  reddy: 'రెడ్డి',
  rao: 'రావు',
  sastry: 'శాస్త్రి',
  iyer: 'అయ్యర్',
  gupta: 'గుప్తా',
  ganesh: 'గణేష్',
  suresh: 'సురేష్',
  mahesh: 'మహేష్',
  naveen: 'నవీన్',
  kiran: 'కిరణ్',
  divya: 'దివ్య',
  swathi: 'స్వాతి',
  kavitha: 'కవిత',
  sandhya: 'సంధ్య',
  madhavi: 'మాధవి',
  padma: 'పద్మ',
  ravi: 'రవి',
  vani: 'వాణి',
  venkata: 'వెంకట',
  surya: 'సూర్య',
  prakash: 'ప్రకాష్',
  kalyani: 'కళ్యాణి',
  bhaskar: 'భాస్కర్',
  rajesh: 'రాజేష్',
  shyam: 'శ్యామ్',
  naganna: 'నాగన్న',
  gopal: 'గోపాల్',
  murali: 'మురళి',
  ramya: 'రమ్య',
  deepika: 'దీపిక',
  harish: 'హరీష్',
  vamsi: 'వంశీ',
  teja: 'తేజ',
  aditya: 'ఆదిత్య',
  anil: 'అనిల్',
  sunil: 'సునీల్',
  arun: 'అరుణ్',
  ashok: 'అశోక్',
  bharat: 'భరత్',
  chandra: 'చంద్ర',
  dinesh: 'దినేష్',
  girish: 'గిరీష్',
  hari: 'హరి',
  jagadeesh: 'జగదీష్',
  kalyan: 'కళ్యాణ్',
  kamal: 'కమల్',
  mohan: 'మోహన్',
  nagesh: 'నాగేష్',
  prashanth: 'ప్రశాంత్',
  raghu: 'రఘు',
  sekhar: 'శేఖర్',
  shankar: 'శంకర్',
  uday: 'ఉదయ్',
  vijay: 'విజయ్',
  vinod: 'వినోద్',
  yadav: 'యాదవ్',
  naidu: 'నాయుడు',
  chowdary: 'చౌదరి',
  sarma: 'శర్మ',
  varma: 'వర్మ',
  verma: 'వర్మ',
};

/** English place/person → Telugu, తెలిసిన పేర్లకు ఖచ్చిత రూపం (పదం పదం మార్పిడి). */
export function englishToTeluguSmart(input: string): string {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return '';
  if (!isLatinText(trimmed)) return trimmed;
  const joinedKey = trimmed.toLowerCase().replace(/[^a-z]/g, '');
  if (NAME_OVERRIDES[joinedKey]) return NAME_OVERRIDES[joinedKey];
  return trimmed
    .split(/\s+/)
    .map((w) => {
      const key = w.toLowerCase().replace(/[^a-z]/g, '');
      if (!key) return w;
      return NAME_OVERRIDES[key] ?? latinToTelugu(w);
    })
    .join(' ');
}
