import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      const response = await loginUser(email, password);

      console.log("Login response:", response);

      if (!response.access_token) {
        throw new Error("Access token not received from server.");
      }

      localStorage.setItem(
        "access_token",
        response.access_token
      );

      navigate("/dashboard");

    } catch (error) {
      console.error("Login failed:", error);

      if (error.response) {
        console.error(
          "Status:",
          error.response.status
        );

        console.error(
          "Backend response:",
          error.response.data
        );

        const detail =
          error.response.data?.detail ||
          "Login failed. Please check your email and password.";

        setError(detail);
      } else if (error.request) {
        setError(
          "Cannot connect to the backend server. Make sure FastAPI is running."
        );
      } else {
        setError(
          error.message ||
          "Something went wrong during login."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-blue-400">
            AutoFactory
          </h1>

          <p className="mt-2 text-slate-400">
            Login to your factory management account
          </p>

        </div>


        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* Login Form */}
        <form
          className="space-y-5"
          onSubmit={handleLogin}
        >

          {/* Email */}
          <div>

            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>


          {/* Password */}
          <div>

            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>


          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>


        {/* Signup */}
        <p className="mt-6 text-center text-sm text-slate-400">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Sign Up
          </Link>

        </p>


        {/* Back Home */}
        <div className="mt-6 text-center">

          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-300"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;