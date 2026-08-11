// Mirrors the shapes returned by backend/src/routes/serializers.ts.

export type UserRole = "flipper" | "dealer";

export interface User {
  id: string;
  email: string;
  name: string;
  homeZip: string;
  role: UserRole;
  defaultLaborRateMechanical: number;
  defaultLaborRateBody: number;
  defaultContingencyPct: number;
  defaultMarginPct: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "lead" | "bought" | "repairing" | "listed" | "sold" | "abandoned";
export type TitleStatus = "clean" | "salvage" | "rebuilt" | "other";

export interface ListingExtraction {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  miles: number | null;
  askingPrice: number | null;
  titleStatus: TitleStatus | null;
  zipForDeal: string | null;
  fieldsFound: string[];
  fieldsInferred: string[];
  aiUnavailable?: boolean;
}

export interface Project {
  id: string;
  userId: string;
  status: ProjectStatus;
  vin: string | null;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  miles: number;
  titleStatus: TitleStatus;
  askingPrice: number;
  purchasePrice: number | null;
  zipForDeal: string;
  listingUrl: string | null;
  listingNotesText: string | null;
  expectedResalePrice: number | null;
  sellingCosts: number;
  targetProfitAmount: number | null;
  targetMarginPct: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListItem extends Project {
  suggestedMaxBid: number | null;
  totalExpectedRepair: number | null;
  expectedProfitAtAsking: number | null;
}

export type PhotoType = "exterior" | "engine" | "dash" | "tires" | "underside" | "other";

export interface ProjectPhoto {
  id: string;
  projectId: string;
  type: PhotoType;
  url: string;
  createdAt: string;
}

export interface ObdReading {
  id: string;
  projectId: string;
  rawCodesText: string;
  createdAt: string;
}

export type LineItemCategory = "mechanical" | "body" | "electrical" | "tires" | "other";
export type Severity = "safety" | "required" | "cosmetic";
export type EstimateSource = "ai" | "user" | "mixed";
export type Confidence = "low" | "medium" | "high";

export interface RepairLineItem {
  id: string;
  estimateId: string;
  category: LineItemCategory;
  title: string;
  description: string | null;
  severity: Severity;
  partsCost: number;
  laborHours: number;
  laborRate: number;
  diyOk: boolean;
  createdAt: string;
}

export interface RepairEstimate {
  id: string;
  projectId: string;
  source: EstimateSource;
  confidence: Confidence;
  partsTotal: number;
  laborTotal: number;
  diagnosticsTotal: number;
  consumablesTotal: number;
  feesTotal: number;
  contingencyPct: number;
  contingencyTotal: number;
  totalLow: number;
  totalExpected: number;
  totalWorst: number;
  suggestedMaxBid: number | null;
  assumptionsJson: unknown;
  createdAt: string;
  updatedAt: string;
  lineItems: RepairLineItem[];
}

export type DealLabel = "good" | "marginal" | "bad" | "unknown";

export interface MaxBidResult {
  totalExpectedCostAtAsking: number;
  suggestedMaxBid: number | null;
  expectedProfitAtAsking: number | null;
  expectedProfitAtMaxBid: number | null;
  marginAtAskingPct: number | null;
  dealLabel: DealLabel;
}

export interface Receipt {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  date: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  projectId: string;
  text: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface TriageSuggestedLineItem {
  category: LineItemCategory;
  title: string;
  description: string;
  severity: Severity;
  estimatedPartsCost: number;
  estimatedLaborHours: number;
  diyOk: boolean;
}

export interface TriageResult {
  riskLevel: "low" | "medium" | "high";
  summary: string;
  obdExplanation: string | null;
  suggestedLineItems: TriageSuggestedLineItem[];
  disclaimer: string;
}

export interface BidCommentaryResult {
  take: string;
  disclaimer: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResult {
  reply: string;
  disclaimer: string;
}

export interface RecallRecord {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportedDate: string | null;
}

export interface ProjectDetail {
  project: Project;
  photos: ProjectPhoto[];
  obdReadings: ObdReading[];
  estimates: RepairEstimate[];
  receipts: Receipt[];
  checklistItems: ChecklistItem[];
}
