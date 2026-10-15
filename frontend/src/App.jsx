import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import api from "./api";
import StudentDashboard from "./components/StudentDashboard";
import CompanyDashboard from "./components/CompanyDashboard";
import AdminDashboard from "./components/AdminDashboard";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-6">CampusHire Login</h1>
        {error && <p className="mb-4 text-red-600">{error}</p>}
        <input className="w-full border p-3 rounded mb-3" placeholder="Email" type="email"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <input className="w-full border p-3 rounded mb-4" placeholder="Password" type="password"
          value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
        <button className="w-full bg-slate-900 text-white p-3 rounded">Login</button>
        <Link className="block mt-4 text-blue-600" to="/register">Create Student/Company account</Link>
      </form>
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        {message && <p className="mb-4 text-red-600">{message}</p>}
        <input className="w-full border p-3 rounded mb-3" placeholder="Name"
          value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="w-full border p-3 rounded mb-3" placeholder="Email" type="email"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <input className="w-full border p-3 rounded mb-3" placeholder="Password (8+ characters)" type="password"
          value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={8} required />
        <select className="w-full border p-3 rounded mb-4" value={form.role}
          onChange={e => setForm({...form, role: e.target.value})}>
          <option>Student</option>
          <option>Company</option>
        </select>
        <button className="w-full bg-slate-900 text-white p-3 rounded">Register</button>
        <Link className="block mt-4 text-blue-600" to="/login">Already have an account?</Link>
      </form>
    </div>
  );
}

function Protected({ roles, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !localStorage.getItem("token")) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Student") return <StudentDashboard />;
  if (user.role === "Company") return <CompanyDashboard />;
  return <AdminDashboard />;
}

function Nav() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();
  if (!user) return null;

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="font-bold">CampusHire</Link>
      <div className="flex gap-4 items-center">
        <span className="text-sm">{user.name} · {user.role}</span>
        <button onClick={logout} className="bg-white text-slate-900 px-3 py-1 rounded">Logout</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/student" element={<Protected roles={["Student"]}><StudentDashboard /></Protected>} />
        <Route path="/company" element={<Protected roles={["Company"]}><CompanyDashboard /></Protected>} />
        <Route path="/admin" element={<Protected roles={["Admin"]}><AdminDashboard /></Protected>} />
      </Routes>
    </>
  );
}
