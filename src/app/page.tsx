"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardGrid from "@/components/DashboardGrid";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, PlayCircle, Award, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAccessControl } from "@/hooks/useAccessControl";

export default function Home() {
  const { user, userData, loading, userRole } = useAuth();
  const { canAccess, checking } = useAccessControl();
  const [daysData, setDaysData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          // Fetch Days Data (for unlock dates)
          const daysCol = collection(db, "days");
          const daysSnap = await getDocs(daysCol);
          const days = daysSnap.docs.map(doc => ({ ...doc.data(), id: parseInt(doc.id.replace('day_', '')) }));
          setDaysData(days);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    }
    fetchData();
  }, [user]);

  // Show loading while checking access
  if (checking || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  // If logged in and access granted (or admin), show dashboard
  if (user && (canAccess || userRole === "admin")) {
    const currentDay = userData?.currentDay || 1;
    const daysCompleted = userData?.daysCompleted || [];
    // Convert daysCompleted array of IDs to boolean array for grid
    const daysCompletedBool = Array(21).fill(false).map((_, i) => daysCompleted.includes(i + 1));
    const completedCount = daysCompleted.length;

    return (
      <main className="min-h-screen bg-[var(--background)] p-6 sm:p-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--saffron)]">My Journey</h1>
              <p className="text-gray-400">Welcome back, {user.displayName?.split(" ")[0]}</p>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/10">
              <div className="text-center">
                <p className="text-xs text-gray-500">Current Streak</p>
                <p className="text-xl font-bold text-[var(--saffron)]">{userData?.streak || 0} Days</p>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-xl font-bold text-[var(--cream)]">{completedCount}/21</p>
              </div>
            </div>
          </header>

          <DashboardGrid currentDay={currentDay} daysCompleted={daysCompletedBool} daysData={daysData} />
        </div>
      </main>
    );
  }

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="absolute inset-0 z-0 bg-radial-gradient from-[var(--saffron)]/10 to-transparent opacity-50"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-4xl space-y-6"
        >
          <h1 className="bg-linear-to-b from-[var(--saffron)] to-[var(--cream)] bg-clip-text text-5xl font-extrabold text-transparent sm:text-7xl">
            21 Day Gita Challenge
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400 sm:text-xl">
            Unlock timeless wisdom. Transform your life. Join thousands of seekers on a 21-day spiritual journey through the Bhagavad Gita.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-full bg-[var(--saffron)] px-8 py-4 text-lg font-bold text-white transition hover:brightness-110"
            >
              Register Now
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#learn-more"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-medium text-white transition hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="learn-more" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-3xl font-bold text-[var(--cream)] sm:text-4xl">
            What You Will Learn
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<PlayCircle size={32} className="text-[var(--saffron)]" />}
              title="Daily Wisdom"
              description="Watch curated video content explaining core concepts of the Gita in a modern context."
            />
            <FeatureCard
              icon={<BookOpen size={32} className="text-[var(--saffron)]" />}
              title="Interactive Quizzes"
              description="Test your understanding with daily quizzes that unlock the next step in your journey."
            />
            <FeatureCard
              icon={<Award size={32} className="text-[var(--saffron)]" />}
              title="Earn Certification"
              description="Complete the 21-day challenge and receive a digital certificate of completion."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-[var(--saffron)]/30"
    >
      <div className="mb-4 inline-block rounded-xl bg-black/30 p-3">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-[var(--cream)]">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}
