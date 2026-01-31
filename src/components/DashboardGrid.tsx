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

export default function DashboardGrid({ currentDay, daysCompleted, daysData }: { currentDay: number; daysCompleted: number[]; daysData?: any[] }) {
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

    const days = Array.from({ length: 22 }, (_, i) => {
        // IDs from 0 to 21. i starts at 0.
        const id = i;
        const dayInfo = daysData?.find(d => d.id === id);

        // --- BATCH LOGIC START ---

        let isAlumni = false;

        if (alumniCutoffDate && userData?.createdAt) {
            const userCreated = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
            // Alumni Check: If user created BEFORE batch cutoff => Alumni (Unlock All Time Locks)
            if (userCreated < alumniCutoffDate) {
                isAlumni = true;
            }
        }

        // 1. SEQUENTIAL LOCK (Universal Rule)
        // Day 0 is always unlocked.
        // Day N is unlocked ONLY if Day N-1 is in daysCompleted.
        let isLocked = id === 0 ? false : !daysCompleted.includes(id - 1);

        // 2. TIME LOCK (Only for Current Batch)
        // If I am NOT an alumni, I must verify the Admin-set unlock date.
        // If I AM an alumni, I ignore the date check (so I don't get locked out by new batch dates).
        if (!isAlumni && dayInfo?.unlockDate) {
            if (new Date(dayInfo.unlockDate) > new Date()) {
                isLocked = true;
            }
        }

        return {
            id,
            title: id === 0 ? "Intro" : `Day ${id}`,
            description: id === 0 ? "Introduction" : "Unlock wisdom",
            isCompleted: daysCompleted.includes(id) || false,
            isLocked,
            unlockDate: dayInfo?.unlockDate
        };
    });

    return (
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
                            : "border-[var(--saffron)]/30 bg-gradient-to-br from-black/40 to-[var(--saffron)]/10 hover:border-[var(--saffron)]"
                            } p-6 transition-all duration-300`}
                    >
                        <div className="flex items-start justify-between">
                            <h3 className={`text-xl font-bold ${day.isLocked ? "text-gray-500" : "text-[var(--cream)]"}`}>
                                Day {day.id}
                            </h3>
                            {day.isLocked ? (
                                <Lock className="text-gray-600" size={20} />
                            ) : day.isCompleted ? (
                                <CheckCircle className="text-green-400" size={20} />
                            ) : (
                                <Play className="text-[var(--saffron)]" size={20} />
                            )}
                        </div>

                        <p className={`mt-4 text-sm ${day.isLocked ? "text-gray-600" : "text-gray-300"}`}>
                            {day.isLocked
                                ? (day.unlockDate && new Date(day.unlockDate) > new Date()
                                    ? `Available ${new Date(day.unlockDate).toLocaleDateString()} ${new Date(day.unlockDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : "Complete previous day to unlock")
                                : "Ready to start"}
                        </p>

                        {!day.isLocked && (
                            <div className="absolute bottom-0 left-0 h-1 w-full bg-[var(--saffron)]/20">
                                <motion.div
                                    className="h-full bg-[var(--saffron)]"
                                    initial={{ width: "0%" }}
                                    whileHover={{ width: "100%" }}
                                />
                            </div>
                        )}
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
