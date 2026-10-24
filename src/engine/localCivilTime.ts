export interface LocalCivilTimeResolution {
  instant: Date;
  offsetHours: number;
  candidates: Date[];
}

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

function zonedParts(timeZone: string, instantMs: number) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(instantMs));
  const value = (key: string) => Number(parts.find((part) => part.type === key)?.value);
  return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour'), minute: value('minute'), second: value('second') };
}

function offsetAt(timeZone: string, instantMs: number): number {
  const p = zonedParts(timeZone, instantMs);
  const representedUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (representedUtc - Math.floor(instantMs / 1000) * 1000) / 3_600_000;
}

/**
 * Resolve a local clock reading using the location's IANA timezone rules.
 * DST gaps are rejected. Repeated fall-back times require an explicit offset
 * to disambiguate; callers may pass the recorded offset as `preferredOffsetHours`.
 */
export function resolveLocalCivilTime(
  date: string,
  time: string,
  timeZone: string,
  preferredOffsetHours?: number,
): LocalCivilTimeResolution {
  const dm = datePattern.exec(date);
  const tm = timePattern.exec(time);
  if (!dm || !tm) throw new Error('Birth date/time must be YYYY-MM-DD and HH:mm[:ss].');
  const [, ys, mos, ds] = dm;
  const [, hs, mis, ss = '0'] = tm;
  const [year, month, day, hour, minute, second] = [ys, mos, ds, hs, mis, ss].map(Number);
  const wallUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  // Reject impossible civil dates (Date.UTC normalizes them otherwise).
  const check = new Date(wallUtc);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error('Birth date is not a valid calendar date.');
  }
  // Validate the zone and sample offsets on both sides of possible transitions.
  zonedParts(timeZone, wallUtc);
  const offsets = new Set<number>();
  for (let deltaHours = -48; deltaHours <= 48; deltaHours += 3) {
    offsets.add(offsetAt(timeZone, wallUtc + deltaHours * 3_600_000));
  }
  const expected = `${year}-${month}-${day}-${hour}-${minute}-${second}`;
  const candidates = [...offsets]
    .map((offset) => ({ offset, instant: wallUtc - offset * 3_600_000 }))
    .filter(({ instant }) => {
      const p = zonedParts(timeZone, instant);
      return `${p.year}-${p.month}-${p.day}-${p.hour}-${p.minute}-${p.second}` === expected;
    })
    .sort((a, b) => a.instant - b.instant);

  if (candidates.length === 0) {
    throw new Error(`Local time ${date} ${time} does not exist in ${timeZone} because of a clock change.`);
  }
  let chosen = candidates[0];
  if (candidates.length > 1) {
    const preferred = candidates.find((candidate) => Math.abs(candidate.offset - (preferredOffsetHours ?? NaN)) < 1 / 3600);
    if (!preferred) {
      throw new Error(`Local time ${date} ${time} is ambiguous in ${timeZone}; provide the recorded UTC offset to choose the correct occurrence.`);
    }
    chosen = preferred;
  }
  return { instant: new Date(chosen.instant), offsetHours: chosen.offset, candidates: candidates.map((item) => new Date(item.instant)) };
}
