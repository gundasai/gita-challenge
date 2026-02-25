"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export function useAccessControl(redirectToLogin: boolean = false) {
    const { user, userData, userRole, loading } = useAuth();
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const parseDate = (val: any) => {
                            if (!val) return new Date();
                            if (val.toDate) return val.toDate();
                            if (val.seconds) return new Date(val.seconds * 1000);
                            return new Date(val);
                        };

                        const startDate = parseDate(data.startDate);
                        const now = new Date();

                        // --- ALUMNI CHECK ---
                        // Use Registration Date as cutoff if available, otherwise Start Date.
                        // Users created BEFORE this cutoff are Alumni.
                        // Users created AFTER are New Batch / Current Students.
                        let cutoffDate = startDate;
                        if (data.registrationDate) {
                            cutoffDate = parseDate(data.registrationDate);
                        }

                        if (userData?.createdAt) {
                            const userCreated = parseDate(userData.createdAt);
                            if (userCreated < cutoffDate) {
                                setCanAccess(true);
                                setChecking(false);
                                return;
                            }
                        } else if (userData) {
                            // Target fallback: Legacy users might not have createdAt.
                            // If they have userData but no createdAt, consider them alumni.
                            setCanAccess(true);
                            setChecking(false);
                            return;
                        }

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
