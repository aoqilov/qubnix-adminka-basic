import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import DashboardPage from "@/pages/DashboardPage";
import TariffsPage from "@/pages/TariffsPage";
import UsersPage from "@/pages/UsersPage";
import CompaniesPage from "@/pages/CompaniesPage";

// Yo'llar const/navigation.ts dagi sidebar bilan bir xil bo'lishi kerak.
export const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "tariffs", element: <TariffsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
];
