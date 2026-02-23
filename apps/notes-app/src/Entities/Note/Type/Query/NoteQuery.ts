export type GetNoteListQuery = {
	readonly categoryId?: string;
	readonly keyword?: string;
	readonly sort?: 'createdAt_desc' | 'createdAt_asc';
};
