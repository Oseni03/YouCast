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

		await syncUserChannelVideos(session);

		return new Response(
			JSON.stringify({ message: "Videos synchronized successfully." }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error syncing videos:", error);

		return new Response(
			JSON.stringify({ error: "Failed to sync videos." }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
