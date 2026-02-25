import { expect, test } from '@playwright/test';

test.describe('US2: Recipe Detail View', () => {
	test('should navigate to detail from list', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: /Fluffy Pancakes/ }).click();
		await expect(page).toHaveURL(/\/recipes\/recipe-1/);
		await expect(
			page.getByRole('heading', { name: 'Fluffy Pancakes' }),
		).toBeVisible();
	});

	test('should display all recipe details', async ({ page }) => {
		await page.goto('/recipes/recipe-1');
		await expect(
			page.getByRole('heading', { name: 'Fluffy Pancakes' }),
		).toBeVisible();
		await expect(page.getByText('Easy')).toBeVisible();
		await expect(page.getByText('⏱ 20분')).toBeVisible();
		await expect(page.getByText('Breakfast', { exact: true })).toBeVisible({
			timeout: 10000,
		});
	});

	test('should display ingredient list', async ({ page }) => {
		await page.goto('/recipes/recipe-1');
		await expect(page.getByText('재료')).toBeVisible();
		await expect(page.getByText('Flour')).toBeVisible();
		await expect(page.getByText('200 g')).toBeVisible();
	});

	test('should navigate back to list', async ({ page }) => {
		await page.goto('/recipes/recipe-1');
		await page.getByText('← 목록으로').click();
		await expect(page).toHaveURL(/\/recipes/);
	});

	test('should show 404 for invalid recipe ID', async ({ page }) => {
		await page.goto('/recipes/non-existent');
		await expect(page.getByText('레시피를 찾을 수 없습니다')).toBeVisible();
	});
});
