import type { APIRoute } from "astro";
import { getSiteStats } from "../../../utils/umami-stats";

export const GET: APIRoute = async () => {
	try {
		const stats = await getSiteStats();

		return new Response(JSON.stringify(stats), {
			status: 200,
			headers: {
				"content-type": "application/json; charset=utf-8",
				"cache-control":
					"public, max-age=60, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch {
		return new Response(
			JSON.stringify({ error: "Unable to fetch site stats" }),
			{
				status: 503,
				headers: {
					"content-type": "application/json; charset=utf-8",
					"cache-control": "no-store",
				},
			},
		);
	}
};
