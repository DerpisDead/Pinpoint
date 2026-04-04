"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { checkAndAwardBadges } from "@/lib/badges";
import type { Event } from "@/types/database";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "image/png": "png",
  "image/jpeg": "jpg",
  "text/plain": "txt",
  "text/markdown": "md",
};
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  userId: string;
  events: Event[];
};

export default function UploadClient({ userId, events }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function validateAndSetFile(f: File) {
    setFileError(null);
    if (!ALLOWED_TYPES[f.type]) {
      setFileError("Unsupported file type. Allowed: PDF, DOCX, PPTX, XLSX, PNG, JPG, TXT, MD.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError("File exceeds 10 MB limit.");
      return;
    }
    setFile(f);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSetFile(f);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim() || !eventId) return;

    setUploading(true);
    setProgress(10);
    const supabase = createClient();

    // Build storage path
    const ext = file.name.split(".").pop() ?? "bin";
    const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

    // Upload file
    const { error: storageError } = await supabase.storage
      .from("study-guides")
      .upload(filePath, file, { contentType: file.type, cacheControl: "3600" });

    if (storageError) {
      toast.error("Upload failed: " + storageError.message);
      setUploading(false);
      setProgress(0);
      return;
    }
    setProgress(60);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("study-guides")
      .getPublicUrl(filePath);

    // Insert metadata row
    const { error: dbError } = await supabase.from("study_guides").insert({
      user_id: userId,
      event_id: eventId,
      title: title.trim(),
      description: description.trim() || null,
      file_url: publicUrl,
      file_path: filePath,
      file_name: file.name,
      file_size_bytes: file.size,
      file_type: ALLOWED_TYPES[file.type] as string,
    });

    if (dbError) {
      // Clean up storage on DB failure
      await supabase.storage.from("study-guides").remove([filePath]);
      toast.error("Failed to save guide: " + dbError.message);
      setUploading(false);
      setProgress(0);
      return;
    }
    setProgress(80);

    // Award 25 XP for sharing
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();

    if (profile) {
      const newXp = profile.total_xp + 25;
      await Promise.all([
        supabase.from("profiles").update({ total_xp: newXp }).eq("id", userId),
        supabase.from("xp_log").insert({
          user_id: userId,
          amount: 25,
          source: "guide_upload",
          details: { title: title.trim() },
        }),
      ]);
    }
    setProgress(95);

    // Check for Contributor badge
    await checkAndAwardBadges(supabase, userId).catch(() => null);

    setProgress(100);
    toast.success("Study guide shared! +25 XP");
    router.push("/dashboard/community");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="e.g. Medical Terminology Master List"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
          required
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
      </div>

      {/* Event */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event <span className="text-red-500">*</span>
        </label>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all bg-white"
          required
        >
          <option value="">Select an event…</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Brief description of what this guide covers…"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
      </div>

      {/* File drop zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File <span className="text-red-500">*</span>
        </label>
        {file ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-200 bg-green-50">
            <CheckCircle size={18} className="text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatBytes(file.size)} · {ALLOWED_TYPES[file.type]?.toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1 rounded-lg hover:bg-green-100 transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 px-4 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
            }`}
          >
            <Upload size={24} className={isDragging ? "text-blue-500" : "text-gray-400"} />
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? "Drop to upload" : "Drag file here or click to browse"}
            </p>
            <p className="text-xs text-gray-400">PDF, DOCX, PPTX, XLSX, PNG, JPG, TXT, MD · max 10 MB</p>
          </div>
        )}
        {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.txt,.md"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSetFile(f); }}
        />
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-right">{progress}%</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!file || !title.trim() || !eventId || uploading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full gradient-btn text-white font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {uploading ? (
          <><Loader2 size={15} className="animate-spin" /> Uploading…</>
        ) : (
          <><FileText size={15} /> Upload & Share</>
        )}
      </button>
    </form>
  );
}
