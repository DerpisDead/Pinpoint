// Study sessions are full-screen — no sidebar/header wrapper
export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
