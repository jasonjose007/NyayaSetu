"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DocumentTemplate } from "@/types";
import { API_BASE } from "@/lib/utils";

export default function DocumentGenerator() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  useEffect(() => {
    fetch(`${API_BASE}/api/templates`)
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/generate-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_type: selectedTemplate.id,
          user_info: formData,
          language,
        }),
      });

      const data = await response.json();
      setGeneratedDoc(data.document);
    } catch {
      setGeneratedDoc("Error generating document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = () => {
    if (!generatedDoc) return;
    const blob = new Blob([generatedDoc], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate?.id || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatFieldName = (field: string) =>
    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (generatedDoc) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => setGeneratedDoc(null)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button onClick={downloadDocument} size="sm">
            <Download className="w-4 h-4 mr-1" /> Download
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-6 border">
          <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-gray-800">
            {generatedDoc}
          </pre>
        </div>
      </div>
    );
  }

  if (selectedTemplate) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTemplate(null); setFormData({}); }}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h3 className="font-semibold text-gray-800">{selectedTemplate.name}</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {selectedTemplate.required_fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formatFieldName(field)}
              </label>
              {field === "questions" || field === "facts" || field === "defect_description" || field === "issue_description" || field === "demand" ? (
                <textarea
                  value={formData[field] || ""}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`Enter ${formatFieldName(field).toLowerCase()}...`}
                />
              ) : (
                <input
                  type={field.includes("date") ? "date" : field.includes("amount") ? "number" : "text"}
                  value={formData[field] || ""}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`Enter ${formatFieldName(field).toLowerCase()}...`}
                />
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
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

        <Button onClick={handleGenerate} disabled={isLoading} className="mt-4 w-full" size="lg">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          Generate Document
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="font-semibold text-gray-800 mb-1">Document Generator</h3>
      <p className="text-sm text-gray-500 mb-4">Select a template to generate a ready-to-use legal document</p>
      <div className="space-y-2">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                {template.name}
              </CardTitle>
              <p className="text-xs text-gray-500">{template.description}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
