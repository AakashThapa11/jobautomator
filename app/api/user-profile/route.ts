import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    console.log("Fetching user session...");
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("User not logged in.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Logged in user email: ${session.user.email}`);

    // ✅ Step 1: Fetch user from `User` table
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      console.log("User not found in the User table.");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Step 2: Check if a UserProfile exists for this user
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { resumePath: true },
    });

    if (!userProfile) {
      console.log("User profile not found. Creating a new profile...");
      userProfile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          fullName: session.user.name || "",
          email: session.user.email,
          resumePath: null, // No resume yet
        },
        select: { resumePath: true },
      });
      console.log("User profile created.");
    }

    console.log(`Resume Path: ${userProfile?.resumePath || "Not found"}`);

    return NextResponse.json({ hasResume: !!userProfile.resumePath });
  } catch (error) {
    console.error("Error checking user profile:", error);
    return NextResponse.json({ error: "Failed to check profile" }, { status: 500 });
  }
}