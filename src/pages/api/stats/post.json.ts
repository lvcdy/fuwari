import type { APIRoute } from "astro";
import { getPathStats } from "../../../utils/umami-stats";
import { emptyStats, jsonResponse, noStoreHeaders } from "@/utils/stats";

export const GET: APIRoute = async ({ request }) => {
	const requestUrl = new URL(request.url);
	const path = requestUrl.searchParams.get("path")?.trim();

	try {
		const stats = path ? await getPathStats(path) : emptyStats;

		return jsonResponse(stats, 200, noStoreHeaders);
	} catch (error) {
		console.error("[api/stats/post.json]", error);

		return jsonResponse(
			{
				error: "Unable to fetch post stats",
				detail: error instanceof Error ? error.message : String(error),
			},
			503,
			noStoreHeaders,
		);
	}
};
