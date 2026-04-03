// Active tests are full-screen — override the dashboard sidebar layout
export default function ActiveTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] overflow-y-auto">
      {children}
    </div>
  );
}
