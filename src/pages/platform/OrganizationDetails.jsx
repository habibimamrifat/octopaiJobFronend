import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const ORGANIZATION_STATUSES = ["ACTIVE", "TRIAL", "SUSPENDED", "CANCELLED"];

const STATUS_LABELS = {
  ACTIVE: "Active",
  TRIAL: "Trial",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  TRIAL: "border-blue-200 bg-blue-50 text-blue-700",
  SUSPENDED: "border-amber-200 bg-amber-50 text-amber-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

function OrganizationDetails() {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    contactEmail: "",
    billingEmail: "",
  });

  useEffect(() => {
    let cancelled = false;

    const fetchOrganization = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/organizations/${organizationId}`);

        if (cancelled) return;

        const data = response.data;

        setOrganization(data);

        setForm({
          name: data.name || "",
          contactEmail: data.contactEmail || "",
          billingEmail: data.billingEmail || "",
        });
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to fetch organization:", error);

        setError(
          error.response?.data?.message || "Failed to load organization.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrganization();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/organizations/${organizationId}`,
        form,
      );

      setOrganization((current) => ({
        ...current,
        ...response.data,
      }));

      setSuccess("Organization updated successfully.");
    } catch (error) {
      console.error("Failed to update organization:", error);

      setError(
        error.response?.data?.message || "Failed to update organization.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/organizations/${organizationId}/status`,
        { status },
      );

      setOrganization((current) => ({
        ...current,
        ...(response.data || {}),
        status,
      }));

      setSuccess("Organization status updated successfully.");
    } catch (error) {
      console.error("Failed to update organization status:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update organization status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-xl bg-slate-100 lg:col-span-1" />
          <div className="h-72 animate-pulse rounded-xl bg-slate-100 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-lg font-semibold text-red-800">
            Organization not found
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || "The requested organization could not be found."}
          </p>

          <button
            onClick={() => navigate("/dashboard/organizations")}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = organization.status || "TRIAL";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7">
        <button
          onClick={() => navigate("/dashboard/organizations")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5" />
            <path d="M11 18l-6-6 6-6" />
          </svg>
          Back to Organizations
        </button>

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-600 shadow-sm">
              {organization.name?.charAt(0)?.toUpperCase() || "O"}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {organization.name}
                </h1>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    STATUS_STYLES[currentStatus] ||
                    "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {STATUS_LABELS[currentStatus] || currentStatus}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                ID: {organization.id}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Status</span>

            <select
              value={currentStatus}
              disabled={updatingStatus}
              onChange={(event) => handleStatusChange(event.target.value)}
              className={`h-9 rounded-lg border px-3 text-xs font-semibold outline-none ${
                STATUS_STYLES[currentStatus] ||
                "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {ORGANIZATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
            !
          </div>

          <div>
            <p className="text-sm font-semibold">Something went wrong</p>

            <p className="mt-0.5 text-xs">
              {Array.isArray(error) ? error.join(", ") : error}
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold">
            ✓
          </div>

          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Organization Overview */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Organization Overview
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Basic organization information
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Organization Name
              </p>

              <p className="text-sm font-medium text-slate-800">
                {organization.name || "—"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Contact Email
              </p>

              <p className="break-all text-sm text-slate-600">
                {organization.contactEmail || "—"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Billing Email
              </p>

              <p className="break-all text-sm text-slate-600">
                {organization.billingEmail || "—"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="text-sm text-slate-600">
                {organization.createdAt
                  ? new Date(organization.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>

            {organization.updatedAt && (
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Last Updated
                </p>

                <p className="text-sm text-slate-600">
                  {new Date(organization.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Organization */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Organization Settings
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Update organization contact information
            </p>
          </div>

          <form onSubmit={handleUpdate} className="p-5">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Organization Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Contact Email
                </label>

                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Billing */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Billing Email
                </label>

                <input
                  type="email"
                  name="billingEmail"
                  value={form.billingEmail}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Status Management */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Account Status
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Change the organization's platform status
            </p>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {ORGANIZATION_STATUSES.map((status) => {
              const selected = currentStatus === status;

              return (
                <button
                  key={status}
                  type="button"
                  disabled={selected || updatingStatus}
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected
                      ? STATUS_STYLES[status]
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  } disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {STATUS_LABELS[status]}
                    </span>

                    {selected && (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12.5l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <p className="mt-1 text-xs opacity-70">
                    {status === "ACTIVE" && "Organization is fully active."}

                    {status === "TRIAL" &&
                      "Organization is currently on trial."}

                    {status === "SUSPENDED" &&
                      "Organization access is suspended."}

                    {status === "CANCELLED" &&
                      "Organization account is cancelled."}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationDetails;
