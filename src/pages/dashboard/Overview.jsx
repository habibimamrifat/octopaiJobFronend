import { useAuth } from "../../hooks/useAuth";

function Overview() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>

      <p className="mt-2 text-gray-600">
        Welcome back. You are logged in as{" "}
        <span className="font-semibold text-blue-600">{user?.role}</span>.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Organizations</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Users</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Active Subscriptions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">$0</p>
        </div>
      </div>
    </div>
  );
}

export default Overview;
