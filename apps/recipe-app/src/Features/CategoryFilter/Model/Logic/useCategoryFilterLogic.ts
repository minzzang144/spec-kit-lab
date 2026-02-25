import { useCategoryStore } from '#/Entities/Category';

export function useCategoryFilterLogic() {
	function setSelectedCategoryId(categoryId: string | null) {
		useCategoryStore.setState({ selectedCategoryId: categoryId });
	}

	return { setSelectedCategoryId };
}
