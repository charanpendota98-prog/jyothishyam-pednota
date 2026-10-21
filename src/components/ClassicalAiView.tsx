import React, { useState, useEffect } from 'react';
import { Send, Sparkles, BookOpen, RefreshCw, Printer } from 'lucide-react';
import type { BirthInput, CompleteChartResult, ZodiacTradition } from '../engine/ephemeris.ts';
import {
  retrieveClassicalPassagesForChart,
  buildCitedScholarlySynthesis,
  type ClassicalPassage,
} from '../engine/classicalCorpus.ts';
import {
  generateTeluguSampoornaJathakam,
  type AppLanguage,
} from '../engine/teluguJathakam.ts';

interface ClassicalAiViewProps {
  chart: CompleteChartResult;
  tradition: ZodiacTradition;
  savedProfiles: BirthInput[];
  lang?: AppLanguage;
}

export const ClassicalAiView: React.FC<ClassicalAiViewProps> = ({
  chart,
  tradition,
  savedProfiles,
  lang = 'te',
}) => {
  const [reportFocus, setReportFocus] = useState<'natal' | 'dasha' | 'synastry'>('natal');

  const buildInitialReport = (c: CompleteChartResult, focus: 'natal' | 'dasha' | 'synastry', l: AppLanguage) => {
    if (l === 'en') {
      return buildCitedScholarlySynthesis(c, focus);
    }
    const teJ = generateTeluguSampoornaJathakam(c);
    return {
      title: `సంపూర్ణ జ్యోతిష్య శాస్త్ర విశ్లేషణ: ${c.input.name}`,
      executiveSummary: `జన్మ లగ్నం: ${teJ.janmaLagnamTe} (అధిపతి: ${teJ.janmaLagnaAdhipatiTe}) · జన్మ రాశి: ${teJ.janmaRasiTe} · జన్మ నక్షత్రం: ${teJ.janmaNakshatramTe} (${teJ.janmaPadam}వ పాదం, నామ అక్షరం: "${teJ.namaAksharamTe}"). ${teJ.currentDashaPhalamTe.mahadashaTe} — ${teJ.currentDashaPhalamTe.antardashaTe}.`,
      sections: [
        {
          heading: '01. లగ్న బలం, ఆత్మకారకత్వం & స్వభావ విశ్లేషణ',
          citation: 'బృహత్ పరాశర హోరా శాస్త్రం (BPHS) అధ్యాయం 3 & 24',
          body: `${teJ.dwadashaBhavaPhalitalu[0].predictionTe} అంతేకాక, మీ అదృష్ట రత్నం ${teJ.adrushtaVivaralu.ratnamTe}, ఆరాధ్య దైవం ${teJ.adrushtaVivaralu.ishtaDevataTe}.`,
        },
        {
          heading: '02. రాజ్య-కర్మ-ఉద్యోగ (10వ భావం) & భాగ్య (9వ భావం) ఫలితాలు',
          citation: 'ఫలదీపిక అధ్యాయం 6 · సారావళి అధ్యాయం 34',
          body: `${teJ.dwadashaBhavaPhalitalu[9].predictionTe} ${teJ.dwadashaBhavaPhalitalu[8].predictionTe}`,
        },
        {
          heading: '03. ప్రస్తుత వింశోత్తరి మహాదశ - అంతర్దశ & శాంతి పరిహారములు',
          citation: 'బృహత్ పరాశర హోరా శాస్త్రం అధ్యాయం 46–47',
          body: `${teJ.currentDashaPhalamTe.phalamTe} ${teJ.currentDashaPhalamTe.pariharamTe}`,
        },
      ],
    };
  };

  const [reportData, setReportData] = useState(() =>
    buildInitialReport(chart, 'natal', lang)
  );
  const [passages, setPassages] = useState<ClassicalPassage[]>(() =>
    retrieveClassicalPassagesForChart(chart, 'natal')
  );
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [engineBadge, setEngineBadge] = useState<string>(
    'బృహత్ పరాశర హోరా శాస్త్రం · ఫలదీపిక · సారావళి ప్రమాణం'
  );

  const [chatQuestion, setChatQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: 'user' | 'astrologer'; text: string; citations?: string[] }[]
  >([]);
  const [corpusSearch, setCorpusSearch] = useState('');

  useEffect(() => {
    setReportData(buildInitialReport(chart, reportFocus, lang));
    setPassages(retrieveClassicalPassagesForChart(chart, reportFocus));
  }, [chart, reportFocus, lang]);

  const handleGenerateAiReport = async () => {
    setIsGeneratingReport(true);
    try {
      const partner = savedProfiles.find((p) => p.name !== chart.input.name) ?? savedProfiles[0];
      const res = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: chart.input,
          inputB: partner,
          tradition,
          focus: reportFocus,
          lang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) setReportData(data.report);
        if (data.passages) setPassages(data.passages);
        setEngineBadge(
          data.engineMode === 'gemini-rag-synthesis'
            ? 'Gemini 3.8 Flash · తెలుగు జ్యోతిష్య శాస్త్ర విశ్లేషణ'
            : 'బృహత్ పరాశర హోరా శాస్త్ర ప్రమాణం'
        );
      }
    } catch {
      // Fallback already populated
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAskQuestion = async (qText?: string) => {
    const query = (qText ?? chatQuestion).trim();
    if (!query || isAsking) return;
    setChatQuestion('');
    setChatHistory((prev) => [...prev, { role: 'user', text: query }]);
    setIsAsking(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: chart.input,
          tradition,
          question: query,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'astrologer',
            text: data.answer,
            citations: data.citations,
          },
        ]);
      }
    } catch {
      const teJ = generateTeluguSampoornaJathakam(chart);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'astrologer',
          text: `${teJ.currentDashaPhalamTe.phalamTe}\n\nపరిహారం: ${teJ.currentDashaPhalamTe.pariharamTe}`,
          citations: ['BPHS Ch. 46, Sloka 12–19'],
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const filteredPassages = passages.filter(
    (p) =>
      !corpusSearch ||
      p.translation.toLowerCase().includes(corpusSearch.toLowerCase()) ||
      p.reference.toLowerCase().includes(corpusSearch.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(corpusSearch.toLowerCase()))
  );

  return (
    <div className="space-y-10">
      <section className="bg-[#0F1326] border border-white/10 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="text-xs font-mono-tabular text-[#C9A96E]">
              {engineBadge}
            </div>
            <h2 className="text-2xl font-display font-bold text-[#EDE8E0] mt-1">
              {reportData.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <div className="flex items-center bg-[#090C18] p-1 rounded-lg border border-white/10">
              {(['natal', 'dasha', 'synastry'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setReportFocus(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    reportFocus === f
                      ? 'bg-[#C9A96E] text-[#090C18] font-semibold'
                      : 'text-[#EDE8E0]/70 hover:text-[#EDE8E0]'
                  }`}
                >
                  {f === 'natal'
                    ? 'జన్మ కుండలి విశ్లేషణ'
                    : f === 'dasha'
                      ? 'దశా-గోచార ఫలితాలు'
                      : 'వివాహ పొందిక విశ్లేషణ'}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateAiReport}
              disabled={isGeneratingReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#C9A96E] text-[#090C18] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {isGeneratingReport ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isGeneratingReport ? 'AI విశ్లేషిస్తోంది...' : 'AI సంపూర్ణ విశ్లేషణ (Deep AI)'}
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#090C18] text-[#EDE8E0] border border-white/15 rounded-lg hover:bg-white/5 transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
          </div>
        </div>

        <p className="text-sm text-[#EDE8E0]/85 leading-relaxed pt-5 font-medium">
          {reportData.executiveSummary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {reportData.sections.map((sec, idx) => (
            <div
              key={`report-sec-${idx}-${sec.heading}`}
              className="p-5 bg-[#090C18]/75 border border-white/10 rounded-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-[#C9A96E]">{sec.heading}</h3>
                <p className="text-xs text-[#EDE8E0]/85 mt-2.5 leading-relaxed">{sec.body}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono-tabular text-[#5BBFB5]">
                శాస్త్ర ప్రమాణం: {sec.citation}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 bg-[#0F1326] border border-white/10 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-white/10">
              <h3 className="text-xl font-display font-bold text-[#EDE8E0]">
                జ్యోతిష్య సిద్ధాంతిని అడగండి · <span className="text-[#C9A96E]">Ask the Astrologer (తెలుగులో)</span>
              </h3>
              <p className="text-xs text-[#EDE8E0]/65 mt-1">
                {chart.input.name} గారి గ్రహ స్థితులు, దశా-అంతర్దశలు, వివాహం, ఉద్యోగం మరియు పరిహారాల గురించి తెలుగులో లేదా ఇంగ్లీషులో అడగండి.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              {[
                'నా జాతకంలో 10వ భావం & ఉద్యోగ-వ్యాపార భవిష్యత్తు ఎలా ఉంది?',
                'ప్రస్తుతం నడుస్తున్న మహాదశ - అంతర్దశ ఫలితాలు మరియు పరిహారాలు చెప్పండి',
                'నా నవాంశ చక్రం (D9) ప్రకారం వివాహ & కుటుంబ జీవితం ఎలా ఉంటుంది?',
                'నా జాతకంలో ఉన్న రాజయోగాలు మరియు ధనయోగాలు ఏమిటి?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleAskQuestion(prompt)}
                  className="text-left text-xs text-[#EDE8E0]/80 hover:text-[#C9A96E] bg-[#090C18] border border-white/10 hover:border-[#C9A96E]/40 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {chatHistory.length === 0 ? (
                <div className="p-5 bg-[#090C18]/60 border border-white/5 rounded-lg text-xs text-[#EDE8E0]/65 leading-relaxed">
                  పైన ఉన్న ప్రశ్నలలో ఒకదానిని ఎంచుకోండి లేదా <strong className="text-[#EDE8E0]">{chart.input.name}</strong> గారి జాతకం గురించిన మీ సందేహాన్ని క్రింద టైప్ చేయండి.
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div
                    key={`chat-msg-${i}-${msg.role}`}
                    className={`p-4 rounded-lg border text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#141932] border-[#C9A96E]/30 text-[#EDE8E0]'
                        : 'bg-[#090C18]/90 border-white/10 text-[#EDE8E0]/90'
                    }`}
                  >
                    <div className="font-mono-tabular text-[10px] text-[#C9A96E] mb-1">
                      {msg.role === 'user' ? 'మీ ప్రశ్న (INQUIRY)' : 'జ్యోతిష్య సమాధానం (SIDDHANTI RESPONSE)'}
                    </div>
                    <div className="whitespace-pre-line">{msg.text}</div>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] font-mono-tabular text-[#5BBFB5]">
                        శాస్త్ర ప్రమాణం: {msg.citations.join(' · ')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion();
            }}
            className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              placeholder={`${chart.input.name} గారి జాతకం గురించి ఏదైనా ప్రశ్న అడగండి...`}
              className="flex-1 bg-[#090C18] border border-white/15 rounded-lg px-3.5 py-2.5 text-xs text-[#EDE8E0] placeholder:text-[#EDE8E0]/40 focus:outline-none focus:border-[#C9A96E]"
            />
            <button
              type="submit"
              disabled={isAsking || !chatQuestion.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-[#C9A96E] text-[#090C18] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              {isAsking ? 'గణిస్తోంది...' : 'అడగండి'}
            </button>
          </form>
        </section>

        <section className="lg:col-span-5 bg-[#0F1326] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C9A96E]" />
              <h3 className="text-lg font-display font-bold text-[#EDE8E0]">
                సంస్కృత & సాంప్రదాయ శ్లోక ప్రమాణాలు
              </h3>
            </div>
            <input
              type="text"
              value={corpusSearch}
              onChange={(e) => setCorpusSearch(e.target.value)}
              placeholder="శ్లోక శోధన..."
              className="bg-[#090C18] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-[#EDE8E0] placeholder:text-[#EDE8E0]/40 focus:outline-none focus:border-[#C9A96E] w-36"
            />
          </div>

          <div className="space-y-3 pt-4 max-h-[470px] overflow-y-auto pr-1">
            {filteredPassages.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-[#090C18]/80 border border-white/10 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono-tabular">
                  <span className="text-[#C9A96E] font-semibold">{item.reference}</span>
                  <span className="text-[#EDE8E0]/45">{item.tradition}</span>
                </div>
                <div className="text-xs font-serif text-[#9B8FD4]/90">
                  {item.sanskritOrGreek}
                </div>
                <p className="text-xs text-[#EDE8E0]/80 leading-relaxed">
                  "{item.translation}"
                </p>
                <p className="text-[11px] text-[#EDE8E0]/50">
                  వివరణ: {item.commentary}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
