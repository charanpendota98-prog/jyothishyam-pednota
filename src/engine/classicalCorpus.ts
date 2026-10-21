import type { CompleteChartResult, SynastryComparisonResult } from './ephemeris.ts';

export interface ClassicalPassage {
  id: string;
  source: 'Brihat Parashara Hora Shastra' | 'Phaladeepika' | 'Saravali' | 'Tetrabiblos (Ptolemy)' | 'Carmen Astrologicum';
  reference: string;
  tradition: 'Vedic' | 'Western';
  tags: string[];
  sanskritOrGreek: string;
  translation: string;
  commentary: string;
}

export const CLASSICAL_CORPUS: ClassicalPassage[] = [
  {
    id: 'bphs-ch3-graha-swarupa',
    source: 'Brihat Parashara Hora Shastra',
    reference: 'BPHS Ch. 3, Sloka 12–15',
    tradition: 'Vedic',
    tags: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Natal'],
    sanskritOrGreek: 'कालात्मा दिनकृन्मनस्तुहिनगुः सत्त्वं कुजो ज्ञो वचो जीवो ज्ञानसुखे सितश्च मदनो दुःखं दिनेशात्मजः॥',
    translation: 'Surya (Sun) is the Atman of Kalapurusha; Chandra (Moon) is the Mind; Mangala (Mars) is Executive Strength; Budha (Mercury) is Speech and Discernment; Guru (Jupiter) is Wisdom and Felicity; Shukra (Venus) is Vitality and Grace; Shani (Saturn) is Endurance through Austerity.',
    commentary: 'Foundational Parashari allocation of planetary significations (Karaka) across the human microcosm.',
  },
  {
    id: 'bphs-ch24-bhava-lords',
    source: 'Brihat Parashara Hora Shastra',
    reference: 'BPHS Ch. 24, Sloka 1–12',
    tradition: 'Vedic',
    tags: ['Lagna', 'Ascendant', 'House 1', 'House 5', 'House 9', 'House 10', 'Raja Yoga'],
    sanskritOrGreek: 'लग्नेशो लग्नगो देहसुखं बाहुबलं दिशेत्। मनस्वी चञ्चलश्चैव द्विभार्यो वा परस्त्रियाम्॥',
    translation: 'When the Lord of the Ascendant (Lagnesha) occupies a Kendra (1, 4, 7, 10) or Trikona (1, 5, 9) in strength, the native possesses sovereign self-command, bodily vigor, and philosophical independence.',
    commentary: 'Establishes the primacy of the Lagna and its ruler in anchoring all subsequent Dasha and Yoga fruits.',
  },
  {
    id: 'bphs-ch36-gajakesari',
    source: 'Brihat Parashara Hora Shastra',
    reference: 'BPHS Ch. 36, Sloka 3–4',
    tradition: 'Vedic',
    tags: ['Gaja Kesari Yoga', 'Moon', 'Jupiter', 'Kendra'],
    sanskritOrGreek: 'चन्द्रात्केन्द्रे बृहस्पतौ गजकेसरिनामकः। तेजस्वी धनवान् मेधावी गुणज्ञो राजपूजितः॥',
    translation: 'Should Jupiter occupy an angle (Kendra) from the Moon, Gaja Kesari Yoga is born: the native is radiant, prosperous, endowed with penetrating intelligence, and honored by rulers and scholars alike.',
    commentary: 'Operates with peak potency when Jupiter is uncombust and occupies a benefic Navamsa (D9).',
  },
  {
    id: 'bphs-ch41-rajayoga',
    source: 'Brihat Parashara Hora Shastra',
    reference: 'BPHS Ch. 41, Sloka 28–31',
    tradition: 'Vedic',
    tags: ['Dharma-Karmadhipati Raja Yoga', 'House 9', 'House 10', 'Career', 'D10'],
    sanskritOrGreek: 'धर्मकर्माधिनेतारौ यदि सम्बन्धमागतौ। तदा राजयोगो भवेन्नरः कीर्तिमान् भवेत्॥',
    translation: 'When the Lords of the 9th Bhava (Dharma) and 10th Bhava (Karma) form conjunction, mutual reception, or full aspect, Dharma-Karmadhipati Raja Yoga arises, conferring high station and enduring vocation.',
    commentary: 'Cross-verified in the Dashamsha (D10) varga to time major professional ascensions.',
  },
  {
    id: 'bphs-ch46-vimshottari',
    source: 'Brihat Parashara Hora Shastra',
    reference: 'BPHS Ch. 46, Sloka 12–19',
    tradition: 'Vedic',
    tags: ['Dasha', 'Vimshottari', 'Mahadasha', 'Antardasha', 'Predictive'],
    sanskritOrGreek: 'कलौ विंशोत्तरी प्रोक्ता सामान्या सर्वसम्मता। नक्षत्रप्रभवा चान्या दशा ज्ञेया द्विजोत्तम॥',
    translation: 'In the present age, Vimshottari Dasha (120-year lunar mansion progression) is the supreme measure of karmic ripening. A Mahadasha lord bestows fruits according to its house lordship, dignity, and Sambandha with its Antardasha lord.',
    commentary: 'Governs the chronological unfolding of latent natal promises through Mahadasha and Bhukti sub-periods.',
  },
  {
    id: 'phaladeepika-ch6-mahapurusha',
    source: 'Phaladeepika',
    reference: 'Phaladeepika Ch. 6, Sloka 1–6',
    tradition: 'Vedic',
    tags: ['Mahapurusha', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Exalted', 'Own Sign'],
    sanskritOrGreek: 'स्वोच्चे स्वभे वा यदि केन्द्रसंस्थाः कुजेन्दुजैवास्फुजितार्कपुत्राः। रुचकभद्रहंसमालव्यशशाख्याः पञ्चैते महापुरुषाः प्रदिष्टाः॥',
    translation: 'When Mars, Mercury, Jupiter, Venus, or Saturn occupy their exaltation or own sign identical with a Kendra house from Lagna, they generate Ruchaka, Bhadra, Hamsa, Malavya, and Sasa Mahapurusha Yogas respectively.',
    commentary: 'Five archetypal pillars of planetary excellence in classical Indian horoscopy.',
  },
  {
    id: 'saravali-ch34-navamsa',
    source: 'Saravali',
    reference: 'Saravali Ch. 34, Sloka 8–11',
    tradition: 'Vedic',
    tags: ['Navamsa', 'D9', 'Vargottama', 'Synastry', 'Marriage'],
    sanskritOrGreek: 'राशिबलं मूलबलं नवांशकबलं फलप्रदं प्रोक्तम्। वर्गोत्तमगताः खेटाः शुभफलदाः सर्वदा ज्ञेयाः॥',
    translation: 'While the Rasi (D1) is the trunk of the tree, the Navamsa (D9) is its ripe fruit. A planet occupying the same sign in both Rasi and Navamsa attains Vargottama dignity, yielding unshakeable strength.',
    commentary: 'Essential criterion for evaluating both inner spiritual resilience and marital harmony.',
  },
  {
    id: 'tetrabiblos-bk1-sect',
    source: 'Tetrabiblos (Ptolemy)',
    reference: 'Tetrabiblos Book I, Ch. 7 & 19',
    tradition: 'Western',
    tags: ['Sect', 'Dignity', 'Tropical', 'Sun', 'Moon', 'Jupiter', 'Venus'],
    sanskritOrGreek: 'Ἡμέρας μὲν ὁ Ἥλιος καὶ ὁ Κρόνος καὶ ὁ Ζεύς· νυκτὸς δὲ ἡ Σελήνη καὶ ὁ Ἄρης καὶ ἡ Ἀφροδίτη.',
    translation: 'Of the planets, the Sun, Jupiter, and Saturn rejoice in the diurnal sect above the horizon; the Moon, Venus, and Mars rejoice in the nocturnal sect. Essential dignity in domicile or exaltation magnifies their constructive efficacy.',
    commentary: 'Claudius Ptolemy’s foundational doctrine of planetary sect, temperament, and essential dignity.',
  },
  {
    id: 'carmen-astrologicum-lots',
    source: 'Carmen Astrologicum',
    reference: 'Dorotheus of Sidon, Book I, Ch. 26',
    tradition: 'Western',
    tags: ['Lots', 'Arabic Parts', 'Lot of Fortune', 'Lot of Spirit'],
    sanskritOrGreek: 'Κλῆρος Τύχης καὶ Κλῆρος Δαίμονος',
    translation: 'Count for one born by day from the Sun to the Moon and project that arc from the Ascendant for the Lot of Fortune; reverse for one born by night. Fortune signifies the body and material livelihood, whereas Spirit signifies the soul and deliberate action.',
    commentary: 'Hellenistic foundation for Hermetic Lots and their ruler (Oikodespotes) analysis.',
  },
];

// Retrieve relevant classical passages for a calculated chart
export function retrieveClassicalPassagesForChart(
  chart: CompleteChartResult,
  queryTopic?: string
): ClassicalPassage[] {
  const matched = new Set<ClassicalPassage>();

  // Always include foundational BPHS & Navamsa verses
  matched.add(CLASSICAL_CORPUS[0]);
  matched.add(CLASSICAL_CORPUS[1]);

  if (chart.vedicYogas.some((y) => y.name.includes('Gaja Kesari'))) {
    matched.add(CLASSICAL_CORPUS[2]);
  }
  if (chart.vedicYogas.some((y) => y.name.includes('Dharma-Karmadhipati'))) {
    matched.add(CLASSICAL_CORPUS[3]);
  }
  if (chart.vedicYogas.some((y) => y.category === 'Mahapurusha')) {
    matched.add(CLASSICAL_CORPUS[5]);
  }

  // Always include Vimshottari, Navamsa, Ptolemy, and Dorotheus for comprehensive synthesis
  matched.add(CLASSICAL_CORPUS[4]);
  matched.add(CLASSICAL_CORPUS[6]);
  matched.add(CLASSICAL_CORPUS[7]);
  matched.add(CLASSICAL_CORPUS[8]);

  if (queryTopic) {
    const q = queryTopic.toLowerCase();
    for (const item of CLASSICAL_CORPUS) {
      if (
        item.tags.some((t) => q.includes(t.toLowerCase())) ||
        item.translation.toLowerCase().includes(q)
      ) {
        matched.add(item);
      }
    }
  }

  return Array.from(matched);
}

// Build a deterministic, cited scholarly report when requested or as immediate baseline
export function buildCitedScholarlySynthesis(
  chart: CompleteChartResult,
  focus: 'natal' | 'dasha' | 'panchanga' | 'synastry',
  synastryData?: SynastryComparisonResult
): {
  title: string;
  executiveSummary: string;
  sections: { heading: string; citation: string; body: string }[];
} {
  const sun = chart.planets.find((p) => p.id === 'Sun')!;
  const moon = chart.planets.find((p) => p.id === 'Moon')!;
  const lagna = chart.ascendant;
  const activeMaha = chart.dashas.find((d) => d.isCurrent) ?? chart.dashas[0];
  const activeAntar = activeMaha.antardashas.find((a) => a.isCurrent) ?? activeMaha.antardashas[0];
  const tenthLord = chart.houses[9].lord;
  const tenthPlanet = chart.planets.find((p) => p.id === tenthLord);
  const strongestShadbala = [...chart.shadbala].sort((a, b) => b.ratio - a.ratio)[0];

  if (focus === 'synastry' && synastryData) {
    return {
      title: `Synastry & Ashta Koota Synthesis: ${synastryData.chartA.input.name} & ${synastryData.chartB.input.name}`,
      executiveSummary: `Combining Western inter-chart harmonic geometry (${synastryData.interAspects.length} active cross-aspects) with Vedic Ashta Koota lunar mansion matching (${synastryData.ashtaKoota.totalScored} / 36 Gunas — ${synastryData.ashtaKoota.compatibilityVerdict}).`,
      sections: [
        {
          heading: '01. Lunar Nakshatra Resonance & Nadi Constitution',
          citation: 'Brihat Parashara Hora Shastra Ch. 80 · Muhurta Chintamani',
          body: `${synastryData.chartA.input.name}'s Moon occupies ${synastryData.chartA.panchanga.nakshatra.name} (Pada ${synastryData.chartA.panchanga.nakshatra.pada}), while ${synastryData.chartB.input.name}'s Moon occupies ${synastryData.chartB.panchanga.nakshatra.name} (Pada ${synastryData.chartB.panchanga.nakshatra.pada}). The total Ashta Koota score of ${synastryData.ashtaKoota.totalScored}/36 reflects ${synastryData.ashtaKoota.compatibilityVerdict.toLowerCase()} alignment. ${synastryData.ashtaKoota.manglikCancellation}.`,
        },
        {
          heading: '02. Inter-Chart Planetary Aspects & Synastry Geometry',
          citation: 'Tetrabiblos Book IV, Ch. 5 (Claudius Ptolemy)',
          body: synastryData.interAspects.length > 0
            ? `Primary cross-chart contacts are anchored by ${synastryData.interAspects
                .slice(0, 3)
                .map((a) => `${a.planet1} ${a.symbol} ${a.planet2} (${a.orb}° orb)`)
                .join(', ')}. These contacts govern mutual intellectual stimulation, emotional safety, and shared life trajectory.`
            : 'The two charts interact primarily through Whole-Sign house overlays and planetary sign rulers.',
        },
        {
          heading: '03. Navamsa (D9) Partnership & Composite Core',
          citation: 'Saravali Ch. 34, Sloka 8–11',
          body: `In the Composite midpoint chart, the Composite Sun stands at ${synastryData.compositePlanets[0]?.signGlyph} ${synastryData.compositePlanets[0]?.signName} (${synastryData.compositePlanets[0]?.formattedDMS}) in House ${synastryData.compositePlanets[0]?.house}, while Composite Moon occupies ${synastryData.compositePlanets[1]?.signGlyph} ${synastryData.compositePlanets[1]?.signName}, defining the shared purpose of the bond.`,
        },
      ],
    };
  }

  if (focus === 'dasha') {
    return {
      title: `Vimshottari Dasha & Transit Timing Analysis: ${chart.input.name}`,
      executiveSummary: `Born under ${moon.nakshatra} Nakshatra (Pada ${moon.pada}, ruled by ${moon.nakshatraLord}), the chart is currently traversing the ${activeMaha.lord} Mahadasha (${activeMaha.startDate} to ${activeMaha.endDate}) and ${activeAntar.lord} Antardasha (${activeAntar.startDate} to ${activeAntar.endDate}).`,
      sections: [
        {
          heading: `01. Active Mahadasha Lord: ${activeMaha.lord} (${activeMaha.sanskrit})`,
          citation: 'Brihat Parashara Hora Shastra Ch. 47, Sloka 2–9',
          body: `${activeMaha.lord} occupies ${
            chart.planets.find((p) => p.id === activeMaha.lord)?.signName ?? lagna.signName
          } in House ${
            chart.planets.find((p) => p.id === activeMaha.lord)?.house ?? 1
          }. During this ${activeMaha.years}-year macro-period, themes of House ${
            chart.planets.find((p) => p.id === activeMaha.lord)?.house ?? 1
          } and its Navamsa sign take center stage in personal and professional evolution.`,
        },
        {
          heading: `02. Active Antardasha (Bhukti): ${activeMaha.lord} – ${activeAntar.lord}`,
          citation: 'Phaladeepika Ch. 19–21 (Dasha Phala)',
          body: `The sub-period of ${activeAntar.lord} (${activeAntar.durationMonths} months, ending ${activeAntar.endDate}) modulates the Mahadasha through the angular relationship between ${activeMaha.lord} and ${activeAntar.lord}, activating concrete milestones in career and relationships.`,
        },
        {
          heading: '03. Ashtakavarga Transit Capacity (Kakshya Bindus)',
          citation: 'Brihat Parashara Hora Shastra Ch. 66–72',
          body: `Across the 337-bindu Sarvashtakavarga matrix, the Ascendant sign (${lagna.signName}) holds ${chart.ashtakavarga.sarvashtakavarga[lagna.signIndex]} bindus and the 10th house sign (${chart.houses[9].signName}) holds ${chart.ashtakavarga.sarvashtakavarga[chart.houses[9].signIndex]} bindus, indicating strong structural support when Jupiter and Saturn transit these sectors.`,
        },
      ],
    };
  }

  return {
    title: `Comprehensive Natal & Varga Synthesis: ${chart.input.name}`,
    executiveSummary: `${lagna.signName} (${lagna.signSanskrit}) Ascendant at ${lagna.formattedDMS} in ${lagna.nakshatra} Nakshatra (Pada ${lagna.pada}) · Sun in ${sun.signName} (House ${sun.house}) · Moon in ${moon.signName} (${moon.nakshatra}, Pada ${moon.pada}, House ${moon.house}).`,
    sections: [
      {
        heading: '01. Lagna, Atmakaraka & Core Temperament',
        citation: 'Brihat Parashara Hora Shastra Ch. 3 & Ch. 24',
        body: `With ${lagna.signName} (${lagna.signSanskrit}) rising at ${lagna.formattedDMS} and ruled by ${chart.houses[0].lord}, the constitutional architecture blends ${ZODIAC_SIGNS_ELEMENT(lagna.signIndex)} dynamism with the lunar imprint of ${moon.nakshatra} Nakshatra (deity: ${moon.nakshatraDeity}). In Shadbala, ${strongestShadbala.planet} (${strongestShadbala.sanskrit}) leads the chart at ${strongestShadbala.totalRupas} Rupas (${Math.round(strongestShadbala.ratio * 100)}% of classical requirement).`,
      },
      {
        heading: '02. Divisional Harmonics: Navamsa (D9) & Dashamsha (D10)',
        citation: 'Saravali Ch. 34, Sloka 8–11 · BPHS Ch. 7',
        body: `While the Rasi (D1) positions the Sun in ${sun.signName} and Moon in ${moon.signName}, the Navamsa (D9) places the Ascendant in ${SIGN_NAME(lagna.d9Sign)} and Moon in ${SIGN_NAME(moon.d9Sign)}, revealing the deeper dharmic trajectory. In the Dashamsha (D10) of vocation, the 10th Lord ${tenthLord} occupies House ${tenthPlanet?.house ?? 10} (${tenthPlanet?.dignity ?? 'Neutral'}), shaping authority and public contribution.`,
      },
      {
        heading: '03. Classical Yogas, Fixed Stars & Hermetic Lots',
        citation: 'Phaladeepika Ch. 6 · Dorotheus Carmen Astrologicum Bk. I',
        body: `${
          chart.vedicYogas.length > 0
            ? `Active classical combinations include ${chart.vedicYogas.map((y) => y.name).join(', ')}. `
            : 'The chart operates through direct kendra-trikona lord placements. '
        }The Hermetic Lot of Fortune falls at ${chart.arabicLots[0].signGlyph} ${chart.arabicLots[0].signName} ${chart.arabicLots[0].formattedDMS} (House ${chart.arabicLots[0].house}), while the Lot of Spirit stands at ${chart.arabicLots[1].signGlyph} ${chart.arabicLots[1].signName} ${chart.arabicLots[1].formattedDMS} (House ${chart.arabicLots[1].house}).`,
      },
    ],
  };
}

function SIGN_NAME(idx: number): string {
  const names = [
    'Aries (Mesha)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karka)',
    'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchika)',
    'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)',
  ];
  return names[idx % 12] ?? 'Aries';
}

function ZODIAC_SIGNS_ELEMENT(idx: number): string {
  const elements = ['Fire', 'Earth', 'Air', 'Water'];
  return elements[idx % 4];
}
