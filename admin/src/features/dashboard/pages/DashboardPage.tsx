import React from "react";
import DashboardContainer from "../containers/DashboardContainer";
import AdminLayout from "@/layouts/AdminLayout";

export default function DashboardPage() {
  return (
    <AdminLayout>
      <DashboardContainer />
    </AdminLayout>
  );
}
