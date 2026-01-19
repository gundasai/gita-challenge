
import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 pt-24">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

                <section className="space-y-4">
                    <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-[var(--saffron)]">1. Information We Collect</h2>
                    <p>We collect basic information such as your name, email address, and phone number when you register for the course.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-[var(--saffron)]">2. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>Manage your course progress and certificates.</li>
                        <li>Send important course updates and reminders.</li>
                        <li>Improve our educational content.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-[var(--saffron)]">3. Data Protection</h2>
                    <p>We implement security measures to maintain the safety of your personal information. We do not sell or trade your personally identifiable information to outside parties.</p>
                </section>

                <div className="pt-8 border-t border-white/10">
                    <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
