import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Minimal stand-in for S3-compatible object storage. Saves files to a local
 * folder and returns a path the API can serve back statically.
 *
 * Swap this module for a real client (e.g. @aws-sdk/client-s3) when you're
 * ready to deploy — callers only depend on `saveFile`/`fileUrl`, not on how
 * storage works underneath.
 */

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export function saveFile(originalName: string, buffer: Buffer): string {
  ensureUploadDir();
  const ext = path.extname(originalName);
  const filename = `${crypto.randomUUID()}${ext}`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(fullPath, buffer);
  return filename;
}

/** Public path the frontend can load. See src/index.ts static mount. */
export function fileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
