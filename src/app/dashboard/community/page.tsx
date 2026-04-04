import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import CommunityClient from "./CommunityClient";

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: guides },
    { data: upvoteRows },
    { data: events },
  ] = await Promise.all([
    supabase
      .from("study_guides")
      .select(`
        *,
        events(name, color),
        profiles(display_name, avatar_url),
        study_guide_comments(count)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("study_guide_upvotes")
      .select("guide_id")
      .eq("user_id", user.id),
    supabase
      .from("events")
      .select("*")
      .order("name"),
  ]);

  // Flatten comment count from aggregate
  const normalizedGuides = (guides ?? []).map((g: Record<string, unknown>) => ({
    ...g,
    comment_count: Array.isArray(g.study_guide_comments)
      ? (g.study_guide_comments as { count: number }[])[0]?.count ?? 0
      : 0,
  }));

  const userUpvoteIds = (upvoteRows ?? []).map((r: { guide_id: string }) => r.guide_id);

  return (
    <CommunityClient
      initialGuides={normalizedGuides as Parameters<typeof CommunityClient>[0]["initialGuides"]}
      userUpvoteIds={userUpvoteIds}
      userId={user.id}
      events={events ?? []}
    />
  );
}
