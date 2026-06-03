"use client"

import { FileWarningIcon, Trash2Icon, Loader2Icon, Settings2Icon, GlobeIcon, Mic2Icon, SaveIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useChannel, useUpdateChannel, useDeleteChannel } from '@/hooks/useChannels';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function ProjectSettingsPage() {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;

    const { data: channel, isLoading } = useChannel(projectId);
    const updateChannelMutation = useUpdateChannel();
    const deleteChannelMutation = useDeleteChannel();

    const [formData, setFormData] = useState({
        podcast_title: '',
        podcast_description: '',
        rss_slug: '',
        language: 'en-us',
        category: 'Leisure',
        explicit: false,
        episode_prefix: '',
        episode_suffix: ''
    });

    useEffect(() => {
        if (channel) {
            setFormData({
                podcast_title: channel.podcast_title || '',
                podcast_description: channel.podcast_description || '',
                rss_slug: channel.rss_slug || '',
                language: channel.language || 'en-us',
                category: channel.category || 'Leisure',
                explicit: channel.explicit || false,
                episode_prefix: channel.episode_prefix || '',
                episode_suffix: channel.episode_suffix || ''
            });
        }
    }, [channel]);

    const handleSave = async () => {
        try {
            await updateChannelMutation.mutateAsync({
                id: projectId,
                data: formData
            });
            toast.success("Project updated successfully")
        } catch (err) {
            console.error('Failed to update project settings:', err);
        }
    };

    const handleDelete = async () => {
        deleteChannelMutation.mutate(projectId, {
            onSuccess: () => {
                toast.success('Project deleted successfully');
                router.push('/projects');
            },
            onError: (err) => {
                console.error('Failed to delete project:', err);
                toast.error('Failed to delete project. Please try again.');
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2Icon className="size-12 animate-spin text-black dark:text-white" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto relative">
            <header className="mb-6 md:mb-8 pb-4">
                <h2 className="text-3xl font-manrope font-bold text-primary tracking-tight">Project Settings</h2>
                <p className="text-muted-foreground mt-2 font-medium text-sm">Configure your podcast feed and channel preferences</p>
            </header>

            <div className="h-px bg-border mb-10 md:mb-12 hidden md:block" />

            <div className="space-y-8 md:space-y-10">
                {/* General Settings */}
                <section className="bg-surface-container-lowest border border-border p-6 md:p-10 rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
                    <div className="flex items-center gap-3 mb-8">
                        <Settings2Icon className="size-6 text-primary" />
                        <h3 className="text-2xl md:text-3xl font-manrope font-bold text-primary tracking-tight">General</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-muted-foreground ml-1">Podcast Title</label>
                            <input
                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm"
                                type="text"
                                value={formData.podcast_title}
                                onChange={(e) => setFormData(prev => ({ ...prev, podcast_title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-muted-foreground ml-1">Podcast Description</label>
                            <textarea
                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm leading-relaxed"
                                rows={4}
                                value={formData.podcast_description}
                                onChange={(e) => setFormData(prev => ({ ...prev, podcast_description: e.target.value }))}
                                placeholder="What is your podcast about?"
                            />
                        </div>
                    </div>
                </section>

                {/* Feed Configuration */}
                <section className="bg-surface-container-lowest border border-border p-6 md:p-10 rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
                    <div className="flex items-center gap-3 mb-8">
                        <GlobeIcon className="size-6 text-primary" />
                        <h3 className="text-2xl md:text-3xl font-manrope font-bold text-primary tracking-tight">Feed Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-muted-foreground ml-1">RSS Slug</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm">/rss/</span>
                                <input
                                    className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm"
                                    type="text"
                                    value={formData.rss_slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rss_slug: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-muted-foreground ml-1">Language</label>
                            <select
                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm"
                                value={formData.language}
                                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                            >
                                <option value="en-us">English (US)</option>
                                <option value="en-gb">English (UK)</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-muted-foreground ml-1">Category</label>
                            <select
                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm"
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="Leisure">Leisure</option>
                                <option value="Technology">Technology</option>
                                <option value="Business">Business</option>
                                <option value="Society & Culture">Society & Culture</option>
                                <option value="Comedy">Comedy</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                            <div className="space-y-0.5">
                                <label className="text-sm font-semibold text-primary">Explicit Content</label>
                                <p className="text-xs text-muted-foreground">Contains mature language or themes</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.explicit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, explicit: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Episode Settings */}
                <section className="bg-surface-container-lowest border border-border p-6 md:p-10 rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
                    <div className="flex items-center gap-3 mb-8">
                        <Mic2Icon className="size-6 text-primary" />
                        <h3 className="text-2xl md:text-3xl font-manrope font-bold text-primary tracking-tight">Episode Formatting</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-muted-foreground ml-1">Title Prefix</label>
                            <input
                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm"
                                type="text"
                                placeholder="e.g. [S1] "
                                value={formData.episode_prefix}
                                onChange={(e) => setFormData(prev => ({ ...prev, episode_prefix: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-muted-foreground ml-1">Title Suffix</label>
                            <input
                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-primary font-medium focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 text-sm"
                                type="text"
                                placeholder="e.g. - Trailer"
                                value={formData.episode_suffix}
                                onChange={(e) => setFormData(prev => ({ ...prev, episode_suffix: e.target.value }))}
                            />
                        </div>
                    </div>
                    <p className="mt-6 text-xs text-muted-foreground italic">
                        These will be automatically added to the title of every episode synced to this project.
                    </p>
                </section>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={updateChannelMutation.isPending}
                        className="bg-linear-to-br from-primary to-primary-container text-primary-foreground px-10 py-6 rounded-2xl text-base font-bold hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
                    >
                        {updateChannelMutation.isPending ? (
                            <>
                                <Loader2Icon className="size-5 mr-2 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <SaveIcon className="size-5 mr-2" />
                                Save Project Settings
                            </>
                        )}
                    </Button>
                </div>

                {/* Danger Zone */}
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <section className="bg-destructive/5 p-6 md:p-8 rounded-3xl border border-destructive/20 mt-12">
                        <div className="flex items-center gap-3 mb-4 text-destructive">
                            <Trash2Icon className="size-5" />
                            <h3 className="text-lg md:text-xl font-manrope font-bold tracking-tight">Danger Zone</h3>
                        </div>
                        <p className="text-sm font-medium text-destructive/80 mb-6 leading-relaxed">
                            Deleting this project will permanently remove the RSS feed and all associated episode data. This action cannot be undone.
                        </p>
                        <AlertDialogTrigger
                            className="w-full md:w-auto px-6 py-3 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white hover:text-destructive-foreground rounded-xl text-sm font-semibold transition-all duration-200"
                        >

                            Delete Project
                        </AlertDialogTrigger>
                    </section>
                    <AlertDialogContent>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                            <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full shadow-[0px_24px_48px_rgba(25,28,30,0.06)] border border-border">
                                <div className="flex items-center gap-4 mb-6 text-destructive">
                                    <FileWarningIcon className="w-6 h-6" />
                                    <h4 className="text-2xl font-manrope font-bold tracking-tight">Delete Project</h4>
                                </div>
                                <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">
                                    Are you sure you want to delete <strong>{channel?.podcast_title || channel?.channel_title}</strong>? This action is permanent and will delete all associated episodes and the RSS feed.
                                </p>
                                <div className="flex gap-4">
                                    <AlertDialogCancel
                                        className="flex-1 py-3 bg-surface-container-low hover:bg-surface-container-high rounded-xl text-primary font-semibold text-sm transition-colors duration-200"
                                        disabled={deleteChannelMutation.isPending}
                                    >
                                        Cancel
                                    </AlertDialogCancel>
                                    <Button
                                        onClick={handleDelete}
                                        className="flex-1 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-semibold text-sm transition-colors duration-200 disabled:opacity-50"
                                        disabled={deleteChannelMutation.isPending}
                                    >
                                        {deleteChannelMutation.isPending ? 'Deleting...' : 'Confirm'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
