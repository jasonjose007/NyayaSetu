"use client";

import { useState } from "react";
import { Scale, FileText, Search, MessageCircle, Home, Briefcase, ShieldCheck, Landmark, Menu, X } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import DocumentGenerator from "@/components/DocumentGenerator";
import SchemeMatcherUI from "@/components/SchemeMatcherUI";
import LandingHero from "@/components/LandingHero";

type Tab = "chat" | "documents" | "schemes";

const categories = [
  { id: "rti", name: "RTI Applications", icon: FileText, prompt: "I want to file an RTI application" },
  { id: "consumer", name: "Consumer Rights", icon: ShieldCheck, prompt: "I have a consumer complaint" },
  { id: "tenant", name: "Tenant Rights", icon: Home, prompt: "I have a landlord/tenant dispute" },
  { id: "workplace", name: "Workplace Rights", icon: Briefcase, prompt: "I have a workplace issue" },
  { id: "schemes", name: "Govt Schemes", icon: Landmark, prompt: "Help me find government schemes I'm eligible for" },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showApp, setShowApp] = useState(false);

  const handleActionSuggested = (action: string) => {
    if (action.includes("Scheme") || action.includes("Eligibility")) {
      setActiveTab("schemes");
    } else {
      setActiveTab("documents");
    }
  };

  if (!showApp) {
    return <LandingHero onGetStarted={() => setShowApp(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">NyayaSetu</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Your Bridge to Justice</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
          <TabButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")} icon={MessageCircle} label="Chat" />
          <TabButton active={activeTab === "documents"} onClick={() => setActiveTab("documents")} icon={FileText} label="Documents" />
          <TabButton active={activeTab === "schemes"} onClick={() => setActiveTab("schemes")} icon={Search} label="Schemes" />
        </nav>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card p-2 flex gap-1">
          <TabButton active={activeTab === "chat"} onClick={() => { setActiveTab("chat"); setMobileMenuOpen(false); }} icon={MessageCircle} label="Chat" />
          <TabButton active={activeTab === "documents"} onClick={() => { setActiveTab("documents"); setMobileMenuOpen(false); }} icon={FileText} label="Documents" />
          <TabButton active={activeTab === "schemes"} onClick={() => { setActiveTab("schemes"); setMobileMenuOpen(false); }} icon={Search} label="Schemes" />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col p-4 shrink-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Categories</h2>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab("chat")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors text-left"
              >
                <cat.icon className="w-4 h-4 text-primary/70" />
                {cat.name}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs font-medium text-foreground mb-1">Disclaimer</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                NyayaSetu provides legal information, not legal advice. For complex matters, please consult a qualified lawyer.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          {activeTab === "chat" && <ChatInterface onActionSuggested={handleActionSuggested} />}
          {activeTab === "documents" && <DocumentGenerator />}
          {activeTab === "schemes" && <SchemeMatcherUI />}
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
