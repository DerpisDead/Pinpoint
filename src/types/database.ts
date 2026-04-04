export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  streak_last_date: string | null;
  level: number;
  league: string;
  daily_card_limit: number;
  session_size: number;
  sound_effects_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  color: string;
  icon: string;
  created_at: string;
};

export type UserEvent = {
  id: string;
  user_id: string;
  event_id: string;
  selected_at: string;
};

export type Card = {
  id: string;
  event_id: string;
  front: string;
  back: string;
  image_url: string | null;
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
};

export type UserCard = {
  id: string;
  user_id: string;
  card_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_quality: number | null;
  last_reviewed: string | null;
  times_reviewed: number;
  created_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  card_id: string;
  quality: number;
  response_time_ms: number | null;
  reviewed_at: string;
};

export type PracticeTest = {
  id: string;
  user_id: string;
  event_id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number | null;
  completed_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: "streak" | "xp" | "mastery" | "tests" | "cards";
  requirement_value: number;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type XpLog = {
  id: string;
  user_id: string;
  amount: number;
  source: "card_review" | "test_complete" | "streak_bonus" | "badge_earned" | "guide_upload";
  details: Record<string, unknown> | null;
  created_at: string;
};

export type StudyGuide = {
  id: string;
  user_id: string;
  event_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_path: string;
  file_name: string;
  file_size_bytes: number;
  file_type: "pdf" | "docx" | "pptx" | "xlsx" | "png" | "jpg" | "txt" | "md";
  download_count: number;
  upvote_count: number;
  created_at: string;
  updated_at: string;
};

export type StudyGuideUpvote = {
  id: string;
  user_id: string;
  guide_id: string;
  created_at: string;
};

export type StudyGuideComment = {
  id: string;
  user_id: string;
  guide_id: string;
  content: string;
  created_at: string;
};
