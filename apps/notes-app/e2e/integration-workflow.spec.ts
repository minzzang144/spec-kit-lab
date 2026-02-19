import { test, expect } from '@playwright/test';

test.describe('E2E-INT-001: 전체 CRUD 워크플로우', () => {
  test('카테고리 생성 → 노트 작성 → 노트 편집 → 검색 → 삭제', async ({ page }) => {
    // 1. 카테고리 생성
    await page.goto('/categories');
    await page.getByLabel('새 카테고리 이름').fill('통합테스트');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.getByText('통합테스트')).toBeVisible();

    // 2. 해당 카테고리로 노트 작성
    await page.goto('/notes/new');
    await page.getByLabel('제목').fill('통합테스트 노트');
    await page.getByLabel('내용').fill('통합테스트 노트 내용입니다');
    await page.getByRole('combobox').selectOption({ label: '통합테스트' });
    await page.getByRole('button', { name: '작성' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('통합테스트 노트')).toBeVisible();

    // 3. 노트 편집
    await page.getByText('통합테스트 노트').click();
    await page.getByRole('button', { name: '편집' }).click();
    await page.getByLabel('제목').fill('통합테스트 노트 수정됨');
    await page.getByRole('button', { name: '저장' }).click();

    await expect(page.getByText('통합테스트 노트 수정됨')).toBeVisible();

    // 4. 검색으로 노트 찾기
    await page.goto('/');
    await page.getByPlaceholder('노트 검색...').fill('통합테스트');
    await page.waitForTimeout(400);
    await expect(page.getByText('통합테스트 노트 수정됨')).toBeVisible();

    // 5. 노트 삭제
    await page.getByText('통합테스트 노트 수정됨').click();
    await page.getByRole('button', { name: '삭제' }).click();
    await page.getByRole('button', { name: '삭제' }).last().click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('통합테스트 노트 수정됨')).not.toBeVisible();
  });
});
