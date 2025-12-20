// YouTube video ID extracted from: https://www.youtube.com/live/2p-nDTqlZD8?si=IHH52zs0cLOLOfVZ
const COMMON_VIDEO_ID = "2p-nDTqlZD8";

// Common quiz for all days (using Quiz1)
const commonQuiz = [
    {
        id: 1,
        question: "What was Arjuna's main conflict?",
        options: [
            "He wanted to become King.",
            "He was afraid of losing the war.",
            "He did not want to fight his own family and teachers.",
            "He forgot his weapons."
        ],
        correctAnswer: 2,
        marks: 5
    },
    {
        id: 2,
        question: "Who is Arjuna's charioteer?",
        options: ["Bheema", "Duryodhana", "Krishna", "Drona"],
        correctAnswer: 2,
        marks: 5
    }
];

// Twenty one important topics of the Gita
const topics = [
    { letter: "A", title: "Atma (Science of Soul)", description: "Understanding the eternal nature of the soul" },
    { letter: "B", title: "Bhakti (Devotion to God)", description: "The path of devotion and surrender" },
    { letter: "C", title: "Crisis Management", description: "Managing life's challenges with wisdom" },
    { letter: "D", title: "Dharma", description: "Understanding righteous duty and moral order" },
    { letter: "E", title: "Equanimity (Steady Mind)", description: "Maintaining balance in all situations" },
    { letter: "F", title: "Friendship (Suhrud)", description: "The value of true companionship" },
    { letter: "G", title: "Guru (Qualities of a Teacher)", description: "Understanding the role of a spiritual guide" },
    { letter: "H", title: "Humility (of the Student)", description: "The importance of a humble approach to learning" },
    { letter: "I", title: "Instrument (in the Hand of God)", description: "Being a tool for divine will" },
    { letter: "J", title: "Journey of the Soul", description: "Understanding the soul's eternal journey" },
    { letter: "K", title: "Karma (Art of Work)", description: "The science of action and its fruits" },
    { letter: "L", title: "Liberation", description: "The path to ultimate freedom" },
    { letter: "M", title: "Mind (Friend or Enemy)", description: "Mastering the mind for spiritual growth" },
    { letter: "N", title: "Nature (Three Modes)", description: "Understanding the three gunas of nature" },
    { letter: "O", title: "Obligations to Do Our Duty", description: "Fulfilling our responsibilities with dedication" },
    { letter: "P", title: "Parampara", description: "The importance of disciplic succession" },
    { letter: "Q", title: "Quest for Happiness", description: "Finding true and lasting happiness" },
    { letter: "R", title: "Renunciation", description: "The art of detachment and letting go" },
    { letter: "S", title: "Surrender (Ultimate Teaching)", description: "Complete surrender to the divine will" },
    { letter: "T", title: "Time", description: "Understanding the nature and power of time" },
    { letter: "U", title: "Ultimate Destination", description: "The supreme goal of human life" }
];

export const courseData = topics.map((topic, index) => ({
    id: index + 1,
    title: topic.title,
    description: topic.description,
    videoId: COMMON_VIDEO_ID,
    quiz: [...commonQuiz] // Create a copy for each day
}));
