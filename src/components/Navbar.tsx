"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { LogOut, User as UserIcon, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const { user, userRole, logout } = useAuth();
    const pathname = usePathname();
    const [showConfirm, setShowConfirm] = useState(false);
    const [showBenevity, setShowBenevity] = useState(false);

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="rounded bg-white p-1">
                            <img src="/iskcon_logo_v2.png" alt="ISKCON" className="h-8 w-auto object-contain" />
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-[var(--saffron)] to-[var(--cream)] bg-clip-text text-transparent">
                            Gita Wisdom Course
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user && !['/login', '/signup'].includes(pathname) ? (
                            <div className="flex items-center gap-4">
                                {userRole === "admin" && (
                                    <Link href="/admin" className="text-sm font-medium text-[var(--saffron)] hover:text-[var(--cream)]">
                                        Admin
                                    </Link>
                                )}
                                <Link href="/leaderboard" className="text-sm font-medium text-gray-300 hover:text-[var(--cream)]">
                                    Leaderboard
                                </Link>

                                <div className="relative flex items-center gap-4">
                                    <span className="hidden text-sm text-[var(--cream)]/80 sm:block">
                                        {user.displayName?.split(" ")[0]}
                                    </span>

                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        className="relative z-10 rounded-full bg-white/10 p-2 text-[var(--cream)] transition-all hover:bg-white/20 active:scale-95"
                                        aria-label="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {showConfirm && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
                                                    onClick={() => setShowConfirm(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className="absolute right-0 top-full z-[110] mt-3 w-72 overflow-hidden rounded-2xl border border-white/20 bg-gray-900/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                                                >
                                                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                                                    <div className="relative">
                                                        <div className="mb-3 flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                                                                <LogOut size={18} />
                                                            </div>
                                                            <div className="text-left">
                                                                <h3 className="text-sm font-bold text-white">Confirm Logout</h3>
                                                                <p className="text-[11px] text-gray-400">Ready to end your session?</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    setShowConfirm(false);
                                                                    await handleLogout();
                                                                }}
                                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-red-500 hover:shadow-[0_4px_12px_rgba(220,38,38,0.3)] active:scale-95"
                                                            >
                                                                <Check size={14} strokeWidth={3} />
                                                                Logout
                                                            </button>
                                                            <button
                                                                onClick={() => setShowConfirm(false)}
                                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-300 transition-all hover:bg-white/10 active:scale-95"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/#speaker" className="hidden lg:block text-sm font-medium text-gray-300 hover:text-[var(--saffron)] transition-colors">
                                    Meet Your Guide
                                </Link>
                                <Link href="/#team" className="hidden lg:block text-sm font-medium text-gray-300 hover:text-[var(--saffron)] transition-colors">
                                    Our Team
                                </Link>
                                <Link href="/topics" className="hidden lg:block text-sm font-medium text-gray-300 hover:text-[var(--saffron)] transition-colors">
                                    Course Topics
                                </Link>
                                <Link href="/#contact" className="hidden lg:block text-sm font-medium text-gray-300 hover:text-[var(--saffron)] transition-colors">
                                    Contact Us
                                </Link>

                                <a
                                    href="https://rzp.io/rzp/xzMts0BX"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden sm:block rounded-full bg-gradient-to-r from-[var(--saffron)] to-orange-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105 hover:shadow-orange-500/40"
                                >
                                    Donations Accepted
                                </a>

                                <button
                                    onClick={() => setShowBenevity(true)}
                                    className="hidden sm:block rounded-full border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 px-5 py-2 text-sm font-bold text-[var(--saffron)] transition-all hover:bg-[var(--saffron)] hover:text-white"
                                >
                                    Benevity Volunteering
                                </button>

                                <Link
                                    href="/login"
                                    className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Benevity Modal */}
            <AnimatePresence>
                {showBenevity && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowBenevity(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gray-900 p-8 shadow-2xl"
                        >
                            <button
                                onClick={() => setShowBenevity(false)}
                                className="absolute top-4 right-4 rounded-full bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center space-y-6">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4" /></svg>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Benevity Volunteering</h3>
                                    <p className="text-gray-400 text-sm">Corporate Giving & Matching</p>
                                </div>

                                <div className="rounded-xl bg-white/5 p-6 border border-white/5 text-left space-y-4">
                                    <p className="text-gray-300 leading-relaxed">
                                        We have an option for all employees working in companies to contribute through the <strong>Benevity</strong> platform.
                                    </p>
                                    <p className="text-gray-300 leading-relaxed">
                                        If you are interested in doubling your impact through corporate matching, please contact us for more details.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <a
                                        href="tel:7095436770"
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[var(--saffron)] px-4 py-3 font-bold text-white transition-all hover:brightness-110 active:scale-95"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        Call: 7095436770
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
