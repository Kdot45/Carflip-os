"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api, ApiRequestError } from "@/lib/api";
import { ListingExtraction, PhotoType, Project, TitleStatus } from "@/lib/types";
import clsx from "@/lib/clsx";

const STEPS = ["Listing Text", "Vehicle Info", "Price & Title", "Photos", "OBD Codes"] as const;

const FIELD_LABELS: Record<string, string> = {
  year: "year",
  make: "make",
  model: "model",
  trim: "trim",
  miles: "mileage",
  askingPrice: "asking price",
  titleStatus: "title status",
  zipForDeal: "ZIP",
};

const PHOTO_TYPES: { value: PhotoType; label: string }[] = [
  { value: "exterior", label: "Exterior" },
  { value: "engine", label: "Engine bay" },
  { value: "dash", label: "Dashboard / warning lights" },
  { value: "tires", label: "Tires" },
  { value: "underside", label: "Underbody" },
  { value: "other", label: "Other" },
];

export function NewDealWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [extractionNote, setExtractionNote] = useState<string | null>(null);

  const [vehicle, setVehicle] = useState({ year: "", make: "", model: "", trim: "", miles: "" });
  const [pricing, setPricing] = useState({
    askingPrice: "",
    zipForDeal: "",
    titleStatus: "clean" as TitleStatus,
    listingUrl: "",
  });
  const [listingNotesText, setListingNotesText] = useState("");
  const [obdCodes, setObdCodes] = useState("");

  const isLastStep = stepIndex === STEPS.length - 1;

  function applyExtraction(extraction: ListingExtraction, sourceLabel: string) {
    setVehicle((v) => ({
      year: extraction.year !== null ? String(extraction.year) : v.year,
      make: extraction.make ?? v.make,
      model: extraction.model ?? v.model,
      trim: extraction.trim ?? v.trim,
      miles: extraction.miles !== null ? String(extraction.miles) : v.miles,
    }));
    setPricing((p) => ({
      ...p,
      askingPrice: extraction.askingPrice !== null ? String(extraction.askingPrice) : p.askingPrice,
      titleStatus: extraction.titleStatus ?? p.titleStatus,
      zipForDeal: extraction.zipForDeal ?? p.zipForDeal,
    }));
    setExtractionNote(
      extraction.fieldsFound.length > 0
        ? `AI pre-filled ${extraction.fieldsFound.map((f) => FIELD_LABELS[f] ?? f).join(", ")} from the ${sourceLabel} — double-check before continuing.`
        : `Couldn't confidently pull details from that ${sourceLabel} — fill in the fields below manually.`
    );
    setHasExtracted(true);
  }

  async function handleScreenshotUpload(file: File) {
    setError(null);
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const extraction = await api.post<ListingExtraction>("/ai/extract-listing-image", formData);
      applyExtraction(extraction, "screenshot");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't read that screenshot. Try again.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function goNext() {
    setError(null);

    // Leaving the pasted-listing step: ask AI to pull structured fields out
    // of text the user already copied themselves, so Vehicle Info / Price &
    // Title arrive pre-filled instead of asking for everything twice. This
    // never touches the source site — it only reads the pasted text. Skipped
    // if a screenshot already filled things in (hasExtracted).
    if (stepIndex === 0 && listingNotesText.trim() && !hasExtracted) {
      setIsExtracting(true);
      try {
        const extraction = await api.post<ListingExtraction>("/ai/extract-listing", {
          text: listingNotesText,
        });
        applyExtraction(extraction, "listing text");
      } catch {
        // Extraction is a convenience, not a requirement — if it fails, the
        // user just fills in the fields by hand like before.
      } finally {
        setIsExtracting(false);
      }
    }

    // Creating the project happens once, right after "Price & Title", since
    // photo/OBD uploads need a project id to attach to.
    if (stepIndex === 2 && !projectId) {
      setIsSubmitting(true);
      try {
        const { project } = await api.post<{ project: Project }>("/projects", {
          year: Number(vehicle.year),
          make: vehicle.make,
          model: vehicle.model,
          trim: vehicle.trim || null,
          miles: Number(vehicle.miles),
          askingPrice: Number(pricing.askingPrice),
          zipForDeal: pricing.zipForDeal,
          titleStatus: pricing.titleStatus,
          listingUrl: pricing.listingUrl || null,
          listingNotesText: listingNotesText || null,
        });
        setProjectId(project.id);
      } catch (err) {
        setError(err instanceof ApiRequestError ? err.message : "Couldn't save this deal. Try again.");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }

    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleFinish() {
    if (!projectId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (obdCodes.trim()) {
        await api.post(`/projects/${projectId}/obd`, { rawCodesText: obdCodes });
      }
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Try again.");
      setIsSubmitting(false);
    }
  }

  async function handlePhotoUpload(type: PhotoType, file: File) {
    if (!projectId) return;
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("type", type);
    try {
      await api.post(`/projects/${projectId}/photos`, formData);
      setUploadedCount((c) => c + 1);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Photo upload failed.");
    }
  }

  const step1Valid = vehicle.year && vehicle.make && vehicle.model && vehicle.miles;
  const step2Valid = pricing.askingPrice && pricing.zipForDeal;

  return (
    <div>
      <div className="mb-6 flex items-center gap-1.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={clsx(
                "h-1.5 w-full rounded-full",
                i <= stepIndex ? "bg-accent-500" : "bg-slate-200"
              )}
            />
            <span className={clsx("hidden text-[11px] sm:block", i === stepIndex ? "font-medium text-slate-900" : "text-slate-400")}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 sm:hidden">{STEPS[stepIndex]}</h2>

        {stepIndex === 0 && (
          <div>
            <Label htmlFor="listingNotes">Paste the listing text</Label>
            <Textarea
              id="listingNotes"
              rows={8}
              placeholder="Paste the seller's description, your notes from a call, anything relevant…"
              value={listingNotesText}
              onChange={(e) => setListingNotesText(e.target.value)}
            />
            <p className="mt-2 text-xs text-slate-500">
              AI will pull the year/make/model/price/mileage out of this and pre-fill the next two steps
              for you. Nothing here is ever sent to the listing site — this only reads text you paste in
              yourself.
            </p>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3.5 text-sm font-medium text-accent-600 hover:bg-accent-50">
              {isExtracting ? "Reading screenshot…" : "📷 Upload a screenshot instead"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isExtracting}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleScreenshotUpload(file);
                }}
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Screenshot the listing on your own phone and upload it here — good for listings that are
              awkward to copy text from. Same rule applies: only the image you upload is read, nothing is
              fetched from any site.
            </p>
          </div>
        )}

        {stepIndex === 1 && (
          <div className="space-y-4">
            {extractionNote && (
              <p className="rounded-lg bg-accent-50 p-2.5 text-xs text-accent-700">{extractionNote}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  inputMode="numeric"
                  required
                  value={vehicle.year}
                  onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="miles">Mileage</Label>
                <Input
                  id="miles"
                  type="number"
                  inputMode="numeric"
                  required
                  value={vehicle.miles}
                  onChange={(e) => setVehicle({ ...vehicle, miles: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="make">Make</Label>
              <Input id="make" required value={vehicle.make} onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" required value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="trim">Trim (optional)</Label>
              <Input id="trim" value={vehicle.trim} onChange={(e) => setVehicle({ ...vehicle, trim: e.target.value })} />
            </div>
          </div>
        )}

        {stepIndex === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="askingPrice">Asking price</Label>
              <Input
                id="askingPrice"
                type="number"
                inputMode="decimal"
                required
                value={pricing.askingPrice}
                onChange={(e) => setPricing({ ...pricing, askingPrice: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="zipForDeal">ZIP where the car is located</Label>
              <Input
                id="zipForDeal"
                required
                value={pricing.zipForDeal}
                onChange={(e) => setPricing({ ...pricing, zipForDeal: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="titleStatus">Title status</Label>
              <Select
                id="titleStatus"
                value={pricing.titleStatus}
                onChange={(e) => setPricing({ ...pricing, titleStatus: e.target.value as TitleStatus })}
              >
                <option value="clean">Clean</option>
                <option value="salvage">Salvage</option>
                <option value="rebuilt">Rebuilt</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="listingUrl">Listing URL (optional, for your reference only)</Label>
              <Input
                id="listingUrl"
                type="url"
                placeholder="https://…"
                value={pricing.listingUrl}
                onChange={(e) => setPricing({ ...pricing, listingUrl: e.target.value })}
              />
            </div>
          </div>
        )}

        {stepIndex === 3 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Optional, but photos make the repair estimate and AI triage much more useful.</p>
            {PHOTO_TYPES.map((pt) => (
              <div key={pt.value} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5">
                <span className="text-sm font-medium text-slate-700">{pt.label}</span>
                <label className="cursor-pointer text-sm font-medium text-accent-600">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(pt.value, file);
                    }}
                  />
                </label>
              </div>
            ))}
            {uploadedCount > 0 && <p className="text-sm text-good">{uploadedCount} photo(s) uploaded.</p>}
          </div>
        )}

        {stepIndex === 4 && (
          <div>
            <Label htmlFor="obdCodes">OBD-II trouble codes (optional)</Label>
            <Textarea
              id="obdCodes"
              rows={4}
              placeholder="e.g. P0420, P0171"
              value={obdCodes}
              onChange={(e) => setObdCodes(e.target.value)}
            />
          </div>
        )}

        <FieldError>{error}</FieldError>

        <div className="mt-6 flex gap-3">
          {stepIndex > 0 && (
            <Button type="button" variant="secondary" onClick={goBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          {!isLastStep ? (
            <Button
              type="button"
              fullWidth
              onClick={goNext}
              disabled={
                isSubmitting ||
                isExtracting ||
                (stepIndex === 1 && !step1Valid) ||
                (stepIndex === 2 && !step2Valid)
              }
            >
              {isExtracting ? "Reading listing…" : isSubmitting ? "Saving…" : "Next"}
            </Button>
          ) : (
            <Button type="button" fullWidth onClick={handleFinish} disabled={isSubmitting}>
              {isSubmitting ? "Finishing…" : "Go to deal"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
