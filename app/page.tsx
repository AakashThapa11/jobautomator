
"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter(); 

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <button
          className="bg-[#f5f5f5] text-[#333] px-4 py-2 rounded-lg"
          onClick={() => router.push("/login")} 
        >
          Login
        </button>  
      </main>
    </div>
  );
}