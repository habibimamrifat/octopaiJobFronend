import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      const data = response.data;

      if (Array.isArray(data)) {
        setMembers(data);
      } else if (Array.isArray(data?.users)) {
        setMembers(data.users);
      } else if (Array.isArray(data?.data)) {
        setMembers(data.data);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load organization members.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await api.get("/users");

        if (cancelled) return;

        const data = response.data;

        if (Array.isArray(data)) {
          setMembers(data);
        } else if (Array.isArray(data?.users)) {
          setMembers(data.users);
        } else if (Array.isArray(data?.data)) {
          setMembers(data.data);
        } else {
          setMembers([]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch members:", err);

          setError(
            err?.response?.data?.message ||
              "Failed to load organization members.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (member) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name} from the organization?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(member.id);
      setError("");
      setSuccess("");

      await api.delete(`/users/${member.id}`);

      setMembers((current) =>
        current.filter((item) => item.id !== member.id),
      );

      setSuccess(`${member.name} has been removed successfully.`);
    } catch (err) {
      console.error("Failed to remove member:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to remove the organization member.",
      );
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleLabel = (role) => {
    if (role === "ORGANIZATION_ADMIN") return "Organization Admin";
    if (role === "ORGANIZATION_MEMBER") return "Organization Member";
    if (role === "PLATFORM_ADMIN") return "Platform Admin";

    return role || "-";
  };

  const getRoleClass = (role) => {
    if (role === "ORGANIZATION_ADMIN") {
      return "bg-blue-50 text-blue-700 ring-blue-600/20";
    }

    if (role === "PLATFORM_ADMIN") {
      return "bg-purple-50 text-purple-700 ring-purple-600/20";
    }

    return "bg-gray-50 text-gray-700 ring-gray-600/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Organization Members
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage users belonging to your organization.
          </p>
        </div>

        <Link
          to="/dashboard/members/invite"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Add Member
        </Link>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Members
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {members.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Organization Admins
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {
              members.filter(
                (member) => member.role === "ORGANIZATION_ADMIN",
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Organization Members
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {
              members.filter(
                (member) => member.role === "ORGANIZATION_MEMBER",
              ).length
            }
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">All Members</h2>

          <p className="mt-1 text-xs text-gray-500">
            Users currently belonging to your organization.
          </p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 px-5 py-5"
              >
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-56 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <div className="h-5 w-5 rounded border-2 border-gray-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No members found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add your first organization member to get started.
            </p>

            <Link
              to="/dashboard/members/invite"
              className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Add Member
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Member
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {member.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getRoleClass(
                            member.role,
                          )}`}
                        >
                          {getRoleLabel(member.role)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(member.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          disabled={deleting === member.id}
                          className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleting === member.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
              {members.map((member) => (
                <div key={member.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                        {member.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {member.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(member)}
                      disabled={deleting === member.id}
                      className="text-sm font-medium text-red-600 disabled:opacity-50"
                    >
                      {deleting === member.id ? "Removing..." : "Remove"}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getRoleClass(
                        member.role,
                      )}`}
                    >
                      {getRoleLabel(member.role)}
                    </span>

                    <span className="text-xs text-gray-500">
                      Joined {formatDate(member.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && members.length > 0 && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Showing {members.length}{" "}
            {members.length === 1 ? "member" : "members"}
          </span>

          <button
            type="button"
            onClick={fetchMembers}
            className="font-medium text-gray-700 hover:text-gray-900"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

export default Members;