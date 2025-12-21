"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useRouter } from "next/navigation";

interface LeaderboardUser {
    uid: string;
    displayName: string;
    daysCompleted: number[];
    streak: number;
    totalScore: number;
    role?: string;
}

export default function LeaderboardPage() {
    const { loading: authLoading, userRole } = useAuth();
    const { canAccess, checking } = useAccessControl();
    const router = useRouter();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!checking && !authLoading) {
            if (canAccess || userRole === "admin") {
                fetchLeaderboard();
            }
        }
    }, [checking, authLoading, canAccess, userRole]);

    const fetchLeaderboard = async () => {
        try {
            // Firestore doesn't support array length sorting directly without a computed field.
            // For now, we fetch a limit and sort client side, or assume we have 'exp' or similar field.
            // Let's use 'streak' as a proxy for engagement for now, or just fetch all (if small app)
            // Ideally we would add a 'completedCount' field to users as they finish days.

            const usersCol = collection(db, "users");
            const snapshot = await getDocs(usersCol);

            const leaderboardData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    uid: doc.id,
                    displayName: data.displayName || "Anonymous",
                    daysCompleted: data.daysCompleted || [],
                    streak: data.streak || 0,
                    totalScore: data.totalScore || 0,
                    role: data.role || "user",
                    // Calculated field for sorting logic if needed, but we use totalScore now
                    score: data.totalScore || 0
                };
            });

            // Sort by Total Score > Days Completed > Name (Alphabetical)
            leaderboardData.sort((a, b) => {
                if (b.totalScore !== a.totalScore) {
                    return b.totalScore - a.totalScore; // Higher score first
                }
                if (b.daysCompleted.length !== a.daysCompleted.length) {
                    return b.daysCompleted.length - a.daysCompleted.length; // More days first
                }
                return a.displayName.localeCompare(b.displayName); // Alphabetical
            });

            // Filter out admins
            const filteredUsers = leaderboardData.filter(user => user.role !== 'admin');

            setUsers(filteredUsers.slice(0, 50));
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || checking || loading) return <div className="p-12 text-center text-white">Loading Leaderboard...</div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 sm:p-12">
            <div className="mx-auto max-w-4xl">
                <Link href="/" className="mb-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>

                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-[var(--saffron)]">Seeker's Leaderboard</h1>
                    <p className="mt-2 text-gray-400">Top dedicated souls on the journey</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 border-b border-white/10 bg-white/5 p-4 text-sm font-medium text-gray-400">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-7">Seeker</div>
                        <div className="col-span-2 text-center">Score</div>
                        <div className="col-span-2 text-center">Days</div>
                    </div>

                    {users.map((user, index) => (
                        <motion.div
                            key={user.uid}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`grid grid-cols-12 gap-4 border-b border-white/5 p-4 items-center transition hover:bg-white/5 ${index < 3 ? "bg-[var(--saffron)]/5" : ""
                                }`}
                        >
                            <div className="col-span-1 flex justify-center">
                                {index === 0 && <Trophy className="text-yellow-400" />}
                                {index === 1 && <Medal className="text-gray-300" />}
                                {index === 2 && <Award className="text-amber-700" />}
                                {index > 2 && <span className="text-gray-500 font-mono">#{index + 1}</span>}
                            </div>
                            <div className="col-span-7 font-medium text-[var(--cream)]">
                                {user.displayName}
                            </div>
                            <div className="col-span-2 text-center font-bold text-[var(--saffron)]">
                                {user.totalScore}
                            </div>
                            <div className="col-span-2 text-center text-gray-400">
                                {user.daysCompleted.length}/21
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
