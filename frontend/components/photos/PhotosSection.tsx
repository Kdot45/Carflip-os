"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardHeader } from "@/components/ui/Card";
import { api, fullAssetUrl } from "@/lib/api";
import { PhotoType, ProjectPhoto } from "@/lib/types";

const PHOTO_TYPES: { value: PhotoType; label: string }[] = [
  { value: "exterior", label: "Exterior" },
  { value: "engine", label: "Engine" },
  { value: "dash", label: "Dash" },
  { value: "tires", label: "Tires" },
  { value: "underside", label: "Underbody" },
  { value: "other", label: "Other" },
];

export function PhotosSection({
  projectId,
  photos,
  onChanged,
}: {
  projectId: string;
  photos: ProjectPhoto[];
  onChanged: (photos: ProjectPhoto[]) => void;
}) {
  const [uploadingType, setUploadingType] = useState<PhotoType | null>(null);

  async function upload(type: PhotoType, file: File) {
    setUploadingType(type);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("type", type);
      const { photo } = await api.post<{ photo: ProjectPhoto }>(`/projects/${projectId}/photos`, formData);
      onChanged([photo, ...photos]);
    } finally {
      setUploadingType(null);
    }
  }

  async function remove(id: string) {
    await api.delete(`/photos/${id}`);
    onChanged(photos.filter((p) => p.id !== id));
  }

  return (
    <Card>
      <CardHeader title="Photos" subtitle="Exterior, engine bay, dash lights, tires, underbody." />

      <div className="mb-3 flex flex-wrap gap-2">
        {PHOTO_TYPES.map((pt) => (
          <label
            key={pt.value}
            className="cursor-pointer rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {uploadingType === pt.value ? "Uploading…" : `+ ${pt.label}`}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingType !== null}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(pt.value, file);
              }}
            />
          </label>
        ))}
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
              {/* Uploaded content is user-provided image data of arbitrary origin, so
                  next/image's remote optimizer is skipped in favor of a plain <img>. */}
              <Image
                src={fullAssetUrl(photo.url)}
                alt={photo.type}
                fill
                unoptimized
                className="object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] capitalize text-white">
                {photo.type}
              </span>
              <button
                onClick={() => remove(photo.id)}
                className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
