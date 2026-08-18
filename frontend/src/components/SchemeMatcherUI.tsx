"use client";

import { useState } from "react";
import { Search, Loader2, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SchemeResult } from "@/types";
import { API_BASE } from "@/lib/utils";

export default function SchemeMatcherUI() {
  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    state: "",
    occupation: "",
    annual_income: "",
    category: "",
    residence: "",
    land_ownership: "",
    family_size: "",
  });
  const [results, setResults] = useState<SchemeResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const handleMatch = async () => {
    setIsLoading(true);
    try {
      const filledProfile = Object.fromEntries(
        Object.entries(profile).filter(([, v]) => v !== "")
      );
      const response = await fetch(`${API_BASE}/api/match-schemes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: filledProfile, language }),
      });
      const data = await response.json();
      setResults(data.schemes);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  if (results) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            {results.length} Scheme{results.length !== 1 ? "s" : ""} Found
          </h3>
          <Button variant="outline" size="sm" onClick={() => setResults(null)}>
            New Search
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {results.map((scheme, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" />
                    <h4 className="font-medium text-sm text-gray-800">{scheme.name}</h4>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreColor(scheme.relevance_score)}`}>
                    {Math.round(scheme.relevance_score * 100)}% match
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{scheme.description}</p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-500 w-16 flex-shrink-0">Eligible:</span>
                    <span className="text-xs text-gray-700">{scheme.eligibility}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-500 w-16 flex-shrink-0">Apply:</span>
                    <span className="text-xs text-gray-700">{scheme.how_to_apply}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No matching schemes found. Try adjusting your profile.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const fields = [
    { key: "age", label: "Age", type: "number", placeholder: "e.g., 35" },
    { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { key: "state", label: "State", type: "text", placeholder: "e.g., Maharashtra" },
    { key: "occupation", label: "Occupation", type: "text", placeholder: "e.g., Farmer, Daily wage worker" },
    { key: "annual_income", label: "Annual Income (₹)", type: "number", placeholder: "e.g., 150000" },
    { key: "category", label: "Category", type: "select", options: ["General", "SC", "ST", "OBC"] },
    { key: "residence", label: "Area", type: "select", options: ["Rural", "Urban"] },
    { key: "land_ownership", label: "Land Ownership", type: "select", options: ["Yes", "No"] },
    { key: "family_size", label: "Family Size", type: "number", placeholder: "e.g., 4" },
  ];

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="font-semibold text-gray-800 mb-1">Scheme Eligibility Checker</h3>
      <p className="text-sm text-gray-500 mb-4">Fill in your profile to find government schemes you may be eligible for</p>

      <div className="flex-1 overflow-y-auto space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
            {field.type === "select" ? (
              <select
                value={profile[field.key as keyof typeof profile]}
                onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={profile[field.key as keyof typeof profile]}
                onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>

      <Button onClick={handleMatch} disabled={isLoading} className="mt-4 w-full" size="lg">
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
        Find Eligible Schemes
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
