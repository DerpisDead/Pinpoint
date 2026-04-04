import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import UploadClient from "../UploadClient";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("category")
    .order("name");

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Share a Study Guide</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload notes, study guides, or resources for other HOSA members. Earn +25 XP for each upload.
      </p>
      <UploadClient userId={user.id} events={events ?? []} />
    </div>
  );
}
