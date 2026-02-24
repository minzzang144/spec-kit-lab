import { expect, test } from '@playwright/test';

test.describe('US4: Delete Recipe', () => {
	test('should show delete button on detail page', async ({ page }) => {
		await page.goto('/recipes/recipe-1');
		await expect(page.getByRole('button', { name: '삭제' })).toBeVisible();
	});

	test('should open confirmation dialog', async ({ page }) => {
		await page.goto('/recipes/recipe-1');
		await page.getByRole('button', { name: '삭제' }).click();
		await expect(page.getByText('레시피를 삭제할까요?')).toBeVisible();
		await expect(page.getByText('이 작업은 되돌릴 수 없습니다.')).toBeVisible();
	});

	test('should cancel deletion', async ({ page }) => {
		await page.goto('/recipes/recipe-1');
		await page.getByRole('button', { name: '삭제' }).click();
		await page.getByRole('button', { name: '취소' }).click();
		await expect(page.getByText('레시피를 삭제할까요?')).not.toBeVisible();
		await expect(page.getByRole('heading', { name: 'Fluffy Pancakes' })).toBeVisible();
	});
});
