// Event study sessions are full-screen — no sidebar/header wrapper
export default function EventStudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
