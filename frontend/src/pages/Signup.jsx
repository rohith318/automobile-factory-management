import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Signup() {
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const fullName = e.target.fullName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await registerUser(
        fullName,
        email,
        password
      );

      console.log("Signup successful:", response);

      // After successful registration, go to Login
      navigate("/login");

    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-blue-400">
            AutoFactory
          </h1>

          <p className="mt-2 text-slate-400">
            Create your factory management account
          </p>

        </div>

        {/* Signup Form */}
        <form
          className="space-y-5"
          onSubmit={handleSignup}
        >

          {/* Full Name */}
          <div>

            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <input
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

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
              placeholder="Create a password"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* Create Account */}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-700"
          >
            Create Account
          </button>

        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-slate-400">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Login
          </Link>

        </p>

        {/* Home */}
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

export default Signup;