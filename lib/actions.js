"use server";

import { getServerSession } from "next-auth";
import { prisma } from "./db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const updateImage = async (formData, key) => {
	const value = formData.get(key);

	try {
		let response;
		if (key === "image") {
			const file = formData.get("image");
			const filename = `${nanoid()}.${file.type.split("/")[1]}`;

			const { url } = await put(filename, file, {
				access: "public",
			});

			const blurhash = await getBlurDataURL(url);
			response = await db
				.update(posts)
				.set({
					image: url,
					imageBlurhash: blurhash,
				})
				.where(eq(posts.id, post.id))
				.returning()
				.then((res) => res[0]);
		} else {
			response = await db
				.update(posts)
				.set({
					[key]: key === "published" ? value === "true" : value,
				})
				.where(eq(posts.id, post.id))
				.returning()
				.then((res) => res[0]);
		}

		revalidateTag(
			`${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`
		);
		revalidateTag(
			`${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`
		);

		// if the site has a custom domain, we need to revalidate those tags too
		post.site?.customDomain &&
			(revalidateTag(`${post.site?.customDomain}-posts`),
			revalidateTag(`${post.site?.customDomain}-${post.slug}`));

		return response;
	} catch (error) {
		if (error.code === "P2002") {
			return {
				error: `This slug is already in use`,
			};
		} else {
			return {
				error: error.message,
			};
		}
	}
};

export const editUser = async (formData) => {
	// Get the user session
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		return {
			error: "Not authenticated",
		};
	}

	try {
		// Perform the update
		const response = await prisma.user.update({
			where: {
				id: session.user.id, // Update based on session user ID
			},
			data: formData,
		});

		// Return updated user
		return response;
	} catch (error) {
		// Handle unique constraint violations
		if (error.code === "P2002") {
			return {
				error: `This ${key} is already in use`,
			};
		}

		// Return generic error message
		return {
			error: error.message,
		};
	}
};

export async function addNewsletterSubscriber(email) {
	try {
		// Validate the email
		if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
			return { success: false, message: "Inavlid email address" };
			throw new Error("Invalid email address");
		}

		// Check if email already exists
		const existingSubscriber = await prisma.newsletter.findUnique({
			where: { email },
		});

		if (existingSubscriber) {
			return {
				success: false,
				message: "This email is already subscribed.",
			};
		}

		// Save to the database
		const newSubscriber = await prisma.newsletter.create({
			data: {
				email,
			},
		});
		return {
			success: true,
			message: "Subscription successful!",
			data: newSubscriber,
		};
	} catch (error) {
		return {
			success: false,
			message: error.message || "An error occurred while subscribing",
		};
	}
}

export async function saveContact({ email, full_name, message }) {
	if (!email || !full_name || !message) {
		throw new Error("All fields are required.");
	}

	try {
		const contact = await prisma.contact.create({
			data: {
				email,
				full_name,
				message,
			},
		});
		return {
			success: true,
			message: "Will get back to you soon.",
			contact,
		};
	} catch (error) {
		return { success: false, error };
	}
}

export async function updateUserProfile(userId, first_name, last_name) {
	try {
		// Update the user profile in the database
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				first_name,
				last_name,
			},
		});

		// Return the updated user profile
		return {
			status: "success",
			message: "User profile updated successfully",
			user: updatedUser,
		};
	} catch (error) {
		// Handle the error
		return {
			status: "error",
			message: "Failed to update user profile",
			error: error.message,
		};
	}
}

export async function getUser(userId) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				first_name: true,
				last_name: true,
				credits: true,
			},
		});
		return { success: true, user };
	} catch (error) {
		return { success: false, user: {}, error: error };
	}
}

export async function getUserSubscription(userId) {
	try {
		const subscription = await prisma.subscriptions.findUnique({
			where: { user_id: userId },
			select: {
				id: true,
				created_time: true,
				subscription_id: true,
				stripe_user_id: true,
				status: true,
				start_date: true,
				plan_id: true,
			},
		});
		return { success: true, subscription };
	} catch (error) {
		return {
			success: false,
			subscription: {},
			error: error.message || "Failed to get subscription",
		};
	}
}

export async function createTransaction(data) {
	try {
		const transaction = await prisma.transaction.create({
			data: {
				userId: data.userId,
				amount: data.amount,
				credits: data.credits,
				currency: data.currency,
				status: "PENDING",
			},
		});
		return {
			success: true,
			data: transaction,
		};
	} catch (error) {
		console.log(error);
		return { success: false, error: error };
	}
}

export async function updateTransactionStatus(
	providerReference,
	status,
	providerResponse
) {
	try {
		const transaction = await prisma.transaction.update({
			where: { id: providerReference },
			data: {
				status,
				providerResponse,
				updatedAt: new Date(),
			},
			include: {
				user: {
					select: {
						id: true,
						credits: true,
					},
				},
			},
		});

		return { success: true, data: transaction };
	} catch (error) {
		console.error("Update transaction error:", error.message);
		return { success: false, error: error.message };
	}
}
