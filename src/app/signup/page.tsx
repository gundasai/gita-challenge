"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SignupPage() {
    const { signup, logout } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [gender, setGender] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [company, setCompany] = useState("");
    const [city, setCity] = useState("");
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const checkStartDate = async () => {
            try {
                const configDoc = await getDoc(doc(db, "settings", "courseConfig"));
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    if (data.startDate) {
                        const date = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
                        if (new Date() > date) setHasStarted(true);
                    }
                }
            } catch (error) {
                console.error("Error checking start date:", error);
            }
        };
        checkStartDate();
    }, []);

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        // Name validation
        if (name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters long";
        }

        // WhatsApp validation - 10 digits, starting with 9, 8, 7, or 6
        const whatsappRegex = /^[6-9]\d{9}$/;
        if (!whatsappRegex.test(whatsapp)) {
            errors.whatsapp = "Mobile number must be 10 digits and start with 6, 7, 8, or 9";
        }

        // Email validation - basic email format
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            errors.email = "Please enter a valid email address";
        }

        // Company/College validation
        if (company.trim().length < 2) {
            errors.company = "Company/College name must be at least 2 characters long";
        }

        // City validation
        if (city.trim().length < 2) {
            errors.city = "City name must be at least 2 characters long";
        }

        // Password validation - at least 6 characters
        if (password.length < 6) {
            errors.password = "Password must be at least 6 characters long";
        }

        // Confirm Password validation
        if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }



        // Gender validation
        if (!gender) {
            errors.gender = "Please select your gender";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setValidationErrors({});

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            console.log("Attempting signup...");
            console.log("Attempting signup...");
            await signup(email, password, name, whatsapp, company, city, gender);
            console.log("Signup successful");

            if (hasStarted) {
                // If challenge started, logout and show success message
                try {
                    await logout();
                } catch (e) {
                    console.error("Logout error", e);
                }
                setShowSuccess(true);
                setIsSubmitting(false); // Stop loading state
            } else {
                // Redirect to waiting page if not started
                window.location.href = "/waiting";
            }
        } catch (err: any) {
            console.error("Signup Error:", err);
            setError("Failed to create account: " + err.message);
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
                        Welcome to the Gita Wisdom Course.
                    </p>

                    <div className="space-y-6">
                        <div className="rounded-xl bg-white/5 p-6 border border-white/10">
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--saffron)] mb-3">
                                Crucial Next Step
                            </p>
                            <p className="text-sm text-gray-300 mb-4">
                                Join our WhatsApp group to stay updated with daily challenges and announcements.
                            </p>
                            <a
                                href="https://chat.whatsapp.com/CgUtLgcTUsB16xgmuKGDwf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#25D366] px-4 py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                Join WhatsApp Group
                            </a>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <p className="text-white font-medium mb-4">
                                Please sign in to access the course.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block w-full rounded bg-[var(--saffron)] px-4 py-3 text-sm font-bold text-white hover:brightness-110 transition-all"
                            >
                                Sign In Now
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
                    <h2 className="text-3xl font-bold text-[var(--saffron)]">Register Now</h2>
                    <p className="mt-2 text-base font-medium text-white">
                        Join the Gita Wisdom Course
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
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                minLength={2}
                                className={`relative block w-full rounded border ${validationErrors.name ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (validationErrors.name) {
                                        const errors = { ...validationErrors };
                                        delete errors.name;
                                        setValidationErrors(errors);
                                    }
                                }}
                            />
                            {validationErrors.name && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.name}</p>
                            )}
                        </div>






                        {/* Gender Field */}
                        <div>
                            <label htmlFor="gender" className="sr-only">Gender</label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                className={`relative block w-full rounded border ${validationErrors.gender ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm ${!gender ? 'text-gray-500' : ''}`}
                                value={gender}
                                onChange={(e) => {
                                    setGender(e.target.value);
                                    if (validationErrors.gender) {
                                        const errors = { ...validationErrors };
                                        delete errors.gender;
                                        setValidationErrors(errors);
                                    }
                                }}
                            >
                                <option value="" disabled>Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Others">Others</option>
                            </select>
                            {validationErrors.gender && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.gender}</p>
                            )}
                        </div>

                        {/* WhatsApp Field */}
                        <div>
                            <label htmlFor="whatsapp" className="sr-only">WhatsApp Mobile Number</label>
                            <input
                                id="whatsapp"
                                name="whatsapp"
                                type="tel"
                                required
                                pattern="[6-9][0-9]{9}"
                                maxLength={10}
                                className={`relative block w-full rounded border ${validationErrors.whatsapp ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                                placeholder="WhatsApp Mobile Number (10 digits)"
                                value={whatsapp}
                                onChange={(e) => {
                                    // Only allow numbers
                                    const value = e.target.value.replace(/\D/g, '');
                                    setWhatsapp(value);
                                    if (validationErrors.whatsapp) {
                                        const errors = { ...validationErrors };
                                        delete errors.whatsapp;
                                        setValidationErrors(errors);
                                    }
                                }}
                            />
                            {validationErrors.whatsapp && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.whatsapp}</p>
                            )}
                            {!validationErrors.whatsapp && whatsapp && whatsapp.length < 10 && (
                                <p className="mt-1 text-xs text-yellow-400">Enter 10 digit mobile number</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className={`relative block w-full rounded border ${validationErrors.email ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (validationErrors.email) {
                                        const errors = { ...validationErrors };
                                        delete errors.email;
                                        setValidationErrors(errors);
                                    }
                                }}
                            />
                            {validationErrors.email && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
                            )}
                        </div>

                        {/* Company/College Field */}
                        <div>
                            <label htmlFor="company" className="sr-only">Company/College Name</label>
                            <input
                                id="company"
                                name="company"
                                type="text"
                                required
                                minLength={2}
                                className={`relative block w-full rounded border ${validationErrors.company ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                                placeholder="Company/College Name"
                                value={company}
                                onChange={(e) => {
                                    setCompany(e.target.value);
                                    if (validationErrors.company) {
                                        const errors = { ...validationErrors };
                                        delete errors.company;
                                        setValidationErrors(errors);
                                    }
                                }}
                            />
                            {validationErrors.company && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.company}</p>
                            )}
                        </div>

                        {/* City Field */}
                        <div>
                            <label htmlFor="city" className="sr-only">City</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                required
                                minLength={2}
                                className={`relative block w-full rounded border ${validationErrors.city ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                                placeholder="City"
                                value={city}
                                onChange={(e) => {
                                    setCity(e.target.value);
                                    if (validationErrors.city) {
                                        const errors = { ...validationErrors };
                                        delete errors.city;
                                        setValidationErrors(errors);
                                    }
                                }}
                            />
                            {validationErrors.city && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.city}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className={`relative block w-full rounded border ${validationErrors.password ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                                placeholder="Password (min. 6 characters)"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (validationErrors.password) {
                                        const errors = { ...validationErrors };
                                        delete errors.password;
                                        setValidationErrors(errors);
                                    }
                                }}
                            />
                            {validationErrors.password && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                className={`relative block w-full rounded border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-white/10'} bg-black/20 px-3 py-2 text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)] sm:text-sm`}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (validationErrors.confirmPassword) {
                                        const errors = { ...validationErrors };
                                        delete errors.confirmPassword;
                                        setValidationErrors(errors);
                                    }
                                }}
                            />
                            {validationErrors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative flex w-full justify-center items-center gap-3 rounded bg-[var(--saffron)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--saffron)] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <span>Registering...</span>
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Already registered?{" "}
                    <Link href="/login" className="font-medium text-[var(--saffron)] hover:text-[var(--saffron)]/80">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
