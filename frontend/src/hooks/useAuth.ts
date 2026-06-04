import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { authService } from "@/lib/api-services";
import type { Creator } from "@/lib/types";

interface AuthResponse {
	access: string;
	refresh: string;
	creator: Creator;
	is_new: boolean;
}

const storeTokens = (access: string, refresh: string) => {
	if (typeof window === "undefined") return;
	// Store in localStorage for the Axios interceptor
	localStorage.setItem("access_token", access);
	localStorage.setItem("refresh_token", refresh);
	// Store access_token in a cookie so Next.js middleware can read it
	document.cookie = `access_token=${access}; path=/; SameSite=Strict`;
};

export const clearTokens = () => {
	if (typeof window === "undefined") return;
	localStorage.removeItem("access_token");
	localStorage.removeItem("refresh_token");
	// Clear the cookie by setting an expired date
	document.cookie =
		"access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
};

export const useLogin = () => {
	return useMutation({
		mutationFn: async (credentials: {
			email: string;
			password: string;
		}) => {
			const response = await api.post<AuthResponse>(
				"/auth/login/",
				credentials,
			);
			return response.data;
		},
		onSuccess: (data) => {
			storeTokens(data.access, data.refresh);
		},
	});
};

export const useSignup = () => {
	return useMutation({
		mutationFn: async (userData: {
			email: string;
			password: string;
			username: string;
		}) => {
			const response = await api.post<AuthResponse>(
				"/auth/signup/",
				userData,
			);
			return response.data;
		},
		onSuccess: (data) => {
			storeTokens(data.access, data.refresh);
		},
	});
};

export const ME_KEY = ["auth", "me"] as const;

export const useMe = () => {
	return useQuery({
		queryKey: ME_KEY,
		queryFn: async () => {
			const response = await api.get<Creator>("/auth/me/");
			return response.data;
		},
		retry: false, // don't hammer the server on 401
	});
};

export const useUpdateMe = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: Partial<Creator>) => {
			const response = await api.patch<Creator>("/auth/me/", data);
			return response.data;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ME_KEY });
		},
	});
};

export const useDeactivateAccount = () => {
	return useMutation({
		mutationFn: async () => {
			const refresh = localStorage.getItem("refresh_token");
			await api.post("/auth/deactivate/", { refresh });
			clearTokens();
		},
	});
};

export const useLogout = () => {
	return useMutation({
		mutationFn: async () => {
			const refresh =
				typeof window !== "undefined"
					? localStorage.getItem("refresh_token")
					: null;
			if (refresh) {
				await api.post("/auth/logout/", { refresh });
			}
			clearTokens();
		},
		onSuccess: () => {
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
		},
	});
};

export const useAcceptTOS = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (accepted: boolean) => {
			return authService.acceptTOS(accepted);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ME_KEY });
		},
	});
};

export const NOTIFICATION_PREFS_KEY = [
	"auth",
	"notification-preferences",
] as const;

export interface NotificationPreferences {
	email_notifications: boolean;
	push_notifications: boolean;
	marketing_emails: boolean;
}

export const useNotificationPreferences = () => {
	return useQuery({
		queryKey: NOTIFICATION_PREFS_KEY,
		queryFn: async () => {
			const response = await api.get<NotificationPreferences>(
				"/auth/notification-preferences/",
			);
			return response.data;
		},
	});
};

export const useUpdateNotificationPreferences = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: Partial<NotificationPreferences>) => {
			const response = await api.patch<NotificationPreferences>(
				"/auth/notification-preferences/",
				data,
			);
			return response.data;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: NOTIFICATION_PREFS_KEY });
		},
	});
};
