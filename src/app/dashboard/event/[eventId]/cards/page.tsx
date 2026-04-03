import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import CardBrowserClient from "@/components/app/CardBrowserClient";

export type BrowsableCard = {
  id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  repetitions: number;
  intervalDays: number;
  timesReviewed: number;
  nextReview: string | null;
};

type RawRow = {
  repetitions: number;
  interval_days: number;
  times_reviewed: number;
  next_review: string | null;
  cards: {
    id: string;
    front: string;
    back: string;
    difficulty: "easy" | "medium" | "hard";
  };
};

export default async function CardBrowserPage({
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

  const { data: cardRows } = await supabase
    .from("cards")
    .select("id")
    .eq("event_id", eventId);

  const cardIds = (cardRows ?? []).map((r: { id: string }) => r.id);

  const { data: rawRows } = await supabase
    .from("user_cards")
    .select(
      "repetitions, interval_days, times_reviewed, next_review, cards ( id, front, back, difficulty )"
    )
    .eq("user_id", user.id)
    .in("card_id", cardIds)
    .order("next_review", { ascending: true });

  const now = new Date().toISOString();
  const cards: BrowsableCard[] = ((rawRows ?? []) as unknown as RawRow[])
    .filter((r) => r.cards)
    .map((r) => ({
      id: r.cards.id,
      front: r.cards.front,
      back: r.cards.back,
      difficulty: r.cards.difficulty,
      repetitions: r.repetitions,
      intervalDays: r.interval_days,
      timesReviewed: r.times_reviewed,
      nextReview: r.next_review,
    }));

  // Also add cards not yet in user_cards
  const touchedIds = new Set(cards.map((c) => c.id));
  const { data: allCards } = await supabase
    .from("cards")
    .select("id, front, back, difficulty")
    .eq("event_id", eventId);

  for (const c of allCards ?? []) {
    if (!touchedIds.has(c.id)) {
      cards.push({
        id: c.id,
        front: c.front,
        back: c.back,
        difficulty: c.difficulty as "easy" | "medium" | "hard",
        repetitions: 0,
        intervalDays: 0,
        timesReviewed: 0,
        nextReview: null,
      });
    }
  }

  return (
    <CardBrowserClient
      cards={cards}
      eventName={event.name}
      eventColor={event.color}
      eventIcon={event.icon}
      eventId={eventId}
      now={now}
    />
  );
}
