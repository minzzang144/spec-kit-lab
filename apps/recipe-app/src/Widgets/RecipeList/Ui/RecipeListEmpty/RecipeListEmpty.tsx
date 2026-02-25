import { Link } from 'react-router';

import { EmptyRecipeState } from '#/Entities/Recipe';
import { ROUTES } from '#/Shared/Config';

export function RecipeListEmpty() {
	return (
		<div className="flex flex-col items-center gap-4">
			<EmptyRecipeState message="아직 등록된 레시피가 없습니다." />
			<Link
				to={ROUTES.RECIPE_NEW}
				className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				첫 번째 레시피 만들기
			</Link>
		</div>
	);
}
