import React, { useState } from "react";

export default function Signin({ setAuth, onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Get backend API URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setAuth({ username: data.username });
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white bg-opacity-5 shadow-xl rounded-xl px-8 py-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          <span className="text-blue-200">&lt;</span>
          Pass
          <span className="text-blue-200">/Lock&gt;</span>
        </h2>
        <h3 className="text-xl font-semibold text-center text-violet-700 mb-4">
          Sign In
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-violet-700 hover:bg-violet-800 text-white font-semibold py-2 rounded-lg transition duration-150"
          >
            Sign In
          </button>
          {error && (
            <div className="text-red-600 text-center font-medium">{error}</div>
          )}
        </form>
        <p className="mt-6 text-center text-violet-800">
          Don't have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer font-semibold"
            onClick={onSwitch}
          >
            Sign up here
          </span>
        </p>
      </div>
    </div>
  );
}
