import { calculateChart } from '../src/engine/ephemeris.ts';
const inp:any = {name:'x',date:'2026-10-22',time:'22:55',lat:17.3843,lng:78.4583,tzOffsetHours:5.5,city:'Hyderabad',country:'India',ayanamsa:'lahiri',houseSystem:'whole_sign'};
let t=Date.now(); for(let i=0;i<20;i++) calculateChart(inp,'vedic'); console.log('20 charts:', Date.now()-t, 'ms');
