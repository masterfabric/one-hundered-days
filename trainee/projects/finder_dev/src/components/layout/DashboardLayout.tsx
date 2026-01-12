import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    username: string;
    avatarUrl?: string;
    role?: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen gradient-bg">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full gradient-bg">{children}</div>
      </main>
    </div>
  );
}
