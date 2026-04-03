import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { checkAndUpdateStreak } from "@/lib/streaks";
import StudyClient, { type StudyCard } from "@/components/app/StudyClient";

// Supabase nested-select shape from user_cards
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

export default async function StudyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load profile for streak check and initial XP
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

  // Get the event IDs this user has selected
  const { data: userEventRows } = await supabase
    .from("user_events")
    .select("event_id")
    .eq("user_id", user.id);

  if (!userEventRows || userEventRows.length === 0) {
    redirect("/onboarding");
  }

  const eventIds = userEventRows.map((r) => r.event_id);

  // Get card IDs that belong to those events
  const { data: cardRows } = await supabase
    .from("cards")
    .select("id")
    .in("event_id", eventIds);

  const cardIds = (cardRows ?? []).map((r) => r.id);

  // Fetch due user_cards (most overdue first), limit 20
  const now = new Date().toISOString();
  const { data: rawCards } = await supabase
    .from("user_cards")
    .select(
      `id, ease_factor, interval_days, repetitions, times_reviewed, last_quality,
       cards ( id, front, back, events ( name, color ) )`
    )
    .eq("user_id", user.id)
    .in("card_id", cardIds)
    .lte("next_review", now)
    .order("next_review", { ascending: true })
    .limit(20);

  // Shape into StudyCard[]
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
      backHref="/dashboard"
    />
  );
}
