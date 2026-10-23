#!/usr/bin/env python3
"""
scripts/generate-drik-golden.py
-------------------------------
డ్రిక్ పంచాంగ ప్రమాణ పత్రాన్ని (golden fixture) తయారు చేసే స్క్రిప్ట్.

ఎందుకు ఇది repo లో ఉంది: "మా గేట్ ఏ ప్రమాణంతో నడుస్తుంది" అనేది తిరిగి
తయారు చేయగలిగితేనే నమ్మదగినది. ఈ ఫైలు `drik-panchanga` ప్యాకేజీని
(అది స్విస్ ఎఫెమెరిస్‌ను హిందూ ఉదయ నిర్వచనంతో wrap చేస్తుంది) వాడి
`scripts/golden/drik-timing-golden.json` ను మళ్లీ రాస్తుంది.

    pip install drik-panchanga pyswisseph
    python3 scripts/generate-drik-golden.py

గమనిక (ఆడిట్ §15.4): ఈ ప్యాకేజీ లోపల స్విస్ ఎఫెమెరిస్ అయనాంశను
Fagan–Bradley (25.1146°) కి మారుస్తుంది, `chosen_ayanamsa='citra'` అని చెప్పినా.
అందుకే ఇక్కడి **ఉదయాస్తమయాలు, తిథి/నక్షత్ర/యోగ/కరణ సంఖ్యలు** ప్రమాణం;
స్పుటాలు మాత్రం ప్రమాణం కావు.
"""
import datetime
import json
import os

import panchanga as P
import swisseph as swe

CITIES = [
    ("హైదరాబాద్", 17.385, 78.4867, 5.5),
    ("విజయవాడ", 16.5062, 80.6480, 5.5),
    ("చెన్నై", 13.0827, 80.2707, 5.5),
    ("బెంగళూరు", 12.9716, 77.5946, 5.5),
    ("ముంబై", 19.0760, 72.8777, 5.5),
    ("ఢిల్లీ", 28.6139, 77.2090, 5.5),
    ("కోల్‌కతా", 22.5726, 88.3639, 5.5),
]

TZ = 5.5


def hm(jd):
    """UT JD → స్థానిక 'HH:MM' (తెలుగు ప్రమాణ పత్రంలో సమయం మాత్రమే)."""
    if not jd:
        return None
    y, m, d, h = swe.revjul(jd + TZ / 24.0)
    total = int(round(h * 60))
    return f"{total // 60:02d}:{total % 60:02d}"


def window(pair):
    if not pair:
        return None
    return [hm(pair[0]), hm(pair[1])]


def day_case(city, lat, lng, date):
    place = P.Place(lat, lng, TZ)
    jd0 = swe.julday(date.year, date.month, date.day, 0.0) - TZ / 24.0
    rise = P.sunrise(jd0, place)
    sett = P.sunset(jd0, place)
    tithi_i, tithi_end = P.tithi(jd0, place)[:2]
    nak_i, nak_end = P.nakshatra(jd0, place)[:2]
    yoga_i, yoga_end = P.yoga(jd0, place)[:2]
    kar_i, kar_end = P.karana(jd0, place)[:2]
    rahu = P.rahu_kalam(jd0, place)
    gulika = P.gulika_kalam(jd0, place)
    yama = P.yamaganda_kalam(jd0, place)
    abhijit = P.abhijit_muhurta(jd0, place)
    dur = P.durmuhurtam(jd0, place)
    varj = P.varjyam(jd0, place)
    return {
        "city": city,
        "date": date.isoformat(),
        "lat": lat,
        "lng": lng,
        "tz": TZ,
        "sunrise": hm(rise),
        "sunset": hm(sett),
        "moonrise": hm(P.moonrise(jd0, place)),
        "moonset": hm(P.moonset(jd0, place)),
        "tithiIndex": int(tithi_i),
        "tithiEnd": hm(tithi_end),
        "nakshatraIndex": int(nak_i),
        "nakshatraEnd": hm(nak_end),
        "yogaIndex": int(yoga_i),
        "yogaEnd": hm(yoga_end),
        "karanaIndex": int(kar_i),
        "karanaEnd": hm(kar_end),
        "rahuKalam": window(rahu),
        "gulikaKalam": window(gulika),
        "yamagandaKalam": window(yama),
        "abhijit": window(abhijit),
        "durmuhurtam": [window(w) for w in dur] if dur else [],
        "varjyam": [window(w) for w in varj] if varj else [],
    }


def main():
    cases = []
    # హైదరాబాద్: 2026 మొత్తం ప్రతి రోజు (365)
    hy = CITIES[0]
    d = datetime.date(2026, 1, 1)
    while d <= datetime.date(2026, 12, 31):
        cases.append(day_case(hy[0], hy[1], hy[2], d))
        d += datetime.timedelta(days=1)
    # మిగిలిన నగరాలు: ప్రతి 15 రోజులకు (2026)
    for city, lat, lng, _ in CITIES[1:]:
        d = datetime.date(2026, 1, 5)
        while d <= datetime.date(2026, 12, 31):
            cases.append(day_case(city, lat, lng, d))
            d += datetime.timedelta(days=15)

    out = {
        "source": "drik-panchanga (Swiss Ephemeris 2.10.03, BIT_HINDU_RISING) — "
        "ఉదయాస్తమయాలు, తిథి/నక్షత్ర/యోగ/కరణ సంఖ్యలు మరియు ముగింపు క్షణాలు, "
        "రాహు/గుళిక/యమగండ/అభిజిత్/దుర్ముహూర్త/వర్జ్య కాలాలు; స్థానిక సమయం (IST)",
        "generated": datetime.date.today().isoformat(),
        "cases": cases,
    }
    path = os.path.join(os.path.dirname(__file__), "golden", "drik-timing-golden.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print(f"{len(cases)} దినాలు → {path}")


if __name__ == "__main__":
    main()
