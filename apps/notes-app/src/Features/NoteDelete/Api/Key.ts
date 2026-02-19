export const noteDeleteMutationKey = {
  delete: (id: string) => ['note', 'delete', id] as const,
};
