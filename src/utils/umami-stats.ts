import { umamiConfig } from "@/config";

export type UmamiStats = {
	pageviews: number;
	visitors: number;
	visits: number;
	bounces: number;
	totaltime: number;
};

const DEFAULT_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 6000;
let cachedAuthHeadersList: HeadersInit[] | null = null;

function getBaseUrl() {
	return umamiConfig.baseUrl.replace(/\/+$/, "");
}

function isUmamiCloudBaseUrl() {
	return getBaseUrl().startsWith("https://api.umami.is");
}

function toNumber(value: unknown) {
	const numeric =
		typeof value === "string" ? Number.parseInt(value, 10) : Number(value);

	return Number.isFinite(numeric) ? numeric : 0;
}

function normalizePath(path: string) {
	let normalizedPath = path;

	if (
		normalizedPath.startsWith("http://") ||
		normalizedPath.startsWith("https://")
	) {
		try {
			const url = new URL(normalizedPath);
			normalizedPath = url.pathname;
		} catch {
			// Use the original value if URL parsing fails.
		}
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
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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

function ensureUmamiEnabled() {
	if (!umamiConfig.enable) {
		throw new Error("Umami is disabled");
	}
}

function getWebsiteId() {
	if (!umamiConfig.websiteId?.trim()) {
		throw new Error("Missing umamiConfig.websiteId");
	}

	return umamiConfig.websiteId.trim();
}

function buildStatsUrl(websiteId: string, normalizedPath?: string) {
	const search = new URLSearchParams({
		startAt: "0",
		endAt: String(Date.now()),
		timezone: umamiConfig.timezone,
	});

	if (normalizedPath) {
		search.set("path", normalizedPath);
	}

	const basePath = isUmamiCloudBaseUrl() ? "/websites" : "/api/websites";
	return `${getBaseUrl()}${basePath}/${websiteId}/stats?${search.toString()}`;
}

function hasValue(value?: string) {
	return Boolean(value?.trim());
}

async function loginToUmami() {
	const username = umamiConfig.username?.trim();
	const password = umamiConfig.password?.trim();

	if (!username || !password) {
		throw new Error("Missing Umami username/password");
	}

	const payload = await fetchJsonWithRetry<{ token?: string }>(
		`${getBaseUrl()}/api/auth/login`,
		{
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		},
	);

	if (!payload.token) {
		throw new Error("Invalid Umami login response");
	}

	return payload.token;
}

async function getAuthHeaderCandidates(): Promise<HeadersInit[]> {
	if (cachedAuthHeadersList?.length) {
		return cachedAuthHeadersList;
	}

	const apiKey = umamiConfig.apiKey?.trim() || "";
	const authToken = umamiConfig.authToken?.trim() || "";
	const headersList: HeadersInit[] = [];

	if (isUmamiCloudBaseUrl()) {
		if (!hasValue(apiKey)) {
			throw new Error(
				"Umami Cloud requires UMAMI_API_KEY and UMAMI_BASE_URL=https://api.umami.is/v1",
			);
		}

		headersList.push({
			"x-umami-api-key": apiKey,
		});

		cachedAuthHeadersList = headersList;
		return headersList;
	}

	if (hasValue(umamiConfig.username) && hasValue(umamiConfig.password)) {
		headersList.push({
			authorization: `Bearer ${await loginToUmami()}`,
		});
	}

	if (hasValue(authToken)) {
		headersList.push({
			authorization: `Bearer ${authToken}`,
		});
	}

	if (!headersList.length) {
		throw new Error("Missing Umami authentication configuration");
	}

	cachedAuthHeadersList = headersList;
	return headersList;
}

async function queryStats(normalizedPath?: string): Promise<UmamiStats> {
	const websiteId = getWebsiteId();
	const candidates = await getAuthHeaderCandidates();
	let lastError: unknown;

	for (const headers of candidates) {
		try {
			const payload = await fetchJsonWithRetry<Partial<UmamiStats>>(
				buildStatsUrl(websiteId, normalizedPath),
				{
					method: "GET",
					headers,
				},
			);

			return {
				pageviews: toNumber(payload.pageviews),
				visitors: toNumber(payload.visitors),
				visits: toNumber(payload.visits),
				bounces: toNumber(payload.bounces),
				totaltime: toNumber(payload.totaltime),
			};
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError instanceof Error
		? lastError
		: new Error("Failed to fetch Umami data");
}

function shouldRetryWithTrailingSlash(path: string, stats: UmamiStats) {
	return stats.pageviews === 0 && stats.visits === 0 && path.length > 1;
}

function toggleTrailingSlash(path: string) {
	return path.endsWith("/") ? path.slice(0, -1) : `${path}/`;
}

export async function getSiteStats() {
	ensureUmamiEnabled();
	return queryStats();
}

export async function getPathStats(path: string) {
	ensureUmamiEnabled();

	const normalized = normalizePath(path);
	const primary = await queryStats(normalized);

	if (!shouldRetryWithTrailingSlash(normalized, primary)) {
		return primary;
	}

	return queryStats(toggleTrailingSlash(normalized));
}
