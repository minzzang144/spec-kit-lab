import { useCategoryStore } from '#/Entities/Category';

export function useCategoryFilterLogic() {
	function setSelectedCategoryId(id: string) {
		useCategoryStore.setState({ selectedCategoryId: id });
	}

	return { setSelectedCategoryId };
}
