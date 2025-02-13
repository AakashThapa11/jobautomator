"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import ResumeUploadModal from "@/components/ResumeUploadModal"; 

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }

    const checkUserProfile = async () => {
      try {
        const { data } = await axios.get("/api/user-profile");
        if (!data.hasResume) {
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [session, status, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {showModal && <ResumeUploadModal onClose={() => setShowModal(false)} />}

      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
      <button
        onClick={() => {
          signOut();
          router.push("/login");
        }}
        className="px-6 py-2 mt-4 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}
