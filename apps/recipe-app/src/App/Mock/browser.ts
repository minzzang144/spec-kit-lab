import { setupWorker } from 'msw/browser';

// Entity handlers (GET)
import { categoryEntityHandler } from '#/Entities/Category/__Mock__';
import { recipeEntityHandler } from '#/Entities/Recipe/__Mock__';

export const worker = setupWorker(
	// Entity (읽기)
	...categoryEntityHandler,
	...recipeEntityHandler,
);
