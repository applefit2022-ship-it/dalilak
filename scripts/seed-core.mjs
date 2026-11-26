// Compact authoring format for seed content. `node scripts/build-seed.mjs` expands it into
//   src/data/seed.json  (bundled fallback when Supabase is not configured)
//   supabase/seed.sql   (idempotent SQL seed)
// ALL content is a best-effort draft and flagged needs_review = true. Fees/durations that are uncertain
// are written as "approximate / verify" on purpose. Always confirm on the official source.

export const DATE = '2026-11-24';
export const V_AR = '(تقريبي – يُرجى التأكد من الجهة الرسمية)';
export const V_EN = '(approximate – verify with the official source)';

export const L = {
  digital: ['بوابة مصر الرقمية', 'Digital Egypt portal', 'https://digital.gov.eg'],
  moi: ['وزارة الداخلية', 'Ministry of Interior', 'https://www.moi.gov.eg'],
  mod: ['وزارة الدفاع – التجنيد', 'Ministry of Defence – Recruitment', 'https://www.mod.gov.eg'],
  eta: ['مصلحة الضرائب المصرية', 'Egyptian Tax Authority', 'https://www.eta.gov.eg'],
  eehc: ['الشركة القابضة لكهرباء مصر', 'Egyptian Electricity Holding Company', 'https://www.eehc.gov.eg'],
  hcww: ['الشركة القابضة لمياه الشرب والصرف الصحي', 'Holding Company for Water & Wastewater', 'https://www.hcww.com.eg'],
  moj: ['وزارة العدل', 'Ministry of Justice', 'https://www.moj.gov.eg'],
  gafi: ['الهيئة العامة للاستثمار والمناطق الحرة', 'General Authority for Investment (GAFI)', 'https://www.gafi.gov.eg'],
  nosi: ['الهيئة القومية للتأمين الاجتماعي', 'National Organization for Social Insurance', 'https://www.nosi.gov.eg'],
  moh: ['وزارة الصحة والسكان', 'Ministry of Health and Population', 'https://www.mohp.gov.eg'],
  mfa: ['وزارة الخارجية', 'Ministry of Foreign Affairs', 'https://www.mfa.gov.eg'],
  moe: ['وزارة التربية والتعليم', 'Ministry of Education', 'https://moe.gov.eg'],
  mohe: ['وزارة التعليم العالي', 'Ministry of Higher Education', 'https://www.mohesr.gov.eg'],
  ntra: ['الجهاز القومي لتنظيم الاتصالات', 'National Telecom Regulatory Authority', 'https://www.tra.gov.eg'],
  emig: ['وزارة الهجرة وشؤون المصريين بالخارج', 'Ministry of Immigration & Egyptian Expatriates', 'https://www.emigration.gov.eg'],
  mhuc: ['وزارة الإسكان', 'Ministry of Housing', 'https://www.mhuc.gov.eg'],
  mlsa: ['الهيئة الوطنية للانتخابات', 'National Elections Authority', 'https://www.elections.eg'],
};

export const categories = [
  ['civil', 'id-card', 'الأحوال المدنية والبطاقات', 'Civil Status & IDs', 'البطاقة الشخصية وشهادات الميلاد والوفاة والزواج والطلاق وقيد الأسرة.', 'National ID, birth, death, marriage and divorce certificates, family registry.'],
  ['travel', 'passport', 'وثائق السفر', 'Travel Documents', 'استخراج وتجديد جواز السفر وبدل الفاقد والتالف.', 'Issue, renew or replace a lost or damaged passport.'],
  ['military', 'shield', 'التجنيد', 'Military Service', 'شهادات الموقف من التجنيد والإعفاء والتأجيل.', 'Status certificates, exemption and postponement.'],
  ['taxes', 'receipt', 'الضرائب', 'Taxes', 'البطاقة الضريبية والإقرارات وضريبة القيمة المضافة والعقارية.', 'Tax card, returns, VAT and real estate tax.'],
  ['utilities', 'bolt', 'المرافق', 'Utilities', 'كهرباء ومياه وغاز: توصيل جديد وتحويل عقود وأعطال العدادات.', 'Electricity, water and gas: new connections, contracts, meters.'],
  ['vehicles', 'car', 'المركبات والقيادة', 'Vehicles & Driving', 'رخص القيادة ورخص المركبات والمخالفات المرورية.', "Driver's and vehicle licences, traffic fines."],
  ['realestate', 'building', 'العقارات والتوثيق', 'Real Estate & Notary', 'التوكيلات وتسجيل العقارات والعقود.', 'Powers of attorney, property registration, contracts.'],
  ['education', 'graduation', 'التعليم والشهادات', 'Education & Certificates', 'معادلة واعتماد الشهادات.', 'Certificate equivalency and attestation.'],
  ['health', 'heart', 'الصحة والتأمينات والمعاشات', 'Health, Insurance & Pensions', 'التأمين الصحي والتأمينات الاجتماعية والمعاش.', 'Health cover, social insurance and pensions.'],
  ['business', 'briefcase', 'الأعمال والسجل التجاري', 'Business & Commercial Registry', 'السجل التجاري وتأسيس الشركات.', 'Commercial registry and company formation.'],
  ['police', 'badge', 'الفيش والتشبيه', 'Criminal Record / Police Clearance', 'صحيفة الحالة الجنائية للداخل والخارج.', 'Criminal record certificates for local and overseas use.'],
  ['courts', 'scale', 'المحاكم والمستندات القانونية', 'Courts & Legal Documents', 'إعلام الوراثة وصور الأحكام والمستندات القضائية.', 'Inheritance declarations and court documents.'],
  ['telecom', 'phone', 'الاتصالات', 'Telecom', 'الخطوط والتليفون الأرضي وبدل فاقد الشريحة.', 'Mobile lines, landlines and SIM replacement.'],
  ['local', 'map', 'الإدارة المحلية', 'Local Government', 'تراخيص المحلات والبناء عبر الحي أو المدينة.', 'Shop and building permits via the district or city.'],
  ['expat', 'globe', 'خدمات المصريين بالخارج', 'Expat Services', 'القنصليات والتصويت والتجنيد للمصريين بالخارج.', 'Consulates, voting, military service for Egyptians abroad.'],
].map(([slug, icon, ar, en, dAr, dEn], i) => ({ slug, icon, position: i + 1, title_ar: ar, title_en: en, desc_ar: dAr, desc_en: dEn }));

// helper: s(slug, cat, [titleAr,titleEn], [sumAr,sumEn], docs, steps, fees, dur, loc, links, tips, popular)
export const s = (slug, category, t, sum, docs, steps, fees, dur, loc, links, tips, popular = false) => ({
  slug, category,
  title_ar: t[0], title_en: t[1], summary_ar: sum[0], summary_en: sum[1],
  documents: docs.map(([ar, en, na = '', ne = '']) => ({ ar, en, note_ar: na, note_en: ne })),
  steps: steps.map(([ar, en, da = '', de = '']) => ({ ar, en, detail_ar: da, detail_en: de })),
  fees_ar: fees[0], fees_en: fees[1], duration_ar: dur[0], duration_en: dur[1],
  location_ar: loc[0], location_en: loc[1],
  links: links.map(([la, le, url]) => ({ label_ar: la, label_en: le, url })),
  tips_ar: tips[0], tips_en: tips[1],
  popular, published: true, needs_review: true, last_verified: DATE,
});

export const FEE_VERIFY = [`الرسوم ${V_AR}`, `Fees ${V_EN}`];
export const DUR_VERIFY = [`المدة ${V_AR}`, `Duration ${V_EN}`];
export const ORIG = ['أصل', 'Original'];
export const COPY = ['صورة', 'Copy'];
