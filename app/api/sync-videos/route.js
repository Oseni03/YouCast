import { syncUserChannelVideos } from "@/lib/youtube";
import { getServerSession } from "next-auth";

export async function POST(req) {
	try {
		const session = await getServerSession();

		if (!session) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		videos = await syncUserChannelVideos(session.user.id);

		return new Response(
			JSON.stringify({
				message: "Videos synchronized successfully.",
				videos,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: error }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
