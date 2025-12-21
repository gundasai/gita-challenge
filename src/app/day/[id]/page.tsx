"use client";

import { useAuth } from "@/context/AuthContext";
import { courseData } from "@/data/courseData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Quiz from "@/components/Quiz";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { doc, updateDoc, arrayUnion, serverTimestamp, increment, getDoc, setDoc as firestoreSetDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ReactNode } from 'react';

// Next.js 15+ Params type handling
// In Next.js 15, params is a Promise or needs to be treated carefully in async components.
// However, in "use client" components, we typically use useParams() hook for dynamic routes
import { useParams } from "next/navigation";
import { useAccessControl } from "@/hooks/useAccessControl";

export default function DayPage() {
    const { user, userData, loading, userRole } = useAuth();
    const { canAccess, checking } = useAccessControl();
    const params = useParams();
    const router = useRouter();
    const [dayData, setDayData] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizResult, setQuizResult] = useState({ score: 0, maxScore: 0 });

    const getVideoId = (urlOrId: string) => {
        if (!urlOrId) return "";
        // If it looks like a URL, try to extract ID. Added support for 'live/' URLs.
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
        const match = urlOrId.match(regExp);
        return (match && match[2].length === 11) ? match[2] : urlOrId;
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const fetchDayContent = async () => {
            if (params?.id) {
                const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
                try {
                    // Try fetching from Firestore first (Dynamic Data)
                    const docRef = doc(db, "days", `day_${id}`);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setDayData({ ...docSnap.data(), id: id });
                    } else {
                        // Fallback to static data if not found in DB
                        const data = courseData.find(d => d.id === id);
                        if (data) {
                            setDayData(data);
                        } else {
                            router.push("/404");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching day content:", error);
                    // Fallback on error
                    const data = courseData.find(d => d.id === id);
                    if (data) setDayData(data);
                }
            }
        };

        if (isClient) {
            fetchDayContent();
        }
    }, [params, router, isClient]);

    const handleQuizComplete = async (score: number, maxScore: number) => {
        setQuizCompleted(true);
        setQuizResult({ score, maxScore }); // Store result for display
        if (user && dayData) {
            try {
                const userRef = doc(db, "users", user.uid);
                // Use setDoc with merge to ensure quizScores map is created if it doesn't exist
                await firestoreSetDoc(userRef, {
                    currentDay: dayData.id + 1, // Unlock next day
                    daysCompleted: arrayUnion(dayData.id),
                    quizScores: {
                        [dayData.id]: score
                    },
                    totalScore: increment(score),
                    lastLogin: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error updating progress:", error);
            }
        }
    };

    // Show loading while checking access or Auth state
    if (loading || checking || !isClient) return <div className="p-12 text-center text-white">Loading...</div>;

    // Check if user is logged in
    if (!user) {
        if (isClient) router.push("/login");
        return null;
    }

    // Check if user has access (has started or is admin)
    if (!canAccess && userRole !== "admin") {
        if (isClient) router.push("/waiting");
        return null;
    }

    if (!dayData) return <div className="p-12 text-center text-white">Loading Day...</div>;

    const previousScore = userData?.quizScores?.[dayData.id];

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 sm:p-12">
            <div className="mx-auto max-w-4xl">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>

                <h1 className="mb-2 text-3xl font-bold text-[var(--saffron)]">{dayData.title}</h1>
                <p className="mb-8 text-gray-400">{dayData.description}</p>

                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getVideoId(dayData.videoId)}`}
                        title={dayData.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                    ></iframe>
                </div>

                <div className="mt-12">
                    {/* Time Lock Check */}
                    {dayData.unlockDate && new Date(dayData.unlockDate) > new Date() ? (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200 backdrop-blur-sm">
                            <Lock className="mx-auto mb-4 h-12 w-12 text-red-400" />
                            <h2 className="mb-2 text-2xl font-bold">This content is locked</h2>
                            <p>Available on: {new Date(dayData.unlockDate).toLocaleString()}</p>
                        </div>
                    ) : (
                        !quizStarted ? (
                            <div className="text-center">
                                <h2 className="mb-4 text-2xl font-bold text-[var(--cream)]">Ready to test your knowledge?</h2>
                                {userData?.daysCompleted?.includes(dayData.id) ? (
                                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-200">
                                        <p className="font-medium text-lg">You have already completed this day's challenge.</p>
                                        {previousScore !== undefined ? (
                                            <p className="mt-2 text-xl font-bold text-[var(--saffron)]">
                                                Your Score: {previousScore} / {dayData.quiz.reduce((acc: number, q: any) => acc + (q.marks || 1), 0)}
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-sm text-yellow-200/60">
                                                (Score was not recorded for this past attempt)
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setQuizStarted(true)}
                                        className="rounded-full bg-[var(--saffron)] px-8 py-3 text-lg font-bold text-white transition hover:brightness-110"
                                    >
                                        {dayData.id === 21 ? "Take Quiz and Complete the Gita Wisdom Course" : `Take Quiz to Unlock Day ${dayData.id + 1}`}
                                    </button>
                                )}
                            </div>
                        ) : quizCompleted ? (
                            dayData.id === 21 ? (
                                // Special completion screen for Day 21
                                <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 p-6 sm:p-12 text-center backdrop-blur-sm">
                                    {/* Animated background effect */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute -top-10 -left-10 h-40 w-40 animate-pulse rounded-full bg-yellow-500/30 blur-3xl"></div>
                                        <div className="absolute -bottom-10 -right-10 h-40 w-40 animate-pulse rounded-full bg-orange-500/30 blur-3xl" style={{ animationDelay: '1s' }}></div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <div className="mb-4 sm:mb-6 text-5xl sm:text-6xl animate-bounce">🎉</div>
                                        <h2 className="mb-3 sm:mb-4 text-2xl sm:text-4xl font-bold text-yellow-300 animate-pulse leading-tight">
                                            Congratulations {user?.displayName || 'Seeker'}!
                                        </h2>
                                        <p className="mb-4 sm:mb-6 text-lg sm:text-2xl font-semibold text-white px-2">
                                            You have completed the Gita Wisdom Course!
                                        </p>
                                        <p className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold text-[var(--saffron)]">
                                            Final Score: {quizResult.score} / {quizResult.maxScore}
                                        </p>
                                        <p className="mb-6 sm:mb-8 text-sm sm:text-lg text-gray-200 max-w-2xl mx-auto px-4">
                                            You have embarked on a transformative journey through the timeless wisdom of the Bhagavad Gita.
                                            May this knowledge illuminate your path forward. 🙏
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                                            <Link
                                                href="/"
                                                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-6 sm:px-8 py-3 font-bold text-white transition hover:brightness-110 shadow-lg"
                                            >
                                                View Your Achievement
                                            </Link>
                                            <Link
                                                href="/leaderboard"
                                                className="w-full sm:w-auto rounded-full bg-white/10 px-6 sm:px-8 py-3 font-medium text-white transition hover:bg-white/20"
                                            >
                                                Check Leaderboard
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Regular completion screen for Days 1-20
                                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center backdrop-blur-sm">
                                    <h2 className="mb-2 text-2xl font-bold text-green-400">Day Completed!</h2>
                                    <p className="mb-4 text-3xl font-bold text-[var(--saffron)]">Score: {quizResult.score} / {quizResult.maxScore}</p>
                                    <p className="mb-6 text-gray-300">You have successfully unlocked the next step of your journey.</p>
                                    <Link
                                        href="/"
                                        className="rounded-full bg-white/10 px-8 py-3 font-medium text-white transition hover:bg-white/20"
                                    >
                                        Return to Dashboard
                                    </Link>
                                </div>
                            )
                        ) : (
                            <Quiz questions={dayData.quiz} onComplete={handleQuizComplete} />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
