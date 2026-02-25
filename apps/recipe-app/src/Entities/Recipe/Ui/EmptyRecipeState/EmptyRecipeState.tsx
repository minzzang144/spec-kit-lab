type EmptyRecipeStateProps = {
	readonly message?: string;
};

export function EmptyRecipeState({
	message = '레시피가 없습니다.',
}: EmptyRecipeStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
			<p className="text-lg font-medium text-muted-foreground">
				{message}
			</p>
		</div>
	);
}
