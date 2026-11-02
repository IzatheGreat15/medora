
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 sm:px-6"
      style={{
        backgroundImage: `
          linear-gradient(
            135deg,
            rgba(23, 63, 53, 0.88) 0%,
            rgba(23, 107, 85, 0.72) 45%,
            rgba(255, 255, 255, 0.42) 100%
          ),
          url('https://images.unsplash.com/photo-1777269749032-d8d458ae594d?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxM3A3fDA%3D')
        `,
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[#DDE8E1] bg-white p-6 shadow-xl sm:p-8">
        {children}
      </div>
    </main>
  );
}
