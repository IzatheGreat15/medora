
export type DashboardStaff = {
  id: string;
  first_name: string;
  last_name: string;
  role: "clinic_user";
  clinic_role: "owner" | "manager" | "staff";
  clinic_id: string;
  clinic_name: string;
};
