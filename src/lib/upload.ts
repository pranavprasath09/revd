const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate a file for image upload.
 * Throws a descriptive Error if validation fails.
 */
export function validateImageFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Only JPEG, PNG, and WebP are allowed.`);
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Invalid file extension ".${ext}". Only .jpg, .jpeg, .png, and .webp are allowed.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" exceeds the 10 MB limit.`);
  }
}

const MAX_EDGE_PX = 2048;
const WEBP_QUALITY = 0.85;
// Below this size re-encoding usually grows the file or saves nothing
const SKIP_RESIZE_BELOW = 500 * 1024; // 500 KB

/**
 * Validate and downscale an image before upload.
 * Phone photos are routinely 5–10 MB; rendering dozens of them in the photos
 * grid is 100+ MB of transfer and burns storage egress. Re-encodes to WebP
 * with a 2048px max edge (~400 KB typical). Falls back to the original file
 * if decoding/encoding fails (e.g. exotic formats) — server still enforces
 * the 10 MB cap.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  validateImageFile(file);

  if (file.size < SKIP_RESIZE_BELOW) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}
