import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import EventModeSelector from "@/components/app/EventModeSelector";

export default async function StudyMatchingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userEventRows } = await supabase
    .from("user_events")
    .select("event_id, events ( id, name, color, icon )")
    .eq("user_id", user.id);

  if (!userEventRows || userEventRows.length === 0) redirect("/onboarding");

  type EventRow = { id: string; name: string; color: string; icon: string };
  const events: EventRow[] = (userEventRows as unknown as { events: EventRow }[])
    .map((r) => r.events)
    .filter(Boolean);

  return (
    <EventModeSelector
      events={events}
      mode="matching"
      title="Matching"
      description="Select an event to match terms with definitions."
      icon="🧩"
    />
  );
}
