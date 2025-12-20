"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Clock, Calendar, Sparkles } from "lucide-react";

export default function WaitingPage() {
    const { user, userRole } = useAuth();
    const router = useRouter();
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        // Fetch start date from Firestore
        const fetchStartDate = async () => {
            try {
                const configDoc = await getDoc(doc(db, "settings", "courseConfig"));
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    if (data.startDate) {
                        // Handle Firestore Timestamp
                        const date = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
                        setStartDate(date);
                    }
                }
            } catch (error) {
                console.error("Error fetching start date:", error);
            }
        };

        fetchStartDate();
    }, []);

    useEffect(() => {
        if (!startDate) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = startDate.getTime() - now;

            if (distance < 0) {
                setHasStarted(true);
                clearInterval(timer);
                // Redirect to main page if admin, otherwise to home
                if (userRole === "admin") {
                    router.push("/admin");
                } else {
                    router.push("/");
                }
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setCountdown({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [startDate, router, userRole]);

    // Admin bypass - they can access admin panel anytime
    useEffect(() => {
        if (userRole === "admin" && hasStarted) {
            router.push("/admin");
        }
    }, [userRole, hasStarted, router]);

    if (!user) {
        router.push("/login");
        return null;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl space-y-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="flex justify-center"
                >
                    <div className="rounded-full bg-green-500/20 p-6">
                        <Sparkles className="h-16 w-16 text-green-400" />
                    </div>
                </motion.div>

                {/* Success Message */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-[var(--saffron)]">
                        Registration Successful!
                    </h1>
                    <p className="text-lg text-white">
                        Thank you for registering, {user.displayName?.split(" ")[0]}!
                    </p>
                </div>

                {/* Countdown Timer */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-[var(--cream)]">
                        <Clock className="h-5 w-5" />
                        <p className="text-xl font-medium">The Challenge starts in:</p>
                    </div>

                    {startDate ? (
                        <div className="grid grid-cols-4 gap-4">
                            {/* Days */}
                            <div className="rounded-lg border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-4">
                                <div className="text-4xl font-bold text-[var(--saffron)]">
                                    {countdown.days.toString().padStart(2, '0')}
                                </div>
                                <div className="mt-2 text-sm text-gray-400">Days</div>
                            </div>

                            {/* Hours */}
                            <div className="rounded-lg border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-4">
                                <div className="text-4xl font-bold text-[var(--saffron)]">
                                    {countdown.hours.toString().padStart(2, '0')}
                                </div>
                                <div className="mt-2 text-sm text-gray-400">Hours</div>
                            </div>

                            {/* Minutes */}
                            <div className="rounded-lg border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-4">
                                <div className="text-4xl font-bold text-[var(--saffron)]">
                                    {countdown.minutes.toString().padStart(2, '0')}
                                </div>
                                <div className="mt-2 text-sm text-gray-400">Minutes</div>
                            </div>

                            {/* Seconds */}
                            <div className="rounded-lg border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-4">
                                <div className="text-4xl font-bold text-[var(--saffron)]">
                                    {countdown.seconds.toString().padStart(2, '0')}
                                </div>
                                <div className="mt-2 text-sm text-gray-400">Seconds</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--saffron)] border-t-transparent"></div>
                            <p>Loading start date...</p>
                        </div>
                    )}
                </div>

                {/* Start Date Display */}
                {startDate && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-white/5 p-4 text-sm text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>
                            Challenge begins on: {" "}
                            <span className="font-semibold text-[var(--cream)]">
                                {startDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </span>
                    </div>
                )}

                {/* Message */}
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                    <p className="text-sm text-gray-300">
                        ✨ Get ready for an amazing spiritual journey! You'll receive access to the dashboard once the challenge begins.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
