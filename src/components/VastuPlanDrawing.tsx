/**
 * VastuPlanDrawing.tsx — వాస్తు ప్లాన్ రేఖాచిత్రం (SVG)
 *
 * నైరుతి మూలం, ఉత్తరం పైకి. అన్ని కొలతలు అడుగులలోనే లెక్కించి, చివర్లో
 * ఒకే స్కేల్‌తో పిక్సెల్‌లకు మారుస్తాము — కాబట్టి డ్రాయింగ్ నిష్పత్తి ఎప్పుడూ నిజం.
 *
 * ఒక ప్లాన్‌లో (పై నుంచి కిందకి):
 *   ప్లాట్ సరిహద్దు → రోడ్డు (హ్యాచ్) → సెట్‌బ్యాక్ ఎన్వలప్ (గీత) → భవనం →
 *   గదులు (వాస్తు అనుకూలత రంగుతో) → పార్కింగ్ → ట్యాంక్/సంప్/సెప్టిక్ →
 *   ప్రవేశ ద్వారం → ఉత్తర బాణం → స్కేల్ బార్ → కొలతలు → శీర్షిక బ్లాక్.
 */

import { useMemo } from 'react';
import type { PlotPlan, PlanRoom, Rect } from '../engine/vastuPlotPlannerEngine';

export interface VastuPlanDrawingProps {
  plan: PlotPlan;
  /** గరిష్ఠ వెడల్పు (px) */
  maxWidth?: number;
  /** కొలతలు, దిక్కుల పేర్లు చూపాలా */
  showDimensions?: boolean;
  /** true = తెలుగు లేబుళ్లు, false = ఆంగ్లం */
  isTe?: boolean;
  /** 9×9 పరమశాయిక మండలం చూపాలా */
  showMandala?: boolean;
  /** తలుపు/కిటికీ గుర్తులు చూపాలా */
  showOpenings?: boolean;
  className?: string;
}

const FIT_FILL: Record<string, string> = {
  best: '#d9f3e4',
  ok: '#fdf6d2',
  bad: '#fbe0e0',
};
const FIT_STROKE: Record<string, string> = {
  best: '#2f855a',
  ok: '#a16207',
  bad: '#c53030',
};

const ft = (v: number) => `${Math.round(v)}′`;
const ftIn = (v: number) => {
  const total = Math.round(v * 12);
  const f = Math.floor(total / 12);
  const i = total % 12;
  return i === 0 ? `${f}′` : `${f}′-${i}″`;
};

export default function VastuPlanDrawing({
  plan,
  maxWidth = 760,
  showDimensions = true,
  isTe = true,
  showMandala = false,
  showOpenings = true,
  className,
}: VastuPlanDrawingProps) {
  const geom = useMemo(() => {
    const W = plan.plot.widthFt;
    const D = plan.plot.depthFt;
    const roadSpace = 16;
    const padLeft = 46;
    const padRight = 34 + (plan.plot.roadSide === 'E' ? roadSpace : 0);
    const padTop = plan.plot.roadSide === 'N' ? 86 : 64;
    const padBottom = 82;
    const availW = maxWidth - padLeft - padRight;
    const availH = 900 - padTop - padBottom;
    const S = Math.max(3, Math.min(availW / Math.max(1, W), availH / Math.max(1, D)));
    const svgW = Math.round(W * S + padLeft + padRight);
    const svgH = Math.round(D * S + padTop + padBottom);
    const X = (x: number) => padLeft + x * S;
    // ఉత్తరం పైకి: ప్లాట్ y=0 (దక్షిణం) కిందకు అవుతుంది
    const Y = (y: number, h = 0) => padTop + (D - y - h) * S;
    return { W, D, S, svgW, svgH, X, Y, padLeft, padTop, padRight };
  }, [plan, maxWidth]);

  const { W, D, S, svgW, svgH, X, Y, padLeft, padTop, padRight } = geom;

  const rectEl = (r: Rect, props: Record<string, unknown>) => (
    <rect x={X(r.x)} y={Y(r.y, r.h)} width={Math.max(0, r.w * S)} height={Math.max(0, r.h * S)} {...props} />
  );

  const rooms: PlanRoom[] = plan.rooms;
  const isRental = plan.units.length > 0 && rooms.length === 0;

  const roomLabel = (r: PlanRoom) => {
    const wPx = r.w * S;
    const hPx = r.h * S;
    const short = isTe
      ? r.labelTe.replace(' / లివింగ్', '').replace('ప్రధాన పడకగది', 'ప్రధాన పడక')
      : r.labelEn.replace('Children bed', 'Child bed').replace('Master bed', 'Master');
    const fontSize = Math.max(8.5, Math.min(12.5, Math.min(wPx, hPx) / 3.2));
    const showArea = wPx > 52 && hPx > 34;
    const showDims = showArea && wPx > 78 && hPx > 56;
    const cx = X(r.x + r.w / 2);
    const cy = Y(r.y, r.h) + (r.h * S) / 2;
    return (
      <g key={r.id}>
        <text x={cx} y={cy - (showArea ? 6 : 0)} textAnchor="middle" fontSize={fontSize} fill="#1a202c" fontWeight={600}>
          {short}
        </text>
        {showArea && (
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize={Math.max(7.5, fontSize - 2.5)} fill="#4a5568">
            {r.areaSqft} {isTe ? 'చ.అ.' : 'sq.ft.'}
          </text>
        )}
        {showDims && (
          <text x={cx} y={cy + 19} textAnchor="middle" fontSize={Math.max(7, fontSize - 3)} fill="#718096">
            {ft(r.w)} × {ft(r.h)}
          </text>
        )}
      </g>
    );
  };

  // రోడ్డు ఏ వైపు? హ్యాచ్ స్ట్రిప్ గీయడానికి
  const roadSide = plan.plot.roadSide;
  const roadThick = 13;
  const road =
    roadSide === 'S'
      ? { x: X(0), y: Y(0), w: W * S, h: roadThick }
      : roadSide === 'N'
        ? { x: X(0), y: padTop - roadThick - 1, w: W * S, h: roadThick }
        : roadSide === 'E'
          ? { x: X(W) + 2, y: padTop, w: roadThick, h: D * S }
          : { x: padLeft - roadThick - 2, y: padTop, w: roadThick, h: D * S };

  // అతి పెద్ద సెట్‌బ్యాక్ ఖాళీని గుర్తించడం (ఖాళీ స్థలం ఎక్కడ ఉందో క్లయింట్‌కు కనిపించాలి)
  const gaps = [
    { dir: 'S' as const, r: { x: 0, y: 0, w: W, h: Math.max(0, plan.envelope.y) } },
    { dir: 'N' as const, r: { x: 0, y: plan.envelope.y + plan.envelope.h, w: W, h: Math.max(0, D - plan.envelope.y - plan.envelope.h) } },
    { dir: 'E' as const, r: { x: plan.envelope.x + plan.envelope.w, y: 0, w: Math.max(0, W - plan.envelope.x - plan.envelope.w), h: D } },
    { dir: 'W' as const, r: { x: 0, y: 0, w: Math.max(0, plan.envelope.x), h: D } },
  ];
  const openGap = gaps.reduce((a, b) => (b.r.w * b.r.h > a.r.w * a.r.h ? b : a), gaps[0]);

  const entrancePt = {
    x: X(plan.entrance.x),
    y: Y(plan.entrance.y),
  };

  const scaleFt = S * 5 > 40 ? 10 : 5;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      className={className}
      style={{ maxWidth: svgW, height: 'auto', display: 'block' }}
      role="img"
      aria-label={isTe ? 'వాస్తు ప్లాన్ రేఖాచిత్రం' : 'Vastu plan drawing'}
    >
      <defs>
        <pattern id="vpdRoad" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#e2e8f0" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#a0aec0" strokeWidth="2" />
        </pattern>
        <pattern id="vpdPark" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#f7fafc" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#cbd5e0" strokeWidth="1.5" />
        </pattern>
        <marker id="vpdArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="#2d3748" />
        </marker>
      </defs>

      {/* ప్లాట్ */}
      {rectEl({ x: 0, y: 0, w: W, h: D }, { fill: '#ffffff', stroke: '#1a202c', strokeWidth: 2.4 })}

      {/* రోడ్డు */}
      <g>
        <rect x={road.x} y={road.y} width={road.w} height={road.h} fill="url(#vpdRoad)" stroke="#a0aec0" strokeWidth="0.8" />
        <text
          x={road.w > road.h ? road.x + Math.min(60, road.w * 0.18) : road.x + road.w / 2}
          y={road.y + road.h / 2 + 3}
          textAnchor="middle"
          fontSize={8.5}
          fill="#2d3748"
          transform={
            roadSide === 'E' || roadSide === 'W'
              ? `rotate(-90 ${road.x + road.w / 2} ${road.y + road.h / 2})`
              : undefined
          }
        >
          {isTe ? 'రోడ్డు' : 'Road'} {plan.plot.roadWidthFt}′
        </text>
      </g>

      {/* ఎన్వలప్ (సెట్‌బ్యాక్ లైన్) */}
      {rectEl(plan.envelope, {
        fill: 'none',
        stroke: '#4a5568',
        strokeWidth: 1,
        strokeDasharray: '5 4',
      })}
      <text x={padLeft} y={48} fontSize={8.5} fill="#4a5568">
        - - {isTe ? 'సెట్‌బ్యాక్ తర్వాత నిర్మాణ స్థలం' : 'Buildable area after setbacks'}{' '}
        {Math.round(plan.capacity.envelopeSqft)} {isTe ? 'చ.అ.' : 'sq.ft.'} ({plan.rules.frontFt}′ {isTe ? 'ఫ్రంట్' : 'front'} · {plan.rules.sideFt}′{' '}
        {isTe ? 'సైడ్' : 'side'} · {plan.rules.rearFt}′ {isTe ? 'రియర్' : 'rear'})
      </text>

      {/* ఖాళీ స్థలం */}
      {openGap.r.w > 1 && openGap.r.h > 1 && (
        <g>
          {rectEl(openGap.r, { fill: '#f8fafc' })}
          {openGap.r.w * S > 40 && openGap.r.h * S > 26 && (
            <text
              x={X(openGap.r.x) + (openGap.r.w * S) / 2}
              y={Y(openGap.r.y, openGap.r.h) + (openGap.r.h * S) / 2 + 3}
              textAnchor="middle"
              fontSize={8.5}
              fill="#718096"
            >
              {isTe ? 'ఖాళీ స్థలం' : 'Open space'}
            </text>
          )}
        </g>
      )}

      {/* భవనం */}
      {rectEl(plan.building, { fill: '#f7fafc', stroke: '#1a202c', strokeWidth: 1.8 })}

      {/* 9×9 పరమశాయిక మండలం (బ్రహ్మస్థానం) */}
      {showMandala && (
        <g>
          {plan.mandala.map((p) => (
            <rect
              key={`m-${p.index}`}
              x={X(p.x)}
              y={Y(p.y, p.h)}
              width={p.w * S}
              height={p.h * S}
              fill={p.vithi === 'brahmi' ? '#f6e05e' : p.vithi === 'daivi' ? '#bee3f8' : 'none'}
              fillOpacity={p.vithi === 'brahmi' ? 0.35 : p.vithi === 'daivi' ? 0.18 : 0}
              stroke="#2d3748"
              strokeOpacity={p.vithi === 'paisachika' ? 0.18 : 0.3}
              strokeWidth={0.5}
            />
          ))}
          <rect
            x={X(plan.building.x + (plan.building.w * 3) / 9)}
            y={Y(plan.building.y + (plan.building.h * 6) / 9, (plan.building.h * 3) / 9)}
            width={(plan.building.w * 3 * S) / 9}
            height={(plan.building.h * 3 * S) / 9}
            fill="none"
            stroke="#975a16"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        </g>
      )}

      {/* గదులు */}
      {(isRental ? plan.units.flatMap((u) => u.rooms) : rooms).map((r) => (
        <g key={r.id}>
          {rectEl(r, {
            fill: FIT_FILL[r.fit] ?? '#f7fafc',
            stroke: FIT_STROKE[r.fit] ?? '#4a5568',
            strokeWidth: 1.1,
          })}
          {roomLabel(r)}
        </g>
      ))}

      {/* తలుపులు / కిటికీలు */}
      {showOpenings &&
        plan.openings.map((o, i) => {
          const horiz = o.side === 'N' || o.side === 'S';
          const len = o.width * S;
          if (o.kind === 'window') {
            return horiz ? (
              <g key={`o-${i}`}>
                <line x1={X(o.x)} y1={Y(o.y) - 1.6} x2={X(o.x) + len} y2={Y(o.y) - 1.6} stroke="#2b6cb0" strokeWidth={2.2} />
                <line x1={X(o.x)} y1={Y(o.y) + 1.6} x2={X(o.x) + len} y2={Y(o.y) + 1.6} stroke="#2b6cb0" strokeWidth={0.9} />
              </g>
            ) : (
              <g key={`o-${i}`}>
                <line x1={X(o.x) - 1.6} y1={Y(o.y)} x2={X(o.x) - 1.6} y2={Y(o.y) - len} stroke="#2b6cb0" strokeWidth={2.2} />
                <line x1={X(o.x) + 1.6} y1={Y(o.y)} x2={X(o.x) + 1.6} y2={Y(o.y) - len} stroke="#2b6cb0" strokeWidth={0.9} />
              </g>
            );
          }
          // తలుపు: కుడ్యంపై ఖాళీ + తిరిగే ఆర్చ్
          if (o.side === 'N' || o.side === 'S') {
            const yy = Y(o.y);
            const down = o.side === 'N' ? 1 : -1;
            return (
              <g key={`o-${i}`}>
                <rect x={X(o.x)} y={yy - 1.6} width={len} height={3.2} fill="#ffffff" />
                <path
                  d={`M ${X(o.x)} ${yy} L ${X(o.x)} ${yy + down * len} A ${len} ${len} 0 0 ${down > 0 ? 1 : 0} ${X(o.x) + len} ${yy}`}
                  fill="none"
                  stroke="#7b341e"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              </g>
            );
          }
          const xx = X(o.x);
          const right = o.side === 'E' ? -1 : 1;
          return (
            <g key={`o-${i}`}>
              <rect x={xx - 1.6} y={Y(o.y) - len} width={3.2} height={len} fill="#ffffff" />
              <path
                d={`M ${xx} ${Y(o.y)} L ${xx + right * len} ${Y(o.y)} A ${len} ${len} 0 0 ${right > 0 ? 1 : 0} ${xx} ${Y(o.y) - len}`}
                fill="none"
                stroke="#7b341e"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            </g>
          );
        })}

      {/* అద్దె యూనిట్ సరిహద్దులు */}
      {plan.units.map((u) => (
        <g key={`u-${u.index}`}>
          {rectEl(u.rect, { fill: 'none', stroke: '#2b6cb0', strokeWidth: 2, strokeDasharray: '8 3' })}
          <text x={X(u.rect.x) + 5} y={Y(u.rect.y, u.rect.h) + 13} fontSize={9} fill="#2b6cb0" fontWeight={700}>
            {isTe ? u.labelTe : (u.labelEn ?? `Rental unit ${u.index}`)} · {u.areaSqft} {isTe ? 'చ.అ.' : 'sq.ft.'}
          </text>
        </g>
      ))}

      {/* పార్కింగ్ */}
      {plan.parking.map((p, i) => (
        <g key={`p-${i}`}>
          {rectEl(p, { fill: 'url(#vpdPark)', stroke: '#718096', strokeWidth: 0.9 })}
          <text
            x={X(p.x + p.w / 2)}
            y={Y(p.y, p.h) + (p.h * S) / 2 + 3}
            textAnchor="middle"
            fontSize={Math.min(9, p.w * S * 0.24)}
            fill="#4a5568"
          >
            {isTe ? 'పార్కింగ్' : 'Parking'}
          </text>
        </g>
      ))}

      {/* సౌకర్యాలు: ట్యాంక్ / సంప్ / సెప్టిక్ — చిన్న గుర్తులు */}
      {plan.features.map((f) => {
        const cx = X(f.rect.x + f.rect.w / 2);
        const cy = Y(f.rect.y, f.rect.h) + (f.rect.h * S) / 2;
        const letter = isTe
          ? f.key === 'overhead'
            ? 'ట'
            : f.key === 'sump'
              ? 'స'
              : 'ప'
          : f.key === 'overhead'
            ? 'T'
            : f.key === 'sump'
              ? 'S'
              : 'P';
        return (
          <g key={f.key}>
            <circle cx={cx} cy={cy} r={6.5} fill="#ffffff" stroke="#2d3748" strokeWidth={1} />
            <text x={cx} y={cy + 2.6} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#2d3748">
              {letter}
            </text>
            <title>{`${isTe ? f.labelTe : f.labelEn} — ${isTe ? f.noteTe : f.noteEn}`}</title>
          </g>
        );
      })}

      {/* ప్రవేశ ద్వారం */}
      <g>
        <circle cx={entrancePt.x} cy={entrancePt.y} r={4.2} fill="#c05621" stroke="#7b341e" strokeWidth={1} />
        <line
          x1={entrancePt.x}
          y1={entrancePt.y}
          x2={entrancePt.x + (plan.plot.roadSide === 'E' ? 16 : plan.plot.roadSide === 'W' ? -16 : 0)}
          y2={entrancePt.y + (plan.plot.roadSide === 'N' ? -16 : plan.plot.roadSide === 'S' ? 16 : 0)}
          stroke="#7b341e"
          strokeWidth={1.4}
          markerEnd="url(#vpdArrow)"
        />
        <text
          x={entrancePt.x + (plan.plot.roadSide === 'E' ? 20 : plan.plot.roadSide === 'W' ? -20 : 0)}
          y={entrancePt.y + (plan.plot.roadSide === 'N' ? 22 : plan.plot.roadSide === 'S' ? -12 : -8)}
          textAnchor={plan.plot.roadSide === 'E' ? 'start' : plan.plot.roadSide === 'W' ? 'end' : 'middle'}
          fontSize={9}
          fill="#7b341e"
          fontWeight={700}
        >
          {isTe ? 'ప్రవేశం' : 'Entrance'}
        </text>
      </g>

      {/* ఉత్తర బాణం */}
      <g transform={`translate(${X(W) - 22} ${padTop + 8})`}>
        <rect x={-16} y={-4} width={32} height={44} rx={3} fill="#ffffff" fillOpacity={0.9} stroke="#cbd5e0" strokeWidth={0.6} />
        <line x1={0} y1={26} x2={0} y2={4} stroke="#1a202c" strokeWidth={1.8} markerEnd="url(#vpdArrow)" />
        <text x={0} y={16} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#1a202c">
          N
        </text>
        <text x={0} y={36} textAnchor="middle" fontSize={6.5} fill="#4a5568">
          {isTe ? 'ఉత్తరం' : 'North'}
        </text>
      </g>

      {/* కొలతలు */}
      {showDimensions && (
        <g fill="#2d3748" fontSize={9}>
          <line x1={X(0)} y1={padTop + D * S + 16} x2={X(W)} y2={padTop + D * S + 16} stroke="#a0aec0" strokeWidth={0.8} markerStart="url(#vpdArrow)" markerEnd="url(#vpdArrow)" />
          <text x={X(W / 2)} y={padTop + D * S + 30} textAnchor="middle" fontWeight={600}>
            {isTe ? 'వెడల్పు' : 'Width'} {ftIn(W)} ({plan.plot.areaSqft} {isTe ? 'చ.అ.' : 'sq.ft.'})
          </text>
          <line x1={padLeft - 20} y1={padTop} x2={padLeft - 20} y2={padTop + D * S} stroke="#a0aec0" strokeWidth={0.8} markerStart="url(#vpdArrow)" markerEnd="url(#vpdArrow)" />
          <text x={padLeft - 26} y={padTop + (D * S) / 2} textAnchor="middle" fontWeight={600} transform={`rotate(-90 ${padLeft - 26} ${padTop + (D * S) / 2})`}>
            {isTe ? 'లోతు' : 'Depth'} {ftIn(D)} · {plan.plot.areaGunta} {isTe ? 'గుంట' : 'gunta'}
          </text>
        </g>
      )}

      {/* స్కేల్ బార్ */}
      <g transform={`translate(${svgW - padRight - 10 - scaleFt * S} ${svgH - 30})`}>
        <line x1={0} y1={0} x2={scaleFt * S} y2={0} stroke="#1a202c" strokeWidth={2} />
        <line x1={0} y1={-4} x2={0} y2={4} stroke="#1a202c" strokeWidth={1.5} />
        <line x1={scaleFt * S} y1={-4} x2={scaleFt * S} y2={4} stroke="#1a202c" strokeWidth={1.5} />
        <text x={scaleFt * S / 2} y={-9} textAnchor="middle" fontSize={8.5} fill="#2d3748">
          {isTe ? 'స్కేల్' : 'Scale'}: {scaleFt}′
        </text>
      </g>

      {/* అనుకూలత సూచిక */}
      <g transform={`translate(${padLeft} ${svgH - 30})`} fontSize={8.5} fill="#2d3748">
        <rect x={0} y={-8} width={9} height={9} fill={FIT_FILL.best} stroke={FIT_STROKE.best} />
        <text x={13} y={0}>{isTe ? 'అనుకూలం' : 'Best'}</text>
        <rect x={64} y={-8} width={9} height={9} fill={FIT_FILL.ok} stroke={FIT_STROKE.ok} />
        <text x={77} y={0}>{isTe ? 'సరిపోయింది' : 'OK'}</text>
        <rect x={140} y={-8} width={9} height={9} fill={FIT_FILL.bad} stroke={FIT_STROKE.bad} />
        <text x={153} y={0}>{isTe ? 'సరిదిద్దాలి' : 'To fix'}</text>
      </g>

      {/* శీర్షిక */}
      <g transform={`translate(${padLeft} 16)`} fontSize={10} fill="#1a202c">
        <text x={0} y={0} fontSize={13} fontWeight={700}>
          {plan.client.nameTe
            ? isTe
              ? `${plan.client.nameTe} గారి వాస్తు ప్లాన్`
              : `Vastu plan — ${plan.client.nameEn || plan.client.nameTe}`
            : isTe
              ? 'వాస్తు ప్లాన్ (స్థూల నమూనా)'
              : 'Vastu plan (concept)'}
        </text>
        <text x={0} y={15} fontSize={9} fill="#4a5568">
          {plan.client.villageTe ? `${isTe ? plan.client.villageTe : plan.client.villageEn || plan.client.villageTe} · ` : ''}
          {plan.plot.widthFt}′ × {plan.plot.depthFt}′ · {plan.plot.areaGunta} {isTe ? 'గుంట' : 'gunta'} · {plan.capacity.floors}{' '}
          {isTe ? 'అంతస్తులు' : 'floors'} · BUA {plan.capacity.totalBuaSqft} {isTe ? 'చ.అ.' : 'sq.ft.'}
        </text>
      </g>

      {/* నిబంధనల హెచ్చరిక — డ్రాయింగ్‌పైనే */}
      <text x={padLeft} y={svgH - 4} textAnchor="start" fontSize={7.2} fill="#718096">
        {isTe
          ? 'సెట్‌బ్యాక్/FSI సూచనాత్మకం — స్థానిక MRO/DTCP అనుమతి ప్రకారం నిర్ధారించుకోండి'
          : 'Setbacks/FSI are indicative — verify with local MRO/DTCP approval'}
      </text>
    </svg>
  );
}
