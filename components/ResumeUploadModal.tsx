"use client";
import { useState } from "react";
import axios from "axios";
import ProfilePage from "@/app/profile/page";

export default function ResumeUploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [resumePath, setResumePath] = useState<string>("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await axios.post("/api/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Extracted Data:", data.extractedData);
      setProfileData(data.extractedData);
      setResumePath(data.filePath);

    } catch (error) {
      setError("Failed to upload resume. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        {!profileData ? (
          <>
            <h2 className="text-xl font-bold mb-4">Upload Your Resume</h2>

            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <button 
              onClick={handleUpload} 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload & Extract"}
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <button 
              onClick={onClose} 
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Close
            </button>
          </>
        ) : (
          // ✅ Show Profile Page After AI Extracts Data
          <ProfilePage profileData={profileData} resumePath={resumePath} onClose={onClose} />
        )}
      </div>
    </div>
  );
}