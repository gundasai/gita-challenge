"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
    const { user, userRole, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold bg-linear-to-r from-[var(--saffron)] to-[var(--cream)] bg-clip-text text-transparent">
                        Gita 21
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {userRole === "admin" && (
                                <Link href="/admin" className="text-sm font-medium text-[var(--saffron)] hover:text-[var(--cream)]">
                                    Admin
                                </Link>
                            )}
                            <Link href="/leaderboard" className="text-sm font-medium text-gray-300 hover:text-[var(--cream)]">
                                Leaderboard
                            </Link>
                            <span className="hidden text-sm text-[var(--cream)]/80 sm:block">
                                {user.displayName?.split(" ")[0]}
                            </span>
                            <button
                                onClick={() => {
                                    logout();
                                    window.location.href = "/login";
                                }}
                                className="rounded-full bg-white/10 p-2 text-[var(--cream)] transition hover:bg-white/20"
                                aria-label="Logout"
                            >
                                <LogOut size={20} />
                            </button>
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
