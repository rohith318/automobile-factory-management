import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 px-8 py-5 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-blue-400">
            AutoFactory
          </h1>
          <p className="text-xs text-slate-400">
            Smart Factory Management
          </p>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-6xl">

          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Automobile Industry
            </p>

            <h2 className="text-5xl font-bold leading-tight md:text-6xl">
              Manage Your Factory
              <span className="block text-blue-500">
                Smarter & Faster.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              A centralized platform to manage production, workers,
              machinery, inventory, quality, maintenance and factory
              operations from one place.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex gap-4">

              <Link
                to="/login"
                className="rounded-lg bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-700"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg border border-slate-700 px-7 py-3 font-semibold transition hover:bg-slate-800"
              >
                Sign Up
              </Link>

            </div>
          </div>

          {/* Statistics */}
          <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4">

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-3xl font-bold text-blue-400">18+</h3>
              <p className="mt-2 text-sm text-slate-400">
                Management Modules
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-3xl font-bold text-blue-400">24/7</h3>
              <p className="mt-2 text-sm text-slate-400">
                Factory Monitoring
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-3xl font-bold text-blue-400">100%</h3>
              <p className="mt-2 text-sm text-slate-400">
                Centralized Data
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-3xl font-bold text-blue-400">API</h3>
              <p className="mt-2 text-sm text-slate-400">
                FastAPI Powered
              </p>
            </div>

          </div>

          {/* Features */}
          <div className="mt-24">

            <div className="mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Platform
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                Everything your factory needs
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <Feature
                title="Production"
                description="Track vehicle production, stages, costs and production status."
              />

              <Feature
                title="Workforce"
                description="Manage workers, attendance, payroll and employee operations."
              />

              <Feature
                title="Machinery"
                description="Monitor machinery, robotics and maintenance activities."
              />

              <Feature
                title="Inventory"
                description="Manage raw materials, warehouses and inventory transactions."
              />

              <Feature
                title="Quality Control"
                description="Track quality checks and production quality results."
              />

              <Feature
                title="Analytics"
                description="View production, cost and factory performance insights."
              />

            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-8 py-8 text-center text-sm text-slate-500">
        © 2026 AutoFactory — Automobile Industry Production & Factory Management System
      </footer>

    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-600">
      <h4 className="text-xl font-semibold">
        {title}
      </h4>

      <p className="mt-3 leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default LandingPage;