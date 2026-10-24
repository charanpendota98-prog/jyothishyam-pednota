# Jyotishyam API v1

This repository currently hosts the browser app and stateless calculation API in the existing TypeScript/Express service. The v1 contract follows the supplied `{ apiVersion, settings, data, warnings }` envelope while reusing the tested local engines; this avoids maintaining two divergent astronomy implementations. It is not a FastAPI migration.

## Settings and response contract

Every successful v1 endpoint returns:

```json
{
  "apiVersion": "1.0",
  "settings": {
    "ayanamsha": "lahiri",
    "nodeType": "mean",
    "houseSystem": "whole_sign",
    "sunriseConvention": "hindu",
    "monthSystem": "amanta",
    "timezone": "Asia/Kolkata",
    "timezoneOffsetHours": 5.5,
    "calculationMethod": "geocentric"
  },
  "data": {},
  "warnings": []
}
```

Inputs are validated server-side. A birth chart request is calculated in memory; `/v1/chart` and `/v1/match` do not persist the submitted birth details. Errors return an HTTP 4xx JSON object with an `error` message.

## Routes

| Route | Purpose |
|---|---|
| `GET /v1/panchang?date=YYYY-MM-DD&lat=&lon=&timezone=` | Location-specific daily Panchang. `tzOffsetHours` can be supplied instead of IANA `timezone`. |
| `GET /v1/panchang/month?year=&month=&lat=&lon=&timezone=` | Month calendar data using selected location/settings. |
| `GET /v1/festivals?year=&lat=&lon=&timezone=&tradition=drik` | Year overview, including local calendar/festival data. v1 currently accepts Drik only; other observance traditions are not silently mapped. |
| `GET /v1/eclipses?year=&lat=&lon=&timezone=` | Annual solar/lunar eclipse maxima and local visibility at maximum. Contact times and Sutak windows are not yet calculated. |
| `POST /v1/chart` | Birth chart, settings, planets and chart result. Accepts `{ input: {...}, tradition }` or the birth fields at the request root. |
| `POST /v1/match` | Full two-person chart comparison and matching result using `{ inputA, inputB, tradition }`. |

### Chart input

Either use the existing form shape (`date`, `time`, `lat`, `lng`, `tzOffsetHours`, `ayanamsa`, `houseSystem`) or the plan's interoperable shape:

```json
{
  "datetime_local": "1995-08-14T06:25:30",
  "lat": 17.385,
  "lon": 78.4867,
  "timezone": "Asia/Kolkata",
  "settings": {
    "ayanamsha": "lahiri",
    "node_type": "mean",
    "house_system": "whole_sign",
    "calculation_method": "geocentric"
  }
}
```

The service resolves an IANA zone against the exact local birth date/time using the runtime's Intl timezone database, including historical DST. Nonexistent clock readings are rejected; repeated fall-back clock readings require a matching `tzOffsetHours` to disambiguate. `HH:mm:ss` is accepted and preserved. When an IANA zone is present, its resolved offset is authoritative and the chart stores the actual offset at birth. Calendar endpoints still calculate each requested date using one resolved offset; multi-day event windows across a DST transition need a fully zone-aware event-time model. Historical births without IANA-zone input use the supplied fixed offset and require verification.

## Calculation convention

Birth-chart defaults follow OnlineJyotish's publicly exposed defaults where known: Lahiri, Mean Node and geocentric planetary positions; chart house method remains explicitly recorded. Topocentric chart positions can be selected and apply observer parallax to physical planets; lunar-node points remain geocentric. Daily Panchang defaults to the configured Hindu/Drik rise convention and Amanta calendar; its topocentric anga mode is not yet implemented. Individual route settings are echoed so consumers can record what was actually used. The service must not silently equate `Asia/Kolkata` with a fixed offset for every historical date.

## Validation status

Local HTTP smoke tests passed for daily Panchang, month Panchang, chart and matching; added engine-level IANA DST gap/fold tests and geocentric/topocentric calculation-method tests. v1 rejects unsupported ayanamsha, node, house-system, calculation-method, tradition and sunrise-convention values instead of substituting defaults. Comprehensive API schema/contract tests remain release work; smoke tests do not establish full route parity.
