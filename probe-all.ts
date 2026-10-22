import { computeLagnaFunctional, PLANET_TE, RASI_TE } from './src/engine/lagnaFunctionalEngine.ts';
for (let i=0;i<12;i++){
  const f = computeLagnaFunctional(i);
  const nm = (ids:string[]) => ids.map(x=>PLANET_TE[x]).join(',') || '—';
  console.log(`${RASI_TE[i].padEnd(10)} YK:${nm(f.yogakarakas).padEnd(8)} shubha:${nm(f.benefics).padEnd(28)} papa:${nm(f.malefics).padEnd(20)} best:${PLANET_TE[f.bestBenefic]} badhaka:${f.badhakaHouse}`);
}
