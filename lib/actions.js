"use server";

import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
import { getServerSession } from "next-auth";
import { prisma } from "./db";

export async function handleLogout(router) {
	try {
		await signOut({ redirect: false });
		router.push("/");
	} catch (error) {
		console.log(error);
		toast.error("Error logging out");
	}
}

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
	const session = await getServerSession();
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
