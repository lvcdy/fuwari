/**
 * Count words in a markdown string
 * @param markdown - Markdown content
 * @returns Number of words
 */
export function countWords(markdown: string): number {
	const cleaned = markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/[\r\n\t]+/g, " ");

	return cleaned.replace(/\s+/g, "").length;
}

/**
 * Format a number to a compact format
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatCompactNumber(num: number): string {
	if (num >= 10000) {
		const value = (num / 10000).toFixed(1).replace(/\.0$/, "");
		return `${value}w`;
	}

	return String(num);
}