"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    marks?: number; // Optional because legacy data might not have it
}

export default function Quiz({ questions, onComplete }: { questions: Question[]; onComplete: (score: number, maxScore: number) => void }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        // Score is strictly calculated at the end now to avoid premature state updates
    };

    const handleNext = () => {
        // Calculate score for current question
        const currentQ = questions[currentQuestion];
        const isCorrect = selectedOption === currentQ.correctAnswer;
        const currentPoints = isCorrect ? (currentQ.marks || 1) : 0;

        const newScore = score + currentPoints;
        setScore(newScore);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setShowResult(false);
        } else {
            // Calculate max score
            const maxScore = questions.reduce((acc, q) => acc + (q.marks || 1), 0);
            onComplete(newScore, maxScore);
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--cream)]">Daily Quiz</h3>
                <span className="text-sm text-gray-400">
                    Question {currentQuestion + 1} of {questions.length}
                </span>
            </div>

            <div className="mb-6">
                <h4 className="text-lg font-medium text-white">{questions[currentQuestion].question}</h4>
            </div>

            <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => {
                    let buttonStyle = "border-white/10 bg-white/5 hover:bg-white/10";
                    if (isAnswered) {
                        if (index === questions[currentQuestion].correctAnswer) {
                            buttonStyle = "border-green-500/50 bg-green-500/20 text-green-200";
                        } else if (index === selectedOption) {
                            buttonStyle = "border-red-500/50 bg-red-500/20 text-red-200";
                        } else {
                            buttonStyle = "opacity-50 cursor-not-allowed";
                        }
                    } else if (selectedOption === index) {
                        buttonStyle = "border-[var(--saffron)] bg-[var(--saffron)]/20 text-[var(--saffron)]";
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(index)}
                            disabled={isAnswered}
                            className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${buttonStyle}`}
                        >
                            <span>{option}</span>
                            {isAnswered && index === questions[currentQuestion].correctAnswer && (
                                <CheckCircle size={20} className="text-green-400" />
                            )}
                            {isAnswered && index === selectedOption && index !== questions[currentQuestion].correctAnswer && (
                                <XCircle size={20} className="text-red-400" />
                            )}
                        </button>
                    );
                })}
            </div>

            {isAnswered && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex justify-end"
                >
                    <button
                        onClick={handleNext}
                        className="rounded-full bg-[var(--saffron)] px-6 py-2 text-sm font-medium text-white transition hover:brightness-110"
                    >
                        {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                    </button>
                </motion.div>
            )}
        </div>
    );
}
