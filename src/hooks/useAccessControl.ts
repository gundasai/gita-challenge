"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export function useAccessControl(redirectToLogin: boolean = false) {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();
    const [canAccess, setCanAccess] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (loading) return;

            // Not logged in
            if (!user) {
                if (redirectToLogin) {
                    router.push("/login");
                } else {
                    setCanAccess(false);
                    setChecking(false);
                }
                return;
            }

            // Admin can always access
            if (userRole === "admin") {
                setCanAccess(true);
                setChecking(false);
                return;
            }

            // Check if challenge has started
            try {
                const configDoc = await getDoc(doc(db, "settings", "courseConfig"));
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    if (data.startDate) {
                        const startDate = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
                        const now = new Date();

                        if (now >= startDate) {
                            // Challenge has started
                            setCanAccess(true);
                        } else {
                            // Challenge hasn't started - redirect to waiting page
                            router.push("/waiting");
                        }
                    } else {
                        // No start date set - allow access
                        setCanAccess(true);
                    }
                }
            } catch (error) {
                console.error("Error checking access:", error);
                // On error, allow access
                setCanAccess(true);
            }

            setChecking(false);
        };

        checkAccess();
    }, [user, userRole, loading, router]);

    return { canAccess, checking };
}
