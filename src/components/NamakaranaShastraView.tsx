import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Search,
  Award,
  Star,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  ShieldCheck,
  Flame,
  Hash,
  Volume2,
} from 'lucide-react';
import {
  calculateChart,
  type BirthInput,
  type CompleteChartResult,
  type ZodiacTradition,
} from '../engine/ephemeris.ts';
import {
  STATE_DISTRICT_ATLAS,
  TELUGU_NAKSHATRAS,
} from '../engine/teluguJathakam.ts';
import {
  generateNamakaranaReport,
  validateCustomBabyName,
  type BabyNameSuggestion,
} from '../engine/namakaranaEngine.ts';

interface NamakaranaShastraViewProps {
  birthInput: BirthInput;
  onUpdateBirthInput: (updated: BirthInput) => void;
  tradition: ZodiacTradition;
}

export const NamakaranaShastraView: React.FC<NamakaranaShastraViewProps> = ({
  birthInput,
  onUpdateBirthInput,
  tradition,
}) => {
  const gender: 'male' | 'female' = birthInput.gender ?? 'male';

  const [selectedStateId, setSelectedStateId] = useState<string>('telangana');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('tg_hyderabad');
  const [selectedSyllableFilter, setSelectedSyllableFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [customNameInput, setCustomNameInput] = useState<string>('');
  const [selectedReferenceNakshatraIdx, setSelectedReferenceNakshatraIdx] = useState<number | null>(null);

  const activeStateObj = useMemo(
    () =>
      STATE_DISTRICT_ATLAS.find((s) => s.id === selectedStateId) ??
      STATE_DISTRICT_ATLAS[0],
    [selectedStateId]
  );

  const handleStateChange = (newStateId: string) => {
    setSelectedStateId(newStateId);
    const st = STATE_DISTRICT_ATLAS.find((s) => s.id === newStateId);
    if (st && st.districts.length > 0) {
      const firstDist = st.districts[0];
      setSelectedDistrictId(firstDist.id);
      onUpdateBirthInput({
        ...birthInput,
        city: `${firstDist.nameTe} (${firstDist.nameEn})`,
        country: `${st.nameTe.split(' ')[0]}, ${st.countryTe}`,
        lat: firstDist.lat,
        lng: firstDist.lng,
        tzOffsetHours: firstDist.tzOffsetHours,
      });
    }
  };

  const handleDistrictChange = (newDistId: string) => {
    setSelectedDistrictId(newDistId);
    const dist = activeStateObj.districts.find((d) => d.id === newDistId);
    if (dist) {
      onUpdateBirthInput({
        ...birthInput,
        city: `${dist.nameTe} (${dist.nameEn})`,
        country: `${activeStateObj.nameTe.split(' ')[0]}, ${activeStateObj.countryTe}`,
        lat: dist.lat,
        lng: dist.lng,
        tzOffsetHours: dist.tzOffsetHours,
      });
    }
  };

  const chart: CompleteChartResult = useMemo(
    () => calculateChart(birthInput, tradition),
    [birthInput, tradition]
  );

  const report = useMemo(
    () => generateNamakaranaReport(chart, gender),
    [chart, gender]
  );

  const customValidation = useMemo(() => {
    if (!customNameInput.trim()) return null;
    return validateCustomBabyName(customNameInput, report);
  }, [customNameInput, report]);

  const filteredNames = useMemo(() => {
    return report.suggestedNames.filter((item) => {
      if (item.gender !== gender) return false;
      if (selectedSyllableFilter !== 'ALL' && item.syllableTe !== selectedSyllableFilter) {
        return false;
      }
      if (selectedCategoryFilter !== 'ALL' && item.ashrayaCategoryTe !== selectedCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [report.suggestedNames, gender, selectedSyllableFilter, selectedCategoryFilter]);

  const handleApplyNameToJathakam = (item: BabyNameSuggestion) => {
    onUpdateBirthInput({
      ...birthInput,
      name: `${item.nameTe} (${item.nameEn})`,
      gender,
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* ===================================================================== */}
      {/* 1. ROYAL BANNER & DEDICATED BABY / NATIVE BIRTH + GENDER FORM         */}
      {/* ===================================================================== */}
      <section className="bg-gradient-to-b from-[#141932] to-[#0F1326] border-2 border-[#C9A96E]/60 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="text-center space-y-2 border-b border-[#C9A96E]/25 pb-5">
          <div className="text-[11px] sm:text-xs tracking-[0.16em] text-[#C9A96E] font-semibold">
            || శ్రీ గణేశాయ నమః · చూడామణి & ఆశ్వలాయన గృహ్యసూత్ర నామకరణ పీఠం ||
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#EDE8E0]">
            శ్రీ వేద నామకరణ శాస్త్రం — పేరు పెట్టడం & నామాక్షర ఆశ్రయ నిర్ణయం
          </h1>
          <p className="text-xs sm:text-sm text-[#EDE8E0]/75 max-w-3xl mx-auto leading-relaxed">
            పుట్టిన తేదీ, సమయం, ప్రాంతం మరియు <strong className="text-[#C9A96E]">అబ్బాయి / అమ్మాయి</strong> వివరాలు ఇవ్వగానే — జన్మ నక్షత్ర పాద అక్షరాలు, ఏయే 6 శాస్త్రీయ ఆశ్రయాలతో (దేవతా, రాశి, తత్వ, ధ్వని, సంఖ్యాశాస్త్ర ఆశ్రయాలు) పేర్లు పెట్టాలో మరియు వందలాది శుభ నామాలను తక్షణమే తెలుసుకోండి.
          </p>
        </div>

        {/* Interactive Input Console: Gender (Boy/Girl), Date, Time, State & District */}
        <div className="bg-[#090C18]/90 border border-[#C9A96E]/40 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#C9A96E] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#5BBFB5]" />
                <span>శిశువు / జాతకుని జనన & లింగ (అబ్బాయి / అమ్మాయి) వివరాలు</span>
              </h2>
              <p className="text-xs text-[#EDE8E0]/65 mt-0.5">
                ఇక్కడ వివరాలు మార్చగానే నామాక్షరాలు, ఆశ్రయ నియమాలు మరియు పేర్ల జాబితా ఆటోమేటిక్‌గా మారుతాయి
              </p>
            </div>

            {/* Prominent Boy vs Girl Selector */}
            <div className="flex items-center gap-2 bg-[#141932] p-1.5 rounded-xl border border-[#C9A96E]/40">
              <button
                type="button"
                onClick={() => onUpdateBirthInput({ ...birthInput, gender: 'male' })}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  gender === 'male'
                    ? 'bg-[#C9A96E] text-[#090C18] shadow-md'
                    : 'text-[#EDE8E0]/75 hover:text-white'
                }`}
              >
                <span>👦</span>
                <span>అబ్బాయి / పురుషుడు (Boy)</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateBirthInput({ ...birthInput, gender: 'female' })}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  gender === 'female'
                    ? 'bg-[#5BBFB5] text-[#090C18] shadow-md'
                    : 'text-[#EDE8E0]/75 hover:text-white'
                }`}
              >
                <span>👧</span>
                <span>అమ్మాయి / స్త్రీ (Girl)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-[#EDE8E0]/85 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>పుట్టిన తేదీ (Date of Birth)</span>
              </label>
              <input
                type="date"
                value={birthInput.date}
                onChange={(e) =>
                  onUpdateBirthInput({ ...birthInput, date: e.target.value })
                }
                className="w-full bg-[#141932] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
              />
            </div>

            {/* Time of Birth */}
            <div>
              <label className="block text-xs font-semibold text-[#EDE8E0]/85 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5BBFB5]" />
                <span>పుట్టిన సమయం (Time of Birth)</span>
              </label>
              <input
                type="time"
                value={birthInput.time}
                onChange={(e) =>
                  onUpdateBirthInput({ ...birthInput, time: e.target.value })
                }
                className="w-full bg-[#141932] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#5BBFB5]"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-[#C9A96E] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>రాష్ట్రం / దేశం (State)</span>
              </label>
              <select
                value={selectedStateId}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-[#141932] border border-[#C9A96E]/40 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
              >
                {STATE_DISTRICT_ATLAS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.nameTe}
                  </option>
                ))}
              </select>
            </div>

            {/* District / City */}
            <div>
              <label className="block text-xs font-semibold text-[#5BBFB5] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#5BBFB5]" />
                <span>జిల్లా / జన్మ స్థలం (Place)</span>
              </label>
              <select
                value={selectedDistrictId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-[#141932] border border-[#5BBFB5]/40 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#5BBFB5]"
              >
                {activeStateObj.districts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {dist.nameTe} ({dist.nameEn})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. HERO NAMA AKSHARA & NAKSHATRA PADAM VERDICT                        */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 5 cols: Big Primary Aksharam Spotlight */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1B2242] to-[#090C18] border-2 border-[#C9A96E] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/50 text-[#C9A96E] text-xs font-bold">
                {report.genderLabelTe}
              </span>
              <span className="text-xs font-mono-tabular text-[#5BBFB5] font-bold">
                చంద్ర స్ఫుటం: {report.moonLonSidereal.toFixed(2)}°
              </span>
            </div>

            <div className="my-5 text-center space-y-2">
              <div className="text-xs text-[#EDE8E0]/70 font-semibold">
                జన్మ నక్షత్ర పాద ప్రధాన నామాక్షరం (Primary Birth Syllable)
              </div>
              <div className="inline-flex items-center justify-center gap-4 px-8 py-4 rounded-2xl bg-[#090C18] border-2 border-[#5BBFB5] shadow-inner">
                <span className="text-4xl sm:text-5xl font-display font-bold text-[#C9A96E]">
                  “{report.exactPadaSyllableTe}”
                </span>
                <span className="text-xl sm:text-2xl font-mono-tabular font-bold text-[#5BBFB5]">
                  ({report.exactPadaSyllableEn})
                </span>
              </div>
              <div className="text-sm font-bold text-[#EDE8E0] pt-1">
                {report.nakshatraNameTe} నక్షత్రం — {report.pada}వ పాదం · {report.rasiNameTe}
              </div>
            </div>

            {/* All 4 Padas Strip */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <div className="text-xs font-bold text-[#C9A96E] text-center">
                {report.nakshatraNameTe} నక్షత్రంలోని 4 పాదాల అక్షరాలు:
              </div>
              <div className="grid grid-cols-4 gap-2">
                {report.allFourPadaSyllables.map((p) => (
                  <button
                    key={p.pada}
                    type="button"
                    onClick={() =>
                      setSelectedSyllableFilter(
                        selectedSyllableFilter === p.syllableTe ? 'ALL' : p.syllableTe
                      )
                    }
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      p.isBirthPada
                        ? 'bg-[#C9A96E] text-[#090C18] border-[#C9A96E] font-bold shadow-lg scale-105'
                        : 'bg-[#090C18] text-[#EDE8E0] border-white/15 hover:border-[#C9A96E]/60'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">{p.pada}వ పాదం</div>
                    <div className="text-base font-bold mt-0.5">
                      {p.syllableTe} ({p.syllableEn})
                    </div>
                    {p.isBirthPada && (
                      <div className="text-[9px] font-extrabold uppercase mt-0.5">
                        ★ జన్మ పాదం
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 7 cols: Complete Nakshatra, Rasi, Lagna, Deity & Numerology Matrix */}
          <div className="lg:col-span-7 bg-[#090C18]/90 border border-white/15 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#141932]/90 border border-[#C9A96E]/30">
                <div className="text-[11px] text-[#EDE8E0]/55">జన్మ నక్షత్రం & అధిపతి</div>
                <div className="text-sm font-bold text-[#C9A96E] mt-0.5">
                  {report.nakshatraNameTe} ({report.pada}వ పాదం)
                </div>
                <div className="text-[11px] text-[#5BBFB5] mt-0.5">
                  నక్షత్రాధిపతి: {report.nakshatraLordTe}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141932]/90 border border-[#5BBFB5]/30">
                <div className="text-[11px] text-[#EDE8E0]/55">జన్మ రాశి (Moon Sign)</div>
                <div className="text-sm font-bold text-[#EDE8E0] mt-0.5">
                  {report.rasiNameTe}
                </div>
                <div className="text-[11px] text-[#C9A96E] mt-0.5">
                  రాశ్యాధిపతి: {report.rasiLordTe}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141932]/90 border border-white/10">
                <div className="text-[11px] text-[#EDE8E0]/55">జన్మ లగ్నం (Ascendant)</div>
                <div className="text-sm font-bold text-[#EDE8E0] mt-0.5">
                  {report.lagnaNameTe}
                </div>
                <div className="text-[11px] text-[#9B8FD4] mt-0.5">
                  లగ్నాధిపతి: {report.lagnaLordTe}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141932]/90 border border-white/10">
                <div className="text-[11px] text-[#EDE8E0]/55">నక్షత్ర అధిదేవత (Deity)</div>
                <div className="text-xs font-bold text-[#5BBFB5] mt-0.5">
                  {report.nakshatraDeityTe}
                </div>
                <div className="text-[11px] text-[#EDE8E0]/65 mt-0.5">
                  తత్వం: {report.tattvamTe}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141932]/90 border border-white/10">
                <div className="text-[11px] text-[#EDE8E0]/55">గణం · యోని · నాడి</div>
                <div className="text-xs font-bold text-[#EDE8E0] mt-0.5">
                  {report.ganamTe}
                </div>
                <div className="text-[11px] text-[#C9A96E] mt-0.5">
                  {report.yoniTe} · {report.nadiTe}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141932]/90 border border-[#9B8FD4]/35">
                <div className="text-[11px] text-[#EDE8E0]/55">సంఖ్యాశాస్త్రం (Numerology)</div>
                <div className="text-xs font-bold text-[#9B8FD4] mt-0.5">
                  మూలాంకం: {report.mulankNumber} · భాగ్యాంకం: {report.bhagyankNumber}
                </div>
                <div className="text-[11px] text-[#5BBFB5] mt-0.5 font-mono-tabular">
                  శుభ సంఖ్యలు: {report.luckyNameNumbers.join(', ')}
                </div>
              </div>
            </div>

            {/* Rasi 9 Syllables & Secondary Trikona Rasi Syllables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#141932]/60 border border-[#C9A96E]/30 space-y-1.5">
                <div className="text-xs font-bold text-[#C9A96E]">
                  {report.rasiNameTe} పూర్తి 9 పాదాల అక్షరాలు (Rasi Syllables):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {report.rasiAllSyllablesTe.map((syl) => (
                    <button
                      key={syl}
                      type="button"
                      onClick={() =>
                        setSelectedSyllableFilter(selectedSyllableFilter === syl ? 'ALL' : syl)
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                        syl === report.exactPadaSyllableTe
                          ? 'bg-[#C9A96E] text-[#090C18] border-[#C9A96E]'
                          : selectedSyllableFilter === syl
                            ? 'bg-[#5BBFB5] text-[#090C18] border-[#5BBFB5]'
                            : 'bg-[#090C18] text-[#EDE8E0] border-white/15 hover:border-[#C9A96E]'
                      }`}
                    >
                      {syl}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#EDE8E0]/65">
                  జన్మ నక్షత్ర అక్షరాలతో పాటు జన్మ రాశిలోని ఈ అక్షరాలతో కూడా వ్యవహార నామం పెట్టవచ్చు.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141932]/60 border border-[#5BBFB5]/30 space-y-1.5">
                <div className="text-xs font-bold text-[#5BBFB5]">
                  పంచమ త్రికోణ మిత్ర రాశి ({report.secondaryLuckyRasiNameTe}) అక్షరాలు:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {report.secondaryLuckySyllablesTe.map((syl) => (
                    <span
                      key={syl}
                      className="px-2 py-1 rounded-md bg-[#090C18] border border-white/10 text-xs text-[#EDE8E0]/85 font-semibold"
                    >
                      {syl}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#EDE8E0]/65">
                  జన్మ రాశికి 5వ కోణ రాశి అక్షరాలు వ్యాపార / ఆధునిక వ్యవహార నామాలకు శుభప్రదం.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. SIX CLASSICAL VEDIC ASHRAYA PILLARS (ఏయే ఆశ్రయాలతో పేర్లు పెట్టాలి?) */}
      {/* ===================================================================== */}
      <section className="bg-[#0F1326] border border-[#C9A96E]/40 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
            <BookOpen className="w-4 h-4" />
            <span>ఆశ్వలాయన గృహ్యసూత్రం · ముహూర్త చింతామణి · చూడామణి చక్ర ప్రమాణం</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDE8E0] mt-1">
            ఏయే ఆశ్రయాలతో పేర్లు పెట్టాలి? (6 శాస్త్రీయ నామకరణ ఆశ్రయ సిద్ధాంతాలు)
          </h2>
          <p className="text-xs text-[#EDE8E0]/70 mt-1">
            కేవలం మొదటి అక్షరం మాత్రమే కాకుండా, శిశువుకు ఆయురారోగ్యాలు, రాజయోగం మరియు అదృష్టం కలగడానికి మహర్షులు నిర్దేశించిన 6 నామ ఆశ్రయాలు:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.ashrayaPillars.map((pillar) => (
            <div
              key={pillar.id}
              className="bg-[#090C18]/90 border border-[#C9A96E]/30 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-[#C9A96E]/70 transition-colors"
            >
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#C9A96E] leading-snug">
                  {pillar.titleTe}
                </div>
                <div className="text-[10px] font-mono-tabular text-[#5BBFB5]">
                  {pillar.subtitleEn}
                </div>
                <div className="p-2 rounded-lg bg-[#141932] border border-[#C9A96E]/25 text-[11px] font-semibold text-[#C9A96E]">
                  “{pillar.sanskritRuleTe}”
                </div>
                <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
                  {pillar.explanationTe}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="text-[11px] font-bold text-[#5BBFB5]">
                  ★ {pillar.specificRecommendationTe}
                </div>
                {pillar.examplesTe.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pillar.examplesTe.map((ex, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#141932] border border-white/10 text-[11px] text-[#EDE8E0] font-semibold"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. INTERACTIVE CUSTOM NAME VALIDATOR (మీరు అనుకున్న పేరు పరీక్షించండి) */}
      {/* ===================================================================== */}
      <section className="bg-gradient-to-r from-[#141932] via-[#0F1326] to-[#141932] border-2 border-[#5BBFB5]/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-bold text-[#5BBFB5] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>ప్రత్యక్ష నామ పరీక్షా యంత్రం (Live Vedic & Numerology Name Tester)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#EDE8E0] mt-1">
              మీరు అనుకున్న పేరును ఇక్కడ టైప్ చేసి శాస్త్ర సమ్మతమో కాదో పరీక్షించండి
            </h2>
          </div>

          <div className="w-full md:w-96 relative">
            <input
              type="text"
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              placeholder={
                gender === 'male'
                  ? 'ఉదా: చరణ్ తేజ్ లేదా Charan Tej అని టైప్ చేయండి...'
                  : 'ఉదా: లాస్య శ్రీ లేదా Lasya Sri అని టైప్ చేయండి...'
              }
              className="w-full bg-[#090C18] border-2 border-[#5BBFB5]/60 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            />
            <Search className="w-4 h-4 text-[#5BBFB5] absolute right-3.5 top-3" />
          </div>
        </div>

        {customValidation ? (
          <div className="bg-[#090C18]/90 border border-[#5BBFB5]/40 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-[#EDE8E0]/65">పరీక్షించిన పేరు:</div>
                <div className="text-xl font-bold text-[#C9A96E]">
                  “{customValidation.inputName}” — {customValidation.verdictTitleTe}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 rounded-xl bg-[#141932] border border-[#C9A96E]/40 text-center">
                  <div className="text-[10px] text-[#EDE8E0]/60">శాస్త్ర సమన్వయ స్కోరు</div>
                  <div className="text-lg font-mono-tabular font-bold text-[#5BBFB5]">
                    {customValidation.scoreOutOf100} / 100
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#141932] border border-[#9B8FD4]/40 text-center">
                  <div className="text-[10px] text-[#EDE8E0]/60">Chaldean నామ సంఖ్య</div>
                  <div className="text-lg font-mono-tabular font-bold text-[#9B8FD4]">
                    {customValidation.chaldeanSingleDigit} (మొత్తం: {customValidation.chaldeanTotal})
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              {customValidation.detailedFeedbackTe.map((fb, idx) => (
                <div key={idx} className="text-xs text-[#EDE8E0]/90 leading-relaxed">
                  {fb}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#EDE8E0]/65">
            💡 పైన ఉన్న బాక్స్‌లో మీరు పెట్టాలనుకుంటున్న పేరును తెలుగులో లేదా ఇంగ్లీషులో టైప్ చేయండి — జన్మ నక్షత్ర పాద అక్షరం, గృహ్యసూత్ర అక్షర సంఖ్య మరియు సంఖ్యాశాస్త్ర (Numerology) ఫలితం వెంటనే కనిపిస్తుంది.
          </p>
        )}
      </section>

      {/* ===================================================================== */}
      {/* 5. CURATED BOY & GIRL NAMES TREASURY FOR THIS BIRTH STAR & RASI       */}
      {/* ===================================================================== */}
      <section className="bg-[#0F1326] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A96E]">
              <Star className="w-4 h-4" />
              <span>
                {report.nakshatraNameTe} ({report.pada}వ పాదం) & {report.rasiNameTe} శుభ నామముల జాబితా
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDE8E0] mt-1">
              {gender === 'male'
                ? `👦 అబ్బాయి (పురుష శిశువు) శాస్త్రీయ పేర్లు — "${report.exactPadaSyllableTe}" మరియు రాశి అక్షరాలతో`
                : `👧 అమ్మాయి (స్త్రీ శిశువు) శాస్త్రీయ పేర్లు — "${report.exactPadaSyllableTe}" మరియు రాశి అక్షరాలతో`}
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSyllableFilter}
              onChange={(e) => setSelectedSyllableFilter(e.target.value)}
              className="bg-[#090C18] border border-[#C9A96E]/45 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] font-semibold"
            >
              <option value="ALL">అన్ని అనుకూల అక్షరాలు ({report.rasiAllSyllablesTe.join(', ')})</option>
              <option value={report.exactPadaSyllableTe}>
                ★ జన్మ పాద అక్షరం మాత్రమే (“{report.exactPadaSyllableTe}”)
              </option>
              {report.allFourPadaSyllables.map((s) => (
                <option key={s.pada} value={s.syllableTe}>
                  {s.pada}వ పాదం — “{s.syllableTe}” ({s.syllableEn})
                </option>
              ))}
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-[#090C18] border border-[#5BBFB5]/45 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] font-semibold"
            >
              <option value="ALL">అన్ని ఆశ్రయ వర్గాలు (All 4 Ashraya Themes)</option>
              <option value="దేవతా ఆశ్రయం (Divine/Deity)">దేవతా ఆశ్రయం (Divine/Deity)</option>
              <option value="వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)">వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)</option>
              <option value="ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)">ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)</option>
              <option value="రాజస & విజయ ఆశ్రయం (Royal/Victory)">రాజస & విజయ ఆశ్రయం (Royal/Victory)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNames.map((item, idx) => {
            const isLuckyNum = report.luckyNameNumbers.includes(item.numerologyNumber);
            return (
              <div
                key={`${item.nameEn}-${idx}`}
                className={`rounded-xl p-4 border flex flex-col justify-between space-y-3 transition-all ${
                  item.isExactPadaMatch
                    ? 'bg-gradient-to-br from-[#161C38] to-[#0B0E1D] border-[#C9A96E]/60 shadow-lg'
                    : 'bg-[#090C18]/90 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isExactPadaMatch
                          ? 'bg-[#C9A96E] text-[#090C18]'
                          : 'bg-[#5BBFB5]/20 text-[#5BBFB5]'
                      }`}
                    >
                      అక్షరం: “{item.syllableTe}” ({item.syllableEn})
                    </span>
                    <span className="text-[10px] text-[#EDE8E0]/60 font-semibold">
                      {item.ashrayaCategoryTe.split('(')[0].trim()}
                    </span>
                  </div>

                  <div className="pt-1">
                    <div className="text-lg font-bold text-[#EDE8E0]">
                      {item.nameTe}
                    </div>
                    <div className="text-xs font-mono-tabular text-[#C9A96E] font-semibold">
                      {item.nameEn}
                    </div>
                  </div>

                  <p className="text-xs text-[#EDE8E0]/80 leading-relaxed pt-1">
                    <strong className="text-[#5BBFB5]">అర్థం:</strong> {item.meaningTe}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[#EDE8E0]/75">
                      {item.aksharaCount} అక్షరాలు
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono-tabular font-bold ${
                        isLuckyNum
                          ? 'bg-[#5BBFB5]/20 text-[#5BBFB5]'
                          : 'bg-white/5 text-[#EDE8E0]/65'
                      }`}
                    >
                      సంఖ్య: {item.numerologyNumber} {isLuckyNum ? '✓' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomNameInput(item.nameEn)}
                      className="px-2 py-1 rounded bg-[#141932] hover:bg-white/10 text-[#5BBFB5] border border-[#5BBFB5]/30 text-[10px] font-bold cursor-pointer"
                    >
                      పరీక్షించు
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyNameToJathakam(item)}
                      className="px-2 py-1 rounded bg-[#C9A96E]/20 hover:bg-[#C9A96E] hover:text-[#090C18] text-[#C9A96E] border border-[#C9A96E]/40 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      జాతకానికి పెట్టు
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. COMPLETE 27 NAKSHATRA 108 PADA AKSHARA REFERENCE CHUDAMANI TABLE   */}
      {/* ===================================================================== */}
      <section className="bg-[#0F1326] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#EDE8E0]">
              27 నక్షత్రాలు — 108 పాదాల చూడామణి నామాక్షర పట్టిక (Complete Chudamani Chakra)
            </h2>
            <p className="text-xs text-[#EDE8E0]/65">
              మీ శిశువు జన్మ నక్షత్రం బంగారు రంగులో హైలైట్ చేయబడింది
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {TELUGU_NAKSHATRAS.map((nak) => {
            const isBirthNak = nak.index === report.nakshatraIndex;
            const isSelectedRef = selectedReferenceNakshatraIdx === nak.index;
            return (
              <div
                key={nak.index}
                onClick={() =>
                  setSelectedReferenceNakshatraIdx(isSelectedRef ? null : nak.index)
                }
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isBirthNak
                    ? 'bg-[#C9A96E]/20 border-2 border-[#C9A96E] shadow-lg'
                    : 'bg-[#090C18]/80 border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#EDE8E0]">
                    {nak.index + 1}. {nak.nameTe}
                  </span>
                  <span className="text-[10px] text-[#C9A96E] font-semibold">
                    {nak.lordTe}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {nak.padasTe.map((syl, pIdx) => {
                    const isExactBirthPada = isBirthNak && pIdx + 1 === report.pada;
                    return (
                      <div
                        key={pIdx}
                        className={`text-center py-1 rounded text-xs font-bold ${
                          isExactBirthPada
                            ? 'bg-[#C9A96E] text-[#090C18]'
                            : 'bg-[#141932] text-[#5BBFB5]'
                        }`}
                      >
                        {syl}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. VEDIC NAMAKARANA CEREMONY MUHURTA & SANKALPAM GUIDE                */}
      {/* ===================================================================== */}
      <section className="bg-gradient-to-b from-[#141932] to-[#090C18] border border-[#C9A96E]/45 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#C9A96E] uppercase tracking-wider">
          <Flame className="w-4 h-4" />
          <span>వైదిక నామకరణ మహోత్సవ విధి విధానం (Ceremonial Procedure & Sankalpam)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#090C18]/90 border border-white/10 space-y-1.5">
            <div className="text-xs font-bold text-[#5BBFB5]">1. శుభ దినములు & ముహూర్తం</div>
            <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
              {report.ceremonyDaysTe}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090C18]/90 border border-[#C9A96E]/35 space-y-1.5">
            <div className="text-xs font-bold text-[#C9A96E]">2. నామకరణ సంకల్ప మంత్రం</div>
            <p className="text-xs text-[#EDE8E0]/90 leading-relaxed font-semibold">
              “{report.sankalpamMantraTe}”
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090C18]/90 border border-white/10 space-y-1.5">
            <div className="text-xs font-bold text-[#9B8FD4]">3. బియ్యంలో రాసి చెవిలో పలికే విధానం</div>
            <p className="text-xs text-[#EDE8E0]/85 leading-relaxed">
              {report.whisperEarProcedureTe}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
