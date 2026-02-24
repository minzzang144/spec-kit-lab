import { expect, test } from '@playwright/test';

test.describe('US3: Create and Edit Recipe', () => {
	test('should navigate to create form', async ({ page }) => {
		await page.goto('/recipes/new');
		await expect(page.getByRole('heading', { name: '새 레시피' })).toBeVisible();
	});

	test('should show validation errors for empty form', async ({ page }) => {
		await page.goto('/recipes/new');
		await page.getByRole('button', { name: '생성' }).click();
		await expect(page.getByText('제목을 입력하세요')).toBeVisible();
	});

	test('should add and remove ingredient rows', async ({ page }) => {
		await page.goto('/recipes/new');
		const initialIngredientCount = await page.getByPlaceholder('재료명').count();
		expect(initialIngredientCount).toBe(1);

		await page.getByText('+ 재료 추가').click();
		const afterAddCount = await page.getByPlaceholder('재료명').count();
		expect(afterAddCount).toBe(2);

		await page.getByText('삭제').first().click();
		const afterRemoveCount = await page.getByPlaceholder('재료명').count();
		expect(afterRemoveCount).toBe(1);
	});

	test('should create a recipe successfully', async ({ page }) => {
		await page.goto('/recipes/new');

		await page.getByLabel('제목').fill('E2E Test Recipe');
		await page.getByLabel('설명').fill('Created via E2E test');
		await page.getByLabel('카테고리').selectOption('cat-lunch');
		await page.getByLabel('조리 시간 (분)').fill('15');
		await page.getByLabel('난이도').selectOption('Easy');

		await page.getByPlaceholder('재료명').fill('Test Ingredient');
		await page.getByPlaceholder('양').fill('100');

		await page.getByRole('button', { name: '생성' }).click();

		await expect(page).toHaveURL(/\/recipes\/recipe-/);
		await expect(page.getByText('E2E Test Recipe')).toBeVisible();
	});

	test('should pre-fill form in edit mode', async ({ page }) => {
		await page.goto('/recipes/recipe-1/edit');
		await expect(page.getByRole('heading', { name: '레시피 수정' })).toBeVisible();
		await expect(page.getByLabel('제목')).toHaveValue('Fluffy Pancakes');
	});
});
