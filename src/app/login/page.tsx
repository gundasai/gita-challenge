"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [dob, setDob] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            console.log("Attempting login...");
            await login(email, password);
            console.log("Login successful, redirecting...");
            // Force full reload to ensure auth state is fresh
            window.location.href = "/";
        } catch (err: any) {
            console.error("Login Error:", err);
            let msg = err.message;
            if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
            if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
            if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
            setError(msg);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setResetMessage("");
        setIsResetting(true);

        try {
            // 1. Check if user exists and DoB matches
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("No account found with this email.");
            }

            const userDoc = querySnapshot.docs[0].data();

            // If user has no DoB saved (legacy user), we might need a fallback or fail.
            // Strict security: Fail.
            if (!userDoc.dob) {
                throw new Error("Date of Birth not set for this account. Contact admin.");
            }

            if (userDoc.dob !== dob) {
                throw new Error("Date of Birth does not match our records.");
            }

            // 2. Send Reset Email
            await sendPasswordResetEmail(auth, email);
            setResetMessage("Password reset link sent! Check your email.");
            setTimeout(() => {
                setIsForgotPassword(false);
                setResetMessage("");
            }, 3000);

        } catch (err: any) {
            console.error("Reset Error:", err);
            setError(err.message || "Failed to reset password.");
        } finally {
            setIsResetting(false);
        }
    };

    if (isForgotPassword) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--background)] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md space-y-8 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
                >
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[var(--saffron)]">Recover Password</h2>
                        <p className="mt-2 text-base font-medium text-white">
                            Verify your identity
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    {resetMessage && (
                        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-center text-sm text-green-200">
                            {resetMessage}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="reset-email" className="sr-only">Email address</label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    required
                                    className="relative block w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="reset-dob" className="sr-only">Date of Birth</label>
                                <input
                                    id="reset-dob"
                                    type="date"
                                    required
                                    className="relative block w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={isResetting}
                                className="group relative flex w-full justify-center rounded bg-[var(--saffron)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--saffron)] focus:ring-offset-2 disabled:opacity-70 transition-all"
                            >
                                {isResetting ? "Verifying..." : "Recover Password"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(false)}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--background)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[var(--saffron)]">Welcome Back</h2>
                    <p className="mt-2 text-base font-medium text-white">
                        Continue your spiritual journey
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center text-sm text-red-200"
                    >
                        <p>{error}</p>
                    </motion.div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>


                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-sm font-medium text-[var(--saffron)] hover:text-[var(--saffron)]/80"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded bg-[var(--saffron)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--saffron)] focus:ring-offset-2"
                    >
                        Sign in
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Did not Register?{" "}
                    <Link href="/signup" className="font-medium text-[var(--saffron)] hover:text-[var(--saffron)]/80">
                        Register Now
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
