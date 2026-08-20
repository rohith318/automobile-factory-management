import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  connectNotifications,
  disconnectNotifications,
} from "../services/notificationService";


function Dashboard() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] =
    useState(false);


  // =====================================================
  // WEBSOCKET NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    const socket = connectNotifications(
      (notification) => {
        console.log(
          "Dashboard notification:",
          notification
        );

        setNotifications((previous) => [
          notification,
          ...previous,
        ]);
      }
    );

    return () => {
      disconnectNotifications(socket);
    };
  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    navigate("/login");
  };


  // =====================================================
  // CLEAR NOTIFICATIONS
  // =====================================================

  const clearNotifications = () => {
    setNotifications([]);
  };


  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">

        <div>
          <h1 className="text-xl font-bold text-blue-400">
            AutoFactory
          </h1>

          <p className="text-xs text-slate-400">
            Production & Factory Management System
          </p>
        </div>


        <div className="flex items-center gap-4">

          <span className="hidden text-sm text-slate-400 md:block">
            Rohith Raj
          </span>


          {/* =================================================
              NOTIFICATION BELL
          ================================================= */}

          <div className="relative">

            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className="relative rounded-lg border border-slate-700 px-3 py-2 text-lg transition hover:bg-slate-800"
              title="Notifications"
            >
              🔔

              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {notifications.length > 99
                    ? "99+"
                    : notifications.length}
                </span>
              )}
            </button>


            {/* =================================================
                NOTIFICATION DROPDOWN
            ================================================= */}

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">

                  <div>
                    <h3 className="font-semibold">
                      Notifications
                    </h3>

                    <p className="text-xs text-slate-500">
                      Real-time factory alerts
                    </p>
                  </div>


                  {notifications.length > 0 && (
                    <button
                      onClick={
                        clearNotifications
                      }
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Clear
                    </button>
                  )}

                </div>


                <div className="max-h-80 overflow-y-auto">

                  {notifications.length === 0 ? (

                    <div className="px-4 py-8 text-center">

                      <div className="text-2xl">
                        🔔
                      </div>

                      <p className="mt-2 text-sm text-slate-400">
                        No new notifications
                      </p>

                    </div>

                  ) : (

                    notifications.map(
                      (notification, index) => (

                        <div
                          key={index}
                          className="border-b border-slate-800 px-4 py-4 hover:bg-slate-800"
                        >

                          <div className="flex gap-3">

                            <div className="text-lg">
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>


                            <div className="flex-1">

                              <p className="text-sm font-medium text-white">
                                {notification.title ||
                                  "Factory Notification"}
                              </p>


                              <p className="mt-1 text-xs text-slate-400">
                                {notification.message ||
                                  "New factory event received."}
                              </p>


                              <p className="mt-2 text-[10px] text-slate-600">
                                Just now
                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>
            )}

          </div>


          {/* =================================================
              LOGOUT
          ================================================= */}

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          PAGE LAYOUT
      ===================================================== */}

      <div className="flex pt-16">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r border-slate-800 bg-slate-900 p-4 md:block [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Main Menu
          </p>


          <nav className="space-y-1">

            <SidebarLink
              to="/dashboard"
              label="Dashboard"
              active
            />

            <SidebarLink
              to="/factories"
              label="Factories"
            />

            <SidebarLink
              to="/departments"
              label="Departments"
            />

            <SidebarLink
              to="/workers"
              label="Workers"
            />

            <SidebarLink
              to="/attendance"
              label="Attendance"
            />

            <SidebarLink
              to="/production-lines"
              label="Production Lines"
            />

            <SidebarLink
              to="/production"
              label="Vehicle Production"
            />

            <SidebarLink
              to="/machinery"
              label="Machinery"
            />

            <SidebarLink
              to="/qr-tracking"
              label="QR Tracking"
            />

            <SidebarLink
              to="/iot-monitoring"
              label="IoT Monitoring"
            />
            <SidebarLink
                to="/ai-production"
                label="AI Production"
              />
              <SidebarLink
                  to="/face-attendance"
                  label="Face Attendance"
                />

            <SidebarLink
              to="/robotics"
              label="Robotics"
            />

            <SidebarLink
              to="/maintenance"
              label="Maintenance"
            />

            <SidebarLink
              to="/raw-materials"
              label="Raw Materials"
            />

            <SidebarLink
              to="/suppliers"
              label="Suppliers"
            />

            <SidebarLink
              to="/warehouse"
              label="Warehouse"
            />

            <SidebarLink
              to="/inventory"
              label="Inventory"
            />

            <SidebarLink
              to="/payroll"
              label="Payroll"
            />

            <SidebarLink
              to="/expenses"
              label="Expenses"
            />

            <SidebarLink
              to="/quality"
              label="Quality Control"
            />

            <SidebarLink
              to="/safety"
              label="Safety Incidents"
            />

            <SidebarLink
              to="/analytics"
              label="Reports & Analytics"
            />

          </nav>

        </aside>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="w-full md:ml-64">

          <div className="p-6 lg:p-8">


            {/* PAGE HEADER */}

            <div className="mb-8">

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Factory Overview
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Dashboard
              </h2>

              <p className="mt-2 text-slate-400">
                Monitor your automobile factory operations from one place.
              </p>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

              <DashboardCard
                title="Factories"
                value="1"
                description="Active factories"
              />

              <DashboardCard
                title="Workers"
                value="24"
                description="Registered workers"
              />

              <DashboardCard
                title="Production"
                value="2"
                description="Active production"
              />

              <DashboardCard
                title="Machinery"
                value="12"
                description="Registered machines"
              />

              <DashboardCard
                title="Robotics"
                value="8"
                description="Active robots"
              />

              <DashboardCard
                title="Inventory"
                value="156"
                description="Material records"
              />

              <DashboardCard
                title="Maintenance"
                value="₹25K"
                description="Maintenance cost"
              />

              <DashboardCard
                title="Payroll"
                value="₹1.2L"
                description="Monthly payroll"
              />

              <DashboardCard
                title="Expenses"
                value="₹2.5L"
                description="Factory expenses"
              />

              <DashboardCard
                title="Quality"
                value="98%"
                description="Quality pass rate"
              />

            </div>


            {/* =================================================
                PRODUCTION + FACTORY STATUS
            ================================================= */}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">


              <DashboardSection
                title="Production Overview"
              >

                <p className="text-sm text-slate-400">
                  Current vehicle production progress.
                </p>


                <div className="mt-6 space-y-6">

                  <Progress
                    title="In Progress"
                    value="65%"
                  />

                  <Progress
                    title="Completed"
                    value="35%"
                  />

                </div>

              </DashboardSection>


              <DashboardSection
                title="Factory Status"
              >

                <div className="space-y-3">

                  <Status
                    name="Production Lines"
                    status="Operational"
                  />

                  <Status
                    name="Machinery"
                    status="Operational"
                  />

                  <Status
                    name="Robotics"
                    status="Operational"
                  />

                  <Status
                    name="Inventory"
                    status="Available"
                  />

                  <Status
                    name="Quality Control"
                    status="Active"
                  />

                </div>

              </DashboardSection>

            </div>


            {/* =================================================
                COST + QUALITY + SAFETY
            ================================================= */}

            <div className="mt-6 grid gap-6 lg:grid-cols-3">


              <DashboardSection
                title="Cost Overview"
              >

                <CostRow
                  name="Maintenance"
                  amount="₹25,000"
                />

                <CostRow
                  name="Payroll"
                  amount="₹1,20,000"
                />

                <CostRow
                  name="Factory Expenses"
                  amount="₹2,50,000"
                />

                <CostRow
                  name="Production Cost"
                  amount="₹2,50,000"
                />

              </DashboardSection>


              <DashboardSection
                title="Quality Control"
              >

                <Status
                  name="Passed"
                  status="1"
                />

                <Status
                  name="Failed"
                  status="0"
                />

                <Status
                  name="Pass Rate"
                  status="100%"
                />

              </DashboardSection>


              <DashboardSection
                title="Safety Monitoring"
              >

                <Status
                  name="Total Incidents"
                  status="0"
                />

                <Status
                  name="Critical"
                  status="0"
                />

                <Status
                  name="Factory Safety"
                  status="Good"
                />

              </DashboardSection>

            </div>


            {/* =================================================
                RECENT PRODUCTION
            ================================================= */}

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-semibold">
                    Recent Vehicle Production
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Latest production records.
                  </p>

                </div>


                <Link
                  to="/production"
                  className="text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  View All
                </Link>

              </div>


              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-4 py-3">
                        Vehicle
                      </th>

                      <th className="px-4 py-3">
                        Chassis
                      </th>

                      <th className="px-4 py-3">
                        Stage
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3">
                        Cost
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    <ProductionRow
                      vehicle="Sedan X1"
                      chassis="CHS-2026-0001"
                      stage="ASSEMBLY"
                      status="IN PROGRESS"
                      cost="₹1,25,000"
                    />

                    <ProductionRow
                      vehicle="Sedan X1"
                      chassis="CHS-2026-0002"
                      stage="ASSEMBLY"
                      status="IN PROGRESS"
                      cost="₹1,25,000"
                    />

                  </tbody>

                </table>

              </div>

            </div>


            {/* =================================================
                QUICK ACCESS
            ================================================= */}

            <div className="mt-6">

              <h3 className="mb-4 text-lg font-semibold">
                Quick Access
              </h3>


              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <QuickLink
                  to="/workers"
                  title="Manage Workers"
                />

                <QuickLink
                  to="/production"
                  title="Production"
                />

                <QuickLink
                  to="/maintenance"
                  title="Maintenance"
                />

                <QuickLink
                  to="/analytics"
                  title="View Analytics"
                />

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}


/* =========================================================
   NOTIFICATION ICON
========================================================= */

function getNotificationIcon(type) {

  switch (type) {

    case "MACHINE_ALERT":
      return "⚠️";

    case "MAINTENANCE":
      return "🔧";

    case "PRODUCTION":
      return "🏭";

    case "QUALITY":
      return "✅";

    case "SAFETY":
      return "🚨";

    case "INVENTORY":
      return "📦";

    default:
      return "🔔";
  }
}


/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  to,
  label,
  active = false,
}) {

  return (
    <Link
      to={to}
      className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}


/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  title,
  value,
  description,
}) {

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-600">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-blue-400">
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   DASHBOARD SECTION
========================================================= */

function DashboardSection({
  title,
  children,
}) {

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <div className="mt-5">
        {children}
      </div>

    </div>
  );
}


/* =========================================================
   PROGRESS
========================================================= */

function Progress({
  title,
  value,
}) {

  return (
    <div>

      <div className="mb-2 flex justify-between text-sm">

        <span className="text-slate-300">
          {title}
        </span>

        <span className="text-slate-400">
          {value}
        </span>

      </div>


      <div className="h-2 rounded-full bg-slate-800">

        <div
          className="h-2 rounded-full bg-blue-600"
          style={{
            width: value,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   STATUS
========================================================= */

function Status({
  name,
  status,
}) {

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">

      <span className="text-sm text-slate-300">
        {name}
      </span>

      <span className="text-sm font-medium text-green-400">
        ● {status}
      </span>

    </div>
  );
}


/* =========================================================
   COST ROW
========================================================= */

function CostRow({
  name,
  amount,
}) {

  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-3">

      <span className="text-sm text-slate-400">
        {name}
      </span>

      <span className="font-semibold text-white">
        {amount}
      </span>

    </div>
  );
}


/* =========================================================
   PRODUCTION ROW
========================================================= */

function ProductionRow({
  vehicle,
  chassis,
  stage,
  status,
  cost,
}) {

  return (
    <tr className="border-b border-slate-800">

      <td className="px-4 py-4 font-medium">
        {vehicle}
      </td>

      <td className="px-4 py-4 text-slate-400">
        {chassis}
      </td>

      <td className="px-4 py-4 text-slate-400">
        {stage}
      </td>

      <td className="px-4 py-4 text-blue-400">
        {status}
      </td>

      <td className="px-4 py-4">
        {cost}
      </td>

    </tr>
  );
}


/* =========================================================
   QUICK LINK
========================================================= */

function QuickLink({
  to,
  title,
}) {

  return (
    <Link
      to={to}
      className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-600 hover:bg-slate-800"
    >

      <span className="font-medium">
        {title}
      </span>

      <span className="mt-2 block text-sm text-slate-500">
        Open module →
      </span>

    </Link>
  );
}


export default Dashboard;