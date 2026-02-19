export const categoryWriteMutationKey = {
  create: ['category', 'create'] as const,
  delete: (id: string) => ['category', 'delete', id] as const,
};
