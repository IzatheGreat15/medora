
import HelpCenterShell from "@/components/help/HelpCenterShell";
import type { ReactNode } from "react";

export default function HelpLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <HelpCenterShell>{children}</HelpCenterShell>;
}
