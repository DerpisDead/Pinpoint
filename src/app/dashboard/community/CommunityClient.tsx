"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search, ThumbsUp, Download, MessageCircle, X, Send,
  Loader2, Trash2, FileText, FileSpreadsheet, Image, File,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { timeAgo } from "@/lib/time";
import type { Event } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────

type GuideRow = {
  id: string;
  user_id: string;
  event_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_path: string;
  file_name: string;
  file_size_bytes: number;
  file_type: string;
  download_count: number;
  upvote_count: number;
  created_at: string;
  events: { name: string; color: string } | null;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
  comment_count: number;
};

type CommentRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

type SortKey = "recent" | "popular" | "downloaded";

// ─── Helpers ─────────────────────────────────────────────────

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ type, size = 20 }: { type: string; size?: number }) {
  if (type === "pdf") return <FileText size={size} className="text-red-500" />;
  if (type === "docx") return <FileText size={size} className="text-[#1C3F6E]" />;
  if (type === "pptx") return <FileText size={size} className="text-orange-500" />;
  if (type === "xlsx") return <FileSpreadsheet size={size} className="text-green-600" />;
  if (type === "png" || type === "jpg") return <Image size={size} className="text-[#8B1A2D]" />;
  return <File size={size} className="text-gray-400" />;
}

function Avatar({
  url, name, size = 24,
}: { url: string | null | undefined; name: string | null | undefined; size?: number }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("")
    : "?";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name ?? ""} width={size} height={size}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }} />
  ) : (
    <div
      className="rounded-full gradient-btn flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────

type Props = {
  initialGuides: GuideRow[];
  userUpvoteIds: string[];
  userId: string;
  events: Event[];
};

// ─── Component ───────────────────────────────────────────────

export default function CommunityClient({
  initialGuides,
  userUpvoteIds,
  userId,
  events,
}: Props) {
  const [guides, setGuides] = useState(initialGuides);
  const [upvotedIds, setUpvotedIds] = useState(() => new Set(userUpvoteIds));

  // Filter/sort state
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  // Modal state
  const [selected, setSelected] = useState<GuideRow | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Filter + sort ───────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = guides.filter((g) => {
      if (eventFilter !== "all" && g.event_id !== eventFilter) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        (g.description ?? "").toLowerCase().includes(q)
      );
    });
    switch (sortBy) {
      case "popular":
        list = [...list].sort((a, b) => b.upvote_count - a.upvote_count);
        break;
      case "downloaded":
        list = [...list].sort((a, b) => b.download_count - a.download_count);
        break;
      default:
        list = [...list].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
    return list;
  }, [guides, search, eventFilter, sortBy]);

  // ── Open modal ──────────────────────────────────────────────

  const openGuide = useCallback(async (g: GuideRow) => {
    setSelected(g);
    setComments([]);
    setLoadingComments(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("study_guide_comments")
      .select("id, user_id, content, created_at, profiles(display_name, avatar_url)")
      .eq("guide_id", g.id)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as unknown as CommentRow[]);
    setLoadingComments(false);
  }, []);

  // ── Upvote ──────────────────────────────────────────────────

  async function handleUpvote(guide: GuideRow, e?: React.MouseEvent) {
    e?.stopPropagation();
    const wasUpvoted = upvotedIds.has(guide.id);
    const delta = wasUpvoted ? -1 : 1;

    // Optimistic
    setUpvotedIds((prev) => {
      const next = new Set(prev);
      wasUpvoted ? next.delete(guide.id) : next.add(guide.id);
      return next;
    });
    const applyDelta = (g: GuideRow): GuideRow =>
      g.id === guide.id ? { ...g, upvote_count: g.upvote_count + delta } : g;
    setGuides((prev) => prev.map(applyDelta));
    setSelected((prev) => (prev?.id === guide.id ? applyDelta(prev) : prev));

    const supabase = createClient();
    if (wasUpvoted) {
      const { error } = await supabase
        .from("study_guide_upvotes")
        .delete()
        .eq("user_id", userId)
        .eq("guide_id", guide.id);
      if (!error) {
        await supabase
          .from("study_guides")
          .update({ upvote_count: guide.upvote_count - 1 })
          .eq("id", guide.id);
      } else {
        // Revert
        setUpvotedIds((prev) => { const n = new Set(prev); n.add(guide.id); return n; });
        setGuides((prev) => prev.map((g) => g.id === guide.id ? { ...g, upvote_count: g.upvote_count + 1 } : g));
      }
    } else {
      const { error } = await supabase
        .from("study_guide_upvotes")
        .insert({ user_id: userId, guide_id: guide.id });
      if (!error) {
        const newCount = guide.upvote_count + 1;
        await supabase
          .from("study_guides")
          .update({ upvote_count: newCount })
          .eq("id", guide.id);
        // Award bonus XP to guide owner if hitting 10 upvotes
        if (newCount === 10 && guide.user_id !== userId) {
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("total_xp")
            .eq("id", guide.user_id)
            .single();
          if (ownerProfile) {
            // Check if bonus already awarded for this guide
            const { count } = await supabase
              .from("xp_log")
              .select("id", { count: "exact", head: true })
              .eq("user_id", guide.user_id)
              .eq("source", "guide_upload")
              .eq("details->>bonus" as string, "10_upvotes")
              .eq("details->>guide_id" as string, guide.id);
            if (count === 0) {
              await Promise.all([
                supabase.from("profiles")
                  .update({ total_xp: ownerProfile.total_xp + 50 })
                  .eq("id", guide.user_id),
                supabase.from("xp_log").insert({
                  user_id: guide.user_id,
                  amount: 50,
                  source: "guide_upload",
                  details: { bonus: "10_upvotes", guide_id: guide.id },
                }),
              ]);
            }
          }
        }
      } else {
        // Revert
        setUpvotedIds((prev) => { const n = new Set(prev); n.delete(guide.id); return n; });
        setGuides((prev) => prev.map((g) => g.id === guide.id ? { ...g, upvote_count: g.upvote_count - 1 } : g));
      }
    }
  }

  // ── Download ────────────────────────────────────────────────

  async function handleDownload(guide: GuideRow, e?: React.MouseEvent) {
    e?.stopPropagation();
    const supabase = createClient();
    // Increment count
    await supabase
      .from("study_guides")
      .update({ download_count: guide.download_count + 1 })
      .eq("id", guide.id);
    setGuides((prev) =>
      prev.map((g) => g.id === guide.id ? { ...g, download_count: g.download_count + 1 } : g)
    );
    setSelected((prev) =>
      prev?.id === guide.id ? { ...prev, download_count: prev.download_count + 1 } : prev
    );
    // Trigger download
    try {
      const response = await fetch(guide.file_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = guide.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(guide.file_url, "_blank");
    }
  }

  // ── Post comment ────────────────────────────────────────────

  async function postComment() {
    const content = newComment.trim();
    if (!content || !selected) return;
    setPostingComment(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("study_guide_comments")
      .insert({ user_id: userId, guide_id: selected.id, content })
      .select("id, user_id, content, created_at, profiles(display_name, avatar_url)")
      .single();
    if (!error && data) {
      setComments((prev) => [...prev, data as unknown as CommentRow]);
      // Update comment count on card
      setGuides((prev) =>
        prev.map((g) => g.id === selected.id ? { ...g, comment_count: g.comment_count + 1 } : g)
      );
      setNewComment("");
    } else {
      toast.error("Failed to post comment.");
    }
    setPostingComment(false);
  }

  // ── Delete guide ────────────────────────────────────────────

  async function deleteGuide(guide: GuideRow) {
    if (!confirm(`Delete "${guide.title}"? This cannot be undone.`)) return;
    setDeletingId(guide.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("study_guides")
      .delete()
      .eq("id", guide.id)
      .eq("user_id", userId);
    if (!error) {
      await supabase.storage.from("study-guides").remove([guide.file_path]).catch(() => null);
      setGuides((prev) => prev.filter((g) => g.id !== guide.id));
      setSelected(null);
      toast.success("Study guide deleted.");
    } else {
      toast.error("Failed to delete guide.");
    }
    setDeletingId(null);
  }

  // ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides…"
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        >
          <option value="all">All Events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="downloaded">Most Downloaded</option>
        </select>
      </div>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 text-sm">
            {guides.length === 0
              ? "No study guides yet. Be the first to share one!"
              : "No guides match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              isUpvoted={upvotedIds.has(guide.id)}
              onOpen={() => openGuide(guide)}
              onUpvote={(e) => handleUpvote(guide, e)}
              onDownload={(e) => handleDownload(guide, e)}
            />
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start gap-3 p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <FileIcon type={selected.file_type} size={18} />
                  <h2 className="text-base font-semibold text-gray-900 leading-tight">{selected.title}</h2>
                </div>
                {selected.events && (
                  <span
                    className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${selected.events.color}18`,
                      color: selected.events.color,
                    }}
                  >
                    {selected.events.name}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* File preview */}
              {(selected.file_type === "png" || selected.file_type === "jpg") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.file_url}
                  alt={selected.title}
                  className="w-full max-h-80 object-contain rounded-xl border border-gray-100"
                />
              )}
              {selected.file_type === "pdf" && (
                <iframe
                  src={selected.file_url}
                  className="w-full h-80 rounded-xl border border-gray-100"
                  title={selected.title}
                />
              )}
              {!["pdf", "png", "jpg"].includes(selected.file_type) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
                  <FileIcon type={selected.file_type} size={28} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{selected.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(selected.file_size_bytes)} · {selected.file_type.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {selected.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{selected.description}</p>
              )}

              {/* Uploader + time */}
              <div className="flex items-center gap-2">
                <Avatar
                  url={selected.profiles?.avatar_url}
                  name={selected.profiles?.display_name}
                  size={28}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {selected.profiles?.display_name ?? "Member"}
                  </p>
                  <p className="text-xs text-gray-400">{timeAgo(selected.created_at)}</p>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleUpvote(selected)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    upvotedIds.has(selected.id)
                      ? "bg-[#EFF3F9] border-[#C8D8EE] text-[#1C3F6E]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <ThumbsUp size={14} />
                  {selected.upvote_count}
                </button>
                <button
                  onClick={() => handleDownload(selected)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-colors"
                >
                  <Download size={14} />
                  Download {selected.download_count > 0 && `(${selected.download_count})`}
                </button>
                {selected.user_id === userId && (
                  <button
                    onClick={() => deleteGuide(selected)}
                    disabled={deletingId === selected.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
                  >
                    {deletingId === selected.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />}
                    Delete
                  </button>
                )}
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageCircle size={15} />
                  Comments {comments.length > 0 && `(${comments.length})`}
                </h3>

                {loadingComments ? (
                  <div className="py-4 text-center">
                    <Loader2 size={18} className="animate-spin text-gray-300 mx-auto" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No comments yet. Be the first!</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <Avatar
                          url={c.profiles?.avatar_url}
                          name={c.profiles?.display_name}
                          size={28}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold text-gray-800">
                              {c.profiles?.display_name ?? "Member"}
                            </span>
                            <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                <div className="flex gap-2 mt-3">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                    placeholder="Add a comment…"
                    maxLength={1000}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={postComment}
                    disabled={!newComment.trim() || postingComment}
                    className="p-2 rounded-xl gradient-btn text-white disabled:opacity-50 transition-opacity"
                  >
                    {postingComment
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── GuideCard ────────────────────────────────────────────────

function GuideCard({
  guide,
  isUpvoted,
  onOpen,
  onUpvote,
  onDownload,
}: {
  guide: GuideRow;
  isUpvoted: boolean;
  onOpen: () => void;
  onUpvote: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="text-left bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-150 flex flex-col gap-3"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <FileIcon type={guide.file_type} size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{guide.title}</p>
          {guide.events && (
            <span
              className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${guide.events.color}18`,
                color: guide.events.color,
              }}
            >
              {guide.events.name}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {guide.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{guide.description}</p>
      )}

      {/* Uploader */}
      <div className="flex items-center gap-2">
        <Avatar url={guide.profiles?.avatar_url} name={guide.profiles?.display_name} size={20} />
        <span className="text-xs text-gray-500 truncate">
          {guide.profiles?.display_name ?? "Member"}
        </span>
        <span className="text-xs text-gray-400 ml-auto shrink-0">{timeAgo(guide.created_at)}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-1 pt-0.5 border-t border-gray-50">
        <button
          onClick={onUpvote}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
            isUpvoted
              ? "text-[#1C3F6E] bg-[#EFF3F9]"
              : "text-gray-500 hover:text-[#1C3F6E] hover:bg-[#EFF3F9]"
          }`}
        >
          <ThumbsUp size={12} />
          {guide.upvote_count}
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
        >
          <Download size={12} />
          {guide.download_count}
        </button>
        <div className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400">
          <MessageCircle size={12} />
          {guide.comment_count}
        </div>
      </div>
    </button>
  );
}
