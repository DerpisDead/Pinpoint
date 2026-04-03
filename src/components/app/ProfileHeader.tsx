"use client";

import { useState, useRef } from "react";
import { Pencil, Check, X, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { getLeagueConfig } from "@/lib/league";
import { getLevel } from "@/lib/xp";

type Props = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  league: string;
  memberSince: string;
};

export default function ProfileHeader({
  userId,
  displayName,
  avatarUrl,
  totalXp,
  level,
  league,
  memberSince,
}: Props) {
  const [localName, setLocalName] = useState(displayName ?? "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState(avatarUrl);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const leagueCfg = getLeagueConfig(league);
  const levelInfo = getLevel(totalXp);

  const initials = localName
    ? localName.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("")
    : "?";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setIsUploadingAvatar(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast.error("Upload failed. Make sure the 'avatars' storage bucket exists.");
      setIsUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      toast.error("Failed to save avatar.");
    } else {
      setLocalAvatarUrl(publicUrl + `?t=${Date.now()}`);
      toast.success("Avatar updated!");
    }
    setIsUploadingAvatar(false);
  }

  async function saveName() {
    const trimmed = localName.trim();
    if (!trimmed || trimmed === displayName) {
      setIsEditingName(false);
      setLocalName(displayName ?? "");
      return;
    }
    setIsSavingName(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", userId);
    setIsSavingName(false);
    if (error) {
      toast.error("Failed to update name.");
    } else {
      toast.success("Name updated!");
      setIsEditingName(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden gradient-btn flex items-center justify-center">
          {localAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localAvatarUrl}
              alt={localName || "Avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-3xl">{initials}</span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Change avatar"
        >
          {isUploadingAvatar ? (
            <Loader2 size={14} className="text-gray-500 animate-spin" />
          ) : (
            <Camera size={14} className="text-gray-500" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Info */}
      <div className="flex-1 text-center sm:text-left">
        {/* Editable name */}
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setIsEditingName(false);
                    setLocalName(displayName ?? "");
                  }
                }}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 outline-none w-48"
                maxLength={40}
              />
              <button onClick={saveName} disabled={isSavingName} className="p-1 rounded-lg hover:bg-green-50">
                {isSavingName ? <Loader2 size={16} className="text-gray-400 animate-spin" /> : <Check size={16} className="text-green-600" />}
              </button>
              <button onClick={() => { setIsEditingName(false); setLocalName(displayName ?? ""); }} className="p-1 rounded-lg hover:bg-red-50">
                <X size={16} className="text-red-400" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                {localName || "Anonymous"}
              </h1>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="Edit name"
              >
                <Pencil size={14} className="text-gray-400" />
              </button>
            </>
          )}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
            Level {level}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${leagueCfg.bgClass} ${leagueCfg.textClass} ${leagueCfg.borderClass}`}
          >
            {leagueCfg.emoji} {leagueCfg.name}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
            ⚡ {totalXp.toLocaleString()} XP
          </span>
        </div>

        {/* XP progress bar */}
        <div className="max-w-xs mx-auto sm:mx-0 mb-2">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Lv. {level} — {levelInfo.currentLevelXp} XP</span>
            <span>{levelInfo.xpForNextLevel} XP</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress}%`, background: "linear-gradient(90deg,#8B5CF6,#3B82F6)" }}
            />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Member since {new Date(memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
