// Data contract between the landing page's data layer (page.tsx → getLandingData)
// and its presentational sections. A returned design restyles the sections; it
// keeps consuming exactly these shapes.

export interface CategoryChip {
  slug: string;
  // Localized category name (aliased onto name_de by the serving query).
  name_de: string;
  icon: string;
  // Approved (and, for non-de locales, translated) question count.
  question_count: number;
}

export interface SampleQuestion {
  text_de: string;
  answer_de: string;
  fun_fact_de: string | null;
  category_name_de: string;
  category_icon: string;
  category_slug: string;
}
