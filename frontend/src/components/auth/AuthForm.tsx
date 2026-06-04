"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	ArrowLeft,
	LogIn,
	UserPlus,
	AlertCircle,
	Eye,
	EyeOff,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { useLogin, useSignup } from "@/hooks/useAuth";

interface AuthFormProps {
	mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();
	const isLogin = mode === "login";

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [username, setUsername] = useState("");
	const [formError, setFormError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const loginMutation = useLogin();
	const signupMutation = useSignup();
	const isLoading = loginMutation.isPending || signupMutation.isPending;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setFormError("");

		if (isLogin) {
			loginMutation.mutate(
				{ email, password },
				{
					onSuccess: () => router.push("/projects"),
					onError: (error: any) => {
						setFormError(
							error.response?.data?.error ||
								"Invalid email or password.",
						);
					},
				},
			);
		} else {
			if (password !== confirmPassword) {
				setFormError("Passwords don't match.");
				return;
			}
			signupMutation.mutate(
				{ email, password, username },
				{
					onSuccess: () => router.push("/onboarding"),
					onError: (error: any) => {
						const errData = error.response?.data;
						if (errData && typeof errData === "object") {
							const messages = Object.values(
								errData,
							).flat() as string[];
							setFormError(
								messages.join(" ") ||
									"Failed to create account.",
							);
						} else {
							setFormError("Failed to create account.");
						}
					},
				},
			);
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-primary selection:text-primary-foreground">
			<div className="max-w-md w-full">
				{/* Back to Home */}
				<Link
					href="/"
					className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 text-sm font-semibold group"
				>
					<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
					Back to Home
				</Link>

				{/* Card */}
				<div className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-[0px_24px_48px_rgba(25,28,30,0.06)]">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center gap-3 mb-10 w-fit group"
					>
						<div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm">
							<AppLogo
								width={24}
								height={24}
								className="object-contain"
							/>
						</div>
						<span className="text-2xl font-manrope font-bold tracking-tight text-primary">
							Opticast
						</span>
					</Link>

					{/* Heading */}
					<h1 className="text-4xl font-manrope font-bold text-primary mb-3 tracking-tight leading-tight">
						{isLogin ? "Welcome Back" : "Join the Club"}
					</h1>
					<p className="text-muted-foreground text-sm font-medium mb-8">
						{isLogin
							? "Sign in to access your podcast studio."
							: "Create an account to start converting your content."}
					</p>

					{/* Error Banner */}
					{formError && (
						<div className="mb-6 p-4 bg-destructive/10 rounded-xl flex items-start gap-3 text-destructive">
							<AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
							<p className="text-sm font-semibold leading-relaxed">
								{formError}
							</p>
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Username — signup only */}
						{!isLogin && (
							<div className="space-y-2">
								<label
									htmlFor="username"
									className="block text-sm font-semibold text-muted-foreground ml-1"
								>
									Username
								</label>
								<input
									id="username"
									type="text"
									required
									autoComplete="username"
									value={username}
									onChange={(e) =>
										setUsername(e.target.value)
									}
									className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-all duration-200 placeholder:text-muted-foreground/60 text-sm"
									placeholder="yourchannel"
								/>
							</div>
						)}

						{/* Email */}
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="block text-sm font-semibold text-muted-foreground ml-1"
							>
								Email Address
							</label>
							<input
								id="email"
								type="email"
								required
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-all duration-200 placeholder:text-muted-foreground/60 text-sm"
								placeholder="name@example.com"
							/>
						</div>

						{/* Password */}
						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-sm font-semibold text-muted-foreground ml-1"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									required
									autoComplete={
										isLogin
											? "current-password"
											: "new-password"
									}
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 pr-14 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-all duration-200 placeholder:text-muted-foreground/60 text-sm"
									placeholder="••••••••"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									aria-label="Toggle password visibility"
									className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						{/* Confirm Password — signup only */}
						{!isLogin && (
							<div className="space-y-2">
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-semibold text-muted-foreground ml-1"
								>
									Confirm Password
								</label>
								<div className="relative">
									<input
										id="confirmPassword"
										type={showConfirm ? "text" : "password"}
										required
										autoComplete="new-password"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 pr-14 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-all duration-200 placeholder:text-muted-foreground/60 text-sm"
										placeholder="••••••••"
									/>
									<button
										type="button"
										onClick={() =>
											setShowConfirm(!showConfirm)
										}
										aria-label="Toggle confirm password visibility"
										className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200"
									>
										{showConfirm ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-4 bg-linear-to-br from-primary to-primary-container text-primary-foreground text-base rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
						>
							{isLoading ? (
								<div className="size-5 border-[3px] border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
							) : (
								<>
									{isLogin ? "Sign In" : "Create Account"}
									{isLogin ? (
										<LogIn className="w-5 h-5" />
									) : (
										<UserPlus className="w-5 h-5" />
									)}
								</>
							)}
						</button>
					</form>

					{/* Switch mode */}
					<div className="mt-8 pt-6 border-t border-border text-center">
						<p className="text-sm font-medium text-muted-foreground mb-3">
							{isLogin
								? "Don't have an account yet?"
								: "Already have an account?"}
						</p>
						<Link
							href={isLogin ? "/signup" : "/login"}
							className="text-primary font-bold hover:underline underline-offset-4 transition-all duration-200"
						>
							{isLogin
								? "Create a New Account →"
								: "← Sign In Instead"}
						</Link>
					</div>
				</div>

				{/* Legal */}
				<p className="mt-8 text-center text-xs font-medium text-muted-foreground leading-relaxed max-w-sm mx-auto">
					By continuing, you agree to OPTICAST's{" "}
					<a
						href="#"
						className="text-primary hover:underline underline-offset-2 transition-colors"
					>
						Terms of Service
					</a>{" "}
					and{" "}
					<a
						href="#"
						className="text-primary hover:underline underline-offset-2 transition-colors"
					>
						Privacy Policy
					</a>
					.
				</p>
			</div>
		</div>
	);
}
