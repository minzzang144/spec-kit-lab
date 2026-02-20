import { Badge } from '#/Shared/Ui';

type CategoryBadgeProps = {
	name: string;
};

export function CategoryBadge({ name }: CategoryBadgeProps) {
	return (
		<Badge variant="secondary" className="text-xs font-normal">
			{name}
		</Badge>
	);
}
