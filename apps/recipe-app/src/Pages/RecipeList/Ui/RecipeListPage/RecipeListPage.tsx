import { CategoryFilterBar } from '#/Features/CategoryFilter';

import { RecipeList } from '#/Widgets/RecipeList';

export function RecipeListPage() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<h1 className="mb-6 text-2xl font-bold">레시피 북</h1>
			<div className="mb-6">
				<CategoryFilterBar />
			</div>
			<RecipeList />
		</div>
	);
}
