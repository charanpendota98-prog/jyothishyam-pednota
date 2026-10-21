import React, { useEffect, useMemo, useState } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Flame,
  RotateCw,
  Navigation,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  getRealtimePanchangaFeed,
  type RealtimePanchangaFeed,
} from '../engine/realtimePanchangaEngine.ts';

interface RealtimePanchangaFeedCardProps {
  defaultLat: number;
  defaultLng: number;
  defaultTzOffsetHours: number;
  defaultCityName: string;
  onLocationChange?: (lat: number, lng: number, cityName: string) => void;
}

export const RealtimePanchangaFeedCard: React.FC<RealtimePanchangaFeedCardProps> = ({
  defaultLat,
  defaultLng,
  defaultTzOffsetHours,
  defaultCityName,
  onLocationChange,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLiveTicking, setIsLiveTicking] = useState<boolean>(true);
  const [activeLat, setActiveLat] = useState<number>(defaultLat);
  const [activeLng, setActiveLng] = useState<number>(defaultLng);
  const [activeCity, setActiveCity] = useState<string>(defaultCityName);
  const [geoStatusMessage, setGeoStatusMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sync with prop updates if changed externally
  useEffect(() => {
    setActiveLat(defaultLat);
    setActiveLng(defaultLng);
    setActiveCity(defaultCityName);
  }, [defaultLat, defaultLng, defaultCityName]);

  // Live ticking timer
  useEffect(() => {
    if (!isLiveTicking) return;
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveTicking]);

  // Calculate realtime feed
  const feed: RealtimePanchangaFeed = useMemo(() => {
    return getRealtimePanchangaFeed(
      currentDate,
      activeLat,
      activeLng,
      defaultTzOffsetHours,
      activeCity
    );
  }, [currentDate, activeLat, activeLng, defaultTzOffsetHours, activeCity]);

  // Geolocation handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatusMessage('మీ బ్రౌజర్‌లో GPS జియోలొకేషన్ సదుపాయం అందుబాటులో లేదు.');
      return;
    }
    setIsLocating(true);
    setGeoStatusMessage('మీ ఖచ్చితమైన ప్రదేశాన్ని గుర్తిస్తున్నాము...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        const newCity = `నా ప్రస్తుత ప్రదేశం (${lat}° N, ${lng}° E)`;
        setActiveLat(lat);
        setActiveLng(lng);
        setActiveCity(newCity);
        setIsLocating(false);
        setGeoStatusMessage('మీ ప్రస్తుత GPS ప్రదేశం ఆధారంగా పంచాంగం విజయవంతంగా లోడ్ అయింది!');
        if (onLocationChange) onLocationChange(lat, lng, newCity);
        setTimeout(() => setGeoStatusMessage(null), 4000);
      },
      (err) => {
        setIsLocating(false);
        setGeoStatusMessage(`GPS లొకేషన్ అనుమతి లభించలేదు (${err.message}). డిఫాల్ట్ నగరాన్ని వాడుతున్నాము.`);
        setTimeout(() => setGeoStatusMessage(null), 4500);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleResetToNow = () => {
    setCurrentDate(new Date());
    setIsLiveTicking(true);
  };

  const handleDateShift = (days: number) => {
    setIsLiveTicking(false);
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d);
  };

  return (
    <div className="bg-gradient-to-br from-[#12162B] via-[#0F1326] to-[#0A0D1B] border-2 border-[#C9A96E]/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Top Banner: Real-Time Header, Live Clock, Geolocation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-tabular font-bold bg-[#5BBFB5]/20 text-[#5BBFB5] border border-[#5BBFB5]/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5BBFB5] animate-pulse" />
              {isLiveTicking ? 'LIVE REAL-TIME FEED' : 'SELECTED DATE FEED'}
            </span>
            <span className="text-xs text-[#C9A96E] font-semibold">
              {feed.vedicEra.samvatsaraNameTe} · {feed.vedicEra.ayanaNameTe}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDE8E0] flex items-center gap-2">
            ప్రత్యక్ష శ్రీ పంచాంగ అమృతవాణి
            <span className="text-xs sm:text-sm font-normal text-[#EDE8E0]/60">
              ({feed.vedicEra.rituNameTe} · {feed.vedicEra.maasaNameTe})
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#EDE8E0]/70 pt-0.5">
            <span className="flex items-center gap-1 text-[#C9A96E] font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              {feed.locationName}
            </span>
            <span>·</span>
            <span className="font-mono-tabular">
              {feed.latitude.toFixed(2)}° N, {feed.longitude.toFixed(2)}° E
            </span>
            <span>·</span>
            <span className="text-[#5BBFB5]">{feed.dayOfWeekNameTe} ({feed.dayOfWeekNameEn})</span>
          </div>
        </div>

        {/* Right Action Bar: Live Clock & GPS Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#090C18] border border-white/15 rounded-xl px-3.5 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[#C9A96E] font-bold">
              స్థానిక సమయం (Local Time)
            </div>
            <div className="text-lg sm:text-xl font-mono-tabular font-bold text-[#EDE8E0] tracking-wider">
              {feed.localTimeStr}
            </div>
            <div className="text-[10px] text-[#EDE8E0]/50 font-mono-tabular">
              {feed.localDateStr}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141932] border border-[#5BBFB5]/40 hover:border-[#5BBFB5] text-xs font-semibold text-[#5BBFB5] transition-colors cursor-pointer disabled:opacity-50"
              title="మీ మొబైల్ లేదా కంప్యూటర్ GPS ద్వారా సరిగ్గా మీ ఊరి పంచాంగం లెక్కించండి"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              నా ప్రస్తుత ప్రదేశం (Use GPS)
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDateShift(-1)}
                className="px-2 py-1 text-[11px] rounded bg-[#090C18] border border-white/10 hover:border-white/30 text-[#EDE8E0]/80 cursor-pointer"
                title="నిన్నటి పంచాంగం"
              >
                ◀ నిన్న
              </button>
              <button
                onClick={handleResetToNow}
                className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                  isLiveTicking
                    ? 'bg-[#C9A96E] text-[#090C18]'
                    : 'bg-[#090C18] border border-[#C9A96E]/50 text-[#C9A96E]'
                }`}
                title="ప్రస్తుత సమయానికి రీసెట్ చేయండి"
              >
                ఇప్పుడే (Now)
              </button>
              <button
                onClick={() => handleDateShift(1)}
                className="px-2 py-1 text-[11px] rounded bg-[#090C18] border border-white/10 hover:border-white/30 text-[#EDE8E0]/80 cursor-pointer"
                title="రేపటి పంచాంగం"
              >
                రేపు ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Geolocation feedback notice */}
      {geoStatusMessage && (
        <div className="p-2.5 rounded-lg bg-[#5BBFB5]/15 border border-[#5BBFB5]/40 text-xs text-[#EDE8E0] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#5BBFB5] shrink-0" />
          <span>{geoStatusMessage}</span>
        </div>
      )}

      {/* Live Active Kala & Hora Highlights Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Box 1: Live Kala Status */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            feed.kalaStatus.activeKalaType === 'inauspicious'
              ? 'bg-[#D47B7B]/10 border-[#D47B7B]/50'
              : feed.kalaStatus.activeKalaType === 'auspicious'
              ? 'bg-[#5BBFB5]/10 border-[#5BBFB5]/50'
              : 'bg-[#090C18] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#EDE8E0]/70">
            <span>ప్రస్తుత కాల స్థితి (Live Kala)</span>
            {feed.kalaStatus.activeKalaType === 'inauspicious' ? (
              <ShieldAlert className="w-4 h-4 text-[#D47B7B]" />
            ) : feed.kalaStatus.activeKalaType === 'auspicious' ? (
              <ShieldCheck className="w-4 h-4 text-[#5BBFB5]" />
            ) : (
              <Clock className="w-4 h-4 text-[#C9A96E]" />
            )}
          </div>
          <div className="mt-1">
            <div
              className={`text-sm sm:text-base font-bold ${
                feed.kalaStatus.activeKalaType === 'inauspicious'
                  ? 'text-[#D47B7B]'
                  : feed.kalaStatus.activeKalaType === 'auspicious'
                  ? 'text-[#5BBFB5]'
                  : 'text-[#EDE8E0]'
              }`}
            >
              {feed.kalaStatus.activeKalaNameTe ?? 'సాధారణ శుభ సమయం'}
            </div>
            {feed.kalaStatus.activeKalaRemainingMinutes > 0 && (
              <div className="text-[11px] text-[#EDE8E0]/70 font-mono-tabular mt-0.5">
                ఇంకా {feed.kalaStatus.activeKalaRemainingMinutes} నిమిషాలలో ముగుస్తుంది
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Live Running Hora */}
        <div className="p-3.5 rounded-xl bg-[#090C18] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-[#EDE8E0]/70">
            <span>ప్రస్తుత నడుస్తున్న హోర (Hora)</span>
            <span
              className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                feed.currentHora.nature === 'auspicious'
                  ? 'bg-[#5BBFB5]/20 text-[#5BBFB5]'
                  : feed.currentHora.nature === 'caution'
                  ? 'bg-[#D47B7B]/20 text-[#D47B7B]'
                  : 'bg-white/10 text-[#EDE8E0]'
              }`}
            >
              {feed.currentHora.nature === 'auspicious' ? 'శుభ హోర' : feed.currentHora.nature === 'caution' ? 'జాగ్రత్త' : 'మధ్యమం'}
            </span>
          </div>
          <div className="mt-1">
            <div className="text-sm sm:text-base font-bold text-[#C9A96E]">
              {feed.currentHora.planetNameTe}
            </div>
            <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
              ముగింపు: {feed.currentHora.endTimeLocal} (తదుపరి: {feed.currentHora.nextHoraPlanetTe})
            </div>
          </div>
        </div>

        {/* Box 3: Live Running Choghadiya */}
        <div className="p-3.5 rounded-xl bg-[#090C18] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-[#EDE8E0]/70">
            <span>ప్రస్తుత చోఘడియా (Choghadiya)</span>
            <span
              className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                feed.currentChoghadiya.isAuspicious
                  ? 'bg-[#5BBFB5]/20 text-[#5BBFB5]'
                  : 'bg-[#D47B7B]/20 text-[#D47B7B]'
              }`}
            >
              {feed.currentChoghadiya.isAuspicious ? 'శుభ ఘడియ' : 'అశుభ ఘడియ'}
            </span>
          </div>
          <div className="mt-1">
            <div className="text-sm sm:text-base font-bold text-[#EDE8E0]">
              {feed.currentChoghadiya.nameTe} చోఘడియా ({feed.currentChoghadiya.rulerTe})
            </div>
            <div className="text-[11px] text-[#EDE8E0]/70 mt-0.5">
              ముగింపు: {feed.currentChoghadiya.endTimeLocal} (తదుపరి: {feed.currentChoghadiya.nextChoghadiyaTe})
            </div>
          </div>
        </div>

        {/* Box 4: Sun & Moon Rise Summary */}
        <div className="p-3.5 rounded-xl bg-[#090C18] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-[#EDE8E0]/70">
            <span>సూర్యోదయ & చంద్రాస్తమయాలు</span>
            <Sun className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1 text-[11px] font-mono-tabular">
            <div>
              <span className="text-[#C9A96E] font-semibold">సూర్యోదయం:</span> {feed.sunriseLocal}
            </div>
            <div>
              <span className="text-[#C9A96E] font-semibold">సూర్యాస్తమయం:</span> {feed.sunsetLocal}
            </div>
            <div>
              <span className="text-[#5BBFB5] font-semibold">చంద్రోదయం:</span> {feed.moonriseLocal}
            </div>
            <div>
              <span className="text-[#5BBFB5] font-semibold">చంద్రాస్తమయం:</span> {feed.moonsetLocal}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Real-Time Panchanga Elements (పంచాంగాలు) Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {/* 1. Tithi */}
        <div className="p-4 rounded-xl bg-[#090C18]/90 border border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#C9A96E] font-bold uppercase tracking-wider">
              <span>1. తిథి (Tithi)</span>
              <span>#{feed.tithi.number}</span>
            </div>
            <h3 className="text-base font-bold text-[#EDE8E0] mt-1">
              {feed.tithi.nameTe}
            </h3>
            <div className="text-xs text-[#EDE8E0]/75">
              {feed.tithi.pakshaTe} · అధిపతి: {feed.tithi.lordTe}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
            <div className="flex justify-between text-[11px] text-[#EDE8E0]/70">
              <span>పూర్తయిన శాతం:</span>
              <span className="font-mono-tabular font-bold">{feed.tithi.percentElapsed}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#C9A96E] to-[#5BBFB5] h-full"
                style={{ width: `${feed.tithi.percentElapsed}%` }}
              />
            </div>
            <div className="text-[11px] text-[#EDE8E0]/80">
              ముగింపు: <strong className="font-mono-tabular text-[#5BBFB5]">{feed.tithi.endTimeLocal}</strong>
            </div>
            <div className="text-[10px] text-[#EDE8E0]/50 truncate">
              తదుపరి: {feed.tithi.nextTithiNameTe}
            </div>
          </div>
        </div>

        {/* 2. Nakshatra */}
        <div className="p-4 rounded-xl bg-[#090C18]/90 border border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#5BBFB5] font-bold uppercase tracking-wider">
              <span>2. నక్షత్రం (Nakshatra)</span>
              <span>#{feed.nakshatra.number}</span>
            </div>
            <h3 className="text-base font-bold text-[#EDE8E0] mt-1">
              {feed.nakshatra.nameTe}
            </h3>
            <div className="text-xs text-[#EDE8E0]/75">
              {feed.nakshatra.pada}వ పాదం · అధిపతి: {feed.nakshatra.lordTe}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
            <div className="flex justify-between text-[11px] text-[#EDE8E0]/70">
              <span>పూర్తయిన శాతం:</span>
              <span className="font-mono-tabular font-bold">{feed.nakshatra.percentElapsed}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#5BBFB5] to-[#C9A96E] h-full"
                style={{ width: `${feed.nakshatra.percentElapsed}%` }}
              />
            </div>
            <div className="text-[11px] text-[#EDE8E0]/80">
              ముగింపు: <strong className="font-mono-tabular text-[#C9A96E]">{feed.nakshatra.endTimeLocal}</strong>
            </div>
            <div className="text-[10px] text-[#EDE8E0]/50 truncate">
              తదుపరి: {feed.nakshatra.nextNakshatraNameTe}
            </div>
          </div>
        </div>

        {/* 3. Yoga */}
        <div className="p-4 rounded-xl bg-[#090C18]/90 border border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#E0A96D] font-bold uppercase tracking-wider">
              <span>3. యోగం (Yoga)</span>
              <span>#{feed.yoga.number}</span>
            </div>
            <h3 className="text-base font-bold text-[#EDE8E0] mt-1">
              {feed.yoga.nameTe}
            </h3>
            <span
              className={`inline-block mt-1 text-[10.5px] px-2 py-0.5 rounded font-bold ${
                feed.yoga.isShubha
                  ? 'bg-[#5BBFB5]/15 text-[#5BBFB5] border border-[#5BBFB5]/30'
                  : 'bg-[#D47B7B]/15 text-[#D47B7B] border border-[#D47B7B]/30'
              }`}
            >
              {feed.yoga.isShubha ? 'శుభ యోగం ★' : 'అశుభ యోగం (హెచ్చరిక)'}
            </span>
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-[#EDE8E0]/80 leading-relaxed">
            {feed.yoga.meaningTe}
          </div>
        </div>

        {/* 4. Karana */}
        <div className="p-4 rounded-xl bg-[#090C18]/90 border border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#C9A96E] font-bold uppercase tracking-wider">
              <span>4. కరణం (Karana)</span>
              <span>{feed.karana.nameEn}</span>
            </div>
            <h3 className="text-base font-bold text-[#EDE8E0] mt-1">
              {feed.karana.nameTe}
            </h3>
            <div className="text-xs text-[#EDE8E0]/75 mt-0.5">
              {feed.karana.typeTe}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            {feed.karana.isBhadraVishti ? (
              <div className="p-1.5 rounded bg-[#D47B7B]/20 border border-[#D47B7B]/50 text-[10.5px] text-[#D47B7B] font-bold">
                భద్ర/విష్టి ఆటంకం — శుభకార్యాలు వర్జ్యం
              </div>
            ) : (
              <div className="text-[11px] text-[#5BBFB5] font-semibold">
                సాధారణ కార్య సిద్ధికి అనుకూలం
              </div>
            )}
          </div>
        </div>

        {/* 5. Vaara */}
        <div className="p-4 rounded-xl bg-[#090C18]/90 border border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#5BBFB5] font-bold uppercase tracking-wider">
              <span>5. వారం (Vaara)</span>
              <span>{feed.vaara.nameEn}</span>
            </div>
            <h3 className="text-base font-bold text-[#EDE8E0] mt-1">
              {feed.vaara.nameTe}
            </h3>
            <div className="text-xs text-[#EDE8E0]/75 mt-0.5">
              వాసర అధిపతి: <strong className="text-[#C9A96E]">{feed.vaara.lordTe}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-1 text-[11px] text-[#EDE8E0]/80">
            <div>
              <span className="text-[#C9A96E]">శుభ వర్ణం:</span> {feed.vaara.shubhaColorTe}
            </div>
            <div className="text-[10px] text-[#EDE8E0]/60 truncate">
              ఆరాధ్య దైవం: {feed.vaara.deityTe}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Muhurta & Inauspicious Kala Strip */}
      <div className="bg-[#090C18]/70 border border-white/10 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono-tabular">
          <div>
            <span className="text-[#D47B7B] font-bold">రాహు కాలం:</span>{' '}
            <span className={feed.kalaStatus.rahuKalam.isActive ? 'text-[#D47B7B] font-bold animate-pulse' : 'text-[#EDE8E0]'}>
              {feed.kalaStatus.rahuKalam.window}
            </span>
          </div>
          <div>
            <span className="text-[#D47B7B] font-bold">యమగండం:</span>{' '}
            <span className={feed.kalaStatus.yamagandam.isActive ? 'text-[#D47B7B] font-bold animate-pulse' : 'text-[#EDE8E0]'}>
              {feed.kalaStatus.yamagandam.window}
            </span>
          </div>
          <div>
            <span className="text-[#C9A96E] font-bold">గుళిక కాలం:</span>{' '}
            <span>{feed.kalaStatus.gulikaKalam.window}</span>
          </div>
          <div>
            <span className="text-[#5BBFB5] font-bold">అభిజిత్ ముహూర్తం:</span>{' '}
            <span className={feed.kalaStatus.abhijitMuhurta.isActive ? 'text-[#5BBFB5] font-bold animate-pulse' : 'text-[#EDE8E0]'}>
              {feed.kalaStatus.abhijitMuhurta.window}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[#EDE8E0]/60">
          *సూర్యోదయ/సూర్యాస్తమయ ఆధారిత ప్రత్యక్ష పంచాంగం
        </div>
      </div>
    </div>
  );
};
