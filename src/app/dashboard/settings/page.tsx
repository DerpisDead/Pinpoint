import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import SettingsClient from "@/components/app/SettingsClient";
import type { Event } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: allEventsRaw },
    { data: userEventRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("events").select("*").order("category").order("name"),
    supabase.from("user_events").select("event_id").eq("user_id", user.id),
  ]);

  if (!profile) redirect("/login");

  const allEvents = (allEventsRaw ?? []) as Event[];
  const currentEventIds = (userEventRows ?? []).map(
    (r: { event_id: string }) => r.event_id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
      </div>

      <SettingsClient
        userId={user.id}
        email={user.email ?? ""}
        profile={{
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          daily_card_limit: profile.daily_card_limit ?? 50,
          session_size: profile.session_size ?? 20,
          sound_effects_enabled: profile.sound_effects_enabled ?? false,
        }}
        allEvents={allEvents}
        currentEventIds={currentEventIds}
      />
    </div>
  );
}
