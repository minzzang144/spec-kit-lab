export const noteQueryKey = {
	all: ['note'] as const,
	list: (param?: { categoryId?: string; keyword?: string; sort?: string }) =>
		[...noteQueryKey.all, 'list', param] as const,
	detail: (id: string) => [...noteQueryKey.all, 'detail', id] as const,
};
