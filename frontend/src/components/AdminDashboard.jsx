import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  const loadJobs = async () => {
    const { data } = await api.get("/jobs");
    setJobs(data.jobs);
  };

  useEffect(() => { loadJobs().catch(err => setMessage(err.response?.data?.message || "Could not load jobs")); }, []);

  const viewApplicants = async job => {
    try {
      const { data } = await api.get(`/jobs/${job._id}/applicants`);
      setSelectedJob(job);
      setApplications(data.applications);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not load applicants");
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      setApplications(prev => prev.map(a => a._id === applicationId ? {...a, status} : a));
      setMessage("Application status updated");
    } catch (err) {
      setMessage(err.response?.data?.message || "Status update failed");
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      {message && <p className="mb-5 text-blue-700">{message}</p>}

      <section className="grid md:grid-cols-2 gap-4">
        {jobs.map(job => (
          <article key={job._id} className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-bold">{job.jobProfile}</h2>
            <p>{job.companyName} · {job.packageCtc}</p>
            <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
            <button onClick={() => viewApplicants(job)}
              className="mt-3 bg-slate-900 text-white px-4 py-2 rounded">
              Manage Applicants
            </button>
          </article>
        ))}
      </section>

      {selectedJob && (
        <section className="mt-8 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Applicants — {selectedJob.jobProfile}</h2>
          {applications.length === 0 ? <p>No applicants.</p> : (
            <div className="space-y-3">
              {applications.map(a => (
                <div key={a._id} className="border rounded p-4 flex flex-col md:flex-row md:justify-between gap-3">
                  <div>
                    <p className="font-semibold">{a.student?.name}</p>
                    <p className="text-sm text-slate-600">{a.student?.email}</p>
                  </div>
                  <select className="border rounded p-2" value={a.status}
                    onChange={e => updateStatus(a._id, e.target.value)}>
                    <option>Applied</option>
                    <option>Shortlisted</option>
                    <option>Selected</option>
                    <option>Rejected</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
