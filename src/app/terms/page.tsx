
import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 pt-24">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Terms and Conditions</h1>

                <section className="space-y-4">
                    <p>Welcome to the Gita Wisdom Course. By accessing this website, you agree to be bound by these terms and conditions.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-[var(--saffron)]">1. Course Participation</h2>
                    <p>This is a free educational course open to all. We reserve the right to modify course content or schedule at any time.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-[var(--saffron)]">2. User Accounts</h2>
                    <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account information.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-[var(--saffron)]">3. Content Usage</h2>
                    <p>All materials provided are for personal educational use only. Redistribution or commercial use is strictly prohibited without permission.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-[var(--saffron)]">4. Conduct</h2>
                    <p>Participants are expected to maintain respectful behavior in all interactions. We reserve the right to terminate access for inappropriate conduct.</p>
                </section>

                <div className="pt-8 border-t border-white/10">
                    <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
