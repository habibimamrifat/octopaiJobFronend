import { ROLES } from "./roles";

export const MENU = {
  [ROLES.PLATFORM_ADMIN]: [
    {
      label: "Dashboard",
      path: "overview",
      subMenu: [
        {
          label: "Overview",
          path: "overview",
        },
      ],
    },
    {
      label: "Organizations",
      path: "organizations",
      subMenu: [
        {
          label: "All Organizations",
          path: "organizations",
        },
      ],
    },
    {
      label: "Plans",
      path: "plans",
      subMenu: [
        {
          label: "All Plans",
          path: "plans",
        },
        {
          label: "Create Plan",
          path: "plans/create",
        },
      ],
    },
    {
      label: "Transactions",
      path: "transactions",
      subMenu: [
        {
          label: "All Transactions",
          path: "transactions",
        },
      ],
    },
  ],

  [ROLES.ORGANIZATION_ADMIN]: [
    {
      label: "Dashboard",
      path: "overview",
      subMenu: [
        {
          label: "Overview",
          path: "overview",
        },
      ],
    },
    {
      label: "Organization",
      path: "organization",
      subMenu: [
        {
          label: "Profile",
          path: "organization/profile",
        },
      ],
    },
    {
      label: "Members",
      path: "members",
      subMenu: [
        {
          label: "All Members",
          path: "members",
        },
        {
          label: "Invite Member",
          path: "members/invite",
        },
      ],
    },
    {
      label: "Subscription",
      path: "subscription",
      subMenu: [
        {
          label: "Current Subscription",
          path: "subscription",
        },
      ],
    },
    {
      label: "Billing & Payments",
      path: "billing",
      subMenu: [
        {
          label: "Billing",
          path: "billing",
        },
        {
          label: "Payment Method",
          path: "billing/payment-method",
        },
        {
          label: "Payment History",
          path: "billing/history",
        },
        {
          label: "Invoices",
          path: "billing/invoices",
        },
      ],
    },
    {
      label: "Transactions",
      path: "transactions",
      subMenu: [
        {
          label: "My Transactions",
          path: "transactions",
        },
      ],
    },
  ],

  [ROLES.ORGANIZATION_MEMBER]: [
    {
      label: "Dashboard",
      path: "overview",
      subMenu: [
        {
          label: "Overview",
          path: "overview",
        },
      ],
    },
    {
      label: "Profile",
      path: "profile",
      subMenu: [
        {
          label: "My Profile",
          path: "profile",
        },
        {
          label: "Change Password",
          path: "profile/change-password",
        },
      ],
    },
    {
      label: "Organization",
      path: "organization",
      subMenu: [
        {
          label: "Organization Info",
          path: "organization",
        },
      ],
    },
  ],
};
