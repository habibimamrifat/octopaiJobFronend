import { useEffect, useState } from "react";
import api from "../../services/api";

function Billing() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState(null);

  const [payments, setPayments] = useState([]);
  const [paymentRevenue, setPaymentRevenue] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [transactionRevenue, setTransactionRevenue] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const getArrayData = (data, key) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.[key])) {
      return data[key];
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  };

  const fetchBilling = async () => {
    try {
      setRefreshing(true);
      setError("");

      const [
        subscriptionsResponse,
        subscriptionRevenueResponse,
        paymentsResponse,
        paymentRevenueResponse,
        transactionsResponse,
        transactionRevenueResponse,
      ] = await Promise.all([
        api.get("/analytics/subscriptions"),
        api.get("/analytics/subscriptions/revenue"),
        api.get("/analytics/payments"),
        api.get("/analytics/payments/revenue"),
        api.get("/analytics/transactions"),
        api.get("/analytics/transactions/revenue"),
      ]);

      setSubscriptions(
        getArrayData(
          subscriptionsResponse.data,
          "subscriptions",
        ),
      );

      setSubscriptionRevenue(
        subscriptionRevenueResponse.data,
      );

      setPayments(
        getArrayData(paymentsResponse.data, "payments"),
      );

      setPaymentRevenue(paymentRevenueResponse.data);

      setTransactions(
        getArrayData(
          transactionsResponse.data,
          "transactions",
        ),
      );

      setTransactionRevenue(
        transactionRevenueResponse.data,
      );
    } catch (err) {
      console.error("Failed to fetch billing:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load billing information.",
      );
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [
          subscriptionsResponse,
          subscriptionRevenueResponse,
          paymentsResponse,
          paymentRevenueResponse,
          transactionsResponse,
          transactionRevenueResponse,
        ] = await Promise.all([
          api.get("/analytics/subscriptions"),
          api.get("/analytics/subscriptions/revenue"),
          api.get("/analytics/payments"),
          api.get("/analytics/payments/revenue"),
          api.get("/analytics/transactions"),
          api.get("/analytics/transactions/revenue"),
        ]);

        if (cancelled) return;

        setSubscriptions(
          getArrayData(
            subscriptionsResponse.data,
            "subscriptions",
          ),
        );

        setSubscriptionRevenue(
          subscriptionRevenueResponse.data,
        );

        setPayments(
          getArrayData(paymentsResponse.data, "payments"),
        );

        setPaymentRevenue(paymentRevenueResponse.data);

        setTransactions(
          getArrayData(
            transactionsResponse.data,
            "transactions",
          ),
        );

        setTransactionRevenue(
          transactionRevenueResponse.data,
        );
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch billing:", err);

          setError(
            err?.response?.data?.message ||
              "Failed to load billing information.",
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

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount, currency = "USD") => {
    if (amount === undefined || amount === null) {
      return "-";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getStatusClass = (status) => {
    if (
      ["ACTIVE", "PAID", "SUCCESS", "COMPLETED"].includes(
        status,
      )
    ) {
      return "bg-green-50 text-green-700 ring-green-600/20";
    }

    if (["PENDING", "TRIALING"].includes(status)) {
      return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
    }

    if (
      ["FAILED", "CANCELED", "CANCELLED", "EXPIRED"].includes(
        status,
      )
    ) {
      return "bg-red-50 text-red-700 ring-red-600/20";
    }

    return "bg-gray-50 text-gray-700 ring-gray-600/20";
  };

  const getRevenueValue = (data) => {
    if (!data) return 0;

    return (
      data.totalRevenue ??
      data.revenue ??
      data.amount ??
      data.total ??
      0
    );
  };

  const currency =
    subscriptionRevenue?.currency ||
    paymentRevenue?.currency ||
    transactionRevenue?.currency ||
    "USD";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Billing
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View your subscription, payments and billing
            transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBilling}
          disabled={refreshing}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Revenue Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Subscription Revenue
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatAmount(
              getRevenueValue(subscriptionRevenue),
              subscriptionRevenue?.currency || currency,
            )}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Revenue from subscriptions
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Payment Revenue
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatAmount(
              getRevenueValue(paymentRevenue),
              paymentRevenue?.currency || currency,
            )}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Revenue from payments
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Transaction Revenue
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatAmount(
              getRevenueValue(transactionRevenue),
              transactionRevenue?.currency || currency,
            )}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Revenue from transactions
          </p>
        </div>
      </div>

      {/* Subscription */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Subscription
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Current subscription information.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h3 className="text-sm font-semibold text-gray-900">
              No subscription found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There is no subscription information available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Plan
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Billing
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Period
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {subscription.package?.name ||
                          subscription.packageName ||
                          subscription.name ||
                          "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(
                          subscription.status,
                        )}`}
                      >
                        {subscription.status || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {subscription.billingInterval || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {formatAmount(
                        subscription.amount ??
                          subscription.price ??
                          subscription.package?.price,
                        subscription.currency || currency,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(
                        subscription.currentPeriodStart ||
                          subscription.startDate,
                      )}
                      {" - "}
                      {formatDate(
                        subscription.currentPeriodEnd ||
                          subscription.endDate,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Payments
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Payment history for your organization.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-10 animate-pulse rounded bg-gray-100"
              />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h3 className="text-sm font-semibold text-gray-900">
              No payments found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No payment records are available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Payment
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {payment.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(
                        payment.paidAt || payment.createdAt,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {formatAmount(
                        payment.amount,
                        payment.currency || currency,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(
                          payment.status,
                        )}`}
                      >
                        {payment.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Transactions
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Recent billing transactions.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-10 animate-pulse rounded bg-gray-100"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h3 className="text-sm font-semibold text-gray-900">
              No transactions found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No transaction records are available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Transaction
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {transaction.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {transaction.type || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {formatAmount(
                        transaction.amount,
                        transaction.currency || currency,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(
                          transaction.status,
                        )}`}
                      >
                        {transaction.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && (
        <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:justify-between">
          <span>
            {subscriptions.length} subscription
            {subscriptions.length !== 1 ? "s" : ""}
          </span>

          <span>
            {payments.length} payment
            {payments.length !== 1 ? "s" : ""}
          </span>

          <span>
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

export default Billing;