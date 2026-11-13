
"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { DashboardStaff } from "@/lib/auth/types";

type AuthContextType = {
  staff: DashboardStaff;
  clinicId: string;
  setStaff: (staff: DashboardStaff) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export default function AuthProvider({
  initialStaff,
  children,
}: {
  initialStaff: DashboardStaff;
  children: ReactNode;
}) {
  const [staff, setStaff] = useState(initialStaff);

  const value = useMemo(
    () => ({
      staff,
      clinicId: staff.clinic_id,
      setStaff,
    }),
    [staff]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}
