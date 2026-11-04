export const BLOG_CATEGORIES = [
  'Web Development',
  'AI & Machine Learning',
  'Design',
  'Career',
  'Product',
  'Tutorial',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const COVER_THEMES = ['violet', 'sunset', 'ocean', 'forest', 'rose', 'mono'] as const;

export type CoverTheme = (typeof COVER_THEMES)[number];

export const COVER_THEME_LABELS: Record<CoverTheme, string> = {
  violet: 'Violet',
  sunset: 'Sunset',
  ocean: 'Ocean',
  forest: 'Forest',
  rose: 'Rose',
  mono: 'Mono',
};
