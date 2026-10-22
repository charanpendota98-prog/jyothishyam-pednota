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
  S('sw', 'శ్వ'), S('Sw', 'శ్వ'), S('shw', 'శ్వ'),
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
  V('au', 'ఔ', 'ౌ'), V('Au', 'ఔ', 'ౌ'), V('ow', 'ఔ', 'ౌ'), V('Ow', 'ఔ', 'ౌ'),
  V('A', 'ఆ', 'ా'), V('I', 'ఈ', 'ీ'), V('U', 'ఊ', 'ూ'),
  V('E', 'ఏ', 'ే'), V('O', 'ఓ', 'ో'),
  V('a', 'అ', ''), V('i', 'ఇ', 'ి'), V('u', 'ఉ', 'ు'),
  V('e', 'ఎ', 'ె'), V('o', 'ఒ', 'ొ'),
  // ── హల్లులు ─────────────────────────────────────────────
  C('kh', 'ఖ'), C('Kh', 'ఖ'), C('KH', 'ఖ'),
  C('gh', 'ఘ'), C('Gh', 'ఘ'),
  C('ch', 'చ'), C('Ch', 'చ'), C('CH', 'చ'),
  C('jh', 'ఝ'), C('Jh', 'ఝ'),
  C('Th', 'త'), C('Dh', 'ద'),
  C('th', 'త'), C('dh', 'ద'),
  C('ph', 'ఫ'), C('Ph', 'ఫ'),
  C('bh', 'భ'), C('Bh', 'భ'),
  C('sh', 'ష'), C('Sh', 'ష'),
  C('k', 'క'), C('K', 'క'),
  C('g', 'గ'), C('G', 'గ'),
  C('c', 'చ'), C('C', 'చ'),
  C('j', 'జ'), C('J', 'జ'),
  C('T', 'త'), C('D', 'ద'), C('N', 'న'),
  C('t', 'త'), C('d', 'ద'), C('n', 'న'),
  C('p', 'ప'), C('P', 'ప'), C('f', 'ఫ'), C('F', 'ఫ'),
  C('b', 'బ'), C('B', 'బ'), C('m', 'మ'), C('M', 'మ'),
  C('y', 'య'), C('Y', 'య'),
  C('r', 'ర'), C('R', 'ర'),
  C('l', 'ల'), C('L', 'ల'),
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
      // తెలుగు పేర్లలో పదం మధ్య/చివరి 'e' సాధారణంగా దీర్ఘం (రమేష్, మహేష్, మల్లేష్)
      const matra = tok.seq === 'e' && i > 0 ? 'ే' : tok.matra!;
      flush(matra);
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
  venkatesh: 'వెంకటేష్',
  prasad: 'ప్రసాద్',
  kumar: 'కుమార్',
  reddy: 'రెడ్డి',
  sastry: 'శాస్త్రి',
  iyer: 'అయ్యర్',
  gupta: 'గుప్తా',
  rajesh: 'రాజేష్',
  shyam: 'శ్యామ్',
  gopal: 'గోపాల్',
  murali: 'మురళి',
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
  sekhar: 'శేఖర్',
  shankar: 'శంకర్',
  uday: 'ఉదయ్',
  vijay: 'విజయ్',
  vinod: 'వినోద్',
  yadav: 'యాదవ్',
  naidu: 'నాయుడు',
  chowdary: 'చౌదరి',
  varma: 'వర్మ',
  verma: 'వర్మ',
    balu: 'బాలు',
  babu: 'బాబు',
  raju: 'రాజు',
  srinu: 'శ్రీను',
  rambabu: 'రాంబాబు',
  venkateswarlu: 'వెంకటేశ్వర్లు',
  sridevi: 'శ్రీదేవి',
  lavanya: 'లావణ్య',
  mallesh: 'మల్లేష్',
  satish: 'సతీష్',
  praveen: 'ప్రవీణ్',
  keerthi: 'కీర్తి',
  sushma: 'సుష్మ',
  bhagyamma: 'భాగ్యమ్మ',
  yellamma: 'యెల్లమ్మ',
  anjali: 'అంజలి',
  priya: 'ప్రియ',
  ramya: 'రమ్య',
  pallavi: 'పల్లవి',
  deepika: 'దీపిక',
  harish: 'హరీష్',
  vamsi: 'వంశీ',
  kiran: 'కిరణ్',
  ravi: 'రవి',
  raghu: 'రఘు',
  srinivas: 'శ్రీనివాస్',
  srinu2: 'శ్రీను',
  ramesh: 'రమేష్',
  suresh: 'సురేష్',
  mahesh: 'మహేష్',
  ganesh: 'గణేష్',
  naveen: 'నవీన్',
  pradeep: 'ప్రదీప్',
  kavitha: 'కవిత',
  kavita: 'కవిత',
  swathi: 'స్వాతి',
  swati: 'స్వాతి',
  sandhya: 'సంధ్య',
  madhavi: 'మాధవి',
  padma: 'పద్మ',
  vani: 'వాణి',
  divya: 'దివ్య',
  sai: 'సాయి',
  sravani: 'శ్రావణి',
  bhaskar: 'భాస్కర్',
  kalyani: 'కళ్యాణి',
  naganna: 'నాగన్న',
  anitha: 'అనిత',
  anita: 'అనిత',
  charan: 'చరణ్',
  krishna: 'కృష్ణ',
  lakshmi: 'లక్ష్మి',
  venkata: 'వెంకట',
  rao: 'రావు',
  surya: 'సూర్య',
  prakash: 'ప్రకాష్',
  teja: 'తేజ',
  sarma: 'శర్మ',
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

/* ------------------------------------------------------------------ */
/*  తెలుగు → ఆంగ్లం (romanisation)                                     */
/* ------------------------------------------------------------------ */

const TE_CONS: Record<string, string> = {
  క: 'k', ఖ: 'kh', గ: 'g', ఘ: 'gh', ఙ: 'n',
  చ: 'ch', ఛ: 'chh', జ: 'j', ఝ: 'jh', ఞ: 'n',
  ట: 't', ఠ: 'th', డ: 'd', ఢ: 'dh', ణ: 'n',
  త: 't', థ: 'th', ద: 'd', ధ: 'dh', న: 'n',
  ప: 'p', ఫ: 'ph', బ: 'b', భ: 'bh', మ: 'm',
  య: 'y', ర: 'r', ల: 'l', వ: 'v', ళ: 'l',
  శ: 'sh', ష: 'sh', స: 's', హ: 'h', ఱ: 'r',
};

const TE_MATRA: Record<string, string> = {
  '': 'a', 'ా': 'aa', 'ి': 'i', 'ీ': 'ee', 'ు': 'u', 'ూ': 'oo',
  'ృ': 'ri', 'ౄ': 'ru', 'ె': 'e', 'ే': 'e', 'ై': 'ai',
  'ొ': 'o', 'ో': 'o', 'ౌ': 'au', 'ం': 'm', 'ః': 'h', 'ఁ': 'n',
};

const TE_VOWEL: Record<string, string> = {
  అ: 'a', ఆ: 'aa', ఇ: 'i', ఈ: 'ee', ఉ: 'u', ఊ: 'oo',
  ఋ: 'ri', ఎ: 'e', ఏ: 'e', ఐ: 'ai', ఒ: 'o', ఓ: 'o', ఔ: 'au',
};

const HALANT_TE = '\u0C4D';

/** పరిచిత తెలుగు పేర్ల సంప్రదాయ ఆంగ్ల రూపాలు */
const TELUGU_TO_LATIN_OVERRIDES: Record<string, string> = {
  చరణ్: 'Charan', లక్ష్మి: 'Lakshmi', కృష్ణ: 'Krishna', కృష్ణా: 'Krishna',
  శ్రీనివాస్: 'Srinivas', వెంకట: 'Venkata', వెంకటేష్: 'Venkatesh',
  రావు: 'Rao', రమేష్: 'Ramesh', సాయి: 'Sai', అనిత: 'Anitha',
  శర్మ: 'Sharma', రెడ్డి: 'Reddy', నాయుడు: 'Naidu', చౌదరి: 'Chowdary',
  ప్రసాద్: 'Prasad', కుమార్: 'Kumar', సురేష్: 'Suresh', మహేష్: 'Mahesh',
  రవి: 'Ravi', దివ్య: 'Divya', స్వాతి: 'Swathi', కవిత: 'Kavitha',
  వాణి: 'Vani', వంశీ: 'Vamsi', తేజ: 'Teja', ఆదిత్య: 'Aditya',
  హైదరాబాద్: 'Hyderabad', విజయవాడ: 'Vijayawada', తిరుపతి: 'Tirupati',
  విశాఖపట్నం: 'Visakhapatnam', వరంగల్: 'Warangal', గుంటూరు: 'Guntur',
};

/** తెలుగు పేరును ఆంగ్ల (రోమన్) రూపంలోకి మార్చు — "చరణ్" → "Charan". */
export function teluguToLatin(input: string): string {
  const src = (input ?? '').trim();
  if (!src) return '';
  if (!/[\u0C00-\u0C7F]/.test(src)) return src;
  const words = src.split(/\s+/).map((w) => {
    const over = TELUGU_TO_LATIN_OVERRIDES[w];
    if (over) return over;
    const r = romanizeWord(w);
    return TELUGU_TO_LATIN_OVERRIDES[r.toLowerCase()] ?? r;
  });
  return words
    .map((w) => (/^[a-z]/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function romanizeWord(word: string): string {
  const chars = Array.from(word);
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (TE_CONS[c]) {
      const next = chars[i + 1];
      if (next === HALANT_TE) {
        out += TE_CONS[c];
        i += 1;
      } else if (next && TE_MATRA[next] !== undefined) {
        out += TE_CONS[c] + TE_MATRA[next];
        i += 1;
      } else {
        out += TE_CONS[c] + 'a';
      }
      continue;
    }
    if (TE_VOWEL[c]) {
      out += TE_VOWEL[c];
      continue;
    }
    if (c === 'ం') {
      const next = chars[i + 1] ?? '';
      const labial = ['ప', 'ఫ', 'బ', 'భ', 'మ'].includes(next);
      out += labial ? 'm' : 'n';
      continue;
    }
    if (TE_MATRA[c] !== undefined) {
      out += TE_MATRA[c];
      continue;
    }
    if (c === HALANT_TE) continue;
    out += c;
  }
  // తెలుగు పేర్ల చివరి 'a' సాధారణంగా మౌనం (చరణ → Charan)
  return out.replace(/a$/, '') || out;
}

/**
 * ఏ భాషలో టైప్ చేసినా రెండు రూపాలను ఇచ్చు.
 *   { te, en } — "Charan" ⇄ "చరణ్"
 */
export function bilingualName(input: string): { te: string; en: string } {
  const raw = (input ?? '').trim();
  if (!raw) return { te: '', en: '' };
  if (/[\u0C00-\u0C7F]/.test(raw)) {
    return { te: raw, en: teluguToLatin(raw) };
  }
  return { te: englishToTeluguSmart(raw), en: raw };
}
