import type { Category } from '../Type';

export const DEFAULT_CATEGORY_LIST: readonly Category[] = [
	{ id: 'all', name: '전체', isDefault: true },
	{ id: 'uncategorized', name: '미분류', isDefault: true },
] as const;

export const ALL_CATEGORY_ID = 'all';
export const UNCATEGORIZED_CATEGORY_ID = 'uncategorized';
