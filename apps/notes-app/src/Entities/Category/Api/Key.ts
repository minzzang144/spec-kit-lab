export const categoryQueryKey = {
	all: ['category'] as const,
	list: () => [...categoryQueryKey.all, 'list'] as const,
};
