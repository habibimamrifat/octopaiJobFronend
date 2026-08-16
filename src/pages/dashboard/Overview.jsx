import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

const INITIAL_FILTERS = {
  startDate: "",
  endDate: "",
  organizationStatus: "",
  subscriptionStatus: "",
  paymentStatus: "",
  transactionStatus: "",
  packageId: "",
  billingInterval: "",
  currency: "",
};

function Overview() {
  const { user } = useAuth();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [analytics, setAnalytics] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN";

  // =========================================================
  // QUERY BUILDER
  // =========================================================

  const buildQuery = (values = {}) => {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const query = params.toString();

    return query ? `?${query}` : "";
  };

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  const loadAnalytics = async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      /*
       * Each analytics endpoint has its own filter names.
       * We map the dashboard filters correctly here.
       */

      const common = {
        startDate: currentFilters.startDate,
        endDate: currentFilters.endDate,
      };

      const overviewQuery = buildQuery({
        ...common,
        organizationStatus: currentFilters.organizationStatus,
        subscriptionStatus: currentFilters.subscriptionStatus,
        paymentStatus: currentFilters.paymentStatus,
        transactionStatus: currentFilters.transactionStatus,
        packageId: currentFilters.packageId,
        billingInterval: currentFilters.billingInterval,
        currency: currentFilters.currency,
      });

      const usersQuery = buildQuery({
        ...common,
      });

      const organizationsQuery = buildQuery({
        ...common,
        status: currentFilters.organizationStatus,
      });

      const organizationPerformanceQuery = buildQuery({
        ...common,
        status: currentFilters.organizationStatus,
        packageId: currentFilters.packageId,
        subscriptionStatus: currentFilters.subscriptionStatus,
        paymentStatus: currentFilters.paymentStatus,
        transactionStatus: currentFilters.transactionStatus,
      });

      const subscriptionsQuery = buildQuery({
        ...common,
        status: currentFilters.subscriptionStatus,
        packageId: currentFilters.packageId,
        billingInterval: currentFilters.billingInterval,
      });

      const subscriptionRevenueQuery = buildQuery({
        ...common,
        packageId: currentFilters.packageId,
        billingInterval: currentFilters.billingInterval,
        status: currentFilters.subscriptionStatus,
      });

      const paymentsQuery = buildQuery({
        ...common,
        status: currentFilters.paymentStatus,
        currency: currentFilters.currency,
        packageId: currentFilters.packageId,
      });

      const paymentRevenueQuery = buildQuery({
        ...common,
        status: currentFilters.paymentStatus,
        currency: currentFilters.currency,
        packageId: currentFilters.packageId,
      });

      const transactionsQuery = buildQuery({
        ...common,
        status: currentFilters.transactionStatus,
        currency: currentFilters.currency,
      });

      const transactionRevenueQuery = buildQuery({
        ...common,
        status: currentFilters.transactionStatus,
        currency: currentFilters.currency,
      });

      const growthQuery = buildQuery({
        ...common,
        organizationStatus: currentFilters.organizationStatus,
        packageId: currentFilters.packageId,
        billingInterval: currentFilters.billingInterval,
      });

      const requests = [
        api.get(`/analytics/overview${overviewQuery}`),

        api.get(`/analytics/users${usersQuery}`),

        api.get(`/analytics/organizations${organizationsQuery}`),

        api.get(
          `/analytics/organizations/performance${organizationPerformanceQuery}`,
        ),

        api.get(`/analytics/subscriptions${subscriptionsQuery}`),

        api.get(
          `/analytics/subscriptions/revenue${subscriptionRevenueQuery}`,
        ),

        api.get(`/analytics/payments${paymentsQuery}`),

        api.get(`/analytics/payments/revenue${paymentRevenueQuery}`),

        api.get(`/analytics/transactions${transactionsQuery}`),

        api.get(
          `/analytics/transactions/revenue${transactionRevenueQuery}`,
        ),

        api.get(`/analytics/growth${growthQuery}`),
      ];

      /*
       * Packages are only accessible to PLATFORM_ADMIN.
       */
      if (isPlatformAdmin) {
        requests.push(api.get("/analytics/packages"));
      }

      const responses = await Promise.all(requests);

      const result = {
        overview: responses[0].data,
        users: responses[1].data,
        organizations: responses[2].data,
        organizationPerformance: responses[3].data,
        subscriptions: responses[4].data,
        subscriptionRevenue: responses[5].data,
        payments: responses[6].data,
        paymentRevenue: responses[7].data,
        transactions: responses[8].data,
        transactionRevenue: responses[9].data,
        growth: responses[10].data,
      };

      setAnalytics(result);

      /*
       * Package response can have different wrappers depending
       * on the service implementation.
       */
      if (isPlatformAdmin && responses[11]) {
        const packageData = responses[11].data;

        if (Array.isArray(packageData)) {
          setPackages(packageData);
        } else if (Array.isArray(packageData?.packages)) {
          setPackages(packageData.packages);
        } else if (Array.isArray(packageData?.data)) {
          setPackages(packageData.data);
        } else {
          setPackages([]);
        }
      }
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load analytics. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!user?.role) {
      return undefined;
    }

    /*
     * Delay the initial request to avoid React's
     * set-state-in-effect lint warning.
     */
    const timer = setTimeout(() => {
      loadAnalytics(INITIAL_FILTERS);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [user?.role]);

  // =========================================================
  // FILTERS
  // =========================================================

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadAnalytics(filters);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    loadAnalytics(INITIAL_FILTERS);
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getValue = (object, ...keys) => {
    for (const key of keys) {
      if (object?.[key] !== undefined && object?.[key] !== null) {
        return object[key];
      }
    }

    return 0;
  };

  const formatMoney = (value) => {
    const number = Number(value || 0);

    if (Number.isNaN(number)) {
      return "$0.00";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: filters.currency?.toUpperCase() || "USD",
    }).format(number);
  };

  // =========================================================
  // DATA
  // =========================================================

  const overview = analytics?.overview || {};
  const users = analytics?.users || {};
  const organizations = analytics?.organizations || {};
  const subscriptions = analytics?.subscriptions || {};
  const subscriptionRevenue = analytics?.subscriptionRevenue || {};
  const payments = analytics?.payments || {};
  const paymentRevenue = analytics?.paymentRevenue || {};
  const transactions = analytics?.transactions || {};
  const transactionRevenue = analytics?.transactionRevenue || {};
  const organizationPerformance =
    analytics?.organizationPerformance || {};
  const growth = analytics?.growth || {};

  const overviewTotals = overview?.totals || {};

  const organizationCount =
    getValue(overviewTotals, "organizations", "organizationCount") ||
    getValue(organizations?.totals, "total");

  const userCount =
    getValue(overviewTotals, "users", "userCount") ||
    getValue(users?.totals, "total");

  const subscriptionCount =
    getValue(overviewTotals, "subscriptions", "subscriptionCount") ||
    getValue(subscriptions?.totals, "total");

  const paymentCount =
    getValue(overviewTotals, "payments", "paymentCount") ||
    getValue(payments?.totals, "total");

  const transactionCount =
    getValue(overviewTotals, "transactions", "transactionCount") ||
    getValue(transactions?.totals, "total");

  const activeSubscriptions =
    getValue(
      subscriptions?.totals,
      "active",
      "activeSubscriptions",
    ) ||
    getValue(overviewTotals, "activeSubscriptions");

  const failedPayments = getValue(payments?.totals, "failed");

  const cancelledSubscriptions = getValue(
    subscriptions?.totals,
    "cancelled",
  );

  const revenue =
    getValue(
      overviewTotals,
      "revenue",
      "totalRevenue",
      "paymentRevenue",
      "transactionRevenue",
    ) ||
    getValue(
      paymentRevenue?.totals,
      "revenue",
      "totalRevenue",
    ) ||
    getValue(
      subscriptionRevenue?.totals,
      "revenue",
      "totalRevenue",
    );

  const subscriptionDistribution =
    subscriptions?.distribution || {};

  const growthData = useMemo(() => {
    if (Array.isArray(growth?.growth)) {
      return growth.growth;
    }

    if (Array.isArray(growth?.data)) {
      return growth.data;
    }

    if (Array.isArray(growth)) {
      return growth;
    }

    return [];
  }, [growth]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Analytics Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isPlatformAdmin
              ? "Monitor organizations, users, subscriptions, payments and revenue."
              : "Monitor your organization's users, subscription and financial activity."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">
            {user?.role}
          </span>

          <button
            type="button"
            onClick={() => loadAnalytics(filters)}
            disabled={loading}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* FILTERS */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Analytics Filters
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Filter the analytics data by date, status, package and billing.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
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

          {isPlatformAdmin && (
            <FilterSelect
              label="Organization Status"
              name="organizationStatus"
              value={filters.organizationStatus}
              onChange={handleFilterChange}
              options={[
                ["ACTIVE", "Active"],
                ["TRIAL", "Trial"],
                ["SUSPENDED", "Suspended"],
                ["CANCELLED", "Cancelled"],
              ]}
            />
          )}

          <FilterSelect
            label="Subscription Status"
            name="subscriptionStatus"
            value={filters.subscriptionStatus}
            onChange={handleFilterChange}
            options={[
              ["PENDING", "Pending"],
              ["ACTIVE", "Active"],
              ["FAILED", "Failed"],
              ["CANCELLED", "Cancelled"],
              ["EXPIRED", "Expired"],
            ]}
          />

          <FilterSelect
            label="Payment Status"
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={handleFilterChange}
            options={[
              ["PENDING", "Pending"],
              ["SUCCESS", "Success"],
              ["FAILED", "Failed"],
              ["REFUNDED", "Refunded"],
            ]}
          />

          <FilterSelect
            label="Transaction Status"
            name="transactionStatus"
            value={filters.transactionStatus}
            onChange={handleFilterChange}
            options={[
              ["PENDING", "Pending"],
              ["SUCCESS", "Success"],
              ["FAILED", "Failed"],
              ["REFUNDED", "Refunded"],
              ["ROLLED_BACK", "Rolled Back"],
            ]}
          />

          <FilterSelect
            label="Billing Interval"
            name="billingInterval"
            value={filters.billingInterval}
            onChange={handleFilterChange}
            options={[
              ["MONTHLY", "Monthly"],
              ["YEARLY", "Yearly"],
            ]}
          />

          <FilterInput
            label="Currency"
            name="currency"
            value={filters.currency}
            placeholder="usd"
            onChange={handleFilterChange}
          />

          {isPlatformAdmin && packages.length > 0 && (
            <FilterSelect
              label="Package"
              name="packageId"
              value={filters.packageId}
              onChange={handleFilterChange}
              options={packages
                .map((item) => {
                  const packageData = item?.package || item;

                  return [
                    packageData?.id,
                    packageData?.name || packageData?.id,
                  ];
                })
                .filter(([id]) => id)}
            />
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* PRIMARY STATS */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isPlatformAdmin ? "Organizations" : "Organization"}
          value={organizationCount}
          description={
            isPlatformAdmin
              ? "Total organizations"
              : "Your organization"
          }
        />

        <StatCard
          title="Users"
          value={userCount}
          description="Users in scope"
        />

        <StatCard
          title="Subscriptions"
          value={subscriptionCount}
          description={`${activeSubscriptions} active`}
        />

        <StatCard
          title="Revenue"
          value={formatMoney(revenue)}
          description="Total revenue"
        />
      </div>

      {/* SECONDARY STATS */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Payments"
          value={paymentCount}
          description={`${failedPayments} failed`}
        />

        <StatCard
          title="Transactions"
          value={transactionCount}
          description="Total transactions"
        />

        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          description="Currently active"
        />

        <StatCard
          title="Cancelled Subscriptions"
          value={cancelledSubscriptions}
          description="Cancelled subscriptions"
        />
      </div>

      {/* SUBSCRIPTIONS + FINANCE */}

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsCard
          title="Subscription Distribution"
          description="Subscriptions grouped by status"
        >
          <div className="space-y-4">
            <DistributionRow
              label="Active"
              value={subscriptionDistribution.active}
              total={subscriptionCount}
            />

            <DistributionRow
              label="Pending"
              value={subscriptionDistribution.pending}
              total={subscriptionCount}
            />

            <DistributionRow
              label="Failed"
              value={subscriptionDistribution.failed}
              total={subscriptionCount}
            />

            <DistributionRow
              label="Cancelled"
              value={subscriptionDistribution.cancelled}
              total={subscriptionCount}
            />

            <DistributionRow
              label="Expired"
              value={subscriptionDistribution.expired}
              total={subscriptionCount}
            />
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          title="Financial Summary"
          description="Revenue across payments, subscriptions and transactions"
        >
          <div className="grid grid-cols-2 gap-4">
            <MetricBox
              label="Payment Revenue"
              value={formatMoney(
                getValue(
                  paymentRevenue?.totals,
                  "revenue",
                  "totalRevenue",
                ),
              )}
            />

            <MetricBox
              label="Subscription Revenue"
              value={formatMoney(
                getValue(
                  subscriptionRevenue?.totals,
                  "revenue",
                  "totalRevenue",
                ),
              )}
            />

            <MetricBox
              label="Transaction Revenue"
              value={formatMoney(
                getValue(
                  transactionRevenue?.totals,
                  "revenue",
                  "totalRevenue",
                ),
              )}
            />

            <MetricBox
              label="Successful Payments"
              value={getValue(
                payments?.totals,
                "success",
                "successful",
              )}
            />
          </div>
        </AnalyticsCard>
      </div>

      {/* ORGANIZATION PERFORMANCE */}

      <AnalyticsCard
        title="Organization Performance"
        description={
          isPlatformAdmin
            ? "Performance across all organizations"
            : "Performance of your organization"
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricBox
            label="Users"
            value={getValue(
              organizationPerformance?.totals,
              "users",
              "userCount",
            )}
          />

          <MetricBox
            label="Subscriptions"
            value={getValue(
              organizationPerformance?.totals,
              "subscriptions",
              "subscriptionCount",
            )}
          />

          <MetricBox
            label="Payments"
            value={getValue(
              organizationPerformance?.totals,
              "payments",
              "paymentCount",
            )}
          />

          <MetricBox
            label="Revenue"
            value={formatMoney(
              getValue(
                organizationPerformance?.totals,
                "revenue",
                "totalRevenue",
              ),
            )}
          />
        </div>
      </AnalyticsCard>

      {/* GROWTH */}

      <AnalyticsCard
        title="Growth"
        description="Monthly organization and user growth"
      >
        {growthData.length === 0 ? (
          <EmptyState text="No growth data available for the selected filters." />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-3 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span>Month</span>

                <span className="text-right">
                  Organizations
                </span>

                <span className="text-right">Users</span>
              </div>

              {growthData.map((item, index) => (
                <div
                  key={`${item?.month || "month"}-${index}`}
                  className="grid grid-cols-3 border-b border-gray-50 px-4 py-3 text-sm last:border-0"
                >
                  <span className="font-medium text-gray-900">
                    {item?.month || "-"}
                  </span>

                  <span className="text-right text-gray-600">
                    {getValue(
                      item,
                      "organizations",
                      "organizationCount",
                    )}
                  </span>

                  <span className="text-right text-gray-600">
                    {getValue(
                      item,
                      "users",
                      "userCount",
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnalyticsCard>

      {/* DETAILS */}

      <div className="grid gap-6 lg:grid-cols-3">
        <AnalyticsCard
          title="Users"
          description="User distribution"
        >
          <AnalyticsList
            data={[
              [
                "Total",
                getValue(users?.totals, "total"),
              ],
              [
                "Platform Admins",
                getValue(
                  users?.totals,
                  "platformAdmin",
                  "platformAdmins",
                ),
              ],
              [
                "Organization Admins",
                getValue(
                  users?.totals,
                  "organizationAdmin",
                  "organizationAdmins",
                ),
              ],
              [
                "Organization Members",
                getValue(
                  users?.totals,
                  "organizationMember",
                  "organizationMembers",
                ),
              ],
            ]}
          />
        </AnalyticsCard>

        <AnalyticsCard
          title="Payments"
          description="Payment status"
        >
          <AnalyticsList
            data={[
              [
                "Total",
                getValue(payments?.totals, "total"),
              ],
              [
                "Successful",
                getValue(payments?.totals, "success"),
              ],
              [
                "Pending",
                getValue(payments?.totals, "pending"),
              ],
              [
                "Failed",
                getValue(payments?.totals, "failed"),
              ],
              [
                "Refunded",
                getValue(payments?.totals, "refunded"),
              ],
            ]}
          />
        </AnalyticsCard>

        <AnalyticsCard
          title="Transactions"
          description="Transaction status"
        >
          <AnalyticsList
            data={[
              [
                "Total",
                getValue(transactions?.totals, "total"),
              ],
              [
                "Successful",
                getValue(transactions?.totals, "success"),
              ],
              [
                "Pending",
                getValue(transactions?.totals, "pending"),
              ],
              [
                "Failed",
                getValue(transactions?.totals, "failed"),
              ],
              [
                "Refunded",
                getValue(transactions?.totals, "refunded"),
              ],
              [
                "Rolled Back",
                getValue(
                  transactions?.totals,
                  "rolledBack",
                  "rolled_back",
                ),
              ],
            ]}
          />
        </AnalyticsCard>
      </div>
    </div>
  );
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
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

function AnalyticsCard({
  title,
  description,
  children,
}) {
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

function DistributionRow({
  label,
  value = 0,
  total = 0,
}) {
  const percentage =
    total > 0
      ? Math.min(
          100,
          Math.round(
            (Number(value) / Number(total)) * 100,
          ),
        )
      : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {label}
        </span>

        <span className="text-gray-500">
          {value || 0} ({percentage}%)
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-800 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function AnalyticsList({ data }) {
  return (
    <div className="divide-y divide-gray-100">
      {data.map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between py-3"
        >
          <span className="text-sm text-gray-600">
            {label}
          </span>

          <span className="text-sm font-semibold text-gray-900">
            {value || 0}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 px-5 py-8 text-center text-sm text-gray-500">
      {text}
    </div>
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

        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

export default Overview;