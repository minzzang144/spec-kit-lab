import { httpClient } from '#/Shared/Api';

export async function deleteRecipe(id: string): Promise<void> {
	await httpClient.delete(`/recipes/${id}`);
}
