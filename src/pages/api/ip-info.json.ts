import type { APIRoute } from "astro";
import { jsonResponse, noStoreHeaders } from "@/utils/stats";

const ipInfoEndpoint = "https://my.ippure.com/v1/info";

function getVisitorIp(headers: Headers) {
	const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

	return (
		headers.get("cf-connecting-ip") ||
		headers.get("x-real-ip") ||
		forwardedFor ||
		""
	);
}

export const GET: APIRoute = async ({ request }) => {
	const headers = new Headers({
		accept: "application/json",
	});
	const visitorIp = getVisitorIp(request.headers);
	const userAgent = request.headers.get("user-agent");

	if (visitorIp) {
		headers.set("x-forwarded-for", visitorIp);
		headers.set("x-real-ip", visitorIp);
	}

	if (userAgent) {
		headers.set("user-agent", userAgent);
	}

	try {
		const response = await fetch(ipInfoEndpoint, {
			cache: "no-store",
			headers,
		});

		if (!response.ok) {
			throw new Error(`IPPure responded with ${response.status}`);
		}

		return jsonResponse(await response.json(), 200, noStoreHeaders);
	} catch (error) {
		console.error("[api/ip-info.json]", error);

		return jsonResponse(
			{
				error: "Unable to fetch IP info",
				detail: error instanceof Error ? error.message : String(error),
			},
			503,
			noStoreHeaders,
		);
	}
};
