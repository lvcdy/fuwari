import type { APIRoute } from "astro";
import { getPathStats } from "@/utils/umami-stats";

export const GET: APIRoute = async ({ params }) => {
	const rawTarget = params.target?.trim();

	if (!rawTarget) {
		return new Response(
			JSON.stringify({ error: "Missing path target" }),
			{
				status: 400,
				headers: {
					"content-type": "application/json; charset=utf-8",
				},
			},
		);
	}

	const normalizedPath = `/${rawTarget.replace(/^\/+|\/+$/g, "")}/`;

	try {
		const stats = await getPathStats(normalizedPath);

		return new Response(JSON.stringify(stats), {
			status: 200,
			headers: {
				"content-type": "application/json; charset=utf-8",
				"cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
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
