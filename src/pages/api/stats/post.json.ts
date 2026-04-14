import type { APIRoute } from "astro";
import { getPathStats } from "@/utils/umami-stats";

export const GET: APIRoute = async ({ request }) => {
	const requestUrl = new URL(request.url);
	const path = requestUrl.searchParams.get("path")?.trim();

	if (!path) {
		return new Response(
			JSON.stringify({ error: "Missing query parameter: path" }),
			{
				status: 400,
				headers: {
					"content-type": "application/json; charset=utf-8",
				},
			},
		);
	}

	try {
		const stats = await getPathStats(path);

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
			JSON.stringify({ error: "Unable to fetch post stats" }),
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
