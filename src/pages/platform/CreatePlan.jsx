import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const BILLING_INTERVALS = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
};

function CreatePlan() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billingInterval: BILLING_INTERVALS.MONTHLY,
    features: [""],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData((prev) => {
      const features = [...prev.features];

      features[index] = value;

      return {
        ...prev,
        features,
      };
    });
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => {
      const features = prev.features.filter(
        (_, featureIndex) => featureIndex !== index,
      );

      return {
        ...prev,
        features: features.length ? features : [""],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),

        description:
          formData.description.trim() || undefined,

        price: Number(formData.price),

        billingInterval: formData.billingInterval,

        features: formData.features
          .map((feature) => feature.trim())
          .filter(Boolean),
      };

      await api.post("/subscriptions", payload);

      navigate("/dashboard/plans");
    } catch (error) {
      console.error(error);

      const message = error.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to create subscription plan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/plans")}
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Plans
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Create Subscription Plan
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new plan that organizations can
          subscribe to.
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="space-y-6">
          {/* Name */}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Plan Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Professional"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Description */}

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Professional plan for growing organizations"
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Price + Billing */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Price
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="49.99"
                  required
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="billingInterval"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Billing Interval
              </label>

              <select
                id="billingInterval"
                name="billingInterval"
                value={formData.billingInterval}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value={BILLING_INTERVALS.MONTHLY}>
                  Monthly
                </option>

                <option value={BILLING_INTERVALS.YEARLY}>
                  Yearly
                </option>
              </select>
            </div>
          </div>

          {/* Features */}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Features
                </label>

                <p className="mt-1 text-xs text-gray-500">
                  Add the features included in this plan.
                </p>
              </div>

              <button
                type="button"
                onClick={addFeature}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                + Add Feature
              </button>
            </div>

            <div className="space-y-3">
              {formData.features.map(
                (feature, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >
                    <input
                      type="text"
                      value={feature}
                      onChange={(event) =>
                        handleFeatureChange(
                          index,
                          event.target.value,
                        )
                      }
                      placeholder={`Feature ${
                        index + 1
                      }`}
                      required
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeFeature(index)
                        }
                        className="rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Actions */}

        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/plans")}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePlan;