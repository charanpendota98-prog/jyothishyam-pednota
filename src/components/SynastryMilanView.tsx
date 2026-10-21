import React, { useState } from 'react';
import {
  calculateSynastryComparison,
  type BirthInput,
  type ZodiacTradition,
} from '../engine/ephemeris.ts';
import {
  STATE_DISTRICT_ATLAS,
  TELUGU_RASIS,
  type AppLanguage,
} from '../engine/teluguJathakam.ts';
import { SouthIndianKundaliSvg } from './ChartsSvg.tsx';

interface SynastryMilanProps {
  primaryInput: BirthInput;
  savedProfiles: BirthInput[];
  tradition: ZodiacTradition;
  lang?: AppLanguage;
}

const KOOTA_TELUGU_NAMES: Record<string, string> = {
  Varna: '1. వర్ణ కూటమి (Varna - 1 గుణం)',
  Vashya: '2. వశ్య కూటమి (Vashya - 2 గుణములు)',
  'Tara (Dina)': '3. తార / దిన కూటమి (Tara - 3 గుణములు)',
  Yoni: '4. యోని కూటమి (Yoni - 4 గుణములు)',
  'Graha Maitri': '5. గ్రహ మైత్రి కూటమి (Maitri - 5 గుణములు)',
  Gana: '6. గణ కూటమి (Gana - 6 గుణములు)',
  Bhakoot: '7. రాశి / భకూటమి (Bhakoot - 7 గుణములు)',
  Nadi: '8. నాడీ కూటమి (Nadi - 8 గుణములు)',
};

export const SynastryMilanView: React.FC<SynastryMilanProps> = ({
  primaryInput,
  savedProfiles,
  tradition,
  lang = 'te',
}) => {
  const defaultPartner =
    savedProfiles.find((p) => p.name !== primaryInput.name) ?? {
      id: 'partner-default',
      name: 'శ్రీమతి లక్ష్మీ ప్రసన్న (Smt. Lakshmi Prasanna)',
      date: '1995-08-14',
      time: '09:30',
      lat: 16.5062,
      lng: 80.6480,
      tzOffsetHours: 5.5,
      city: 'విజయవాడ (NTR District)',
      country: 'ఆంధ్రప్రదేశ్, భారతదేశం',
      ayanamsa: primaryInput.ayanamsa,
      houseSystem: primaryInput.houseSystem,
    };

  const [partnerInput, setPartnerInput] = useState<BirthInput>(defaultPartner);
  const [partnerStateId, setPartnerStateId] = useState<string>('andhra_pradesh');
  const [partnerDistrictId, setPartnerDistrictId] = useState<string>('ap_ntr_vijayawada');

  const activePartnerState =
    STATE_DISTRICT_ATLAS.find((s) => s.id === partnerStateId) ?? STATE_DISTRICT_ATLAS[0];

  const handlePartnerStateChange = (newStateId: string) => {
    setPartnerStateId(newStateId);
    const st = STATE_DISTRICT_ATLAS.find((s) => s.id === newStateId);
    if (st && st.districts.length > 0) {
      const firstDist = st.districts[0];
      setPartnerDistrictId(firstDist.id);
      setPartnerInput((prev) => ({
        ...prev,
        city: `${firstDist.nameTe} (${firstDist.nameEn})`,
        country: `${st.nameTe.split(' ')[0]}, ${st.countryTe}`,
        lat: firstDist.lat,
        lng: firstDist.lng,
        tzOffsetHours: firstDist.tzOffsetHours,
      }));
    }
  };

  const handlePartnerDistrictChange = (newDistId: string) => {
    setPartnerDistrictId(newDistId);
    const dist = activePartnerState.districts.find((d) => d.id === newDistId);
    if (dist) {
      setPartnerInput((prev) => ({
        ...prev,
        city: `${dist.nameTe} (${dist.nameEn})`,
        country: `${activePartnerState.nameTe.split(' ')[0]}, ${activePartnerState.countryTe}`,
        lat: dist.lat,
        lng: dist.lng,
        tzOffsetHours: dist.tzOffsetHours,
      }));
    }
  };

  const synastry = calculateSynastryComparison(primaryInput, partnerInput, tradition);
  const { ashtaKoota, interAspects, compositePlanets, chartA, chartB } = synastry;

  return (
    <div className="space-y-10">
      {/* Partner Selection & State/District Input Bar */}
      <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-display font-bold text-[#EDE8E0]">
              అష్టకూట వివాహ పొందిక & Synastry — <span className="text-[#C9A96E]">36 గుణముల వధూవర జాతక పరిశీలన</span>
            </h2>
            <p className="text-xs text-[#EDE8E0]/65 mt-1">
              వధూవరుల జన్మ నక్షత్ర, రాశి, నాడి, రజ్జు మరియు కుజ దోష సామ్య పరిశీలన (రాష్ట్రం & జిల్లా ఎంపికతో).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[#EDE8E0]/60">సేవ్ చేసిన ప్రొఫైల్:</label>
            <select
              value={partnerInput.id || ''}
              onChange={(e) => {
                const prof = savedProfiles.find((p) => p.id === e.target.value);
                if (prof) setPartnerInput(prof);
              }}
              className="bg-[#090C18] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            >
              {savedProfiles.map((prof) => (
                <option key={prof.id || prof.name} value={prof.id}>
                  {prof.name} ({prof.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Partner B Editor Form with State & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-5">
          <div>
            <label className="block text-xs text-[#EDE8E0]/65 mb-1">
              వధువు / వరుని పేరు (Partner Name)
            </label>
            <input
              type="text"
              value={partnerInput.name}
              onChange={(e) => setPartnerInput({ ...partnerInput, name: e.target.value })}
              className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#EDE8E0]/65 mb-1">
              పుట్టిన తేదీ (Birth Date)
            </label>
            <input
              type="date"
              value={partnerInput.date}
              onChange={(e) => setPartnerInput({ ...partnerInput, date: e.target.value })}
              className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#EDE8E0]/65 mb-1">
              పుట్టిన సమయం (Birth Time)
            </label>
            <input
              type="time"
              value={partnerInput.time}
              onChange={(e) => setPartnerInput({ ...partnerInput, time: e.target.value })}
              className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tabular text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#EDE8E0]/65 mb-1">
              రాష్ట్రం / దేశం (State)
            </label>
            <select
              value={partnerStateId}
              onChange={(e) => handlePartnerStateChange(e.target.value)}
              className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            >
              {STATE_DISTRICT_ATLAS.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.nameTe}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#EDE8E0]/65 mb-1">
              జిల్లా / పట్టణం (District)
            </label>
            <select
              value={partnerDistrictId}
              onChange={(e) => handlePartnerDistrictChange(e.target.value)}
              className="w-full bg-[#090C18] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#EDE8E0] focus:outline-none focus:border-[#C9A96E]"
            >
              {activePartnerState.districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameTe} ({d.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Side-by-Side Dual Telugu South Indian Rasi Kundali Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-mono-tabular text-[#C9A96E]">వరుడు / జాతకుడు A</span>
              <h3 className="text-lg font-bold text-[#EDE8E0]">{chartA.input.name}</h3>
            </div>
            <div className="text-right text-xs text-[#EDE8E0]/75">
              <div>లగ్నం: {TELUGU_RASIS[chartA.ascendant.signIndex].nameTe}</div>
              <div>జన్మ నక్షత్రం: {chartA.panchanga.nakshatra.name} ({chartA.panchanga.nakshatra.pada}వ పాదం)</div>
            </div>
          </div>
          <SouthIndianKundaliSvg
            chart={chartA}
            division="D1"
            selectedPlanetId={null}
            onSelectPlanet={() => {}}
            lang={lang}
          />
        </div>

        <div className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-mono-tabular text-[#5BBFB5]">వధువు / భాగస్వామి B</span>
              <h3 className="text-lg font-bold text-[#EDE8E0]">{chartB.input.name}</h3>
            </div>
            <div className="text-right text-xs text-[#EDE8E0]/75">
              <div>లగ్నం: {TELUGU_RASIS[chartB.ascendant.signIndex].nameTe}</div>
              <div>జన్మ నక్షత్రం: {chartB.panchanga.nakshatra.name} ({chartB.panchanga.nakshatra.pada}వ పాదం)</div>
            </div>
          </div>
          <SouthIndianKundaliSvg
            chart={chartB}
            division="D1"
            selectedPlanetId={null}
            onSelectPlanet={() => {}}
            lang={lang}
          />
        </div>
      </div>

      {/* Vedic Ashta Koota 36-Guna Breakdown */}
      <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-display font-bold text-[#EDE8E0]">
              అష్టకూట వివాహ పొందిక పట్టిక — <span className="text-[#C9A96E]">36 గుణముల నిర్ణయం</span>
            </h3>
            <p className="text-xs text-[#EDE8E0]/65 mt-1">
              కుజ దోష పరిశీలన: {ashtaKoota.manglikCancellation}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono-tabular font-bold text-[#C9A96E]">
              {ashtaKoota.totalScored} <span className="text-sm font-normal text-[#EDE8E0]/55">/ 36 గుణములు</span>
            </div>
            <div className="text-xs font-bold text-[#5BBFB5]">
              {ashtaKoota.totalScored >= 26
                ? 'ఉత్తమ పొందిక (శ్రేష్ఠమైన వివాహ యోగ్యత)'
                : ashtaKoota.totalScored >= 18
                  ? 'మధ్యమ పొందిక (వివాహ యోగ్యము)'
                  : 'శాంతి అవసరము (తక్కువ గుణములు)'}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#090C18] text-xs text-[#EDE8E0]/60">
                <th className="py-3 px-3">కూటమి పేరు (Koota)</th>
                <th className="py-3 px-3">{chartA.input.name}</th>
                <th className="py-3 px-3">{chartB.input.name}</th>
                <th className="py-3 px-3">ప్రయోజనం / వివరణ</th>
                <th className="py-3 px-3 text-right">వచ్చిన గుణములు</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {ashtaKoota.items.map((item) => (
                <tr key={item.koota} className="hover:bg-white/5">
                  <td className="py-3 px-3 font-bold text-[#EDE8E0]">
                    {KOOTA_TELUGU_NAMES[item.koota] ?? item.koota}
                  </td>
                  <td className="py-3 px-3 font-mono-tabular text-[#EDE8E0]/85">
                    {item.personAValue}
                  </td>
                  <td className="py-3 px-3 font-mono-tabular text-[#EDE8E0]/85">
                    {item.personBValue}
                  </td>
                  <td className="py-3 px-3 text-[#EDE8E0]/65">{item.description}</td>
                  <td className="py-3 px-3 font-mono-tabular text-right font-bold text-[#C9A96E]">
                    {item.scoredPoints} / {item.maxPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Western Synastry Inter-Chart Aspects & Composite Midpoint Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
          <div className="pb-4 border-b border-white/10">
            <h3 className="text-xl font-display font-bold text-[#EDE8E0]">
              ఇరువురి గ్రహ దృష్టి సంబంధాలు (Synastry Aspects)
            </h3>
          </div>
          <div className="overflow-x-auto pt-3 max-h-[380px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono-tabular text-[#EDE8E0]/55">
                  <th className="py-2 px-2">జాతకుడు A</th>
                  <th className="py-2 px-2">దృష్టి / కోణం</th>
                  <th className="py-2 px-2">భాగస్వామి B</th>
                  <th className="py-2 px-2 text-right">Orb</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {interAspects.slice(0, 14).map((asp, i) => (
                  <tr key={`inter-aspect-${asp.planet1}-${asp.planet2}-${asp.type}-${i}`} className="hover:bg-white/5">
                    <td className="py-2.5 px-2 font-medium text-[#EDE8E0]">
                      {asp.glyph1} {asp.planet1}
                    </td>
                    <td className="py-2.5 px-2 font-mono-tabular">
                      <span
                        className={
                          asp.nature === 'Harmonious'
                            ? 'text-[#5BBFB5]'
                            : asp.nature === 'Dynamic'
                              ? 'text-[#D47B7B]'
                              : 'text-[#C9A96E]'
                        }
                      >
                        {asp.symbol} {asp.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-medium text-[#EDE8E0]">
                      {asp.glyph2} {asp.planet2}
                    </td>
                    <td className="py-2.5 px-2 font-mono-tabular text-right text-[#EDE8E0]/75">
                      {asp.orb.toFixed(2)}°
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
          <div className="pb-4 border-b border-white/10">
            <h3 className="text-xl font-display font-bold text-[#EDE8E0]">
              ఉమ్మడి మధ్యబిందు కుండలి (Composite Chart)
            </h3>
          </div>
          <div className="overflow-x-auto pt-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono-tabular text-[#EDE8E0]/55">
                  <th className="py-2 px-2">గ్రహం</th>
                  <th className="py-2 px-2">రాశి & డిగ్రీలు</th>
                  <th className="py-2 px-2 text-right">భావం</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {compositePlanets.map((cp) => (
                  <tr key={cp.name} className="hover:bg-white/5">
                    <td className="py-2.5 px-2 font-medium text-[#EDE8E0]">
                      {cp.glyph} Composite {cp.name}
                    </td>
                    <td className="py-2.5 px-2 font-mono-tabular text-[#C9A96E]">
                      {cp.signGlyph} {cp.signName} {cp.formattedDMS}
                    </td>
                    <td className="py-2.5 px-2 font-mono-tabular text-right text-[#EDE8E0]/75">
                      {cp.house}వ భావం
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
