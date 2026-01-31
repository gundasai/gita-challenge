"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";

export default function CertificatePage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (loading || !isClient) return <div className="p-12 text-center text-white">Loading...</div>;

    if (!user) {
        router.push("/login");
        return null;
    }

    // Check if user has completed Day 21
    // Day IDs are 0-21. So completion of Day 21 means it should be in daysCompleted.
    const hasCompletedCourse = userData?.daysCompleted?.includes(21);

    if (!hasCompletedCourse && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[var(--background)] p-4 text-center">
                <h1 className="text-2xl font-bold text-[var(--saffron)]">Certificate Locked</h1>
                <p className="mt-2 text-gray-400">You must complete the course to unlock your certificate.</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-6 rounded-full bg-white/10 px-6 py-2 text-white hover:bg-white/20"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 print:fixed print:inset-0 print:z-[100] print:h-screen print:w-screen print:bg-white print:p-0">
            {/* Controls - Hidden when printing */}
            <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between print:hidden">
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-white"
                >
                    &larr; Back
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-full bg-[var(--saffron)] px-6 py-2 font-bold text-white transition hover:brightness-110"
                >
                    <Download size={18} />
                    Download / Print
                </button>
            </div>

            {/* Certificate Container */}
            <div className="mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-xl bg-white text-black shadow-2xl print:fixed print:inset-0 print:h-full print:w-full print:rounded-none print:shadow-none print:p-8">
                <div className="relative flex h-full flex-col p-12 print:p-8">
                    {/* Border Decoration */}
                    <div className="absolute inset-4 border-[4px] border-double border-[var(--saffron)] opacity-50 print:inset-4"></div>
                    <div className="absolute top-4 left-4 h-16 w-16 border-l-4 border-t-4 border-[var(--saffron)]"></div>
                    <div className="absolute top-4 right-4 h-16 w-16 border-r-4 border-t-4 border-[var(--saffron)]"></div>
                    <div className="absolute bottom-4 left-4 h-16 w-16 border-l-4 border-b-4 border-[var(--saffron)]"></div>
                    <div className="absolute bottom-4 right-4 h-16 w-16 border-r-4 border-b-4 border-[var(--saffron)]"></div>

                    {/* Header Logos */}
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="h-24 w-24 relative">
                            {/* Make sure these images exist in public folder */}
                            <img
                                src="/iskcon_logo_v2.png"
                                alt="ISKCON Logo"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <h2 className="text-xl font-bold uppercase tracking-wider text-[var(--saffron)] print:text-black">
                                International Society for Krishna Consciousness
                            </h2>
                            <p className="text-sm font-semibold text-gray-600 print:text-gray-800">
                                Founder Acharya: His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
                            </p>
                        </div>

                        <div className="h-24 w-24 relative overflow-hidden rounded-full border-2 border-orange-200">
                            <img
                                src="/srila_prabhupada.jpg"
                                alt="Srila Prabhupada"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center space-y-4 print:space-y-4 pb-32 print:pb-0">
                        <div className="space-y-2 print:space-y-2">
                            <h1 className="font-serif text-5xl font-bold tracking-wider text-gray-900 uppercase print:text-5xl">Certificate</h1>
                            <h2 className="text-xl font-light tracking-[0.3em] text-[var(--saffron)] uppercase print:text-xl">of Completion</h2>
                        </div>

                        <div className="py-6 w-full max-w-2xl print:py-6">
                            <p className="text-lg italic text-gray-500 mb-2 print:text-lg print:mb-2">This is to certify that</p>
                            <div className="border-b-2 border-gray-300 pb-2 print:pb-2">
                                <h3 className="font-serif text-4xl font-bold text-gray-800 capitalize print:text-4xl">
                                    {user.displayName || "Seeker"}
                                </h3>
                            </div>
                        </div>

                        <div className="max-w-2xl space-y-4 print:space-y-4">
                            <p className="text-xl text-gray-600 print:text-xl">
                                has successfully completed the <span className="font-bold text-[var(--saffron)]">Gita Wisdom Course- a 21 day online workshop on the Gita.</span>
                            </p>
                            <p className="text-gray-500 italic print:text-base">
                                "This knowledge is the king of education, the most secret of all secrets. It is the purest knowledge, and because it gives direct perception of the self by realization, it is the perfection of religion."
                                <br />
                                <span className="text-sm not-italic text-gray-400">- Bhagavad Gita 9.2</span>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-12 left-0 right-0 z-10 flex items-end justify-between px-12 print:static print:px-0 print:pt-8 print:pb-0 print:mt-auto">
                        <div className="text-left">
                            <div className="mb-2">
                                <img
                                    src="/signature.png"
                                    alt="Signature"
                                    className="h-16 w-auto object-contain -ml-2"
                                />
                            </div>
                            <p className="text-xl font-bold text-gray-900 print:text-black">HG Suvarna GaurHari Das</p>
                            <p className="text-sm font-bold text-[var(--saffron)] uppercase tracking-widest print:text-sm">COURSE INSTRUCTOR</p>
                        </div>

                        <div className="text-right pb-1">
                            <p className="text-base font-medium text-gray-700 print:text-base">ISKCON South Bengaluru</p>
                            <p className="text-sm text-gray-500 mt-1 print:text-sm">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0mm;
                    }
                    body {
                        background: white;
                        margin: 0;
                        padding: 0;
                        overflow: visible !important;
                    }
                    /* Ensure background graphics are printed */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
