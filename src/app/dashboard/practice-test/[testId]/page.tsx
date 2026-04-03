import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import TestClient from "./TestClient";

export default async function PracticeTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ count?: string; timed?: string }>;
}) {
  const { testId: eventId } = await params;
  const { count: countParam, timed: timedParam } = await searchParams;

  const questionCount = Math.min(
    Math.max(parseInt(countParam ?? "25", 10) || 25, 1),
    100
  );
  const timedMode = timedParam !== "false";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify event exists
  const { data: event } = await supabase
    .from("events")
    .select("id, name, color")
    .eq("id", eventId)
    .single();

  if (!event) notFound();

  // Verify user has selected this event
  const { count: ueCount } = await supabase
    .from("user_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  if ((ueCount ?? 0) === 0) redirect("/onboarding");

  // Load profile for XP
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", user.id)
    .single();

  // Fetch all cards for this event (client will shuffle and select)
  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("event_id", eventId);

  return (
    <TestClient
      allCards={cards ?? []}
      eventId={event.id}
      eventName={event.name}
      eventColor={event.color}
      questionCount={questionCount}
      timedMode={timedMode}
      userId={user.id}
      initialXp={profile?.total_xp ?? 0}
    />
  );
}
