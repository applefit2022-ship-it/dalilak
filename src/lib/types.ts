export type Lang = 'ar' | 'en';

export interface Category {
  id: string;
  slug: string;
  icon: string;
  position: number;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

export interface DocItem { ar: string; en: string; note_ar: string; note_en: string }
export interface StepItem { ar: string; en: string; detail_ar: string; detail_en: string }
export interface LinkItem { label_ar: string; label_en: string; url: string }

export interface Service {
  id: string;
  slug: string;
  category_id: string;
  category: string; // category slug
  title_ar: string;
  title_en: string;
  summary_ar: string;
  summary_en: string;
  documents: DocItem[];
  steps: StepItem[];
  fees_ar: string;
  fees_en: string;
  duration_ar: string;
  duration_en: string;
  location_ar: string;
  location_en: string;
  links: LinkItem[];
  tips_ar: string;
  tips_en: string;
  popular: boolean;
  published: boolean;
  needs_review: boolean;
  last_verified: string | null;
  updated_at?: string;
}

export interface Catalog { categories: Category[]; services: Service[]; source: 'supabase' | 'seed' }

/** Pick the localized field: pick(obj, 'title', lang) -> obj.title_ar | obj.title_en */
export function pick<T extends object>(o: T, key: string, lang: Lang): string {
  const v = (o as Record<string, unknown>)[`${key}_${lang}`];
  return typeof v === 'string' ? v : '';
}
