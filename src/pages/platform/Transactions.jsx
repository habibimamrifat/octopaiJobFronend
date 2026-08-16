import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

const INITIAL_FILTERS = {
  startDate: "",
  endDate: "",
  status: "",
  currency: "",
};

function Transactions() {
  const { user } = useAuth();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN";

  const buildQuery = (values) => {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    return params.toString();
  };

  const fetchTransactions = (currentFilters = filters) => {
    setLoading(true);
    setError("");

    const query = buildQuery(currentFilters);

    Promise.all([
      api.get(`/analytics/transactions?${query}`),
      api.get(`/analytics/transactions/revenue?${query}`),
    ])
      .then(([transactionsResponse, revenueResponse]) => {
        setAnalytics({
          transactions: transactionsResponse.data,
          revenue: revenueResponse.data,
        });
      })
      .catch((err) => {
        console.error("Transactions analytics error:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load transaction analytics.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let cancelled = false;

    const query = buildQuery(INITIAL_FILTERS);

    Promise.all([
      api.get(`/analytics/transactions?${query}`),
      api.get(`/analytics/transactions/revenue?${query}`),
    ])
      .then(([transactionsResponse, revenueResponse]) => {
        if (cancelled) return;

        setAnalytics({
          transactions: transactionsResponse.data,
          revenue: revenueResponse.data,
        });
      })
      .catch((err) => {
        if (cancelled) return;

        console.error("Transactions analytics error:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load transaction analytics.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleApply = () => {
    fetchTransactions(filters);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    fetchTransactions(INITIAL_FILTERS);
  };

  const transactions = analytics?.transactions || {};
  const revenue = analytics?.revenue || {};

  const totals = transactions?.totals || {};
  const revenueTotals = revenue?.totals || {};

  const total = Number(totals.total || 0);
  const pending = Number(totals.pending || 0);
  const success = Number(totals.success || 0);
  const failed = Number(totals.failed || 0);
  const refunded = Number(totals.refunded || 0);
  const rolledBack = Number(totals.rolledBack || 0);

  const totalRevenue = Number(
    revenueTotals.revenue ||
      revenueTotals.totalRevenue ||
      revenueTotals.amount ||
      0,
  );

  const formatMoney = (value) => {
    const currency = filters.currency?.toUpperCase() || "USD";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(value || 0));
  };

  const getPercentage = (value) => {
    if (!total) return 0;

    return Math.round((Number(value) / total) * 100);
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-xl bg-white shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 8h8M8 12h8M8 16h4"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Transactions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isPlatformAdmin
                  ? "Monitor all platform transactions and financial activity."
                  : "Monitor your organization's transaction activity."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">
            {isPlatformAdmin ? "Platform" : "Organization"}
          </span>

          <button
            type="button"
            onClick={() => fetchTransactions(filters)}
            disabled={loading}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Transaction Filters
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Filter transaction analytics by date, status and currency.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            Reset
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterInput
            label="Start Date"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
          />

          <FilterInput
            label="End Date"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
          />

          <FilterSelect
            label="Transaction Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={[
              ["PENDING", "Pending"],
              ["SUCCESS", "Success"],
              ["FAILED", "Failed"],
              ["REFUNDED", "Refunded"],
              ["ROLLED_BACK", "Rolled Back"],
            ]}
          />

          <FilterInput
            label="Currency"
            name="currency"
            value={filters.currency}
            placeholder="usd"
            onChange={handleFilterChange}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Apply Filters"}
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={total}
          description="Transactions in selected period"
        />

        <StatCard
          title="Successful"
          value={success}
          description={`${getPercentage(success)}% of transactions`}
        />

        <StatCard
          title="Failed"
          value={failed}
          description={`${getPercentage(failed)}% of transactions`}
        />

        <StatCard
          title="Transaction Revenue"
          value={formatMoney(totalRevenue)}
          description="Total transaction amount"
        />
      </div>

      {/* STATUS SUMMARY */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsCard
          title="Transaction Status"
          description="Distribution of transactions by status"
        >
          <div className="space-y-5">
            <StatusRow
              label="Successful"
              value={success}
              total={total}
            />

            <StatusRow
              label="Pending"
              value={pending}
              total={total}
            />

            <StatusRow
              label="Failed"
              value={failed}
              total={total}
            />

            <StatusRow
              label="Refunded"
              value={refunded}
              total={total}
            />

            <StatusRow
              label="Rolled Back"
              value={rolledBack}
              total={total}
            />
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          title="Financial Summary"
          description="Transaction financial overview"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricBox
              label="Total Revenue"
              value={formatMoney(totalRevenue)}
            />

            <MetricBox
              label="Successful Transactions"
              value={success}
            />

            <MetricBox
              label="Pending Transactions"
              value={pending}
            />

            <MetricBox
              label="Failed Transactions"
              value={failed}
            />

            <MetricBox
              label="Refunded"
              value={refunded}
            />

            <MetricBox
              label="Rolled Back"
              value={rolledBack}
            />
          </div>
        </AnalyticsCard>
      </div>

      {/* TRANSACTION BREAKDOWN */}
      <AnalyticsCard
        title="Transaction Breakdown"
        description={
          isPlatformAdmin
            ? "Platform-wide transaction statistics"
            : "Your organization's transaction statistics"
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Count
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Percentage
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              <TransactionRow
                label="Successful"
                value={success}
                percentage={getPercentage(success)}
                amount={formatMoney(
                  getStatusAmount(
                    revenue,
                    "success",
                    "successful",
                  ),
                )}
              />

              <TransactionRow
                label="Pending"
                value={pending}
                percentage={getPercentage(pending)}
                amount={formatMoney(
                  getStatusAmount(revenue, "pending"),
                )}
              />

              <TransactionRow
                label="Failed"
                value={failed}
                percentage={getPercentage(failed)}
                amount={formatMoney(
                  getStatusAmount(revenue, "failed"),
                )}
              />

              <TransactionRow
                label="Refunded"
                value={refunded}
                percentage={getPercentage(refunded)}
                amount={formatMoney(
                  getStatusAmount(revenue, "refunded"),
                )}
              />

              <TransactionRow
                label="Rolled Back"
                value={rolledBack}
                percentage={getPercentage(rolledBack)}
                amount={formatMoney(
                  getStatusAmount(revenue, "rolledBack"),
                )}
              />

              <tr className="bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">
                  Total
                </td>

                <td className="px-4 py-4 text-right text-sm font-bold text-gray-900">
                  {total}
                </td>

                <td className="px-4 py-4 text-right text-sm font-bold text-gray-900">
                  100%
                </td>

                <td className="px-4 py-4 text-right text-sm font-bold text-gray-900">
                  {formatMoney(totalRevenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AnalyticsCard>

      {/* INFO */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <svg
              className="h-4 w-4 text-gray-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                d="M12 10v6M12 7h.01"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Transaction access
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {isPlatformAdmin
                ? "You are viewing platform-wide transaction analytics."
                : "You are viewing transaction analytics limited to your organization."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ title, description, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusRow({ label, value = 0, total = 0 }) {
  const percentage =
    total > 0
      ? Math.round((Number(value) / Number(total)) * 100)
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>

        <span className="text-sm text-gray-500">
          {value} ({percentage}%)
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-800 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TransactionRow({
  label,
  value,
  percentage,
  amount,
}) {
  return (
    <tr>
      <td className="px-4 py-4 text-sm font-medium text-gray-900">
        {label}
      </td>

      <td className="px-4 py-4 text-right text-sm text-gray-600">
        {value}
      </td>

      <td className="px-4 py-4 text-right text-sm text-gray-600">
        {percentage}%
      </td>

      <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
        {amount}
      </td>
    </tr>
  );
}

function FilterInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
      />
    </div>
  );
}

function FilterSelect({
  label,
  name,
  value,
  onChange,
  options = [],
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
      >
        <option value="">All</option>

        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function getStatusAmount(data, ...keys) {
  const totals = data?.totals || data || {};

  for (const key of keys) {
    if (
      totals?.[key] !== undefined &&
      totals?.[key] !== null
    ) {
      return totals[key];
    }
  }

  return 0;
}

export default Transactions;