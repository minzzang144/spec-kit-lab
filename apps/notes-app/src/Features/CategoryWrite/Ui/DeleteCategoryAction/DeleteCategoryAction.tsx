import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '#/Shared/Ui';

import { useDeleteCategory } from '../../Model';

type DeleteCategoryActionProps = {
	categoryId: string;
	noteCount: number;
};

export function DeleteCategoryAction({
	categoryId,
	noteCount,
}: DeleteCategoryActionProps) {
	const deleteCategory = useDeleteCategory(categoryId);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="text-destructive hover:text-destructive"
				>
					삭제
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>카테고리 삭제</DialogTitle>
					<DialogDescription>
						{noteCount > 0
							? `이 카테고리에 속한 노트 ${noteCount}개가 "미분류"로 이동됩니다. 계속하시겠습니까?`
							: '이 카테고리를 삭제하시겠습니까?'}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">취소</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={() => deleteCategory.mutate()}
						disabled={deleteCategory.isPending}
					>
						{deleteCategory.isPending ? '삭제 중...' : '삭제'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
