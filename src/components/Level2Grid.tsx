
"use client";

import { motion } from "framer-motion";
import { Lock, CheckCircle, Play } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Day {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    isLocked: boolean;
}

export default function Level2Grid({ currentDay, daysCompleted, daysData }: { currentDay: number; daysCompleted: number[]; daysData?: any[] }) {
    const { userData } = useAuth();
    const [alumniCutoffDate, setAlumniCutoffDate] = useState<Date | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configDoc = await getDoc(doc(db, "settings", "courseConfig"));
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    let cutoff = null;

                    // Prefer Registration Date (Batch Cutoff)
                    if (data.registrationDate) {
                        cutoff = data.registrationDate.toDate ? data.registrationDate.toDate() : new Date(data.registrationDate);
                    }
                    // Fallback to Start Date (Old Logic)
                    else if (data.startDate) {
                        cutoff = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
                    }

                    setAlumniCutoffDate(cutoff);
                }
            } catch (error) {
                console.error("Error fetching batch config:", error);
            } finally {
                setLoadingConfig(false);
            }
        };
        fetchConfig();
    }, []);

    // Level 2 consists of 21 days (Day 1 to Day 21)
    const level2StartDay = 22;
    const level2Length = 21; // Changed from 22 to 21 per user request

    const days = Array.from({ length: level2Length }, (_, i) => {
        const id = level2StartDay + i;
        const dayInfo = daysData?.find(d => d.id === id);

        let isAlumni = false;

        if (alumniCutoffDate && userData?.createdAt) {
            const userCreated = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
            if (userCreated < alumniCutoffDate) {
                isAlumni = true;
            }
        }

        // 1. SEQUENTIAL LOCK
        // Day 22 unlocks if Day 21 is complete (which is a given if this grid is shown).
        // Day N unlocks if Day N-1 is in daysCompleted.
        let isLocked = !daysCompleted.includes(id - 1);

        // 2. TIME LOCK (Only for Current Batch)
        if (!isAlumni && dayInfo?.unlockDate) {
            if (new Date(dayInfo.unlockDate) > new Date()) {
                isLocked = true;
            }
        }

        return {
            id,
            title: `Week ${i + 1}`, // Updated to Week
            displayTitle: `Week ${i + 1}`,
            description: "Advanced Wisdom",
            isCompleted: daysCompleted.includes(id) || false,
            isLocked,
            unlockDate: dayInfo?.unlockDate
        };
    });

    const level2CompletedCount = days.filter(d => d.isCompleted).length;

    // Calculate Level 2 Score
    let level2Score = 0;
    if (userData?.quizScores) {
        for (let i = level2StartDay; i < level2StartDay + level2Length; i++) {
            if (userData.quizScores[i]) {
                level2Score += userData.quizScores[i];
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Level 2 Metrics */}
            <div className="flex items-center gap-4 rounded-xl bg-blue-900/20 p-4 border border-blue-500/30">
                <div className="flex-1 text-center border-r border-blue-500/30">
                    <p className="text-[10px] uppercase tracking-wider text-blue-300 font-bold">Level 2 Progress</p>
                    <p className="text-xl font-bold text-white">{level2CompletedCount}/{level2Length} Weeks</p>
                </div>
                <div className="flex-1 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-blue-300 font-bold">Level 2 Marks</p>
                    <p className="text-xl font-bold text-blue-100">{level2Score}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {days.map((day, index) => (
                    <motion.div
                        key={day.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            href={day.isLocked ? "#" : `/day/${day.id}`}
                            className={`group relative block h-full overflow-hidden rounded-2xl border ${day.isLocked
                                ? "border-white/5 bg-white/5 cursor-not-allowed"
                                : "border-blue-500/30 bg-gradient-to-br from-black/40 to-blue-500/10 hover:border-blue-400"
                                } p-6 transition-all duration-300`}
                        >
                            <div className="flex items-start justify-between">
                                <h3 className={`text-xl font-bold ${day.isLocked ? "text-gray-500" : "text-blue-100"}`}>
                                    {day.displayTitle}
                                </h3>
                                {day.isLocked ? (
                                    <Lock className="text-gray-600" size={20} />
                                ) : day.isCompleted ? (
                                    <CheckCircle className="text-green-400" size={20} />
                                ) : (
                                    <Play className="text-blue-400" size={20} />
                                )}
                            </div>

                            <p className={`mt-4 text-sm ${day.isLocked ? "text-gray-600" : "text-gray-300"}`}>
                                {day.isLocked
                                    ? (day.unlockDate && new Date(day.unlockDate) > new Date()
                                        ? `Available ${new Date(day.unlockDate).toLocaleDateString()} ${new Date(day.unlockDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                        : "Complete previous week to unlock")
                                    : "Ready to start"}
                            </p>

                            {!day.isLocked && (
                                <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500/20">
                                    <motion.div
                                        className="h-full bg-blue-500"
                                        initial={{ width: "0%" }}
                                        whileHover={{ width: "100%" }}
                                    />
                                </div>
                            )}
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
