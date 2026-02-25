"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, Edit, Plus, UserPlus, Save, Download, X, AlertTriangle, Building, Eye, EyeOff } from "lucide-react";
import { courseData as staticData } from "@/data/courseData";
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
    const { user, userData, userRole, loading } = useAuth();
    const router = useRouter();
    const [days, setDays] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("admins"); // default to users for institution_admin
    const [startDate, setStartDate] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");
    const [whatsappLink, setWhatsappLink] = useState("");
    const [leaderboardLimit, setLeaderboardLimit] = useState(50);

    // Content Management State
    const [activeContentTab, setActiveContentTab] = useState<'level1' | 'level2'>('level1');

    // Database Explorer State
    const [explorerCollection, setExplorerCollection] = useState("users");
    const [explorerDocs, setExplorerDocs] = useState<any[]>([]);
    const [explorerLoading, setExplorerLoading] = useState(false);
    const [editingDoc, setEditingDoc] = useState<{ id: string, data: string } | null>(null);

    // Dynamic Content State
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [newTestimonial, setNewTestimonial] = useState({ name: "", role: "", message: "" });
    const [newVolunteer, setNewVolunteer] = useState({ name: "", role: "" });
    const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
    const [editingVolunteerId, setEditingVolunteerId] = useState<string | null>(null);

    // Institutions State
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [newInstName, setNewInstName] = useState("");
    const [newInstEmail, setNewInstEmail] = useState("");
    const [newInstPassword, setNewInstPassword] = useState("");
    const [creatingInst, setCreatingInst] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, name: string } | null>(null);



    useEffect(() => {
        if (!loading) {
            if (!user || (userRole !== "admin" && userRole !== "institution_admin")) {
                router.push("/");
            } else {
                if (userRole === "admin") {
                    fetchDays();
                    fetchStartDate();
                    fetchTestimonials();
                    fetchVolunteers();
                }
                // If institution_admin, we focus on users.
                if (userRole === "institution_admin") {
                    setActiveTab("admins");
                }
            }
        }
    }, [user, userRole, loading, router]);

    const fetchTestimonials = async () => {
        try {
            const snap = await getDocs(collection(db, "testimonials"));
            setTestimonials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) { console.error("Error fetching testimonials", err); }
    };

    const fetchVolunteers = async () => {
        try {
            const snap = await getDocs(collection(db, "volunteers"));
            setVolunteers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) { console.error("Error fetching volunteers", err); }
    };

    const handleAddTestimonial = async () => {
        if (!newTestimonial.name || !newTestimonial.message) return alert("Name and Message required");
        try {
            await addDoc(collection(db, "testimonials"), newTestimonial);
            setNewTestimonial({ name: "", role: "", message: "" });
            fetchTestimonials();
            setMessage("Testimonial Added!");
        } catch (err) { alert("Error adding testimonial: " + err); }
    };

    const handleUpdateTestimonial = async () => {
        if (!editingTestimonialId || !newTestimonial.name || !newTestimonial.message) return;
        try {
            await updateDoc(doc(db, "testimonials", editingTestimonialId), newTestimonial);
            setNewTestimonial({ name: "", role: "", message: "" });
            setEditingTestimonialId(null);
            fetchTestimonials();
            setMessage("Testimonial Updated!");
        } catch (err) { alert("Error updating testimonial: " + err); }
    };

    const handleEditTestimonial = (t: any) => {
        setNewTestimonial({ name: t.name, role: t.role, message: t.message });
        setEditingTestimonialId(t.id);
    };

    const handleDeleteTestimonial = async (id: string) => {
        if (!confirm("Delete this testimonial?")) return;
        try {
            await deleteDoc(doc(db, "testimonials", id));
            fetchTestimonials();
            setMessage("Testimonial Deleted!");
        } catch (err) { alert("Error deleting testimonial: " + err); }
    };

    const handleAddVolunteer = async () => {
        if (!newVolunteer.name || !newVolunteer.role) return alert("Name and Role required");
        try {
            await addDoc(collection(db, "volunteers"), newVolunteer);
            setNewVolunteer({ name: "", role: "" });
            fetchVolunteers();
            setMessage("Volunteer Added!");
        } catch (err) { alert("Error adding volunteer: " + err); }
    };

    const handleUpdateVolunteer = async () => {
        if (!editingVolunteerId || !newVolunteer.name || !newVolunteer.role) return;
        try {
            await updateDoc(doc(db, "volunteers", editingVolunteerId), newVolunteer);
            setNewVolunteer({ name: "", role: "" });
            setEditingVolunteerId(null);
            fetchVolunteers();
            setMessage("Volunteer Updated!");
        } catch (err) { alert("Error updating volunteer: " + err); }
    };

    const handleEditVolunteer = (v: any) => {
        setNewVolunteer({ name: v.name, role: v.role });
        setEditingVolunteerId(v.id);
    };

    const handleDeleteVolunteer = async (id: string) => {
        if (!confirm("Delete this volunteer?")) return;
        try {
            await deleteDoc(doc(db, "volunteers", id));
            fetchVolunteers();
            setMessage("Volunteer Deleted!");
        } catch (err) { alert("Error deleting volunteer: " + err); }
    };

    const fetchStartDate = async () => {
        try {
            const configDoc = await getDoc(doc(db, "settings", "courseConfig"));
            if (configDoc.exists()) {
                const data = configDoc.data();
                if (data.startDate) {
                    // Convert Firestore timestamp to datetime-local format
                    const date = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
                    const formatted = date.toISOString().slice(0, 16);
                    setStartDate(formatted);
                }
                if (data.registrationDate) {
                    const date = data.registrationDate.toDate ? data.registrationDate.toDate() : new Date(data.registrationDate);
                    const formatted = date.toISOString().slice(0, 16);
                    setRegistrationDate(formatted);
                }
                if (data.whatsappLink) {
                    setWhatsappLink(data.whatsappLink);
                }
                if (data.leaderboardLimit) {
                    setLeaderboardLimit(data.leaderboardLimit);
                }
            } else {
                // Config doesn't exist?
            }
        } catch (err) { console.error("Error fetching start date", err); }
    };

    const handleSaveStartDate = async () => {
        try {
            const configRef = doc(db, "settings", "courseConfig");
            await setDoc(configRef, {
                startDate: new Date(startDate), // Content Unlock / Waiting Page
                registrationDate: registrationDate ? new Date(registrationDate) : null, // Alumni Cutoff
                whatsappLink: whatsappLink || "", // Dynamic WhatsApp Link
                leaderboardLimit: leaderboardLimit
            }, { merge: true });
            setMessage("Settings Saved!");
        } catch (err) {
            console.error(err);
            alert("Error saving settings");
        }
    };

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

    const handleAddDay0 = async () => {
        try {
            const day0 = staticData.find(d => d.id === 0);
            if (!day0) {
                setMessage("Error: Day 0 data not found in source code.");
                return;
            }
            await setDoc(doc(db, "days", "day_0"), day0);
            setMessage("✅ Day 0 (Introduction) has been created successfully!");
            fetchDays();
        } catch (err) {
            console.error(err);
            setMessage("Error adding Day 0: " + err);
        }
    };

    const defaultTestimonials = [
        { name: "Rahul Verma", role: "Software Engineer", message: "This course changed my perspective on stress management. Highly recommended!" },
        { name: "Priya Singh", role: "Product Manager", message: "The 20-minute daily format is perfect for my busy schedule. I feel more focused." },
        { name: "Amit Kumar", role: "Entrepreneur", message: "Ancient wisdom applied to modern problems. A truly transformative experience." },
        { name: "Sneha Gupta", role: "Medical Student", message: "The clarity I gained from these sessions has improved my studies significantly." },
        { name: "Vikram Malhotra", role: "Corporate Lead", message: "A must-do for anyone feeling the burnout of city life. Simple yet profound." }
    ];

    const defaultVolunteers = [
        { name: "Arjun Das", role: "Coordinator" },
        { name: "Meera Reddy", role: "Event Manager" },
        { name: "Suresh Nair", role: "Tech Support" },
        { name: "Karthik R", role: "Content Creator" },
        { name: "Ananya P", role: "Outreach Lead" }
    ];

    const handleLoadDefaults = async (type: 'testimonials' | 'volunteers') => {
        if (!confirm(`Load default ${type}? This will add ${type === 'testimonials' ? 5 : 5} items to the database.`)) return;
        try {
            const data = type === 'testimonials' ? defaultTestimonials : defaultVolunteers;
            const collectionName = type;
            setMessage(`Loading default ${type}...`);

            for (const item of data) {
                await addDoc(collection(db, collectionName), item);
            }

            if (type === 'testimonials') fetchTestimonials();
            else fetchVolunteers();

            setMessage(`Default ${type} loaded successfully!`);
        } catch (err) {
            console.error(err);
            setMessage(`Error loading defaults: ${err}`);
        }
    };

    const handleSaveDay = async () => {
        if (editForm.id === undefined || editForm.id === null) return;
        try {
            await setDoc(doc(db, "days", `day_${editForm.id}`), editForm);
            setMessage(`Day ${editForm.id} updated!`);
            setIsEditing(null);
            fetchDays();
        } catch (err) {
            setMessage("Error updating day: " + err);
        }
    };


    const handleAutoFillDates = async (startId: number, startDateStr: string, isWeekly: boolean) => {
        const intervalText = isWeekly ? "weeks" : "days";
        if (!confirm(`Are you sure? This will overwrite the unlock dates for all subsequent ${intervalText} based on this start date.`)) return;

        try {
            setMessage(`Auto-filling dates...`);
            const startDate = new Date(startDateStr);
            const endId = isWeekly ? 42 : 21; // Level 1 ends at 21, Level 2 ends at 42

            // We need to fetch the existing days first to preserve other data (title, desc, etc.)
            // Make sure 'days' state is up to date or fetch fresh. We use 'days' state here.
            // A better approach for bulk update is to read-modify-write or just use setDoc with merge if we only want to update date.
            // But here we might want to ensure we don't wipe other fields if we use setDoc without merge:true (which creates if not exists).
            // Since all days should exist, updateDoc is safer, or setDoc with merge: true.

            // Using setDoc with merge: true to be safe and simple.

            let count = 0;
            for (let id = startId + 1; id <= endId; id++) {
                const dayOffset = id - startId;
                // Calculate new date
                // If weekly: offset * 7 days. If daily: offset * 1 day.
                const daysToAdd = isWeekly ? dayOffset * 7 : dayOffset;

                const newDate = new Date(startDate);
                newDate.setDate(startDate.getDate() + daysToAdd);

                // Format to datetime-local string (YYYY-MM-DDTHH:mm) for consistency if stored as string, 
                // OR store as ISO string. The app seems to use string in editForm.unlockDate.
                // Course data might store it as string or timestamp? 
                // Looking at fetchStartDate, it handles Timestamp. 
                // Let's store as ISO string to be safe, or whatever existing format is.
                // The editForm uses e.target.value which is YYYY-MM-DDTHH:mm. 
                // Let's stick to that format for the string field.

                const formattedDate = newDate.toISOString().slice(0, 16);

                await setDoc(doc(db, "days", `day_${id}`), {
                    unlockDate: formattedDate
                }, { merge: true });

                count++;
            }

            setMessage(`✅ Successfully auto-filled dates for next ${count} ${intervalText}!`);
            fetchDays(); // Refresh UI
        } catch (err) {
            console.error(err);
            setMessage("❌ Error auto-filling dates: " + err);
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
            let q;

            if (userRole === "institution_admin" && userData?.institutionId) {
                // Filter users by institutionId
                q = query(usersCol, where("institutionId", "==", userData.institutionId));
            } else {
                // Super admin sees all
                q = query(usersCol);
            }

            const snapshot = await getDocs(q);
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

    const downloadUsersAsExcel = () => {
        // Prepare data for Excel
        const excelData = users.map((user, index) => ({
            'S.NO': index + 1,
            'Name': user.displayName || '',
            'Age': user.age || '',
            'Gender': user.gender || '',
            'Email': user.email || '',
            'WhatsApp Number': user.whatsapp || '',
            'Company/College': user.company || '',
            'City': user.city || '',
            'Role': user.role || 'user',
            'Total Score': user.totalScore || 0,
            'Current Day': user.currentDay || 1,
            'Days Completed': user.daysCompleted?.length || 0,
            'Streak': user.streak || 0,
            'Created At': user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `gita-wisdom-course-users-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Database cleanup functions
    const handleResetAllScores = async () => {
        if (!confirm("Are you sure you want to reset ALL user scores and progress? This will reset everyone (including admins) to Day 1 with 0 score.")) {
            return;
        }
        try {
            setMessage("Resetting all user data...");
            const usersCol = collection(db, "users");
            const snapshot = await getDocs(usersCol);

            let count = 0;
            for (const userDoc of snapshot.docs) {
                await updateDoc(userDoc.ref, {
                    currentDay: 0,
                    daysCompleted: [],
                    totalScore: 0,
                    exp: 0,
                    streak: 0
                });
                count++;
            }

            setMessage(`✅ Successfully reset ${count} users. All users are now at Intro (Day 0) with 0 score.`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            setMessage("❌ Error resetting user data: " + err);
        }
    };

    const handleDeleteNonAdminUsers = async () => {
        if (!confirm("⚠️ WARNING: This will DELETE all non-admin users permanently! Are you absolutely sure?")) {
            return;
        }
        try {
            setMessage("Deleting non-admin users...");
            const usersCol = collection(db, "users");
            const snapshot = await getDocs(usersCol);

            let deleted = 0;
            for (const userDoc of snapshot.docs) {
                const userData = userDoc.data();
                if (userData.role !== "admin") {
                    await deleteDoc(userDoc.ref);
                    deleted++;
                }
            }

            setMessage(`✅ Successfully deleted ${deleted} non-admin users.`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            setMessage("❌ Error deleting users: " + err);
        }
    };

    const handleSyncCourseData = async () => {
        if (!confirm("This will update all 22 days (Intro + 21 Days) with the new topics and quiz. Continue?")) {
            return;
        }
        try {
            setMessage("Syncing course data to database...");

            for (const day of staticData) {
                await setDoc(doc(db, "days", `day_${day.id}`), day);
            }

            setMessage(`✅ Successfully synced all 22 days with new topics!`);
            fetchDays();
        } catch (err) {
            console.error(err);
            setMessage("❌ Error syncing course data: " + err);
        }
    };



    // Database Explorer Functions
    const fetchExplorerDocs = async (collectionName: string) => {
        setExplorerLoading(true);
        try {
            const colRef = collection(db, collectionName);
            const snapshot = await getDocs(colRef);
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setExplorerDocs(docs);
            setExplorerCollection(collectionName);
        } catch (err) {
            console.error("Error fetching explorer docs:", err);
            setMessage(`❌ Error fetching ${collectionName}: ${err}`);
        } finally {
            setExplorerLoading(false);
        }
    };

    const handleDeleteExplorerDoc = async (id: string) => {
        if (!confirm(`Are you sure you want to delete document ${id} from ${explorerCollection}?`)) return;
        try {
            await deleteDoc(doc(db, explorerCollection, id));
            setMessage(`✅ Document ${id} deleted from ${explorerCollection}`);
            fetchExplorerDocs(explorerCollection);
        } catch (err) {
            console.error("Error deleting doc:", err);
            setMessage(`❌ Error deleting document: ${err}`);
        }
    };

    const handleUpdateExplorerDoc = async () => {
        if (!editingDoc) return;
        try {
            const parsedData = JSON.parse(editingDoc.data);
            await setDoc(doc(db, explorerCollection, editingDoc.id), parsedData);
            setMessage(`✅ Document ${editingDoc.id} updated in ${explorerCollection}`);
            setEditingDoc(null);
            fetchExplorerDocs(explorerCollection);
        } catch (err) {
            console.error("Error updating doc:", err);
            setMessage(`❌ Error updating document: ${err}`);
        }
    };

    useEffect(() => {
        if (activeTab === "admins") {
            fetchUsers();
        }
        if (activeTab === "database") {
            fetchExplorerDocs(explorerCollection);
        }
        if (activeTab === "institutions") {
            fetchInstitutions();
        }
    }, [activeTab, explorerCollection]);

    const fetchInstitutions = async () => {
        try {
            const snap = await getDocs(collection(db, "institutions"));
            setInstitutions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error("Error fetching institutions", error); }
    };

    const [editingInstId, setEditingInstId] = useState<string | null>(null);
    const [instEditForm, setInstEditForm] = useState({ name: "", email: "", password: "" });

    const handleUpdateInstitution = async () => {
        if (!editingInstId || !instEditForm.name || !instEditForm.email) {
            alert("Name and Email are required");
            return;
        }

        try {
            const inst = institutions.find(i => i.id === editingInstId);
            if (!inst) return;

            const res = await fetch('/api/admin/update-institution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    institutionId: editingInstId,
                    adminUid: inst.adminUid,
                    name: instEditForm.name,
                    email: instEditForm.email,
                    password: instEditForm.password // Optional
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Institution Updated Successfully!");
                setEditingInstId(null);
                setInstEditForm({ name: "", email: "", password: "" });
                fetchInstitutions();
            } else {
                alert("Error: " + data.error);
            }
        } catch (err: any) {
            alert("Error updating institution: " + err.message);
        }
    };

    // Import Firebase App/Auth dynamically to avoid SSR issues if used elsewhere, 
    // but here we can just use standard imports if we were at top level.
    // For local logic inside handler:
    const handleCreateInstitution = async () => {
        if (!newInstName || !newInstEmail || !newInstPassword) {
            alert("Please fill all fields");
            return;
        }
        setCreatingInst(true);
        let secondaryApp = null;
        try {
            // 1. Initialize a Secondary App to create user without logging out the Admin
            const { initializeApp, getApp, deleteApp } = await import("firebase/app");
            const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth");

            // Use same config as main app
            const firebaseConfig = {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            };

            // Unique name for secondary app
            const appName = "secondaryAppForUserCreation";
            try {
                secondaryApp = getApp(appName);
            } catch (e) {
                secondaryApp = initializeApp(firebaseConfig, appName);
            }

            const secondaryAuth = getAuth(secondaryApp);

            // 2. Create User in Firebase Auth
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, newInstEmail, newInstPassword);
            const newUser = userCred.user;

            // 3. Create Documents in Firestore (using main app's 'db' instance)
            const institutionRef = doc(collection(db, "institutions"));
            const institutionId = institutionRef.id;

            // Store Institution Data (including password/email for admin view)
            await setDoc(institutionRef, {
                id: institutionId,
                name: newInstName,
                adminEmail: newInstEmail,
                password: newInstPassword, // Storing for visibility as requested
                adminUid: newUser.uid,
                createdAt: new Date(),
            });

            // Store User Data (Role = institution_admin)
            await setDoc(doc(db, "users", newUser.uid), {
                uid: newUser.uid,
                email: newInstEmail,
                displayName: newInstName,
                role: 'institution_admin',
                institutionId: institutionId,
                createdAt: new Date(),
                lastLogin: null
            });

            setMessage("✅ Institution Created Successfully!");
            setNewInstName("");
            setNewInstEmail("");
            setNewInstPassword("");
            fetchInstitutions();

        } catch (err: any) {
            console.error("Creation Error:", err);
            if (err.code === 'auth/email-already-in-use') {
                alert("Error: Email already in use.");
            } else {
                alert("Error creating institution: " + err.message);
            }
        } finally {
            // Clean up secondary app
            if (secondaryApp) {
                const { deleteApp } = await import("firebase/app");
                await deleteApp(secondaryApp);
            }
            setCreatingInst(false);
        }
    };

    if (loading || (userRole !== "admin" && userRole !== "institution_admin")) return <div className="p-8 text-center text-white">Loading Panel...</div>;

    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false); // For the inline edit

    return (
        <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8 text-[var(--foreground)]">
            <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--saffron)]">Admin Dashboard</h1>
                <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                    {userRole === "admin" && (
                        <>
                            <button
                                onClick={() => setActiveTab("content")}
                                className={`flex-1 sm:flex-none rounded px-3 sm:px-4 py-2 text-sm ${activeTab === 'content' ? 'bg-[var(--saffron)] text-white' : 'bg-gray-800'}`}
                            >
                                Content
                            </button>
                            <button
                                onClick={() => setActiveTab("admins")}
                                className={`flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition ${activeTab === "admins"
                                    ? "bg-[var(--saffron)] text-white"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setActiveTab("database")}
                                className={`flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition ${activeTab === "database"
                                    ? "bg-[var(--saffron)] text-white"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                Database
                            </button>
                            <button
                                onClick={() => setActiveTab("settings")}
                                className={`flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition ${activeTab === "settings"
                                    ? "bg-[var(--saffron)] text-white"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                Settings
                            </button>
                            <button
                                onClick={() => setActiveTab("dynamic")}
                                className={`flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition ${activeTab === "dynamic"
                                    ? "bg-[var(--saffron)] text-white"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                Dynamic Content
                            </button>
                            <button
                                onClick={() => setActiveTab("institutions")}
                                className={`flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition ${activeTab === "institutions"
                                    ? "bg-[var(--saffron)] text-white"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                Institutions
                            </button>
                        </>
                    )}
                    {userRole === "institution_admin" && (
                        <button
                            onClick={() => setActiveTab("admins")}
                            className={`flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium bg-[var(--saffron)] text-white`}
                        >
                            My Students
                        </button>
                    )}
                </div>
            </header>

            {message && <div className="mb-4 rounded bg-blue-500/20 p-4 text-blue-200">{message}</div>}

            {activeTab === "content" && (
                <div className="space-y-6">
                    {/* Level Toggle */}
                    <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setActiveContentTab('level1')}
                            className={`px-4 py-2 rounded-lg font-bold transition ${activeContentTab === 'level1'
                                ? "bg-[var(--saffron)] text-white"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                            Level 1 (Days 0-21)
                        </button>
                        <button
                            onClick={() => setActiveContentTab('level2')}
                            className={`px-4 py-2 rounded-lg font-bold transition ${activeContentTab === 'level2'
                                ? "bg-[var(--saffron)] text-white"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                            Level 2 (Weeks 1-21)
                        </button>
                    </div>

                    {/* Check if Day 0 exists. If not, show alert. */}
                    {!days.some(d => d.id === 0) && (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-yellow-500">Introduction Day Missing</h3>
                                    <p className="text-sm text-yellow-200/70">The 'Introduction' (Day 0) content is not in your database yet.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddDay0}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition whitespace-nowrap"
                            >
                                Add Day 0 Now
                            </button>
                        </div>
                    )}

                    {/* Level 2 Initialization */}
                    {activeContentTab === 'level2' && !days.some(d => d.id >= 22) && (
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-500">Initialize Level 2</h3>
                                    <p className="text-sm text-blue-200/70">Create placeholders for Level 2 (Weeks 1-21).</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!confirm("Create placeholders for Level 2 (Weeks 1-21)?")) return;
                                    setMessage("Initializing Level 2...");
                                    try {
                                        for (let i = 22; i <= 42; i++) {
                                            await setDoc(doc(db, "days", `day_${i}`), {
                                                id: i,
                                                title: `Level 2 - Day ${i - 21}`,
                                                description: "Advanced Topic",
                                                videoId: "",
                                                quiz: []
                                            });
                                        }
                                        setMessage("Level 2 Initialized!");
                                        fetchDays();
                                    } catch (e) {
                                        console.error(e);
                                        setMessage("Error: " + e);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition whitespace-nowrap"
                            >
                                Initialize Level 2
                            </button>
                        </div>
                    )}

                    {days.length === 0 ? (
                        <div className="text-center">
                            <p className="mb-4 text-gray-400">No content found in Firestore.</p>
                            <button onClick={handleMigrate} className="rounded bg-green-600 px-6 py-3 text-white">
                                Migrate Static Data to DB
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {days
                                .filter(day => {
                                    if (activeContentTab === 'level1') return day.id <= 21;
                                    if (activeContentTab === 'level2') return day.id >= 22;
                                    return false;
                                })
                                .map((day) => (
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
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full rounded bg-gray-800 p-3 text-white border border-gray-700 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)]"
                                                            value={editForm.unlockDate || ""}
                                                            onChange={e => setEditForm({ ...editForm, unlockDate: e.target.value })}
                                                        />
                                                        {/* Auto-fill Button for Day 1 and Day 22 */}
                                                        {((day.id === 1 && activeContentTab === 'level1') || (day.id === 22 && activeContentTab === 'level2')) && (
                                                            <button
                                                                onClick={() => {
                                                                    if (!editForm.unlockDate) return alert("Please set a date first.");
                                                                    handleAutoFillDates(day.id, editForm.unlockDate, activeContentTab === 'level2');
                                                                }}
                                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold whitespace-nowrap"
                                                                title={activeContentTab === 'level2' ? "Auto-fill next 20 weeks" : "Auto-fill next 20 days"}
                                                            >
                                                                Auto-fill Next
                                                            </button>
                                                        )}
                                                    </div>
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

                            {userRole === "admin" && (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={downloadUsersAsExcel}
                            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 font-medium transition"
                        >
                            <Download size={18} />
                            Download as Excel
                        </button>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-[var(--saffron)] font-bold">
                                <tr>
                                    <th className="p-4">S.NO</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Gender</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">WhatsApp</th>
                                    <th className="p-4">Company/College</th>
                                    <th className="p-4">City</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Total Score</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.uid || index} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 font-medium text-white">{index + 1}</td>
                                        <td className="p-4 font-medium text-white">{user.displayName}</td>
                                        <td className="p-4">{user.gender || 'N/A'}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">{user.whatsapp || 'N/A'}</td>
                                        <td className="p-4">{user.company || 'N/A'}</td>
                                        <td className="p-4">{user.city || 'N/A'}</td>
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

            {activeTab === "database" && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h2 className="mb-4 text-xl font-bold text-[var(--saffron)]">Database Management</h2>
                        <p className="mb-6 text-sm text-gray-400">
                            Powerful tools to manage your database. Use with caution!
                        </p>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Reset All Scores */}
                            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-6">
                                <h3 className="mb-2 text-lg font-bold text-yellow-400">Reset All Scores</h3>
                                <p className="mb-4 text-sm text-gray-400">
                                    Reset all users (including admins) to Day 1 with 0 score. User accounts remain intact.
                                </p>
                                <button
                                    onClick={handleResetAllScores}
                                    className="w-full rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 font-medium transition"
                                >
                                    Reset All Scores
                                </button>
                            </div>

                            {/* Delete Non-Admin Users */}
                            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
                                <h3 className="mb-2 text-lg font-bold text-red-400">Delete Non-Admin Users</h3>
                                <p className="mb-4 text-sm text-gray-400">
                                    ⚠️ Permanently delete all user accounts except admins. This cannot be undone!
                                </p>
                                <button
                                    onClick={handleDeleteNonAdminUsers}
                                    className="w-full rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 font-medium transition"
                                >
                                    Delete All Users
                                </button>
                            </div>

                            {/* Sync Course Data */}
                            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-6">
                                <h3 className="mb-2 text-lg font-bold text-green-400">Sync Course Data</h3>
                                <p className="mb-4 text-sm text-gray-400">
                                    Update all 21 days with the latest topics and quiz from courseData.ts
                                </p>
                                <button
                                    onClick={handleSyncCourseData}
                                    className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 font-medium transition"
                                >
                                    Sync Course Content (Intro + 21 Days)
                                </button>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                            <h4 className="mb-2 text-sm font-bold text-blue-400">📝 Current Course Topics</h4>
                            <p className="text-xs text-gray-400">
                                All 21 days are configured with topics A-U (Atma to Ultimate Destination),
                                using the common YouTube video and Quiz1.
                            </p>
                        </div>
                    </div>

                    {/* Database Explorer */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--saffron)]">Database Explorer</h2>
                                <p className="text-sm text-gray-400">Browse and manage raw Firestore data across all collections.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['users', 'days', 'settings'].map((col) => (
                                    <button
                                        key={col}
                                        onClick={() => fetchExplorerDocs(col)}
                                        className={`rounded px-4 py-2 text-sm font-medium transition ${explorerCollection === col
                                            ? 'bg-[var(--saffron)] text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {col.charAt(0).toUpperCase() + col.slice(1)}
                                    </button>
                                ))}
                                {/* Custom Collection Input */}
                                <div className="flex gap-2 ml-2">
                                    <input
                                        type="text"
                                        placeholder="Collection Name..."
                                        className="rounded border border-white/10 bg-black/20 px-3 py-1 text-sm text-white focus:border-[var(--saffron)] focus:outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                fetchExplorerDocs((e.target as HTMLInputElement).value);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {explorerLoading ? (
                            <div className="py-12 text-center text-gray-500">Loading documents...</div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-white/10">
                                {explorerDocs.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">No documents found in {explorerCollection}.</div>
                                ) : (
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead className="bg-white/5 text-[var(--saffron)] font-bold">
                                            <tr>
                                                <th className="p-3 border-b border-white/10">ID</th>
                                                {/* Dynamically generate headers from the first few docs */}
                                                {Object.keys(explorerDocs.reduce((acc, doc) => ({ ...acc, ...doc }), {})).filter(k => k !== 'id').map(key => (
                                                    <th key={key} className="p-3 border-b border-white/10 whitespace-nowrap">{key}</th>
                                                ))}
                                                <th className="p-3 border-b border-white/10 text-right sticky right-0 bg-gray-900 shadow-[-5px_0_10px_rgba(0,0,0,0.5)]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {explorerDocs.map((doc) => {
                                                const keys = Object.keys(explorerDocs.reduce((acc, d) => ({ ...acc, ...d }), {})).filter(k => k !== 'id');
                                                return (
                                                    <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                                        <td className="p-3 font-mono text-xs text-gray-400">{doc.id}</td>
                                                        {keys.map(key => {
                                                            const value = doc[key];
                                                            let displayValue = "";
                                                            if (value === null) displayValue = "null";
                                                            else if (typeof value === 'object') {
                                                                if (value?.toDate) displayValue = value.toDate().toLocaleString();
                                                                else displayValue = JSON.stringify(value);
                                                            }
                                                            else displayValue = String(value);

                                                            return (
                                                                <td key={key} className="p-3 max-w-[200px] truncate text-gray-300" title={displayValue}>
                                                                    {displayValue}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="p-3 text-right sticky right-0 bg-gray-900/80 backdrop-blur shadow-[-5px_0_10px_rgba(0,0,0,0.5)]">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => setEditingDoc({ id: doc.id, data: JSON.stringify(doc, null, 2) })}
                                                                    className="rounded bg-blue-600/20 px-3 py-1 text-xs text-blue-400 hover:bg-blue-600/30"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteExplorerDoc(doc.id)}
                                                                    className="rounded bg-red-600/20 px-3 py-1 text-xs text-red-400 hover:bg-red-600/30"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Editor Modal */}
                    {editingDoc && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
                                <h3 className="mb-4 text-lg font-bold text-white">Edit Document: {editingDoc.id}</h3>
                                <textarea
                                    className="mb-4 h-96 w-full rounded border border-white/10 bg-black p-4 font-mono text-xs text-green-400 focus:border-[var(--saffron)] focus:outline-none"
                                    value={editingDoc.data}
                                    onChange={(e) => setEditingDoc({ ...editingDoc, data: e.target.value })}
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setEditingDoc(null)}
                                        className="rounded px-4 py-2 text-sm text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateExplorerDoc}
                                        className="rounded bg-[var(--saffron)] px-6 py-2 text-sm font-bold text-white transition hover:brightness-110"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "dynamic" && (
                <div className="space-y-8">
                    {/* Testimonials Management */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h2 className="mb-4 text-xl font-bold text-[var(--saffron)]">Manage Testimonials</h2>
                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                            <input
                                className="rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                placeholder="Name"
                                value={newTestimonial.name}
                                onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                            />
                            <input
                                className="rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                placeholder="Role (e.g. Engineer)"
                                value={newTestimonial.role}
                                onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                    placeholder="Message"
                                    value={newTestimonial.message}
                                    onChange={e => setNewTestimonial({ ...newTestimonial, message: e.target.value })}
                                />
                                {editingTestimonialId ? (
                                    <div className="flex gap-2">
                                        <button onClick={handleUpdateTestimonial} className="bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700"><Save size={18} /></button>
                                        <button onClick={() => { setEditingTestimonialId(null); setNewTestimonial({ name: "", role: "", message: "" }); }} className="bg-gray-600 px-4 py-2 text-white rounded hover:bg-gray-700"><X size={18} /></button>
                                    </div>
                                ) : (
                                    <button onClick={handleAddTestimonial} className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700"><Plus size={18} /></button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {testimonials.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-white/10 rounded">
                                    <p className="text-gray-400 mb-4">No testimonials found in database.</p>
                                    <button
                                        onClick={() => handleLoadDefaults('testimonials')}
                                        className="bg-[var(--saffron)] px-4 py-2 text-white rounded hover:brightness-110"
                                    >
                                        Load Default Testimonials
                                    </button>
                                </div>
                            ) : (
                                testimonials.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between rounded bg-white/5 p-4">
                                        <div>
                                            <h4 className="font-bold text-white">{t.name} <span className="text-xs text-gray-400">({t.role})</span></h4>
                                            <p className="text-sm text-gray-300 italic">"{t.message}"</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditTestimonial(t)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteTestimonial(t.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Volunteers Management */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h2 className="mb-4 text-xl font-bold text-[var(--saffron)]">Manage Volunteers</h2>
                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                            <input
                                className="rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                placeholder="Name"
                                value={newVolunteer.name}
                                onChange={e => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
                            />
                            <div className="flex gap-2 md:col-span-2">
                                <input
                                    className="flex-1 rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                    placeholder="Role (e.g. Graphic Designer)"
                                    value={newVolunteer.role}
                                    onChange={e => setNewVolunteer({ ...newVolunteer, role: e.target.value })}
                                />
                                {editingVolunteerId ? (
                                    <div className="flex gap-2">
                                        <button onClick={handleUpdateVolunteer} className="bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700"><Save size={18} /></button>
                                        <button onClick={() => { setEditingVolunteerId(null); setNewVolunteer({ name: "", role: "" }); }} className="bg-gray-600 px-4 py-2 text-white rounded hover:bg-gray-700"><X size={18} /></button>
                                    </div>
                                ) : (
                                    <button onClick={handleAddVolunteer} className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700"><Plus size={18} /></button>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {volunteers.length === 0 ? (
                                <div className="col-span-full text-center py-8 border border-dashed border-white/10 rounded">
                                    <p className="text-gray-400 mb-4">No volunteers found in database.</p>
                                    <button
                                        onClick={() => handleLoadDefaults('volunteers')}
                                        className="bg-[var(--saffron)] px-4 py-2 text-white rounded hover:brightness-110"
                                    >
                                        Load Default Volunteers
                                    </button>
                                </div>
                            ) : (
                                volunteers.map((v) => (
                                    <div key={v.id} className="flex items-center justify-between rounded bg-white/5 p-4">
                                        <div>
                                            <h4 className="font-bold text-white">{v.name}</h4>
                                            <p className="text-sm text-[var(--saffron)]">{v.role}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditVolunteer(v)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteVolunteer(v.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "settings" && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h2 className="mb-4 text-xl font-bold text-[var(--saffron)]">Course Settings</h2>
                        <p className="mb-6 text-sm text-gray-400">
                            Configure global settings for the Gita Wisdom Course.
                        </p>

                        <div className="max-w-md space-y-6">
                            <div className="space-y-6">
                                {/* Registration Cutoff Code */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Registration Start Date (Alumni Cutoff)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={registrationDate}
                                        onChange={(e) => setRegistrationDate(e.target.value)}
                                        className="w-full rounded border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)]"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Users joined <strong>BEFORE</strong> this date = Alumni (Bypass Waiting Page, Bypass Locks).
                                        <br />
                                        Users joined <strong>AFTER</strong> this date = Current Batch.
                                    </p>
                                </div>

                                {/* Start Date (Batch Control) */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Course Content Start (Waiting Page Ends)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)]"
                                    />
                                    <div className="rounded bg-blue-500/10 p-3">
                                        <div className="text-xs text-blue-200">
                                            <strong>New Batch Logic:</strong>
                                            <ul className="mt-1 list-disc pl-4 space-y-1">
                                                <li>New students will see <strong>Waiting Page</strong> until this date.</li>
                                                <li>After this date, they must follow the Admin-set unlock dates for each video.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp Link */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        WhatsApp Group Link
                                    </label>
                                    <input
                                        type="url"
                                        value={whatsappLink}
                                        onChange={(e) => setWhatsappLink(e.target.value)}
                                        placeholder="https://chat.whatsapp.com/..."
                                        className="w-full rounded border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)]"
                                    />
                                    <p className="text-xs text-gray-500">
                                        This link will be used on the Waiting Page and Registration Success screen.
                                    </p>
                                </div>
                            </div>

                            {/* Leaderboard Limit */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Leaderboard Display Limit
                                </label>
                                <input
                                    type="number"
                                    value={leaderboardLimit}
                                    onChange={(e) => setLeaderboardLimit(parseInt(e.target.value))}
                                    placeholder="50"
                                    min="1"
                                    className="w-full rounded border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[var(--saffron)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron)]"
                                />
                                <p className="text-xs text-gray-500">
                                    Number of top users to show on the public leaderboard.
                                </p>
                            </div>

                            <button
                                onClick={handleSaveStartDate}
                                className="w-full rounded bg-[var(--saffron)] px-6 py-3 font-bold text-white transition hover:brightness-110 mt-4"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "institutions" && (
                <div className="space-y-8">
                    {/* Create Institution */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[var(--saffron)]/20 rounded-lg text-[var(--saffron)]">
                                <Building size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[var(--saffron)]">Manage Institutions</h2>
                                <p className="text-sm text-gray-400">Create login credentials for Schools/Colleges.</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 items-end">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Institution Name</label>
                                <input
                                    className="w-full rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                    placeholder="e.g. IIT Bombay"
                                    value={newInstName}
                                    onChange={e => setNewInstName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Admin Email</label>
                                <input
                                    className="w-full rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                    placeholder="admin@college.edu"
                                    value={newInstEmail}
                                    onChange={e => setNewInstEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-xs text-gray-500 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        className="w-full rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)] pr-10"
                                        placeholder="Min 6 chars"
                                        type={showPassword ? "text" : "password"}
                                        value={newInstPassword}
                                        onChange={e => setNewInstPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateInstitution}
                            disabled={creatingInst}
                            className="mt-4 flex items-center gap-2 rounded bg-[var(--saffron)] px-4 py-2 font-bold text-white hover:brightness-110 disabled:opacity-50"
                        >
                            {creatingInst ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Plus size={18} />}
                            Create Institution
                        </button>
                    </div>

                    {/* List Institutions */}
                    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-[var(--saffron)] font-bold">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Admin Email</th>
                                    <th className="p-4">Integration ID</th>
                                    <th className="p-4">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {institutions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">No institutions found.</td>
                                    </tr>
                                ) : (
                                    institutions.map((inst) => (
                                        <tr key={inst.id} className="border-b border-white/5 hover:bg-white/5">
                                            {editingInstId === inst.id ? (
                                                <>
                                                    <td className="p-4">
                                                        <input
                                                            className="w-full rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                                            value={instEditForm.name}
                                                            onChange={e => setInstEditForm({ ...instEditForm, name: e.target.value })}
                                                            placeholder="Name"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            className="w-full rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)]"
                                                            value={instEditForm.email}
                                                            onChange={e => setInstEditForm({ ...instEditForm, email: e.target.value })}
                                                            placeholder="Email"
                                                        />
                                                    </td>
                                                    <td className="p-4" colSpan={2}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    className="w-full rounded bg-gray-800 p-2 text-white border border-gray-700 focus:border-[var(--saffron)] pr-10"
                                                                    value={instEditForm.password}
                                                                    onChange={e => setInstEditForm({ ...instEditForm, password: e.target.value })}
                                                                    placeholder="New Password (Optional)"
                                                                    type={showEditPassword ? "text" : "password"}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                                >
                                                                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={handleUpdateInstitution}
                                                                className="p-2 bg-green-600 rounded text-white hover:bg-green-700"
                                                                title="Save"
                                                            >
                                                                <Save size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingInstId(null);
                                                                    setInstEditForm({ name: "", email: "", password: "" });
                                                                }}
                                                                className="p-2 bg-gray-600 rounded text-white hover:bg-gray-700"
                                                                title="Cancel"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-4 font-bold text-white flex items-center gap-2">
                                                        <Building size={16} className="text-gray-500" /> {inst.name}
                                                    </td>
                                                    <td className="p-4">{inst.adminEmail}</td>
                                                    <td className="p-4 font-mono text-xs text-gray-500 select-all">{inst.id}</td>
                                                    <td className="p-4 flex items-center justify-between">
                                                        <span>{inst.createdAt?.toDate ? inst.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingInstId(inst.id);
                                                                    setInstEditForm({
                                                                        name: inst.name,
                                                                        email: inst.adminEmail,
                                                                        password: inst.password || ""
                                                                    });
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-[var(--saffron)] transition-colors"
                                                                title="Edit Institution"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmation({ id: inst.id, name: inst.name })}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                                title="Delete Institution"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* Custom Delete Confirmation Modal */}
            {
                deleteConfirmation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-center rounded-full bg-red-500/20 p-4 w-16 h-16 mx-auto">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-center text-white">Delete Institution?</h3>
                            <p className="mb-6 text-center text-gray-400">
                                Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmation.name}</span>?
                                <br />
                                <span className="text-red-400 text-xs">
                                    ⚠️ <span className="font-bold">WARNING:</span> This operation is <span className="font-bold underline">DESTRUCTIVE</span>.
                                    <br />
                                    It will permanently delete the institution, its admin account, <span className="font-bold text-white">AND ALL USERS associated with it</span>.
                                    <br />
                                    This action cannot be undone.
                                </span>
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setDeleteConfirmation(null)}
                                    className="rounded px-6 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/admin/delete-institution', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ institutionId: deleteConfirmation.id })
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                setMessage("✅ Institution Deleted Successfully!");
                                                fetchInstitutions();
                                            } else {
                                                alert("Error: " + data.error);
                                            }
                                        } catch (err: any) {
                                            alert("Error deleting institution: " + err.message);
                                        } finally {
                                            setDeleteConfirmation(null);
                                        }
                                    }}
                                    className="rounded bg-red-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 hover:scale-105 active:scale-95"
                                >
                                    Delete Institution
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
