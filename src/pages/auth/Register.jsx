import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    billingEmail: "",
    userName: "",
    userEmail: "",
    userPassword: "",
    packageId: "",
  });

  // -----------------------------------------
  // Fetch subscription plans
  // -----------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        setError("");

        const response = await api.get("/subscriptions");

        if (cancelled) {
          return;
        }

        const activePlans = (response.data || []).filter(
          (plan) => plan.isActive !== false,
        );

        setPlans(activePlans);

        // Select first plan automatically
        if (activePlans.length > 0) {
          setFormData((prev) => ({
            ...prev,
            packageId: activePlans[0].id,
          }));
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              "Failed to load subscription plans.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPlans(false);
        }
      }
    };

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------------------
  // Handle input
  // -----------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // Register organization
  // -----------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // =====================================
      // STEP 1
      // Create pending registration
      // =====================================

      const registrationResponse = await api.post("/organizations", formData);

      const registrationId = registrationResponse.data?.registrationId;

      if (!registrationId) {
        throw new Error("Registration ID was not returned by the server.");
      }

      // =====================================
      // STEP 2
      // Create Stripe checkout session
      // =====================================

      const checkoutResponse = await api.post(
        `/payments/checkout/${registrationId}`,
      );

      const checkoutUrl = checkoutResponse.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned by the server.");
      }

      // =====================================
      // STEP 3
      // Redirect to Stripe
      // =====================================

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again.",
      );

      setLoading(false);
    }
  };

  // -----------------------------------------
  // Loading plans
  // -----------------------------------------

  if (loadingPlans) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Your Organization
          </h1>

          <p className="mt-2 text-gray-500">
            Create your organization and choose a subscription plan.
          </p>
        </div>

        {/* Main Card */}

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Error */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {Array.isArray(error) ? error.join(", ") : error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* =========================================
                ORGANIZATION
            ========================================= */}

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Organization Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Organization Name */}

                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Organization Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Contact Email */}

                <div>
                  <label
                    htmlFor="contactEmail"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Contact Email
                  </label>

                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Billing Email */}

                <div>
                  <label
                    htmlFor="billingEmail"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Billing Email
                  </label>

                  <input
                    id="billingEmail"
                    name="billingEmail"
                    type="email"
                    value={formData.billingEmail}
                    onChange={handleChange}
                    placeholder="billing@company.com"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* =========================================
                ADMIN
            ========================================= */}

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Organization Administrator
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* User Name */}

                <div>
                  <label
                    htmlFor="userName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* User Email */}

                <div>
                  <label
                    htmlFor="userEmail"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="userEmail"
                    name="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Password */}

                <div className="md:col-span-2">
                  <label
                    htmlFor="userPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>

                  <input
                    id="userPassword"
                    name="userPassword"
                    type="password"
                    value={formData.userPassword}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* =========================================
                PLANS
            ========================================= */}

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Choose Subscription Plan
              </h2>

              {plans.length === 0 ? (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                  No active subscription plans are currently available.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {plans.map((plan) => {
                    const selected = formData.packageId === plan.id;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            packageId: plan.id,
                          }))
                        }
                        className={`rounded-xl border-2 p-5 text-left transition ${
                          selected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {plan.name}
                            </h3>

                            {plan.description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {plan.description}
                              </p>
                            )}
                          </div>

                          {selected && (
                            <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="mt-4">
                          <span className="text-2xl font-bold text-gray-900">
                            ${Number(plan.price).toFixed(2)}
                          </span>

                          <span className="ml-1 text-sm text-gray-500">
                            / {plan.billingInterval?.toLowerCase()}
                          </span>
                        </div>

                        {plan.features?.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                ✓ {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =========================================
                SUBMIT
            ========================================= */}

            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={loading || !formData.packageId}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Preparing Payment..." : "Continue to Payment"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-3 w-full rounded-lg px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
