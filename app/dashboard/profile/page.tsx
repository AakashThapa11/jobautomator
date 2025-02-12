// app/dashboard/profile/page.tsx
"use client";
import { useState } from "react";
import axios from "axios";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    linkedinUrl: "",
    portfolioUrl: "",
    jobTitles: "",
    skills: "",
    experience: "",
    education: "",
  });

  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setResume(file);
    setLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append("resume", file);
  
    try {
      const { data } = await axios.post("/api/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("File uploaded:", data.filePath);
    } catch (error) {
      setError("Failed to upload resume. Please try again.");
      console.error("Error uploading resume:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post("/api/save-profile", profile);
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Your Profile</h1>

      {/* Resume Upload */}
      <div className="mb-6">
        <label className="block font-medium mb-2">Upload Resume (PDF/DOCX)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUploadResume}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {loading && <p className="text-sm text-gray-500 mt-2">Extracting details... Please wait.</p>}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Profile Form */}
      <div className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={profile.fullName}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={profile.phoneNumber}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
        <input
          type="text"
          name="linkedinUrl"
          placeholder="LinkedIn URL"
          value={profile.linkedinUrl}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
        <input
          type="text"
          name="portfolioUrl"
          placeholder="Portfolio URL"
          value={profile.portfolioUrl}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
        <textarea
          name="jobTitles"
          placeholder="Job Titles (comma-separated)"
          value={profile.jobTitles}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
        <textarea
          name="skills"
          placeholder="Skills (comma-separated)"
          value={profile.skills}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
        <input
          type="number"
          name="experience"
          placeholder="Years of Experience"
          value={profile.experience}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
        <input
          type="text"
          name="education"
          placeholder="Education"
          value={profile.education}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={handleSaveProfile}
        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Save Profile
      </button>
    </div>
  );
}