import { httpClient } from '#/Shared/Api';

export async function deleteCategory(id: string): Promise<void> {
	await httpClient.delete<void>(`/categories/${id}`);
}
