/**
 * VastuPlotPlannerPanel.tsx — ఇన్‌పుట్ → వాస్తు ప్లాన్ (ప్లాట్ స్థాయి)
 *
 * ఇక్కడ వినియోగదారు ఇచ్చేది:
 *   పేరు · గ్రామం · భూమి విలువ · విస్తీర్ణం (గుంట/చ.గజం/చ.అ.) · ముఖం · అంతస్తులు ·
 *   వినియోగం (నివాసం/అద్దె/వాణిజ్యం) · ఎంత నిర్మాణం కావాలి · భూమి ఫోటో.
 *
 * ఫలితం: ఇంజనీర్ స్థాయి ప్లాన్ — సెట్‌బ్యాక్, కవరేజ్, FSI, అంతస్తులు, గదుల అమరిక,
 * వాస్తు తనిఖీలు, వ్యయం/అద్దె లెక్క, మరియు స్కేల్ డ్రాయింగ్.
 *
 * ఫోటో గురించి నిజాయితీ: బ్రౌజర్‌లో ఆటోమేటిక్ ఇమేజ్ విశ్లేషణ లేదు. కాబట్టి ఫోటోను
 * చూపించి, దానిలో ఏమి కనిపిస్తుందో వినియోగదారు ధృవీకరించే చెక్‌లిస్ట్ ఇస్తాము —
 * ఆ ధృవీకరణలే ప్లాన్‌లోకి వెళ్తాయి. చూడని దానిని చూశామని చెప్పము.
 */

import { useMemo, useRef, useState } from 'react';
import { buildPlotPlan } from '../engine/vastuPlotPlannerEngine.ts';
import type { Dik8, PlotUnit, PlotUse } from '../engine/vastuPlotPlannerEngine.ts';
import VastuPlanDrawing from './VastuPlanDrawing.tsx';

const UNITS: { id: PlotUnit; te: string; en: string }[] = [
  { id: 'gunta', te: 'గుంట', en: 'gunta' },
  { id: 'sqyd', te: 'చ.గజం', en: 'sq.yd' },
  { id: 'sqft', te: 'చ.అడుగు', en: 'sq.ft' },
  { id: 'sqm', te: 'చ.మీ.', en: 'sq.m' },
  { id: 'acre', te: 'ఎకరం', en: 'acre' },
];

const DIKS: { id: Dik8; te: string; en: string }[] = [
  { id: 'E', te: 'తూర్పు', en: 'East' },
  { id: 'W', te: 'పడమర', en: 'West' },
  { id: 'N', te: 'ఉత్తరం', en: 'North' },
  { id: 'S', te: 'దక్షిణం', en: 'South' },
  { id: 'NE', te: 'ఈశాన్యం', en: 'North-East' },
  { id: 'NW', te: 'వాయువ్యం', en: 'North-West' },
  { id: 'SE', te: 'ఆగ్నేయం', en: 'South-East' },
  { id: 'SW', te: 'నైరుతి', en: 'South-West' },
];

const USES: { id: PlotUse; te: string; en: string; hint: string; hintEn: string }[] = [
  { id: 'residential', te: 'స్వంత నివాసం', en: 'Own home', hint: 'కుటుంబం ఉండడానికి', hintEn: 'for the family' },
  { id: 'rental', te: 'అద్దె యూనిట్లు', en: 'Rental units', hint: 'అద్దెకు ఇచ్చి ఆదాయం', hintEn: 'let out for income' },
  { id: 'commercial', te: 'వాణిజ్యం', en: 'Commercial', hint: 'షాప్ / కార్యాలయం', hintEn: 'shop / office' },
  { id: 'mixed', te: 'కలిపి', en: 'Mixed', hint: 'గ్రౌండ్ ఫ్లోర్ షాప్, పైన నివాసం', hintEn: 'shop below, home above' },
];

const field =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[12px] text-[#EDE8E0] outline-none focus:border-[#5BBFB5]/60';
const label = 'text-[10px] uppercase tracking-wider text-[#EDE8E0]/45';

export interface VastuPlotPlannerPanelProps {
  defaultName?: string;
  defaultVillage?: string;
  isTe?: boolean;
}

export function VastuPlotPlannerPanel({ defaultName = '', defaultVillage = '', isTe = true }: VastuPlotPlannerPanelProps) {
  const [name, setName] = useState(defaultName);
  const [village, setVillage] = useState(defaultVillage);
  const [areaValue, setAreaValue] = useState(1);
  const [unit, setUnit] = useState<PlotUnit>('gunta');
  const [facing, setFacing] = useState<Dik8>('E');
  const [roadWidth, setRoadWidth] = useState(30);
  const [floors, setFloors] = useState(2);
  const [use, setUse] = useState<PlotUse>('residential');
  const [familySize, setFamilySize] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [landRate, setLandRate] = useState<number>(0);
  const [rateUnit, setRateUnit] = useState<PlotUnit>('gunta');
  const [targetSqft, setTargetSqft] = useState(0);
  const [parkingCars, setParkingCars] = useState(1);
  const [widthFt, setWidthFt] = useState<number>(0);
  const [depthFt, setDepthFt] = useState<number>(0);

  // ఫోటో + ధృవీకరణలు
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({
    boundary: false,
    road: false,
    structures: false,
    slope: false,
    obstructions: false,
  });
  const [photoNote, setPhotoNote] = useState('');

  const [plan, setPlan] = useState<ReturnType<typeof buildPlotPlan> | null>(null);
  const drawRef = useRef<HTMLDivElement | null>(null);
  const [err, setErr] = useState('');

  const areaHint = useMemo(() => {
    const sqft = areaValue * (unit === 'gunta' ? 1089 : unit === 'sqyd' ? 9 : unit === 'acre' ? 43560 : unit === 'sqm' ? 10.7639 : 1);
    return isTe
      ? `${Math.round(sqft)} చ.అ. · ${(sqft / 1089).toFixed(2)} గుంట`
      : `${Math.round(sqft)} sq.ft. · ${(sqft / 1089).toFixed(2)} gunta`;
  }, [areaValue, unit, isTe]);

  const photoDone = Object.values(checks).filter(Boolean).length;

  const build = () => {
    setErr('');
    try {
      const p = buildPlotPlan({
        areaValue: Number.isFinite(areaValue) && areaValue > 0 ? areaValue : 1,
        unit,
        widthFt: widthFt > 0 ? widthFt : undefined,
        depthFt: depthFt > 0 ? depthFt : undefined,
        facing,
        roadWidthFt: roadWidth,
        floors: use === 'residential' || use === 'rental' ? floors : floors,
        use,
        familySize,
        bedrooms: use === 'residential' ? bedrooms : undefined,
        parkingCars,
        clientName: name,
        village,
        clientNameEn: name,
        villageEn: village,
        landRate: landRate > 0 ? landRate : undefined,
        rateUnit,
        targetBuiltSqft: targetSqft > 0 ? targetSqft : undefined,
      });
      setPlan(p);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'ప్లాన్ లెక్కించడంలో లోపం.');
      setPlan(null);
    }
  };

  const downloadSvg = () => {
    const svg = drawRef.current?.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const box = (svg.getAttribute('viewBox') ?? '0 0 700 900').split(' ').map(Number);
    clone.setAttribute('width', String(box[2]));
    clone.setAttribute('height', String(box[3]));
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vastu-plan-${(name || 'plot').replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const printPlan = () => {
    const svg = drawRef.current?.querySelector('svg');
    if (!svg) return;
    const w = window.open('', '_blank', 'width=900,height=1100');
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${isTe ? 'వాస్తు ప్లాన్' : 'Vastu plan'}</title>` +
        '<style>body{margin:0;padding:12mm;font-family:sans-serif;display:flex;justify-content:center}svg{max-width:100%;height:auto}</style>' +
        `</head><body>${svg.outerHTML}</body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const onPhoto = (f: File | undefined) => {
    if (!f) return;
    setPhotoName(f.name);
    const url = URL.createObjectURL(f);
    setPhoto(url);
  };

  const checkRows: { id: keyof typeof checks; te: string; en: string; hint: string; hintEn: string }[] = [
    {
      id: 'boundary',
      te: 'నాలుగు సరిహద్దులు (కంచె/గోడ/సర్వే రాళ్లు) కనిపిస్తున్నాయి',
      en: 'All four boundaries (fence/wall/survey stones) are visible',
      hint: 'ఫోటోలో సరిహద్దు స్పష్టంగా ఉందా',
      hintEn: 'is the boundary clear in the photo',
    },
    {
      id: 'road',
      te: 'రోడ్డు ఏ వైపు ఉందో స్పష్టంగా తెలుస్తోంది',
      en: 'The road side is clearly identifiable',
      hint: 'రోడ్డు + ముఖం దిక్కు',
      hintEn: 'road + facing direction',
    },
    {
      id: 'structures',
      te: 'ప్లాట్‌లో ఉన్న పాత కట్టడం/చెట్లు గుర్తించగలిగాను',
      en: 'Existing structures/trees on the plot are identifiable',
      hint: 'పాత ఇల్లు, బావి, చెట్లు',
      hintEn: 'old house, well, trees',
    },
    {
      id: 'slope',
      te: 'ఏ వైపు ఏటువాలు (వాలు) ఉందో చెప్పగలను',
      en: 'I can tell which way the ground slopes',
      hint: 'ఈశాన్యం/ఉత్తరం వాలు మేలు',
      hintEn: 'NE/N slope is best',
    },
    {
      id: 'obstructions',
      te: 'ఎదురుగా/పక్కన ఎత్తైన కట్టడం, విద్యుత్ స్తంభం వంటివి గుర్తించాను',
      en: 'Taller buildings / poles opposite or beside are noted',
      hint: 'అడ్డంకులు',
      hintEn: 'obstructions',
    },
  ];

  return (
    <div className="rounded-2xl border border-[#66CBBF]/25 bg-gradient-to-br from-[#0C1A1E] to-[#0B0F1E] p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#EDE8E0] flex items-center gap-2">
            <span className="w-1.5 h-4 rounded bg-[#5BBFB5]" />
            {isTe ? 'ప్లాట్ ప్లాన్ తయారీ (సెట్‌బ్యాక్ · FSI · గదుల అమరిక · వ్యయం)' : 'Plot plan (setbacks · FSI · room layout · cost)'}
          </h3>
          <p className="text-[11px] text-[#EDE8E0]/55 mt-1 max-w-2xl leading-relaxed">
            {isTe
              ? 'పేరు, గ్రామం, భూమి విలువ, విస్తీర్ణం, ముఖం ఇవ్వండి — ఎంత నిర్మాణం కుదురుతుంది, ఎన్ని గదులు వస్తాయి, ఖర్చు-అద్దె ఎంత అనేది లెక్కించి, స్కేల్ ప్రకారం ప్లాన్ గీసి ఇస్తుంది.'
              : 'Give name, village, land value, area and facing — it computes buildable area, rooms, cost and rent, and draws a scaled plan.'}
          </p>
        </div>
        <div className="flex gap-2 text-[10.5px]">
          <span className="rounded-full bg-[#5BBFB5]/15 px-2.5 py-1 text-[#5BBFB5]">{areaHint}</span>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[#EDE8E0]/70">
            {photoDone}/5 {isTe ? 'ఫోటో ధృవీకరణలు' : 'photo checks'}
          </span>
        </div>
      </div>

      {/* ---------------- ఇన్‌పుట్‌లు ---------------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className={label}>{isTe ? 'పేరు' : 'Name'}</div>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder={isTe ? 'ఉదా: రమేష్' : 'e.g. Ramesh'} />
        </div>
        <div>
          <div className={label}>{isTe ? 'గ్రామం / ప్రాంతం' : 'Village'}</div>
          <input className={field} value={village} onChange={(e) => setVillage(e.target.value)} placeholder={isTe ? 'ఉదా: కొత్తగూడెం' : 'e.g. Kothagudem'} />
        </div>
        <div>
          <div className={label}>{isTe ? 'విస్తీర్ణం' : 'Area'}</div>
          <div className="flex gap-1.5">
            <input
              type="number"
              step="0.25"
              min="0.25"
              className={field}
              value={areaValue}
              onChange={(e) => setAreaValue(parseFloat(e.target.value) || 0)}
            />
            <select className={field} value={unit} onChange={(e) => setUnit(e.target.value as PlotUnit)}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#0B0F1E]">
                  {isTe ? u.te : u.en}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className={label}>{isTe ? 'ప్లాట్ ముఖం (రోడ్డు వైపు)' : 'Facing (road side)'}</div>
          <select className={field} value={facing} onChange={(e) => setFacing(e.target.value as Dik8)}>
            {DIKS.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#0B0F1E]">
                {isTe ? d.te : d.en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className={label}>{isTe ? 'వినియోగం' : 'Use'}</div>
          <select className={field} value={use} onChange={(e) => setUse(e.target.value as PlotUse)}>
            {USES.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#0B0F1E]">
                {isTe ? `${u.te} — ${u.hint}` : `${u.en} — ${u.hintEn}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className={label}>{isTe ? 'అంతస్తులు' : 'Floors'}</div>
          <select className={field} value={floors} onChange={(e) => setFloors(parseInt(e.target.value, 10) || 1)}>
            {[1, 2, 3, 4, 5, 6].map((f) => (
              <option key={f} value={f} className="bg-[#0B0F1E]">
                {f === 1 ? (isTe ? 'గ్రౌండ్ మాత్రమే (G)' : 'Ground only') : `G+${f - 1}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className={label}>{isTe ? 'రోడ్డు వెడల్పు (అడుగులు)' : 'Road width (ft)'}</div>
          <input type="number" min="10" step="5" className={field} value={roadWidth} onChange={(e) => setRoadWidth(parseFloat(e.target.value) || 30)} />
        </div>
        <div>
          <div className={label}>{isTe ? 'కార్ల పార్కింగ్' : 'Car parking'}</div>
          <input type="number" min="0" max="6" className={field} value={parkingCars} onChange={(e) => setParkingCars(Math.max(0, parseInt(e.target.value, 10) || 0))} />
        </div>

        <div>
          <div className={label}>{isTe ? 'భూమి విలువ (₹ / యూనిట్)' : 'Land value (₹ / unit)'}</div>
          <div className="flex gap-1.5">
            <input
              type="number"
              step="50000"
              min="0"
              className={field}
              value={landRate || ''}
              placeholder="1500000"
              onChange={(e) => setLandRate(parseFloat(e.target.value) || 0)}
            />
            <select className={field} value={rateUnit} onChange={(e) => setRateUnit(e.target.value as PlotUnit)}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#0B0F1E]">
                  ₹/{isTe ? u.te : u.en}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className={label}>{isTe ? 'ఎంత నిర్మాణం కావాలి (చ.అ.)' : 'Target built-up (sq.ft.)'}</div>
          <input
            type="number"
            min="0"
            step="50"
            className={field}
            value={targetSqft || ''}
            placeholder={isTe ? 'ఉదా: 544 (½ గుంట)' : 'e.g. 544'}
            onChange={(e) => setTargetSqft(parseFloat(e.target.value) || 0)}
          />
        </div>
        {use === 'residential' && (
          <>
            <div>
              <div className={label}>{isTe ? 'కుటుంబ సభ్యులు' : 'Family size'}</div>
              <input type="number" min="1" max="12" className={field} value={familySize} onChange={(e) => setFamilySize(parseInt(e.target.value, 10) || 4)} />
            </div>
            <div>
              <div className={label}>{isTe ? 'పడకగదులు' : 'Bedrooms'}</div>
              <input type="number" min="1" max="5" className={field} value={bedrooms} onChange={(e) => setBedrooms(parseInt(e.target.value, 10) || 2)} />
            </div>
          </>
        )}
        <div>
          <div className={label}>{isTe ? 'ప్లాట్ వెడల్పు (అడుగులు, ఐచ్ఛికం)' : 'Plot width (ft, optional)'}</div>
          <input type="number" min="0" className={field} value={widthFt || ''} placeholder="—" onChange={(e) => setWidthFt(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <div className={label}>{isTe ? 'ప్లాట్ లోతు (అడుగులు, ఐచ్ఛికం)' : 'Plot depth (ft, optional)'}</div>
          <input type="number" min="0" className={field} value={depthFt || ''} placeholder="—" onChange={(e) => setDepthFt(parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      {/* ---------------- ఫోటో + ధృవీకరణ ---------------- */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
          <div className="text-[11.5px] text-[#EDE8E0] font-medium">{isTe ? 'భూమి ఫోటో' : 'Land photo'}</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-[#5BBFB5]/20 px-3 py-1.5 text-[11.5px] text-[#5BBFB5] hover:bg-[#5BBFB5]/30"
            >
              {isTe ? 'ఫోటో ఎంచుకోండి' : 'Choose photo'}
            </button>
            {photoName && <span className="text-[10.5px] text-[#EDE8E0]/50 truncate max-w-[60%]">{photoName}</span>}
          </div>
          {photo && (
            <img src={photo} alt={isTe ? 'భూమి ఫోటో' : 'Land photo'} className="w-full max-h-56 object-contain rounded-lg border border-white/10 bg-black/30" />
          )}
          <p className="text-[10px] text-[#EDE8E0]/45 leading-relaxed">
            {isTe
              ? 'గమనిక: ఫోటో నుంచి ఆటోమేటిక్‌గా కొలతలు తీయడం బ్రౌజర్‌లో సాధ్యం కాదు. ఫోటోలో కనిపించే విషయాలను మీరు ధృవీకరిస్తే అవి ప్లాన్‌కు జోడిస్తాము — చూడలేని దానిని ఊహించము.'
              : 'Photos cannot be measured automatically in the browser. We add only what you confirm is visible — we never guess what the photo cannot show.'}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
          <div className="text-[11.5px] text-[#EDE8E0] font-medium">{isTe ? 'ఫోటోలో ఏమి కనిపిస్తోంది?' : 'What does the photo show?'}</div>
          {checkRows.map((c) => (
            <label key={c.id} className="flex items-start gap-2 text-[11px] text-[#EDE8E0]/80 cursor-pointer">
              <input
                type="checkbox"
                checked={checks[c.id]}
                onChange={(e) => setChecks((s) => ({ ...s, [c.id]: e.target.checked }))}
                className="mt-0.5 accent-[#5BBFB5]"
              />
              <span>
                {isTe ? c.te : c.en}
                <span className="block text-[9.5px] text-[#EDE8E0]/35">{isTe ? c.hint : c.hintEn}</span>
              </span>
            </label>
          ))}
          <input
            className={field + ' mt-1'}
            value={photoNote}
            onChange={(e) => setPhotoNote(e.target.value)}
            placeholder={isTe ? 'ఫోటోలో కనిపించిన మరేదైనా (ఉదా: తూర్పున పాత బావి)' : 'Anything else visible (e.g. old well on east)'}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={build}
          className="rounded-lg bg-[#5BBFB5] px-4 py-2 text-[12.5px] font-semibold text-[#06201E] hover:bg-[#6FD3C8]"
        >
          {isTe ? 'ప్లాన్ తయారు చేయి' : 'Generate plan'}
        </button>
        {err && <span className="text-[11px] text-[#D46B5E]">{err}</span>}
        <span className="text-[10.5px] text-[#EDE8E0]/40">
          {isTe ? 'సెట్‌బ్యాక్/FSI సూచనాత్మకం — అనుమతి ముందు MRO/DTCP నిబంధనలు సరిచూడాలి.' : 'Setbacks/FSI are indicative — verify with MRO/DTCP before approval.'}
        </span>
      </div>

      {/* ---------------- ఫలితం ---------------- */}
      {plan && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={downloadSvg}
              className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[11px] text-[#EDE8E0]/80 hover:bg-white/[0.12]"
            >
              {isTe ? 'ప్లాన్ SVG డౌన్‌లోడ్' : 'Download plan (SVG)'}
            </button>
            <button
              type="button"
              onClick={printPlan}
              className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[11px] text-[#EDE8E0]/80 hover:bg-white/[0.12]"
            >
              {isTe ? 'ప్లాన్ ప్రింట్ / PDF' : 'Print plan / PDF'}
            </button>
          </div>
          <div className="rounded-xl bg-white p-2 overflow-auto" ref={drawRef}>
            <VastuPlanDrawing plan={plan} isTe={isTe} />
          </div>
          <div className="grid gap-1 sm:grid-cols-3 text-[10.5px]">
            {plan.features.map((f) => (
              <div key={f.key} className="rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[#EDE8E0]/70 leading-snug">
                <span className="text-[#5BBFB5]">
                  {isTe
                    ? f.key === 'overhead'
                      ? 'ట'
                      : f.key === 'sump'
                        ? 'స'
                        : 'ప'
                    : f.key === 'overhead'
                      ? 'T'
                      : f.key === 'sump'
                        ? 'S'
                        : 'P'}
                </span>{' '}
                {isTe ? `${f.labelTe} — ${f.noteTe}` : `${f.labelEn} — ${f.noteEn}`}
              </div>
            ))}
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-xl border border-[#5BBFB5]/25 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-wider text-[#5BBFB5]">{isTe ? 'స్థల సామర్థ్యం' : 'Capacity'}</div>
              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[11.5px] text-[#EDE8E0]/85">
                <span>{isTe ? 'ప్లాట్' : 'Plot'}</span>
                <span className="text-right font-mono-tabular">
                  {plan.plot.areaSqft} {isTe ? 'చ.అ.' : 'sq.ft.'} · {plan.plot.areaGunta} {isTe ? 'గుంట' : 'gunta'}
                </span>
                <span>{isTe ? 'నిర్మాణ స్థలం' : 'Envelope'}</span>
                <span className="text-right font-mono-tabular">
                  {plan.capacity.envelopeSqft} {isTe ? 'చ.అ.' : 'sq.ft.'}
                </span>
                <span>{isTe ? 'కవరేజ్' : 'Coverage'}</span>
                <span className="text-right font-mono-tabular">{plan.capacity.coverageActualPct}% / {plan.rules.coveragePct}%</span>
                <span>FSI</span>
                <span className="text-right font-mono-tabular">{plan.capacity.farUsed} / {plan.capacity.farLimit}</span>
                <span>{isTe ? 'అంతస్తులు' : 'Floors'}</span>
                <span className="text-right font-mono-tabular">{plan.capacity.floors} / {plan.capacity.floorsAllowed}</span>
                <span>BUA</span>
                <span className="text-right font-mono-tabular">
                  {plan.capacity.totalBuaSqft} {isTe ? 'చ.అ.' : 'sq.ft.'}
                </span>
                <span>{isTe ? 'వాస్తు స్కోరు' : 'Vastu score'}</span>
                <span className="text-right font-mono-tabular">{plan.score}/100</span>
              </div>
            </div>
            <div className="rounded-xl border border-[#C9A96E]/25 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-wider text-[#C9A96E]">{isTe ? 'వ్యయం · అద్దె' : 'Cost · rent'}</div>
              <ul className="mt-1 space-y-1 text-[11px] text-[#EDE8E0]/80 leading-relaxed">
                {(isTe ? plan.economics.linesTe : plan.economics.linesEn).map((l, i) => (
                  <li key={i}>▸ {l}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[11px] uppercase tracking-wider text-[#EDE8E0]/45">{isTe ? 'తనిఖీలు' : 'Checks'}</div>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {plan.checks.map((c) => (
                <div key={c.id} className="flex items-start gap-1.5 text-[11px]">
                  <span style={{ color: c.ok ? '#5BBFB5' : '#D46B5E' }}>{c.ok ? '✓' : '✗'}</span>
                  <span className="text-[#EDE8E0]/80">
                    {isTe ? c.labelTe : c.labelEn}
                    <span className="block text-[9.5px] text-[#EDE8E0]/40">{isTe ? c.detailTe : c.detailEn}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {plan.rooms.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 overflow-x-auto">
              <div className="text-[11px] uppercase tracking-wider text-[#EDE8E0]/45 mb-1">{isTe ? 'గదుల పట్టిక' : 'Room schedule'}</div>
              <table className="w-full text-[10.5px] text-[#EDE8E0]/80">
                <thead>
                  <tr className="text-left text-[#EDE8E0]/45">
                    <th className="py-0.5">{isTe ? 'గది' : 'Room'}</th>
                    <th>{isTe ? 'కొలతలు' : 'Size'}</th>
                    <th>{isTe ? 'విస్తీర్ణం' : 'Area'}</th>
                    <th>{isTe ? 'దిక్కు' : 'Zone'}</th>
                    <th>{isTe ? 'వాస్తు' : 'Fit'}</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.rooms.map((r) => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="py-0.5">{isTe ? r.labelTe : r.labelEn}</td>
                      <td className="font-mono-tabular">{r.w}′ × {r.h}′</td>
                      <td className="font-mono-tabular">{r.areaSqft}</td>
                      <td>{isTe ? r.zoneTe : r.zoneEn}</td>
                      <td style={{ color: r.fit === 'best' ? '#5BBFB5' : r.fit === 'ok' ? '#C9A96E' : '#D46B5E' }}>
                        {r.fit === 'best' ? (isTe ? 'అనుకూలం' : 'best') : r.fit === 'ok' ? (isTe ? 'సరిపోయింది' : 'ok') : (isTe ? 'సరిదిద్దాలి' : 'fix')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {plan.warningsTe.length > 0 && (
            <div className="rounded-xl border border-[#D46B5E]/30 bg-[#D46B5E]/10 p-3 text-[11px] text-[#F0B7AF] space-y-1">
              {plan.warningsTe.map((w, i) => (
                <div key={i}>• {w}</div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[10.5px] text-[#EDE8E0]/55 leading-relaxed space-y-1">
            {plan.summaryTe.map((s, i) => (
              <div key={i}>▸ {s}</div>
            ))}
            <div className="pt-1 border-t border-white/5 space-y-1">
              {(isTe ? plan.assumptionsTe : plan.assumptionsEn).map((a, i) => (
                <div key={i} className="text-[#EDE8E0]/40">◦ {a}</div>
              ))}
            </div>
            {(photoDone > 0 || photoNote) && (
              <div className="pt-1 border-t border-white/5">
                <span className="text-[#5BBFB5]">{isTe ? 'ఫోటో నుంచి నిర్ధారించినవి: ' : 'Confirmed from photo: '}</span>
                {checkRows.filter((c) => checks[c.id]).map((c) => (isTe ? c.te : c.en)).join(' · ')}
                {photoNote ? ` · ${photoNote}` : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VastuPlotPlannerPanel;
