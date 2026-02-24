import type { StateCreator } from 'zustand';

export type FilterSlice = {
	selectedCategoryId: string | null;
};

export const createFilterSlice: StateCreator<FilterSlice> = () => ({
	selectedCategoryId: null,
});
