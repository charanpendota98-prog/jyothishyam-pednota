import React, { useState } from 'react';
import {
  ZODIAC_SIGNS,
  calculateVargaSign,
  type CompleteChartResult,
  type PlanetPosition,
} from '../engine/ephemeris.ts';
import {
  TELUGU_RASIS,
  TELUGU_PLANETS,
  TELUGU_NAKSHATRAS,
  type AppLanguage,
} from '../engine/teluguJathakam.ts';

interface WesternWheelProps {
  chart: CompleteChartResult;
  transitChart?: CompleteChartResult | null;
  selectedPlanetId: string | null;
  onSelectPlanet: (planet: PlanetPosition) => void;
  lang?: AppLanguage;
  showTransitLayer?: boolean;
}

export const WesternWheelSvg: React.FC<WesternWheelProps> = ({
  chart,
  transitChart,
  selectedPlanetId,
  onSelectPlanet,
  lang = 'te',
  showTransitLayer = false,
}) => {
  const [hoveredAspectIdx, setHoveredAspectIdx] = useState<number | null>(null);

  const size = 620;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 285;
  const rZodiacInner = 242;
  const rHouseInner = 132;
  const rPlanetTrack = 198;
  const rTransitTrack = 298;

  const ascLon = chart.ascendant.activeLon;
  const lonToSvgAngleDeg = (lon: number) => 180 - (lon - ascLon);

  const polarToXY = (radius: number, astroLon: number) => {
    const deg = lonToSvgAngleDeg(astroLon);
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const spreadPlanets = (planets: PlanetPosition[]) => {
    const items = planets.map((p) => ({
      planet: p,
      displayLon: p.activeLon,
    }));
    items.sort((a, b) => a.planet.activeLon - b.planet.activeLon);
    const minSep = 5.5;
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < items.length; i++) {
        const next = items[(i + 1) % items.length];
        let diff = next.displayLon - items[i].displayLon;
        if (diff < 0) diff += 360;
        if (diff < minSep) {
          const adjust = (minSep - diff) / 2;
          items[i].displayLon = (items[i].displayLon - adjust + 360) % 360;
          next.displayLon = (next.displayLon + adjust) % 360;
        }
      }
    }
    return items;
  };

  const displayPlanets = spreadPlanets(chart.planets);

  const elementColor = (element: string) => {
    if (element === 'Fire') return '#D47B7B';
    if (element === 'Earth') return '#C9A96E';
    if (element === 'Air') return '#9B8FD4';
    return '#5BBFB5';
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[560px] h-auto select-none overflow-visible"
        role="img"
        aria-label="Interactive 360-degree Ecliptic Horoscope Wheel"
      >
        <defs>
          <radialGradient id="wheelCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#141932" />
            <stop offset="100%" stopColor="#090C18" />
          </radialGradient>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill="url(#wheelCoreGrad)"
          stroke="rgba(201,169,110,0.35)"
          strokeWidth={1.5}
        />

        {ZODIAC_SIGNS.map((sign) => {
          const startLon = sign.index * 30;
          const midLon = startLon + 15;
          const p1 = polarToXY(rOuter, startLon);
          const p2 = polarToXY(rZodiacInner, startLon);
          const glyphPos = polarToXY((rOuter + rZodiacInner) / 2, midLon);

          const ticks = [5, 10, 15, 20, 25].map((d) => {
            const tLon = startLon + d;
            const t1 = polarToXY(rZodiacInner, tLon);
            const t2 = polarToXY(rZodiacInner + (d === 15 ? 8 : 4), tLon);
            return { d, t1, t2 };
          });

          return (
            <g key={sign.name}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(255,255,255,0.16)"
                strokeWidth={1}
              />
              {ticks.map((tk) => (
                <line
                  key={tk.d}
                  x1={tk.t1.x}
                  y1={tk.t1.y}
                  x2={tk.t2.x}
                  y2={tk.t2.y}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={0.75}
                />
              ))}
              <text
                x={glyphPos.x}
                y={glyphPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={elementColor(sign.element)}
                fontSize={16}
                fontWeight={600}
              >
                {sign.glyph}
              </text>
            </g>
          );
        })}

        <circle
          cx={cx}
          cy={cy}
          r={rZodiacInner}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1}
        />

        {chart.houses.map((h, idx) => {
          const nextH = chart.houses[(idx + 1) % 12];
          let span = nextH.activeCusp - h.activeCusp;
          if (span < 0) span += 360;
          const midHouseLon = (h.activeCusp + span / 2) % 360;

          const isAngular = [1, 4, 7, 10].includes(h.house);
          const pOuter = polarToXY(rZodiacInner, h.activeCusp);
          const pInner = polarToXY(rHouseInner, h.activeCusp);
          const labelPos = polarToXY(rHouseInner + 14, midHouseLon);

          return (
            <g key={h.house}>
              <line
                x1={pOuter.x}
                y1={pOuter.y}
                x2={pInner.x}
                y2={pInner.y}
                stroke={
                  isAngular
                    ? 'rgba(201,169,110,0.65)'
                    : 'rgba(255,255,255,0.12)'
                }
                strokeWidth={isAngular ? 1.6 : 0.8}
                strokeDasharray={isAngular ? undefined : '2,3'}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(237,232,224,0.42)"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
              >
                {h.house}
              </text>
            </g>
          );
        })}

        {(() => {
          const ascP = polarToXY(rOuter + 12, chart.ascendant.activeLon);
          const mcP = polarToXY(rOuter + 12, chart.midheaven.activeLon);
          return (
            <>
              <text
                x={ascP.x - 10}
                y={ascP.y}
                textAnchor="end"
                dominantBaseline="central"
                fill="#C9A96E"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                లగ్నం (ASC) {Math.floor(chart.ascendant.activeLon % 30)}°
              </text>
              <text
                x={mcP.x}
                y={mcP.y - 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#9B8FD4"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                MC {Math.floor(chart.midheaven.activeLon % 30)}°
              </text>
            </>
          );
        })()}

        <circle
          cx={cx}
          cy={cy}
          r={rHouseInner}
          fill="rgba(9,12,24,0.85)"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={1}
        />

        {chart.aspects.slice(0, 22).map((asp, idx) => {
          const p1 = chart.planets.find((p) => p.name === asp.planet1);
          const p2 = chart.planets.find((p) => p.name === asp.planet2);
          if (!p1 || !p2) return null;

          const pos1 = polarToXY(rHouseInner - 3, p1.activeLon);
          const pos2 = polarToXY(rHouseInner - 3, p2.activeLon);

          const strokeColor =
            asp.nature === 'Harmonious'
              ? '#5BBFB5'
              : asp.nature === 'Dynamic'
                ? '#D47B7B'
                : asp.nature === 'Fused'
                  ? '#C9A96E'
                  : '#9B8FD4';

          const isHighlighted =
            hoveredAspectIdx === idx ||
            (selectedPlanetId &&
              (p1.id === selectedPlanetId || p2.id === selectedPlanetId));

          return (
            <line
              key={`${asp.planet1}-${asp.planet2}-${idx}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={strokeColor}
              strokeWidth={isHighlighted ? 2.2 : 1}
              strokeOpacity={isHighlighted ? 0.95 : 0.42}
              onMouseEnter={() => setHoveredAspectIdx(idx)}
              onMouseLeave={() => setHoveredAspectIdx(null)}
              className="cursor-pointer transition-opacity"
            />
          );
        })}

        {displayPlanets.map(({ planet, displayLon }) => {
          const exactEdge = polarToXY(rZodiacInner, planet.activeLon);
          const nodeCenter = polarToXY(rPlanetTrack, displayLon);
          const degLabelPos = polarToXY(rPlanetTrack - 28, displayLon);
          const isSelected = selectedPlanetId === planet.id;
          const teShort = TELUGU_PLANETS[planet.id]?.shortTe ?? planet.id.slice(0, 2);

          return (
            <g
              key={planet.id}
              onClick={() => onSelectPlanet(planet)}
              className="cursor-pointer group"
            >
              <line
                x1={exactEdge.x}
                y1={exactEdge.y}
                x2={nodeCenter.x}
                y2={nodeCenter.y}
                stroke={isSelected ? '#C9A96E' : 'rgba(255,255,255,0.22)'}
                strokeWidth={isSelected ? 1.4 : 0.8}
              />
              <circle
                cx={nodeCenter.x}
                cy={nodeCenter.y}
                r={15}
                fill={isSelected ? '#C9A96E' : '#141932'}
                stroke={isSelected ? '#EDE8E0' : 'rgba(201,169,110,0.45)'}
                strokeWidth={isSelected ? 1.8 : 1}
              />
              <text
                x={nodeCenter.x}
                y={nodeCenter.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? '#090C18' : '#EDE8E0'}
                fontSize={11}
                fontWeight={700}
              >
                {teShort}
              </text>
              <text
                x={degLabelPos.x}
                y={degLabelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={planet.isRetrograde ? '#D47B7B' : 'rgba(237,232,224,0.68)'}
                fontSize={9.5}
                fontFamily="JetBrains Mono, monospace"
              >
                {Math.floor(planet.degreeInSign)}°{planet.isRetrograde ? 'వ' : ''}
              </text>
            </g>
          );
        })}

        {/* Secondary Outer Transit Ring Track & Markers */}
        {showTransitLayer && transitChart && (
          <g className="select-none transit-layer-outer-ring">
            {/* Outer and inner bounding circles for the transit ring track */}
            <circle
              cx={cx}
              cy={cy}
              r={rTransitTrack + 14}
              fill="rgba(91, 191, 181, 0.04)"
              stroke="#5BBFB5"
              strokeWidth={1.2}
              strokeDasharray="4 3"
              opacity={0.7}
            />
            <circle
              cx={cx}
              cy={cy}
              r={rTransitTrack - 14}
              fill="none"
              stroke="#5BBFB5"
              strokeWidth={0.8}
              strokeDasharray="2 2"
              opacity={0.4}
            />

            {/* Connecting aspect rays from transit planets to conjunct natal planets (within 8 deg) */}
            {transitChart.planets.slice(0, 9).map((tp) => {
              const conjunctNatal = chart.planets.find(
                (np) => Math.abs(np.activeLon - tp.activeLon) <= 8 || Math.abs(np.activeLon - tp.activeLon) >= 352
              );
              if (!conjunctNatal) return null;
              const p1 = polarToXY(rTransitTrack - 12, tp.activeLon);
              const p2 = polarToXY(rPlanetTrack + 12, conjunctNatal.activeLon);
              return (
                <g key={`tr-natal-conj-${tp.id}-${conjunctNatal.id}`}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#5BBFB5"
                    strokeWidth={1.2}
                    strokeDasharray="3 2"
                    opacity={0.8}
                  />
                  <circle cx={(p1.x + p2.x) / 2} cy={(p1.y + p2.y) / 2} r={2.5} fill="#5BBFB5" />
                </g>
              );
            })}

            {/* Transit planet nodes around the secondary ring */}
            {transitChart.planets.slice(0, 9).map((tp) => {
              const pos = polarToXY(rTransitTrack, tp.activeLon);
              const tpTe = TELUGU_PLANETS[tp.id]?.shortTe ?? tp.id.slice(0, 2);
              return (
                <g key={`transit-${tp.id}`} className="cursor-pointer">
                  {/* Outer glow ring for transit node */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={12}
                    fill="#090C18"
                    stroke="#5BBFB5"
                    strokeWidth={1.4}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#5BBFB5"
                    fontSize={10.5}
                    fontWeight={700}
                  >
                    {tp.glyph}
                  </text>
                  {/* Secondary marker label indicating Gochar degree */}
                  <text
                    x={pos.x}
                    y={pos.y + 17}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#5BBFB5"
                    fontSize={8.5}
                    fontWeight={700}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {lang === 'te'
                      ? `[గో]${tpTe}${Math.floor(tp.degreeInSign)}°${tp.isRetrograde ? 'వ' : ''}`
                      : `[Tr]${tp.id.slice(0, 2)}${Math.floor(tp.degreeInSign)}°`}
                  </text>
                </g>
              );
            })}

            {/* Outer ring status label */}
            <rect
              x={cx - 95}
              y={cy - rTransitTrack - 26}
              width={190}
              height={18}
              rx={4}
              fill="#090C18"
              stroke="#5BBFB5"
              strokeWidth={1}
            />
            <text
              x={cx}
              y={cy - rTransitTrack - 15}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#5BBFB5"
              fontSize={8.5}
              fontWeight={700}
            >
              ✨ బాహ్య గోచార వలయం (Live Transits Ring)
            </text>
          </g>
        )}
      </svg>

      {hoveredAspectIdx !== null && chart.aspects[hoveredAspectIdx] && (
        <div className="mt-2 text-xs font-mono-tabular text-[#EDE8E0]/80 bg-[#0F1326] border border-white/10 px-3 py-1.5 rounded">
          {chart.aspects[hoveredAspectIdx].glyph1} {chart.aspects[hoveredAspectIdx].planet1}{' '}
          {chart.aspects[hoveredAspectIdx].symbol} {chart.aspects[hoveredAspectIdx].glyph2}{' '}
          {chart.aspects[hoveredAspectIdx].planet2} · {chart.aspects[hoveredAspectIdx].type} · Orb{' '}
          {chart.aspects[hoveredAspectIdx].orb}° ({chart.aspects[hoveredAspectIdx].nature})
        </div>
      )}
    </div>
  );
};

export type VargaDivision =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D7'
  | 'D9'
  | 'D10'
  | 'D12'
  | 'D16'
  | 'D20'
  | 'D24'
  | 'D27'
  | 'D30'
  | 'D60';

interface KundaliProps {
  chart: CompleteChartResult;
  division: VargaDivision;
  selectedPlanetId: string | null;
  onSelectPlanet: (planet: PlanetPosition) => void;
  lang?: AppLanguage;
  transitChart?: CompleteChartResult | null;
  showTransitLayer?: boolean;
}

export const NorthIndianKundaliSvg: React.FC<KundaliProps> = ({
  chart,
  division,
  selectedPlanetId,
  onSelectPlanet,
  lang = 'te',
  transitChart,
  showTransitLayer = false,
}) => {
  const ascSignIdx = calculateVargaSign(chart.ascendant.siderealLon, division);

  const housePlanets: Record<number, PlanetPosition[]> = {};
  for (let h = 1; h <= 12; h++) housePlanets[h] = [];

  for (const p of chart.planets) {
    // Only plot the 9 classical Vedic Grahas in traditional Kundali boxes for clarity
    if (!['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(p.id)) {
      continue;
    }
    const pSign = calculateVargaSign(p.siderealLon, division);
    const houseNum = ((pSign - ascSignIdx + 12) % 12) + 1;
    housePlanets[houseNum].push(p);
  }

  const houseTransitPlanets: Record<number, PlanetPosition[]> = {};
  for (let h = 1; h <= 12; h++) houseTransitPlanets[h] = [];
  if (showTransitLayer && transitChart) {
    for (const tp of transitChart.planets) {
      if (!['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(tp.id)) {
        continue;
      }
      const tpSign = calculateVargaSign(tp.siderealLon, division);
      const houseNum = ((tpSign - ascSignIdx + 12) % 12) + 1;
      houseTransitPlanets[houseNum].push(tp);
    }
  }

  const houseCenters: Record<number, { x: number; y: number; rasiX: number; rasiY: number }> = {
    1: { x: 240, y: 120, rasiX: 240, rasiY: 205 },
    2: { x: 120, y: 52, rasiX: 120, rasiY: 96 },
    3: { x: 52, y: 120, rasiX: 96, rasiY: 120 },
    4: { x: 120, y: 240, rasiX: 205, rasiY: 240 },
    5: { x: 52, y: 360, rasiX: 96, rasiY: 360 },
    6: { x: 120, y: 428, rasiX: 120, rasiY: 384 },
    7: { x: 240, y: 360, rasiX: 240, rasiY: 275 },
    8: { x: 360, y: 428, rasiX: 360, rasiY: 384 },
    9: { x: 428, y: 360, rasiX: 384, rasiY: 360 },
    10: { x: 360, y: 240, rasiX: 275, rasiY: 240 },
    11: { x: 428, y: 120, rasiX: 384, rasiY: 120 },
    12: { x: 360, y: 52, rasiX: 360, rasiY: 96 },
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg
        viewBox="0 0 480 480"
        className="w-full max-w-[490px] h-auto select-none"
        role="img"
        aria-label={`North Indian ${division} Kundali Chart`}
      >
        <rect
          x={12}
          y={12}
          width={456}
          height={456}
          fill="#0F1326"
          stroke="#C9A96E"
          strokeWidth={1.75}
        />
        <rect
          x={18}
          y={18}
          width={444}
          height={444}
          fill="none"
          stroke="rgba(201,169,110,0.25)"
          strokeWidth={0.75}
        />

        <line x1={12} y1={12} x2={468} y2={468} stroke="rgba(201,169,110,0.55)" strokeWidth={1.3} />
        <line x1={468} y1={12} x2={12} y2={468} stroke="rgba(201,169,110,0.55)" strokeWidth={1.3} />

        <polygon
          points="240,12 468,240 240,468 12,240"
          fill="none"
          stroke="#C9A96E"
          strokeWidth={1.5}
        />

        {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
          const signIdx = (ascSignIdx + houseNum - 1) % 12;
          const signNumber = signIdx + 1;
          const signInfo = ZODIAC_SIGNS[signIdx];
          const coords = houseCenters[houseNum];
          const pList = housePlanets[houseNum];

          return (
            <g key={houseNum}>
              <text
                x={coords.rasiX}
                y={coords.rasiY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#C9A96E"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                {signNumber} {signInfo.glyph}
              </text>

              {houseNum === 1 && (
                <text
                  x={240}
                  y={52}
                  textAnchor="middle"
                  fill="rgba(201,169,110,0.85)"
                  fontSize={11}
                  fontWeight={600}
                >
                  {lang === 'te' ? `లగ్నం · ${division}` : `LAGNA · ${division}`}
                </text>
              )}

              {pList.map((p, idx) => {
                const row = Math.floor(idx / 2);
                const col = idx % 2;
                const totalCols = Math.min(2, pList.length - row * 2);
                const offsetX = totalCols === 2 ? (col === 0 ? -28 : 28) : 0;
                const offsetY = (row - (Math.ceil(pList.length / 2) - 1) / 2) * 20;
                const isSelected = selectedPlanetId === p.id;
                const teLabel = TELUGU_PLANETS[p.id]?.shortTe ?? p.id.slice(0, 2);

                return (
                  <g
                    key={p.id}
                    onClick={() => onSelectPlanet(p)}
                    className="cursor-pointer"
                  >
                    <text
                      x={coords.x + offsetX}
                      y={coords.y + offsetY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={
                        isSelected
                          ? '#C9A96E'
                          : p.isRetrograde
                            ? '#D47B7B'
                            : '#EDE8E0'
                      }
                      fontSize={12}
                      fontWeight={isSelected ? 700 : 600}
                    >
                      {lang === 'te'
                        ? `${teLabel}${p.isRetrograde ? '(వ)' : ''}`
                        : `${p.glyph} ${p.id.slice(0, 2)}${p.isRetrograde ? '(R)' : ''}`}
                    </text>
                  </g>
                );
              })}

              {/* Transit Layer Overlay Markers */}
              {showTransitLayer && houseTransitPlanets[houseNum].length > 0 && (
                <g className="select-none transit-overlay-north-badge">
                  {/* Subtle background pill for transit markers */}
                  <rect
                    x={coords.x - Math.min(80, (houseTransitPlanets[houseNum].length * 36) / 2)}
                    y={coords.y + 23}
                    width={Math.min(160, houseTransitPlanets[houseNum].length * 36)}
                    height={16}
                    rx={3.5}
                    fill="rgba(16, 185, 129, 0.16)"
                    stroke="#5BBFB5"
                    strokeWidth={0.8}
                  />
                  {houseTransitPlanets[houseNum].map((tp, tIdx) => {
                    const tpTe = TELUGU_PLANETS[tp.id]?.shortTe ?? tp.id.slice(0, 2);
                    const tOffset = (tIdx - (houseTransitPlanets[houseNum].length - 1) / 2) * 32;
                    return (
                      <text
                        key={`tr-north-${houseNum}-${tp.id}`}
                        x={coords.x + tOffset}
                        y={coords.y + 31.5}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#5BBFB5"
                        fontSize={8.5}
                        fontWeight={700}
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {lang === 'te'
                          ? `[గో]${tpTe}${Math.floor(tp.degreeInSign)}°${tp.isRetrograde ? 'వ' : ''}`
                          : `[Tr]${tp.id.slice(0, 2)}${Math.floor(tp.degreeInSign)}°`}
                      </text>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}

        {/* Live Transit Active Badge Header */}
        {showTransitLayer && (
          <g className="select-none">
            <rect
              x={140}
              y={24}
              width={200}
              height={18}
              rx={4}
              fill="#090C18"
              stroke="#5BBFB5"
              strokeWidth={1}
            />
            <text
              x={240}
              y={35}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#5BBFB5"
              fontSize={9}
              fontWeight={700}
            >
              ✨ లైవ్ గోచార కవచం (Live Transits Overlay)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export const SouthIndianKundaliSvg: React.FC<KundaliProps> = ({
  chart,
  division,
  selectedPlanetId,
  onSelectPlanet,
  lang = 'te',
  transitChart,
  showTransitLayer = false,
}) => {
  const ascSignIdx = calculateVargaSign(chart.ascendant.siderealLon, division);
  const moon = chart.planets.find((p) => p.id === 'Moon')!;
  const moonNakIdx = Math.floor(((moon.siderealLon % 360) + 360) % 360 / (360 / 27));
  const moonNakTe = TELUGU_NAKSHATRAS[moonNakIdx]?.nameTe ?? chart.panchanga.nakshatra.name;

  // Compute Jaimini Atmakaraka (AK) and Arudha Lagna (AL) for D1 display
  const sevenIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const akPlanet = sevenIds
    .map((id) => chart.planets.find((p) => p.id === id)!)
    .sort((a, b) => b.degreeInSign - a.degreeInSign)[0];
  const lagnaSignD1 = chart.ascendant.signIndex;
  const lagnaLordEng = ZODIAC_SIGNS[lagnaSignD1].vedicRuler;
  const lagnaLordPlanet = chart.planets.find((p) => p.id === lagnaLordEng)!;
  const distToLord = (lagnaLordPlanet.d1Sign - lagnaSignD1 + 12) % 12;
  let alSignIdx = (lagnaLordPlanet.d1Sign + distToLord) % 12;
  const alDist = (alSignIdx - lagnaSignD1 + 12) % 12;
  if (alDist === 0 || alDist === 6) alSignIdx = (alSignIdx + 9) % 12;

  const signPlanets: Record<number, PlanetPosition[]> = {};
  for (let s = 0; s < 12; s++) signPlanets[s] = [];

  for (const p of chart.planets) {
    if (!['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(p.id)) {
      continue;
    }
    const pSign = calculateVargaSign(p.siderealLon, division);
    signPlanets[pSign].push(p);
  }

  const signTransitPlanets: Record<number, PlanetPosition[]> = {};
  for (let s = 0; s < 12; s++) signTransitPlanets[s] = [];

  if (showTransitLayer && transitChart) {
    for (const tp of transitChart.planets) {
      if (!['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(tp.id)) {
        continue;
      }
      const tpSign = calculateVargaSign(tp.siderealLon, division);
      signTransitPlanets[tpSign].push(tp);
    }
  }

  const signGridCoords: Record<number, { col: number; row: number }> = {
    11: { col: 0, row: 0 }, // మీనం / Pisces
    0: { col: 1, row: 0 }, // మేషం / Aries
    1: { col: 2, row: 0 }, // వృషభం / Taurus
    2: { col: 3, row: 0 }, // మిథునం / Gemini
    3: { col: 3, row: 1 }, // కర్కాటకం / Cancer
    4: { col: 3, row: 2 }, // సింహం / Leo
    5: { col: 3, row: 3 }, // కన్య / Virgo
    6: { col: 2, row: 3 }, // తుల / Libra
    7: { col: 1, row: 3 }, // వృశ్చికం / Scorpio
    8: { col: 0, row: 3 }, // ధనుస్సు / Sagittarius
    9: { col: 0, row: 2 }, // మకరం / Capricorn
    10: { col: 0, row: 1 }, // కుంభం / Aquarius
  };

  const cellSize = 114;
  const pad = 12;

  const rasiShortTe = [
    'మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం',
    'సింహం', 'కన్య', 'తుల', 'వృశ్చికం',
    'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం',
  ];

  const vargaTitleMapTe: Record<VargaDivision, string> = {
    D1: 'రాశి చక్రం (D1)',
    D2: 'హోరా చక్రం (D2 · ధన)',
    D3: 'ద్రేక్కాణ చక్రం (D3 · పరాక్రమ)',
    D4: 'చతుర్థాంశ చక్రం (D4 · ఆస్తులు)',
    D7: 'సప్తాంశ చక్రం (D7 · సంతాన)',
    D9: 'నవాంశ చక్రం (D9 · ధర్మ/కళత్ర)',
    D10: 'దశాంశ చక్రం (D10 · ఉద్యోగ/కర్మ)',
    D12: 'ద్వాదశాంశ చక్రం (D12 · మాతాపితృ)',
    D16: 'షోడశాంశ చక్రం (D16 · వాహన)',
    D20: 'వింశాంశ చక్రం (D20 · ఉపాసన)',
    D24: 'చతుర్వింశాంశ (D24 · విద్య)',
    D27: 'సప్తవింశాంశ (D27 · బలం)',
    D30: 'త్రింశాంశ చక్రం (D30 · అరిష్ట)',
    D60: 'షష్ట్యంశ చక్రం (D60 · పూర్వకర్మ)',
  };
  const vargaTitleTe = vargaTitleMapTe[division] ?? `వర్గ చక్రం (${division})`;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg
        viewBox="0 0 480 480"
        className="w-full max-w-[490px] h-auto select-none"
        role="img"
        aria-label={`South Indian ${division} Kundali Chart`}
      >
        <rect
          x={pad}
          y={pad}
          width={cellSize * 4}
          height={cellSize * 4}
          fill="#0F1326"
          stroke="#C9A96E"
          strokeWidth={1.85}
        />

        {ZODIAC_SIGNS.map((sign) => {
          const pos = signGridCoords[sign.index];
          const x = pad + pos.col * cellSize;
          const y = pad + pos.row * cellSize;
          const isAsc = sign.index === ascSignIdx;
          const pList = signPlanets[sign.index];
          const bhavaNum = ((sign.index - ascSignIdx + 12) % 12) + 1;

          return (
            <g key={sign.index}>
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={isAsc ? 'rgba(201,169,110,0.08)' : 'none'}
                stroke="rgba(201,169,110,0.42)"
                strokeWidth={1}
              />

              {/* Sign Header in Telugu / English + Bhava Number */}
              <text
                x={x + 7}
                y={y + 16}
                fill="rgba(237,232,224,0.52)"
                fontSize={10}
              >
                {lang === 'te' ? rasiShortTe[sign.index] : `${sign.glyph} ${sign.sanskrit}`}
              </text>

              <text
                x={x + cellSize - 7}
                y={y + cellSize - 8}
                textAnchor="end"
                fill="rgba(237,232,224,0.28)"
                fontSize={9.5}
                fontFamily="JetBrains Mono, monospace"
              >
                B{bhavaNum}
              </text>

              {/* Diagonal Ascendant Slash & Lagnam Label */}
              {isAsc && (
                <>
                  <line
                    x1={x}
                    y1={y + 28}
                    x2={x + 28}
                    y2={y}
                    stroke="#C9A96E"
                    strokeWidth={2}
                  />
                  <text
                    x={x + cellSize - 7}
                    y={y + 16}
                    textAnchor="end"
                    fill="#C9A96E"
                    fontSize={10.5}
                    fontWeight={700}
                  >
                    {lang === 'te' ? 'లగ్నం' : 'ASC'}
                  </text>
                </>
              )}

              {/* Arudha Lagna (AL) badge in D1 */}
              {division === 'D1' && sign.index === alSignIdx && !isAsc && (
                <text
                  x={x + cellSize - 7}
                  y={y + 16}
                  textAnchor="end"
                  fill="#5BBFB5"
                  fontSize={9.5}
                  fontWeight={700}
                >
                  {lang === 'te' ? 'AL ఆరూఢం' : 'AL'}
                </text>
              )}

              {/* Planets inside this Sign Cell */}
              {pList.map((p, idx) => {
                const row = Math.floor(idx / 2);
                const col = idx % 2;
                const px = x + 10 + col * 53;
                const py = y + 44 + row * 22;
                const isSelected = selectedPlanetId === p.id;
                const teLabel = TELUGU_PLANETS[p.id]?.shortTe ?? p.id.slice(0, 2);
                const isAK = division === 'D1' && akPlanet?.id === p.id;

                return (
                  <g
                    key={p.id}
                    onClick={() => onSelectPlanet(p)}
                    className="cursor-pointer"
                  >
                    <text
                      x={px}
                      y={py}
                      fill={
                        isSelected
                          ? '#C9A96E'
                          : p.isRetrograde
                            ? '#D47B7B'
                            : isAK
                              ? '#5BBFB5'
                              : '#EDE8E0'
                      }
                      fontSize={11.5}
                      fontWeight={isSelected || isAK ? 700 : 600}
                    >
                      {lang === 'te'
                        ? `${teLabel}${division === 'D1' ? ` ${Math.floor(p.degreeInSign)}°` : ''}${p.isRetrograde ? 'వ' : ''}`
                        : `${p.glyph}${p.id.slice(0, 2)}${division === 'D1' ? ` ${Math.floor(p.degreeInSign)}°` : ''}`}
                    </text>
                  </g>
                );
              })}

              {/* Transit Layer Secondary Overlay Badge */}
              {showTransitLayer && signTransitPlanets[sign.index].length > 0 && (
                <g className="select-none transit-overlay-sign-badge">
                  {/* Conjunction alert if natal planets share this sign with transiting planets */}
                  {pList.length > 0 && (
                    <g>
                      <circle
                        cx={x + cellSize - 9}
                        cy={y + 9}
                        r={3}
                        fill="#5BBFB5"
                      />
                      <circle
                        cx={x + cellSize - 9}
                        cy={y + 9}
                        r={6.5}
                        fill="none"
                        stroke="#5BBFB5"
                        strokeWidth={0.8}
                        strokeDasharray="2 1.5"
                      />
                    </g>
                  )}
                  <rect
                    x={x + 3}
                    y={y + cellSize - 22}
                    width={cellSize - 6}
                    height={19}
                    rx={3.5}
                    fill="rgba(16, 185, 129, 0.18)"
                    stroke="#5BBFB5"
                    strokeWidth={0.9}
                  />
                  <text
                    x={x + 6}
                    y={y + cellSize - 9.5}
                    fill="#5BBFB5"
                    fontSize={9.2}
                    fontWeight={700}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {lang === 'te' ? '✨గో: ' : '✨Tr: '}
                    {signTransitPlanets[sign.index]
                      .map((tp) => {
                        const tpName = TELUGU_PLANETS[tp.id]?.shortTe ?? tp.id.slice(0, 2);
                        return `${tpName}${Math.floor(tp.degreeInSign)}°${tp.isRetrograde ? 'వ' : ''}`;
                      })
                      .join(' ')}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Central 2x2 Courtyard Plaque */}
        <rect
          x={pad + cellSize}
          y={pad + cellSize}
          width={cellSize * 2}
          height={cellSize * 2}
          fill="#090C18"
          stroke="#C9A96E"
          strokeWidth={1.4}
        />
        <text
          x={240}
          y={190}
          textAnchor="middle"
          fill="#C9A96E"
          fontSize={17.5}
          fontWeight={700}
        >
          {lang === 'te' ? vargaTitleTe : `${division} Varga Kundali`}
        </text>
        <text
          x={240}
          y={215}
          textAnchor="middle"
          fill="#EDE8E0"
          fontSize={13}
          fontWeight={600}
        >
          {chart.input.name}
        </text>
        <text
          x={240}
          y={236}
          textAnchor="middle"
          fill="rgba(237,232,224,0.62)"
          fontSize={10.5}
          fontFamily="JetBrains Mono, monospace"
        >
          {chart.input.date} · {chart.input.time} · {chart.input.city}
        </text>
        <text
          x={240}
          y={258}
          textAnchor="middle"
          fill="#C9A96E"
          fontSize={11.5}
          fontWeight={600}
        >
          {lang === 'te'
            ? `లగ్నం: ${TELUGU_RASIS[ascSignIdx].nameTe}`
            : `Lagna: ${ZODIAC_SIGNS[ascSignIdx].sanskrit} (${ZODIAC_SIGNS[ascSignIdx].name})`}
        </text>
        <text
          x={240}
          y={279}
          textAnchor="middle"
          fill="#5BBFB5"
          fontSize={11}
          fontWeight={500}
        >
          {lang === 'te'
            ? `రాశి: ${TELUGU_RASIS[moon.d1Sign].nameTe.split(' ')[0]} · ${moonNakTe} (${chart.panchanga.nakshatra.pada}వ పాదం)`
            : `Janma Nakshatra: ${chart.panchanga.nakshatra.name} (Pada ${chart.panchanga.nakshatra.pada})`}
        </text>
        <text
          x={240}
          y={299}
          textAnchor="middle"
          fill="rgba(201,169,110,0.85)"
          fontSize={10}
          fontWeight={600}
        >
          {lang === 'te'
            ? `ఆత్మకారకుడు (AK): ${TELUGU_PLANETS[akPlanet.id]?.nameTe} · ఆరూఢం: ${TELUGU_RASIS[alSignIdx].nameTe.split(' ')[0]}`
            : `AK: ${akPlanet.name} · AL: ${ZODIAC_SIGNS[alSignIdx].sanskrit}`}
        </text>
        <text
          x={240}
          y={316}
          textAnchor="middle"
          fill="rgba(237,232,224,0.45)"
          fontSize={9.5}
          fontFamily="JetBrains Mono, monospace"
        >
          {lang === 'te'
            ? `చిత్రపక్ష (లహరి) అయనాంశం: ${chart.ayanamsaFormatted}`
            : `Ayanamsa: ${chart.ayanamsaFormatted}`}
        </text>

        {/* Live Transit Overlay Active Indicator */}
        {showTransitLayer && (
          <g className="select-none">
            <rect
              x={pad + cellSize + 16}
              y={pad + cellSize + 194}
              width={cellSize * 2 - 32}
              height={22}
              rx={5}
              fill="rgba(16, 185, 129, 0.2)"
              stroke="#5BBFB5"
              strokeWidth={1.2}
            />
            <text
              x={240}
              y={pad + cellSize + 208}
              textAnchor="middle"
              fill="#5BBFB5"
              fontSize={10}
              fontWeight={700}
            >
              ✨ లైవ్ గోచార కవచం (Live Transits Overlay Active)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
