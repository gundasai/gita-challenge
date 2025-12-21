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

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
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
                                            {/* High Z-index backdrop to catch all clicks */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
                                                onClick={() => setShowConfirm(false)}
                                            />

                                            {/* Refined Popover - even higher Z-index */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute right-0 top-full z-[110] mt-3 w-72 overflow-hidden rounded-2xl border border-white/20 bg-gray-900/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                                            >
                                                {/* Decorative top bar */}
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

                                                {/* Sophisticated Arrow */}
                                                <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-white/20 bg-gray-900/95" />
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full bg-[var(--saffron)] px-6 py-2 text-sm font-medium text-white transition hover:brightness-110"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
