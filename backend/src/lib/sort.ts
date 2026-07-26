const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  'price-asc': { minPrice: 1 },
  'price-desc': { minPrice: -1 },
  rating: { rating: -1, ratingCount: -1 },
} as const;

type SortKey = keyof typeof SORT_OPTIONS;

const DEFAULT_SORT: SortKey = 'newest';

const parseSort = (sort: unknown): Record<string, 1 | -1> => {
  if (typeof sort !== 'string') return SORT_OPTIONS[DEFAULT_SORT];
  if (!(sort in SORT_OPTIONS)) return SORT_OPTIONS[DEFAULT_SORT];

  return SORT_OPTIONS[sort as SortKey];
};

export default parseSort;
