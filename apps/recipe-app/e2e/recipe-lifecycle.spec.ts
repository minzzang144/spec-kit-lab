import { expect, test } from '@playwright/test';

test.describe('Full CRUD Lifecycle', () => {
	test('create → list → detail → edit → verify → delete → verify removal', async ({
		page,
	}) => {
		// 1. Create a recipe
		await page.goto('/recipes/new');
		await page.getByLabel('제목').fill('Lifecycle Test Recipe');
		await page.getByLabel('설명').fill('Testing full CRUD lifecycle');
		await page.getByLabel('카테고리').selectOption('cat-snack');
		await page.getByLabel('조리 시간 (분)').fill('10');
		await page.getByLabel('난이도').selectOption('Easy');
		await page.getByPlaceholder('재료명').fill('Test Item');
		await page.getByPlaceholder('양').fill('1');
		await page.getByRole('button', { name: '생성' }).click();

		// 2. Verify detail page
		await expect(page.getByText('Lifecycle Test Recipe')).toBeVisible();
		await expect(page.getByText('Testing full CRUD lifecycle')).toBeVisible();
		const detailUrl = page.url();
		const recipeId = detailUrl.match(/\/recipes\/(recipe-\d+)/)?.[1];
		expect(recipeId).toBeTruthy();

		// 3. Navigate to list and verify it appears
		await page.getByText('← 목록으로').click();
		await expect(page.getByText('Lifecycle Test Recipe')).toBeVisible();

		// 4. Go back to detail and edit
		await page.getByText('Lifecycle Test Recipe').click();
		await page.getByText('수정').click();
		await expect(page.getByLabel('제목')).toHaveValue('Lifecycle Test Recipe');
		await page.getByLabel('제목').fill('Updated Lifecycle Recipe');
		await page.getByRole('button', { name: '수정' }).click();

		// 5. Verify update
		await expect(page.getByText('Updated Lifecycle Recipe')).toBeVisible();

		// 6. Delete
		await page.getByRole('button', { name: '삭제' }).click();
		await page.getByRole('button', { name: '삭제' }).nth(1).click();

		// 7. Verify redirect to list and removal
		await expect(page).toHaveURL(/\/recipes/);
		await expect(page.getByText('Updated Lifecycle Recipe')).not.toBeVisible();
	});
});
