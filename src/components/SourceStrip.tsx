import React from 'react';
import { BookOpen } from 'lucide-react';
import { sourceChipsFor } from '../engine/classicalSources.ts';

/**
 * Compact, honest citation strip shown at the bottom of every analytical tab.
 * It comes from `classicalSources.ts` so the grantha list is never duplicated
 * in the UI layer.
 */
export const SourceStrip: React.FC<{
  feature: Parameters<typeof sourceChipsFor>[0];
  titleTe?: string;
  compact?: boolean;
  lang?: 'te' | 'en';
}> = ({ feature, titleTe, compact = false, lang = 'te' }) => {
  const chips = sourceChipsFor(feature, lang);
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#0F1326] ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-center gap-2 text-[#EDE8E0] font-display text-[15px] mb-2">
        <BookOpen className="w-4 h-4 text-[#C9A96E]" />{' '}
        {titleTe ?? (lang === 'te' ? 'గ్రంథ ఆధారాలు' : 'Classical sources')}
      </div>
      <div className={compact ? 'space-y-1' : 'grid gap-2 sm:grid-cols-2'}>
        {chips.map((c) => (
          <div key={c.id} className="rounded-lg bg-white/[0.03] px-3 py-1.5">
            <div className="text-[11.5px] text-[#EDE8E0]">
              {c.nameTe} <span className="text-[10.5px] text-[#EDE8E0]/40">· {c.authorTe}</span>
            </div>
            <div className="text-[10.5px] text-[#EDE8E0]/55 leading-snug">{c.lineTe}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-[#EDE8E0]/35 leading-snug">
        {lang === 'te'
          ? 'మూల గ్రంథాలు పబ్లిక్ డొమైన్ · అధ్యాయ సంఖ్యలు ప్రామాణిక ముద్రణల ఆధారంగా · పూర్తి గ్రంథ మండలం ‘గ్రంథాలు’ ట్యాబ్‌లో'
          : 'Source texts are public domain · chapter numbers follow standard editions · the full corpus is in the “Granthas” tab'}
      </p>
    </div>
  );
};

export default SourceStrip;
