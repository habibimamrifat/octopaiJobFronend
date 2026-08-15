import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function PlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get(
          `/subscriptions/${id}`,
        );

        setPlan(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load plan.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-gray-500">
          Loading plan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button
          onClick={() => navigate("/dashboard/plans")}
          className="mb-5 text-sm font-medium text-blue-600"
        >
          ← Back to Plans
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() =>
              navigate("/dashboard/plans")
            }
            className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Plans
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            {plan.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Subscription plan details
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/dashboard/plans/${plan.id}/edit`,
            )
          }
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Edit Plan
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Plan Information
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Plan Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {plan.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Price
              </p>

              <p className="mt-1 font-medium text-gray-900">
                ${Number(plan.price).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Billing Interval
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {plan.billingInterval}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="mt-1">
                {plan.isActive === false ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Disabled
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Active
                  </span>
                )}
              </p>
            </div>
          </div>

          {plan.description && (
            <div className="mt-6 border-t pt-6">
              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="mt-2 text-gray-700">
                {plan.description}
              </p>
            </div>
          )}
        </div>

        {/* Features */}

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Features
          </h2>

          {plan.features?.length ? (
            <ul className="space-y-3">
              {plan.features.map(
                (feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                      ✓
                    </span>

                    {feature}
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No features added.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanDetails;