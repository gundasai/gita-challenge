
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const { institutionId, name, email, password, adminUid } = await req.json();

        if (!adminAuth || !adminDb) {
            console.error("API Error: Firebase Admin not initialized");
            return NextResponse.json(
                { error: "Server Configuration Error: Firebase Admin not initialized" },
                { status: 500 }
            );
        }

        if (!institutionId || !adminUid) {
            return NextResponse.json(
                { error: "Missing required fields: institutionId, adminUid" },
                { status: 400 }
            );
        }

        const updates: any = {};
        const userUpdates: any = {};

        // Update Name
        if (name) {
            updates.name = name;
            userUpdates.displayName = name;
            await adminDb.collection('institutions').doc(institutionId).update({ name });
            await adminDb.collection('users').doc(adminUid).update({ displayName: name });
        }

        // Update Email
        if (email) {
            updates.email = email;
            userUpdates.email = email;
            await adminDb.collection('institutions').doc(institutionId).update({ adminEmail: email });
            await adminDb.collection('users').doc(adminUid).update({ email });
        }

        // Update Password
        if (password && password.trim() !== "") {
            userUpdates.password = password;
        }

        // Apply Auth Updates
        if (Object.keys(userUpdates).length > 0) {
            await adminAuth.updateUser(adminUid, userUpdates);
        }

        return NextResponse.json({
            success: true,
            message: "Institution updated successfully"
        });

    } catch (error: any) {
        console.error("Error updating institution:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
