"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";

export default function CertificatePage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Reduced from 3 to prevent excessive memory usage
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: true, // Enable logging to console for debugging
            });

            const link = document.createElement('a');
            link.download = `Gita-Wisdom-Certificate-${user?.displayName?.replace(/\s+/g, '_') || 'Student'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error: any) {
            console.error("Certificate generation failed:", error);
            // Alert the specific error message for debugging
            alert(`Failed to generate certificate: ${error?.message || "Unknown error"}`);
        }
    };

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
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-full bg-[var(--saffron)] px-6 py-2 font-bold text-white transition hover:brightness-110"
                >
                    <Download size={18} />
                    Download Certificate
                </button>
            </div>

            {/* Certificate Container */}
            <div ref={certificateRef} className="mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-xl bg-[#ffffff] text-[#000000] shadow-2xl print:fixed print:inset-0 print:h-full print:w-full print:rounded-none print:shadow-none print:p-8">
                <div className="relative flex h-full flex-col p-6 md:p-12 print:p-8">
                    {/* Border Decoration */}
                    <div className="absolute inset-2 md:inset-4 border-[2px] md:border-[4px] border-double border-[var(--saffron)] opacity-50 print:inset-4"></div>
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 h-8 w-8 md:h-16 md:w-16 border-l-2 border-t-2 md:border-l-4 md:border-t-4 border-[var(--saffron)]"></div>
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 h-8 w-8 md:h-16 md:w-16 border-r-2 border-t-2 md:border-r-4 md:border-t-4 border-[var(--saffron)]"></div>
                    <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 h-8 w-8 md:h-16 md:w-16 border-l-2 border-b-2 md:border-l-4 md:border-b-4 border-[var(--saffron)]"></div>
                    <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 h-8 w-8 md:h-16 md:w-16 border-r-2 border-b-2 md:border-r-4 md:border-b-4 border-[var(--saffron)]"></div>

                    {/* Header Logos */}
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="h-12 w-12 md:h-24 md:w-24 relative">
                            {/* Make sure these images exist in public folder */}
                            <img
                                src="/iskcon_logo_v2.png"
                                alt="ISKCON Logo"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="flex flex-col items-center text-center px-2">
                            <h2 className="text-[10px] md:text-xl font-bold uppercase tracking-wider text-[var(--saffron)] print:text-[#000000] leading-tight">
                                International Society for Krishna Consciousness
                            </h2>
                            <p className="text-[8px] md:text-sm font-semibold text-[#4b5563] print:text-[#1f2937] mt-1">
                                Founder Acharya: His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
                            </p>
                        </div>

                        <div className="h-12 w-12 md:h-24 md:w-24 relative overflow-hidden rounded-full border-2 border-[#fed7aa]">
                            <img
                                src="/srila_prabhupada.jpg"
                                alt="Srila Prabhupada"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center space-y-2 md:space-y-4 print:space-y-4 pb-12 md:pb-32 print:pb-0">
                        <div className="space-y-1 md:space-y-2 print:space-y-2">
                            <h1 className="font-serif text-2xl md:text-5xl font-bold tracking-wider text-[#111827] uppercase print:text-5xl">Certificate</h1>
                            <h2 className="text-[10px] md:text-xl font-light tracking-[0.3em] text-[var(--saffron)] uppercase print:text-xl">of Completion</h2>
                        </div>

                        <div className="py-3 md:py-6 w-full max-w-2xl print:py-6">
                            <p className="text-xs md:text-lg italic text-[#6b7280] mb-1 md:mb-2 print:text-lg print:mb-2">This is to certify that</p>
                            <div className="border-b md:border-b-2 border-[#d1d5db] pb-3 md:pb-5 print:pb-2">
                                <h3 className="font-serif text-xl md:text-4xl font-bold text-[#1f2937] capitalize print:text-4xl">
                                    {user.displayName || "Seeker"}
                                </h3>
                            </div>
                        </div>

                        <div className="max-w-2xl space-y-2 md:space-y-4 print:space-y-4 px-4">
                            <p className="text-xs md:text-xl text-[#4b5563] print:text-xl leading-relaxed">
                                has successfully completed the <span className="font-bold text-[var(--saffron)]">Gita Wisdom Course- a 21 day online workshop on the Gita.</span>
                            </p>
                            <p className="hidden md:block text-[#6b7280] italic print:text-base text-xs md:text-base">
                                "This knowledge is the king of education, the most secret of all secrets. It is the purest knowledge, and because it gives direct perception of the self by realization, it is the perfection of religion."
                                <br />
                                <span className="text-[10px] md:text-sm not-italic text-[#9ca3af]">- Bhagavad Gita 9.2</span>
                            </p>
                            {/* Mobile only short quote to save space */}
                            <p className="md:hidden text-[8px] text-[#6b7280] italic">
                                "This knowledge is the king of education... the perfection of religion." - BG 9.2
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-6 md:bottom-12 left-0 right-0 z-10 flex items-end justify-between px-6 md:px-12 print:static print:px-0 print:pt-8 print:pb-0 print:mt-auto">
                        <div className="text-left">
                            <div className="mb-1 md:mb-2">
                                <img
                                    src="/signature.png"
                                    alt="Signature"
                                    className="h-8 md:h-16 w-auto object-contain -ml-1 md:-ml-2"
                                />
                            </div>
                            <p className="text-xs md:text-xl font-bold text-[#111827] print:text-[#000000]">HG Suvarna GaurHari Das</p>
                            <p className="text-[8px] md:text-sm font-bold text-[var(--saffron)] uppercase tracking-widest print:text-sm">COURSE INSTRUCTOR</p>
                        </div>

                        <div className="text-right pb-0.5 md:pb-1">
                            <p className="text-[10px] md:text-base font-medium text-[#374151] print:text-base">ISKCON South Bengaluru</p>
                            <p className="text-[8px] md:text-sm text-[#6b7280] mt-0.5 md:mt-1 print:text-sm">{new Date().toLocaleDateString()}</p>
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
