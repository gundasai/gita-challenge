"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function TopicsPage() {
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

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-[var(--saffron)] selection:text-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2 text-[var(--saffron)]">
                        <BookOpen size={24} />
                        <span className="font-bold tracking-widest uppercase text-sm">Course Curriculum</span>
                    </div>
                </div>

                {/* Title Section */}
                <div className="mb-16 text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-b from-white via-[var(--cream)] to-[var(--saffron)] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl"
                    >
                        Course Topics
                    </motion.h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
                        A comprehensive journey through the timeless wisdom of the Bhagavad Gita, structured from A to U.
                    </p>
                    <div className="h-1.5 w-24 bg-[var(--saffron)] mx-auto rounded-full mt-6"></div>
                </div>

                {/* Topics Grid */}
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {topics.map((topic, index) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
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

                {/* Footer Note */}
                <div className="mt-20 text-center">
                    <p className="text-gray-500 text-sm">
                        Introduction: <span className="text-gray-300 font-medium">Setting The Scene</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
