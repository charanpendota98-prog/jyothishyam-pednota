/**
 * granthaPageMap.ts — ముద్రణా గ్రంథ పుట చిట్టా (single source of truth)
 * ---------------------------------------------------------------------------
 * విషయ సూచిక (TOC), PDF బుక్‌మార్క్‌లు, పుట సంఖ్యలు — మూడూ ఇక్కడినుంచే వస్తాయి.
 * ఒక పుటను జోడించినా తీసినా ఈ శ్రేణిని మార్చితే సరిపోతుంది; పుట నంబర్లు,
 * TOC, బుక్‌మార్క్‌లు, `verify:jathaka` గేట్ — అన్నీ తమంతట తాము సరిపోతాయి.
 *
 * `num` = PDF లో పుట క్రమ సంఖ్య (1 ఆధారితం). `id` = HTML యాంకర్ (grantha-pN).
 * `titleEn` = PDF outline కోసం ASCII శీర్షిక (jsPDF బుక్‌మార్క్‌లు UTF-16
 * ఎన్‌కోడింగ్ చేయవు — తెలుగు అక్షరాలు పాడవుతాయి; అందుకే ఆంగ్లం).
 */

export interface GranthaPageMeta {
  /** PDF పుట క్రమ సంఖ్య — 1 ఆధారితం, ఖాళీ లేకుండా 1…N */
  num: number;
  /** HTML యాంకర్ id */
  id: string;
  /** విషయ సూచికలో తెలుగు శీర్షిక */
  titleTe: string;
  /** PDF బుక్‌మార్క్ శీర్షిక (ASCII మాత్రమే) */
  titleEn: string;
  /** గ్రంథ భాగం (అధ్యాయ సమూహం) */
  partTe: string;
  /** PDF బుక్‌మార్క్ భాగ-శీర్షిక (ASCII) */
  partEn: string;
}

export const GRANTHA_PAGES: readonly GranthaPageMeta[] = [
  {
    num: 1,
    id: 'grantha-p1',
    titleTe: 'ముఖపత్రం · స్వస్తిశ్రీ · పంచాంగం · D1 & D9 · గ్రహ స్ఫుటాలు',
    titleEn: '1. Mukhapatram - Swasti Sri, Panchanga, D1 & D9, Sphutas',
    partTe: 'ప్రథమ భాగం · మూల కుండలి',
    partEn: 'Part I · Foundation Chart',
  },
  {
    num: 2,
    id: 'grantha-p2',
    titleTe: 'విషయ సూచిక (Table of Contents)',
    titleEn: '2. Table of Contents',
    partTe: 'ప్రథమ భాగం · మూల కుండలి',
    partEn: 'Part I · Foundation Chart',
  },
  {
    num: 3,
    id: 'grantha-p3',
    titleTe: 'శ్రీపతి భావ చలితం · రాశి కుండలి · 11 ఉపగ్రహాలు · పంచధా మైత్రి',
    titleEn: '3. Sripati Bhava Chalita, Rasi Kundali, 11 Upagrahas, Panchadha Maitri',
    partTe: 'ప్రథమ భాగం · మూల కుండలి',
    partEn: 'Part I · Foundation Chart',
  },
  {
    num: 4,
    id: 'grantha-p4',
    titleTe: 'షడ్వర్గ కుండలులు (D2 · D3 · D4 · D7 · D10 · D12) · వైశేషికాంశ',
    titleEn: '4. Six Divisional Varga Kundalis (D2-D12), Vaiseshikamsa',
    partTe: 'ప్రథమ భాగం · మూల కుండలి',
    partEn: 'Part I · Foundation Chart',
  },
  {
    num: 5,
    id: 'grantha-p5',
    titleTe: 'గ్రహ అవస్థలు — బాలాది · దీప్తాది · జాగ్రదాది · గ్రహ యుద్ధం · అస్తంగతం',
    titleEn: '5. Graha Avastha - Baladi, Deeptadi, Jagradadi, War, Combustion',
    partTe: 'ద్వితీయ భాగం · బల విచారణ',
    partEn: 'Part II · Strength Analysis',
  },
  {
    num: 6,
    id: 'grantha-p6',
    titleTe: 'షడ్బలం · ఇష్ట/కష్ట ఫలం · 12 భావ బలాలు',
    titleEn: '6. Shadbala, Ishta/Kashta Phala, Bhava Bala, Avasthas',
    partTe: 'ద్వితీయ భాగం · బల విచారణ',
    partEn: 'Part II · Strength Analysis',
  },
  {
    num: 7,
    id: 'grantha-p7',
    titleTe: 'భిన్నాష్టకవర్గం 7×12 · శోధ్య పిండ · సుదర్శన చక్రం',
    titleEn: '7. Bhinnashtakavarga 7x12, Sodhya Pinda, Sudarshana Chakra',
    partTe: 'ద్వితీయ భాగం · బల విచారణ',
    partEn: 'Part II · Strength Analysis',
  },
  {
    num: 8,
    id: 'grantha-p8',
    titleTe: 'జైమిని కారకులు · చరదశ · 22వ ద్రేక్కాణ · పాప సామ్యం · సాడే సాతి',
    titleEn: '8. Jaimini Karakas, Chara Dasha, 22nd Drekkana, Papa Samya, Sade Sati',
    partTe: 'ద్వితీయ భాగం · బల విచారణ',
    partEn: 'Part II · Strength Analysis',
  },
  {
    num: 9,
    id: 'grantha-p9',
    titleTe: '81 మహాదశా–భుక్తి మాతృక — ఖచ్చిత తేదీలతో',
    titleEn: '9. 81 Mahadasha-Bhukti Matrix with Exact Dates',
    partTe: 'తృతీయ భాగం · కాల చక్రం',
    partEn: 'Part III · Time Wheel',
  },
  {
    num: 10,
    id: 'grantha-p10',
    titleTe: 'నవగ్రహ వ్యక్తిగత ఫలాలు — భాగం 1 (సూర్యుడు … గురువు)',
    titleEn: '10. Navagraha Individual Predictions, Part 1 (Sun to Jupiter)',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 11,
    id: 'grantha-p11',
    titleTe: 'నవగ్రహ ఫలాలు — భాగం 2 (శుక్రుడు … కేతువు) · వివాహ/వృత్తి నీలనా',
    titleEn: '11. Navagraha Predictions, Part 2 (Venus to Ketu), Marriage & Career',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 12,
    id: 'grantha-p12',
    titleTe: 'జననం–100 సం. జీవన యుగాలు · 9 మహాదశా ఫలాలు',
    titleEn: '12. Birth-to-100 Life Epochs, Nine Mahadasha Phalas',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 13,
    id: 'grantha-p13',
    titleTe: 'ద్వాదశ భావ ఫలితాలు · గ్రంథ ప్రమాణాలు',
    titleEn: '13. Dwadasa Bhava Phalitalu, Twelve Grantha Citations',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 14,
    id: 'grantha-p14',
    titleTe: 'ద్వాదశ భావ సూక్ష్మ విచారం I — భావాలు 1–6 (ఆధారం · అధిపతి · నివాసులు · దృష్టి · బలం · కాలం)',
    titleEn: '14. Dwadasa Bhava Sookshma Vichara I - Houses 1-6',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 15,
    id: 'grantha-p15',
    titleTe: 'ద్వాదశ భావ సూక్ష్మ విచారం II — భావాలు 7–12 (ఆధారం · అధిపతి · నివాసులు · దృష్టి · బలం · కాలం)',
    titleEn: '15. Dwadasa Bhava Sookshma Vichara II - Houses 7-12',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 16,
    id: 'grantha-p16',
    titleTe: 'నవగ్రహ సూక్ష్మ విచారం I — సూర్యుడు · చంద్రుడు · కుజుడు (స్థానం · కర్మ · బలం · సంబంధం · ఫలం · కాలం)',
    titleEn: '16. Navagraha Sookshma Vichara I - Sun, Moon, Mars',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 17,
    id: 'grantha-p17',
    titleTe: 'నవగ్రహ సూక్ష్మ విచారం II — బుధుడు · గురువు · శుక్రుడు (స్థానం · కర్మ · బలం · సంబంధం · ఫలం · కాలం)',
    titleEn: '17. Navagraha Sookshma Vichara II - Mercury, Jupiter, Venus',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 18,
    id: 'grantha-p18',
    titleTe: 'నవగ్రహ సూక్ష్మ విచారం III — శని · రాహువు · కేతువు (స్థానం · కర్మ · బలం · సంబంధం · ఫలం · కాలం)',
    titleEn: '18. Navagraha Sookshma Vichara III - Saturn, Rahu, Ketu',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 19,
    id: 'grantha-p19',
    titleTe: 'దోష సూక్ష్మ పరిశీలన — ఏర్పడ్డాయా · భంగం ఉందా · ప్రభావం · పరిహారం · కాలం',
    titleEn: '19. Dosha Sookshma Pariseelana - Evidence, Cancellation, Remedy',
    partTe: 'చతుర్థ భాగం · ఫల వివరణ',
    partEn: 'Part IV · Phala Vivarana',
  },
  {
    num: 20,
    id: 'grantha-p20',
    titleTe: 'ఆరు జీవన స్తంభాలు · దోష పరీక్ష · నవగ్రహ పరిహారాలు · కొలోఫోన్',
    titleEn: '20. Six Life Pillars, Dosha Pariksha, Nine Remedies, Colophon',
    partTe: 'పంచమ భాగం · పరిహారం',
    partEn: 'Part V · Parihara & Varshaphala',
  },
  {
    num: 21,
    id: 'grantha-p21',
    titleTe: 'తాజిక వర్షఫలం · 12 నెలల ఫల పంచాంగం',
    titleEn: '21. Tajika Varshaphala, Twelve-Month Forecast Calendar',
    partTe: 'పంచమ భాగం · పరిహారం',
    partEn: 'Part V · Parihara & Varshaphala',
  },
  {
    num: 22,
    id: 'grantha-p22',
    titleTe: 'సప్త-సంప్రదాయ సమన్వయం — 12 భావాలు × 7 పద్ధతులు',
    titleEn: '22. Sapta-Sampradaya Samanvaya (7 schools x 12 houses)',
    partTe: 'షష్ఠ భాగం · పండిత విచారణ',
    partEn: 'Part VI · Pandita Vichara',
  },
  {
    num: 23,
    id: 'grantha-p23',
    titleTe: 'యోగ విచారం — ప్రతి యోగానికి ఆధారం · బలం · ఫలం',
    titleEn: '23. Yoga Vichara - Evidence, Strength and Fruit of Every Yoga',
    partTe: 'షష్ఠ భాగం · పండిత విచారణ',
    partEn: 'Part VI · Pandita Vichara',
  },
  {
    num: 24,
    id: 'grantha-p24',
    titleTe: 'అష్టకవర్గ భావ ఫలాలు & అవకహడా చక్రం',
    titleEn: '24. Ashtakavarga Bhava Phala & Avakahada Chakra',
    partTe: 'షష్ఠ భాగం · పండిత విచారణ',
    partEn: 'Part VI · Pandita Vichara',
  },
  {
    num: 25,
    id: 'grantha-p25',
    titleTe: 'సూక్ష్మ నాడీ విచారం — కేపీ సబ్-లార్డ్ · పరివర్తన · బాధక-మారక',
    titleEn: '25. Sookshma Nadi - KP Sub-Lords, Parivartana, Badhaka-Maraka',
    partTe: 'షష్ఠ భాగం · పండిత విచారణ',
    partEn: 'Part VI · Pandita Vichara',
  },
  {
    num: 26,
    id: 'grantha-p26',
    titleTe: 'జీవిత విస్తర — ప్రతి జీవన రంగం లోతైన విచారం',
    titleEn: '26. Jeevita Vistara - Deep Reading of Every Life Domain',
    partTe: 'షష్ఠ భాగం · పండిత విచారణ',
    partEn: 'Part VI · Pandita Vichara',
  },
  {
    num: 27,
    id: 'grantha-p27',
    titleTe: 'వింశోత్తరి భుక్తి ఫలాలు I (1–3 మహాదశలు · 27 భుక్తులు)',
    titleEn: '27. Vimsottari Bhukti Phala I (MD 1-3, 27 bhuktis)',
    partTe: 'సప్తమ భాగం · దశా ఫల విస్తరం',
    partEn: 'Part VII · Dasha Phala',
  },
  {
    num: 28,
    id: 'grantha-p28',
    titleTe: 'వింశోత్తరి భుక్తి ఫలాలు II (4–6 మహాదశలు · 27 భుక్తులు)',
    titleEn: '28. Vimsottari Bhukti Phala II (MD 4-6, 27 bhuktis)',
    partTe: 'సప్తమ భాగం · దశా ఫల విస్తరం',
    partEn: 'Part VII · Dasha Phala',
  },
  {
    num: 29,
    id: 'grantha-p29',
    titleTe: 'వింశోత్తరి భుక్తి ఫలాలు III (7–9 మహాదశలు · 27 భుక్తులు)',
    titleEn: '29. Vimsottari Bhukti Phala III (MD 7-9, 27 bhuktis)',
    partTe: 'సప్తమ భాగం · దశా ఫల విస్తరం',
    partEn: 'Part VII · Dasha Phala',
  },
  {
    num: 30,
    id: 'grantha-p30',
    titleTe: 'గ్రహ సహాయకులు — ఏ గ్రహం ఏ జీవన రంగానికి తోడ్పడుతుంది',
    titleEn: '30. Graha Sahayaka - Which Planet Supports Which Life Area',
    partTe: 'సప్తమ భాగం · దశా ఫల విస్తరం',
    partEn: 'Part VII · Dasha Phala',
  },
  {
    num: 31,
    id: 'grantha-p31',
    titleTe: 'దశా × గోచార సమన్వయం — రాబోయే 12 నెలలు · ప్రత్యంతర దశలు',
    titleEn: '31. Dasha x Gochara Samanvaya - Next 12 months, Pratyantar dashas',
    partTe: 'సప్తమ భాగం · దశా ఫల విస్తరం',
    partEn: 'Part VII · Dasha Phala',
  },
  {
    num: 32,
    id: 'grantha-p32',
    titleTe: 'గోచార ఫలం — నడుస్తున్న గ్రహ సంచారం · సాడే సాతి · వేధ',
    titleEn: '32. Gochara Phala - Current Transits, Sade Sati, Vedha',
    partTe: 'అష్టమ భాగం · గోచారం',
    partEn: 'Part VIII · Gochara',
  },
  {
    num: 33,
    id: 'grantha-p33',
    titleTe: 'గ్రంథ మండలం — మూల ఆధార గ్రంథములు & సిద్ధాంత ప్రమాణం',
    titleEn: '33. Grantha Mandala - Source Texts & Doctrinal Standard',
    partTe: 'నవమ భాగం · మూల గ్రంథాలు',
    partEn: 'Part IX · Sources',
  },
  {
    num: 34,
    id: 'grantha-p34',
    titleTe: 'గణన పద్ధతి — ప్రతి అంకె వెనుక సూత్రం & గ్రంథ ప్రమాణం',
    titleEn: '34. Method Appendix - Sutra and Source per Number',
    partTe: 'దశమ భాగం · గణన పద్ధతి',
    partEn: 'Part X · Method',
  },
];

export const GRANTHA_PAGE_COUNT = GRANTHA_PAGES.length;

/** పుట సంఖ్య → అంకర్ */
export const granthaAnchor = (num: number) => `grantha-p${num}`;

/** పుట id → పుట సంఖ్య (తెలియని id కి 0) */
export const pageNumOf = (id: string) =>
  GRANTHA_PAGES.find((p) => p.id === id)?.num ?? 0;

/** విషయ సూచిక కోసం భాగాల వారీగా గ్రూపింగ్ */
export const granthaPartsTe = (): { partTe: string; pages: GranthaPageMeta[] }[] => {
  const out: { partTe: string; pages: GranthaPageMeta[] }[] = [];
  for (const p of GRANTHA_PAGES) {
    if (p.num === 2) continue; // సూచికను తనలో తాను చూపము
    const last = out[out.length - 1];
    if (last && last.partTe === p.partTe) last.pages.push(p);
    else out.push({ partTe: p.partTe, pages: [p] });
  }
  return out;
};
