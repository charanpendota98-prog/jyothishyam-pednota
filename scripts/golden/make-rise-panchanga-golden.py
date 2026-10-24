"""
make-rise-panchanga-golden.py — సూర్యోదయ/అస్తమయ + పంచాంగ అంగాల గోల్డెన్ ఫిక్చర్
================================================================================
ఈ స్క్రిప్ట్ స్విస్ ఎఫెమెరిస్ 2.10.03 నుండి, ప్రపంచంలోని 20 నగరాలకు,
2025–2027 మధ్య విస్తరించిన తేదీలకు ఈ క్రింది సూచన విలువలను తయారు చేస్తుంది:

  • సూర్యోదయం / సూర్యాస్తమయం (SE `rise_trans`, ఎగువ అంచు + 34′ వక్రీభవనం —
    భారతీయ పంచాంగ ప్రమాణం; డ్రిక్ పంచాంగ్ వాడే అదే నిర్వచనం)
  • చంద్రోదయం / చంద్రాస్తమయం
  • సూర్యోదయ క్షణంలో తిథి, నక్షత్రం, యోగం, కరణం, వారం (సిడెరియల్, లహిరి)

ఉపయోగం:
    python3 -m venv .venv-swe && .venv-swe/bin/pip install pyswisseph
    .venv-swe/bin/python scripts/golden/make-rise-panchanga-golden.py
    npm run verify:calendar        # (లేదా) npm run verify:rise

గమనిక: సమయాలు స్థానిక గడియార సమయంలో (HH:MM:SS) నిల్వ చేయబడతాయి; పరీక్ష సెకన్లలో
సరిపోల్చుతుంది. SE `rise_trans` వాతావరణ పీడనం 1013.25 hPa, ఉష్ణోగ్రత 15°C,
సముద్ర మట్టం ఎత్తు (0 మీ) — ఇదే సూర్యసిద్ధాంత/దృక్ పంచాంగ సంప్రదాయం.
"""

import swisseph as swe
import json
import os
from datetime import datetime, timedelta

swe.set_sid_mode(swe.SIDM_LAHIRI)
FLAGS = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

CITIES = [
    # (name, lat, lon, tz hours, sample note)
    ("Hyderabad", 17.3850, 78.4867, 5.5),
    ("Delhi", 28.6139, 77.2090, 5.5),
    ("Chennai", 13.0827, 80.2707, 5.5),
    ("Mumbai", 19.0760, 72.8777, 5.5),
    ("Kolkata", 22.5726, 88.3639, 5.5),
    ("Bengaluru", 12.9716, 77.5946, 5.5),
    ("Visakhapatnam", 17.6868, 83.2185, 5.5),
    ("Tirupati", 13.6288, 79.4192, 5.5),
    ("Ahmedabad", 23.0225, 72.5714, 5.5),
    ("Jaipur", 26.9124, 75.7873, 5.5),
    ("Varanasi", 25.3176, 82.9739, 5.5),
    ("Kochi", 9.9312, 76.2673, 5.5),
    ("Guwahati", 26.1445, 91.7362, 5.5),
    ("Srinagar", 34.0837, 74.7973, 5.5),
    ("Kathmandu", 27.7172, 85.3240, 5.75),
    ("Dubai", 25.2048, 55.2708, 4.0),
    ("Singapore", 1.3521, 103.8198, 8.0),
    ("London", 51.5074, -0.1278, 0.0),
    ("New York", 40.7128, -74.0060, -5.0),
    ("Sydney", -33.8688, 151.2093, 10.0),
    ("Tokyo", 35.6762, 139.6503, 9.0),
    ("Nairobi", -1.2921, 36.8219, 3.0),
    ("Reykjavik", 64.1466, -21.9426, 0.0),
    ("Ushuaia", -54.8019, -68.3030, -3.0),
]

DATES = [
    "2025-01-14", "2025-03-14", "2025-06-21", "2025-09-07", "2025-10-21", "2025-12-21",
    "2026-01-01", "2026-01-15", "2026-02-15", "2026-03-19", "2026-04-14", "2026-05-01",
    "2026-06-21", "2026-07-16", "2026-08-15", "2026-09-14", "2026-10-22", "2026-11-08",
    "2026-12-21", "2027-01-15", "2027-03-09", "2027-04-14",
]

SUN_RISE = swe.CALC_RISE
SUN_SET = swe.CALC_SET


def jd_of_local(date_str: str, tz: float, hour: float = 0.0) -> float:
    d = datetime.strptime(date_str, "%Y-%m-%d")
    y, m, day = d.year, d.month, d.day
    return swe.julday(y, m, day, hour - tz, swe.GREG_CAL)


def local_iso(jd: float, tz: float) -> str:
    """JD(UT) → స్థానిక ISO 'YYYY-MM-DD HH:MM:SS'."""
    y, m, d, h = swe.revjul(jd, swe.GREG_CAL)
    total = h + tz
    day_shift = 0
    while total >= 24:
        total -= 24
        day_shift += 1
    while total < 0:
        total += 24
        day_shift -= 1
    secs = int(round(total * 3600))
    if secs >= 86400:
        secs -= 86400
        day_shift += 1
    dt = datetime(y, m, d) + timedelta(days=day_shift)
    return f"{dt.strftime('%Y-%m-%d')} {secs // 3600:02d}:{(secs % 3600) // 60:02d}:{secs % 60:02d}"


def rise_set(jd_start: float, body: int, rsmi: int, lon: float, lat: float):
    res, tret = swe.rise_trans(jd_start, body, rsmi, (lon, lat, 0.0))
    if res != 0:
        return None
    return tret[0]


def angas(jd: float):
    sun, _ = swe.calc_ut(jd, swe.SUN, FLAGS)
    moon, _ = swe.calc_ut(jd, swe.MOON, FLAGS)
    elong = (moon[0] - sun[0]) % 360.0
    tithi = int(elong // 12)
    nakshatra = int(moon[0] // (360 / 27))
    yoga = int(((sun[0] + moon[0]) % 360) // (360 / 27))
    karana = min(59, int(elong // 6))
    return {
        "tithi": tithi,
        "nakshatra": nakshatra,
        "yoga": yoga,
        "karana": karana,
        "moonLon": round(moon[0], 6),
        "sunLon": round(sun[0], 6),
    }


rows = []
for city, lat, lon, tz in CITIES:
    for date_str in DATES:
        jd0 = jd_of_local(date_str, tz, 0.0)
        sunrise = rise_set(jd0, swe.SUN, SUN_RISE, lon, lat)
        if sunrise is None:
            continue
        sunset = rise_set(jd0, swe.SUN, SUN_SET, lon, lat)
        # చంద్రోదయం/అస్తమయం — సూర్యోదయం నుండి (పంచాంగ దిన ప్రమాణం)
        moonrise = rise_set(sunrise, swe.MOON, swe.CALC_RISE, lon, lat)
        moonset = rise_set(sunrise, swe.MOON, swe.CALC_SET, lon, lat)
        a = angas(sunrise)
        wd = int((swe.day_of_week(sunrise + tz / 24.0) + 0.5)) % 7  # 0=Sunday
        rows.append({
            "city": city,
            "date": date_str,
            "lat": lat,
            "lon": lon,
            "tz": tz,
            "jdSunrise": round(sunrise, 6),
            "sunrise": local_iso(sunrise, tz),
            "sunset": local_iso(sunset, tz) if sunset else None,
            "moonrise": local_iso(moonrise, tz) if moonrise else None,
            "moonset": local_iso(moonset, tz) if moonset else None,
            **a,
        })

out = {
    "source": f"Swiss Ephemeris {swe.version}, FLG_SWIEPH, SIDM_LAHIRI, rise_trans (upper limb + 34' refraction, 0 m)",
    "generated_by": "scripts/golden/make-rise-panchanga-golden.py",
    "cities": sorted({r["city"] for r in rows}),
    "cases": rows,
}

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rise-panchanga-golden.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f)
print("cases:", len(rows), "cities:", len(out["cities"]), "size:", len(json.dumps(out)) // 1024, "KB")
