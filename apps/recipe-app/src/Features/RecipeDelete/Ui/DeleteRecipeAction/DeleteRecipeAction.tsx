import { useState } from 'react';

import { useDeleteRecipe } from '../../Model';

type DeleteRecipeActionProps = {
	readonly recipeId: string;
};

export function DeleteRecipeAction({ recipeId }: DeleteRecipeActionProps) {
	const [isOpen, setIsOpen] = useState(false);
	const deleteMutation = useDeleteRecipe(recipeId);

	function handleDelete() {
		deleteMutation.mutate(undefined, {
			onSettled: () => setIsOpen(false),
		});
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
			>
				삭제
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
						<h2 className="text-lg font-semibold">
							레시피를 삭제할까요?
						</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							이 작업은 되돌릴 수 없습니다.
						</p>
						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="rounded-md border px-4 py-2 text-sm"
							>
								취소
							</button>
							<button
								type="button"
								onClick={handleDelete}
								disabled={deleteMutation.isPending}
								className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
							>
								{deleteMutation.isPending
									? '삭제 중...'
									: '삭제'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
