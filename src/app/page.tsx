import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeSelector } from "@/shared/components/ui/theme-selector";

export default function HomePage(): JSX.Element {
  return (
    <main className="container mx-auto py-12">
      <div className="flex flex-col items-center text-center space-y-8">
        {/* Theme Selector */}
        <div className="absolute top-8 right-8">
          <ThemeSelector />
        </div>

        {/* Hero Section */}
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏗️ SOLID Architecture
              </CardTitle>
              <CardDescription>
                Built following SOLID principles for maintainable and scalable
                code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Single Responsibility</li>
                <li>• Open/Closed Principle</li>
                <li>• Dependency Inversion</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Modern Stack
              </CardTitle>
              <CardDescription>
                Latest technologies for optimal developer experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js 14+ App Router</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS + shadcn/ui</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔌 MCP Ready
              </CardTitle>
              <CardDescription>
                Pre-configured MCP servers for enhanced development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Playwright automation</li>
                <li>• Figma integration</li>
                <li>• Supabase connection</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            View Documentation
          </Button>
        </div>

        {/* Status */}
        <div className="text-sm text-muted-foreground">
          🚀 Ready to use • 📚 Well documented • 🧪 Fully tested
        </div>
      </div>
    </main>
  );
}
