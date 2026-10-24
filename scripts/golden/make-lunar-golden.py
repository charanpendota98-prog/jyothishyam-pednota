"""
make-lunar-golden.py — అమావాస్యలు, సంక్రాంతులు & అధిక మాసాల గోల్డెన్ ఫిక్చర్
=================================================================================
తెలుగు (అమాంత) పంచాంగంలో నెల పేరు, అధిక మాసం, ఉగాది — అన్నీ రెండు
ఖగోళ ఘటనలపై ఆధారపడతాయి:

  • అమావాస్య (Sun–Moon elongation = 0°)
  • సంక్రమణి (సూర్యుడు నిరయన రాశిలోకి ప్రవేశించే క్షణం)

ఈ స్క్రిప్ట్ స్విస్ ఎఫెమెరిస్ 2.10.03 తో, 2023–2030 మధ్య:
  1. ప్రతి అమావాస్య క్షణం (JD, UT)
  2. ప్రతి నిరయన సంక్రమణి క్షణం + రాశి
  3. ప్రతి చాంద్రమాసానికి మాస పేరు + అధికమా కాదా (అమాంత పద్ధతి)
ని తయారు చేస్తుంది. యాప్ `resolveMasa`, `newMoonBeforeJd`, `sankrantiJd`
ఫంక్షన్లను ఇదే ఫిక్చర్‌తో పోలుస్తాము.

ఉపయోగం:
    python3 -m venv .venv-swe && .venv-swe/bin/pip install pyswisseph
    .venv-swe/bin/python scripts/golden/make-lunar-golden.py
    npm run verify:calendar
"""

import swisseph as swe
import json
import os
from datetime import datetime

swe.set_sid_mode(swe.SIDM_LAHIRI)
FLAGS = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

START_YEAR, END_YEAR = 2023, 2030

# అమాంత మాస క్రమం (తెలుగు): చైత్రము → ఫాల్గుణము
MASA = [
    ("Chaitra", "చైత్రము"), ("Vaishakha", "వైశాఖము"), ("Jyeshtha", "జ్యేష్ఠము"),
    ("Ashadha", "ఆషాఢము"), ("Shravana", "శ్రావణము"), ("Bhadrapada", "భాద్రపదము"),
    ("Ashwayuja", "ఆశ్వయుజము"), ("Kartika", "కార్తీకము"), ("Margashira", "మార్గశిరము"),
    ("Pushya", "పుష్యము"), ("Magha", "మాఘము"), ("Phalguna", "ఫాల్గుణము"),
]
RASI = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
        "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"]


def jd_utc_year(year):
    return swe.julday(year, 1, 1, 0.0, swe.GREG_CAL)


def iso_of(jd):
    y, m, d, h = swe.revjul(jd, swe.GREG_CAL)
    secs = int(round(h * 3600))
    if secs >= 86400:
        secs -= 86400
        jd += 1
        y, m, d, h = swe.revjul(jd, swe.GREG_CAL)
    return f"{y:04d}-{m:02d}-{d:02d} {secs // 3600:02d}:{(secs % 3600) // 60:02d}:{secs % 60:02d}"


start = jd_utc_year(START_YEAR) - 40
end = jd_utc_year(END_YEAR + 1) + 40

# --- every new moon in the window (manual root-finding on elongation) ---
new_moons = []
def elongation(jd):
    sun, _ = swe.calc_ut(jd, swe.SUN, FLAGS)
    moon, _ = swe.calc_ut(jd, swe.MOON, FLAGS)
    return (moon[0] - sun[0]) % 360.0


def find_new_moon_after(jd_start):
    jd = jd_start
    step = 0.5
    prev = elongation(jd)
    while jd < end + 5:
        nxt_jd = jd + step
        cur = elongation(nxt_jd)
        # elongation decreases across 0/360 boundary
        if cur < prev or (prev > 350 and cur < 10):
            lo, hi = jd, nxt_jd
            for _ in range(60):
                mid = (lo + hi) / 2
                e = elongation(mid)
                # near the boundary: treat >180 as negative
                if e > 180:
                    lo = mid
                else:
                    hi = mid
            return (lo + hi) / 2
        prev = cur
        jd = nxt_jd
    return None


nm = find_new_moon_after(start)
while nm is not None and nm < end:
    new_moons.append(nm)
    nm = find_new_moon_after(nm + 1.0)

# --- every sidereal sankranti in the window ---
def sun_sid(jd):
    x, _ = swe.calc_ut(jd, swe.SUN, FLAGS)
    return x[0]


sankrantis = []
jd = start
prev_sign = int(sun_sid(jd) // 30)
safety = 0
while jd < end and safety < 6000:
    safety += 1
    nxt = jd + 1.0
    sign = int(sun_sid(nxt) // 30)
    if sign != prev_sign:
        target = sign * 30.0
        a, b = jd, nxt
        for _ in range(70):
            mid = (a + b) / 2
            if ((sun_sid(mid) - target) % 360) > 180:
                a = mid
            else:
                b = mid
        found = (a + b) / 2
        sankrantis.append({
            "signIndex": sign, "jd": found, "rasi": RASI[sign], "utc": iso_of(found),
        })
    prev_sign = sign
    jd = nxt

# --- lunar months (amanta) ---
months = []
for i in range(len(new_moons) - 1):
    nm1, nm2 = new_moons[i], new_moons[i + 1]
    inside = [s for s in sankrantis if nm1 < s["jd"] < nm2]
    if inside:
        # Mesha sankranti → Chaitra (index 0)
        idx = inside[0]["signIndex"] % 12
        months.append({
            "startJd": round(nm1, 6), "endJd": round(nm2, 6),
            "startUTC": iso_of(nm1),
            "masaIndex": idx, "masaEn": MASA[idx][0], "masaTe": MASA[idx][1],
            "isAdhika": False, "ingressSignIndex": inside[0]["signIndex"],
            "ingressUTC": inside[0]["utc"],
            "endUTC": iso_of(nm2),
        })
    else:
        # అధిక మాసం — తరువాతి లునేషన్ లోని సంక్రమణి పేరు వస్తుంది
        after = [s for s in sankrantis if nm2 < s["jd"] < (new_moons[i + 2] if i + 2 < len(new_moons) else nm2 + 30)]
        idx = after[0]["signIndex"] % 12 if after else int(sun_sid(nm2) // 30) % 12
        months.append({
            "startJd": round(nm1, 6), "endJd": round(nm2, 6),
            "startUTC": iso_of(nm1),
            "masaIndex": idx, "masaEn": MASA[idx][0], "masaTe": MASA[idx][1],
            "isAdhika": True, "ingressSignIndex": None,
            "ingressUTC": None,
            "endUTC": iso_of(nm2),
        })

# --- ఉగాది (చైత్ర శుక్ల ప్రతిపద) — హైదరాబాద్ సూర్యోదయ నియమం ---
HYD = (78.4867, 17.3850, 5.5)


def tithi_at(jd):
    sun, _ = swe.calc_ut(jd, swe.SUN, FLAGS)
    moon, _ = swe.calc_ut(jd, swe.MOON, FLAGS)
    return int(((moon[0] - sun[0]) % 360.0) // 12)


def sunrise_on(date_str):
    y, m, d = [int(x) for x in date_str.split("-")]
    jd0 = swe.julday(y, m, d, -HYD[2], swe.GREG_CAL)
    res, tret = swe.rise_trans(jd0, swe.SUN, swe.CALC_RISE, (HYD[0], HYD[1], 0.0))
    return tret[0] if res == 0 else None


ugadi = []
for m in months:
    if m["masaIndex"] != 0 or m["isAdhika"]:
        continue  # చైత్రము (అధిక చైత్రము కాదు)
    # ప్రతిపద సూర్యోదయం కోసం కొన్ని రోజులు ముందుకు
    jd = m["startJd"] - 1.0
    found = False
    for _ in range(6):
        date_str = iso_of(jd)[:10]
        sr = sunrise_on(date_str)
        if sr is not None and tithi_at(sr) == 0:
            ugadi.append({"date": date_str, "sunriseJd": round(sr, 6), "utc": iso_of(sr)})
            found = True
            break
        jd += 1.0
    if not found:
        # క్షయ ప్రతిపద — ప్రతిపద ఏ దినం మొదలవుతుందో ఆ దినమే ఉగాది
        local = swe.revjul(m["startJd"] + HYD[2] / 24.0, swe.GREG_CAL)
        date_str = f"{local[0]:04d}-{local[1]:02d}-{local[2]:02d}"
        sr = sunrise_on(date_str)
        ugadi.append({"date": date_str, "sunriseJd": round(sr, 6) if sr else None, "utc": iso_of(sr) if sr else None, "kshaya": True})

out = {
    "source": f"Swiss Ephemeris {swe.version}, FLG_SWIEPH, SIDM_LAHIRI — amanta lunar months",
    "generated_by": "scripts/golden/make-lunar-golden.py",
    "newMoons": [{"jd": round(x, 6), "utc": iso_of(x)} for x in new_moons],
    "sankrantis": [{**s, "jd": round(s["jd"], 6)} for s in sankrantis],
    "months": months,
    "adhikaMonths": [m for m in months if m["isAdhika"]],
    "ugadi": ugadi,
}

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lunar-golden.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f)
print("new moons:", len(new_moons), "sankrantis:", len(sankrantis),
      "months:", len(months), "adhika:", len(out["adhikaMonths"]), "ugadi:", len(ugadi))
for m in out["adhikaMonths"]:
    print("  adhika:", m["masaEn"], m["startUTC"], "→", m["endUTC"])
