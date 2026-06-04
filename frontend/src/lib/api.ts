import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		// You can adjust how tokens are stored (localStorage, cookies, etc.)
		const token =
			typeof window !== "undefined"
				? localStorage.getItem("access_token")
				: null;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		// Handle global errors, e.g., token refresh logic could go here
		if (error.response?.status === 401) {
			if (typeof window !== "undefined") {
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
				document.cookie =
					"access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

				const publicPaths = ["/", "/login", "/signup"];
				if (!publicPaths.includes(window.location.pathname)) {
					window.location.href = "/login";
				}
			}
		}
		return Promise.reject(error);
	},
);

export default api;
