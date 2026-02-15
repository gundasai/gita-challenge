
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    console.log("API: /api/admin/delete-institution HIT");
    try {
        const { institutionId } = await req.json();
        console.log("API: Request Body:", { institutionId });

        if (!adminAuth || !adminDb) {
            console.error("API Error: Firebase Admin not initialized");
            return NextResponse.json(
                { error: "Server Configuration Error: Firebase Admin not initialized" },
                { status: 500 }
            );
        }

        if (!institutionId) {
            return NextResponse.json(
                { error: "Missing required field: institutionId" },
                { status: 400 }
            );
        }

        // 1. Get the institution document to find the adminUid
        const instDoc = await adminDb.collection('institutions').doc(institutionId).get();

        if (!instDoc.exists) {
            return NextResponse.json(
                { error: "Institution not found" },
                { status: 404 }
            );
        }

        const instData = instDoc.data();
        const adminUid = instData?.adminUid;

        // 2. Delete Institution Document
        await adminDb.collection('institutions').doc(institutionId).delete();

        // 3. Delete related User if adminUid exists
        if (adminUid) {
            try {
                // Delete from Firestore 'users' collection
                await adminDb.collection('users').doc(adminUid).delete();

                // Delete from Firebase Auth
                await adminAuth.deleteUser(adminUid);
                console.log(`Deleted user ${adminUid}`);
            } catch (userErr) {
                console.error(`Error deleting user ${adminUid}:`, userErr);
                // We typically want to continue even if user deletion fails (maybe they were already deleted)
                // or returning a warning might be appropriate, but successful institution deletion is the primary goal.
            }
        }

        return NextResponse.json({
            success: true,
            message: "Institution and associated admin deleted successfully"
        });

    } catch (error: any) {
        console.error("Error deleting institution API:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
