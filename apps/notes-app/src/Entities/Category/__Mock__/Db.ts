import { getNoteList } from '#/Entities/Note/__Mock__';

import type { Category } from '../Type/Category';

import { INITIAL_CATEGORY_LIST } from './Seed';

let categoryList: Category[] = [...INITIAL_CATEGORY_LIST];
let nextCategoryId = 1;

export function getCategoryList(): Category[] {
	return categoryList;
}

export function addCategory(name: string): Category {
	const newCategory: Category = {
		id: `cat-custom-${nextCategoryId++}`,
		name,
		isDefault: false,
	};
	categoryList.push(newCategory);
	return newCategory;
}

export function deleteCategory(id: string): {
	deleted: boolean;
	movedCount: number;
} {
	const category = categoryList.find((c) => c.id === id);
	if (!category) return { deleted: false, movedCount: 0 };

	const noteList = getNoteList();
	let movedCount = 0;
	for (let i = 0; i < noteList.length; i++) {
		if (noteList[i].categoryId === id) {
			noteList[i] = { ...noteList[i], categoryId: 'uncategorized' };
			movedCount++;
		}
	}

	categoryList = categoryList.filter((c) => c.id !== id);
	return { deleted: true, movedCount };
}

export function resetCategoryDb(): void {
	categoryList = [...INITIAL_CATEGORY_LIST];
	nextCategoryId = 1;
}
