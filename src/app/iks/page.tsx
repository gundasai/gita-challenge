"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const topics = [
    { id: 1, letter: "A", verse: "2.13", title: "Atma", subtitle: "The Science of Soul" },
    { id: 2, letter: "B", verse: "9.34", title: "Bondage to Bhakti", subtitle: "Devotion to God" },
    { id: 3, letter: "C", verse: "2.7", title: "Confusion to Clarity", subtitle: "" },
    { id: 4, letter: "D", verse: "3.35", title: "Dharma", subtitle: "Dutifulness Material and Spiritual" },
    { id: 5, letter: "E", verse: "2.38", title: "Equanimity", subtitle: "Steady Mind" },
    { id: 6, letter: "F", verse: "5.29", title: "Friendship", subtitle: "Suhrud" },
    { id: 7, letter: "G", verse: "4.34", title: "Guru", subtitle: "Qualities of a Teacher" },
    { id: 8, letter: "H", verse: "6.21", title: "Happiness", subtitle: "Three Types of" },
    { id: 9, letter: "I", verse: "11.33", title: "Instrument", subtitle: "In the Hand of God" },
    { id: 10, letter: "J", verse: "2.22", title: "Journey of the Soul", subtitle: "" },
    { id: 11, letter: "K", verse: "3.9", title: "Karma", subtitle: "Art of Work" },
    { id: 12, letter: "L", verse: "3.37", title: "Lust", subtitle: "Our Greatest Enemy" },
    { id: 13, letter: "M", verse: "6.5", title: "Mind", subtitle: "Friend or Enemy" },
    { id: 14, letter: "N", verse: "14.26", title: "Nature", subtitle: "Three Modes" },
    { id: 15, letter: "O", verse: "10.41", title: "Opulences", subtitle: "That Attract Us" },
    { id: 16, letter: "P", verse: "4.2", title: "Parampara", subtitle: "The School of Transcendental Knowledge" },
    { id: 17, letter: "Q", verse: "16.1", title: "Qualities", subtitle: "Divine and Demoniac" },
    { id: 18, letter: "R", verse: "18.37", title: "Remembrance", subtitle: "" },
    { id: 19, letter: "S", verse: "18.66", title: "Surrender", subtitle: "Ultimate Teaching" },
    { id: 20, letter: "T", verse: "11.32", title: "Time", subtitle: "The Powerful Manifestation of the Lord" },
    { id: 21, letter: "U", verse: "15.4", title: "Ultimate Destination", subtitle: "" },
];

export default function IKSPage() {
    const [showContact, setShowContact] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AnimatePresence>
                <ContactPopup isOpen={showContact} onClose={() => setShowContact(false)} />
            </AnimatePresence>

            {/* Hero Section */}
            <div className="flex items-center justify-center p-4 min-h-[90vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center"
                >
                    {/* Visual Section */}
                    <div className="hidden md:block">
                        <div className="relative aspect-square rounded-full overflow-hidden border-4 border-[var(--saffron)]/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] bg-white/5 backdrop-blur-sm flex items-center justify-center p-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)]/10 to-purple-900/20 rounded-full animate-pulse"></div>
                            <img
                                src="/iks_course_logo_1770546672774.png"
                                alt="Gita Wisdom Course Logo"
                                className="w-full h-full object-cover rounded-full relative z-10 drop-shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowContact(true)}
                                className="inline-block px-4 py-1.5 rounded-full bg-[var(--saffron)]/10 border border-[var(--saffron)]/30 text-[var(--saffron)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--saffron)]/20 transition-colors cursor-pointer"
                            >
                                Register Your Institution →
                            </button>
                            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                Gita Wisdom Course
                            </h1>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                                Curriculum designed for Indian Knowledge Systems (IKS)
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Discover the timeless wisdom of the Gita through a structured, scientific, and practical course designed for modern students.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/iks/login"
                                className="flex-1 flex items-center justify-center px-8 py-4 rounded-xl bg-[var(--saffron)] text-white font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                            >
                                Student Login
                            </Link>
                            <Link
                                href="/iks/register"
                                className="flex-1 flex items-center justify-center px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Meet Your Guide Section */}
            <section id="speaker" className="py-24 px-4 bg-white/[0.02] border-t border-white/5">
                <div className="mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid gap-12 md:grid-cols-12 items-center"
                    >
                        {/* Speaker Image */}
                        <div className="md:col-span-4 relative group">
                            <div className="relative rounded-3xl border border-white/10 bg-white/5 shadow-2xl overflow-hidden">
                                <img
                                    src="/speaker_photo.png"
                                    alt="HG Suvarna GaurHari Das"
                                    className="w-full h-auto object-cover"
                                />
                                <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 border-t border-white/10">
                                    <p className="text-[var(--saffron)] font-black text-xl tracking-wide mb-1">
                                        HG Suvarna GaurHari Das
                                    </p>
                                    <p className="text-white text-sm font-bold opacity-90">
                                        Monk, Educator & Life Coach
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Speaker Details */}
                        <div className="md:col-span-8 space-y-6">
                            <div className="space-y-2">
                                <div className="inline-block rounded-full bg-[var(--saffron)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--saffron)]">
                                    Meet Your Guide
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                                    Empowering Minds through <span className="text-[var(--saffron)]">Ancient Wisdom</span> and Modern Wellness
                                </h2>
                            </div>

                            <div className="space-y-6 text-gray-300 text-lg leading-relaxed font-light">
                                <p>
                                    With over 13 years of dedicated full-time service, <span className="text-white font-medium">Suvarna GauraHari das</span> has established himself as a transformative force in the fields of value-based education and holistic well-being. His work bridges the gap between ancient Indian wisdom and the complexities of modern life.
                                </p>

                                <p>
                                    He has a vast experience of sharing the wisdom of the Bhagavad Gita. He has delivered talks at India’s premier institutions—including <span className="text-[var(--saffron)]/80">IITs, IIMs, NITK, and Manipal etc.</span> He specializes in empowering the next generation through youth-centric programs. Beyond academia, he is a trusted consultant for individuals and corporate organizations , offering high-impact seminars on lifestyle and stress management.
                                </p>

                                <div className="bg-white/5 border-l-4 border-[var(--saffron)] p-6 rounded-r-xl italic text-gray-400">
                                    "His mission is rooted in the belief that true success is a balance of professional excellence, ethics and purpose to serve."
                                </div>

                                <p>
                                    By promoting natural lifestyles, environmental sustainability, and the profound lessons of the Bhagavad Gita and Ramayana, he continues to guide thousands toward a more conscious and fulfilling way of life.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Course Topics Section */}
            <section className="py-24 px-4 bg-black/20 border-t border-white/5">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center space-y-4">
                        <h2 className="bg-gradient-to-b from-white via-[var(--cream)] to-[var(--saffron)] bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-5xl">
                            Course Curriculum
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
                            A comprehensive journey through the timeless wisdom of the Bhagavad Gita.
                        </p>
                        <div className="h-1.5 w-24 bg-[var(--saffron)] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {topics.map((topic, index) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-[var(--saffron)]/30 hover:shadow-[0_0_30px_-10px_rgba(255,153,51,0.3)]"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white group-hover:opacity-20 transition-opacity select-none">
                                    {topic.letter}
                                </div>

                                <div className="relative z-10">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--saffron)]/10 px-3 py-1 text-xs font-bold text-[var(--saffron)] border border-[var(--saffron)]/20">
                                        <span>Verse {topic.verse}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[var(--saffron)] transition-colors">
                                        {topic.title}
                                    </h3>

                                    {topic.subtitle && (
                                        <p className="text-gray-400 text-sm italic">
                                            {topic.subtitle}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Institution Registration CTA */}
            <section className="py-24 px-4 bg-white/[0.02] border-t border-white/5">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="rounded-3xl bg-gradient-to-br from-[var(--saffron)]/10 to-purple-900/20 border border-[var(--saffron)]/20 p-8 md:p-12 relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[var(--saffron)]/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"></div>

                        <div className="relative z-10 space-y-6">
                            <h2 className="text-2xl md:text-4xl font-bold text-white">
                                Want to bring this course to your Institution?
                            </h2>
                            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                                Join our network of educational institutions and empower your students with the timeless wisdom of the Gita.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <a
                                    href="tel:7095436770"
                                    className="px-8 py-4 rounded-xl bg-[var(--saffron)] text-white font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-[var(--saffron)]/20 hover:scale-105 active:scale-95 flex items-center gap-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    Register Your Institution
                                </a>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                or call us at <span className="text-[var(--saffron)] font-medium">7095436770</span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function ContactPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--saffron)]/20 bg-gray-900 p-8 shadow-2xl"
            >
                <div className="text-center space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--saffron)]/10 text-[var(--saffron)] border border-[var(--saffron)]/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Contact Us</h3>
                        <p className="text-gray-400 text-sm">To Register Your Institution</p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                        <p className="text-2xl font-mono font-bold text-[var(--saffron)]">
                            7095436770
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <a
                            href="tel:7095436770"
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--saffron)] px-4 py-3 font-bold text-white transition-all hover:brightness-110 active:scale-95"
                        >
                            Call Now
                        </a>
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-gray-300 transition-all hover:bg-white/10"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
