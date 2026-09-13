import {
  Atom,
  Clapperboard,
  Gamepad2,
  Globe2,
  Landmark,
  Leaf,
  MapPin,
  Orbit,
  PawPrint,
  Plane,
  Shield,
  Trophy,
  Utensils,
  type LucideIcon,
} from "lucide-react";
const icons: Record<string, LucideIcon> = {
  Science: Atom,
  Movies: Clapperboard,
  Pixar: Clapperboard,
  Gaming: Gamepad2,
  Geography: Globe2,
  Gulf: Landmark,
  Nature: Leaf,
  Kuwait: MapPin,
  Space: Orbit,
  Animals: PawPrint,
  Travel: Plane,
  Marvel: Shield,
  Football: Trophy,
  Sports: Trophy,
  Food: Utensils,
};
export function TopicIcon({
  category,
  size = 24,
}: {
  category: string;
  size?: number;
}) {
  const Icon = icons[category] ?? Globe2;
  return <Icon size={size} aria-hidden="true" />;
}
