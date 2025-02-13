"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ProfilePage({ profileData, resumePath, onClose }: { profileData: any, resumePath: string, onClose: () => void }) {
  const [profile, setProfile] = useState<any>({
    fullName: "",
    email: "",
    phoneNumber: "",
    skills: "",
    experience: "",
    education: "",
    preferredLocation: "",
    resumePath: resumePath || "", // ✅ Store resume path
  });

  useEffect(() => {
    if (profileData) {
      setProfile({
        fullName: profileData["Personal Information"]?.Name || "",
        email: profileData["Personal Information"]?.Email || "",
        phoneNumber: profileData["Personal Information"]?.Phone || "",
        skills: profileData["Technologies"]?.Languages?.join(", ") || "",
        experience: profileData["Experience"]?.length || "0",
        education: profileData["Education"]?.map((edu: any) => edu.Degree).join(", ") || "",
        preferredLocation: profileData["Personal Information"]?.Location || "",
        resumePath: resumePath || "", // ✅ Ensure Resume Path is stored
      });
    }
  }, [profileData, resumePath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post("/api/save-profile", profile);
      alert("Profile saved successfully!");

      // ✅ Close modal after saving
      if (onClose) onClose();

    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Review & Edit Your Profile</h1>

      <input type="text" name="fullName" placeholder="Full Name" value={profile.fullName} onChange={handleChange} className="block w-full p-2 border rounded mt-2"/>
      <input type="email" name="email" placeholder="Email" value={profile.email} readOnly className="block w-full p-2 border rounded mt-2"/>
      <input type="text" name="phoneNumber" placeholder="Phone Number" value={profile.phoneNumber} onChange={handleChange} className="block w-full p-2 border rounded mt-2"/>
      <textarea name="skills" placeholder="Skills (comma-separated)" value={profile.skills} onChange={handleChange} className="block w-full p-2 border rounded mt-2"/>
      <input type="text" name="experience" placeholder="Years of Experience" value={profile.experience} onChange={handleChange} className="block w-full p-2 border rounded mt-2"/>
      <input type="text" name="education" placeholder="Education" value={profile.education} onChange={handleChange} className="block w-full p-2 border rounded mt-2"/>
      <input type="text" name="preferredLocation" placeholder="Preferred Job Location" value={profile.preferredLocation} onChange={handleChange} className="block w-full p-2 border rounded mt-2"/>

      <button onClick={handleSaveProfile} className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
        Save Profile
      </button>
    </div>
  );
}
