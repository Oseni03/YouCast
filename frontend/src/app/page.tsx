"use client";

import Link from 'next/link';
import { ArrowRight, Play, WandSparkles, Rss, Activity, Loader2 } from "lucide-react";
import { useMe } from '@/hooks/useAuth';
import { AppLogo } from '@/components/app-logo';

export default function Home() {
    const { data: user } = useMe();

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            <nav className="sticky top-0 z-50 glass-nav">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform group-hover:rotate-12">
                            <AppLogo width={24} height={24} className="object-contain" />
                        </div>
                        <span className="text-xl font-manrope font-bold tracking-tight">Opticast</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 font-medium">
                        <a href="#features" className="text-sm hover:text-primary transition-all">Features</a>
                        <a href="#pricing" className="text-sm hover:text-primary transition-all">Pricing</a>
                        <a href="#testimonials" className="text-sm hover:text-primary transition-all">Testimonials</a>
                        {user ? (
                            <Link
                                href="/projects"
                                className="text-sm font-semibold bg-linear-to-r from-primary to-primary-container text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-sm"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-semibold hover:text-primary transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-sm font-semibold bg-linear-to-r from-primary to-primary-container text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-40">
                <div className="text-left max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-4 md:mt-12">

                    <h1 className="text-5xl sm:text-7xl md:text-[100px] lg:text-[110px] font-manrope font-bold tracking-tight leading-[0.9] mb-8 md:mb-10 text-primary">
                        Turn your <br />
                        YouTube into <br />
                        <span className="text-accent hover:translate-x-2 transition-transform inline-block">a Podcast.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 md:mb-14 leading-relaxed font-normal">
                        Automatically convert your video uploads into high-quality podcast episodes and distribute them to Spotify, Apple, and Google.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                        {user ? (
                            <Link
                                href="/projects"
                                className="w-full sm:w-auto px-10 py-5 bg-linear-to-br from-primary to-primary-container text-primary-foreground text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                Go to Dashboard
                                <ArrowRight />
                            </Link>
                        ) : (
                            <Link
                                href="/signup"
                                className="w-full sm:w-auto px-10 py-5 bg-linear-to-br from-primary to-primary-container text-primary-foreground text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                Start Syncing Now
                                <ArrowRight />
                            </Link>
                        )}
                        <a href="#demo" className="w-full sm:w-auto px-10 py-5 bg-surface text-primary border border-border text-lg font-semibold rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-3">
                            Watch Demo
                        </a>
                    </div>
                </div>

                <div id="demo" className="mt-24 md:mt-40 relative scroll-m-20 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                    <div className="relative bg-surface rounded-2xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] overflow-hidden aspect-video group">
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="size-24 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl group-hover:bg-primary group-hover:text-primary-foreground text-primary">
                                <Play className="size-10 fill-current ml-1" />
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-primary/5 z-10 pointer-events-none transition-colors"></div>
                        <img
                            src="/youcast_dashboard_mockup_1772820751267.png"
                            alt="App Dashboard"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>

                <div id="features" className="mt-24 md:mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 scroll-m-24">
                    <div className="text-left p-10 bg-surface-container-lowest rounded-2xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] hover:-translate-y-2 transition-transform group relative overflow-hidden">
                        <div className="size-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-8 transition-all duration-700">
                            <WandSparkles className="size-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl font-manrope font-bold mb-4 text-primary">AI Audio Pro</h3>
                        <p className="text-base text-muted-foreground leading-relaxed">Advanced background noise removal and normalization for that perfect studio sound, every single time.</p>
                        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                            Learn More <ArrowRight className="size-4" />
                        </div>
                    </div>
                    <div className="text-left p-10 bg-surface-container-lowest rounded-2xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] hover:-translate-y-2 transition-transform group relative overflow-hidden">
                        <div className="size-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-8 transition-all duration-700">
                            <Rss className="size-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl font-manrope font-bold mb-4 text-primary">Auto-Sync</h3>
                        <p className="text-base text-muted-foreground leading-relaxed">Your content is everywhere instantly. We manage RSS feeds, hosting, and platform metadata automatically.</p>
                        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                            Learn More <ArrowRight className="size-4" />
                        </div>
                    </div>
                    <div className="text-left p-10 bg-surface-container-lowest rounded-2xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] hover:-translate-y-2 transition-transform group relative overflow-hidden">
                        <div className="size-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-8 transition-all duration-700">
                            <Activity className="size-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl font-manrope font-bold mb-4 text-primary">Insight Hub</h3>
                        <p className="text-base text-muted-foreground leading-relaxed">Deep-dive into listener behavior across all platforms with our unified, real-time analytics engine.</p>
                        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                            Learn More <ArrowRight className="size-4" />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-16 md:py-24 bg-surface-container-high border-t border-surface-container-highest">
                <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            <AppLogo width={20} height={20} className="object-contain" />
                        </div>
                        <span className="text-lg font-manrope font-bold tracking-tight">Opticast</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
                    </div>
                    <p className="text-sm text-muted-foreground">© 2024 Opticast Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
