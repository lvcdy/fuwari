/**
 * Count words in a markdown string
 * For Chinese: counts characters (including Chinese punctuation)
 * For English: counts words (separated by whitespace/punctuation)
 * For mixed content: sums both
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

	// Count Chinese characters (including Chinese punctuation)
	const chineseChars = cleaned.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g);
	const chineseCount = chineseChars ? chineseChars.length : 0;

	// Count English words (sequences of Latin letters)
	const englishWords = cleaned.match(/[a-zA-Z]+/g);
	const englishCount = englishWords ? englishWords.length : 0;

	return chineseCount + englishCount;
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
