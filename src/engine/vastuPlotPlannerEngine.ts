/**
 * vastuPlotPlannerEngine.ts — ప్లాట్ → సెట్‌బ్యాక్ → నిర్మాణ సామర్థ్యం → వాస్తు ప్లాన్
 * (Plot → setback → buildable envelope → vastu layout, with a scaled drawing.)
 *
 * ఎందుకు ఈ ఇంజిన్:
 *   ఇప్పటివరకు ఉన్న `vastuProjectPlan.ts` గది వారీగా శాస్త్రీయ సలహా ఇస్తుంది, కానీ
 *   "1 గుంట ప్లాట్‌లో ½ గుంట ఇల్లు వస్తుందా?", "ఎన్ని అంతస్తులు వేయొచ్చు?",
 *   "గ్రౌండ్ కవరేజ్ ఎంత?" — ఈ లెక్కలు ఎక్కడా లేవు. ఇది ఆ ఖాళీని పూరిస్తుంది:
 *
 *   1. యూనిట్లు: గుంట / చదరపు గజం / చదరపు అడుగు / ఎకరం / చ.మీ. — ఖచ్చితమైన మార్పిడి
 *      (1 గుంట = 121 చ.గజం = 1089 చ.అ.; 1 ఎకరం = 40 గుంట).
 *   2. సెట్‌బ్యాక్‌లు (ఫ్రంట్/సైడ్/రియర్) ప్లాట్ విస్తీర్ణం + వీధి వెడల్పు + వినియోగం ప్రకారం.
 *   3. నిర్మాణ సామర్థ్యం: గ్రౌండ్ కవరేజ్ %, FSI/FAR, అనుమతించిన అంతస్తులు, మొత్తం BUA.
 *   4. గది కార్యక్రమం (1BHK/2BHK/3BHK · షాప్ · అద్దె యూనిట్లు) — వాస్తు దిక్కులకు
 *      ప్రాధాన్యత ఇస్తూ 3 బ్యాండ్‌లుగా (దక్షిణ · మధ్య · ఉత్తర) విభజన.
 *   5. ప్రతి గదికి దిక్కు తనిఖీ (బెస్ట్/ఓకే/తప్పు) + కారణం + పరిహారం.
 *   6. ఫలితం: ప్లాట్, సెట్‌బ్యాక్, భవనం, గదులు, పార్కింగ్, ట్యాంక్/బోరు/సెప్టిక్ —
 *      అన్నీ అడుగులలో (నైరుతి మూలం, ఉత్తరం పైకి) — నేరుగా SVG ప్లాన్‌గా గీయగలిగేలా.
 *
 * ⚠️ నిబంధనల గురించి నిజాయితీ: సెట్‌బ్యాక్/కవరేజ్ విలువలు **సూచనాత్మకం** (indicative).
 *    ప్రతి మునిసిపాలిటీ/గ్రామ పంచాయతీ నిబంధనలు, రోడ్డు వెడల్పు, ఎత్తు-prof ile బట్టి
 *    మారుతాయి. ఈ ఇంజిన్ ఆ విలువలను `rules` గా బయటకు ఇస్తుంది, గ్రాహకుడు మార్చుకోవచ్చు;
 *    తుది ప్లాన్‌ను స్థానిక అనుమతి (MRO/DTCP) ప్రకారం నిర్ధారించుకోవాలి అని ప్లాన్‌లోనే ముద్రిస్తుంది.
 */

/* ================================================================== *
 *  Units
 * ================================================================== */

export type PlotUnit = 'gunta' | 'sqyd' | 'sqft' | 'sqm' | 'acre';

export const SQFT_PER_UNIT: Record<PlotUnit, number> = {
  sqft: 1,
  sqyd: 9,
  sqm: 10.7639104167,
  gunta: 1089, // 121 sq yd
  acre: 43560, // 40 guntas
};

export const UNIT_LABEL_TE: Record<PlotUnit, string> = {
  gunta: 'గుంట',
  sqyd: 'చ.గజం',
  sqft: 'చ.అడుగు',
  sqm: 'చ.మీ.',
  acre: 'ఎకరం',
};

export const toSqft = (value: number, unit: PlotUnit): number => value * SQFT_PER_UNIT[unit];

/* ================================================================== *
 *  Directions & zoning
 * ================================================================== */

export type Dik8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type Zone9 = 'NW' | 'N' | 'NE' | 'W' | 'C' | 'E' | 'SW' | 'S' | 'SE';

export const ZONE_LABEL_TE: Record<Zone9, string> = {
  NW: 'వాయువ్యం',
  N: 'ఉత్తరం',
  NE: 'ఈశాన్యం',
  W: 'పడమర',
  C: 'మధ్యం (బ్రహ్మస్థానం)',
  E: 'తూర్పు',
  SW: 'నైరుతి',
  S: 'దక్షిణం',
  SE: 'ఆగ్నేయం',
};

/** ఆరు-దిక్కులలో (కార్నర్లతో సహా) ఏ బ్యాండ్ + ఏ వైపు */
const DIK_TO_BAND: Record<Dik8, 'S' | 'M' | 'N'> = {
  S: 'S', SW: 'S', SE: 'S',
  E: 'M', W: 'M',
  N: 'N', NE: 'N', NW: 'N',
};

/** బ్యాండ్ లోపల గదిని ఎడమ(పడమర) → కుడి(తూర్పు) ఏ క్రమంలో ఉంచాలి */
const DIK_TO_X: Record<Dik8, number> = { W: 0, NW: 0, SW: 0, N: 0.5, S: 0.5, E: 1, NE: 1, SE: 1 };

const BAND_ZONE_ROWS: Record<'S' | 'M' | 'N', Zone9[]> = {
  S: ['SW', 'S', 'SE'],
  M: ['W', 'C', 'E'],
  N: ['NW', 'N', 'NE'],
};

export const ZONE_LABEL_EN: Record<Zone9, string> = {
  NW: 'North-West',
  N: 'North',
  NE: 'North-East',
  W: 'West',
  C: 'Centre (Brahmasthanam)',
  E: 'East',
  SW: 'South-West',
  S: 'South',
  SE: 'South-East',
};

export function zoneOfPoint(fx: number, fy: number): Zone9 {
  const col = fx < 1 / 3 ? 0 : fx < 2 / 3 ? 1 : 2;
  const row = fy < 1 / 3 ? 0 : fy < 2 / 3 ? 1 : 2;
  return BAND_ZONE_ROWS[(['S', 'M', 'N'] as const)[row]][col];
}

/* ================================================================== *
 *  Room catalogue
 * ================================================================== */

export type PlanRoomKey =
  | 'pooja' | 'kitchen' | 'master' | 'children' | 'living' | 'dining'
  | 'toilet' | 'bath' | 'stair' | 'store' | 'guest' | 'study' | 'hal'
  | 'shop' | 'office' | 'cash' | 'staff' | 'balcony' | 'utility';

export interface RoomMeta {
  key: PlanRoomKey;
  labelTe: string;
  labelEn: string;
  /** వాస్తు ప్రకారం ఉత్తమ దిక్కులు (మొదటిది అత్యుత్తమం) */
  ideal: Dik8[];
  /** ఏ దిక్కు అయినా పనికొస్తుంది (తప్పు కాదు) */
  acceptable?: Dik8[];
  /** ఖచ్చితంగా వద్దన్న దిక్కులు */
  avoid?: Dik8[];
  /** సూచనాత్మక విస్తీర్ణం (చ.అ.) */
  areaSqft: number;
  minSqft: number;
  ratio: number; // వెడల్పు : లోతు (1 = చతురస్రం)
  priority: number; // 1 = ఖచ్చితంగా కావాలి
}

export const ROOM_META: Record<PlanRoomKey, RoomMeta> = {
  pooja:    { key: 'pooja',    labelTe: 'పూజా గది',        labelEn: 'Pooja',        ideal: ['NE', 'N', 'E'], avoid: ['S', 'SW', 'SE'], areaSqft: 30,  minSqft: 16,  ratio: 1,   priority: 1 },
  kitchen:  { key: 'kitchen',  labelTe: 'వంటగది',          labelEn: 'Kitchen',      ideal: ['SE', 'E', 'NW'], avoid: ['NE', 'SW'],      areaSqft: 95,  minSqft: 60,  ratio: 1.4, priority: 1 },
  master:   { key: 'master',   labelTe: 'ప్రధాన పడకగది',   labelEn: 'Master bed',   ideal: ['SW', 'S', 'W'],  avoid: ['NE', 'SE'], areaSqft: 145, minSqft: 100, ratio: 1.2, priority: 1 },
  children: { key: 'children', labelTe: 'పిల్లల పడకగది',   labelEn: 'Children bed', ideal: ['W', 'NW', 'N'],  avoid: ['SE', 'SW'],      areaSqft: 115, minSqft: 85,  ratio: 1.2, priority: 2 },
  living:   { key: 'living',   labelTe: 'హాల్ / లివింగ్',  labelEn: 'Living',       ideal: ['N', 'NE', 'E'],  avoid: ['SW', 'S'],       areaSqft: 180, minSqft: 110, ratio: 1.5, priority: 1 },
  dining:   { key: 'dining',   labelTe: 'భోజన గది',        labelEn: 'Dining',       ideal: ['W', 'E'],        avoid: ['NE', 'SW'],      areaSqft: 95,  minSqft: 65,  ratio: 1.3, priority: 2 },
  toilet:   { key: 'toilet',   labelTe: 'శౌచాలయం',         labelEn: 'Toilet',       ideal: ['NW', 'W'],       avoid: ['NE', 'SE'], areaSqft: 32,  minSqft: 25,  ratio: 1,   priority: 1 },
  bath:     { key: 'bath',     labelTe: 'స్నానాల గది',      labelEn: 'Bath',         ideal: ['NW', 'W', 'E'],  avoid: ['NE'],       areaSqft: 38,  minSqft: 28,  ratio: 1,   priority: 2 },
  stair:    { key: 'stair',    labelTe: 'మెట్లు',           labelEn: 'Staircase',    ideal: ['SW', 'S', 'W'],  avoid: ['NE'],       areaSqft: 70,  minSqft: 55,  ratio: 1,   priority: 1 },
  store:    { key: 'store',    labelTe: 'నిల్వ గది',        labelEn: 'Store',        ideal: ['SW', 'S', 'W'],  avoid: ['NE'],            areaSqft: 45,  minSqft: 30,  ratio: 1,   priority: 3 },
  guest:    { key: 'guest',    labelTe: 'అతిథి గది',        labelEn: 'Guest',        ideal: ['NW', 'W'],       avoid: ['SE'],       areaSqft: 105, minSqft: 85,  ratio: 1.2, priority: 3 },
  study:    { key: 'study',    labelTe: 'చదువుల గది',       labelEn: 'Study',        ideal: ['NE', 'N', 'E'],  avoid: ['S', 'SW'],       areaSqft: 80,  minSqft: 60,  ratio: 1.2, priority: 3 },
  hal:      { key: 'hal',      labelTe: 'హాల్ / కారిడార్',  labelEn: 'Hall / corridor', ideal: ['N', 'E', 'W'], avoid: [],               areaSqft: 0,   minSqft: 0,   ratio: 2.2, priority: 1 },
  shop:     { key: 'shop',     labelTe: 'దుకాణం',           labelEn: 'Shop',         ideal: ['N', 'E', 'NE'],  avoid: ['SW', 'S'],       areaSqft: 260, minSqft: 150, ratio: 1.6, priority: 1 },
  office:   { key: 'office',   labelTe: 'కార్యాలయం',        labelEn: 'Office',       ideal: ['N', 'E', 'NE'],  avoid: ['SW', 'S'],       areaSqft: 400, minSqft: 200, ratio: 1.6, priority: 1 },
  cash:     { key: 'cash',     labelTe: 'క్యాష్ / బిల్లింగ్', labelEn: 'Cash',        ideal: ['N', 'NE', 'E'],  avoid: ['S', 'SW'],       areaSqft: 45,  minSqft: 30,  ratio: 1,   priority: 2 },
  staff:    { key: 'staff',    labelTe: 'సిబ్బంది గది',      labelEn: 'Staff',        ideal: ['NW', 'W'],       avoid: ['NE'],            areaSqft: 60,  minSqft: 40,  ratio: 1.2, priority: 3 },
  balcony:  { key: 'balcony',  labelTe: 'బాల్కనీ',           labelEn: 'Balcony',      ideal: ['E', 'N', 'NE'],  avoid: [],                areaSqft: 45,  minSqft: 25,  ratio: 3,   priority: 3 },
  utility:  { key: 'utility',  labelTe: 'యుటిలిటీ / వాష్',   labelEn: 'Utility',      ideal: ['NW', 'W'],       avoid: ['NE'],       areaSqft: 40,  minSqft: 25,  ratio: 1.4, priority: 3 },
};

/* ================================================================== *
 *  Building rules (indicative presets)
 * ================================================================== */

export type RulePreset = 'ts_residential' | 'ts_commercial' | 'custom';

export interface SetbackBand {
  uptoSqft: number | null; // null = ఆ పైన అన్నీ
  frontFt: number;
  sideFt: number;
  rearFt: number;
  coveragePct: number; // గ్రౌండ్ కవరేజ్ గరిష్ఠం %
  far: number; // FSI
}

export interface BuildingRules {
  presetId: RulePreset;
  labelTe: string;
  labelEn: string;
  bands: SetbackBand[];
  minRoadFt: number;
  noteTe: string;
}

const TS_RESIDENTIAL: BuildingRules = {
  presetId: 'ts_residential',
  labelTe: 'తెలంగాణ / ఆంధ్రప్రదేశ్ నివాస నిబంధనలు (సూచనాత్మకం)',
  labelEn: 'Telangana / AP residential (indicative)',
  minRoadFt: 20,
  noteTe:
    'సెట్‌బ్యాక్‌లు ప్లాట్ విస్తీర్ణం, రోడ్డు వెడల్పు, భవన ఎత్తును బట్టి మారుతాయి. ఇవి సాధారణ మునిసిపల్ పద్ధతికి దగ్గరగా ఉంచిన సూచన విలువలు — అనుమతి పొందే ముందు స్థానిక MRO/DTCP నిబంధనలతో నిర్ధారించుకోవాలి.',
  bands: [
    { uptoSqft: 1500, frontFt: 5, sideFt: 2.5, rearFt: 2.5, coveragePct: 65, far: 2.4 },
    { uptoSqft: 3000, frontFt: 8, sideFt: 4, rearFt: 4, coveragePct: 60, far: 2.4 },
    { uptoSqft: 5000, frontFt: 10, sideFt: 5, rearFt: 5, coveragePct: 55, far: 2.2 },
    { uptoSqft: null, frontFt: 12, sideFt: 6, rearFt: 6, coveragePct: 50, far: 2.0 },
  ],
};

const TS_COMMERCIAL: BuildingRules = {
  presetId: 'ts_commercial',
  labelTe: 'వాణిజ్య నిబంధనలు (సూచనాత్మకం)',
  labelEn: 'Commercial (indicative)',
  minRoadFt: 30,
  noteTe:
    'వాణిజ్య భవనాలలో పార్కింగ్, అగ్నిమాపక (fire NOC), ర్యాంప్ నిబంధనలు విడిగా ఉంటాయి. ఇక్కడ ఇచ్చిన కవరేజ్/FSI సూచన మాత్రమే.',
  bands: [
    { uptoSqft: 2000, frontFt: 8, sideFt: 4, rearFt: 4, coveragePct: 60, far: 3.0 },
    { uptoSqft: 5000, frontFt: 10, sideFt: 5, rearFt: 5, coveragePct: 55, far: 3.0 },
    { uptoSqft: null, frontFt: 15, sideFt: 7, rearFt: 7, coveragePct: 50, far: 2.75 },
  ],
};

export const RULE_PRESETS: Record<'ts_residential' | 'ts_commercial', BuildingRules> = {
  ts_residential: TS_RESIDENTIAL,
  ts_commercial: TS_COMMERCIAL,
};

export function bandFor(rules: BuildingRules, areaSqft: number): SetbackBand {
  return rules.bands.find((b) => b.uptoSqft === null || areaSqft <= b.uptoSqft) ?? rules.bands[rules.bands.length - 1];
}

/* ================================================================== *
 *  Inputs & outputs
 * ================================================================== */

export type PlotUse = 'residential' | 'rental' | 'commercial' | 'mixed';

export interface PlotPlanInput {
  /** ప్లాట్ విస్తీర్ణం — areaValue + unit (widthFt/depthFt ఇస్తే అవే ప్రామాణికం) */
  areaValue: number;
  unit: PlotUnit;
  widthFt?: number;
  depthFt?: number;
  /** ప్రధాన ముఖం (రోడ్డు ఏ వైపు) */
  facing: Dik8;
  roadWidthFt?: number;
  floors?: number;
  use?: PlotUse;
  familySize?: number;
  bedrooms?: number;
  parkingCars?: number;
  /** అద్దె యూనిట్ విస్తీర్ణం (చ.అ.) — rental mode లో */
  rentalUnitSqft?: number;
  rules?: BuildingRules;
  /** యజమాని పేరు (ప్లాన్ శీర్షికలో ముద్రించడానికి) */
  clientName?: string;
  /** గ్రామం / ప్రాంతం */
  village?: string;
  /** ఆంగ్ల మోడ్ కోసం పేరు/గ్రామం (లిప్యంతరీకరణ) */
  clientNameEn?: string;
  villageEn?: string;
  /** భూమి ధర — `rateUnit` కి (డిఫాల్ట్: `unit`) */
  landRate?: number;
  rateUnit?: PlotUnit;
  /** నిర్మాణ వ్యయం చ.అ.కు (₹) — ఇవ్వకపోతే వినియోగం ప్రకారం సూచన విలువ */
  buildRatePerSqft?: number;
  /** ఎంత నిర్మాణం కావాలి (చ.అ.) — ఉదా: 1 గుంట ప్లాట్‌లో ½ గుంట ఇల్లు = 544 */
  targetBuiltSqft?: number;
}

export interface Rect {
  x: number; // పడమర నుండి (ft)
  y: number; // దక్షిణం నుండి (ft)
  w: number;
  h: number;
}

export type Fit = 'best' | 'ok' | 'bad';

export interface PlanRoom extends Rect {
  id: string;
  key: PlanRoomKey;
  labelTe: string;
  labelEn: string;
  areaSqft: number;
  zone: Zone9;
  zoneTe: string;
  zoneEn: string;
  fit: Fit;
  /** ఎందుకు best/ok/bad */
  reasonTe: string;
  reasonEn?: string;
  /** bad అయితే పరిహారం */
  remedyTe?: string;
  unitIndex?: number;
}

export interface UnitPlan {
  index: number;
  labelTe: string;
  rect: Rect;
  areaSqft: number;
  rooms: PlanRoom[];
  rentBandTe: string;
  labelEn?: string;
  rentBandEn?: string;
}

export interface PlanEconomics {
  landValueTotal: number;
  landRate: number;
  rateUnit: PlotUnit;
  buildRatePerSqft: number;
  buildCost: number;
  totalProjectCost: number;
  rentLow: number;
  rentHigh: number;
  annualRentLow: number;
  annualRentHigh: number;
  grossYieldPct: number;
  paybackYears: number;
  costPerSqft: number;
  linesTe: string[];
  linesEn: string[];
}

export interface PlanCheck {
  id: string;
  labelTe: string;
  labelEn: string;
  ok: boolean;
  detailTe: string;
  detailEn: string;
}

export interface PlotPlan {
  input: PlotPlanInput;
  plot: {
    widthFt: number;
    depthFt: number;
    areaSqft: number;
    areaGunta: number;
    areaSqyd: number;
    facing: Dik8;
    roadSide: Dik8;
    roadWidthFt: number;
  };
  rules: {
    presetId: RulePreset;
    labelTe: string;
    frontFt: number;
    sideFt: number;
    rearFt: number;
    coveragePct: number;
    far: number;
    noteTe: string;
    roadOk: boolean;
  };
  envelope: Rect;
  building: Rect;
  capacity: {
    envelopeSqft: number;
    allowedCoverageSqft: number;
    groundBuiltSqft: number;
    coverageActualPct: number;
    openAreaSqft: number;
    floors: number;
    floorsAllowed: number;
    totalBuaSqft: number;
    farUsed: number;
    farLimit: number;
    farOk: boolean;
    parkingSqft: number;
    parkingCars: number;
  };
  rooms: PlanRoom[];
  units: UnitPlan[];
  parking: Rect[];
  features: { key: string; labelTe: string; labelEn: string; rect: Rect; noteTe: string; noteEn: string }[];
  entrance: {
    x: number;
    y: number;
    side: Dik8;
    labelTe: string;
    labelEn: string;
    zone: Zone9;
    fit: Fit;
    noteTe: string;
    noteEn: string;
  };
  score: number;
  /** యజమాని/గ్రామం (ప్లాన్ శీర్షిక) */
  client: { nameTe: string; villageTe: string; nameEn: string; villageEn: string };
  /** "ఎంత నిర్మాణం కుదురుతుంది" — నిర్దిష్ట లక్ష్యంతో పోలిక */
  feasibility: {
    targetSqft: number;
    targetGunta: number;
    fitsOnGround: boolean;
    fitsInTotal: boolean;
    maxGroundSqft: number;
    maxTotalSqft: number;
    noteTe: string;
    noteEn: string;
  };
  /** భూమి విలువ → నిర్మాణ వ్యయం → అద్దె/రాబడి */
  economics: PlanEconomics;
  checks: PlanCheck[];
  summaryTe: string[];
  summaryEn: string[];
  warningsTe: string[];
  warningsEn: string[];
  assumptionsTe: string[];
  assumptionsEn: string[];
}

/* ================================================================== *
 *  Geometry helpers
 * ================================================================== */

const round2 = (n: number) => Math.round(n * 100) / 100;
export const area = (r: Rect) => r.w * r.h;
export const contains = (outer: Rect, inner: Rect, eps = 1e-6) =>
  inner.x >= outer.x - eps &&
  inner.y >= outer.y - eps &&
  inner.x + inner.w <= outer.x + outer.w + eps &&
  inner.y + inner.h <= outer.y + outer.h + eps;

export function overlaps(a: Rect, b: Rect, eps = 0.02): boolean {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return ox > eps && oy > eps;
}

/** ఒక దీర్ఘచతురస్రాన్ని ఇచ్చిన విస్తీర్ణాల నిష్పత్తిలో నిలువుగా కోయడం */
function sliceByArea(rect: Rect, weights: number[], horizontal = false): Rect[] {
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const out: Rect[] = [];
  let cursor = horizontal ? rect.y : rect.x;
  for (let i = 0; i < weights.length; i++) {
    const span = (horizontal ? rect.h : rect.w) * (weights[i] / total);
    if (horizontal) out.push({ x: rect.x, y: cursor, w: rect.w, h: span });
    else out.push({ x: cursor, y: rect.y, w: span, h: rect.h });
    cursor += span;
  }
  return out;
}

/* ================================================================== *
 *  Room program
 * ================================================================== */

interface ProgramItem {
  key: PlanRoomKey;
  areaSqft: number;
}

function residentialProgram(
  builtSqft: number,
  familySize: number,
  bedroomsWanted: number | undefined,
  floors = 2
): { items: ProgramItem[]; notesTe: string[]; notesEn: string[] } {
  const notesTe: string[] = [];
  const notesEn: string[] = [];
  const autoBeds = builtSqft < 620 ? 1 : builtSqft < 1050 ? 2 : builtSqft < 1600 ? 3 : 3;
  const beds = Math.max(1, Math.min(bedroomsWanted ?? autoBeds, 5));
  if (bedroomsWanted && bedroomsWanted !== autoBeds) {
    notesTe.push(
      `మీరు అడిగిన ${bedroomsWanted} పడకగదులు ${Math.round(builtSqft)} చ.అ. నిర్మాణానికి ${
        bedroomsWanted > autoBeds ? 'ఇబ్బందిగా ఉంటుంది — గదులు చిన్నవి అవుతాయి' : 'సరిపోతాయి (అదనపు స్థలం హాల్‌కు)'
      }.`
    );
    notesEn.push(
      `You asked for ${bedroomsWanted} bedrooms in ${Math.round(builtSqft)} sq.ft. — ${
        bedroomsWanted > autoBeds ? 'tight, the rooms will be small' : 'they fit (extra space goes to the hall)'
      }.`
    );
  }

  const items: ProgramItem[] = [];
  const add = (key: PlanRoomKey, mult = 1) => items.push({ key, areaSqft: ROOM_META[key].areaSqft * mult });

  add('pooja', builtSqft > 900 ? 1 : 0.7);
  add('kitchen', builtSqft > 1400 ? 1.2 : 1);
  add('living', builtSqft > 1600 ? 1.45 : builtSqft > 900 ? 1.2 : 1);
  add('master', builtSqft > 1600 ? 1.3 : 1);
  for (let i = 1; i < beds; i++) add(i === 1 ? 'children' : 'children', builtSqft > 1800 ? 1 : 0.92);
  if (builtSqft >= 400) add('dining', builtSqft > 1100 ? 1 : 0.8);
  const toilets = builtSqft > 1400 ? 2 : 1;
  for (let i = 0; i < toilets; i++) add('toilet', 1);
  if (builtSqft >= 420) add('bath', 1);
  else {
    notesTe.push('చిన్న నిర్మాణం — స్నానం, శౌచాలయం ఒకే గదిలో (కలిపి) ఉంచాం.');
    notesEn.push('Small built-up — the bath and toilet are combined into one room.');
  }
  if (floors >= 2) add('stair', builtSqft > 1800 ? 1.15 : 1);
  else {
    notesTe.push('ఒకే అంతస్తు కాబట్టి లోపల మెట్లు కేటాయించలేదు — పైకి వెళ్లాలంటే బయట మెట్లు (దక్షిణం/పడమర) ఉంచండి.');
    notesEn.push('Single floor, so no internal staircase is allocated — use an external stair on the South/West if the roof must be reached.');
  }
  if (builtSqft >= 480) add('store', 1);
  if (builtSqft > 1500) add('study', 1);
  if (builtSqft > 1700) add('guest', 1);
  if (familySize >= 6 && builtSqft > 1900) add('guest', 1);

  return { items, notesTe, notesEn };
}

function commercialProgram(builtSqft: number): ProgramItem[] {
  const items: ProgramItem[] = [
    { key: 'shop', areaSqft: Math.max(220, builtSqft * 0.45) },
    { key: 'cash', areaSqft: 40 },
    { key: 'stair', areaSqft: 72 },
    { key: 'toilet', areaSqft: 34 },
    { key: 'store', areaSqft: Math.max(45, builtSqft * 0.08) },
  ];
  if (builtSqft > 1400) items.push({ key: 'staff', areaSqft: 70 });
  return items;
}

/* ================================================================== *
 *  Fit evaluation
 * ================================================================== */

function fitForRoom(key: PlanRoomKey, zone: Zone9): { fit: Fit; reasonTe: string; remedyTe?: string } {
  const meta = ROOM_META[key];
  const zoneAsDik: Partial<Record<Zone9, Dik8>> = {
    NW: 'NW', N: 'N', NE: 'NE', W: 'W', C: 'N', E: 'E', SW: 'SW', S: 'S', SE: 'SE',
  };
  const dik = zoneAsDik[zone] ?? 'N';
  if (meta.avoid?.includes(dik)) {
    return {
      fit: 'bad',
      reasonTe: `${ZONE_LABEL_TE[zone]} ${meta.labelTe}కి శాస్త్రీయంగా వద్దన్న దిక్కు`,
      remedyTe: remedyFor(key, dik),
    };
  }
  if (meta.ideal[0] === dik) return { fit: 'best', reasonTe: `${ZONE_LABEL_TE[zone]} — అత్యుత్తమ దిక్కు` };
  if (meta.ideal.includes(dik)) return { fit: 'ok', reasonTe: `${ZONE_LABEL_TE[zone]} — ఆమోదయోగ్యమైన దిక్కు` };
  if (zone === 'C' && key !== 'hal') {
    return {
      fit: 'bad',
      reasonTe: 'బ్రహ్మస్థానంలో గది — మధ్య ఖాళీగా ఉండాలి',
      remedyTe: 'బ్రహ్మస్థానాన్ని ఖాళీగా/హాల్‌గా ఉంచి, ఆ గదిని పక్కకు జరపండి.',
    };
  }
  return { fit: 'ok', reasonTe: `${ZONE_LABEL_TE[zone]} — తటస్థం, పరిహారంతో సరిపోతుంది` };
}

function remedyFor(key: PlanRoomKey, dik: Dik8): string {
  const map: Partial<Record<PlanRoomKey, string>> = {
    pooja: 'పూజా గదిని ఈశాన్యం/ఉత్తరానికి జరపండి; జరపడం కుదరకపోతే ఆ గదిలో పసుపు రంగు, దీపం మరియు కుబేర యంత్రం ఉంచండి.',
    kitchen: 'వంటగది ఆగ్నేయానికి జరపండి; కుదరకపోతే స్టవ్ తూర్పు ముఖంగా, ఎరుపు/నారింజ రంగు, అగ్ని దిక్కుకు దీపం.',
    master: 'ప్రధాన పడకగది నైరుతికి జరపండి; కుదరకపోతే తల దక్షిణానికి పెట్టి పడుకోవడం, నైరుతి మూలలో బరువైన వస్తువు.',
    toilet: 'శౌచాలయాన్ని వాయువ్యానికి జరపండి; కుదరకపోతే కుడ్యం (wall) మీద ఉప్పు ప్లేట్, ఎప్పుడూ మూసి ఉంచడం.',
    stair: 'మెట్లను నైరుతి/దక్షిణానికి జరపండి; కుదరకపోతే మెట్ల కింద నిల్వ ఉంచకండి, లోహపు వస్తువు ఉంచండి.',
  };
  return map[key] ?? `${ROOM_META[key].labelTe}ను ${ROOM_META[key].ideal[0]} దిక్కుకు జరపడం శ్రేష్ఠం.`;
}

/* ================================================================== *
 *  Layout
 * ================================================================== */

interface Assigned {
  key: PlanRoomKey;
  areaSqft: number;
  xpref: number; // 0 = పడమర, 1 = తూర్పు
  ypref: number; // 0 = దక్షిణం, 1 = ఉత్తరం
}

/** గది కనిష్ఠ కొలత (అడుగులు) — ఇరుకు పల్చన గదులు రాకుండా */
const MIN_DIM_FT: Record<PlanRoomKey, number> = {
  pooja: 3, kitchen: 4.5, master: 7.5, children: 7, living: 7, dining: 5,
  toilet: 3, bath: 3.5, stair: 4, store: 3, guest: 7, study: 5.5,
  hal: 3, shop: 10, office: 10, cash: 3.5, staff: 5, balcony: 3, utility: 3,
};

const X_OF_DIK: Record<Dik8, number> = { W: 0, NW: 0.05, SW: 0.05, N: 0.5, S: 0.5, E: 1, NE: 0.95, SE: 0.95 };
const Y_OF_DIK: Record<Dik8, number> = { S: 0, SW: 0.05, SE: 0.05, E: 0.5, W: 0.5, N: 1, NE: 0.95, NW: 0.95 };

function prefOf(key: PlanRoomKey): { xpref: number; ypref: number } {
  const ideal = ROOM_META[key].ideal;
  return {
    xpref: ideal.reduce((s, d) => s + X_OF_DIK[d], 0) / Math.max(1, ideal.length),
    ypref: ideal.reduce((s, d) => s + Y_OF_DIK[d], 0) / Math.max(1, ideal.length),
  };
}

type RowIdx = 0 | 1 | 2; // 0 = దక్షిణం, 1 = మధ్య, 2 = ఉత్తరం (దిక్కు బ్యాండ్)

interface Slot {
  key: PlanRoomKey;
  areaSqft: number;
  row: number;
}

const ROW_OF_DIK: Partial<Record<Dik8, RowIdx>> = {
  S: 0, SW: 0, SE: 0,
  W: 1, E: 1,
  N: 2, NE: 2, NW: 2,
};

/**
 * గదికి సాధ్యమైన వరుసలు — దాని ఇష్ట దిక్కుల క్రమంలో.
 * వరుసల సంఖ్య భవన లోతును బట్టి మారుతుంది (లోతైన ప్లాట్లలో ఎక్కువ వరుసలు),
 * కానీ దిక్కు-బ్యాండ్ (దక్షిణం · మధ్య · ఉత్తరం) మాత్రం మూడే — ఆ బ్యాండ్‌లోని
 * ఏ వరుసనైనా గదికి ఇవ్వవచ్చు.
 */
function rowsOf(key: PlanRoomKey, nRows: number): number[] {
  const thirds: number[] = [];
  for (const d of ROOM_META[key].ideal) {
    const t = ROW_OF_DIK[d];
    if (t !== undefined) thirds.push(t);
  }
  const uniq = thirds.length ? [...new Set(thirds)] : [0, 1, 2];
  const out: number[] = [];
  for (const t of uniq) {
    const lo = Math.floor((t * nRows) / 3);
    const hi = Math.max(lo, Math.ceil(((t + 1) * nRows) / 3) - 1);
    for (let r = lo; r <= Math.min(nRows - 1, hi); r++) if (!out.includes(r)) out.push(r);
  }
  return out.length ? out : [0];
}

/** ఒక వరుసలోని గదులను నిలువు కాలమ్‌లుగా అమర్చడం — ఇరుకు గదులు కలిపి ఒక కాలమ్‌లో రెండుగా */
function placeRow(rowRect: Rect, inRow: Slot[]): { key: PlanRoomKey; rect: Rect }[] {
  const d = Math.max(0.1, rowRect.h);
  const W = rowRect.w;
  const ordered = [...inRow].sort(
    (a, b) => prefOf(a.key).xpref - prefOf(b.key).xpref || b.areaSqft - a.areaSqft || a.key.localeCompare(b.key)
  );

  // ---- 1. కాలమ్‌లు: సన్నగా మారే రెండు గదులను ఒక కాలమ్‌లో పైకి-కిందకి పేర్చడం ----
  const groups: Slot[][] = [];
  let i = 0;
  while (i < ordered.length) {
    const a = ordered[i];
    const wa = a.areaSqft / d;
    const minA = MIN_DIM_FT[a.key] ?? 4;
    if (i + 1 < ordered.length) {
      const b = ordered[i + 1];
      const wb = b.areaSqft / d;
      const minB = MIN_DIM_FT[b.key] ?? 4;
      const pairW = (a.areaSqft + b.areaSqft) / d;
      const stackA = a.areaSqft / Math.max(1e-6, pairW);
      const stackB = b.areaSqft / Math.max(1e-6, pairW);
      if (
        wa < minA * 1.15 &&
        wb < minB * 1.15 &&
        a.areaSqft < d * 7 &&
        b.areaSqft < d * 7 &&
        pairW >= Math.max(minA, minB) * 1.1 &&
        stackA >= 4.2 &&
        stackB >= 4.2
      ) {
        groups.push([a, b]);
        i += 2;
        continue;
      }
    }
    groups.push([a]);
    i += 1;
  }

  // ---- 2. కాలమ్ వెడల్పులు: విస్తీర్ణ నిష్పత్తి + కనిష్ఠ కొలత ----
  const areas = groups.map((g) => g.reduce((s, r) => s + r.areaSqft, 0));
  const mins = groups.map((g) => Math.max(...g.map((r) => MIN_DIM_FT[r.key] ?? 4)));
  let widths = areas.map((a) => (W * a) / Math.max(1e-6, areas.reduce((s, v) => s + v, 0)));
  for (let iter = 0; iter < 8; iter++) {
    const deficit = widths.reduce((s, w, k) => s + Math.max(0, mins[k] - w), 0);
    if (deficit < 0.02) break;
    const slack = widths.map((w, k) => Math.max(0, w - mins[k]));
    const totalSlack = slack.reduce((s, v) => s + v, 0);
    if (totalSlack <= 0.02) break;
    widths = widths.map((w, k) => Math.max(mins[k], w - (deficit * slack[k]) / totalSlack));
    const sum = widths.reduce((s, v) => s + v, 0);
    widths = widths.map((w) => (w * W) / sum);
  }

  // ---- 3. అమరిక (చివరి కాలమ్ మిగిలినది పూర్తిగా తీసుకుంటుంది) ----
  const out: { key: PlanRoomKey; rect: Rect }[] = [];
  let x = rowRect.x;
  groups.forEach((g, k) => {
    const w = k === groups.length - 1 ? rowRect.x + W - x : widths[k];
    if (g.length === 1) {
      out.push({ key: g[0].key, rect: { x, y: rowRect.y, w: Math.max(0.1, w), h: d } });
    } else {
      const [p, q] = [...g].sort((a, b) => prefOf(b.key).ypref - prefOf(a.key).ypref); // ఉత్తరాన ఉండాల్సింది పైన
      const hp = (d * p.areaSqft) / Math.max(1e-6, p.areaSqft + q.areaSqft);
      out.push({ key: p.key, rect: { x, y: rowRect.y + d - hp, w: Math.max(0.1, w), h: hp } });
      out.push({ key: q.key, rect: { x, y: rowRect.y, w: Math.max(0.1, w), h: d - hp } });
    }
    x += w;
  });
  return out;
}

/** వరుసల అమరిక → గది దీర్ఘచతురస్రాలు (ఖచ్చితమైన టైలింగ్) */
function placeRows(container: Rect, slots: Slot[], nRows: number): { key: PlanRoomKey; rect: Rect }[] {
  const total = slots.reduce((s, r) => s + r.areaSqft, 0) || 1;
  const out: { key: PlanRoomKey; rect: Rect }[] = [];
  let y = container.y;
  for (let row = 0; row < nRows; row++) {
    const inRow = slots.filter((s) => s.row === row);
    if (!inRow.length) continue;
    const rowArea = inRow.reduce((s, r) => s + r.areaSqft, 0);
    const depth = (container.h * rowArea) / total;
    out.push(...placeRow({ x: container.x, y, w: container.w, h: depth }, inRow));
    y += depth;
  }
  return out;
}

function zoneOfRect(rect: Rect, container: Rect): Zone9 {
  const fx = Math.min(0.999, Math.max(0.001, (rect.x - container.x + rect.w / 2) / Math.max(1e-6, container.w)));
  const fy = Math.min(0.999, Math.max(0.001, (rect.y - container.y + rect.h / 2) / Math.max(1e-6, container.h)));
  return zoneOfPoint(fx, fy);
}

const priorityW = (key: PlanRoomKey) => (ROOM_META[key].priority === 1 ? 3 : ROOM_META[key].priority === 2 ? 2 : 1);

function layoutScore(
  container: Rect,
  placed: { key: PlanRoomKey; rect: Rect }[],
  targets?: Record<string, number>
): number {
  let sc = 0;
  for (const p of placed) {
    const z = zoneOfRect(p.rect, container);
    const { fit } = fitForRoom(p.key, z);
    const fitScore = fit === 'best' ? 1 : fit === 'ok' ? 0.55 : 0.02;
    const shortSide = Math.min(p.rect.w, p.rect.h);
    const minDim = MIN_DIM_FT[p.key] ?? 4;
    // పనికొచ్చే కొలత: కనిష్ఠం కంటే తక్కువ ఉంటే పెద్ద శిక్ష (ఇరుకు గది/పల్చన స్ట్రిప్)
    const shapePenalty = shortSide < minDim * 0.8 ? 1.2 : shortSide < minDim ? 0.45 : 0;
    // లక్ష్య విస్తీర్ణానికి దగ్గరగా ఉండాలి
    const target = targets?.[p.key];
    const areaPenalty = target ? Math.min(0.6, Math.abs(Math.log(Math.max(1, area(p.rect)) / Math.max(1, target))) * 0.5) : 0;
    // పల్చన స్ట్రిప్పులు (నిష్పత్తి > 3) వద్దు
    const ar = Math.max(p.rect.w, p.rect.h) / Math.max(0.1, Math.min(p.rect.w, p.rect.h));
    const aspectPenalty = ar > 3 ? Math.min(0.5, (ar - 3) * 0.15) : 0;
    sc += priorityW(p.key) * (fitScore - shapePenalty - areaPenalty - aspectPenalty);
  }
  return sc;
}

/**
 * **దిక్-వరుస అమరిక** (zone-row layout) — వాస్తు ప్రకారం గదులను మొదట దిక్కుకు కేటాయించి,
 * తర్వాత కొలతలను సరిపెట్టడం:
 *
 *   1. భవనాన్ని 3 అడ్డు వరుసలుగా చూస్తాము — దక్షిణం · మధ్య · ఉత్తరం.
 *   2. ప్రతి గదిని దాని ఇష్ట దిక్కుల వరుసలో, **భారం సమతుల్యం** అయ్యేలా కేటాయిస్తాము
 *      (ఉదా: వంటగది ఆగ్నేయం కుదరకపోతే తూర్పు వరుసకు).
 *   3. వరుస లోపల గదులను పడమర→తూర్పు క్రమంలో అమర్చి, వెడల్పులను విస్తీర్ణ నిష్పత్తిలో,
 *      కనిష్ఠ కొలతలు నెరవేరేలా ఇస్తాము.
 *   4. చివర్లో స్థాన మార్పులతో (hill climbing) మొత్తం వాస్తు స్కోరు మెరుగుపరుస్తాము.
 *
 * ఫలితం: ఖచ్చితమైన టైలింగ్ (ఖాళీ/అతిక్రమణ లేదు) + దిక్కుల క్రమం + పనికొచ్చే గది ఆకారాలు.
 */
function assignAndPlace(
  container: Rect,
  items: { key: PlanRoomKey; areaSqft: number }[],
  nRows: number
): { key: PlanRoomKey; rect: Rect }[] {
  const total = items.reduce((s, i) => s + i.areaSqft, 0) || 1;
  const slots: Slot[] = items.map((i) => ({ key: i.key, areaSqft: i.areaSqft, row: Math.floor(nRows / 2) }));

  // ---- 1. ప్రాధాన్యత క్రమంలో వరుస కేటాయింపు (load-balanced) ----
  const order = [...slots].sort(
    (a, b) => priorityW(b.key) - priorityW(a.key) || b.areaSqft - a.areaSqft || a.key.localeCompare(b.key)
  );
  const load: number[] = new Array(nRows).fill(0);
  for (const s of order) {
    const candidates = rowsOf(s.key, nRows);
    let bestRow = candidates[0];
    let bestCost = Number.POSITIVE_INFINITY;
    for (const r of candidates) {
      const idealIdx = candidates.indexOf(r);
      const after = (load[r] + s.areaSqft) / total;
      const cost = after * 1.6 + idealIdx * 0.55;
      if (cost < bestCost - 1e-9) {
        bestCost = cost;
        bestRow = r;
      }
    }
    s.row = bestRow;
    load[bestRow] += s.areaSqft;
  }

  // ---- 1b. చాలా సన్నగా మిగిలిన వరుసలను కలపడం (2′–3′ స్ట్రిప్‌లు రాకుండా) ----
  for (let pass = 0; pass < 3; pass++) {
    const sums: number[] = new Array(nRows).fill(0);
    for (const s of slots) sums[s.row] += s.areaSqft;
    const thin = sums.findIndex((v, r) => v > 0 && v < total * 0.14 && sums.filter((x) => x > 0).length > 1);
    if (thin < 0) break;
    for (const s of slots.filter((x) => x.row === thin)) {
      const cands = rowsOf(s.key, nRows).filter((r) => r !== thin);
      const pool = cands.length ? cands : Array.from({ length: nRows }, (_, r) => r).filter((r) => r !== thin);
      s.row = pool.reduce((best, r) => (sums[r] < sums[best] ? r : best), pool[0]);
      sums[s.row] += s.areaSqft;
      sums[thin] -= s.areaSqft;
    }
  }

  let placed = placeRows(container, slots, nRows);
  let bestScore = layoutScore(container, placed);

  // ---- 2. స్థాన మార్పులతో మెరుగుదల ----
  for (let pass = 0; pass < 4; pass++) {
    let improved = false;
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (slots[i].row === slots[j].row) continue;
        const ri = rowsOf(slots[i].key, nRows);
        const rj = rowsOf(slots[j].key, nRows);
        if (!ri.includes(slots[j].row) || !rj.includes(slots[i].row)) continue;
        const ratio = Math.max(slots[i].areaSqft, slots[j].areaSqft) / Math.max(1e-6, Math.min(slots[i].areaSqft, slots[j].areaSqft));
        if (ratio > 2.6) continue;
        const a = slots[i].row;
        const b = slots[j].row;
        slots[i].row = b;
        slots[j].row = a;
        const trial = placeRows(container, slots, nRows);
        const sc = layoutScore(container, trial);
        if (sc > bestScore + 1e-6) {
          bestScore = sc;
          placed = trial;
          improved = true;
        } else {
          slots[i].row = a;
          slots[j].row = b;
        }
      }
    }
    if (!improved) break;
  }

  // ---- 3. సర్దుబాటు: 3′ కంటే ఇరుకుగా మిగిలిన గదిని మరో వరుసకు మార్చడం ----
  const narrowOf = (list: { key: PlanRoomKey; rect: Rect }[]) =>
    list.filter((r) => Math.min(r.rect.w, r.rect.h) < 3);
  for (let pass = 0; pass < 3; pass++) {
    const narrow = narrowOf(placed);
    if (!narrow.length) break;
    let fixed = false;
    for (const n of narrow) {
      const slot = slots.find((x) => x.key === n.key);
      if (!slot) continue;
      const options = rowsOf(n.key, nRows).filter((r) => r !== slot.row);
      for (const row of options) {
        const keep = slot.row;
        slot.row = row;
        const trial = placeRows(container, slots, nRows);
        if (narrowOf(trial).length < narrow.length && layoutScore(container, trial) >= bestScore - 0.02) {
          placed = trial;
          bestScore = layoutScore(container, trial);
          fixed = true;
          break;
        }
        slot.row = keep;
      }
      if (fixed) break;
    }
    if (!fixed) break;
  }

  return placed;
}

/**
 * గది కార్యక్రమాన్ని భవనంలో అమర్చడం:
 *   1. విస్తీర్ణాలను భవన విస్తీర్ణానికి స్కేల్ చేయడం.
 *   2. చాలా ఇరుకుగా మిగిలిన **తక్కువ ప్రాధాన్యత** గదులను (నిల్వ/అతిథి/చదువు) తొలగించడం;
 *      పూజ/వంట/పడక/హాల్/మెట్లు ఎప్పుడూ తొలగించబడవు.
 *   3. దిక్-వరుస అమరిక + స్కోరు మెరుగుదల.
 */
function layoutProgram(container: Rect, items: ProgramItem[], zoneContainer: Rect, unitIndex?: number): PlanRoom[] {
  const usable = items.filter((i) => i.areaSqft > 0).map((i) => ({ key: i.key, areaSqft: i.areaSqft }));
  const scale = area(container) / Math.max(1, usable.reduce((s, i) => s + i.areaSqft, 0));
  for (const u of usable) u.areaSqft = u.areaSqft * scale;

  const narrowCount = (list: { key: PlanRoomKey; rect: Rect }[]) =>
    list.filter((r) => Math.min(r.rect.w, r.rect.h) < (MIN_DIM_FT[r.key] ?? 4) * 0.8).length;
  const targets: Record<string, number> = {};
  for (const u of usable) targets[u.key] = u.areaSqft;
  const bestRowCount = (items: { key: PlanRoomKey; areaSqft: number }[]) => {
    const maxRows = Math.max(1, Math.min(5, Math.floor(container.h / 6.5)));
    let best: { placed: { key: PlanRoomKey; rect: Rect }[]; score: number; n: number } | null = null;
    for (let n = 1; n <= maxRows; n++) {
      const trial = assignAndPlace(container, items, n);
      const narrow = narrowCount(trial);
      const sc = layoutScore(container, trial, targets) - narrow * 5;
      if (!best || narrow < narrowCount(best.placed) || (narrow === narrowCount(best.placed) && sc > best.score)) {
        best = { placed: trial, score: sc, n };
      }
    }
    return best!.placed;
  };

  let placed: { key: PlanRoomKey; rect: Rect }[] = [];
  for (let guard = 0; guard < 5; guard++) {
    placed = bestRowCount(usable);
    const narrow = placed.find((r) => {
      if (ROOM_META[r.key].priority < 2) return false;
      const w = r.rect.w;
      const a = area(r.rect);
      const minArea = (ROOM_META[r.key].minSqft ?? 20) * 0.9;
      return w < (MIN_DIM_FT[r.key] ?? 4) * 0.7 || a < minArea;
    });
    if (!narrow) break;
    const idx = usable.findIndex((u) => u.key === narrow.key);
    if (idx < 0) break;
    usable.splice(idx, 1);
    if (usable.length <= 3) break;
  }

  return placed.map((r) => finalizeRoom(r.key, r.rect, zoneContainer, unitIndex));
}

/* ================================================================== *
 *  Main
 * ================================================================== */

export function buildPlotPlan(input: PlotPlanInput): PlotPlan {
  const use: PlotUse = input.use ?? 'residential';
  const rules =
    input.rules ??
    (use === 'commercial' || use === 'mixed' ? RULE_PRESETS.ts_commercial : RULE_PRESETS.ts_residential);

  const areaSqft = Math.max(200, toSqft(input.areaValue, input.unit));
  const facing: Dik8 = input.facing;
  const roadSide: Dik8 = ['N', 'S', 'E', 'W'].includes(facing) ? facing : facing;

  // ---- ప్లాట్ కొలతలు ----
  let widthFt: number;
  let depthFt: number;
  if (input.widthFt && input.depthFt) {
    widthFt = input.widthFt;
    depthFt = input.depthFt;
  } else {
    const ratio = use === 'commercial' ? 1.25 : 1.55; // depth / width
    widthFt = Math.sqrt(areaSqft / ratio);
    depthFt = areaSqft / widthFt;
  }
  widthFt = round2(widthFt);
  depthFt = round2(depthFt);

  // ---- సెట్‌బ్యాక్‌లు (రోడ్డు వైపు = ఫ్రంట్) ----
  const band = bandFor(rules, areaSqft);
  const roadWidthFt = input.roadWidthFt ?? 30;
  const roadOk = roadWidthFt >= rules.minRoadFt;

  // నిర్మాణం ప్లాట్‌లో ఎక్కడ ఉంచాలి? రోడ్డు ఏ వైపైతే ఆ వైపు ఫ్రంట్ సెట్‌బ్యాక్.
  const inset = {
    S: roadSide === 'S' ? band.frontFt : band.rearFt,
    N: roadSide === 'N' ? band.frontFt : band.rearFt,
    E: roadSide === 'E' ? band.frontFt : band.rearFt,
    W: roadSide === 'W' ? band.frontFt : band.rearFt,
  } as Record<'N' | 'S' | 'E' | 'W', number>;

  const envelope: Rect = {
    x: inset.W + (roadSide === 'E' || roadSide === 'W' ? 0 : band.sideFt) * 0,
    y: 0,
    w: 0,
    h: 0,
  };
  // సైడ్ సెట్‌బ్యాక్ ఎల్లప్పుడూ పడమర/తూర్పు వైపులకు; ఫ్రంట్/రియర్ ఉత్తర/దక్షిణం
  const westInset = roadSide === 'W' ? band.frontFt : roadSide === 'E' ? band.rearFt : band.sideFt;
  const eastInset = roadSide === 'E' ? band.frontFt : roadSide === 'W' ? band.rearFt : band.sideFt;
  const southInset = roadSide === 'S' ? band.frontFt : roadSide === 'N' ? band.rearFt : band.sideFt === 0 ? band.rearFt : band.rearFt;
  const northInset = roadSide === 'N' ? band.frontFt : roadSide === 'S' ? band.rearFt : band.rearFt;

  envelope.x = round2(westInset);
  envelope.y = round2(southInset);
  envelope.w = round2(Math.max(0, widthFt - westInset - eastInset));
  envelope.h = round2(Math.max(0, depthFt - southInset - northInset));
  void inset;

  const envelopeSqft = area(envelope);
  const allowedCoverageSqft = (areaSqft * band.coveragePct) / 100;
  const groundBuiltSqft = Math.min(envelopeSqft, allowedCoverageSqft);

  // నిర్మాణం ఫ్రంట్ లైనుకు ఆనుకుని ఉంటుంది; మిగిలినది వెనుక/పక్కలా ఖాళీ
  const buildingW = envelope.w;
  const buildingH = buildingW > 0 ? Math.min(envelope.h, groundBuiltSqft / buildingW) : 0;
  const building: Rect = {
    x: envelope.x,
    y: roadSide === 'S' ? envelope.y : roadSide === 'N' ? envelope.y + (envelope.h - buildingH) : envelope.y,
    w: round2(buildingW),
    h: round2(buildingH),
  };
  // E/W రోడ్డు అయితే వెడల్పు తగ్గించి, లోతు ఎక్కువగా ఉంచడం
  if (roadSide === 'E' || roadSide === 'W') {
    const h = envelope.h;
    const w = h > 0 ? Math.min(envelope.w, groundBuiltSqft / h) : 0;
    building.h = round2(h);
    building.w = round2(w);
    building.x = roadSide === 'W' ? envelope.x : envelope.x + (envelope.w - w);
    building.y = envelope.y;
  }

  // ---- లక్ష్య నిర్మాణం (ఉదా: 1 గుంట ప్లాట్‌లో ½ గుంట = 544 చ.అ. ఇల్లు) ----
  const targetGround = Math.max(0, input.targetBuiltSqft ?? 0);
  if (targetGround > 0 && targetGround < area(building) - 1) {
    if (roadSide === 'E' || roadSide === 'W') {
      const w = Math.min(envelope.w, targetGround / Math.max(1, building.h));
      building.x = roadSide === 'W' ? envelope.x : envelope.x + (envelope.w - w);
      building.w = round2(w);
    } else {
      const h = Math.min(envelope.h, targetGround / Math.max(1, building.w));
      building.y = roadSide === 'S' ? envelope.y : envelope.y + (envelope.h - h);
      building.h = round2(h);
    }
  }

  // ---- FAR / అంతస్తులు ----
  const farLimit = band.far;
  const maxBua = areaSqft * farLimit;
  const floorsAllowed = Math.max(1, Math.min(6, Math.floor(maxBua / Math.max(1, area(building))) ));
  const floorsRequested = Math.max(
    1,
    Math.min(
      8,
      input.floors ?? (targetGround > 0 ? Math.max(1, Math.ceil(targetGround / Math.max(1, area(building)))) : Math.min(3, floorsAllowed))
    )
  );
  const floors = Math.min(floorsRequested, Math.max(1, floorsAllowed));
  const totalBuaSqft = area(building) * floors;
  const farUsed = totalBuaSqft / areaSqft;
  const farOk = farUsed <= farLimit + 1e-6;

  // ---- పార్కింగ్ (ప్లాట్ లోపల ఖాళీ స్థలంలో మాత్రమే) ----
  const parkingCarsWanted = Math.max(0, input.parkingCars ?? (use === 'commercial' ? 2 : areaSqft > 1200 ? 2 : 1));
  const parking: Rect[] = [];
  const bands: { rect: Rect; front: boolean }[] = [
    { rect: { x: 0, y: 0, w: widthFt, h: Math.max(0, building.y) }, front: roadSide === 'S' },
    { rect: { x: 0, y: building.y + building.h, w: widthFt, h: Math.max(0, depthFt - building.y - building.h) }, front: roadSide === 'N' },
    { rect: { x: building.x + building.w, y: 0, w: Math.max(0, widthFt - building.x - building.w), h: depthFt }, front: roadSide === 'E' },
    { rect: { x: 0, y: 0, w: Math.max(0, building.x), h: depthFt }, front: roadSide === 'W' },
  ].sort((a, b) => Number(b.front) - Number(a.front));

  let carsPlaced = 0;
  for (const { rect } of bands) {
    if (carsPlaced >= parkingCarsWanted) break;
    const horizontal = rect.w >= rect.h;
    if (horizontal && rect.h >= 15 && rect.w >= 9) {
      const n = Math.min(parkingCarsWanted - carsPlaced, Math.floor(rect.w / 10));
      for (let i = 0; i < n; i++) {
        parking.push({ x: round2(rect.x + i * 10), y: round2(rect.y), w: 9, h: 15 });
      }
      carsPlaced += n;
    } else if (!horizontal && rect.w >= 9 && rect.h >= 15) {
      const n = Math.min(parkingCarsWanted - carsPlaced, Math.floor(rect.h / 16));
      for (let i = 0; i < n; i++) {
        parking.push({ x: round2(rect.x + (rect.w - 9) / 2), y: round2(rect.y + i * 16), w: 9, h: 15 });
      }
      carsPlaced += n;
    }
  }
  const parkingCars = carsPlaced;
  const parkingSqft = parkingCars * 135;

  // ---- గది కార్యక్రమం ----
  const builtAreaForProgram = area(building);
  const units: UnitPlan[] = [];
  let program: ProgramItem[] = [];
  let programNotes: string[] = [];
  let programNotesEn: string[] = [];

  if (use === 'rental') {
    const unitSqft = input.rentalUnitSqft ?? (builtAreaForProgram / Math.max(1, Math.floor(builtAreaForProgram / 520)) > 700 ? 700 : 520);
    const nUnits = Math.max(1, Math.floor(builtAreaForProgram / unitSqft));
    const unitRects = sliceByArea(building, new Array(nUnits).fill(1), building.w >= building.h);
    unitRects.forEach((rect, i) => {
      const roomList: ProgramItem[] = [
        { key: 'master', areaSqft: 115 },
        { key: 'kitchen', areaSqft: 70 },
        { key: 'toilet', areaSqft: 30 },
        { key: 'living', areaSqft: Math.max(90, area(rect) * 0.32) },
      ];
      const rooms = layoutProgram(rect, roomList, rect, i);
      units.push({
        index: i + 1,
        labelTe: `అద్దె యూనిట్ ${i + 1}`,
        labelEn: `Rental unit ${i + 1}`,
        rect,
        areaSqft: Math.round(area(rect)),
        rooms,
        rentBandTe: `₹${Math.round((area(rect) * 18) / 500) * 500}–₹${Math.round((area(rect) * 26) / 500) * 500} / నెల (సూచన)`,
        rentBandEn: `₹${Math.round((area(rect) * 18) / 500) * 500}–₹${Math.round((area(rect) * 26) / 500) * 500} per month (indicative)`,
      });
    });
  } else if (use === 'commercial' || use === 'mixed') {
    program = commercialProgram(builtAreaForProgram);
  } else {
    const prog = residentialProgram(builtAreaForProgram, input.familySize ?? 4, input.bedrooms, floors);
    program = prog.items;
    programNotes = prog.notesTe;
    programNotesEn = prog.notesEn;
  }

  let rooms: PlanRoom[] = [];
  if (use !== 'rental') {
    rooms = layoutProgram(building, program, building);
    if (use === 'mixed' && floors >= 2) {
      rooms.push({
        ...finalizeRoom('office', { x: building.x, y: building.y, w: building.w, h: building.h }, building),
        id: 'office-upper',
        labelTe: 'మొదటి అంతస్తు — కార్యాలయం/అద్దె (గ్రౌండ్ ఫ్లోర్ దుకాణం పైన)',
        labelEn: 'First floor — office / let-out (above the ground-floor shop)',
        fit: 'ok',
        reasonTe: 'మొదటి అంతస్తు పూర్తి ప్లేట్ — వాణిజ్య/అద్దె వినియోగానికి అనుకూలం',
      });
    }
  }
  const allRooms = use === 'rental' ? units.flatMap((u) => u.rooms) : rooms;

  // ---- ప్రవేశ ద్వారం ----
  const entranceZone = zoneOfPoint(
    roadSide === 'W' ? 0.02 : roadSide === 'E' ? 0.98 : 0.5,
    roadSide === 'S' ? 0.02 : roadSide === 'N' ? 0.98 : 0.5
  );
  const entranceDik: Dik8 = roadSide;
  const entranceFit: Fit = ['N', 'E', 'NE'].includes(entranceDik) ? 'best' : entranceDik === 'W' || entranceDik === 'S' ? 'ok' : 'bad';
  const entrance = {
    x: roadSide === 'W' ? 0 : roadSide === 'E' ? widthFt : Math.min(widthFt - 4, widthFt / 2),
    y: roadSide === 'S' ? 0 : roadSide === 'N' ? depthFt : depthFt / 2,
    side: roadSide,
    labelTe: `ప్రధాన ద్వారం — ${ZONE_LABEL_TE[entranceZone]} (${roadSide})`,
    labelEn: `Main entrance — ${ZONE_LABEL_EN[entranceZone]} (${roadSide})`,
    zone: entranceZone,
    fit: entranceFit,
    noteTe:
      entranceFit === 'best'
        ? 'ఉత్తర/తూర్పు ముఖ ద్వారం — శాస్త్రీయంగా శ్రేష్ఠం.'
        : entranceFit === 'ok'
          ? 'పడమర/దక్షిణ ముఖ ద్వారం — పనికొస్తుంది; ద్వారం ఎత్తు, గడప నియమాలు పాటించండి.'
          : 'నైరుతి/ఆగ్నేయ ముఖ ద్వారం — వీలైతే మార్చండి; కుదరకపోతే ద్వార పరిహారం (గడప కుడి వైపు గణేశుడు).',
    noteEn:
      entranceFit === 'best'
        ? 'North/East facing entrance — best per shastra.'
        : entranceFit === 'ok'
          ? 'West/South facing entrance — acceptable; follow door-height and threshold rules.'
          : 'South-West/South-East entrance — change if possible; otherwise apply the door remedy (Ganesha on the right of the threshold).',
  };

  // ---- సౌకర్య స్థానాలు ----
  // ట్యాంక్ పైకప్పు మీద, సంప్ భవనం కింద ఉంటాయి — కాబట్టి అవి భవన సరిహద్దులోనే గుర్తిస్తాము.
  // సెప్టిక్ ట్యాంక్ మాత్రం ఖాళీ స్థలంలోనే ఉండాలి; స్థలం లేకపోతే ప్లాన్‌లో గుర్తించము (హెచ్చరిక ఇస్తాము).
  const inBuilding = (z: 'NE' | 'SW'): Rect => {
    const s = Math.min(5, Math.max(3, Math.min(building.w, building.h) * 0.14));
    const x = z === 'NE' ? building.x + building.w - s : building.x;
    const y = z === 'NE' ? building.y + building.h - s : building.y;
    return { x: round2(x), y: round2(y), w: round2(s), h: round2(s) };
  };
  const openAt = (z: 'NW' | 'SE' | 'NE' | 'SW'): Rect | null => {
    const s = Math.min(6, Math.max(3.5, Math.min(widthFt, depthFt) * 0.1));
    const x = z === 'NE' || z === 'SE' ? widthFt - s - 0.5 : 0.5;
    const y = z === 'NE' || z === 'NW' ? depthFt - s - 0.5 : 0.5;
    const candidate: Rect = { x: round2(x), y: round2(y), w: round2(s), h: round2(s) };
    return overlaps(candidate, building) ? null : candidate;
  };
  const septicRect = openAt('NW') ?? openAt('W' as never) ?? null;
  const features = [
    {
      key: 'overhead',
      labelTe: 'పైకప్పు నీటి ట్యాంక్ (నైరుతి)',
      labelEn: 'Overhead tank (SW)',
      rect: inBuilding('SW'),
      noteTe: 'ట్యాంక్ పైకప్పు మీద నైరుతి మూలలో — బరువు నైరుతికి మేలు.',
      noteEn: 'Tank on the roof, South-West corner — weight to the SW is beneficial.',
    },
    {
      key: 'sump',
      labelTe: 'భూగర్భ సంప్ (ఈశాన్యం)',
      labelEn: 'Underground sump (NE)',
      rect: inBuilding('NE'),
      noteTe: 'సంప్ భవనం కింద ఈశాన్యంలో — నీరు ఈశాన్యానికి శుభం.',
      noteEn: 'Sump under the building in the North-East — water in the NE is auspicious.',
    },
    ...(septicRect
      ? [
          {
            key: 'septic',
            labelTe: 'సెప్టిక్ ట్యాంక్ (వాయువ్యం)',
            labelEn: 'Septic (NW)',
            rect: septicRect,
            noteTe: 'వాయువ్యం/పడమర అనుకూలం; ఈశాన్యంలో అస్సలు వద్దు.',
            noteEn: 'North-West/West is suitable; never in the North-East.',
          },
        ]
      : []),
  ];

  // ---- తనిఖీలు (తెలుగు + ఆంగ్లం) ----
  const checks: PlanCheck[] = [];
  const pctEnv = Math.round((envelopeSqft / areaSqft) * 100);
  checks.push({
    id: 'envelope',
    labelTe: 'సెట్‌బ్యాక్ తర్వాత నిర్మాణ స్థలం ఉంది',
    labelEn: 'Buildable area exists after setbacks',
    ok: envelopeSqft > areaSqft * 0.25,
    detailTe: `నిర్మాణ యోగ్యమైన స్థలం ${Math.round(envelopeSqft)} చ.అ. (ప్లాట్‌లో ${pctEnv}%).`,
    detailEn: `Buildable area ${Math.round(envelopeSqft)} sq.ft. (${pctEnv}% of the plot).`,
  });
  checks.push({
    id: 'coverage',
    labelTe: 'గ్రౌండ్ కవరేజ్ అనుమతి పరిధిలో',
    labelEn: 'Ground coverage within the permitted limit',
    ok: groundBuiltSqft <= allowedCoverageSqft + 1e-6,
    detailTe: `కవరేజ్ ${((area(building) / areaSqft) * 100).toFixed(1)}% · అనుమతి ${band.coveragePct}%.`,
    detailEn: `Coverage ${((area(building) / areaSqft) * 100).toFixed(1)}% · permitted ${band.coveragePct}%.`,
  });
  checks.push({
    id: 'far',
    labelTe: 'FSI/FAR అనుమతి పరిధిలో',
    labelEn: 'FSI/FAR within the permitted limit',
    ok: farOk,
    detailTe: `వాడిన FSI ${farUsed.toFixed(2)} · అనుమతి ${farLimit}. మొత్తం BUA ${Math.round(totalBuaSqft)} చ.అ.`,
    detailEn: `FSI used ${farUsed.toFixed(2)} · permitted ${farLimit}. Total BUA ${Math.round(totalBuaSqft)} sq.ft.`,
  });
  checks.push({
    id: 'road',
    labelTe: 'రోడ్డు వెడల్పు నిబంధనకు సరిపోతుంది',
    labelEn: 'Road width meets the requirement',
    ok: roadOk,
    detailTe: `రోడ్డు ${roadWidthFt}′ · కనిష్ఠం ${rules.minRoadFt}′.`,
    detailEn: `Road ${roadWidthFt} ft · minimum ${rules.minRoadFt} ft.`,
  });
  const poojaRoom = allRooms.find((r) => r.key === 'pooja');
  if (poojaRoom)
    checks.push({
      id: 'pooja',
      labelTe: 'పూజా గది ఈశాన్య/ఉత్తర/తూర్పు',
      labelEn: 'Pooja room in North-East / North / East',
      ok: allRooms.some((r) => r.key === 'pooja' && r.fit !== 'bad'),
      detailTe: `పూజా గది ${ZONE_LABEL_TE[poojaRoom.zone]}లో.`,
      detailEn: `Pooja room in the ${ZONE_LABEL_EN[poojaRoom.zone]}.`,
    });
  const kitchenRoom = allRooms.find((r) => r.key === 'kitchen');
  if (kitchenRoom)
    checks.push({
      id: 'kitchen',
      labelTe: 'వంటగది ఆగ్నేయం',
      labelEn: 'Kitchen in South-East',
      ok: allRooms.some((r) => r.key === 'kitchen' && r.fit !== 'bad'),
      detailTe: `వంటగది ${ZONE_LABEL_TE[kitchenRoom.zone]}లో (${
        kitchenRoom.fit === 'bad' ? 'సరిదిద్దాలి' : kitchenRoom.zone === 'SE' ? 'అత్యుత్తమం' : 'సరిపోయింది — ఆగ్నేయం శ్రేష్ఠం'
      }).`,
      detailEn: `Kitchen in the ${ZONE_LABEL_EN[kitchenRoom.zone]} (${
        kitchenRoom.fit === 'bad' ? 'to be corrected' : kitchenRoom.zone === 'SE' ? 'ideal' : 'acceptable — South-East is best'
      }).`,
    });
  const masterRoom = allRooms.find((r) => r.key === 'master');
  if (masterRoom)
    checks.push({
      id: 'master',
      labelTe: 'ప్రధాన పడకగది నైరుతి/దక్షిణం/పడమర',
      labelEn: 'Master bedroom in South-West / South / West',
      ok: masterRoom.zone === 'SW' || masterRoom.zone === 'S' || masterRoom.zone === 'W',
      detailTe: `ప్రధాన గది ${ZONE_LABEL_TE[masterRoom.zone]}లో.`,
      detailEn: `Master bedroom in the ${ZONE_LABEL_EN[masterRoom.zone]}.`,
    });
  checks.push({
    id: 'tiling',
    labelTe: 'గదులు ఒకదానిపై ఒకటి పడకుండా, ఖాళీ లేకుండా అమరాయి',
    labelEn: 'Rooms tile the building with no overlap and no gap',
    ok: (() => {
      const enclosed = allRooms.filter((r) => r.key !== 'hal');
      const overlapsAny = enclosed.some((a, i) => enclosed.some((b, j) => j > i && overlaps(a, b)));
      const sumRoom = allRooms.reduce((s, r) => s + area(r), 0);
      const target = use === 'rental' ? units.reduce((s, u) => s + area(u.rect), 0) : area(building);
      return !overlapsAny && Math.abs(sumRoom - target) < Math.max(2, target * 0.02);
    })(),
    detailTe: `గదుల విస్తీర్ణాల మొత్తం ${Math.round(allRooms.reduce((s, r) => s + area(r), 0))} చ.అ. · భవనం ${Math.round(area(building))} చ.అ.`,
    detailEn: `Rooms total ${Math.round(allRooms.reduce((s, r) => s + area(r), 0))} sq.ft. · building ${Math.round(area(building))} sq.ft.`,
  });

  // ---- స్కోరు ----
  const weightOf = (r: PlanRoom) => (r.key === 'hal' ? 0 : ROOM_META[r.key].priority === 1 ? 3 : ROOM_META[r.key].priority === 2 ? 2 : 1);
  const wSum = allRooms.reduce((s, r) => s + weightOf(r), 0) || 1;
  const got = allRooms.reduce((s, r) => s + weightOf(r) * (r.fit === 'best' ? 1 : r.fit === 'ok' ? 0.6 : 0.2), 0);
  const score = Math.round((got / wSum) * 100);

  const warningsTe: string[] = [];
  if (!roadOk) warningsTe.push(`రోడ్డు వెడల్పు ${roadWidthFt}′ — ఈ వినియోగానికి కనిష్ఠం ${rules.minRoadFt}′ కావాలి.`);
  if (!farOk) warningsTe.push('అడిగిన అంతస్తులు FSI పరిమితి దాటుతున్నాయి — అంతస్తులు తగ్గించాం.');
  if (floorsAllowed < (input.floors ?? floors)) warningsTe.push(`ఈ ప్లాట్‌కు FSI ప్రకారం గరిష్ఠం ${floorsAllowed} అంతస్తులు.`);
  if (areaSqft < 600) warningsTe.push('చాలా చిన్న ప్లాట్ — గదులు కనిష్ఠ కొలతలకు దగ్గరగా ఉంటాయి; వెంటిలేషన్ ప్రత్యేకంగా చూడాలి.');
  if (building.h < 12) warningsTe.push('భవన లోతు 12′ కంటే తక్కువ — ఒక వరుస గదులే సాధ్యం.');
  if (!septicRect) {
    warningsTe.push('సెప్టిక్ ట్యాంక్‌కు ఖాళీ స్థలం లేదు — తీర్మానం/సెప్టిక్ ట్యాంక్ స్థానాన్ని స్థానిక పంచాయతీ నిబంధనల ప్రకారం (సాధారణంగా వాయువ్యం/పడమర, ప్లాట్ హద్దు దాటి) ఖరారు చేయాలి.');
  }
  if (parkingCarsWanted > parkingCars) {
    warningsTe.push(
      `ఖాళీ స్థలంలో ${parkingCarsWanted} కార్ల పార్కింగ్ సరిపోలేదు (సరిపోయింది ${parkingCars}). స్టిల్ట్ (భవనం ముందు భాగం ఖాళీగా) లేదా రోడ్డు పక్కన పార్కింగ్ ఏర్పాటు చేయాలి.`
    );
  }

  // ---- ఆర్థిక లెక్క (భూమి విలువ → నిర్మాణ వ్యయం → అద్దె/రాబడి) ----
  const rateUnit = input.rateUnit ?? input.unit;
  const perRateUnitSqft = toSqft(1, rateUnit);
  const landSqftAtRate = areaSqft / Math.max(1e-6, perRateUnitSqft);
  const landValueTotal = input.landRate ? Math.round(input.landRate * landSqftAtRate) : 0;
  const buildRatePerSqft = input.buildRatePerSqft ?? (use === 'commercial' ? 2400 : use === 'rental' ? 2100 : 1900);
  const buildCost = Math.round(totalBuaSqft * buildRatePerSqft);
  const totalProjectCost = landValueTotal + buildCost;

  const [rentPsfLow, rentPsfHigh] =
    use === 'commercial' ? [38, 58] : use === 'rental' ? [16, 22] : [12, 18];
  const round500 = (v: number) => Math.round(v / 500) * 500;
  const rentLow = use === 'commercial' ? round500(builtAreaForProgram * rentPsfLow) : round500(builtAreaForProgram * rentPsfLow);
  const rentHigh = use === 'commercial' ? round500(builtAreaForProgram * rentPsfHigh) : round500(builtAreaForProgram * rentPsfHigh);
  const annualRentLow = rentLow * 12;
  const annualRentHigh = rentHigh * 12;
  const grossYieldPct = totalProjectCost > 0 ? round2((((rentLow + rentHigh) / 2) * 12 * 100) / totalProjectCost) : 0;
  const paybackYears = rentLow > 0 && totalProjectCost > 0 ? round2(totalProjectCost / (((rentLow + rentHigh) / 2) * 12)) : 0;

  const inr = (v: number) =>
    v >= 10000000 ? `₹${(v / 10000000).toFixed(2)} కోట్లు` : v >= 100000 ? `₹${(v / 100000).toFixed(2)} లక్షలు` : `₹${Math.round(v).toLocaleString('en-IN')}`;

  const economics: PlanEconomics = {
    landValueTotal,
    landRate: input.landRate ?? 0,
    rateUnit,
    buildRatePerSqft,
    buildCost,
    totalProjectCost,
    rentLow,
    rentHigh,
    annualRentLow,
    annualRentHigh,
    grossYieldPct,
    paybackYears,
    costPerSqft: Math.round(buildRatePerSqft),
    linesEn: [
      landValueTotal > 0
        ? `Land value: ${Math.round(landSqftAtRate * 100) / 100} ${rateUnit} × ₹${input.landRate?.toLocaleString('en-IN')} = ${inr(landValueTotal)}.`
        : 'Land price was not given — only the construction cost is computed.',
      `Construction cost: ${Math.round(totalBuaSqft)} sq.ft. × ₹${buildRatePerSqft.toLocaleString('en-IN')}/sq.ft. = ${inr(buildCost)} (indicative; ±15% with foundation, finishing and approvals).`,
      `Total project cost (land + construction): ${inr(totalProjectCost)}.`,
      `Rent estimate: ${inr(rentLow)} – ${inr(rentHigh)} per month (area dependent; vacancy not counted).`,
      totalProjectCost > 0
        ? `Gross yield ${grossYieldPct}% per year · payback about ${paybackYears} years.`
        : 'Give the land price as well to compute the yield.',
    ],
    linesTe: [
      landValueTotal > 0
        ? `భూమి విలువ: ${Math.round(landSqftAtRate * 100) / 100} ${UNIT_LABEL_TE[rateUnit]} × ₹${input.landRate?.toLocaleString('en-IN')} = ${inr(landValueTotal)}.`
        : 'భూమి ధర ఇవ్వలేదు — కేవలం నిర్మాణ వ్యయం మాత్రమే లెక్కించబడింది.',
      `నిర్మాణ వ్యయం: ${Math.round(totalBuaSqft)} చ.అ. × ₹${buildRatePerSqft.toLocaleString('en-IN')}/చ.అ. = ${inr(buildCost)} (సూచన; ఫౌండేషన్, ఫినిషింగ్, లైసెన్స్‌లతో ±15% మారుతుంది).`,
      `మొత్తం ప్రాజెక్టు వ్యయం (భూమి + నిర్మాణం): ${inr(totalProjectCost)}.`,
      `అద్దె అంచనా: నెలకు ${inr(rentLow)} – ${inr(rentHigh)} (ప్రాంతాన్ని బట్టి; ఖాళీ కాలాన్ని కలపలేదు).`,
      totalProjectCost > 0
        ? `స్థూల రాబడి ${grossYieldPct}% సంవత్సరానికి · పెట్టుబడి తిరిగి వచ్చే కాలం సుమారు ${paybackYears} సంవత్సరాలు.`
        : 'రాబడి శాతం లెక్కించాలంటే భూమి ధర కూడా ఇవ్వాలి.',
    ],
  };

  // ---- "ఎంత నిర్మాణం కుదురుతుంది" ----
  const targetSqft = Math.max(0, input.targetBuiltSqft ?? 0);
  const feasibility = {
    targetSqft,
    targetGunta: round2(targetSqft / 1089),
    fitsOnGround: targetSqft > 0 ? targetSqft <= envelopeSqft : true,
    fitsInTotal: targetSqft > 0 ? targetSqft <= totalBuaSqft : true,
    maxGroundSqft: Math.round(envelopeSqft),
    maxTotalSqft: Math.round(totalBuaSqft),
    noteTe:
      targetSqft <= 0
        ? `ఈ ప్లాట్‌లో ఒకే అంతస్తులో ${Math.round(envelopeSqft)} చ.అ. వరకు, ${floors} అంతస్తులతో మొత్తం ${Math.round(totalBuaSqft)} చ.అ. వరకు నిర్మించుకోవచ్చు.`
        : targetSqft <= envelopeSqft
          ? `${Math.round(targetSqft)} చ.అ. (${round2(targetSqft / 1089)} గుంట) నిర్మాణం ఈ ప్లాట్‌లో ఒకే అంతస్తులోనే కుదురుతుంది — మిగిలిన ${Math.round(envelopeSqft - targetSqft)} చ.అ. ఖాళీ/పార్కింగ్‌కు.`
          : targetSqft <= totalBuaSqft
            ? `${Math.round(targetSqft)} చ.అ. ఒకే అంతస్తులో కుదరదు (గరిష్ఠం ${Math.round(envelopeSqft)} చ.అ.); కానీ ${floors} అంతస్తుల్లో మొత్తం ${Math.round(totalBuaSqft)} చ.అ. వరకు కుదురుతుంది — ${Math.ceil(targetSqft / Math.max(1, envelopeSqft))} అంతస్తులు అవసరం.`
            : `${Math.round(targetSqft)} చ.అ. ఈ ప్లాట్‌కు మించినది — ఈ నిబంధనల ప్రకారం గరిష్ఠం ${Math.round(totalBuaSqft)} చ.అ. (FSI ${farLimit}). అంతస్తులు పెంచడం లేదా ప్లాట్ పెద్దది చేయడం తప్ప వేరే మార్గం లేదు.`,
    noteEn:
      targetSqft <= 0
        ? `On a single floor this plot supports up to ${Math.round(envelopeSqft)} sq.ft.; with ${floors} floors, up to ${Math.round(totalBuaSqft)} sq.ft. in total.`
        : targetSqft <= envelopeSqft
          ? `${Math.round(targetSqft)} sq.ft. (${round2(targetSqft / 1089)} gunta) fits on a single floor — the remaining ${Math.round(envelopeSqft - targetSqft)} sq.ft. stays open for parking/garden.`
          : targetSqft <= totalBuaSqft
            ? `${Math.round(targetSqft)} sq.ft. does not fit on one floor (max ${Math.round(envelopeSqft)} sq.ft.), but ${Math.ceil(targetSqft / Math.max(1, envelopeSqft))} floors give ${Math.round(totalBuaSqft)} sq.ft. in total.`
            : `${Math.round(targetSqft)} sq.ft. exceeds this plot — the limit here is ${Math.round(totalBuaSqft)} sq.ft. (FSI ${farLimit}). Only more floors or a bigger plot can change that.`,
  };

  const client = {
    nameTe: (input.clientName ?? '').trim(),
    villageTe: (input.village ?? '').trim(),
    nameEn: (input.clientNameEn ?? '').trim() || (input.clientName ?? '').trim(),
    villageEn: (input.villageEn ?? '').trim() || (input.village ?? '').trim(),
  };

  const summaryTe: string[] = [
    `ప్లాట్ ${widthFt}′ × ${depthFt}′ = ${Math.round(areaSqft)} చ.అ. (${(areaSqft / 1089).toFixed(2)} గుంట). ముఖం ${facing}.`,
    `సెట్‌బ్యాక్: ఫ్రంట్ ${band.frontFt}′, సైడ్ ${band.sideFt}′, రియర్ ${band.rearFt}′ → నిర్మాణ స్థలం ${Math.round(envelopeSqft)} చ.అ.`,
    `గ్రౌండ్ ఫ్లోర్ నిర్మాణం ${Math.round(area(building))} చ.అ. (${((area(building) / areaSqft) * 100).toFixed(1)}% కవరేజ్) · ${floors} అంతస్తులు · మొత్తం ${Math.round(totalBuaSqft)} చ.అ. · FSI ${farUsed.toFixed(2)}/${farLimit}.`,
    use === 'rental'
      ? `${units.length} అద్దె యూనిట్లు — ఒక్కో యూనిట్ సగటు ${Math.round(units.reduce((s, u) => s + u.areaSqft, 0) / Math.max(1, units.length))} చ.అ.`
      : `గదుల కార్యక్రమం: ${allRooms.filter((r) => r.key !== 'hal').map((r) => r.labelTe).join(', ')}.`,
    `వాస్తు అనుకూలత స్కోరు ${score}/100 · ప్రధాన ద్వారం ${ZONE_LABEL_TE[entranceZone]}.`,
  ];
  if (programNotes.length) summaryTe.push(...programNotes);
  summaryTe.push(feasibility.noteTe);
  summaryTe.push(...economics.linesTe);

  const assumptionsTe = [
    `సెట్‌బ్యాక్/కవరేజ్/FSI విలువలు సూచనాత్మకం (${rules.labelTe}); అనుమతి ముందు స్థానిక నిబంధనలతో సరిచూడాలి.`,
    'గోడల మందం, నిర్మాణ (RCC) స్తంభాల స్థానాలు ఈ స్థూల ప్లాన్‌లో చూపలేదు — వాటి కోసం స్ట్రక్చరల్ ఇంజనీర్ దగ్గరకు వెళ్లాలి.',
    `పార్కింగ్ ఒక్కో కారుకు 135 చ.అ. (9′×15′) లెక్కించబడింది; ${parkingCars} కార్లు.`,
    `అంతస్తుల ఎత్తు 10′–11′ మధ్య ఉంటుందని భావించాం; మొత్తం ఎత్తు ${(floors * 10.5).toFixed(1)}′ (సుమారు).`,
  ];


  const warningsEn: string[] = [];
  if (!roadOk) warningsEn.push(`Road width ${roadWidthFt} ft — this use needs at least ${rules.minRoadFt} ft.`);
  if (!farOk) warningsEn.push('The requested floors exceed the FSI limit — floors were reduced.');
  if (floorsAllowed < (input.floors ?? floors)) warningsEn.push(`FSI allows a maximum of ${floorsAllowed} floors on this plot.`);
  if (areaSqft < 600) warningsEn.push('Very small plot — rooms sit close to their minimum sizes; check ventilation carefully.');
  if (building.h < 12) warningsEn.push('Building depth below 12 ft — only a single row of rooms is possible.');
  if (!septicRect)
    warningsEn.push('No open space left for a septic tank — fix its location as per local panchayat rules (usually NW/W, beyond the plot line).');
  if (parkingCarsWanted > parkingCars)
    warningsEn.push(`The open space does not fit ${parkingCarsWanted} cars (placed ${parkingCars}). Use a stilt floor or street-side parking.`);

  const summaryEn: string[] = [
    `Plot ${widthFt} ft × ${depthFt} ft = ${Math.round(areaSqft)} sq.ft. (${(areaSqft / 1089).toFixed(2)} gunta). Facing ${facing}.`,
    `Setbacks: front ${band.frontFt} ft, side ${band.sideFt} ft, rear ${band.rearFt} ft → buildable area ${Math.round(envelopeSqft)} sq.ft.`,
    `Ground floor built ${Math.round(area(building))} sq.ft. (${((area(building) / areaSqft) * 100).toFixed(1)}% coverage) · ${floors} floors · total ${Math.round(totalBuaSqft)} sq.ft. · FSI ${farUsed.toFixed(2)}/${farLimit}.`,
    use === 'rental'
      ? `${units.length} rental units — average ${Math.round(units.reduce((s, u) => s + u.areaSqft, 0) / Math.max(1, units.length))} sq.ft. each.`
      : `Room programme: ${allRooms.filter((r) => r.key !== 'hal').map((r) => r.labelEn).join(', ')}.`,
    `Vastu suitability score ${score}/100 · main entrance ${ZONE_LABEL_EN[entranceZone]}.`,
    feasibility.noteEn,
    ...economics.linesEn,
  ];
  if (programNotesEn.length) summaryEn.push(...programNotesEn);

  const assumptionsEn = [
    `Setback/coverage/FSI values are indicative (${rules.presetId === 'ts_commercial' ? 'commercial' : 'residential'} preset); verify against local rules before approval.`,
    'Wall thickness and RCC column positions are not shown in this schematic plan — a structural engineer is required for those.',
    `Parking is counted as 135 sq.ft. (9 ft × 15 ft) per car; ${parkingCars} cars.`,
    `Floor-to-floor height assumed between 10 and 11 ft; overall height about ${(floors * 10.5).toFixed(1)} ft.`,
  ];

  return {
    input: { ...input, unit: input.unit, areaValue: input.areaValue, facing, roadWidthFt, use, floors: floorsRequested },
    plot: {
      widthFt,
      depthFt,
      areaSqft: Math.round(areaSqft),
      areaGunta: round2(areaSqft / 1089),
      areaSqyd: round2(areaSqft / 9),
      facing,
      roadSide,
      roadWidthFt,
    },
    rules: {
      presetId: rules.presetId,
      labelTe: rules.labelTe,
      frontFt: band.frontFt,
      sideFt: band.sideFt,
      rearFt: band.rearFt,
      coveragePct: band.coveragePct,
      far: band.far,
      noteTe: rules.noteTe,
      roadOk,
    },
    envelope,
    building,
    capacity: {
      envelopeSqft: Math.round(envelopeSqft),
      allowedCoverageSqft: Math.round(allowedCoverageSqft),
      groundBuiltSqft: Math.round(groundBuiltSqft),
      coverageActualPct: round2((area(building) / areaSqft) * 100),
      openAreaSqft: Math.round(areaSqft - area(building)),
      floors,
      floorsAllowed,
      totalBuaSqft: Math.round(totalBuaSqft),
      farUsed: round2(farUsed),
      farLimit,
      farOk,
      parkingSqft,
      parkingCars,
    },
    rooms,
    units,
    parking,
    features,
    entrance,
    score,
    client,
    feasibility,
    economics,
    checks,
    summaryTe,
    summaryEn,
    warningsTe,
    warningsEn,
    assumptionsTe,
    assumptionsEn,
  };
}

/** ఒక గది దీర్ఘచతురస్రాన్ని పూర్తి PlanRoom గా మార్చడం (దిక్కు లెక్కతో) */
function finalizeRoom(key: PlanRoomKey, rect: Rect, container: Rect, unitIndex?: number): PlanRoom {
  const cx = (rect.x - container.x + rect.w / 2) / Math.max(1e-6, container.w);
  const cy = (rect.y - container.y + rect.h / 2) / Math.max(1e-6, container.h);
  const zone = zoneOfPoint(Math.min(0.999, Math.max(0.001, cx)), Math.min(0.999, Math.max(0.001, cy)));
  const meta = ROOM_META[key];
  const { fit, reasonTe, remedyTe } = key === 'hal'
    ? { fit: 'ok' as Fit, reasonTe: 'మిగిలిన స్థలం — హాల్/కారిడార్', remedyTe: undefined }
    : fitForRoom(key, zone);
  return {
    id: `${key}-${Math.round(rect.x)}-${Math.round(rect.y)}${unitIndex !== undefined ? `-u${unitIndex + 1}` : ''}`,
    key,
    labelTe: meta.labelTe,
    labelEn: meta.labelEn,
    x: round2(rect.x),
    y: round2(rect.y),
    w: round2(rect.w),
    h: round2(rect.h),
    areaSqft: Math.round(area(rect)),
    zone,
    zoneTe: ZONE_LABEL_TE[zone],
    zoneEn: ZONE_LABEL_EN[zone],
    fit,
    reasonTe,
    remedyTe,
    unitIndex,
  };
}

/* ================================================================== *
 *  Photo / sketch intake helpers
 * ================================================================== */

/**
 * ఫోటో లేదా స్కెచ్ నుంచి వచ్చిన స్థూల కొలతలను ప్లాన్ ఇన్‌పుట్‌గా మార్చడం.
 * (AI ద్వారా వచ్చిన ఫలితం ఇక్కడ నేరుగా నమ్మకుండా, వినియోగదారు సరిచూసుకున్న తర్వాతే ప్లాన్.)
 */
export function plotInputFromPhoto(params: {
  areaValue: number;
  unit: PlotUnit;
  facing: Dik8;
  widthFt?: number;
  depthFt?: number;
  use?: PlotUse;
  floors?: number;
}): PlotPlanInput {
  return {
    areaValue: params.areaValue,
    unit: params.unit,
    facing: params.facing,
    widthFt: params.widthFt,
    depthFt: params.depthFt,
    use: params.use ?? 'residential',
    floors: params.floors,
  };
}

/** ప్రతిపాదిత ప్లాన్‌ను ఇప్పటికే ఉన్న ఇంటితో పోల్చడానికి సహాయకం */
export function compareWithExisting(plan: PlotPlan, existing: { key: PlanRoomKey; zone: Zone9 }[]): PlanRoom[] {
  return existing.map((e) => {
    const { fit, reasonTe, remedyTe } = fitForRoom(e.key, e.zone);
    const meta = ROOM_META[e.key];
    return {
      id: `existing-${e.key}`,
      key: e.key,
      labelTe: meta.labelTe,
      labelEn: meta.labelEn,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      areaSqft: 0,
      zone: e.zone,
      zoneTe: ZONE_LABEL_TE[e.zone],
      zoneEn: ZONE_LABEL_EN[e.zone],
      fit,
      reasonTe,
      remedyTe,
    };
  });
}
