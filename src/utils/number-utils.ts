export function formatStatCount(value: number, locale = "zh-CN") {
	return new Intl.NumberFormat(locale).format(value);
}
