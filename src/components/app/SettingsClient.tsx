"use client";

import { useState, useRef, useTransition, useCallback, useMemo } from "react";
import { Check, Loader2, Camera, AlertTriangle, X, Search } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { deleteAccount } from "@/app/actions";
import DynamicIcon from "@/components/app/DynamicIcon";
import type { Event } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileData = {
  display_name: string | null;
  avatar_url: string | null;
  daily_card_limit: number;
  session_size: number;
  sound_effects_enabled: boolean;
};

type Props = {
  userId: string;
  email: string;
  profile: ProfileData;
  allEvents: Event[];
  currentEventIds: string[];
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <label className="text-sm font-medium text-gray-700 sm:w-44 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, disabled, maxLength, placeholder, readOnly }: {
  value: string; onChange?: (v: string) => void; disabled?: boolean;
  maxLength?: number; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      disabled={disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400 read-only:bg-gray-50 read-only:text-gray-500"
    />
  );
}

function NumberInput({ value, onChange, min, max }: {
  value: number; onChange: (v: number) => void; min: number; max: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        if (!isNaN(n) && n >= min && n <= max) onChange(n);
      }}
      min={min}
      max={max}
      className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
    />
  );
}

function SaveButton({ onClick, saving, saved }: {
  onClick: () => void; saving: boolean; saved: boolean;
}) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2 rounded-full gradient-btn text-white text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all"
      >
        {saving ? (
          <><Loader2 size={14} className="animate-spin" /> Saving…</>
        ) : saved ? (
          <><Check size={14} /> Saved</>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsClient({
  userId,
  email,
  profile,
  allEvents,
  currentEventIds,
}: Props) {
  // ── Profile section state ────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl]     = useState(profile.avatar_url);
  const [isDragging, setIsDragging]   = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile]   = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Preferences state ────────────────────────────────────────────────────
  const [cardLimit, setCardLimit]   = useState(profile.daily_card_limit ?? 50);
  const [sessionSize, setSessionSize] = useState(profile.session_size ?? 20);
  const [soundEffects, setSoundEffects] = useState(profile.sound_effects_enabled ?? false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedPrefs, setSavedPrefs]   = useState(false);

  // ── Events section state ─────────────────────────────────────────────────
  const [savedEventIds, setSavedEventIds]       = useState(new Set(currentEventIds));
  const [selectedEventIds, setSelectedEventIds] = useState(new Set(currentEventIds));
  const [savingEvents, setSavingEvents]   = useState(false);
  const [savedEvents, setSavedEvents]     = useState(false);
  const [eventSearch, setEventSearch]     = useState("");
  const [eventCategory, setEventCategory] = useState("All");

  // ── Danger zone state ────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm]     = useState("");
  const [isPendingDelete, startDeleteTransition] = useTransition();

  // ── Avatar upload ────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB."); return; }

    setIsUploadingAvatar(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast.error("Upload failed. Ensure the 'avatars' storage bucket is set up.");
      setIsUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = publicUrl + `?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", userId);
    setAvatarUrl(newUrl);
    toast.success("Avatar updated!");
    setIsUploadingAvatar(false);
  }, [userId]);

  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("")
    : "?";

  // ── Save profile ─────────────────────────────────────────────────────────

  async function saveProfile() {
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null })
      .eq("id", userId);
    setSavingProfile(false);
    if (error) { toast.error("Failed to save profile."); return; }
    setSavedProfile(true);
    toast.success("Profile updated!");
    setTimeout(() => setSavedProfile(false), 3000);
  }

  // ── Save preferences ─────────────────────────────────────────────────────

  async function savePreferences() {
    setSavingPrefs(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ daily_card_limit: cardLimit, session_size: sessionSize, sound_effects_enabled: soundEffects })
      .eq("id", userId);
    setSavingPrefs(false);
    if (error) { toast.error("Failed to save preferences."); return; }
    setSavedPrefs(true);
    toast.success("Preferences saved!");
    setTimeout(() => setSavedPrefs(false), 3000);
  }

  // ── Save events ───────────────────────────────────────────────────────────

  async function saveEvents() {
    const added   = [...selectedEventIds].filter((id) => !savedEventIds.has(id));
    const removed = [...savedEventIds].filter((id) => !selectedEventIds.has(id));
    if (added.length === 0 && removed.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setSavingEvents(true);
    const supabase = createClient();

    // Remove: delete user_events only (user_cards preserved)
    if (removed.length > 0) {
      await supabase.from("user_events").delete().eq("user_id", userId).in("event_id", removed);
    }

    // Add: insert user_events + create user_cards
    if (added.length > 0) {
      await supabase.from("user_events").insert(added.map((event_id) => ({ user_id: userId, event_id })));

      const { data: cards } = await supabase.from("cards").select("id").in("event_id", added);
      if (cards && cards.length > 0) {
        await supabase.from("user_cards").upsert(
          cards.map((c) => ({
            user_id: userId,
            card_id: c.id,
            ease_factor: 2.5,
            interval_days: 0,
            repetitions: 0,
            next_review: new Date().toISOString(),
          })),
          { onConflict: "user_id,card_id", ignoreDuplicates: true }
        );
      }
    }

    setSavedEventIds(new Set(selectedEventIds));
    setSavingEvents(false);
    setSavedEvents(true);
    toast.success(`Events updated! ${added.length > 0 ? `+${added.length} added` : ""} ${removed.length > 0 ? `−${removed.length} removed` : ""}`.trim());
    setTimeout(() => setSavedEvents(false), 3000);
  }

  // ── Delete account ────────────────────────────────────────────────────────

  function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    startDeleteTransition(async () => {
      await deleteAccount();
    });
  }

  // Events filter + grouping
  const EVENT_CATEGORIES = ["All", "Health Science", "Health Professions", "Emergency Preparedness", "Leadership", "Teamwork"] as const;
  const CATEGORY_COLORS: Record<string, string> = {
    "Health Science": "#3B82F6",
    "Health Professions": "#8B5CF6",
    "Emergency Preparedness": "#F59E0B",
    "Leadership": "#10B981",
    "Teamwork": "#EC4899",
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const filteredEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    return allEvents.filter((ev) => {
      const matchesCat = eventCategory === "All" || ev.category === eventCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        ev.name.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q) ||
        (ev.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [allEvents, eventSearch, eventCategory]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const byCategory = useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const ev of filteredEvents) {
      if (!map[ev.category]) map[ev.category] = [];
      map[ev.category].push(ev);
    }
    for (const cat of Object.keys(map)) {
      map[cat].sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [filteredEvents]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-10">

      {/* ── Profile section ── */}
      <Section title="Profile" description="Update your display name and avatar.">
        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group border-2 transition-colors ${
              isDragging ? "border-blue-400" : "border-transparent"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
          >
            <div className="w-full h-full gradient-btn flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-3xl">{initials}</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              {isUploadingAvatar
                ? <Loader2 size={22} className="text-white animate-spin" />
                : <Camera size={22} className="text-white" />
              }
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {isDragging ? "Drop to upload" : "Click or drag an image to change avatar"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        <FieldRow label="Display Name">
          <TextInput
            value={displayName}
            onChange={setDisplayName}
            maxLength={40}
            placeholder="Your name"
          />
        </FieldRow>
        <FieldRow label="Email">
          <TextInput value={email} readOnly />
        </FieldRow>

        <SaveButton onClick={saveProfile} saving={savingProfile} saved={savedProfile} />
      </Section>

      {/* ── Study Preferences ── */}
      <Section title="Study Preferences" description="Adjust how your study sessions work.">
        <FieldRow label="Daily Card Limit">
          <div className="flex items-center gap-3">
            <NumberInput value={cardLimit} onChange={setCardLimit} min={5} max={500} />
            <span className="text-xs text-gray-400">cards per day</span>
          </div>
        </FieldRow>

        <FieldRow label="Session Size">
          <div className="flex gap-2">
            {[10, 20, 50].map((n) => (
              <button
                key={n}
                onClick={() => setSessionSize(n)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  sessionSize === n
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Sound Effects">
          <div className="flex items-center gap-3">
            <Switch
              checked={soundEffects}
              onCheckedChange={setSoundEffects}
            />
            <span className="text-sm text-gray-500">{soundEffects ? "On" : "Off"}</span>
          </div>
        </FieldRow>

        <SaveButton onClick={savePreferences} saving={savingPrefs} saved={savedPrefs} />
      </Section>

      {/* ── Manage Events ── */}
      <Section title="Manage Events" description="Add or remove HOSA events from your study list.">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {EVENT_CATEGORIES.map((cat) => {
            const isActive = eventCategory === cat;
            const color = cat === "All" ? "#3B82F6" : CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setEventCategory(cat)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                  isActive
                    ? "border-transparent text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
                style={isActive ? { backgroundColor: color } : {}}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
          {EVENT_CATEGORIES.filter((c) => c !== "All" && byCategory[c]).map((cat) => (
            <div key={cat}>
              <h3
                className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: CATEGORY_COLORS[cat] }}
              >
                {cat}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {byCategory[cat].map((ev) => {
                  const isSelected = selectedEventIds.has(ev.id);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEventIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(ev.id)) next.delete(ev.id);
                        else next.add(ev.id);
                        return next;
                      })}
                      className={`relative text-left rounded-xl border-2 p-3 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full ml-3" style={{ backgroundColor: ev.color }} />
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className="pl-4 pr-6">
                        <div className="flex items-center gap-1.5">
                          <DynamicIcon name={ev.icon} size={13} className={isSelected ? "text-blue-600" : "text-gray-400"} />
                          <span className={`text-sm font-medium truncate ${isSelected ? "text-blue-700" : "text-gray-800"}`}>{ev.name}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {EVENT_CATEGORIES.filter((c) => c !== "All" && byCategory[c]).length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">No events match your search.</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">
            {selectedEventIds.size} event{selectedEventIds.size !== 1 ? "s" : ""} selected
          </p>
          <SaveButton onClick={saveEvents} saving={savingEvents} saved={savedEvents} />
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <AlertTriangle size={14} />
          Delete Account
        </button>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This will permanently delete your account, all flashcard progress, XP, badges, and test history.
                </p>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">
              Type <strong>DELETE</strong> to confirm.
            </div>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "DELETE" || isPendingDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPendingDelete ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
