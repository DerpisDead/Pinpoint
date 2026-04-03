import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import TestSetupClient from "./TestSetupClient";

export default async function PracticeTestSetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's selected events
  const { data: userEventRows } = await supabase
    .from("user_events")
    .select("event_id")
    .eq("user_id", user.id);

  if (!userEventRows || userEventRows.length === 0) {
    redirect("/onboarding");
  }

  const eventIds = userEventRows.map((r) => r.event_id);

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds)
    .order("category")
    .order("name");

  return <TestSetupClient events={events ?? []} />;
}
