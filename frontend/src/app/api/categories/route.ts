import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    categories: [
      { id: "rti", name: "RTI Applications", icon: "FileText", description: "File Right to Information requests" },
      { id: "consumer", name: "Consumer Rights", icon: "ShieldCheck", description: "Product/service complaints and refunds" },
      { id: "tenant", name: "Tenant Rights", icon: "Home", description: "Rental disputes and deposit recovery" },
      { id: "workplace", name: "Workplace Rights", icon: "Briefcase", description: "Labour law and employment issues" },
      { id: "schemes", name: "Government Schemes", icon: "Landmark", description: "Find schemes you're eligible for" },
      { id: "general", name: "General Legal Help", icon: "Scale", description: "Any other civic or legal question" },
    ],
  });
}
