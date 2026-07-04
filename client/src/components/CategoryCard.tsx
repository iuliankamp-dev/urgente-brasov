import { Link } from "wouter";
import {
  Stethoscope, Car, Zap, Wrench, Key, Truck, Dog, Smile, Wind, Paintbrush,
  Building, Trees, Shield, Monitor, Scissors, Sparkles, Flame, Package, Home,
  AlertCircle, Hammer, Square
} from "lucide-react";
import type { Category } from "../../../drizzle/schema";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  stethoscope: Stethoscope,
  car: Car,
  zap: Zap,
  wrench: Wrench,
  key: Key,
  truck: Truck,
  dog: Dog,
  smile: Smile,
  wind: Wind,
  paintbrush: Paintbrush,
  building: Building,
  trees: Trees,
  shield: Shield,
  monitor: Monitor,
  scissors: Scissors,
  sparkles: Sparkles,
  flame: Flame,
  package: Package,
  home: Home,
  hammer: Hammer,
};

interface CategoryCardProps {
  category: Category;
  companyCount?: number;
  variant?: "default" | "compact";
}

export default function CategoryCard({ category, companyCount, variant = "default" }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon ?? ""] ?? AlertCircle;
  const color = category.color ?? "#c0392b";

  if (variant === "compact") {
    return (
      <Link href={`/categorii/${category.slug}`}>
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <IconComponent className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-[oklch(0.52_0.22_25)] transition-colors">
              {category.name}
            </p>
            {companyCount !== undefined && (
              <p className="text-xs text-gray-500">{companyCount} firme</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/categorii/${category.slug}`}>
      <div className="group bg-white rounded-2xl p-5 card-hover shadow-card cursor-pointer border border-transparent hover:border-gray-100 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${color}15` }}
        >
          <IconComponent className="w-7 h-7" style={{ color }} />
        </div>
        <h3 className="font-display font-semibold text-gray-900 text-sm leading-tight group-hover:text-[oklch(0.52_0.22_25)] transition-colors">
          {category.name}
        </h3>
        {companyCount !== undefined && (
          <p className="text-xs text-gray-400 mt-1">{companyCount} firme</p>
        )}
      </div>
    </Link>
  );
}
