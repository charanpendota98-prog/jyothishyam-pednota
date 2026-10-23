import swisseph as swe, json, random

swe.set_sid_mode(swe.SIDM_LAHIRI)
FLAGS = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

# bodies as used by the app (true node for Rahu/Ketu)
BODIES = [
    ("Sun", swe.SUN), ("Moon", swe.MOON), ("Mars", swe.MARS), ("Mercury", swe.MERCURY),
    ("Jupiter", swe.JUPITER), ("Venus", swe.VENUS), ("Saturn", swe.SATURN), ("Rahu", swe.TRUE_NODE),
]

CASES = [
    # (iso_utc, lat, lon, label)
    ("2026-10-22T17:25:00", 17.3843, 78.4583, "mkjxc 2026-10-22 22:55 IST Hyderabad"),
    ("1998-05-14T03:15:00", 17.3850, 78.4867, "Charan 1998-05-14 08:45 IST Hyderabad"),
    ("1947-08-14T18:30:00", 28.6519, 77.2315, "Nadi sample 1947-08-15 00:00 IST Delhi"),
    ("1988-09-21T04:48:00", 29.1024, 75.9625, "Year forecast 1988-09-21 10:18 IST Hansi"),
    ("2000-01-01T12:00:00", 51.4779, 0.0000, "J2000 Greenwich"),
    ("1900-06-15T00:00:00", 13.0827, 80.2707, "1900 Chennai"),
    ("1950-03-21T06:00:00", 23.1765, 75.7885, "Ujjain 1950"),
    ("2024-04-08T18:18:00", 32.7767, -96.7970, "2024 total solar eclipse Dallas"),
    ("2025-03-14T06:59:00", 28.6139, 77.2090, "2025 lunar eclipse Delhi"),
    ("2030-12-31T23:59:00", -33.8688, 151.2093, "Sydney 2030"),
    ("1975-11-02T13:45:00", 40.7128, -74.0060, "New York 1975"),
    ("2015-07-14T05:30:00", 19.0760, 72.8777, "Mumbai 2015"),
]
# add deterministic pseudo-random cases for wider coverage
random.seed(7)
for i in range(18):
    y = random.randint(1920, 2035); mo = random.randint(1, 12); d = random.randint(1, 28)
    hh = random.randint(0, 23); mi = random.randint(0, 59)
    lat = round(random.uniform(-40, 55), 4); lon = round(random.uniform(-170, 170), 4)
    CASES.append((f"{y:04d}-{mo:02d}-{d:02d}T{hh:02d}:{mi:02d}:00", lat, lon, f"random {i}"))

def julday(iso):
    # iso is UTC
    import datetime
    dt = datetime.datetime.strptime(iso, "%Y-%m-%dT%H:%M:%S")
    h = dt.hour + dt.minute/60 + dt.second/3600
    return swe.julday(dt.year, dt.month, dt.day, h, swe.GREG_CAL)

rows = []
for iso, lat, lon, label in CASES:
    jd = julday(iso)
    ay = swe.get_ayanamsa_ut(jd)
    pos = {}
    for name, pid in BODIES:
        xx, _ = swe.calc_ut(jd, pid, FLAGS)
        pos[name] = round(xx[0], 6)
    pos["Ketu"] = round((pos["Rahu"] + 180.0) % 360.0, 6)
    # ascendant & MC, sidereal
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'W', swe.FLG_SIDEREAL)
    rows.append({
        "label": label, "utc": iso, "lat": lat, "lon": lon, "jd": round(jd, 6),
        "ayanamsa": round(ay, 6),
        "asc": round(ascmc[0], 6), "mc": round(ascmc[1], 6),
        "planets": pos,
    })

out = {
    "source": f"Swiss Ephemeris {swe.version}, SIDM_LAHIRI, TRUE_NODE, whole-sign houses, FLG_SWIEPH",
    "generated_by": "scripts/golden/make-ephemeris-golden.py",
    "cases": rows,
}
with open("/home/user/jyothishyam-pednota/scripts/golden/ephemeris-golden.json", "w") as f:
    json.dump(out, f)
print("cases:", len(rows), "size:", len(json.dumps(out))//1024, "KB")
