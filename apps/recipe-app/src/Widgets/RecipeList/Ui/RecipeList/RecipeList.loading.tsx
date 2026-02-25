export function RecipeListLoading() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<div
					key={i}
					className="rounded-lg border bg-card p-4"
				>
					<div className="flex items-start justify-between gap-2">
						<div className="h-5 w-40 animate-pulse rounded bg-muted" />
						<div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
					</div>
					<div className="mt-2 space-y-1">
						<div className="h-4 w-full animate-pulse rounded bg-muted" />
						<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
					</div>
					<div className="mt-3 flex items-center gap-3">
						<div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
						<div className="h-4 w-16 animate-pulse rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}
