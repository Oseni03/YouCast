import { syncUserChannelVideos } from "@/lib/youtube";
import { prisma } from "@/lib/db"; // Assuming you have a Prisma client setup

export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(req) {
	try {
		// Fetch all users from the database
		const users = await prisma.user.findMany({
			select: { id: true }, // Only fetch user IDs to minimize data
		});

		if (!users || users.length === 0) {
			return new Response(
				JSON.stringify({ message: "No users found to synchronize." }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Process each user's channels asynchronously
		const results = await Promise.all(
			users.map(async (user) => {
				try {
					const videos = await syncUserChannelVideos(user.id);
					return { userId: user.id, success: true, videos };
				} catch (error) {
					return {
						userId: user.id,
						success: false,
						error: error.message,
					};
				}
			})
		);

		// Return a summary of the synchronization process
		return new Response(
			JSON.stringify({
				message: "Synchronization process completed.",
				results,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: "Failed to sync videos for all users.",
				message: error.message,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
