export function RecipeDetailLoading() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8">
			<div className="mb-4 h-4 w-20 animate-pulse rounded bg-muted" />
			<div className="space-y-6">
				<div className="space-y-2">
					<div className="h-8 w-64 animate-pulse rounded bg-muted" />
					<div className="flex gap-3">
						<div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
						<div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
						<div className="h-5 w-20 animate-pulse rounded bg-muted" />
					</div>
				</div>
				<div className="space-y-1">
					<div className="h-4 w-full animate-pulse rounded bg-muted" />
					<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
				</div>
			</div>
		</div>
	);
}
