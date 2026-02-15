"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LogOut, Check, X, UserCheck, UserX, Heart } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

export default function InstitutionDashboard() {
    const { user, userData, loading, logout } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | null;
        studentId: string | null;
        studentName: string | null;
    }>({
        isOpen: false,
        type: null,
        studentId: null,
        studentName: null
    });

    // ... (useEffect hooks remain same)

    const fetchStudents = async () => {
        // ... (existing fetchStudents logic remains same, but need to keep it inside the component or accessible)
        if (user && userData?.institutionId) {
            try {
                const q = query(
                    collection(db, "users"),
                    where("institutionId", "==", userData.institutionId)
                );
                const querySnapshot = await getDocs(q);
                const studentsData = querySnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter((student: any) => student.id !== user.uid); // Filter out self (admin)

                studentsData.sort((a: any, b: any) =>
                    (a.displayName || "").localeCompare(b.displayName || "")
                );

                setStudents(studentsData);
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setIsLoadingData(false);
            }
        }
    };

    useEffect(() => {
        if (userData?.institutionId) {
            fetchStudents();
        }
    }, [user, userData]); // We can remove fetchStudents from dependencies if we define it inside or use callback, but relying on this for now.

    const handleLogout = async () => {
        await logout();
        router.push("/iks/login");
    };

    const initiateAction = (type: 'approve' | 'reject', studentId: string, studentName: string) => {
        setConfirmation({
            isOpen: true,
            type,
            studentId,
            studentName
        });
    };

    const closeConfirmation = () => {
        setConfirmation({
            isOpen: false,
            type: null,
            studentId: null,
            studentName: null
        });
    };

    const confirmAction = async () => {
        if (!confirmation.type || !confirmation.studentId) return;

        const { type, studentId } = confirmation;
        closeConfirmation(); // Close immediately for better UX, could show loading state in modal if preferred

        try {
            const userRef = doc(db, "users", studentId);

            if (type === 'approve') {
                await updateDoc(userRef, { status: "active" });
            } else {
                await updateDoc(userRef, { status: "rejected" });
            }

            fetchStudents();
        } catch (error) {
            console.error(`Error ${type}ing student:`, error);
            alert(`Failed to ${type} student.`);
        }
    };

    if (loading || isLoadingData) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading Dashboard...</div>;
    }

    const pendingStudents = students.filter(s => s.status === 'pending');
    const activeStudents = students.filter(s => s.status === 'active' || !s.status); // Default to active if status is missing (legacy)

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 sm:p-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--saffron)]">
                            {userData?.displayName || "Institution"} Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Track your students' progress in the Gita Wisdom Course
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link
                            href="/donate"
                            className="flex items-center gap-2 rounded-xl border border-[var(--saffron)]/40 bg-[var(--saffron)]/10 px-4 py-2 font-bold text-[var(--saffron)] transition-all hover:scale-105 hover:bg-[var(--saffron)]/20 hover:border-[var(--saffron)] shadow-lg shadow-orange-500/5 hover:shadow-orange-500/20"
                        >
                            <Heart size={20} />
                            <span>Donations Accepted</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <h3 className="text-gray-400 text-sm font-medium">Total Students</h3>
                        <p className="text-3xl font-bold text-white mt-2">{students.length}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <h3 className="text-gray-400 text-sm font-medium">Pending Requests</h3>
                        <p className="text-3xl font-bold text-yellow-500 mt-2">{pendingStudents.length}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <h3 className="text-gray-400 text-sm font-medium">Course Completions</h3>
                        <p className="text-3xl font-bold text-[var(--saffron)] mt-2">
                            {students.filter(s => s.daysCompleted?.length >= 21).length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <h3 className="text-gray-400 text-sm font-medium">Active Learners</h3>
                        <p className="text-3xl font-bold text-green-400 mt-2">
                            {activeStudents.filter(s => s.daysCompleted?.length > 0 && s.daysCompleted?.length < 21).length}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 rounded-xl bg-white/5 p-1 mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'active'
                            ? 'bg-[var(--saffron)] text-white shadow'
                            : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                            }`}
                    >
                        Active Students
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'pending'
                            ? 'bg-yellow-500 text-white shadow'
                            : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                            }`}
                    >
                        Pending Requests
                        {pendingStudents.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                {pendingStudents.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-gray-400">
                                    <th className="p-4">Student Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Contact</th>
                                    {activeTab === 'active' ? (
                                        <>
                                            <th className="p-4 text-center">Days Completed</th>
                                            <th className="p-4 text-center">Progress</th>
                                        </>
                                    ) : (
                                        <th className="p-4 text-center">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                {(activeTab === 'active' ? activeStudents : pendingStudents).length > 0 ? (
                                    (activeTab === 'active' ? activeStudents : pendingStudents).map((student) => (
                                        <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium text-white">
                                                {student.displayName || "N/A"}
                                            </td>
                                            <td className="p-4">{student.email || "N/A"}</td>
                                            <td className="p-4">{student.whatsapp || student.phoneNumber || "N/A"}</td>

                                            {activeTab === 'active' ? (
                                                <>
                                                    <td className="p-4 text-center font-bold text-[var(--saffron)]">
                                                        {student.daysCompleted?.length || 0} / 21
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {(student.daysCompleted?.length || 0) >= 21 ? (
                                                            <span className="inline-flex rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
                                                                Completed
                                                            </span>
                                                        ) : (student.daysCompleted?.length || 0) > 0 ? (
                                                            <span className="inline-flex rounded-full bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-400">
                                                                In Progress
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-gray-500/20 px-2 py-1 text-xs font-semibold text-gray-400">
                                                                Not Started
                                                            </span>
                                                        )}
                                                    </td>
                                                </>
                                            ) : (
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => initiateAction('approve', student.id, student.displayName)}
                                                            className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-bold text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/30"
                                                        >
                                                            <Check size={14} />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => initiateAction('reject', student.id, student.displayName)}
                                                            className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
                                                        >
                                                            <X size={14} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500">
                                            {activeTab === 'active'
                                                ? "No active students found."
                                                : "No pending approval requests."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Custom Confirmation Modal */}
                {confirmation.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 shadow-2xl transform scale-100 transition-all">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {confirmation.type === 'approve' ? 'Approve Student?' : 'Reject Request?'}
                            </h3>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                Are you sure you want to {confirmation.type} <span className="text-white font-semibold">{confirmation.studentName || 'this student'}</span>?
                                {confirmation.type === 'approve'
                                    ? ' They will be granted access to the course content.'
                                    : ' They will be removed from the pending list.'}
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeConfirmation}
                                    className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    className={`px-4 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition-transform active:scale-95 ${confirmation.type === 'approve'
                                        ? 'bg-green-600 hover:bg-green-500'
                                        : 'bg-red-600 hover:bg-red-500'
                                        }`}
                                >
                                    Yes, {confirmation.type === 'approve' ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
