import type { Difficulty } from '../../Type';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; className: string }> = {
	Easy: { label: 'Easy', className: 'bg-green-100 text-green-700' },
	Medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
	Hard: { label: 'Hard', className: 'bg-red-100 text-red-700' },
};

type RecipeDifficultyProps = {
	readonly difficulty: Difficulty;
};

export function RecipeDifficulty({ difficulty }: RecipeDifficultyProps) {
	const config = DIFFICULTY_CONFIG[difficulty];

	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
		>
			{config.label}
		</span>
	);
}
