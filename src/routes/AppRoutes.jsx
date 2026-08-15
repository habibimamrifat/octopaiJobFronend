import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/dashboard/Dashboard";
import Overview from "../pages/dashboard/Overview";

// Platform
import Organizations from "../pages/platform/Organizations";
import OrganizationDetails from "../pages/platform/OrganizationDetails";
import Plans from "../pages/platform/Plans";
import CreatePlan from "../pages/platform/CreatePlan";
import Transactions from "../pages/platform/Transactions";

// Organization Admin
import OrganizationProfile from "../pages/organization/OrganizationProfile";
import Members from "../pages/organization/Members";
import InviteMember from "../pages/organization/InviteMember";
import Subscription from "../pages/organization/Subscription";
import Billing from "../pages/organization/Billing";
import PaymentMethod from "../pages/organization/PaymentMethod";
import PaymentHistory from "../pages/organization/PaymentHistory";
import Invoices from "../pages/organization/Invoices";

// Organization Member
import Profile from "../pages/member/Profile";
import ChangePassword from "../pages/member/ChangePassword";
import OrganizationInfo from "../pages/member/OrganizationInfo";
import ProtectedRoute from "./ProtectedRoute";
import PlanDetails from "../pages/platform/PlanDetails";
import EditPlan from "../pages/platform/EditPlan";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== PUBLIC ==================== */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==================== PROTECTED ==================== */}

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            {/* ---------- Common ---------- */}

            <Route path="overview" element={<Overview />} />

            {/* ==================================================
                PLATFORM ADMIN
            ================================================== */}

            <Route path="organizations" element={<Organizations />} />

            <Route
              path="organizations/:organizationId"
              element={<OrganizationDetails />}
            />

            <Route path="plans" element={<Plans />} />

            <Route path="plans/create" element={<CreatePlan />} />

            <Route path="plans/:id" element={<PlanDetails />} />

            <Route path="plans/:id/edit" element={<EditPlan />} />

            <Route path="transactions" element={<Transactions />} />

            {/* ==================================================
                ORGANIZATION ADMIN
            ================================================== */}

            <Route
              path="organization/profile"
              element={<OrganizationProfile />}
            />

            <Route path="members" element={<Members />} />

            <Route path="members/invite" element={<InviteMember />} />

            <Route path="subscription" element={<Subscription />} />

            <Route path="billing" element={<Billing />} />

            <Route path="billing/payment-method" element={<PaymentMethod />} />

            <Route path="billing/history" element={<PaymentHistory />} />

            <Route path="billing/invoices" element={<Invoices />} />

            {/* ==================================================
                ORGANIZATION MEMBER
            ================================================== */}

            <Route path="profile" element={<Profile />} />

            <Route
              path="profile/change-password"
              element={<ChangePassword />}
            />

            <Route path="organization" element={<OrganizationInfo />} />
          </Route>
        </Route>

        {/* ==================== FALLBACK ==================== */}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
