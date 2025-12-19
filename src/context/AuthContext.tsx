"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, User, UserCredential } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    userData: any; // Using any for flexibility, strict type would be better
    userRole: string | null;
    loading: boolean;
    signup: (email: string, password: string, displayName: string) => Promise<UserCredential>;
    login: (email: string, password: string) => Promise<UserCredential>;
    loginWithGoogle: () => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any>(null); // Store Firestore data
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Sign up with Email/Password
    const signup = async (email: string, password: string, displayName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        await createUserDocument(userCredential.user);
        return userCredential;
    };

    // Login with Email/Password
    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Login with Google
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        try {
            await createUserDocument(result.user);
        } catch (error) {
            console.error("Error creating user profile in DB:", error);
            // We do not re-throw here so the user can still proceed to the app
            // The app handles missing DB data gracefully by defaulting to Day 1
        }
        return result;
    };

    // Logout
    const logout = () => {
        return signOut(auth);
    };

    // Create User Document in Firestore
    const createUserDocument = async (user: User) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const role = user.email === "admin@gita.com" ? "admin" : "user";
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                currentDay: 1,
                daysCompleted: [],
                exp: 0,
                streak: 0,
                role: role,
                lastLogin: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
            setUserRole(role);
        } else {
            // Update last login
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
            setUserRole(userSnap.data().role || "user");
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            // If no user, stop loading immediately
            if (!currentUser) {
                setUserData(null);
                setUserRole(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Separate effect for user data listener
    useEffect(() => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const unsubUser = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                    setUserRole(docSnap.data().role || "user");
                }
                setLoading(false); // Data loaded
            }, (error) => {
                console.error("Error fetching user data:", error);
                setLoading(false); // Stop loading even on error
            });
            return () => unsubUser();
        } else {
            // If user logs out (user becomes null), data is cleared in the auth effect
        }
    }, [user]);

    const value = {
        user,
        userData, // Expose full Firestore profile
        userRole,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex h-screen items-center justify-center bg-black text-white">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
