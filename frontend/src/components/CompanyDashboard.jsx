import React, { useEffect, useState } from "react";
import api from "../api";

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    jobProfile: "", description: "", packageCtc: "", deadline: "",
    minGpa: "", departments: "", graduationYears: ""
  });

  const loadJobs = async () => {
    const { data } = await api.get("/jobs/company/my-jobs");
    setJobs(data.jobs);
  };

  useEffect(() => { loadJobs().catch(err => setMessage(err.response?.data?.message || "Could not load jobs")); }, []);

  const postJob = async e => {
    e.preventDefault();
    try {
      await api.post("/jobs", {
        jobProfile: form.jobProfile,
        description: form.description,
        packageCtc: form.packageCtc,
        deadline: form.deadline,
        eligibility: {
          minGpa: form.minGpa === "" ? undefined : Number(form.minGpa),
          departments: form.departments.split(",").map(x => x.trim()).filter(Boolean),
          graduationYears: form.graduationYears.split(",").map(Number).filter(Boolean)
        }
      });
      setMessage("Job posted");
      setForm({ jobProfile:"", description:"", packageCtc:"", deadline:"", minGpa:"", departments:"", graduationYears:"" });
      await loadJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not post job");
    }
  };

  const viewApplicants = async job => {
    try {
      const { data } = await api.get(`/jobs/${job._id}/applicants`);
      setSelectedJob(job);
      setApplications(data.applications);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not load applicants");
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
      {message && <p className="mb-5 text-blue-700">{message}</p>}

      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Post Placement Drive</h2>
        <form onSubmit={postJob} className="grid md:grid-cols-2 gap-3">
          <input className="border p-3 rounded" placeholder="Job Profile" value={form.jobProfile}
            onChange={e => setForm({...form, jobProfile:e.target.value})} required />
          <input className="border p-3 rounded" placeholder="Package / CTC" value={form.packageCtc}
            onChange={e => setForm({...form, packageCtc:e.target.value})} required />
          <input className="border p-3 rounded" type="datetime-local" value={form.deadline}
            onChange={e => setForm({...form, deadline:e.target.value})} required />
          <input className="border p-3 rounded" placeholder="Minimum GPA" value={form.minGpa}
            onChange={e => setForm({...form, minGpa:e.target.value})} />
          <input className="border p-3 rounded" placeholder="Departments: CSE, ECE" value={form.departments}
            onChange={e => setForm({...form, departments:e.target.value})} />
          <input className="border p-3 rounded" placeholder="Graduation years: 2026, 2027" value={form.graduationYears}
            onChange={e => setForm({...form, graduationYears:e.target.value})} />
          <textarea className="border p-3 rounded md:col-span-2" placeholder="Job description"
            value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
          <button className="bg-slate-900 text-white p-3 rounded md:col-span-2">Post Job</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Placement Drives</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <article key={job._id} className="bg-white p-5 rounded-2xl shadow">
              <h3 className="font-bold">{job.jobProfile}</h3>
              <p>{job.packageCtc}</p>
              <p>Deadline: {new Date(job.deadline).toLocaleString()}</p>
              <button onClick={() => viewApplicants(job)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">
                View Applicants
              </button>
            </article>
          ))}
        </div>
      </section>

      {selectedJob && (
        <section className="mt-8 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Applicants — {selectedJob.jobProfile}</h2>
          {applications.length === 0 ? <p>No applicants yet.</p> : (
            <div className="space-y-3">
              {applications.map(a => (
                <div key={a._id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{a.student?.name}</p>
                    <p className="text-sm text-slate-600">{a.student?.email}</p>
                  </div>
                  <span className="font-semibold">{a.status}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-sm text-slate-500">
            Application status changes are restricted to Admin in this implementation.
          </p>
        </section>
      )}
    </main>
  );
}
