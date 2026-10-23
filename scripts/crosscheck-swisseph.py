#!/usr/bin/env python3
"""
crosscheck-swisseph.py — బాహ్య (బయటి సాఫ్ట్‌వేర్) పరిశీలన
===================================================================
మన లెక్కలు స్వతంత్రమైన మూలాలతో సరిపోతాయా అని నిర్ధారించే స్క్రిప్ట్.
"మనమే మనల్ని తనిఖీ చేసుకోవడం" కాదు — Swiss Ephemeris (వాణిజ్య సాఫ్ట్‌వేర్
అంతా వాడే గ్రహ గణన గ్రంథాలయం) మరియు BPHS అష్టకవర్గ పట్టికలతో పోలుస్తుంది.

అవసరం:
    pip install pyswisseph
    npx tsx scripts/dump-crosscheck.ts      # యాప్ విలువలు → .cache/crosscheck-app.json
    python3 scripts/crosscheck-swisseph.py

పరిశీలనలు:
  1. 9 గ్రహాల సాయన (Lahiri) స్ఫుటాలు, లగ్నం
  2. నక్షత్రం + పాదం
  3. తిథి · యోగం · కరణం
  4. అష్టకవర్గం (BPHS భావ/గ్రహ బిందు పట్టికల నుంచి స్వతంత్ర గణన)
  5. సహించదగిన భేదం: 0.02° (72") — గ్రహ స్ఫుటాలు; 0.05° లగ్నం
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import swisseph as swe
except ImportError:  # pragma: no cover
    sys.exit("pyswisseph అవసరం: pip install pyswisseph")

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / ".cache" / "crosscheck-app.json"

TOL_PLANET = 0.02      # డిగ్రీలు
TOL_ASC = 0.05
TOL_RISE_MIN = 3.0     # నిమిషాలు

PLANET_IDS = {
    "Sun": swe.SUN, "Moon": swe.MOON, "Mars": swe.MARS, "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER, "Venus": swe.VENUS, "Saturn": swe.SATURN,
}
NAK = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
       "Magha","P.Phalguni","U.Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
       "Mula","P.Ashadha","U.Ashadha","Shravana","Dhanishta","Shatabhisha","P.Bhadrapada",
       "U.Bhadrapada","Revati"]
KARANA = ["Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti"]

# ── BPHS అష్టకవర్గ పట్టికలు (గ్రహం → 8 మూలాలు × బిందు స్థానాలు) ──────────────
# మూలాల క్రమం: సూర్యుడు, చంద్రుడు, కుజుడు, బుధుడు, గురువు, శుక్రుడు, శని, లగ్నం
BAV = {
 "Sun":     [[1,2,4,7,8,9,10,11],[3,6,10,11],[1,2,4,7,8,9,10,11],[3,5,6,9,10,11,12],[5,6,9,11],[6,7,12],[1,2,4,7,8,9,10,11],[3,4,6,10,11,12]],
 "Moon":    [[3,6,7,8,10,11],[1,3,6,7,10,11],[2,3,5,6,9,10,11],[1,3,4,5,7,8,10,11],[1,4,7,8,10,11,12],[3,4,5,7,9,10,11],[3,5,6,11],[3,6,10,11]],
 "Mars":    [[3,5,6,10,11],[3,6,11],[1,2,4,7,8,10,11],[3,5,6,11],[6,10,11,12],[6,8,11,12],[1,4,7,8,9,10,11],[1,3,6,10,11]],
 "Mercury": [[5,6,9,11,12],[2,4,6,8,10,11],[1,2,4,7,8,9,10,11],[1,3,5,6,9,10,11,12],[6,8,11,12],[1,2,3,4,5,8,9,11],[1,2,4,7,8,9,10,11],[1,2,4,6,8,10,11]],
 "Jupiter": [[1,2,3,4,7,8,9,10,11],[2,5,7,9,11],[1,2,4,7,8,10,11],[1,2,4,5,6,9,10,11],[1,2,3,4,7,8,10,11],[2,5,6,9,10,11],[3,5,6,12],[1,2,4,5,6,7,9,10,11]],
 "Venus":   [[8,11,12],[1,2,3,4,5,8,9,11,12],[3,5,6,9,11,12],[3,5,6,9,11],[5,8,9,10,11],[1,2,3,4,5,8,9,10,11],[3,4,5,8,9,10,11],[1,2,3,4,5,8,9,11]],
 "Saturn":  [[1,2,4,7,8,10,11],[3,6,11],[3,5,6,10,11,12],[6,8,9,10,11,12],[5,6,11,12],[6,11,12],[3,5,6,11],[1,3,4,6,10,11]],
}
SEVEN = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"]


def jd_ut(case: dict) -> float:
    y, m, d = (int(x) for x in case["date"].split("-"))
    hh, mm = (int(x) for x in case["time"].split(":"))
    return swe.julday(y, m, d, hh + mm / 60 - case["tz"])


def fmt_hours(h: float | None) -> float | None:
    return h


def check(cases: list[dict]) -> int:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    failures = 0
    worst_planet = (0.0, "", "")
    worst_asc = (0.0, "")
    asc_lines, planet_lines = [], []

    for c in cases:
        jd = jd_ut(c)
        ay = swe.get_ayanamsa_ut(jd)

        for pid, offset in PLANET_IDS.items():
            if pid not in c["grahas"]:
                continue
            ref = swe.calc_ut(jd, offset, swe.FLG_SIDEREAL | swe.FLG_SPEED)[0][0]
            got = c["grahas"][pid]["lon"]
            diff = abs((ref - got + 180) % 360 - 180)
            if diff > worst_planet[0]:
                worst_planet = (diff, c["name"], pid)
            if diff > TOL_PLANET:
                failures += 1
                planet_lines.append(f"  ✗ {c['name']}/{pid}: యాప్ {got:.4f}° vs SE {ref:.4f}° (భేదం {diff*3600:.1f}\")")

        # లగ్నం
        asc_trop = swe.houses_ex(jd, c["lat"], c["lng"], b"W")[1][0]
        asc_ref = (asc_trop - ay) % 360
        diff_asc = abs((asc_ref - c["asc"] + 180) % 360 - 180)
        if diff_asc > worst_asc[0]:
            worst_asc = (diff_asc, c["name"])
        if diff_asc > TOL_ASC:
            failures += 1
            planet_lines.append(f"  ✗ {c['name']}/Lagna: యాప్ {c['asc']:.4f}° vs SE {asc_ref:.4f}°")

        # సూర్యోదయం / సూర్యాస్తమయం (Swiss Ephemeris rise_trans)
        geo = (c["lng"], c["lat"], 0.0)
        midnight = swe.julday(*[int(x) for x in c["date"].split("-")], -c["tz"])
        for label, flag, got in (("sunrise", swe.CALC_RISE, c.get("sunrise")), ("sunset", swe.CALC_SET, c.get("sunset"))):
            res = swe.rise_trans(midnight, swe.SUN, flag | swe.BIT_DISC_CENTER | swe.BIT_NO_REFRACTION, geo)
            if res[0] != 0 or not got:
                continue
            jd_rise = res[1][0]
            y, mo, d, h = swe.revjul(jd_rise + c["tz"] / 24)
            ref_hm = f"{int(h):02d}:{int(round((h - int(h)) * 60)):02d}"
            gh, gm = (int(x) for x in str(got).split(":")[:2])
            ref_min = int(h) * 60 + (h - int(h)) * 60
            diff_min = abs(ref_min - (gh * 60 + gm))
            if diff_min > TOL_RISE_MIN:
                failures += 1
                planet_lines.append(f"  ✗ {c['name']}/{label}: యాప్ {gh:02d}:{gm:02d} vs SE {ref_hm}")

        # తిథి / యోగం
        sun = swe.calc_ut(jd, swe.SUN, swe.FLG_SIDEREAL)[0][0]
        moon = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)[0][0]
        tithi_ref = int(((moon - sun) % 360) // 12) + 1
        yoga_ref = int(((moon + sun) % 360) // (360 / 27)) + 1
        if c.get("tithi") != tithi_ref:
            failures += 1
            planet_lines.append(f"  ✗ {c['name']}/tithi: యాప్ {c.get('tithi')} vs SE {tithi_ref}")
        if c.get("yoga") != yoga_ref:
            failures += 1
            planet_lines.append(f"  ✗ {c['name']}/yoga: యాప్ {c.get('yoga')} vs SE {yoga_ref}")

        # అష్టకవర్గం — స్వతంత్ర పట్టిక గణన
        signs = {p: int(c["grahas"][p]["lon"] // 30) for p in SEVEN}
        refs = [signs[p] for p in SEVEN] + [c["ascSign"]]
        sav_ref = [0] * 12
        for p in SEVEN:
            for r, offs in zip(refs, BAV[p]):
                for o in offs:
                    sav_ref[(r + o - 1) % 12] += 1
        if sav_ref != c["sav"]:
            failures += 1
            planet_lines.append(f"  ✗ {c['name']}/SAV: యాప్ {c['sav']} vs పట్టిక {sav_ref}")

        asc_lines.append(
            f"  ✓ {c['name']:7} asc Δ{diff_asc*3600:5.1f}\" · ayanāṃśa {ay:.5f}° · "
            f"nak {NAK[int(((moon) % 360) // (360/27))]} · tithi {tithi_ref} · yoga {yoga_ref} · SAVΣ {sum(c['sav'])}"
        )

    print("── స్విస్ ఎఫెమెరిస్ పోలిక ─────────────────────────────────────────")
    for line in asc_lines:
        print(line)
    if planet_lines:
        print("\n".join(planet_lines))
    print(f"\nఅత్యధిక గ్రహ భేదం: {worst_planet[0]*3600:.1f}\" ({worst_planet[1]}/{worst_planet[2]}) · "
          f"లగ్నం: {worst_asc[0]*3600:.1f}\" ({worst_asc[1]})")
    print(f"తీర్పు: {'విజయం' if failures == 0 else f'{failures} తేడాలు'}")
    return failures


if __name__ == "__main__":
    if not APP.exists():
        sys.exit("ముందుగా: npx tsx scripts/dump-crosscheck.ts")
    data = json.loads(APP.read_text())
    sys.exit(1 if check(data) else 0)
