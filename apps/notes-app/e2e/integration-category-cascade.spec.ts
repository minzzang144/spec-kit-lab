import { test, expect } from '@playwright/test';

test.describe('E2E-INT-002: 카테고리 삭제 시 노트 미분류 이동', () => {
  test('카테고리 생성 → 노트 작성 → 카테고리 삭제 → 미분류 필터에서 노트 확인', async ({
    page,
  }) => {
    // 1. 카테고리 생성
    await page.goto('/categories');
    await page.getByLabel('새 카테고리 이름').fill('삭제될카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.getByText('삭제될카테고리')).toBeVisible();

    // 2. 해당 카테고리로 노트 작성
    await page.goto('/notes/new');
    await page.getByLabel('제목').fill('카테고리삭제테스트 노트');
    await page.getByRole('combobox').selectOption({ label: '삭제될카테고리' });
    await page.getByRole('button', { name: '작성' }).click();
    await expect(page).toHaveURL('/');

    // 3. 카테고리 삭제
    await page.goto('/categories');
    const deleteButton = page
      .locator('li')
      .filter({ hasText: '삭제될카테고리' })
      .getByRole('button', { name: '삭제' });
    await deleteButton.click();
    await page.getByRole('button', { name: '삭제' }).last().click();

    await expect(page.getByText('삭제될카테고리')).not.toBeVisible();

    // 4. 홈에서 미분류 필터 선택 → 이동된 노트 확인
    await page.goto('/');
    await page.getByRole('button', { name: '미분류' }).click();
    await expect(page.getByText('카테고리삭제테스트 노트')).toBeVisible();
  });
});
