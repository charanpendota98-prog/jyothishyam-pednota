"""
make-panchanga-golden.py — సూర్యోదయ క్షణంలోని పంచాంగ అంగాల గోల్డెన్ ఫిక్చర్
================================================================================
స్విస్ ఎఫెమెరిస్ 2.10.03, SIDM_LAHIRI, భూకేంద్రం. హైదరాబాద్ (17.385 N,
78.4867 E, tz +5.5) కు 2026 సంవత్సరంలోని ప్రతి రోజు:

  • సూర్యోదయం — SE `rise_trans` డిఫాల్ట్ (బింబపు ఎగువ అంచు + 34′ వక్రీభవనం,
    1013.25 hPa, 15 °C, సముద్ర మట్టం). ఇదే దృక్ పంచాంగ ప్రమాణం.
  • ఆ క్షణంలో తిథి (1–30), నక్షత్రం (1–27), యోగం (1–27).

ఉపయోగం:
    python3 -m venv .venv-swe && .venv-swe/bin/pip install pyswisseph
    .venv-swe/bin/python scripts/golden/make-panchanga-golden.py
    npm run verify:panchanga
"""

import json
import os
from datetime import datetime, timedelta

import swisseph as swe

swe.set_sid_mode(swe.SIDM_LAHIRI)
LAT, LON, TZ = 17.385, 78.4867, 5.5
YEAR = 2026
FLAGS = swe.FLG_SWIEPH | swe.FLG_SIDEREAL


def local_hhmm(jd_ut: float) -> str:
    # JD భిన్నం 0.5 = UT అర్ధరాత్రి; +0.5 చేసి గడియార సమయానికి మార్చాలి.
    secs = int(round(((jd_ut + 0.5) % 1.0) * 86400 + TZ * 3600)) % 86400
    return f"{secs // 3600:02d}:{(secs % 3600) // 60:02d}"


def main() -> None:
    days = []
    d = datetime(YEAR, 1, 1)
    while d.year == YEAR:
        jd0 = swe.julday(d.year, d.month, d.day, 0.0)
        res, tret = swe.rise_trans(jd0, swe.SUN, swe.CALC_RISE, (LON, LAT, 0.0))
        if res != 0:
            raise RuntimeError(f"sunrise failed for {d.date()}")
        sr = tret[0]
        sun = swe.calc_ut(sr, swe.SUN, FLAGS)[0][0]
        moon = swe.calc_ut(sr, swe.MOON, FLAGS)[0][0]
        tithi = int(((moon - sun) % 360) / 12) + 1
        nak = int(moon / (360 / 27)) + 1
        yoga = int(((moon + sun) % 360) / (360 / 27)) + 1
        days.append(
            {
                "date": d.strftime("%Y-%m-%d"),
                "tithi": tithi,
                "nakshatra": nak,
                "yoga": yoga,
                "sunrise": local_hhmm(sr),
            }
        )
        d += timedelta(days=1)

    out = {
        "source": (
            "Swiss Ephemeris 2.10.03, SIDM_LAHIRI, geocentric, SE rise_trans default "
            "(upper limb + 34' refraction), Hyderabad 17.385N 78.4867E tz +5.5"
        ),
        "days": days,
    }
    path = os.path.join(os.path.dirname(__file__), "panchanga-hyderabad-2026.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(days)} days → {path}")


if __name__ == "__main__":
    main()
