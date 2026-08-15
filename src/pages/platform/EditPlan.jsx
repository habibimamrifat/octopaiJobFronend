import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const BILLING_INTERVALS = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
};

function EditPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billingInterval: BILLING_INTERVALS.MONTHLY,
    features: [""],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get(
          `/subscriptions/${id}`,
        );

        const plan = response.data;

        setFormData({
          name: plan.name || "",
          description: plan.description || "",
          price: plan.price ?? "",
          billingInterval:
            plan.billingInterval ||
            BILLING_INTERVALS.MONTHLY,
          features:
            plan.features?.length
              ? plan.features
              : [""],
        });
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (
    index,
    value,
  ) => {
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
        (_, featureIndex) =>
          featureIndex !== index,
      );

      return {
        ...prev,
        features: features.length
          ? features
          : [""],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),

        description:
          formData.description.trim() ||
          undefined,

        price: Number(formData.price),

        billingInterval:
          formData.billingInterval,

        features: formData.features
          .map((feature) => feature.trim())
          .filter(Boolean),
      };

      await api.patch(
        `/subscriptions/${id}`,
        payload,
      );

      navigate(
        `/dashboard/plans/${id}`,
      );
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message ||
              "Failed to update plan.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-gray-500">
          Loading plan...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/dashboard/plans/${id}`,
            )
          }
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Plan
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Edit Subscription Plan
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the subscription plan information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

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
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  required
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                value={
                  formData.billingInterval
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option
                  value={
                    BILLING_INTERVALS.MONTHLY
                  }
                >
                  Monthly
                </option>

                <option
                  value={
                    BILLING_INTERVALS.YEARLY
                  }
                >
                  Yearly
                </option>
              </select>
            </div>
          </div>

          {/* Features */}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Features
              </label>

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
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {formData.features.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeFeature(index)
                        }
                        className="rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50"
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
            onClick={() =>
              navigate(
                `/dashboard/plans/${id}`,
              )
            }
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPlan;