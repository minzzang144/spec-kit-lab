export function RecipeDetailLoading() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<div className="h-8 w-64 animate-pulse rounded bg-muted" />
				<div className="h-5 w-32 animate-pulse rounded-full bg-muted" />
			</div>
			<div className="space-y-1">
				<div className="h-4 w-full animate-pulse rounded bg-muted" />
				<div className="h-4 w-full animate-pulse rounded bg-muted" />
				<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
			</div>
			<div className="flex gap-3">
				<div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
				<div className="h-5 w-20 animate-pulse rounded bg-muted" />
			</div>
			<div className="space-y-2">
				<div className="h-6 w-20 animate-pulse rounded bg-muted" />
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className="h-10 w-full animate-pulse rounded-md bg-muted"
					/>
				))}
			</div>
		</div>
	);
}
