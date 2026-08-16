import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ORGANIZATION_STATUSES = [
  "ACTIVE",
  "TRIAL",
  "SUSPENDED",
  "CANCELLED",
];

const STATUS_LABELS = {
  ACTIVE: "Active",
  TRIAL: "Trial",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  TRIAL: "bg-blue-50 text-blue-700 border-blue-200",
  SUSPENDED: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

function Organizations() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadOrganizations = async () => {
      try {
        const response = await api.get("/organizations");

        if (cancelled) return;

        setOrganizations(response.data);
        setError("");
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to fetch organizations:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load organizations.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleStatusChange = async (organizationId, status) => {
    try {
      setUpdatingStatus(organizationId);
      setError("");

      await api.patch(
        `/organizations/${organizationId}/status`,
        { status },
      );

      setOrganizations((current) =>
        current.map((organization) =>
          organization.id === organizationId
            ? { ...organization, status }
            : organization,
        ),
      );
    } catch (error) {
      console.error("Failed to update status:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update organization status.",
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const totalOrganizations = organizations.length;

  const activeOrganizations = organizations.filter(
    (organization) => organization.status === "ACTIVE",
  ).length;

  const trialOrganizations = organizations.filter(
    (organization) => organization.status === "TRIAL",
  ).length;

  const suspendedOrganizations = organizations.filter(
    (organization) => organization.status === "SUSPENDED",
  ).length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm text-slate-400">
            Platform / Organizations
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
            Organizations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage organizations across the platform.
          </p>
        </div>

        <div className="flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
            Loading organizations...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
            <span>Platform</span>
            <span>/</span>
            <span>Organizations</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Organizations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage organizations, subscriptions, and account
            status.
          </p>
        </div>

        <button
          onClick={() =>
            setRefreshKey((value) => value + 1)
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span className="text-base">↻</span>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
            !
          </div>

          <div>
            <p className="text-sm font-semibold">
              Something went wrong
            </p>

            <p className="mt-0.5 text-xs">
              {Array.isArray(error)
                ? error.join(", ")
                : error}
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Total Organizations
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalOrganizations}
              </p>
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12.5l4 4L19 7" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Active
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {activeOrganizations}
              </p>
            </div>
          </div>
        </div>

        {/* Trial */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l3 2" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Trial
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {trialOrganizations}
              </p>
            </div>
          </div>
        </div>

        {/* Suspended */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 4l9 16H3L12 4z" />
                <path d="M12 9v5M12 17h.01" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Suspended
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {suspendedOrganizations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All Organizations
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {totalOrganizations} organization
              {totalOrganizations !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        {organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 7h8M8 11h8M8 15h4" />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No organizations found
            </h3>

            <p className="mt-1 max-w-sm text-xs text-slate-400">
              There are currently no organizations registered
              on the platform.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Organization
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Billing
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {organizations.map((organization) => {
                  const status =
                    organization.status || "TRIAL";

                  return (
                    <tr
                      key={organization.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/60 last:border-0"
                    >
                      {/* Organization */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600">
                            {organization.name
                              ?.charAt(0)
                              ?.toUpperCase() || "O"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {organization.name}
                            </p>

                            <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-400">
                              {organization.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-600">
                          {organization.contactEmail || "—"}
                        </span>
                      </td>

                      {/* Billing */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-600">
                          {organization.billingEmail || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <select
                          value={status}
                          disabled={
                            updatingStatus ===
                            organization.id
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              organization.id,
                              event.target.value,
                            )
                          }
                          className={`h-8 rounded-md border px-2.5 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            STATUS_STYLES[status] ||
                            "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {ORGANIZATION_STATUSES.map(
                            (organizationStatus) => (
                              <option
                                key={organizationStatus}
                                value={organizationStatus}
                              >
                                {
                                  STATUS_LABELS[
                                    organizationStatus
                                  ]
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-500">
                          {organization.createdAt
                            ? new Date(
                                organization.createdAt,
                              ).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/organizations/${organization.id}`,
                            )
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        >
                          View
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M5 12h13" />
                            <path d="M13 6l6 6-6 6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Organizations;