"use client";

import {
	FileWarningIcon,
	ImageIcon,
	LockKeyhole,
	Loader2Icon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
	useMe,
	useUpdateMe,
	useDeactivateAccount,
	useNotificationPreferences,
	useUpdateNotificationPreferences,
} from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
	const router = useRouter();
	const { data: creator, isLoading } = useMe();
	const updateMeMutation = useUpdateMe();
	const deactivateMutation = useDeactivateAccount();
	const { data: notificationPrefs, isLoading: prefsLoading } =
		useNotificationPreferences();
	const updateNotificationPrefs = useUpdateNotificationPreferences();

	const [showAlert, setShowAlert] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		bio: "",
	});
	const [notificationData, setNotificationData] = useState({
		email_notifications: true,
		push_notifications: true,
		marketing_emails: false,
	});

	useEffect(() => {
		if (creator) {
			setFormData({
				username: creator.username,
				email: creator.email,
				bio: creator.bio || "",
			});
		}
	}, [creator]);

	useEffect(() => {
		if (notificationPrefs) {
			setNotificationData({
				email_notifications: notificationPrefs.email_notifications,
				push_notifications: notificationPrefs.push_notifications,
				marketing_emails: notificationPrefs.marketing_emails,
			});
		}
	}, [notificationPrefs]);

	const handleSave = async () => {
		try {
			await updateMeMutation.mutateAsync({
				username: formData.username,
				bio: formData.bio,
			});
			// Optionally show a success toast here
		} catch (err) {
			console.error("Failed to update profile:", err);
		}
	};

	const handleNotificationToggle = async (
		key: keyof typeof notificationData,
	) => {
		const newValue = !notificationData[key];
		setNotificationData((prev) => ({ ...prev, [key]: newValue }));

		try {
			await updateNotificationPrefs.mutateAsync({
				[key]: newValue,
			});
		} catch (err) {
			console.error("Failed to update notification preference:", err);
			// Revert on error
			setNotificationData((prev) => ({ ...prev, [key]: !newValue }));
		}
	};

	const handleDeactivate = async () => {
		try {
			await deactivateMutation.mutateAsync();
			router.push("/auth/login");
		} catch (err) {
			console.error("Failed to deactivate account:", err);
		}
	};

	if (isLoading || prefsLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2Icon className="size-12 animate-spin text-black dark:text-white" />
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto relative">
			{showAlert && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
					<div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full shadow-[0px_24px_48px_rgba(25,28,30,0.06)] border border-border">
						<div className="flex items-center gap-4 mb-6 text-destructive">
							<FileWarningIcon className="w-6 h-6" />
							<h4 className="text-2xl font-manrope font-bold tracking-tight">
								Danger Alert
							</h4>
						</div>
						<p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">
							You are about to modify critical account settings.
							This action may affect your active podcast
							distribution feeds. Are you sure you want to
							proceed?
						</p>
						<div className="flex gap-4">
							<button
								onClick={() => setShowAlert(false)}
								className="flex-1 py-3 bg-surface-container-low hover:bg-surface-container-high rounded-xl text-primary font-semibold text-sm transition-colors duration-200"
								disabled={deactivateMutation.isPending}
							>
								Cancel
							</button>
							<button
								onClick={handleDeactivate}
								className="flex-1 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-semibold text-sm transition-colors duration-200 disabled:opacity-50"
								disabled={deactivateMutation.isPending}
							>
								{deactivateMutation.isPending
									? "Processing..."
									: "Confirm"}
							</button>
						</div>
					</div>
				</div>
			)}

			<header className="mb-6 md:mb-8 pb-4">
				<h2 className="text-3xl font-manrope font-bold text-primary tracking-tight">
					Account Settings
				</h2>
				<p className="text-muted-foreground mt-2 font-medium text-sm">
					Manage your profile and account preferences
				</p>
			</header>

			<div className="h-px bg-border mb-10 md:mb-12 hidden md:block" />

			<div className="space-y-8 md:space-y-10">
				<section
					id="profile"
					className="bg-surface-container-lowest border border-border p-6 md:p-10 rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)]"
				>
					<h3 className="text-2xl md:text-3xl font-manrope font-bold mb-8 text-primary tracking-tight">
						Profile
					</h3>
					<div className="flex flex-col md:flex-row gap-8 md:gap-12">
						<div className="flex flex-col items-center md:items-start gap-4">
							<div className="size-32 md:size-40 shrink-0 rounded-2xl bg-surface-container-low border border-border flex items-center justify-center overflow-hidden relative group shadow-sm">
								<img
									src={
										creator?.avatar_url ||
										"https://api.dicebear.com/9.x/notionists/svg?seed=" +
											(creator?.username || "fallback")
									}
									alt="Profile"
									className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
									referrerPolicy="no-referrer"
								/>
								<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
									<ImageIcon className="text-white w-8 h-8" />
								</div>
							</div>
							<button className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
								Change Photo
							</button>
						</div>
						<div className="flex-1 space-y-6 w-full">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="block text-sm font-semibold text-muted-foreground ml-1">
										Display Name
									</label>
									<input
										className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm"
										type="text"
										value={formData.username}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												username: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<label className="block text-sm font-semibold text-muted-foreground ml-1">
										Email Address
									</label>
									<input
										className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-muted-foreground font-medium focus:outline-none opacity-60 cursor-not-allowed text-sm"
										type="email"
										value={formData.email}
										readOnly
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-semibold text-muted-foreground ml-1">
									Bio
								</label>
								<textarea
									className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm leading-relaxed"
									rows={4}
									value={formData.bio}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											bio: e.target.value,
										}))
									}
									placeholder="Tell us about yourself..."
								/>
							</div>
							<div className="pt-4">
								<button
									onClick={handleSave}
									disabled={updateMeMutation.isPending}
									className="w-full md:w-auto bg-linear-to-br from-primary to-primary-container text-primary-foreground px-8 py-3.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
								>
									{updateMeMutation.isPending
										? "Saving..."
										: "Save Changes"}
								</button>
							</div>
						</div>
					</div>
				</section>

				<section
					id="billing"
					className="bg-surface-container-lowest border border-border p-6 md:p-10 rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)]"
				>
					<h3 className="text-2xl md:text-3xl font-manrope font-bold mb-8 text-primary tracking-tight">
						Subscription
					</h3>
					<div className="p-6 md:p-8 bg-surface-container-low rounded-2xl flex flex-col xl:flex-row xl:justify-between items-start xl:items-center gap-6 xl:gap-8">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full">
							<div className="size-16 shrink-0 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-sm">
								<LockKeyhole className="w-7 h-7" />
							</div>
							<div>
								<p className="text-xl md:text-2xl font-manrope font-bold text-primary tracking-tight capitalize">
									{creator?.plan_tier} Plan
								</p>
								<p className="text-sm font-medium text-muted-foreground mt-1">
									{creator?.plan_tier === "free"
										? "Basic Features Included"
										: "Premium Features Enabled"}
								</p>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full xl:w-auto">
							<button className="w-full sm:w-auto px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-xl text-sm font-semibold transition-colors duration-200">
								Manage Billing
							</button>
							<button className="w-full sm:w-auto px-6 py-3 bg-linear-to-br from-primary to-primary-container text-primary-foreground rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
								Upgrade Plan
							</button>
						</div>
					</div>
				</section>

				<section
					id="notifications"
					className="bg-surface-container-lowest border border-border p-6 md:p-10 rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)]"
				>
					<h3 className="text-2xl md:text-3xl font-manrope font-bold mb-8 text-primary tracking-tight">
						Notifications
					</h3>
					<div className="space-y-6 md:space-y-8">
						{[
							{
								title: "Email Notifications",
								desc: "Receive weekly performance reports",
								key: "email_notifications" as const,
								checked: notificationData.email_notifications,
							},
							{
								title: "Push Notifications",
								desc: "Alerts when episodes are published",
								key: "push_notifications" as const,
								checked: notificationData.push_notifications,
							},
							{
								title: "Marketing Emails",
								desc: "News about new features and tools",
								key: "marketing_emails" as const,
								checked: notificationData.marketing_emails,
							},
						].map((item) => (
							<div
								key={item.key}
								className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6 md:pb-8 last:border-0 last:pb-0"
							>
								<div className="space-y-1 max-w-xs md:max-w-none">
									<p className="text-base font-semibold text-primary">
										{item.title}
									</p>
									<p className="text-sm text-muted-foreground">
										{item.desc}
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer shrink-0">
									<input
										type="checkbox"
										className="sr-only peer"
										checked={item.checked}
										onChange={() =>
											handleNotificationToggle(item.key)
										}
										disabled={
											updateNotificationPrefs.isPending
										}
									/>
									<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>
						))}
					</div>
				</section>

				<section className="bg-destructive/5 p-6 md:p-8 rounded-3xl border border-destructive/20">
					<h3 className="text-lg md:text-xl font-manrope font-bold mb-3 text-destructive tracking-tight">
						Danger Zone
					</h3>
					<p className="text-sm font-medium text-destructive/80 mb-6 leading-relaxed">
						Deactivating your account will suspend your access. You
						can reach out to support to reactivate it later.
					</p>
					<button
						onClick={() => setShowAlert(true)}
						className="w-full md:w-auto px-6 py-3 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl text-sm font-semibold transition-all duration-200"
					>
						Deactivate Account
					</button>
				</section>
			</div>
		</div>
	);
}
