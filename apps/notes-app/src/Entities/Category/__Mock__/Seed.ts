import type { Category } from '../Type';

export const INITIAL_CATEGORY_LIST: Category[] = [
	{ id: 'uncategorized', name: '미분류', isDefault: true },
	{ id: 'cat-1', name: '업무', isDefault: false },
	{ id: 'cat-2', name: '학습', isDefault: false },
	{ id: 'cat-3', name: '개인', isDefault: false },
];
