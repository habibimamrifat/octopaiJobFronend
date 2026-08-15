/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Plans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchPlans = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/subscriptions");

      setPlans(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load subscription plans.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleView = async (id) => {
    setActionLoading(id);
    setError("");

    try {
      await api.get(`/subscriptions/${id}`);

      navigate(`/dashboard/plans/${id}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load plan details.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDisable = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to disable this plan?",
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(id);
    setError("");

    try {
      await api.delete(`/subscriptions/${id}`);

      await fetchPlans();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to disable subscription plan.",
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Plans
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage subscription plans available to organizations.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Loading plans...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Plans
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage subscription plans available to organizations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/plans/create")}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Create Plan
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {Array.isArray(error) ? error.join(", ") : error}
        </div>
      )}

      {/* Empty */}

      {plans.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          No subscription plans found.
        </div>
      )}

      {/* Table */}

      {plans.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Name
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Price
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Billing
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Features
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {plan.name}
                      </div>

                      {plan.description && (
                        <div className="mt-1 max-w-xs truncate text-sm text-gray-500">
                          {plan.description}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      ${Number(plan.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {plan.billingInterval}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {plan.features?.length ?? 0}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          plan.isActive === false
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {plan.isActive === false
                          ? "Disabled"
                          : "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(plan.id)}
                          disabled={actionLoading === plan.id}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/dashboard/plans/${plan.id}/edit`,
                            )
                          }
                          className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        {plan.isActive !== false && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDisable(plan.id)
                            }
                            disabled={actionLoading === plan.id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {actionLoading === plan.id
                              ? "Disabling..."
                              : "Disable"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plans;