"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from "firebase/firestore";
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
    lastScoreUpdatedAt?: any; // Timestamp
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
            // Fetch Limit first
            let displayLimit = 50;
            try {
                const configDoc = await getDoc(doc(db, "settings", "courseConfig"));
                if (configDoc.exists() && configDoc.data().leaderboardLimit) {
                    displayLimit = configDoc.data().leaderboardLimit;
                }
            } catch (e) {
                console.error("Error fetching display limit", e);
            }

            const usersRef = collection(db, "users");
            // Optimization: Query only top users by score. 
            // Note: Users without 'totalScore' field (0 score) will be excluded by the index.
            const q = query(
                usersRef,
                orderBy("totalScore", "desc"),
                limit(displayLimit + 10)
            );

            const snapshot = await getDocs(q);

            const leaderboardData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    uid: doc.id,
                    displayName: data.displayName || "Anonymous",
                    daysCompleted: data.daysCompleted || [],
                    streak: data.streak || 0,
                    totalScore: data.totalScore || 0,
                    lastScoreUpdatedAt: data.lastScoreUpdatedAt, // May be undefined for old records
                    role: data.role || "user",
                };
            });

            // Client-side sort for precise tie-breaking among the top fetched users
            // Sort by Total Score > Time Achieved (Earlier is better) > Days Completed > Name
            leaderboardData.sort((a, b) => {
                if (b.totalScore !== a.totalScore) {
                    return b.totalScore - a.totalScore; // Higher score first
                }

                // Tie breaker: Who scored first? (Earlier timestamp wins)
                if (a.lastScoreUpdatedAt && b.lastScoreUpdatedAt) {
                    const timeA = a.lastScoreUpdatedAt.toMillis ? a.lastScoreUpdatedAt.toMillis() : 0;
                    const timeB = b.lastScoreUpdatedAt.toMillis ? b.lastScoreUpdatedAt.toMillis() : 0;
                    if (timeA !== timeB) return timeA - timeB; // Ascending time
                } else if (a.lastScoreUpdatedAt) {
                    return -1; // a wins
                } else if (b.lastScoreUpdatedAt) {
                    return 1; // b wins
                }

                if (b.daysCompleted.length !== a.daysCompleted.length) {
                    return b.daysCompleted.length - a.daysCompleted.length; // More days first
                }
                return a.displayName.localeCompare(b.displayName); // Alphabetical
            });

            // Filter out admins and slice to exact limit
            const filteredUsers = leaderboardData
                .filter(user => user.role !== 'admin')
                .slice(0, displayLimit);

            setUsers(filteredUsers);
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
                                {user.daysCompleted.length}/22
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
