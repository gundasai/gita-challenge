
import React from 'react';

export default function CancellationPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 pt-24 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8 text-center bg-white/5 p-12 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-white mb-4">Cancellation & Refunds</h1>
                <div className="h-1 w-20 bg-[var(--saffron)] mx-auto rounded-full mb-8"></div>
                <p className="text-xl text-gray-300">
                    This is a free educational course.
                </p>
                <p className="text-2xl font-bold text-[var(--saffron)] mt-4">
                    Not Applicable
                </p>
                <p className="text-sm text-gray-500 mt-8">
                    There are no charges for accessing this course.
                </p>
            </div>
        </div>
    );
}
