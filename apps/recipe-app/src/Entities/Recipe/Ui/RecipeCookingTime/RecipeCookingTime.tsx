type RecipeCookingTimeProps = {
	readonly minutes: number;
};

function formatCookingTime(minutes: number): string {
	if (minutes < 60) {
		return `${minutes}분`;
	}
	const hours = Math.floor(minutes / 60);
	const remaining = minutes % 60;
	return remaining > 0 ? `${hours}시간 ${remaining}분` : `${hours}시간`;
}

export function RecipeCookingTime({ minutes }: RecipeCookingTimeProps) {
	return (
		<span className="text-sm text-muted-foreground">
			⏱ {formatCookingTime(minutes)}
		</span>
	);
}
