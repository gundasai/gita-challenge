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
        <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-12 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full bg-gradient-to-b from-[var(--saffron)]/10 to-transparent blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-[400px]"
            >
                {/* Visual Pass / Ticket Container */}
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0C0C0C]/90 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl">

                    {/* Top Section - Brand/Status */}
                    <div className="relative bg-gradient-to-b from-white/[0.05] to-transparent p-10 pb-6 text-center">
                        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[var(--saffron)] to-transparent" />

                        <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-[var(--saffron)] mb-6">
                            Admission Confirmed
                        </span>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                            Gita Wisdom
                        </h1>
                        <p className="text-sm font-medium text-gray-400">
                            Course Intake: <span className="text-[var(--cream)]">January 2026</span>
                        </p>
                    </div>

                    {/* Dotted Divider Like a Ticket */}
                    <div className="relative flex items-center px-10">
                        <div className="absolute -left-3 h-6 w-6 rounded-full bg-[#050505] border-r border-white/10" />
                        <div className="w-full border-t border-dashed border-white/20" />
                        <div className="absolute -right-3 h-6 w-6 rounded-full bg-[#050505] border-l border-white/10" />
                    </div>

                    {/* Middle Section - Personal Details & Time */}
                    <div className="p-10 space-y-10">
                        <div className="flex justify-between items-end border-b border-white/5 pb-8">
                            <div className="space-y-1 text-left">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Student Name</span>
                                <p className="text-xl font-bold text-white leading-tight">
                                    {user.displayName || 'Participant'}
                                </p>
                            </div>
                            <div className="space-y-1 text-right">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</span>
                                <p className="text-sm font-black text-green-500 uppercase">Registered</p>
                            </div>
                        </div>

                        {/* Centered Countdown */}
                        <div className="bg-white/2 rounded-3xl p-8 border border-white/5">
                            <span className="block text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
                                Journey Begins In
                            </span>

                            {startDate ? (
                                <div className="flex justify-center items-center gap-6">
                                    {[
                                        { label: 'Days', value: countdown.days },
                                        { label: 'Hrs', value: countdown.hours },
                                        { label: 'Min', value: countdown.minutes },
                                        { label: 'Sec', value: countdown.seconds }
                                    ].map((item, idx) => (
                                        <div key={item.label} className="flex items-center gap-6">
                                            <div className="flex flex-col items-center">
                                                <span className="text-3xl font-black text-white lining-nums">
                                                    {item.value.toString().padStart(2, '0')}
                                                </span>
                                                <span className="text-[9px] font-bold text-[var(--saffron)] uppercase tracking-widest mt-1 opacity-60">
                                                    {item.label}
                                                </span>
                                            </div>
                                            {idx < 3 && <div className="h-4 w-px bg-white/10 mt-[-10px]" />}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex justify-center py-4">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--saffron)] border-t-transparent" />
                                </div>
                            )}
                        </div>

                        {/* WhatsApp CTA - Highlighted as Necessary */}
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-2">
                                <span className="rounded-full bg-red-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-500/20">
                                    Final Mandatory Step
                                </span>
                                <p className="text-[10px] text-center text-gray-400 font-bold tracking-wide">
                                    JOIN THE WHATSAPP GROUP FOR UPDATES
                                </p>
                            </div>

                            <a
                                href="https://chat.whatsapp.com/CgUtLgcTUsB16xgmuKGDwf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-white p-4 transition-all hover:bg-green-500 active:scale-[0.98]"
                            >
                                <svg className="h-4 w-4 fill-current text-black group-hover:text-white transition-colors" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                <span className="font-black text-[13px] text-black group-hover:text-white transition-colors uppercase tracking-tight">Join the WhatsApp Group</span>
                            </a>
                        </div>
                    </div>

                    {/* Bottom Mantra / Ticket Footer */}
                    <div className="bg-white/2 p-8 border-t border-white/5 text-center">
                        <p className="text-[10px] italic text-gray-400 opacity-60 max-w-[280px] mx-auto leading-relaxed">
                            "Abandon all varieties of religion and just surrender unto Me..." (BG 18.66)
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
