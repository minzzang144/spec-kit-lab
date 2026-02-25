import { setupWorker } from 'msw/browser';

// Entity handlers (GET)
import { categoryEntityHandler } from '#/Entities/Category/__Mock__';
import { recipeEntityHandler } from '#/Entities/Recipe/__Mock__';

// Feature handlers (POST/PUT/DELETE)
import { recipeDeleteFeatureHandler } from '#/Features/RecipeDelete/__Mock__';
import { recipeWriteFeatureHandler } from '#/Features/RecipeWrite/__Mock__';

export const worker = setupWorker(
	// Entity (읽기)
	...categoryEntityHandler,
	...recipeEntityHandler,
	// Feature (쓰기)
	...recipeDeleteFeatureHandler,
	...recipeWriteFeatureHandler,
);
