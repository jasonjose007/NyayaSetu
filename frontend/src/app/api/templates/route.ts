import { NextResponse } from "next/server";

const TEMPLATES = [
  {
    id: "rti",
    name: "RTI Application",
    description: "Right to Information application under RTI Act, 2005",
    required_fields: ["applicant_name", "applicant_address", "department_name", "department_address", "questions"],
  },
  {
    id: "consumer_complaint",
    name: "Consumer Complaint",
    description: "Consumer complaint for District Consumer Forum",
    required_fields: ["complainant_name", "complainant_address", "opposite_party_name", "opposite_party_address", "product_service", "purchase_date", "amount", "defect_description", "relief_sought"],
  },
  {
    id: "legal_notice_deposit",
    name: "Legal Notice - Security Deposit",
    description: "Legal notice to landlord for return of security deposit",
    required_fields: ["tenant_name", "tenant_address", "landlord_name", "landlord_address", "property_address", "tenancy_start_date", "tenancy_end_date", "deposit_amount"],
  },
  {
    id: "labour_complaint",
    name: "Labour Complaint",
    description: "Complaint to Labour Commissioner",
    required_fields: ["employee_name", "employee_address", "company_name", "company_address", "designation", "employment_start_date", "issue_description"],
  },
  {
    id: "general_legal_notice",
    name: "General Legal Notice",
    description: "General purpose legal notice",
    required_fields: ["sender_name", "sender_address", "recipient_name", "recipient_address", "subject", "facts", "demand"],
  },
];

export async function GET() {
  return NextResponse.json({ templates: TEMPLATES });
}
