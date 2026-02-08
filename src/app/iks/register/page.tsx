"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function IKSRegisterPage() {
    const { signup, logout } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [gender, setGender] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [city, setCity] = useState("");

    // Institution Specific
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [selectedInstitution, setSelectedInstitution] = useState("");

    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check start date
                const configDoc = await getDoc(doc(db, "settings", "courseConfig"));
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    if (data.startDate) {
                        const date = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
                        if (new Date() > date) setHasStarted(true);
                    }
                    if (data.whatsappLink) {
                        setWhatsappLink(data.whatsappLink);
                    }
                }

                // Fetch Institutions
                const instSnap = await getDocs(collection(db, "institutions"));
                setInstitutions(instSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (name.trim().length < 2) errors.name = "Name must be at least 2 characters long";

        const whatsappRegex = /^[6-9]\d{9}$/;
        if (!whatsappRegex.test(whatsapp)) errors.whatsapp = "Mobile number must be 10 digits and start with 6, 7, 8, or 9";

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) errors.email = "Please enter a valid email address";

        if (!selectedInstitution) errors.institution = "Please select your Institution/College";

        if (city.trim().length < 2) errors.city = "City name must be at least 2 characters long";

        if (password.length < 6) errors.password = "Password must be at least 6 characters long";
        if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
        if (!gender) errors.gender = "Please select your gender";

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setValidationErrors({});

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Check if mobile number already exists
            const q = query(collection(db, "users"), where("whatsapp", "==", whatsapp));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setError("This mobile number is already registered. Please use a different number or sign in.");
                setIsSubmitting(false);
                return;
            }

            // Find institution name to use as company
            const instObj = institutions.find(i => i.id === selectedInstitution);
            const companyName = instObj ? instObj.name : "Institution";

            await signup(email, password, name, whatsapp, companyName, city, gender, selectedInstitution);

            if (hasStarted) {
                try {
                    await logout();
                } catch (e) { console.error("Logout error", e); }
                setShowSuccess(true);
                setIsSubmitting(false);
            } else {
                window.location.href = "/waiting";
            }
        } catch (err: any) {
            console.error("Signup Error:", err);
            let errorMessage = "Failed to create account. Please try again.";

            if (err.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please sign in instead.";
            } else if (err.code === 'auth/weak-password') {
                errorMessage = "Password should be at least 6 characters.";
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = "The email address is invalid.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--background)] px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-center"
                >
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-[var(--saffron)] mb-2">Registration Successful!</h2>
                    <p className="text-gray-300 mb-8">
                        Welcome to the Indian Knowledge Systems Course.
                    </p>

                    <div className="space-y-6">
                        <div className="rounded-xl bg-white/5 p-6 border border-white/10">
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--saffron)] mb-3">
                                Successful Registration
                            </p>
                            <p className="text-sm text-gray-300 mb-4">
                                You can now sign in to your dashboard.
                            </p>
                            <Link
                                href="/iks/login"
                                className="flex items-center justify-center gap-2 w-full rounded-lg bg-[var(--saffron)] px-4 py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Sign In to Portal
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--background)] px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Student Registration</h2>
                    <p className="mt-2 text-base font-medium text-[var(--saffron)]">
                        Indian Knowledge Systems
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        In collaboration with ISKCON
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

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {/* Institution Selection */}
                    <div>
                        <label htmlFor="institution" className="sr-only">Select College/Institution</label>
                        <select
                            id="institution"
                            required
                            className={`relative block w-full rounded border ${validationErrors.institution ? 'border-red-500' : 'border-white/10'} bg-black/40 px-3 py-3 text-[var(--foreground)] focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                            value={selectedInstitution}
                            onChange={(e) => {
                                setSelectedInstitution(e.target.value);
                                if (validationErrors.institution) {
                                    const errors = { ...validationErrors };
                                    delete errors.institution;
                                    setValidationErrors(errors);
                                }
                            }}
                        >
                            <option value="">Select your College/Institution</option>
                            {institutions.map(inst => (
                                <option key={inst.id} value={inst.id} className="bg-gray-900">{inst.name}</option>
                            ))}
                        </select>
                        {validationErrors.institution && (
                            <p className="mt-1 text-xs text-red-400">{validationErrors.institution}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <input
                            type="text"
                            required
                            minLength={2}
                            className={`relative block w-full rounded border ${validationErrors.name ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {validationErrors.name && <p className="mt-1 text-xs text-red-400">{validationErrors.name}</p>}

                        <select
                            required
                            className={`relative block w-full rounded border ${validationErrors.gender ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm ${!gender ? 'text-gray-500' : ''}`}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="" disabled>Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Others">Others</option>
                        </select>
                        {validationErrors.gender && <p className="mt-1 text-xs text-red-400">{validationErrors.gender}</p>}

                        <input
                            type="tel"
                            required
                            maxLength={10}
                            className={`relative block w-full rounded border ${validationErrors.whatsapp ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                            placeholder="WhatsApp Mobile Number (10 digits)"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                        />
                        {validationErrors.whatsapp && <p className="mt-1 text-xs text-red-400">{validationErrors.whatsapp}</p>}

                        <input
                            type="email"
                            required
                            className={`relative block w-full rounded border ${validationErrors.email ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {validationErrors.email && <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>}

                        <input
                            type="text"
                            required
                            minLength={2}
                            className={`relative block w-full rounded border ${validationErrors.city ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        {validationErrors.city && <p className="mt-1 text-xs text-red-400">{validationErrors.city}</p>}

                        <input
                            type="password"
                            required
                            minLength={6}
                            className={`relative block w-full rounded border ${validationErrors.password ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                            placeholder="Password (min. 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {validationErrors.password && <p className="mt-1 text-xs text-red-400">{validationErrors.password}</p>}

                        <input
                            type="password"
                            required
                            minLength={6}
                            className={`relative block w-full rounded border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {validationErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{validationErrors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative flex w-full justify-center items-center gap-3 rounded bg-[var(--saffron)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--saffron)] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <span>IKS Registration...</span>
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Already registered for IKS Course?{" "}
                    <Link href="/iks/login" className="font-medium text-[var(--saffron)] hover:text-[var(--saffron)]/80">
                        Sign in
                    </Link>
                </p>
                <p className="text-center text-xs text-gray-500 mt-4">
                    <Link href="/iks" className="hover:text-white">← Return to IKS Home</Link>
                </p>
            </motion.div>
        </div>
    );
}
