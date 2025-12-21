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

                {/* WhatsApp Group Link */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="overflow-hidden rounded-xl border border-green-500/30 bg-green-500/10 p-1"
                >
                    <div className="rounded-lg bg-green-500/5 px-6 py-8">
                        <h3 className="mb-4 text-xl font-bold text-green-400">
                            Join our Community!
                        </h3>
                        <p className="mb-6 text-gray-300">
                            Connect with fellow participants and get daily updates in our official WhatsApp group.
                        </p>
                        <a
                            href="https://chat.whatsapp.com/CgUtLgcTUsB16xgmuKGDwf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-3 font-semibold text-white transition-all hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                        >
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Join Official WhatsApp Group
                        </a>
                    </div>
                </motion.div>

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
