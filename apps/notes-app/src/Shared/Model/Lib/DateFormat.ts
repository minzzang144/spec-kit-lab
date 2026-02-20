const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
};

const DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	...DATE_FORMAT_OPTIONS,
	hour: '2-digit',
	minute: '2-digit',
};

export function formatDate(isoString: string): string {
	const date = new Date(isoString);
	return date.toLocaleDateString('ko-KR', DATE_FORMAT_OPTIONS);
}

export function formatDateTime(isoString: string): string {
	const date = new Date(isoString);
	return date.toLocaleDateString('ko-KR', DATE_TIME_FORMAT_OPTIONS);
}

export function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMinute = Math.floor(diffMs / (1000 * 60));
	const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMinute < 1) return '방금 전';
	if (diffMinute < 60) return `${diffMinute}분 전`;
	if (diffHour < 24) return `${diffHour}시간 전`;
	if (diffDay < 7) return `${diffDay}일 전`;

	return formatDate(isoString);
}
