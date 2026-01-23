
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { useRazorpay } from "react-razorpay";
import { useRouter } from "next/navigation";


export default function DonatePage() {

    const [amount, setAmount] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [mobile, setMobile] = useState<string>("");
    const [pan, setPan] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // Add success state
    const { Razorpay } = useRazorpay();
    const router = useRouter();

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        const donationAmount = parseFloat(amount);
        if (!donationAmount || donationAmount < 1) {
            alert("Please enter a valid amount (minimum ₹1)");
            return;
        }
        if (name.trim().length < 2) {
            alert("Please enter a valid name");
            return;
        }
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            alert("Please enter a valid 10-digit mobile number");
            return;
        }

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(pan)) {
            alert("Please enter a valid PAN Number (e.g., ABCDE1234F)");
            return;
        }

        if (address.trim().length < 5) {
            alert("Please enter a valid address");
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order
            const response = await fetch("/api/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: donationAmount,
                    notes: {
                        name: name,
                        mobile: mobile,
                        pan: pan,
                        address: address
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create order");
            }


            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: data.amount,
                currency: data.currency,
                name: "Gita Wisdom Course",
                description: "Donation",
                image: "/iskcon_logo_v2.png",
                order_id: data.id,
                handler: function (response: any) {
                    setShowSuccess(true); // Show success modal instead of alert
                },
                prefill: {
                    name: name,
                    contact: mobile,
                },
                theme: {
                    color: "#FF9933",
                },
            };

            const rzp1 = new Razorpay(options);
            rzp1.on("payment.failed", function (response: any) {
                alert(`Payment Failed: ${response.error.description}`);
            });
            rzp1.open();

        } catch (error: any) {
            console.error("Payment Error:", error);
            alert(error.message || "Something went wrong during payment initialization.");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
            >
                <div className="text-center space-y-6 mb-8">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--saffron)]/10 text-[var(--saffron)] border border-[var(--saffron)]/20 shadow-lg shadow-[var(--saffron)]/5">
                        <Heart size={40} fill="currentColor" className="opacity-80" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Support Our Mission</h1>
                        <p className="text-gray-400 mt-2">
                            Your contribution helps us spread the wisdom of the Gita.
                        </p>
                    </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 pl-1">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 pl-1">Mobile Number</label>
                        <input
                            type="tel"
                            required
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="10-digit Mobile Number"
                            maxLength={10}
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 pl-1">PAN Number</label>
                        <input
                            type="text"
                            required
                            value={pan}
                            onChange={(e) => setPan(e.target.value.toUpperCase())}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] transition-all uppercase"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 pl-1">Address</label>
                        <textarea
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Your complete address"
                            rows={3}
                            className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 pl-1">Donation Amount (₹)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full rounded-xl bg-black/20 border border-white/10 py-3 pl-10 pr-4 text-white placeholder-gray-600 outline-none focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] transition-all text-lg font-bold"
                                min="1"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--saffron)] to-orange-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing...
                            </>
                        ) : (
                            "Proceed to Pay"
                        )}
                    </button>
                </form>

                <p className="text-xs text-center text-gray-500 mt-6">
                    Secure payment powered by Razorpay.
                </p>
            </motion.div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl"
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-6">
                            <Heart size={32} fill="currentColor" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                        <p className="text-gray-400 mb-8">
                            Your donation has been successfully received. We appreciate your support.
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="w-full rounded-xl bg-white text-black font-bold py-3 hover:bg-gray-200 transition-colors"
                        >
                            OK
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

