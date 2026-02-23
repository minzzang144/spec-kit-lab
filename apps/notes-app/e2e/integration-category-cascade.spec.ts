import { test, expect } from '@playwright/test';

test.describe('E2E-INT-002: 카테고리 삭제 시 노트 미분류 이동', () => {
  test('카테고리 생성 → 노트 작성 → 카테고리 삭제 → 미분류 필터에서 노트 확인', async ({
    page,
  }) => {
    // 1. 카테고리 생성
    await page.goto('/categories');
    await page.getByLabel('새 카테고리 이름').fill('삭제될카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.locator('main').getByText('삭제될카테고리').first()).toBeVisible();

    // 2. 해당 카테고리로 노트 작성
    // page.goto()는 전체 리로드 → MSW DB 초기화됨
    // 소프트 내비게이션으로 MSW 상태 유지: /categories → / → /notes/new
    await page.getByRole('link', { name: '내 노트' }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.getByRole('link', { name: '새 노트 작성' }).click();
    await page.waitForURL('http://localhost:5173/notes/new');

    await page.getByLabel('제목').fill('카테고리삭제테스트 노트');

    // Radix Select: 트리거 클릭 후 portal에 option이 렌더링될 때까지 대기
    await page.getByLabel('카테고리 선택').click();
    await page.waitForSelector('[role="option"]', { timeout: 3000 });
    await page.locator('[role="option"]').filter({ hasText: '삭제될카테고리' }).click();
    // Radix Select는 option 선택 시 자동으로 드롭다운 닫힘
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: '작성' }).click();
    await expect(page).toHaveURL('/');

    // 3. 카테고리 삭제 (소프트 내비게이션)
    await page.getByRole('link', { name: '카테고리 관리' }).click();
    await page.waitForURL('http://localhost:5173/categories');

    const deleteButton = page
      .locator('li')
      .filter({ hasText: '삭제될카테고리' })
      .getByRole('button', { name: '삭제' });
    await deleteButton.click();
    await page.getByRole('button', { name: '삭제' }).last().click();

    await expect(page.locator('main').getByText('삭제될카테고리')).not.toBeVisible();

    // 4. 홈에서 미분류 필터 선택 → 이동된 노트 확인 (소프트 내비게이션)
    await page.getByRole('link', { name: '내 노트' }).click();
    await page.waitForURL('http://localhost:5173/');
    await expect(page.locator('main').getByRole('button', { name: '미분류' })).toBeVisible();
    await page.locator('main').getByRole('button', { name: '미분류' }).click();
    await expect(page.getByText('카테고리삭제테스트 노트')).toBeVisible();
  });
});
