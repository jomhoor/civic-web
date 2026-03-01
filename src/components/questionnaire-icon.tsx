"use client";

import type { LucideProps } from "lucide-react";
import {
    BarChart3,
    Compass,
    HelpCircle,
    Map,
    Monitor,
    Target,
    Zap,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Compass,
  Zap,
  Monitor,
  Map,
  BarChart3,
  Target,
};

interface QuestionnaireIconProps extends LucideProps {
  name: string;
}

export function QuestionnaireIcon({ name, ...props }: QuestionnaireIconProps) {
  const Icon = iconMap[name] ?? HelpCircle;
  return <Icon {...props} />;
}
