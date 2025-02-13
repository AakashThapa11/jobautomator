import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Receive profile data from frontend
    const { email, fullName, phoneNumber, skills, experience, education, preferredLocation, resumePath } = body;

    if (!email) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    // ✅ Check if user exists in the `User` table
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Save or update user profile, including resumePath
    await prisma.userProfile.upsert({
      where: { userId: user.id }, // Find profile by userId
      update: { 
        fullName, 
        phoneNumber, 
        skills: skills.split(","), 
        experience: parseInt(experience), 
        education, 
        preferredLocation, 
        resumePath // ✅ Store resume path in DB
      },
      create: { 
        userId: user.id, 
        email, 
        fullName, 
        phoneNumber, 
        skills: skills.split(","), 
        experience: parseInt(experience), 
        education, 
        preferredLocation, 
        resumePath // ✅ Save resume path when creating a new profile
      },
    });

    return NextResponse.json({ success: true, message: "Profile saved successfully!" });

  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Failed to save profile", details: error.message }, { status: 500 });
  }
}
