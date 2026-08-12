import type { APIRoute } from "astro";
import { getSiteStats } from "../../../utils/umami-stats";
import { jsonResponse, noStoreHeaders } from "@/utils/stats";

export const GET: APIRoute = async () => {
	try {
		const stats = await getSiteStats();

		return jsonResponse(stats, 200, noStoreHeaders);
	} catch (error) {
		console.error("[api/stats/site.json]", error);

		return jsonResponse(
			{
				error: "Unable to fetch site stats",
			},
			503,
			noStoreHeaders,
		);
	}
};
