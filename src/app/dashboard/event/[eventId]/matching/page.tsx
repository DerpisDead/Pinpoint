import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import MatchingGame from "@/components/app/MatchingGame";

export default async function MatchingPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: event }, { data: userEventRow }] = await Promise.all([
    supabase.from("events").select("id, name, color, icon").eq("id", eventId).single(),
    supabase
      .from("user_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", eventId)
      .maybeSingle(),
  ]);

  if (!event) notFound();
  if (!userEventRow) redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp, level")
    .eq("id", user.id)
    .single();

  // Fetch 6 random cards for this event
  const { data: cards } = await supabase
    .from("cards")
    .select("id, front, back")
    .eq("event_id", eventId)
    .limit(100);

  if (!cards || cards.length < 2) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
        Not enough cards for matching mode.
      </div>
    );
  }

  // Randomly pick up to 6
  const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, 6);

  return (
    <MatchingGame
      eventId={eventId}
      eventName={event.name}
      eventColor={event.color}
      cards={shuffled}
      userId={user.id}
      initialXp={profile?.total_xp ?? 0}
      initialLevel={profile?.level ?? 1}
    />
  );
}
