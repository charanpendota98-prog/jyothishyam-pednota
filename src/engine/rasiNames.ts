/**
 * rasiNames.ts — 12 rāśi names (Telugu + English) with lord, element and nature.
 *
 * Kept in its own module so that the varga / Ṣaḍbala engines can use it without
 * pulling in teluguJathakam.ts (which itself imports ephemeris.ts).  That keeps
 * the import graph acyclic: ephemeris → shadbalaDeepEngine → vargaVimsopakaEngine.
 */

export const TELUGU_RASIS: {
  index: number;
  nameTe: string;
  nameEn: string;
  lordTe: string;
  tattvamTe: string;
  swabhavamTe: string;
}[] = [
  { index: 0, nameTe: 'మేష రాశి', nameEn: 'Aries (Mesha)', lordTe: 'కుజుడు (అంగారకుడు)', tattvamTe: 'అగ్ని తత్వం', swabhavamTe: 'చర రాశి' },
  { index: 1, nameTe: 'వృషభ రాశి', nameEn: 'Taurus (Vrishabha)', lordTe: 'శుక్రుడు', tattvamTe: 'భూ తత్వం', swabhavamTe: 'స్థిర రాశి' },
  { index: 2, nameTe: 'మిథున రాశి', nameEn: 'Gemini (Mithuna)', lordTe: 'బుధుడు', tattvamTe: 'వాయు తత్వం', swabhavamTe: 'ద్విస్వభావ రాశి' },
  { index: 3, nameTe: 'కర్కాటక రాశి', nameEn: 'Cancer (Karkataka)', lordTe: 'చంద్రుడు', tattvamTe: 'జల తత్వం', swabhavamTe: 'చర రాశి' },
  { index: 4, nameTe: 'సింహ రాశి', nameEn: 'Leo (Simha)', lordTe: 'సూర్యుడు (రవి)', tattvamTe: 'అగ్ని తత్వం', swabhavamTe: 'స్థిర రాశి' },
  { index: 5, nameTe: 'కన్యా రాశి', nameEn: 'Virgo (Kanya)', lordTe: 'బుధుడు', tattvamTe: 'భూ తత్వం', swabhavamTe: 'ద్విస్వభావ రాశి' },
  { index: 6, nameTe: 'తులా రాశి', nameEn: 'Libra (Tula)', lordTe: 'శుక్రుడు', tattvamTe: 'వాయు తత్వం', swabhavamTe: 'చర రాశి' },
  { index: 7, nameTe: 'వృశ్చిక రాశి', nameEn: 'Scorpio (Vrishchika)', lordTe: 'కుజుడు (అంగారకుడు)', tattvamTe: 'జల తత్వం', swabhavamTe: 'స్థిర రాశి' },
  { index: 8, nameTe: 'ధనుస్సు రాశి', nameEn: 'Sagittarius (Dhanussu)', lordTe: 'గురువు (బృహస్పతి)', tattvamTe: 'అగ్ని తత్వం', swabhavamTe: 'ద్విస్వభావ రాశి' },
  { index: 9, nameTe: 'మకర రాశి', nameEn: 'Capricorn (Makara)', lordTe: 'శని (మందుడు)', tattvamTe: 'భూ తత్వం', swabhavamTe: 'చర రాశి' },
  { index: 10, nameTe: 'కుంభ రాశి', nameEn: 'Aquarius (Kumbha)', lordTe: 'శని (మందుడు)', tattvamTe: 'వాయు తత్వం', swabhavamTe: 'స్థిర రాశి' },
  { index: 11, nameTe: 'మీన రాశి', nameEn: 'Pisces (Meena)', lordTe: 'గురువు (బృహస్పతి)', tattvamTe: 'జల తత్వం', swabhavamTe: 'ద్విస్వభావ రాశి' },
];

