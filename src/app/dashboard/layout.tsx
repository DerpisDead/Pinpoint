import AppSidebar from "@/components/app/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppSidebar />
      {/* Offset content for desktop sidebar; add bottom padding for mobile tab bar */}
      <div className="md:pl-60 pb-16 md:pb-0">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
