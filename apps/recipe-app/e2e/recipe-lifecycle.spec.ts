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
		await page.locator('input[name*="ingredientList"][name*="name"]').fill('Test Item');
		await page.locator('input[name*="ingredientList"][name*="amount"]').fill('1');
		await page.getByRole('button', { name: '생성' }).click();

		// 2. Verify detail page
		await expect(page.getByRole('heading', { name: 'Lifecycle Test Recipe' })).toBeVisible();

		// 3. Navigate to list and verify
		await page.getByText('← 목록으로').click();
		await expect(page.getByRole('link', { name: /Lifecycle Test Recipe/ })).toBeVisible();

		// 4. Go back to detail and edit
		await page.getByRole('link', { name: /Lifecycle Test Recipe/ }).click();
		await page.getByRole('link', { name: '수정' }).click();
		await expect(page.getByLabel('제목')).toHaveValue('Lifecycle Test Recipe');
		await page.getByLabel('제목').fill('Updated Lifecycle Recipe');
		await page.getByRole('button', { name: '수정' }).click();

		// 5. Verify update
		await expect(page.getByRole('heading', { name: 'Updated Lifecycle Recipe' })).toBeVisible();

		// 6. Delete
		await page.getByRole('button', { name: '삭제' }).click();
		await page.getByText('레시피를 삭제할까요?').waitFor();
		await page.locator('button:has-text("삭제"):not(:has-text("취소"))').last().click();

		// 7. Verify redirect to list and removal
		await expect(page).toHaveURL(/\/recipes/);
		await expect(page.getByRole('link', { name: /Updated Lifecycle Recipe/ })).not.toBeVisible();
	});
});
