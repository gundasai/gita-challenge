export const courseData = [
    {
        id: 1,
        title: "Arjuna's Dilemma",
        description: "Understanding the conflict of duty and emotion.",
        videoId: "TkhK88d6Qqo", // Example YouTube ID (Gita Chapter 1)
        quiz: [
            {
                id: 1,
                question: "What was Arjuna's main conflict?",
                options: [
                    "He wanted to become King.",
                    "He was afraid of losing the war.",
                    "He did not want to fight his own family and teachers.",
                    "He forgot his weapons."
                ],
                correctAnswer: 2, // Index 0-based
            },
            {
                id: 2,
                question: "Who is Arjuna's charioteer?",
                options: ["Bheema", "Duryodhana", "Krishna", "Drona"],
                correctAnswer: 2,
            }
        ]
    },
    {
        id: 2,
        title: "Sankhya Yoga",
        description: "The yoga of knowledge.",
        videoId: "TkhK88d6Qqo",
        quiz: [
            {
                id: 1,
                question: "According to Krishna, what is the nature of the soul?",
                options: ["It dies with the body.", "It is eternal and indestructible.", "It is temporary.", "It is made of fire."],
                correctAnswer: 1,
            }
        ]
    },
    // Generate placeholder data for the rest
    ...Array.from({ length: 19 }, (_, i) => ({
        id: i + 3,
        title: `Day ${i + 3} Wisdom`,
        description: "Continue your journey.",
        videoId: "TkhK88d6Qqo",
        quiz: [
            {
                id: 1,
                question: "What is the key takeaway from today?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0,
            }
        ]
    }))
];
