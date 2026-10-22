import { computeGocharaReport } from './src/engine/gocharaVedhaEngine.ts';
import { calculateChart } from './src/engine/ephemeris.ts';

const input = {
  id: 'x', name: 'Charan', gender: 'male' as const, date: '1998-05-14', time: '08:45',
  lat: 17.385, lng: 78.4867, tzOffsetHours: 5.5, city: 'హైదరాబాద్', country: 'India',
  ayanamsa: 'lahiri' as any, houseSystem: 'placidus' as any,
};
const chart = calculateChart(input as any, 'vedic_lahiri' as any);
const moon = chart.planets.find((p) => p.id === 'Moon')!;
console.log('natal moon', moon.signName, moon.nakshatra, moon.siderealLon.toFixed(3));
const rep = computeGocharaReport(moon.signIndex, Math.floor(moon.siderealLon / (360 / 27)), { asOfISO: '2026-10-22' });
console.log(rep.summaryTe);
for (const g of rep.grahas) console.log(g.nameTe, g.signTe, g.degreeInSign.toFixed(1), 'H' + g.houseFromMoon, g.verdict, g.vedhaBy ?? '-', 'next', g.nextIngressISO, g.nextIngressSignTe, g.daysToIngress + 'd', g.isRetrograde ? 'R' : '');
console.log('sadeSati', JSON.stringify(rep.sadeSati, null, 0));
console.log('ingresses', rep.upcomingIngresses.slice(0,6));
