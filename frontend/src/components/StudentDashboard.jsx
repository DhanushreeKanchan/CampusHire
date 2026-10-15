import React, { useEffect, useState } from "react";
import api from "../api";

export default function StudentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({
    gpa: "", resumeLink: "", skills: "", department: "", graduationYear: ""
  });
  const [message, setMessage] = useState("");

  const load = async () => {
    const [jobsRes, appsRes, profileRes] = await Promise.all([
      api.get("/jobs"),
      api.get("/applications/my"),
      api.get("/students/profile")
    ]);
    setJobs(jobsRes.data.jobs);
    setApplications(appsRes.data.applications);
    if (profileRes.data.profile) {
      const p = profileRes.data.profile;
      setProfile({
        gpa: p.gpa ?? "",
        resumeLink: p.resumeLink ?? "",
        skills: (p.skills || []).join(", "),
        department: p.department ?? "",
        graduationYear: p.graduationYear ?? ""
      });
    }
  };

  useEffect(() => { load().catch(err => setMessage(err.response?.data?.message || "Could not load data")); }, []);

  const saveProfile = async e => {
    e.preventDefault();
    try {
      await api.put("/students/profile", {
        ...profile,
        gpa: Number(profile.gpa),
        graduationYear: Number(profile.graduationYear),
        skills: profile.skills.split(",").map(s => s.trim()).filter(Boolean)
      });
      setMessage("Profile saved");
    } catch (err) {
      setMessage(err.response?.data?.message || "Profile update failed");
    }
  };

  const apply = async id => {
    try {
      await api.post(`/applications/${id}`);
      setMessage("Application submitted");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Application failed");
    }
  };

  const appliedIds = new Set(applications.map(a => a.job?._id));

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
      {message && <p className="mb-5 text-blue-700">{message}</p>}

      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Student Profile</h2>
        <form onSubmit={saveProfile} className="grid md:grid-cols-2 gap-3">
          <input className="border p-3 rounded" placeholder="GPA"
            value={profile.gpa} onChange={e => setProfile({...profile, gpa: e.target.value})} required />
          <input className="border p-3 rounded" placeholder="Department"
            value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})} required />
          <input className="border p-3 rounded" placeholder="Graduation Year"
            value={profile.graduationYear} onChange={e => setProfile({...profile, graduationYear: e.target.value})} required />
          <input className="border p-3 rounded" placeholder="Resume URL"
            value={profile.resumeLink} onChange={e => setProfile({...profile, resumeLink: e.target.value})} />
          <input className="border p-3 rounded md:col-span-2" placeholder="Skills: Java, React, SQL"
            value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} />
          <button className="bg-slate-900 text-white p-3 rounded md:col-span-2">Save Profile</button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Placement Drives</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <article key={job._id} className="bg-white p-5 rounded-2xl shadow">
              <h3 className="text-lg font-bold">{job.jobProfile}</h3>
              <p>{job.companyName}</p>
              <p className="mt-2">Package: {job.packageCtc}</p>
              <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
              {job.description && <p className="mt-2 text-slate-600">{job.description}</p>}
              <button
                disabled={appliedIds.has(job._id)}
                onClick={() => apply(job._id)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                {appliedIds.has(job._id) ? "Applied" : "Apply"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Applications</h2>
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr><th className="p-3">Company</th><th className="p-3">Role</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {applications.map(a => (
                <tr key={a._id} className="border-t">
                  <td className="p-3">{a.job?.companyName}</td>
                  <td className="p-3">{a.job?.jobProfile}</td>
                  <td className="p-3 font-semibold">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
