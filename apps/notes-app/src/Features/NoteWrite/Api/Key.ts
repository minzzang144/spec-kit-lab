export const noteWriteMutationKey = {
	create: ['note', 'create'] as const,
	update: (id: string) => ['note', 'update', id] as const,
};
