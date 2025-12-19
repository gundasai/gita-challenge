"use client";

import { motion } from "framer-motion";
import { Lock, CheckCircle, Play } from "lucide-react";
import Link from "next/link";

interface Day {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    isLocked: boolean;
}

export default function DashboardGrid({ currentDay, daysCompleted, daysData }: { currentDay: number; daysCompleted: boolean[]; daysData?: any[] }) {
    const days = Array.from({ length: 21 }, (_, i) => {
        const id = i + 1;
        const dayInfo = daysData?.find(d => d.id === id);

        let isLocked = id > currentDay;
        // Check Time Lock
        if (dayInfo?.unlockDate) {
            if (new Date(dayInfo.unlockDate) > new Date()) {
                isLocked = true;
            }
        }

        return {
            id,
            title: `Day ${id}`,
            description: "Unlock wisdom",
            isCompleted: daysCompleted[i] || false,
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
                                    ? `Available ${new Date(day.unlockDate).toLocaleDateString()}`
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
