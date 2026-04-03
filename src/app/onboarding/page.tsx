import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If user already has events selected, skip onboarding
  const { count } = await supabase
    .from("user_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) redirect("/dashboard");

  // Fetch all available events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("category")
    .order("name");

  return (
    <OnboardingClient events={events ?? []} userId={user.id} />
  );
}
