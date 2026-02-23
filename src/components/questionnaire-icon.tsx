"use client";

import {
  Compass,
  Zap,
  Monitor,
  Map,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Compass,
  Zap,
  Monitor,
  Map,
  BarChart3,
};

interface QuestionnaireIconProps extends LucideProps {
  name: string;
}

export function QuestionnaireIcon({ name, ...props }: QuestionnaireIconProps) {
  const Icon = iconMap[name] ?? HelpCircle;
  return <Icon {...props} />;
}
