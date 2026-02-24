import { create } from 'zustand';

type CategoryFilterStoreState = {
	selectedCategoryId: string | null;
	setSelectedCategoryId: (categoryId: string | null) => void;
};

export const useCategoryFilterStore = create<CategoryFilterStoreState>()(
	(set) => ({
		selectedCategoryId: null,
		setSelectedCategoryId: (categoryId) =>
			set({ selectedCategoryId: categoryId }),
	}),
);
