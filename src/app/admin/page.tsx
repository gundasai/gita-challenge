"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, Edit, Plus, UserPlus, Save } from "lucide-react";
import { courseData as staticData } from "@/data/courseData";

export default function AdminDashboard() {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();
    const [days, setDays] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("content"); // content | admins

    useEffect(() => {
        if (!loading) {
            if (!user || userRole !== "admin") {
                router.push("/");
            } else {
                fetchDays();
            }
        }
    }, [user, userRole, loading, router]);

    const fetchDays = async () => {
        try {
            const daysCol = collection(db, "days");
            const snapshot = await getDocs(daysCol);
            const daysList = snapshot.docs.map(doc => ({ ...doc.data(), id: parseInt(doc.id.replace('day_', '')) })).sort((a, b) => a.id - b.id);

            if (daysList.length === 0) {
                // Suggest migration
                setDays([]);
            } else {
                setDays(daysList);
            }
        } catch (error) {
            console.error("Error fetching days:", error);
        }
    };

    const handleMigrate = async () => {
        try {
            setMessage("Migrating data...");
            for (const day of staticData) {
                await setDoc(doc(db, "days", `day_${day.id}`), day);
            }
            setMessage("Migration successful!");
            fetchDays();
        } catch (err) {
            setMessage("Migration failed: " + err);
        }
    };

    const handleSaveDay = async () => {
        if (!editForm.id) return;
        try {
            await setDoc(doc(db, "days", `day_${editForm.id}`), editForm);
            setMessage(`Day ${editForm.id} updated!`);
            setIsEditing(null);
            fetchDays();
        } catch (err) {
            setMessage("Error updating day: " + err);
        }
    };


    // Define handleAddAdmin BEFORE usage
    const handleAddAdmin = async () => {
        if (!newAdminEmail) return;
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", newAdminEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                await updateDoc(userDoc.ref, { role: "admin" });
                setMessage(`Success! ${newAdminEmail} is now an Admin.`);
                setNewAdminEmail("");
                fetchUsers(); // Refresh list
            } else {
                setMessage("User not found. They must sign up first.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error adding admin.");
        }
    };

    const [users, setUsers] = useState<any[]>([]);

    const fetchUsers = async () => {
        try {
            const usersCol = collection(db, "users");
            const snapshot = await getDocs(usersCol);
            setUsers(snapshot.docs.map(doc => doc.data()));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "users", uid));
                // Note: This only deletes Firestore doc. Authentication deletion requires Admin SDK or Cloud Function.
                setUsers(users.filter(u => u.uid !== uid));
                setMessage("User Data Deleted from Firestore.");
            } catch (err) {
                setMessage("Error deleting user: " + err);
            }
        }
    };

    useEffect(() => {
        if (activeTab === "admins") {
            fetchUsers();
        }
    }, [activeTab]);

    if (loading || userRole !== "admin") return <div className="p-8 text-center text-white">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)]">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-[var(--saffron)]">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("content")}
                        className={`rounded px-4 py-2 ${activeTab === 'content' ? 'bg-[var(--saffron)] text-white' : 'bg-gray-800'}`}
                    >
                        Manage Content
                    </button>
                    <button
                        onClick={() => setActiveTab("admins")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "admins"
                            ? "bg-[var(--saffron)] text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        Manage Admins & Users
                    </button>
                </div>
            </header>

            {message && <div className="mb-4 rounded bg-blue-500/20 p-4 text-blue-200">{message}</div>}

            {activeTab === "content" && (
                <div className="space-y-6">
                    {days.length === 0 ? (
                        <div className="text-center">
                            <p className="mb-4 text-gray-400">No content found in Firestore.</p>
                            <button onClick={handleMigrate} className="rounded bg-green-600 px-6 py-3 text-white">
                                Migrate Static Data to DB
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {days.map((day) => (
                                <div key={day.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
                                    {isEditing === day.id ? (
                                        <div className="space-y-4">
                                            <input
                                                className="w-full rounded bg-gray-800 p-3 text-white border border-gray-700 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)]"
                                                value={editForm.title}
                                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                placeholder="Title"
                                            />
                                            <textarea
                                                className="w-full rounded bg-gray-800 p-3 text-white border border-gray-700 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)]"
                                                value={editForm.description}
                                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                placeholder="Description"
                                                rows={3}
                                            />
                                            <input
                                                className="w-full rounded bg-gray-800 p-3 text-white border border-gray-700 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)]"
                                                value={editForm.videoId}
                                                onChange={e => setEditForm({ ...editForm, videoId: e.target.value })}
                                                placeholder="YouTube Video ID"
                                            />
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm text-gray-400">Unlock Date & Time</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full rounded bg-gray-800 p-3 text-white border border-gray-700 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)]"
                                                    value={editForm.unlockDate || ""}
                                                    onChange={e => setEditForm({ ...editForm, unlockDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="border-t border-gray-700 pt-4">
                                                <h4 className="mb-2 text-lg font-bold text-[var(--cream)]">Quiz Builder</h4>
                                                <div className="space-y-4">
                                                    {(editForm.quiz || []).map((q: any, qIdx: number) => (
                                                        <div key={qIdx} className="rounded border border-white/10 bg-gray-900 p-4">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <input
                                                                    className="flex-1 rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                                                    value={q.question}
                                                                    onChange={e => {
                                                                        const newQuiz = [...editForm.quiz];
                                                                        newQuiz[qIdx].question = e.target.value;
                                                                        setEditForm({ ...editForm, quiz: newQuiz });
                                                                    }}
                                                                    placeholder="Question"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    className="w-20 rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                                                    value={q.marks || 1}
                                                                    onChange={e => {
                                                                        const newQuiz = [...editForm.quiz];
                                                                        newQuiz[qIdx].marks = parseInt(e.target.value) || 1;
                                                                        setEditForm({ ...editForm, quiz: newQuiz });
                                                                    }}
                                                                    placeholder="Marks"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const newQuiz = [...editForm.quiz];
                                                                        newQuiz.splice(qIdx, 1);
                                                                        setEditForm({ ...editForm, quiz: newQuiz });
                                                                    }}
                                                                    className="text-red-400 hover:text-red-300"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {q.options.map((opt: string, oIdx: number) => (
                                                                    <div key={oIdx} className="flex items-center gap-2">
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${qIdx}`}
                                                                            checked={q.correctAnswer === oIdx}
                                                                            onChange={() => {
                                                                                const newQuiz = [...editForm.quiz];
                                                                                newQuiz[qIdx].correctAnswer = oIdx;
                                                                                setEditForm({ ...editForm, quiz: newQuiz });
                                                                            }}
                                                                        />
                                                                        <input
                                                                            className="w-full rounded bg-gray-800 p-2 text-sm text-white border border-gray-700 focus:border-[var(--saffron)]"
                                                                            value={opt}
                                                                            onChange={e => {
                                                                                const newQuiz = [...editForm.quiz];
                                                                                newQuiz[qIdx].options[oIdx] = e.target.value;
                                                                                setEditForm({ ...editForm, quiz: newQuiz });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setEditForm({
                                                            ...editForm, quiz: [...(editForm.quiz || []), {
                                                                question: "New Question",
                                                                options: ["Option A", "Option B", "Option C", "Option D"],
                                                                correctAnswer: 0,
                                                                marks: 5
                                                            }]
                                                        })}
                                                        className="flex items-center gap-2 rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
                                                    >
                                                        <Plus size={16} /> Add Question
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setIsEditing(null)} className="px-4 py-2 text-gray-400">Cancel</button>
                                                <button onClick={handleSaveDay} className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white"><Save size={16} /> Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-[var(--cream)]">Day {day.id}: {day.title}</h3>
                                                <p className="text-gray-400">{day.description}</p>
                                                <p className="mt-2 text-xs text-gray-500">Video ID: {day.videoId}</p>
                                            </div>
                                            <button
                                                onClick={() => { setIsEditing(day.id); setEditForm(day); }}
                                                className="rounded p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                                            >
                                                <Edit size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "admins" && (
                <div className="space-y-8">
                    <div className="mx-auto max-w-xl text-center">
                        {/* Manage Users Header */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
                            <h2 className="mb-2 text-xl font-bold">Manage Users & Admins</h2>
                            <p className="text-sm text-gray-400 mb-6">View all registered users and manage their data.</p>

                            {/* Add Admin Form */}
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                    placeholder="Enter email to promote to Admin"
                                    value={newAdminEmail}
                                    onChange={e => setNewAdminEmail(e.target.value)}
                                />
                                <button
                                    onClick={handleAddAdmin}
                                    className="bg-[var(--saffron)] px-4 py-2 text-white rounded hover:brightness-110 font-medium"
                                >
                                    Promote
                                </button>
                            </div>
                            {message && <p className="mt-2 text-sm text-[var(--saffron)]">{message}</p>}
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-[var(--saffron)] font-bold">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Total Score</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.uid} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 font-medium text-white">{user.displayName}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-200' : 'bg-blue-500/20 text-blue-200'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[var(--saffron)] font-bold">{user.totalScore || 0}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.uid)}
                                                className="text-red-400 hover:text-red-300 p-2"
                                                title="Delete User Data"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
