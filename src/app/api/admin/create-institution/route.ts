
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    console.log("API: /api/admin/create-institution HIT");
    try {
        const body = await req.json();
        console.log("API: Request Body:", body);
        const { name, email, password } = body;

        if (!adminAuth || !adminDb) {
            console.error("API Error: Firebase Admin not initialized");
            return NextResponse.json(
                { error: "Server Configuration Error: Firebase Admin not initialized" },
                { status: 500 }
            );
        }

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields: name, email, password" },
                { status: 400 }
            );
        }

        // 1. Create the user in Firebase Auth
        let userRecord;
        try {
            userRecord = await adminAuth.createUser({
                email,
                password,
                displayName: name,
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                return NextResponse.json(
                    { error: "User with this email already exists." },
                    { status: 409 }
                );
            }
            throw error;
        }

        // 2. Create the Institution Document in Firestore
        const institutionRef = adminDb.collection('institutions').doc();
        const institutionId = institutionRef.id;

        await institutionRef.set({
            id: institutionId,
            name,
            adminEmail: email,
            adminUid: userRecord.uid,
            createdAt: new Date(),
        });

        // 3. Set Custom Claims (role: institution_admin, institutionId) 
        // AND create the user document in 'users' collection so they can login normally
        await adminAuth.setCustomUserClaims(userRecord.uid, {
            role: 'institution_admin',
            institutionId: institutionId
        });

        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            displayName: name, // Institution Name as display name
            company: name, // Also set company for consistency
            role: 'institution_admin',
            institutionId: institutionId,
            createdAt: new Date(),
            lastLogin: null
        });

        return NextResponse.json({
            success: true,
            institutionId,
            message: "Institution and Admin created successfully"
        });

    } catch (error: any) {
        console.error("Error creating institution API:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error", details: error.toString() },
            { status: 500 }
        );
    }
}
