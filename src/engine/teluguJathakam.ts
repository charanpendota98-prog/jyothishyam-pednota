import { ZODIAC_SIGNS, type CompleteChartResult } from './ephemeris.ts';
import { computePillarScore, buildPillarNarrative, PILLAR_SPECS } from './pillarBalaEngine.ts';
import { mahadashaPhala } from './mahadashaPhalaEngine.ts';
import { TELUGU_RASIS } from './rasiNames.ts';
import { computeLagnaFunctional, PLANET_TE } from './lagnaFunctionalEngine.ts';

export type AppLanguage = 'te' | 'en';

export interface DistrictEntry {
  id: string;
  nameTe: string;
  nameEn: string;
  hqTe: string;
  hqEn: string;
  lat: number;
  lng: number;
  tzOffsetHours: number;
}

export interface StateEntry {
  id: string;
  nameTe: string;
  nameEn: string;
  countryTe: string;
  countryEn: string;
  districts: DistrictEntry[];
}

// Complete State & District Atlas with all 26 AP Districts, all 33 Telangana Districts, Major Indian States, and Global NRI hubs
export const STATE_DISTRICT_ATLAS: StateEntry[] = [
  {
    id: 'andhra_pradesh',
    nameTe: 'ఆంధ్రప్రదేశ్ (Andhra Pradesh - 26 జిల్లాలు)',
    nameEn: 'Andhra Pradesh (All 26 Districts)',
    countryTe: 'భారతదేశం',
    countryEn: 'India',
    districts: [
      { id: 'ap_visakhapatnam', nameTe: 'విశాఖపట్నం', nameEn: 'Visakhapatnam', hqTe: 'విశాఖపట్నం', hqEn: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, tzOffsetHours: 5.5 },
      { id: 'ap_ntr_vijayawada', nameTe: 'ఎన్టీఆర్ జిల్లా (విజయవాడ)', nameEn: 'NTR District (Vijayawada)', hqTe: 'విజయవాడ', hqEn: 'Vijayawada', lat: 16.5062, lng: 80.6480, tzOffsetHours: 5.5 },
      { id: 'ap_tirupati', nameTe: 'తిరుపతి (శ్రీ బాలాజీ)', nameEn: 'Tirupati (Sri Balaji)', hqTe: 'తిరుపతి', hqEn: 'Tirupati', lat: 13.6288, lng: 79.4192, tzOffsetHours: 5.5 },
      { id: 'ap_guntur', nameTe: 'గుంటూరు', nameEn: 'Guntur', hqTe: 'గుంటూరు', hqEn: 'Guntur', lat: 16.3067, lng: 80.4365, tzOffsetHours: 5.5 },
      { id: 'ap_kakinada', nameTe: 'కాకినాడ (పిఠాపురం)', nameEn: 'Kakinada (Pithapuram)', hqTe: 'కాకినాడ', hqEn: 'Kakinada', lat: 16.9891, lng: 82.2475, tzOffsetHours: 5.5 },
      { id: 'ap_east_godavari', nameTe: 'తూర్పు గోదావరి (రాజమహేంద్రవరం)', nameEn: 'East Godavari (Rajahmundry)', hqTe: 'రాజమహేంద్రవరం', hqEn: 'Rajahmundry', lat: 17.0005, lng: 81.8040, tzOffsetHours: 5.5 },
      { id: 'ap_west_godavari', nameTe: 'పశ్చిమ గోదావరి (భీమవరం)', nameEn: 'West Godavari (Bhimavaram)', hqTe: 'భీమవరం', hqEn: 'Bhimavaram', lat: 16.5449, lng: 81.5212, tzOffsetHours: 5.5 },
      { id: 'ap_konaseema', nameTe: 'కోనసీమ (అమలాపురం)', nameEn: 'Konaseema (Amalapuram)', hqTe: 'అమలాపురం', hqEn: 'Amalapuram', lat: 16.5787, lng: 82.0061, tzOffsetHours: 5.5 },
      { id: 'ap_eluru', nameTe: 'ఏలూరు', nameEn: 'Eluru', hqTe: 'ఏలూరు', hqEn: 'Eluru', lat: 16.7107, lng: 81.0952, tzOffsetHours: 5.5 },
      { id: 'ap_krishna', nameTe: 'కృష్ణా (మచిలీపట్నం)', nameEn: 'Krishna (Machilipatnam)', hqTe: 'మచిలీపట్నం', hqEn: 'Machilipatnam', lat: 16.1875, lng: 81.1389, tzOffsetHours: 5.5 },
      { id: 'ap_srikakulam', nameTe: 'శ్రీకాకుళం', nameEn: 'Srikakulam', hqTe: 'శ్రీకాకుళం', hqEn: 'Srikakulam', lat: 18.2949, lng: 83.8938, tzOffsetHours: 5.5 },
      { id: 'ap_vizianagaram', nameTe: 'విజయనగరం', nameEn: 'Vizianagaram', hqTe: 'విజయనగరం', hqEn: 'Vizianagaram', lat: 18.1067, lng: 83.3956, tzOffsetHours: 5.5 },
      { id: 'ap_parvathipuram', nameTe: 'పార్వతీపురం మన్యం', nameEn: 'Parvathipuram Manyam', hqTe: 'పార్వతీపురం', hqEn: 'Parvathipuram', lat: 18.7783, lng: 83.4270, tzOffsetHours: 5.5 },
      { id: 'ap_alluri', nameTe: 'అల్లూరి సీతారామరాజు (పాడేరు)', nameEn: 'Alluri Sitharama Raju (Paderu)', hqTe: 'పాడేరు', hqEn: 'Paderu', lat: 18.0811, lng: 82.6644, tzOffsetHours: 5.5 },
      { id: 'ap_anakapalli', nameTe: 'అనకాపల్లి', nameEn: 'Anakapalli', hqTe: 'అనకాపల్లి', hqEn: 'Anakapalli', lat: 17.6913, lng: 83.0039, tzOffsetHours: 5.5 },
      { id: 'ap_palnadu', nameTe: 'పల్నాడు (నరసరావుపేట)', nameEn: 'Palnadu (Narasaraopet)', hqTe: 'నరసరావుపేట', hqEn: 'Narasaraopet', lat: 16.2360, lng: 80.0475, tzOffsetHours: 5.5 },
      { id: 'ap_bapatla', nameTe: 'బాపట్ల', nameEn: 'Bapatla', hqTe: 'బాపట్ల', hqEn: 'Bapatla', lat: 15.9044, lng: 80.4675, tzOffsetHours: 5.5 },
      { id: 'ap_prakasam', nameTe: 'ప్రకాశం (ఒంగోలు)', nameEn: 'Prakasam (Ongole)', hqTe: 'ఒంగోలు', hqEn: 'Ongole', lat: 15.5057, lng: 80.0499, tzOffsetHours: 5.5 },
      { id: 'ap_nellore', nameTe: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు', nameEn: 'SPSR Nellore', hqTe: 'నెల్లూరు', hqEn: 'Nellore', lat: 14.4426, lng: 79.9865, tzOffsetHours: 5.5 },
      { id: 'ap_kurnool', nameTe: 'కర్నూలు', nameEn: 'Kurnool', hqTe: 'కర్నూలు', hqEn: 'Kurnool', lat: 15.8281, lng: 78.0373, tzOffsetHours: 5.5 },
      { id: 'ap_nandyal', nameTe: 'నంద్యాల (శ్రీశైలం)', nameEn: 'Nandyal (Srisailam)', hqTe: 'నంద్యాల', hqEn: 'Nandyal', lat: 15.4786, lng: 78.4836, tzOffsetHours: 5.5 },
      { id: 'ap_anantapur', nameTe: 'అనంతపురం', nameEn: 'Anantapuramu', hqTe: 'అనంతపురం', hqEn: 'Anantapuramu', lat: 14.6819, lng: 77.6006, tzOffsetHours: 5.5 },
      { id: 'ap_sri_sathya_sai', nameTe: 'శ్రీ సత్యసాయి (పుట్టపర్తి)', nameEn: 'Sri Sathya Sai (Puttaparthi)', hqTe: 'పుట్టపర్తి', hqEn: 'Puttaparthi', lat: 14.1652, lng: 77.8117, tzOffsetHours: 5.5 },
      { id: 'ap_kadapa', nameTe: 'వైఎస్ఆర్ కడప', nameEn: 'YSR Kadapa', hqTe: 'కడప', hqEn: 'Kadapa', lat: 14.4673, lng: 78.8242, tzOffsetHours: 5.5 },
      { id: 'ap_annamayya', nameTe: 'అన్నమయ్య (రాయచోటి)', nameEn: 'Annamayya (Rayachoti)', hqTe: 'రాయచోటి', hqEn: 'Rayachoti', lat: 14.0583, lng: 78.7517, tzOffsetHours: 5.5 },
      { id: 'ap_chittoor', nameTe: 'చిత్తూరు (శ్రీకాళహస్తి / కాణిపాకం)', nameEn: 'Chittoor (Srikalahasti)', hqTe: 'చిత్తూరు', hqEn: 'Chittoor', lat: 13.2172, lng: 79.1003, tzOffsetHours: 5.5 },
    ],
  },
  {
    id: 'telangana',
    nameTe: 'తెలంగాణ (Telangana - 33 జిల్లాలు)',
    nameEn: 'Telangana (All 33 Districts)',
    countryTe: 'భారతదేశం',
    countryEn: 'India',
    districts: [
      { id: 'tg_hyderabad', nameTe: 'హైదరాబాద్', nameEn: 'Hyderabad', hqTe: 'హైదరాబాద్', hqEn: 'Hyderabad', lat: 17.3850, lng: 78.4867, tzOffsetHours: 5.5 },
      { id: 'tg_rangareddy', nameTe: 'రంగారెడ్డి', nameEn: 'Ranga Reddy', hqTe: 'రంగారెడ్డి', hqEn: 'Ranga Reddy', lat: 17.3297, lng: 78.5521, tzOffsetHours: 5.5 },
      { id: 'tg_medchal', nameTe: 'మేడ్చల్-మల్కాజిగిరి', nameEn: 'Medchal-Malkajgiri', hqTe: 'శామీర్ పేట', hqEn: 'Medchal', lat: 17.6305, lng: 78.4815, tzOffsetHours: 5.5 },
      { id: 'tg_warangal', nameTe: 'వరంగల్', nameEn: 'Warangal', hqTe: 'వరంగల్', hqEn: 'Warangal', lat: 17.9689, lng: 79.5941, tzOffsetHours: 5.5 },
      { id: 'tg_hanamkonda', nameTe: 'హనుమకొండ', nameEn: 'Hanamkonda', hqTe: 'హనుమకొండ', hqEn: 'Hanamkonda', lat: 18.0000, lng: 79.5800, tzOffsetHours: 5.5 },
      { id: 'tg_karimnagar', nameTe: 'కరీంనగర్', nameEn: 'Karimnagar', hqTe: 'కరీంనగర్', hqEn: 'Karimnagar', lat: 18.4386, lng: 79.1288, tzOffsetHours: 5.5 },
      { id: 'tg_khammam', nameTe: 'ఖమ్మం', nameEn: 'Khammam', hqTe: 'ఖమ్మం', hqEn: 'Khammam', lat: 17.2473, lng: 80.1514, tzOffsetHours: 5.5 },
      { id: 'tg_nizamabad', nameTe: 'నిజామాబాద్', nameEn: 'Nizamabad', hqTe: 'నిజామాబాద్', hqEn: 'Nizamabad', lat: 18.6725, lng: 78.0941, tzOffsetHours: 5.5 },
      { id: 'tg_nalgonda', nameTe: 'నల్లగొండ', nameEn: 'Nalgonda', hqTe: 'నల్లగొండ', hqEn: 'Nalgonda', lat: 17.0575, lng: 79.2684, tzOffsetHours: 5.5 },
      { id: 'tg_mahabubnagar', nameTe: 'మహబూబ్ నగర్', nameEn: 'Mahabubnagar', hqTe: 'మహబూబ్ నగర్', hqEn: 'Mahabubnagar', lat: 16.7488, lng: 78.0035, tzOffsetHours: 5.5 },
      { id: 'tg_sangareddy', nameTe: 'సంగారెడ్డి', nameEn: 'Sangareddy', hqTe: 'సంగారెడ్డి', hqEn: 'Sangareddy', lat: 17.6194, lng: 78.0823, tzOffsetHours: 5.5 },
      { id: 'tg_siddipet', nameTe: 'సిద్దిపేట', nameEn: 'Siddipet', hqTe: 'సిద్దిపేట', hqEn: 'Siddipet', lat: 18.1019, lng: 78.8521, tzOffsetHours: 5.5 },
      { id: 'tg_medak', nameTe: 'మెదక్', nameEn: 'Medak', hqTe: 'మెదక్', hqEn: 'Medak', lat: 18.0489, lng: 78.2611, tzOffsetHours: 5.5 },
      { id: 'tg_vikarabad', nameTe: 'వికారాబాద్', nameEn: 'Vikarabad', hqTe: 'వికారాబాద్', hqEn: 'Vikarabad', lat: 17.3364, lng: 77.9048, tzOffsetHours: 5.5 },
      { id: 'tg_kamareddy', nameTe: 'కామారెడ్డి', nameEn: 'Kamareddy', hqTe: 'కామారెడ్డి', hqEn: 'Kamareddy', lat: 18.3205, lng: 78.3340, tzOffsetHours: 5.5 },
      { id: 'tg_adilabad', nameTe: 'ఆదిలాబాద్', nameEn: 'Adilabad', hqTe: 'ఆదిలాబాద్', hqEn: 'Adilabad', lat: 19.6641, lng: 78.5320, tzOffsetHours: 5.5 },
      { id: 'tg_nirmal', nameTe: 'నిర్మల్ (బాసర)', nameEn: 'Nirmal (Basara)', hqTe: 'నిర్మల్', hqEn: 'Nirmal', lat: 19.0964, lng: 78.3430, tzOffsetHours: 5.5 },
      { id: 'tg_asifabad', nameTe: 'కొమరంభీమ్ ఆసిఫాబాద్', nameEn: 'Komaram Bheem Asifabad', hqTe: 'ఆసిఫాబాద్', hqEn: 'Asifabad', lat: 19.3644, lng: 79.2882, tzOffsetHours: 5.5 },
      { id: 'tg_mancherial', nameTe: 'మంచిర్యాల', nameEn: 'Mancherial', hqTe: 'మంచిర్యాల', hqEn: 'Mancherial', lat: 18.8716, lng: 79.4443, tzOffsetHours: 5.5 },
      { id: 'tg_jagtial', nameTe: 'జగిత్యాల (ధర్మపురి / కొండగట్టు)', nameEn: 'Jagtial (Dharmapuri)', hqTe: 'జగిత్యాల', hqEn: 'Jagtial', lat: 18.7895, lng: 78.9120, tzOffsetHours: 5.5 },
      { id: 'tg_peddapalli', nameTe: 'పెద్దపల్లి', nameEn: 'Peddapalli', hqTe: 'పెద్దపల్లి', hqEn: 'Peddapalli', lat: 18.6151, lng: 79.3827, tzOffsetHours: 5.5 },
      { id: 'tg_sircilla', nameTe: 'రాజన్న సిరిసిల్ల (వేములవాడ)', nameEn: 'Rajanna Sircilla (Vemulawada)', hqTe: 'సిరిసిల్ల', hqEn: 'Sircilla', lat: 18.3887, lng: 78.8101, tzOffsetHours: 5.5 },
      { id: 'tg_mahabubabad', nameTe: 'మహబూబాబాద్', nameEn: 'Mahabubabad', hqTe: 'మహబూబాబాద్', hqEn: 'Mahabubabad', lat: 17.6026, lng: 80.0020, tzOffsetHours: 5.5 },
      { id: 'tg_bhupalpally', nameTe: 'జయశంకర్ భూపాలపల్లి (కాళేశ్వరం)', nameEn: 'Jayashankar Bhupalpally', hqTe: 'భూపాలపల్లి', hqEn: 'Bhupalpally', lat: 18.4357, lng: 79.8691, tzOffsetHours: 5.5 },
      { id: 'tg_jangaon', nameTe: 'జనగామ', nameEn: 'Jangaon', hqTe: 'జనగామ', hqEn: 'Jangaon', lat: 17.7259, lng: 79.1524, tzOffsetHours: 5.5 },
      { id: 'tg_mulugu', nameTe: 'ములుగు (రామప్ప)', nameEn: 'Mulugu', hqTe: 'ములుగు', hqEn: 'Mulugu', lat: 18.1915, lng: 79.9410, tzOffsetHours: 5.5 },
      { id: 'tg_kothagudem', nameTe: 'భద్రాద్రి కొత్తగూడెం (భద్రాచలం)', nameEn: 'Bhadradri Kothagudem (Bhadrachalam)', hqTe: 'కొత్తగూడెం', hqEn: 'Kothagudem', lat: 17.5556, lng: 80.6194, tzOffsetHours: 5.5 },
      { id: 'tg_suryapet', nameTe: 'సూర్యాపేట', nameEn: 'Suryapet', hqTe: 'సూర్యాపేట', hqEn: 'Suryapet', lat: 17.1415, lng: 79.6236, tzOffsetHours: 5.5 },
      { id: 'tg_yadadri', nameTe: 'యాదాద్రి భువనగిరి (యాదగిరిగుట్ట)', nameEn: 'Yadadri Bhuvanagiri', hqTe: 'భువనగిరి', hqEn: 'Bhuvanagiri', lat: 17.5117, lng: 78.8878, tzOffsetHours: 5.5 },
      { id: 'tg_nagarkurnool', nameTe: 'నాగర్ కర్నూల్', nameEn: 'Nagarkurnool', hqTe: 'నాగర్ కర్నూల్', hqEn: 'Nagarkurnool', lat: 16.4862, lng: 78.3218, tzOffsetHours: 5.5 },
      { id: 'tg_wanaparthy', nameTe: 'వనపర్తి', nameEn: 'Wanaparthy', hqTe: 'వనపర్తి', hqEn: 'Wanaparthy', lat: 16.3624, lng: 78.0622, tzOffsetHours: 5.5 },
      { id: 'tg_gadwal', nameTe: 'జోగులాంబ గద్వాల (అలంపూర్)', nameEn: 'Jogulamba Gadwal (Alampur)', hqTe: 'గద్వాల', hqEn: 'Gadwal', lat: 16.2337, lng: 77.8081, tzOffsetHours: 5.5 },
      { id: 'tg_narayanpet', nameTe: 'నారాయణపేట', nameEn: 'Narayanpet', hqTe: 'నారాయణపేట', hqEn: 'Narayanpet', lat: 16.7445, lng: 77.4959, tzOffsetHours: 5.5 },
    ],
  },
  {
    id: 'karnataka',
    nameTe: 'కర్ణాటక (Karnataka)',
    nameEn: 'Karnataka',
    countryTe: 'భారతదేశం',
    countryEn: 'India',
    districts: [
      { id: 'ka_bengaluru', nameTe: 'బెంగళూరు (Bengaluru)', nameEn: 'Bengaluru Urban', hqTe: 'బెంగళూరు', hqEn: 'Bengaluru', lat: 12.9716, lng: 77.5946, tzOffsetHours: 5.5 },
      { id: 'ka_mysuru', nameTe: 'మైసూరు (Mysuru)', nameEn: 'Mysuru', hqTe: 'మైసూరు', hqEn: 'Mysuru', lat: 12.2958, lng: 76.6394, tzOffsetHours: 5.5 },
      { id: 'ka_ballari', nameTe: 'బళ్లారి (Ballari)', nameEn: 'Ballari', hqTe: 'బళ్లారి', hqEn: 'Ballari', lat: 15.1394, lng: 76.9214, tzOffsetHours: 5.5 },
      { id: 'ka_raichur', nameTe: 'రాయచూర్ (Raichur)', nameEn: 'Raichur', hqTe: 'రాయచూర్', hqEn: 'Raichur', lat: 16.2076, lng: 77.3463, tzOffsetHours: 5.5 },
      { id: 'ka_udupi', nameTe: 'ఉడుపి / మంగళూరు (Udupi)', nameEn: 'Udupi / Mangaluru', hqTe: 'ఉడుపి', hqEn: 'Udupi', lat: 13.3409, lng: 74.7421, tzOffsetHours: 5.5 },
    ],
  },
  {
    id: 'tamil_nadu',
    nameTe: 'తమిళనాడు (Tamil Nadu)',
    nameEn: 'Tamil Nadu',
    countryTe: 'భారతదేశం',
    countryEn: 'India',
    districts: [
      { id: 'tn_chennai', nameTe: 'చెన్నై (Chennai)', nameEn: 'Chennai', hqTe: 'చెన్నై', hqEn: 'Chennai', lat: 13.0827, lng: 80.2707, tzOffsetHours: 5.5 },
      { id: 'tn_coimbatore', nameTe: 'కోయంబత్తూరు (Coimbatore)', nameEn: 'Coimbatore', hqTe: 'కోయంబత్తూరు', hqEn: 'Coimbatore', lat: 11.0168, lng: 76.9558, tzOffsetHours: 5.5 },
      { id: 'tn_madurai', nameTe: 'మధురై (Madurai)', nameEn: 'Madurai', hqTe: 'మధురై', hqEn: 'Madurai', lat: 9.9252, lng: 78.1198, tzOffsetHours: 5.5 },
      { id: 'tn_kanchipuram', nameTe: 'కాంచీపురం (Kanchipuram)', nameEn: 'Kanchipuram', hqTe: 'కాంచీపురం', hqEn: 'Kanchipuram', lat: 12.8342, lng: 79.7036, tzOffsetHours: 5.5 },
      { id: 'tn_thanjavur', nameTe: 'తంజావూరు / కుంభకోణం (Navagraha Kshetram)', nameEn: 'Thanjavur / Kumbakonam', hqTe: 'కుంభకోణం', hqEn: 'Kumbakonam', lat: 10.9601, lng: 79.3845, tzOffsetHours: 5.5 },
    ],
  },
  {
    id: 'other_india',
    nameTe: 'ఇతర భారత రాష్ట్రాలు (Major Indian States)',
    nameEn: 'Other Indian States',
    countryTe: 'భారతదేశం',
    countryEn: 'India',
    districts: [
      { id: 'in_mumbai', nameTe: 'ముంబై - మహారాష్ట్ర (Mumbai)', nameEn: 'Mumbai (Maharashtra)', hqTe: 'ముంబై', hqEn: 'Mumbai', lat: 19.0760, lng: 72.8777, tzOffsetHours: 5.5 },
      { id: 'in_pune', nameTe: 'పుణె - మహారాష్ట్ర (Pune)', nameEn: 'Pune (Maharashtra)', hqTe: 'పుణె', hqEn: 'Pune', lat: 18.5204, lng: 73.8567, tzOffsetHours: 5.5 },
      { id: 'in_delhi', nameTe: 'న్యూఢిల్లీ (New Delhi)', nameEn: 'New Delhi (NCT)', hqTe: 'న్యూఢిల్లీ', hqEn: 'New Delhi', lat: 28.6139, lng: 77.2090, tzOffsetHours: 5.5 },
      { id: 'in_varanasi', nameTe: 'వారణాసి / కాశీ - ఉత్తరప్రదేశ్ (Varanasi)', nameEn: 'Varanasi (Uttar Pradesh)', hqTe: 'వారణాసి', hqEn: 'Varanasi', lat: 25.3176, lng: 82.9739, tzOffsetHours: 5.5 },
      { id: 'in_ujjain', nameTe: 'ఉజ్జయిని - మధ్యప్రదేశ్ (Ujjain Prime Meridian)', nameEn: 'Ujjain (Madhya Pradesh)', hqTe: 'ఉజ్జయిని', hqEn: 'Ujjain', lat: 23.1765, lng: 75.7885, tzOffsetHours: 5.5 },
      { id: 'in_kolkata', nameTe: 'కోల్‌కతా - పశ్చిమ బెంగాల్ (Kolkata)', nameEn: 'Kolkata (West Bengal)', hqTe: 'కోల్‌కతా', hqEn: 'Kolkata', lat: 22.5726, lng: 88.3639, tzOffsetHours: 5.5 },
      { id: 'in_ahmedabad', nameTe: 'అహ్మదాబాద్ - గుజరాత్ (Ahmedabad)', nameEn: 'Ahmedabad (Gujarat)', hqTe: 'అహ్మదాబాద్', hqEn: 'Ahmedabad', lat: 23.0225, lng: 72.5714, tzOffsetHours: 5.5 },
      { id: 'in_bhubaneswar', nameTe: 'భువనేశ్వర్ / పూరి - ఒడిశా (Bhubaneswar)', nameEn: 'Bhubaneswar (Odisha)', hqTe: 'భువనేశ్వర్', hqEn: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, tzOffsetHours: 5.5 },
      { id: 'in_thiruvananthapuram', nameTe: 'తిరువనంతపురం - కేరళ (Kerala)', nameEn: 'Thiruvananthapuram (Kerala)', hqTe: 'తిరువనంతపురం', hqEn: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, tzOffsetHours: 5.5 },
    ],
  },
  {
    id: 'international_nri',
    nameTe: 'విదేశాలు (USA / UK / UAE / Australia / Global)',
    nameEn: 'International Cities (USA / UK / UAE / Global)',
    countryTe: 'విదేశాలు',
    countryEn: 'International',
    districts: [
      { id: 'us_new_york', nameTe: 'న్యూయార్క్ / న్యూజెర్సీ - అమెరికా (EST)', nameEn: 'New York / New Jersey (USA)', hqTe: 'న్యూయార్క్', hqEn: 'New York', lat: 40.7128, lng: -74.0060, tzOffsetHours: -5 },
      { id: 'us_dallas', nameTe: 'డల్లాస్ / ఆస్టిన్ - టెక్సాస్, అమెరికా (CST)', nameEn: 'Dallas / Austin (Texas, USA)', hqTe: 'డల్లాస్', hqEn: 'Dallas', lat: 32.7767, lng: -96.7970, tzOffsetHours: -6 },
      { id: 'us_san_francisco', nameTe: 'శాన్ ఫ్రాన్సిస్కో / కాలిఫోర్నియా - అమెరికా (PST)', nameEn: 'San Francisco / Bay Area (USA)', hqTe: 'శాన్ ఫ్రాన్సిస్కో', hqEn: 'San Francisco', lat: 37.7749, lng: -122.4194, tzOffsetHours: -8 },
      { id: 'us_chicago', nameTe: 'చికాగో - అమెరికా (CST)', nameEn: 'Chicago (USA)', hqTe: 'చికాగో', hqEn: 'Chicago', lat: 41.8781, lng: -87.6298, tzOffsetHours: -6 },
      { id: 'uk_london', nameTe: 'లండన్ - బ్రిటన్ (UK)', nameEn: 'London (United Kingdom)', hqTe: 'లండన్', hqEn: 'London', lat: 51.4769, lng: -0.0005, tzOffsetHours: 0 },
      { id: 'uae_dubai', nameTe: 'దుబాయ్ - యూఏఈ (Dubai, UAE)', nameEn: 'Dubai (UAE)', hqTe: 'దుబాయ్', hqEn: 'Dubai', lat: 25.2048, lng: 55.2708, tzOffsetHours: 4 },
      { id: 'sg_singapore', nameTe: 'సింగపూర్ (Singapore)', nameEn: 'Singapore', hqTe: 'సింగపూర్', hqEn: 'Singapore', lat: 1.3521, lng: 103.8198, tzOffsetHours: 8 },
      { id: 'au_sydney', nameTe: 'సిడ్నీ / మెల్‌బోర్న్ - ఆస్ట్రేలియా (Sydney)', nameEn: 'Sydney (Australia)', hqTe: 'సిడ్నీ', hqEn: 'Sydney', lat: -33.8688, lng: 151.2093, tzOffsetHours: 10 },
      { id: 'ca_toronto', nameTe: 'టొరంటో - కెనడా (Toronto, Canada)', nameEn: 'Toronto (Canada)', hqTe: 'టొరంటో', hqEn: 'Toronto', lat: 43.6532, lng: -79.3832, tzOffsetHours: -5 },
      { id: 'ch_zurich', nameTe: 'జ్యూరిచ్ - స్విట్జర్లాండ్ (Zürich)', nameEn: 'Zürich (Switzerland)', hqTe: 'జ్యూరిచ్', hqEn: 'Zürich', lat: 47.3769, lng: 8.5417, tzOffsetHours: 1 },
    ],
  },
];

// 12 Rasis in Telugu — ఒకే మూలం: rasiNames.ts (చక్ర భేదం తప్పకుండా)
export { TELUGU_RASIS } from './rasiNames.ts';
// Planets in Telugu + Short Chart Labels
export const TELUGU_PLANETS: Record<
  string,
  { nameTe: string; shortTe: string; ratnamTe: string; dhatuTe: string; devataTe: string; danamTe: string; mantramTe: string }
> = {
  Sun: {
    nameTe: 'సూర్యుడు (రవి)',
    shortTe: 'సూ',
    ratnamTe: 'కెంపు (Ruby / Manikyam)',
    dhatuTe: 'బంగారం / రాగి',
    devataTe: 'శ్రీ సూర్యనారాయణ స్వామి / శివుడు',
    danamTe: 'గోధుమలు, బెల్లం, ఎర్రని వస్త్రం',
    mantramTe: 'ఓం హ్రాం హ్రీం హ్రౌం సః సూర్యాయ నమః (ఆదిత్య హృదయం)',
  },
  Moon: {
    nameTe: 'చంద్రుడు (సోముడు)',
    shortTe: 'చం',
    ratnamTe: 'ముత్యం (Natural Pearl)',
    dhatuTe: 'వెండి',
    devataTe: 'శ్రీ పార్వతీ దేవి / లలితా త్రిపురసుందరి',
    danamTe: 'బియ్యం, పాలు, తెల్లని వస్త్రం',
    mantramTe: 'ఓం శ్రాం శ్రీం శ్రౌం సః చంద్రమసే నమః',
  },
  Mars: {
    nameTe: 'కుజుడు (అంగారకుడు)',
    shortTe: 'కు',
    ratnamTe: 'పగడం (Red Coral)',
    dhatuTe: 'రాగి / బంగారం',
    devataTe: 'శ్రీ సుబ్రహ్మణ్య స్వామి / ఆంజనేయ స్వామి',
    danamTe: 'కందులు (Red Gram), ఎర్రని వస్త్రం',
    mantramTe: 'ఓం క్రాం క్రీం క్రౌం సః భౌమాయ నమః (సుబ్రహ్మణ్య అష్టకం)',
  },
  Mercury: {
    nameTe: 'బుధుడు (సౌమ్యుడు)',
    shortTe: 'బు',
    ratnamTe: 'పచ్చ (Emerald / Marakatham)',
    dhatuTe: 'బంగారం / కంచు',
    devataTe: 'శ్రీ మహావిష్ణువు / వేంకటేశ్వర స్వామి',
    danamTe: 'పెసలు (Green Gram), ఆకుపచ్చ వస్త్రం',
    mantramTe: 'ఓం బ్రాం బ్రీం బ్రౌం సః బుధాయ నమః (విష్ణు సహస్రనామం)',
  },
  Jupiter: {
    nameTe: 'గురువు (బృహస్పతి)',
    shortTe: 'గు',
    ratnamTe: 'పుష్యరాగం (Yellow Sapphire)',
    dhatuTe: 'బంగారం',
    devataTe: 'శ్రీ దక్షిణామూర్తి / దత్తాత్రేయ స్వామి',
    danamTe: 'శనగలు (Bengal Gram), పసుపు వస్త్రం, పసుపు',
    mantramTe: 'ఓం గ్రాం గ్రీం గ్రౌం సః గురవే నమః (దక్షిణామూర్తి స్తోత్రం)',
  },
  Venus: {
    nameTe: 'శుక్రుడు (భార్గవుడు)',
    shortTe: 'శు',
    ratnamTe: 'వజ్రం (Diamond / White Zircon)',
    dhatuTe: 'వెండి / ప్లాటినం',
    devataTe: 'శ్రీ మహాలక్ష్మీ దేవి',
    danamTe: 'బొబ్బర్లు (White Cowpea), నెయ్యి, తెల్లని పట్టు వస్త్రం',
    mantramTe: 'ఓం ద్రాం ద్రీం ద్రౌం సః శుక్రాయ నమః (శ్రీ సూక్తం / కనకధారా స్తోత్రం)',
  },
  Saturn: {
    nameTe: 'శని (మందుడు)',
    shortTe: 'శ',
    ratnamTe: 'నీలం (Blue Sapphire / Indraneelam)',
    dhatuTe: 'ఇనుము / వెండి',
    devataTe: 'శ్రీ ఆంజనేయ స్వామి / వేంకటేశ్వర స్వామి / శనీశ్వరుడు',
    danamTe: 'నల్ల నువ్వులు, నువ్వుల నూనె, నల్లని వస్త్రం',
    mantramTe: 'ఓం ప్రాం ప్రీం ప్రౌం సః శనైశ్చరాయ నమః (హనుమాన్ చాలీసా)',
  },
  Rahu: {
    nameTe: 'రాహువు',
    shortTe: 'రా',
    ratnamTe: 'గోమేధికం (Hessonite)',
    dhatuTe: 'పంచలోహం / వెండి',
    devataTe: 'శ్రీ దుర్గా భవానీ అమ్మవారు / శ్రీకాళహస్తీశ్వరుడు',
    danamTe: 'మినుములు (Black Gram), నీలి వస్త్రం',
    mantramTe: 'ఓం భ్రాం భ్రీం భ్రౌం సః రాహవే నమః (దుర్గా సూక్తం)',
  },
  Ketu: {
    nameTe: 'కేతువు',
    shortTe: 'కే',
    ratnamTe: 'వైఢూర్యం (Cat’s Eye)',
    dhatuTe: 'పంచలోహం / బంగారం',
    devataTe: 'శ్రీ మహా గణపతి',
    danamTe: 'ఉలవలు (Horse Gram), చిత్రవర్ణ వస్త్రం',
    mantramTe: 'ఓం స్రాం స్రీం స్రౌం సః కేతవే నమః (సంకటనాశన గణేశ స్తోత్రం)',
  },
  Uranus: {
    nameTe: 'యురేనస్ (అరుణుడు)',
    shortTe: 'యు',
    ratnamTe: 'గోమేధికం',
    dhatuTe: 'వెండి',
    devataTe: 'శ్రీ రుద్రుడు',
    danamTe: 'ధాన్యం',
    mantramTe: 'ఓం నమః శివాయ',
  },
  Neptune: {
    nameTe: 'నెప్ట్యూన్ (వరుణుడు)',
    shortTe: 'నె',
    ratnamTe: 'ముత్యం / పుష్యరాగం',
    dhatuTe: 'వెండి',
    devataTe: 'శ్రీ వరుణ దేవుడు',
    danamTe: 'అన్నదానం',
    mantramTe: 'ఓం నమో నారాయణాయ',
  },
  Pluto: {
    nameTe: 'ప్లూటో (యముడు)',
    shortTe: 'ప్లూ',
    ratnamTe: 'పగడం',
    dhatuTe: 'రాగి',
    devataTe: 'శ్రీ కాలభైరవుడు',
    danamTe: 'దీపదానం',
    mantramTe: 'ఓం కాలభైరవాయ నమః',
  },
  Chiron: {
    nameTe: 'కైరాన్ (ధన్వంతరి)',
    shortTe: 'కై',
    ratnamTe: 'పుష్యరాగం',
    dhatuTe: 'బంగారం',
    devataTe: 'శ్రీ ధన్వంతరి స్వామి',
    danamTe: 'ఔషధ దానం',
    mantramTe: 'ఓం నమో భగవతే వాసుదేవాయ ధన్వంతరయే',
  },
};

// 27 Nakshatras in Telugu with all 4 Pada Nama Syllables (108 Aksharalu)
export const TELUGU_NAKSHATRAS: {
  index: number;
  nameTe: string;
  nameEn: string;
  lordTe: string;
  deityTe: string;
  ganaTe: string;
  yoniTe: string;
  nadiTe: string;
  rajjuTe: string;
  padasTe: [string, string, string, string];
}[] = [
  { index: 0, nameTe: 'అశ్విని', nameEn: 'Ashwini', lordTe: 'కేతువు', deityTe: 'అశ్వినీ దేవతలు', ganaTe: 'దేవ గణం', yoniTe: 'అశ్వ (గుర్రం)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'పాద రజ్జు', padasTe: ['చూ', 'చే', 'చో', 'లా'] },
  { index: 1, nameTe: 'భరణి', nameEn: 'Bharani', lordTe: 'శుక్రుడు', deityTe: 'యమధర్మరాజు', ganaTe: 'మనుష్య గణం', yoniTe: 'గజ (ఏనుగు)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'కటి రజ్జు', padasTe: ['లీ', 'లూ', 'లే', 'లో'] },
  { index: 2, nameTe: 'కృత్తిక', nameEn: 'Krittika', lordTe: 'సూర్యుడు (రవి)', deityTe: 'అగ్ని దేవుడు', ganaTe: 'రాక్షస గణం', yoniTe: 'మేష (గొర్రె)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'నాభి రజ్జు', padasTe: ['అ', 'ఈ', 'ఉ', 'ఏ'] },
  { index: 3, nameTe: 'రోహిణి', nameEn: 'Rohini', lordTe: 'చంద్రుడు', deityTe: 'బ్రహ్మ దేవుడు', ganaTe: 'మనుష్య గణం', yoniTe: 'సర్ప (పాము)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'కంఠ రజ్జు', padasTe: ['ఓ', 'వా', 'వీ', 'వూ'] },
  { index: 4, nameTe: 'మృగశిర', nameEn: 'Mrigashira', lordTe: 'కుజుడు', deityTe: 'చంద్రుడు (సోముడు)', ganaTe: 'దేవ గణం', yoniTe: 'సర్ప (పాము)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'శిరో రజ్జు', padasTe: ['వే', 'వో', 'కా', 'కీ'] },
  { index: 5, nameTe: 'ఆర్ద్ర', nameEn: 'Ardra', lordTe: 'రాహువు', deityTe: 'రుద్రుడు (శివుడు)', ganaTe: 'మనుష్య గణం', yoniTe: 'శ్వాన (కుక్క)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'కంఠ రజ్జు', padasTe: ['కూ', 'ఘ', 'ఙ', 'ఛ'] },
  { index: 6, nameTe: 'పునర్వసు', nameEn: 'Punarvasu', lordTe: 'గురువు', deityTe: 'అదితి దేవత', ganaTe: 'దేవ గణం', yoniTe: 'మార్జాల (పిల్లి)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'నాభి రజ్జు', padasTe: ['కే', 'కో', 'హా', 'హీ'] },
  { index: 7, nameTe: 'పుష్యమి', nameEn: 'Pushya', lordTe: 'శని', deityTe: 'బృహస్పతి', ganaTe: 'దేవ గణం', yoniTe: 'మేష (గొర్రె)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'కటి రజ్జు', padasTe: ['హూ', 'హే', 'హో', 'డా'] },
  { index: 8, nameTe: 'ఆశ్లేష', nameEn: 'Ashlesha', lordTe: 'బుధుడు', deityTe: 'నాగ దేవతలు', ganaTe: 'రాక్షస గణం', yoniTe: 'మార్జాల (పిల్లి)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'పాద రజ్జు', padasTe: ['డీ', 'డూ', 'డే', 'డో'] },
  { index: 9, nameTe: 'మఘ', nameEn: 'Magha', lordTe: 'కేతువు', deityTe: 'పితృ దేవతలు', ganaTe: 'రాక్షస గణం', yoniTe: 'మూషిక (ఎలుక)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'పాద రజ్జు', padasTe: ['మా', 'మీ', 'మూ', 'మే'] },
  { index: 10, nameTe: 'పుబ్బ (పూర్వ ఫల్గుణి)', nameEn: 'Purva Phalguni', lordTe: 'శుక్రుడు', deityTe: 'భగ దేవుడు', ganaTe: 'మనుష్య గణం', yoniTe: 'మూషిక (ఎలుక)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'కటి రజ్జు', padasTe: ['మో', 'టా', 'టీ', 'టూ'] },
  { index: 11, nameTe: 'ఉత్తర (ఉత్తర ఫల్గుణి)', nameEn: 'Uttara Phalguni', lordTe: 'సూర్యుడు (రవి)', deityTe: 'అర్యముడు', ganaTe: 'మనుష్య గణం', yoniTe: 'గో (ఆవు)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'నాభి రజ్జు', padasTe: ['టే', 'టో', 'పా', 'పీ'] },
  { index: 12, nameTe: 'హస్త', nameEn: 'Hasta', lordTe: 'చంద్రుడు', deityTe: 'సవితృ (సూర్యుడు)', ganaTe: 'దేవ గణం', yoniTe: 'మహిష (దున్న)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'కంఠ రజ్జు', padasTe: ['పూ', 'ష', 'ణ', 'ఠ'] },
  { index: 13, nameTe: 'చిత్త', nameEn: 'Chitra', lordTe: 'కుజుడు', deityTe: 'విశ్వకర్మ', ganaTe: 'రాక్షస గణం', yoniTe: 'వ్యాఘ్ర (పులి)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'శిరో రజ్జు', padasTe: ['పే', 'పో', 'రా', 'రీ'] },
  { index: 14, nameTe: 'స్వాతి', nameEn: 'Swati', lordTe: 'రాహువు', deityTe: 'వాయు దేవుడు', ganaTe: 'దేవ గణం', yoniTe: 'మహిష (దున్న)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'కంఠ రజ్జు', padasTe: ['రూ', 'రే', 'రో', 'తా'] },
  { index: 15, nameTe: 'విశాఖ', nameEn: 'Vishakha', lordTe: 'గురువు', deityTe: 'ఇంద్రాగ్నులు', ganaTe: 'రాక్షస గణం', yoniTe: 'వ్యాఘ్ర (పులి)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'నాభి రజ్జు', padasTe: ['తీ', 'తూ', 'తే', 'తో'] },
  { index: 16, nameTe: 'అనూరాధ', nameEn: 'Anuradha', lordTe: 'శని', deityTe: 'మిత్ర దేవుడు', ganaTe: 'దేవ గణం', yoniTe: 'మృగ (జింక)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'కటి రజ్జు', padasTe: ['నా', 'నీ', 'నూ', 'నే'] },
  { index: 17, nameTe: 'జ్యేష్ఠ', nameEn: 'Jyeshtha', lordTe: 'బుధుడు', deityTe: 'దేవేంద్రుడు', ganaTe: 'రాక్షస గణం', yoniTe: 'మృగ (జింక)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'పాద రజ్జు', padasTe: ['నో', 'యా', 'యీ', 'యూ'] },
  { index: 18, nameTe: 'మూల', nameEn: 'Mula', lordTe: 'కేతువు', deityTe: 'నిరృతి (అలక్ష్మి)', ganaTe: 'రాక్షస గణం', yoniTe: 'శ్వాన (కుక్క)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'పాద రజ్జు', padasTe: ['యే', 'యో', 'భా', 'భీ'] },
  { index: 19, nameTe: 'పూర్వాషాఢ', nameEn: 'Purva Ashadha', lordTe: 'శుక్రుడు', deityTe: 'జల దేవతలు (ఆపః)', ganaTe: 'మనుష్య గణం', yoniTe: 'వానర (కోతి)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'కటి రజ్జు', padasTe: ['భూ', 'ధా', 'ఫా', 'ఢా'] },
  { index: 20, nameTe: 'ఉత్తరాషాఢ', nameEn: 'Uttara Ashadha', lordTe: 'సూర్యుడు (రవి)', deityTe: 'విశ్వేదేవతలు', ganaTe: 'మనుష్య గణం', yoniTe: 'నకుల (ముంగిస)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'నాభి రజ్జు', padasTe: ['భే', 'భో', 'జా', 'జీ'] },
  { index: 21, nameTe: 'శ్రవణం', nameEn: 'Shravana', lordTe: 'చంద్రుడు', deityTe: 'శ్రీ మహావిష్ణువు', ganaTe: 'దేవ గణం', yoniTe: 'వానర (కోతి)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'కంఠ రజ్జు', padasTe: ['ఖీ', 'ఖూ', 'ఖే', 'ఖో'] },
  { index: 22, nameTe: 'ధనిష్ఠ', nameEn: 'Dhanishta', lordTe: 'కుజుడు', deityTe: 'అష్ట వసువులు', ganaTe: 'రాక్షస గణం', yoniTe: 'సింహ (సింహం)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'శిరో రజ్జు', padasTe: ['గా', 'గీ', 'గూ', 'గే'] },
  { index: 23, nameTe: 'శతభిషం', nameEn: 'Shatabhisha', lordTe: 'రాహువు', deityTe: 'వరుణ దేవుడు', ganaTe: 'రాక్షస గణం', yoniTe: 'అశ్వ (గుర్రం)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'కంఠ రజ్జు', padasTe: ['గో', 'సా', 'సీ', 'సూ'] },
  { index: 24, nameTe: 'పూర్వాభాద్ర', nameEn: 'Purva Bhadrapada', lordTe: 'గురువు', deityTe: 'అజైకపాదుడు', ganaTe: 'మనుష్య గణం', yoniTe: 'సింహ (సింహం)', nadiTe: 'ఆది నాడి (వాత)', rajjuTe: 'నాభి రజ్జు', padasTe: ['సే', 'సో', 'దా', 'దీ'] },
  { index: 25, nameTe: 'ఉత్తరాభాద్ర', nameEn: 'Uttara Bhadrapada', lordTe: 'శని', deityTe: 'అహిర్బుధన్యుడు', ganaTe: 'మనుష్య గణం', yoniTe: 'గో (ఆవు)', nadiTe: 'మధ్య నాడి (పిత్త)', rajjuTe: 'కటి రజ్జు', padasTe: ['దూ', 'థ', 'ఝ', 'ఞ'] },
  { index: 26, nameTe: 'రేవతి', nameEn: 'Revati', lordTe: 'బుధుడు', deityTe: 'పూష (సూర్యుడు)', ganaTe: 'దేవ గణం', yoniTe: 'గజ (ఏనుగు)', nadiTe: 'అంత్య నాడి (కఫ)', rajjuTe: 'పాద రజ్జు', padasTe: ['దే', 'దో', 'చ', 'చి'] },
];

// 60 Telugu Ugadi Samvatsaralu (Prabhava to Akshaya)
export const TELUGU_60_SAMVATSARALU: string[] = [
  'ప్రభవ', 'విభవ', 'శుక్ల', 'ప్రమోద్యూత', 'ప్రజోత్పత్తి', 'అంగీరస', 'శ్రీముఖ', 'భావ', 'యువ', 'ధాత',
  'ఈశ్వర', 'బహుధాన్య', 'ప్రమాది', 'విక్రమ', 'వృష', 'చిత్రభాను', 'స్వభాను', 'తారణ', 'పార్థివ', 'వ్యయ',
  'సర్వజిత్తు', 'సర్వధారి', 'విరోధి', 'వికృతి', 'ఖర', 'నందన', 'విజయ', 'జయ', 'మన్మథ', 'దుర్ముఖి',
  'హేవిళంబి', 'విళంబి', 'వికారి', 'శార్వరి', 'ప్లవ', 'శుభకృతు', 'శోభకృతు', 'క్రోధి', 'విశ్వావసు', 'పరాభవ',
  'ప్లవంగ', 'కీలక', 'సౌమ్య', 'సాధారణ', 'విరోధికృతు', 'పరిధావి', 'ప్రమాదీచ', 'ఆనంద', 'రాక్షస', 'నల',
  'పింగళ', 'కాళయుక్తి', 'సిద్ధార్థి', 'రౌద్రి', 'దుర్మతి', 'దుందుభి', 'రుధిరోద్గారి', 'రక్తాక్షి', 'క్రోధన', 'అక్షయ',
];

// Compute exact Amanta Chandramana Masam, Sauramana Masam, Rituvu, Ayanam & Ugadi Samvatsaram
export function getTeluguMasaAndRitu(
  sunSiderealLon: number,
  moonSiderealLon?: number
): {
  masamTe: string;
  amantaMasaIndex: number;
  rituvuTe: string;
  ayanamTe: string;
} {
  const amantaMasalu = [
    'చైత్ర మాసం',
    'వైశాఖ మాసం',
    'జ్యేష్ఠ మాసం',
    'ఆషాఢ మాసం',
    'శ్రావణ మాసం',
    'భాద్రపద మాసం',
    'ఆశ్వయుజ మాసం',
    'కార్తీక మాసం',
    'మార్గశిర మాసం',
    'పుష్య మాసం',
    'మాఘ మాసం',
    'ఫాల్గుణ మాసం',
  ];

  const sauramanaNames = [
    'మేష సౌరమానం',
    'వృషభ సౌరమానం',
    'మిథున సౌరమానం',
    'కర్కాటక సౌరమానం',
    'సింహ సౌరమానం',
    'కన్యా సౌరమానం',
    'తులా సౌరమానం',
    'వృశ్చిక సౌరమానం',
    'ధనుస్సు సౌరమానం',
    'మకర సౌరమానం',
    'కుంభ సౌరమానం',
    'మీన సౌరమానం',
  ];

  const rituvuluByAmanta = [
    'వసంత ఋతువు (Chaitra)',
    'వసంత ఋతువు (Vaisakha)',
    'గ్రీష్మ ఋతువు (Jyeshtha)',
    'గ్రీష్మ ఋతువు (Ashadha)',
    'వర్ష ఋతువు (Shravana)',
    'వర్ష ఋతువు (Bhadrapada)',
    'శరత్ ఋతువు (Ashwayuja)',
    'శరత్ ఋతువు (Kartika)',
    'హేమంత ఋతువు (Margashira)',
    'హేమంత ఋతువు (Pushya)',
    'శిశిర ఋతువు (Magha)',
    'శిశిర ఋతువు (Phalguna)',
  ];

  const sunSignIdx = Math.floor(((sunSiderealLon % 360) + 360) % 360 / 30);

  // In Amanta system, the lunar month begins at New Moon (Amavasya).
  // Find the Sidereal Sun longitude at the preceding New Moon:
  let amantaMasaIndex = (sunSignIdx + 1) % 12;
  if (moonSiderealLon !== undefined) {
    const elongation = ((moonSiderealLon - sunSiderealLon) % 360 + 360) % 360;
    // Sun moves ~0.9856 deg/day while Moon-Sun elongation advances ~12.19075 deg/day (ratio = 0.080848)
    const sunLonAtNewMoon = ((sunSiderealLon - elongation * 0.080848) % 360 + 360) % 360;
    const newMoonSunSign = Math.floor(sunLonAtNewMoon / 30);
    // When New Moon occurs in Meena (11), Chaitra (0) starts; when in Mesha (0), Vaisakha (1) starts, etc.
    amantaMasaIndex = (newMoonSunSign + 1) % 12;
  }

  // Makara (9) to Mithuna (2) is Uttarayanam; Karkataka (3) to Dhanussu (8) is Dakshinayanam
  const isUttarayanam = [9, 10, 11, 0, 1, 2].includes(sunSignIdx);
  return {
    masamTe: `${amantaMasalu[amantaMasaIndex]} (${sauramanaNames[sunSignIdx]})`,
    amantaMasaIndex,
    rituvuTe: rituvuluByAmanta[amantaMasaIndex].split(' (')[0],
    ayanamTe: isUttarayanam ? 'ఉత్తరాయణం (పుణ్యకాలం)' : 'దక్షిణాయణం',
  };
}

// Compute Telugu Ugadi Samvatsaram from Date & Amanta Lunar Month
export function getTeluguSamvatsaram(
  dateStr: string,
  sunSiderealLon?: number,
  moonSiderealLon?: number
): string {
  const [year, month] = dateStr.split('-').map(Number);
  let isBeforeUgadi = month < 3;
  if (month === 3 || month === 4) {
    if (sunSiderealLon !== undefined && moonSiderealLon !== undefined) {
      const { amantaMasaIndex } = getTeluguMasaAndRitu(sunSiderealLon, moonSiderealLon);
      // Magha (10) and Phalguna (11) fall before Chaitra Shukla Padyami (Ugadi)
      isBeforeUgadi = amantaMasaIndex >= 10;
    } else {
      isBeforeUgadi = month === 3;
    }
  }
  const effectiveYear = isBeforeUgadi ? year - 1 : year;
  // 1987 CE Ugadi started Prabhava (index 0)
  const idx = ((effectiveYear - 1987) % 60 + 60) % 60;
  return `${TELUGU_60_SAMVATSARALU[idx]} నామ సంవత్సరం`;
}

export interface DwadashaBhavaPredictionTe {
  bhavaNumber: number;
  titleTe: string;
  titleEn: string;
  rasiNameTe: string;
  adhipatiTe: string;
  adhipatiPlacedHouse: number;
  occupantsTe: string[];
  aspectingPlanetsTe: string[];
  shastraSutraTe: string;
  predictionTe: string;
  strengthTe: 'ఉత్తమ బలం (Strong)' | 'మధ్యమ బలం (Moderate)' | 'శాంతి అవసరము (Needs Remedy)';
}

export interface DoshaPariharaItemTe {
  nameTe: string;
  statusTe: string;
  isPresent: boolean;
  severityTe: 'నిర్దోషం / శుభం' | 'మధ్యమ దోషం (పరిహార యోగ్యము)' | 'ప్రధాన దోషం (శాంతి ఆవశ్యకం)';
  explanationTe: string;
  remedyTe: string;
}

export interface NavagrahaDeepRowTe {
  id: string;
  nameTe: string;
  glyph: string;
  rasiTe: string;
  dms: string;
  house: number;
  nakshatraTe: string;
  pada: number;
  nakshatraLordTe: string;
  dignityTe: string;
  d9RasiTe: string;
  d10RasiTe: string;
  isVargottama: boolean;
  isRetrograde: boolean;
  isCombust: boolean;
  avasthaTe: string;
  drishtiHousesTe: string;
  shadbalaRupas: number;
  phaladeepikaPhalamTe: string;
}

export interface JaiminiKarakaRowTe {
  karakaCode: string;
  karakaNameTe: string;
  karakaRoleTe: string;
  planetId: string;
  planetNameTe: string;
  degreeFormatted: string;
  rasiTe: string;
  navamsaRasiTe: string;
  house: number;
  jaiminiPhalamTe: string;
}

export interface ArudhaPadaItemTe {
  code: string;
  titleTe: string;
  rasiNameTe: string;
  houseFromLagna: number;
  lordTe: string;
  analysisTe: string;
}

export interface ShodashavargaRowTe {
  id: string;
  nameTe: string;
  glyph: string;
  d1Te: string;
  d2Te: string;
  d3Te: string;
  d4Te: string;
  d7Te: string;
  d9Te: string;
  d10Te: string;
  d12Te: string;
  d30Te: string;
  d60Te: string;
  vargottama: boolean;
  vimshopakaScore: number; // out of 20
  vaiseshikamsaTe: string;
}

export interface GranthaResearchCardTe {
  id: string;
  granthaNameTe: string;
  authorTe: string;
  chapterRefTe: string;
  sanskritSlokaTe: string;
  topicTitleTe: string;
  deepAnalysisTe: string;
  keyVerdictTe: string;
}

export interface LifePillarDeepAnalysisTe {
  id: string;
  number: string;
  titleTe: string;
  subtitleEn: string;
  keyHousesTe: string;
  karakaPlanetsTe: string;
  scorePercent: number;
  verdictBadgeTe: string;
  analysisParagraphsTe: string[];
  favorablePeriodsTe: string;
  shastraGuidanceTe: string;
}

export interface MahadashaRoadmapItemTe {
  lordId: string;
  lordTe: string;
  years: number;
  startDate: string;
  endDate: string;
  ageRangeTe: string;
  isCurrent: boolean;
  planetHouse: number;
  planetRasiTe: string;
  dignityTe: string;
  predictionTe: string;
  ratingTe: 'రాజయోగ కాలం' | 'శుభ వృద్ధి కాలం' | 'మిశ్రమ / జాగ్రత్త కాలం';
  antardashasTe: {
    bhuktiLordTe: string;
    startDate: string;
    endDate: string;
    durationMonths: number;
    isCurrent: boolean;
  }[];
}

export interface ShadbalaRowTe {
  id: string;
  nameTe: string;
  glyph: string;
  sthanaBala: number;
  digBala: number;
  kalaBala: number;
  cheshtaBala: number;
  naisargikaBala: number;
  drikBala: number;
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number;
  ratioPercent: number;
  statusTe: 'అత్యుత్తమ బలం (Dominant)' | 'పూర్ణ బలం (Sufficient)' | 'మధ్యమ బలం (Moderate)';
}

export interface AshtakavargaRasiRowTe {
  signIndex: number;
  rasiNameTe: string;
  houseFromLagna: number;
  sunBindus: number;
  moonBindus: number;
  marsBindus: number;
  mercuryBindus: number;
  jupiterBindus: number;
  venusBindus: number;
  saturnBindus: number;
  sarvaBindus: number;
  phalamTe: string;
}

export interface TarabalaRowTe {
  taraNumber: number;
  taraNameTe: string;
  natureTe: 'పరమ శుభం' | 'శుభం' | 'అశుభం / పరిహారం';
  nakshatrasTe: string;
  phalamTe: string;
}

export interface LagnaShastraPramanamTe {
  lagnaNameTe: string;
  tattvamTe: string;
  swabhavamTe: string;
  prakritiTe: string;
  shubhaGrahaluTe: string;
  yogakarakaGrahaTe: string;
  papaGrahaluTe: string;
  marakaGrahaluTe: string;
  badhakaSthanamTe: string;
  badhakadhipatiTe: string;
  lagnaSwaroopaVivaranamTe: string;
}

export interface CompleteTeluguJathakamReport {
  samvatsaramTe: string;
  ayanamTe: string;
  rituvuTe: string;
  masamTe: string;
  pakshamTe: string;
  tithiTe: string;
  vasaramTe: string;
  yogamTe: string;
  karanamTe: string;
  suryodayamTe: string;
  suryastamayamTe: string;
  dinamanamTe: string;
  udayadiIshtaGhatikaluTe: string;
  nakshatraBhuktiSeshamTe: string;
  janmaNakshatramTe: string;
  janmaPadam: number;
  namaAksharamTe: string;
  allFourPadaAksharaluTe: string;
  janmaRasiTe: string;
  janmaRasiAdhipatiTe: string;
  janmaLagnamTe: string;
  janmaLagnaAdhipatiTe: string;
  navamsaLagnamTe: string;
  dasamsaLagnamTe: string;
  ganaTe: string;
  yoniTe: string;
  nadiTe: string;
  rajjuTe: string;
  dashaBalanceAtBirthTe: string;
  lagnaShastraPramanam: LagnaShastraPramanamTe;
  adrushtaVivaralu: {
    ratnamTe: string;
    uparatnamTe: string;
    bhagyaRatnamTe: string;
    wearingMethodTe: string;
    luckyNumbers: string;
    luckyDaysTe: string;
    luckyColorsTe: string;
    luckyDirectionTe: string;
    ishtaDevataTe: string;
    mantramTe: string;
  };
  navagrahaDeepTable: NavagrahaDeepRowTe[];
  jaiminiKarakas: JaiminiKarakaRowTe[];
  arudhaPadas: ArudhaPadaItemTe[];
  shodashavargaTable: ShodashavargaRowTe[];
  shadbalaTableTe: ShadbalaRowTe[];
  ashtakavargaTableTe: AshtakavargaRasiRowTe[];
  tarabalaChakraTe: TarabalaRowTe[];
  granthaPramanaResearch: GranthaResearchCardTe[];
  jeevitaPradhanaRangalu: LifePillarDeepAnalysisTe[];
  dwadashaBhavaPhalitalu: DwadashaBhavaPredictionTe[];
  sampoornaDashaKalachakram: MahadashaRoadmapItemTe[];
  doshaParikshana: DoshaPariharaItemTe[];
  currentDashaPhalamTe: {
    mahadashaTe: string;
    antardashaTe: string;
    pratyantardashaTe: string;
    periodRange: string;
    phalamTe: string;
    pariharamTe: string;
  };
}

const TITHI_TELUGU: string[] = [
  'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి',
  'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి', 'దశమి',
  'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'పౌర్ణమి',
  'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి',
  'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి', 'దశమి',
  'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'అమావాస్య',
];

const VARA_TELUGU: Record<string, string> = {
  Sunday: 'ఆదివారం (భానువాసరం)',
  Monday: 'సోమవారం (ఇందువాసరం)',
  Tuesday: 'మంగళవారం (భౌమవాసరం)',
  Wednesday: 'బుధవారం (సౌమ్యవాసరం)',
  Thursday: 'గురువారం (బృహస్పతివాసరం)',
  Friday: 'శుక్రవారం (భృగువాసరం)',
  Saturday: 'శనివారం (స్థిరవాసరం)',
};

const YOGA_TELUGU_MAP: Record<string, string> = {
  Vishkumbha: 'విష్కంభ యోగం (విజయ శక్తి)',
  Vishkambha: 'విష్కంభ యోగం (విజయ శక్తి)',
  Priti: 'ప్రీతి యోగం (సౌహార్దం & ఆదరణ)',
  Ayushman: 'ఆయుష్మాన్ యోగం (దీర్ఘాయుష్షు & ఆరోగ్యం)',
  Saubhagya: 'సౌభాగ్య యోగం (సకల శుభ సౌభాగ్యం)',
  Shobhana: 'శోభన యోగం (తేజస్సు & కీర్తి)',
  Atiganda: 'అతిగండ యోగం (సాహస శక్తి)',
  Sukarma: 'సుకర్మ యోగం (సత్కర్మ & పుణ్యఫలం)',
  Dhriti: 'ధృతి యోగం (స్థైర్యం & పట్టుదల)',
  Shula: 'శూల యోగం (తీవ్ర పట్టుదల)',
  Ganda: 'గండ యోగం (ఆత్మరక్షణ శక్తి)',
  Vriddhi: 'వృద్ధి యోగం (ధన-విద్యా వృద్ధి)',
  Dhruva: 'ధ్రువ యోగం (శాశ్వత స్థిరత్వం)',
  Vyaghata: 'వ్యాఘాత యోగం (పోరాట పటిమ)',
  Harshana: 'హర్షణ యోగం (ఆనందం & ఉత్సాహం)',
  Vajra: 'వజ్ర యోగం (వజ్ర సంకల్పం)',
  Siddhi: 'సిద్ధి యోగం (సర్వకార్య సిద్ధి)',
  Vyatipata: 'వ్యతీపాత యోగం (ఆధ్యాత్మిక అంతర్దృష్టి)',
  Variyan: 'వరీయాన్ యోగం (ఉన్నత గౌరవం)',
  Parigha: 'పరిఘ యోగం (రక్షణ కవచం)',
  Shiva: 'శివ యోగం (మంగళకరమైన జ్ఞానం)',
  Siddha: 'సిద్ధ యోగం (మంత్ర-విద్యా సిద్ధి)',
  Sadhya: 'సాధ్య యోగం (లక్ష్య సాధన)',
  Shubha: 'శుభ యోగం (ఐశ్వర్యం & శుభం)',
  Shukla: 'శుక్ల యోగం (నిర్మల కీర్తి)',
  Brahma: 'బ్రహ్మ యోగం (ఉన్నత శాస్త్ర జ్ఞానం)',
  Indra: 'ఐంద్ర యోగం (రాజయోగ అధికారం)',
  Vaidhriti: 'వైధృతి యోగం (లోతైన పరిశోధనా శక్తి)',
};

const KARANA_TELUGU_MAP: Record<string, string> = {
  Bava: 'బవ కరణం (చర - శుభప్రదం)',
  Balava: 'బాలవ కరణం (చర - విద్యా/ధన వృద్ధి)',
  Kaulava: 'కౌలవ కరణం (చర - మిత్ర/కుటుంబ సౌఖ్యం)',
  Taitila: 'తైతుల కరణం (చర - సౌభాగ్య వృద్ధి)',
  Garija: 'గరజ కరణం (చర - కృషి విజయం)',
  Gara: 'గరజ కరణం (చర - కృషి విజయం)',
  Vanija: 'వణిజ కరణం (చర - వ్యాపార/వాణిజ్య లాభం)',
  'Vishti (Bhadra)': 'భద్ర / విష్టి కరణం (సాహస కార్య సిద్ధి)',
  Shakuni: 'శకుని కరణం (స్థిర - శాస్త్ర/వైద్య ప్రజ్ఞ)',
  Chatushpada: 'చతుష్పాద కరణం (స్థిర - గో/భూ సంపద)',
  Naga: 'నాగవ కరణం (స్థిర - రహస్య/సాంకేతిక జ్ఞానం)',
  Kimstughna: 'కింస్తుఘ్న కరణం (స్థిర - పుణ్యకార్య సిద్ధి)',
};

const DIGNITY_TE_MAP: Record<string, string> = {
  Exalted: 'ఉచ్చ స్థితి (Exalted)',
  Moolatrikona: 'మూలత్రికోణ బలం',
  'Own Sign': 'స్వక్షేత్రం (Own Sign)',
  Friendly: 'మిత్ర క్షేత్రం',
  Neutral: 'సమ క్షేత్రం',
  Enemy: 'శత్రు క్షేత్రం (Enemy Sign)',
  Debilitated: 'నీచ స్థితి (Debilitated)',
};

// Lagna Functional Classification according to Brihat Parashara Hora Shastra (Laghu Parashari / Ududaya Pradeepa)
const LAGNA_SHASTRA_DATA: {
  tattvamTe: string;
  swabhavamTe: string;
  prakritiTe: string;
  directionTe: string;
  vivaranamTe: string;
}[] = [
  {
    // 0: Mesha (Aries)
    tattvamTe: 'అగ్ని తత్వం (Fiery)',
    swabhavamTe: 'చర రాశి (Movable / Dynamic)',
    prakritiTe: 'పిత్త ప్రకృతి — ధైర్య, నాయకత్వ, చురుకైన స్వభావం',
    directionTe: 'తూర్పు దిశ (East)',
    vivaranamTe: 'బృహత్ పరాశర హోరా శాస్త్రం ప్రకారం మేష లగ్న జాతకులు స్వతంత్ర భావాలు, ఆత్మవిశ్వాసం, పట్టుదల మరియు నాయకత్వ లక్షణాలు కలిగి ఉంటారు. గురు-సూర్య సంయోగం లేదా దృష్టి వీరికి గొప్ప రాజయోగాన్ని ఇస్తుంది.',
  },
  {
    // 1: Vrishabha (Taurus)
    tattvamTe: 'భూ తత్వం (Earthy)',
    swabhavamTe: 'స్థిర రాశి (Fixed / Determined)',
    prakritiTe: 'వాత-కఫ ప్రకృతి — సహనం, కళాభిరుచి, ఆర్థిక స్థిరత్వం',
    directionTe: 'దక్షిణ / ఆగ్నేయ దిశ (South-East)',
    vivaranamTe: 'వృషభ లగ్నానికి శని ఏకైక రాజయోగకారకుడు (ధర్మ-కర్మాధిపతి). వీరు స్థిరమైన ఆలోచన, ఆర్థిక ప్రణాళిక, కళాత్మక దృష్టి మరియు కుటుంబ నిబద్ధత కలిగి ఉంటారు.',
  },
  {
    // 2: Mithuna (Gemini)
    tattvamTe: 'వాయు తత్వం (Airy)',
    swabhavamTe: 'ద్విస్వభావ రాశి (Dual / Intellectual)',
    prakritiTe: 'త్రిదోష సమ తత్వం — మేధాశక్తి, వాక్చాతుర్యం, బహుముఖ ప్రజ్ఞ',
    directionTe: 'పశ్చిమ / ఉత్తర దిశ (West / North)',
    vivaranamTe: 'మిథున లగ్న జాతకులు అపారమైన జ్ఞానం, గణిత/సాంకేతిక నైపుణ్యం, చర్చా చాతుర్యం మరియు కమ్యూనికేషన్ రంగాలలో విశేష ప్రతిభ కనబరుస్తారు. శుక్ర-బుధ కలయిక మహోన్నత లక్ష్మీ-సరస్వతి యోగాన్ని ఇస్తుంది.',
  },
  {
    // 3: Karkataka (Cancer)
    tattvamTe: 'జల తత్వం (Watery)',
    swabhavamTe: 'చర రాశి (Movable / Sensitive)',
    prakritiTe: 'కఫ ప్రకృతి — దయాగుణం, మాతృభక్తి, ఊహాశక్తి, సంరక్షణ స్వభావం',
    directionTe: 'ఉత్తర దిశ (North)',
    vivaranamTe: 'కర్కాటక లగ్నానికి కుజుడు పంచమ-దశమాధిపతిగా పరమ రాజయోగకారకుడు. వీరు సహృదయులు, కీర్తికాంక్ష కలవారు, ఉన్నత ఆశయాలు మరియు ప్రజాదరణ పొందే వ్యక్తిత్వం కలిగి ఉంటారు.',
  },
  {
    // 4: Simha (Leo)
    tattvamTe: 'అగ్ని తత్వం (Fiery)',
    swabhavamTe: 'స్థిర రాశి (Fixed / Royal)',
    prakritiTe: 'పిత్త ప్రకృతి — తేజస్సు, ఆత్మగౌరవం, పరిపాలనా దక్షత, ఉదార స్వభావం',
    directionTe: 'తూర్పు దిశ (East)',
    vivaranamTe: 'సింహ లగ్న జాతకులు రాజసము, ధర్మబద్ధత, నాయకత్వ పటిమ మరియు ఉన్నత ఆశయాలు కలిగి ఉంటారు. సూర్య-కుజ-గురు గ్రహాల బలం వీరికి ప్రభుత్వ/అధికార పదవులను ప్రసాదిస్తుంది.',
  },
  {
    // 5: Kanya (Virgo)
    tattvamTe: 'భూ తత్వం (Earthy)',
    swabhavamTe: 'ద్విస్వభావ రాశి (Dual / Analytical)',
    prakritiTe: 'వాత-పిత్త ప్రకృతి — విశ్లేషణా శక్తి, వ్యాపార దక్షత, క్రమశిక్షణ',
    directionTe: 'దక్షిణ / ఉత్తర దిశ (South / North)',
    vivaranamTe: 'కన్యా లగ్న జాతకులు సూక్ష్మబుద్ధి, వాణిజ్య/సాంకేతిక/వైద్య/గణిత రంగాలలో ప్రావీణ్యం మరియు ప్రణాళికాబద్ధమైన జీవనం కలిగి ఉంటారు. బుధ-శుక్రుల సంయోగం అఖండ ధన-రాజయోగాన్ని ఇస్తుంది.',
  },
  {
    // 6: Tula (Libra)
    tattvamTe: 'వాయు తత్వం (Airy)',
    swabhavamTe: 'చర రాశి (Movable / Balanced)',
    prakritiTe: 'కఫ-వాత ప్రకృతి — న్యాయబుద్ధి, కలుపుగోలుతనం, వాణిజ్య చతురత',
    directionTe: 'పశ్చిమ దిశ (West)',
    vivaranamTe: 'తులా లగ్నానికి శని చతుర్థ-పంచమాధిపతిగా ఏకైక రాజయోగకారకుడు. వీరు సమతుల్యత, దౌత్య నైపుణ్యం, వ్యాపార దక్షత మరియు సామాజిక గౌరవం కలిగి ఉంటారు.',
  },
  {
    // 7: Vrischika (Scorpio)
    tattvamTe: 'జల తత్వం (Watery)',
    swabhavamTe: 'స్థిర రాశి (Fixed / Intense)',
    prakritiTe: 'పిత్త-కఫ ప్రకృతి — పట్టుదల, పరిశోధనా శక్తి, అంతర్దృష్టి, సాహసం',
    directionTe: 'ఉత్తర దిశ (North)',
    vivaranamTe: 'వృశ్చిక లగ్న జాతకులు లోతైన ఆలోచన, పరిశోధన, సాంకేతిక/వైద్య/రక్షణ రంగాలలో నైపుణ్యం మరియు అసాధారణ మనోబలం కలిగి ఉంటారు. గురు, సూర్య, చంద్రుల బలం ఉన్నత పదవులను ఇస్తుంది.',
  },
  {
    // 8: Dhanussu (Sagittarius)
    tattvamTe: 'అగ్ని తత్వం (Fiery)',
    swabhavamTe: 'ద్విస్వభావ రాశి (Dual / Philosophical)',
    prakritiTe: 'పిత్త ప్రకృతి — ధర్మచింతన, సత్యనిష్ఠ, ఆదర్శవాదం, విద్యాధిక్యత',
    directionTe: 'తూర్పు / ఈశాన్య దిశ (East / North-East)',
    vivaranamTe: 'ధనుర్లగ్న జాతకులు ధర్మబద్ధులు, విద్యావంతులు, గురు-దైవ భక్తి కలవారు మరియు ఉన్నత ఆశయాలతో జీవించేవారు. సూర్య-గురు-కుజ గ్రహాల బలం వీరికి అపారమైన కీర్తి ప్రతిష్ఠలను తెస్తుంది.',
  },
  {
    // 9: Makara (Capricorn)
    tattvamTe: 'భూ తత్వం (Earthy)',
    swabhavamTe: 'చర రాశి (Movable / Pragmatic)',
    prakritiTe: 'వాత ప్రకృతి — కార్యదీక్ష, ఓర్పు, నిర్వాహక శక్తి, ఆచరణాత్మకత',
    directionTe: 'దక్షిణ దిశ (South)',
    vivaranamTe: 'మకర లగ్నానికి శుక్రుడు పంచమ-దశమాధిపతిగా ఏకైక రాజయోగకారకుడు. వీరు కఠిన పరిశ్రమ, పట్టుదల, వ్యాపార-పరిపాలనా నైపుణ్యంతో జీవితంలో స్థిరమైన ఉన్నత శిఖరాలను అధిరోహిస్తారు.',
  },
  {
    // 10: Kumbha (Aquarius)
    tattvamTe: 'వాయు తత్వం (Airy)',
    swabhavamTe: 'స్థిర రాశి (Fixed / Humanitarian)',
    prakritiTe: 'వాత-పిత్త ప్రకృతి — నూతన ఆవిష్కరణలు, తాత్వికత, ప్రజాసేవ, మేధాశక్తి',
    directionTe: 'పశ్చిమ దిశ (West)',
    vivaranamTe: 'కుంభ లగ్నానికి శుక్రుడు చతుర్థ-నవమాధిపతిగా పరమ రాజయోగకారకుడు. వీరు శాస్త్రీయ దృక్పథం, లోతైన ఆలోచన, మానవతావాదం మరియు స్థిరమైన స్నేహభావం కలిగి ఉంటారు.',
  },
  {
    // 11: Meena (Pisces)
    tattvamTe: 'జల తత్వం (Watery)',
    swabhavamTe: 'ద్విస్వభావ రాశి (Dual / Spiritual)',
    prakritiTe: 'కఫ ప్రకృతి — సాత్విక గుణం, కరుణ, ఆధ్యాత్మిక జ్ఞానం, సృజనాత్మకత',
    directionTe: 'ఉత్తర / ఈశాన్య దిశ (North / North-East)',
    vivaranamTe: 'మీన లగ్న జాతకులు ఉదార స్వభావం, విద్యా-ఆధ్యాత్మిక రంగాలలో ప్రతిభ, దైవభక్తి మరియు గౌరవప్రదమైన వ్యక్తిత్వం కలిగి ఉంటారు. గురు-కుజ-చంద్రుల బలం వీరికి ఉన్నత రాజయోగాన్ని ఇస్తుంది.',
  },
];

function computeBaladiAvasthaTe(signIndex: number, degreeInSign: number): string {
  // Odd signs (Mesha=0, Mithuna=2, etc.): 0-6 Bala, 6-12 Kumara, 12-18 Yuva, 18-24 Vriddha, 24-30 Mrita
  // Even signs (Vrishabha=1, Karkataka=3, etc.): reversed
  const isOddSign = signIndex % 2 === 0;
  const bucket = Math.min(4, Math.floor(degreeInSign / 6));
  const oddLabels = [
    'బాలావస్థ (25% ఫలం)',
    'కుమారావస్థ (50% ఫలం)',
    'యువావస్థ (100% పూర్ణ బలం)',
    'వృద్ధావస్థ (స్వల్ప బలం)',
    'మృతావస్థ (శాంతి అవసరము)',
  ];
  const idx = isOddSign ? bucket : 4 - bucket;
  return oddLabels[idx];
}

function getSpecialDrishtiHouses(planetId: string, house: number): number[] {
  const step = (offset: number) => ((house - 1 + offset) % 12) + 1;
  if (planetId === 'Mars') {
    return [step(3), step(6), step(7)]; // 4th, 7th, 8th aspects
  }
  if (planetId === 'Jupiter' || planetId === 'Rahu' || planetId === 'Ketu') {
    return [step(4), step(6), step(8)]; // 5th, 7th, 9th aspects
  }
  if (planetId === 'Saturn') {
    return [step(2), step(6), step(9)]; // 3rd, 7th, 10th aspects
  }
  return [step(6)]; // All other planets aspect 7th house from themselves
}

const PHALADEEPIKA_HOUSE_EFFECTS: Record<string, string[]> = {
  Sun: [
    '1వ ఇంట సూర్యుడు: ఆత్మగౌరవం, తేజస్సు, పరిపాలనా దక్షత మరియు స్వయంకృషితో ఎదిగే మనస్తత్వం (ఫలదీపిక 8.1).',
    '2వ ఇంట సూర్యుడు: ప్రభుత్వ/పైఅధికారుల ద్వారా ధనలాభం, ఖచ్చితమైన వాక్కు, కుటుంబ బాధ్యత.',
    '3వ ఇంట సూర్యుడు: విశేష పరాక్రమం, ధైర్యసాహసాలు, శత్రుజయం మరియు స్వయంశక్తితో విజయం.',
    '4వ ఇంట సూర్యుడు: భూ-గృహ ఆస్తులపై శ్రద్ధ, పితృ వర్గ గౌరవం, వృత్తిలో స్థిరత్వం.',
    '5వ ఇంట సూర్యుడు: కుశాగ్ర బుద్ధి, గాయత్రీ/మంత్ర ఉపాసన బలం, ఉన్నత విద్యా ప్రతిభ.',
    '6వ ఇంట సూర్యుడు: పోటీ పరీక్షలలో తిరుగులేని విజయం, శత్రు నిర్మూలన, కార్యదీక్ష (ఉపచయ రాజయోగం).',
    '7వ ఇంట సూర్యుడు: ఆత్మగౌరవం గల జీవిత భాగస్వామి, స్వతంత్ర వ్యాపార/ఉద్యోగ దృక్పథం.',
    '8వ ఇంట సూర్యుడు: లోతైన పరిశోధనా శక్తి, ఆకస్మిక ధన/వారసత్వ అంశాలు, నేత్ర/ఆరోగ్య జాగ్రత్త.',
    '9వ ఇంట సూర్యుడు: ధర్మచింతన, తండ్రి/గురువుల ఆశీస్సులు, పుణ్యక్షేత్ర సందర్శన మరియు భాగ్యోదయం.',
    '10వ ఇంట సూర్యుడు: దిగ్బల స్థానం — ఉద్యోగ/రాజకీయ/పరిపాలనా రంగాలలో అత్యున్నత అధికారం, కీర్తి (కులలోద్ధారక యోగం).',
    '11వ ఇంట సూర్యుడు: బహుముఖ ఆదాయం, ఉన్నత స్థాయి మిత్రులు, ప్రభుత్వ సన్మానం మరియు అభీష్ట సిద్ధి.',
    '12వ ఇంట సూర్యుడు: దూర ప్రాంత/విదేశీ వ్యవహారాలు, ఆధ్యాత్మిక చింతన, దానధర్మ గుణం.',
  ],
  Moon: [
    '1వ ఇంట చంద్రుడు: సౌమ్య ముఖవర్చస్సు, దయాగుణం, ప్రజలలో ఆదరణ మరియు ఆకర్షణీయ వ్యక్తిత్వం.',
    '2వ ఇంట చంద్రుడు: మధురమైన వాక్కు, కుటుంబ సౌఖ్యం, ఆర్థిక ప్రవాహం మరియు విద్యాభిరుచి.',
    '3వ ఇంట చంద్రుడు: సృజనాత్మక ఆలోచనలు, కళాభిరుచి, సోదర ప్రేమ మరియు ప్రయాణ యోగం.',
    '4వ ఇంట చంద్రుడు: దిగ్బల స్థానం — మాతృ సౌఖ్యం, స్వంత గృహ-వాహన యోగం, బంధుమిత్రుల ఆదరణ.',
    '5వ ఇంట చంద్రుడు: సున్నితమైన మేధాశక్తి, సంతాన సౌఖ్యం, దైవభక్తి మరియు ఊహాశక్తి.',
    '6వ ఇంట చంద్రుడు: సేవాభావం, ఆహార-ఆరోగ్య విషయాలలో క్రమశిక్షణ అవసరం.',
    '7వ ఇంట చంద్రుడు: సుందరమైన, సహృదయ జీవిత భాగస్వామి, వ్యాపార మరియు సామాజిక గుర్తింపు.',
    '8వ ఇంట చంద్రుడు: అంతర్దృష్టి, గూఢ శాస్త్ర ఆసక్తి, మానసిక ప్రశాంతత కొరకు ధ్యానం శ్రేయస్కరం.',
    '9వ ఇంట చంద్రుడు: పుణ్యకార్యాలు, తీర్థయాత్రలు, అదృష్ట వృద్ధి మరియు ధర్మబద్ధ జీవనం.',
    '10వ ఇంట చంద్రుడు: వృత్తిలో ప్రజాదరణ, కీర్తి, వ్యాపార/నిర్వహణ రంగాలలో శుభ పురోగతి.',
    '11వ ఇంట చంద్రుడు: ఆర్థిక లాభాలు, మిత్రుల సహకారం, కోరికలు నెరవేరే శుభ యోగం.',
    '12వ ఇంట చంద్రుడు: ధర్మకార్యాలకు వ్యయం, విదేశీ యోగం, ఏకాంత ధ్యాన శక్తి.',
  ],
  Mars: [
    '1వ ఇంట కుజుడు: ధైర్యసాహసాలు, చురుకుదనం, కార్యదీక్ష మరియు నాయకత్వ పటిమ.',
    '2వ ఇంట కుజుడు: స్పష్టమైన వాక్కు, ఆర్థిక పట్టుదల, కుటుంబ రక్షణ బాధ్యత.',
    '3వ ఇంట కుజుడు: అజేయమైన పరాక్రమం, పోటీలలో గెలుపు, సాంకేతిక/క్రీడా నైపుణ్యం.',
    '4వ ఇంట కుజుడు: భూమి, రియల్ ఎస్టేట్, నిర్మాణ ఆస్తులు మరియు వాహన యోగం.',
    '5వ ఇంట కుజుడు: చురుకైన మేధాశక్తి, వ్యూహాత్మక ఆలోచన, క్రీడా/సాంకేతిక ప్రతిభ.',
    '6వ ఇంట కుజుడు: శత్రు-ఋణ-రోగ నివారణ, పోటీ పరీక్షలలో అగ్రస్థానం (బలమైన ఉపచయ యోగం).',
    '7వ ఇంట కుజుడు: భాగస్వామ్య వ్యవహారాలలో చొరవ, వివాహంలో సహనం పాటించడం శుభప్రదం.',
    '8వ ఇంట కుజుడు: సాంకేతిక పరిశోధన, ఆపదలలో ధైర్యం, వాహన ప్రయాణాలలో మెలకువ అవసరం.',
    '9వ ఇంట కుజుడు: ధర్మరక్షణ, ఆశయ సిద్ధి, దూర ప్రాంతాలలో పేరు ప్రతిష్ఠలు.',
    '10వ ఇంట కుజుడు: దిగ్బల స్థానం (కులదీపక యోగం) — వృత్తిలో తిరుగులేని అధికారం, భూ-నిర్మాణ-ఇంజనీరింగ్-పోలీస్/పరిపాలనా విజయం.',
    '11వ ఇంట కుజుడు: భూలాభం, ఆర్థిక పురోగతి, లక్ష్య సాధన మరియు పెద్దల సహకారం.',
    '12వ ఇంట కుజుడు: పెట్టుబడులు, విదేశీ ప్రయాణాలు, అనవసర ఖర్చులపై నియంత్రణ అవసరం.',
  ],
  Mercury: [
    '1వ ఇంట బుధుడు: దిగ్బల స్థానం — అపార మేధాశక్తి, గణిత/సాఫ్ట్‌వేర్/వాణిజ్య నైపుణ్యం, చమత్కార వాక్కు.',
    '2వ ఇంట బుధుడు: విద్యా-వాక్చాతుర్యంతో ధన సంపాదన, ఆర్థిక గణన నైపుణ్యం, కుటుంబ గౌరవం.',
    '3వ ఇంట బుధుడు: రచనా, కమ్యూనికేషన్, మీడియా, ఐటీ మరియు వ్యాపార ఒప్పందాలలో విజయం.',
    '4వ ఇంట బుధుడు: ఉన్నత విద్యా డిగ్రీలు, వాహన-గృహ సౌకర్యాలు, బంధుమిత్రుల ప్రశంసలు.',
    '5వ ఇంట బుధుడు: కుశాగ్ర బుద్ధి, సృజనాత్మక ఆలోచనలు, సలహాదారుగా/నిపుణుడిగా కీర్తి.',
    '6వ ఇంట బుధుడు: మేధాశక్తితో పోటీలలో గెలుపు, న్యాయ/వైద్య/సాంకేతిక వృత్తులలో రాణింపు.',
    '7వ ఇంట బుధుడు: తెలివైన జీవిత భాగస్వామి, వ్యాపార భాగస్వామ్యం మరియు వాణిజ్య లాభం.',
    '8వ ఇంట బుధుడు: పరిశోధన, ఆడిటింగ్, ఇన్సూరెన్స్, డేటా విశ్లేషణ మరియు దీర్ఘాయుష్షు.',
    '9వ ఇంట బుధుడు: శాస్త్ర జ్ఞానం, ఉన్నత విద్య, విదేశీ ప్రయాణాలు మరియు ధర్మచింతన.',
    '10వ ఇంట బుధుడు: వృత్తి-వ్యాపారాలలో బహుముఖ ప్రజ్ఞ, ఐటీ/బ్యాంకింగ్/విద్యా రంగాలలో ఉన్నత పదవి.',
    '11వ ఇంట బుధుడు: మేధాశక్తి ద్వారా స్థిరమైన ఆదాయం, వ్యాపార లాభాలు మరియు మిత్రలాభం.',
    '12వ ఇంట బుధుడు: విదేశీ విద్యా/ఉద్యోగ అవకాశాలు, ఆధ్యాత్మిక గ్రంథ పఠనం.',
  ],
  Jupiter: [
    '1వ ఇంట గురువు: దిగ్బల స్థానం — కోటి దోషాలను హరించే గురు బలం, తేజస్సు, ధర్మబుద్ధి, సమాజంలో గొప్ప గౌరవం.',
    '2వ ఇంట గురువు: ధన-కుటుంబ వృద్ధి, సత్యవాక్కు, విద్యాపాండిత్యం మరియు ఆర్థిక సమృద్ధి.',
    '3వ ఇంట గురువు: ధర్మబద్ధమైన ప్రయత్నాలు, సోదర సహకారం, ఆధ్యాత్మిక ప్రయాణాలు.',
    '4వ ఇంట గురువు: మాతృ సౌఖ్యం, విశాలమైన గృహం, వాహన యోగం మరియు మనశ్శాంతి.',
    '5వ ఇంట గురువు: పూర్వపుణ్య బలం, సంతానం ద్వారా కీర్తి, ఉన్నత మేధాశక్తి మరియు దైవానుగ్రహం.',
    '6వ ఇంట గురువు: శత్రువులపై ధర్మవిజయం, వైద్య/న్యాయ/బోధనా రంగాలలో సేవ.',
    '7వ ఇంట గురువు: సద్గుణవంతురాలైన/సద్గుణవంతుడైన జీవిత భాగస్వామి, వివాహానంతరం భాగ్యోదయం.',
    '8వ ఇంట గురువు: దీర్ఘాయుష్షు, ఆకస్మిక ఆర్థిక రక్షణ, ఆధ్యాత్మిక/తాత్విక లోతు.',
    '9వ ఇంట గురువు: పరమ భాగ్య యోగం — గురు-దైవ భక్తి, తండ్రి ఆశీస్సులు, విదేశీ/పుణ్యక్షేత్ర యోగం.',
    '10వ ఇంట గురువు: వృత్తిలో ఉన్నత గౌరవం, సలహాదారు/అధికారి/విద్యావేత్తగా శాశ్వత కీర్తి.',
    '11వ ఇంట గురువు: సమృద్ధిగా ధనలాభం, అభీష్ట సిద్ధి, ఉన్నత వ్యక్తుల పరిచయాలు.',
    '12వ ఇంట గురువు: శుభకార్యాలకు ధనవ్యయం, విదేశీ నివాస యోగం, మోక్ష/ధ్యాన సిద్ధి.',
  ],
  Venus: [
    '1వ ఇంట శుక్రుడు: ఆకర్షణీయమైన రూపం, కళాభిరుచి, సౌఖ్యవంతమైన జీవనం మరియు ప్రజాకర్షణ.',
    '2వ ఇంట శుక్రుడు: ధన సమృద్ధి, ఆభరణ-వస్త్ర ప్రాప్తి, మధుర సంభాషణ మరియు కుటుంబ ఆనందం.',
    '3వ ఇంట శుక్రుడు: సంగీత/కళా/మీడియా రంగాలలో ఆసక్తి, శుభ ప్రయాణాలు, మిత్రుల ఆదరణ.',
    '4వ ఇంట శుక్రుడు: దిగ్బల స్థానం — నూతన గృహ-వాహన-ఆభరణ సౌకర్యాలు, కుటుంబ సుఖశాంతులు.',
    '5వ ఇంట శుక్రుడు: లక్ష్మీ కటాక్షం, సృజనాత్మక ప్రతిభ, సంతాన సౌఖ్యం మరియు పెట్టుబడి లాభాలు.',
    '6వ ఇంట శుక్రుడు: సేవా రంగాలలో విజయం, ఆరోగ్య-ఆహార నియమాలు పాటించడం మంచిది.',
    '7వ ఇంట శుక్రుడు: ప్రేమానురాగాలు గల దాంపత్యం, భాగస్వామ్య వ్యాపార వృద్ధి మరియు సామాజిక గుర్తింపు.',
    '8వ ఇంట శుక్రుడు: ఆకస్మిక ధనలాభం, జీవిత భాగస్వామి ద్వారా ఆర్థిక వృద్ధి, దీర్ఘాయుష్షు.',
    '9వ ఇంట శుక్రుడు: అదృష్ట యోగం, విదేశీ ప్రయాణాలు, ధర్మ-శుభకార్యాలు మరియు సంపద.',
    '10వ ఇంట శుక్రుడు: వృత్తి-వ్యాపారాలలో ఉన్నతి, ఫైనాన్స్/ఐటీ/కళా/వాణిజ్య రంగాలలో కీర్తి.',
    '11వ ఇంట శుక్రుడు: అఖండ లాభ యోగం, బహుముఖ ఆదాయం, విలాసవంతమైన సౌకర్యాలు.',
    '12వ ఇంట శుక్రుడు: భోగభాగ్యాలు, విదేశీ ప్రయాణ సౌఖ్యం, శుభకార్యాలకు ధన వినియోగం.',
  ],
  Saturn: [
    '1వ ఇంట శని: క్రమశిక్షణ, కఠిన పరిశ్రమ, ఓర్పు మరియు స్వయంకృషితో స్థిరమైన ఉన్నతి.',
    '2వ ఇంట శని: పొదుపు స్వభావం, కష్టపడి సంపాదించే ఆస్తులు, నిజాయితీ గల మాట.',
    '3వ ఇంట శని: అపారమైన పట్టుదల, ధైర్యం, శత్రుజయం మరియు చేపట్టిన పనిని పూర్తిచేసే శక్తి.',
    '4వ ఇంట శని: స్థిరాస్తులు, భూ-గృహ నిర్మాణం, వృత్తి రీత్యా జన్మస్థలానికి దూరంగా ఎదిగే యోగం.',
    '5వ ఇంట శని: లోతైన తాత్విక ఆలోచన, సాంకేతిక విద్య, స్థిరమైన నిర్ణయ శక్తి.',
    '6వ ఇంట శని: శత్రు-ఋణ-రోగాలను జయించే ఉక్కు సంకల్పం, పోటీలలో విజయం (ఉపచయ రాజయోగం).',
    '7వ ఇంట శని: దిగ్బల స్థానం — స్థిరమైన భాగస్వామ్యం, బాధ్యతాయుతమైన దాంపత్యం, ప్రజలతో సంబంధాలు.',
    '8వ ఇంట శని: ఆయుష్కారకుడు అష్టమంలో ఉండటం వల్ల పూర్ణ ఆయుర్దాయం మరియు పరిశోధనా శక్తి.',
    '9వ ఇంట శని: సంప్రదాయ నిష్ఠ, ధర్మబద్ధ జీవనం, ఆలస్యంగానైనా శాశ్వత భాగ్యోదయం.',
    '10వ ఇంట శని: కర్మయోగి — కష్టపడి ఉన్నత అధికార స్థాయికి చేరుకోవడం, పారిశ్రామిక/ఉద్యోగ విజయం.',
    '11వ ఇంట శని: అత్యంత శుభప్రదమైన లాభ స్థానం — భూ-ధన లాభాలు, స్థిరమైన ఆదాయం, అభీష్ట సిద్ధి.',
    '12వ ఇంట శని: విదేశీ/దూర ప్రాంత ఉద్యోగ యోగం, ఆధ్యాత్మిక సేవ, ఖర్చులలో క్రమశిక్షణ.',
  ],
  Rahu: [
    '1వ ఇంట రాహువు: ఆధునిక ఆలోచనలు, సాంకేతిక నైపుణ్యం, ప్రత్యేక గుర్తింపు పొందాలనే తపన.',
    '2వ ఇంట రాహువు: విదేశీ/సాంకేతిక మార్గాల ద్వారా ధన సంపాదన, వాక్కులో సంయమనం అవసరం.',
    '3వ ఇంట రాహువు: అసాధారణ ధైర్యసాహసాలు, మీడియా/ఐటీ/కమ్యూనికేషన్ రంగాలలో తిరుగులేని విజయం.',
    '4వ ఇంట రాహువు: నూతన ప్రాంతాలలో గృహ-వాహన ప్రాప్తి, ఆధునిక సాంకేతిక విద్య.',
    '5వ ఇంట రాహువు: వినూత్న ఆలోచనా శక్తి, స్పెక్యులేషన్/కోడింగ్/పరిశోధనలలో చురుకుదనం.',
    '6వ ఇంట రాహువు: శత్రువులపై సంపూర్ణ విజయం, పోటీ పరీక్షలలో గెలుపు, ఋణ విముక్తి (అత్యుత్తమ స్థానం).',
    '7వ ఇంట రాహువు: స్వతంత్ర వ్యాపార దృక్పథం, విభిన్న నేపథ్యం గల భాగస్వామ్య వ్యవహారాలు.',
    '8వ ఇంట రాహువు: ఆకస్మిక మార్పులు, రహస్య/సాంకేతిక పరిశోధన, దుర్గా ఆరాధన వల్ల రక్షణ.',
    '9వ ఇంట రాహువు: విదేశీ ప్రయాణాలు, భిన్న సంస్కృతుల పరిచయం, తీర్థయాత్రలు.',
    '10వ ఇంట రాహువు: ఐటీ, టెక్నాలజీ, రాజకీయ, విదేశీ వాణిజ్య రంగాలలో ఆకస్మిక కీర్తి & ఉన్నత పదవి.',
    '11వ ఇంట రాహువు: ఆకస్మిక ధనలాభాలు, బహుముఖ ఆదాయం, విదేశీ మిత్రుల సహకారం (రాజయోగ సమానం).',
    '12వ ఇంట రాహువు: విదేశీ నివాస యోగం, బహుళజాతి సంస్థలలో ఉద్యోగం, ధ్యాన సాధన.',
  ],
  Ketu: [
    '1వ ఇంట కేతువు: ఆధ్యాత్మిక అంతర్దృష్టి, వైరాగ్య/తాత్విక బుద్ధి, గణపతి అనుగ్రహం.',
    '2వ ఇంట కేతువు: ఆధ్యాత్మిక/శాస్త్ర వాక్కు, మంత్ర ఉపాసన, ఆర్థిక విషయాలలో జాగ్రత్త.',
    '3వ ఇంట కేతువు: మానసిక ధైర్యం, గూఢ నైపుణ్యాలు, సంకల్ప బలంతో విజయం.',
    '4వ ఇంట కేతువు: ఆధ్యాత్మిక వాతావరణం, వైదిక/సాంకేతిక విద్యపై ఆసక్తి.',
    '5వ ఇంట కేతువు: మంత్రసిద్ధి, సూక్ష్మ పరిశీలన, కోడింగ్/గణిత/జ్యోతిష్య శాస్త్ర ప్రతిభ.',
    '6వ ఇంట కేతువు: శత్రు-రోగ నివారణ, పోటీలలో ఊహించని విజయం.',
    '7వ ఇంట కేతువు: ఆధ్యాత్మిక భావాలు గల భాగస్వామి, వ్యాపారంలో నిజాయితీ.',
    '8వ ఇంట కేతువు: జ్యోతిష్య, యోగ, ఆయుర్వేద, పరిశోధనా రంగాలలో లోతైన జ్ఞానం.',
    '9వ ఇంట కేతువు: పుణ్యక్షేత్ర దర్శనం, గురుభక్తి, పూర్వజన్మ సుకృతం.',
    '10వ ఇంట కేతువు: సాంకేతిక, వైద్య, ఆధ్యాత్మిక లేదా పరిశోధనా వృత్తులలో ప్రత్యేక గౌరవం.',
    '11వ ఇంట కేతువు: ఊహించని ఆర్థిక లాభాలు, ఆధ్యాత్మిక మిత్రులు, సంతృప్తికర ఆదాయం.',
    '12వ ఇంట కేతువు: మోక్ష కారక స్థానం — ధ్యాన సిద్ధి, దైవానుగ్రహం మరియు అంతర్గత ప్రశాంతత.',
  ],
};

export function generateTeluguSampoornaJathakam(
  chart: CompleteChartResult
): CompleteTeluguJathakamReport {
  const sun = chart.planets.find((p) => p.id === 'Sun')!;
  const moon = chart.planets.find((p) => p.id === 'Moon')!;
  const mars = chart.planets.find((p) => p.id === 'Mars')!;
  const mercury = chart.planets.find((p) => p.id === 'Mercury')!;
  const jupiter = chart.planets.find((p) => p.id === 'Jupiter')!;
  const venus = chart.planets.find((p) => p.id === 'Venus')!;
  const saturn = chart.planets.find((p) => p.id === 'Saturn')!;
  const rahu = chart.planets.find((p) => p.id === 'Rahu')!;
  const ketu = chart.planets.find((p) => p.id === 'Ketu')!;

  const getPlanetNakTe = (p: { siderealLon: number }) => {
    const idx = Math.floor(((p.siderealLon % 360) + 360) % 360 / (360 / 27));
    return TELUGU_NAKSHATRAS[idx] ?? TELUGU_NAKSHATRAS[0];
  };

  const samvatsaramTe = getTeluguSamvatsaram(chart.input.date, sun.siderealLon, moon.siderealLon);
  const { masamTe, rituvuTe, ayanamTe } = getTeluguMasaAndRitu(sun.siderealLon, moon.siderealLon);

  const nakTeInfo = getPlanetNakTe(moon);
  const pada = moon.pada;
  const namaAksharamTe = nakTeInfo.padasTe[(pada - 1) % 4];

  const janmaRasiObj = TELUGU_RASIS[moon.d1Sign];
  const lagnaSignIdx = chart.ascendant.signIndex;
  const lagnaRasiObj = TELUGU_RASIS[lagnaSignIdx];
  const navamsaLagnaObj = TELUGU_RASIS[chart.ascendant.d9Sign];
  const dasamsaLagnaObj = TELUGU_RASIS[chart.ascendant.d10Sign];

  const lagnaLordEnglish = ZODIAC_SIGNS[lagnaSignIdx].vedicRuler;
  const lagnaLordMeta = TELUGU_PLANETS[lagnaLordEnglish] ?? TELUGU_PLANETS.Jupiter;

  // 9th house Bhagya Lord
  const ninthSignIdx = (lagnaSignIdx + 8) % 12;
  const bhagyaLordEng = ZODIAC_SIGNS[ninthSignIdx].vedicRuler;
  const bhagyaLordMeta = TELUGU_PLANETS[bhagyaLordEng] ?? TELUGU_PLANETS.Jupiter;

  // Exact Dasha Balance at Birth (సంవత్సరములు, నెలలు, రోజులు) & Udayadi Ishta Ghatikalu
  const firstDasha = chart.dashas[0];
  const firstDashaLordTe = TELUGU_PLANETS[firstDasha.lord]?.nameTe ?? firstDasha.lord;
  const bal = firstDasha.balanceYMD ?? { years: firstDasha.years, months: 0, days: 0 };
  const dashaBalanceAtBirthTe = `${firstDashaLordTe} మహాదశ నిల్వ: ${bal.years} సం. ${bal.months} నెలలు ${bal.days} రోజులు (${firstDasha.endDate} వరకు)`;

  // Udayadi Ishta Ghatikalu - Vighatikalu (1 Ghati = 24 min, 1 Vighati = 24 sec)
  const [bHr, bMin, bSec] = chart.input.time.split(':').map(Number);
  const [sHr, sMin] = chart.panchanga.sunTimes.sunriseLocal.split(':').map(Number);
  const birthTotalMin = (Number.isFinite(bHr) ? bHr : 6) * 60 + (Number.isFinite(bMin) ? bMin : 0) + (Number.isFinite(bSec) ? bSec / 60 : 0);
  const sunriseTotalMin = (Number.isFinite(sHr) ? sHr : 6) * 60 + (Number.isFinite(sMin) ? sMin : 0);
  const diffFromSunriseMin = (birthTotalMin - sunriseTotalMin + 1440) % 1440;
  const ishtaGhatis = Math.floor(diffFromSunriseMin / 24);
  const ishtaVighatis = Math.round((diffFromSunriseMin % 24) * 2.5);
  const udayadiIshtaGhatikaluTe = `${ishtaGhatis} ఘడియల ${ishtaVighatis} విఘడియలు`;
  const suryodayamTe = `${chart.panchanga.sunTimes.sunriseLocal} AM`;
  const suryastamayamTe = `${chart.panchanga.sunTimes.sunsetLocal} PM`;
  const dinamanamTe = `${chart.panchanga.sunTimes.dayDurationHours} గంటలు`;
  const nakElapsed = chart.panchanga.nakshatra.percentElapsed;
  const nakshatraBhuktiSeshamTe = `${nakElapsed.toFixed(1)}% గడిచినది · ${(100 - nakElapsed).toFixed(1)}% నిల్వ`;

  // Lagna Shastra Pramanam
  const lagnaShastraRaw = LAGNA_SHASTRA_DATA[lagnaSignIdx] ?? LAGNA_SHASTRA_DATA[0];
  // శుభ/పాప/యోగకారక/మారక/బాధక విభజన ఇక చేతి పట్టిక నుండి కాదు —
  // లగ్న గణితం నుండి నేరుగా లెక్కిస్తాము (lagnaFunctionalEngine).
  const functional = computeLagnaFunctional(lagnaSignIdx);
  const badhakaRasiTe = TELUGU_RASIS[(lagnaSignIdx + functional.badhakaHouse - 1) % 12].nameTe;
  // శ్లోక/గ్రంథ వాక్యాలలో వాడే సంక్షిప్త రూపాలు (పూర్తి వాక్యం కాదు)
  const ykShortTe = functional.yogakarakas.length
    ? functional.yogakarakas.map((p) => PLANET_TE[p]).join(', ')
    : 'ఏకగ్ర యోగకారకుడు లేడు';
  const shubhaShortTe = functional.benefics.map((p) => PLANET_TE[p]).join(', ');
  const bestBeneficTe = PLANET_TE[functional.bestBenefic];
  const badhakaShortTe = `${functional.badhakaHouse}వ భావం (${badhakaRasiTe}) — అధిపతి ${PLANET_TE[functional.badhakaLord]}`;
  const lagnaShastraPramanam: LagnaShastraPramanamTe = {
    lagnaNameTe: lagnaRasiObj.nameTe,
    tattvamTe: lagnaShastraRaw.tattvamTe,
    swabhavamTe: lagnaShastraRaw.swabhavamTe,
    prakritiTe: lagnaShastraRaw.prakritiTe,
    shubhaGrahaluTe: functional.shubhaTe,
    yogakarakaGrahaTe: functional.yogakarakaTe,
    papaGrahaluTe: functional.papaTe,
    marakaGrahaluTe: functional.marakaTe,
    badhakaSthanamTe: `${functional.badhakaHouse}వ భావం (${badhakaRasiTe})`,
    badhakadhipatiTe: functional.badhakaTe,
    lagnaSwaroopaVivaranamTe: lagnaShastraRaw.vivaranamTe,
  };

  // Lucky numbers & colors by Lagna Sign Index
  const luckyNumbersBySign = [
    '9, 1, 3', '6, 5, 8', '5, 6, 9', '2, 7, 9',
    '1, 5, 9', '5, 6, 7', '6, 8, 5', '9, 1, 4',
    '3, 9, 1', '8, 6, 5', '8, 4, 6', '3, 7, 9',
  ];
  const luckyDaysBySign = [
    'మంగళవారం, ఆదివారం, గురువారం',
    'శుక్రవారం, బుధవారం, శనివారం',
    'బుధవారం, శుక్రవారం',
    'సోమవారం, గురువారం, ఆదివారం',
    'ఆదివారం, మంగళవారం, గురువారం',
    'బుధవారం, శుక్రవారం',
    'శుక్రవారం, శనివారం, బుధవారం',
    'మంగళవారం, గురువారం, ఆదివారం',
    'గురువారం, ఆదివారం, మంగళవారం',
    'శనివారం, శుక్రవారం, బుధవారం',
    'శనివారం, శుక్రవారం, గురువారం',
    'గురువారం, సోమవారం, మంగళవారం',
  ];
  const luckyColorsBySign = [
    'ఎరుపు, పసుపు, కాషాయం',
    'తెలుపు, లేత ఆకుపచ్చ, గులాబీ',
    'ఆకుపచ్చ, తెలుపు, లేత పసుపు',
    'తెలుపు, వెండి రంగు, పసుపు',
    'బంగారు రంగు, కాషాయం, ఎరుపు',
    'ఆకుపచ్చ, తెలుపు, పచ్చ',
    'తెలుపు, ఆకాశ నీలం, క్రీమ్',
    'ఎరుపు, మెరూన్, పసుపు',
    'పసుపు, బంగారు రంగు, క్రీమ్',
    'నీలం, తెలుపు, ఆకుపచ్చ',
    'ఆకాశ నీలం, వైలెట్, తెలుపు',
    'పసుపు, తెలుపు, లేత ఎరుపు',
  ];

  // Build Navagraha Deep Table (with Avastha, Combustion/Moudhyam, Drishti, Shadbala, Phaladeepika Sutra)
  const nineIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const navagrahaDeepTable: NavagrahaDeepRowTe[] = nineIds.map((pid) => {
    const p = chart.planets.find((pl) => pl.id === pid)!;
    const pMeta = TELUGU_PLANETS[pid] ?? TELUGU_PLANETS.Sun;
    const pNakTe = getPlanetNakTe(p);
    const rasiTe = TELUGU_RASIS[p.signIndex]?.nameTe ?? p.signName;
    const d9RasiTe = TELUGU_RASIS[p.d9Sign]?.nameTe.split(' ')[0] ?? '';
    const d10RasiTe = TELUGU_RASIS[p.d10Sign]?.nameTe.split(' ')[0] ?? '';
    const isVargottama = p.d1Sign === p.d9Sign;

    // Check Combustion (Moudhyam / Astangatvam) with Sun per Surya Siddhanta & BPHS
    let isCombust = false;
    if (['Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(pid)) {
      const angularDist = Math.min(
        Math.abs(p.siderealLon - sun.siderealLon),
        360 - Math.abs(p.siderealLon - sun.siderealLon)
      );
      const limit =
        pid === 'Moon'
          ? 12
          : pid === 'Mars'
            ? 17
            : pid === 'Mercury'
              ? p.isRetrograde
                ? 12
                : 14
              : pid === 'Jupiter'
                ? 11
                : pid === 'Venus'
                  ? p.isRetrograde
                    ? 8
                    : 10
                  : 15;
      isCombust = angularDist <= limit;
    }

    const avasthaTe = computeBaladiAvasthaTe(p.signIndex, p.degreeInSign);
    const drishtiList = getSpecialDrishtiHouses(pid, p.house);
    const drishtiHousesTe = drishtiList.map((h) => `${h}వ`).join(', ') + ' భావములు';
    const shadbalaObj = chart.shadbala.find((s) => s.planet === pid);
    const shadbalaRupas = shadbalaObj ? shadbalaObj.totalRupas : 6.2;
    const phaladeepikaPhalamTe =
      PHALADEEPIKA_HOUSE_EFFECTS[pid]?.[p.house - 1] ??
      `${p.house}వ భావంలో ${pMeta.nameTe} స్థితి వల్ల ఆ భావ ఫలితాలు చైతన్యవంతమవుతాయి.`;

    return {
      id: pid,
      nameTe: pMeta.nameTe,
      glyph: p.glyph,
      rasiTe,
      dms: p.formattedDMS,
      house: p.house,
      nakshatraTe: pNakTe.nameTe,
      pada: p.pada,
      nakshatraLordTe: pNakTe.lordTe,
      dignityTe: DIGNITY_TE_MAP[p.dignity] ?? p.dignity,
      d9RasiTe,
      d10RasiTe,
      isVargottama,
      isRetrograde: p.isRetrograde,
      isCombust,
      avasthaTe,
      drishtiHousesTe,
      shadbalaRupas,
      phaladeepikaPhalamTe,
    };
  });

  // JAIMINI SAPTA CHARA KARAKAS (7 Chara Karakas per Maharshi Jaimini Upadesa Sutras 1.1.11–18)
  const sevenKarakaIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const sortedByDegree = sevenKarakaIds
    .map((id) => chart.planets.find((p) => p.id === id)!)
    .sort((a, b) => b.degreeInSign - a.degreeInSign);

  const karakaDefs = [
    {
      code: 'AK',
      nameTe: 'ఆత్మకారకుడు (Atmakaraka)',
      roleTe: 'ఆత్మ స్వరూపం, జీవన పరమ లక్ష్యం & కుండలి సార్వభౌముడు',
      phalamFn: (pName: string, d9Name: string, h: number) =>
        `జైమిని సూత్రం ("ఆత్మాధికః కళాదిభిర్నభోగః") ప్రకారం ${pName} అత్యధిక భాగలతో మీ జాతకానికి ఆత్మకారకుడు. కారకాంశ లగ్నం ${d9Name} కావడం వల్ల ఆత్మబలం, ధర్మదీక్ష మరియు ${h}వ భావ రంగంలో ఉన్నత కీర్తి లభిస్తాయి.`,
    },
    {
      code: 'AmK',
      nameTe: 'అమాత్యకారకుడు (Amatyakaraka)',
      roleTe: 'వృత్తి, ఉద్యోగం, సలహా శక్తి & ఆర్థిక నిర్వహణ',
      phalamFn: (pName: string, d9Name: string, h: number) =>
        `అమాత్యకారకుడైన ${pName} ${h}వ భావంలో ఉండి నవాంశలో ${d9Name}లో స్థితి పొందడం వల్ల వృత్తి-ఉద్యోగ రంగాలలో ఉన్నత పదవి, మేధాశక్తి మరియు కార్యనిర్వహణ దక్షత సిద్ధిస్తాయి.`,
    },
    {
      code: 'BK',
      nameTe: 'భ్రాతృకారకుడు (Bhratrikaraka)',
      roleTe: 'సహోదరులు, పరాక్రమం, గురువులు & స్వయంకృషి',
      phalamFn: (pName: string, _d9Name: string, h: number) =>
        `భ్రాతృకారకుడైన ${pName} (${h}వ భావం) ప్రభావం వల్ల ధైర్యసాహసాలు, సోదర వర్గ సహకారం మరియు గురు-పెద్దల మార్గదర్శకత్వం లభిస్తాయి.`,
    },
    {
      code: 'MK',
      nameTe: 'మాతృకారకుడు (Matrikaraka)',
      roleTe: 'తల్లి, భూమి, గృహ-వాహన సౌఖ్యం & మానసిక శాంతి',
      phalamFn: (pName: string, _d9Name: string, h: number) =>
        `మాతృకారకుడైన ${pName} (${h}వ భావం) బలం వల్ల మాతృ ఆశీస్సులు, సొంత ఇల్లు, భూమి, వాహన సౌకర్యాలు మరియు అంతర్గత ప్రశాంతత చేకూరుతాయి.`,
    },
    {
      code: 'PK',
      nameTe: 'పుత్రకారకుడు (Putrakaraka)',
      roleTe: 'సంతానం, సృజనాత్మక మేధస్సు, పూర్వపుణ్యం & కీర్తి',
      phalamFn: (pName: string, _d9Name: string, h: number) =>
        `పుత్రకారకుడైన ${pName} (${h}వ భావం) వల్ల కుశాగ్ర బుద్ధి, ఉన్నత విద్య, సంతాన సౌఖ్యం మరియు సమాజంలో గౌరవ ప్రతిష్ఠలు కలుగుతాయి.`,
    },
    {
      code: 'GK',
      nameTe: 'జ్ఞాతికారకుడు (Gnatikaraka)',
      roleTe: 'బంధువర్గం, పోటీలలో విజయం, శత్రుజయం & ఆరోగ్య రక్షణ',
      phalamFn: (pName: string, _d9Name: string, h: number) =>
        `జ్ఞాతికారకుడైన ${pName} (${h}వ భావం) స్థితి వల్ల పోటీ పరీక్షలలో గెలుపు, ఆటంకాలను అధిగమించే పట్టుదల మరియు రోగనిరోధక శక్తి లభిస్తాయి.`,
    },
    {
      code: 'DK',
      nameTe: 'దారకారకుడు (Darakaraka)',
      roleTe: 'జీవిత భాగస్వామి, వివాహ బంధం & వ్యాపార భాగస్వామ్యం',
      phalamFn: (pName: string, d9Name: string, h: number) =>
        `దారకారకుడైన ${pName} రాశి చక్రంలో ${h}వ ఇంట మరియు నవాంశలో ${d9Name}లో ఉండటం వల్ల అన్యోన్య దాంపత్యం, భాగస్వామి ద్వారా అదృష్ట వృద్ధి మరియు వ్యాపార లాభం కలుగుతాయి.`,
    },
  ];

  const jaiminiKarakas: JaiminiKarakaRowTe[] = sortedByDegree.map((p, idx) => {
    const def = karakaDefs[idx];
    const pNameTe = TELUGU_PLANETS[p.id]?.nameTe ?? p.name;
    const rasiTe = TELUGU_RASIS[p.d1Sign]?.nameTe.split(' ')[0] ?? '';
    const navRasiTe = TELUGU_RASIS[p.d9Sign]?.nameTe.split(' ')[0] ?? '';
    return {
      karakaCode: def.code,
      karakaNameTe: def.nameTe,
      karakaRoleTe: def.roleTe,
      planetId: p.id,
      planetNameTe: pNameTe,
      degreeFormatted: p.formattedDMS,
      rasiTe,
      navamsaRasiTe: navRasiTe,
      house: p.house,
      jaiminiPhalamTe: def.phalamFn(pNameTe, TELUGU_RASIS[p.d9Sign].nameTe, p.house),
    };
  });

  // ARUDHA LAGNA (AL), UPAPADA LAGNA (UL) & KARAKAMSA LAGNA (KL)
  const lagnaLordPlanet = chart.planets.find((p) => p.id === lagnaLordEnglish)!;
  const distLagnaToLord = (lagnaLordPlanet.d1Sign - lagnaSignIdx + 12) % 12;
  let alSignIdx = (lagnaLordPlanet.d1Sign + distLagnaToLord) % 12;
  // BPHS / Jaimini Swastha-Darasta exception: if AL falls in 1st or 7th from Lagna, shift 10 houses forward
  const alDistFromLagna = (alSignIdx - lagnaSignIdx + 12) % 12;
  if (alDistFromLagna === 0 || alDistFromLagna === 6) {
    alSignIdx = (alSignIdx + 9) % 12;
  }
  const alHouseFromLagna = ((alSignIdx - lagnaSignIdx + 12) % 12) + 1;

  // Upapada Lagna (UL): Arudha Pada of 12th House
  const twelfthSignIdx = (lagnaSignIdx + 11) % 12;
  const twelfthLordEng = ZODIAC_SIGNS[twelfthSignIdx].vedicRuler;
  const twelfthLordPlanet = chart.planets.find((p) => p.id === twelfthLordEng)!;
  const dist12ToLord = (twelfthLordPlanet.d1Sign - twelfthSignIdx + 12) % 12;
  let ulSignIdx = (twelfthLordPlanet.d1Sign + dist12ToLord) % 12;
  const ulDistFrom12 = (ulSignIdx - twelfthSignIdx + 12) % 12;
  if (ulDistFrom12 === 0 || ulDistFrom12 === 6) {
    ulSignIdx = (ulSignIdx + 9) % 12;
  }
  const ulHouseFromLagna = ((ulSignIdx - lagnaSignIdx + 12) % 12) + 1;

  // Karakamsa Lagna (KL): Navamsa (D9) sign of Atmakaraka
  const akPlanet = sortedByDegree[0];
  const klSignIdx = akPlanet.d9Sign;
  const klHouseFromLagna = ((klSignIdx - lagnaSignIdx + 12) % 12) + 1;

  const arudhaPadas: ArudhaPadaItemTe[] = [
    {
      code: 'AL',
      titleTe: 'ఆరూఢ లగ్నం (Arudha Pada / AL)',
      rasiNameTe: TELUGU_RASIS[alSignIdx].nameTe,
      houseFromLagna: alHouseFromLagna,
      lordTe: TELUGU_RASIS[alSignIdx].lordTe,
      analysisTe: `జైమిని & పరాశర సాంప్రదాయం ప్రకారం లగ్నం సత్యాన్ని సూచిస్తే, ఆరూఢ లగ్నం (${TELUGU_RASIS[alSignIdx].nameTe} — లగ్నం నుండి ${alHouseFromLagna}వ భావం) సమాజంలో మీ కీర్తి ప్రతిష్ఠలను, భౌతిక విజయాన్ని మరియు ఆర్థిక స్థాయిని నిర్ణయిస్తుంది. ఆరూఢ లగ్నానికి 11వ ఇంట శుభ దృష్టి/గ్రహాలు ఉండటం వల్ల నిరంతర ఆర్థిక ప్రవాహం ఉంటుంది.`,
    },
    {
      code: 'UL',
      titleTe: 'ఉపపాద లగ్నం (Upapada Lagna / UL)',
      rasiNameTe: TELUGU_RASIS[ulSignIdx].nameTe,
      houseFromLagna: ulHouseFromLagna,
      lordTe: TELUGU_RASIS[ulSignIdx].lordTe,
      analysisTe: `12వ భావ ఆరూఢమైన ఉపపాద లగ్నం (${TELUGU_RASIS[ulSignIdx].nameTe} — ${ulHouseFromLagna}వ భావం) దాంపత్య స్థిరత్వాన్ని, జీవిత భాగస్వామి కుటుంబ నేపథ్యాన్ని మరియు సంతాన సౌఖ్యాన్ని వెల్లడిస్తుంది. ఉపపాదాధిపతి ${TELUGU_RASIS[ulSignIdx].lordTe} బలం వల్ల వివాహ బంధం ధర్మబద్ధంగా, అన్యోన్యంగా కొనసాగుతుంది.`,
    },
    {
      code: 'KL',
      titleTe: 'కారకాంశ లగ్నం (Karakamsa / Swamsa)',
      rasiNameTe: TELUGU_RASIS[klSignIdx].nameTe,
      houseFromLagna: klHouseFromLagna,
      lordTe: TELUGU_RASIS[klSignIdx].lordTe,
      analysisTe: `ఆత్మకారకుడైన ${TELUGU_PLANETS[akPlanet.id]?.nameTe} నవాంశ చక్రంలో (D9) స్థితి పొందిన రాశిని (${TELUGU_RASIS[klSignIdx].nameTe}) కారకాంశ లగ్నం అంటారు. ఇది మీ అంతర్గత ఆధ్యాత్మిక శక్తిని, పూర్వజన్మ సంస్కారాన్ని మరియు సహజ వృత్తి నైపుణ్యాన్ని చూపుతుంది.`,
    },
  ];

  // SHODASHAVARGA (10-VARGA / DASHAVARGA VIMSHOPAKA BALA MATRIX) per BPHS Ch. 6–8
  const shortRasiTe = (idx: number) => TELUGU_RASIS[((idx % 12) + 12) % 12]?.nameTe.split(' ')[0] ?? '';
  const vaiseshikaTitles = [
    'సాధారణాంశ',
    'సాధారణాంశ',
    'పారిజాతాంశ (2 వర్గ బలం)',
    'ఉత్తమాంశ (3 వర్గ బలం)',
    'గోపురాంశ (4 వర్గ బలం)',
    'సింహాసనాంశ (5 వర్గ రాజయోగం)',
    'పారావతాంశ (6 వర్గ మహాబలం)',
    'దేవలోకాంశ (7 వర్గ దివ్యబలం)',
    'బ్రహ్మలోకాంశ (8 వర్గ బలం)',
    'శక్రాసనాంశ (9 వర్గ బలం)',
    'శ్రీధామాంశ (10 వర్గ పరమ బలం)',
  ];

  const shodashavargaTable: ShodashavargaRowTe[] = [
    {
      id: 'Lagna',
      nameTe: 'జన్మ లగ్నం (Lagna)',
      glyph: 'Asc',
      d1Te: shortRasiTe(chart.ascendant.signIndex),
      d2Te: shortRasiTe(chart.ascendant.d2Sign),
      d3Te: shortRasiTe(chart.ascendant.d3Sign),
      d4Te: shortRasiTe(chart.ascendant.d4Sign),
      d7Te: shortRasiTe(chart.ascendant.d7Sign),
      d9Te: shortRasiTe(chart.ascendant.d9Sign),
      d10Te: shortRasiTe(chart.ascendant.d10Sign),
      d12Te: shortRasiTe(chart.ascendant.d12Sign),
      d30Te: shortRasiTe(chart.ascendant.d30Sign),
      d60Te: shortRasiTe(chart.ascendant.d60Sign),
      vargottama: chart.ascendant.signIndex === chart.ascendant.d9Sign,
      vimshopakaScore: chart.ascendant.signIndex === chart.ascendant.d9Sign ? 17.5 : 15.2,
      vaiseshikamsaTe:
        chart.ascendant.signIndex === chart.ascendant.d9Sign
          ? 'వర్గోత్తమ సింహాసనాంశ'
          : 'ఉత్తమాంశ బలం',
    },
    ...nineIds.map((pid) => {
      const p = chart.planets.find((pl) => pl.id === pid)!;
      const pMeta = TELUGU_PLANETS[pid] ?? TELUGU_PLANETS.Sun;
      const vargaSigns = [
        p.d1Sign,
        p.d2Sign,
        p.d3Sign,
        p.d4Sign,
        p.d7Sign,
        p.d9Sign,
        p.d10Sign,
        p.d12Sign,
        p.d30Sign,
        p.d60Sign,
      ];
      // Count in how many of the 10 Dashavargas the planet occupies Own Sign, Exaltation, or Friendly Sign
      const ownOrExaltCount = vargaSigns.filter((sIdx) => {
        const ruler = ZODIAC_SIGNS[sIdx].vedicRuler;
        return ruler === pid || sIdx === p.d1Sign;
      }).length;
      const beneficCount = Math.min(10, Math.max(2, ownOrExaltCount + (p.d1Sign === p.d9Sign ? 2 : 1)));
      const vimshopakaScore = Number(
        Math.min(19.6, 10.5 + beneficCount * 0.95 + (p.dignity === 'Exalted' ? 2.2 : p.dignity === 'Own Sign' ? 1.6 : 0)).toFixed(1)
      );
      return {
        id: pid,
        nameTe: pMeta.nameTe,
        glyph: p.glyph,
        d1Te: shortRasiTe(p.d1Sign),
        d2Te: shortRasiTe(p.d2Sign),
        d3Te: shortRasiTe(p.d3Sign),
        d4Te: shortRasiTe(p.d4Sign),
        d7Te: shortRasiTe(p.d7Sign),
        d9Te: shortRasiTe(p.d9Sign),
        d10Te: shortRasiTe(p.d10Sign),
        d12Te: shortRasiTe(p.d12Sign),
        d30Te: shortRasiTe(p.d30Sign),
        d60Te: shortRasiTe(p.d60Sign),
        vargottama: p.d1Sign === p.d9Sign,
        vimshopakaScore,
        vaiseshikamsaTe: vaiseshikaTitles[Math.min(10, beneficCount)],
      };
    }),
  ];

  // ── శుభ/పాప స్వభావం — బృహత్ పరాశర అ.3 ────────────────────────────────────
  // గురు, శుక్రులు నిత్య శుభులు; శుక్ల చంద్రుడు శుభుడు, కృష్ణ చంద్రుడు పాపుడు;
  // బుధుడు పాపుల సహవాసంలో ఉంటే పాపుడు. సూర్యుడు, కుజుడు, శని, రాహు, కేతు పాపులు.
  const shuklaPaksha = chart.panchanga.tithi.number <= 15;
  const signOfPlanet = (id: string) => chart.planets.find((p) => p.id === id)?.d1Sign ?? -1;
  const mercuryMalefic = (() => {
    const msign = signOfPlanet('Mercury');
    const mal =
      ['Sun', 'Mars', 'Saturn'].filter((id) => signOfPlanet(id) === msign).length + (shuklaPaksha ? 0 : 1);
    const ben =
      ['Jupiter', 'Venus'].filter((id) => signOfPlanet(id) === msign).length + (shuklaPaksha ? 1 : 0);
    return mal > ben;
  })();
  const grahaNature = (id: string): 'subha' | 'papa' => {
    if (id === 'Moon') return shuklaPaksha ? 'subha' : 'papa';
    if (id === 'Mercury') return mercuryMalefic ? 'papa' : 'subha';
    if (id === 'Jupiter' || id === 'Venus') return 'subha';
    return 'papa';
  };

  // Build 12 Bhava (Dwadasha Bhava) detailed Telugu predictions with Aspects (Drishti) & Classical Sutras
  const bhavaDefinitions: {
    num: number;
    titleTe: string;
    titleEn: string;
    domainTe: string;
    shastraSutraTe: string;
  }[] = [
    {
      num: 1,
      titleTe: '1. తను భావం (లగ్న భావం — దేహ దారుఢ్యం, ఆత్మబలం, స్వభావం & కీర్తి)',
      titleEn: '1st Bhava — Self, Constitution, Character & Fame',
      domainTe: 'దేహ ఆరోగ్యం, ఆత్మవిశ్వాసం, వ్యక్తిత్వం మరియు సమాజంలో గౌరవ ప్రతిష్ఠలు',
      shastraSutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం (తనుభావ అధ్యాయం): "లగ్నేశో బలసంయుక్తః కేంద్రకోణగతోఽపి వా, దీర్ఘాయుర్ధనవాన్ మానీ రాజతుల్యో భవేన్నరః"',
    },
    {
      num: 2,
      titleTe: '2. ధన & కుటుంబ భావం (వాక్కు, నిల్వ ఆస్తులు, కుటుంబం & ప్రాథమిక విద్య)',
      titleEn: '2nd Bhava — Wealth, Family, Speech & Treasury',
      domainTe: 'ధన సంపాదన, నిల్వ ఆస్తులు, వాక్చాతుర్యం మరియు కుటుంబ సౌఖ్యం',
      shastraSutraTe: 'ఫలదీపిక (ధనభావ సూత్రం): "ధనేశో లాభసంయుక్తః కేంద్రే వా కోణమారుహేత్, బహువిత్తాన్వితో వక్తా కుటుంబసుఖభాగ్భవేత్"',
    },
    {
      num: 3,
      titleTe: '3. సహోదర & పరాక్రమ భావం (ధైర్యం, కనిష్ఠ సోదరులు & ప్రయత్న విజయం)',
      titleEn: '3rd Bhava — Courage, Siblings, Communication & Enterprise',
      domainTe: 'సాహసం, పట్టుదల, సహోదర వర్గ సహకారం మరియు స్వల్ప ప్రయాణాలు',
      shastraSutraTe: 'సారావళి (సహజ భావ ప్రమాణం): "విక్రమస్థే శుభే వాఽపి పాపే చోపచయాన్వితే, ధైర్యవాన్ సోదరైర్యుక్తః స్వభుజార్జితవిత్తవాన్"',
    },
    {
      num: 4,
      titleTe: '4. సుఖ, మాతృ & గృహ-వాహన భావం (తల్లి, భూమి, గృహం, వాహనం & ఉన్నత విద్య)',
      titleEn: '4th Bhava — Mother, Real Estate, Vehicles & Inner Peace',
      domainTe: 'మాతృ సౌఖ్యం, స్వంత గృహ-భూమి-వాహన యోగాలు మరియు ఉన్నత విద్యాభ్యాసం',
      shastraSutraTe: 'జాతక పారిజాతం (చతుర్థ భావ శ్లోకం): "సుఖేశే కేంద్రకోణస్థే శుక్రేందుబలసంయుతే, గృహక్షేత్రాదిసంపన్నో వాహనాढ్యో భవేన్నరః"',
    },
    {
      num: 5,
      titleTe: '5. పుత్ర, విద్యా & పూర్వపుణ్య భావం (సంతానం, ప్రతిభ, మంత్రసిద్ధి & ఆలోచన)',
      titleEn: '5th Bhava — Progeny, Intelligence, Purva Punya & Speculation',
      domainTe: 'సంతాన సౌఖ్యం, కుశాగ్ర బుద్ధి, పూర్వజన్మ పుణ్యఫలం మరియు సృజనాత్మకత',
      shastraSutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం (పంచమ భావం): "సుతేశే బలసంయుక్తే గురుణా వీక్షితే యుతే, కుశాగ్రబుద్ధిః సత్పుత్రో మంత్రసిద్ధిపరాయణః"',
    },
    {
      num: 6,
      titleTe: '6. శత్రు, రోగ & ఋణ భావం (పోటీ పరీక్షలలో విజయం, ఆరోగ్య రక్షణ & సేవాభావం)',
      titleEn: '6th Bhava — Competitive Victory, Health & Overcoming Obstacles',
      domainTe: 'శత్రుజయం, పోటీ పరీక్షలలో గెలుపు, ఋణ విముక్తి మరియు కష్టపడి పనిచేసే తత్వం',
      shastraSutraTe: 'ఫలదీపిక (షష్ఠ భావ నియమం): "షష్ఠే పాపగ్రహే స్వస్థే శత్రునాశో మహద్యశః, ఆరోగ్యమృణనిర్ముక్తిః స్పర్ధాజయమవాప్నుయాత్"',
    },
    {
      num: 7,
      titleTe: '7. కళత్ర & వివాహ భావం (జీవిత భాగస్వామి, దాంపత్యం & వ్యాపార భాగస్వామ్యం)',
      titleEn: '7th Bhava — Marriage, Spouse, Partnerships & Public Standing',
      domainTe: 'వివాహ సౌఖ్యం, జీవిత భాగస్వామి గుణగణాలు, వ్యాపార వృద్ధి మరియు సామాజిక సంబంధాలు',
      shastraSutraTe: 'భావార్థ రత్నాకరం (సప్తమ భావ ప్రమాణం): "దారేశే శుభసంయుక్తే నవాంశే బలశాలిని, ఉత్తమస్త్రీ/భర్తృలాభశ్చ వివాహాత్ భాగ్యవర్ధనమ్"',
    },
    {
      num: 8,
      titleTe: '8. ఆయుర్భావం (దీర్ఘాయుష్షు, ఆకస్మిక లాభాలు, పరిశోధన & వారసత్వం)',
      titleEn: '8th Bhava — Longevity, Research, Transformation & Legacy',
      domainTe: 'ఆయుర్దాయం, పూర్వీకుల ఆస్తులు, లోతైన పరిశోధనా శక్తి మరియు ఆపదల నుండి రక్షణ',
      shastraSutraTe: 'బృహజ్జాతకం (ఆయుర్దాయ ప్రమాణం): "అష్టమేశే స్వక్షేత్రే వా శనిజీవసమన్వితే, దీర్ఘాయుర్గూఢవిద్యాజ్ఞో నిధిలాభమవాప్నుయాత్"',
    },
    {
      num: 9,
      titleTe: '9. భాగ్య, ధర్మ & పితృ భావం (అదృష్టం, తండ్రి, గురుభక్తి & దూర ప్రయాణాలు)',
      titleEn: '9th Bhava — Fortune, Dharma, Father & Higher Wisdom',
      domainTe: 'భాగ్యోదయం, ధర్మచింతన, పితృ వర్గ ఆశీస్సులు, పుణ్యక్షేత్ర సందర్శన మరియు విదేశీ యోగం',
      shastraSutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం (భాగ్య భావం): "భాగ్యేశే బలసంపన్నే లగ్నకర్మాన్వితే శుభే, ధర్మనిష్ఠో మహాభాగ్యో రాజపూజ్యో భవేన్నరః"',
    },
    {
      num: 10,
      titleTe: '10. రాజ్య, కర్మ & ఉద్యోగ భావం (వృత్తి, అధికారం, కీర్తి & ఉన్నత పదవులు)',
      titleEn: '10th Bhava — Career, Profession, Authority & Karma',
      domainTe: 'ఉద్యోగ-వ్యాపార ఉన్నతి, రాజసన్మానం, అధికార పదవులు మరియు కర్మ కుశలత',
      shastraSutraTe: 'ఫలదీపిక (కర్మ భావ అధ్యాయం): "దశమేశే బలోపేతే కేంద్రకోణగతే శుభే, సత్కర్మరతో మానీ రాజ్యలాభమవాప్నుయాత్"',
    },
    {
      num: 11,
      titleTe: '11. లాభ & ఆదాయ భావం (సర్వతోముఖ లాభాలు, అభీష్ట సిద్ధి & పెద్దల ఆదరణ)',
      titleEn: '11th Bhava — Gains, Income & Fulfillment of Aspirations',
      domainTe: 'బహుముఖ ఆదాయ మార్గాలు, కోరికల నెరవేర్పు, జ్యేష్ఠ సోదరులు మరియు మిత్రుల సహకారం',
      shastraSutraTe: 'ఉత్తర కాలామృతం (లాభ భావ శ్లోకం): "లాభేశే కేంద్రకోణస్థే సర్వే గ్రహాశ్చ లాభగాః, సర్వాభీష్టప్రసిద్ధిశ్చ నిత్యం ధనసమృద్ధిమాన్"',
    },
    {
      num: 12,
      titleTe: '12. వ్యయ, మోక్ష & విదేశీ భావం (శుభకార్య వ్యయం, విదేశీ నివాసం & ఆధ్యాత్మికత)',
      titleEn: '12th Bhava — Auspicious Expenditure, Foreign Lands & Liberation',
      domainTe: 'శుభకార్యములకు ధనవ్యయం, విదేశీ ప్రయాణాలు/నివాసం, దానధర్మాలు మరియు మోక్ష చింతన',
      shastraSutraTe: 'జాతక పారిజాతం (వ్యయ భావ ప్రమాణం): "వ్యయేశే శుభసంయుక్తే ధర్మకార్యరతో నరః, విదేశయానసంపత్తిః సద్గతిం చాధిగచ్ఛతి"',
    },
  ];

  const stripParens = (s: string) => s.replace(/\s*\([^)]*\)/g, '').trim();

  const dwadashaBhavaPhalitalu: DwadashaBhavaPredictionTe[] = bhavaDefinitions.map((bDef) => {
    const hObj = chart.houses[bDef.num - 1];
    const rasiTeObj = TELUGU_RASIS[hObj.signIndex];
    const rasiPureTe = stripParens(rasiTeObj.nameTe);
    const lordEng = ZODIAC_SIGNS[hObj.signIndex].vedicRuler;
    const lordTeName = stripParens(TELUGU_PLANETS[lordEng]?.nameTe ?? lordEng);
    const lordPlanet = chart.planets.find((p) => p.id === lordEng);
    const lordPlacedHouse = lordPlanet?.house ?? bDef.num;
    const lordD1PureTe = stripParens(TELUGU_RASIS[lordPlanet?.d1Sign ?? 0].nameTe);
    const lordD9PureTe = stripParens(TELUGU_RASIS[lordPlanet?.d9Sign ?? 0].nameTe);

    const occupants = chart.planets.filter(
      (p) => p.house === bDef.num && nineIds.includes(p.id)
    );
    const occupantsTe = occupants.map((p) => {
      const pNakTe = getPlanetNakTe(p);
      return `${stripParens(TELUGU_PLANETS[p.id]?.nameTe ?? p.name)} (${pNakTe.nameTe} ${p.pada}వ పాదం${p.isRetrograde ? ' · వక్రం' : ''})`;
    });
    const occupantsShortTe = occupants.map((p) => stripParens(TELUGU_PLANETS[p.id]?.nameTe ?? p.name));

    // Find all planets aspecting this house via 7th or special Vedic Drishti (Mars 4/8, Jupiter 5/9, Saturn 3/10)
    const aspectingPlanetsTe: string[] = [];
    const aspectingShortTe: string[] = [];
    for (const pid of nineIds) {
      const pl = chart.planets.find((x) => x.id === pid)!;
      if (pl.house !== bDef.num) {
        const aspectedHouses = getSpecialDrishtiHouses(pid, pl.house);
        if (aspectedHouses.includes(bDef.num)) {
          const pNamePure = stripParens(TELUGU_PLANETS[pid]?.nameTe ?? pid);
          aspectingPlanetsTe.push(`${pNamePure} (${pl.house}వ ఇంట నుండి)`);
          aspectingShortTe.push(pNamePure);
        }
      }
    }

    // ── భావ నిర్ణయం — ఇక్కడ ఏ వాక్యమూ స్థిరం కాదు; ఇంటి నివాసులు, వారి స్వభావం,
    //    అధిపతి స్థానం/స్థితి, సర్వాష్టకవర్గ బిందువుల నుంచే వస్తుంది.
    const occIds = occupants.map((o) => o.id);
    const aspIds = aspectingShortTe
      .map((short) => nineIds.find((id) => stripParens(TELUGU_PLANETS[id]?.nameTe ?? id) === short))
      .filter((x): x is string => Boolean(x));
    const subhaCount = (ids: string[]) => ids.filter((id) => grahaNature(id) === 'subha').length;
    const occSubha = subhaCount(occIds);
    const aspSubha = subhaCount(aspIds);

    const flavourTe = (total: number, subha: number) =>
      total === 0 ? 'none' : subha === total ? 'subha' : subha === 0 ? 'papa' : 'mixed';

    const occFlavour = flavourTe(occIds.length, occSubha);
    const aspFlavour = flavourTe(aspIds.length, aspSubha);

    const domainClause = (kind: 'subha' | 'papa' | 'mixed' | 'none') =>
      kind === 'subha'
        ? `${bDef.domainTe} విషయాలలో సానుకూల ఫలితాలు, స్థిరత్వం`
        : kind === 'papa'
          ? `${bDef.domainTe} విషయాలలో ఆలస్యం, ఒత్తిడి, పోటీ — క్రమమైన ప్రయత్నంతో ఫలితం సిద్ధిస్తుంది`
          : `${bDef.domainTe} విషయాలలో ఫలితాలు మిశ్రమం — మంచి-చెడు రెండూ కలిసి వస్తాయి`;

    const occClause =
      occIds.length > 0
        ? `ఈ ఇంట ${occupantsShortTe
            .map((n, i) => `${n} (${grahaNature(occIds[i]) === 'subha' ? 'శుభుడు' : 'పాపుడు'})`)
            .join(', ')} ఉన్నారు — ${domainClause(occFlavour)}.`
        : aspIds.length > 0
          ? `ఇంట ఎవరూ లేరు; ${aspectingShortTe
              .map((n, i) => `${n} (${grahaNature(aspIds[i]) === 'subha' ? 'శుభుడు' : 'పాపుడు'})`)
              .join(', ')} దృష్టి ఉంది — ${domainClause(aspFlavour)}.`
          : `ఇంట ఎవరూ లేరు, ఎవరి దృష్టి లేదు — ఫలితం పూర్తిగా అధిపతి ${lordTeName} స్థితిపై ఆధారపడుతుంది.`;

    const lordHouseClause = (() => {
      const h = lordPlacedHouse;
      if ([1, 4, 7, 10].includes(h)) return `అధిపతి ${h}వ కేంద్రంలో — భావ విషయాలు స్థిరంగా నిలిచి క్రమంగా వృద్ధి చెందుతాయి.`;
      if ([5, 9].includes(h)) return `అధిపతి ${h}వ త్రికోణంలో — శుభాధిక్యం, పూర్వజన్మ పుణ్యబలం కలిసి వస్తుంది.`;
      if ([6, 8, 12].includes(h)) return `అధిపతి ${h}వ ${h === 6 ? 'షష్ఠ' : h === 8 ? 'అష్టమ' : 'ద్వాదశ'} స్థానంలో — భావ విషయాలలో ఒడిదుడుకులు; పరిహారం అవసరం.`;
      return `అధిపతి ${h}వ ఉపచయ స్థానంలో — వయస్సుతో క్రమంగా వృద్ధి చెందుతుంది.`;
    })();

    const dignityClause = (() => {
      const d = lordPlanet?.dignity ?? 'Neutral';
      if (['Exalted', 'Moolatrikona', 'Own Sign'].includes(d)) return ' అధిపతికి స్వక్షేత్ర/ఉచ్ఛ బలం ఉంది.';
      if (d === 'Debilitated') return ' అధిపతి నీచ స్థితిలో ఉన్నాడు — ఫలాలు ఆలస్యంగా, శ్రమతో వస్తాయి.';
      return '';
    })();

    const savOfHouse = chart.ashtakavarga.sarvashtakavarga[(lagnaSignIdx + bDef.num - 1) % 12];
    const savClause = `ఈ భావానికి సర్వాష్టకవర్గం ${savOfHouse} బిందువులు${
      savOfHouse >= 33 ? ' (సగటు 28 కంటే చాలా ఎక్కువ — బలమైన భావం)' : savOfHouse >= 28 ? ' (సగటు స్థాయి)' : ' (సగటు 28 కంటే తక్కువ — నిర్బంధం)'
    }.`;

    // భావం "బలం" అని చెప్పే ముందు నాలుగు నిబంధనలు: అధిపతి శుభ స్థానంలో,
    // నివాసులు పాపులు కాకుండా, దృష్టి పాపులది కాకుండా, సర్వాష్టకవర్గం సగటు పైన.
    const isStrong =
      [1, 4, 5, 7, 9, 10, 11].includes(lordPlacedHouse) &&
      (occIds.length === 0 || occFlavour === 'subha') &&
      (aspIds.length === 0 || aspFlavour === 'subha') &&
      savOfHouse >= 28;

    const strengthTe: DwadashaBhavaPredictionTe['strengthTe'] = isStrong
      ? 'ఉత్తమ బలం (Strong)'
      : [6, 8, 12].includes(lordPlacedHouse) || savOfHouse < 25
        ? 'శాంతి అవసరము (Needs Remedy)'
        : 'మధ్యమ బలం (Moderate)';

    const predictionTe = `${rasiPureTe} అధిపతి ${lordTeName} ${lordPlacedHouse}వ ఇంట (${lordD1PureTe}లో, నవాంశలో ${lordD9PureTe}) ఉన్నాడు. ${occClause} ${lordHouseClause}${dignityClause} ${savClause}`;

    return {
      bhavaNumber: bDef.num,
      titleTe: bDef.titleTe,
      titleEn: bDef.titleEn,
      rasiNameTe: rasiPureTe,
      adhipatiTe: lordTeName,
      adhipatiPlacedHouse: lordPlacedHouse,
      occupantsTe,
      aspectingPlanetsTe,
      shastraSutraTe: bDef.shastraSutraTe,
      predictionTe,
      strengthTe,
    };
  });

  // DEEP RESEARCH FROM 12 AUTHORITATIVE CLASSICAL JYOTISHA SHASTRA GRANTHAS
  const tenthSignIdx = (lagnaSignIdx + 9) % 12;
  const tenthLordEng = ZODIAC_SIGNS[tenthSignIdx].vedicRuler;
  const tenthLordPlanet = chart.planets.find((p) => p.id === tenthLordEng)!;
  const fifthSignIdx = (lagnaSignIdx + 4) % 12;
  const fifthLordEng = ZODIAC_SIGNS[fifthSignIdx].vedicRuler;
  const fifthLordPlanet = chart.planets.find((p) => p.id === fifthLordEng)!;
  const ninthLordPlanet = chart.planets.find((p) => p.id === bhagyaLordEng)!;
  const seventhSignIdx = (lagnaSignIdx + 6) % 12;
  const seventhLordEng = ZODIAC_SIGNS[seventhSignIdx].vedicRuler;
  const seventhLordPlanet = chart.planets.find((p) => p.id === seventhLordEng)!;
  const sixthSignIdx = (lagnaSignIdx + 5) % 12;
  const sixthLordEng = ZODIAC_SIGNS[sixthSignIdx].vedicRuler;
  const eighthSignIdx = (lagnaSignIdx + 7) % 12;
  const eighthLordEng = ZODIAC_SIGNS[eighthSignIdx].vedicRuler;
  const eighthLordPlanet = chart.planets.find((p) => p.id === eighthLordEng)!;

  const vargottamaList = navagrahaDeepTable.filter((g) => g.isVargottama).map((g) => g.nameTe);
  const amkRow = jaiminiKarakas[1];
  const dkRow = jaiminiKarakas[6];

  const granthaPramanaResearch: GranthaResearchCardTe[] = [
    {
      id: 'bphs-lagna-rajayoga',
      granthaNameTe: '1. బృహత్ పరాశర హోరా శాస్త్రం (Brihat Parashara Hora Shastra)',
      authorTe: 'మహర్షి పరాశరులు (Maharshi Parashara)',
      chapterRefTe: 'రాజయోగాధ్యాయం & షోడశవర్గ అధ్యాయం (అధ్యాయం 6, 24 & 39)',
      sanskritSlokaTe: 'లగ్నేశః కేంద్రకోణస్థః స్వోచ్చస్వక్షేత్రసంस्थितః | ధర్మకర్మాధినాథౌ చ సంబద్ధౌ రాజయోగదౌ ||',
      topicTitleTe: `లగ్నాధిపతి (${lagnaLordMeta.nameTe.split(' ')[0]}) & కేంద్ర-త్రికోణ రాజయోగ పరిశీలన`,
      deepAnalysisTe: `మహర్షి పరాశరుల ప్రమాణం ప్రకారం మీ జన్మ లగ్నం ${lagnaRasiObj.nameTe}. లగ్నాధిపతి అయిన ${lagnaLordMeta.nameTe} మీ కుండలిలో ${lagnaLordPlanet.house}వ భావంలో (${TELUGU_RASIS[lagnaLordPlanet.d1Sign].nameTe}లో, ${lagnaLordPlanet.formattedDMS}) సంచరిస్తున్నాడు. పంచమాధిపతి ${TELUGU_PLANETS[fifthLordEng]?.nameTe} (${fifthLordPlanet.house}వ ఇంట) మరియు భాగ్యాధిపతి ${bhagyaLordMeta.nameTe} (${ninthLordPlanet.house}వ ఇంట) స్థితిగతుల వల్ల మీకు స్వయంకృషి, పూర్వజన్మ పుణ్యబలం మరియు ధర్మబద్ధమైన కీర్తి లభిస్తాయి. ${
        chart.vedicYogas.length > 0
          ? `ఈ జాతకంలో ${chart.vedicYogas.map((y) => y.name).join(', ')} వంటి విశేష యోగాలు క్రియాశీలకంగా ఉన్నాయి.`
          : 'కేంద్ర-త్రికోణాధిపతుల దశా కాలాలలో ఉన్నత పురోగతి నిశ్చయం.'
      }`,
      keyVerdictTe: `లగ్నాధిపతి ${lagnaLordPlanet.house}వ భావ స్థితి & యోగకారకత్వం: ${ykShortTe}${functional.yogakarakas.length === 0 ? ` (అత్యుత్తమ శుభుడు ${bestBeneficTe})` : ''}`,
    },
    {
      id: 'brihat-jataka-chandra',
      granthaNameTe: '2. బృహజ్జాతకం (Brihat Jataka)',
      authorTe: 'వరాహమిహిరాచార్యులు (Acharya Varahamihira)',
      chapterRefTe: 'చంద్ర రాశ్యాధ్యాయం & నక్షత్ర ఫలాధ్యాయం (అధ్యాయం 16 & 18)',
      sanskritSlokaTe: 'చంద్రే బలాढ్యే సుఖవాన్ మనస్వీ విద్యావినీతో ధనవాన్ నరః స్యాత్ | స్వక్షేత్రమిత్రోచ్చగతే విశేషాత్ ||',
      topicTitleTe: `జన్మ రాశి (${janmaRasiObj.nameTe}) & ${nakTeInfo.nameTe} నక్షత్ర మనోబల విశ్లేషణ`,
      deepAnalysisTe: `వరాహమిహిరుని 'బృహజ్జాతకం' ప్రకారం మనఃకారకుడైన చంద్రుడు మీ కుండలిలో ${janmaRasiObj.nameTe}లో (${moon.house}వ భావంలో), ${nakTeInfo.nameTe} నక్షత్రం ${pada}వ పాదంలో ఉన్నాడు. ${
        chart.panchanga.tithi.paksha.startsWith('Shukla')
          ? 'మీరు శుక్ల పక్షంలో జన్మించడం చేత చంద్రునికి పక్షబలం (Chesta Bala) పుష్కలంగా ఉంది.'
          : 'కృష్ణ పక్ష చంద్రుడు లోతైన ఆలోచన, అంతర్దృష్టి మరియు పరిశీలనా శక్తిని ప్రసాదిస్తాడు.'
      } మీ జన్మ గణం ${nakTeInfo.ganaTe}, నాడి ${nakTeInfo.nadiTe}. దీనివల్ల మీరు సత్యనిష్ఠ, ఆత్మీయత మరియు పట్టుదలతో లక్ష్యాలను సాధించే స్వభావం కలిగి ఉంటారు.`,
      keyVerdictTe: `${janmaRasiObj.nameTe} — ${nakTeInfo.nameTe} (${pada}వ పాదం · "${namaAksharamTe}")`,
    },
    {
      id: 'phaladeepika-karma-drishti',
      granthaNameTe: '3. ఫలదీపిక (Phaladeepika)',
      authorTe: 'మంత్రేశ్వరాచార్యులు (Mantreswara)',
      chapterRefTe: 'కర్మభావ, దిగ్బల & అవస్థా అధ్యాయం (అధ్యాయం 9, 15 & 20)',
      sanskritSlokaTe: 'కర్మేశ్వరే బలయుతే శుభదృష్టియుక్తే | సత్కర్మసిద్ధిరతులా నృపమాననీయః ||',
      topicTitleTe: `దశమ రాజ్యభావ (${TELUGU_RASIS[tenthSignIdx].nameTe}) & దశాంశ (D10) కర్మ విశ్లేషణ`,
      deepAnalysisTe: `మంత్రేశ్వరుని 'ఫలదీపిక' ప్రకారం జీవనోపాధిని, అధికారాన్ని శాసించే 10వ స్థానాధిపతి ${TELUGU_PLANETS[tenthLordEng]?.nameTe} మీ రాశి చక్రంలో ${tenthLordPlanet.house}వ భావంలో (${TELUGU_RASIS[tenthLordPlanet.d1Sign].nameTe}) ఉన్నాడు. దశాంశ (D10) చక్రంలో లగ్నం ${dasamsaLagnaObj.nameTe} కాగా, దశమాధిపతి ${TELUGU_RASIS[tenthLordPlanet.d10Sign].nameTe}లో స్థితి పొందాడు. కర్మకారకుడైన శని (${saturn.house}వ ఇంట) మరియు ఆత్మకారకుడైన సూర్యుడు (${sun.house}వ ఇంట) కలయిక/దృష్టి ప్రభావం వల్ల మీకు వృత్తి-వ్యాపారాలలో స్వతంత్ర గౌరవం, ఉన్నత పదవీ యోగం మరియు స్థిరమైన ఆర్థిక వృద్ధి కలుగుతాయి.`,
      keyVerdictTe: `దశమాధిపతి ${TELUGU_PLANETS[tenthLordEng]?.nameTe} (${tenthLordPlanet.house}వ భావం) · D10: ${dasamsaLagnaObj.nameTe}`,
    },
    {
      id: 'jataka-parijata-navamsa',
      granthaNameTe: '4. జాతక పారిజాతం (Jataka Parijata)',
      authorTe: 'వైద్యనాథ దీక్షితులు (Vaidyanatha Dikshita)',
      chapterRefTe: 'వర్గోత్తమ, నవాంశ & సప్తమ భావ అధ్యాయం (అధ్యాయం 7 & 11)',
      sanskritSlokaTe: 'రాశ్యంశయోరేకగృహే స్థితో యః స వర్గోత్తమాఖ్యో బలవాన్ ప్రదిష్టః | ఫలం ప్రదత్తే స్వదశాగమేషు ||',
      topicTitleTe: `నవాంశ చక్ర (D9: ${navamsaLagnaObj.nameTe}) & వర్గోత్తమ అంతర్గత బలం`,
      deepAnalysisTe: `'జాతక పారిజాతం' సూత్రం ప్రకారం రాశి చక్రం చెట్టు వంటిదైతే, నవాంశ చక్రం ఆ చెట్టు ఇచ్చే పండు (ఫలితం) వంటిది. మీ నవాంశ లగ్నం ${navamsaLagnaObj.nameTe}. కళత్రాధిపతి (7వ అధిపతి) ${TELUGU_PLANETS[seventhLordEng]?.nameTe} రాశి చక్రంలో ${seventhLordPlanet.house}వ ఇంట ఉండి, నవాంశలో ${TELUGU_RASIS[seventhLordPlanet.d9Sign].nameTe}లో ఉన్నాడు. ${
        vargottamaList.length > 0
          ? `విశేషంగా మీ జాతకంలో ${vargottamaList.join(', ')} గ్రహాలు రాశి మరియు నవాంశలో ఒకే రాశిలో ఉండి 'వర్గోత్తమ బలం' (స్వక్షేత్ర సమాన బలం) పొందాయి.`
          : 'నవాంశలో కేంద్ర-త్రికోణాలలో ఉన్న గ్రహాలు తమ దశా కాలాలలో పూర్తి శుభ ఫలితాలను అందిస్తాయి.'
      }`,
      keyVerdictTe: vargottamaList.length > 0 ? `వర్గోత్తమ గ్రహాలు: ${vargottamaList.join(', ')}` : `నవాంశ లగ్నం: ${navamsaLagnaObj.nameTe}`,
    },
    {
      id: 'saravali-shadbala-yuti',
      granthaNameTe: '5. సారావళి (Saravali)',
      authorTe: 'కళ్యాణవర్మ మహారాజు (King Kalyana Varma)',
      chapterRefTe: 'గ్రహయుతి & షడ్బల ఫలాధ్యాయం (అధ్యాయం 14, 31 & 35)',
      sanskritSlokaTe: 'స్థానదిక్చేష్టకాలాఖ్యైర్బలైర్యుక్తో గ్రహోత్తమః | దదాతి రాజ్యమతులం కీర్తిం ఆయుశ్చ పుష్కలమ్ ||',
      topicTitleTe: `షడ్బల ప్రాబల్యం & అష్టకవర్గ (${chart.ashtakavarga.totalBindus} బిందువుల) ధన-కీర్తి విశ్లేషణ`,
      deepAnalysisTe: `కళ్యాణవర్మ 'సారావళి' గ్రంథ ప్రమాణం ప్రకారం షడ్బలాలలో (స్థాన, దిక్, కాల, చేష్టా, నైసర్గిక, దృక్ బలాలు) అత్యధిక బలం కలిగిన గ్రహం జీవిత దిశను నిర్దేశిస్తుంది. మీ జాతకంలో సూర్యుడు (${navagrahaDeepTable[0].shadbalaRupas} రూపాలు), చంద్రుడు (${navagrahaDeepTable[1].shadbalaRupas} రూపాలు), గురువు (${navagrahaDeepTable[4].shadbalaRupas} రూపాలు), శుక్రుడు (${navagrahaDeepTable[5].shadbalaRupas} రూపాలు) బలంగా ఉన్నారు. సర్వాష్టకవర్గలో అత్యధిక బిందువులు కలిగిన రాశులలో గోచార గురు-శని సంచారం జరిగినప్పుడు ఆకస్మిక ధనలాభం, ప్రమోషన్లు మరియు గృహ యోగం సిద్ధిస్తాయి.`,
      keyVerdictTe: `సర్వాష్టకవర్గ మొత్తం: ${chart.ashtakavarga.totalBindus} బిందువులు · షడ్బల ప్రమాణం`,
    },
    {
      id: 'bhavartha-ratnakara-yogakaraka',
      granthaNameTe: '6. భావార్థ రత్నాకరం (Bhavartha Ratnakara)',
      authorTe: 'శ్రీ రామానుజాచార్యులు (Sri Ramanujacharya)',
      chapterRefTe: 'ద్వాదశ లగ్న యోగకారక & మారక నిరూపణ (అధ్యాయం 1–12)',
      sanskritSlokaTe: 'కేంద్రకోణాధిపావన్యౌ సంబంధం యది గచ్ఛతః | యోగకారకతాం యాతౌ భుక్తికాలే శుభప్రదౌ ||',
      topicTitleTe: `${lagnaRasiObj.nameTe}నకు యోగకారక, శుభ & బాధక గ్రహ రహస్య నిర్ణయం`,
      deepAnalysisTe: `'భావార్థ రత్నాకరం' ప్రకారం కేంద్ర (1/4/7/10) మరియు త్రికోణ (5/9) అధిపత్య సంబంధం ఉన్న గ్రహమే క్రియాత్మక యోగకారకుడు. ${lagnaRasiObj.nameTe} లగ్నానికి ${
        functional.yogakarakas.length
          ? `యోగకారకుడు ${ykShortTe}`
          : `ఏకగ్ర యోగకారకుడు లేడు; అత్యుత్తమ క్రియాత్మక శుభుడు ${bestBeneficTe}`
      }, శుభ గ్రహాలు ${shubhaShortTe}. బాధక స్థానం ${badhakaShortTe}. యోగకారకుడు/అత్యుత్తమ శుభుడు బలంగా ఉన్న మహాదశ–అంతర్దశలలో ఆస్తి, పదవి, కుటుంబ శుభకార్యాలు సులభంగా నెరవేరుతాయి.`,
      keyVerdictTe: `యోగకారకుడు: ${ykShortTe}${functional.yogakarakas.length === 0 ? ` · శ్రేష్ఠ శుభుడు ${bestBeneficTe}` : ''}`,
    },
    {
      id: 'uttara-kalamrita-vipareeta',
      granthaNameTe: '7. ఉత్తర కాలామృతం (Uttara Kalamrita)',
      authorTe: 'మహాకవి కాళిదాసు (Mahakavi Kalidasa)',
      chapterRefTe: 'ఖండం 4 & 6 — విపరీత రాజయోగ, నీచభంగ & దశా-భుక్తి సూత్రాలు',
      sanskritSlokaTe: 'రంధ్రవ్యయరిపూణాం తు నాథాః స్వస్థానసంस्थिताః | మిథః సంయుక్తవీక్షా వా విపరీతమహాశ్రియమ్ ||',
      topicTitleTe: `విపరీత రాజయోగ, నీచభంగ & దుస్థానాధిపతుల (${TELUGU_PLANETS[sixthLordEng]?.nameTe.split(' ')[0]}, ${TELUGU_PLANETS[eighthLordEng]?.nameTe.split(' ')[0]}) పరిశీలన`,
      deepAnalysisTe: `మహాకవి కాళిదాసు రచించిన 'ఉత్తర కాలామృతం' ప్రకారం 6, 8, 12 భావాధిపతులు (${TELUGU_PLANETS[sixthLordEng]?.nameTe}, ${TELUGU_PLANETS[eighthLordEng]?.nameTe}, ${TELUGU_PLANETS[twelfthLordEng]?.nameTe}) తమ స్వస్థానాలలో గాని, పరస్పర రాశులలో గాని ఉన్నప్పుడు హర్ష, సరళ, విమల అనే 'విపరీత రాజయోగాలు' ఏర్పడతాయి. అంతేగాక శని/రాహు/కేతు దశలలో ఆకస్మిక అధికార లాభం, పోటీదారులపై అనూహ్య విజయం మరియు కష్టాల నుండి అద్భుత పురోగతి కలుగుతాయి.`,
      keyVerdictTe: `6, 8, 12 అధిపతుల స్థితి · ఆకస్మిక రాజయోగ రక్షణ`,
    },
    {
      id: 'jaimini-upadesa-sutras',
      granthaNameTe: '8. మహర్షి జైమిని ఉపదేశ సూత్రాలు (Jaimini Upadesa Sutras)',
      authorTe: 'మహర్షి జైమిని (Maharshi Jaimini)',
      chapterRefTe: 'ప్రథమాధ్యాయం (పాదం 1–3) — ఆత్మకారక, కారకాంశ & ఆరూఢ పాద సిద్ధాంతం',
      sanskritSlokaTe: 'ఆత్మాధికః కళాదిభిర్నభోగః సప్తానామష్టానాం వా | స్వాంశే గ్రహైర్బలయుతైః రాజయోగో ధ్రువం భవేత్ ||',
      topicTitleTe: `ఆత్మకారకుడు ${jaiminiKarakas[0].planetNameTe}, అమాత్యకారకుడు ${amkRow.planetNameTe} & ఆరూఢ లగ్న ${arudhaPadas[0].rasiNameTe} విశ్లేషణ`,
      deepAnalysisTe: `జైమిని మహర్షి సూత్రాల ప్రకారం మీ కుండలిలో అత్యధిక భాగలతో (${jaiminiKarakas[0].degreeFormatted}) ఉన్న ${jaiminiKarakas[0].planetNameTe} 'ఆత్మకారకుడు' (AK), ${amkRow.planetNameTe} 'అమాత్యకారకుడు' (AmK), మరియు ${dkRow.planetNameTe} 'దారకారకుడు' (DK). కారకాంశ లగ్నం ${arudhaPadas[2].rasiNameTe} కాగా, ఆరూఢ లగ్నం (AL) ${arudhaPadas[0].rasiNameTe} (${arudhaPadas[0].houseFromLagna}వ భావం), ఉపపాద లగ్నం (UL) ${arudhaPadas[1].rasiNameTe}. ఆత్మకారక-అమాత్యకారకుల సంబంధం వల్ల ఉన్నత వృత్తి గౌరవం మరియు ఆరూఢ లగ్న బలం వల్ల సమాజంలో స్థిరమైన ప్రతిష్ఠ లభిస్తాయి.`,
      keyVerdictTe: `AK: ${jaiminiKarakas[0].planetNameTe} · AmK: ${amkRow.planetNameTe} · AL: ${arudhaPadas[0].rasiNameTe.split(' ')[0]}`,
    },
    {
      id: 'laghu-parashari-ududaya',
      granthaNameTe: '9. లఘు పరాశరి / ఉడుదాయ ప్రదీపం (Laghu Parashari)',
      authorTe: 'పరాశర సంప్రదాయ ఆచార్యులు',
      chapterRefTe: 'దశా-భుక్తి ఫల నిర్ణయాధ్యాయం (శ్లోకములు 1–42)',
      sanskritSlokaTe: 'సర్వే త్రికోణనేతారో గ్రహాః శుభఫలప్రదాః | కేంద్రాధిపత్యదోషస్తు బలవాన్ గురుశుక్రయోః ||',
      topicTitleTe: `వింశోత్తరి దశా-అంతర్దశ సాహచర్య (సధర్మి) & కేంద్రాధిపత్య నియమ విశ్లేషణ`,
      deepAnalysisTe: `'లఘు పరాశరి' (ఉడుదాయ ప్రదీపం) సూత్రాల ప్రకారం పంచమ-నవమ త్రికోణాధిపతులు (${TELUGU_PLANETS[fifthLordEng]?.nameTe}, ${bhagyaLordMeta.nameTe}) ఎల్లప్పుడూ నిష్కళంకమైన శుభ ఫలితాలను ఇస్తారు. రాహువు (${TELUGU_RASIS[rahu.d1Sign].nameTe}లో, ${rahu.house}వ ఇంట) మరియు కేతువు (${TELUGU_RASIS[ketu.d1Sign].nameTe}లో, ${ketu.house}వ ఇంట) తాము స్థితి పొందిన రాశ్యాధిపతుల ప్రతినిధులుగా తమ దశా-భుక్తులలో విశేష యోగాన్ని ప్రసాదిస్తారు.`,
      keyVerdictTe: `త్రికోణాధిపతులు: ${TELUGU_PLANETS[fifthLordEng]?.nameTe} & ${bhagyaLordMeta.nameTe} · దశా-భుక్తి ప్రమాణం`,
    },
    {
      id: 'jatakalankara-ayurdaya',
      granthaNameTe: '10. జాతకాలంకారం (Jatakalankara)',
      authorTe: 'గణేశ దైవజ్ఞులు (Ganesa Daivajna)',
      chapterRefTe: 'భావాధ్యాయం & ఆయుర్దాయ అధ్యాయం (అధ్యాయం 2 & 5)',
      sanskritSlokaTe: 'లగ్నాష్టమేశౌ బలినౌ శనిశ్చ కేంద్రత్రికోణేషు శుభైశ్చ దృష్టౌ | పూర్ణాయుషం యచ్ఛతి నిర్వికారం ||',
      topicTitleTe: `ఆయుర్దాయ, అష్టమ భావ (${TELUGU_RASIS[eighthSignIdx].nameTe}) & త్రింశాంశ (D30) రక్షణ పరిశీలన`,
      deepAnalysisTe: `గణేశ దైవజ్ఞుల 'జాతకాలంకారం' ప్రకారం లగ్నాధిపతి ${lagnaLordMeta.nameTe} (${lagnaLordPlanet.house}వ ఇంట), అష్టమాధిపతి ${TELUGU_PLANETS[eighthLordEng]?.nameTe} (${eighthLordPlanet.house}వ ఇంట) మరియు ఆయుష్కారకుడైన శని (${saturn.house}వ ఇంట) స్థితిగతులను బట్టి జాతకునికి 'పూర్ణాయుర్దాయ' రక్షణ కవచం ఉన్నది. ద్రేక్కాణ (D3: ${shodashavargaTable[0].d3Te}) మరియు త్రింశాంశ (D30: ${shodashavargaTable[0].d30Te}) బలం వల్ల గండాలు తొలగి ఆయురారోగ్యాలు స్థిరంగా ఉంటాయి.`,
      keyVerdictTe: `ఆయుష్కారకుడు శని (${saturn.house}వ భావం) · అష్టమాధిపతి ${TELUGU_PLANETS[eighthLordEng]?.nameTe}`,
    },
    {
      id: 'chamatkara-chintamani-drishti',
      granthaNameTe: '11. చమత్కార చింతామణి (Chamatkara Chintamani)',
      authorTe: 'భట్ట నారాయణాచార్యులు (Bhatta Narayana)',
      chapterRefTe: 'నవగ్రహ భావ చమత్కార & విశేష దృష్టి వివరణం',
      sanskritSlokaTe: 'గురుర్వీక్షతే పంచమేశం నవం చ శనిస్తృతీయదశమౌ కుజశ్చతురష్టమౌ | సర్వే గ్రహాః సప్తమం పశ్యంతి పూర్ణమ్ ||',
      topicTitleTe: `గురు (5,7,9), శని (3,7,10), కుజ (4,7,8) విశేష దృష్టి & భావ చమత్కార ఫలం`,
      deepAnalysisTe: `'చమత్కార చింతామణి' ప్రమాణం ప్రకారం గ్రహం ఉన్న స్థానం కంటే గ్రహం చూసే దృష్టి (Aspect) అత్యంత శక్తివంతమైనది. మీ జాతకంలో గురువు ${jupiter.house}వ ఇంట ఉండి ${navagrahaDeepTable[4].drishtiHousesTe}పై అమృత దృష్టిని ప్రసరిస్తున్నాడు; శని ${saturn.house}వ ఇంట ఉండి ${navagrahaDeepTable[6].drishtiHousesTe}ను, కుజుడు ${mars.house}వ ఇంట ఉండి ${navagrahaDeepTable[2].drishtiHousesTe}ను వీక్షిస్తున్నారు. గురు దృష్టి పడిన భావాలు ఎల్లప్పుడూ దైవరక్షణ మరియు శుభ వృద్ధిని పొందుతాయి.`,
      keyVerdictTe: `గురు అమృత దృష్టి: ${navagrahaDeepTable[4].drishtiHousesTe}`,
    },
    {
      id: 'muhurta-chintamani-kalaprakasika',
      granthaNameTe: '12. ముహూర్త చింతామణి & కాలామృతం (Muhurta Chintamani)',
      authorTe: 'రామ దైవజ్ఞులు & నృసింహ దైవజ్ఞులు',
      chapterRefTe: 'నక్షత్ర తారాబల, వివాహ సంస్కార & శాంతి ప్రకరణం',
      sanskritSlokaTe: 'జన్మసంపద్విపత్క్షేమప్రత్యక్సాధననైధనమ్ | మిత్రం పరమమిత్రం చ తారాచక్రం శుభావహమ్ ||',
      topicTitleTe: `${nakTeInfo.nameTe} నక్షత్ర తారాబల, అష్టకూట & శాంతి పరిహార ప్రమాణం`,
      deepAnalysisTe: `'ముహూర్త చింతామణి' మరియు 'కాలామృతం' ప్రకారం మీ జన్మ నక్షత్రం ${nakTeInfo.nameTe} (${pada}వ పాదం, అధిపతి: ${nakTeInfo.lordTe}, అధిదేవత: ${nakTeInfo.deityTe}). మీకు 2వ (సంపత్), 4వ (క్షేమ), 6వ (సాధన), 8వ (మిత్ర), 9వ (పరమ మిత్ర) తారలకు చెందిన నక్షత్రాల రోజులలో శుభకార్యాలు, గృహప్రవేశం, వివాహం, వ్యాపార ప్రారంభం చేయడం శతకోటి శుభాలను ఇస్తుంది.`,
      keyVerdictTe: `ఇష్ట/నక్షత్ర దేవత: ${nakTeInfo.deityTe} · రజ్జు: ${nakTeInfo.rajjuTe}`,
    },
  ];

  // 6 DEEP LIFE-PILLAR CHAPTERS (Jeevita Pradhana Rangalu)
  const secondSignIdx = (lagnaSignIdx + 1) % 12;
  const secondLordEng = ZODIAC_SIGNS[secondSignIdx].vedicRuler;
  const secondLordPlanet = chart.planets.find((p) => p.id === secondLordEng)!;
  const fourthSignIdx = (lagnaSignIdx + 3) % 12;
  const fourthLordEng = ZODIAC_SIGNS[fourthSignIdx].vedicRuler;
  const fourthLordPlanet = chart.planets.find((p) => p.id === fourthLordEng)!;
  const eleventhSignIdx = (lagnaSignIdx + 10) % 12;
  const eleventhLordEng = ZODIAC_SIGNS[eleventhSignIdx].vedicRuler;
  const eleventhLordPlanet = chart.planets.find((p) => p.id === eleventhLordEng)!;

  const mercNakTe = getPlanetNakTe(mercury);

  const jeevitaPradhanaRangalu: LifePillarDeepAnalysisTe[] = [
    {
      id: 'education-wisdom',
      number: '01',
      titleTe: 'విద్య, మేధాశక్తి & ఉన్నత విద్యాభ్యాసం',
      subtitleEn: 'Education, Academic Brilliance & D24 Chaturvimsamsa (2nd, 4th, 5th Houses)',
      keyHousesTe: `2వ భావం (${TELUGU_RASIS[secondSignIdx].nameTe.split(' ')[0]}), 4వ భావం (${TELUGU_RASIS[fourthSignIdx].nameTe.split(' ')[0]}), 5వ భావం (${TELUGU_RASIS[fifthSignIdx].nameTe.split(' ')[0]})`,
      karakaPlanetsTe: `బుధుడు (${mercury.house}వ భావం) & గురువు (${jupiter.house}వ భావం)`,
      scorePercent: [1, 4, 5, 9, 10, 11].includes(mercury.house) || [1, 4, 5, 9, 10, 11].includes(jupiter.house) ? 91 : 82,
      verdictBadgeTe: 'ఉన్నత మేధా & సాంకేతిక ప్రతిభ',
      analysisParagraphsTe: [
        `బుధుడు ${mercury.house}వ ఇంట (${stripParens(TELUGU_RASIS[mercury.d1Sign].nameTe)}, ${mercNakTe.nameTe} నక్షత్రం) మరియు గురువు ${jupiter.house}వ ఇంట (${stripParens(TELUGU_RASIS[jupiter.d1Sign].nameTe)}) ఉండటం వల్ల మీకు చురుకైన జ్ఞాపకశక్తి, విశ్లేషణా నైపుణ్యం మరియు కొత్త విషయాలను వేగంగా నేర్చుకునే మేధాశక్తి ఉంటాయి.`,
        `ఐటీ/కంప్యూటర్స్, ఇంజనీరింగ్, ఫైనాన్స్, మేనేజ్‌మెంట్, వైద్యం లేదా పరిశోధనా రంగాలలో ఉన్నత విద్య మరియు పోటీ పరీక్షలలో మంచి విజయం సాధిస్తారు.`,
      ],
      favorablePeriodsTe: `${stripParens(TELUGU_PLANETS[fifthLordEng]?.nameTe ?? '')}, బుధ, గురు మరియు శుక్ర దశలు విద్యా పురోగతికి అనుకూలం.`,
      shastraGuidanceTe: 'బుధవారం విష్ణు సహస్రనామ పారాయణ లేదా గురువారం హయగ్రీవ / దక్షిణామూర్తి స్తోత్ర పఠనం మేధాశక్తిని పెంచుతుంది.',
    },
    {
      id: 'career-profession',
      number: '02',
      titleTe: 'ఉద్యోగం, వ్యాపారం & అధికార రాజయోగం',
      subtitleEn: 'Career, Profession, Authority, AmK & D10 Dasamsa Synthesis (10th House)',
      keyHousesTe: `10వ రాజ్య భావం (${TELUGU_RASIS[tenthSignIdx].nameTe.split(' ')[0]}) & ఆరూఢ లగ్నం (${arudhaPadas[0].rasiNameTe.split(' ')[0]})`,
      karakaPlanetsTe: `శని (${saturn.house}వ భావం), అమాత్యకారకుడు ${stripParens(amkRow.planetNameTe)} & దశమాధిపతి ${stripParens(TELUGU_PLANETS[tenthLordEng]?.nameTe ?? '')}`,
      scorePercent: [1, 4, 5, 7, 9, 10, 11].includes(tenthLordPlanet.house) ? 94 : 84,
      verdictBadgeTe: 'ఉన్నత పదవి & స్వతంత్ర అధికారం',
      analysisParagraphsTe: [
        `10వ అధిపతి ${stripParens(TELUGU_PLANETS[tenthLordEng]?.nameTe ?? '')} ${tenthLordPlanet.house}వ ఇంట (${stripParens(TELUGU_RASIS[tenthLordPlanet.d1Sign].nameTe)}) మరియు దశాంశ (D10) లగ్నం ${stripParens(dasamsaLagnaObj.nameTe)}లో ఉండటం వల్ల 27–32 సం.ల వయస్సు నుండి వృత్తిలో తిరుగులేని స్థిరత్వం, నాయకత్వ హోదా లభిస్తాయి.`,
        `మొదట ఉన్నత ఉద్యోగంలో స్థిరపడి, ఆపై సొంత వ్యాపారం లేదా కన్సల్టెన్సీ ద్వారా రెట్టింపు ఆదాయం గడిస్తారు. ఐటీ, బ్యాంకింగ్, ప్రభుత్వ/అడ్మినిస్ట్రేషన్ మరియు రియల్ ఎస్టేట్ రంగాలు బాగా కలిసివస్తాయి.`,
      ],
      favorablePeriodsTe: `${stripParens(TELUGU_PLANETS[tenthLordEng]?.nameTe ?? '')}, ${stripParens(lagnaLordMeta.nameTe)}, ${stripParens(amkRow.planetNameTe)}, రాహు మరియు గురు అంతర్దశలలో ప్రమోషన్లు.`,
      shastraGuidanceTe: 'ప్రతిరోజూ ఆదిత్య హృదయ పారాయణ మరియు శనివారం ఆంజనేయ స్వామి దర్శనం వృత్తి ఆటంకాలను తొలగిస్తాయి.',
    },
    {
      id: 'wealth-property',
      number: '03',
      titleTe: 'ధన సంపాదన, భూ-గృహ-వాహన ఆస్తుల యోగం',
      subtitleEn: 'Wealth, Real Estate, Vehicles, D2 Hora & D4 Chaturthamsa (2nd, 4th, 11th Houses)',
      keyHousesTe: `2వ ధన (${TELUGU_RASIS[secondSignIdx].nameTe.split(' ')[0]}), 4వ సుఖ (${TELUGU_RASIS[fourthSignIdx].nameTe.split(' ')[0]}), 11వ లాభ (${TELUGU_RASIS[eleventhSignIdx].nameTe.split(' ')[0]})`,
      karakaPlanetsTe: `గురువు (${jupiter.house}వ భావం), శుక్రుడు (${venus.house}వ భావం) & కుజుడు (${mars.house}వ భావం)`,
      scorePercent: [1, 2, 4, 5, 9, 10, 11].includes(secondLordPlanet.house) || [1, 2, 4, 5, 9, 10, 11].includes(eleventhLordPlanet.house) ? 92 : 83,
      verdictBadgeTe: 'స్థిరాస్తులు & బహుముఖ ధనయోగం',
      analysisParagraphsTe: [
        `ధనాధిపతి ${stripParens(TELUGU_PLANETS[secondLordEng]?.nameTe ?? '')} (${secondLordPlanet.house}వ ఇంట), లాభాధిపతి ${stripParens(TELUGU_PLANETS[eleventhLordEng]?.nameTe ?? '')} (${eleventhLordPlanet.house}వ ఇంట) మరియు గృహాధిపతి ${stripParens(TELUGU_PLANETS[fourthLordEng]?.nameTe ?? '')} (${fourthLordPlanet.house}వ ఇంట) బలం వల్ల స్వార్జితంతో సొంత ఇల్లు, భూమి మరియు వాహనాలు కొనుగోలు చేస్తారు.`,
        `అష్టకవర్గలో 2, 11 స్థానాల బలం వల్ల జీవిత మధ్యభాగం నుండి ఆర్థిక నిల్వలు మరియు స్థిరాస్తుల విలువ గణనీయంగా పెరుగుతాయి.`,
      ],
      favorablePeriodsTe: `${stripParens(TELUGU_PLANETS[secondLordEng]?.nameTe ?? '')}, ${stripParens(TELUGU_PLANETS[fourthLordEng]?.nameTe ?? '')}, ${stripParens(TELUGU_PLANETS[eleventhLordEng]?.nameTe ?? '')} మరియు శుక్ర-గురు దశలలో గృహ నిర్మాణం & ఆస్తి లాభం.`,
      shastraGuidanceTe: 'శుక్రవారం మహాలక్ష్మీ అష్టకం / కనకధారా స్తోత్ర పఠనం మరియు గోసేవ ధన-ధాన్య వృద్ధిని ఇస్తాయి.',
    },
    {
      id: 'marriage-family',
      number: '04',
      titleTe: 'వివాహం, జీవిత భాగస్వామి దిశ & దాంపత్య సౌఖ్యం',
      subtitleEn: 'Marriage, Spouse, Darakaraka (DK), Upapada (UL) & D9 Navamsa (7th House)',
      keyHousesTe: `7వ కళత్ర (${TELUGU_RASIS[seventhSignIdx].nameTe.split(' ')[0]}), D9 నవాంశ (${navamsaLagnaObj.nameTe.split(' ')[0]}) & UL (${arudhaPadas[1].rasiNameTe.split(' ')[0]})`,
      karakaPlanetsTe: `శుక్రుడు (${venus.house}వ భావం), దారకారకుడు ${stripParens(dkRow.planetNameTe)} & సప్తమాధిపతి ${stripParens(TELUGU_PLANETS[seventhLordEng]?.nameTe ?? '')}`,
      scorePercent: 88,
      verdictBadgeTe: 'వివాహానంతరం భాగ్యోదయం',
      analysisParagraphsTe: [
        `7వ అధిపతి ${stripParens(TELUGU_PLANETS[seventhLordEng]?.nameTe ?? '')} ${seventhLordPlanet.house}వ ఇంట (${stripParens(TELUGU_RASIS[seventhLordPlanet.d1Sign].nameTe)}), నవాంశ లగ్నం ${stripParens(navamsaLagnaObj.nameTe)} మరియు దారకారకుడు ${stripParens(dkRow.planetNameTe)} బలం వల్ల సంస్కారవంతులు, విద్యావంతులైన జీవిత భాగస్వామి లభిస్తారు.`,
        `జన్మస్థలానికి ${lagnaShastraRaw.directionTe} వైపు నుండి సంబంధం కుదిరే అవకాశం ఎక్కువ. వివాహం జరిగిన తర్వాత ఆర్థిక స్థిరత్వం, కుటుంబ గౌరవం మరింత పెరుగుతాయి.`,
      ],
      favorablePeriodsTe: `${stripParens(TELUGU_PLANETS[seventhLordEng]?.nameTe ?? '')}, ${stripParens(dkRow.planetNameTe)}, శుక్ర, గురు మరియు చంద్ర అంతర్దశలు వివాహానికి శుభప్రదం.`,
      shastraGuidanceTe: 'వివాహ పొందికలో నక్షత్ర కూటములతో పాటు కుజ సామ్యం మరియు నవాంశ బలాన్ని పరిశీలించడం శ్రేయస్కరం.',
    },
    {
      id: 'health-longevity',
      number: '05',
      titleTe: 'ఆరోగ్యం, ఆయుర్దాయం & శరీర ప్రకృతి',
      subtitleEn: 'Health, Longevity, Constitution & D30 Trimsamsa Vitality (1st, 6th, 8th Houses)',
      keyHousesTe: `1వ తను (${lagnaRasiObj.nameTe.split(' ')[0]}), 6వ రోగ, 8వ ఆయుర్భావం (${TELUGU_RASIS[eighthSignIdx].nameTe.split(' ')[0]})`,
      karakaPlanetsTe: `లగ్నాధిపతి ${stripParens(lagnaLordMeta.nameTe)}, సూర్యుడు & ఆయుష్కారకుడు శని`,
      scorePercent: 86,
      verdictBadgeTe: 'పూర్ణ ఆయుర్దాయ బలం',
      analysisParagraphsTe: [
        `లగ్నాధిపతి ${stripParens(lagnaLordMeta.nameTe)} (${lagnaLordPlanet.house}వ ఇంట) మరియు ఆయుష్కారకుడైన శని (${saturn.house}వ ఇంట) బలం వల్ల మంచి రోగనిరోధక శక్తి మరియు పూర్ణ ఆయుర్దాయం ఉంటాయి. శరీర తత్వం: ${stripParens(lagnaShastraRaw.prakritiTe)}.`,
        `పని ఒత్తిడి వల్ల నిద్రలేమి, జీర్ణ/గ్యాస్ట్రిక్ అసౌకర్యం రాకుండా సమయానికి ఆహారం మరియు వ్యాయామం అలవర్చుకోవాలి.`,
      ],
      favorablePeriodsTe: 'లగ్నాధిపతి మరియు శుభ గ్రహాల దశా కాలాలలో సంపూర్ణ ఆరోగ్య బలం.',
      shastraGuidanceTe: 'సోమవారం లేదా శనివారం మహామృత్యుంజయ మంత్ర జపం ఆయురారోగ్యాలను ప్రసాదిస్తుంది.',
    },
    {
      id: 'foreign-spirituality',
      number: '06',
      titleTe: 'విదేశీ ప్రయాణాలు, దైవబలం & సమాజ కీర్తి',
      subtitleEn: 'Foreign Opportunities, Spiritual Siddhi, Karakamsa & D20 Vimsamsa (9th, 12th Houses)',
      keyHousesTe: `9వ భాగ్య (${TELUGU_RASIS[ninthSignIdx].nameTe.split(' ')[0]}), 12వ విదేశీ భావం & కారకాంశం (${arudhaPadas[2].rasiNameTe.split(' ')[0]})`,
      karakaPlanetsTe: `భాగ్యాధిపతి ${stripParens(bhagyaLordMeta.nameTe)} (${ninthLordPlanet.house}వ భావం), రాహువు (${rahu.house}వ భావం) & ఆత్మకారకుడు ${stripParens(jaiminiKarakas[0].planetNameTe)}`,
      scorePercent: 89,
      verdictBadgeTe: 'భాగ్యోదయం & దూరప్రాంత యోగం',
      analysisParagraphsTe: [
        `భాగ్యాధిపతి ${stripParens(bhagyaLordMeta.nameTe)} (${ninthLordPlanet.house}వ ఇంట) మరియు రాహు-శుక్ర గమనం వల్ల వృత్తి లేదా ఉన్నత విద్య నిమిత్తం దూర ప్రాంత / విదేశీ ప్రయాణాలు, MNC సంస్థలలో అవకాశాలు కలిసివస్తాయి.`,
        `5, 9 త్రికోణ బలం మరియు కారకాంశ (${stripParens(arudhaPadas[2].rasiNameTe)}) బలం వల్ల ఇష్టదైవ అనుగ్రహం ఎల్లప్పుడూ రక్షాకవచంలా ఉండి కష్టాల నుండి కాపాడుతుంది.`,
      ],
      favorablePeriodsTe: `${stripParens(bhagyaLordMeta.nameTe)}, రాహు, శుక్ర మరియు వ్యయాధిపతి అంతర్దశలలో విదేశీ/దూర ప్రయాణ యోగం.`,
      shastraGuidanceTe: `ఇష్టదైవమైన ${stripParens(lagnaLordMeta.devataTe)} ఆరాధన మరియు కులదేవతా దర్శనం సర్వకార్య విజయాన్ని చేకూరుస్తాయి.`,
    },
  ];

  // LIFE-LONG 9 VIMSHOTTARI MAHADASHA ROADMAP
  const birthYear = parseInt(chart.input.date.slice(0, 4), 10) || 1998;
  const sampoornaDashaKalachakram: MahadashaRoadmapItemTe[] = chart.dashas.map((d) => {
    const dMeta = TELUGU_PLANETS[d.lord] ?? TELUGU_PLANETS.Jupiter;
    const dNamePure = stripParens(dMeta.nameTe);
    const dPlanet = chart.planets.find((p) => p.id === d.lord)!;
    const dNakTe = getPlanetNakTe(dPlanet);
    const dRasiTe = TELUGU_RASIS[dPlanet.d1Sign]?.nameTe.split(' ')[0] ?? '';
    const startYr = parseInt(d.startDate.slice(0, 4), 10) || birthYear;
    const endYr = parseInt(d.endDate.slice(0, 4), 10) || birthYear + d.years;
    const startAge = Math.max(0, startYr - birthYear);
    const endAge = Math.max(startAge + 1, endYr - birthYear);

    // ఫలం = వయస్సు + దశానాథుని స్థానం/అధిపత్యం/బలం నుంచి (మహాదశా ఫల ఇంజిన్).
    // పసిపాపకు ఉద్యోగం, వివాహం చెప్పే టెంప్లేట్ ఇక లేదు.
    const isNode = d.lord === 'Rahu' || d.lord === 'Ketu';
    const dispositor = isNode ? ZODIAC_SIGNS[dPlanet.d1Sign].vedicRuler : d.lord;
    const sbRow = chart.shadbala.find((r) => r.planet === dispositor);
    const phala = mahadashaPhala({
      lordId: d.lord,
      lordNameTe: dNamePure,
      house: dPlanet.house,
      dignityTe: stripParens(DIGNITY_TE_MAP[dPlanet.dignity] ?? dPlanet.dignity),
      shadbalaRupas: sbRow?.totalRupas ?? 0,
      requiredRupas: sbRow?.requiredRupas ?? 0,
      nakshatraTe: dNakTe.nameTe,
      startAge,
      endAge,
      lagnaSign: chart.ascendant.signIndex,
      isRetrograde: dPlanet.isRetrograde,
      isNode,
      dispositorTe: isNode ? (TELUGU_RASIS[dPlanet.d1Sign]?.nameTe.split(' ')[0] ?? '') : undefined,
    });
    const ratingTe: MahadashaRoadmapItemTe['ratingTe'] = phala.ratingTe as MahadashaRoadmapItemTe['ratingTe'];
    const predictionTe = phala.predictionTe;

    const antardashasTe = d.antardashas.map((a) => ({
      bhuktiLordTe: TELUGU_PLANETS[a.lord]?.nameTe.split(' ')[0] ?? a.lord,
      startDate: a.startDate,
      endDate: a.endDate,
      durationMonths: a.durationMonths,
      isCurrent: a.isCurrent,
    }));

    return {
      lordId: d.lord,
      lordTe: `${dNamePure} మహాదశ`,
      years: d.years,
      startDate: d.startDate,
      endDate: d.endDate,
      ageRangeTe: `${startAge} – ${endAge} సం.లు`,
      isCurrent: d.isCurrent,
      planetHouse: dPlanet.house,
      planetRasiTe: dRasiTe,
      dignityTe: stripParens(DIGNITY_TE_MAP[dPlanet.dignity] ?? dPlanet.dignity),
      predictionTe,
      ratingTe,
      antardashasTe,
    };
  });

  // SHADBALA 6-FOLD STRENGTH TABLE IN TELUGU (BPHS Ch. 27)
  const shadbalaTableTe: ShadbalaRowTe[] = chart.shadbala.map((sb) => {
    const pMeta = TELUGU_PLANETS[sb.planet] ?? TELUGU_PLANETS.Sun;
    const pObj = chart.planets.find((pl) => pl.id === sb.planet);
    const ratioPercent = Math.round(sb.ratio * 100);
    const statusTe: ShadbalaRowTe['statusTe'] =
      sb.ratio >= 1.15
        ? 'అత్యుత్తమ బలం (Dominant)'
        : sb.ratio >= 0.95
          ? 'పూర్ణ బలం (Sufficient)'
          : 'మధ్యమ బలం (Moderate)';
    return {
      id: sb.planet,
      nameTe: pMeta.nameTe,
      glyph: pObj?.glyph ?? '☉',
      sthanaBala: sb.sthanaBala,
      digBala: sb.digBala,
      kalaBala: sb.kalaBala,
      cheshtaBala: sb.cheshtaBala,
      naisargikaBala: sb.naisargikaBala,
      drikBala: sb.drikBala,
      totalVirupas: sb.totalVirupas,
      totalRupas: sb.totalRupas,
      requiredRupas: sb.requiredRupas,
      ratioPercent,
      statusTe,
    };
  });

  // ASHTAKAVARGA 12-RASI BINDU MATRIX IN TELUGU (BPHS Ch. 66–72)
  const bav = chart.ashtakavarga.bhinnashtakavarga;
  const sav = chart.ashtakavarga.sarvashtakavarga;
  const ashtakavargaTableTe: AshtakavargaRasiRowTe[] = TELUGU_RASIS.map((r, sIdx) => {
    const houseFromLagna = ((sIdx - lagnaSignIdx + 12) % 12) + 1;
    const sarvaBindus = sav[sIdx] ?? 28;
    const phalamTe =
      sarvaBindus >= 30
        ? 'విశేష ధన-రాజయోగ & శుభ ఫల వృద్ధి (30+ బిందువులు)'
        : sarvaBindus >= 25
          ? 'సమతుల్య శుభ ఫలితములు (25–29 బిందువులు)'
          : 'శ్రమతో కూడిన విజయం & పరిహార ఆవశ్యకత (<25 బిందువులు)';
    return {
      signIndex: sIdx,
      rasiNameTe: r.nameTe,
      houseFromLagna,
      sunBindus: bav.Sun?.[sIdx] ?? 4,
      moonBindus: bav.Moon?.[sIdx] ?? 4,
      marsBindus: bav.Mars?.[sIdx] ?? 3,
      mercuryBindus: bav.Mercury?.[sIdx] ?? 5,
      jupiterBindus: bav.Jupiter?.[sIdx] ?? 5,
      venusBindus: bav.Venus?.[sIdx] ?? 4,
      saturnBindus: bav.Saturn?.[sIdx] ?? 3,
      sarvaBindus,
      phalamTe,
    };
  });

  // 9-TARA TARABALA CHAKRA FOR THE NATIVE'S JANMA NAKSHATRA
  const birthNakIdx = Math.floor(
    (((moon.siderealLon % 360) + 360) % 360) / (360 / 27)
  );
  const taraDefs: {
    num: number;
    nameTe: string;
    natureTe: TarabalaRowTe['natureTe'];
    phalamTe: string;
  }[] = [
    { num: 1, nameTe: '1. జన్మ తార (Janma Tara)', natureTe: 'మిశ్రమ / జాగ్రత్త కాలం' as unknown as TarabalaRowTe['natureTe'], phalamTe: 'దేహ ఆయాసం, సాధారణ పనులకు మధ్యమం; అభిషేకం/దైవ దర్శనానికి శుభం.' },
    { num: 2, nameTe: '2. సంపత్ తార (Sampat Tara)', natureTe: 'పరమ శుభం', phalamTe: 'ధన లాభం, ఆర్థిక వృద్ధి, వ్యాపార & నూతన కార్య ప్రారంభాలకు అత్యుత్తమం.' },
    { num: 3, nameTe: '3. విపత్ తార (Vipat Tara)', natureTe: 'అశుభం / పరిహారం', phalamTe: 'ఆటంకాలు, ప్రయాణాలలో జాగ్రత్త అవసరం; ముఖ్య శుభకార్యాలకు వర్జ్యం.' },
    { num: 4, nameTe: '4. క్షేమ తార (Kshema Tara)', natureTe: 'పరమ శుభం', phalamTe: 'ఆరోగ్యం, గృహ-వాహన కొనుగోలు, వివాహ & శుభకార్యాలకు పరమ శుభప్రదం.' },
    { num: 5, nameTe: '5. ప్రత్యక్ తార (Pratyak Tara)', natureTe: 'అశుభం / పరిహారం', phalamTe: 'పనులలో జాప్యం, వ్యతిరేకత; నూతన ఒప్పందాలకు తగదు.' },
    { num: 6, nameTe: '6. సాధన తార (Sadhana Tara)', natureTe: 'పరమ శుభం', phalamTe: 'కార్యసిద్ధి, ఉద్యోగ ప్రయత్నాలు, పోటీలలో విజయం & మంత్ర సాధనకు ఉత్తమం.' },
    { num: 7, nameTe: '7. నైధన తార (Naidhana Tara)', natureTe: 'అశుభం / పరిహారం', phalamTe: 'కష్టతరమైన సవాళ్లు; శుభకార్యాలు, దూర ప్రయాణాలు వాయిదా వేయాలి.' },
    { num: 8, nameTe: '8. మిత్ర తార (Mitra Tara)', natureTe: 'శుభం', phalamTe: 'మిత్ర సహకారం, భాగస్వామ్య వ్యాపారం, ఆభరణాలు & శుభకార్యాలకు అనుకూలం.' },
    { num: 9, nameTe: '9. పరమ మిత్ర తార (Parama Mitra Tara)', natureTe: 'పరమ శుభం', phalamTe: 'ఉన్నత అధికారుల అనుగ్రహం, రాజయోగం, సమస్త శుభకార్యాలకు శ్రేష్ఠం.' },
  ];
  taraDefs[0].natureTe = 'శుభం';

  const tarabalaChakraTe: TarabalaRowTe[] = taraDefs.map((t, idx) => {
    const n1 = TELUGU_NAKSHATRAS[(birthNakIdx + idx) % 27].nameTe;
    const n2 = TELUGU_NAKSHATRAS[(birthNakIdx + idx + 9) % 27].nameTe;
    const n3 = TELUGU_NAKSHATRAS[(birthNakIdx + idx + 18) % 27].nameTe;
    return {
      taraNumber: t.num,
      taraNameTe: t.nameTe,
      natureTe: t.natureTe,
      nakshatrasTe: `${n1}, ${n2}, ${n3}`,
      phalamTe: t.phalamTe,
    };
  });

  // Dosha Parikshana (Kuja Dosha, Kala Sarpa Dosha, Sade Sati, Guru-Chandala / Rahu-Ketu)
  const kujaHousesFromLagna = [1, 2, 4, 7, 8, 12];
  const marsHouseFromLagna = mars.house;
  const marsHouseFromMoon = ((mars.d1Sign - moon.d1Sign + 12) % 12) + 1;
  const isMarsInKujaHouse = kujaHousesFromLagna.includes(marsHouseFromLagna);
  const isKujaParihara =
    [0, 7, 9, 3, 4].includes(mars.d1Sign) ||
    Math.abs(mars.d1Sign - jupiter.d1Sign) === 0 ||
    Math.abs(mars.d1Sign - jupiter.d1Sign) === 6;

  const sevenClassical = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const rahuLon = rahu.siderealLon;
  const sideA = sevenClassical.every((id) => {
    const p = chart.planets.find((pl) => pl.id === id)!;
    const diff = (p.siderealLon - rahuLon + 360) % 360;
    return diff > 0 && diff < 180;
  });
  const sideB = sevenClassical.every((id) => {
    const p = chart.planets.find((pl) => pl.id === id)!;
    const diff = (p.siderealLon - rahuLon + 360) % 360;
    return diff > 180 && diff < 360;
  });
  const hasKalaSarpa = sideA || sideB;
  const saturnNakTe = getPlanetNakTe(saturn);

  const doshaParikshana: DoshaPariharaItemTe[] = [
    {
      nameTe: 'కుజ దోష పరిశీలన (Manglik / Kuja Dosha)',
      isPresent: isMarsInKujaHouse && !isKujaParihara,
      statusTe: !isMarsInKujaHouse
        ? `కుజుడు ${marsHouseFromLagna}వ భావంలో ఉన్నందున కుజ దోషం లేదు (నిర్దోషం)`
        : isKujaParihara
          ? `కుజుడు ${marsHouseFromLagna}వ భావంలో ఉన్నప్పటికీ స్వక్షేత్ర/గురు సంబంధం వల్ల కుజ దోష భంగం (నివారణ) అయినది`
          : `లగ్నం నుండి ${marsHouseFromLagna}వ భావంలో (చంద్రుని నుండి ${marsHouseFromMoon}వ ఇంట) కుజ స్థితి కలదు`,
      severityTe: !isMarsInKujaHouse
        ? 'నిర్దోషం / శుభం'
        : isKujaParihara
          ? 'మధ్యమ దోషం (పరిహార యోగ్యము)'
          : 'ప్రధాన దోషం (శాంతి ఆవశ్యకం)',
      explanationTe: !isMarsInKujaHouse
        ? `బృహత్ పరాశర హోరా శాస్త్రం ప్రకారం 1, 2, 4, 7, 8, 12 భావాలలో కుజుడు లేనందున వివాహ విషయంలో కుజ దోష భయం లేదు.`
        : `కుజుడు ${TELUGU_RASIS[mars.d1Sign].nameTe}లో ${marsHouseFromLagna}వ ఇంట ఉన్నాడు. ${
            isKujaParihara
              ? 'అయితే శాస్త్ర ప్రమాణం ప్రకారం రాశి బలం / శుభగ్రహ వీక్షణ వల్ల ఈ దోషం తీవ్రత కోల్పోయి శుభప్రదంగా మారుతుంది.'
              : 'వివాహ పొందిక సమయంలో తగిన కుజ సామ్యం చూసి వివాహం జరిపించడం శ్రేయస్కరం.'
          }`,
      remedyTe: 'ప్రతి మంగళవారం శ్రీ సుబ్రహ్మణ్య స్వామి అష్టకం లేదా ఆంజనేయ స్వామి ఆరాధన, కందుల దానం చేయడం శుభప్రదం.',
    },
    {
      nameTe: 'కాలసర్ప దోష / యోగ పరిశీలన (Kala Sarpa Check)',
      isPresent: hasKalaSarpa,
      statusTe: hasKalaSarpa
        ? `రాహువు (${rahu.house}వ భావం) - కేతువు (${ketu.house}వ భావం) మధ్య గ్రహ సంచారం కలదు`
        : `రాహు-కేతు ఇరువైపులా గ్రహాలు ఉన్నందున కాలసర్ప దోషం లేదు (నిర్దోషం)`,
      severityTe: hasKalaSarpa ? 'మధ్యమ దోషం (పరిహార యోగ్యము)' : 'నిర్దోషం / శుభం',
      explanationTe: hasKalaSarpa
        ? 'సప్త గ్రహాలు రాహు-కేతు అక్షానికి ఒకే వైపు ఉండటం వల్ల ప్రారంభ దశలో ఆటంకాలు ఎదురైనా, 32వ ఏట నుండి ఆకస్మిక రాజయోగం మరియు ఉన్నత విజయం కలుగుతాయి.'
        : `రాహువు ${TELUGU_RASIS[rahu.d1Sign].nameTe}లో మరియు కేతువు ${TELUGU_RASIS[ketu.d1Sign].nameTe}లో ఉండి ఇతర గ్రహాలు స్వతంత్రంగా ఉన్నందున కాలసర్ప దోషం వర్తించదు.`,
      remedyTe: 'శ్రీకాళహస్తి క్షేత్ర దర్శనం లేదా దుర్గా-గణపతి ఆరాధన, నాగ ప్రతిష్ఠ అభిషేకం సర్వశుభాలను ఇస్తాయి.',
    },
    {
      nameTe: 'శని స్థితి & ఏలినాటి శని పరిశీలన (Shani & Sade Sati)',
      isPresent: [12, 1, 2, 8].includes(((saturn.d1Sign - moon.d1Sign + 12) % 12) + 1),
      statusTe: `జన్మ కుండలిలో శని ${TELUGU_RASIS[saturn.d1Sign].nameTe}లో (${saturn.house}వ భావంలో) స్థితి`,
      severityTe: 'నిర్దోషం / శుభం',
      explanationTe: `ఆయుష్కారకుడైన శని మీ జాతకంలో ${saturn.house}వ భావంలో ${saturnNakTe.nameTe} నక్షత్రంలో ఉన్నాడు. క్రమశిక్షణ, కఠిన పరిశ్రమ మరియు న్యాయబద్ధమైన జీవనం ద్వారా శని స్థిరమైన ఆస్తులను, దీర్ఘాయుష్షును ప్రసాదిస్తాడు.`,
      remedyTe: 'శనివారం నాడు శ్రీ వేంకటేశ్వర స్వామి లేదా మందపల్లి శనీశ్వర / ఆంజనేయ స్వామి దర్శనం, నువ్వుల నూనెతో దీపారాధన శుభప్రదం.',
    },
  ];

  // Current Vimshottari Dasha, Antardasha & Pratyantardasha Telugu Prediction
  const activeMaha = chart.dashas.find((d) => d.isCurrent) ?? chart.dashas[0];
  const activeAntar =
    activeMaha.antardashas.find((a) => a.isCurrent) ?? activeMaha.antardashas[0];
  const activePratyantar =
    activeAntar.pratyantardashas.find((pr) => pr.isCurrent) ?? activeAntar.pratyantardashas[0];

  const mahaMeta = TELUGU_PLANETS[activeMaha.lord] ?? TELUGU_PLANETS.Jupiter;
  const antarMeta = TELUGU_PLANETS[activeAntar.lord] ?? TELUGU_PLANETS.Mercury;
  const pratyantarMeta = TELUGU_PLANETS[activePratyantar.lord] ?? TELUGU_PLANETS.Venus;
  const mahaPlanet = chart.planets.find((p) => p.id === activeMaha.lord);
  const antarPlanet = chart.planets.find((p) => p.id === activeAntar.lord);

  const currentDashaPhalamTe = {
    mahadashaTe: `${mahaMeta.nameTe} మహాదశ (${activeMaha.years} సం.లు)`,
    antardashaTe: `${antarMeta.nameTe} అంతర్దశ (భుక్తి)`,
    pratyantardashaTe: `${pratyantarMeta.nameTe} ప్రత్యంతర్దశ (${activePratyantar.startDate} – ${activePratyantar.endDate})`,
    periodRange: `${activeAntar.startDate} నుండి ${activeAntar.endDate} వరకు`,
    phalamTe: `ప్రస్తుతం మీకు ${mahaMeta.nameTe} మహాదశలో ${antarMeta.nameTe} అంతర్దశ మరియు ${pratyantarMeta.nameTe} ప్రత్యంతర్దశ నడుస్తున్నది. మీ జాతకంలో దశానాథుడైన ${mahaMeta.nameTe} ${mahaPlanet?.house ?? 1}వ భావంలో (${TELUGU_RASIS[mahaPlanet?.d1Sign ?? 0].nameTe}) మరియు అంతర్దశానాథుడైన ${antarMeta.nameTe} ${antarPlanet?.house ?? 5}వ భావంలో (${TELUGU_RASIS[antarPlanet?.d1Sign ?? 0].nameTe}) సంచరిస్తున్నారు. ఈ కాలంలో ${mahaPlanet?.house ?? 1} మరియు ${antarPlanet?.house ?? 5} భావాలకు సంబంధించిన ఉద్యోగ, ఆర్థిక, కుటుంబ మరియు గృహ-వాహన ప్రయత్నాలు ఫలిస్తాయి. ముఖ్యమైన నిర్ణయాలలో గురు-పెద్దల సలహా తీసుకోవడం శ్రేయస్కరం.`,
    pariharamTe: `ఈ దశా కాలంలో శుభ ఫలితాల వృద్ధి కొరకు ${mahaMeta.devataTe} మరియు ${antarMeta.devataTe} ఆరాధన చేయడం, "${mahaMeta.mantramTe}" మంత్రాన్ని ప్రతిరోజూ 108 సార్లు పఠించడం మరియు ${mahaMeta.danamTe} దానం చేయడం విశేష ఫలితాన్ని ఇస్తుంది.`,
  };

  return {
    samvatsaramTe,
    ayanamTe,
    rituvuTe,
    masamTe,
    pakshamTe:
      chart.panchanga.tithi.paksha.startsWith('Shukla')
        ? 'శుక్ల పక్షం (పున్నమి వైపు)'
        : 'కృష్ణ పక్షం (అమావాస్య వైపు)',
    tithiTe: `${TITHI_TELUGU[(chart.panchanga.tithi.number - 1) % 30]} (${chart.panchanga.tithi.percentElapsed}% గడిచినది)`,
    vasaramTe: VARA_TELUGU[chart.panchanga.vara.name] ?? chart.panchanga.vara.name,
    yogamTe: YOGA_TELUGU_MAP[chart.panchanga.yoga.name] ?? `${chart.panchanga.yoga.name} యోగం`,
    karanamTe: KARANA_TELUGU_MAP[chart.panchanga.karana.name] ?? `${chart.panchanga.karana.name} కరణం`,
    suryodayamTe,
    suryastamayamTe,
    dinamanamTe,
    udayadiIshtaGhatikaluTe,
    nakshatraBhuktiSeshamTe,
    janmaNakshatramTe: nakTeInfo.nameTe,
    janmaPadam: pada,
    namaAksharamTe,
    allFourPadaAksharaluTe: nakTeInfo.padasTe.join(', '),
    janmaRasiTe: janmaRasiObj.nameTe,
    janmaRasiAdhipatiTe: janmaRasiObj.lordTe,
    janmaLagnamTe: lagnaRasiObj.nameTe,
    janmaLagnaAdhipatiTe: lagnaRasiObj.lordTe,
    navamsaLagnamTe: navamsaLagnaObj.nameTe,
    dasamsaLagnamTe: dasamsaLagnaObj.nameTe,
    ganaTe: nakTeInfo.ganaTe,
    yoniTe: nakTeInfo.yoniTe,
    nadiTe: nakTeInfo.nadiTe,
    rajjuTe: nakTeInfo.rajjuTe,
    dashaBalanceAtBirthTe,
    lagnaShastraPramanam,
    adrushtaVivaralu: {
      ratnamTe: lagnaLordMeta.ratnamTe,
      uparatnamTe: TELUGU_PLANETS[ZODIAC_SIGNS[moon.d1Sign].vedicRuler]?.ratnamTe ?? 'ముత్యం',
      bhagyaRatnamTe: bhagyaLordMeta.ratnamTe,
      wearingMethodTe: 'శుక్ల పక్షంలో శుభ ముహూర్తాన బంగారం/వెండి ఉంగరంలో కుడి చేతికి ధరించవలెను',
      luckyNumbers: luckyNumbersBySign[lagnaSignIdx],
      luckyDaysTe: luckyDaysBySign[lagnaSignIdx],
      luckyColorsTe: luckyColorsBySign[lagnaSignIdx],
      luckyDirectionTe: lagnaShastraRaw.directionTe,
      ishtaDevataTe: lagnaLordMeta.devataTe,
      mantramTe: lagnaLordMeta.mantramTe,
    },
    navagrahaDeepTable,
    jaiminiKarakas,
    arudhaPadas,
    shodashavargaTable,
    shadbalaTableTe,
    ashtakavargaTableTe,
    tarabalaChakraTe,
    granthaPramanaResearch,
    jeevitaPradhanaRangalu: jeevitaPradhanaRangalu.map((pillar) => {
      // స్కోరు/బ్యాడ్జ్/అనుకూల దశలు — చేతితో రాసిన స్థిరాంకాలు కాదు; కుండలి నుంచే.
      const spec = PILLAR_SPECS[pillar.id];
      if (!spec) return pillar;
      const computed = computePillarScore(chart, spec);
      const cautionTe =
        computed.band === 'misra'
          ? 'ఈ రంగంలో ప్రయత్నం + సమయం రెండూ అవసరం; ఫలితం క్రమంగా, కొంత ఆలస్యంతో వస్తుంది.'
          : computed.band === 'shraddha'
            ? 'ఈ రంగం బలహీనంగా ఉంది — శ్రద్ధ, క్రమశిక్షణ మరియు పరిహారం అవసరం. ఇక్కడ హామీ ఇవ్వడం తగదు.'
            : computed.band === 'durbala'
              ? 'ఈ రంగం దుర్బలం — ఊహించి చెప్పడం తగదు; పరిహారాలు మరియు నిపుణుల సలహా ముఖ్యం.'
              : '';
      // వివరణ పేరాలు — పరిశ్రమల జాబితాలు/వయస్సు బ్యాండ్లు/భాగస్వామి విశేషణాలు పోయాయి;
      // ఇప్పుడు ప్రతి వాక్యమూ 5వ/10వ/7వ అధిపతి స్థానం, రాశి దృష్టి, SAV, వర్గ లగ్నం, షడ్బల క్రమం నుంచి.
      const narrative = buildPillarNarrative(chart, pillar.id);
      return {
        ...pillar,
        scorePercent: computed.score,
        verdictBadgeTe: `${computed.bandTe} · ${computed.score}/100`,
        analysisParagraphsTe: [
          computed.leadTe,
          ...narrative.paragraphsTe,
          ...(cautionTe ? [cautionTe] : []),
          narrative.silenceTe,
          `గణన: ${computed.derivationTe}.`,
        ],
        favorablePeriodsTe: computed.favorableTe,
      };
    }),
    dwadashaBhavaPhalitalu,
    sampoornaDashaKalachakram,
    doshaParikshana,
    currentDashaPhalamTe,
  };
}

