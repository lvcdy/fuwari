export type ArchiveFilters = {
	tags: string[];
	categories: string[];
	uncategorized: boolean;
};

export type ArchivePost = {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string | null;
		published: Date;
	};
};

export type ArchiveGroup = {
	year: number;
	posts: ArchivePost[];
};

export function filterArchivePosts(
	posts: ArchivePost[],
	filters: ArchiveFilters,
) {
	let filteredPosts = posts;

	if (filters.tags.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				Array.isArray(post.data.tags) &&
				post.data.tags.some((tag) => filters.tags.includes(tag)),
		);
	}

	if (filters.categories.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				post.data.category && filters.categories.includes(post.data.category),
		);
	}

	if (filters.uncategorized) {
		filteredPosts = filteredPosts.filter((post) => !post.data.category);
	}

	return filteredPosts;
}

export function groupArchivePosts(posts: ArchivePost[]): ArchiveGroup[] {
	const grouped = posts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, ArchivePost[]>,
	);

	return Object.keys(grouped)
		.map((yearStr) => {
			const year = Number.parseInt(yearStr, 10);
			return {
				year,
				posts: grouped[year],
			};
		})
		.sort((a, b) => b.year - a.year);
}

export function formatArchiveDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

export function formatArchiveTags(tagList: string[]) {
	return tagList.map((tag) => `#${tag}`).join(" ");
}
