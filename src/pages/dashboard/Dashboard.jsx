import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import Menu from "../../components/Menu";
import SubMenu from "../../components/SubMenu";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="fixed top-0 right-0 left-0 z-20 h-16 border-b bg-white">
        <div className="flex h-full items-center justify-between px-6">
          <h1 className="text-xl font-bold text-gray-900">
            Octopi Digital
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Logged in as:
              <span className="ml-1 font-semibold text-blue-600">
                {user.role}
              </span>
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed top-16 bottom-0 left-0 z-10 w-64 border-r bg-white">
        <nav className="p-4">
          <Menu />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16">
        {/* Submenu */}
        <div className="h-14 border-b bg-white px-6">
          <SubMenu />
        </div>

        {/* Page */}
        <section className="p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;