import { test, expect } from '@playwright/test'

test.describe('US2: 할 일 완료 표시하기', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and add a test todo
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Add a todo for testing
    await page.getByPlaceholder('할 일을 입력하세요').fill('테스트 할 일')
    await page.getByRole('button', { name: '추가' }).click()
    await expect(page.getByText('테스트 할 일')).toBeVisible()
  })

  test('미완료 항목을 클릭하면 완료 상태로 변경되고 취소선이 표시된다', async ({
    page,
  }) => {
    // Given: 미완료 상태의 할 일 항목
    const checkbox = page.getByRole('checkbox', { name: '테스트 할 일' })
    await expect(checkbox).not.toBeChecked()

    const label = page.getByText('테스트 할 일')
    await expect(label).not.toHaveClass(/line-through/)

    // When: 체크박스 클릭
    await checkbox.click()

    // Then: 완료 상태로 변경되고 취소선 표시
    await expect(checkbox).toBeChecked()
    await expect(label).toHaveClass(/line-through/)
  })

  test('완료 항목을 다시 클릭하면 미완료 상태로 되돌아간다', async ({ page }) => {
    // Given: 완료 상태로 변경
    const checkbox = page.getByRole('checkbox', { name: '테스트 할 일' })
    await checkbox.click()
    await expect(checkbox).toBeChecked()

    // When: 다시 클릭
    await checkbox.click()

    // Then: 미완료 상태로 되돌아감
    await expect(checkbox).not.toBeChecked()
    const label = page.getByText('테스트 할 일')
    await expect(label).not.toHaveClass(/line-through/)
  })

  test('완료 상태가 새로고침 후에도 유지된다', async ({ page }) => {
    // Given: 완료 상태로 변경
    const checkbox = page.getByRole('checkbox', { name: '테스트 할 일' })
    await checkbox.click()
    await expect(checkbox).toBeChecked()

    // When: 페이지 새로고침
    await page.reload()

    // Then: 완료 상태가 유지됨
    const reloadedCheckbox = page.getByRole('checkbox', { name: '테스트 할 일' })
    await expect(reloadedCheckbox).toBeChecked()
    const label = page.getByText('테스트 할 일')
    await expect(label).toHaveClass(/line-through/)
  })

  test('라벨을 클릭해도 토글이 된다', async ({ page }) => {
    // Given: 미완료 상태
    const checkbox = page.getByRole('checkbox', { name: '테스트 할 일' })
    await expect(checkbox).not.toBeChecked()

    // When: 라벨 클릭 (label의 for 속성으로 연결됨)
    await page.getByText('테스트 할 일').click()

    // Then: 완료 상태로 변경
    await expect(checkbox).toBeChecked()
  })
})
