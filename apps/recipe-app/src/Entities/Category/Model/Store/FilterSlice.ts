import type { StateCreator } from 'zustand';

export type FilterSlice = {
	selectedCategoryId: string | null;
	setSelectedCategoryId: (categoryId: string | null) => void;
};

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
	selectedCategoryId: null,
	setSelectedCategoryId: (categoryId) =>
		set({ selectedCategoryId: categoryId }),
});
