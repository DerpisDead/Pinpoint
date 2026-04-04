import CommunityTabs from "./CommunityTabs";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Community</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Study guides, notes, and resources shared by HOSA members.
        </p>
      </div>
      <CommunityTabs />
      {children}
    </div>
  );
}
