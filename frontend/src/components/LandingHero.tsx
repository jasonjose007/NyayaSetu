"use client";

import { Scale, ArrowRight, Shield, FileText, Search, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onGetStarted: () => void;
}

export default function LandingHero({ onGetStarted }: LandingHeroProps) {
  const features = [
    { icon: Shield, title: "Know Your Rights", desc: "Get clear explanations of your legal rights in plain language" },
    { icon: FileText, title: "Generate Documents", desc: "Auto-draft RTI applications, complaints & legal notices" },
    { icon: Search, title: "Find Schemes", desc: "Discover government schemes you're eligible for" },
    { icon: Globe, title: "Bilingual Support", desc: "Available in English and Hindi" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
          <Scale className="w-4 h-4" />
          AI-Powered Legal Assistant
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
          Your Bridge to
          <span className="text-primary block sm:inline"> Justice</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          NyayaSetu translates bureaucratic complexity into clear, guided action paths.
          Understand your rights, generate legal documents, and find government schemes — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Button size="lg" onClick={onGetStarted} className="text-base px-6">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" onClick={onGetStarted} className="text-base px-6">
            See How It Works
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div key={feature.title} className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md hover:border-primary/30 transition-all">
              <feature.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-sm text-foreground mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-xs text-muted-foreground">
          Built for OOSC 4.0 Hackathon | Problem Statement 3: AI for Civic & Legal Empowerment
        </p>
      </div>
    </div>
  );
}
