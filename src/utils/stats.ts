import { getPathStats, getSiteStats } from "@/utils/umami-stats";

export type StatsPayload = {
	pageviews: number;
	visitors: number;
	visits: number;
	bounces: number;
	totaltime: number;
};

export const emptyStats: StatsPayload = {
	pageviews: 0,
	visitors: 0,
	visits: 0,
	bounces: 0,
	totaltime: 0,
};

export const noStoreHeaders = {
	"content-type": "application/json; charset=utf-8",
	"cache-control": "no-store",
} as const;

export function jsonResponse(
	body: unknown,
	status: number,
	headers: HeadersInit,
) {
	return new Response(JSON.stringify(body), {
		status,
		headers,
	});
}

export function coerceStats(
	stats?: Partial<StatsPayload> | null,
): StatsPayload {
	return {
		...emptyStats,
		...stats,
	};
}

export async function safeGetSiteStats() {
	try {
		return await getSiteStats();
	} catch {
		return emptyStats;
	}
}

export async function safeGetPathStats(path: string) {
	try {
		return await getPathStats(path);
	} catch {
		return emptyStats;
	}
}
