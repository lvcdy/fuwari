import { umamiConfig } from "@/config";

type SharePayload = {
	websiteId: string;
	token: string;
};

export type UmamiStats = {
	pageviews: number;
	visitors: number;
	visits: number;
	bounces: number;
	totaltime: number;
};

const DEFAULT_RETRIES = 3;

function getBaseUrl() {
	return umamiConfig.baseUrl.replace(/\/+$/, "");
}

function getShareSlug() {
	if (umamiConfig.shareSlug?.trim()) {
		return umamiConfig.shareSlug.trim();
	}

	if (umamiConfig.shareId && !/^[0-9a-f-]{36}$/i.test(umamiConfig.shareId)) {
		return umamiConfig.shareId;
	}

	return "";
}

function toNumber(value: unknown) {
	const numeric =
		typeof value === "string" ? Number.parseInt(value, 10) : Number(value);

	return Number.isFinite(numeric) ? numeric : 0;
}

function normalizePath(path: string) {
	let normalizedPath = path;

	try {
		if (
			normalizedPath.startsWith("http://") ||
			normalizedPath.startsWith("https://")
		) {
			const url = new URL(normalizedPath);
			normalizedPath = url.pathname;
		}
	} catch {
		// Use the original value if URL parsing fails.
	}

	if (!normalizedPath.startsWith("/")) {
		normalizedPath = `/${normalizedPath}`;
	}

	return normalizedPath;
}

async function fetchJsonWithRetry<T>(
	url: string,
	init: RequestInit,
	retries = DEFAULT_RETRIES,
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 0; attempt < retries; attempt++) {
		try {
			const response = await fetch(url, {
				...init,
				headers: {
					accept: "application/json",
					...init.headers,
				},
				signal: AbortSignal.timeout(6000),
			});

			if (!response.ok) {
				throw new Error(`Umami request failed (${response.status})`);
			}

			return (await response.json()) as T;
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError instanceof Error
		? lastError
		: new Error("Failed to fetch Umami data");
}

async function getSharePayload(): Promise<SharePayload> {
	const shareSlug = getShareSlug();

	if (!shareSlug) {
		throw new Error("Missing umamiConfig.shareSlug");
	}

	const payload = await fetchJsonWithRetry<Partial<SharePayload>>(
		`${getBaseUrl()}/api/share/${encodeURIComponent(shareSlug)}`,
		{
			method: "GET",
			headers: {
				"user-agent": "fuwari-stats-client",
			},
		},
	);

	if (!payload.websiteId || !payload.token) {
		throw new Error("Invalid share payload from Umami");
	}

	return {
		websiteId: payload.websiteId,
		token: payload.token,
	};
}

async function queryStats(path?: string): Promise<UmamiStats> {
	const { websiteId, token } = await getSharePayload();

	const search = new URLSearchParams({
		startAt: "0",
		endAt: String(Date.now()),
		timezone: umamiConfig.timezone,
	});

	if (path) {
		search.set("path", normalizePath(path));
	}

	const payload = await fetchJsonWithRetry<Partial<UmamiStats>>(
		`${getBaseUrl()}/api/websites/${websiteId}/stats?${search.toString()}`,
		{
			method: "GET",
			headers: {
				"x-umami-share-token": token,
			},
		},
	);

	return {
		pageviews: toNumber(payload.pageviews),
		visitors: toNumber(payload.visitors),
		visits: toNumber(payload.visits),
		bounces: toNumber(payload.bounces),
		totaltime: toNumber(payload.totaltime),
	};
}

function shouldRetryWithTrailingSlash(path: string, stats: UmamiStats) {
	return stats.pageviews === 0 && stats.visits === 0 && path.length > 1;
}

export async function getSiteStats() {
	if (!umamiConfig.enable) {
		throw new Error("Umami is disabled");
	}

	return queryStats();
}

export async function getPathStats(path: string) {
	if (!umamiConfig.enable) {
		throw new Error("Umami is disabled");
	}

	const normalized = normalizePath(path);
	const primary = await queryStats(normalized);

	if (!shouldRetryWithTrailingSlash(normalized, primary)) {
		return primary;
	}

	const altPath = normalized.endsWith("/")
		? normalized.slice(0, -1)
		: `${normalized}/`;

	return queryStats(altPath);
}
