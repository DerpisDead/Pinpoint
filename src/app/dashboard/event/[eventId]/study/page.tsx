import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { checkAndUpdateStreak } from "@/lib/streaks";
import StudyClient, { type StudyCard } from "@/components/app/StudyClient";

type RawUserCard = {
  id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  times_reviewed: number;
  last_quality: number | null;
  cards: {
    id: string;
    front: string;
    back: string;
    events: {
      name: string;
      color: string;
    };
  };
};

export default async function EventStudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { eventId } = await params;
  const { mode } = await searchParams;
  const studyAll = mode === "all";

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
  const { count } = await supabase
    .from("user_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  if ((count ?? 0) === 0) redirect("/onboarding");

  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Update streak at the start of the session
  const { current_streak } = await checkAndUpdateStreak(
    supabase,
    user.id,
    profile
  );

  // Get all card IDs for this specific event
  const { data: cardRows } = await supabase
    .from("cards")
    .select("id")
    .eq("event_id", eventId);

  const cardIds = (cardRows ?? []).map((r) => r.id);

  // Fetch user_cards for this event
  const now = new Date().toISOString();
  let query = supabase
    .from("user_cards")
    .select(
      `id, ease_factor, interval_days, repetitions, times_reviewed, last_quality,
       cards ( id, front, back, events ( name, color ) )`
    )
    .eq("user_id", user.id)
    .in("card_id", cardIds)
    .order("next_review", { ascending: true })
    .limit(studyAll ? 200 : 20);

  if (!studyAll) {
    query = query.lte("next_review", now);
  }

  const { data: rawCards } = await query;

  const cards: StudyCard[] = ((rawCards ?? []) as unknown as RawUserCard[])
    .filter((uc) => uc.cards && uc.cards.events)
    .map((uc) => ({
      userCardId: uc.id,
      cardId: uc.cards.id,
      front: uc.cards.front,
      back: uc.cards.back,
      easeFactor: uc.ease_factor,
      intervalDays: uc.interval_days,
      repetitions: uc.repetitions,
      timesReviewed: uc.times_reviewed,
      eventColor: uc.cards.events.color,
      eventName: uc.cards.events.name,
      lastQuality: uc.last_quality,
    }));

  return (
    <StudyClient
      initialCards={cards}
      userId={user.id}
      initialXp={profile.total_xp}
      currentStreak={current_streak}
      backHref={`/dashboard/event/${eventId}`}
    />
  );
}
