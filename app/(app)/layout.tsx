import { AppSidebar } from "@/components/layout/AppSidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen w-screen grid-cols-[16rem_1fr] grid-rows-[100vh] overflow-hidden bg-background text-foreground">
      <AppSidebar />
      <div className="h-full w-full overflow-hidden">{children}</div>
    </div>
  );
}