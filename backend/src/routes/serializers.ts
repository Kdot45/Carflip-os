import {
  ChecklistItem,
  Project,
  ProjectPhoto,
  Receipt,
  RepairEstimate,
  RepairLineItem,
  User,
} from "@prisma/client";

/**
 * Prisma returns Decimal fields as Decimal.js instances. The frontend just
 * wants plain numbers, so every response goes through one of these
 * serializers rather than leaking Decimal objects into JSON.
 */

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    homeZip: user.homeZip,
    role: user.role,
    defaultLaborRateMechanical: Number(user.defaultLaborRateMechanical),
    defaultLaborRateBody: Number(user.defaultLaborRateBody),
    defaultContingencyPct: Number(user.defaultContingencyPct),
    defaultMarginPct: Number(user.defaultMarginPct),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function serializeProject(project: Project) {
  return {
    id: project.id,
    userId: project.userId,
    status: project.status,
    vin: project.vin,
    year: project.year,
    make: project.make,
    model: project.model,
    trim: project.trim,
    miles: project.miles,
    titleStatus: project.titleStatus,
    askingPrice: Number(project.askingPrice),
    purchasePrice: project.purchasePrice === null ? null : Number(project.purchasePrice),
    zipForDeal: project.zipForDeal,
    listingUrl: project.listingUrl,
    listingNotesText: project.listingNotesText,
    expectedResalePrice:
      project.expectedResalePrice === null ? null : Number(project.expectedResalePrice),
    sellingCosts: Number(project.sellingCosts),
    targetProfitAmount:
      project.targetProfitAmount === null ? null : Number(project.targetProfitAmount),
    targetMarginPct: project.targetMarginPct === null ? null : Number(project.targetMarginPct),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export function serializeEstimate(estimate: RepairEstimate & { lineItems?: RepairLineItem[] }) {
  return {
    id: estimate.id,
    projectId: estimate.projectId,
    source: estimate.source,
    confidence: estimate.confidence,
    partsTotal: Number(estimate.partsTotal),
    laborTotal: Number(estimate.laborTotal),
    diagnosticsTotal: Number(estimate.diagnosticsTotal),
    consumablesTotal: Number(estimate.consumablesTotal),
    feesTotal: Number(estimate.feesTotal),
    contingencyPct: Number(estimate.contingencyPct),
    contingencyTotal: Number(estimate.contingencyTotal),
    totalLow: Number(estimate.totalLow),
    totalExpected: Number(estimate.totalExpected),
    totalWorst: Number(estimate.totalWorst),
    suggestedMaxBid: estimate.suggestedMaxBid === null ? null : Number(estimate.suggestedMaxBid),
    assumptionsJson: estimate.assumptionsJson,
    createdAt: estimate.createdAt,
    updatedAt: estimate.updatedAt,
    lineItems: estimate.lineItems?.map(serializeLineItem),
  };
}

export function serializeLineItem(item: RepairLineItem) {
  return {
    id: item.id,
    estimateId: item.estimateId,
    category: item.category,
    title: item.title,
    description: item.description,
    severity: item.severity,
    partsCost: Number(item.partsCost),
    laborHours: Number(item.laborHours),
    laborRate: Number(item.laborRate),
    diyOk: item.diyOk,
    createdAt: item.createdAt,
  };
}

export function serializeReceipt(receipt: Receipt) {
  return {
    id: receipt.id,
    projectId: receipt.projectId,
    amount: Number(receipt.amount),
    description: receipt.description,
    date: receipt.date,
    photoUrl: receipt.photoUrl,
    createdAt: receipt.createdAt,
  };
}

export function serializeChecklistItem(item: ChecklistItem) {
  return {
    id: item.id,
    projectId: item.projectId,
    text: item.text,
    done: item.done,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
  };
}

export function serializePhoto(photo: ProjectPhoto) {
  return {
    id: photo.id,
    projectId: photo.projectId,
    type: photo.type,
    url: photo.storagePath,
    createdAt: photo.createdAt,
  };
}
