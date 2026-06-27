export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid h-screen w-screen place-items-center bg-muted/30 p-6">
      {children}
    </main>
  );
}
