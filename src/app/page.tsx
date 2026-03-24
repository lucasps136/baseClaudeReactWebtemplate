import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeSelector } from "@/shared/components/ui/theme-selector";

// SRP: Feature card component
interface IFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  items: string[];
}

const FeatureCard = ({
  icon,
  title,
  description,
  items,
}: IFeatureCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon} {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="text-sm text-muted-foreground space-y-1">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// SRP: Hero section component
const HeroSection = (): JSX.Element => (
  <div className="space-y-4 max-w-2xl">
    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
      Next.js SOLID
      <span className="text-primary"> Boilerplate</span>
    </h1>
    <p className="text-xl text-muted-foreground max-w-[600px]">
      Modern Next.js starter template with SOLID architecture principles,
      TypeScript, Tailwind CSS, and shadcn/ui components.
    </p>
  </div>
);

// SRP: Status badges component
const StatusBadges = (): JSX.Element => (
  <div className="text-sm text-muted-foreground">
    🚀 Ready to use • 📚 Well documented • 🧪 Fully tested
  </div>
);

// SRP: Feature data configuration
const getFeatures = (): IFeatureCardProps[] => [
  {
    icon: "🏗️",
    title: "SOLID Architecture",
    description:
      "Built following SOLID principles for maintainable and scalable code",
    items: [
      "Single Responsibility",
      "Open/Closed Principle",
      "Dependency Inversion",
    ],
  },
  {
    icon: "⚡",
    title: "Modern Stack",
    description: "Latest technologies for optimal developer experience",
    items: ["Next.js 14+ App Router", "TypeScript", "Tailwind CSS + shadcn/ui"],
  },
  {
    icon: "🔌",
    title: "MCP Ready",
    description: "Pre-configured MCP servers for enhanced development",
    items: [
      "Playwright automation",
      "Figma integration",
      "Supabase connection",
    ],
  },
];

// Main page component (Open/Closed: Easy to extend with new sections)
export default function HomePage(): JSX.Element {
  const features = getFeatures();

  return (
    <main className="container mx-auto py-12">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="absolute top-8 right-8">
          <ThemeSelector />
        </div>

        <HeroSection />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <StatusBadges />
      </div>
    </main>
  );
}
