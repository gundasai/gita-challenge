"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardGrid from "@/components/DashboardGrid";
import Level2Grid from "@/components/Level2Grid";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  PlayCircle,
  Award,
  ArrowRight,
  Clock,
  Briefcase,
  Sparkles,
  Coffee,
  MapPin,
  Share2,
  Quote,
  ChevronLeft,
  ChevronRight,
  Heart,
  Phone,
  Mail
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAccessControl } from "@/hooks/useAccessControl";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
}

interface Volunteer {
  id: string;
  name: string;
  role: string;
}

export default function Home() {
  const { user, userData, loading, userRole } = useAuth();
  const { canAccess, checking } = useAccessControl();
  const [daysData, setDaysData] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const volunteersRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };



  useEffect(() => {
    async function fetchData() {
      // Fetch Days
      if (user) {
        try {
          const daysCol = collection(db, "days");
          const daysSnap = await getDocs(daysCol);
          const days = daysSnap.docs.map(doc => ({
            ...doc.data(),
            id: parseInt(doc.id.replace('day_', ''))
          }));
          setDaysData(days);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }

      // Fetch Testimonials
      try {
        const testCol = collection(db, "testimonials");
        const testSnap = await getDocs(testCol);
        if (!testSnap.empty) {
          setTestimonials(testSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
        } else {
          // Default Testimonials
          setTestimonials([
            { id: "1", name: "Rahul Verma", role: "Software Engineer", message: "This course changed my perspective on stress management. Highly recommended!" },
            { id: "2", name: "Priya Singh", role: "Product Manager", message: "The 20-minute daily format is perfect for my busy schedule. I feel more focused." },
            { id: "3", name: "Amit Kumar", role: "Entrepreneur", message: "Ancient wisdom applied to modern problems. A truly transformative experience." },
            { id: "4", name: "Sneha Gupta", role: "Medical Student", message: "The clarity I gained from these sessions has improved my studies significantly." },
            { id: "5", name: "Vikram Malhotra", role: "Corporate Lead", message: "A must-do for anyone feeling the burnout of city life. Simple yet profound." }
          ]);
        }
      } catch (err) { console.error("Error fetching testimonials", err); }

      // Fetch Volunteers
      try {
        const volCol = collection(db, "volunteers");
        const volSnap = await getDocs(volCol);
        if (!volSnap.empty) {
          setVolunteers(volSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer)));
        } else {
          // Default Volunteers
          setVolunteers([
            { id: "1", name: "Arjun Das", role: "Coordinator" },
            { id: "2", name: "Meera Reddy", role: "Event Manager" },
            { id: "3", name: "Suresh Nair", role: "Tech Support" },
            { id: "4", name: "Karthik R", role: "Content Creator" },
            { id: "5", name: "Ananya P", role: "Outreach Lead" }
          ]);
        }
      } catch (err) { console.error("Error fetching volunteers", err); }
    }
    fetchData();
  }, [user]);

  const handleShare = () => {
    const text = "Hey guys! 🧘‍♂️ I’m signing up for this 21-Day Recharge starting January 1st. It’s built for the 'corporate soul'—short 20-minute sessions to help with stress and focus.\n\n'Everything is better with a friend,' so I’m sharing it here! Would love for a few of us to take the challenge together and start the year strong.\n\nRegister here if you're in: https://gita-challenge-uqv6.vercel.app/";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (checking || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--saffron)] border-t-transparent"></div>
      </div>
    );
  }

  // Dashboard View (Logged in + Access)
  if (user && (canAccess || userRole === "admin")) {
    // Redirect pending users to waiting page
    if (userData?.status === 'pending' && userData?.institutionId) {
      // Use window.location for full redirect to avoid issues, or router
      // Since we are in a component, returning null and using useEffect is better, 
      // but here we are in render logic. 
      // Let's use a return statement with a redirect effect or just return the waiting component?
      // Better to redirect.
      if (typeof window !== 'undefined') {
        window.location.href = "/waiting";
        return null;
      }
    }

    const currentDay = userData?.currentDay !== undefined ? userData.currentDay : 0;
    const daysCompleted = userData?.daysCompleted || [];

    // Level 1 Logic: Count distinct days with ID <= 21 (Total 22 days: 0-21)
    const level1DaysCompleted = new Set(daysCompleted.filter((id: number) => id <= 21));
    const completedCount = level1DaysCompleted.size;

    // Calculate Level 1 Score (Sum of scores for days 0-21)
    let level1Score = 0;
    if (userData?.quizScores) {
      Object.entries(userData.quizScores).forEach(([dayId, score]) => {
        if (parseInt(dayId) <= 21) {
          level1Score += (score as number);
        }
      });
    }

    return (
      <main className="min-h-screen bg-[var(--background)] p-6 sm:p-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--saffron)]">My Journey</h1>
              <p className="text-gray-400">Welcome back, {user.displayName?.split(" ")[0]}</p>
            </div>

            <div className="flex gap-4">
              {userData?.daysCompleted?.includes(21) && (
                <Link
                  href="/certificate"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
                >
                  <Award size={20} />
                  <span className="hidden sm:inline">Certificate</span>
                </Link>
              )}

              {userData?.daysCompleted?.includes(21) && !userData?.institutionId && (
                <Link
                  href="/donate"
                  className="flex items-center gap-2 rounded-xl border border-[var(--saffron)]/40 bg-[var(--saffron)]/10 px-4 py-2 font-bold text-[var(--saffron)] transition-all hover:scale-105 hover:bg-[var(--saffron)]/20 hover:border-[var(--saffron)] shadow-lg shadow-orange-500/5 hover:shadow-orange-500/20"
                >
                  <Heart size={20} />
                  <span>Donations Accepted</span>
                </Link>
              )}

              <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/10 shadow-2xl">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Marks</p>
                  <p className="text-xl font-bold text-[var(--saffron)]">{level1Score}</p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Completed</p>
                  <p className="text-xl font-bold text-[var(--cream)]">{completedCount}/22</p>
                </div>
              </div>
            </div>
          </header>

          <DashboardGrid currentDay={currentDay} daysCompleted={daysCompleted} daysData={daysData} />

          {/* Level 2 Section - Only visible after completing Level 1 (Day 21) */}
          {daysCompleted.includes(21) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-12 space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/30"></div>
                <h2 className="text-2xl font-bold text-blue-400 uppercase tracking-widest text-center">Level 2: Advanced Wisdom</h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/30"></div>
              </div>
              <Level2Grid currentDay={currentDay} daysCompleted={daysCompleted} daysData={daysData} />
            </motion.div>
          )}
        </div>
      </main>
    );
  }

  // Landing Page View
  return (
    <div className="bg-gray-950 text-white selection:bg-[var(--saffron)] selection:text-white">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[var(--saffron)]/10 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-600/10 blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-5xl space-y-8 text-center"
        >


          <h1 className="bg-gradient-to-b from-white via-[var(--cream)] to-[var(--saffron)] bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-8xl">
            Gita Wisdom Course
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed">
            Behind the glass buildings and endless meetings, there’s a quiet search for something more.
            Reclaim your inner peace with a habit designed for the modern soul.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
            <Link
              href="/signup"
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[var(--saffron)] px-10 py-5 text-lg font-bold text-white shadow-[0_10px_40px_rgba(255,153,51,0.3)] transition-all hover:scale-105 hover:shadow-[0_15px_50px_rgba(255,153,51,0.4)] active:scale-95"
            >
              <span>Register Now</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#the-journey"
              className="rounded-full border border-white/10 bg-white/5 px-10 py-5 text-lg font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>

          <div className="pt-8">
            <Link
              href="/iks"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 hover:border-blue-400/50 transition-all hover:scale-105"
            >
              <div className="flex flex-col text-left">
                <span className="text-white font-bold">Indian Knowledge Systems</span>
                <span className="text-[10px] text-blue-200/80 font-medium">A portal for Educational Institutions</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-300" />
            </Link>
          </div>
        </motion.div>

        {/* Floating elements styling */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <div className="h-10 w-0.5 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Speaker Section */}
      <section id="speaker" className="py-24 px-4 bg-white/[0.02] scroll-mt-32">
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

      {/* The Context / Corporate Soul Section */}
      <section id="the-journey" className="relative py-24 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="mx-auto max-w-5xl space-y-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid gap-12 md:grid-cols-2 items-center"
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[var(--cream)] md:text-5xl tracking-tight">
                The Rhythm of the City
              </h2>
              <div className="space-y-4 text-lg text-gray-400 leading-relaxed font-light">
                <p>
                  We all know the rhythm. Behind the glass buildings, the high-speed internet, and the endless meetings, there’s a quiet search for something more.
                </p>
                <p>
                  Between the deadlines and the commute, it’s easy to lose touch with our inner peace. We realize the New Year is more than just a calendar change—it’s the perfect opportunity for a fresh start.
                </p>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-[var(--saffron)]/10 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase size={80} className="text-[var(--saffron)] opacity-20" />
              </div>
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                alt="Modern Cityscape"
                className="w-full h-full object-cover grayscale opacity-40"
              />
            </div>
          </motion.div>

          {/* Intro to 21-Day Recharge */}
          <div className="rounded-3xl border border-[var(--saffron)]/20 bg-gradient-to-br from-[var(--saffron)]/5 to-transparent p-8 md:p-12 text-center space-y-6 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-[var(--saffron)]/10 blur-3xl rounded-full"></div>
            <Sparkles className="mx-auto text-[var(--saffron)] h-12 w-12" />
            <h3 className="text-2xl md:text-4xl font-bold text-white">The 21-Day Recharge</h3>
            <p className="mx-auto max-w-3xl text-lg text-gray-400 font-light leading-relaxed">
              Designed specifically for the busy corporate soul. This isn't a heavy academic course; it’s a spiritual habit designed to fit into your life, not take it over.
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl font-bold text-[var(--cream)] md:text-4xl">Why Join This Journey?</h2>
            <div className="h-1.5 w-24 bg-[var(--saffron)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <BenefitCard
              icon={<Clock className="text-[var(--saffron)]" size={32} />}
              title="Your Schedule"
              description="No matter how busy your shift is, sessions are ready when you are."
            />
            <BenefitCard
              icon={<Coffee className="text-[var(--saffron)]" size={32} />}
              title="Micro-Learning"
              description="Only 20 minutes a day. Deeper impact than a coffee break."
            />
            <BenefitCard
              icon={<Sparkles className="text-[var(--saffron)]" size={32} />}
              title="Daily Clarity"
              description="Quick quizzes before midnight help lock in the day's wisdom."
            />
            <BenefitCard
              icon={<MapPin className="text-[var(--saffron)]" size={32} />}
              title="Total Flexibility"
              description="Attend from anywhere—your PG, your office, or your home."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[var(--cream)] md:text-4xl">Voices of Transformation</h2>
            <div className="h-1.5 w-24 bg-[var(--saffron)] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="relative group/slider">
            {/* Left Button */}
            <button
              onClick={() => scroll(testimonialsRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-[var(--saffron)] disabled:opacity-0"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Horizontal Drag Slider */}
            <div
              ref={testimonialsRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory px-4 scroll-smooth scrollbar-hide"
            >
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="snap-center shrink-0 w-[300px] md:w-[400px] rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm relative flex flex-col justify-between"
                >
                  <Quote className="absolute top-6 right-6 text-[var(--saffron)]/20 h-12 w-12" />
                  <p className="text-gray-300 italic mb-6 leading-relaxed">"{test.message}"</p>
                  <div>
                    <h4 className="text-[var(--saffron)] font-bold text-lg">{test.name}</h4>
                    <p className="text-gray-500 text-sm">{test.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Button */}
            <button
              onClick={() => scroll(testimonialsRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-[var(--saffron)]"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Volunteers Section */}
      <section id="team" className="py-16 px-4 bg-white/[0.02] overflow-hidden scroll-mt-32">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[var(--cream)] md:text-4xl mb-2">Our Dedication Team</h2>
            <p className="text-gray-400">The hearts and hands behind the mission</p>
          </div>

          <div className="relative group/slider">
            {/* Left Button */}
            <button
              onClick={() => scroll(volunteersRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-[var(--saffron)]"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>

            <div
              ref={volunteersRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory px-4 scroll-smooth scrollbar-hide"
            >
              {volunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="snap-center shrink-0 w-[250px] rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 text-center hover:bg-white/10 transition"
                >
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-[var(--saffron)]/10 flex items-center justify-center text-[var(--saffron)] font-bold text-2xl border border-[var(--saffron)]/20">
                    {vol.name.charAt(0)}
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1">{vol.name}</h4>
                  <p className="text-[var(--saffron)] text-sm">{vol.role}</p>
                </div>
              ))}
            </div>

            {/* Right Button */}
            <button
              onClick={() => scroll(volunteersRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-[var(--saffron)]"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials & Quotes Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--saffron)] uppercase tracking-widest mb-4 italic">
              "It’s More Than a Course—It’s a Connection."
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              This journey is about more than just information; it’s about transformation. Whether you are looking for stress relief, deeper purpose, or a connection to the divine, this is your gateway.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <QuoteCard
              quote="You don't need to leave your world to find peace; you just need to change how you see it."
              category="Timeless Wisdom"
            />
            <QuoteCard
              quote="Research says it takes 21 days to build a habit. Let's make yours a spiritual one."
              category="The Challenge"
            />
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[var(--saffron)]/10">
        <div className="mx-auto max-w-4xl text-center space-y-8 rounded-3xl border border-white/5 bg-white/5 p-12 backdrop-blur-md">
          <Share2 className="mx-auto text-[var(--saffron)] h-12 w-12" />
          <h2 className="text-3xl font-bold text-white">Share the Journey</h2>
          <p className="text-xl text-gray-300">
            Everything is better with a friend. Forward this link to your office group and take the challenge together!
          </p>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--saffron)] px-8 py-3 font-semibold text-[var(--saffron)] transition-all hover:bg-[var(--saffron)] hover:text-white"
          >
            Forward to WhatsApp
          </button>
        </div>
      </section>

      {/* Footer / Final CTA */}
      <section className="py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white md:text-6xl tracking-tight">Ready to begin?</h2>
            <p className="text-gray-400">Join thousands of others starting Jan 1st.</p>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-lg font-bold text-black transition-all hover:scale-105 active:scale-95"
          >
            Create My Account
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-24 px-4 bg-white/[0.02] border-t border-white/5 scroll-mt-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-[var(--cream)] md:text-4xl">Contact Us</h2>
            <div className="h-1.5 w-24 bg-[var(--saffron)] mx-auto rounded-full"></div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Reach out to us through any of the following channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-sm transition-all hover:bg-[var(--saffron)]/5 group">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--saffron)]/10 text-[var(--saffron)] group-hover:scale-110 transition-transform">
                <Phone size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Phone</h3>
              <p className="text-gray-400">7337728106 / 9822692371</p>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-sm transition-all hover:bg-[var(--saffron)]/5 group">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--saffron)]/10 text-[var(--saffron)] group-hover:scale-110 transition-transform">
                <Mail size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Email</h3>
              <p className="text-gray-400">iyfsouthbengaluru@gmail.com</p>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-sm transition-all hover:bg-[var(--saffron)]/5 group">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--saffron)]/10 text-[var(--saffron)] group-hover:scale-110 transition-transform">
                <MapPin size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Address</h3>
              <p className="text-gray-400">
                <strong className="block text-white mb-1">ISKCON South Bengaluru</strong>
                3rd Main Road, Samvruddi Enclave, 2nd Stage, Kumaraswamy Layout, Bengaluru, Karnataka 560061
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Footer */}
      <footer className="py-12 px-4 border-t border-white/5 text-center text-gray-600 text-sm pb-52">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <Link href="/privacy" className="hover:text-[var(--saffron)] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[var(--saffron)] transition-colors">Terms & Conditions</Link>
          <Link href="/shipping-policy" className="hover:text-[var(--saffron)] transition-colors">Shipping Policy</Link>
          <Link href="/cancellation-refund" className="hover:text-[var(--saffron)] transition-colors">Cancellation & Refunds</Link>
        </div>
        <p>&copy; 2025 Gita Wisdom Course. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-[var(--saffron)]/30 hover:bg-[var(--saffron)]/5"
    >
      <div className="mb-6 inline-block rounded-2xl bg-black/40 p-4 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-[var(--cream)]">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function QuoteCard({ quote, category }: { quote: string; category: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      viewport={{ once: true }}
      className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-10 md:p-14 shadow-2xl backdrop-blur-xl transition-all"
    >
      {/* Decorative Blur Background */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[var(--saffron)]/10 blur-[80px] transition-all group-hover:bg-[var(--saffron)]/20" />

      {/* Visual Accent */}
      <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-[var(--saffron)] to-transparent opacity-50" />

      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--saffron)]/10 text-[var(--saffron)] shadow-lg shadow-[var(--saffron)]/5">
            <Quote size={24} fill="currentColor" className="opacity-80" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[var(--saffron)]/80">
            {category}
          </span>
        </div>

        <p className="text-2xl md:text-3xl font-light italic leading-relaxed text-[var(--cream)]/90 selection:bg-[var(--saffron)] selection:text-white">
          “{quote}”
        </p>

        {/* Bottom subtle detail */}
        <div className="flex items-center gap-2 pt-4">
          <div className="h-0.5 w-12 bg-[var(--saffron)]/30 rounded-full" />
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--saffron)]" />
        </div>
      </div>
    </motion.div>
  );
}
