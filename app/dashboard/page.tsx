"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
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
