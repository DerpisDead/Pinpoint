import {
  BookOpen,
  Activity,
  Stethoscope,
  Users,
  Apple,
  Zap,
  Brain,
  Heart,
  Pill,
  Microscope,
  FlaskConical,
  Baby,
  Dumbbell,
  Shield,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Activity,
  Stethoscope,
  Users,
  Apple,
  Zap,
  Brain,
  Heart,
  Pill,
  Microscope,
  FlaskConical,
  Baby,
  Dumbbell,
  Shield,
};

type Props = {
  name: string;
  size?: number;
  className?: string;
};

export default function DynamicIcon({ name, size = 20, className }: Props) {
  const Icon = ICON_MAP[name] ?? BookOpen;
  return <Icon size={size} className={className} />;
}
