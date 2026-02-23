export type CreateNoteRequest = {
	readonly title: string;
	readonly content?: string;
	readonly categoryId?: string;
};

export type UpdateNoteRequest = {
	readonly title?: string;
	readonly content?: string;
	readonly categoryId?: string;
};
